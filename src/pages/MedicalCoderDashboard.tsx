import { useApp } from '../context/AppContext';
import { Code2, AlertTriangle, CheckCircle, Clock, ChevronRight, BookOpen, TrendingUp, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import clsx from 'clsx';

const codeAccuracyData = [
  { category: "CPT Accuracy", score: 97 },
  { category: "ICD-10 Specificity", score: 89 },
  { category: "Modifier Usage", score: 82 },
  { category: "Bundling Compliance", score: 91 },
  { category: "Laterality", score: 95 },
  { category: "Units Accuracy", score: 98 },
];

const codingQueue = [
  { id: "CLM-2025-001", patient: "R. Martinez", procedure: "27447 - Total Knee Arthroplasty", issue: "Modifier conflict on CPT 20680", severity: "error", time: "Urgent" },
  { id: "CLM-2025-002", patient: "J. Thompson", procedure: "93306 - Echocardiography", issue: "No issues flagged", severity: "info", time: "Normal" },
  { id: "CLM-2025-004", patient: "D. Kim", procedure: "45378/45382 - Colonoscopy", issue: "Missing modifier -59 on 45382", severity: "error", time: "High" },
  { id: "CLM-2025-006", patient: "T. Anderson", procedure: "22612 - Spinal Fusion", issue: "Coding accurate, PA pending", severity: "warning", time: "Normal" },
  { id: "CLM-2025-007", patient: "L. Garcia", procedure: "99396 - Preventive Exam", issue: "CPT age mismatch — use 99395", severity: "error", time: "High" },
  { id: "CLM-2025-010", patient: "M. Davis", procedure: "29881 - Knee Arthroscopy", issue: "RT modifier correct, verify ICD-10", severity: "info", time: "Low" },
];

const weeklyProductivity = [
  { day: "Mon", coded: 22, reviewed: 18 },
  { day: "Tue", coded: 28, reviewed: 25 },
  { day: "Wed", coded: 19, reviewed: 22 },
  { day: "Thu", coded: 31, reviewed: 29 },
  { day: "Fri", coded: 25, reviewed: 24 },
];

const radarData = [
  { subject: "CPT", A: 97, fullMark: 100 },
  { subject: "ICD-10", A: 89, fullMark: 100 },
  { subject: "Modifiers", A: 82, fullMark: 100 },
  { subject: "Bundling", A: 91, fullMark: 100 },
  { subject: "Laterality", A: 95, fullMark: 100 },
  { subject: "Units", A: 98, fullMark: 100 },
];

export default function MedicalCoderDashboard() {
  const { claims, navigate } = useApp();

  const codingFlags = claims.filter(c => c.agentResults.medicalCoding.score < 80);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Coder Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, Priya • Feb 20, 2025 • CPC Certified</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline flex items-center gap-2">
            <BookOpen size={14} /> Coding Guidelines
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Zap size={14} /> AI Code Suggest
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Coding Queue", value: "22", sub: "Claims awaiting review", icon: <Code2 size={20} />, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
          { label: "AI Flags Today", value: `${codingFlags.length}`, sub: "Coding issues detected", icon: <AlertTriangle size={20} />, color: "bg-red-50 text-red-600", border: "border-red-100" },
          { label: "Code Accuracy", value: "97.2%", sub: "+0.5% vs last week", icon: <CheckCircle size={20} />, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
          { label: "Avg Review Time", value: "8.4 min", sub: "Per claim with AI assist", icon: <Clock size={20} />, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
        ].map(k => (
          <div key={k.label} className={clsx('card p-4 border', k.border)}>
            <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center mb-3', k.color)}>{k.icon}</div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5">{k.value}</div>
            <div className="text-xs font-medium text-slate-600 mb-1">{k.label}</div>
            <div className="text-xs text-slate-400">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Accuracy Radar */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Coding Quality Radar</h2>
          <p className="text-xs text-slate-400 mb-2">Accuracy scores by category</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar name="Accuracy" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Productivity */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-slate-900 mb-1">Weekly Coding Productivity</h2>
          <p className="text-xs text-slate-400 mb-4">Claims coded vs reviewed this week</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyProductivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#cbd5e1" />
              <YAxis tick={{ fontSize: 11 }} stroke="#cbd5e1" />
              <Tooltip />
              <Bar dataKey="coded" name="Coded" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reviewed" name="Reviewed" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accuracy Breakdown */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Accuracy Breakdown by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {codeAccuracyData.map(d => (
            <div key={d.category} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <div className="text-xs font-medium text-slate-600 mb-1">{d.category}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                    <div
                      className={clsx('h-1.5 rounded-full', d.score >= 95 ? 'bg-emerald-500' : d.score >= 85 ? 'bg-blue-500' : 'bg-amber-500')}
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-8">{d.score}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coding Queue */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-900">AI-Flagged Coding Issues</h2>
            <p className="text-xs text-slate-400 mt-0.5">Issues detected by Medical Coding Agent requiring your review</p>
          </div>
          <button onClick={() => navigate('claims')} className="btn-outline flex items-center gap-1 text-xs">
            Full Queue <ChevronRight size={13} />
          </button>
        </div>
        <div className="space-y-2">
          {codingQueue.map(item => {
            const severityStyle = {
              error: 'bg-red-100 text-red-700 border-red-200',
              warning: 'bg-amber-100 text-amber-700 border-amber-200',
              info: 'bg-blue-100 text-blue-700 border-blue-200',
            }[item.severity];
            const severityDot = {
              error: 'bg-red-500',
              warning: 'bg-amber-500',
              info: 'bg-blue-500',
            }[item.severity];
            return (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', severityDot)} />
                <div className="w-28 flex-shrink-0">
                  <button onClick={() => navigate('claim-detail', item.id)} className="text-blue-600 font-semibold text-xs hover:underline">{item.id}</button>
                  <div className="text-xs text-slate-400">{item.patient}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-700">{item.procedure}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.issue}</div>
                </div>
                <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded border flex-shrink-0', severityStyle)}>
                  {item.severity.toUpperCase()}
                </span>
                <span className={clsx('text-xs font-medium flex-shrink-0 w-14 text-right', {
                  'text-red-600': item.time === 'Urgent',
                  'text-orange-600': item.time === 'High',
                  'text-slate-500': item.time === 'Normal' || item.time === 'Low',
                })}>{item.time}</span>
                <button onClick={() => navigate('claim-detail', item.id)} className="btn-outline text-xs py-1.5 flex-shrink-0">
                  Fix →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
