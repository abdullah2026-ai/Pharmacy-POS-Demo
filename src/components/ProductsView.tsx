import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Package, 
  Edit3, 
  Trash2, 
  Layers, 
  Sparkles,
  ArrowDownToLine,
  ExternalLink,
  Upload,
  Download,
  FileSpreadsheet,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Medicine, Batch, DosageForm, User } from '../types/pharmacy';
import { medicineApiService, PublicDrugInfo } from '../services/medicineApiService';
import { storageService } from '../services/storageService';

interface ProductsViewProps {
  medicines: Medicine[];
  currentUser: User;
  onSaveMedicine: (medicine: Medicine) => void;
  onDeleteMedicine: (id: string) => void;
  onReload?: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  medicines,
  currentUser,
  onSaveMedicine,
  onDeleteMedicine,
  onReload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvNotice, setCsvNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMfr, setSelectedMfr] = useState<string>('ALL');
  const [filterStock, setFilterStock] = useState<'ALL' | 'LOW' | 'EXPIRING'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPublicApiModal, setShowPublicApiModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Public API Search state
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [apiResults, setApiResults] = useState<PublicDrugInfo[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  // Form state
  const [formBrand, setFormBrand] = useState('');
  const [formGeneric, setFormGeneric] = useState('');
  const [formMfr, setFormMfr] = useState('Square Pharmaceuticals Ltd.');
  const [formStrength, setFormStrength] = useState('');
  const [formDosage, setFormDosage] = useState<DosageForm>('Tablet');
  const [formDgda, setFormDgda] = useState('DAR-021-');
  const [formPrice, setFormPrice] = useState(10.0);
  const [formCost, setFormCost] = useState(8.0);
  const [formStock, setFormStock] = useState(100);
  const [formReorder, setFormReorder] = useState(30);
  const [formRack, setFormRack] = useState('Rack A-01');
  const [formBatchNo, setFormBatchNo] = useState('LOT-2026-');
  const [formExpiry, setFormExpiry] = useState('2028-06-30');
  const [formIndications, setFormIndications] = useState('');

  // Extract unique manufacturers
  const manufacturers = useMemo(() => {
    const list = Array.from(new Set(medicines.map(m => m.manufacturer)));
    return ['ALL', ...list];
  }, [medicines]);

  // Filtered medicines
  const filtered = useMemo(() => {
    return medicines.filter(m => {
      const matchSearch = !searchQuery.trim() || 
        m.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.dgdaRegNo.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchMfr = selectedMfr === 'ALL' || m.manufacturer === selectedMfr;

      let matchStock = true;
      if (filterStock === 'LOW') {
        matchStock = m.totalStockUnits <= m.reorderLevel;
      } else if (filterStock === 'EXPIRING') {
        matchStock = m.batches?.some(b => {
          const exp = new Date(b.expiryDate).getTime();
          const now = Date.now();
          const daysLeft = (exp - now) / (1000 * 60 * 60 * 24);
          return daysLeft <= 90;
        }) || false;
      }

      return matchSearch && matchMfr && matchStock;
    });
  }, [medicines, searchQuery, selectedMfr, filterStock]);

    const openAddModal = (initialData?: Partial<Medicine>) => {
    if (initialData) {
      setFormBrand(initialData.brandName || '');
      setFormGeneric(initialData.genericName || '');
      setFormMfr(initialData.manufacturer || 'Square Pharmaceuticals Ltd.');
      setFormStrength(initialData.strength || '');
      setFormDosage(initialData.dosageForm || 'Tablet');
      setFormDgda(initialData.dgdaRegNo || 'DAR-021-');
      setFormPrice(initialData.unitPrice || 10.0);
      setFormCost(initialData.costPrice || 8.0);
      setFormStock(initialData.totalStockUnits || 100);
      setFormReorder(initialData.reorderLevel || 30);
      setFormRack(initialData.rackLocation || 'Rack A-01');
      setFormBatchNo(initialData.batches?.[0]?.batchNumber || 'LOT-2026-01');
      setFormExpiry(initialData.batches?.[0]?.expiryDate || '2028-06-30');
      setFormIndications(initialData.indications || '');
      setEditingMedicine(initialData.id ? initialData as Medicine : null);
    } else {
      setFormBrand('');
      setFormGeneric('');
      setFormMfr('Square Pharmaceuticals Ltd.');
      setFormStrength('500mg');
      setFormDosage('Tablet');
      setFormDgda('DAR-021-' + Math.floor(100 + Math.random() * 900));
      setFormPrice(12.0);
      setFormCost(9.5);
      setFormStock(150);
      setFormReorder(40);
      setFormRack('Rack B-01');
      setFormBatchNo('LOT-' + Math.floor(1000 + Math.random() * 9000));
      setFormExpiry('2028-06-30');
      setFormIndications('');
      setEditingMedicine(null);
    }
    setShowAddModal(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBrand.trim() || !formGeneric.trim()) {
      alert('Brand and generic names are required.');
      return;
    }

    const batch: Batch = {
      id: `bch_${Date.now()}`,
      medicineId: editingMedicine ? editingMedicine.id : `med_${Date.now()}`,
      batchNumber: formBatchNo,
      manufactureDate: new Date().toISOString().split('T')[0],
      expiryDate: formExpiry,
      quantityInStock: formStock,
      purchasePrice: formCost,
      mrp: formPrice,
      supplierName: formMfr + ' Depot',
      rackLocation: formRack,
      status: 'GOOD'
    };

    const updatedBatches = editingMedicine && editingMedicine.batches && editingMedicine.batches.length > 0
      ? editingMedicine.batches.map((b, idx) => idx === 0 ? {
          ...b,
          batchNumber: formBatchNo,
          expiryDate: formExpiry,
          quantityInStock: formStock,
          purchasePrice: formCost,
          mrp: formPrice,
          rackLocation: formRack
        } : b)
      : [batch];

    const newMed: Medicine = {
      id: editingMedicine ? editingMedicine.id : `med_${Date.now()}`,
      brandName: formBrand,
      genericName: formGeneric,
      manufacturer: formMfr,
      strength: formStrength,
      dosageForm: formDosage,
      dgdaRegNo: formDgda,
      category: formDosage + ' Formulation',
      unitPrice: formPrice,
      costPrice: formCost,
      vatPercentage: 2.4,
      reorderLevel: formReorder,
      unitsPerPack: 10,
      totalStockUnits: formStock,
      rackLocation: formRack,
      requiresPrescription: true,
      indications: formIndications || 'Prescription monograph',
      batches: updatedBatches,
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: currentUser.email
    };

    onSaveMedicine(newMed);
    setShowAddModal(false);
  };

  const handleSearchPublicApi = async () => {
    if (!apiSearchQuery.trim()) return;
    setIsSearchingApi(true);
    const res = await medicineApiService.searchPublicDrugData(apiSearchQuery);
    setApiResults(res);
    setIsSearchingApi(false);
  };

  const handleImportFromApi = (item: PublicDrugInfo) => {
    openAddModal({
      brandName: item.brandName,
      genericName: item.genericName,
      manufacturer: item.manufacturer.includes('Global') ? 'Square Pharmaceuticals Ltd.' : item.manufacturer,
      strength: item.activeIngredients?.split('(')[1]?.replace(')', '') || '500mg',
      dosageForm: (item.dosageForm as DosageForm) || 'Tablet',
      indications: item.indications,
      unitPrice: 15.0,
      costPrice: 12.0,
      totalStockUnits: 100,
      reorderLevel: 25,
      rackLocation: 'Rack B-02'
    });
    setShowPublicApiModal(false);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const res = storageService.importMedicinesFromCsv(text);
        if (res.success) {
          setCsvNotice(`Successfully imported ${res.count} medicines from CSV into inventory!`);
          setTimeout(() => setCsvNotice(null), 5000);
          if (onReload) onReload();
        } else {
          alert(`CSV Import Failed: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const downloadCsvTemplate = () => {
    const headers = [
      'Brand Name',
      'Generic Name',
      'Manufacturer',
      'Strength',
      'Dosage Form',
      'Unit Price',
      'Cost Price',
      'Stock Units',
      'Reorder Level',
      'Rack Location',
      'Batch Number',
      'Expiry Date',
      'DGDA Reg No',
      'Indications'
    ];
    const sampleRows = [
      ['Napa Extra', 'Paracetamol + Caffeine', 'Beximco Pharmaceuticals Ltd.', '500mg+65mg', 'Tablet', '3.50', '2.60', '500', '100', 'Rack A-01', 'LOT-NX-2026', '2028-10-31', 'DAR-021-002', 'Headache, fever, body pain'],
      ['Seclo', 'Omeprazole', 'Square Pharmaceuticals Ltd.', '20mg', 'Capsule', '7.00', '5.20', '300', '50', 'Rack B-03', 'LOT-SEC-441', '2028-06-30', 'DAR-021-003', 'Acid peptic disorder, GERD'],
      ['Maxpro', 'Esomeprazole Magnesium Trihydrate', 'Square Pharmaceuticals Ltd.', '20mg', 'Capsule', '8.00', '6.00', '400', '60', 'Rack B-04', 'LOT-MX-992', '2028-09-30', 'DAR-021-006', 'Acid reflux, gastric ulcer'],
      ['Monas 10', 'Montelukast Sodium', 'Acme Laboratories Ltd.', '10mg', 'Tablet', '17.50', '13.50', '200', '40', 'Rack C-02', 'LOT-MN-884', '2028-07-31', 'DAR-021-005', 'Bronchial asthma, allergic rhinitis'],
      ['Ciprocin 500', 'Ciprofloxacin', 'Square Pharmaceuticals Ltd.', '500mg', 'Tablet', '15.00', '11.50', '180', '30', 'Rack D-01', 'LOT-CIP-101', '2028-04-30', 'DAR-021-007', 'Bacterial respiratory and urinary infection']
    ];
    const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'bangladesh_pharmacy_medicines_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportMedicinesCsv = () => {
    if (medicines.length === 0) {
      alert('No medicines currently in stock to export.');
      return;
    }
    const headers = ['Brand Name', 'Generic Name', 'Manufacturer', 'Strength', 'Dosage Form', 'Unit Price', 'Cost Price', 'Stock Units', 'Reorder Level', 'Rack Location', 'Batch Number', 'Expiry Date', 'DGDA Reg No'];
    const rows = medicines.map(m => [
      m.brandName,
      m.genericName,
      m.manufacturer,
      m.strength,
      m.dosageForm,
      m.unitPrice.toString(),
      m.costPrice.toString(),
      m.totalStockUnits.toString(),
      m.reorderLevel.toString(),
      m.rackLocation || '',
      m.batches?.[0]?.batchNumber || '',
      m.batches?.[0]?.expiryDate || '',
      m.dgdaRegNo || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pharmly_inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadStarterPack = () => {
    if (medicines.length > 0 && !confirm('This will load 16 standard Bangladesh medicines into your inventory. Continue?')) {
      return;
    }
    const count = storageService.loadStarterMedicines();
    setCsvNotice(`Loaded ${count} standard Bangladesh medicines (Square, Beximco, Healthcare, Incepta, Acme). Ready to sell!`);
    setTimeout(() => setCsvNotice(null), 5000);
    if (onReload) onReload();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden File Input for CSV */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCsvFileUpload}
        accept=".csv,text/csv"
        className="hidden"
      />

      {/* CSV Notice Banner */}
      {csvNotice && (
        <div className="neu-flat p-4 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-emerald-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs font-bold">{csvNotice}</p>
          </div>
          <button 
            onClick={() => setCsvNotice(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Product Data Management Guide */}
      <div className="neu-flat p-4 lg:p-5 rounded-3xl bg-gradient-to-r from-emerald-50/60 via-slate-50 to-blue-50/60 border border-emerald-200/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>ওষুধ ডেটা ও ইনভেন্টরি ম্যানেজমেন্ট গাইড</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  User Guide
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                নতুন ওষুধ যোগ করতে <span className="font-bold text-emerald-800">"+ Add Medicine"</span> বা <span className="font-bold text-blue-800">"Import CSV"</span> ব্যবহার করুন। কোনো ওষুধের দাম (৳), স্টক বা মেয়াদ পরিবর্তন করতে তালিকার <span className="font-bold text-indigo-800">✏️ Edit</span> বাটনে ক্লিক করুন।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openAddModal()}
              className="neu-accent-btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ওষুধ</span>
            </button>
            <button
              onClick={handleLoadStarterPack}
              className="neu-btn px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 text-emerald-600" />
              <span>১৬ BD প্যাক</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className="neu-flat p-4 lg:p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="neu-sunken flex items-center px-3.5 py-2">
            <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inventory by Brand, Generic, or DGDA Code..."
              className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Manufacturer Filter */}
          <div className="neu-sunken-sm px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <select
              value={selectedMfr}
              onChange={(e) => setSelectedMfr(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              {manufacturers.map(m => (
                <option key={m} value={m}>{m === 'ALL' ? 'All Manufacturers' : m}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="neu-sunken-sm px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="LOW">Low Stock Only</option>
              <option value="EXPIRING">Expiring Soon (90d)</option>
            </select>
          </div>

          {/* CSV Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import medicine inventory from CSV file"
            className="neu-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5 hover:text-emerald-700"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import CSV</span>
          </button>

          {/* CSV Template Download */}
          <button
            onClick={downloadCsvTemplate}
            title="Download CSV spreadsheet template with BD medicine headers"
            className="neu-btn px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">CSV Template</span>
          </button>

          {/* Export CSV */}
          {medicines.length > 0 && (
            <button
              onClick={exportMedicinesCsv}
              title="Export current stock to CSV"
              className="neu-btn px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* Public API Query Button */}
          <button
            onClick={() => setShowPublicApiModal(true)}
            className="neu-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Public API</span>
          </button>

          {/* Add Medicine Button (Manual) */}
          <button
            onClick={() => openAddModal()}
            className="neu-accent-btn px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="neu-flat p-5 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pharmaceutical Stock & Batches</h2>
            <p className="text-xs text-slate-500">DGDA Registered Pharmacy Inventory with Expiry Surveillance</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600">
            Showing {filtered.length} of {medicines.length} items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-400 font-semibold">
                <th className="pb-3 pl-2">Brand Name</th>
                <th className="pb-3">Generic & Strength</th>
                <th className="pb-3">Manufacturer</th>
                <th className="pb-3 text-right">Unit MRP (৳)</th>
                <th className="pb-3 text-center">In Stock</th>
                <th className="pb-3 text-center">Rack</th>
                <th className="pb-3 text-center">Batch & Expiry</th>
                <th className="pb-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(med => {
                const isLow = med.totalStockUnits <= med.reorderLevel;
                const batch = med.batches?.[0];
                const expDate = batch ? new Date(batch.expiryDate).toLocaleDateString('en-GB') : 'N/A';

                return (
                  <tr key={med.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-2 font-bold text-slate-900">
                      <div>
                        <span>{med.brandName}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{med.dgdaRegNo}</span>
                      </div>
                    </td>
                    <td className="py-3.5 font-medium text-slate-700">
                      <div>
                        <span>{med.genericName}</span>
                        <span className="block text-[10px] text-slate-500">{med.strength} · {med.dosageForm}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-600 text-[11px]">{med.manufacturer}</td>
                    <td className="py-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ৳{med.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tabular-nums ${
                        med.totalStockUnits === 0 
                          ? 'bg-rose-100 text-rose-800' 
                          : isLow 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {med.totalStockUnits} units
                      </span>
                    </td>
                    <td className="py-3.5 text-center font-mono text-slate-600">{med.rackLocation}</td>
                    <td className="py-3.5 text-center font-mono text-[11px]">
                      <span className="block text-slate-700">{batch?.batchNumber || 'LOT-BD'}</span>
                      <span className="text-[10px] text-slate-400">Exp: {expDate}</span>
                    </td>
                    <td className="py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openAddModal(med)}
                          title="Edit Medicine Details"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${med.brandName}?`)) {
                              onDeleteMedicine(med.id);
                            }
                          }}
                          title="Remove from Inventory"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-500">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl neu-flat flex items-center justify-center text-slate-400">
                        <Package className="w-7 h-7 text-emerald-600" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {medicines.length === 0 ? 'Pharmaceutical Inventory is Empty (Zero Stock)' : 'No Medicines Found'}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {medicines.length === 0 
                          ? 'You can add medicines manually one by one, upload from a CSV spreadsheet file, or load the Bangladesh starter catalogue.' 
                          : `No items matched your search query. Try clearing your search or filters.`
                        }
                      </p>
                      {medicines.length === 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="neu-accent-btn px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Medicine CSV</span>
                          </button>
                          <button
                            onClick={() => openAddModal()}
                            className="neu-btn px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Manually</span>
                          </button>
                          <button
                            onClick={handleLoadStarterPack}
                            className="neu-btn px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Load 16 BD Starter Pack</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="neu-convex max-w-xl w-full p-6 rounded-3xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingMedicine ? `Edit: ${editingMedicine.brandName}` : 'Add New Bangladesh Medicine'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="neu-btn p-1.5 rounded-xl text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. Napa Extra, Seclo"
                    className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Generic Name *</label>
                  <input
                    type="text"
                    required
                    value={formGeneric}
                    onChange={(e) => setFormGeneric(e.target.value)}
                    placeholder="e.g. Paracetamol, Omeprazole"
                    className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Manufacturer</label>
                  <select
                    value={formMfr}
                    onChange={(e) => setFormMfr(e.target.value)}
                    className="w-full bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Square Pharmaceuticals Ltd.">Square Pharmaceuticals Ltd.</option>
                    <option value="Beximco Pharmaceuticals Ltd.">Beximco Pharmaceuticals Ltd.</option>
                    <option value="Incepta Pharmaceuticals Ltd.">Incepta Pharmaceuticals Ltd.</option>
                    <option value="Renata Limited">Renata Limited</option>
                    <option value="Healthcare Pharmaceuticals Ltd.">Healthcare Pharmaceuticals Ltd.</option>
                    <option value="Eskayef (SK+F) Pharmaceuticals">Eskayef (SK+F) Pharmaceuticals</option>
                    <option value="Opsonin Pharma Ltd.">Opsonin Pharma Ltd.</option>
                    <option value="Aristopharma Ltd.">Aristopharma Ltd.</option>
                    <option value="ACI Healthcare Limited">ACI Healthcare Limited</option>
                    <option value="Popular Pharmaceuticals Ltd.">Popular Pharmaceuticals Ltd.</option>
                  </select>
                </div>

                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Strength</label>
                  <input
                    type="text"
                    value={formStrength}
                    onChange={(e) => setFormStrength(e.target.value)}
                    placeholder="e.g. 500mg, 20mg"
                    className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Dosage Form</label>
                  <select
                    value={formDosage}
                    onChange={(e) => setFormDosage(e.target.value as DosageForm)}
                    className="w-full bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Injection">Injection</option>
                    <option value="Eye Drops">Eye Drops</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Inhaler">Inhaler</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Unit MRP (৳) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Cost Price (৳)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formCost}
                    onChange={(e) => setFormCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={formReorder}
                    onChange={(e) => setFormReorder(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">DGDA Reg. No</label>
                  <input
                    type="text"
                    value={formDgda}
                    onChange={(e) => setFormDgda(e.target.value)}
                    placeholder="DAR-021-..."
                    className="w-full bg-transparent font-mono text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Rack / Shelf</label>
                  <input
                    type="text"
                    value={formRack}
                    onChange={(e) => setFormRack(e.target.value)}
                    placeholder="Rack A-01"
                    className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="neu-sunken-sm p-2 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Lot Expiry Date</label>
                  <input
                    type="date"
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    className="w-full bg-transparent font-mono text-slate-900 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="neu-sunken-sm p-2 rounded-xl">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Therapeutic Indications</label>
                <textarea
                  rows={2}
                  value={formIndications}
                  onChange={(e) => setFormIndications(e.target.value)}
                  placeholder="Clinical indications and dosage instructions..."
                  className="w-full bg-transparent text-slate-900 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="neu-btn px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neu-accent-btn px-6 py-2 rounded-xl font-bold"
                >
                  {editingMedicine ? 'Update Medicine' : 'Save to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Public Drug API Search Modal */}
      {showPublicApiModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="neu-convex max-w-2xl w-full p-6 rounded-3xl border border-slate-200 shadow-2xl max-h-[85vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Public Pharmaceutical Registry Lookup</h3>
                    <p className="text-xs text-slate-500">DGDA Bangladesh Monographs & OpenFDA Public API</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPublicApiModal(false)}
                  className="neu-btn p-1.5 rounded-xl text-slate-500 hover:text-slate-900"
                >
                  ✕
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex gap-2 mb-4">
                <div className="neu-sunken flex-1 flex items-center px-3.5 py-2">
                  <Search className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="text"
                    value={apiSearchQuery}
                    onChange={(e) => setApiSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchPublicApi()}
                    placeholder="Search public generic (e.g. Paracetamol, Montelukast, Ciprofloxacin)..."
                    className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSearchPublicApi}
                  disabled={isSearchingApi}
                  className="neu-btn px-4 py-2 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isSearchingApi ? 'Searching...' : 'Search API'}</span>
                </button>
              </div>

              {/* Results List */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {apiResults.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Type a drug active ingredient or brand above to query live global & national pharmaceutical databases.
                  </div>
                ) : (
                  apiResults.map((item, idx) => (
                    <div key={idx} className="p-3.5 neu-sunken-sm rounded-2xl flex flex-col justify-between gap-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{item.brandName}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold bg-blue-100 text-blue-800">
                              {item.source === 'BANGLADESH_DGDA' ? 'DGDA BD' : 'OpenFDA API'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium">{item.genericName}</p>
                          <p className="text-[10px] text-slate-400">{item.manufacturer}</p>
                        </div>

                        <button
                          onClick={() => handleImportFromApi(item)}
                          className="neu-accent-btn px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1"
                        >
                          <ArrowDownToLine className="w-3 h-3" />
                          <span>Import</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {item.indications}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-right">
              <button
                onClick={() => setShowPublicApiModal(false)}
                className="neu-btn px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-700"
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
