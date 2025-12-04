import { describe, expect, it } from "vitest"
import { GET } from "./route"

describe("Audit Dashboard API", () => {
  it("should return dashboard data with correct structure", async () => {
    const response = await GET()
    const data = await response.json()

    expect(data).toHaveProperty("systemHealth")
    expect(data).toHaveProperty("complianceOverview")
    expect(data).toHaveProperty("regulatoryAlignment")
    expect(data).toHaveProperty("riskRegister")
    expect(data).toHaveProperty("deploymentNotes")
    expect(data).toHaveProperty("strategicRecommendations")
  })

  it("should return system health with 5 components", async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.systemHealth).toHaveLength(5)
    expect(data.systemHealth[0]).toHaveProperty("component")
    expect(data.systemHealth[0]).toHaveProperty("status")
    expect(data.systemHealth[0]).toHaveProperty("notes")
  })

  it("should return compliance overview with 3 tiers", async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.complianceOverview).toHaveLength(3)
    expect(data.complianceOverview[0]).toHaveProperty("tier")
    expect(data.complianceOverview[0]).toHaveProperty("apis")
    expect(data.complianceOverview[0]).toHaveProperty("regulations")
  })

  it("should return risk register with 4 items", async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.riskRegister).toHaveLength(4)
    expect(data.riskRegister[0]).toHaveProperty("area")
    expect(data.riskRegister[0]).toHaveProperty("status")
    expect(data.riskRegister[0]).toHaveProperty("notes")
  })

  it("should return strategic recommendations with 5 items", async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.strategicRecommendations).toHaveLength(5)
    expect(data.strategicRecommendations[0]).toHaveProperty("priority")
    expect(data.strategicRecommendations[0]).toHaveProperty("recommendation")
    expect(data.strategicRecommendations[0]).toHaveProperty("description")
  })

  it("should return regulatory alignment with civil service and federal AI info", async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.regulatoryAlignment).toHaveProperty("civilService")
    expect(data.regulatoryAlignment).toHaveProperty("federalAI")
    expect(data.regulatoryAlignment.civilService).toContain("5 CFR Part 315")
    expect(data.regulatoryAlignment.federalAI).toContain("U.S. AI Action Plan")
  })

  it("should return deployment notes with all required fields", async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.deploymentNotes).toHaveProperty("averageTimeToLaunch")
    expect(data.deploymentNotes).toHaveProperty("multiApiSupport")
    expect(data.deploymentNotes).toHaveProperty("developerExperience")
  })
})
