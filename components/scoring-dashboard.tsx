"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Building,
  Car,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react"
import { useState, useEffect } from "react"
import { GeomarketingScoringEngine, generateMockLocationData, type ScoringWeights } from "@/lib/scoring-engine"

interface ScoringDashboardProps {
  selectedLocation: {
    lng: number
    lat: number
    address?: string
  } | null
}

export default function ScoringDashboard({ selectedLocation }: ScoringDashboardProps) {
  const [scoringEngine] = useState(new GeomarketingScoringEngine())
  const [weights, setWeights] = useState<ScoringWeights>(scoringEngine.getWeights())
  const [scoringResult, setScoringResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isAdjusting, setIsAdjusting] = useState(false)

  useEffect(() => {
    if (selectedLocation) {
      setLoading(true)

      // Simulate API call delay
      setTimeout(() => {
        const mockData = generateMockLocationData(selectedLocation)
        const result = scoringEngine.calculateScore(mockData)
        setScoringResult(result)
        setLoading(false)
      }, 1000)
    }
  }, [selectedLocation, scoringEngine])

  const handleWeightChange = (category: keyof ScoringWeights, value: number[]) => {
    setIsAdjusting(true)

    const newValue = value[0] / 100
    const currentWeights = { ...weights }
    const oldValue = currentWeights[category]

    // Calculate the difference to redistribute
    const difference = newValue - oldValue
    const otherCategories = Object.keys(currentWeights).filter((key) => key !== category) as (keyof ScoringWeights)[]

    // If increasing this weight, decrease others proportionally
    if (difference > 0) {
      const totalOthers = otherCategories.reduce((sum, key) => sum + currentWeights[key], 0)

      if (totalOthers > 0) {
        otherCategories.forEach((key) => {
          const proportion = currentWeights[key] / totalOthers
          const reduction = difference * proportion
          currentWeights[key] = Math.max(0.05, currentWeights[key] - reduction) // Min 5%
        })
      }
    }
    // If decreasing this weight, increase others proportionally
    else if (difference < 0) {
      const redistributeAmount = Math.abs(difference)
      const redistributePerCategory = redistributeAmount / otherCategories.length

      otherCategories.forEach((key) => {
        currentWeights[key] = Math.min(0.5, currentWeights[key] + redistributePerCategory) // Max 50%
      })
    }

    // Set the new value for the changed category
    currentWeights[category] = Math.max(0.05, Math.min(0.5, newValue))

    // Final normalization to ensure exact 100%
    const normalizedWeights = normalizeWeights(currentWeights)

    setWeights(normalizedWeights)
    scoringEngine.updateWeights(normalizedWeights)

    // Recalculate score if location is selected
    if (selectedLocation) {
      const mockData = generateMockLocationData(selectedLocation)
      const result = scoringEngine.calculateScore(mockData)
      setScoringResult(result)
    }

    setTimeout(() => setIsAdjusting(false), 100)
  }

  const normalizeWeights = (weights: ScoringWeights): ScoringWeights => {
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0)

    if (total === 0) return weights // Avoid division by zero

    const normalized: ScoringWeights = {} as ScoringWeights
    Object.entries(weights).forEach(([key, value]) => {
      normalized[key as keyof ScoringWeights] = value / total
    })

    return normalized
  }

  const resetToDefaultWeights = () => {
    const defaultWeights = new GeomarketingScoringEngine().getWeights()
    setWeights(defaultWeights)
    scoringEngine.updateWeights(defaultWeights)

    if (selectedLocation) {
      const mockData = generateMockLocationData(selectedLocation)
      const result = scoringEngine.calculateScore(mockData)
      setScoringResult(result)
    }
  }

  const getCurrentSum = () => {
    return Object.values(weights).reduce((sum, weight) => sum + weight, 0)
  }

  const isValidSum = () => {
    const sum = getCurrentSum()
    return Math.abs(sum - 1) < 0.001 // Allow for floating point precision
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  if (!selectedLocation) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Moteur de Scoring IA</h3>
          <p className="text-sm text-muted-foreground">
            Sélectionnez un emplacement sur la carte pour voir l'analyse de scoring détaillée
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Scoring IA - Analyse Détaillée</span>
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            Coordonnées: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Calcul du score en cours...</p>
            </div>
          ) : scoringResult ? (
            <Tabs defaultValue="score" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="score">Score Global</TabsTrigger>
                <TabsTrigger value="breakdown">Détail</TabsTrigger>
                <TabsTrigger value="weights">Pondération</TabsTrigger>
              </TabsList>

              <TabsContent value="score" className="space-y-6">
                {/* Global Score */}
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <div className={`text-4xl font-bold ${getScoreColor(scoringResult.totalScore)}`}>
                      {scoringResult.totalScore}/100
                    </div>
                    <Badge variant={getScoreBadgeVariant(scoringResult.totalScore)} className="text-sm">
                      {scoringResult.totalScore >= 80 ? "Excellent" : scoringResult.totalScore >= 60 ? "Bon" : "Faible"}{" "}
                      Potentiel
                    </Badge>
                  </div>

                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>Confiance: {scoringResult.confidence.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Category Scores */}
                <div className="space-y-4">
                  <Label className="font-medium">Scores par Catégorie</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(scoringResult.categoryScores).map(([category, score]) => {
                      const icons = {
                        population: Users,
                        income: TrendingUp,
                        accessibility: Car,
                        competition: Building,
                        infrastructure: MapPin,
                        location: Target,
                      }
                      const Icon = icons[category as keyof typeof icons]

                      return (
                        <div key={category} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium capitalize">{category}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Score</span>
                              <span className={`text-sm font-medium ${getScoreColor(score as number)}`}>
                                {Math.round(score as number)}/100
                              </span>
                            </div>
                            <Progress value={score as number} className="h-1" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Reason Codes */}
                <div className="space-y-3">
                  <Label className="font-medium">Facteurs Explicatifs (Reason Codes)</Label>
                  <div className="space-y-3">
                    {scoringResult.reasonCodes.slice(0, 5).map((reason: any, index: number) => (
                      <div key={index} className="p-3 rounded-lg border bg-card/50">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {reason.type === "positive" ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : reason.type === "negative" ? (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            ) : (
                              <Info className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <p className="text-sm">{reason.text}</p>
                              <Badge variant="outline" className="text-xs ml-2">
                                {reason.category}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground">
                                  Poids: {reason.weight.toFixed(0)}%
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">Impact {reason.impact}</span>
                              </div>
                              <span className={`text-xs font-medium ${getScoreColor(reason.score)}`}>
                                {reason.score.toFixed(0)}/100
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="breakdown" className="space-y-4">
                <div className="space-y-4">
                  {Object.entries(scoringResult.categoryScores).map(([category, score]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="capitalize">{category}</Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            Poids: {(weights[category as keyof ScoringWeights] * 100).toFixed(0)}%
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(score as number)}/100
                          </Badge>
                        </div>
                      </div>
                      <Progress value={score as number} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        Contribution au score final:{" "}
                        {((score as number) * weights[category as keyof ScoringWeights]).toFixed(1)} points
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="weights" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Ajustez les pondérations pour personnaliser l'algorithme de scoring selon vos critères métier.
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetToDefaultWeights}
                      className="text-xs bg-transparent"
                    >
                      Réinitialiser
                    </Button>
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 ${
                      isValidSum()
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                        : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {isValidSum() ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">Total des pondérations</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${isValidSum() ? "text-green-600" : "text-red-600"}`}>
                          {(getCurrentSum() * 100).toFixed(1)}%
                        </span>
                        {isAdjusting && (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </div>

                    <Progress
                      value={getCurrentSum() * 100}
                      className={`h-2 ${isValidSum() ? "" : "bg-red-100 dark:bg-red-900"}`}
                    />

                    <div className="text-xs text-muted-foreground mt-2">
                      {isValidSum()
                        ? "✓ Pondérations équilibrées - Le total est exactement de 100%"
                        : `⚠ Ajustement automatique en cours - Cible: 100%`}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(weights).map(([category, weight]) => {
                      const categoryLabels = {
                        population: "Population",
                        income: "Revenus",
                        accessibility: "Accessibilité",
                        competition: "Concurrence",
                        infrastructure: "Infrastructure",
                        location: "Localisation",
                      }

                      return (
                        <div key={category} className="space-y-3 p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between">
                            <Label className="font-medium">
                              {categoryLabels[category as keyof typeof categoryLabels]}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-mono bg-background px-2 py-1 rounded border">
                                {(weight * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          <Slider
                            value={[weight * 100]}
                            onValueChange={(value) => handleWeightChange(category as keyof ScoringWeights, value)}
                            max={50}
                            min={5}
                            step={1}
                            className="w-full"
                            disabled={isAdjusting}
                          />

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Min: 5%</span>
                            <span>Actuel: {(weight * 100).toFixed(1)}%</span>
                            <span>Max: 50%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <p className="font-medium">💡 Conseils d'utilisation :</p>
                        <p>• Les pondérations sont automatiquement ajustées pour maintenir un total de 100%</p>
                        <p>• Augmenter un critère diminue proportionnellement les autres</p>
                        <p>• Utilisez "Réinitialiser" pour revenir aux valeurs par défaut optimisées</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
