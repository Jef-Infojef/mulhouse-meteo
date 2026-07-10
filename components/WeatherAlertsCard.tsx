"use client"

import { useEffect, useState, type ElementType } from "react"
import { LazyMotion, m, domAnimation } from "framer-motion"
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Clock,
  Wind,
  CloudRain,
  CloudLightning,
  Waves,
  Snowflake,
  Sun,
  ThermometerSnowflake,
  Mountain,
  type LucideIcon,
} from "lucide-react"
import type { AlertLevel, AlertsData, DepartmentAlert, Phenomenon } from "@/types/weather-alerts"
import { cn } from "@/lib/utils"

interface WeatherAlertsCardProps {
  departments?: string[]
  showGreenStatus?: boolean
  className?: string
  initialAlerts?: AlertsData | null
}

const CARD_SHELL =
  "rounded-2xl overflow-hidden border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"

const LEVEL_CONFIG: Record<
  AlertLevel,
  {
    label: string
    short: string
    accent: string
    headerGradient: string
    iconBg: string
    icon: string
    badge: string
    dot: string
    prominentShell: string
    prominentTitle: string
    prominentText: string
    prominentBulletin: string
  }
> = {
  1: {
    label: "Pas d'alerte",
    short: "Vert",
    accent: "border-l-green-500",
    headerGradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/15",
    iconBg: "bg-green-100 dark:bg-green-900/50",
    icon: "text-green-600 dark:text-green-400",
    badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
    dot: "bg-green-500",
    prominentShell: "border-green-200 dark:border-green-900/60",
    prominentTitle: "text-green-900 dark:text-green-50",
    prominentText: "text-green-800/80 dark:text-green-200/80",
    prominentBulletin: "text-green-900/90 dark:text-green-100/90",
  },
  2: {
    label: "Vigilance jaune",
    short: "Jaune",
    accent: "border-l-yellow-400",
    headerGradient: "from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/15",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/50",
    icon: "text-yellow-600 dark:text-yellow-400",
    badge: "bg-yellow-400 text-yellow-950 dark:bg-yellow-500 dark:text-yellow-950",
    dot: "bg-yellow-400",
    prominentShell:
      "shadow-lg shadow-yellow-500/15 dark:shadow-yellow-900/30 ring-2 ring-yellow-400/30 dark:ring-yellow-500/35 border-yellow-200 dark:border-yellow-900/60",
    prominentTitle: "text-yellow-900 dark:text-yellow-50",
    prominentText: "text-yellow-800/80 dark:text-yellow-200/80",
    prominentBulletin: "text-yellow-900/90 dark:text-yellow-100/90",
  },
  3: {
    label: "Vigilance orange",
    short: "Orange",
    accent: "border-l-orange-500",
    headerGradient: "from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/15",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
    icon: "text-orange-600 dark:text-orange-400",
    badge: "bg-orange-500 text-white dark:bg-orange-600 dark:text-white",
    dot: "bg-orange-500",
    prominentShell:
      "shadow-lg shadow-orange-500/15 dark:shadow-orange-900/30 ring-2 ring-orange-500/25 dark:ring-orange-500/35 border-orange-200 dark:border-orange-900/60",
    prominentTitle: "text-orange-900 dark:text-orange-50",
    prominentText: "text-orange-800/80 dark:text-orange-200/80",
    prominentBulletin: "text-orange-900/90 dark:text-orange-100/90",
  },
  4: {
    label: "Alerte rouge",
    short: "Rouge",
    accent: "border-l-red-600",
    headerGradient: "from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/15",
    iconBg: "bg-red-100 dark:bg-red-900/50",
    icon: "text-red-600 dark:text-red-400",
    badge: "bg-red-600 text-white dark:bg-red-600 dark:text-white",
    dot: "bg-red-600",
    prominentShell:
      "shadow-lg shadow-red-500/15 dark:shadow-red-900/30 ring-2 ring-red-500/25 dark:ring-red-500/35 border-red-200 dark:border-red-900/60",
    prominentTitle: "text-red-900 dark:text-red-50",
    prominentText: "text-red-800/80 dark:text-red-200/80",
    prominentBulletin: "text-red-900/90 dark:text-red-100/90",
  },
}

