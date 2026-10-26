import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  MessageSquare, 
  Sparkles, 
  Truck, 
  Pill,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Database
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Medicine, Order, CartItem, PaymentMethod, Patient } from '../types/pharmacy';

export const GAZIPUR_AREAS = [
  { id: 'chowrasta', nameEn: 'Chandana Chowrasta', nameBn: 'চান্দনা চৌরাস্তা', time: '30-45 mins' },
  { id: 'joydebpur', nameEn: 'Joydebpur Bazar / Station', nameBn: 'জয়দেবপুর বাজার / রেল স্টেশন', time: '30-40 mins' },
  { id: 'shibbari', nameEn: 'Shibbari More & DC Office', nameBn: 'শিববাড়ী মোড় ও ডিসি অফিস', time: '30-45 mins' },
  { id: 'boardbazar', nameEn: 'Board Bazar & IUT Campus', nameBn: 'বোর্ড বাজার ও আইইউটি ক্যাম্পাস', time: '35-50 mins' },
  { id: 'tongi', nameEn: 'Tongi Bazar & College Gate', nameBn: 'টঙ্গী বাজার ও কলেজ গেট', time: '35-50 mins' },
  { id: 'konabari', nameEn: 'Konabari BSCIC Industrial Area', nameBn: 'কোনাবাড়ী বিসিক শিল্পাঞ্চল', time: '40-55 mins' },
  { id: 'rajendrapur', nameEn: 'Rajendrapur Cantonment & Chowrasta', nameBn: 'রাজেন্দ্রপুর ক্যান্টনমেন্ট ও চৌরাস্তা', time: '45-60 mins' },
  { id: 'salna', nameEn: 'Salna Bazar & Highway Road', nameBn: 'সালনা বাজার ও হাইওয়ে রোড', time: '40-50 mins' },
  { id: 'kashimpur', nameEn: 'Kashimpur Area', nameBn: 'কাশিমপুর এলাকা', time: '45-60 mins' },
  { id: 'pubail', nameEn: 'Pubail & Mirzapur', nameBn: 'পূবাইল ও মির্জাপুর', time: '50-65 mins' },
  { id: 'sreepur', nameEn: 'Sreepur & Mawna Bypass', nameBn: 'শ্রীপুর ও মাওনা বাইপাস', time: '55-70 mins' }
];

export interface CartEntry {
  medicine: Medicine;
  quantity: number;
}

interface WhatsAppDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMedicineName?: string;
  cartItems?: CartEntry[];
  onUpdateCartItemQuantity?: (medicineId: string, delta: number) => void;
  onRemoveCartItem?: (medicineId: string) => void;
  onClearCart?: () => void;
  onOrderCreatedInDb?: (order: Order) => void;
}

