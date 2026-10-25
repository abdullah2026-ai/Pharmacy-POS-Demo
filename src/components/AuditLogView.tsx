import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Download, 
  Filter, 
  Lock, 
  Terminal, 
  UserCheck, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { AuditLogEntry, AuditCategory } from '../types/pharmacy';

interface AuditLogViewProps {
  auditLogs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchQuery = 
      log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entityId && log.entityId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    return matchQuery && matchCategory;
  });

  const exportCsv = () => {
    const headers = ['Log ID', 'BST Timestamp', 'User', 'Role', 'Category', 'Action', 'Entity ID', 'Description', 'Device', 'IP Address'];
    const rows = filteredLogs.map(l => [
      l.id,
      new Date(l.timestamp).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
      l.username,
      l.userRole,
      l.category,
      l.action,
      l.entityId || 'N/A',
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.clientDevice}"`,
      l.ipAddress
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pharmly_audit_trail_dgda_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="neu-flat p-4 lg:p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Security & Regulatory Compliance Audit Trail</h2>
          </div>
          <p className="text-xs text-slate-500">
            Immutable transaction history under Bangladesh DGDA Good Pharmacy Practice (GPP) regulations
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="neu-btn px-4 py-2 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5 self-start md:self-auto shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>Export Audit Report (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="neu-flat p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="neu-sunken flex items-center px-3.5 py-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search operator, event description, order # or batch..."
            className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Event Domain:</span>
          <div className="neu-sunken-sm px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="AUTH">Authentication (Logins)</option>
              <option value="SALES">Sales & Dispensing</option>
              <option value="INVENTORY">Inventory & Lots</option>
              <option value="PATIENT_EMR">Patient Medical Records</option>
              <option value="USER_MGMT">Staff & RBAC</option>
              <option value="SETTINGS">Database & Backups</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="neu-flat p-5 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-400 font-semibold">
                <th className="pb-3 pl-2">BST Time (UTC+6)</th>
                <th className="pb-3">Staff Operator</th>
                <th className="pb-3 text-center">Category</th>
                <th className="pb-3">Action Description</th>
                <th className="pb-3">Target Entity</th>
                <th className="pb-3">Terminal / Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(entry => {
                const bstTime = new Date(entry.timestamp).toLocaleTimeString('en-GB', {
                  timeZone: 'Asia/Dhaka',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });
                const bstDate = new Date(entry.timestamp).toLocaleDateString('en-GB', {
                  timeZone: 'Asia/Dhaka',
                  day: '2-digit',
                  month: 'short'
                });

                return (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 pl-2 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      <span className="font-bold text-slate-800">{bstTime}</span>
                      <span className="block text-[10px] text-slate-400">{bstDate}</span>
                    </td>

                    <td className="py-3 font-medium text-slate-800">
                      <div>
                        <span className="font-mono text-xs">{entry.username}</span>
                        <span className="block text-[9px] uppercase font-bold tracking-wider text-emerald-700">
                          {entry.userRole}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                        entry.category === 'AUTH' ? 'bg-blue-100 text-blue-800' :
                        entry.category === 'SALES' ? 'bg-emerald-100 text-emerald-800' :
                        entry.category === 'INVENTORY' ? 'bg-purple-100 text-purple-800' :
                        entry.category === 'PATIENT_EMR' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-200 text-slate-800'
                      }`}>
                        {entry.category}
                      </span>
                    </td>

                    <td className="py-3 text-slate-800">
                      <p className="font-semibold text-xs leading-snug">{entry.description}</p>
                      {entry.changesDiff && entry.changesDiff.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {entry.changesDiff.map((d, idx) => (
                            <span key={idx} className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                              {d.field}: {JSON.stringify(d.oldValue)} → {JSON.stringify(d.newValue)}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="py-3 font-mono text-xs text-slate-600">
                      {entry.entityId ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold">
                          {entry.entityId}
                        </span>
                      ) : (
                        <span className="text-slate-400">System</span>
                      )}
                    </td>

                    <td className="py-3 text-[11px] text-slate-500">
                      <p className="truncate max-w-[150px]">{entry.clientDevice}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{entry.ipAddress}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
