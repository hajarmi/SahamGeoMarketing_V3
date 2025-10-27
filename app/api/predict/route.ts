import { type NextRequest, NextResponse } from "next/server"

interface LocationData {
  latitude: number
  longitude: number
  population_density?: number
  commercial_poi_count?: number
  competitor_atms_500m?: number
  foot_traffic_score?: number
  income_level?: number
  accessibility_score?: number
  parking_availability?: number
  public_transport_nearby?: number
  business_district?: number
  residential_area?: number
}

export async function POST(request: NextRequest) {
  try {
    const location: LocationData = await request.json()

    const baseScore = Math.random() * 40 + 40 // Score between 40-80
    const populationFactor = (location.population_density || 1000) / 1000
    const poiFactor = (location.commercial_poi_count || 10) / 10
    const competitionPenalty = (location.competitor_atms_500m || 2) * 5

    const adjustedScore = Math.max(0, Math.min(100, baseScore * populationFactor * poiFactor - competitionPenalty))

    const predictedVolume = Math.round(adjustedScore * 20 + Math.random() * 200)
    const roiProbability = adjustedScore / 100

    // Generate reason codes based on location data
    const reasonCodes = []
    if (populationFactor > 1.2) reasonCodes.push("RC-201 — Densité population élevée")
    if (poiFactor > 1.5) reasonCodes.push("RC-305 — Zone commerciale attractive")
    if ((location.competitor_atms_500m || 0) > 3) reasonCodes.push("RC-401 — Forte concurrence locale")
    if ((location.foot_traffic_score || 0) > 70) reasonCodes.push("RC-502 — Flux piétons important")

    const recommendation =
      adjustedScore > 70
        ? "Emplacement recommandé"
        : adjustedScore > 50
          ? "Emplacement à étudier"
          : "Emplacement non recommandé"

    const response = {
      predicted_volume: predictedVolume,
      roi_probability: roiProbability,
      roi_prediction: adjustedScore > 60,
      global_score: Math.round(adjustedScore),
      reason_codes: reasonCodes,
      recommendation,
      canibalization_analysis: {
        canibalization_risk: Math.random() * 30,
        affected_atms: Math.floor(Math.random() * 3),
        impact_volume: Math.round(Math.random() * 200),
      },
    }

    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ error: "Erreur de prédiction" }, { status: 500 })
  }
}
