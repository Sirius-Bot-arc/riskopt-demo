// Central mock data layer for RiskOpt.
// Shapes here are intentionally close to what a Python/FastAPI backend would
// return, so the UI can later be wired to real endpoints with minimal changes.

export type Severity = "Critical" | "High" | "Medium" | "Low"

export interface Risk {
  id: string
  name: string
  score: number
  severity: Severity
  category: string
  description: string
  affectedAssets: string[]
  contributingFactors: string[]
  recommendedControls: string[] // control ids
  exposure: number // estimated annual loss exposure in INR
  trend: number // change in score vs last assessment
}

export interface Control {
  id: string
  name: string
  cost: number
  riskReduction: number // percentage points of overall risk reduction
  protects: string[]
  description: string
}

export const ORGANIZATIONS = [
  "Acme FinCorp",
  "Northwind Retail",
  "Helix Healthcare",
] as const

export const OVERVIEW = {
  overallRisk: 76,
  overallSeverity: "High" as Severity,
  exposure: 4000000,
  budget: 1000000,
  criticalRisks: 5,
}

export const SEVERITY_ORDER: Severity[] = ["Critical", "High", "Medium", "Low"]

export const RISKS: Risk[] = [
  {
    id: "ransomware",
    name: "Ransomware",
    score: 92,
    severity: "Critical",
    category: "Malware",
    description:
      "Ransomware can disrupt critical systems and make organizational data unavailable, halting operations until recovery or ransom payment.",
    affectedAssets: ["Employee endpoints", "File servers", "Customer database"],
    contributingFactors: ["Unpatched systems", "Weak endpoint protection", "Phishing exposure"],
    recommendedControls: ["edr", "backup", "training"],
    exposure: 1600000,
    trend: 6,
  },
  {
    id: "phishing",
    name: "Phishing",
    score: 84,
    severity: "Critical",
    category: "Social Engineering",
    description:
      "Deceptive emails trick employees into revealing credentials or executing malicious payloads, acting as the entry point for larger breaches.",
    affectedAssets: ["Employee endpoints", "Email gateway", "Identity provider"],
    contributingFactors: ["Low security awareness", "No email filtering", "Reused passwords"],
    recommendedControls: ["training", "mfa"],
    exposure: 900000,
    trend: 3,
  },
  {
    id: "data-leakage",
    name: "Data Leakage",
    score: 71,
    severity: "High",
    category: "Data Loss",
    description:
      "Sensitive customer and business data can be exfiltrated or accidentally exposed through unmonitored channels and misconfigured storage.",
    affectedAssets: ["Customer database", "Cloud storage", "Employee endpoints"],
    contributingFactors: ["No data loss prevention", "Excessive access rights", "Unencrypted exports"],
    recommendedControls: ["dlp", "mfa"],
    exposure: 700000,
    trend: -2,
  },
  {
    id: "credential-theft",
    name: "Credential Theft",
    score: 68,
    severity: "High",
    category: "Identity",
    description:
      "Stolen credentials let attackers impersonate legitimate users and move laterally across systems without triggering obvious alarms.",
    affectedAssets: ["Identity provider", "VPN", "Admin consoles"],
    contributingFactors: ["No multi-factor auth", "Password reuse", "Phishing exposure"],
    recommendedControls: ["mfa", "training"],
    exposure: 500000,
    trend: 1,
  },
  {
    id: "ddos",
    name: "DDoS",
    score: 32,
    severity: "Medium",
    category: "Network",
    description:
      "Distributed denial-of-service floods overwhelm public-facing services, causing downtime and degraded customer experience.",
    affectedAssets: ["Public web app", "API gateway", "DNS"],
    contributingFactors: ["Limited edge capacity", "No traffic scrubbing", "Flat network design"],
    recommendedControls: ["firewall"],
    exposure: 180000,
    trend: -4,
  },
  {
    id: "insider-threat",
    name: "Insider Threat",
    score: 54,
    severity: "Medium",
    category: "Identity",
    description:
      "Employees or contractors with legitimate access may intentionally or accidentally cause data loss or system compromise.",
    affectedAssets: ["Customer database", "Cloud storage", "HR systems"],
    contributingFactors: ["Excessive access rights", "No activity monitoring", "Weak offboarding"],
    recommendedControls: ["dlp", "mfa"],
    exposure: 320000,
    trend: 0,
  },
  {
    id: "malware",
    name: "Malware Infection",
    score: 61,
    severity: "High",
    category: "Malware",
    description:
      "Malicious software spreads across endpoints and servers, enabling data theft, surveillance, and further compromise.",
    affectedAssets: ["Employee endpoints", "File servers"],
    contributingFactors: ["Unpatched systems", "Weak endpoint protection"],
    recommendedControls: ["edr", "firewall"],
    exposure: 420000,
    trend: 2,
  },
  {
    id: "account-takeover",
    name: "Account Takeover",
    score: 47,
    severity: "Medium",
    category: "Identity",
    description:
      "Attackers gain full control of user accounts through stolen credentials or session hijacking, bypassing perimeter defenses.",
    affectedAssets: ["Identity provider", "Customer portal"],
    contributingFactors: ["No multi-factor auth", "Weak session controls"],
    recommendedControls: ["mfa", "training"],
    exposure: 280000,
    trend: -1,
  },
]