const PHENOMENON_META: Record<string, { icon: LucideIcon; short: string }> = {
  "1": { icon: Wind, short: "Vent" },
  "2": { icon: CloudRain, short: "Pluie-inondation" },
  "3": { icon: CloudLightning, short: "Orages" },
  "4": { icon: Waves, short: "Crues" },
  "5": { icon: Snowflake, short: "Neige/verglas" },
  "6": { icon: Sun, short: "Canicule" },
  "7": { icon: ThermometerSnowflake, short: "Grand froid" },
  "8": { icon: Mountain, short: "Avalanches" },
  "9": { icon: Waves, short: "Vagues-submersion" },
}

const VIGILANCE_DEPT_SLUG: Record<string, string> = {
  "67": "bas-rhin",
  "68": "haut-rhin",
}

function shortUpcomingLabel(label: string): string {
  const match = label.match(/\/\s*([^)]+)\)/)
  if (!match) return "Demain"
  const day = match[1].trim().split(" ")[0]
  return day ? `${day.charAt(0).toUpperCase()}${day.slice(1, 3)}.` : "Demain"
}

function mergePhenomena(departments: DepartmentAlert[]): Phenomenon[] {
  const byId = new Map<string, Phenomenon>()
  for (const dept of departments) {
    for (const p of dept.phenomena) {
      const existing = byId.get(p.id)
      if (!existing || p.level > existing.level) byId.set(p.id, p)
    }
  }
  return [...byId.values()].sort((a, b) => b.level - a.level)
}

function sharedBulletin(...blocks: (string | undefined)[]): string | undefined {
  const texts = blocks.filter(Boolean) as string[]
  if (!texts.length) return undefined
  const first = texts[0]
  return texts.every((t) => t === first) ? first : texts.find((t) => t.length > 0)
}

function PhenomenonChip({ phenomenon, compact = false }: { phenomenon: Phenomenon; compact?: boolean }) {
  const meta = PHENOMENON_META[phenomenon.id]
  const Icon = meta?.icon ?? AlertTriangle
  const levelTheme = LEVEL_CONFIG[phenomenon.level]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg font-medium",
        "bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700",
        "text-gray-700 dark:text-gray-300",
        compact ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs"
      )}
    >
      <Icon className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5", "shrink-0 text-gray-500 dark:text-gray-400")} />
      <span className="truncate max-w-[9rem] sm:max-w-none">{meta?.short ?? phenomenon.label}</span>
      <span
        className={cn("w-1.5 h-1.5 rounded-full shrink-0", levelTheme.dot)}
        title={LEVEL_CONFIG[phenomenon.level].label}
      />
    </span>
  )
}

