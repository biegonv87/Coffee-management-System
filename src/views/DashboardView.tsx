import React, { useState } from 'react';
import { useData } from '../context/DataContext.tsx';
import {
  Users,
  Coffee,
  Calendar,
  TrendingUp,
  Scale,
  Award,
  PlusCircle,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  WifiOff,
  RefreshCw,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { farmers, harvests, isOffline, pendingSyncCount, syncNow, isSyncing } = useData();
  const [chartPeriod, setChartPeriod] = useState<'today' | 'month' | 'all'>('month');

  // Dates
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  // Filter harvests
  const todayHarvests = harvests.filter(h => h.collection_date === todayStr);
  const thisMonthHarvests = harvests.filter(h => h.collection_date.startsWith(currentMonthStr));

  // Calculations
  const totalFarmers = farmers.length;
  const activeFarmers = farmers.filter(f => f.status === 'Active').length;

  const todayTotalKg = todayHarvests.reduce((acc, h) => acc + h.total_kg, 0);
  const monthTotalKg = thisMonthHarvests.reduce((acc, h) => acc + h.total_kg, 0);
  const allTimeTotalKg = harvests.reduce((acc, h) => acc + h.total_kg, 0);

  // Subcategories this month
  const monthHeavyKg = thisMonthHarvests.reduce((acc, h) => acc + h.cherry_heavy, 0);
  const monthLightKg = thisMonthHarvests.reduce((acc, h) => acc + h.cherry_light, 0);
  const monthMbuniKg = thisMonthHarvests.reduce((acc, h) => acc + h.mbuni, 0);

  // Active chart dataset based on selected period
  const activeDataset =
    chartPeriod === 'today'
      ? todayHarvests
      : chartPeriod === 'month'
      ? thisMonthHarvests
      : harvests;

  const chartHeavy = activeDataset.reduce((acc, h) => acc + h.cherry_heavy, 0);
  const chartLight = activeDataset.reduce((acc, h) => acc + h.cherry_light, 0);
  const chartMbuni = activeDataset.reduce((acc, h) => acc + h.mbuni, 0);
  const chartTotal = activeDataset.reduce((acc, h) => acc + h.total_kg, 0) || 1;

  const pctHeavy = Math.round((chartHeavy / chartTotal) * 100);
  const pctLight = Math.round((chartLight / chartTotal) * 100);
  const pctMbuni = Math.max(0, 100 - pctHeavy - pctLight);

  // Top Farmers by Monthly Harvest
  const farmerMonthMap = new Map<string, { farmer_name: string; farmer_id: string; total_kg: number; heavy: number }>();
  thisMonthHarvests.forEach(h => {
    const existing = farmerMonthMap.get(h.farmer_id);
    if (existing) {
      existing.total_kg += h.total_kg;
      existing.heavy += h.cherry_heavy;
    } else {
      farmerMonthMap.set(h.farmer_id, {
        farmer_name: h.farmer_name,
        farmer_id: h.farmer_id,
        total_kg: h.total_kg,
        heavy: h.cherry_heavy,
      });
    }
  });

  const topFarmers = Array.from(farmerMonthMap.values())
    .sort((a, b) => b.total_kg - a.total_kg)
    .slice(0, 5);

  const highestTopFarmerKg = topFarmers.length > 0 ? topFarmers[0].total_kg : 100;

  return (
    <div className="space-y-6 pb-20">
      {/* Offline Alert Banner if applicable */}
      {isOffline && (
        <div className="bg-amber-950/80 border border-amber-700/60 rounded-2xl p-4 text-amber-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Offline Field Collection Active</h4>
              <p className="text-xs text-amber-300/80">
                Deliveries are saved safely in device storage and will sync automatically when back online.
              </p>
            </div>
          </div>
          {pendingSyncCount > 0 && (
            <button
              onClick={() => syncNow()}
              disabled={isSyncing}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync {pendingSyncCount}</span>
            </button>
          )}
        </div>
      )}

      {/* Top Banner & Quick Hero Action */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 p-6 sm:p-8 text-white shadow-xl border border-emerald-800/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-200 border border-emerald-700">
              Harvest Season {currentYear}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Coffee Harvest Operations
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-xl">
              Consolidated real-time harvest reception, automatic kilogram computations, receipts, and farmer monthly statements.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('record-harvest')}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-950/40 transition-all active:scale-95"
            >
              <PlusCircle className="w-5 h-5 text-slate-950" />
              <span>Record Harvest</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-emerald-800/70 hover:bg-emerald-700 text-emerald-100 font-semibold text-sm border border-emerald-700/60 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Monthly Reports</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Farmers */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Farmers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">{totalFarmers}</div>
          <div className="text-[11px] text-emerald-400 font-medium">
            {activeFarmers} Active registered
          </div>
        </div>

        {/* Coffee Collected Today */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Collected Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {todayTotalKg.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {todayHarvests.length} deliveries today
          </div>
        </div>

        {/* Total Coffee Collected This Month */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Monthly Coffee</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            {monthTotalKg.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-amber-400 font-medium">
            {thisMonthHarvests.length} deliveries this month
          </div>
        </div>

        {/* Overall Coffee Total */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Overall All-Time</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {allTimeTotalKg.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {harvests.length} total deliveries
          </div>
        </div>
      </div>

      {/* Coffee Category Breakdown Cards (Heavy, Light, Mbuni) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Coffee Category Totals (This Month)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Breakdown by grade: Cherry Heavy, Cherry Light, and Mbuni
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-full">
            Total Kilos: {monthTotalKg.toFixed(1)} kg
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Cherry Heavy */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-900/60 space-y-1">
            <span className="text-xs font-medium text-emerald-400">Cherry Heavy (CH)</span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-300">
              {monthHeavyKg.toFixed(1)} <span className="text-xs text-slate-400">kg</span>
            </div>
            <p className="text-[11px] text-slate-400">Grade 1 dense ripe cherries</p>
          </div>

          {/* Cherry Light */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-amber-900/60 space-y-1">
            <span className="text-xs font-medium text-amber-400">Cherry Light (CL)</span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
              {monthLightKg.toFixed(1)} <span className="text-xs text-slate-400">kg</span>
            </div>
            <p className="text-[11px] text-slate-400">Lower density floaters & secondary</p>
          </div>

          {/* Mbuni */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-orange-900/60 space-y-1">
            <span className="text-xs font-medium text-orange-400">Mbuni (MB)</span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-orange-300">
              {monthMbuniKg.toFixed(1)} <span className="text-xs text-slate-400">kg</span>
            </div>
            <p className="text-[11px] text-slate-400">Dried ripe tree cherry</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Interactive Chart & Top Farmers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simple Visual Coffee Breakdown Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-amber-400" />
                <span>Harvest Composition</span>
              </h3>
              <p className="text-xs text-slate-400">Proportions across categories</p>
            </div>

            {/* Period Selector Toggle */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
              <button
                onClick={() => setChartPeriod('today')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  chartPeriod === 'today' ? 'bg-emerald-700 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setChartPeriod('month')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  chartPeriod === 'month' ? 'bg-emerald-700 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setChartPeriod('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  chartPeriod === 'all' ? 'bg-emerald-700 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          {/* Visual Percentage Bar */}
          <div className="space-y-2">
            <div className="h-6 w-full rounded-xl overflow-hidden flex bg-slate-950 border border-slate-800 shadow-inner">
              <div
                style={{ width: `${pctHeavy}%` }}
                className="bg-emerald-500 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-bold text-emerald-950"
                title={`Cherry Heavy: ${chartHeavy.toFixed(1)} kg (${pctHeavy}%)`}
              >
                {pctHeavy > 10 ? `${pctHeavy}%` : ''}
              </div>
              <div
                style={{ width: `${pctLight}%` }}
                className="bg-amber-400 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-bold text-amber-950"
                title={`Cherry Light: ${chartLight.toFixed(1)} kg (${pctLight}%)`}
              >
                {pctLight > 10 ? `${pctLight}%` : ''}
              </div>
              <div
                style={{ width: `${pctMbuni}%` }}
                className="bg-orange-500 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-bold text-orange-950"
                title={`Mbuni: ${chartMbuni.toFixed(1)} kg (${pctMbuni}%)`}
              >
                {pctMbuni > 10 ? `${pctMbuni}%` : ''}
              </div>
            </div>

            {/* Legend with exact weights */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-[11px] text-slate-300 font-medium">Heavy</span>
                </div>
                <div className="font-mono font-bold text-emerald-400">{chartHeavy.toFixed(1)} kg</div>
                <div className="text-[10px] text-slate-500">{pctHeavy}% share</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-[11px] text-slate-300 font-medium">Light</span>
                </div>
                <div className="font-mono font-bold text-amber-400">{chartLight.toFixed(1)} kg</div>
                <div className="text-[10px] text-slate-500">{pctLight}% share</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                  <span className="text-[11px] text-slate-300 font-medium">Mbuni</span>
                </div>
                <div className="font-mono font-bold text-orange-400">{chartMbuni.toFixed(1)} kg</div>
                <div className="text-[10px] text-slate-500">{pctMbuni}% share</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Farmers by Monthly Harvest */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Top Farmers (This Month)</span>
              </h3>
              <p className="text-xs text-slate-400">Ranked by consolidated kilogram deliveries</p>
            </div>
            <button
              onClick={() => onNavigate('farmers')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {topFarmers.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No deliveries recorded this month yet.</p>
            ) : (
              topFarmers.map((farmer, index) => {
                const barWidth = Math.round((farmer.total_kg / highestTopFarmerKg) * 100);
                return (
                  <div key={farmer.farmer_id} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          index === 0
                            ? 'bg-amber-400 text-amber-950'
                            : index === 1
                            ? 'bg-slate-300 text-slate-900'
                            : index === 2
                            ? 'bg-amber-700 text-amber-100'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-bold text-slate-100">{farmer.farmer_name}</span>
                        <span className="font-mono text-[10px] text-slate-400">({farmer.farmer_id})</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {farmer.total_kg.toFixed(1)} kg
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${barWidth}%` }}
                        className="bg-gradient-to-r from-emerald-600 to-amber-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