export const WhatsAppDeliveryModal: React.FC<WhatsAppDeliveryModalProps> = ({
  isOpen,
  onClose,
  defaultMedicineName = '',
  cartItems = [],
  onUpdateCartItemQuantity,
  onRemoveCartItem,
  onClearCart,
  onOrderCreatedInDb
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('+8801');
  const [selectedArea, setSelectedArea] = useState(GAZIPUR_AREAS[0].nameEn);
  const [addressDetails, setAddressDetails] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState(defaultMedicineName);
  const [deliverySpeed, setDeliverySpeed] = useState<'EXPRESS' | 'STANDARD'>('EXPRESS');
  const [paymentPreference, setPaymentPreference] = useState<'CASH' | 'BKASH' | 'NAGAD'>('CASH');
  const [hasPrescriptionPhoto, setHasPrescriptionPhoto] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  // Pharmacy WhatsApp Hotline (Gazipur Branch)
  const PHARMACY_WHATSAPP_NUMBER = '8801700000000'; // Default Bangladesh WhatsApp Business Number

  useEffect(() => {
    if (defaultMedicineName) {
      setAdditionalNotes(defaultMedicineName);
    }
  }, [defaultMedicineName]);

  if (!isOpen) return null;

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.medicine.unitPrice * item.quantity), 0);
  const hasCart = cartItems.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim() || phone.trim() === '+8801') {
      alert('Please enter your Name and Phone Number (অনুগ্রহ করে আপনার নাম এবং মোবাইল নম্বর প্রদান করুন).');
      return;
    }

    if (!hasCart && !additionalNotes.trim() && !hasPrescriptionPhoto) {
      alert('Please add medicines from the cart, type required medicine names, or check prescription photo.');
      return;
    }

    const currentArea = GAZIPUR_AREAS.find(a => a.nameEn === selectedArea) || GAZIPUR_AREAS[0];
    const orderNumber = `#WA-${Math.floor(100000 + Math.random() * 900000)}`;
    setCreatedOrderNumber(orderNumber);

    // 1. Build Itemized Cart Text for WhatsApp
    let medicineListText = '';
    if (hasCart) {
      medicineListText = cartItems.map((item, idx) => 
        `${idx + 1}. *${item.medicine.brandName}* (${item.medicine.genericName} - ${item.medicine.strength}) x ${item.quantity} ${item.medicine.dosageForm} @ ৳${item.medicine.unitPrice} = ৳${(item.medicine.unitPrice * item.quantity).toFixed(2)}`
      ).join('\n');
      
      if (additionalNotes.trim()) {
        medicineListText += `\n\n📝 *Additional Request:* ${additionalNotes.trim()}`;
      }
    } else {
      medicineListText = additionalNotes.trim() || 'Prescription photo attached via chat';
    }

    // 2. Format rich WhatsApp message
    const message = [
      `🏥 *Pharmly BD — গাজীপুর হোম ডেলিভারি অর্ডার*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📦 *অর্ডার আইডি / Order ID:* ${orderNumber}`,
      `👤 *গ্রাহকের নাম / Customer:* ${customerName.trim()}`,
      `📞 *মোবাইল নম্বর / Phone:* ${phone.trim()}`,
      `📍 *ডেলিভারি এলাকা:* ${currentArea.nameBn} (${currentArea.nameEn})`,
      `🏠 *সুনির্দিষ্ট ঠিকানা:* ${addressDetails.trim() || 'ফোন কলে নিশ্চিত করা হবে'}`,
      `⚡ *ডেলিভারি গতি:* ${deliverySpeed === 'EXPRESS' ? 'জরুরি এক্সপ্রেস (৩০-৪৫ মিনিট)' : 'স্ট্যান্ডার্ড ডেলিভারি (২ ঘণ্টা)'}`,
      `💳 *পেমেন্ট:* ${paymentPreference === 'CASH' ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : paymentPreference === 'BKASH' ? 'বিকাশ (bKash)' : 'নগদ (Nagad)'}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `💊 *নির্বাচিত ওষুধসমূহ (Cart Items):*`,
      medicineListText,
      hasCart ? `\n💰 *সর্বমোট বিল / Total Bill:* ৳${cartTotal.toFixed(2)} BDT` : '',
      hasPrescriptionPhoto ? `\n📸 *[নোট: ডাক্তারের প্রেসক্রিপশনের ছবি এই হোয়াটসঅ্যাপ চ্যাটে পাঠানো হচ্ছে]*` : '',
      `━━━━━━━━━━━━━━━━━━━━`,
      `🕒 *অর্ডারের সময়:* ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} (গাজীপুর জোন)`
    ].filter(Boolean).join('\n');

    // 3. CRITICAL: Save a copy directly into the Dashboard Database (Orders, Inventory & EMR)
    const mappedOrderItems: CartItem[] = hasCart
      ? cartItems.map(c => ({
          medicineId: c.medicine.id,
          brandName: c.medicine.brandName,
          genericName: c.medicine.genericName,
          strength: c.medicine.strength,
          dosageForm: c.medicine.dosageForm,
          batchNumber: c.medicine.batches?.[0]?.batchNumber || 'DEPOT-STOCK',
          unitPrice: c.medicine.unitPrice,
          quantity: c.quantity,
          discountPercentage: 0,
          total: c.medicine.unitPrice * c.quantity
        }))
      : [
          {
            medicineId: 'wa_custom_req',
            brandName: additionalNotes.slice(0, 35) || 'WhatsApp Prescription Request',
            genericName: 'Prescription / Customer Order',
            strength: 'Custom',
            dosageForm: 'Tablet' as any,
            batchNumber: 'DEPOT-STOCK',
            unitPrice: 0,
            quantity: 1,
            discountPercentage: 0,
            total: 0
          }
        ];

    const grandTotal = hasCart ? cartTotal : 0;

    const newOrder: Order = {
      id: `ord_wa_${Date.now()}`,
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: phone.trim(),
      items: mappedOrderItems,
      subtotal: grandTotal,
      discountAmount: 0,
      vatAmount: 0,
      grandTotal: grandTotal,
      paymentMethod: paymentPreference as PaymentMethod,
      status: 'Pending',
      cashierId: 'whatsapp_web_portal',
      cashierName: 'Online Web Store (WhatsApp Gazipur)',
      doctorName: 'Over-The-Counter / Web Order',
      prescriptionNumber: hasPrescriptionPhoto ? 'Attached in WhatsApp' : undefined,
      notes: `Gazipur Delivery: ${currentArea.nameBn} (${currentArea.nameEn}). Address: ${addressDetails || 'N/A'}. Speed: ${deliverySpeed}. ${hasPrescriptionPhoto ? '[Prescription photo attached in chat]' : ''}`,
      timestamp: new Date().toISOString(),
      lastUpdatedBy: 'online_customer'
    };

    // Save into database
    storageService.createOrder(newOrder);

    // Also auto-enroll / update patient in Patient EMR database
    const allPatients = storageService.getPatients();
    const existingPatient = allPatients.find(p => p.phone === phone.trim());
    if (!existingPatient) {
      const newPatient: Patient = {
        id: `pat_${Date.now()}`,
        patientCode: `P-WA-${Date.now().toString().slice(-4)}`,
        fullNameEn: customerName.trim(),
        fullNameBn: customerName.trim(),
        phone: phone.trim(),
        age: 32,
        gender: 'Other',
        bloodGroup: 'B+',
        address: `${currentArea.nameEn}, Gazipur. ${addressDetails}`,
        emergencyContact: phone.trim(),
        chronicConditions: [],
        allergies: [],
        prescriptions: [],
        registeredDate: new Date().toISOString().split('T')[0],
        lastVisitDate: new Date().toISOString().split('T')[0],
        totalSpent: grandTotal,
        lastUpdatedBy: 'online_customer'
      };
      storageService.savePatient(newPatient);
    }

    // Notify parent if hook passed
    onOrderCreatedInDb?.(newOrder);

    // Audit log
    storageService.logAudit({
      category: 'SALES',
      action: 'WHATSAPP_ORDER_DISPATCH',
      entityId: orderNumber,
      entityType: 'ORDER',
      description: `WhatsApp order created in DB & dispatched by ${customerName} (${phone}) for Gazipur: ${selectedArea}. Total: ৳${grandTotal.toFixed(2)}`
    });

    // 4. Trigger WhatsApp link
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${PHARMACY_WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(whatsappUrl, '_blank');

    // Clear cart if callback available
    onClearCart?.();
    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="neu-convex max-w-xl w-full p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md">
              <MessageSquare className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base lg:text-lg font-bold text-slate-900">
                  Order Medicines via WhatsApp
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  গাজীপুর জোন
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Gazipur Home Delivery Hotline · দ্রুত ৪৫ মিনিটে ডেলিভারি (45-Min Dispatch)
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="neu-btn p-2 rounded-xl text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          /* Success Screen */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
                <Database className="w-3.5 h-3.5" />
                <span>Order Copy Saved in Dashboard Database ({createdOrderNumber})</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">WhatsApp Order Ready & Dispatched!</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Your order has been recorded in the pharmacy database and loaded into your WhatsApp chat window. If you have a doctor&apos;s prescription photo, attach it in the chat. Our licensed &lsquo;A&rsquo;-Grade Pharmacist is ready to process your dispatch.
              </p>
            </div>

            <div className="p-4 rounded-2xl neu-flat text-xs text-left max-w-md mx-auto space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-mono font-bold text-emerald-700">{createdOrderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Area (এলাকা):</span>
                <span className="font-bold text-slate-800">{selectedArea}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Number:</span>
                <span className="font-bold text-slate-800">{phone}</span>
              </div>
              {hasCart && (
                <div className="flex justify-between border-t border-slate-200/80 pt-1.5 font-bold">
                  <span className="text-slate-700">Total BDT:</span>
                  <span className="text-emerald-700 font-mono text-sm">৳{cartTotal.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={handleResetAndClose}
                className="neu-accent-btn px-6 py-2.5 rounded-xl text-xs font-bold"
              >
                Done (সম্পন্ন করুন)
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs mt-3.5">
            {/* Gazipur Coverage Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border border-emerald-200/80 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-emerald-900 text-xs">
                  Gazipur District Dedicated Express Delivery · দ্রুত ৪৫ মিনিটে ডেলিভারি
                </p>
                <p className="text-[11px] text-emerald-700">
                  Direct dispatch to Chandana Chowrasta, Joydebpur, Tongi, Board Bazar, Konabari & surrounding areas.
                </p>
              </div>
            </div>

            {/* CART REVIEW BOX (When medicines added from cart) */}
            {hasCart ? (
              <div className="neu-flat p-3.5 rounded-2xl border border-emerald-200/90 bg-emerald-50/30 space-y-2.5">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-600 text-white">
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-xs">
                      Selected Medicines from Cart ({cartItems.length} items)
                    </h4>
                  </div>
                  <span className="text-emerald-800 font-bold font-mono text-xs">
                    Total: ৳{cartTotal.toFixed(2)}
                  </span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {cartItems.map((item) => (
                    <div 
                      key={item.medicine.id}
                      className="p-2 rounded-xl bg-white/90 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate">
                          {item.medicine.brandName} <span className="text-[10px] text-slate-500 font-normal">({item.medicine.strength})</span>
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {item.medicine.manufacturer} · ৳{item.medicine.unitPrice.toFixed(2)}/{item.medicine.dosageForm}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {onUpdateCartItemQuantity && (
                          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => onUpdateCartItemQuantity(item.medicine.id, -1)}
                              className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-slate-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center font-bold text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateCartItemQuantity(item.medicine.id, 1)}
                              className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-slate-200"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <span className="font-mono font-bold text-slate-800 text-[11px] w-14 text-right">
                          ৳{(item.medicine.unitPrice * item.quantity).toFixed(2)}
                        </span>

                        {onRemoveCartItem && (
                          <button
                            type="button"
                            onClick={() => onRemoveCartItem(item.medicine.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-emerald-800">
                  <span className="flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cart will be recorded as pending sale in dashboard</span>
                  </span>
                  <span className="font-bold">Subtotal: ৳{cartTotal.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              /* Notice when no cart items selected yet */
              <div className="p-2.5 rounded-xl bg-slate-100 text-[11px] text-slate-600 flex items-center gap-2">
                <Pill className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>You can type your required medicines below or select from the home page medicine catalog.</span>
              </div>
            )}

            {/* Customer Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="neu-sunken-sm p-2.5 rounded-xl">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Customer / Patient Name (রোগীর নাম) *
                </label>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Md. Ashraful Islam"
                    className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="neu-sunken-sm p-2.5 rounded-xl">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Phone Number (মোবাইল নম্বর) *
                </label>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+88017..."
                    className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Area in Gazipur */}
            <div className="neu-sunken-sm p-2.5 rounded-xl">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Gazipur Delivery Area (গাজীপুরের এলাকা নির্বাচন করুন) *
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {GAZIPUR_AREAS.map(area => (
                    <option key={area.id} value={area.nameEn}>
                      📍 {area.nameBn} — {area.nameEn} ({area.time})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Detailed Street Address */}
            <div className="neu-sunken-sm p-2.5 rounded-xl">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Detailed Address / Landmark (বাসা/রোড/ঠিকানা)
              </label>
              <input
                type="text"
                value={addressDetails}
                onChange={(e) => setAddressDetails(e.target.value)}
                placeholder="e.g. House 12, Road 3, Near Shibbari More, Joydebpur..."
                className="w-full bg-transparent text-slate-800 focus:outline-none font-medium"
              />
            </div>

            {/* Additional Notes or Freeform Medicines */}
            <div className="neu-sunken-sm p-2.5 rounded-xl">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                {hasCart ? 'Additional Medicines or Special Instructions (অতিরিক্ত তথ্য)' : 'Required Medicines & Quantities (প্রয়োজনীয় ওষুধের নাম ও পরিমাণ) *'}
              </label>
              <textarea
                rows={hasCart ? 2 : 3}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder={hasCart ? "e.g. Please bring 1 extra strip of Napa Extra if available..." : "e.g. \n1. Napa Extra 500mg - 2 strips\n2. Seclo 20mg - 1 box\n3. Monas 10mg - 20 tablets"}
                className="w-full bg-transparent text-slate-800 focus:outline-none font-mono text-xs resize-none"
              />
            </div>

            {/* Checkbox: Have prescription photo */}
            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-100 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasPrescriptionPhoto}
                onChange={(e) => setHasPrescriptionPhoto(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700">
                I will send doctor&apos;s prescription photo via WhatsApp chat (প্রেসক্রিপশন ছবি আছে)
              </span>
            </label>

            {/* Delivery Speed & Payment Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  Delivery Speed (ডেলিভারি গতি)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliverySpeed('EXPRESS')}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all ${
                      deliverySpeed === 'EXPRESS'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'neu-btn text-slate-700'
                    }`}
                  >
                    ⚡ Express (45 mins)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliverySpeed('STANDARD')}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all ${
                      deliverySpeed === 'STANDARD'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'neu-btn text-slate-700'
                    }`}
                  >
                    Standard (2 hrs)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  Payment Method (পেমেন্ট পদ্ধতি)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentPreference('CASH')}
                    className={`py-2 px-2 rounded-xl font-bold text-[11px] transition-all ${
                      paymentPreference === 'CASH'
                        ? 'bg-[#062822] text-[#bbf246] shadow-md'
                        : 'neu-btn text-slate-700'
                    }`}
                  >
                    Cash (ক্যাশ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentPreference('BKASH')}
                    className={`py-2 px-2 rounded-xl font-bold text-[11px] transition-all ${
                      paymentPreference === 'BKASH'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'neu-btn text-slate-700'
                    }`}
                  >
                    bKash (বিকাশ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentPreference('NAGAD')}
                    className={`py-2 px-2 rounded-xl font-bold text-[11px] transition-all ${
                      paymentPreference === 'NAGAD'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'neu-btn text-slate-700'
                    }`}
                  >
                    Nagad (নগদ)
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Genuine Medicine (১০০% আসল ওষুধ)</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="neu-btn px-4 py-2 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Send WhatsApp Order</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
