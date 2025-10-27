export interface ATM {
  id: string
  latitude: number
  longitude: number
  monthly_volume: number
  status: string
  city: string
  region: string
  bank_name: string
  type?: "saham" | "competitor"
  performance: number
  uptime?: string
  roi?: number
  cashLevel?: string
  lastMaintenance?: string
  address?: string
}