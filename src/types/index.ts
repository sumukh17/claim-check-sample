export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ClaimStatus = 'new' | 'in_review' | 'ready_to_submit' | 'submitted' | 'approved' | 'denied';
export type PersonaType = 'denial_analyst' | 'claims_intake' | 'medical_coder';
export type PageType = 'login' | 'dashboard' | 'claims' | 'claim-detail' | 'settings' | 'analytics';
export type AgentStatus = 'pending' | 'processing' | 'completed' | 'error';
export type ActionStatus = 'pending' | 'in_progress' | 'completed';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'M' | 'F';
  memberId: string;
  groupNumber: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  ssn: string;
}

export interface Payer {
  id: string;
  name: string;
  shortName: string;
  planType: 'Commercial' | 'Medicare' | 'Medicaid' | 'HMO' | 'PPO' | 'EPO' | 'HDHP';
  phone: string;
  portalUrl: string;
  historicalDenialRate: number;
  avgProcessingDays: number;
  requiresPriorAuthCPTs: string[];
  color: string;
}

export interface Provider {
  id: string;
  name: string;
  npi: string;
  specialty: string;
  facility: string;
  address: string;
  taxId: string;
  credentialedPayers: string[];
}

export interface DiagnosisCode {
  code: string;
  description: string;
  isPrimary: boolean;
}

export interface ProcedureCode {
  cpt: string;
  description: string;
  modifier?: string;
  units: number;
  chargeAmount: number;
  requiresPriorAuth: boolean;
}

export interface DenialFactor {
  factor: string;
  weight: number;
  impact: 'increases' | 'decreases';
  description: string;
  category: 'authorization' | 'eligibility' | 'documentation' | 'coding' | 'billing' | 'medical_necessity';
}

export interface CorrectiveAction {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'Authorization' | 'Documentation' | 'Coding' | 'Eligibility' | 'Billing';
  action: string;
  detail: string;
  responsible: 'Clinical Staff' | 'Physician' | 'Medical Coder' | 'Billing Specialist' | 'Front Desk';
  riskReduction: number;
  status: ActionStatus;
  estimatedTime: string;
}

export interface AgentFinding {
  severity: 'info' | 'warning' | 'error';
  message: string;
  field?: string;
}

export interface AgentResult {
  status: AgentStatus;
  completedAt: string;
  processingMs: number;
  summary: string;
  score: number;
  findings: AgentFinding[];
  details: Record<string, string | number | boolean>;
}

export interface Claim {
  id: string;
  claimNumber: string;
  patient: Patient;
  payer: Payer;
  provider: Provider;
  dateOfService: string;
  submissionDueDate: string;
  createdAt: string;
  status: ClaimStatus;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  diagnosisCodes: DiagnosisCode[];
  procedureCodes: ProcedureCode[];
  totalCharges: number;
  estimatedReimbursement: number;
  notes: string;
  riskScore: number;
  riskLevel: RiskLevel;
  predictionConfidence: number;
  predictedDenialReason: string;
  alternativeDenialReasons: string[];
  denialFactors: DenialFactor[];
  correctiveActions: CorrectiveAction[];
  similarHistoricalCases: number;
  historicalDenialRate: number;
  agentResults: {
    demographics: AgentResult;
    eligibility: AgentResult;
    clinicalDoc: AgentResult;
    medicalCoding: AgentResult;
    chargeReview: AgentResult;
  };
}

export interface DenialTrendDataPoint {
  month: string;
  actualDenials: number;
  predictedDenials: number;
  prevented: number;
}

export interface ReasonDataPoint {
  reason: string;
  count: number;
  percentage: number;
}

export interface AppConfig {
  organization: {
    name: string;
    shortName: string;
    address: string;
    npi: string;
    taxId: string;
  };
  payers: Payer[];
  providers: Provider[];
  patients: Patient[];
  claims: Claim[];
  denialTrend: DenialTrendDataPoint[];
  topDenialReasons: ReasonDataPoint[];
}
