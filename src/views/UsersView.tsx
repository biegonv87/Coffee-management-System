import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useData } from '../context/DataContext.tsx';
import { User, UserRole } from '../types/index.ts';
import { storage } from '../lib/storage.ts';
import {
  ShieldCheck,
  UserPlus,
  User as UserIcon,
  Shield,
  Briefcase,
  Lock,
  Phone,
  MapPin,
  CheckCircle,
  X,
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { usersList, currentUser, switchUser } = useAuth();
  const { satellites } = useData();

  const [users, setUsers] = useState<User[]>(usersList);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Collection Officer');
  const [newSatellite, setNewSatellite] = useState(satellites[0]?.satellite_name || 'Ainabkoi Buying Centre');
  const [newPhone, setNewPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newName.trim() || !newUsername.trim()) {
      setErrorMsg('Name and username are required.');
      return;
    }

    try {
      const created = await storage.addUser({
        user_id: `USR-${Date.now().toString().slice(-4)}`,
        name: newName.trim(),
        username: newUsername.trim().toLowerCase(),
        role: newRole,
        status: 'Active',
        assigned_satellite: newSatellite,
        phone: newPhone.trim(),
      });

      setUsers(prev => [...prev, created]);
      setShowAddModal(false);
      setNewName('');
      setNewUsername('');
      setNewPhone('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create user');
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span>User Accounts & Role Permissions</span>
          </h2>
          <p className="text-xs text-slate-400">
            Control field officer privileges, managerial reporting, and administrator security
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <UserIcon className="w-4 h-4" />
            <span>Collection Officer</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Field stations operator: Registers farmers, weighs coffee, records harvests, and generates instant delivery receipts.
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center space-x-2 text-blue-400 font-bold">
            <Briefcase className="w-4 h-4" />
            <span>Manager</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Cooperative overview: Real-time dashboards, monthly consolidations, seasonal analytics, and spreadsheet exports.
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center space-x-2 text-amber-400 font-bold">
            <Shield className="w-4 h-4" />
            <span>Administrator</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Full supervisory access: System user accounts, record corrections with audit trail, master data, and configuration.
          </p>
        </div>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {users.map(u => {
          const isCurrent = currentUser.user_id === u.user_id;

          return (
            <div
              key={u.user_id}
              className={`p-4 rounded-3xl bg-slate-900/90 border transition-all shadow-sm space-y-3 ${
                isCurrent ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                    u.role === 'Administrator'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : u.role === 'Manager'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {u.role === 'Administrator' ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{u.name}</h4>
                    <span className="text-[11px] font-mono text-slate-400">@{u.username}</span>
                  </div>
                </div>

                {isCurrent && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    Active
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="font-semibold text-slate-200">{u.role}</span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Centre:</span>
                  <span className="text-slate-300 truncate max-w-[150px]">{u.assigned_satellite || 'All Centres'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contact:</span>
                  <span className="text-slate-300">{u.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60">
                {!isCurrent ? (
                  <button
                    onClick={() => switchUser(u.role)}
                    className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Switch to this User
                  </button>
                ) : (
                  <div className="text-center text-[10px] text-emerald-400 font-semibold py-1">
                    Currently Logged In
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-auto">
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Create System Account</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-5 space-y-3.5 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-950 border border-red-800 rounded-xl text-red-200 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Kiprono Bett"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Username *</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="e.g. kbett"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">User Role *</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Collection Officer">Collection Officer (Field Operations)</option>
                  <option value="Manager">Manager (Reports & Audits)</option>
                  <option value="Administrator">Administrator (Full Access & Corrections)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Satellite Centre</label>
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
                <label className="block text-slate-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="+254 700 000 000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
