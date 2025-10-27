export type ATMStatus = "active" | "maintenance" | "inactive" | string

export type ATMType = "saham" | "competitor" | "poi" | string

export interface ATM {
  id: string
  name?: string
  bank_name: string
  latitude: number
  longitude: number
  monthly_volume: number
  city: string
  region: string
  status: ATMStatus
  address?: string
  branch_location?: string
  installation_type?: "fixed" | "portable" | string
  services?: string[]
  performance?: number
  dailyTransactions?: number
  uptime?: string
  cashLevel?: string
  networkStatus?: string
  lastMaintenance?: string
  type?: ATMType
  roi?: number
  footTraffic?: number
  marketShare?: number
  [key: string]: unknown
}

export interface Competitor {
  id: number | string
  lat: number
  lng: number
  name: string
  type: string
  category: string
  city?: string
  marketShare?: number
  services?: string[]
  brand?: string
}

export interface POI {
  id: number | string
  lat: number
  lng: number
  name: string
  type: string
  category: string
  footTraffic?: number
  influenceRadius?: number
}

export type MapLayerType = "points" | "zones" | "heatmap" | "polygons" | "lines" | string

export interface MapLayer {
  id: string
  name: string
  description: string
  visible: boolean
  opacity: number
  type: MapLayerType
  color: string
}

export type OpportunityPriority = "high" | "medium" | "low"

export interface OpportunityZone {
  id: string
  center_lat: number
  center_lng: number
  score: number
  potential_volume: number
  reason: string
  priority: OpportunityPriority
}
