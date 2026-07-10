export type AlertLevel = 1 | 2 | 3 | 4

export interface Phenomenon {
  id: string
  type: string
  level: AlertLevel
  label: string
}

export interface DepartmentAlert {
  departmentId: string
  departmentName: string
  maxLevel: AlertLevel
  phenomena: Phenomenon[]
  textBlock?: string
  updateTime: string
}

export interface UpcomingVigilance {
  label: string
  beginValidity?: string
  endValidity?: string
  departments: DepartmentAlert[]
  hasActiveAlerts: boolean
  maxLevel: AlertLevel
}

export interface AlertsData {
  updateTime: string
  departments: DepartmentAlert[]
  upcoming?: UpcomingVigilance
  hasActiveAlerts: boolean
  maxLevel: AlertLevel
  error?: string
}