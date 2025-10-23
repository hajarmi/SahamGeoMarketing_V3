import { NextResponse } from "next/server"

export async function GET() {
  const dashboardData = {
    summary: {
      total_atms: 5,
      total_monthly_volume: 5450,
      average_volume_per_atm: 1090,
      network_roi: 14.2,
      coverage_rate: 78.5,
    },
    performance_trend: [
      { month: "Jan", volume: 45000, roi: 12.5 },
      { month: "Fév", volume: 48000, roi: 13.2 },
      { month: "Mar", volume: 52000, roi: 14.1 },
      { month: "Avr", volume: 49000, roi: 13.8 },
      { month: "Mai", volume: 55000, roi: 15.2 },
      { month: "Jun", volume: 58000, roi: 16.1 },
    ],
    opportunity_zones: [
      {
        zone: "Maarif",
        score: 85,
        potential_volume: 1800,
        competition_level: "Faible",
        priority: "Haute",
      },
      {
        zone: "Ain Sebaa",
        score: 72,
        potential_volume: 1400,
        competition_level: "Moyenne",
        priority: "Moyenne",
      },
      {
        zone: "Sidi Bernoussi",
        score: 68,
        potential_volume: 1200,
        competition_level: "Élevée",
        priority: "Faible",
      },
    ],
    last_updated: new Date().toISOString(),
  }

  return NextResponse.json(dashboardData)
}
