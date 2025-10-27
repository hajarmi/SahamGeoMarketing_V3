import { NextResponse } from "next/server"

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search"
const DEFAULT_LIMIT = 5

const baseHeaders = {
  "User-Agent": process.env.NOMINATIM_USER_AGENT ?? "GeoMarketingPro/1.0 (contact@geomarketing.pro)",
  Accept: "application/json",
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Missing 'q' parameter" }, { status: 400 })
  }

  const limit = Number.parseInt(searchParams.get("limit") ?? "", 10)
  const safeLimit = Number.isFinite(limit) && limit > 0 && limit <= 10 ? limit : DEFAULT_LIMIT
  const countrycodes = searchParams.get("countrycodes") ?? "ma"

  const params = new URLSearchParams({
    format: "json",
    addressdetails: "1",
    q: query,
    limit: safeLimit.toString(),
    countrycodes,
  })

  try {
    const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
      headers: baseHeaders,
    })

    if (!response.ok) {
      const message = `Nominatim responded with status ${response.status}`
      console.warn("[api/geocode] Upstream error:", message)
      return NextResponse.json({ error: message }, { status: 502 })
    }

    const payload = await response.json()
    return NextResponse.json({ results: payload })
  } catch (error) {
    console.error("[api/geocode] Fetch failed:", error)
    return NextResponse.json({ error: "Geocoding service unavailable" }, { status: 503 })
  }
}