export default function WeatherAlertsCard({
  departments = ["68"],
  showGreenStatus = false,
  className = "",
  initialAlerts = null,
}: WeatherAlertsCardProps) {
  const deptStr = departments.join(",")
  const [fetchedAlerts, setFetchedAlerts] = useState<AlertsData | null>(null)
  const [loading, setLoading] = useState(!initialAlerts)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`/api/weather/alerts?departments=${deptStr}`)
        if (res.ok) {
          const data = (await res.json()) as AlertsData
          if (!cancelled) setFetchedAlerts(data)
        }
      } catch (error) {
        console.error("[WeatherAlertsCard]", error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [deptStr])

  const alerts = fetchedAlerts ?? initialAlerts

  if (loading && !alerts) {
    return (
      <div
        className={cn(
          CARD_SHELL,
          "h-14 animate-pulse border-gray-200 dark:border-gray-700",
          "bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900"
        )}
        aria-hidden
      />
    )
  }
  if (!alerts) return null

  if (alerts.error) {
    return (
      <m.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(CARD_SHELL, "px-4 py-3", className)}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0">
            <AlertCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{alerts.error}</p>
            <a
              href="https://vigilance.meteofrance.fr/fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
            >
              vigilance.meteofrance.fr <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </m.div>
    )
  }

  if (!alerts.hasActiveAlerts && !showGreenStatus) return null

  const deptLabel = alerts.departments.length
    ? alerts.departments.map((d) => d.departmentName).join(" · ")
    : "Haut-Rhin"
  const currentPhenomena = mergePhenomena(alerts.departments)
  const upcomingPhenomena = alerts.upcoming ? mergePhenomena(alerts.upcoming.departments) : []
  const bulletinText = sharedBulletin(
    ...alerts.departments.map((d) => d.textBlock),
    ...(alerts.upcoming?.departments.map((d) => d.textBlock) ?? [])
  )
  const horizonsDiffer = Boolean(
    alerts.upcoming?.hasActiveAlerts &&
      (currentPhenomena.map((p) => `${p.id}:${p.level}`).sort().join(",") !==
        upcomingPhenomena.map((p) => `${p.id}:${p.level}`).sort().join(",") ||
        alerts.departments[0]?.maxLevel !== alerts.upcoming?.departments[0]?.maxLevel)
  )

  const theme = LEVEL_CONFIG[alerts.maxLevel]
  const isProminent = alerts.hasActiveAlerts && alerts.maxLevel >= 2
  const HeaderIcon: ElementType = alerts.maxLevel === 1 ? CheckCircle2 : AlertTriangle
  const updateTime = new Date(alerts.updateTime).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })
  const vigilanceUrl = `https://vigilance.meteofrance.fr/fr/${VIGILANCE_DEPT_SLUG[alerts.departments[0]?.departmentId] || "haut-rhin"}`
  const showUpcomingInHeader = Boolean(alerts.upcoming?.hasActiveAlerts)
  const headerPhenomena = currentPhenomena.length ? currentPhenomena : upcomingPhenomena

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          CARD_SHELL,
          "border-l-4",
          theme.accent,
          isProminent && theme.prominentShell,
          className
        )}
      >
        <div
          className={cn(
            "w-full px-4 py-3.5 flex items-start gap-3",
            "bg-gradient-to-r",
            theme.headerGradient
          )}
        >
          <div className={cn("p-2 rounded-xl shrink-0", theme.iconBg)}>
            <HeaderIcon className={cn("w-5 h-5", theme.icon)} />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={cn(
                  "text-sm font-bold",
                  isProminent ? theme.prominentTitle : "text-gray-900 dark:text-gray-100"
                )}
              >
                Vigilance Météo-France
              </h3>
              <span className={cn("px-2 py-0.5 rounded-md text-[11px] font-bold", theme.badge)}>
                {alerts.hasActiveAlerts ? theme.label : theme.short}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 ml-auto">
                <Clock className="w-3 h-3" />
                <span>{updateTime}</span>
              </div>
            </div>

            <div
              className={cn(
                "flex flex-wrap items-center gap-x-2 gap-y-1 text-xs",
                isProminent ? theme.prominentText : "text-gray-500 dark:text-gray-400"
              )}
            >
              <span>{deptLabel}</span>
              {alerts.hasActiveAlerts && headerPhenomena.length > 0 ? (
                <>
                  <span className="hidden sm:inline opacity-40">·</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {headerPhenomena.slice(0, 3).map((p) => (
                      <PhenomenonChip key={p.id} phenomenon={p} compact />
                    ))}
                  </div>
                </>
              ) : !alerts.hasActiveAlerts ? (
                <span>Aucune vigilance active</span>
              ) : null}
              {showUpcomingInHeader ? (
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  {horizonsDiffer && alerts.upcoming
                    ? `· Aujourd'hui & ${shortUpcomingLabel(alerts.upcoming.label)}`
                    : "· Aujourd'hui et demain"}
                </span>
              ) : null}
            </div>

            {bulletinText ? (
              <p
                className={cn(
                  "text-xs leading-relaxed",
                  isProminent ? theme.prominentBulletin : "text-gray-600 dark:text-gray-400"
                )}
              >
                {bulletinText}
              </p>
            ) : null}

            <a
              href={vigilanceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Bulletin complet Météo-France
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </m.div>
    </LazyMotion>
  )
}