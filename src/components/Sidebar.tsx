import React from 'react';
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  ClipboardList,
  Receipt,
  FileSpreadsheet,
  FileText,
  Boxes,
  MapPin,
  ShieldCheck,
  History,
  Settings,
  X,
  Coffee,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
}) => {
  const { currentUser, canManageUsers } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'farmers', label: 'Farmers Directory', icon: Users },
    {
      id: 'record-harvest',
      label: 'Record Harvest',
      icon: PlusCircle,
      isSpecial: true,
    },
    { id: 'records', label: 'Harvest Records', icon: ClipboardList },
    { id: 'receipts', label: 'Receipts Hub', icon: Receipt },
    { id: 'reports', label: 'Monthly Reports', icon: FileSpreadsheet },
    { id: 'farmer-slips', label: 'Farmer Slips', icon: FileText },
    { id: 'groups', label: 'Coffee Groups', icon: Boxes },
    { id: 'satellites', label: 'Satellites / Centres', icon: MapPin },
    ...(canManageUsers
      ? [{ id: 'users', label: 'User Accounts', icon: ShieldCheck }]
      : []),
    { id: 'audit-log', label: 'Audit Trail', icon: History },
    { id: 'settings', label: 'Settings & Sync', icon: Settings },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Coffee className="w-5 h-5" />
            </div>
            <span className="font-bold text-base text-slate-100 tracking-tight">KahawaHarvest</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.isSpecial) {
              return (
                <div key={item.id} className="py-2">
                  <button
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-amber-600 text-white ring-2 ring-emerald-400 shadow-emerald-900/50'
                        : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>RECORD HARVEST</span>
                  </button>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-900/50 text-emerald-400 font-semibold border-l-4 border-emerald-500'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-500">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span>Logged in as:</span>
            <span className="font-semibold text-emerald-400">{currentUser.role}</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Station: {currentUser.assigned_satellite || 'Central Co-op'}
          </div>
        </div>
      </aside>
    </>
  );
};
