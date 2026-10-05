import React, { useState } from 'react';
import { useData } from '../context/DataContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ORG_NAME, ORG_TAGLINE, ORG_CONTACT } from '../lib/exportUtils.ts';
import {
  Settings,
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  Building,
  RotateCcw,
  CheckCircle,
  Shield,
  Smartphone,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { isOffline, toggleOfflineMode, pendingSyncCount, syncNow, isSyncing, resetAllData } = useData();
  const { currentUser } = useAuth();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncStatusMsg('Synchronizing pending local records with central cloud database...');
    const res = await syncNow();
    if (res.syncedCount > 0) {
      setSyncStatusMsg(`Successfully synchronized ${res.syncedCount} records.`);
    } else if (res.errors.length > 0) {
      setSyncStatusMsg(`Sync completed with errors: ${res.errors.join(', ')}`);
    } else {
      setSyncStatusMsg('Central database is already fully up-to-date.');
    }
  };

  const handleReset = () => {
    resetAllData();
    setResetConfirm(false);
    setSyncStatusMsg('Sample harvest & farmer datasets reset to standard cooperative defaults.');
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>System Settings & Offline Sync</span>
        </h2>
        <p className="text-xs text-slate-400">
          Mobile device synchronization, network offline toggle, and cooperative metadata
        </p>
      </div>

      {syncStatusMsg && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-emerald-200 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {/* Offline & Synchronization Panel */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-100 font-bold text-sm">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <span>Field Offline Synchronization Engine</span>
        </div>

        <p className="text-xs text-slate-400">
          Coffee collection points may have poor or absent cellular internet. When offline, weighings and deliveries are saved locally with full cryptographic receipt codes. Once a data connection is established, synchronize to the central cloud.
        </p>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isOffline ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-200">
                Mode: {isOffline ? 'Simulated Offline Mode' : 'Online Central Sync Mode'}
              </div>
              <p className="text-xs text-slate-400">
                {pendingSyncCount} record(s) currently stored in local offline queue
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleOfflineMode}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                isOffline
                  ? 'bg-amber-600/20 border-amber-500/40 text-amber-300 hover:bg-amber-600/30'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isOffline ? 'Switch to Online' : 'Simulate Offline'}
            </button>

            <button
              onClick={handleSync}
              disabled={isSyncing || isOffline}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Cloud Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Organization Particulars */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-100 font-bold text-sm">
          <Building className="w-5 h-5 text-amber-400" />
          <span>Cooperative Organization Identity</span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Organization Name</span>
            <span className="text-slate-100 font-bold text-sm">{ORG_NAME}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">System Tagline</span>
            <span className="text-slate-300">{ORG_TAGLINE}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact & Official Address</span>
            <span className="text-slate-300">{ORG_CONTACT}</span>
          </div>
        </div>
      </div>

      {/* Reset Demo Data (Administrator / Developer Tool) */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-slate-100 font-bold text-sm">
          <Database className="w-5 h-5 text-purple-400" />
          <span>Demonstration Data Reset</span>
        </div>
        <p className="text-xs text-slate-400">
          Restore sample October 2026 harvests (Farmers K001, K002, K003), sample collection centres, and standard test users.
        </p>

        {!resetConfirm ? (
          <button
            onClick={() => setResetConfirm(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Demo Records to Prompt Defaults</span>
          </button>
        ) : (
          <div className="flex items-center space-x-3 p-3 bg-red-950/40 border border-red-900/60 rounded-2xl">
            <span className="text-xs text-red-300 font-medium">Are you sure? This will reload defaults.</span>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs"
            >
              Yes, Reset
            </button>
            <button
              onClick={() => setResetConfirm(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
