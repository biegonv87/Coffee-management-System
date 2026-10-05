import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext.tsx';
import { MonthlyFarmerSummary, MonthlyGrandTotal, Harvest } from '../types/index.ts';
import { exportToCSV, generateMonthlyReportPDF } from '../lib/exportUtils.ts';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Layers,
  MapPin,
  Boxes,
  Users,
  TrendingUp,
  Scale,
  ChevronDown,
  Coffee,
} from 'lucide-react';

export const MonthlyReportsView: React.FC = () => {
  const { farmers, harvests, groups, satellites } = useData();

  // Selected Report Type (1 to 10)
  const [reportType, setReportType] = useState<string>('monthly-summary');

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('10'); // October default
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-02');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedSatellite, setSelectedSatellite] = useState<string>('ALL');

  const monthsList = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const currentMonthName = monthsList.find(m => m.value === selectedMonth)?.label || 'October';

  // Compute Monthly Summaries grouped by farmer
  const monthlyFarmerSummaries: MonthlyFarmerSummary[] = useMemo(() => {
    const monthPrefix = `${selectedYear}-${selectedMonth}`;

    // Filter relevant harvests
    const filteredHarvests = harvests.filter(h => {
      const inMonth = h.collection_date.startsWith(monthPrefix);
      const inGroup = selectedGroup === 'ALL' || h.group === selectedGroup;
      const inSatellite = selectedSatellite === 'ALL' || h.satellite === selectedSatellite;
      return inMonth && inGroup && inSatellite;
    });

    // Group by farmer
    const map = new Map<string, { farmer_id: string; farmer_name: string; group: string; satellite: string; deliveries: Harvest[] }>();

    filteredHarvests.forEach(h => {
      if (!map.has(h.farmer_id)) {
        map.set(h.farmer_id, {
          farmer_id: h.farmer_id,
          farmer_name: h.farmer_name,
          group: h.group,
          satellite: h.satellite,
          deliveries: [],
        });
      }
      map.get(h.farmer_id)!.deliveries.push(h);
    });

    const summaries: MonthlyFarmerSummary[] = Array.from(map.values()).map(entry => {
      const heavy = entry.deliveries.reduce((acc, d) => acc + d.cherry_heavy, 0);
      const light = entry.deliveries.reduce((acc, d) => acc + d.cherry_light, 0);
      const mbuni = entry.deliveries.reduce((acc, d) => acc + d.mbuni, 0);
      const total = entry.deliveries.reduce((acc, d) => acc + d.total_kg, 0);

      return {
        farmer_id: entry.farmer_id,
        farmer_name: entry.farmer_name,
        group: entry.group,
        satellite: entry.satellite,
        heavy_total: Number(heavy.toFixed(1)),
        light_total: Number(light.toFixed(1)),
        mbuni_total: Number(mbuni.toFixed(1)),
        overall_total: Number(total.toFixed(1)),
        delivery_count: entry.deliveries.length,
        deliveries: entry.deliveries,
      };
    });

    // Sort by farmer ID
    return summaries.sort((a, b) => a.farmer_id.localeCompare(b.farmer_id));
  }, [harvests, selectedYear, selectedMonth, selectedGroup, selectedSatellite]);

  // Grand Total for monthly summary
  const grandTotal: MonthlyGrandTotal = useMemo(() => {
    const heavy = monthlyFarmerSummaries.reduce((acc, s) => acc + s.heavy_total, 0);
    const light = monthlyFarmerSummaries.reduce((acc, s) => acc + s.light_total, 0);
    const mbuni = monthlyFarmerSummaries.reduce((acc, s) => acc + s.mbuni_total, 0);
    const total = monthlyFarmerSummaries.reduce((acc, s) => acc + s.overall_total, 0);
    const delivs = monthlyFarmerSummaries.reduce((acc, s) => acc + s.delivery_count, 0);

    return {
      heavy_total: Number(heavy.toFixed(1)),
      light_total: Number(light.toFixed(1)),
      mbuni_total: Number(mbuni.toFixed(1)),
      grand_total: Number(total.toFixed(1)),
      farmer_count: monthlyFarmerSummaries.length,
      delivery_count: delivs,
    };
  }, [monthlyFarmerSummaries]);

  // Daily collection dataset
  const dailyHarvests = useMemo(() => {
    return harvests.filter(h => {
      const matchesDate = h.collection_date === selectedDate;
      const inGroup = selectedGroup === 'ALL' || h.group === selectedGroup;
      const inSatellite = selectedSatellite === 'ALL' || h.satellite === selectedSatellite;
      return matchesDate && inGroup && inSatellite;
    });
  }, [harvests, selectedDate, selectedGroup, selectedSatellite]);

  const dailyTotalKg = dailyHarvests.reduce((acc, h) => acc + h.total_kg, 0);
  const dailyHeavyKg = dailyHarvests.reduce((acc, h) => acc + h.cherry_heavy, 0);
  const dailyLightKg = dailyHarvests.reduce((acc, h) => acc + h.cherry_light, 0);
  const dailyMbuniKg = dailyHarvests.reduce((acc, h) => acc + h.mbuni, 0);

  // Group Report dataset
  const groupSummaries = useMemo(() => {
    return groups.map(g => {
      const gHarvests = harvests.filter(h => h.group === g.group_name && h.collection_date.startsWith(selectedYear));
      const heavy = gHarvests.reduce((acc, h) => acc + h.cherry_heavy, 0);
      const light = gHarvests.reduce((acc, h) => acc + h.cherry_light, 0);
      const mbuni = gHarvests.reduce((acc, h) => acc + h.mbuni, 0);
      const total = gHarvests.reduce((acc, h) => acc + h.total_kg, 0);
      return {
        name: g.group_name,
        deliveries: gHarvests.length,
        heavy,
        light,
        mbuni,
        total,
      };
    });
  }, [groups, harvests, selectedYear]);

  // Satellite Report dataset
  const satelliteSummaries = useMemo(() => {
    return satellites.map(s => {
      const sHarvests = harvests.filter(h => h.satellite === s.satellite_name && h.collection_date.startsWith(selectedYear));
      const heavy = sHarvests.reduce((acc, h) => acc + h.cherry_heavy, 0);
      const light = sHarvests.reduce((acc, h) => acc + h.cherry_light, 0);
      const mbuni = sHarvests.reduce((acc, h) => acc + h.mbuni, 0);
      const total = sHarvests.reduce((acc, h) => acc + h.total_kg, 0);
      return {
        name: s.satellite_name,
        location: s.location,
        deliveries: sHarvests.length,
        heavy,
        light,
        mbuni,
        total,
      };
    });
  }, [satellites, harvests, selectedYear]);

  // Export handlers
  const handleExportPDF = () => {
    const scopeDesc = `Group: ${selectedGroup} | Centre: ${selectedSatellite}`;
    generateMonthlyReportPDF(
      'Monthly Farmer Harvest Consolidation Report',
      `${currentMonthName} ${selectedYear}`,
      scopeDesc,
      monthlyFarmerSummaries,
      grandTotal
    );
  };

  const handleExportCSV = () => {
    const headers = [
      'Farmer ID',
      'Farmer Name',
      'Group',
      'Satellite Centre',
      'Deliveries Count',
      'Cherry Heavy (kg)',
      'Cherry Light (kg)',
      'Mbuni (kg)',
      'Total Kilos (kg)',
    ];

    const rows = monthlyFarmerSummaries.map(s => [
      s.farmer_id,
      s.farmer_name,
      s.group,
      s.satellite,
      s.delivery_count,
      s.heavy_total.toFixed(1),
      s.light_total.toFixed(1),
      s.mbuni_total.toFixed(1),
      s.overall_total.toFixed(1),
    ]);

    // Append GRAND TOTAL row
    rows.push([
      'GRAND TOTAL',
      `${monthlyFarmerSummaries.length} Farmers`,
      selectedGroup,
      selectedSatellite,
      grandTotal.delivery_count,
      grandTotal.heavy_total.toFixed(1),
      grandTotal.light_total.toFixed(1),
      grandTotal.mbuni_total.toFixed(1),
      grandTotal.grand_total.toFixed(1),
    ]);

    exportToCSV(`Monthly_Farmer_Harvest_${currentMonthName}_${selectedYear}`, headers, rows);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <span>Harvest Reports & Consolidation Hub</span>
          </h2>
          <p className="text-xs text-slate-400">
            Consolidated totals by farmer, month, group, satellite, and organization
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel / CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Report</span>
          </button>
        </div>
      </div>

      {/* 10 Required Reports Selector Tabs */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl overflow-x-auto">
        <div className="flex space-x-1.5 min-w-max text-xs">
          {[
            { id: 'monthly-summary', label: '1. Monthly Farmer Summary' },
            { id: 'daily-collection', label: '2. Daily Collection Report' },
            { id: 'monthly-grand', label: '3. Grand Total Consolidation' },
            { id: 'group-report', label: '4. Group Harvest Report' },
            { id: 'satellite-report', label: '5. Satellite Centre Report' },
            { id: 'coffee-types', label: '6. Coffee Type Breakdown' },
            { id: 'yearly-report', label: '7. Yearly Harvest Report' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`px-3 py-2 rounded-xl font-semibold transition-colors ${
                reportType === tab.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Parameters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-sm space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>Report Scope & Parameters</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {reportType === 'daily-collection' ? (
            <div className="col-span-2">
              <label className="text-[10px] text-slate-500 block mb-1">Collection Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Harvest Year</label>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Harvest Month</label>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  {monthsList.map(m => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Cooperative Group</label>
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Groups</option>
              {groups.map(g => (
                <option key={g.group_id} value={g.group_name}>
                  {g.group_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Satellite Centre</label>
            <select
              value={selectedSatellite}
              onChange={e => setSelectedSatellite(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Satellites</option>
              {satellites.map(s => (
                <option key={s.satellite_id} value={s.satellite_name}>
                  {s.satellite_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* REPORT CONTENT PANELS */}

      {/* 1. Monthly Farmer Summary & Consolidation (Prompt Sections 5 & 6) */}
      {(reportType === 'monthly-summary' || reportType === 'monthly-grand') && (
        <div className="space-y-4">
          {/* Grand Total Highlight Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-emerald-900/60 p-4 rounded-2xl">
              <span className="text-xs text-emerald-400 font-semibold block">Monthly Cherry Heavy</span>
              <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
                {grandTotal.heavy_total.toFixed(1)} <span className="text-xs text-slate-400">kg</span>
              </div>
              <span className="text-[10px] text-slate-500">Grade 1 dense</span>
            </div>

            <div className="bg-slate-900 border border-amber-900/60 p-4 rounded-2xl">
              <span className="text-xs text-amber-400 font-semibold block">Monthly Cherry Light</span>
              <div className="text-2xl font-black font-mono text-amber-300 mt-1">
                {grandTotal.light_total.toFixed(1)} <span className="text-xs text-slate-400">kg</span>
              </div>
              <span className="text-[10px] text-slate-500">Secondary floaters</span>
            </div>

            <div className="bg-slate-900 border border-orange-900/60 p-4 rounded-2xl">
              <span className="text-xs text-orange-400 font-semibold block">Monthly Mbuni</span>
              <div className="text-2xl font-black font-mono text-orange-300 mt-1">
                {grandTotal.mbuni_total.toFixed(1)} <span className="text-xs text-slate-400">kg</span>
              </div>
              <span className="text-[10px] text-slate-500">Dried ripe tree cherry</span>
            </div>

            <div className="bg-gradient-to-br from-emerald-950 to-amber-950 border-2 border-emerald-600 p-4 rounded-2xl shadow-md">
              <span className="text-xs text-amber-300 font-extrabold uppercase tracking-wide block">
                Monthly Grand Total
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                {grandTotal.grand_total.toFixed(1)} <span className="text-xs font-normal text-amber-300">kg</span>
              </div>
              <span className="text-[10px] text-emerald-200">
                {grandTotal.farmer_count} farmers • {grandTotal.delivery_count} deliveries
              </span>
            </div>
          </div>

          {/* Monthly Consolidation Table exactly matching user prompt format */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100">
                  Consolidated Monthly Harvest Statement: {currentMonthName} {selectedYear}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Automatically combines multiple deliveries per farmer across the month
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
                {monthlyFarmerSummaries.length} Farmers Recorded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Farmer ID</th>
                    <th className="py-3 px-4">Farmer</th>
                    <th className="py-3 px-3 text-right">Heavy (kg)</th>
                    <th className="py-3 px-3 text-right">Light (kg)</th>
                    <th className="py-3 px-3 text-right">Mbuni (kg)</th>
                    <th className="py-3 px-4 text-right">Total (kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono">
                  {monthlyFarmerSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                        No deliveries found for {currentMonthName} {selectedYear} matching filters.
                      </td>
                    </tr>
                  ) : (
                    monthlyFarmerSummaries.map(s => (
                      <tr key={s.farmer_id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-emerald-400">{s.farmer_id}</td>
                        <td className="py-3 px-4 font-sans font-bold text-slate-100">
                          {s.farmer_name}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {s.group} • {s.delivery_count} deliveries
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-300">{s.heavy_total.toFixed(1)}</td>
                        <td className="py-3 px-3 text-right text-slate-300">{s.light_total.toFixed(1)}</td>
                        <td className="py-3 px-3 text-right text-slate-300">{s.mbuni_total.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right font-black text-amber-300 text-sm">
                          {s.overall_total.toFixed(1)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Grand Total Footer */}
                <tfoot className="bg-emerald-950/80 text-white border-t-2 border-emerald-600 font-mono font-bold text-xs">
                  <tr>
                    <td colSpan={2} className="py-4 px-4 font-sans uppercase font-black tracking-wider text-amber-300">
                      GRAND TOTAL
                    </td>
                    <td className="py-4 px-3 text-right text-emerald-300 text-sm">
                      {grandTotal.heavy_total.toFixed(1)}
                    </td>
                    <td className="py-4 px-3 text-right text-amber-300 text-sm">
                      {grandTotal.light_total.toFixed(1)}
                    </td>
                    <td className="py-4 px-3 text-right text-orange-300 text-sm">
                      {grandTotal.mbuni_total.toFixed(1)}
                    </td>
                    <td className="py-4 px-4 text-right text-base text-amber-200 font-black">
                      {grandTotal.grand_total.toFixed(1)} kg
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Daily Collection Report */}
      {reportType === 'daily-collection' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 block">Deliveries Count</span>
              <div className="text-2xl font-bold font-mono text-slate-100 mt-1">{dailyHarvests.length}</div>
            </div>
            <div className="bg-slate-900 border border-emerald-900/60 p-4 rounded-2xl">
              <span className="text-xs text-emerald-400 block">Cherry Heavy</span>
              <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{dailyHeavyKg.toFixed(1)} kg</div>
            </div>
            <div className="bg-slate-900 border border-amber-900/60 p-4 rounded-2xl">
              <span className="text-xs text-amber-400 block">Cherry Light</span>
              <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{dailyLightKg.toFixed(1)} kg</div>
            </div>
            <div className="bg-slate-900 border border-emerald-600 p-4 rounded-2xl bg-emerald-950/40">
              <span className="text-xs text-amber-300 font-bold block">Daily Total Kilos</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">{dailyTotalKg.toFixed(1)} kg</div>
            </div>
          </div>

          <div className="border border-slate-800 rounded-3xl bg-slate-900 overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 font-bold text-sm text-slate-100">
              Daily Weighing Transactions for Date: {selectedDate}
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3">Receipt #</th>
                  <th className="py-2.5 px-3">Farmer</th>
                  <th className="py-2.5 px-3">Centre</th>
                  <th className="py-2.5 px-3 text-right">Heavy</th>
                  <th className="py-2.5 px-3 text-right">Light</th>
                  <th className="py-2.5 px-3 text-right">Mbuni</th>
                  <th className="py-2.5 px-3 text-right">Total Kg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {dailyHarvests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500 font-sans">
                      No deliveries recorded on this date.
                    </td>
                  </tr>
                ) : (
                  dailyHarvests.map(h => (
                    <tr key={h.harvest_id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-emerald-400">{h.receipt_number}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-200 font-semibold">{h.farmer_name}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-400">{h.satellite}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{h.cherry_heavy.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{h.cherry_light.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{h.mbuni.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-right text-amber-300 font-bold">{h.total_kg.toFixed(1)} kg</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Group Harvest Report */}
      {reportType === 'group-report' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-slate-100 mb-1">Group Consolidated Deliveries (Year {selectedYear})</h3>
            <p className="text-xs text-slate-400 mb-4">Total harvested kilograms partitioned by farming collective group</p>
            <div className="divide-y divide-slate-800">
              {groupSummaries.map(g => (
                <div key={g.name} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">{g.name}</h4>
                    <p className="text-[11px] text-slate-400">{g.deliveries} total recorded deliveries</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-base font-bold text-amber-300">{g.total.toFixed(1)} kg</span>
                    <p className="text-[10px] text-slate-500">
                      CH: {g.heavy.toFixed(1)} • CL: {g.light.toFixed(1)} • MB: {g.mbuni.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Satellite Centre Report */}
      {reportType === 'satellite-report' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-slate-100 mb-1">Satellite Centre Reception (Year {selectedYear})</h3>
            <p className="text-xs text-slate-400 mb-4">Reception metrics across field buying depots</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {satelliteSummaries.map(s => (
                <div key={s.name} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>{s.name}</span>
                    </h4>
                    <span className="font-mono text-sm font-bold text-emerald-400">{s.total.toFixed(1)} kg</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Location: {s.location || 'Central'}</p>
                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                    <div>CH: <span className="text-slate-200">{s.heavy.toFixed(1)}</span></div>
                    <div>CL: <span className="text-slate-200">{s.light.toFixed(1)}</span></div>
                    <div>MB: <span className="text-slate-200">{s.mbuni.toFixed(1)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Coffee Type Breakdown & 7. Yearly Report */}
      {(reportType === 'coffee-types' || reportType === 'yearly-report') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-400" />
            <span>Seasonal Quality Metrics (Year {selectedYear})</span>
          </h3>
          <p className="text-slate-400">
            Total Coffee Collected across the season: <strong>{grandTotal.grand_total.toFixed(1)} kg</strong>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800 space-y-1">
              <span className="font-bold text-emerald-300">Grade 1: Cherry Heavy</span>
              <p className="text-[11px] text-slate-400">
                Primary ripe cherries suitable for fully washed specialty processing.
              </p>
              <div className="text-xl font-mono font-bold text-emerald-400 pt-2">
                {grandTotal.heavy_total.toFixed(1)} kg
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800 space-y-1">
              <span className="font-bold text-amber-300">Grade 2: Cherry Light</span>
              <p className="text-[11px] text-slate-400">
                Low-density floating cherries skimmed during sorting water tanks.
              </p>
              <div className="text-xl font-mono font-bold text-amber-400 pt-2">
                {grandTotal.light_total.toFixed(1)} kg
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-orange-950/40 border border-orange-800 space-y-1">
              <span className="font-bold text-orange-300">Grade 3: Mbuni</span>
              <p className="text-[11px] text-slate-400">
                Sun-dried cherries stripped from branch tips late season.
              </p>
              <div className="text-xl font-mono font-bold text-orange-400 pt-2">
                {grandTotal.mbuni_total.toFixed(1)} kg
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
