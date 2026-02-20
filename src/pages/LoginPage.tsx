import { useApp } from '../context/AppContext';
import type { PersonaType } from '../types';
import { Shield, User, Code2, ArrowRight, CheckCircle, Bot, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

interface PersonaCard {
  type: PersonaType;
  name: string;
  role: string;
  description: string;
  responsibilities: string[];
  primaryAgent: string;
  gradient: string;
  border: string;
  icon: React.ReactNode;
  stats: { label: string; value: string }[];
}

const personas: PersonaCard[] = [
  {
    type: 'claims_intake',
    name: 'Marcus Johnson',
    role: 'Claims Intake Specialist',
    description: 'Manages the initial intake, validation, and workflow routing of incoming claims before processing.',
    responsibilities: [
      'Verify patient & payer data',
      'Route claims to appropriate queues',
      'Monitor claim submission pipeline',
      'Coordinate with clinical staff',
    ],
    primaryAgent: 'Demographics Agent · Eligibility Agent',
    gradient: 'from-blue-500 to-cyan-600',
    border: 'border-blue-200 hover:border-blue-400',
    icon: <User size={28} />,
    stats: [
      { label: "Queue Today", value: "34" },
      { label: "Processed", value: "18" },
      { label: "Pending", value: "16" },
    ],
  },
  {
    type: 'denial_analyst',
    name: 'Sarah Chen',
    role: 'Denial Analyst',
    description: 'Analyzes denial risk patterns, reviews AI predictions, and drives corrective actions to prevent revenue loss.',
    responsibilities: [
      'Review high-risk claim predictions',
      'Assign corrective action workflows',
      'Track prevention metrics & KPIs',
      'Trend analysis and payer behavior',
    ],
    primaryAgent: 'Denial Prediction Agent',
    gradient: 'from-violet-500 to-purple-700',
    border: 'border-violet-200 hover:border-violet-400',
    icon: <Shield size={28} />,
    stats: [
      { label: "High Risk", value: "12" },
      { label: "Prevented", value: "$42K" },
      { label: "Accuracy", value: "94%" },
    ],
  },
  {
    type: 'medical_coder',
    name: 'Priya Patel',
    role: 'Medical Coder (CPC)',
    description: 'Reviews and validates medical coding accuracy, resolves code-related denial risks identified by the AI.',
    responsibilities: [
      'Review CPT & ICD-10 code accuracy',
      'Fix modifier and bundling issues',
      'Ensure coding guideline compliance',
      'Respond to coding-related AI flags',
    ],
    primaryAgent: 'Medical Coding Agent · Clinical Doc Agent',
    gradient: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-200 hover:border-emerald-400',
    icon: <Code2 size={28} />,
    stats: [
      { label: "Coding Queue", value: "22" },
      { label: "Flags Today", value: "8" },
      { label: "Accuracy", value: "97%" },
    ],
  },
];

export default function LoginPage() {
  const { setPersona } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex flex-col">
      {/* Hero Header */}
      <header className="px-8 py-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center font-bold text-white">
          CG
        </div>
        <div>
          <span className="text-white font-bold text-xl">ClaimGuard AI</span>
          <span className="ml-3 text-xs text-blue-300 bg-blue-900/40 px-2 py-0.5 rounded-full border border-blue-700">
            RCM Denial Prevention Platform
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          All AI Agents Online
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-8">
        <div className="text-center mb-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 rounded-full px-4 py-1.5 mb-6">
            <Bot size={14} className="text-blue-400" />
            <span className="text-sm text-blue-300 font-medium">Powered by 6 Specialized AI Agents</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Predict & Prevent <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Claims Denials
            </span>{' '}
            Before Submission
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            AI-powered denial prediction analyzes claims against historical patterns,
            payer behavior, and clinical data to flag risk — and prescribe corrective actions — before you submit.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            {[
              { icon: <TrendingDown size={16} />, value: "52%", label: "Reduction in Denials" },
              { icon: <CheckCircle size={16} />, value: "94%", label: "Prediction Accuracy" },
              { icon: <Bot size={16} />, value: "$2.4M", label: "Revenue Recovered YTD" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-blue-400 mb-1">{s.icon}</div>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Persona Cards */}
        <div className="w-full max-w-5xl">
          <p className="text-center text-sm text-slate-500 mb-5 font-medium uppercase tracking-wider">
            Select Your Role to Continue
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {personas.map(p => (
              <button
                key={p.type}
                onClick={() => setPersona(p.type)}
                className={clsx(
                  'group text-left bg-white/5 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-200',
                  'hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl',
                  p.border
                )}
              >
                {/* Card header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
                    {p.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-base">{p.name}</div>
                    <div className={`text-xs font-semibold bg-gradient-to-r ${p.gradient} bg-clip-text text-transparent`}>
                      {p.role}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{p.primaryAgent}</div>
                  </div>
                </div>

                <p className="text-sm text-slate-400 mb-4 leading-relaxed">{p.description}</p>

                {/* Responsibilities */}
                <ul className="space-y-1.5 mb-5">
                  {p.responsibilities.map(r => (
                    <li key={r} className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>

                {/* Stats */}
                <div className="flex gap-3 mb-4">
                  {p.stats.map(s => (
                    <div key={s.label} className="flex-1 bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-white">{s.value}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className={`flex items-center justify-between bg-gradient-to-r ${p.gradient} rounded-lg px-4 py-2.5 group-hover:shadow-lg transition-all`}>
                  <span className="text-white text-sm font-semibold">Sign in as {p.role.split(' ')[0]}</span>
                  <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Agent badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {[
            "Demographics Agent", "Eligibility Agent", "Clinical Doc Agent",
            "Medical Coding Agent", "Charge Review Agent", "Denial Prediction Agent"
          ].map(a => (
            <div key={a} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-400">{a}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-600">
        MedCore Health Systems · ClaimGuard AI v2.4.1 · HIPAA Compliant · SOC 2 Type II Certified
      </footer>
    </div>
  );
}
