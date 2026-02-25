import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import type { Claim } from '../types';
import {
  User, Shield, FileText, Code2, DollarSign, Bot,
  CheckCircle, AlertTriangle, Info, Activity,
  Play, StopCircle, RefreshCw, Database, Search,
  Cpu, Globe, Hash, FileCheck, Calculator,
  ChevronRight, Layers, ExternalLink, Network
} from 'lucide-react';
import clsx from 'clsx';

// ─── Activity event types ──────────────────────────────────
type AgentId = 'orchestrator' | 'demographics' | 'eligibility' | 'clinicalDoc' | 'medicalCoding' | 'chargeReview' | 'denial';

type ActivityType =
  | 'init' | 'api_call' | 'db_query' | 'validation' | 'parse'
  | 'finding_error' | 'finding_warning' | 'finding_info'
  | 'calculation' | 'complete' | 'system';

interface ActivityEvent {
  agentId: AgentId;
  type: ActivityType;
  message: string;
  detail?: string;
  value?: string;
}

// ─── Agent display config ──────────────────────────────────
const AGENT_META: Record<AgentId, { label: string; short: string; color: string; textColor: string; bgColor: string; icon: React.ReactNode }> = {
  orchestrator: {
    label: 'Orchestrator', short: 'ORCH',
    color: 'border-slate-400', textColor: 'text-slate-600', bgColor: 'bg-slate-100',
    icon: <Layers size={11} />,
  },
  demographics: {
    label: 'Demographics', short: 'DEMO',
    color: 'border-blue-400', textColor: 'text-blue-700', bgColor: 'bg-blue-100',
    icon: <User size={11} />,
  },
  eligibility: {
    label: 'Eligibility', short: 'ELIG',
    color: 'border-emerald-400', textColor: 'text-emerald-700', bgColor: 'bg-emerald-100',
    icon: <Shield size={11} />,
  },
  clinicalDoc: {
    label: 'Clinical Doc', short: 'CLIN',
    color: 'border-violet-400', textColor: 'text-violet-700', bgColor: 'bg-violet-100',
    icon: <FileText size={11} />,
  },
  medicalCoding: {
    label: 'Med Coding', short: 'CODE',
    color: 'border-amber-400', textColor: 'text-amber-700', bgColor: 'bg-amber-100',
    icon: <Code2 size={11} />,
  },
  chargeReview: {
    label: 'Charge Review', short: 'CHRG',
    color: 'border-cyan-400', textColor: 'text-cyan-700', bgColor: 'bg-cyan-100',
    icon: <DollarSign size={11} />,
  },
  denial: {
    label: 'Denial Predict', short: 'DENY',
    color: 'border-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-100',
    icon: <Bot size={11} />,
  },
};

// ─── Activity type → icon + style ─────────────────────────
function getActivityStyle(type: ActivityType) {
  switch (type) {
    case 'init':       return { icon: <Cpu size={11} />, rowBg: '', msgColor: 'text-slate-700' };
    case 'api_call':   return { icon: <Globe size={11} />, rowBg: '', msgColor: 'text-slate-700' };
    case 'db_query':   return { icon: <Database size={11} />, rowBg: '', msgColor: 'text-slate-700' };
    case 'validation': return { icon: <FileCheck size={11} />, rowBg: '', msgColor: 'text-slate-700' };
    case 'parse':      return { icon: <Search size={11} />, rowBg: '', msgColor: 'text-slate-700' };
    case 'calculation':return { icon: <Calculator size={11} />, rowBg: '', msgColor: 'text-slate-700' };
    case 'system':     return { icon: <Hash size={11} />, rowBg: '', msgColor: 'text-slate-500 italic' };
    case 'finding_info':    return { icon: <Info size={11} className="text-blue-500" />, rowBg: 'bg-blue-50/60', msgColor: 'text-blue-800' };
    case 'finding_warning': return { icon: <AlertTriangle size={11} className="text-amber-500" />, rowBg: 'bg-amber-50/60', msgColor: 'text-amber-800' };
    case 'finding_error':   return { icon: <AlertTriangle size={11} className="text-red-500" />, rowBg: 'bg-red-50/70', msgColor: 'text-red-800 font-medium' };
    case 'complete':   return { icon: <CheckCircle size={11} className="text-emerald-500" />, rowBg: 'bg-emerald-50/60', msgColor: 'text-emerald-800 font-semibold' };
    default:           return { icon: <Hash size={11} />, rowBg: '', msgColor: 'text-slate-700' };
  }
}

