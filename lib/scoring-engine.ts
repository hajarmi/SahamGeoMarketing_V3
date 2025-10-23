export interface LocationData {
  coordinates: { lng: number; lat: number }
  demographics: {
    population500m: number
    population1km: number
    averageIncome: number
    ageDistribution: { [key: string]: number }
  }
  competition: {
    competitors500m: number
    competitors1km: number
    marketShare: number
    competitorTypes: string[]
  }
  accessibility: {
    footTraffic: number
    vehicleTraffic: number
    publicTransportScore: number
    parkingAvailability: number
  }
  infrastructure: {
    commercialDensity: number
    residentialDensity: number
    businessDistrict: boolean
    touristArea: boolean
  }
}

export interface ScoringWeights {
  population: number
  income: number
  accessibility: number
  competition: number
  infrastructure: number
  location: number
}

export interface ReasonCode {
  type: "positive" | "negative" | "neutral"
  category: string
  text: string
  weight: number
  impact: "Très élevé" | "Élevé" | "Moyen" | "Faible"
  score: number
}

export class GeomarketingScoringEngine {
  private weights: ScoringWeights = {
    population: 0.25,
    income: 0.15,
    accessibility: 0.2,
    competition: 0.2,
    infrastructure: 0.15,
    location: 0.05,
  }

  constructor(customWeights?: Partial<ScoringWeights>) {
    if (customWeights) {
      this.weights = { ...this.weights, ...customWeights }
    }
  }

  calculateScore(data: LocationData): {
    totalScore: number
    categoryScores: { [key: string]: number }
    reasonCodes: ReasonCode[]
    confidence: number
  } {
    const categoryScores = {
      population: this.calculatePopulationScore(data),
      income: this.calculateIncomeScore(data),
      accessibility: this.calculateAccessibilityScore(data),
      competition: this.calculateCompetitionScore(data),
      infrastructure: this.calculateInfrastructureScore(data),
      location: this.calculateLocationScore(data),
    }

    const totalScore = Object.entries(categoryScores).reduce(
      (sum, [category, score]) => sum + score * this.weights[category as keyof ScoringWeights],
      0,
    )

    const reasonCodes = this.generateReasonCodes(data, categoryScores)
    const confidence = this.calculateConfidence(data, categoryScores)

    return {
      totalScore: Math.round(totalScore),
      categoryScores,
      reasonCodes,
      confidence,
    }
  }

  private calculatePopulationScore(data: LocationData): number {
    const { population500m, population1km } = data.demographics

    // Normalize population density (assuming max 10,000 in 500m radius)
    const densityScore = Math.min((population500m / 10000) * 100, 100)

    // Bonus for good population gradient (more people in wider radius)
    const gradientBonus = population1km > population500m * 2 ? 10 : 0

    return Math.min(densityScore + gradientBonus, 100)
  }

  private calculateIncomeScore(data: LocationData): number {
    const { averageIncome } = data.demographics

    // Normalize income (assuming 50,000 MAD as optimal)
    const incomeScore = Math.min((averageIncome / 50000) * 100, 100)

    return incomeScore
  }

  private calculateAccessibilityScore(data: LocationData): number {
    const { footTraffic, vehicleTraffic, publicTransportScore, parkingAvailability } = data.accessibility

    const footScore = Math.min((footTraffic / 5000) * 40, 40)
    const vehicleScore = Math.min((vehicleTraffic / 10000) * 30, 30)
    const transitScore = publicTransportScore * 0.2
    const parkingScore = parkingAvailability * 0.1

    return footScore + vehicleScore + transitScore + parkingScore
  }

  private calculateCompetitionScore(data: LocationData): number {
    const { competitors500m, competitors1km, marketShare } = data.competition

    // Lower competition = higher score
    const competitionPenalty = competitors500m * 15 + (competitors1km - competitors500m) * 5
    const marketShareBonus = (100 - marketShare) * 0.5

    return Math.max(100 - competitionPenalty + marketShareBonus, 0)
  }

  private calculateInfrastructureScore(data: LocationData): number {
    const { commercialDensity, residentialDensity, businessDistrict, touristArea } = data.infrastructure

    let score = commercialDensity * 0.4 + residentialDensity * 0.3

    if (businessDistrict) score += 20
    if (touristArea) score += 15

    return Math.min(score, 100)
  }

  private calculateLocationScore(data: LocationData): number {
    // This could include factors like proximity to city center, major roads, etc.
    // For now, return a base score
    return 75
  }

