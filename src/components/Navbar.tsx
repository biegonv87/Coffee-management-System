import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  User as UserIcon,
  Shield,
  Coffee,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useData } from '../context/DataContext.tsx';
import { UserRole } from '../types/index.ts';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { currentUser, switchUser, usersList } = useAuth();
  const { isOffline, toggleOfflineMode, pendingSyncCount, syncNow, isSyncing } = useData();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const handleSyncClick = async () => {
    const res = await syncNow();
    if (res.syncedCount > 0) {
      setSyncToast(`Successfully synced ${res.syncedCount} records to cloud!`);
      setTimeout(() => setSyncToast(null), 4000);
    } else if (res.errors.length > 0) {
      setSyncToast(`Sync errors: ${res.errors.join(', ')}`);
      setTimeout(() => setSyncToast(null), 5000);
    } else {
      setSyncToast('All records are already up to date!');
      setTimeout(() => setSyncToast(null), 3000);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-emerald-950 text-white shadow-md border-b border-emerald-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand & Mobile Menu */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-emerald-900/60 transition-colors text-emerald-100"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-emerald-700 flex items-center justify-center shadow-inner">
              <Coffee className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight flex items-center gap-1.5">
                <span>KahawaHarvest</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-800 text-emerald-200 tracking-wider">
                  Mobile Pro
                </span>
              </h1>
              <p className="text-[11px] text-emerald-300/80 hidden sm:block">
                Field Coffee Collection & Farmer Records
              </p>
            </div>
          </div>
        </div>

        {/* Right: Offline/Online indicator, Sync button, User Role Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Offline / Online toggle badge */}
          <button
            onClick={toggleOfflineMode}
            title={isOffline ? 'Click to switch to Online mode' : 'Click to test Offline collection mode'}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              isOffline
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-800/60 text-emerald-200 border border-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Offline</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline">Online</span>
              </>
            )}
          </button>

          {/* Pending Sync Button if records are queued */}
          {pendingSyncCount > 0 && (
            <button
              onClick={handleSyncClick}
              disabled={isSyncing || isOffline}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm transition-all ${
                isOffline
                  ? 'bg-stone-800 text-stone-400 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
              }`}
              title={isOffline ? 'Connect online to sync' : 'Sync pending harvests to central database'}
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{pendingSyncCount} Sync</span>
            </button>
          )}

          {/* User Profile / Quick Role Switch */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700/60 rounded-xl px-2.5 py-1.5 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-200">
                {currentUser.role === 'Administrator' ? (
                  <Shield className="w-4 h-4 text-amber-400" />
                ) : (
                  <UserIcon className="w-4 h-4 text-emerald-300" />
                )}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold leading-none">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-300/90 leading-none mt-0.5">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400 hidden sm:block" />
            </button>

            {/* Quick Switch Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-emerald-800 rounded-xl shadow-2xl py-2 z-50 text-slate-100">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Current Account</p>
                  <p className="text-sm font-semibold">{currentUser.name}</p>
                  <p className="text-xs text-slate-400">{currentUser.role} • {currentUser.assigned_satellite}</p>
                </div>

                <div className="px-3 py-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Switch Test Role:
                  </p>
                  <div className="space-y-1">
                    {(['Collection Officer', 'Administrator', 'Manager'] as UserRole[]).map(role => {
                      const user = usersList.find(u => u.role === role);
                      const isCurrent = currentUser.role === role;
                      return (
                        <button
                          key={role}
                          onClick={() => {
                            switchUser(role);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isCurrent
                              ? 'bg-emerald-800 text-white font-semibold'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div>
                            <span className="block font-medium">{role}</span>
                            <span className="block text-[10px] text-slate-400">
                              {user ? user.name : 'Role user'}
                            </span>
                          </div>
                          {isCurrent && <span className="text-[10px] text-emerald-300">Active</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-semibold shadow-md flex items-center justify-center space-x-2">
          <span>{syncToast}</span>
        </div>
      )}
    </header>
  );
};
