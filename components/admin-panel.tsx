"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Database,
  Brain,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  Shield,
  BarChart3,
  Clock,
} from "lucide-react"

interface SystemStatus {
  ml_model_version: string
  ml_model_accuracy: number
  last_training: string
  data_freshness: number
  api_health: "healthy" | "warning" | "error"
  total_predictions: number
  avg_response_time: number
}

interface DataSource {
  name: string
  type: string
  last_update: string
  status: "active" | "inactive" | "error"
  records: number
}

export default function AdminPanel() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    ml_model_version: "v2.3.1",
    ml_model_accuracy: 87.5,
    last_training: "2024-01-15",
    data_freshness: 95,
    api_health: "healthy",
    total_predictions: 1247,
    avg_response_time: 245,
  })

  const [dataSources] = useState<DataSource[]>([
    {
      name: "Transactions ATM",
      type: "Base interne",
      last_update: "2024-01-20 08:30",
      status: "active",
      records: 125000,
    },
    {
      name: "Données démographiques",
      type: "HCP/INSEE",
      last_update: "2024-01-18 14:20",
      status: "active",
      records: 45000,
    },
    {
      name: "Points d'intérêt",
      type: "OpenStreetMap",
      last_update: "2024-01-19 22:15",
      status: "active",
      records: 8500,
    },
    {
      name: "Données concurrence",
      type: "Precisely",
      last_update: "2024-01-17 16:45",
      status: "warning",
      records: 2100,
    },
  ])

  const [modelConfig, setModelConfig] = useState({
    cannibalisation_weight: 0.3,
    distance_threshold: 500,
    population_weight: 0.4,
    competition_weight: 0.2,
    auto_retrain: true,
    prediction_confidence: 0.85,
  })

  const retrainModel = async () => {
    console.log("[v0] Starting model retraining...")
    // Simulation du réentraînement
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setSystemStatus((prev) => ({
      ...prev,
      ml_model_accuracy: 89.2,
      last_training: new Date().toISOString().split("T")[0],
    }))
    console.log("[v0] Model retraining completed")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "active":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
      case "inactive":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
      case "active":
        return "default"
      case "warning":
        return "secondary"
      case "error":
      case "inactive":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête administration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Configuration & Administration</span>
          </CardTitle>
          <CardDescription>Gestion des modèles IA, sources de données et paramètres système</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="system" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system">Système</TabsTrigger>
          <TabsTrigger value="data">Données</TabsTrigger>
          <TabsTrigger value="models">Modèles IA</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
        </TabsList>

        {/* Onglet Système */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* État du système */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>État du Système</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Santé API</span>
                  <Badge variant={getStatusBadge(systemStatus.api_health)}>
                    {systemStatus.api_health === "healthy" ? "Opérationnel" : "Problème"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Temps de réponse moyen</span>
                  <span className="font-bold">{systemStatus.avg_response_time}ms</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Prédictions totales</span>
                  <span className="font-bold">{systemStatus.total_predictions.toLocaleString()}</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fraîcheur des données</span>
                    <span className="font-bold">{systemStatus.data_freshness}%</span>
                  </div>
                  <Progress value={systemStatus.data_freshness} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Monitoring</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">Prédictions/jour</p>
                    <p className="text-2xl font-bold text-foreground">156</p>
                    <p className="text-xs text-green-600">+12% vs hier</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">Erreur MAPE</p>
                    <p className="text-2xl font-bold text-foreground">12.5%</p>
                    <p className="text-xs text-muted-foreground">Stable</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Alertes Système</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Tous les services opérationnels</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span>Données concurrence à actualiser</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Données */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Sources de Données</span>
              </CardTitle>
              <CardDescription>Gestion et monitoring des sources de données alimentant les modèles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          source.status === "active"
                            ? "bg-green-100 text-green-600"
                            : source.status === "warning"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
                        }`}
                      >
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{source.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {source.type} • {source.records.toLocaleString()} enregistrements
                        </p>
                        <p className="text-xs text-muted-foreground">Dernière MAJ: {source.last_update}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge variant={getStatusBadge(source.status)}>
                        {source.status === "active" ? "Actif" : source.status === "warning" ? "Attention" : "Erreur"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Importer Données
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Modèles IA */}
        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Modèle de Prédiction</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Version actuelle</span>
                  <Badge variant="default">{systemStatus.ml_model_version}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Précision (RMSE)</span>
                  <span className="font-bold">{systemStatus.ml_model_accuracy}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Dernier entraînement</span>
                  <span className="font-bold">{systemStatus.last_training}</span>
                </div>

                <Progress value={systemStatus.ml_model_accuracy} className="h-2" />

                <Separator />

                <Button onClick={retrainModel} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réentraîner le Modèle
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres du Modèle</CardTitle>
                <CardDescription>Configuration des poids et seuils</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label>Poids cannibalisation: {modelConfig.cannibalisation_weight}</Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={modelConfig.cannibalisation_weight}
                      onChange={(e) =>
                        setModelConfig({
                          ...modelConfig,
                          cannibalisation_weight: Number.parseFloat(e.target.value),
                        })
                      }
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <Label>Seuil distance (m): {modelConfig.distance_threshold}</Label>
                    <input
                      type="range"
                      min="100"
                      max="1000"
                      step="50"
                      value={modelConfig.distance_threshold}
                      onChange={(e) =>
                        setModelConfig({
                          ...modelConfig,
                          distance_threshold: Number.parseInt(e.target.value),
                        })
                      }
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <Label>Poids population: {modelConfig.population_weight}</Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={modelConfig.population_weight}
                      onChange={(e) =>
                        setModelConfig({
                          ...modelConfig,
                          population_weight: Number.parseFloat(e.target.value),
                        })
                      }
                      className="w-full mt-1"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-retrain">Réentraînement automatique</Label>
                  <Switch
                    id="auto-retrain"
                    checked={modelConfig.auto_retrain}
                    onCheckedChange={(checked) =>
                      setModelConfig({
                        ...modelConfig,
                        auto_retrain: checked,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Utilisateurs */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Gestion des Utilisateurs</span>
              </CardTitle>
              <CardDescription>Contrôle d'accès et rôles utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="font-semibold">Administrateurs</p>
                      <p className="text-2xl font-bold text-foreground">3</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="w-8 h-8 text-accent mx-auto mb-2" />
                      <p className="font-semibold">Analystes</p>
                      <p className="text-2xl font-bold text-foreground">12</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
                      <p className="font-semibold">Managers</p>
                      <p className="text-2xl font-bold text-foreground">5</p>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Utilisateurs Actifs</h4>
                  <div className="space-y-2">
                    {[
                      { name: "Ahmed Benali", role: "Administrateur", lastLogin: "Il y a 2h" },
                      { name: "Fatima Zahra", role: "Analyste", lastLogin: "Il y a 1j" },
                      { name: "Mohamed Alami", role: "Manager", lastLogin: "Il y a 3h" },
                    ].map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{user.lastLogin}</p>
                          <Badge variant="outline" className="text-xs">
                            Actif
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  <Users className="w-4 h-4 mr-2" />
                  Gérer les Utilisateurs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
