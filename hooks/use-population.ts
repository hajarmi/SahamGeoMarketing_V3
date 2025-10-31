"use client"
import { useEffect, useState } from "react"
import type { PopulationListResponse, PopulationPoint } from "@/types"

export function usePopulation(enabled: boolean) {
  const [data, setData] = useState<PopulationPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let abort = false
    if (!enabled) { setData([]); setLoading(false); setError(null); return }
    setLoading(true); setError(null)

    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const url = `${base.replace(/\/$/, "")}/population`

    fetch(url)
      .then(async (r) => {
        if (!r.ok) {
          const msg = await r.text().catch(() => "")
          throw new Error(`HTTP ${r.status}${msg ? ` - ${msg}` : ""}`)
        }
        return r.json()
      })
      .then((json: PopulationListResponse) => { if (!abort) setData(json.population || []) })
      .catch(e => { if (!abort) setError(String(e)) })
      .finally(() => { if (!abort) setLoading(false) })

    return () => { abort = true }
  }, [enabled])

  return { data, loading, error }
}
