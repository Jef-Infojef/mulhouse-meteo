import type { AlertLevel, AlertsData, DepartmentAlert, Phenomenon } from "@/types/weather-alerts"

/** Vigilance V6 (DPVigilance) — descriptif technique Météo-France 2023 */
const PHENOMENON_LABELS: Record<string, string> = {
  "1": "Vent violent",
  "2": "Pluie-inondation",
  "3": "Orages",
  "4": "Crues",
  "5": "Neige/verglas",
  "6": "Canicule",
  "7": "Grand froid",
  "8": "Avalanches",
  "9": "Vagues-submersion",
}

export const DEPARTMENT_NAMES: Record<string, string> = {
  "67": "Bas-Rhin",
  "68": "Haut-Rhin",
}

export const ALERT_LEVEL_LABELS: Record<AlertLevel, string> = {
  1: "Pas d'alerte (vert)",
  2: "Vigilance jaune",
  3: "Vigilance orange",
  4: "Alerte rouge",
}

const VIGILANCE_CARTE_URL =
  "https://public-api.meteofrance.fr/public/DPVigilance/v1/cartevigilance/encours"

const AUTH_ERROR =
  "Clé API invalide ou abonnement Bulletin Vigilance non activé (public-api.meteofrance.fr)"

export function departmentsForLocation(location: string): string[] {
  const loc = location.toLowerCase()
  if (/strasbourg|bas-rhin|schiltigheim|haguenau|sélestat|selestat/.test(loc)) {
    return ["67"]
  }
  if (/mulhouse|colmar|haut-rhin|thann|altkirch|saint-louis/.test(loc)) {
    return ["68"]
  }
  return ["68"]
}

type VigilanceDomain = {
  domain_id?: string | number
  max_color_id?: number
  phenomenon_items?: Array<{
    phenomenon_id?: string | number
    phenomenon_max_color_id?: number
  }>
}

type VigilancePeriod = {
  begin_validity_time?: string
  end_validity_time?: string
  text_items?: { text?: string[] }
  timelaps?: {
    domain_ids?: VigilanceDomain[]
  }
}

function parseValidityMs(value?: string): number | null {
  if (!value) return null
  const ms = Date.parse(value)
  return Number.isNaN(ms) ? null : ms
}

function isPeriodActive(period: VigilancePeriod, now = Date.now()): boolean {
  const begin = parseValidityMs(period.begin_validity_time)
  const end = parseValidityMs(period.end_validity_time)
  if (begin == null || end == null) return true
  return now >= begin && now <= end
}

function phenomenaFromDomain(domain: VigilanceDomain): Phenomenon[] {
  const phenomena: Phenomenon[] = []
  const items = domain.phenomenon_items ?? []

  for (const item of items) {
    const phenomenonId = String(item.phenomenon_id ?? "")
    const level = Number(item.phenomenon_max_color_id ?? 1)
    if (level < 2 || !phenomenonId) continue
    phenomena.push({
      id: phenomenonId,
      type: phenomenonId,
      level: level as AlertLevel,
      label: PHENOMENON_LABELS[phenomenonId] || phenomenonId,
    })
  }

  return phenomena
}

function parseDepartmentsFromPeriod(
  period: VigilancePeriod,
  departments: string[],
  updateTime: string
): { departments: DepartmentAlert[]; hasActiveAlerts: boolean; maxLevel: AlertLevel } {
  const parsed = {
    departments: [] as DepartmentAlert[],
    hasActiveAlerts: false,
    maxLevel: 1 as AlertLevel,
  }
  const domains = period.timelaps?.domain_ids ?? []
  const textBlock = period.text_items?.text?.filter(Boolean).join(" ")

  for (const deptCode of departments) {
    const domain = domains.find((d) => String(d.domain_id) === deptCode)
    if (!domain) continue

    const phenomena = phenomenaFromDomain(domain)
    const domainMax = Number(domain.max_color_id ?? 1) as AlertLevel
    let deptMaxLevel: AlertLevel = 1

    for (const p of phenomena) {
      if (p.level > deptMaxLevel) deptMaxLevel = p.level
      if (p.level >= 2) parsed.hasActiveAlerts = true
      if (p.level > parsed.maxLevel) parsed.maxLevel = p.level
    }

    if (!phenomena.length && domainMax >= 2) {
      deptMaxLevel = domainMax
      parsed.hasActiveAlerts = true
      if (domainMax > parsed.maxLevel) parsed.maxLevel = domainMax
    }

    parsed.departments.push({
      departmentId: deptCode,
      departmentName: DEPARTMENT_NAMES[deptCode] || deptCode,
      maxLevel: deptMaxLevel,
      phenomena,
      textBlock: textBlock || undefined,
      updateTime,
    })
  }

  return parsed
}

