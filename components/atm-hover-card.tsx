"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Activity,
  Wifi,
  Banknote,
  Clock,
  TrendingUp,
  Building2,
  Smartphone,
  Users,
} from "lucide-react"

import { ATM } from "@/types"

interface ATMHoverCardProps {
  atm: (Partial<ATM> & { marketShare?: number; brand?: string; densite_norm?: number; densite?: number; type?: string }) | null
  position: { x: number; y: number }
  visible: boolean
}

export default function ATMHoverCard({ atm, position, visible }: ATMHoverCardProps) {
  if (!visible || !atm) return null

  const getPerformanceColor = (performance?: number) => {
    if (performance == null) return "#6b7280"
    if (performance >= 90) return "#10b981"
    if (performance >= 80) return "#f59e0b"
    return "#ef4444"
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Connecté":
      case "Optimal":
        return "bg-green-100 text-green-800"
      case "Instable":
      case "Bon":
        return "bg-yellow-100 text-yellow-800"
      case "Faible":
        return "bg-orange-100 text-orange-800"
      case "Déconnecté":
      case "Critique":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getBankColor = (bankName?: string) => {
    switch (bankName) {
      case "Attijariwafa Bank":
        return "bg-red-100 text-red-800"
      case "Banque Populaire":
        return "bg-blue-100 text-blue-800"
      case "BMCE Bank":
        return "bg-green-100 text-green-800"
      case "CIH Bank":
        return "bg-purple-100 text-purple-800"
      case "BMCI":
        return "bg-orange-100 text-orange-800"
      case "Crédit du Maroc":
        return "bg-teal-100 text-teal-800"
      case "Al Barid Bank":
        return "bg-yellow-100 text-yellow-800"
      case "Société Générale Maroc":
        return "bg-indigo-100 text-indigo-800"
      case "Crédit Agricole du Maroc":
        return "bg-lime-100 text-lime-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // --- Détection d'un point "Population" (couche densité)
  const p = atm as any
  const isPopulation =
    typeof p?.densite_norm === "number" || typeof p?.densite === "number"

  // Score unifié : pour Population => densite_norm * 100, sinon logique ATM habituelle
  const volume = atm.monthly_volume || (atm as any).dailyTransactions || (atm as any).footTraffic || 0
  const performanceScore = isPopulation
    ? Math.max(0, Math.min(100, Math.round((p?.densite_norm ?? 0) * 100)))
    : (atm as any).performance ||
      (volume > 1200 ? 90 : volume > 900 ? 75 : volume > 60 ? 60 : 50)

  return (
    <div
      className="fixed z-[99999] pointer-events-none"
      style={{
        left: `${position.x + 15}px`,
        top: `${position.y - 10}px`,
        transform:
          typeof window !== "undefined" && position.x > window.innerWidth - 340
            ? "translateX(-100%) translateX(-15px)"
            : "none",
      }}
    >
      <Card className="w-80 shadow-lg border bg-white/95 backdrop-blur-sm">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: getPerformanceColor(performanceScore) }}
              />
              <div>
                <h3 className="font-semibold text-sm text-gray-900 leading-tight">
                  {(atm as any).name || atm.id}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {(atm as any).bank_name || (atm as any).brand ? (
                    <Badge variant="outline" className={`text-xs ${getBankColor((atm as any).bank_name)}`}>
                      {(atm as any).bank_name || (atm as any).brand}
                    </Badge>
                  ) : null}
                  {(atm as any).installation_type && (
                    <Badge variant="outline" className="text-xs bg-slate-100 text-slate-700">
                      {(atm as any).installation_type === "portable" ? (
                        <>
                          <Smartphone className="w-3 h-3 mr-1" />
                          Portable
                        </>
                      ) : (
                        <>
                          <Building2 className="w-3 h-3 mr-1" />
                          Fixe
                        </>
                      )}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-lg font-bold"
                style={{ color: getPerformanceColor(performanceScore) }}
              >
                {performanceScore}%
              </div>
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: `${getPerformanceColor(performanceScore)}20`,
                  color: getPerformanceColor(performanceScore),
                }}
              >
                {isPopulation
                  ? "Densité"
                  : (atm as any).type === "competitor"
                  ? "Concurrent"
                  : (atm as any).type === "poi"
                  ? "POI"
                  : performanceScore >= 90
                  ? "Excellent"
                  : performanceScore >= 80
                  ? "Bon"
                  : "Faible"}
              </Badge>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {!isPopulation && (
              <>
                {((atm as any).monthly_volume || (atm as any).dailyTransactions || (atm as any).footTraffic) && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600 font-medium">
                        {(atm as any).footTraffic ? "Fréquentation" : "Volume"}
                      </p>
                      <p className="text-sm font-bold text-blue-800">
                        {(atm as any).monthly_volume
                          ? `${(atm as any).monthly_volume}/mois`
                          : (atm as any).dailyTransactions
                          ? `${(atm as any).dailyTransactions}/jour`
                          : (atm as any).footTraffic
                          ? `${(atm as any).footTraffic}/jour`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                {(atm as any).uptime && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <Activity className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-xs text-green-600 font-medium">Uptime</p>
                      <p className="text-sm font-bold text-green-800">{(atm as any).uptime}</p>
                    </div>
                  </div>
                )}

                {(atm as any).roi && (
                  <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                    <Banknote className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-xs text-purple-600 font-medium">ROI</p>
                      <p className="text-sm font-bold text-purple-800">{(atm as any).roi.toFixed(1)}%</p>
                    </div>
                  </div>
                )}

                {(atm as any).marketShare && (
                  <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs text-indigo-600 font-medium">Part marché</p>
                      <p className="text-sm font-bold text-indigo-800">{(atm as any).marketShare}%</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {isPopulation && (
              <div className="col-span-2 p-2 bg-amber-50 rounded-lg">
                <div className="text-xs text-amber-700 font-medium">Densité de population</div>
                <div className="text-sm font-bold text-amber-900">
                  {(Number(p?.densite_norm || 0) * 100).toFixed(1)} %
                  {typeof p?.densite === "number" && (
                    <span className="ml-2 font-normal">
                      ({p.densite.toLocaleString("fr-FR")} hab/km²)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status Indicators */}
          {!isPopulation && (
            <div className="space-y-2 mb-3">
              {(atm as any).cashLevel && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    <Banknote className="w-3 h-3" />
                    Liquidité:
                  </span>
                  <Badge variant="outline" className={`text-xs ${getStatusColor((atm as any).cashLevel)}`}>
                    {(atm as any).cashLevel}
                  </Badge>
                </div>
              )}

              {(atm as any).networkStatus && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    Réseau:
                  </span>
                  <Badge variant="outline" className={`text-xs ${getStatusColor((atm as any).networkStatus)}`}>
                    {(atm as any).networkStatus}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Services */}
          {!isPopulation && (atm as any).services && (atm as any).services.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">Services:</p>
              <div className="flex flex-wrap gap-1">
                {(atm as any).services.map((service: string) => (
                  <Badge key={service} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Location Information */}
          {!isPopulation && ((atm as any).address || (atm as any).branch_location) && (
            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg mb-3">
              <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {(atm as any).branch_location || (atm as any).address}
                </p>
                {(atm as any).branch_location && (atm as any).address && (
                  <p className="text-xs text-gray-500 mt-1">{(atm as any).address}</p>
                )}
              </div>
            </div>
          )}

          {/* Last Maintenance */}
          {!isPopulation && (atm as any).lastMaintenance && (
            <div className="flex justify-between items-center text-xs text-gray-600 border-t pt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Maintenance:
              </span>
              <span className="font-medium">
                {new Date((atm as any).lastMaintenance).toLocaleDateString("fr-FR")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
