# ClaimGuard AI — RCM Denial Prediction Platform

A healthcare Revenue Cycle Management (RCM) demo application that uses AI agents to predict and prevent claims denials **before submission**.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Application Walkthrough](#application-walkthrough)
- [Configuring Sample Data](#configuring-sample-data)
  - [Organization Settings](#1-organization-settings)
  - [Adding / Editing Payers](#2-adding--editing-payers)
  - [Adding / Editing Providers](#3-adding--editing-providers)
  - [Adding / Editing Patients](#4-adding--editing-patients)
  - [Adding / Editing Claims](#5-adding--editing-claims)
  - [Denial Trend Chart Data](#6-denial-trend-chart-data)
  - [Top Denial Reasons](#7-top-denial-reasons)
- [AI Agents](#ai-agents)
- [Risk Level Reference](#risk-level-reference)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)

---

## Overview

ClaimGuard AI demonstrates a multi-persona RCM workflow with six AI agents that analyze claims and predict denial risk before a claim is submitted to a payer.

### Key Features

| Feature | Description |
|---|---|
| **Denial Prediction Agent** | Scores each claim 0–100 for denial likelihood using historical patterns |
| **Corrective Actions** | AI prescribes prioritized, owner-assigned actions to reduce denial risk |
| **6 AI Agents** | Demographics, Eligibility, Clinical Doc, Medical Coding, Charge Review, Denial Prediction |
| **3 Personas** | Denial Analyst · Claims Intake Specialist · Medical Coder |
| **Configurable Data** | All dummy data lives in one file — no database required |

---

## Prerequisites

- **Node.js** v18 or later — [nodejs.org](https://nodejs.org)
- **npm** v9 or later (comes with Node.js)

Verify your versions:

```bash
node --version   # should be >= 18
npm --version    # should be >= 9
```

---

## Quick Start

```bash
# 1. Clone or navigate to the project directory
cd c:/dev/himms-video

# 2. Install dependencies (first time only)
npm install

# 3. Start the development server
npm run dev
```

Open your browser to **http://localhost:5173** (Vite default port).

### Other Commands

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

---

## Application Walkthrough

### Step 1 — Select a Persona

The login page presents three role cards. Click any to enter the application:

| Persona | Name | Primary Use |
|---|---|---|
| **Claims Intake Specialist** | Marcus Johnson | Review claim queue, monitor agent pipeline |
| **Denial Analyst** | Sarah Chen | Analyze risk, review predictions, assign corrective actions |
| **Medical Coder** | Priya Patel, CPC | Fix coding flags, review CPT/ICD-10 issues |

### Step 2 — Explore the Dashboard

Each persona sees a role-specific dashboard:

- **Denial Analyst** — KPI cards, denial trend chart, risk distribution donut, top denial reasons bar chart, high-risk claims table, live agent activity feed
- **Claims Intake** — Processing pipeline visualization, weekly volume chart, claims queue
- **Medical Coder** — Coding accuracy radar, productivity chart, AI-flagged coding issues

### Step 3 — Review a Claim

Click **Review →** on any claim to open the **Claim Detail** page. It contains:

- **6 tabbed agent panels** — each showing the agent's score, findings, and analysis details
- **Denial Prediction tab** (default) — risk gauge, primary predicted denial reason, weighted factor bars
- **Corrective Actions sidebar** (sticky) — prioritized action cards with owner, estimated time, and risk-reduction impact

### Step 4 — Work Corrective Actions

Each corrective action has a status dropdown: **Pending → In Progress → Completed**. The sidebar tracks overall progress and shows the projected risk score if all actions are completed.

---

## Configuring Sample Data

**All sample data is defined in a single file:**

```
src/data/config.ts
```

Edit this file to customize everything — no restart required with `npm run dev` (hot reload applies automatically).

---

### 1. Organization Settings

```typescript
organization: {
  name: "MedCore Health Systems",   // Displayed in sidebar and reports
  shortName: "MedCore",
  address: "1234 Healthcare Blvd, Chicago, IL 60601",
  npi: "1234567890",                // National Provider Identifier
  taxId: "12-3456789",
},
```

---

### 2. Adding / Editing Payers

Each payer object controls how the **Eligibility Agent** and **Denial Prediction Agent** assess risk. The `historicalDenialRate` directly influences risk scoring.

```typescript
payers: [
  {
    id: "PAY-001",                          // Unique ID (referenced by claims)
    name: "BlueCross BlueShield of Illinois",
    shortName: "BCBS IL",                   // Shown in tables/badges
    planType: "PPO",                        // Commercial | Medicare | Medicaid | HMO | PPO | EPO | HDHP
    phone: "1-800-654-7385",
    portalUrl: "https://bcbsil.com/provider",
    historicalDenialRate: 18.4,             // % — affects AI risk scoring
    avgProcessingDays: 21,
    requiresPriorAuthCPTs: ["27447", "22612", "70553"],  // CPTs that trigger PA risk flag
    color: "#1e40af",                       // Badge color in charts
  },
  // Add more payers here...
],
```

**To add a payer:** Copy any existing payer block, give it a new unique `id` (e.g., `"PAY-007"`), and update all fields.

---

### 3. Adding / Editing Providers

```typescript
providers: [
  {
    id: "PRV-001",                          // Unique ID (referenced by claims)
    name: "Dr. Sarah Johnson, MD",
    npi: "1922334455",                      // 10-digit NPI
    specialty: "Orthopedic Surgery",
    facility: "MedCore Orthopedic Center",
    address: "1234 Healthcare Blvd, Suite 300, Chicago, IL 60601",
    taxId: "12-3456789",
    credentialedPayers: ["PAY-001", "PAY-002", "PAY-003"],  // Payer IDs — must match payer objects
  },
  // Add more providers here...
],
```

> **Important:** If a claim's provider is not credentialed with the claim's payer, the Eligibility Agent will flag a high-risk error (as seen in CLM-2025-009).

---

### 4. Adding / Editing Patients

```typescript
patients: [
  {
    id: "PAT-001",                     // Unique ID
    firstName: "Robert",
    lastName: "Martinez",
    dob: "1958-03-14",                 // YYYY-MM-DD format
    gender: "M",                       // "M" or "F"
    memberId: "BCBS0012345678",        // Insurance member ID
    groupNumber: "GRP-7842",
    address: "2847 Oak Street",
    city: "Chicago",
    state: "IL",
    zip: "60615",
    phone: "312-555-0142",
    email: "r.martinez@email.com",
    ssn: "XXX-XX-4521",               // Masked SSN for display
  },
  // Add more patients here...
],
```

---

### 5. Adding / Editing Claims

Claims are the most detailed data objects. Each claim includes inline patient, payer, and provider data (duplicated from the arrays above for self-containment) plus full AI agent results.

**Minimal claim structure:**

```typescript
{
  id: "CLM-2025-011",            // Unique ID used for navigation
  claimNumber: "CLM-2025-011",   // Displayed in UI
  patient: { /* copy from patients array */ },
  payer: { /* copy from payers array */ },
  provider: { /* copy from providers array */ },

  dateOfService: "2025-02-20",   // YYYY-MM-DD
  submissionDueDate: "2025-03-22",
  createdAt: "2025-02-20T08:00:00Z",

  status: "in_review",
  // Options: "new" | "in_review" | "ready_to_submit" | "submitted" | "approved" | "denied"

  priority: "high",
  // Options: "urgent" | "high" | "normal" | "low"

  diagnosisCodes: [
    { code: "M17.11", description: "Primary osteoarthritis, right knee", isPrimary: true },
  ],

  procedureCodes: [
    { cpt: "27447", description: "Total knee arthroplasty", modifier: undefined, units: 1, chargeAmount: 18500.00, requiresPriorAuth: true },
  ],

  totalCharges: 18500.00,
  estimatedReimbursement: 12950.00,
  notes: "Clinical notes for this claim...",

  // ── Denial Prediction Fields ─────────────────────────
  riskScore: 85,               // 0–100 (drives gauge and risk level)
  riskLevel: "critical",       // "low" | "medium" | "high" | "critical"
  predictionConfidence: 92,    // 0–100 — AI model confidence %
  predictedDenialReason: "Prior Authorization Not Obtained",
  alternativeDenialReasons: ["Medical Necessity Not Documented"],

  denialFactors: [
    {
      factor: "Missing Prior Authorization",
      weight: 45,              // 0–100 — contribution to risk score
      impact: "increases",     // "increases" | "decreases" denial risk
      description: "CPT 27447 requires prior auth. None on file.",
      category: "authorization",
      // Categories: "authorization" | "eligibility" | "documentation" | "coding" | "billing" | "medical_necessity"
    },
    // Add more factors...
  ],

  correctiveActions: [
    {
      id: "CA-011-1",
      priority: "high",          // "high" | "medium" | "low"
      category: "Authorization", // "Authorization" | "Documentation" | "Coding" | "Eligibility" | "Billing"
      action: "Obtain Prior Authorization",
      detail: "Submit PA request to payer via Availity portal...",
      responsible: "Clinical Staff",
      // Options: "Clinical Staff" | "Physician" | "Medical Coder" | "Billing Specialist" | "Front Desk"
      riskReduction: 45,         // Percentage points of risk reduction if completed
      status: "pending",         // "pending" | "in_progress" | "completed"
      estimatedTime: "3-5 business days",
    },
    // Add more actions...
  ],

  similarHistoricalCases: 34,   // Shown in the Denial Prediction panel
  historicalDenialRate: 82,     // Historical denial rate for similar cases (%)

  // ── Agent Results ─────────────────────────────────────
  agentResults: {
    demographics: {
      status: "completed",       // "pending" | "processing" | "completed" | "error"
      completedAt: "2025-02-20T08:01:00Z",
      processingMs: 340,
      score: 95,                 // 0–100 agent confidence score
      summary: "Demographics verified. No issues found.",
      findings: [
        { severity: "info", message: "Member ID verified" },
        { severity: "warning", message: "ZIP code mismatch", field: "zip" },
        { severity: "error", message: "Critical issue description", field: "field_name" },
        // severity: "info" | "warning" | "error"
      ],
      details: {
        "Eligibility Status": "Active",
        "Coverage Start": "01/01/2025",
        // Any key-value pairs — displayed in the agent panel
      },
    },
    eligibility: { /* same structure */ },
    clinicalDoc: { /* same structure */ },
    medicalCoding: { /* same structure */ },
    chargeReview: { /* same structure */ },
  },
}
```

---

### 6. Denial Trend Chart Data

Controls the 12-month area chart on the Denial Analyst Dashboard:

```typescript
denialTrend: [
  { month: "Mar '24", actualDenials: 142, predictedDenials: 158, prevented: 0 },
  { month: "Apr '24", actualDenials: 135, predictedDenials: 151, prevented: 0 },
  // ...12 months total
  { month: "Feb '25", actualDenials: 68,  predictedDenials: 104, prevented: 79 },
],
```

| Field | Description |
|---|---|
| `month` | X-axis label |
| `actualDenials` | Claims actually denied that month |
| `predictedDenials` | Claims the AI flagged as at-risk |
| `prevented` | Claims saved by acting on AI recommendations |

---

### 7. Top Denial Reasons

Controls the horizontal bar chart on the Denial Analyst Dashboard:

```typescript
topDenialReasons: [
  { reason: "Prior Auth Not Obtained", count: 234, percentage: 32 },
  { reason: "Medical Necessity",        count: 178, percentage: 24 },
  { reason: "Bundling/Unbundling",      count: 124, percentage: 17 },
  { reason: "Timely Filing",            count: 89,  percentage: 12 },
  { reason: "Credentialing / Network",  count: 67,  percentage: 9  },
  { reason: "Duplicate Claim",          count: 44,  percentage: 6  },
],
```

---

## AI Agents

| Agent | What It Checks | Key Outputs |
|---|---|---|
| **Demographics Agent** | Patient name, DOB, gender, address, member ID vs payer records | Identity mismatches, coverage verification |
| **Eligibility Agent** | Active coverage, prior auth requirements, referrals, plan type | Missing PA, expired auth, network status |
| **Clinical Doc Agent** | Completeness of medical records, imaging reports, operative notes | Missing attachments, documentation gaps |
| **Medical Coding Agent** | CPT/ICD-10 accuracy, modifier validity, NCCI bundling edits | Code mismatches, modifier conflicts, age errors |
| **Charge Review Agent** | Charge amounts vs UCR/fee schedules, payer-specific limits | Above-UCR charges, billing anomalies |
| **Denial Prediction Agent** | All of the above combined + historical denial patterns | Risk score 0–100, primary denial reason, corrective actions |

Each agent produces:
- A **score** (0–100) shown as a badge on the claim detail tabs
- A **summary** paragraph
- Individual **findings** with severity (info / warning / error)
- **Detail key-value pairs** shown in the agent panel

---

## Risk Level Reference

| Level | Score Range | Color | Meaning |
|---|---|---|---|
| **Critical** | 81–100 | Red | Very high likelihood of denial — do not submit without action |
| **High** | 61–80 | Orange | Significant denial risk — review and resolve flagged issues |
| **Medium** | 31–60 | Amber | Moderate risk — review recommended before submission |
| **Low** | 0–30 | Emerald | Low denial risk — likely clean claim |

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| Recharts | 2.x | Charts (area, bar, pie, radar) |
| Lucide React | 0.312 | Icon library |
| clsx | 2.x | Conditional class names |

---

## Project Structure

```
c:/dev/himms-video/
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx                        # React entry point
    ├── App.tsx                         # Root component + page routing
    ├── index.css                       # Global Tailwind styles
    ├── types/
    │   └── index.ts                    # All TypeScript interfaces & types
    ├── data/
    │   └── config.ts                   # ★ ALL CONFIGURABLE DUMMY DATA ★
    ├── context/
    │   └── AppContext.tsx              # Global state (persona, page, claims)
    ├── components/
    │   └── layout/
    │       ├── Sidebar.tsx             # Left navigation
    │       └── Header.tsx             # Top breadcrumb + search bar
    └── pages/
        ├── LoginPage.tsx               # Persona selection screen
        ├── DenialAnalystDashboard.tsx  # Charts + high-risk table
        ├── ClaimsIntakeDashboard.tsx   # Pipeline + queue
        ├── MedicalCoderDashboard.tsx   # Coding metrics + flagged issues
        ├── ClaimDetailPage.tsx         # Agent tabs + corrective actions
        ├── ClaimsListPage.tsx          # Filterable/sortable claims table
        └── SettingsPage.tsx            # Config UI
```

---

## Quick Data Customization Cheatsheet

| What to change | Where |
|---|---|
| Organization name / NPI | `config.ts` → `organization` |
| Payer denial rates | `config.ts` → `payers[].historicalDenialRate` |
| Which CPTs require PA | `config.ts` → `payers[].requiresPriorAuthCPTs` |
| Add a new claim | `config.ts` → `claims[]` — copy an existing claim block |
| Change risk score on a claim | `config.ts` → `claims[].riskScore` + `claims[].riskLevel` |
| Add a corrective action | `config.ts` → `claims[].correctiveActions[]` |
| Update denial trend chart | `config.ts` → `denialTrend[]` |
| Update top denial reasons | `config.ts` → `topDenialReasons[]` |
