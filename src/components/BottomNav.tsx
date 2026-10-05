import React from 'react';
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  ClipboardList,
  FileSpreadsheet,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto relative items-center">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        {/* Farmers */}
        <button
          onClick={() => setActiveTab('farmers')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'farmers' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Farmers</span>
        </button>

        {/* Center Prominent Record Harvest Button */}
        <div className="relative flex justify-center items-center">
          <button
            onClick={() => setActiveTab('record-harvest')}
            className={`-top-5 absolute w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-amber-600 flex flex-col items-center justify-center text-white shadow-lg shadow-emerald-950/80 active:scale-95 transition-transform border-4 border-slate-900 ${
              activeTab === 'record-harvest' ? 'ring-2 ring-emerald-400' : ''
            }`}
            aria-label="Record Harvest"
          >
            <PlusCircle className="w-7 h-7" />
          </button>
          <span className="text-[9px] font-bold text-emerald-400 mt-7">Record</span>
        </div>

        {/* Records */}
        <button
          onClick={() => setActiveTab('records')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'records' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Records</span>
        </button>

        {/* Reports */}
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'reports' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Reports</span>
        </button>
      </div>
    </nav>
  );
};
