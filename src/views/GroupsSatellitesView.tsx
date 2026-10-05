import React, { useState } from 'react';
import { useData } from '../context/DataContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Boxes, MapPin, Plus, CheckCircle, AlertCircle } from 'lucide-react';

export const GroupsSatellitesView: React.FC = () => {
  const { groups, satellites, addGroup, addSatellite, harvests, farmers } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'groups' | 'satellites'>('groups');

  // Add group modal
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // Add satellite modal
  const [newSatName, setNewSatName] = useState('');
  const [newSatLoc, setNewSatLoc] = useState('');

  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      await addGroup(newGroupName.trim(), newGroupDesc.trim());
      setNewGroupName('');
      setNewGroupDesc('');
      setStatusMsg('Group added successfully!');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error adding group');
    }
  };

  const handleAddSatellite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSatName.trim()) return;
    try {
      await addSatellite(newSatName.trim(), newSatLoc.trim());
      setNewSatName('');
      setNewSatLoc('');
      setStatusMsg('Satellite collection centre added successfully!');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error adding satellite');
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
          <Boxes className="w-6 h-6 text-emerald-400" />
          <span>Groups & Satellite Collection Centres</span>
        </h2>
        <p className="text-xs text-slate-400">
          Manage farmer cooperative groups and physical buying station depots
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-emerald-200 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Switcher Tab */}
      <div className="flex space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'groups' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Coffee Groups ({groups.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('satellites')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'satellites' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Satellite Buying Centres ({satellites.length})</span>
        </button>
      </div>

      {/* Tab: Groups */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Groups */}
          <div className="lg:col-span-2 space-y-3">
            {groups.map(g => {
              const groupFarmers = farmers.filter(f => f.group === g.group_name);
              const groupHarvests = harvests.filter(h => h.group === g.group_name);
              const totalKg = groupHarvests.reduce((acc, h) => acc + h.total_kg, 0);

              return (
                <div
                  key={g.group_id}
                  className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-slate-500">{g.group_id}</span>
                      <h4 className="font-bold text-sm text-slate-100">{g.group_name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{g.description || 'Smallholder farmer collective'}</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-amber-300">
                      {totalKg.toFixed(1)} kg
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>{groupFarmers.length} registered farmers</span>
                    <span>{groupHarvests.length} harvest deliveries</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Group Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-3 text-xs h-fit">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Create New Coffee Group</span>
            </h3>

            <form onSubmit={handleAddGroup} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Group Name *</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="e.g. Nandi Hills Arabica Collective"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  value={newGroupDesc}
                  onChange={e => setNewGroupDesc(e.target.value)}
                  placeholder="e.g. Zone B high elevation smallholders"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-colors"
              >
                Add Coffee Group
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Satellites */}
      {activeTab === 'satellites' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Satellites */}
          <div className="lg:col-span-2 space-y-3">
            {satellites.map(s => {
              const satFarmers = farmers.filter(f => f.satellite === s.satellite_name);
              const satHarvests = harvests.filter(h => h.satellite === s.satellite_name);
              const totalKg = satHarvests.reduce((acc, h) => acc + h.total_kg, 0);

              return (
                <div
                  key={s.satellite_id}
                  className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-slate-500">{s.satellite_id}</span>
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>{s.satellite_name}</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Location: {s.location || 'Central Depot'}</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      {totalKg.toFixed(1)} kg
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>{satFarmers.length} associated farmers</span>
                    <span>{satHarvests.length} collections logged</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Satellite Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-3 text-xs h-fit">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Create Satellite Buying Centre</span>
            </h3>

            <form onSubmit={handleAddSatellite} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Centre Name *</label>
                <input
                  type="text"
                  value={newSatName}
                  onChange={e => setNewSatName(e.target.value)}
                  placeholder="e.g. Tinderet Satellite Weighing Point"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Location Details</label>
                <input
                  type="text"
                  value={newSatLoc}
                  onChange={e => setNewSatLoc(e.target.value)}
                  placeholder="e.g. Market Centre, Shed #2"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-colors"
              >
                Add Satellite Centre
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
