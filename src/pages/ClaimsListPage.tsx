import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { RiskLevel, ClaimStatus } from '../types';
import { Search, Filter, ChevronDown, Eye, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

type SortField = 'riskScore' | 'totalCharges' | 'dateOfService' | 'createdAt';
type SortDir = 'asc' | 'desc';

const riskBadge: Record<RiskLevel, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const statusBadge: Record<ClaimStatus, string> = {
  new: 'bg-slate-100 text-slate-700',
  in_review: 'bg-blue-100 text-blue-700',
  ready_to_submit: 'bg-emerald-100 text-emerald-700',
  submitted: 'bg-violet-100 text-violet-700',
  approved: 'bg-green-100 text-green-700',
  denied: 'bg-red-100 text-red-700',
};
const statusLabel: Record<ClaimStatus, string> = {
  new: 'New', in_review: 'In Review', ready_to_submit: 'Ready to Submit',
  submitted: 'Submitted', approved: 'Approved', denied: 'Denied',
};

export default function ClaimsListPage() {
  const { claims, navigate } = useApp();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [payerFilter, setPayerFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('riskScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const payers = useMemo(() => Array.from(new Set(claims.map(c => c.payer.shortName))), [claims]);

  const filtered = useMemo(() => {
    return claims
      .filter(c => {
        if (riskFilter !== 'all' && c.riskLevel !== riskFilter) return false;
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        if (payerFilter !== 'all' && c.payer.shortName !== payerFilter) return false;
        if (search) {
          const s = search.toLowerCase();
          const matches = c.claimNumber.toLowerCase().includes(s) ||
            `${c.patient.firstName} ${c.patient.lastName}`.toLowerCase().includes(s) ||
            c.payer.shortName.toLowerCase().includes(s) ||
            c.procedureCodes.some(p => p.cpt.includes(s));
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let av = a[sortField as keyof typeof a] as number | string;
        let bv = b[sortField as keyof typeof b] as number | string;
        if (typeof av === 'string') av = av.localeCompare(bv as string);
        const cmp = typeof av === 'number' ? av - (bv as number) : (av as number);
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [claims, search, riskFilter, statusFilter, payerFilter, sortField, sortDir]);

  const toggleSort = (f: SortField) => {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <ChevronDown size={12} className={clsx('ml-1 inline transition-transform', {
      'rotate-180': sortField === field && sortDir === 'asc',
      'opacity-30': sortField !== field,
    })} />
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Claims Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} of {claims.length} claims shown</p>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'critical', 'high'].map(r => (
            <button
              key={r}
              onClick={() => setRiskFilter(r as RiskLevel | 'all')}
              className={clsx('text-xs px-3 py-1.5 rounded-lg font-medium border transition-all', {
                'bg-brand-800 text-white border-brand-800': riskFilter === r && r === 'all',
                'bg-red-600 text-white border-red-600': riskFilter === r && r === 'critical',
                'bg-orange-500 text-white border-orange-500': riskFilter === r && r === 'high',
                'bg-white text-slate-600 border-slate-200 hover:bg-slate-50': riskFilter !== r,
              })}
            >
              {r === 'all' ? 'All Claims' : r.charAt(0).toUpperCase() + r.slice(1) + ' Risk'}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search claims, patients, CPT codes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400" />
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value as RiskLevel | 'all')}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ClaimStatus | 'all')}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in_review">In Review</option>
            <option value="ready_to_submit">Ready to Submit</option>
            <option value="submitted">Submitted</option>
            <option value="denied">Denied</option>
            <option value="approved">Approved</option>
          </select>
          <select
            value={payerFilter}
            onChange={e => setPayerFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
          >
            <option value="all">All Payers</option>
            {payers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  { label: "Claim #", field: null },
                  { label: "Patient", field: null },
                  { label: "Payer", field: null },
                  { label: "Provider / Specialty", field: null },
                  { label: "DOS", field: 'dateOfService' as SortField },
                  { label: "Procedures", field: null },
                  { label: "Charges", field: 'totalCharges' as SortField },
                  { label: "Risk Score", field: 'riskScore' as SortField },
                  { label: "Status", field: null },
                  { label: "Predicted Denial", field: null },
                  { label: "Actions", field: null },
                ].map(col => (
                  <th
                    key={col.label}
                    onClick={() => col.field && toggleSort(col.field)}
                    className={clsx('text-left text-xs font-semibold text-slate-500 px-4 py-3 whitespace-nowrap', col.field && 'cursor-pointer hover:text-slate-700')}
                  >
                    {col.label}
                    {col.field && <SortIcon field={col.field} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(claim => (
                <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => navigate('claim-detail', claim.id)}
                      className="font-semibold text-blue-600 hover:underline text-xs"
                    >
                      {claim.claimNumber}
                    </button>
                    <div className="text-xs text-slate-400">{claim.priority.toUpperCase()}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-slate-900 text-xs">{claim.patient.firstName} {claim.patient.lastName}</div>
                    <div className="text-xs text-slate-400">{claim.patient.memberId}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-slate-700 text-xs">{claim.payer.shortName}</div>
                    <div className="text-xs text-slate-400">{claim.payer.planType}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-slate-700 max-w-[120px] truncate">{claim.provider.name}</div>
                    <div className="text-xs text-slate-400">{claim.provider.specialty}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">{claim.dateOfService}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {claim.procedureCodes.map(pc => (
                        <span key={pc.cpt} className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                          {pc.cpt}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-xs font-bold text-slate-800">${claim.totalCharges.toLocaleString()}</div>
                    <div className="text-xs text-slate-400">Est: ${claim.estimatedReimbursement.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-14 bg-slate-100 rounded-full h-1.5">
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
                    <span className={clsx('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border', riskBadge[claim.riskLevel])}>
                      <span className={clsx('w-1.5 h-1.5 rounded-full', {
                        'bg-red-500': claim.riskLevel === 'critical',
                        'bg-orange-500': claim.riskLevel === 'high',
                        'bg-amber-500': claim.riskLevel === 'medium',
                        'bg-emerald-500': claim.riskLevel === 'low',
                      })} />
                      {claim.riskLevel.charAt(0).toUpperCase() + claim.riskLevel.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', statusBadge[claim.status])}>
                      {statusLabel[claim.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <div className="text-xs text-slate-600 leading-tight">{claim.predictedDenialReason}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{claim.predictionConfidence}% confidence</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {(claim.riskLevel === 'critical' || claim.riskLevel === 'high') && (
                        <AlertTriangle size={12} className="text-red-500" />
                      )}
                      <button
                        onClick={() => navigate('claim-detail', claim.id)}
                        className="btn-primary text-xs py-1.5 flex items-center gap-1"
                      >
                        <Eye size={12} /> Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-slate-400">
                    No claims match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length} of {claims.length} claims</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Critical: {claims.filter(c => c.riskLevel === 'critical').length}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" />High: {claims.filter(c => c.riskLevel === 'high').length}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Medium: {claims.filter(c => c.riskLevel === 'medium').length}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Low: {claims.filter(c => c.riskLevel === 'low').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