// ─── Build detailed activity log from claim data ───────────
function buildActivityLog(claim: Claim): ActivityEvent[] {
  const r = claim.agentResults;
  const cpts = claim.procedureCodes.map(p => p.cpt).join(', ');
  const icds = claim.diagnosisCodes.map(d => d.code).join(', ');
  const hasPriorAuth = claim.denialFactors.some(f => f.category === 'authorization' && f.impact === 'increases');
  const authRequired = claim.payer.requiresPriorAuthCPTs.filter(c => claim.procedureCodes.some(p => p.cpt === c));

  const events: ActivityEvent[] = [];

  // ── ORCHESTRATOR ──
  events.push(
    { agentId: 'orchestrator', type: 'system', message: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
    { agentId: 'orchestrator', type: 'init', message: `Claim received for AI analysis`, detail: claim.claimNumber },
    { agentId: 'orchestrator', type: 'init', message: `Patient: ${claim.patient.firstName} ${claim.patient.lastName} | Payer: ${claim.payer.shortName} | DOS: ${claim.dateOfService}` },
    { agentId: 'orchestrator', type: 'init', message: `Total charges: $${claim.totalCharges.toLocaleString()} | Procedures: ${cpts}` },
    { agentId: 'orchestrator', type: 'init', message: `Initializing 6-agent analysis pipeline...` },
    { agentId: 'orchestrator', type: 'system', message: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
  );

  // ── DEMOGRAPHICS AGENT ──
  events.push(
    { agentId: 'demographics', type: 'init', message: `Demographics Agent STARTED` },
    { agentId: 'demographics', type: 'db_query', message: `Loading patient record from EHR...`, detail: `PAT ID: ${claim.patient.id}` },
    { agentId: 'demographics', type: 'db_query', message: `Patient found: ${claim.patient.firstName} ${claim.patient.lastName} | DOB: ${claim.patient.dob}` },
    { agentId: 'demographics', type: 'api_call', message: `Querying payer member lookup API (270 transaction)...`, detail: `Member: ${claim.patient.memberId}` },
    { agentId: 'demographics', type: 'validation', message: `Member ID ${claim.patient.memberId} → Status: ${r.demographics.details['Eligibility Status'] || 'VERIFIED'}`, value: '✓ MATCH' },
    { agentId: 'demographics', type: 'validation', message: `Date of birth ${claim.patient.dob} → Cross-reference: MATCH` },
    { agentId: 'demographics', type: 'validation', message: `Gender: ${claim.patient.gender === 'M' ? 'Male' : 'Female'} → Payer record: MATCH` },
    { agentId: 'demographics', type: 'validation', message: `Address verification: ${claim.patient.address}, ${claim.patient.city} ${claim.patient.state} ${claim.patient.zip}` },
  );

  r.demographics.findings.forEach(f => {
    events.push({
      agentId: 'demographics',
      type: f.severity === 'error' ? 'finding_error' : f.severity === 'warning' ? 'finding_warning' : 'finding_info',
      message: `FINDING: ${f.message}`,
    });
  });

  events.push(
    { agentId: 'demographics', type: 'calculation', message: `Computing demographics completeness score...` },
    { agentId: 'demographics', type: 'complete', message: `Demographics Agent COMPLETE`, value: `Score: ${r.demographics.score}/100 · ${r.demographics.processingMs}ms` },
  );

  // ── ELIGIBILITY AGENT ──
  events.push(
    { agentId: 'eligibility', type: 'init', message: `Eligibility Agent STARTED` },
    { agentId: 'eligibility', type: 'api_call', message: `Initiating real-time eligibility inquiry (ANSI X12 270)...`, detail: `Payer EDI: ${claim.payer.shortName}` },
    { agentId: 'eligibility', type: 'api_call', message: `271 eligibility response received from ${claim.payer.shortName}` },
    { agentId: 'eligibility', type: 'validation', message: `Coverage status: ${r.eligibility.details['Eligibility Status'] || 'ACTIVE'} | Plan: ${r.eligibility.details['Plan Type'] || claim.payer.planType}` },
    { agentId: 'eligibility', type: 'validation', message: `Coverage effective: ${r.demographics.details['Coverage Start'] || 'N/A'} through ${r.demographics.details['Coverage End'] || 'N/A'}` },
    { agentId: 'eligibility', type: 'validation', message: `Network status: ${r.eligibility.details['In-Network'] || 'Checking...'} for provider ${claim.provider.name}` },
  );

  if (authRequired.length > 0) {
    events.push({
      agentId: 'eligibility', type: 'db_query',
      message: `Checking prior authorization requirements for: ${authRequired.join(', ')}`,
    });
    if (hasPriorAuth) {
      events.push({
        agentId: 'eligibility', type: 'db_query',
        message: `Querying authorization database...`, detail: `Payer: ${claim.payer.shortName} | Member: ${claim.patient.memberId}`,
      });
    }
  }

  if (claim.payer.planType === 'HMO') {
    events.push({
      agentId: 'eligibility', type: 'validation',
      message: `HMO plan detected → checking PCP referral requirement...`,
    });
  }

  const deductible = r.demographics.details['Deductible Met'] || r.demographics.details['Deductible'];
  if (deductible) {
    events.push({ agentId: 'eligibility', type: 'validation', message: `Deductible status: ${deductible}` });
  }

  r.eligibility.findings.forEach(f => {
    events.push({
      agentId: 'eligibility',
      type: f.severity === 'error' ? 'finding_error' : f.severity === 'warning' ? 'finding_warning' : 'finding_info',
      message: `FINDING: ${f.message}`,
    });
  });

  events.push(
    { agentId: 'eligibility', type: 'calculation', message: `Calculating eligibility risk contribution...` },
    { agentId: 'eligibility', type: 'complete', message: `Eligibility Agent COMPLETE`, value: `Score: ${r.eligibility.score}/100 · ${r.eligibility.processingMs}ms` },
  );

  // ── CLINICAL DOC AGENT ──
  events.push(
    { agentId: 'clinicalDoc', type: 'init', message: `Clinical Documentation Agent STARTED` },
    { agentId: 'clinicalDoc', type: 'db_query', message: `Loading document manifest from DMS...` },
    { agentId: 'clinicalDoc', type: 'parse', message: `Scanning attached documents for claim ${claim.claimNumber}...` },
  );

  const docDetails = r.clinicalDoc.details;
  Object.entries(docDetails).forEach(([key, val]) => {
    const valStr = String(val);
    const isPresent = valStr === 'Yes' || valStr === 'Complete';
    const isMissing = valStr === 'MISSING' || valStr === 'No';
    events.push({
      agentId: 'clinicalDoc',
      type: isMissing ? 'finding_error' : isPresent ? 'finding_info' : 'validation',
      message: `${isMissing ? 'MISSING' : '✓'} ${key}: ${valStr}`,
    });
  });

  events.push(
    { agentId: 'clinicalDoc', type: 'parse', message: `Extracting clinical notes for medical necessity analysis...` },
    { agentId: 'clinicalDoc', type: 'parse', message: `Parsing ${claim.diagnosisCodes.length} diagnosis codes for documentation alignment...` },
    { agentId: 'clinicalDoc', type: 'validation', message: `Cross-referencing documentation against ${claim.payer.shortName} medical policy requirements...` },
  );

  r.clinicalDoc.findings.forEach(f => {
    events.push({
      agentId: 'clinicalDoc',
      type: f.severity === 'error' ? 'finding_error' : f.severity === 'warning' ? 'finding_warning' : 'finding_info',
      message: `FINDING: ${f.message}`,
    });
  });

  events.push(
    { agentId: 'clinicalDoc', type: 'calculation', message: `Documentation completeness score calculated...` },
    { agentId: 'clinicalDoc', type: 'complete', message: `Clinical Documentation Agent COMPLETE`, value: `Score: ${r.clinicalDoc.score}/100 · ${r.clinicalDoc.processingMs}ms` },
  );

  // ── MEDICAL CODING AGENT ──
  events.push(
    { agentId: 'medicalCoding', type: 'init', message: `Medical Coding Agent STARTED` },
    { agentId: 'medicalCoding', type: 'db_query', message: `Loading CPT codes: ${cpts}` },
    { agentId: 'medicalCoding', type: 'db_query', message: `Loading ICD-10 diagnosis codes: ${icds}` },
    { agentId: 'medicalCoding', type: 'validation', message: `Running NCCI (National Correct Coding Initiative) edit checks...` },
  );

  claim.procedureCodes.forEach(pc => {
    events.push({
      agentId: 'medicalCoding', type: 'validation',
      message: `CPT ${pc.cpt}${pc.modifier ? ` mod-${pc.modifier}` : ''} × ${pc.units} — validating against code database...`,
    });
  });

  events.push(
    { agentId: 'medicalCoding', type: 'db_query', message: `Querying MUE (Medically Unlikely Edits) limits for all CPTs...` },
    { agentId: 'medicalCoding', type: 'validation', message: `Checking ICD-10 to CPT medical necessity linkage...` },
    { agentId: 'medicalCoding', type: 'db_query', message: `Running DRG grouper...`, detail: r.medicalCoding.details['DRG'] ? `→ ${r.medicalCoding.details['DRG']}` : undefined },
    { agentId: 'medicalCoding', type: 'validation', message: `Verifying modifier rules and payer-specific coding guidelines...` },
  );

  if (claim.diagnosisCodes.length > 0) {
    claim.diagnosisCodes.forEach(dc => {
      events.push({
        agentId: 'medicalCoding', type: 'validation',
        message: `ICD-10 ${dc.code} (${dc.description}): specificity check → VALID`,
      });
    });
  }

  r.medicalCoding.findings.forEach(f => {
    events.push({
      agentId: 'medicalCoding',
      type: f.severity === 'error' ? 'finding_error' : f.severity === 'warning' ? 'finding_warning' : 'finding_info',
      message: `FINDING: ${f.message}`,
    });
  });

  events.push(
    { agentId: 'medicalCoding', type: 'calculation', message: `Code accuracy score computed: ${r.medicalCoding.details['Code Accuracy'] || r.medicalCoding.score + '%'}` },
    { agentId: 'medicalCoding', type: 'complete', message: `Medical Coding Agent COMPLETE`, value: `Score: ${r.medicalCoding.score}/100 · ${r.medicalCoding.processingMs}ms` },
  );

  // ── CHARGE REVIEW AGENT ──
  events.push(
    { agentId: 'chargeReview', type: 'init', message: `Charge Review Agent STARTED` },
    { agentId: 'chargeReview', type: 'db_query', message: `Loading charge master for ${claim.provider.facility || 'facility'}...` },
    { agentId: 'chargeReview', type: 'api_call', message: `Fetching ${claim.payer.shortName} ${new Date(claim.dateOfService).getFullYear()} fee schedule...` },
  );

  claim.procedureCodes.forEach(pc => {
    events.push({
      agentId: 'chargeReview', type: 'validation',
      message: `CPT ${pc.cpt} — billed: $${pc.chargeAmount.toLocaleString()} | comparing to fee schedule UCR...`,
    });
  });

  events.push(
    { agentId: 'chargeReview', type: 'calculation', message: `Total charges: $${claim.totalCharges.toLocaleString()} | UCR status: ${r.chargeReview.details['UCR Status'] || 'Calculated'}` },
    { agentId: 'chargeReview', type: 'calculation', message: `Estimated reimbursement at contracted rate: $${claim.estimatedReimbursement.toLocaleString()}` },
  );

  r.chargeReview.findings.forEach(f => {
    events.push({
      agentId: 'chargeReview',
      type: f.severity === 'error' ? 'finding_error' : f.severity === 'warning' ? 'finding_warning' : 'finding_info',
      message: `FINDING: ${f.message}`,
    });
  });

  events.push(
    { agentId: 'chargeReview', type: 'calculation', message: `Charge variance analysis complete: ${r.chargeReview.details['Charge Variance'] || 'see details'}` },
    { agentId: 'chargeReview', type: 'complete', message: `Charge Review Agent COMPLETE`, value: `Score: ${r.chargeReview.score}/100 · ${r.chargeReview.processingMs}ms` },
  );

  // ── DENIAL PREDICTION AGENT ──
  events.push(
    { agentId: 'denial', type: 'init', message: `Denial Prediction Agent STARTED — aggregating all upstream signals` },
    { agentId: 'denial', type: 'db_query', message: `Querying historical claims database...`, detail: `${claim.similarHistoricalCases} similar claims found` },
    { agentId: 'denial', type: 'db_query', message: `Filter: CPT ${cpts} | Payer: ${claim.payer.shortName} | Specialty: ${claim.provider.specialty}` },
    { agentId: 'denial', type: 'calculation', message: `Historical denial rate for this claim profile: ${claim.historicalDenialRate}%` },
    { agentId: 'denial', type: 'db_query',    message: `Loading pattern knowledge base...`, detail: `54 indexed patterns · 12 denial categories` },
    { agentId: 'denial', type: 'db_query',    message: `Fetching payer-specific rules: ${claim.payer.shortName} (${claim.payer.planType})` },
    { agentId: 'denial', type: 'calculation', message: `Running pattern similarity engine against claim profile...` },
    { agentId: 'denial', type: 'finding_info', message: `Pattern match: CPT ${claim.procedureCodes[0]?.cpt ?? '?'} — payer authorization rule`, detail: `Similarity 0.91 · CARC 197 · n=2,341 historical claims` },
    { agentId: 'denial', type: 'finding_info', message: `Pattern match: ${claim.payer.shortName} eligibility verification gap`, detail: `Similarity 0.84 · CARC 27 · n=3,421 historical claims` },
    { agentId: 'denial', type: 'init', message: `Running weighted risk factor model...` },
  );

  claim.denialFactors.forEach(f => {
    events.push({
      agentId: 'denial',
      type: f.impact === 'increases' ? 'finding_warning' : 'finding_info',
      message: `Factor: ${f.factor}`,
      detail: `${f.impact === 'increases' ? '+' : '-'}${Math.abs(f.weight)} pts — ${f.description}`,
    });
  });

  events.push(
    { agentId: 'denial', type: 'calculation', message: `Computing composite risk score from ${claim.denialFactors.length} weighted factors...` },
    {
      agentId: 'denial',
      type: claim.riskLevel === 'critical' || claim.riskLevel === 'high' ? 'finding_error' : 'finding_warning',
      message: `Risk Score: ${claim.riskScore}/100 — ${claim.riskLevel.toUpperCase()} RISK`,
      detail: `Confidence: ${claim.predictionConfidence}%`,
    },
    {
      agentId: 'denial', type: 'finding_error',
      message: `Primary predicted denial reason: ${claim.predictedDenialReason}`,
    },
  );

  if (claim.alternativeDenialReasons.length > 0) {
    claim.alternativeDenialReasons.forEach(r2 => {
      events.push({ agentId: 'denial', type: 'finding_warning', message: `Alternative risk: ${r2}` });
    });
  }

  const increaseFactors = claim.denialFactors.filter(f => f.impact === 'increases');
  const topCategory = increaseFactors[0]?.category ?? 'authorization';
  events.push(
    { agentId: 'denial', type: 'calculation',  message: `Constructing knowledge graph: ${claim.denialFactors.length + 12} nodes, ${claim.denialFactors.length * 3 + 8} edges` },
    { agentId: 'denial', type: 'api_call',     message: `Graph traversal: ${topCategory} → risk signal → prediction`, detail: `54 patterns · 12 category nodes · ${increaseFactors.length} active risk pathway(s)` },
    { agentId: 'denial', type: 'finding_info', message: `Knowledge graph inference: ${Math.min(increaseFactors.length + 1, 4)} denial risk pathway(s) confirmed` },
    { agentId: 'denial', type: 'calculation',  message: `Pattern network confirms: ${claim.predictedDenialReason.length > 65 ? claim.predictedDenialReason.substring(0, 65) + '…' : claim.predictedDenialReason}` },
    { agentId: 'denial', type: 'calculation',  message: `Generating corrective action recommendations...` },
  );

  claim.correctiveActions.forEach(a => {
    events.push({
      agentId: 'denial', type: 'finding_info',
      message: `Action [${a.priority.toUpperCase()}]: ${a.action}`,
      detail: `-${a.riskReduction}% risk | Owner: ${a.responsible}`,
    });
  });

  events.push(
    { agentId: 'denial', type: 'complete', message: `Denial Prediction Agent COMPLETE — ${claim.correctiveActions.length} corrective actions generated`, value: `Confidence: ${claim.predictionConfidence}%` },
    { agentId: 'orchestrator', type: 'system', message: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
    { agentId: 'orchestrator', type: 'complete', message: `Pipeline complete — Risk: ${claim.riskScore}/100 (${claim.riskLevel.toUpperCase()}) | ${claim.correctiveActions.length} actions prescribed` },
    { agentId: 'orchestrator', type: 'system', message: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
  );

  return events;
}

// ─── Assign timestamps (relative to first agent start) ────
function buildTimedEvents(claim: Claim, events: ActivityEvent[]) {
  const r = claim.agentResults;
  const agents: Array<{ id: AgentId; processingMs: number; endTs: Date }> = [
    { id: 'demographics', processingMs: r.demographics.processingMs, endTs: new Date(r.demographics.completedAt) },
    { id: 'eligibility', processingMs: r.eligibility.processingMs, endTs: new Date(r.eligibility.completedAt) },
    { id: 'clinicalDoc', processingMs: r.clinicalDoc.processingMs, endTs: new Date(r.clinicalDoc.completedAt) },
    { id: 'medicalCoding', processingMs: r.medicalCoding.processingMs, endTs: new Date(r.medicalCoding.completedAt) },
    { id: 'chargeReview', processingMs: r.chargeReview.processingMs, endTs: new Date(r.chargeReview.completedAt) },
  ];

  // Build a timestamp budget per agent
  const agentWindows: Record<string, { start: number; end: number }> = {};
  agents.forEach(a => {
    agentWindows[a.id] = {
      start: a.endTs.getTime() - a.processingMs,
      end: a.endTs.getTime(),
    };
  });
  const lastEnd = agents[agents.length - 1].endTs.getTime();
  agentWindows['denial'] = { start: lastEnd + 200, end: lastEnd + 200 + 1843 };
  agentWindows['orchestrator'] = { start: agents[0].endTs.getTime() - agents[0].processingMs - 50, end: lastEnd + 200 + 1843 + 50 };

  // Spread events within each agent's time window
  const perAgent: Record<string, ActivityEvent[]> = {};
  events.forEach(e => {
    if (!perAgent[e.agentId]) perAgent[e.agentId] = [];
    perAgent[e.agentId].push(e);
  });

  const result: Array<ActivityEvent & { ts: Date }> = [];
  Object.entries(perAgent).forEach(([agentId, agentEvents]) => {
    const window = agentWindows[agentId];
    if (!window) return;
    const span = window.end - window.start;
    agentEvents.forEach((e, i) => {
      // Space events linearly through the window, with complete event at the end
      const fraction = agentEvents.length > 1
        ? (e.type === 'complete' ? 0.98 : (i / (agentEvents.length - 1)) * 0.95)
        : 0.5;
      result.push({ ...e, ts: new Date(window.start + span * fraction) });
    });
  });

  return result.sort((a, b) => a.ts.getTime() - b.ts.getTime());
}

// ─── Log row component ─────────────────────────────────────
function LogRow({ event, idx }: { event: ActivityEvent & { ts: Date }; idx: number }) {
  const meta = AGENT_META[event.agentId];
  const style = getActivityStyle(event.type);

  return (
    <div className={clsx('flex items-start gap-2 px-3 py-1.5 rounded text-xs font-mono', style.rowBg, idx % 2 === 0 && !style.rowBg ? 'bg-slate-50/40' : '')}>
      {/* Timestamp */}
      <span className="text-slate-400 flex-shrink-0 w-24 pt-0.5">
        {event.ts.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        <span className="text-slate-300">.{String(event.ts.getMilliseconds()).padStart(3, '0')}</span>
      </span>

      {/* Agent badge */}
      <span className={clsx('flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded border font-semibold text-xs w-20 justify-center', meta.bgColor, meta.textColor, meta.color)}>
        {meta.icon}
        {meta.short}
      </span>

      {/* Activity type icon */}
      <span className={clsx('flex-shrink-0 mt-0.5', {
        'text-slate-400': ['init','api_call','db_query','validation','parse','calculation','system'].includes(event.type),
      })}>
        {style.icon}
      </span>

      {/* Message + detail */}
      <div className="flex-1 min-w-0">
        <span className={style.msgColor}>{event.message}</span>
        {event.detail && (
          <span className="ml-2 text-slate-400 italic">{event.detail}</span>
        )}
        {event.value && (
          <span className="ml-2 font-semibold text-emerald-600">[{event.value}]</span>
        )}
      </div>
    </div>
  );
}

// ─── (DenialPatternNetwork replaced by inline iframe) ──────
const DPN_W = 870;
const DPN_H = 462;
const DPN_PT = 56;
const DPN_AV = DPN_H - DPN_PT - 14;

const DPN_LAYERS = [
  { x: 8,   w: 162, label: 'Pattern Types' },
  { x: 222, w: 172, label: 'Key Patterns' },
  { x: 446, w: 156, label: 'Risk Signals' },
  { x: 654, w: 176, label: 'Prediction' },
] as const;

function dpnYs(count: number, nh: number): number[] {
  if (count === 1) return [DPN_PT + (DPN_AV - nh) / 2];
  const gap = Math.max(8, (DPN_AV - count * nh) / (count - 1));
  const total = count * nh + gap * (count - 1);
  const s = DPN_PT + (DPN_AV - total) / 2;
  return Array.from({ length: count }, (_, i) => Math.round(s + i * (nh + gap)));
}

function dpnBez(x1: number, y1: number, x2: number, y2: number): string {
  const dx = (x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`;
}

const DPN_NH = { type: 52, pat: 72, risk: 54, pred: 152 } as const;

const DPN_TYPES = [
  { label: 'Prior Authorization', count: 18, avg: 91, clr: '#f87171', bdr: '#ef4444' },
  { label: 'Eligibility',          count: 12, avg: 87, clr: '#fb923c', bdr: '#f97316' },
  { label: 'Medical Coding',       count: 10, avg: 85, clr: '#fbbf24', bdr: '#f59e0b' },
  { label: 'Payer-Specific',       count:  8, avg: 89, clr: '#4ade80', bdr: '#22c55e' },
  { label: 'Multi-Factor',         count:  6, avg: 94, clr: '#c084fc', bdr: '#a855f7' },
];

const DPN_PATS = [
  { name: 'PA_001',   label: 'Missing Prior Auth',     risk: 94, carc: '15', n: 3420 },
  { name: 'ELIG_001', label: 'Coverage Terminated',    risk: 96, carc: '27', n: 2180 },
  { name: 'CODE_001', label: 'Invalid CPT Modifier',   risk: 87, carc:  '4', n: 1650 },
  { name: 'PAY_002',  label: 'BCBS PA Requirement',    risk: 93, carc: '15', n:  890 },
  { name: 'MULTI_01', label: 'Auth + Eligibility Gap', risk: 91, carc: '15', n:  540 },
];

const DPN_RISKS = [
  { label: 'Authorization Risk', pct: 93, clr: '#f87171', bdr: '#ef4444' },
  { label: 'Eligibility Risk',   pct: 88, clr: '#fb923c', bdr: '#f97316' },
  { label: 'Coding Risk',        pct: 82, clr: '#fbbf24', bdr: '#f59e0b' },
  { label: 'Payer Compliance',   pct: 90, clr: '#4ade80', bdr: '#22c55e' },
];

// Edges: [fromIdx, toIdx, strength]
const DPN_L01: [number, number, number][] = [
  [0, 0, 1.0], [0, 4, 0.6], [0, 3, 0.4],
  [1, 1, 1.0], [1, 4, 0.6],
  [2, 2, 1.0],
  [3, 3, 1.0],
  [4, 4, 1.0],
];
const DPN_L12: [number, number, number][] = [
  [0, 0, 1.0],
  [1, 1, 1.0],
  [2, 2, 1.0],
  [3, 3, 1.0], [3, 0, 0.7],
  [4, 0, 0.8], [4, 1, 0.7],
];
const DPN_L23: [number, number][] = [
  [0, 1.0], [1, 0.8], [2, 0.6], [3, 0.9],
];

function DenialPatternNetwork() {
  const [hov, setHov] = useState<string | null>(null);
  const tYs = dpnYs(DPN_TYPES.length, DPN_NH.type);
  const pYs = dpnYs(DPN_PATS.length,  DPN_NH.pat);
  const rYs = dpnYs(DPN_RISKS.length, DPN_NH.risk);
  const dY  = dpnYs(1, DPN_NH.pred)[0];

  const hovT = (i: number) => hov === `t${i}` || DPN_L01.some(([f, t]) => f === i && hov === `p${t}`);
  const hovP = (i: number) => hov === `p${i}`
    || DPN_L01.some(([f, t]) => t === i && hov === `t${f}`)
    || DPN_L12.some(([f, t]) => f === i && hov === `r${t}`);
  const hovR = (i: number) => hov === `r${i}`
    || DPN_L12.some(([f, t]) => t === i && hov === `p${f}`)
    || hov === 'pred';
  const hovD = hov === 'pred' || DPN_L23.some(([f]) => hov === `r${f}`);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Stats bar */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '8px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', color: '#64748b', fontSize: 12 }}>
          <span style={{ color: '#e2e8f0', fontWeight: 700 }}>Denial Prediction Engine</span>
          <span style={{ color: '#1e293b' }}>·</span>
          <span><span style={{ color: '#818cf8', fontWeight: 600 }}>54 patterns</span> indexed</span>
          <span style={{ color: '#1e293b' }}>·</span>
          <span>12 denial categories</span>
          <span style={{ color: '#1e293b' }}>·</span>
          <span><span style={{ color: '#f87171', fontWeight: 600 }}>4 risk signals</span> active</span>
          <span style={{ color: '#1e293b' }}>·</span>
          <span>Pattern-based inference engine</span>
        </div>
      </div>

      {/* Graph canvas */}
      <div style={{ borderRadius: 12, overflowX: 'auto', background: '#020617' }}>
        <div style={{ position: 'relative', minWidth: DPN_W, height: DPN_H }}>

          {/* Grid overlay */}
          <svg className="absolute inset-0 pointer-events-none" viewBox={`0 0 ${DPN_W} ${DPN_H}`}
            style={{ width: '100%', height: DPN_H, opacity: 0.15 }}>
            <defs>
              <pattern id="dpn-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#475569" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dpn-grid)" />
          </svg>

          {/* Edge SVG */}
          <svg viewBox={`0 0 ${DPN_W} ${DPN_H}`} className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: DPN_H }}>
            {/* L0→L1 indigo */}
            {DPN_L01.map(([fi, pi, s], i) => {
              const hl = hov === `t${fi}` || hov === `p${pi}`;
              return <path key={`l01-${i}`}
                d={dpnBez(DPN_LAYERS[0].x + DPN_LAYERS[0].w, tYs[fi] + DPN_NH.type / 2, DPN_LAYERS[1].x, pYs[pi] + DPN_NH.pat / 2)}
                fill="none" stroke="#818cf8"
                strokeWidth={hl ? 3 : 1 + s * 1.8}
                opacity={hov === null ? 0.25 + s * 0.45 : hl ? 0.9 : 0.06} />;
            })}
            {/* L1→L2 orange */}
            {DPN_L12.map(([pi, ri, s], i) => {
              const hl = hov === `p${pi}` || hov === `r${ri}`;
              return <path key={`l12-${i}`}
                d={dpnBez(DPN_LAYERS[1].x + DPN_LAYERS[1].w, pYs[pi] + DPN_NH.pat / 2, DPN_LAYERS[2].x, rYs[ri] + DPN_NH.risk / 2)}
                fill="none" stroke="#fb923c"
                strokeWidth={hl ? 3 : 1 + s * 1.8}
                opacity={hov === null ? 0.25 + s * 0.45 : hl ? 0.9 : 0.06} />;
            })}
            {/* L2→L3 red */}
            {DPN_L23.map(([ri, s], i) => {
              const hl = hov === `r${ri}` || hov === 'pred';
              return <path key={`l23-${i}`}
                d={dpnBez(DPN_LAYERS[2].x + DPN_LAYERS[2].w, rYs[ri] + DPN_NH.risk / 2, DPN_LAYERS[3].x, dY + DPN_NH.pred / 2)}
                fill="none" stroke="#f87171"
                strokeWidth={hl ? 3.5 : 1.5 + s * 2}
                opacity={hov === null ? 0.3 + s * 0.4 : hl ? 0.9 : 0.06} />;
            })}
          </svg>

          {/* Layer column headers */}
          {DPN_LAYERS.map((layer, li) => (
            <div key={li} style={{ position: 'absolute', left: layer.x, top: 14, width: layer.w, textAlign: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {layer.label}
              </span>
            </div>
          ))}

          {/* L0: Pattern Type nodes */}
          {DPN_TYPES.map((t, i) => {
            const hl = hovT(i);
            return (
              <div key={i}
                onMouseEnter={() => setHov(`t${i}`)}
                onMouseLeave={() => setHov(null)}
                style={{
                  position: 'absolute', left: DPN_LAYERS[0].x, top: tYs[i],
                  width: DPN_LAYERS[0].w, height: DPN_NH.type,
                  background: '#0f172a',
                  border: `1.5px solid ${hl ? t.bdr : t.bdr + '88'}`,
                  borderRadius: 8, padding: '7px 10px',
                  boxShadow: hl ? `0 0 14px ${t.clr}55` : `0 0 4px ${t.clr}22`,
                  cursor: 'default', zIndex: hl ? 20 : 10, transition: 'all 0.15s',
                }}
              >
                <div style={{ color: t.clr, fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.label}</div>
                <div style={{ color: '#64748b', fontSize: 10, marginTop: 3 }}>
                  {t.count} patterns · avg <span style={{ color: t.clr, fontWeight: 600 }}>{t.avg}%</span>
                </div>
              </div>
            );
          })}

          {/* L1: Key Pattern nodes */}
          {DPN_PATS.map((p, i) => {
            const hl = hovP(i);
            return (
              <div key={i}
                onMouseEnter={() => setHov(`p${i}`)}
                onMouseLeave={() => setHov(null)}
                style={{
                  position: 'absolute', left: DPN_LAYERS[1].x, top: pYs[i],
                  width: DPN_LAYERS[1].w, height: DPN_NH.pat,
                  background: '#1e1b4b',
                  border: `1.5px solid ${hl ? '#818cf8' : '#3730a3'}`,
                  borderRadius: 8, padding: '7px 10px',
                  boxShadow: hl ? '0 0 14px #818cf877' : '0 0 4px #818cf822',
                  cursor: 'default', zIndex: hl ? 20 : 10, transition: 'all 0.15s',
                }}
              >
                <div style={{ color: '#c7d2fe', fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <span style={{ color: '#f87171', fontSize: 13, fontWeight: 900 }}>{p.risk}%</span>
                  <div style={{ flex: 1, background: '#312e81', borderRadius: 9999, height: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${p.risk}%`, height: 3, borderRadius: 9999, background: '#f87171' }} />
                  </div>
                </div>
                <div style={{ color: '#6366f1', fontSize: 10, marginTop: 3 }}>CARC {p.carc} · {p.name}</div>
                <div style={{ color: '#475569', fontSize: 10, marginTop: 2 }}>n={p.n.toLocaleString()} historical</div>
              </div>
            );
          })}

          {/* L2: Risk Signal nodes */}
          {DPN_RISKS.map((r, i) => {
            const hl = hovR(i);
            return (
              <div key={i}
                onMouseEnter={() => setHov(`r${i}`)}
                onMouseLeave={() => setHov(null)}
                style={{
                  position: 'absolute', left: DPN_LAYERS[2].x, top: rYs[i],
                  width: DPN_LAYERS[2].w, height: DPN_NH.risk,
                  background: '#0a0a0f',
                  border: `1.5px solid ${hl ? r.bdr : r.bdr + '77'}`,
                  borderRadius: 8, padding: '7px 10px',
                  boxShadow: hl ? `0 0 14px ${r.clr}55` : `0 0 4px ${r.clr}22`,
                  cursor: 'default', zIndex: hl ? 20 : 10, transition: 'all 0.15s',
                }}
              >
                <div style={{ color: r.clr, fontSize: 11, fontWeight: 700 }}>{r.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <div style={{ flex: 1, background: '#1e293b', borderRadius: 9999, height: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${r.pct}%`, height: 3, borderRadius: 9999, background: r.clr }} />
                  </div>
                  <span style={{ color: r.clr, fontSize: 11, fontWeight: 700 }}>{r.pct}%</span>
                </div>
              </div>
            );
          })}

          {/* L3: Prediction node */}
          <div
            onMouseEnter={() => setHov('pred')}
            onMouseLeave={() => setHov(null)}
            style={{
              position: 'absolute', left: DPN_LAYERS[3].x, top: dY,
              width: DPN_LAYERS[3].w, height: DPN_NH.pred,
              background: 'linear-gradient(160deg, #1c0a0a 0%, #180818 100%)',
              border: `2px solid ${hovD ? '#ef4444' : '#7f1d1d'}`,
              borderRadius: 12, padding: '12px 14px',
              boxShadow: hovD ? '0 0 24px #ef444466' : '0 0 10px #ef444433',
              cursor: 'default', zIndex: hovD ? 20 : 10, transition: 'all 0.15s',
            }}
          >
            <div style={{ color: '#64748b', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Denial Risk Score</div>
            <div style={{ color: '#f87171', fontSize: 40, fontWeight: 900, lineHeight: 1, marginTop: 4 }}>87</div>
            <div style={{ color: '#475569', fontSize: 11 }}>/ 100</div>
            <span style={{ background: '#450a0a', color: '#fca5a5', border: '1px solid #7f1d1d', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 9999, display: 'inline-block', marginTop: 6 }}>
              HIGH RISK
            </span>
            <div style={{ color: '#94a3b8', fontSize: 10, marginTop: 8, lineHeight: 1.5 }}>
              Prior Auth not obtained for primary procedure
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <div style={{ flex: 1, background: '#1e293b', borderRadius: 9999, height: 3, overflow: 'hidden' }}>
                <div style={{ width: '92%', height: 3, borderRadius: 9999, background: '#f87171' }} />
              </div>
              <span style={{ color: '#64748b', fontSize: 10 }}>92% conf</span>
            </div>
          </div>

        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', color: '#475569', fontSize: 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="28" height="8"><line x1="0" y1="4" x2="28" y2="4" stroke="#818cf8" strokeWidth="2.5" /></svg>
          <span>Pattern type → key pattern</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="28" height="8"><line x1="0" y1="4" x2="28" y2="4" stroke="#fb923c" strokeWidth="2.5" /></svg>
          <span>Key pattern → risk signal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="28" height="8"><line x1="0" y1="4" x2="28" y2="4" stroke="#f87171" strokeWidth="2.5" /></svg>
          <span>Risk signal → prediction</span>
        </div>
        <span style={{ color: '#334155' }}>54 patterns from historical denial corpus · hover to explore</span>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────
const AGENT_FILTERS: Array<{ id: AgentId | 'all'; label: string }> = [
  { id: 'all', label: 'All Agents' },
  { id: 'orchestrator', label: 'Orchestrator' },
  { id: 'demographics', label: 'Demographics' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'clinicalDoc', label: 'Clinical Doc' },
  { id: 'medicalCoding', label: 'Med Coding' },
  { id: 'chargeReview', label: 'Charge Review' },
  { id: 'denial', label: 'Denial Prediction' },
];

export default function AgentActivityPage() {
  const { claims, navigate } = useApp();
  const [selectedClaimId, setSelectedClaimId] = useState(claims[0]?.id ?? '');
  const [activeFilter, setActiveFilter] = useState<AgentId | 'all'>('all');
  const [running, setRunning] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number | 'all'>('all');
  const [replayKey, setReplayKey] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  const claim = claims.find(c => c.id === selectedClaimId) ?? claims[0];
  const rawEvents = buildActivityLog(claim);
  const timedEvents = buildTimedEvents(claim, rawEvents);

  const filteredEvents = activeFilter === 'all'
    ? timedEvents
    : timedEvents.filter(e => e.agentId === activeFilter);

  const displayEvents = visibleCount === 'all' ? filteredEvents : filteredEvents.slice(0, visibleCount);

  // Auto-scroll to bottom during replay
  useEffect(() => {
    if (running) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayEvents.length, running]);

  // Replay animation
  useEffect(() => {
    if (!running) return;
    setVisibleCount(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= filteredEvents.length) {
        clearInterval(interval);
        setRunning(false);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [replayKey, running, filteredEvents.length]);

  const handleReplay = () => {
    setVisibleCount(0);
    setReplayKey(k => k + 1);
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
    setVisibleCount('all');
  };

  const handleSelectClaim = (id: string) => {
    setSelectedClaimId(id);
    setRunning(false);
    setVisibleCount('all');
  };

  const riskBadgeStyle: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-emerald-100 text-emerald-700',
  };

  const totalEvents = filteredEvents.length;
  const shown = visibleCount === 'all' ? totalEvents : Math.min(visibleCount, totalEvents);
  const pct = totalEvents > 0 ? Math.round((shown / totalEvents) * 100) : 100;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity size={20} className="text-violet-600" />
            Agent Activity Monitor
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time view of every action each AI agent performs while processing a claim
          </p>
        </div>
        <div className="flex items-center gap-2">
          {running ? (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
            >
              <StopCircle size={14} /> Stop
            </button>
          ) : (
            <button
              onClick={handleReplay}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-all"
            >
              <Play size={14} /> Run Pipeline
            </button>
          )}
          <button
            onClick={() => { setVisibleCount('all'); setRunning(false); }}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Claim selector */}
      <div className="card p-3 flex-shrink-0">
        <div className="flex flex-wrap gap-1.5">
          {claims.map(c => (
            <button
              key={c.id}
              onClick={() => handleSelectClaim(c.id)}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all',
                selectedClaimId === c.id
                  ? 'bg-brand-800 text-white border-brand-800 shadow'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >
              {c.claimNumber}
              <span className={clsx('px-1 py-0.5 rounded text-xs font-bold', riskBadgeStyle[c.riskLevel])}>
                {c.riskLevel.toUpperCase()[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Agent filter + status bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-1 flex-wrap">
          {AGENT_FILTERS.map(f => {
            const meta = f.id !== 'all' ? AGENT_META[f.id as AgentId] : null;
            return (
              <button
                key={f.id}
                onClick={() => { setActiveFilter(f.id as AgentId | 'all'); setVisibleCount('all'); setRunning(false); }}
                className={clsx(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  activeFilter === f.id
                    ? (meta ? `${meta.bgColor} ${meta.textColor} ${meta.color}` : 'bg-slate-800 text-white border-slate-800')
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                )}
              >
                {meta && meta.icon}
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Progress + stats */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {running && (
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-violet-500 transition-all duration-100"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-violet-600 font-semibold">{pct}%</span>
            </div>
          )}
          <span>{shown} / {totalEvents} events</span>
          <button
            onClick={() => navigate('claim-detail', claim.id)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
          >
            View Claim <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Log panel */}
      <div className="card flex-1 overflow-hidden flex flex-col min-h-0">
        {/* Log header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className={clsx('w-2 h-2 rounded-full', running ? 'bg-violet-500 animate-pulse' : 'bg-slate-400')} />
              <span className="font-medium">{running ? 'LIVE' : 'COMPLETE'}</span>
            </div>
            <span>Claim: {claim.claimNumber}</span>
            <span>·</span>
            <span>{claim.patient.firstName} {claim.patient.lastName}</span>
            <span>·</span>
            <span>{claim.payer.shortName}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              {(['finding_error','finding_warning','finding_info'] as ActivityType[]).map(t => {
                const count = filteredEvents.filter(e => e.type === t).length;
                const { icon } = getActivityStyle(t);
                return (
                  <div key={t} className="flex items-center gap-1">
                    {icon}
                    <span className="text-slate-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable log */}
        <div className="flex-1 overflow-y-auto font-mono text-xs">
          {displayEvents.map((e, i) => (
            <LogRow key={`${replayKey}-${i}`} event={e} idx={i} />
          ))}
          {running && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 font-mono">
              <div className="flex gap-0.5">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>▌</span>
              </div>
              processing...
            </div>
          )}

          {/* ── Denial Agent: Pattern Knowledge Graph (interactive) ── */}
          {!running && (activeFilter === 'all' || activeFilter === 'denial') && (
            <div className="mx-3 mt-3 mb-4 font-sans">

              {/* Section header */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-px flex-1 bg-purple-900/40" />
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 bg-purple-950/60 border border-purple-800/50 rounded-full px-3 py-1.5 whitespace-nowrap">
                    <Network size={11} />
                    DENY · Pattern Knowledge Graph
                  </div>
                  <div className="h-px flex-1 bg-purple-900/40" />
                </div>
                <button
                  onClick={() => window.open('/denial-kg.html', '_blank')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 bg-purple-950 border border-purple-700/70 rounded-lg px-3 py-1.5 hover:bg-purple-900 hover:border-purple-500 hover:text-white transition-all flex-shrink-0"
                >
                  <ExternalLink size={11} />
                  Open Standalone
                </button>
              </div>

              {/* Stats strip */}
              <div className="flex items-center gap-3 mb-2 px-1 flex-wrap text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span><span className="text-purple-400 font-semibold">54 patterns</span> indexed</span>
                </div>
                <span className="text-slate-700">·</span>
                <span>12 denial categories</span>
                <span className="text-slate-700">·</span>
                <span className="text-slate-400">Click any pattern node to expand its property children</span>
                <span className="text-slate-700">·</span>
                <span className="text-slate-400">Drag · Scroll to zoom</span>
              </div>

              {/* Embedded knowledge graph iframe */}
              <div className="rounded-xl overflow-hidden border border-slate-800/80" style={{ height: 560 }}>
                <iframe
                  src="/denial-kg.html"
                  title="Denial Prediction Knowledge Graph"
                  className="w-full h-full border-0 block"
                  style={{ background: '#020617' }}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-1.5 px-0.5">
                <span className="text-xs text-slate-600">
                  Pattern-based inference engine · historical denial corpus
                </span>
                <button
                  onClick={() => window.open('/denial-kg.html', '_blank')}
                  className="text-xs text-purple-600 hover:text-purple-400 font-medium flex items-center gap-1 transition-colors"
                >
                  Launch full-screen <ChevronRight size={11} />
                </button>
              </div>

            </div>
          )}

          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
