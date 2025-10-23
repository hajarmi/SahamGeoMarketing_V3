"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Users,
  Building,
  Car,
  ShoppingCart,
  Info,
  Plus,
  Eye,
  Download,
} from "lucide-react"

interface PredictionResult {
  predicted_volume: number
  roi_probability: number
  roi_prediction: boolean
  global_score: number
  reason_codes: Array<{
    factor: string
    impact: "positive" | "negative" | "neutral"
    weight: number
    description: string
    icon: string
  }>
  recommendation: string
  site_signature: {
    population: number
    revenue: number
    foot_traffic: number
    competition: number
    cannibalization: number
  }
  local_indicators: {
    population_500m: number
    population_1km: number
    avg_income: number
    poi_count: number
    competitor_atms: number
    foot_traffic_daily: number
    market_share_estimate: number
  }
  cannibalization_analysis: {
    cannibalization_risk: number
    affected_atms: Array<{
      id: string
      distance: number
      overlap_percentage: number
      volume_impact: number
    }>
    total_impact_volume: number
  }
}

export default function LocationAnalyzer() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSite, setSelectedSite] = useState<"existing" | "candidate">("candidate")
  const [location, setLocation] = useState({
    name: "Centre Commercial Anfa",
    latitude: 33.5731,
    longitude: -7.5898,
    population_density: 1500,
    commercial_poi_count: 15,
    competitor_atms_500m: 2,
    foot_traffic_score: 60,
    income_level: 45000,
    accessibility_score: 7,
    parking_availability: 1,
    public_transport_nearby: 1,
    business_district: 0,
    residential_area: 1,
  })

  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzLocation = async () => {
    setLoading(true)
    try {
      // Simulation d'analyse IA avancée
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const mockResult: PredictionResult = {
        predicted_volume: 1250,
        roi_probability: 0.78,
        roi_prediction: true,
        global_score: 82.5,
        reason_codes: [
          {
            factor: "Densité de population",
            impact: "positive",
            weight: 0.25,
            description: `Population élevée dans un rayon de 1km (${location.population_density * 2} habitants) favorise une forte demande`,
            icon: "users",
          },
          {
            factor: "Flux piéton",
            impact: "positive",
            weight: 0.2,
            description: `Score de passage élevé (${location.foot_traffic_score}/100) indique une zone très fréquentée`,
            icon: "trending-up",
          },
          {
            factor: "Concurrence locale",
            impact: location.competitor_atms_500m > 3 ? "negative" : "neutral",
            weight: 0.15,
            description: `${location.competitor_atms_500m} ATM concurrents dans 500m - ${location.competitor_atms_500m > 3 ? "concurrence forte" : "concurrence modérée"}`,
            icon: "alert-triangle",
          },
          {
            factor: "Accessibilité",
            impact: location.accessibility_score > 6 ? "positive" : "neutral",
            weight: 0.1,
            description: `Score d'accessibilité de ${location.accessibility_score}/10 avec ${location.parking_availability ? "parking disponible" : "pas de parking"}`,
            icon: "car",
          },
          {
            factor: "Zone commerciale",
            impact: location.commercial_poi_count > 10 ? "positive" : "neutral",
            weight: 0.15,
            description: `${location.commercial_poi_count} points d'intérêt commerciaux à proximité stimulent l'activité`,
            icon: "shopping-cart",
          },
          {
            factor: "Pouvoir d'achat",
            impact: location.income_level > 40000 ? "positive" : "neutral",
            weight: 0.15,
            description: `Revenu moyen de ${location.income_level.toLocaleString()} MAD indique une clientèle solvable`,
            icon: "building",
          },
        ],
        recommendation: "Site fortement recommandé - Potentiel élevé avec ROI positif attendu",
        site_signature: {
          population: 85,
          revenue: 75,
          foot_traffic: location.foot_traffic_score,
          competition: Math.max(0, 100 - location.competitor_atms_500m * 20),
          cannibalization: 25,
        },
        local_indicators: {
          population_500m: Math.round(location.population_density * 0.8),
          population_1km: Math.round(location.population_density * 2.1),
          avg_income: location.income_level,
          poi_count: location.commercial_poi_count,
          competitor_atms: location.competitor_atms_500m,
          foot_traffic_daily: Math.round(location.foot_traffic_score * 80),
          market_share_estimate: 35,
        },
        cannibalization_analysis: {
          cannibalization_risk: 22,
          affected_atms: [
            { id: "ATM_CAS_001", distance: 1.2, overlap_percentage: 40, volume_impact: -150 },
            { id: "ATM_CAS_003", distance: 0.8, overlap_percentage: 25, volume_impact: -80 },
          ],
          total_impact_volume: -230,
        },
      }

      setPrediction(mockResult)
      console.log("[v0] Location analysis completed:", mockResult)
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "positive":
        return "text-green-600"
      case "negative":
        return "text-red-600"
      default:
        return "text-yellow-600"
    }
  }

  const getImpactIcon = (iconName: string) => {
    const iconMap = {
      users: Users,
      "trending-up": TrendingUp,
      "alert-triangle": AlertTriangle,
      car: Car,
      "shopping-cart": ShoppingCart,
      building: Building,
    }
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Info
    return <IconComponent className="w-4 h-4" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Analyseur d'Emplacement IA</span>
          </CardTitle>
          <CardDescription>
            Analyse approfondie avec reason codes explicables pour sites existants et candidats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher un emplacement</Label>
              <Input
                id="search"
                placeholder="Nom d'ATM existant ou adresse pour site candidat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <Badge variant={selectedSite === "existing" ? "default" : "outline"}>
                <button onClick={() => setSelectedSite("existing")}>Site Existant</button>
              </Badge>
              <Badge variant={selectedSite === "candidate" ? "default" : "outline"}>
                <button onClick={() => setSelectedSite("candidate")}>Site Candidat</button>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration de l'analyse */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Informations du Site</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site-name">Nom du site</Label>
                <Input
                  id="site-name"
                  value={location.name}
                  onChange={(e) => setLocation({ ...location, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    value={location.latitude}
                    onChange={(e) => setLocation({ ...location, latitude: Number.parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    value={location.longitude}
                    onChange={(e) => setLocation({ ...location, longitude: Number.parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Indicateurs Locaux</CardTitle>
              <CardDescription>Paramètres de l'environnement immédiat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Densité de population: {location.population_density} hab/km²</Label>
                <Slider
                  value={[location.population_density]}
                  onValueChange={(value) => setLocation({ ...location, population_density: value[0] })}
                  max={5000}
                  min={100}
                  step={100}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Points d'intérêt commerciaux: {location.commercial_poi_count}</Label>
                <Slider
                  value={[location.commercial_poi_count]}
                  onValueChange={(value) => setLocation({ ...location, commercial_poi_count: value[0] })}
                  max={50}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>ATMs concurrents (500m): {location.competitor_atms_500m}</Label>
                <Slider
                  value={[location.competitor_atms_500m]}
                  onValueChange={(value) => setLocation({ ...location, competitor_atms_500m: value[0] })}
                  max={10}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Score de flux piétons: {location.foot_traffic_score}</Label>
                <Slider
                  value={[location.foot_traffic_score]}
                  onValueChange={(value) => setLocation({ ...location, foot_traffic_score: value[0] })}
                  max={100}
                  min={0}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Revenu moyen: {location.income_level.toLocaleString()} MAD</Label>
                <Slider
                  value={[location.income_level]}
                  onValueChange={(value) => setLocation({ ...location, income_level: value[0] })}
                  max={100000}
                  min={20000}
                  step={5000}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Score d'accessibilité: {location.accessibility_score}/10</Label>
                <Slider
                  value={[location.accessibility_score]}
                  onValueChange={(value) => setLocation({ ...location, accessibility_score: value[0] })}
                  max={10}
                  min={1}
                  step={0.5}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Caractéristiques de l'Emplacement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="parking">Parking disponible</Label>
                <Switch
                  id="parking"
                  checked={location.parking_availability === 1}
                  onCheckedChange={(checked) => setLocation({ ...location, parking_availability: checked ? 1 : 0 })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="transport">Transport public proche</Label>
                <Switch
                  id="transport"
                  checked={location.public_transport_nearby === 1}
                  onCheckedChange={(checked) => setLocation({ ...location, public_transport_nearby: checked ? 1 : 0 })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="business">Zone d'affaires</Label>
                <Switch
                  id="business"
                  checked={location.business_district === 1}
                  onCheckedChange={(checked) => setLocation({ ...location, business_district: checked ? 1 : 0 })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="residential">Zone résidentielle</Label>
                <Switch
                  id="residential"
                  checked={location.residential_area === 1}
                  onCheckedChange={(checked) => setLocation({ ...location, residential_area: checked ? 1 : 0 })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center space-x-3">
            <Button onClick={analyzLocation} disabled={loading} className="flex-1" size="lg">
              {loading ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-spin" />
                  Analyse IA en cours...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyser l'Emplacement
                </>
              )}
            </Button>
            <Button variant="outline" size="lg">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Résultats de l'analyse */}
        <div className="space-y-6">
          {prediction ? (
            <>
              {/* Score global et recommandation */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5" />
                      <span>Analyse Complète</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Détails
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Rapport
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Score principal */}
                  <div className="text-center">
                    <div className={`text-5xl font-bold mb-3 ${getScoreColor(prediction.global_score)}`}>
                      {prediction.global_score.toFixed(1)}
                    </div>
                    <p className="text-lg font-medium text-muted-foreground mb-4">Score de Potentiel</p>
                    <Badge
                      variant={prediction.roi_prediction ? "default" : "destructive"}
                      className="text-sm px-4 py-1"
                    >
                      {prediction.recommendation}
                    </Badge>
                    <Progress value={prediction.global_score} className="h-3 mt-4" />
                  </div>

                  <Separator />

                  {/* Métriques clés */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium">Volume Prévu</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{Math.round(prediction.predicted_volume)}</p>
                      <p className="text-xs text-muted-foreground">retraits/mois</p>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium">Probabilité ROI+</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {(prediction.roi_probability * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">rentabilité</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Signature radar du site */}
              <Card>
                <CardHeader>
                  <CardTitle>Signature du Site</CardTitle>
                  <CardDescription>Profil comparatif sur 5 dimensions clés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(prediction.site_signature).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {key === "foot_traffic"
                              ? "Flux piéton"
                              : key === "population"
                                ? "Population"
                                : key === "revenue"
                                  ? "Revenu"
                                  : key === "competition"
                                    ? "Concurrence"
                                    : "Cannibalisation"}
                          </span>
                          <span className="text-sm font-bold">{value}/100</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reason codes explicables */}
              <Card>
                <CardHeader>
                  <CardTitle>Reason Codes - Explicabilité IA</CardTitle>
                  <CardDescription>Facteurs clés influençant la recommandation avec poids d'impact</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prediction.reason_codes.map((code, index) => (
                      <div
                        key={index}
                        className={`flex items-start space-x-3 p-4 rounded-lg border-l-4 ${
                          code.impact === "positive"
                            ? "bg-green-50 dark:bg-green-950/20 border-l-green-500"
                            : code.impact === "negative"
                              ? "bg-red-50 dark:bg-red-950/20 border-l-red-500"
                              : "bg-yellow-50 dark:bg-yellow-950/20 border-l-yellow-500"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            code.impact === "positive"
                              ? "bg-green-100 text-green-600"
                              : code.impact === "negative"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {getImpactIcon(code.icon)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-foreground">{code.factor}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className={`text-xs ${getImpactColor(code.impact)}`}>
                                Poids: {(code.weight * 100).toFixed(0)}%
                              </Badge>
                              <Badge
                                variant={
                                  code.impact === "positive"
                                    ? "default"
                                    : code.impact === "negative"
                                      ? "destructive"
                                      : "secondary"
                                }
                                className="text-xs"
                              >
                                {code.impact === "positive" ? "+" : code.impact === "negative" ? "-" : "~"}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{code.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Indicateurs locaux détaillés */}
              <Card>
                <CardHeader>
                  <CardTitle>Indicateurs Locaux Détaillés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Population 500m</span>
                        <span className="font-medium">{prediction.local_indicators.population_500m}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Population 1km</span>
                        <span className="font-medium">{prediction.local_indicators.population_1km}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Revenu moyen</span>
                        <span className="font-medium">
                          {prediction.local_indicators.avg_income.toLocaleString()} MAD
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Points d'intérêt</span>
                        <span className="font-medium">{prediction.local_indicators.poi_count}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">ATMs concurrents</span>
                        <span className="font-medium">{prediction.local_indicators.competitor_atms}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Flux quotidien</span>
                        <span className="font-medium">{prediction.local_indicators.foot_traffic_daily}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Part de marché est.</span>
                        <span className="font-medium">{prediction.local_indicators.market_share_estimate}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analyse de cannibalisation */}
              {prediction.cannibalization_analysis.cannibalization_risk > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      <span>Analyse de Cannibalisation</span>
                    </CardTitle>
                    <CardDescription>Impact détaillé sur les ATMs existants</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Risque global de cannibalisation</span>
                        <span className="text-sm font-bold text-warning">
                          {prediction.cannibalization_analysis.cannibalization_risk.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={prediction.cannibalization_analysis.cannibalization_risk} className="h-2" />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-medium">ATMs Impactés</h4>
                      {prediction.cannibalization_analysis.affected_atms.map((atm, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{atm.id}</p>
                            <p className="text-sm text-muted-foreground">Distance: {atm.distance}km</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Chevauchement: {atm.overlap_percentage}%</p>
                            <p className="text-sm text-red-600">Impact: {atm.volume_impact} retraits/mois</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-warning/10 rounded-lg">
                      <p className="text-sm font-medium">
                        Impact total: {prediction.cannibalization_analysis.total_impact_volume} retraits/mois
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Analyseur d'Emplacement IA</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Configurez les paramètres de l'emplacement et lancez l'analyse pour obtenir des recommandations
                  détaillées avec reason codes explicables.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Analyse prédictive avec IA explicable</p>
                  <p>• Reason codes détaillés par facteur</p>
                  <p>• Signature radar comparative</p>
                  <p>• Analyse de cannibalisation précise</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