  private generateReasonCodes(data: LocationData, scores: { [key: string]: number }): ReasonCode[] {
    const reasonCodes: ReasonCode[] = []

    // Population reason codes
    if (scores.population >= 80) {
      reasonCodes.push({
        type: "positive",
        category: "Population",
        text: `Excellente densité de population (${data.demographics.population500m.toLocaleString()} habitants dans 500m)`,
        weight: this.weights.population * 100,
        impact: "Très élevé",
        score: scores.population,
      })
    } else if (scores.population <= 40) {
      reasonCodes.push({
        type: "negative",
        category: "Population",
        text: `Faible densité de population (${data.demographics.population500m.toLocaleString()} habitants dans 500m)`,
        weight: this.weights.population * 100,
        impact: "Élevé",
        score: scores.population,
      })
    }

    // Competition reason codes
    if (data.competition.competitors500m >= 4) {
      reasonCodes.push({
        type: "negative",
        category: "Concurrence",
        text: `Forte concurrence avec ${data.competition.competitors500m} concurrents proches`,
        weight: this.weights.competition * 100,
        impact: "Élevé",
        score: scores.competition,
      })
    } else if (data.competition.competitors500m <= 1) {
      reasonCodes.push({
        type: "positive",
        category: "Concurrence",
        text: `Faible concurrence avec seulement ${data.competition.competitors500m} concurrent proche`,
        weight: this.weights.competition * 100,
        impact: "Élevé",
        score: scores.competition,
      })
    }

    // Accessibility reason codes
    if (scores.accessibility >= 80) {
      reasonCodes.push({
        type: "positive",
        category: "Accessibilité",
        text: `Excellent flux piéton (${data.accessibility.footTraffic.toLocaleString()}/jour) et véhiculaire`,
        weight: this.weights.accessibility * 100,
        impact: "Très élevé",
        score: scores.accessibility,
      })
    }

    // Income reason codes
    if (data.demographics.averageIncome >= 40000) {
      reasonCodes.push({
        type: "positive",
        category: "Revenus",
        text: `Population à revenus élevés (${data.demographics.averageIncome.toLocaleString()} MAD/an)`,
        weight: this.weights.income * 100,
        impact: "Moyen",
        score: scores.income,
      })
    } else if (data.demographics.averageIncome <= 25000) {
      reasonCodes.push({
        type: "negative",
        category: "Revenus",
        text: `Population à revenus modestes (${data.demographics.averageIncome.toLocaleString()} MAD/an)`,
        weight: this.weights.income * 100,
        impact: "Moyen",
        score: scores.income,
      })
    }

    // Infrastructure reason codes
    if (data.infrastructure.businessDistrict) {
      reasonCodes.push({
        type: "positive",
        category: "Infrastructure",
        text: "Situé dans un quartier d'affaires dynamique",
        weight: this.weights.infrastructure * 100,
        impact: "Élevé",
        score: scores.infrastructure,
      })
    }

    if (data.infrastructure.touristArea) {
      reasonCodes.push({
        type: "positive",
        category: "Infrastructure",
        text: "Zone touristique avec flux de visiteurs régulier",
        weight: this.weights.infrastructure * 100,
        impact: "Moyen",
        score: scores.infrastructure,
      })
    }

    return reasonCodes.sort((a, b) => b.weight - a.weight)
  }

  private calculateConfidence(data: LocationData, scores: { [key: string]: number }): number {
    // Confidence based on data completeness and score consistency
    const scoreVariance = this.calculateVariance(Object.values(scores))
    const dataCompleteness = this.assessDataCompleteness(data)

    // Lower variance and higher completeness = higher confidence
    const confidenceScore = (100 - scoreVariance) * 0.6 + dataCompleteness * 0.4

    return Math.max(Math.min(confidenceScore, 95), 60) // Confidence between 60-95%
  }

  private calculateVariance(scores: number[]): number {
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    return Math.sqrt(variance)
  }

  private assessDataCompleteness(data: LocationData): number {
    // Simple completeness check - in real app, this would be more sophisticated
    let completeness = 100

    if (!data.demographics.population500m) completeness -= 20
    if (!data.competition.competitors500m) completeness -= 15
    if (!data.accessibility.footTraffic) completeness -= 15

    return Math.max(completeness, 70)
  }

  updateWeights(newWeights: Partial<ScoringWeights>): void {
    const updatedWeights = { ...this.weights, ...newWeights }

    // Ensure the sum equals 1 (100%)
    const total = Object.values(updatedWeights).reduce((sum, weight) => sum + weight, 0)

    if (Math.abs(total - 1) > 0.001) {
      // Normalize weights to ensure exact 100% sum
      Object.keys(updatedWeights).forEach((key) => {
        updatedWeights[key as keyof ScoringWeights] = updatedWeights[key as keyof ScoringWeights] / total
      })
    }

    this.weights = updatedWeights
  }

  validateWeights(weights: ScoringWeights): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check individual weight constraints
    Object.entries(weights).forEach(([category, weight]) => {
      if (weight < 0.05) {
        errors.push(`${category}: minimum 5% requis (actuel: ${(weight * 100).toFixed(1)}%)`)
      }
      if (weight > 0.5) {
        errors.push(`${category}: maximum 50% autorisé (actuel: ${(weight * 100).toFixed(1)}%)`)
      }
    })

    // Check total sum
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    if (Math.abs(total - 1) > 0.001) {
      errors.push(`Total: ${(total * 100).toFixed(1)}% (requis: 100.0%)`)
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Method to get current weights
  getWeights(): ScoringWeights {
    return { ...this.weights }
  }
}

// Utility function to generate mock location data for testing
export function generateMockLocationData(coordinates: { lng: number; lat: number }): LocationData {
  return {
    coordinates,
    demographics: {
      population500m: Math.floor(Math.random() * 5000) + 2000,
      population1km: Math.floor(Math.random() * 15000) + 8000,
      averageIncome: Math.floor(Math.random() * 20000) + 30000,
      ageDistribution: {
        "18-25": 15,
        "26-35": 25,
        "36-45": 30,
        "46-55": 20,
        "55+": 10,
      },
    },
    competition: {
      competitors500m: Math.floor(Math.random() * 5) + 1,
      competitors1km: Math.floor(Math.random() * 10) + 3,
      marketShare: Math.floor(Math.random() * 30) + 15,
      competitorTypes: ["bank", "insurance", "microfinance"],
    },
    accessibility: {
      footTraffic: Math.floor(Math.random() * 3000) + 1000,
      vehicleTraffic: Math.floor(Math.random() * 5000) + 2000,
      publicTransportScore: Math.floor(Math.random() * 40) + 60,
      parkingAvailability: Math.floor(Math.random() * 40) + 60,
    },
    infrastructure: {
      commercialDensity: Math.floor(Math.random() * 40) + 60,
      residentialDensity: Math.floor(Math.random() * 40) + 60,
      businessDistrict: Math.random() > 0.7,
      touristArea: Math.random() > 0.8,
    },
  }
}
