import React from 'react';
import { Harvest } from '../types/index.ts';
import { generateReceiptPDF, ORG_NAME, ORG_TAGLINE, ORG_CONTACT } from '../lib/exportUtils.ts';
import { Download, Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  harvest: Harvest | null;
  onClose: () => void;
  showSuccessBadge?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  harvest,
  onClose,
  showSuccessBadge = false,
}) => {
  if (!harvest) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateReceiptPDF(harvest);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 my-auto">
        {/* Top Action Bar */}
        <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">Official Harvest Receipt</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Print Receipt"
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

        {/* Printable Receipt Body */}
        <div className="p-5 sm:p-6 print:p-8 bg-amber-50/20" id="printable-receipt">
          {showSuccessBadge && (
            <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Harvest recorded & delivery receipt generated successfully!</span>
            </div>
          )}

          {/* Receipt Header Banner */}
          <div className="text-center border-b-2 border-emerald-800 pb-3 mb-4">
            <h2 className="text-xs sm:text-sm font-black tracking-wide text-emerald-950 uppercase">
              {ORG_NAME}
            </h2>
            <p className="text-[10px] text-emerald-700 font-medium">{ORG_TAGLINE}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">{ORG_CONTACT}</p>
          </div>

          {/* Meta Info Grid */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs mb-4 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Receipt Number:</span>
              <span className="font-mono font-bold text-emerald-800 text-sm">{harvest.receipt_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Collection Date:</span>
              <span className="font-semibold text-slate-700">{harvest.collection_date}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Collection Centre:</span>
              <span className="font-semibold text-slate-700">{harvest.satellite}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Recorded By Officer:</span>
              <span className="font-medium text-slate-700">{harvest.recorded_by}</span>
            </div>
          </div>

          {/* Farmer Particulars */}
          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 mb-4 text-xs">
            <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-1">
              Farmer Particulars
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-slate-500 block text-[10px]">Farmer Name</span>
                <span className="font-bold text-slate-900">{harvest.farmer_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Farmer ID</span>
                <span className="font-mono font-bold text-slate-900">{harvest.farmer_id}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px]">Cooperative Group</span>
                <span className="font-semibold text-slate-800">{harvest.group}</span>
              </div>
            </div>
          </div>

          {/* Weight Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 text-xs">
            <table className="w-full text-left">
              <thead className="bg-emerald-900 text-white text-[11px]">
                <tr>
                  <th className="py-2 px-3">Coffee Category</th>
                  <th className="py-2 px-3 text-right">Net Weight (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="py-2 px-3 font-medium text-slate-800">Cherry Heavy (CH)</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                    {harvest.cherry_heavy.toFixed(1)} kg
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-slate-800">Cherry Light (CL)</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                    {harvest.cherry_light.toFixed(1)} kg
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-slate-800">Mbuni (MB)</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                    {harvest.mbuni.toFixed(1)} kg
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-emerald-100/70 border-t-2 border-emerald-700 text-emerald-950 font-bold">
                <tr>
                  <td className="py-2.5 px-3 uppercase text-xs">Total Net Kilos</td>
                  <td className="py-2.5 px-3 text-right font-mono text-base text-emerald-900">
                    {harvest.total_kg.toFixed(1)} kg
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {harvest.remarks && (
            <div className="mb-4 p-2 bg-slate-100 rounded-lg text-[11px] text-slate-600 italic">
              Remarks: {harvest.remarks}
            </div>
          )}

          {/* Signature Areas */}
          <div className="pt-4 border-t border-dashed border-slate-300 grid grid-cols-2 gap-6 mt-4">
            <div className="text-center">
              <div className="h-9 border-b border-slate-400 flex items-end justify-center pb-1">
                <span className="text-[10px] text-slate-400 font-serif italic">Signed</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-600 mt-1">Farmer Signature</p>
            </div>
            <div className="text-center">
              <div className="h-9 border-b border-slate-400 flex items-end justify-center pb-1">
                <span className="text-[10px] text-slate-400 font-serif italic">{harvest.recorded_by}</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-600 mt-1">Collection Officer</p>
            </div>
          </div>

          {/* Barcode & Timestamp */}
          <div className="mt-5 text-center text-[9px] text-slate-400 font-mono">
            * {harvest.receipt_number} * ISSUED {new Date(harvest.created_at).toLocaleString()} *
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
              <span>Print</span>
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
