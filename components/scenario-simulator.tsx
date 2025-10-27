"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calculator,
  Plus,
  Minus,
  TrendingUp,
  DollarSign,
  Target,
  AlertTriangle,
  X,
  Save,
  Download,
  MessageSquare,
  BarChart3,
} from "lucide-react"

interface ScenarioAction {
  id: string
  type: "add" | "remove" | "modify"
  location: string
  latitude?: number
  longitude?: number
  cost?: number
  description: string
}

interface ScenarioResults {
  current_volume: number
  scenario_volume: number
  volume_change: number
  volume_change_percent: number
  current_roi: number
  scenario_roi: number
  roi_change: number
  incremental_roi: number
  cannibalisation_rate: number
  coverage_improvement: number
  total_cost: number
  payback_months: number
  recommendation: string
  risk_level: "low" | "medium" | "high"
}

interface Scenario {
  id: string
  name: string
  prompt: string
  actions: ScenarioAction[]
  results: ScenarioResults | null
  status: "draft" | "running" | "completed" | "error"
}

export default function ScenarioSimulator() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null)
  const [promptInput, setPromptInput] = useState("")
  const [batchPrompts, setBatchPrompts] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("prompt")

  // Legacy single scenario state for manual mode
  const [newLocation, setNewLocation] = useState({
    name: "",
    latitude: 33.5731,
    longitude: -7.5898,
    cost: 25000,
  })

  const parsePromptToActions = (prompt: string): ScenarioAction[] => {
    console.log("[v0] Parsing prompt:", prompt)

    // Simple prompt parsing logic - in production, this would use AI/NLP
    const actions: ScenarioAction[] = []
    const lines = prompt
      .toLowerCase()
      .split("\n")
      .filter((line) => line.trim())

    lines.forEach((line, index) => {
      if (line.includes("ajouter") || line.includes("nouveau") || line.includes("installer")) {
        // Extract location name (simple pattern matching)
        const locationMatch = line.match(/(?:à|au|dans|près de)\s+([^,\n]+)/i)
        const location = locationMatch ? locationMatch[1].trim() : `Emplacement ${index + 1}`

        // Generate random coordinates around Morocco
        const lat = 33.5731 + (Math.random() - 0.5) * 2
        const lng = -7.5898 + (Math.random() - 0.5) * 4
        const cost = 20000 + Math.random() * 15000

        actions.push({
          id: `${Date.now()}-${index}`,
          type: "add",
          location,
          latitude: lat,
          longitude: lng,
          cost: Math.round(cost),
          description: `Ajouter ATM - ${location}`,
        })
      }
    })

    // If no specific actions found, create a default one
    if (actions.length === 0) {
      actions.push({
        id: Date.now().toString(),
        type: "add",
        location: "Emplacement généré",
        latitude: 33.5731 + (Math.random() - 0.5) * 2,
        longitude: -7.5898 + (Math.random() - 0.5) * 4,
        cost: 25000,
        description: "Ajouter ATM - Emplacement généré depuis prompt",
      })
    }

    return actions
  }

  const createScenarioFromPrompt = () => {
    if (!promptInput.trim()) return

    const actions = parsePromptToActions(promptInput)
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: `Scénario ${scenarios.length + 1}`,
      prompt: promptInput,
      actions,
      results: null,
      status: "draft",
    }

    setScenarios([...scenarios, newScenario])
    setActiveScenarioId(newScenario.id)
    setPromptInput("")
    console.log("[v0] Created scenario from prompt:", newScenario)
  }

  const createMultipleScenariosFromPrompts = () => {
    if (!batchPrompts.trim()) return

    const prompts = batchPrompts.split("\n\n").filter((p) => p.trim())
    const newScenarios: Scenario[] = prompts.map((prompt, index) => {
      const actions = parsePromptToActions(prompt)
      return {
        id: `${Date.now()}-${index}`,
        name: `Scénario Batch ${scenarios.length + index + 1}`,
        prompt: prompt.trim(),
        actions,
        results: null,
        status: "draft",
      }
    })

    setScenarios([...scenarios, ...newScenarios])
    setBatchPrompts("")
    console.log("[v0] Created multiple scenarios:", newScenarios)
  }

  const simulateScenario = async (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId)
    if (!scenario || scenario.actions.length === 0) return

    // Update scenario status
    setScenarios((prev) => prev.map((s) => (s.id === scenarioId ? { ...s, status: "running" } : s)))

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate varied results based on scenario actions
      const totalCost = scenario.actions.reduce((sum, action) => sum + (action.cost || 0), 0)
      const baseVolume = 45000
      const volumeIncrease = scenario.actions.length * (3000 + Math.random() * 2000)

      const mockResults: ScenarioResults = {
        current_volume: baseVolume,
        scenario_volume: baseVolume + volumeIncrease,
        volume_change: volumeIncrease,
        volume_change_percent: (volumeIncrease / baseVolume) * 100,
        current_roi: 12.5,
        scenario_roi: 12.5 + Math.random() * 4,
        roi_change: Math.random() * 4,
        incremental_roi: 15 + Math.random() * 10,
        cannibalisation_rate: 15 + Math.random() * 20,
        coverage_improvement: 5 + Math.random() * 10,
        total_cost: totalCost,
        payback_months: 12 + Math.random() * 12,
        recommendation: "Scénario recommandé avec ROI positif",
        risk_level: Math.random() > 0.7 ? "medium" : "low",
      }

      setScenarios((prev) =>
        prev.map((s) => (s.id === scenarioId ? { ...s, results: mockResults, status: "completed" } : s)),
      )

      console.log("[v0] Scenario simulation completed for:", scenarioId, mockResults)
    } catch (error) {
      console.error("Erreur simulation:", error)
      setScenarios((prev) => prev.map((s) => (s.id === scenarioId ? { ...s, status: "error" } : s)))
    }
  }

  const runAllScenarios = async () => {
    setLoading(true)
    const draftScenarios = scenarios.filter((s) => s.status === "draft")

    for (const scenario of draftScenarios) {
      await simulateScenario(scenario.id)
    }

    setLoading(false)
  }

  const removeScenario = (scenarioId: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== scenarioId))
    if (activeScenarioId === scenarioId) {
      setActiveScenarioId(null)
    }
  }

  // Legacy functions for manual mode
  const addATMAction = () => {
    if (!newLocation.name || !activeScenarioId) return

    const newAction: ScenarioAction = {
      id: Date.now().toString(),
      type: "add",
      location: newLocation.name,
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
      cost: newLocation.cost,
      description: `Ajouter ATM - ${newLocation.name}`,
    }

    setScenarios((prev) =>
      prev.map((s) => (s.id === activeScenarioId ? { ...s, actions: [...s.actions, newAction] } : s)),
    )
    setNewLocation({ name: "", latitude: 33.5731, longitude: -7.5898, cost: 25000 })
  }

  const removeAction = (actionId: string) => {
    if (!activeScenarioId) return

    setScenarios((prev) =>
      prev.map((s) => (s.id === activeScenarioId ? { ...s, actions: s.actions.filter((a) => a.id !== actionId) } : s)),
    )
  }

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "low":
        return "default"
      case "medium":
        return "secondary"
      case "high":
        return "destructive"
      default:
        return "outline"
    }
  }

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId)

  return (
    <div className="space-y-6">
      {/* En-tête du simulateur */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Simulateur Multi-Scénarios ROI</span>
              </CardTitle>
              <CardDescription>
                Créez et comparez plusieurs scénarios à partir de prompts textuels ou de configuration manuelle
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {scenarios.length} scénario{scenarios.length !== 1 ? "s" : ""}
              </Badge>
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prompt" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Prompt Simple</span>
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Prompts Multiples</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Configuration Manuelle</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Créer un Scénario par Prompt</CardTitle>
              <CardDescription>
                Décrivez votre scénario en langage naturel et l'IA générera automatiquement les actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt-input">Décrivez votre scénario</Label>
                <Textarea
                  id="prompt-input"
                  placeholder="Ex: Ajouter 3 nouveaux ATMs à Casablanca près des centres commerciaux
Installer un ATM au quartier Maarif
Nouveau point de vente dans la zone industrielle"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>
              <Button onClick={createScenarioFromPrompt} disabled={!promptInput.trim()} className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Créer Scénario depuis Prompt
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Créer Plusieurs Scénarios</CardTitle>
              <CardDescription>
                Séparez chaque scénario par une ligne vide pour créer plusieurs scénarios simultanément
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="batch-prompts">Scénarios multiples (séparés par ligne vide)</Label>
                <Textarea
                  id="batch-prompts"
                  placeholder="Scénario 1: Expansion Casablanca
Ajouter 2 ATMs dans le centre-ville
Nouveau point près de la gare

Scénario 2: Développement Rabat  
Installer ATM quartier Agdal
Nouveau point zone universitaire

Scénario 3: Optimisation Marrakech
Ajouter ATM médina
Point de vente Gueliz"
                  value={batchPrompts}
                  onChange={(e) => setBatchPrompts(e.target.value)}
                  rows={8}
                  className="mt-1"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={createMultipleScenariosFromPrompts} disabled={!batchPrompts.trim()} className="flex-1">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Créer Scénarios Multiples
                </Button>
                <Button
                  onClick={runAllScenarios}
                  disabled={loading || scenarios.filter((s) => s.status === "draft").length === 0}
                  variant="secondary"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  {loading ? "Simulation..." : "Simuler Tous"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Manuelle</CardTitle>
              <CardDescription>Créez un scénario en ajoutant manuellement des actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!activeScenario && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Sélectionnez un scénario existant ou créez-en un nouveau</p>
                  <Button
                    onClick={() => {
                      const newScenario: Scenario = {
                        id: Date.now().toString(),
                        name: `Scénario Manuel ${scenarios.length + 1}`,
                        prompt: "",
                        actions: [],
                        results: null,
                        status: "draft",
                      }
                      setScenarios([...scenarios, newScenario])
                      setActiveScenarioId(newScenario.id)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Scénario Manuel
                  </Button>
                </div>
              )}

              {activeScenario && (
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Plus className="w-4 h-4 mr-2 text-green-600" />
                    Ajouter un nouvel ATM
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="location-name">Emplacement</Label>
                      <Input
                        id="location-name"
                        placeholder="ex: Centre Commercial Anfa"
                        value={newLocation.name}
                        onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="lat">Latitude</Label>
                        <Input
                          id="lat"
                          type="number"
                          step="0.0001"
                          value={newLocation.latitude}
                          onChange={(e) =>
                            setNewLocation({ ...newLocation, latitude: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="lng">Longitude</Label>
                        <Input
                          id="lng"
                          type="number"
                          step="0.0001"
                          value={newLocation.longitude}
                          onChange={(e) =>
                            setNewLocation({ ...newLocation, longitude: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cost">Coût mensuel (MAD)</Label>
                      <Input
                        id="cost"
                        type="number"
                        value={newLocation.cost}
                        onChange={(e) => setNewLocation({ ...newLocation, cost: Number.parseInt(e.target.value) })}
                      />
                    </div>
                    <Button onClick={addATMAction} className="w-full" disabled={!newLocation.name}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter au scénario
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {scenarios.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scenarios List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scénarios Créés</CardTitle>
                <CardDescription>Cliquez sur un scénario pour le voir en détail</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      activeScenarioId === scenario.id ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setActiveScenarioId(scenario.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{scenario.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            scenario.status === "completed"
                              ? "default"
                              : scenario.status === "running"
                                ? "secondary"
                                : scenario.status === "error"
                                  ? "destructive"
                                  : "outline"
                          }
                          className="text-xs"
                        >
                          {scenario.status === "completed"
                            ? "Terminé"
                            : scenario.status === "running"
                              ? "En cours"
                              : scenario.status === "error"
                                ? "Erreur"
                                : "Brouillon"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeScenario(scenario.id)
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {scenario.actions.length} action{scenario.actions.length !== 1 ? "s" : ""}
                    </p>
                    {scenario.prompt && (
                      <p className="text-xs text-muted-foreground truncate">"{scenario.prompt.substring(0, 60)}..."</p>
                    )}
                    {scenario.status === "draft" && (
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          simulateScenario(scenario.id)
                        }}
                      >
                        <Calculator className="w-3 h-3 mr-1" />
                        Simuler
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Active Scenario Details */}
          <div className="lg:col-span-2 space-y-4">
            {activeScenario ? (
              <>
                {/* Scenario Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>{activeScenario.name}</CardTitle>
                    <CardDescription>
                      {activeScenario.prompt ? `Prompt: "${activeScenario.prompt}"` : "Configuration manuelle"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium">Actions planifiées</h4>
                      {activeScenario.actions.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Aucune action définie.</p>
                      ) : (
                        activeScenario.actions.map((action) => (
                          <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  action.type === "add" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                }`}
                              >
                                {action.type === "add" ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{action.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {action.cost && `Coût: ${action.cost.toLocaleString()} MAD/mois`}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeAction(action.id)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Results */}
                {activeScenario.results && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Résultats de Simulation</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div
                          className={`text-3xl font-bold mb-2 ${
                            activeScenario.results.incremental_roi > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {activeScenario.results.incremental_roi > 0 ? "+" : ""}
                          {activeScenario.results.incremental_roi.toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">ROI Incrémental Net</p>
                        <Badge variant={getRiskBadgeVariant(activeScenario.results.risk_level)}>
                          {activeScenario.results.recommendation}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium">Volume</span>
                          </div>
                          <p className="text-lg font-bold">{activeScenario.results.scenario_volume.toLocaleString()}</p>
                          <p className="text-xs text-green-600">
                            +{activeScenario.results.volume_change.toLocaleString()} (
                            {activeScenario.results.volume_change_percent.toFixed(1)}%)
                          </p>
                        </div>

                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <DollarSign className="w-4 h-4 text-success" />
                            <span className="text-sm font-medium">ROI</span>
                          </div>
                          <p className="text-lg font-bold">{activeScenario.results.scenario_roi.toFixed(1)}%</p>
                          <p className="text-xs text-green-600">+{activeScenario.results.roi_change.toFixed(1)} pts</p>
                        </div>

                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Couverture</span>
                          </div>
                          <p className="text-lg font-bold">
                            +{activeScenario.results.coverage_improvement.toFixed(1)}%
                          </p>
                        </div>

                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-warning" />
                            <span className="text-sm font-medium">Cannibalisation</span>
                          </div>
                          <p className="text-lg font-bold">{activeScenario.results.cannibalisation_rate}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calculator className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Sélectionnez un Scénario</h3>
                  <p className="text-muted-foreground">
                    Choisissez un scénario dans la liste pour voir ses détails et résultats.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
