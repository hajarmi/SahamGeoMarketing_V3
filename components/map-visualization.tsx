"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import ATMHoverCard from "./atm-hover-card"
import {
  MapPin,
  Layers,
  Filter,
  Search,
  Target,
  Users,
  Zap,
  TrendingUp,
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Maximize,
  Download,
  Navigation,
  X,
} from "lucide-react"

interface ATM {
  id: string
  name: string
  latitude: number
  longitude: number
  monthly_volume: number
  roi?: number
  status: string
  type?: "saham" | "competitor"
  bank_name?: string
  city?: string
  region?: string
  installation_type?: "fixed" | "portable"
  branch_location?: string
  services?: string[]
}

interface MapLayer {
  id: string
  name: string
  description: string
  visible: boolean
  opacity: number
  type: "points" | "heatmap" | "zones" | "isochrones"
  color: string
}

interface OpportunityZone {
  id: string
  center_lat: number
  center_lng: number
  score: number
  potential_volume: number
  reason: string
  priority: "high" | "medium" | "low"
}

interface POI {
  id: string
  name: string
  latitude: number
  longitude: number
  importance: "high" | "medium" | "low"
}

export default function MapVisualization() {
  const [atms, setAtms] = useState<ATM[]>([])
  const [selectedATM, setSelectedATM] = useState<ATM | null>(null)
  const [loading, setLoading] = useState(true)
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    {
      id: "saham_atms",
      name: "Réseau Saham Bank",
      description: "ATMs de Saham Bank",
      visible: true,
      opacity: 100,
      type: "points",
      color: "#38b2ac",
    },
    {
      id: "competitor_atms",
      name: "ATMs Concurrents",
      description: "Réseau de la concurrence",
      visible: false,
      opacity: 80,
      type: "points",
      color: "#ef4444",
    },
    {
      id: "coverage_zones",
      name: "Couverture 5 min",
      description: "Zones à 5 min de marche",
      visible: false,
      opacity: 30,
      type: "zones",
      color: "#4299e1",
    },
    {
      id: "population_density",
      name: "Densité Population",
      description: "Heatmap démographique",
      visible: false,
      opacity: 50,
      type: "heatmap",
      color: "#ed8936",
    },
    {
      id: "foot_traffic",
      name: "Flux Piétons",
      description: "Zones de forte fréquentation",
      visible: false,
      opacity: 40,
      type: "heatmap",
      color: "#9f7aea",
    },
    {
      id: "opportunity_zones",
      name: "Zones d'Opportunité",
      description: "Suggestions IA d'implantation",
      visible: true,
      opacity: 80,
      type: "zones",
      color: "#f59e0b",
    },
  ])

  const [filters, setFilters] = useState({
    performance: "all", // all, high, medium, low
    zone_type: "all", // all, residential, business, commercial
    roi_threshold: [0],
    volume_threshold: [0],
    show_underperforming: true,
    bank_filter: "all", // all, specific bank names
    installation_type: "all", // all, fixed, portable
  })

  const [opportunityZones] = useState<OpportunityZone[]>([
    // Casablanca Region
    {
      id: "opp_casa_1",
      center_lat: 33.5831,
      center_lng: -7.6098,
      score: 85,
      potential_volume: 1400,
      reason: "Zone résidentielle dense Maarif sans couverture ATM suffisante",
      priority: "high",
    },
    {
      id: "opp_casa_2",
      center_lat: 33.5631,
      center_lng: -7.5798,
      score: 72,
      potential_volume: 1100,
      reason: "Centre commercial Anfa Place avec forte fréquentation",
      priority: "medium",
    },
    {
      id: "opp_casa_3",
      center_lat: 33.5931,
      center_lng: -7.5998,
      score: 68,
      potential_volume: 950,
      reason: "Zone d'affaires CFC en développement rapide",
      priority: "medium",
    },

    // Rabat Region
    {
      id: "opp_rabat_1",
      center_lat: 34.0309,
      center_lng: -6.8398,
      score: 78,
      potential_volume: 1200,
      reason: "Quartier Hay Riad, zone résidentielle haut standing",
      priority: "high",
    },
    {
      id: "opp_rabat_2",
      center_lat: 34.0109,
      center_lng: -6.8598,
      score: 71,
      potential_volume: 980,
      reason: "Proximité université et centres commerciaux",
      priority: "medium",
    },

    // Marrakech Region
    {
      id: "opp_marrakech_1",
      center_lat: 31.6395,
      center_lng: -8.0181,
      score: 82,
      potential_volume: 1300,
      reason: "Zone touristique Hivernage, flux international élevé",
      priority: "high",
    },
    {
      id: "opp_marrakech_2",
      center_lat: 31.6195,
      center_lng: -7.9981,
      score: 75,
      potential_volume: 1050,
      reason: "Nouvelle ville, développement résidentiel",
      priority: "medium",
    },

    // Tanger Region
    {
      id: "opp_tanger_1",
      center_lat: 35.7695,
      center_lng: -5.844,
      score: 80,
      potential_volume: 1150,
      reason: "Zone portuaire Tanger Med, activité économique intense",
      priority: "high",
    },
    {
      id: "opp_tanger_2",
      center_lat: 35.7495,
      center_lng: -5.814,
      score: 69,
      potential_volume: 890,
      reason: "Centre-ville moderne, flux touristique",
      priority: "medium",
    },

    // Agadir Region
    {
      id: "opp_agadir_1",
      center_lat: 30.4378,
      center_lng: -9.6081,
      score: 76,
      potential_volume: 1080,
      reason: "Zone hôtelière, forte activité touristique",
      priority: "medium",
    },
    {
      id: "opp_agadir_2",
      center_lat: 30.4178,
      center_lng: -9.5781,
      score: 73,
      potential_volume: 920,
      reason: "Nouveau centre commercial Souss Massa",
      priority: "medium",
    },

    // Fès Region
    {
      id: "opp_fes_1",
      center_lat: 34.0431,
      center_lng: -5.0098,
      score: 74,
      potential_volume: 980,
      reason: "Campus universitaire, population étudiante dense",
      priority: "medium",
    },
    {
      id: "opp_fes_2",
      center_lat: 34.0231,
      center_lng: -4.9898,
      score: 70,
      potential_volume: 850,
      reason: "Zone industrielle Sidi Brahim",
      priority: "low",
    },

    // Meknès
    {
      id: "opp_meknes_1",
      center_lat: 33.9035,
      center_lng: -5.5507,
      score: 72,
      potential_volume: 890,
      reason: "Centre historique, flux touristique régulier",
      priority: "medium",
    },

    // Oujda
    {
      id: "opp_oujda_1",
      center_lat: 34.6914,
      center_lng: -1.9185,
      score: 71,
      potential_volume: 820,
      reason: "Zone frontalière, échanges commerciaux",
      priority: "medium",
    },

    // Kenitra
    {
      id: "opp_kenitra_1",
      center_lat: 34.271,
      center_lng: -6.5902,
      score: 68,
      potential_volume: 780,
      reason: "Zone industrielle Atlantic Free Zone",
      priority: "low",
    },

    // Tétouan
    {
      id: "opp_tetouan_1",
      center_lat: 35.5989,
      center_lng: -5.3784,
      score: 66,
      potential_volume: 720,
      reason: "Centre universitaire, population jeune",
      priority: "low",
    },

    // El Jadida
    {
      id: "opp_eljadida_1",
      center_lat: 33.2416,
      center_lng: -8.5169,
      score: 65,
      potential_volume: 680,
      reason: "Zone côtière, développement touristique",
      priority: "low",
    },

    // Beni Mellal
    {
      id: "opp_benimellal_1",
      center_lat: 32.3473,
      center_lng: -6.3598,
      score: 67,
      potential_volume: 750,
      reason: "Centre agricole régional, activité économique",
      priority: "low",
    },
  ])

  const [selectedZone, setSelectedZone] = useState<OpportunityZone | null>(null)
  const [mapMode, setMapMode] = useState<"explore" | "analyze" | "measure">("explore")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [hoveredATM, setHoveredATM] = useState<any>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [bankingMarketData, setBankingMarketData] = useState<any>(null)

  // const [mockCompetitors] = useState<ATM[]>([
  //   {
  //     id: "COMP_001",
  //     name: "BMCE Bank - Anfa",
  //     latitude: 33.5781,
  //     longitude: -7.5948,
  //     monthly_volume: 800,
  //     roi: 0,
  //     status: "active",
  //     type: "competitor",
  //     bank_name: "BMCE Bank",
  //     city: "Casablanca",
  //   },
  //   {
  //     id: "COMP_002",
  //     name: "Attijariwafa - Maarif",
  //     latitude: 33.5681,
  //     longitude: -7.5848,
  //     monthly_volume: 1200,
  //     roi: 0,
  //     status: "active",
  //     type: "competitor",
  //     bank_name: "Attijariwafa Bank",
  //     city: "Casablanca",
  //   },
  // ])

  const [mockPOIs] = useState<POI[]>([
    {
      id: "poi_1",
      name: "Université Hassan II",
      latitude: 34.0309,
      longitude: -6.8398,
      importance: "high",
    },
    {
      id: "poi_2",
      name: "Anfa Place",
      latitude: 33.5631,
      longitude: -7.5798,
      importance: "medium",
    },
    {
      id: "poi_3",
      name: "CFC",
      latitude: 33.5931,
      longitude: -7.5998,
      importance: "medium",
    },
    {
      id: "poi_4",
      name: "Tanger Med",
      latitude: 35.7695,
      longitude: -5.844,
      importance: "high",
    },
    {
      id: "poi_5",
      name: "Souss Massa",
      latitude: 30.4178,
      longitude: -9.5781,
      importance: "medium",
    },
    {
      id: "poi_6",
      name: "Atlantic Free Zone",
      latitude: 34.271,
      longitude: -6.5902,
      importance: "low",
    },
  ])

  useEffect(() => {
    fetchATMs()
  }, [])

  const fetchATMs = async () => {
    try {
      const response = await fetch("/api/atms")
      if (response.ok) {
        const data = await response.json()

        const allATMs = data.atms.map((atm: any) => ({
          ...atm,
          // Classify as competitor if not Saham Bank
          type: atm.bank_name === "Saham Bank" ? "saham" : "competitor",
          roi: atm.bank_name === "Saham Bank" ? Math.random() * 20 + 5 : 0, // ROI only for Saham
        }))

        setAtms(allATMs)
        setBankingMarketData(data.banking_market)
        console.log("[v0] ATMs data loaded with real Moroccan banks:", allATMs)
        console.log("[v0] Banking market data:", data.banking_market)
      } else {
        console.error("[v0] Failed to fetch ATMs data:", response.status)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des ATMs:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleLayer = (layerId: string) => {
    setMapLayers((layers) =>
      layers.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer)),
    )
  }

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setMapLayers((layers) => layers.map((layer) => (layer.id === layerId ? { ...layer, opacity } : layer)))
  }

  const getATMColor = (atm: ATM) => {
    if (atm.type === "competitor") {
      // Different colors for different competitor banks
      switch (atm.bank_name) {
        case "Attijariwafa Bank":
          return "#dc2626" // red-600
        case "Banque Populaire":
          return "#2563eb" // blue-600
        case "BMCE Bank":
          return "#059669" // emerald-600
        case "CIH Bank":
          return "#7c3aed" // violet-600
        case "BMCI":
          return "#ea580c" // orange-600
        case "Crédit du Maroc":
          return "#0891b2" // cyan-600
        case "Al Barid Bank":
          return "#ca8a04" // yellow-600
        case "Société Générale Maroc":
          return "#4338ca" // indigo-600
        case "Crédit Agricole du Maroc":
          return "#65a30d" // lime-600
        default:
          return "#ef4444" // red-500
      }
    }

    // Saham Bank ATMs - performance-based coloring
    if (atm.monthly_volume > 1200) return "#22c55e" // green-500
    if (atm.monthly_volume > 900) return "#f59e0b" // amber-500
    return "#ef4444" // red-500
  }

  const getPerformanceLabel = (volume: number) => {
    if (volume > 1200) return "Excellent"
    if (volume > 900) return "Bon"
    return "Faible"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444"
      case "medium":
        return "#f59e0b"
      case "low":
        return "#22c55e"
      default:
        return "#64748b"
    }
  }

  const filteredATMs = atms.filter((atm) => {
    if (filters.performance !== "all") {
      const performance = atm.monthly_volume > 1200 ? "high" : atm.monthly_volume > 900 ? "medium" : "low"
      if (performance !== filters.performance) return false
    }
    if (atm.monthly_volume < filters.volume_threshold[0]) return false
    if (atm.type === "saham" && atm.roi && atm.roi < filters.roi_threshold[0]) return false
    if (filters.bank_filter !== "all" && atm.bank_name !== filters.bank_filter) return false
    if (filters.installation_type !== "all" && atm.installation_type !== filters.installation_type) return false
    return true
  })

  const uniqueBanks = [...new Set(atms.map((atm) => atm.bank_name).filter(Boolean))]

  // Simulation d'une carte interactive
  const MapContainer = () => (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-lg border overflow-hidden">
      {/* Fond de carte stylisé avec grille */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 800 600">
          {/* Grille de fond */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Routes principales */}
          <path d="M0,300 Q200,250 400,300 T800,300" stroke="#64748b" strokeWidth="3" fill="none" />
          <path d="M400,0 Q350,200 400,400 T400,600" stroke="#64748b" strokeWidth="3" fill="none" />
          <path d="M0,200 Q400,180 800,200" stroke="#64748b" strokeWidth="2" fill="none" />
          <path d="M0,400 Q400,420 800,400" stroke="#64748b" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Couches de données */}
      {mapLayers.find((l) => l.id === "population_density")?.visible && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-32 h-32 rounded-full bg-orange-500/30 blur-xl"
            style={{ top: "20%", left: "30%" }}
          />
          <div
            className="absolute w-24 h-24 rounded-full bg-orange-500/40 blur-lg"
            style={{ top: "60%", left: "60%" }}
          />
          <div
            className="absolute w-40 h-40 rounded-full bg-orange-500/20 blur-2xl"
            style={{ top: "40%", left: "10%" }}
          />
        </div>
      )}

      {mapLayers.find((l) => l.id === "coverage_zones")?.visible && (
        <div className="absolute inset-0 pointer-events-none">
          {filteredATMs
            .filter((atm) => atm.type === "saham")
            .map((atm, index) => {
              const x = (Number.parseFloat(atm.longitude.toString()) + 7.6) * 800 + 50
              const y = (33.7 - Number.parseFloat(atm.latitude.toString())) * 600 + 50
              return (
                <div
                  key={`coverage-${atm.id}`}
                  className="absolute w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500/40"
                  style={{
                    left: `${Math.min(Math.max(x - 40, 0), 760)}px`,
                    top: `${Math.min(Math.max(y - 40, 0), 560)}px`,
                  }}
                />
              )
            })}
        </div>
      )}

      {/* ATMs sur la carte */}
      {filteredATMs.map((atm, index) => {
        const x = (Number.parseFloat(atm.longitude.toString()) + 7.6) * 800 + 50
        const y = (33.7 - Number.parseFloat(atm.latitude.toString())) * 600 + 50

        return (
          <div
            key={atm.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
            style={{ left: `${Math.min(Math.max(x, 20), 780)}px`, top: `${Math.min(Math.max(y, 20), 580)}px` }}
            onClick={() => setSelectedATM(atm)}
            onMouseEnter={(e) => {
              console.log("[v0] ATM hovered in custom map:", atm.name)
              const rect = e.currentTarget.getBoundingClientRect()
              setHoverPosition({
                x: rect.left + window.scrollX + rect.width / 2,
                y: rect.top + window.scrollY,
              })
              setHoveredATM({
                ...atm,
                id: atm.id,
                name: atm.name || atm.id,
                bank_name: atm.bank_name,
                installation_type: atm.installation_type,
                branch_location: atm.branch_location,
                services: atm.services,
                performance: atm.type === "saham" ? Math.round((atm.monthly_volume / 1500) * 100) : undefined,
                monthly_volume: atm.monthly_volume,
                dailyTransactions: Math.round(atm.monthly_volume / 30),
                uptime: atm.type === "saham" ? "98.5%" : undefined,
                cashLevel: atm.type === "saham" ? "Optimal" : undefined,
                networkStatus: atm.type === "saham" ? "Connecté" : undefined,
                lastMaintenance: atm.type === "saham" ? "2024-01-15" : undefined,
                address: atm.branch_location || `${atm.latitude.toFixed(4)}°N, ${atm.longitude.toFixed(4)}°W`,
                type: atm.type,
                roi: atm.roi,
              })
            }}
            onMouseLeave={() => {
              console.log("[v0] ATM hover ended in custom map")
              setHoveredATM(null)
            }}
          >
            <div className="relative">
              <div
                className={`w-5 h-5 rounded-full border-2 border-white shadow-lg transition-all group-hover:scale-125 ${
                  selectedATM?.id === atm.id ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
                style={{ backgroundColor: getATMColor(atm) }}
              />

              {/* Animation pour ATMs performants */}
              {atm.type === "saham" && atm.monthly_volume > 1200 && (
                <div
                  className="absolute inset-0 w-5 h-5 rounded-full animate-ping opacity-30"
                  style={{ backgroundColor: getATMColor(atm) }}
                />
              )}
            </div>
          </div>
        )
      })}

      {/* Zones d'opportunité */}
      {mapLayers.find((l) => l.id === "opportunity_zones")?.visible &&
        opportunityZones.map((zone) => {
          const x = (zone.center_lng + 7.6) * 800 + 50
          const y = (33.7 - zone.center_lat) * 600 + 50

          return (
            <div
              key={zone.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
              style={{ left: `${Math.min(Math.max(x, 20), 780)}px`, top: `${Math.min(Math.max(y, 20), 580)}px` }}
              onClick={() => setSelectedZone(zone)}
              onMouseEnter={(e) => {
                console.log("[v0] Opportunity zone hovered:", zone.id)
                const rect = e.currentTarget.getBoundingClientRect()
                setHoverPosition({
                  x: rect.left + window.scrollX + rect.width / 2,
                  y: rect.top + window.scrollY,
                })
                setHoveredATM({
                  id: zone.id,
                  name: "Zone d'Opportunité",
                  brand: `Priorité ${zone.priority === "high" ? "Haute" : zone.priority === "medium" ? "Moyenne" : "Faible"}`,
                  performance: zone.score,
                  monthly_volume: zone.potential_volume,
                  type: "opportunity",
                  address: zone.reason,
                })
              }}
              onMouseLeave={() => {
                console.log("[v0] Opportunity zone hover ended")
                setHoveredATM(null)
              }}
            >
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-full border-2 border-dashed animate-pulse-slow opacity-80 group-hover:opacity-100"
                  style={{
                    borderColor: getPriorityColor(zone.priority),
                    backgroundColor: `${getPriorityColor(zone.priority)}20`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Plus className="w-4 h-4" style={{ color: getPriorityColor(zone.priority) }} />
                </div>
              </div>
            </div>
          )
        })}

      {/* Contrôles de la carte */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button size="sm" variant="outline" className="w-10 h-10 p-0 bg-card/90 backdrop-blur-sm">
          <Plus className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" className="w-10 h-10 p-0 bg-card/90 backdrop-blur-sm">
          <Minus className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" className="w-10 h-10 p-0 bg-card/90 backdrop-blur-sm">
          <Maximize className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" className="w-10 h-10 p-0 bg-card/90 backdrop-blur-sm">
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      {/* Échelle et nord */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-4">
        <div className="bg-card/90 backdrop-blur-sm border rounded px-2 py-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-0.5 bg-foreground"></div>
            <span className="text-xs">1 km</span>
          </div>
        </div>
        <div className="bg-card/90 backdrop-blur-sm border rounded p-2">
          <Navigation className="w-4 h-4" />
        </div>
      </div>

      {/* Légende intégrée */}
      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm border rounded-lg p-4 max-w-xs">
        <h4 className="text-sm font-semibold text-foreground mb-3">Légende</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Performance élevée (Saham)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-muted-foreground">Performance moyenne (Saham)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Performance faible (Saham)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <span className="text-xs text-muted-foreground">Attijariwafa Bank</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-xs text-muted-foreground">Banque Populaire</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-600" />
            <span className="text-xs text-muted-foreground">BMCE Bank</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500/50 border border-orange-500 border-dashed" />
            <span className="text-xs text-muted-foreground">Zone d'opportunité</span>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="w-full h-96 bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Chargement de la carte interactive...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant={mapMode === "explore" ? "default" : "outline"}
            size="sm"
            onClick={() => setMapMode("explore")}
          >
            <Eye className="w-4 h-4 mr-2" />
            Explorer
          </Button>
          <Button
            variant={mapMode === "analyze" ? "default" : "outline"}
            size="sm"
            onClick={() => setMapMode("analyze")}
          >
            <Target className="w-4 h-4 mr-2" />
            Analyser
          </Button>
          <Button
            variant={mapMode === "measure" ? "default" : "outline"}
            size="sm"
            onClick={() => setMapMode("measure")}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Mesurer
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panneau de contrôle */}
        {!sidebarCollapsed && (
          <div className="lg:col-span-1 space-y-6">
            {/* Couches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="w-4 h-4" />
                  <span>Couches</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mapLayers.map((layer) => (
                  <div key={layer.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch checked={layer.visible} onCheckedChange={() => toggleLayer(layer.id)} size="sm" />
                        <div>
                          <Label className="text-sm font-medium">{layer.name}</Label>
                          <p className="text-xs text-muted-foreground">{layer.description}</p>
                        </div>
                      </div>
                    </div>
                    {layer.visible && (
                      <div className="ml-6">
                        <Label className="text-xs">Opacité: {layer.opacity}%</Label>
                        <Slider
                          value={[layer.opacity]}
                          onValueChange={(value) => updateLayerOpacity(layer.id, value[0])}
                          max={100}
                          min={10}
                          step={10}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Filtres */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filtres</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Performance</Label>
                  <select
                    value={filters.performance}
                    onChange={(e) => setFilters({ ...filters, performance: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-md bg-background"
                  >
                    <option value="all">Toutes</option>
                    <option value="high">Élevée</option>
                    <option value="medium">Moyenne</option>
                    <option value="low">Faible</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Volume minimum: {filters.volume_threshold[0]}</Label>
                  <Slider
                    value={filters.volume_threshold}
                    onValueChange={(value) => setFilters({ ...filters, volume_threshold: value })}
                    max={2000}
                    min={0}
                    step={100}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">ROI minimum: {filters.roi_threshold[0]}%</Label>
                  <Slider
                    value={filters.roi_threshold}
                    onValueChange={(value) => setFilters({ ...filters, roi_threshold: value })}
                    max={30}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Afficher sous-performants</Label>
                  <Switch
                    checked={filters.show_underperforming}
                    onCheckedChange={(checked) => setFilters({ ...filters, show_underperforming: checked })}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Banque</Label>
                  <select
                    value={filters.bank_filter}
                    onChange={(e) => setFilters({ ...filters, bank_filter: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-md bg-background"
                  >
                    <option value="all">Toutes les banques</option>
                    {uniqueBanks.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Type d'installation</Label>
                  <select
                    value={filters.installation_type}
                    onChange={(e) => setFilters({ ...filters, installation_type: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-md bg-background"
                  >
                    <option value="all">Tous types</option>
                    <option value="fixed">Fixe</option>
                    <option value="portable">Portable</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Recherche */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Recherche</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input placeholder="Rechercher un ATM ou une zone..." className="mb-3" />
                <Button variant="outline" className="w-full bg-transparent" size="sm">
                  <Target className="w-4 h-4 mr-2" />
                  Analyser cette position
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Carte principale */}
        <div className={sidebarCollapsed ? "lg:col-span-4" : "lg:col-span-3"}>
          <MapContainer />
          <ATMHoverCard atm={hoveredATM} position={hoverPosition} visible={!!hoveredATM} />
        </div>
      </div>

      {/* Informations détaillées */}
      {(selectedATM || selectedZone) && (
        <Card>
          <CardContent className="p-6">
            {selectedATM && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${getATMColor(selectedATM)}20` }}
                    >
                      <MapPin className="w-6 h-6" style={{ color: getATMColor(selectedATM) }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{selectedATM.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedATM.latitude.toFixed(4)}, {selectedATM.longitude.toFixed(4)}
                      </p>
                      <Badge variant={selectedATM.type === "saham" ? "default" : "secondary"}>
                        {selectedATM.type === "saham" ? "Saham Bank" : selectedATM.bank_name}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Target className="w-4 h-4 mr-2" />
                      Analyser
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedATM(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedATM.monthly_volume}</p>
                      <p className="text-xs text-muted-foreground">Retraits/mois</p>
                    </div>
                  </div>

                  {selectedATM.type === "saham" && (
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Zap className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{selectedATM.roi?.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">ROI</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {getPerformanceLabel(selectedATM.monthly_volume)}
                      </p>
                      <p className="text-xs text-muted-foreground">Performance</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Users className="w-5 h-5 text-success" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Faible</p>
                      <p className="text-xs text-muted-foreground">Cannibalisation</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedZone && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${getPriorityColor(selectedZone.priority)}20` }}
                    >
                      <Target className="w-6 h-6" style={{ color: getPriorityColor(selectedZone.priority) }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Zone d'Opportunité</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedZone.center_lat.toFixed(4)}, {selectedZone.center_lng.toFixed(4)}
                      </p>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: getPriorityColor(selectedZone.priority),
                          color: getPriorityColor(selectedZone.priority),
                        }}
                      >
                        Priorité{" "}
                        {selectedZone.priority === "high"
                          ? "Haute"
                          : selectedZone.priority === "medium"
                            ? "Moyenne"
                            : "Faible"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter au Simulateur
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedZone(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Target className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedZone.score}/100</p>
                      <p className="text-xs text-muted-foreground">Score IA</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedZone.potential_volume}</p>
                      <p className="text-xs text-muted-foreground">Potentiel/mois</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-warning" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Faible</p>
                      <p className="text-xs text-muted-foreground">Concurrence</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Raison:</strong> {selectedZone.reason}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistiques de la carte */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {filteredATMs.filter((a) => a.type === "saham").length}
            </p>
            <p className="text-sm text-muted-foreground">ATMs Saham</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Set(filteredATMs.filter((a) => a.type === "saham").map((a) => a.city || "Unknown")).size} villes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {filteredATMs.filter((a) => a.type === "competitor").length}
            </p>
            <p className="text-sm text-muted-foreground">Concurrents</p>
            <p className="text-xs text-muted-foreground mt-1">
              {uniqueBanks.filter((bank) => bank !== "Saham Bank").length} banques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {filteredATMs.filter((atm) => atm.installation_type === "fixed").length}
            </p>
            <p className="text-sm text-muted-foreground">ATMs Fixes</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredATMs.length > 0
                ? Math.round(
                    (filteredATMs.filter((atm) => atm.installation_type === "fixed").length / filteredATMs.length) *
                      100,
                  )
                : 0}
              % du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {filteredATMs.filter((atm) => atm.installation_type === "portable").length}
            </p>
            <p className="text-sm text-muted-foreground">ATMs Portables</p>
            <p className="text-xs text-muted-foreground mt-1">Zones temporaires</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {filteredATMs.filter((atm) => atm.type === "saham" && atm.monthly_volume > 1200).length}
            </p>
            <p className="text-sm text-muted-foreground">Haute Performance</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredATMs.filter((a) => a.type === "saham").length > 0
                ? Math.round(
                    (filteredATMs.filter((atm) => atm.type === "saham" && atm.monthly_volume > 1200).length /
                      filteredATMs.filter((a) => a.type === "saham").length) *
                      100,
                  )
                : 0}
              % du réseau Saham
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{opportunityZones.length}</p>
            <p className="text-sm text-muted-foreground">Zones d'Opportunité</p>
            <p className="text-xs text-muted-foreground mt-1">
              {opportunityZones.filter((z) => z.priority === "high").length} priorité haute
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
