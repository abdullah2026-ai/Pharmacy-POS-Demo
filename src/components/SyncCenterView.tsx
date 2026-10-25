import React, { useState } from 'react';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Database, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Laptop, 
  Tablet,
  RotateCcw,
  Layers,
  Sparkles
} from 'lucide-react';
import { SyncQueueItem, User } from '../types/pharmacy';
import { storageService } from '../services/storageService';

interface SyncCenterViewProps {
  isOnline: boolean;
  pendingQueue: SyncQueueItem[];
  lastSyncTime: string;
  isSyncing: boolean;
  onTriggerSync: () => void;
  currentUser: User;
  onReloadAllData: () => void;
}

export const SyncCenterView: React.FC<SyncCenterViewProps> = ({
  isOnline,
  pendingQueue,
  lastSyncTime,
  isSyncing,
  onTriggerSync,
  currentUser,
  onReloadAllData
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleDownloadBackup = () => {
    const jsonStr = storageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmly_bd_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storageService.importFullBackup(content);
      if (res.success) {
        setImportStatus('✅ Database restored successfully from backup.');
        onReloadAllData();
      } else {
        setImportStatus(`❌ Import failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset entire system database to factory Bangladesh demo registry?')) {
      storageService.resetToFactoryDefaults();
      onReloadAllData();
      alert('Pharmacy database reset to default state.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="neu-flat p-4 lg:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Multi-Device Synchronization & Offline Hub</h2>
          </div>
          <p className="text-xs text-slate-500">
            Bidirectional zero-latency sync across Mobile scanners, iPad terminals, and Desktop POS stations
          </p>
        </div>

        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="neu-accent-btn px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Synchronizing Nodes...' : 'Synchronize Now'}</span>
        </button>
      </div>

      {/* Sync Topology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Device 1: Desktop POS Terminal */}
        <div className="neu-flat p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl neu-flat-sm flex items-center justify-center text-emerald-800">
              <Laptop className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Active Counter Node
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Desktop Station (Dhanmondi)</h4>
            <p className="text-xs text-slate-500">POS Billing, DGDA Regulatory Invoicing</p>
          </div>
          <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 flex justify-between">
            <span>Replication Status:</span>
            <span className="font-bold text-emerald-700">Synchronized</span>
          </div>
        </div>

        {/* Device 2: Pharmacist Tablet */}
        <div className="neu-flat p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl neu-flat-sm flex items-center justify-center text-emerald-800">
              <Tablet className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Consultation Tablet
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Pharmacist iPad Terminal</h4>
            <p className="text-xs text-slate-500">Prescription Verification & EMR Review</p>
          </div>
          <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 flex justify-between">
            <span>Replication Status:</span>
            <span className="font-bold text-emerald-700">Synchronized</span>
          </div>
        </div>

        {/* Device 3: Mobile Handheld Scanner */}
        <div className="neu-flat p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl neu-flat-sm flex items-center justify-center text-emerald-800">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Warehouse Mobile
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Mobile Stock Scanner</h4>
            <p className="text-xs text-slate-500">Inventory Intake & Lot Expiry Audits</p>
          </div>
          <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 flex justify-between">
            <span>Replication Status:</span>
            <span className="font-bold text-emerald-700">Synchronized</span>
          </div>
        </div>
      </div>

      {/* Sync Queue Inspector & Backup Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offline Queue Inspector */}
        <div className="neu-flat p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Offline-First Replication Queue</h3>
              <p className="text-xs text-slate-500">Pending mutations waiting for peer broadcast</p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
              {pendingQueue.length} Pending
            </span>
          </div>

          <div className="neu-sunken p-3 rounded-2xl max-h-52 overflow-y-auto space-y-2">
            {pendingQueue.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                All local transactions are completely synchronized with the central pharmacy node.
              </div>
            ) : (
              pendingQueue.map((item) => (
                <div key={item.id} className="p-2.5 neu-sunken-sm rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{item.action} {item.entity}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-600 font-bold">Pending Push</span>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Last Sync: <strong className="text-slate-800">{lastSyncTime}</strong></span>
            <span>Network: <strong className={isOnline ? 'text-emerald-700' : 'text-amber-700'}>{isOnline ? 'Online' : 'Offline'}</strong></span>
          </div>
        </div>

        {/* Database Backup & Disaster Recovery */}
        <div className="neu-flat p-5 rounded-3xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Disaster Recovery & Regulatory Archives</h3>
            <p className="text-xs text-slate-500">Export DGDA-compliant encrypted JSON database archives</p>
          </div>

          {importStatus && (
            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs font-semibold">
              {importStatus}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownloadBackup}
              className="neu-btn p-3.5 rounded-2xl flex flex-col items-center justify-center text-center group hover:scale-[1.01]"
            >
              <Download className="w-5 h-5 text-emerald-700 mb-1.5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="text-xs font-bold text-slate-900">Export Database</span>
              <span className="text-[10px] text-slate-500">Full JSON Archive</span>
            </button>

            <label className="neu-btn p-3.5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer group hover:scale-[1.01]">
              <Upload className="w-5 h-5 text-blue-600 mb-1.5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="text-xs font-bold text-slate-900">Import Database</span>
              <span className="text-[10px] text-slate-500">Restore from .json</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
            <span className="text-xs text-slate-500">Factory Diagnostic:</span>
            <button
              onClick={handleResetDefaults}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Bangladesh Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
