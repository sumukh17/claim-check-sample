import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Save, RefreshCw, Database, Bot, Building, Users, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

type SettingsTab = 'organization' | 'agents' | 'payers' | 'data';

export default function SettingsPage() {
  const { config } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('organization');
  const [saved, setSaved] = useState(false);
  const [orgName, setOrgName] = useState(config.organization.name);
  const [orgNPI, setOrgNPI] = useState(config.organization.npi);

  const agentSettings = [
    { name: "Demographics Agent", enabled: true, threshold: 85, description: "Validates patient demographics against payer records" },
    { name: "Eligibility Agent", enabled: true, threshold: 90, description: "Checks insurance coverage and authorization requirements" },
    { name: "Clinical Doc Agent", enabled: true, threshold: 75, description: "Reviews clinical documentation completeness" },
    { name: "Medical Coding Agent", enabled: true, threshold: 80, description: "Validates CPT/ICD-10 codes and modifiers" },
    { name: "Charge Review Agent", enabled: true, threshold: 85, description: "Checks charges against UCR and fee schedules" },
    { name: "Denial Prediction Agent", enabled: true, threshold: 60, description: "Predicts denial risk using historical ML models" },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const settingsTabs = [
    { id: 'organization' as SettingsTab, label: 'Organization', icon: <Building size={15} /> },
    { id: 'agents' as SettingsTab, label: 'AI Agents', icon: <Bot size={15} /> },
    { id: 'payers' as SettingsTab, label: 'Payers', icon: <Users size={15} /> },
    { id: 'data' as SettingsTab, label: 'Data Config', icon: <Database size={15} /> },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings & Configuration</h1>
          <p className="text-slate-500 text-sm mt-0.5">Configure the ClaimGuard AI platform and dummy data</p>
        </div>
        <button
          onClick={handleSave}
          className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all', {
            'bg-emerald-500 text-white': saved,
            'btn-primary': !saved,
          })}
        >
          {saved ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      <div className="flex gap-5">
        {/* Sidebar tabs */}
        <div className="w-44 space-y-1 flex-shrink-0">
          {settingsTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all',
                activeTab === tab.id ? 'bg-brand-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Organization */}
          {activeTab === 'organization' && (
            <div className="card p-5 space-y-5">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Building size={16} /> Organization Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Organization Name", value: orgName, onChange: setOrgName },
                  { label: "NPI Number", value: orgNPI, onChange: setOrgNPI },
                  { label: "Tax ID", value: config.organization.taxId, onChange: () => {} },
                  { label: "Address", value: config.organization.address, onChange: () => {} },
                ].map(field => (
                  <div key={field.label}>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">{field.label}</label>
                    <input
                      type="text"
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    />
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Platform Settings</h3>
                <div className="space-y-3">
                  {[
                    { label: "Enable Denial Prediction before submission", enabled: true },
                    { label: "Auto-assign corrective actions to responsible parties", enabled: true },
                    { label: "Send email alerts for Critical risk claims", enabled: false },
                    { label: "Require 2FA for claim submission", enabled: true },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between py-2 border-b border-slate-50">
                      <span className="text-sm text-slate-700">{s.label}</span>
                      <div className={clsx('w-10 h-5 rounded-full flex items-center transition-all cursor-pointer', s.enabled ? 'bg-blue-600 justify-end pr-0.5' : 'bg-slate-300 justify-start pl-0.5')}>
                        <div className="w-4 h-4 rounded-full bg-white shadow" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Agents */}
          {activeTab === 'agents' && (
            <div className="space-y-3">
              <div className="card p-5">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-4"><Bot size={16} /> AI Agent Configuration</h2>
                <p className="text-xs text-slate-400 mb-4">Configure each agent's behavior, thresholds, and activation status.</p>
                <div className="space-y-4">
                  {agentSettings.map(agent => (
                    <div key={agent.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={clsx('w-2 h-2 rounded-full', agent.enabled ? 'bg-emerald-500' : 'bg-slate-300')} />
                          <span className="font-semibold text-sm text-slate-800">{agent.name}</span>
                          {agent.name === 'Denial Prediction Agent' && (
                            <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-medium">Primary</span>
                          )}
                        </div>
                        <div className={clsx('w-10 h-5 rounded-full flex items-center transition-all cursor-pointer', agent.enabled ? 'bg-blue-600 justify-end pr-0.5' : 'bg-slate-300 justify-start pl-0.5')}>
                          <div className="w-4 h-4 rounded-full bg-white shadow" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{agent.description}</p>
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Confidence Threshold</span>
                          <span className="font-semibold">{agent.threshold}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          defaultValue={agent.threshold}
                          className="w-full h-1.5 rounded-full accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                          <span>Low (0%)</span>
                          <span>High (100%)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Payers */}
          {activeTab === 'payers' && (
            <div className="card p-5">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-4"><Users size={16} /> Payer Configuration</h2>
              <p className="text-xs text-slate-400 mb-4">Payer data is used by the AI agents to calculate denial risk. Edit historical denial rates and authorization requirements.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {["Payer Name", "Plan Type", "Historical Denial Rate", "Avg Processing Days", "CPTs Requiring PA"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-500 pb-2 pr-4 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {config.payers.map(payer => (
                      <tr key={payer.id}>
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payer.color }} />
                            <span className="font-medium text-xs text-slate-800">{payer.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 text-xs text-slate-600">{payer.planType}</td>
                        <td className="py-2.5 pr-4">
                          <input
                            type="number"
                            defaultValue={payer.historicalDenialRate}
                            className="w-16 text-xs px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                          <span className="text-xs text-slate-400 ml-1">%</span>
                        </td>
                        <td className="py-2.5 pr-4">
                          <input
                            type="number"
                            defaultValue={payer.avgProcessingDays}
                            className="w-12 text-xs px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                          <span className="text-xs text-slate-400 ml-1">days</span>
                        </td>
                        <td className="py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {payer.requiresPriorAuthCPTs.map(cpt => (
                              <span key={cpt} className="font-mono text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-200">{cpt}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Data Config */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="card p-5">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-2"><Database size={16} /> Data Configuration</h2>
                <p className="text-xs text-slate-400 mb-4">
                  The application uses configurable dummy data defined in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">src/data/config.ts</code>.
                  Edit that file to customize all claims, patients, payers, providers, and denial trend data.
                </p>

                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { label: "Total Claims", value: config.claims.length, icon: "📋" },
                    { label: "Patients", value: config.patients.length, icon: "👤" },
                    { label: "Payers", value: config.payers.length, icon: "🏢" },
                    { label: "Providers", value: config.providers.length, icon: "👨‍⚕️" },
                    { label: "Critical Risk", value: config.claims.filter(c => c.riskLevel === 'critical').length, icon: "🔴" },
                    { label: "High Risk", value: config.claims.filter(c => c.riskLevel === 'high').length, icon: "🟠" },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
                      <div className="text-lg mb-1">{s.icon}</div>
                      <div className="text-xl font-bold text-slate-800">{s.value}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto">
                  <div className="text-slate-500 mb-2">// src/data/config.ts — Edit to customize dummy data</div>
                  <div className="text-blue-400">export const APP_CONFIG: AppConfig = {'{'}</div>
                  <div className="pl-4">
                    <div><span className="text-emerald-400">organization</span>: {'{'} <span className="text-amber-400">name</span>: <span className="text-green-300">"{config.organization.name}"</span>, ... {'}'}</div>
                    <div><span className="text-emerald-400">payers</span>: [<span className="text-slate-500">{config.payers.length} payer objects...</span>],</div>
                    <div><span className="text-emerald-400">providers</span>: [<span className="text-slate-500">{config.providers.length} provider objects...</span>],</div>
                    <div><span className="text-emerald-400">patients</span>: [<span className="text-slate-500">{config.patients.length} patient objects...</span>],</div>
                    <div><span className="text-emerald-400">claims</span>: [<span className="text-slate-500">{config.claims.length} complete claim objects with AI analyses...</span>],</div>
                    <div><span className="text-emerald-400">denialTrend</span>: [<span className="text-slate-500">12 months of trend data...</span>],</div>
                    <div><span className="text-emerald-400">topDenialReasons</span>: [<span className="text-slate-500">{config.topDenialReasons.length} denial reason categories...</span>],</div>
                  </div>
                  <div className="text-blue-400">{'}'}</div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="btn-outline flex items-center gap-2 text-sm">
                    <RefreshCw size={14} /> Reset to Defaults
                  </button>
                  <button className="btn-outline flex items-center gap-2 text-sm">
                    <Database size={14} /> Export Config JSON
                  </button>
                  <button className="btn-outline flex items-center gap-2 text-sm">
                    <Settings size={14} /> Import Config JSON
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
