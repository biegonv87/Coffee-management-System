import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Harvest } from '../types/index.ts';
import { ReceiptModal } from '../components/ReceiptModal.tsx';
import { EditHarvestModal } from '../components/EditHarvestModal.tsx';
import { exportToCSV } from '../lib/exportUtils.ts';
import {
  ClipboardList,
  Search,
  Filter,
  Receipt,
  Edit,
  Download,
  Calendar,
  Layers,
  CheckCircle,
  Clock,
  Sparkles,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';

export const HarvestRecordsView: React.FC = () => {
  const { harvests, groups, satellites } = useData();
  const { canEditHarvest } = useAuth();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterSatellite, setFilterSatellite] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('ALL');
  const [filterYear, setFilterYear] = useState('2026');
  const [filterCoffeeType, setFilterCoffeeType] = useState('ALL'); // ALL, HEAVY_ONLY, LIGHT_PRESENT, MBUNI_PRESENT

  // Modals
  const [receiptHarvest, setReceiptHarvest] = useState<Harvest | null>(null);
  const [editHarvest, setEditHarvest] = useState<Harvest | null>(null);

  // Available months
  const months = [
    { value: 'ALL', label: 'All Months' },
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

  // Filtered harvest records
  const filteredHarvests = useMemo(() => {
    return harvests.filter(h => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        h.farmer_name.toLowerCase().includes(q) ||
        h.farmer_id.toLowerCase().includes(q) ||
        h.receipt_number.toLowerCase().includes(q);

      const matchesGroup = filterGroup === 'ALL' || h.group === filterGroup;
      const matchesSatellite = filterSatellite === 'ALL' || h.satellite === filterSatellite;

      // Date parsing
      const [year, month] = h.collection_date.split('-');
      const matchesYear = filterYear === 'ALL' || year === filterYear;
      const matchesMonth = filterMonth === 'ALL' || month === filterMonth;

      let matchesCoffeeType = true;
      if (filterCoffeeType === 'HEAVY_DOMINANT') {
        matchesCoffeeType = h.cherry_heavy >= h.cherry_light && h.cherry_heavy >= h.mbuni;
      } else if (filterCoffeeType === 'LIGHT_ONLY') {
        matchesCoffeeType = h.cherry_light > 0 && h.cherry_heavy === 0;
      } else if (filterCoffeeType === 'MBUNI_PRESENT') {
        matchesCoffeeType = h.mbuni > 0;
      }

      return matchesSearch && matchesGroup && matchesSatellite && matchesYear && matchesMonth && matchesCoffeeType;
    });
  }, [harvests, searchTerm, filterGroup, filterSatellite, filterYear, filterMonth, filterCoffeeType]);

  // Aggregate stats of filtered results
  const totalFilteredKg = filteredHarvests.reduce((acc, h) => acc + h.total_kg, 0);
  const totalFilteredHeavy = filteredHarvests.reduce((acc, h) => acc + h.cherry_heavy, 0);
  const totalFilteredLight = filteredHarvests.reduce((acc, h) => acc + h.cherry_light, 0);
  const totalFilteredMbuni = filteredHarvests.reduce((acc, h) => acc + h.mbuni, 0);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Receipt Number',
      'Date',
      'Farmer ID',
      'Farmer Name',
      'Group',
      'Satellite',
      'Cherry Heavy (kg)',
      'Cherry Light (kg)',
      'Mbuni (kg)',
      'Total Kilos (kg)',
      'Recorded By',
      'Remarks',
    ];

    const rows = filteredHarvests.map(h => [
      h.receipt_number,
      h.collection_date,
      h.farmer_id,
      h.farmer_name,
      h.group,
      h.satellite,
      h.cherry_heavy.toFixed(1),
      h.cherry_light.toFixed(1),
      h.mbuni.toFixed(1),
      h.total_kg.toFixed(1),
      h.recorded_by,
      h.remarks || '',
    ]);

    exportToCSV(`Coffee_Harvest_Records_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-400" />
            <span>Harvest Records & Deliveries</span>
          </h2>
          <p className="text-xs text-slate-400">
            Immutable transaction records, weighing entries, receipts, and audit trail
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredHarvests.length === 0}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow-sm transition-colors disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export CSV / Excel</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-sm space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by farmer name, farmer ID, or receipt number (e.g. CH-2026-000101)..."
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* 5-way Filter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div>
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Years</option>
              <option value="2026">Year 2026</option>
              <option value="2025">Year 2025</option>
            </select>
          </div>

          <div>
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterGroup}
              onChange={e => setFilterGroup(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
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
            <select
              value={filterSatellite}
              onChange={e => setFilterSatellite(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Satellites</option>
              {satellites.map(s => (
                <option key={s.satellite_id} value={s.satellite_name}>
                  {s.satellite_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <select
              value={filterCoffeeType}
              onChange={e => setFilterCoffeeType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Coffee Grades</option>
              <option value="HEAVY_DOMINANT">Heavy Cherry</option>
              <option value="MBUNI_PRESENT">Mbuni Present</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate Grand Total Summary Bar for filtered view */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-slate-400">
          Showing <strong className="text-slate-200">{filteredHarvests.length}</strong> deliveries
        </div>
        <div className="flex items-center space-x-4 font-mono">
          <div>
            <span className="text-[10px] text-slate-500 block">Heavy:</span>
            <span className="font-bold text-emerald-400">{totalFilteredHeavy.toFixed(1)} kg</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Light:</span>
            <span className="font-bold text-amber-400">{totalFilteredLight.toFixed(1)} kg</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Mbuni:</span>
            <span className="font-bold text-orange-400">{totalFilteredMbuni.toFixed(1)} kg</span>
          </div>
          <div className="pl-2 border-l border-slate-700">
            <span className="text-[10px] text-emerald-300 block font-semibold">Total Kilos:</span>
            <span className="text-base font-black text-amber-300">{totalFilteredKg.toFixed(1)} kg</span>
          </div>
        </div>
      </div>

      {/* Records Table / Cards */}
      <div className="space-y-3">
        {filteredHarvests.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">No harvest records match your filter criteria.</p>
          </div>
        ) : (
          filteredHarvests.map(harvest => (
            <div
              key={harvest.harvest_id}
              className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {harvest.receipt_number}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{harvest.farmer_name}</h4>
                    <p className="text-[11px] text-slate-400">
                      ID: <span className="font-mono text-slate-300">{harvest.farmer_id}</span> • {harvest.group}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <div>
                    <span className="text-lg font-black font-mono text-amber-300">
                      {harvest.total_kg.toFixed(1)} kg
                    </span>
                    <span className="block text-[10px] text-slate-400">{harvest.collection_date}</span>
                  </div>
                </div>
              </div>

              {/* Subcategories Breakdown row */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Cherry Heavy</span>
                  <span className="text-emerald-400 font-bold">{harvest.cherry_heavy.toFixed(1)} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Cherry Light</span>
                  <span className="text-amber-400 font-bold">{harvest.cherry_light.toFixed(1)} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Mbuni</span>
                  <span className="text-orange-400 font-bold">{harvest.mbuni.toFixed(1)} kg</span>
                </div>
              </div>

              {/* Bottom metadata & actions */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                <div className="text-[11px] text-slate-500">
                  <span>Centre: <strong className="text-slate-400">{harvest.satellite}</strong></span>
                  <span className="mx-2">•</span>
                  <span>Officer: <strong className="text-slate-400">{harvest.recorded_by}</strong></span>
                  {harvest.updated_at && (
                    <span className="ml-2 text-amber-400 font-semibold" title="Record corrected by Admin">
                      (Corrected)
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {canEditHarvest && (
                    <button
                      onClick={() => setEditHarvest(harvest)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors flex items-center space-x-1"
                      title="Correct Harvest (Administrator Audit Trail)"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] hidden sm:inline">Correct</span>
                    </button>
                  )}

                  <button
                    onClick={() => setReceiptHarvest(harvest)}
                    className="p-1.5 px-2.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 transition-colors flex items-center space-x-1"
                    title="View & Print Official Receipt"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {receiptHarvest && (
        <ReceiptModal harvest={receiptHarvest} onClose={() => setReceiptHarvest(null)} />
      )}

      {editHarvest && (
        <EditHarvestModal
          harvest={editHarvest}
          onClose={() => setEditHarvest(null)}
          onSuccess={() => setEditHarvest(null)}
        />
      )}
    </div>
  );
};
