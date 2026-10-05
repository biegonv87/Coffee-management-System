import React, { useState } from 'react';
import { Harvest } from '../types/index.ts';
import { useData } from '../context/DataContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { AlertTriangle, X, Check, Save } from 'lucide-react';

interface EditHarvestModalProps {
  harvest: Harvest | null;
  onClose: () => void;
  onSuccess: (updated: Harvest) => void;
}

export const EditHarvestModal: React.FC<EditHarvestModalProps> = ({
  harvest,
  onClose,
  onSuccess,
}) => {
  const { correctHarvestRecord } = useData();
  const { canEditHarvest } = useAuth();

  const [cherryHeavy, setCherryHeavy] = useState<string>(harvest ? String(harvest.cherry_heavy) : '0');
  const [cherryLight, setCherryLight] = useState<string>(harvest ? String(harvest.cherry_light) : '0');
  const [mbuni, setMbuni] = useState<string>(harvest ? String(harvest.mbuni) : '0');
  const [remarks, setRemarks] = useState<string>(harvest?.remarks || '');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!harvest) return null;

  const ch = Math.max(0, parseFloat(cherryHeavy) || 0);
  const cl = Math.max(0, parseFloat(cherryLight) || 0);
  const mb = Math.max(0, parseFloat(mbuni) || 0);
  const total = Number((ch + cl + mb).toFixed(2));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditHarvest) {
      setErrorMsg('Permission denied: Only Administrators can modify harvest records.');
      return;
    }

    if (!reason || reason.trim().length < 5) {
      setErrorMsg('Please specify a valid reason for this correction (at least 5 characters).');
      return;
    }

    if (total <= 0) {
      setErrorMsg('Total kilograms cannot be zero.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const updated = await correctHarvestRecord(
        harvest.harvest_id,
        {
          cherry_heavy: ch,
          cherry_light: cl,
          mbuni: mb,
          total_kg: total,
          remarks: remarks.trim(),
        },
        reason.trim()
      );
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save correction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-auto">
        {/* Header */}
        <div className="bg-amber-950/60 border-b border-amber-800/60 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-200">Correct Harvest Record</h3>
              <p className="text-[11px] text-amber-300/80">Audit trail logging is active</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Record overview */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">Receipt Number</span>
              <span className="font-mono font-bold text-emerald-400">{harvest.receipt_number}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Collection Date</span>
              <span className="font-semibold text-slate-200">{harvest.collection_date}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 text-[10px] block">Farmer</span>
              <span className="font-semibold text-slate-200">{harvest.farmer_name} ({harvest.farmer_id})</span>
            </div>
          </div>

          {/* Weight inputs */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Heavy (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={cherryHeavy}
                onChange={e => setCherryHeavy(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Light (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={cherryLight}
                onChange={e => setCherryLight(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Mbuni (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={mbuni}
                onChange={e => setMbuni(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Auto-calculated Total preview */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-center justify-between">
            <span className="text-xs text-emerald-200 font-semibold uppercase">Recalculated Total Weight:</span>
            <span className="font-mono text-lg font-bold text-amber-300">{total.toFixed(1)} kg</span>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Remarks (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Adjusted after digital scale verification"
            />
          </div>

          {/* Reason for Correction (MANDATORY AUDIT) */}
          <div>
            <label className="block text-[11px] font-bold text-amber-300 mb-1">
              Reason for Correction * (Required for Audit Trail)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="State the justification, e.g. 'Field scale recalibration offset error corrected' or 'Farmer disputed tare weight'"
              className="w-full bg-slate-800 border border-amber-700/60 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Logging Correction...' : 'Save & Log to Audit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