function upcomingPeriodLabel(period: VigilancePeriod): string {
  const begin = parseValidityMs(period.begin_validity_time)
  if (begin == null) return "À prévoir (veille / demain J+1)"

  const dayLabel = new Date(begin).toLocaleDateString("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  return `À prévoir (veille / ${dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)})`
}

function parseCarteVigilance(data: unknown, departments: string[]): AlertsData {
  const updateTime = new Date().toISOString()
  const result: AlertsData = {
    updateTime,
    departments: [],
    hasActiveAlerts: false,
    maxLevel: 1,
  }

  const periods = (data as { product?: { periods?: VigilancePeriod[] } })?.product?.periods
  if (!Array.isArray(periods) || !periods.length) return result

  const activeIdx = periods.findIndex(isPeriodActive)
  const currentIdx = activeIdx >= 0 ? activeIdx : 0
  const current = parseDepartmentsFromPeriod(periods[currentIdx], departments, updateTime)
  result.departments = current.departments
  result.hasActiveAlerts = current.hasActiveAlerts
  result.maxLevel = current.maxLevel

  const upcomingPeriod = periods[currentIdx + 1]
  if (upcomingPeriod) {
    const upcoming = parseDepartmentsFromPeriod(upcomingPeriod, departments, updateTime)
    result.upcoming = {
      label: upcomingPeriodLabel(upcomingPeriod),
      beginValidity: upcomingPeriod.begin_validity_time,
      endValidity: upcomingPeriod.end_validity_time,
      departments: upcoming.departments,
      hasActiveAlerts: upcoming.hasActiveAlerts,
      maxLevel: upcoming.maxLevel,
    }
    if (upcoming.maxLevel > result.maxLevel) result.maxLevel = upcoming.maxLevel
  }

  result.hasActiveAlerts = result.maxLevel >= 2
  if (result.upcoming) {
    result.upcoming.hasActiveAlerts = result.upcoming.maxLevel >= 2
  }

  return result
}

async function fetchCarteVigilance(apiKey: string): Promise<Response> {
  return fetch(VIGILANCE_CARTE_URL, {
    method: "GET",
    headers: {
      apikey: apiKey,
      Accept: "*/*",
    },
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  })
}

export async function fetchWeatherAlerts(departments: string[]): Promise<AlertsData & { error?: string }> {
  const empty: AlertsData & { error?: string } = {
    updateTime: new Date().toISOString(),
    departments: [],
    hasActiveAlerts: false,
    maxLevel: 1,
  }

  const apiKey = process.env.METEOFRANCE_API_KEY?.trim()
  if (!apiKey) {
    return { ...empty, error: "METEOFRANCE_API_KEY non configurée" }
  }

  try {
    const response = await fetchCarteVigilance(apiKey)

    if (response.status === 302 || response.status === 401 || response.status === 403) {
      console.error(`[fetchWeatherAlerts] Auth error: ${response.status}`)
      return { ...empty, error: AUTH_ERROR }
    }

    if (!response.ok) {
      console.error(`[fetchWeatherAlerts] API error: ${response.status}`)
      return { ...empty, error: `Erreur API Météo-France (${response.status})` }
    }

    const data = await response.json()
    const parsed = parseCarteVigilance(data, departments)
    const productUpdate = (data as { product?: { update_time?: string } })?.product?.update_time
    if (productUpdate) parsed.updateTime = productUpdate
    return parsed
  } catch (error) {
    console.error("[fetchWeatherAlerts]", error)
    return { ...empty, error: "Impossible de joindre l'API vigilance Météo-France" }
  }
}