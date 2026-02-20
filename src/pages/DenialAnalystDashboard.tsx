import { useApp } from '../context/AppContext';
import {
  TrendingDown, TrendingUp, AlertTriangle, DollarSign,
  FileCheck, Clock, ChevronRight, Bot, Zap, Activity
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import clsx from 'clsx';
import type { RiskLevel } from '../types';

const RISK_COLORS: Record<RiskLevel, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#10b981',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function RiskBadge({ level }: { level: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };
  return (
    <span className={clsx('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border', styles[level])}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', {
        'bg-red-500': level === 'critical',
        'bg-orange-500': level === 'high',
        'bg-amber-500': level === 'medium',
        'bg-emerald-500': level === 'low',
      })} />
      {RISK_LABELS[level]}
    </span>
  );
}

const pieData = [
  { name: 'Critical', value: 4, color: '#ef4444' },
  { name: 'High', value: 6, color: '#f97316' },
  { name: 'Medium', value: 12, color: '#f59e0b' },
  { name: 'Low', value: 22, color: '#10b981' },
];

export default function DenialAnalystDashboard() {
  const { claims, config, navigate } = useApp();
  const highRiskClaims = claims.filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high');
  const totalChargesAtRisk = highRiskClaims.reduce((s, c) => s + c.totalCharges, 0);

  const kpis = [
    {
      label: "Claims in Review",
      value: "44",
      delta: "+8 today",
      positive: false,
      icon: <FileCheck size={20} />,
      color: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
    },
    {
      label: "High/Critical Risk",
      value: `${highRiskClaims.length}`,
      delta: "Need immediate action",
      positive: false,
      icon: <AlertTriangle size={20} />,
      color: "bg-red-50 text-red-600",
      border: "border-red-100",
    },
    {
      label: "Revenue at Risk",
      value: `$${(totalChargesAtRisk / 1000).toFixed(0)}K`,
      delta: "From high/critical claims",
      positive: false,
      icon: <DollarSign size={20} />,
      color: "bg-amber-50 text-amber-600",
      border: "border-amber-100",
    },
    {
      label: "Revenue Saved MTD",
      value: "$127K",
      delta: "+$34K vs last month",
      positive: true,
      icon: <TrendingDown size={20} />,
      color: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100",
    },
    {
      label: "Prediction Accuracy",
      value: "94.2%",
      delta: "+1.8% vs last month",
      positive: true,
      icon: <Zap size={20} />,
      color: "bg-violet-50 text-violet-600",
      border: "border-violet-100",
    },
    {
      label: "Avg Processing Time",
      value: "2.3 min",
      delta: "Per claim (all agents)",
      positive: true,
      icon: <Clock size={20} />,
      color: "bg-cyan-50 text-cyan-600",
      border: "border-cyan-100",
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
          <p className="font-semibold text-slate-700 mb-1">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  const agentActivity = [
    { agent: "Denial Prediction Agent", action: "CLM-2025-001 flagged CRITICAL", time: "2 min ago", level: "critical" },
    { agent: "Eligibility Agent", action: "CLM-2025-002 — PA required, not obtained", time: "5 min ago", level: "high" },
    { agent: "Medical Coding Agent", action: "CLM-2025-007 — CPT age mismatch detected", time: "8 min ago", level: "medium" },
    { agent: "Charge Review Agent", action: "CLM-2025-006 — charge above UCR threshold", time: "12 min ago", level: "medium" },
    { agent: "Clinical Doc Agent", action: "CLM-2025-003 — missing imaging reports", time: "15 min ago", level: "high" },
    { agent: "Demographics Agent", action: "CLM-2025-001 — ZIP code mismatch flagged", time: "18 min ago", level: "low" },
  ];

  const levelColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Denial Analyst Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">AI-powered denial risk monitoring • Feb 20, 2025</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
            <Activity size={14} className="text-emerald-600 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">All 6 Agents Active</span>
          </div>
          <button
            onClick={() => navigate('claims')}
            className="btn-primary flex items-center gap-2"
          >
            View All Claims <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={clsx('card p-4 border', kpi.border)}>
            <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center mb-3', kpi.color)}>
              {kpi.icon}
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5">{kpi.value}</div>
            <div className="text-xs font-medium text-slate-600 mb-1">{kpi.label}</div>
            <div className={clsx('text-xs', kpi.positive ? 'text-emerald-600' : 'text-slate-400')}>
              {kpi.positive && '↑ '}{kpi.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Denial Trend */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900">Denial Trend — Last 12 Months</h2>
              <p className="text-xs text-slate-400 mt-0.5">Actual denials vs AI-predicted risks vs prevented</p>
            </div>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">↓ 52% reduction</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={config.denialTrend}>
              <defs>
                <linearGradient id="prevented" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="actual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#cbd5e1" />
              <YAxis tick={{ fontSize: 11 }} stroke="#cbd5e1" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="predictedDenials" name="At-Risk Claims" stroke="#f97316" strokeWidth={2} fill="none" strokeDasharray="4 2" />
              <Area type="monotone" dataKey="actualDenials" name="Actual Denials" stroke="#ef4444" strokeWidth={2} fill="url(#actual)" />
              <Area type="monotone" dataKey="prevented" name="Prevented by AI" stroke="#10b981" strokeWidth={2} fill="url(#prevented)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="card p-5">
          <div className="mb-4">
            <h2 className="font-semibold text-slate-900">Risk Distribution</h2>
            <p className="text-xs text-slate-400 mt-0.5">Current claims in pipeline</p>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} claims`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-500">{d.name}</span>
                <span className="ml-auto font-semibold text-slate-700">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Denial Reasons */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900">Top Denial Reasons YTD</h2>
              <p className="text-xs text-slate-400 mt-0.5">Frequency of denial root causes</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={config.topDenialReasons} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#cbd5e1" />
              <YAxis dataKey="reason" type="category" tick={{ fontSize: 10 }} width={140} stroke="#cbd5e1" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Claims" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                {config.topDenialReasons.map((entry, index) => (
                  <Cell key={index} fill={['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4'][index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Activity Feed */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900">Agent Activity Feed</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time AI agent actions</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <Bot size={13} />
              Live
            </div>
          </div>
          <div className="space-y-2">
            {agentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <span className={clsx('text-xs font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 mt-0.5', levelColors[a.level])}>
                  {a.level.toUpperCase().slice(0, 4)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700">{a.agent}</p>
                  <p className="text-xs text-slate-500 truncate">{a.action}</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High Risk Claims Table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-900">High Priority Claims — Immediate Action Required</h2>
            <p className="text-xs text-slate-400 mt-0.5">Claims with denial risk score &gt;60 — sorted by risk</p>
          </div>
          <button onClick={() => navigate('claims')} className="btn-outline flex items-center gap-1 text-xs">
            View All <ChevronRight size={13} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Claim #", "Patient", "Payer", "Provider", "DOS", "Procedure", "Charges", "Risk Score", "Primary Risk", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 pb-2 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {claims
                .filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high')
                .sort((a, b) => b.riskScore - a.riskScore)
                .map(claim => (
                  <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => navigate('claim-detail', claim.id)}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        {claim.claimNumber}
                      </button>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-slate-900 whitespace-nowrap">{claim.patient.firstName} {claim.patient.lastName}</div>
                      <div className="text-xs text-slate-400">{claim.patient.memberId}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="text-xs font-medium text-slate-700 whitespace-nowrap">{claim.payer.shortName}</div>
                      <div className="text-xs text-slate-400">{claim.payer.planType}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="text-xs text-slate-700 whitespace-nowrap">{claim.provider.name.split(', ')[0]}</div>
                      <div className="text-xs text-slate-400">{claim.provider.specialty}</div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-600 whitespace-nowrap">{claim.dateOfService}</td>
                    <td className="py-3 pr-4">
                      <div className="text-xs text-slate-700">{claim.procedureCodes[0].cpt}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[100px]">{claim.procedureCodes[0].description.substring(0, 25)}...</div>
                    </td>
                    <td className="py-3 pr-4 text-xs font-semibold text-slate-800 whitespace-nowrap">
                      ${claim.totalCharges.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-16">
                          <div
                            className={clsx('h-1.5 rounded-full', {
                              'bg-red-500': claim.riskLevel === 'critical',
                              'bg-orange-500': claim.riskLevel === 'high',
                              'bg-amber-500': claim.riskLevel === 'medium',
                              'bg-emerald-500': claim.riskLevel === 'low',
                            })}
                            style={{ width: `${claim.riskScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{claim.riskScore}</span>
                      </div>
                      <RiskBadge level={claim.riskLevel} />
                    </td>
                    <td className="py-3 pr-4">
                      <div className="text-xs text-slate-600 max-w-[140px]">{claim.predictedDenialReason}</div>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => navigate('claim-detail', claim.id)}
                        className="btn-primary text-xs py-1.5 whitespace-nowrap"
                      >
                        Review →
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
