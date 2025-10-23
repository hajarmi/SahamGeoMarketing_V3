"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Target } from "lucide-react"
import Dashboard from "@/components/dashboard"
import LeafletMap from "@/components/mapbox-map"
import EnhancedLayerControls from "@/components/enhanced-layer-controls"

interface ATMData {
  id: string
  name: string
  location: {
    lng: number
    lat: number
  }
  address: string
  volume: number
  roi: number
  status: string
}

export default function DashboardPage() {
  const [selectedATM, setSelectedATM] = useState<ATMData | null>(null)
  const [activeLayers, setActiveLayers] = useState({
    population: true,
    competitors: true,
    pois: false,
    coverage: false,
  })
  const [simulationMode, setSimulationMode] = useState(false)

  const handleATMSelect = useCallback((atm: ATMData) => {
    console.log("[v0] ATM selected:", atm)
    setSelectedATM(atm)
  }, [])

  const handleLayerConfigChange = useCallback((layer: string, config: any) => {
    console.log(`[v0] Layer ${layer} config updated:`, config)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Tableau de Bord ATM</h1>
                  <p className="text-sm text-muted-foreground font-medium">Analyse et gestion du réseau d'automates</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow" />
                <span className="font-medium">Données en temps réel</span>
              </Badge>

              <Button
                variant={simulationMode ? "default" : "outline"}
                size="sm"
                onClick={() => setSimulationMode(!simulationMode)}
                className="font-medium"
              >
                <Target className="w-4 h-4 mr-2" />
                {simulationMode ? "Mode Analyse" : "Mode Simulation"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Dashboard Analytics */}
          <Dashboard />

          {/* Map and Controls Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <EnhancedLayerControls
                activeLayers={activeLayers}
                onLayerToggle={(layer, active) => setActiveLayers((prev) => ({ ...prev, [layer]: active }))}
                mode="detailed"
                onLayerConfigChange={handleLayerConfigChange}
                selectedATM={selectedATM}
              />
            </div>

            <div className="lg:col-span-3">
              <Card className="h-[600px]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5" />
                        <span>Réseau ATM - Vue Géographique</span>
                      </CardTitle>
                      <CardDescription>
                        {selectedATM
                          ? `ATM sélectionné: ${selectedATM.name} - ${selectedATM.address}`
                          : "Cliquez sur un ATM pour voir ses détails"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedATM && (
                        <Badge variant="outline" className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span>{selectedATM.name}</span>
                        </Badge>
                      )}
                      <Badge variant={simulationMode ? "default" : "secondary"}>
                        {simulationMode ? "Simulation" : "Exploration"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 h-[calc(100%-80px)]">
                  <LeafletMap
                    activeLayers={activeLayers}
                    simulationMode={simulationMode}
                    onLocationSelect={(location) => console.log("[v0] Location selected:", location)}
                    onATMSelect={handleATMSelect}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
