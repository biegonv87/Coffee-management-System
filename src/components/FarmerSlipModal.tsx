import React from 'react';
import { Farmer, Harvest } from '../types/index.ts';
import { generateFarmerSlipPDF, ORG_NAME, ORG_TAGLINE } from '../lib/exportUtils.ts';
import { Download, Printer, X, FileText } from 'lucide-react';

interface FarmerSlipModalProps {
  farmer: Farmer | null;
  deliveries: Harvest[];
  monthName: string;
  year: number;
  onClose: () => void;
}

export const FarmerSlipModal: React.FC<FarmerSlipModalProps> = ({
  farmer,
  deliveries,
  monthName,
  year,
  onClose,
}) => {
  if (!farmer) return null;

  const heavyTotal = deliveries.reduce((acc, d) => acc + d.cherry_heavy, 0);
  const lightTotal = deliveries.reduce((acc, d) => acc + d.cherry_light, 0);
  const mbuniTotal = deliveries.reduce((acc, d) => acc + d.mbuni, 0);
  const overallTotal = deliveries.reduce((acc, d) => acc + d.total_kg, 0);

  const summary = {
    heavy: heavyTotal,
    light: lightTotal,
    mbuni: mbuniTotal,
    total: overallTotal,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateFarmerSlipPDF(farmer, monthName, year, deliveries, summary);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 my-auto">
        {/* Top Action Bar */}
        <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm">Monthly Harvest Statement Slip</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Print Slip"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Slip Body */}
        <div className="p-6 print:p-8 bg-amber-50/15" id="printable-farmer-slip">
          {/* Slip Header */}
          <div className="text-center border-b-2 border-emerald-900 pb-3 mb-4">
            <h2 className="text-sm sm:text-base font-black tracking-wide text-emerald-950 uppercase">
              {ORG_NAME}
            </h2>
            <p className="text-xs font-bold text-amber-900 mt-0.5 uppercase tracking-wider">
              Coffee Harvest Collection Statement
            </p>
            <p className="text-[11px] text-slate-600">{ORG_TAGLINE}</p>
            <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-semibold text-xs">
              Statement Period: {monthName} {year}
            </div>
          </div>

          {/* Farmer Particulars Grid */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Farmer Name</span>
                <span className="font-bold text-slate-900 text-sm">{farmer.farmer_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Farmer ID / Code</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">{farmer.farmer_id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Phone</span>
                <span className="text-slate-800 font-medium">{farmer.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Group</span>
                <span className="text-slate-800 font-medium">{farmer.group}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Satellite Centre</span>
                <span className="text-slate-800 font-medium">{farmer.satellite}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Farm Member #</span>
                <span className="text-slate-800 font-medium">{farmer.farm_member_number || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Deliveries Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 text-xs">
            <table className="w-full text-left">
              <thead className="bg-emerald-950 text-white text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Receipt #</th>
                  <th className="py-2.5 px-3 text-right">Heavy kg</th>
                  <th className="py-2.5 px-3 text-right">Light kg</th>
                  <th className="py-2.5 px-3 text-right">Mbuni kg</th>
                  <th className="py-2.5 px-3 text-right">Total kg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No deliveries recorded for this farmer in {monthName} {year}.
                    </td>
                  </tr>
                ) : (
                  deliveries.map((d) => (
                    <tr key={d.harvest_id} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 font-medium text-slate-900">{d.collection_date}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{d.receipt_number}</td>
                      <td className="py-2 px-3 text-right font-mono">{d.cherry_heavy.toFixed(1)}</td>
                      <td className="py-2 px-3 text-right font-mono">{d.cherry_light.toFixed(1)}</td>
                      <td className="py-2 px-3 text-right font-mono">{d.mbuni.toFixed(1)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {d.total_kg.toFixed(1)} kg
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-emerald-50/80 border-t-2 border-emerald-800 text-emerald-950 font-bold">
                <tr>
                  <td colSpan={2} className="py-2.5 px-3 uppercase text-xs">
                    Monthly Total ({deliveries.length} Deliveries)
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{heavyTotal.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{lightTotal.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{mbuniTotal.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-emerald-900">
                    {overallTotal.toFixed(1)} kg
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Grand Highlight Box */}
          <div className="bg-emerald-900 text-white rounded-xl p-3.5 flex items-center justify-between mb-5 shadow-xs">
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold block">
                Farmer Monthly Consolidation Total
              </span>
              <span className="text-[11px] text-emerald-300">
                Heavy: {heavyTotal.toFixed(1)} kg • Light: {lightTotal.toFixed(1)} kg • Mbuni: {mbuniTotal.toFixed(1)} kg
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-amber-300">
                {overallTotal.toFixed(1)} kg
              </span>
            </div>
          </div>

          {/* Signature Lines */}
          <div className="pt-4 border-t border-dashed border-slate-300 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="h-10 border-b border-slate-400 flex items-end justify-center pb-1">
                <span className="text-[10px] text-slate-400 italic">Farmer Sign</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-600 mt-1">Farmer Signature</p>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400 flex items-end justify-center pb-1">
                <span className="text-[10px] text-slate-400 italic">Officer Sign</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-600 mt-1">Collection Officer</p>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400 flex items-end justify-center pb-1">
                <span className="text-[10px] text-slate-600 font-mono">{new Date().toLocaleDateString()}</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-600 mt-1">Date Certified</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-100 px-4 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
