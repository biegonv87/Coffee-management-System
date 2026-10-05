import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext.tsx';
import { Harvest } from '../types/index.ts';
import { ReceiptModal } from '../components/ReceiptModal.tsx';
import { generateReceiptPDF } from '../lib/exportUtils.ts';
import {
  Receipt,
  Search,
  Printer,
  Download,
  Calendar,
  User,
  MapPin,
  CheckCircle,
} from 'lucide-react';

export const ReceiptsView: React.FC = () => {
  const { harvests } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Harvest | null>(null);

  // Search filtered receipts
  const filteredReceipts = useMemo(() => {
    return harvests.filter(h => {
      const q = searchTerm.toLowerCase();
      return (
        !searchTerm.trim() ||
        h.receipt_number.toLowerCase().includes(q) ||
        h.farmer_name.toLowerCase().includes(q) ||
        h.farmer_id.toLowerCase().includes(q) ||
        h.collection_date.includes(q)
      );
    });
  }, [harvests, searchTerm]);

  return (
    <div className="space-y-5 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-400" />
            <span>Coffee Collection Receipts Hub</span>
          </h2>
          <p className="text-xs text-slate-400">
            Official delivery receipts, print-ready vouchers, and PDF archiving
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
          Total Issued: <span className="text-emerald-400 font-mono font-bold">{harvests.length}</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search receipts by Receipt # (e.g. CH-2026-000125), farmer name or ID..."
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredReceipts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
            <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">No receipts matched your search.</p>
          </div>
        ) : (
          filteredReceipts.map(harvest => (
            <div
              key={harvest.harvest_id}
              className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-800">
                    {harvest.receipt_number}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{harvest.collection_date}</span>
                  </span>
                </div>

                <div className="mt-2.5 space-y-1">
                  <div className="text-sm font-bold text-slate-100">{harvest.farmer_name}</div>
                  <div className="text-[11px] text-slate-400">
                    Farmer ID: <strong className="text-slate-300 font-mono">{harvest.farmer_id}</strong> • {harvest.group}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Centre: {harvest.satellite} • Officer: {harvest.recorded_by}
                  </div>
                </div>

                {/* Weight badge breakdown */}
                <div className="grid grid-cols-3 gap-2 mt-3 p-2 bg-slate-950/60 rounded-xl border border-slate-800 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-500 block font-sans">Heavy</span>
                    <span className="text-emerald-400 font-bold">{harvest.cherry_heavy.toFixed(1)} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-sans">Light</span>
                    <span className="text-amber-400 font-bold">{harvest.cherry_light.toFixed(1)} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-sans">Mbuni</span>
                    <span className="text-orange-400 font-bold">{harvest.mbuni.toFixed(1)} kg</span>
                  </div>
                </div>
              </div>

              {/* Total & Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Weight</span>
                  <span className="font-mono font-black text-amber-300 text-base">
                    {harvest.total_kg.toFixed(1)} kg
                  </span>
                </div>

                <div className="flex space-x-1.5">
                  <button
                    onClick={() => generateReceiptPDF(harvest)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedReceipt(harvest)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View / Print</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedReceipt && (
        <ReceiptModal harvest={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}
    </div>
  );
};
