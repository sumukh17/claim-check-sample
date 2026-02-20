import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import type { RiskLevel, AgentStatus, CorrectiveAction } from '../types';
import {
  AlertTriangle, CheckCircle, XCircle, Info, ChevronLeft,
  User, Shield, FileText, Code2, DollarSign, Bot,
  Clock, TrendingDown, Zap, ChevronDown, ChevronUp,
  ExternalLink, Phone, Building, Calendar, Hash, ArrowRight
} from 'lucide-react';
import clsx from 'clsx';

// ─── Helpers ──────────────────────────────────────────────
function RiskGauge({ score, level }: { score: number; level: RiskLevel }) {
  const colors: Record<RiskLevel, string> = {
    critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#10b981'
  };
  const color = colors[level];
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{score}</span>
          <span className="text-xs text-slate-500">Risk Score</span>
        </div>
      </div>
      <div className={clsx('mt-2 text-sm font-bold px-4 py-1 rounded-full', {
        'bg-red-100 text-red-700': level === 'critical',
        'bg-orange-100 text-orange-700': level === 'high',
        'bg-amber-100 text-amber-700': level === 'medium',
        'bg-emerald-100 text-emerald-700': level === 'low',
      })}>
        {level.toUpperCase()} RISK
      </div>
    </div>
  );
}

