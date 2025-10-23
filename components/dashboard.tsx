"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, MapPin, Target, DollarSign, Activity } from "lucide-react"

interface DashboardData {
  summary: {
    total_atms: number
    total_monthly_volume: number
    average_volume_per_atm: number
    network_roi: number
    coverage_rate: number
  }
  performance_trend: Array<{
    month: string
    volume: number
    roi: number
  }>
  opportunity_zones: Array<{
    zone: string
    score: number
    potential_volume: number
    competition_level: string
    priority: string
  }>
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/analytics/dashboard")
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
        console.log("[v0] Dashboard data loaded successfully:", dashboardData)
      } else {
        console.error("[v0] Failed to fetch dashboard data:", response.status)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Impossible de charger les données du tableau de bord</p>
        </CardContent>
      </Card>
    )
  }

  const priorityColors = {
    Haute: "#ef4444",
    Moyenne: "#f59e0b",
    Faible: "#10b981",
  }

  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ATMs Actifs</p>
                <p className="text-2xl font-bold text-foreground">{data.summary.total_atms}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Volume Mensuel</p>
                <p className="text-2xl font-bold text-foreground">
                  {(data.summary.total_monthly_volume / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-accent" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8.5% vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ROI Réseau</p>
                <p className="text-2xl font-bold text-foreground">{data.summary.network_roi}%</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+2.1 pts</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Couverture</p>
                <p className="text-2xl font-bold text-foreground">{data.summary.coverage_rate}%</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={data.summary.coverage_rate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Volumes</CardTitle>
            <CardDescription>Volume mensuel des transactions (en milliers)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.performance_trend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance ROI</CardTitle>
            <CardDescription>Évolution du retour sur investissement (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.performance_trend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="roi"
                  stroke="hsl(var(--accent))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Zones d'opportunité */}
      <Card>
        <CardHeader>
          <CardTitle>Zones d'Opportunité Prioritaires</CardTitle>
          <CardDescription>Emplacements recommandés pour de nouveaux ATMs basés sur l'analyse IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.opportunity_zones.map((zone, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{zone.zone}</h4>
                    <p className="text-sm text-muted-foreground">
                      Volume potentiel: {zone.potential_volume} retraits/mois
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">Score: {zone.score}/100</p>
                    <Progress value={zone.score} className="w-20 h-2" />
                  </div>

                  <Badge
                    variant="outline"
                    style={{
                      borderColor: priorityColors[zone.priority as keyof typeof priorityColors],
                      color: priorityColors[zone.priority as keyof typeof priorityColors],
                    }}
                  >
                    {zone.priority}
                  </Badge>

                  <Badge variant="secondary">Concurrence {zone.competition_level}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
