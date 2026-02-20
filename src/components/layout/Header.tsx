import { useApp } from '../../context/AppContext';
import { Bell, Search, ChevronRight, Home } from 'lucide-react';
import type { PageType } from '../../types';

const pageTitles: Record<PageType, string> = {
  login: 'Login',
  dashboard: 'Dashboard',
  claims: 'Claims Management',
  'claim-detail': 'Claim Detail',
  settings: 'Settings & Configuration',
  analytics: 'Analytics',
};

export default function Header() {
  const { currentPage, selectedClaimId, navigate } = useApp();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex-1 flex items-center gap-2 text-sm">
        <button onClick={() => navigate('dashboard')} className="text-slate-400 hover:text-slate-600">
          <Home size={15} />
        </button>
        <ChevronRight size={14} className="text-slate-300" />
        {currentPage === 'claim-detail' ? (
          <>
            <button onClick={() => navigate('claims')} className="text-slate-500 hover:text-slate-700 font-medium">
              Claims
            </button>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-slate-800 font-semibold">{selectedClaimId}</span>
          </>
        ) : (
          <span className="text-slate-800 font-semibold">{pageTitles[currentPage]}</span>
        )}
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search claims, patients..."
          className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700">
        <Bell size={18} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* Date/Time */}
      <div className="hidden lg:block text-xs text-slate-400 border-l border-slate-200 pl-4">
        <div className="font-medium text-slate-600">Feb 20, 2025</div>
        <div>09:42 AM CST</div>
      </div>
    </header>
  );
}
