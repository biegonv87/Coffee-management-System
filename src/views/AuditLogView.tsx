import React, { useState } from 'react';
import { useData } from '../context/DataContext.tsx';
import { History, Search, ShieldAlert, ArrowRight, Clock, User, CheckCircle2 } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm.trim() ||
      log.user_name.toLowerCase().includes(q) ||
      log.harvest_id.toLowerCase().includes(q) ||
      log.reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
          <History className="w-6 h-6 text-amber-400" />
          <span>System Audit Trail</span>
        </h2>
        <p className="text-xs text-slate-400">
          Permanent chronological log of corrections, adjustments, and administrative modifications
        </p>
      </div>

      {/* Search */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by administrator name, harvest ID, or correction reason..."
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/60" />
            <p className="text-sm">Audit log is clean. No unauthorized changes or corrections found.</p>
            <p className="text-xs text-slate-500 mt-1">
              Corrections made by administrators on harvest records will automatically appear here.
            </p>
          </div>
        ) : (
          filteredLogs.map(log => {
            let parsedOld: any = null;
            let parsedNew: any = null;
            try {
              parsedOld = JSON.parse(log.old_value);
              parsedNew = JSON.parse(log.new_value);
            } catch (e) {
              // ignore
            }

            return (
              <div
                key={log.audit_id}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 font-mono text-[10px] font-bold">
                      {log.action}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-300">
                      Harvest ID: {log.harvest_id}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Corrected by Administrator: <strong>{log.user_name}</strong></span>
                  </div>

                  <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-2xl">
                    <span className="text-[10px] font-bold text-amber-300 block uppercase">
                      Official Reason for Correction:
                    </span>
                    <p className="text-xs text-amber-200/90 mt-0.5 font-medium">"{log.reason}"</p>
                  </div>

                  {parsedOld && parsedNew && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px] font-mono">
                      <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-2xl space-y-1">
                        <span className="text-red-400 font-sans font-bold block text-[10px] uppercase">
                          Original Value:
                        </span>
                        <div>Heavy: {parsedOld.heavy} kg | Light: {parsedOld.light} kg | Mbuni: {parsedOld.mbuni} kg</div>
                        <div className="font-bold text-red-300 pt-0.5">Total: {parsedOld.total} kg</div>
                      </div>

                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl space-y-1">
                        <span className="text-emerald-400 font-sans font-bold block text-[10px] uppercase">
                          Corrected New Value:
                        </span>
                        <div>Heavy: {parsedNew.heavy} kg | Light: {parsedNew.light} kg | Mbuni: {parsedNew.mbuni} kg</div>
                        <div className="font-bold text-emerald-300 pt-0.5">Total: {parsedNew.total} kg</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