export const CONTROLS: Control[] = [
  {
    id: "edr",
    name: "EDR",
    cost: 400000,
    riskReduction: 25,
    protects: ["Ransomware", "Malware", "Endpoint Compromise"],
    description:
      "Endpoint Detection & Response continuously monitors devices for malicious behavior and enables rapid containment of threats.",
  },
  {
    id: "mfa",
    name: "MFA",
    cost: 200000,
    riskReduction: 15,
    protects: ["Credential Theft", "Phishing", "Account Takeover"],
    description:
      "Multi-Factor Authentication adds a second verification step, drastically reducing the impact of stolen passwords.",
  },
  {
    id: "backup",
    name: "Backup Upgrade",
    cost: 300000,
    riskReduction: 20,
    protects: ["Ransomware", "Data Loss"],
    description:
      "Immutable, frequently tested backups ensure fast recovery from ransomware and destructive incidents without paying a ransom.",
  },
  {
    id: "training",
    name: "Employee Training",
    cost: 100000,
    riskReduction: 12,
    protects: ["Phishing", "Social Engineering"],
    description:
      "Security awareness training reduces human-driven incidents by helping staff recognize and report social engineering attempts.",
  },
  {
    id: "dlp",
    name: "DLP",
    cost: 400000,
    riskReduction: 16,
    protects: ["Data Leakage"],
    description:
      "Data Loss Prevention inspects and controls data in motion and at rest to stop sensitive information from leaving the organization.",
  },
  {
    id: "firewall",
    name: "Firewall Upgrade",
    cost: 500000,
    riskReduction: 18,
    protects: ["Network Attacks", "DDoS"],
    description:
      "A next-generation firewall inspects traffic at the network edge, filtering malicious flows and mitigating volumetric attacks.",
  },
]

export type Objective = "max-reduction" | "best-value" | "balanced"

export interface OptimizationResult {
  controlIds: string[]
  totalInvestment: number
  expectedReduction: number
  riskBefore: number
  riskAfter: number
  exposureBefore: number
  exposureAfter: number
}

// Mock optimizer output. A real backend would compute this via a knapsack-style
// optimization over the controls given the objective and budget.
export const OPTIMIZATION_RESULTS: Record<Objective, OptimizationResult> = {
  "max-reduction": {
    controlIds: ["edr", "backup", "mfa", "training"],
    totalInvestment: 1000000,
    expectedReduction: 72,
    riskBefore: 76,
    riskAfter: 21,
    exposureBefore: 4000000,
    exposureAfter: 1100000,
  },
  "best-value": {
    controlIds: ["mfa", "training", "backup"],
    totalInvestment: 600000,
    expectedReduction: 47,
    riskBefore: 76,
    riskAfter: 40,
    exposureBefore: 4000000,
    exposureAfter: 2100000,
  },
  balanced: {
    controlIds: ["edr", "mfa", "training"],
    totalInvestment: 700000,
    expectedReduction: 52,
    riskBefore: 76,
    riskAfter: 36,
    exposureBefore: 4000000,
    exposureAfter: 1900000,
  },
}

export const OBJECTIVES: { id: Objective; label: string; description: string }[] = [
  {
    id: "max-reduction",
    label: "Maximum Risk Reduction",
    description: "Spend the full budget to remove as much risk as possible.",
  },
  {
    id: "best-value",
    label: "Best Value for Money",
    description: "Maximize risk reduced per rupee, spending only what pays off.",
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Blend strong risk reduction with efficient spending.",
  },
]

export const RECENT_CHANGES = [
  { risk: "Ransomware", change: 6, note: "New exploit campaign observed" },
  { risk: "Phishing", change: 3, note: "Spike in credential-harvesting emails" },
  { risk: "DDoS", change: -4, note: "Edge capacity increased" },
  { risk: "Data Leakage", change: -2, note: "Storage buckets re-secured" },
]

export const RISK_TREND = [
  { month: "Mar", score: 81 },
  { month: "Apr", score: 79 },
  { month: "May", score: 83 },
  { month: "Jun", score: 80 },
  { month: "Jul", score: 78 },
  { month: "Aug", score: 76 },
]

// Helpers ------------------------------------------------------------------

export function getControl(id: string): Control | undefined {
  return CONTROLS.find((c) => c.id === id)
}

export function getRisk(id: string): Risk | undefined {
  return RISKS.find((r) => r.id === id)
}

export function severityDistribution() {
  const counts: Record<Severity, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 }
  for (const r of RISKS) counts[r.severity]++
  return counts
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

// Compact Indian format e.g. ₹40L, ₹1.6Cr
export function formatINRShort(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(value % 10000000 === 0 ? 0 : 1)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
  return `₹${value}`
}
