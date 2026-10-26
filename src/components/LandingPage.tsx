import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  WifiOff, 
  Sparkles, 
  FileCheck2, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  Database, 
  Laptop, 
  Tablet, 
  Smartphone,
  ExternalLink,
  Pill,
  Lock,
  MessageSquare,
  Truck,
  MapPin,
  Clock,
  PhoneCall,
  ThermometerSnowflake,
  Award,
  HelpCircle,
  FileSpreadsheet,
  Edit3,
  Plus,
  Minus,
  ShoppingCart,
  Search,
  Filter,
  Trash2,
  Bot
} from 'lucide-react';
import { ThreeLogo } from './ThreeLogo';
import { WhatsAppDeliveryModal, GAZIPUR_AREAS, CartEntry } from './WhatsAppDeliveryModal';
import { GeminiChatbot } from './GeminiChatbot';
import { storageService } from '../services/storageService';
import { Medicine, Order } from '../types/pharmacy';
import { SAMPLE_BANGLADESH_MEDICINES } from '../data/bangladeshMedicines';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenLogin: () => void;
  onOrderCreatedInDb?: (order: Order) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onEnterApp, 
  onOpenLogin,
  onOrderCreatedInDb 
}) => {
  // Modals state
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showGeminiChatbot, setShowGeminiChatbot] = useState(false);
  const [prefilledMedicine, setPrefilledMedicine] = useState('');
  const [geminiInitialPrompt, setGeminiInitialPrompt] = useState('');

  // Inventory & Storefront State
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Customer Shopping Cart: { [medicineId: string]: number }
  const [cartQuantities, setCartQuantities] = useState<{ [medicineId: string]: number }>({});

  const loadMedicines = () => {
    const list = storageService.getMedicines();
    if (list && list.length > 0) {
      setAllMedicines(list);
    } else {
      // If inventory is at zero, display the Bangladesh sample medicines so storefront always has items available to select
      setAllMedicines(SAMPLE_BANGLADESH_MEDICINES);
    }
  };

  useEffect(() => {
    loadMedicines();
    const unsub = storageService.subscribeSync(() => {
      loadMedicines();
    });
    return () => unsub();
  }, []);

  // Compute Cart Entries
  const cartEntries: CartEntry[] = Object.entries(cartQuantities)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const med = allMedicines.find(m => m.id === id) || SAMPLE_BANGLADESH_MEDICINES.find(m => m.id === id);
      if (!med) return null;
      return { medicine: med, quantity: qty };
    })
    .filter(Boolean) as CartEntry[];

  const cartTotalAmount = cartEntries.reduce(
    (sum, item) => sum + (item.medicine.unitPrice * item.quantity), 
    0
  );
  const cartTotalItemsCount = cartEntries.reduce((sum, item) => sum + item.quantity, 0);

  // Cart Handlers
  const handleAddToCart = (medId: string) => {
    setCartQuantities(prev => ({
      ...prev,
      [medId]: (prev[medId] || 0) + 1
    }));
  };

  const handleUpdateCartQuantity = (medId: string, delta: number) => {
    setCartQuantities(prev => {
      const current = prev[medId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[medId];
        return copy;
      }
      return { ...prev, [medId]: next };
    });
  };

  const handleRemoveFromCart = (medId: string) => {
    setCartQuantities(prev => {
      const copy = { ...prev };
      delete copy[medId];
      return copy;
    });
  };

  const handleClearCart = () => {
    setCartQuantities({});
  };

  const openWhatsAppOrder = (medicineName?: string) => {
    setPrefilledMedicine(medicineName || '');
    setShowWhatsAppModal(true);
  };

  const openGeminiAssistant = (prompt?: string) => {
    setGeminiInitialPrompt(prompt || '');
    setShowGeminiChatbot(true);
  };

  const handleSeedStarterPack = () => {
    SAMPLE_BANGLADESH_MEDICINES.forEach(med => {
      storageService.saveMedicine({
        ...med,
        updatedAt: new Date().toISOString()
      });
    });
    loadMedicines();
  };

  // Filter medicines for storefront
  const filteredMedicines = allMedicines.filter(med => {
    const q = searchFilter.toLowerCase();
    const matchQuery = 
      med.brandName.toLowerCase().includes(q) ||
      med.genericName.toLowerCase().includes(q) ||
      med.manufacturer.toLowerCase().includes(q) ||
      med.dosageForm.toLowerCase().includes(q);

    if (!matchQuery) return false;

    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'PAIN') {
      return med.genericName.toLowerCase().includes('paracetamol') || med.brandName.toLowerCase().includes('napa') || med.brandName.toLowerCase().includes('ace');
    }
    if (selectedCategory === 'GASTRIC') {
      return med.genericName.toLowerCase().includes('omeprazole') || med.genericName.toLowerCase().includes('panto') || med.brandName.toLowerCase().includes('seclo') || med.brandName.toLowerCase().includes('sergel');
    }
    if (selectedCategory === 'DIABETES') {
      return med.genericName.toLowerCase().includes('insulin') || med.brandName.toLowerCase().includes('lantus') || (med.rackLocation && med.rackLocation.toLowerCase().includes('cold'));
    }
    if (selectedCategory === 'ANTIBIOTIC') {
      return med.dosageForm === 'Injection' || med.genericName.toLowerCase().includes('cipro') || med.genericName.toLowerCase().includes('azithro');
    }
    if (selectedCategory === 'RESPIRATORY') {
      return med.genericName.toLowerCase().includes('montelukast') || med.brandName.toLowerCase().includes('monas') || med.genericName.toLowerCase().includes('fexo');
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#eef2f6] text-slate-900 font-sans selection:bg-emerald-500 selection:text-white pb-20">
      {/* WhatsApp Delivery Modal with Cart Integration */}
      <WhatsAppDeliveryModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        defaultMedicineName={prefilledMedicine}
        cartItems={cartEntries}
        onUpdateCartItemQuantity={handleUpdateCartQuantity}
        onRemoveCartItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOrderCreatedInDb={(ord) => {
          loadMedicines();
          onOrderCreatedInDb?.(ord);
        }}
      />

      {/* Gemini 3.8 Flash Clinical Pharmacy Chatbot */}
      <GeminiChatbot
        isOpen={showGeminiChatbot}
        onClose={() => setShowGeminiChatbot(false)}
        initialQuery={geminiInitialPrompt}
      />

      {/* Floating Action Buttons: AI Assistant + WhatsApp */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-40 flex flex-col gap-2.5 items-end">
        {/* Gemini Chatbot Floating Button */}
        <button
          onClick={() => openGeminiAssistant()}
          className="bg-gradient-to-r from-[#062822] to-[#0a4238] hover:from-[#093c33] hover:to-[#0d5447] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all group border-2 border-emerald-400/40"
          aria-label="Ask Pharmly AI Clinical Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-[#bbf246] fill-current animate-spin [animation-duration:8s]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[11px] font-extrabold leading-tight text-white flex items-center gap-1">
              <span>Pharmly AI Assistant</span>
              <span className="text-[9px] bg-[#bbf246] text-[#062822] px-1 rounded font-bold">3.8 Flash</span>
            </p>
            <p className="text-[9px] text-emerald-200 font-medium">এআই ক্লিনিক্যাল সহকারী</p>
          </div>
        </button>

        {/* WhatsApp Delivery Button */}
        <button
          onClick={() => openWhatsAppOrder()}
          className="bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all group border-2 border-white/80 relative"
          aria-label="Order medicines on WhatsApp for Gazipur delivery"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 fill-current" />
            {cartTotalItemsCount > 0 ? (
              <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cartTotalItemsCount}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[11px] font-extrabold leading-tight">
              {cartTotalItemsCount > 0 ? `Checkout Cart (${cartTotalItemsCount})` : 'Order via WhatsApp'}
            </p>
            <p className="text-[9px] text-emerald-100 font-medium">গাজীপুরে ৪৫ মিনিটে ডেলিভারি</p>
          </div>
        </button>
      </div>

      {/* Sticky Bottom Cart Bar (Appears when user adds medicines to cart) */}
      {cartEntries.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-[#062822]/95 backdrop-blur-md text-white py-3 px-4 sm:px-8 border-t border-emerald-500/40 shadow-2xl animate-in slide-in-from-bottom">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md shrink-0">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-xs sm:text-sm text-white">
                    {cartEntries.length} {cartEntries.length === 1 ? 'Medicine' : 'Medicines'} in Cart ({cartTotalItemsCount} units)
                  </p>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-800 text-[10px] text-emerald-200 font-mono hidden sm:inline">
                    গাজীপুর জোন
                  </span>
                </div>
                <p className="text-[11px] text-[#bbf246] font-mono font-bold">
                  Total: ৳{cartTotalAmount.toFixed(2)} BDT
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleClearCart}
                className="text-xs text-emerald-200 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 hidden sm:block"
              >
                Clear Cart
              </button>
              <button
                onClick={() => openWhatsAppOrder()}
                className="px-4 sm:px-6 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Order Cart via WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar: Clean & Minimal - Only Necessary Elements */}
      <header className="sticky top-0 z-30 bg-[#eef2f6]/95 backdrop-blur-md px-4 sm:px-8 lg:px-12 py-3 border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Wordmark with 3D Emblem */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl neu-convex flex items-center justify-center p-0.5 shadow-2xs">
              <ThreeLogo size={28} interactive={false} />
            </div>
            <a 
              href="/" 
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap"
            >
              Pharmly <span className="text-emerald-700">BD</span>
            </a>
          </div>

          {/* Core Essential Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600">
            <a href="#available-medicines" className="hover:text-emerald-800 transition-colors">
              Medicines
            </a>
            <a href="#gazipur-delivery" className="hover:text-emerald-800 transition-colors">
              Gazipur Delivery
            </a>
            <a href="#pharmacy-hallmarks" className="hover:text-emerald-800 transition-colors">
              Standards
            </a>
          </nav>

          {/* Single Essential Action */}
          <div className="flex items-center gap-2 shrink-0">
            {cartEntries.length > 0 && (
              <button
                onClick={() => openWhatsAppOrder()}
                className="px-3.5 py-1.5 text-xs font-extrabold rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs flex items-center gap-1.5 transition-transform hover:scale-[1.02]"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Cart ({cartEntries.length})</span>
              </button>
            )}

            <button
              onClick={onEnterApp}
              className="neu-accent-btn px-4 py-1.5 text-xs font-extrabold rounded-xl text-[#062822] shadow-xs hover:scale-[1.02] transition-all flex items-center gap-1.5"
            >
              <span>Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section: Authentic Bangladesh Model Pharmacy Identity */}
      <section className="relative px-6 lg:px-12 pt-10 pb-16 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>DGDA Certified Model Pharmacy</span>
                <span className="text-[10px] text-emerald-700 font-extrabold bg-white/80 px-1.5 py-0.2 rounded">মডেল ফার্মেসী</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                <Truck className="w-3.5 h-3.5 text-amber-700" />
                <span>45-Min Express Gazipur Delivery</span>
                <span className="text-[10px] text-amber-800 font-extrabold bg-white/80 px-1.5 py-0.2 rounded">গাজীপুরে ৪৫ মিনিটে</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Trusted Prescription Care & Genuine Medicines Delivered to Your Doorstep
              <span className="block text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-700 mt-2">
                Authentic Bangladesh Healthcare & Dispensary Platform
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              100% genuine pharmaceutical supplies sourced directly from Square, Beximco, Incepta, and Renata official depots. Supervised by licensed &lsquo;A&rsquo;-Grade Pharmacists with certified 2°C–8°C insulin cold-chain monitoring, automated allergy screening, and offline-first POS cash memo billing.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#available-medicines"
                className="px-6 py-3.5 rounded-2xl text-sm font-extrabold bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg flex items-center gap-2 hover:scale-[1.02] transition-transform"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Select Medicines & Add to Cart</span>
              </a>

              <button
                onClick={() => openWhatsAppOrder()}
                className="px-5 py-3.5 rounded-2xl text-sm font-extrabold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-lg flex items-center gap-2 hover:scale-[1.02] transition-transform"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>WhatsApp Order (হোয়াটসঅ্যাপ)</span>
              </button>

              <button
                onClick={onEnterApp}
                className="neu-accent-btn px-5 py-3.5 rounded-2xl text-sm font-extrabold text-[#062822] shadow-md flex items-center gap-2 hover:scale-[1.02] transition-transform"
              >
                <span>Staff Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-4 border-t border-slate-200/90 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">100% Genuine (আসল ওষুধ)</span>
              </div>
              <div className="flex items-center gap-2">
                <ThermometerSnowflake className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold">2°C–8°C Cold-Chain (কোল্ড-চেইন)</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">Licensed Pharmacists</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero 3D Animated Medical Emblem */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="w-full max-w-[360px] aspect-square neu-flat rounded-full p-4 flex flex-col items-center justify-center relative group">
              <ThreeLogo size={300} interactive={true} className="z-10" />

              <div className="absolute inset-4 rounded-full border border-emerald-500/20 pointer-events-none" />
              <div className="absolute bottom-6 bg-white/95 backdrop-blur-xs px-4 py-1.5 rounded-full text-[11px] font-bold text-slate-800 shadow-md border border-slate-200 pointer-events-none flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pharmly 3D Capsule & Orbit Matrix</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: AVAILABLE MEDICINES & CUSTOMER SELECTION (Direct from Dashboard Database) */}
      <section id="available-medicines" className="px-4 sm:px-8 lg:px-12 py-12 max-w-7xl mx-auto space-y-6">
        <div className="neu-flat p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                  <Pill className="w-5 h-5" />
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Available Genuine Medicines & Direct Order
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold hidden sm:inline">
                  সহজলভ্য ওষুধ তালিকা
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Select medicines from our dispensary stock, add to your cart, and order via WhatsApp. A verified order copy is automatically recorded in the dashboard database.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {cartEntries.length > 0 && (
                <button
                  onClick={() => openWhatsAppOrder()}
                  className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Cart ({cartEntries.length}) · ৳{cartTotalAmount.toFixed(2)}</span>
                </button>
              )}

              <button
                onClick={handleSeedStarterPack}
                className="neu-btn px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 flex items-center gap-1.5"
                title="Seed 16 authentic BD medicines into local inventory"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Seed 16 BD Medicines</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Category Filter Pills */}
          <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
            {/* Search Input */}
            <div className="w-full md:w-80 neu-sunken px-3.5 py-2 rounded-2xl flex items-center">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search Napa, Seclo, Lantus, Incepta..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none font-medium"
              />
              {searchFilter && (
                <button 
                  onClick={() => setSearchFilter('')} 
                  className="text-slate-400 hover:text-slate-700 text-xs ml-1"
                >
                  ×
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar text-xs">
              {[
                { id: 'ALL', label: 'All Stock (সব)' },
                { id: 'PAIN', label: 'Fever & Pain (জ্বর ও ব্যথা)' },
                { id: 'GASTRIC', label: 'Gastric & Acidity (গ্যাস)' },
                { id: 'DIABETES', label: 'Insulin & Cold-Chain (ইনসুলিন)' },
                { id: 'RESPIRATORY', label: 'Asthma & Allergy (অ্যালার্জি)' },
                { id: 'ANTIBIOTIC', label: 'Antibiotics (এন্টিবায়োটিক)' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-[11px] ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'neu-btn text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Medicine Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {filteredMedicines.map(med => {
              const qtyInCart = cartQuantities[med.id] || 0;
              const isColdChain = (med.rackLocation && med.rackLocation.toLowerCase().includes('cold')) || med.genericName.toLowerCase().includes('insulin');

              return (
                <div
                  key={med.id}
                  className="neu-flat-sm p-4 rounded-2xl flex flex-col justify-between hover:border-emerald-300 transition-all border border-slate-200/80 bg-white/70 space-y-3"
                >
                  <div className="space-y-1.5">
                    {/* Top Row: Dosage Form & Cold Chain Badge */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {med.dosageForm}
                      </span>
                      {isColdChain && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                          <ThermometerSnowflake className="w-3 h-3 text-blue-600" />
                          <span>2°C–8°C</span>
                        </span>
                      )}
                    </div>

                    {/* Brand Name & Strength */}
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {med.brandName}{' '}
                      <span className="text-emerald-700 font-bold text-xs">{med.strength}</span>
                    </h3>

                    {/* Generic & Manufacturer */}
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {med.genericName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium line-clamp-1">
                      {med.manufacturer}
                    </p>
                  </div>

                  {/* Price & Cart Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block leading-tight">MRP Price</span>
                      <span className="text-sm font-extrabold font-mono text-emerald-800">
                        ৳{med.unitPrice.toFixed(2)}
                      </span>
                    </div>

                    {qtyInCart > 0 ? (
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQuantity(med.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white text-emerald-800 font-bold flex items-center justify-center hover:bg-emerald-100 shadow-2xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-extrabold text-xs text-emerald-900">
                          {qtyInCart}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQuantity(med.id, 1)}
                          className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center hover:bg-emerald-700 shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddToCart(med.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:scale-105 active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMedicines.length === 0 && (
            <div className="py-12 text-center space-y-3">
              <Pill className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                No matching medications found in current filter.
              </p>
              <button
                onClick={() => { setSearchFilter(''); setSelectedCategory('ALL'); }}
                className="neu-btn px-4 py-2 rounded-xl text-xs font-bold text-emerald-700"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 1: Gazipur Delivery Coverage */}
      <section id="gazipur-delivery" className="px-4 sm:px-8 lg:px-12 py-12 max-w-7xl mx-auto">
        <div className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-[#062822] via-[#093c33] to-[#041a16] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#25D366]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#bbf246]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/20 text-[#25D366] text-xs font-bold border border-[#25D366]/40">
                <Truck className="w-4 h-4" />
                <span>গাজীপুর এক্সপ্রেস ডেলিভারি হাব · Gazipur Express Delivery Hub</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-snug">
                Rapid Doorstep Medicine Delivery Across Gazipur <br className="hidden sm:inline" />
                <span className="text-[#bbf246]">Guaranteed 45-Minute Express Delivery! (৪৫ মিনিটে হোম ডেলিভারি)</span>
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
                Need urgent medications, diabetic insulin, or chronic prescription refills? Skip the pharmacy queues. Our dedicated motorcycle dispatch fleet delivers sealed, cold-insulated packages directly to your doorstep across Chandana Chowrasta, Joydebpur, Tongi, Board Bazar, Konabari, and beyond.
              </p>

              {/* Area Badges Grid with Bangla Location Names */}
              <div className="pt-2">
                <p className="text-xs font-bold text-[#bbf246] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>গাজীপুর কভারেজ এলাকা (Gazipur Coverage Areas):</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {GAZIPUR_AREAS.map(area => (
                    <span 
                      key={area.id}
                      onClick={() => openWhatsAppOrder()}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-[#25D366]/30 text-xs font-medium text-white border border-white/10 cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <span className="font-bold text-white">📍 {area.nameBn}</span>
                      <span className="text-[10px] text-emerald-300">({area.nameEn})</span>
                      <span className="text-[9px] text-[#bbf246] font-mono bg-white/10 px-1 py-0.2 rounded">{area.time}</span>
                    </span>
                  ))}
                  <span className="px-2.5 py-1.5 rounded-xl bg-white/5 text-xs text-emerald-200 border border-white/5">
                    + সকল পার্শ্ববর্তী ওয়ার্ড ও ইউনিয়ন (All Neighboring GCC Wards)
                  </span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => openWhatsAppOrder()}
                  className="px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Order Now on WhatsApp (হোয়াটসঅ্যাপে অর্ডার)</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-emerald-200 font-medium">
                  <CreditCard className="w-4 h-4 text-[#bbf246]" />
                  <span>Cash on Delivery / bKash / Nagad Accepted (ক্যাশ / বিকাশ / নগদ)</span>
                </div>
              </div>
            </div>

            {/* Right Card: How to Order in 3 Simple Steps */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#bbf246]" />
                  <span>How to Order in 3 Simple Steps</span>
                </h3>
                <span className="text-[10px] text-emerald-300 font-bold bg-white/10 px-2 py-0.5 rounded-full">
                  সহজ ৩ ধাপ
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#25D366] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                    1
                  </span>
                  <div>
                    <p className="font-bold text-white">Select Medicines or Send Prescription</p>
                    <p className="text-emerald-100/75 text-[11px] leading-relaxed">Choose from available stock above, type required items, or attach a photo of doctor&apos;s prescription.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#25D366] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                    2
                  </span>
                  <div>
                    <p className="font-bold text-white">Pharmacist Audit & Database Record</p>
                    <p className="text-emerald-100/75 text-[11px] leading-relaxed">Our registered &lsquo;A&rsquo;-Grade Pharmacist verifies dosages, checks contraindications, and creates an order copy in the dashboard database.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#bbf246] text-[#062822] font-extrabold flex items-center justify-center shrink-0 text-xs shadow-xs">
                    3
                  </span>
                  <div>
                    <p className="font-bold text-white">45-Minute Doorstep Delivery</p>
                    <p className="text-emerald-100/75 text-[11px] leading-relaxed">Receive sealed medicine package in cold-pack thermal bags. Pay easily via Cash on Delivery or bKash (ক্যাশ বা বিকাশ)।</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => openWhatsAppOrder()}
                  className="w-full py-2.5 rounded-xl bg-white text-[#062822] font-extrabold text-xs hover:bg-[#bbf246] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Open WhatsApp Order Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Bangladesh Model Pharmacy Standards */}
      <section id="pharmacy-hallmarks" className="px-6 lg:px-12 py-12 max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold tracking-wider text-emerald-700 uppercase">
            DGDA MODEL PHARMACY BENCHMARKS · বাংলাদেশ ড্রাগ অ্যাডমিনিস্ট্রেশন মানদণ্ড
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Operated Under Bangladesh Directorate General of Drug Administration Standards
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Strict clinical safeguards, verified batch tracking, and authentic sourcing to protect patient health at every dispensing stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="neu-flat p-6 rounded-3xl space-y-3 border-t-4 border-t-emerald-600">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              100% Genuine Depot Sourcing
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct delivery from authorized manufacturer depots only — Square, Beximco, Incepta, ACME, Renata, and Healthcare. Zero tolerance for unauthorized open-market procurement.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-100 text-[11px] font-semibold text-slate-700">
              ✓ Verified DGDA DAR Registration & Batch Invoice Tracking
            </div>
          </div>

          {/* Card 2 */}
          <div className="neu-flat p-6 rounded-3xl space-y-3 border-t-4 border-t-blue-600">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <ThermometerSnowflake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              2°C–8°C Insulin & Vaccine Cold-Chain
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Continuous thermal monitoring for diabetic insulins (Lantus, Mixtard, Novorapid) and temperature-sensitive biologicals in specialized digital medical refrigerators, dispatched in ice-pack thermal carriers.
            </p>
            <div className="p-2.5 rounded-xl bg-blue-50 text-[11px] font-semibold text-blue-800">
              ✓ Ice-Pack Insulated Thermal Dispatch Across Gazipur
            </div>
          </div>

          {/* Card 3 */}
          <div className="neu-flat p-6 rounded-3xl space-y-3 border-t-4 border-t-rose-600">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Automated Allergy & Interaction Check
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every prescription is cross-referenced against the patient&apos;s recorded medical profile. If penicillin, sulfa, or NSAID allergies are detected, checkout automatically blocks dispensing to protect patient lives.
            </p>
            <div className="p-2.5 rounded-xl bg-rose-50 text-[11px] font-semibold text-rose-800">
              ✓ Real-Time Clinical Contraindication Alerts
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Product Data Guidance */}
      <section id="product-source" className="px-6 lg:px-12 py-12 max-w-7xl mx-auto">
        <div className="neu-flat p-6 sm:p-8 rounded-3xl space-y-6 border-l-4 border-l-emerald-600">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                  <Database className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Where Does Product Data Come From? How to Add & Edit Medicines
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Transparency & Practical Guide: Start with zero inventory, upload spreadsheets, or add items manually
              </p>
            </div>

            <button
              onClick={onEnterApp}
              className="neu-accent-btn px-4 py-2 rounded-xl text-xs font-bold text-[#062822] self-start md:self-auto shrink-0 flex items-center gap-1.5"
            >
              <span>Go to Products Tab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Step 1 */}
            <div className="neu-sunken-sm p-4 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                1
              </div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-emerald-700" />
                <span>Add Medicine Manually</span>
              </h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                In the <strong>Products</strong> tab, click <strong>&quot;+ Add Medicine&quot;</strong>. Enter brand, generic, pharmaceutical company, MRP price (৳), purchase rate, and rack shelf location to save instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="neu-sunken-sm p-4 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-700 text-white font-bold flex items-center justify-center text-xs">
                2
              </div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
                <span>Import CSV Spreadsheets</span>
              </h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                To upload hundreds of medicines simultaneously, click <strong>&quot;CSV Template&quot;</strong>. Fill in your stock details in Excel or Google Sheets and click <strong>&quot;Import CSV&quot;</strong>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="neu-sunken-sm p-4 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-700 text-white font-bold flex items-center justify-center text-xs">
                3
              </div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5 text-indigo-700" />
                <span>Edit Any Medicine</span>
              </h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Click the <strong>✏️ Pencil Icon</strong> next to any medicine row in the table. Modify prices, add incoming batch numbers, adjust expiry dates, or restock counts in seconds.
              </p>
            </div>

            {/* Step 4 */}
            <div className="neu-sunken-sm p-4 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-700 text-white font-bold flex items-center justify-center text-xs">
                4
              </div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Load 16 BD Starter Pack</span>
              </h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                For instant demonstration or testing, click <strong>&quot;Load 16 BD Starter Pack&quot;</strong> to seed authentic items like Napa Extra, Seclo, Monas, and Sergel with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Enterprise POS, EMR & Offline Billing */}
      <section id="capabilities" className="px-6 lg:px-12 py-12 max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold tracking-wider text-emerald-700 uppercase">
            ENTERPRISE PHARMACY SOFTWARE · ডিজিটাল বিলিং ও অডিট সিস্টেম
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Computerized POS Billing, Batch Tracking & EMR System
          </h2>
          <p className="text-xs text-slate-500">
            Engineered for Bangladesh retail pharmacies with 100% offline-first architecture — zero interruption during power cuts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1 */}
          <div className="md:col-span-2 neu-flat p-6 lg:p-8 rounded-3xl space-y-4">
            <div className="w-10 h-10 rounded-2xl neu-flat-sm flex items-center justify-center text-emerald-800">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 font-mono">01. OFFLINE ENGINE</span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                Never Stop Selling During Load-Shedding or Broadband Dropouts
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2 max-w-xl">
                Even if internet cuts out in Gazipur or Dhaka, cash memo printing and counter billing proceed seamlessly. All transactions are securely preserved in local storage and automatically synchronize when connectivity resumes.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="neu-sunken-sm p-3 rounded-xl text-center">
                <Laptop className="w-4 h-4 mx-auto mb-1 text-slate-700" />
                <span className="text-[11px] font-bold text-slate-800 block">Cash Counter</span>
                <span className="text-[10px] text-slate-400">POS Billing</span>
              </div>
              <div className="neu-sunken-sm p-3 rounded-xl text-center">
                <Tablet className="w-4 h-4 mx-auto mb-1 text-slate-700" />
                <span className="text-[11px] font-bold text-slate-800 block">Pharmacist Tab</span>
                <span className="text-[10px] text-slate-400">Prescription EMR</span>
              </div>
              <div className="neu-sunken-sm p-3 rounded-xl text-center">
                <Smartphone className="w-4 h-4 mx-auto mb-1 text-slate-700" />
                <span className="text-[11px] font-bold text-slate-800 block">Mobile Scanner</span>
                <span className="text-[10px] text-slate-400">Stock Receiving</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2 */}
          <div className="neu-flat p-6 lg:p-8 rounded-3xl space-y-4">
            <div className="w-10 h-10 rounded-2xl neu-flat-sm flex items-center justify-center text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 font-mono">02. COMPLIANCE & AUDIT</span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                BST Audit Trail & Staff Accountability
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Every sale, discount adjustment, batch creation, and stock subtraction is permanently recorded in Bangladesh Standard Time (BST) with operator user IDs.
              </p>
            </div>
            <div className="p-3 neu-sunken-sm rounded-xl text-xs space-y-1 text-slate-700">
              <p className="font-bold">✓ Role-Based Access Control (RBAC)</p>
              <p className="text-[11px] text-slate-500">Superadmin, Pharmacist, Cashier</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="px-6 lg:px-12 py-14 max-w-5xl mx-auto text-center space-y-6">
        <div className="neu-convex p-8 sm:p-12 rounded-3xl space-y-5 border border-slate-200">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
            <span>২৪/৭ কাস্টমার ও পেশেন্ট কেয়ার</span>
            <span>·</span>
            <span>24/7 Pharmacy Helpline</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Modernize & Digitize Your Pharmacy Today
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Log in to the management dashboard to add medicines, import inventory spreadsheets, dispense prescriptions, and dispatch Gazipur WhatsApp deliveries.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openWhatsAppOrder()}
              className="px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Order via WhatsApp (হোয়াটসঅ্যাপে ওষুধ অর্ডার)</span>
            </button>

            <button
              onClick={onEnterApp}
              className="neu-accent-btn px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold text-[#062822] shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <span>Open Management Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="px-6 lg:px-12 py-8 border-t border-slate-200/90 text-xs text-slate-500 bg-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-extrabold text-slate-900">Pharmly BD · DGDA Model Pharmacy & Healthcare</span>
            <span className="hidden sm:inline">·</span>
            <span>চান্দনা চৌরাস্তা ও জয়দেবপুর, গাজীপুর-১৭০০, বাংলাদেশ (Gazipur, Bangladesh)</span>
          </div>

          <div className="flex items-center gap-5">
            <button 
              onClick={() => openGeminiAssistant()} 
              className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ask AI Pharmacist</span>
            </button>
            <button 
              onClick={() => openWhatsAppOrder()} 
              className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#25D366] fill-current" />
              <span>WhatsApp Helpline</span>
            </button>
            <button onClick={onOpenLogin} className="hover:text-slate-900 transition-colors font-bold">
              Staff Login
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
