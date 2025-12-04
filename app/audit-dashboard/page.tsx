import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "API-Factory Audit Dashboard",
  description: "Comprehensive API audit dashboard for system health, compliance, and risk management",
}

interface SystemHealthItem {
  component: string
  status: string
  notes: string
}

interface ComplianceItem {
  tier: string
  apis: string[]
  regulations: string[]
}

interface RiskItem {
  area: string
  status: string
  notes: string
}

interface Recommendation {
  priority: number
  recommendation: string
  description: string
}

interface DashboardData {
  systemHealth: SystemHealthItem[]
  complianceOverview: ComplianceItem[]
  regulatoryAlignment: {
    civilService: string
    federalAI: string
  }
  riskRegister: RiskItem[]
  deploymentNotes: {
    averageTimeToLaunch: string
    multiApiSupport: string
    developerExperience: string
  }
  strategicRecommendations: Recommendation[]
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "operational":
    case "active":
    case "mitigated":
      return "✅"
    case "partial":
      return "⚠️"
    default:
      return "❌"
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "operational":
    case "active":
    case "mitigated":
      return "text-green-600 dark:text-green-400"
    case "partial":
      return "text-yellow-600 dark:text-yellow-400"
    default:
      return "text-red-600 dark:text-red-400"
  }
}

async function getDashboardData(): Promise<DashboardData> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/audit-dashboard`, { cache: "no-store" })

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard data")
  }

  return (await res.json()) as DashboardData
}

export default async function AuditDashboard() {
  const data = await getDashboardData()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">API-Factory Audit Dashboard</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Comprehensive system health, compliance, and operational metrics
          </p>
        </div>

        <div className="space-y-8">
          {/* System Health */}
          <section className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">1. System Health</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      System Component
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.systemHealth.map((item, index) => (
                    <tr key={index} className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                      <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {item.component}
                      </th>
                      <td className={`px-6 py-4 ${getStatusColor(item.status)}`}>
                        <span className="flex items-center gap-2">
                          <span>{getStatusIcon(item.status)}</span>
                          <span className="capitalize">{item.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Compliance Overview */}
          <section className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">2. Compliance Overview</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Tier
                    </th>
                    <th scope="col" className="px-6 py-3">
                      APIs Included
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Regulations / Standards Covered
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.complianceOverview.map((item, index) => (
                    <tr key={index} className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                      <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {item.tier}
                      </th>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {item.apis.map((api, apiIndex) => (
                            <span
                              key={apiIndex}
                              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            >
                              {api}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {item.regulations.map((reg, regIndex) => (
                            <span
                              key={regIndex}
                              className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200"
                            >
                              {reg}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Regulatory Alignment */}
          <section className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">3. Regulatory Alignment</h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Civil Service (Internal HR for U.S. Federal Work)
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{data.regulatoryAlignment.civilService}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Federal AI & Tech Strategy</h3>
                <p className="text-gray-700 dark:text-gray-300">{data.regulatoryAlignment.federalAI}</p>
              </div>
            </div>
          </section>

          {/* Risk Register */}
          <section className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">4. Risk Register Highlights</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Risk Area
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Mitigation Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.riskRegister.map((item, index) => (
                    <tr key={index} className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                      <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {item.area}
                      </th>
                      <td className={`px-6 py-4 ${getStatusColor(item.status)}`}>
                        <span className="flex items-center gap-2">
                          <span>{getStatusIcon(item.status)}</span>
                          <span className="capitalize">{item.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Deployment & Operational Notes */}
          <section className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              5. Deployment & Operational Notes
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Average Time to Launch</h3>
                <p className="text-gray-700 dark:text-gray-300">{data.deploymentNotes.averageTimeToLaunch}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Multi-API Portfolio Support</h3>
                <p className="text-gray-700 dark:text-gray-300">{data.deploymentNotes.multiApiSupport}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Developer Experience</h3>
                <p className="text-gray-700 dark:text-gray-300">{data.deploymentNotes.developerExperience}</p>
              </div>
            </div>
          </section>

          {/* Strategic Recommendations */}
          <section className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">6. Strategic Recommendations</h2>
            <div className="space-y-4">
              {data.strategicRecommendations.map((item, index) => (
                <div key={index} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {item.priority}
                    </span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.recommendation}</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
