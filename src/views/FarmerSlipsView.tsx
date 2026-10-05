import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext.tsx';
import { Farmer, Harvest } from '../types/index.ts';
import { FarmerSlipModal } from '../components/FarmerSlipModal.tsx';
import { generateFarmerSlipPDF } from '../lib/exportUtils.ts';
import {
  FileText,
  Search,
  Printer,
  Download,
  Calendar,
  User,
  MapPin,
  Boxes,
  ChevronRight,
} from 'lucide-react';

export const FarmerSlipsView: React.FC = () => {
  const { farmers, harvests } = useData();

  const [searchFarmer, setSearchFarmer] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('10'); // October default
  const [activeSlipFarmer, setActiveSlipFarmer] = useState<Farmer | null>(null);

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

  // Filter farmers
  const filteredFarmers = useMemo(() => {
    const q = searchFarmer.toLowerCase();
    return farmers.filter(
      f =>
        !searchFarmer.trim() ||
        f.farmer_name.toLowerCase().includes(q) ||
        f.farmer_id.toLowerCase().includes(q) ||
        f.phone.includes(q)
    );
  }, [farmers, searchFarmer]);

  // Helper to get farmer's deliveries in the selected month
  const getDeliveriesForFarmer = (farmerId: string): Harvest[] => {
    const monthPrefix = `${selectedYear}-${selectedMonth}`;
    return harvests
      .filter(h => h.farmer_id === farmerId && h.collection_date.startsWith(monthPrefix))
      .sort((a, b) => new Date(a.collection_date).getTime() - new Date(b.collection_date).getTime());
  };

  const handleDownloadQuick = (farmer: Farmer) => {
    const deliveries = getDeliveriesForFarmer(farmer.farmer_id);
    const summary = {
      heavy: deliveries.reduce((acc, d) => acc + d.cherry_heavy, 0),
      light: deliveries.reduce((acc, d) => acc + d.cherry_light, 0),
      mbuni: deliveries.reduce((acc, d) => acc + d.mbuni, 0),
      total: deliveries.reduce((acc, d) => acc + d.total_kg, 0),
    };
    generateFarmerSlipPDF(farmer, currentMonthName, Number(selectedYear), deliveries, summary);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            <span>Farmer Monthly Slips</span>
          </h2>
          <p className="text-xs text-slate-400">
            Generate official monthly delivery collection statements with signatures & PDF export
          </p>
        </div>
      </div>

      {/* Scope Selector Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Select Year</label>
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
            <label className="text-[10px] text-slate-400 block mb-1">Select Month</label>
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

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Search Farmer</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchFarmer}
                onChange={e => setSearchFarmer(e.target.value)}
                placeholder="Name or ID (e.g. John, K001)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Farmer Slips Directory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredFarmers.map(farmer => {
          const deliveries = getDeliveriesForFarmer(farmer.farmer_id);
          const totalKg = deliveries.reduce((acc, d) => acc + d.total_kg, 0);

          return (
            <div
              key={farmer.farmer_id}
              className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-800/80">
                      {farmer.farmer_id}
                    </span>
                    <h3 className="font-bold text-sm text-slate-100">{farmer.farmer_name}</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                    {currentMonthName} {selectedYear}
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-xs text-slate-400">
                  <p>{farmer.group} • Centre: {farmer.satellite}</p>
                  <p className="text-[11px] text-slate-500">
                    Farm Member #: {farmer.farm_member_number || 'N/A'} • Phone: {farmer.phone}
                  </p>
                </div>

                {/* Delivery count & total kilos */}
                <div className="mt-3 p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Deliveries in {currentMonthName}:</span>
                    <span className="font-semibold text-slate-200">{deliveries.length} transactions</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px]">Consolidated Kilos:</span>
                    <span className="font-mono font-bold text-amber-300 text-base">
                      {totalKg.toFixed(1)} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleDownloadQuick(farmer)}
                  disabled={deliveries.length === 0}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-40"
                  title="Direct Download PDF Slip"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveSlipFarmer(farmer)}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-950" />
                  <span>View Monthly Slip</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slip Modal */}
      {activeSlipFarmer && (
        <FarmerSlipModal
          farmer={activeSlipFarmer}
          deliveries={getDeliveriesForFarmer(activeSlipFarmer.farmer_id)}
          monthName={currentMonthName}
          year={Number(selectedYear)}
          onClose={() => setActiveSlipFarmer(null)}
        />
      )}
    </div>
  );
};
