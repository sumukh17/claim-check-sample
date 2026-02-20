import { useApp } from '../context/AppContext';
import { FileText, CheckCircle, Clock, AlertCircle, Plus, ChevronRight, RefreshCw, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import clsx from 'clsx';

const pipelineStages = [
  { stage: "New Intake", count: 8, color: "bg-slate-400", icon: <FileText size={16} /> },
  { stage: "Demographics Check", count: 6, color: "bg-blue-400", icon: <Users size={16} /> },
  { stage: "Eligibility Verify", count: 5, color: "bg-cyan-400", icon: <CheckCircle size={16} /> },
  { stage: "Clinical Doc Review", count: 7, color: "bg-violet-400", icon: <RefreshCw size={16} /> },
  { stage: "Medical Coding", count: 4, color: "bg-amber-400", icon: <RefreshCw size={16} /> },
  { stage: "Charge Review", count: 6, color: "bg-orange-400", icon: <RefreshCw size={16} /> },
  { stage: "Denial Risk Check", count: 3, color: "bg-red-400", icon: <AlertCircle size={16} /> },
  { stage: "Ready to Submit", count: 5, color: "bg-emerald-400", icon: <CheckCircle size={16} /> },
];

const dailyVolume = [
  { day: "Mon", submitted: 42, pending: 12 },
  { day: "Tue", submitted: 38, pending: 8 },
  { day: "Wed", submitted: 51, pending: 15 },
  { day: "Thu", submitted: 44, pending: 11 },
  { day: "Fri", submitted: 36, pending: 9 },
  { day: "Sat", submitted: 18, pending: 4 },
  { day: "Sun", submitted: 12, pending: 2 },
];

const payerDistribution = [
  { name: "BCBS IL", value: 14, color: "#1e40af" },
  { name: "Aetna", value: 8, color: "#7c3aed" },
  { name: "UHC", value: 9, color: "#0891b2" },
  { name: "Medicare", value: 6, color: "#0369a1" },
  { name: "Medicaid", value: 4, color: "#059669" },
  { name: "Humana", value: 3, color: "#d97706" },
];

export default function ClaimsIntakeDashboard() {
  const { claims, navigate } = useApp();
  const newClaims = claims.filter(c => c.status === 'new');
  const inReview = claims.filter(c => c.status === 'in_review');
  const readyToSubmit = claims.filter(c => c.status === 'ready_to_submit');

  const statusStyle: Record<string, string> = {
    new: 'bg-slate-100 text-slate-700 border-slate-200',
    in_review: 'bg-blue-100 text-blue-700 border-blue-200',
    ready_to_submit: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    submitted: 'bg-violet-100 text-violet-700 border-violet-200',
    denied: 'bg-red-100 text-red-700 border-red-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
  };
  const statusLabel: Record<string, string> = {
    new: 'New', in_review: 'In Review', ready_to_submit: 'Ready', submitted: 'Submitted', denied: 'Denied', approved: 'Approved',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Claims Intake Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, Marcus • Feb 20, 2025</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline flex items-center gap-2">
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={14} /> New Claim
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "New Today", value: "18", sub: "8 awaiting intake", icon: <FileText size={20} />, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
          { label: "In Processing", value: `${inReview.length}`, sub: "Across 6 agent stages", icon: <RefreshCw size={20} />, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
          { label: "Ready to Submit", value: `${readyToSubmit.length}`, sub: "All agents cleared", icon: <CheckCircle size={20} />, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
          { label: "Avg Processing", value: "2.3 hrs", sub: "Door to submission", icon: <Clock size={20} />, color: "bg-violet-50 text-violet-600", border: "border-violet-100" },
        ].map(k => (
          <div key={k.label} className={clsx('card p-4 border', k.border)}>
            <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center mb-3', k.color)}>{k.icon}</div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5">{k.value}</div>
            <div className="text-xs font-medium text-slate-600 mb-1">{k.label}</div>
            <div className="text-xs text-slate-400">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Pipeline Visualization */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-slate-900">AI Agent Processing Pipeline</h2>
            <p className="text-xs text-slate-400 mt-0.5">Claims currently in each processing stage</p>
          </div>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {pipelineStages.reduce((s, p) => s + p.count, 0)} active claims
          </span>
        </div>
        <div className="relative">
          {/* Pipeline flow */}
          <div className="flex items-center gap-1 overflow-x-auto pb-4">
            {pipelineStages.map((stage, i) => (
              <div key={stage.stage} className="flex items-center gap-1 flex-shrink-0">
                <div className="text-center">
                  <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center text-white mx-auto mb-2', stage.color)}>
                    {stage.icon}
                  </div>
                  <div className="text-lg font-bold text-slate-800">{stage.count}</div>
                  <div className="text-xs text-slate-500 text-center max-w-[80px] leading-tight">{stage.stage}</div>
                </div>
                {i < pipelineStages.length - 1 && (
                  <div className="flex items-center mb-6">
                    <div className="w-6 h-0.5 bg-slate-200" />
                    <div className="text-slate-300">›</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Volume */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Weekly Claim Volume</h2>
          <p className="text-xs text-slate-400 mb-4">Submitted vs pending claims this week</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#cbd5e1" />
              <YAxis tick={{ fontSize: 11 }} stroke="#cbd5e1" />
              <Tooltip />
              <Bar dataKey="submitted" name="Submitted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payer Distribution */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Claims by Payer</h2>
          <p className="text-xs text-slate-400 mb-4">Current claims in pipeline by insurance payer</p>
          <div className="flex items-center">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={payerDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="none">
                  {payerDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2 pl-4">
              {payerDistribution.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-slate-600 flex-1">{d.name}</span>
                  <span className="text-xs font-semibold text-slate-800">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Claims Queue */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-900">Intake Queue — Action Required</h2>
            <p className="text-xs text-slate-400 mt-0.5">Claims needing your review today</p>
          </div>
          <button onClick={() => navigate('claims')} className="btn-outline flex items-center gap-1 text-xs">
            Full List <ChevronRight size={13} />
          </button>
        </div>
        <div className="space-y-2">
          {claims.slice(0, 6).map(claim => (
            <div key={claim.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
                  {claim.patient.firstName[0]}{claim.patient.lastName[0]}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-800">{claim.patient.firstName} {claim.patient.lastName}</span>
                  <span className={clsx('text-xs px-1.5 py-0.5 rounded border font-medium', statusStyle[claim.status])}>
                    {statusLabel[claim.status]}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {claim.claimNumber} • {claim.payer.shortName} • {claim.procedureCodes[0].cpt}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold text-slate-800">${claim.totalCharges.toLocaleString()}</div>
                <div className="text-xs text-slate-400">{claim.dateOfService}</div>
              </div>
              <div className={clsx('w-2.5 h-2.5 rounded-full flex-shrink-0', {
                'bg-red-500': claim.riskLevel === 'critical',
                'bg-orange-500': claim.riskLevel === 'high',
                'bg-amber-500': claim.riskLevel === 'medium',
                'bg-emerald-500': claim.riskLevel === 'low',
              })} title={`Risk: ${claim.riskLevel}`} />
              <button onClick={() => navigate('claim-detail', claim.id)} className="btn-outline text-xs py-1.5 flex-shrink-0">
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
