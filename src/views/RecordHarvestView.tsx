import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Farmer, Harvest } from '../types/index.ts';
import { ReceiptModal } from '../components/ReceiptModal.tsx';
import {
  Search,
  CheckCircle,
  PlusCircle,
  UserPlus,
  Scale,
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  WifiOff,
} from 'lucide-react';

interface RecordHarvestViewProps {
  onNavigate: (tab: string) => void;
}

export const RecordHarvestView: React.FC<RecordHarvestViewProps> = ({ onNavigate }) => {
  const { farmers, recordHarvest, satellites, isOffline } = useData();
  const { currentUser } = useAuth();

  // Form states
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [farmerSearch, setFarmerSearch] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const [collectionDate, setCollectionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [collectionPoint, setCollectionPoint] = useState<string>(
    currentUser.assigned_satellite || (satellites[0]?.satellite_name || 'Ainabkoi Buying Centre')
  );

  const [cherryHeavy, setCherryHeavy] = useState<string>('');
  const [cherryLight, setCherryLight] = useState<string>('');
  const [mbuni, setMbuni] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastSavedHarvest, setLastSavedHarvest] = useState<Harvest | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  // Quick addition helpers for field officers
  const addWeight = (
    field: 'heavy' | 'light' | 'mbuni',
    delta: number
  ) => {
    if (field === 'heavy') {
      const val = (parseFloat(cherryHeavy) || 0) + delta;
      setCherryHeavy(val.toFixed(1));
    } else if (field === 'light') {
      const val = (parseFloat(cherryLight) || 0) + delta;
      setCherryLight(val.toFixed(1));
    } else {
      const val = (parseFloat(mbuni) || 0) + delta;
      setMbuni(val.toFixed(1));
    }
  };

  // Filter farmers by name or ID
  const filteredFarmers = useMemo(() => {
    if (!farmerSearch.trim()) return farmers.slice(0, 8);
    const q = farmerSearch.toLowerCase();
    return farmers.filter(
      f =>
        f.farmer_name.toLowerCase().includes(q) ||
        f.farmer_id.toLowerCase().includes(q) ||
        f.phone.includes(q)
    );
  }, [farmers, farmerSearch]);

  // Calculations
  const ch = Math.max(0, parseFloat(cherryHeavy) || 0);
  const cl = Math.max(0, parseFloat(cherryLight) || 0);
  const mb = Math.max(0, parseFloat(mbuni) || 0);
  const totalKg = Number((ch + cl + mb).toFixed(2));

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedFarmer) {
      setErrorMsg('Please select a registered farmer before recording delivery.');
      return;
    }

    if (!collectionDate) {
      setErrorMsg('Please select a valid collection date.');
      return;
    }

    if (totalKg <= 0) {
      setErrorMsg('Total delivered kilograms must be greater than 0 kg.');
      return;
    }

    setIsSubmitting(true);

    try {
      const saved = await recordHarvest({
        farmer: selectedFarmer,
        collectionDate,
        cherryHeavy: ch,
        cherryLight: cl,
        mbuni: mb,
        collectionPoint,
        remarks: remarks.trim(),
      });

      setLastSavedHarvest(saved);
      setShowReceiptModal(true);

      // Reset weights for next recording
      setCherryHeavy('');
      setCherryLight('');
      setMbuni('');
      setRemarks('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record harvest delivery.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            <Scale className="w-6 h-6 text-emerald-400" />
            <span>Record Harvest Delivery</span>
          </h2>
          <p className="text-xs text-slate-400">
            Rapid weighing entry & automated receipt issuance
          </p>
        </div>

        {isOffline && (
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <WifiOff className="w-3 h-3" />
            <span>Local Offline Entry</span>
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-950/80 border border-red-800 rounded-2xl text-red-200 text-xs flex items-start space-x-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        {/* Section 1: Farmer Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
            1. Select Farmer *
          </label>

          <div className="relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={selectedFarmer ? `${selectedFarmer.farmer_name} (${selectedFarmer.farmer_id})` : farmerSearch}
                onChange={e => {
                  setSelectedFarmer(null);
                  setFarmerSearch(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search farmer by Name or Farmer ID (e.g. John, K001)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-10 py-3 text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              {selectedFarmer && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFarmer(null);
                    setFarmerSearch('');
                  }}
                  className="absolute right-3 text-slate-400 hover:text-white text-xs bg-slate-800 rounded-lg px-2 py-1"
                >
                  Change
                </button>
              )}
            </div>

            {/* Farmer Search Dropdown */}
            {isDropdownOpen && !selectedFarmer && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-40 divide-y divide-slate-800">
                {filteredFarmers.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-slate-400 mb-2">No farmer found matching "{farmerSearch}"</p>
                    <button
                      type="button"
                      onClick={() => onNavigate('farmers')}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register New Farmer</span>
                    </button>
                  </div>
                ) : (
                  filteredFarmers.map(farmer => (
                    <button
                      key={farmer.farmer_id}
                      type="button"
                      onClick={() => {
                        setSelectedFarmer(farmer);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left p-3 hover:bg-slate-900 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-100 text-sm">{farmer.farmer_name}</div>
                        <div className="text-[11px] text-slate-400">
                          {farmer.group} • {farmer.satellite}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-400 text-xs px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80">
                          {farmer.farmer_id}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{farmer.phone}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Farmer Info Card Preview */}
          {selectedFarmer && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-emerald-200 text-sm">{selectedFarmer.farmer_name}</div>
                <div className="text-[11px] text-emerald-300/80">
                  {selectedFarmer.group} • Centre: {selectedFarmer.satellite}
                </div>
                <div className="text-[10px] text-slate-400">
                  Farm No: {selectedFarmer.farm_member_number || 'N/A'} • Phone: {selectedFarmer.phone}
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-amber-300 text-sm block">
                  {selectedFarmer.farmer_id}
                </span>
                <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-900 text-emerald-300">
                  {selectedFarmer.status}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Metadata (Date, Centre, Officer) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Collection Date *</span>
            </label>
            <input
              type="date"
              value={collectionDate}
              onChange={e => setCollectionDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Collection Point / Centre *</span>
            </label>
            <select
              value={collectionPoint}
              onChange={e => setCollectionPoint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {satellites.map(sat => (
                <option key={sat.satellite_id} value={sat.satellite_name}>
                  {sat.satellite_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: Kilogram Weights Entry (Cherry Heavy, Cherry Light, Mbuni) */}
        <div className="space-y-4 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
            <span>2. Coffee Quantities (Kilograms)</span>
            <span className="text-[10px] lowercase text-slate-400 font-normal">Decimals supported e.g. 25.5 kg</span>
          </label>

          {/* Cherry Heavy */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-300">Cherry Heavy (CH)</span>
                <p className="text-[10px] text-slate-400">High density prime ripe red cherries</p>
              </div>
              <div className="w-36">
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={cherryHeavy}
                    onChange={e => setCherryHeavy(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-700/80 rounded-xl px-3 py-2 text-right font-mono font-bold text-base text-emerald-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-9 top-2.5 text-xs text-slate-500 font-normal pointer-events-none">
                    kg
                  </span>
                </div>
              </div>
            </div>

            {/* Quick add buttons */}
            <div className="flex items-center space-x-1.5 pt-1">
              <span className="text-[10px] text-slate-500">Quick add:</span>
              {[5, 10, 25, 50].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addWeight('heavy', amt)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Cherry Light */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-300">Cherry Light (CL)</span>
                <p className="text-[10px] text-slate-400">Floaters, lighter density secondary</p>
              </div>
              <div className="w-36">
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={cherryLight}
                    onChange={e => setCherryLight(e.target.value)}
                    className="w-full bg-slate-900 border border-amber-700/80 rounded-xl px-3 py-2 text-right font-mono font-bold text-base text-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-9 top-2.5 text-xs text-slate-500 font-normal pointer-events-none">
                    kg
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 pt-1">
              <span className="text-[10px] text-slate-500">Quick add:</span>
              {[2, 5, 10, 20].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addWeight('light', amt)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Mbuni */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-orange-300">Mbuni (MB)</span>
                <p className="text-[10px] text-slate-400">Dried ripe tree cherry / dry pods</p>
              </div>
              <div className="w-36">
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={mbuni}
                    onChange={e => setMbuni(e.target.value)}
                    className="w-full bg-slate-900 border border-orange-700/80 rounded-xl px-3 py-2 text-right font-mono font-bold text-base text-orange-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="absolute right-9 top-2.5 text-xs text-slate-500 font-normal pointer-events-none">
                    kg
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 pt-1">
              <span className="text-[10px] text-slate-500">Quick add:</span>
              {[1, 2, 5, 10].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addWeight('mbuni', amt)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Live Calculated Total Kilos (Read-Only) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-amber-950 border-2 border-emerald-500/80 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs uppercase font-extrabold text-emerald-300 tracking-wider block">
              Calculated Total Kilos
            </span>
            <span className="text-[11px] text-emerald-200">
              CH ({ch.toFixed(1)}) + CL ({cl.toFixed(1)}) + MB ({mb.toFixed(1)})
            </span>
          </div>
          <div className="text-right">
            <span className="text-3xl sm:text-4xl font-black font-mono text-amber-300 tracking-tight">
              {totalKg.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-amber-400 ml-1">kg</span>
          </div>
        </div>

        {/* Optional Remarks */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Optional Remarks</span>
          </label>
          <input
            type="text"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="e.g. Extra clean ripe batch, bag #4, verified tare weight"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Recorded By details */}
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
          <span>Officer: <strong className="text-slate-300">{currentUser.name}</strong></span>
          <span>Station: <strong className="text-slate-300">{collectionPoint}</strong></span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !selectedFarmer || totalKg <= 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-950/60 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <CheckCircle className="w-5 h-5 text-slate-950" />
          <span>{isSubmitting ? 'RECORDING & GENERATING RECEIPT...' : 'CONFIRM & ISSUE RECEIPT'}</span>
        </button>
      </form>

      {/* Instant Receipt Modal Pop-up on success */}
      {showReceiptModal && lastSavedHarvest && (
        <ReceiptModal
          harvest={lastSavedHarvest}
          onClose={() => setShowReceiptModal(false)}
          showSuccessBadge={true}
        />
      )}
    </div>
  );
};
