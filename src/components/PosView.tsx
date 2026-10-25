import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  AlertTriangle, 
  CheckCircle2, 
  UserPlus, 
  Pill, 
  Sparkles,
  Printer,
  ShieldAlert,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react';
import { Medicine, Patient, CartItem, Order, PaymentMethod, User } from '../types/pharmacy';
import { medicineApiService, DrugInteractionAlert } from '../services/medicineApiService';

interface PosViewProps {
  medicines: Medicine[];
  patients: Patient[];
  currentUser: User;
  onCompleteSale: (order: Order) => void;
  onOpenPatientModal: () => void;
}

export const PosView: React.FC<PosViewProps> = ({
  medicines,
  patients,
  currentUser,
  onCompleteSale,
  onOpenPatientModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [prescriptionRef, setPrescriptionRef] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [clinicalAlertDismissed, setClinicalAlertDismissed] = useState(false);

  // Selected patient details
  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  // Filter medicines by search
  const filteredMedicines = useMemo(() => {
    if (!searchTerm.trim()) return medicines.slice(0, 10);
    const q = searchTerm.toLowerCase();
    return medicines.filter(m => 
      m.brandName.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.manufacturer.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  }, [medicines, searchTerm]);

  // Drug Safety & Allergy Clinical Verification
  const clinicalAlerts: DrugInteractionAlert[] = useMemo(() => {
    if (!selectedPatient) return [];
    const candidates = cart.map(c => ({ brandName: c.brandName, genericName: c.genericName }));
    return medicineApiService.checkPatientDrugInteractions(selectedPatient, candidates);
  }, [selectedPatient, cart]);

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = subtotal * 0.024; // 2.4% Bangladesh pharmacy VAT
  const discountAmount = overallDiscount > 0 ? (subtotal * (overallDiscount / 100)) : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + vatAmount);

  const addToCart = (med: Medicine) => {
    if (med.totalStockUnits <= 0) {
      alert(`⚠️ ${med.brandName} is currently out of stock in this branch.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.medicineId === med.id);
      if (existing) {
        if (existing.quantity >= med.totalStockUnits) {
          alert(`Cannot exceed available batch stock of ${med.totalStockUnits} units.`);
          return prev;
        }
        return prev.map(item => 
          item.medicineId === med.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
            : item
        );
      } else {
        const batchNo = med.batches?.[0]?.batchNumber || 'LOT-2026';
        return [
          ...prev,
          {
            medicineId: med.id,
            brandName: med.brandName,
            genericName: med.genericName,
            strength: med.strength,
            dosageForm: med.dosageForm,
            batchNumber: batchNo,
            unitPrice: med.unitPrice,
            quantity: 1,
            discountPercentage: 0,
            total: med.unitPrice
          }
        ];
      }
    });
  };

  const updateQuantity = (medId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.medicineId === medId) {
          const med = medicines.find(m => m.id === medId);
          const maxStock = med?.totalStockUnits || 9999;
          const newQty = Math.max(1, Math.min(maxStock, item.quantity + delta));
          return {
            ...item,
            quantity: newQty,
            total: newQty * item.unitPrice
          };
        }
        return item;
      });
    });
  };

  const removeFromCart = (medId: string) => {
    setCart(prev => prev.filter(item => item.medicineId !== medId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your billing cart is empty.');
      return;
    }

    // Critical allergy check block
    const criticalAlert = clinicalAlerts.find(a => a.severity === 'CRITICAL');
    if (criticalAlert && !clinicalAlertDismissed) {
      alert(`⚠️ SAFETY PROTOCOL HOLD:\n${criticalAlert.message}\n\nYou must explicitly confirm or remove the conflicting medicine to proceed.`);
      return;
    }

    const orderNumber = `#ORD${Math.floor(100 + Math.random() * 900)}`;
    const custName = selectedPatient ? selectedPatient.fullNameEn : (walkinName || 'Walk-in Customer');
    const custPhone = selectedPatient ? selectedPatient.phone : (walkinPhone || '+8801700000000');

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      patientId: selectedPatient ? selectedPatient.id : undefined,
      customerName: custName,
      customerPhone: custPhone,
      items: [...cart],
      subtotal,
      discountAmount,
      vatAmount,
      grandTotal,
      paymentMethod,
      status: 'Delivered',
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      doctorName: doctorName || (selectedPatient?.prescriptions?.[0]?.doctorName || 'General Practitioner'),
      prescriptionNumber: prescriptionRef || (selectedPatient?.prescriptions?.[0]?.prescriptionCode || undefined),
      timestamp: new Date().toISOString(),
      lastUpdatedBy: currentUser.email
    };

    onCompleteSale(newOrder);

    // Reset form
    setCart([]);
    setSelectedPatientId('');
    setWalkinName('');
    setWalkinPhone('');
    setDoctorName('');
    setPrescriptionRef('');
    setOverallDiscount(0);
    setClinicalAlertDismissed(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      {/* Left 7 Columns: Medicine Search & Shelf Selection */}
      <div className="lg:col-span-7 space-y-5">
        {/* Patient Selection Card */}
        <div className="neu-flat p-4 lg:p-5 rounded-3xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-emerald-600" />
              Patient & Prescription Selection
            </span>
            <button
              onClick={onOpenPatientModal}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Enroll New Patient</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="neu-sunken-sm p-2 rounded-xl">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Select Registered Patient (EMR)
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  setClinicalAlertDismissed(false);
                }}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="">Walk-in Customer (Non-registered)</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.patientCode} - {p.fullNameEn} ({p.phone})
                  </option>
                ))}
              </select>
            </div>

            {selectedPatient ? (
              <div className="neu-sunken-sm p-2 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{selectedPatient.fullNameEn}</p>
                  <p className="text-[10px] text-slate-500">{selectedPatient.fullNameBn} · {selectedPatient.bloodGroup}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Age {selectedPatient.age}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="neu-sunken-sm px-2.5 py-1.5 rounded-xl">
                  <input
                    type="text"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="neu-sunken-sm px-2.5 py-1.5 rounded-xl">
                  <input
                    type="text"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    placeholder="Phone (+8801...)"
                    className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Clinical Allergies & Conditions Pill Row if Patient Selected */}
          {selectedPatient && (
            <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-600">Allergies:</span>
              {selectedPatient.allergies.length > 0 ? (
                selectedPatient.allergies.map(a => (
                  <span key={a} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                    {a}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-400">None documented</span>
              )}

              <span className="text-[11px] font-bold text-slate-600 ml-2">Chronic:</span>
              {selectedPatient.chronicConditions.map(c => (
                <span key={c} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200/70 text-slate-700">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Live Safety Interaction Alert Box */}
        {clinicalAlerts.length > 0 && (
          <div className="p-4 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-lg space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>CLINICAL SAFETY CONFLICT DETECTED</span>
            </div>
            {clinicalAlerts.map((alert, i) => (
              <div key={i} className="text-xs text-rose-900 bg-white/80 p-3 rounded-2xl border border-rose-200">
                <p className="font-bold text-rose-800 mb-0.5">{alert.title}</p>
                <p className="leading-relaxed mb-1">{alert.message}</p>
                <p className="text-[11px] text-rose-600 italic">Pharmacological Mechanism: {alert.mechanism}</p>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-rose-700 font-medium">Verify alternative non-conflicting generic with physician.</span>
              <button
                onClick={() => setClinicalAlertDismissed(true)}
                className="px-3 py-1 bg-rose-700 text-white text-[11px] font-bold rounded-lg hover:bg-rose-800 transition-colors"
              >
                Pharmacist Override Confirmed
              </button>
            </div>
          </div>
        )}

        {/* Search Medicine Catalog */}
        <div className="neu-flat p-4 lg:p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Bangladesh Pharmaceutical Dispensary</h3>
            <span className="text-xs text-slate-500 font-mono">{medicines.length} registered items</span>
          </div>

          <div className="neu-sunken flex items-center px-3.5 py-2.5">
            <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Instant Search by Brand (Napa, Seclo), Generic, or Manufacturer (Square, Beximco)..."
              className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-600">
                Clear
              </button>
            )}
          </div>

          {/* Quick Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredMedicines.map(med => {
              const inStock = med.totalStockUnits > 0;
              const isLow = med.totalStockUnits <= med.reorderLevel;

              return (
                <div
                  key={med.id}
                  onClick={() => addToCart(med)}
                  className={`p-3.5 neu-btn rounded-2xl flex flex-col justify-between cursor-pointer transition-transform hover:scale-[1.01] ${
                    !inStock ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{med.brandName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-medium">
                          {med.strength}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{med.genericName}</p>
                      <p className="text-[10px] text-emerald-700 font-medium">{med.manufacturer}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 tabular-nums">
                        ৳{med.unitPrice.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-slate-400">MRP</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-mono">Rack: {med.rackLocation}</span>
                    <span className={`font-bold tabular-nums ${
                      !inStock ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-700'
                    }`}>
                      {inStock ? `${med.totalStockUnits} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredMedicines.length === 0 && (
              <div className="col-span-full py-10 text-center text-slate-400 neu-sunken-sm rounded-2xl p-4">
                <Pill className="w-8 h-8 mx-auto mb-2 text-emerald-600/60" />
                <p className="font-bold text-xs text-slate-700">
                  {medicines.length === 0 ? 'No Medicines in Stock' : 'No Medicines Found'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  {medicines.length === 0 
                    ? 'Import your medicine inventory via CSV or add medicines in the Inventory tab to begin selling.'
                    : `No items found matching "${searchTerm}". Try another brand name, generic formula, or DGDA code.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right 5 Columns: Billing Cart & Checkout Slip */}
      <div className="lg:col-span-5 space-y-5">
        <div className="neu-flat p-5 rounded-3xl flex flex-col justify-between min-h-[520px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Dispensing Cart</h3>
              </div>
              <span className="text-xs font-bold text-slate-500 font-mono tabular-nums">
                {cart.length} items
              </span>
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1 my-3">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <Pill className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Your cart is empty. Click any medicine on the left to add.
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.medicineId} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {item.brandName} <span className="text-[10px] font-normal text-slate-500">({item.strength})</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">Lot: {item.batchNumber} · ৳{item.unitPrice.toFixed(2)}/u</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.medicineId, -1)}
                        className="w-6 h-6 rounded-lg neu-btn flex items-center justify-center text-slate-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs tabular-nums text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.medicineId, 1)}
                        className="w-6 h-6 rounded-lg neu-btn flex items-center justify-center text-slate-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right w-16">
                      <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                        ৳{item.total.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.medicineId)}
                        className="block ml-auto text-[10px] text-rose-500 hover:text-rose-700 mt-0.5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment & Settlement Summary */}
          <div className="pt-3 border-t border-slate-200/80 space-y-3">
            {/* Payment Method Selector */}
            <div>
              <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Payment Method:</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[10px] font-bold">
                {[
                  { id: 'CASH', label: 'Cash', icon: Banknote },
                  { id: 'BKASH', label: 'bKash', icon: Smartphone },
                  { id: 'NAGAD', label: 'Nagad', icon: Smartphone },
                  { id: 'ROCKET', label: 'Rocket', icon: Smartphone },
                  { id: 'CARD', label: 'Card', icon: CreditCard },
                  { id: 'DUE', label: 'Due/Credit', icon: Banknote },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPaymentMethod(p.id as PaymentMethod)}
                    className={`py-1.5 px-1 rounded-xl text-center transition-all ${
                      paymentMethod === p.id 
                        ? 'bg-[#062822] text-[#bbf246] shadow-sm' 
                        : 'neu-btn text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="neu-sunken p-3 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal MRP:</span>
                <span className="font-mono tabular-nums">৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Bangladesh VAT (2.4%):</span>
                <span className="font-mono tabular-nums">৳{vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span>Discount (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={overallDiscount || ''}
                    onChange={(e) => setOverallDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-12 bg-white px-1.5 py-0.5 rounded text-slate-800 text-xs text-right font-mono focus:outline-none"
                  />
                </div>
                <span className="font-mono tabular-nums text-emerald-700">-৳{discountAmount.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline font-bold text-slate-900">
                <span className="text-sm">Grand Total (BDT):</span>
                <span className="text-lg font-mono text-emerald-800 tabular-nums">
                  ৳{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Complete Sale Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-2xl text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 transition-all ${
                cart.length > 0 
                  ? 'neu-accent-btn text-[#062822] shadow-lg cursor-pointer' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Complete Sale & Print Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
