"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const LeafletMap = dynamic(() => import("./leaflet-map-client"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full rounded-lg bg-gray-900 flex items-center justify-center"
      style={{ minHeight: "500px" }}
    >
      <div className="text-white">Chargement de la carte...</div>
    </div>
  ),
})

interface MapboxMapProps {
  activeLayers: {
    population: boolean
    competitors: boolean
    pois: boolean
    coverage: boolean
  }
  simulationMode: boolean
  onLocationSelect: (location: { lng: number; lat: number; address?: string }) => void
  selectedATM?: any | null
  onATMSelect?: (atm: any) => void
}

export default function MapboxMap({
  activeLayers,
  simulationMode,
  onLocationSelect,
  selectedATM,
  onATMSelect,
}: MapboxMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div
        className="w-full h-full rounded-lg bg-gray-900 flex items-center justify-center"
        style={{ minHeight: "500px" }}
      >
        <div className="text-white">Chargement de la carte...</div>
      </div>
    )
  }

  return (
    <LeafletMap
      activeLayers={activeLayers}
      simulationMode={simulationMode}
      onLocationSelect={onLocationSelect}
      selectedATM={selectedATM}
      onATMSelect={onATMSelect}
    />
  )
}