function AgentStatusBadge({ status }: { status: AgentStatus }) {
  return (
    <span className={clsx('flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', {
      'bg-emerald-100 text-emerald-700': status === 'completed',
      'bg-amber-100 text-amber-700 agent-processing': status === 'processing',
      'bg-slate-100 text-slate-500': status === 'pending',
      'bg-red-100 text-red-700': status === 'error',
    })}>
      {status === 'completed' && <CheckCircle size={10} />}
      {status === 'processing' && <Clock size={10} />}
      {status === 'pending' && <Clock size={10} />}
      {status === 'error' && <XCircle size={10} />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function SeverityIcon({ severity }: { severity: 'info' | 'warning' | 'error' }) {
  if (severity === 'error') return <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />;
  if (severity === 'warning') return <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />;
  return <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />;
}

function ActionStatusButton({ action, claimId }: { action: CorrectiveAction; claimId: string }) {
  const { updateClaimAction } = useApp();
  const [open, setOpen] = useState(false);
  const styles: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-600 border-slate-200',
    in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  const labels: Record<string, string> = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={clsx('flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border', styles[action.status])}
      >
        {labels[action.status]} <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-xl z-10 min-w-[140px]">
          {(['pending', 'in_progress', 'completed'] as const).map(s => (
            <button
              key={s}
              onClick={() => { updateClaimAction(claimId, action.id, s); setOpen(false); }}
              className={clsx('w-full text-left text-xs px-3 py-2 hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg', s === action.status ? 'font-semibold text-blue-600' : 'text-slate-600')}
            >
              {labels[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
type TabId = 'demographics' | 'eligibility' | 'clinicalDoc' | 'medicalCoding' | 'chargeReview' | 'denial';

const tabs: { id: TabId; label: string; icon: React.ReactNode; agentName: string }[] = [
  { id: 'demographics', label: 'Demographics', icon: <User size={14} />, agentName: 'Demographics Agent' },
  { id: 'eligibility', label: 'Eligibility', icon: <Shield size={14} />, agentName: 'Eligibility Agent' },
  { id: 'clinicalDoc', label: 'Clinical Docs', icon: <FileText size={14} />, agentName: 'Clinical Doc Agent' },
  { id: 'medicalCoding', label: 'Medical Coding', icon: <Code2 size={14} />, agentName: 'Coding Agent' },
  { id: 'chargeReview', label: 'Charge Review', icon: <DollarSign size={14} />, agentName: 'Charge Review Agent' },
  { id: 'denial', label: 'Denial Prediction', icon: <Bot size={14} />, agentName: 'Denial Prediction Agent' },
];

export default function ClaimDetailPage() {
  const { selectedClaimId, claims, navigate } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('denial');
  const [showAllActions, setShowAllActions] = useState(false);
  const tabsSectionRef = useRef<HTMLDivElement>(null);

  const goToPredictionTab = () => {
    setActiveTab('denial');
    setTimeout(() => tabsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const claim = claims.find(c => c.id === selectedClaimId);
  if (!claim) return (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-slate-500">Claim not found.</p>
      <button onClick={() => navigate('claims')} className="btn-primary mt-4">Back to Claims</button>
    </div>
  );

  const riskLevelStyle: Record<RiskLevel, string> = {
    critical: 'bg-red-600', high: 'bg-orange-500', medium: 'bg-amber-500', low: 'bg-emerald-500',
  };

  const tabAgentMap: Record<TabId, typeof claim.agentResults.demographics | null> = {
    demographics: claim.agentResults.demographics,
    eligibility: claim.agentResults.eligibility,
    clinicalDoc: claim.agentResults.clinicalDoc,
    medicalCoding: claim.agentResults.medicalCoding,
    chargeReview: claim.agentResults.chargeReview,
    denial: null,
  };

  const getTabScore = (tabId: TabId): number | null => {
    const r = tabAgentMap[tabId];
    return r ? r.score : null;
  };

  const actionsPending = claim.correctiveActions.filter(a => a.status !== 'completed').length;
  const totalRiskReduction = claim.correctiveActions.reduce((s, a) => s + a.riskReduction, 0);
  const completedReduction = claim.correctiveActions.filter(a => a.status === 'completed').reduce((s, a) => s + a.riskReduction, 0);

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button onClick={() => navigate('claims')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <ChevronLeft size={16} /> Back to Claims
      </button>

      {/* Claim Header */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start gap-6">
          {/* Left: claim meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{claim.claimNumber}</h1>
              <span className={clsx('text-xs font-bold text-white px-2 py-0.5 rounded uppercase', {
                'bg-slate-500': claim.status === 'new',
                'bg-blue-500': claim.status === 'in_review',
                'bg-emerald-500': claim.status === 'ready_to_submit',
                'bg-violet-500': claim.status === 'submitted',
                'bg-red-500': claim.status === 'denied',
              })}>
                {claim.status.replace(/_/g, ' ')}
              </span>
              <span className={clsx('text-xs font-semibold text-white px-2 py-0.5 rounded uppercase', riskLevelStyle[claim.riskLevel])}>
                {claim.riskLevel} RISK
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3 text-sm">
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Patient</div>
                <div className="font-semibold text-slate-800">{claim.patient.firstName} {claim.patient.lastName}</div>
                <div className="text-xs text-slate-500">DOB: {claim.patient.dob} · {claim.patient.gender === 'M' ? 'Male' : 'Female'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Insurance</div>
                <div className="font-semibold text-slate-800">{claim.payer.shortName}</div>
                <div className="text-xs text-slate-500">{claim.payer.planType} · {claim.patient.memberId}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Provider</div>
                <div className="font-semibold text-slate-800">{claim.provider.name}</div>
                <div className="text-xs text-slate-500">{claim.provider.specialty}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Date of Service</div>
                <div className="font-semibold text-slate-800">{claim.dateOfService}</div>
                <div className="text-xs text-slate-500">Due: {claim.submissionDueDate}</div>
              </div>
            </div>

            {/* Procedure and Diagnosis codes */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">PROCEDURE CODES</div>
                <div className="space-y-1">
                  {claim.procedureCodes.map(pc => (
                    <div key={pc.cpt} className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{pc.cpt}</span>
                      {pc.modifier && <span className="font-mono text-slate-500 bg-slate-50 px-1 py-0.5 rounded border border-slate-200">{pc.modifier}</span>}
                      <span className="text-slate-600 truncate flex-1">{pc.description}</span>
                      <span className="font-semibold text-slate-700">${pc.chargeAmount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">DIAGNOSIS CODES (ICD-10)</div>
                <div className="space-y-1">
                  {claim.diagnosisCodes.map(dc => (
                    <div key={dc.code} className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{dc.code}</span>
                      {dc.isPrimary && <span className="text-xs text-blue-600 font-medium">Primary</span>}
                      <span className="text-slate-600 truncate">{dc.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: financials */}
          <div className="flex flex-col gap-3 items-end flex-shrink-0">
            <div className="text-right">
              <div className="text-xs text-slate-400">Total Charges</div>
              <div className="text-2xl font-bold text-slate-900">${claim.totalCharges.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Est. Reimb: ${claim.estimatedReimbursement.toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn-outline text-xs py-1.5 flex items-center gap-1">
                <ExternalLink size={12} /> Payer Portal
              </button>
              <button
                onClick={goToPredictionTab}
                className="btn-primary text-xs py-1.5 flex items-center gap-1"
              >
                <Bot size={12} /> View Prediction
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout: Tabs + Denial Prediction Sidebar */}
      <div ref={tabsSectionRef} className="flex gap-5 items-start">
        {/* Left: Agent Tabs */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tab navigation */}
          <div className="card p-1 flex gap-1 overflow-x-auto">
            {tabs.map(tab => {
              const score = getTabScore(tab.id);
              const agentResult = tabAgentMap[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all relative',
                    activeTab === tab.id ? 'bg-brand-800 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                  {score !== null && (
                    <span className={clsx('text-xs font-bold px-1 py-0.5 rounded ml-1', {
                      'bg-emerald-500/20 text-emerald-300': activeTab === tab.id && score >= 80,
                      'bg-amber-500/20 text-amber-300': activeTab === tab.id && score >= 60 && score < 80,
                      'bg-red-500/20 text-red-300': activeTab === tab.id && score < 60,
                      'bg-emerald-100 text-emerald-700': activeTab !== tab.id && score >= 80,
                      'bg-amber-100 text-amber-700': activeTab !== tab.id && score >= 60 && score < 80,
                      'bg-red-100 text-red-700': activeTab !== tab.id && score < 60,
                    })}>
                      {score}
                    </span>
                  )}
                  {tab.id === 'denial' && (
                    <span className={clsx('absolute -top-1 -right-1 text-xs font-bold text-white w-4 h-4 rounded-full flex items-center justify-center', riskLevelStyle[claim.riskLevel])}>
                      !
                    </span>
                  )}
                  {agentResult && agentResult.status !== 'completed' && (
                    <AgentStatusBadge status={agentResult.status} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="card p-5">
            {/* Agent header */}
            {activeTab !== 'denial' && tabAgentMap[activeTab] && (
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700">
                    {tabs.find(t => t.id === activeTab)?.icon}
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900">{tabs.find(t => t.id === activeTab)?.agentName}</h2>
                    <div className="text-xs text-slate-400">
                      Completed {tabAgentMap[activeTab]!.completedAt ? new Date(tabAgentMap[activeTab]!.completedAt).toLocaleTimeString() : '—'} · {tabAgentMap[activeTab]!.processingMs}ms
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Agent Score</div>
                    <div className={clsx('text-2xl font-bold', {
                      'text-emerald-600': tabAgentMap[activeTab]!.score >= 80,
                      'text-amber-600': tabAgentMap[activeTab]!.score >= 60 && tabAgentMap[activeTab]!.score < 80,
                      'text-red-600': tabAgentMap[activeTab]!.score < 60,
                    })}>
                      {tabAgentMap[activeTab]!.score}/100
                    </div>
                  </div>
                  <AgentStatusBadge status={tabAgentMap[activeTab]!.status} />
                </div>
              </div>
            )}

            {/* Demographics Tab */}
            {activeTab === 'demographics' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{claim.agentResults.demographics.summary}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Patient Information</h3>
                    <div className="space-y-2">
                      {[
                        ['Full Name', `${claim.patient.firstName} ${claim.patient.lastName}`],
                        ['Date of Birth', claim.patient.dob],
                        ['Gender', claim.patient.gender === 'M' ? 'Male' : 'Female'],
                        ['SSN', claim.patient.ssn],
                        ['Phone', claim.patient.phone],
                        ['Email', claim.patient.email],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-start gap-2 text-sm">
                          <span className="text-slate-400 w-24 flex-shrink-0 text-xs pt-0.5">{label}</span>
                          <span className="font-medium text-slate-700 text-xs">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Insurance & Coverage</h3>
                    <div className="space-y-2">
                      {Object.entries(claim.agentResults.demographics.details).map(([k, v]) => (
                        <div key={k} className="flex items-start gap-2 text-sm">
                          <span className="text-slate-400 w-28 flex-shrink-0 text-xs pt-0.5">{k}</span>
                          <span className="font-medium text-slate-700 text-xs">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Agent Findings</h3>
                  <div className="space-y-1.5">
                    {claim.agentResults.demographics.findings.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-lg bg-slate-50">
                        <SeverityIcon severity={f.severity} />
                        <span className="text-slate-600">{f.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Eligibility Tab */}
            {activeTab === 'eligibility' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{claim.agentResults.eligibility.summary}</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Eligibility Details</h3>
                    <div className="space-y-2">
                      {Object.entries(claim.agentResults.eligibility.details).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50">
                          <span className="text-slate-500">{k}</span>
                          <span className={clsx('font-semibold', {
                            'text-red-600': String(v).startsWith('NO') || String(v).includes('NOT') || String(v).includes('MISSING') || String(v).includes('EXPIRED'),
                            'text-emerald-600': String(v) === 'Yes' || String(v) === 'Active' || String(v).includes('covered'),
                            'text-amber-600': String(v).includes('Partial') || String(v).includes('PENDING'),
                            'text-slate-700': true,
                          })}>
                            {String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Payer Information</h3>
                    <div className="space-y-2 text-xs">
                      {[
                        ['Payer', claim.payer.name],
                        ['Plan Type', claim.payer.planType],
                        ['Phone', claim.payer.phone],
                        ['Denial Rate', `${claim.payer.historicalDenialRate}% (historical)`],
                        ['Avg Processing', `${claim.payer.avgProcessingDays} days`],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-start gap-2">
                          <span className="text-slate-400 w-28 flex-shrink-0">{k}</span>
                          <span className="font-medium text-slate-700">{v}</span>
                        </div>
                      ))}
                      <div className="mt-3">
                        <div className="text-slate-400 mb-1">CPTs Requiring Prior Auth</div>
                        <div className="flex flex-wrap gap-1">
                          {claim.payer.requiresPriorAuthCPTs.map(cpt => (
                            <span key={cpt} className={clsx('font-mono text-xs px-1.5 py-0.5 rounded border', {
                              'bg-red-100 text-red-700 border-red-200': claim.procedureCodes.some(pc => pc.cpt === cpt),
                              'bg-slate-100 text-slate-600 border-slate-200': !claim.procedureCodes.some(pc => pc.cpt === cpt),
                            })}>
                              {cpt}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Agent Findings</h3>
                  <div className="space-y-1.5">
                    {claim.agentResults.eligibility.findings.map((f, i) => (
                      <div key={i} className={clsx('flex items-start gap-2 text-xs p-2.5 rounded-lg', {
                        'bg-red-50': f.severity === 'error',
                        'bg-amber-50': f.severity === 'warning',
                        'bg-blue-50': f.severity === 'info',
                      })}>
                        <SeverityIcon severity={f.severity} />
                        <span className="text-slate-700">{f.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Clinical Doc Tab */}
            {activeTab === 'clinicalDoc' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{claim.agentResults.clinicalDoc.summary}</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Documentation Status</h3>
                    <div className="space-y-2">
                      {Object.entries(claim.agentResults.clinicalDoc.details).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50">
                          <span className="text-slate-500">{k}</span>
                          <span className={clsx('font-semibold flex items-center gap-1', {
                            'text-red-600': String(v) === 'MISSING' || String(v) === 'No',
                            'text-emerald-600': String(v) === 'Yes' || String(v) === 'Complete',
                            'text-amber-600': String(v) === 'Partial',
                            'text-slate-700': true,
                          })}>
                            {(String(v) === 'Yes' || String(v) === 'Complete') && <CheckCircle size={10} />}
                            {(String(v) === 'MISSING' || String(v) === 'No') && <XCircle size={10} />}
                            {String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Clinical Notes</h3>
                    <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 leading-relaxed border border-slate-200">
                      {claim.notes}
                    </div>
                    <div className="mt-3">
                      <button className="btn-outline text-xs py-1.5 w-full flex items-center justify-center gap-2">
                        <FileText size={12} /> Request Additional Documentation
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Agent Findings</h3>
                  <div className="space-y-1.5">
                    {claim.agentResults.clinicalDoc.findings.map((f, i) => (
                      <div key={i} className={clsx('flex items-start gap-2 text-xs p-2.5 rounded-lg', {
                        'bg-red-50': f.severity === 'error',
                        'bg-amber-50': f.severity === 'warning',
                        'bg-blue-50': f.severity === 'info',
                      })}>
                        <SeverityIcon severity={f.severity} />
                        <span className="text-slate-700">{f.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Medical Coding Tab */}
            {activeTab === 'medicalCoding' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{claim.agentResults.medicalCoding.summary}</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Coding Analysis</h3>
                    <div className="space-y-2">
                      {Object.entries(claim.agentResults.medicalCoding.details).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50">
                          <span className="text-slate-500">{k}</span>
                          <span className={clsx('font-semibold', {
                            'text-red-600': String(v).includes('YES') || String(v).includes('MISSING'),
                            'text-emerald-600': String(v) === '0 violations' || String(v) === 'None',
                            'text-slate-700': true,
                          })}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Procedure Codes</h3>
                      {claim.procedureCodes.map(pc => (
                        <div key={pc.cpt} className="flex items-center gap-2 p-2 mb-1 bg-slate-50 rounded-lg text-xs">
                          <span className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border">{pc.cpt}</span>
                          {pc.modifier && <span className="font-mono text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">+{pc.modifier}</span>}
                          <span className="text-slate-600 flex-1 truncate">{pc.description}</span>
                          <span className="text-slate-500">{pc.units}x</span>
                          <span className="font-semibold">${pc.chargeAmount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">ICD-10 Diagnosis Codes</h3>
                    {claim.diagnosisCodes.map(dc => (
                      <div key={dc.code} className="p-2 mb-1 bg-slate-50 rounded-lg text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">{dc.code}</span>
                          {dc.isPrimary && <span className="text-blue-600 font-semibold">Primary Dx</span>}
                        </div>
                        <div className="text-slate-600 mt-1 ml-1">{dc.description}</div>
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-700 font-medium mb-1">AI Code Suggestion</p>
                      <p className="text-xs text-blue-600">All primary diagnosis codes support the procedure codes billed. No mismatches detected by AI.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Agent Findings</h3>
                  <div className="space-y-1.5">
                    {claim.agentResults.medicalCoding.findings.map((f, i) => (
                      <div key={i} className={clsx('flex items-start gap-2 text-xs p-2.5 rounded-lg', {
                        'bg-red-50': f.severity === 'error',
                        'bg-amber-50': f.severity === 'warning',
                        'bg-blue-50': f.severity === 'info',
                      })}>
                        <SeverityIcon severity={f.severity} />
                        <span className="text-slate-700">{f.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Charge Review Tab */}
            {activeTab === 'chargeReview' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{claim.agentResults.chargeReview.summary}</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Charge Summary</h3>
                    <div className="space-y-2">
                      {Object.entries(claim.agentResults.chargeReview.details).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50">
                          <span className="text-slate-500">{k}</span>
                          <span className="font-semibold text-slate-700">{String(v)}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-xs py-1.5 mt-2 bg-emerald-50 rounded-lg px-2">
                        <span className="text-emerald-700 font-medium">Est. Reimbursement</span>
                        <span className="font-bold text-emerald-700">${claim.estimatedReimbursement.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Line-Item Charges</h3>
                    <div className="space-y-2">
                      {claim.procedureCodes.map(pc => (
                        <div key={pc.cpt} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                          <div>
                            <span className="font-mono font-bold text-slate-700">{pc.cpt}</span>
                            <span className="text-slate-500 ml-2 truncate max-w-[120px] inline-block">{pc.description.substring(0, 30)}</span>
                          </div>
                          <span className="font-semibold text-slate-800">${pc.chargeAmount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-sm font-bold p-2 border-t border-slate-200">
                        <span>Total</span>
                        <span>${claim.totalCharges.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Agent Findings</h3>
                  <div className="space-y-1.5">
                    {claim.agentResults.chargeReview.findings.map((f, i) => (
                      <div key={i} className={clsx('flex items-start gap-2 text-xs p-2.5 rounded-lg', {
                        'bg-amber-50': f.severity === 'warning',
                        'bg-blue-50': f.severity === 'info',
                      })}>
                        <SeverityIcon severity={f.severity} />
                        <span className="text-slate-700">{f.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Denial Prediction Tab ─── MAIN AGENT PANEL */}
            {activeTab === 'denial' && (
              <div className="space-y-5">
                {/* Agent Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow">
                      <Bot size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900">Denial Prediction Agent</h2>
                      <div className="text-xs text-slate-400">Analyzing historical patterns · {claim.predictionConfidence}% confidence</div>
                    </div>
                  </div>
                  <AgentStatusBadge status="completed" />
                </div>

                {/* Risk Score + Factors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Gauge */}
                  <div className={clsx('rounded-xl p-5 text-center border-2', {
                    'bg-red-50 border-red-200': claim.riskLevel === 'critical',
                    'bg-orange-50 border-orange-200': claim.riskLevel === 'high',
                    'bg-amber-50 border-amber-200': claim.riskLevel === 'medium',
                    'bg-emerald-50 border-emerald-200': claim.riskLevel === 'low',
                  })}>
                    <RiskGauge score={claim.riskScore} level={claim.riskLevel} />
                    <div className="mt-3 space-y-1 text-xs">
                      <div className="text-slate-600">Prediction Confidence: <strong>{claim.predictionConfidence}%</strong></div>
                      <div className="text-slate-600">Similar Cases: <strong>{claim.similarHistoricalCases}</strong></div>
                      <div className="text-slate-600">Historical Denial: <strong className="text-red-600">{claim.historicalDenialRate}%</strong></div>
                    </div>
                  </div>

                  {/* Predicted Reason */}
                  <div className="md:col-span-2 space-y-3">
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-red-800 uppercase mb-1">Primary Predicted Denial Reason</div>
                          <div className="text-sm font-semibold text-red-900">{claim.predictedDenialReason}</div>
                        </div>
                      </div>
                    </div>
                    {claim.alternativeDenialReasons.length > 0 && (
                      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                        <div className="text-xs font-semibold text-amber-800 mb-2">Alternative Denial Risks</div>
                        {claim.alternativeDenialReasons.map((r, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-amber-700 mb-1">
                            <ArrowRight size={11} /> {r}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                        <div className="text-lg font-bold text-slate-800">{claim.payer.historicalDenialRate}%</div>
                        <div className="text-xs text-slate-500">Payer Denial Rate</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                        <div className="text-lg font-bold text-slate-800">{claim.similarHistoricalCases}</div>
                        <div className="text-xs text-slate-500">Similar Past Claims</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <Zap size={12} /> Key Risk Factors (Weighted by AI)
                  </h3>
                  <div className="space-y-2">
                    {claim.denialFactors.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50">
                        <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', {
                          'bg-red-500': f.impact === 'increases',
                          'bg-emerald-500': f.impact === 'decreases',
                        })} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-700">{f.factor}</span>
                            <span className={clsx('text-xs font-bold px-1.5 py-0.5 rounded', {
                              'bg-red-100 text-red-700': f.impact === 'increases',
                              'bg-emerald-100 text-emerald-700': f.impact === 'decreases',
                            })}>
                              {f.impact === 'increases' ? '▲' : '▼'} {Math.abs(f.weight)}%
                            </span>
                            <span className="text-xs text-slate-400 capitalize">{f.category.replace(/_/g, ' ')}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div
                              className={clsx('h-1.5 rounded-full transition-all duration-700', {
                                'bg-red-400': f.impact === 'increases',
                                'bg-emerald-400': f.impact === 'decreases',
                              })}
                              style={{ width: `${Math.abs(f.weight)}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{f.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Corrective Actions Panel */}
        <div className="w-80 flex-shrink-0">
          <div className="card p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <TrendingDown size={16} className="text-emerald-600" />
                  Corrective Actions
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{actionsPending} pending · max {totalRiskReduction}% risk reduction</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Risk if all done</div>
                <div className="font-bold text-emerald-600 text-sm">
                  {Math.max(0, claim.riskScore - totalRiskReduction)}/100
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Actions completed</span>
                <span>{claim.correctiveActions.filter(a => a.status === 'completed').length}/{claim.correctiveActions.length}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${(claim.correctiveActions.filter(a => a.status === 'completed').length / claim.correctiveActions.length) * 100}%` }}
                />
              </div>
              <div className="text-xs text-emerald-600 mt-1">
                {completedReduction > 0 && `↓ ${completedReduction}% risk already reduced`}
              </div>
            </div>

            {/* Actions list */}
            <div className="space-y-3">
              {(showAllActions ? claim.correctiveActions : claim.correctiveActions.slice(0, 3)).map(action => (
                <div key={action.id} className={clsx('rounded-xl border p-3', {
                  'border-red-200 bg-red-50/50': action.priority === 'high' && action.status !== 'completed',
                  'border-amber-200 bg-amber-50/50': action.priority === 'medium' && action.status !== 'completed',
                  'border-slate-200 bg-slate-50/50': action.priority === 'low' && action.status !== 'completed',
                  'border-emerald-200 bg-emerald-50/50 opacity-70': action.status === 'completed',
                })}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={clsx('text-xs font-bold px-1.5 py-0.5 rounded', {
                        'bg-red-200 text-red-800': action.priority === 'high',
                        'bg-amber-200 text-amber-800': action.priority === 'medium',
                        'bg-slate-200 text-slate-700': action.priority === 'low',
                      })}>
                        {action.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{action.category}</span>
                    </div>
                    <ActionStatusButton action={action} claimId={claim.id} />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mb-1">{action.action}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mb-2">{action.detail}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock size={10} /> {action.estimatedTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">{action.responsible}</span>
                      <span className="text-emerald-600 font-bold">-{action.riskReduction}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {claim.correctiveActions.length > 3 && (
              <button
                onClick={() => setShowAllActions(!showAllActions)}
                className="w-full mt-3 text-xs text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 py-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {showAllActions ? <><ChevronUp size={13} /> Show Less</> : <><ChevronDown size={13} /> Show {claim.correctiveActions.length - 3} More Actions</>}
              </button>
            )}

            {/* Submit button */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                disabled={actionsPending > 0}
                className={clsx('w-full py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2', {
                  'bg-emerald-600 text-white hover:bg-emerald-700 shadow': actionsPending === 0,
                  'bg-slate-200 text-slate-400 cursor-not-allowed': actionsPending > 0,
                })}
              >
                {actionsPending > 0 ? (
                  <><AlertTriangle size={14} /> {actionsPending} Action(s) Pending</>
                ) : (
                  <><CheckCircle size={14} /> Ready to Submit Claim</>
                )}
              </button>
              {actionsPending > 0 && (
                <p className="text-xs text-center text-slate-400 mt-1.5">
                  Complete all high-priority actions before submission
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
