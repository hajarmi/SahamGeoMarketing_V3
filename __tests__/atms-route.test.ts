/** @jest-environment node */

import { GET } from "@/app/api/atms/route"

describe("GET /api/atms", () => {
  beforeEach(() => {
    delete process.env.BACKEND_API_URL
  })

  it("serves the local dataset with metadata when backend is unavailable", async () => {
    const response = await GET()
    expect(response.status).toBe(200)

    const payload = await response.json()

    expect(Array.isArray(payload.atms)).toBe(true)
    expect(payload.atms.length).toBeGreaterThan(0)

    expect(payload).toHaveProperty("metadata")
    expect(payload.metadata.source).toBe("local")
    expect(typeof payload.metadata.generated_at).toBe("string")
  })
})
