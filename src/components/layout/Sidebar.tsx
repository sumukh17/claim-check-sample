import { useApp } from '../../context/AppContext';
import type { PageType, PersonaType } from '../../types';
import {
  LayoutDashboard, FileText, Settings,
  LogOut, Bot, ChevronRight, Shield, User, Code2
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  label: string;
  page: PageType;
  icon: React.ReactNode;
  badge?: number;
}

const personaConfig: Record<PersonaType, { label: string; role: string; color: string; icon: React.ReactNode; navItems: NavItem[] }> = {
  denial_analyst: {
    label: "Sarah Chen",
    role: "Denial Analyst",
    color: "from-violet-600 to-purple-700",
    icon: <Shield size={20} />,
    navItems: [
      { label: "Dashboard", page: "dashboard", icon: <LayoutDashboard size={18} /> },
      { label: "All Claims", page: "claims", icon: <FileText size={18} />, badge: 10 },
      { label: "Settings", page: "settings", icon: <Settings size={18} /> },
    ],
  },
  claims_intake: {
    label: "Marcus Johnson",
    role: "Claims Intake Specialist",
    color: "from-blue-600 to-cyan-700",
    icon: <User size={20} />,
    navItems: [
      { label: "Dashboard", page: "dashboard", icon: <LayoutDashboard size={18} /> },
      { label: "All Claims", page: "claims", icon: <FileText size={18} />, badge: 10 },
      { label: "Settings", page: "settings", icon: <Settings size={18} /> },
    ],
  },
  medical_coder: {
    label: "Priya Patel",
    role: "Medical Coder",
    color: "from-emerald-600 to-teal-700",
    icon: <Code2 size={20} />,
    navItems: [
      { label: "Dashboard", page: "dashboard", icon: <LayoutDashboard size={18} /> },
      { label: "All Claims", page: "claims", icon: <FileText size={18} />, badge: 10 },
      { label: "Settings", page: "settings", icon: <Settings size={18} /> },
    ],
  },
};

const agentList = [
  { name: "Demographics Agent", status: "active", color: "bg-blue-400" },
  { name: "Eligibility Agent", status: "active", color: "bg-emerald-400" },
  { name: "Clinical Doc Agent", status: "active", color: "bg-violet-400" },
  { name: "Medical Coding Agent", status: "active", color: "bg-amber-400" },
  { name: "Charge Review Agent", status: "active", color: "bg-cyan-400" },
  { name: "Denial Prediction Agent", status: "processing", color: "bg-red-400" },
];

export default function Sidebar() {
  const { persona, currentPage, navigate, logout } = useApp();
  if (!persona) return null;

  const cfg = personaConfig[persona];

  return (
    <aside className="w-64 flex-shrink-0 bg-brand-950 text-white flex flex-col h-screen overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center font-bold text-sm">
            CG
          </div>
          <div>
            <div className="font-bold text-sm text-white">ClaimGuard AI</div>
            <div className="text-xs text-slate-400">RCM Denial Prevention</div>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className={`rounded-lg bg-gradient-to-br ${cfg.color} p-3 flex items-center gap-3`}>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{cfg.label}</div>
            <div className="text-xs text-white/70 truncate">{cfg.role}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="mb-6">
          <p className="px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</p>
          {cfg.navItems.map(item => (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 text-left transition-all',
                currentPage === item.page
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <span className={clsx('flex-shrink-0', currentPage === item.page ? 'text-blue-400' : 'text-slate-500')}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {currentPage === item.page && <ChevronRight size={14} className="text-blue-400" />}
            </button>
          ))}
        </div>

        {/* AI Agents */}
        <div>
          <p className="px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Bot size={12} /> AI Agents
          </p>
          <div className="space-y-1.5">
            {agentList.map(agent => (
              <div key={agent.name} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/5">
                <div className="relative flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${agent.color}`} />
                  {agent.status === 'processing' && (
                    <div className={`absolute inset-0 w-2 h-2 rounded-full ${agent.color} agent-processing`} />
                  )}
                </div>
                <span className="text-xs text-slate-400 truncate">{agent.name}</span>
                {agent.status === 'processing' && (
                  <span className="ml-auto text-xs text-amber-400 font-medium">Live</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
