import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Farmer, Harvest } from '../types/index.ts';
import {
  Users,
  Search,
  UserPlus,
  Filter,
  Phone,
  MapPin,
  Boxes,
  FileText,
  Calendar,
  ChevronRight,
  X,
  CheckCircle,
  History,
  Scale,
} from 'lucide-react';

interface FarmersViewProps {
  onNavigate: (tab: string, state?: any) => void;
}

export const FarmersView: React.FC<FarmersViewProps> = ({ onNavigate }) => {
  const { farmers, harvests, groups, satellites, registerFarmer, updateFarmer } = useData();
  const { canManageFarmers } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterSatellite, setFilterSatellite] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Register Modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newFarmerId, setNewFarmerId] = useState('');
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGroup, setNewGroup] = useState(groups[0]?.group_name || '');
  const [newSatellite, setNewSatellite] = useState(satellites[0]?.satellite_name || '');
  const [newFarmNumber, setNewFarmNumber] = useState('');
  const [newStatus, setNewStatus] = useState<'Active' | 'Inactive'>('Active');
  const [regError, setRegError] = useState<string | null>(null);

  // Selected Farmer Details Drawer / History
  const [selectedFarmerForHistory, setSelectedFarmerForHistory] = useState<Farmer | null>(null);

  // Filtered farmers
  const filteredFarmers = useMemo(() => {
    return farmers.filter(f => {
      const matchesSearch =
        !searchQuery.trim() ||
        f.farmer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.farmer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.phone.includes(searchQuery);

      const matchesGroup = filterGroup === 'ALL' || f.group === filterGroup;
      const matchesSatellite = filterSatellite === 'ALL' || f.satellite === filterSatellite;
      const matchesStatus = filterStatus === 'ALL' || f.status === filterStatus;

      return matchesSearch && matchesGroup && matchesSatellite && matchesStatus;
    });
  }, [farmers, searchQuery, filterGroup, filterSatellite, filterStatus]);

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!newFarmerId.trim() || !newFarmerName.trim()) {
      setRegError('Farmer ID and Full Name are required.');
      return;
    }

    try {
      await registerFarmer({
        farmer_id: newFarmerId.trim().toUpperCase(),
        farmer_name: newFarmerName.trim(),
        phone: newPhone.trim(),
        group: newGroup,
        satellite: newSatellite,
        farm_member_number: newFarmNumber.trim(),
        status: newStatus,
      });

      setShowRegisterModal(false);
      setNewFarmerId('');
      setNewFarmerName('');
      setNewPhone('');
      setNewFarmNumber('');
    } catch (err: any) {
      setRegError(err.message || 'Failed to register farmer');
    }
  };

  // Farmer history
  const farmerDeliveries = useMemo(() => {
    if (!selectedFarmerForHistory) return [];
    return harvests
      .filter(h => h.farmer_id === selectedFarmerForHistory.farmer_id)
      .sort((a, b) => new Date(b.collection_date).getTime() - new Date(a.collection_date).getTime());
  }, [harvests, selectedFarmerForHistory]);

  const farmerTotalKg = farmerDeliveries.reduce((acc, h) => acc + h.total_kg, 0);

  return (
    <div className="space-y-5 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Farmers Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Registered smallholder farmers, membership status, and full delivery logs
          </p>
        </div>

        {canManageFarmers && (
          <button
            onClick={() => {
              setNewGroup(groups[0]?.group_name || '');
              setNewSatellite(satellites[0]?.satellite_name || '');
              setShowRegisterModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Farmer</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by farmer name, ID (e.g. K001), or phone number..."
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <select
              value={filterGroup}
              onChange={e => setFilterGroup(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Satellite Centres</option>
              {satellites.map(s => (
                <option key={s.satellite_id} value={s.satellite_name}>
                  {s.satellite_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Farmers List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredFarmers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">No farmers matched your search criteria.</p>
          </div>
        ) : (
          filteredFarmers.map(farmer => {
            const deliveries = harvests.filter(h => h.farmer_id === farmer.farmer_id);
            const totalDelivered = deliveries.reduce((acc, h) => acc + h.total_kg, 0);

            return (
              <div
                key={farmer.farmer_id}
                className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {farmer.farmer_id}
                        </span>
                        <h3 className="font-bold text-slate-100 text-sm">{farmer.farmer_name}</h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Boxes className="w-3 h-3 text-slate-500" />
                        <span>{farmer.group}</span>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        farmer.status === 'Active'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {farmer.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Centre:</span>
                      <span className="text-slate-300 font-medium text-[11px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{farmer.satellite}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Phone:</span>
                      <span className="text-slate-300 font-mono text-[11px]">{farmer.phone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Member No:</span>
                      <span className="text-slate-300 font-mono text-[11px]">
                        {farmer.farm_member_number || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Deliveries:</span>
                      <span className="text-amber-300 font-mono font-bold text-[11px]">
                        {deliveries.length} ({totalDelivered.toFixed(1)} kg)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => setSelectedFarmerForHistory(farmer)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
                  >
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    <span>Delivery History</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('record-harvest');
                    }}
                    className="py-1.5 px-3 rounded-xl bg-emerald-800/60 hover:bg-emerald-700 text-emerald-300 text-xs font-semibold flex items-center space-x-1 transition-colors"
                    title="Record coffee delivery for this farmer"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Record</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Register Farmer Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-auto">
            <div className="bg-emerald-950/60 border-b border-emerald-900/60 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Register New Coffee Farmer</h3>
                  <p className="text-[11px] text-emerald-400">Add farmer to cooperative registry</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-5 space-y-3.5 text-xs">
              {regError && (
                <div className="p-3 bg-red-950 border border-red-800 rounded-xl text-red-200 text-xs">
                  {regError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Farmer ID / Code *
                  </label>
                  <input
                    type="text"
                    value={newFarmerId}
                    onChange={e => setNewFarmerId(e.target.value)}
                    placeholder="e.g. K009"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Farm / Member #
                  </label>
                  <input
                    type="text"
                    value={newFarmNumber}
                    onChange={e => setNewFarmNumber(e.target.value)}
                    placeholder="e.g. FM-120"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Farmer Full Name *
                </label>
                <input
                  type="text"
                  value={newFarmerName}
                  onChange={e => setNewFarmerName(e.target.value)}
                  placeholder="e.g. Jonathan Cheruiyot"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="e.g. +254 712 345 678"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Cooperative Group *
                </label>
                <select
                  value={newGroup}
                  onChange={e => setNewGroup(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  {groups.map(g => (
                    <option key={g.group_id} value={g.group_name}>
                      {g.group_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Satellite / Collection Centre *
                </label>
                <select
                  value={newSatellite}
                  onChange={e => setNewSatellite(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  {satellites.map(s => (
                    <option key={s.satellite_id} value={s.satellite_name}>
                      {s.satellite_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                >
                  Save Farmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farmer Delivery History Modal */}
      {selectedFarmerForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-auto">
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  <span>Delivery History: {selectedFarmerForHistory.farmer_name}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  ID: {selectedFarmerForHistory.farmer_id} • Group: {selectedFarmerForHistory.group}
                </p>
              </div>
              <button
                onClick={() => setSelectedFarmerForHistory(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Summary stat box */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-300">Lifetime Deliveries:</span>
                  <p className="text-xs text-slate-300">{farmerDeliveries.length} transactions on record</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black font-mono text-amber-300">{farmerTotalKg.toFixed(1)} kg</span>
                  <span className="block text-[10px] text-slate-400">Total Coffee</span>
                </div>
              </div>

              {farmerDeliveries.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No delivery transactions recorded yet.</p>
              ) : (
                <div className="border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Receipt #</th>
                        <th className="py-2.5 px-3 text-right">Heavy kg</th>
                        <th className="py-2.5 px-3 text-right">Light kg</th>
                        <th className="py-2.5 px-3 text-right">Mbuni kg</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                      {farmerDeliveries.map(d => (
                        <tr key={d.harvest_id} className="hover:bg-slate-800/50">
                          <td className="py-2 px-3 font-medium text-slate-200">{d.collection_date}</td>
                          <td className="py-2 px-3 font-mono text-emerald-400 text-[11px]">{d.receipt_number}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-300">{d.cherry_heavy.toFixed(1)}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-300">{d.cherry_light.toFixed(1)}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-300">{d.mbuni.toFixed(1)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-amber-300">{d.total_kg.toFixed(1)} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedFarmerForHistory(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
