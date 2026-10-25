import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';
import { ThreeLogo } from './ThreeLogo';
import { WhatsAppDeliveryModal, GAZIPUR_AREAS } from './WhatsAppDeliveryModal';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenLogin }) => {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [prefilledMedicine, setPrefilledMedicine] = useState('');

  const openWhatsAppOrder = (medicineName?: string) => {
    setPrefilledMedicine(medicineName || '');
    setShowWhatsAppModal(true);
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* WhatsApp Delivery Modal */}
      <WhatsAppDeliveryModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        defaultMedicineName={prefilledMedicine}
      />

      {/* Floating WhatsApp Quick Action Button for Gazipur Delivery */}
      <button
        onClick={() => openWhatsAppOrder()}
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all group border-2 border-white/80"
        aria-label="Order medicines on WhatsApp for Gazipur delivery"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 fill-current" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[11px] font-extrabold leading-tight">Order via WhatsApp</p>
          <p className="text-[9px] text-emerald-100 font-medium">গাজীপুরে ৪৫ মিনিটে ডেলিভারি</p>
        </div>
      </button>

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#eef2f6]/95 backdrop-blur-md px-4 sm:px-8 lg:px-12 py-3.5 border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Wordmark with 3D animated emblem */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl neu-convex flex items-center justify-center p-0.5 shadow-xs">
              <ThreeLogo size={32} interactive={false} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <a 
                  href="/" 
                  onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                  className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap"
                >
                  Pharmly <span className="text-emerald-700">BD</span>
                </a>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300 hidden sm:inline">
                  মডেল ফার্মেসী
                </span>
              </div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                DGDA Model Pharmacy & Healthcare
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (English with bilingual accent badges) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#gazipur-delivery" className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              <span>Gazipur Delivery</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-[10px] text-emerald-800 font-extrabold">গাজীপুর</span>
            </a>
            <a href="#pharmacy-hallmarks" className="hover:text-emerald-800 transition-colors">Model Pharmacy Standards</a>
            <a href="#product-source" className="hover:text-emerald-800 transition-colors">Medicine Inventory & CSV</a>
            <a href="#capabilities" className="hover:text-emerald-800 transition-colors">POS & EMR Portal</a>
            <a href="#contact" className="hover:text-emerald-800 transition-colors">Contact</a>
          </nav>

          {/* Zone 3: Quick Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => openWhatsAppOrder()}
              className="px-3.5 py-2 text-xs font-extrabold rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white shadow-sm flex items-center gap-1.5 transition-transform hover:scale-[1.02]"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">WhatsApp Order</span>
              <span className="sm:hidden">Order</span>
            </button>

            <button
              onClick={onEnterApp}
              className="neu-accent-btn px-3.5 sm:px-4 py-2 text-xs font-extrabold rounded-xl text-[#062822] shadow-sm hover:scale-[1.02] transition-all flex items-center gap-1.5"
            >
              <span>Launch Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section: Authentic Bangladesh Model Pharmacy Identity */}
      <section className="relative px-6 lg:px-12 pt-10 pb-16 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: English Value Proposition with Bangla Banner Accents */}
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
              <button
                onClick={() => openWhatsAppOrder()}
                className="px-6 py-3.5 rounded-2xl text-sm font-extrabold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-lg flex items-center gap-2 hover:scale-[1.02] transition-transform"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Order via WhatsApp (হোয়াটসঅ্যাপে অর্ডার)</span>
              </button>

              <button
                onClick={onEnterApp}
                className="neu-accent-btn px-6 py-3.5 rounded-2xl text-sm font-extrabold text-[#062822] shadow-md flex items-center gap-2 hover:scale-[1.02] transition-transform"
              >
                <span>Open Pharmacy Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenLogin}
                className="neu-btn px-4 py-3.5 rounded-2xl text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Staff Login</span>
              </button>
            </div>

            {/* Trust Indicators with Bengali accents */}
            <div className="pt-4 border-t border-slate-200/90 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">100% Genuine Medicine (আসল ওষুধ)</span>
              </div>
              <div className="flex items-center gap-2">
                <ThermometerSnowflake className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold">2°C–8°C Insulin Cold-Chain (কোল্ড-চেইন)</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">Licensed &lsquo;A&rsquo;-Grade Pharmacists</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero 3D Animated Medical Emblem */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="w-full max-w-[360px] aspect-square neu-flat rounded-full p-4 flex flex-col items-center justify-center relative group">
              <ThreeLogo size={300} interactive={true} className="z-10" />

              {/* Decorative Subtle Overlay Ring */}
              <div className="absolute inset-4 rounded-full border border-emerald-500/20 pointer-events-none" />
              <div className="absolute bottom-6 bg-white/95 backdrop-blur-xs px-4 py-1.5 rounded-full text-[11px] font-bold text-slate-800 shadow-md border border-slate-200 pointer-events-none flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pharmly 3D Capsule & Orbit Matrix</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: Dedicated Gazipur Delivery Coverage (English instructions, Bangla Locations & Banner highlights) */}
      <section id="gazipur-delivery" className="px-4 sm:px-8 lg:px-12 py-12 max-w-7xl mx-auto">
        <div className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-[#062822] via-[#093c33] to-[#041a16] text-white shadow-2xl relative overflow-hidden">
          {/* Background decorative glow */}
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
                    <p className="font-bold text-white">Fill Order Form or Send Prescription</p>
                    <p className="text-emerald-100/75 text-[11px] leading-relaxed">Type your required medicines or upload a clear photo of doctor&apos;s prescription (প্রেসক্রিপশন ছবি বা ওষুধের তালিকা পাঠান)।</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#25D366] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                    2
                  </span>
                  <div>
                    <p className="font-bold text-white">Licensed Pharmacist Verification</p>
                    <p className="text-emerald-100/75 text-[11px] leading-relaxed">Our registered &lsquo;A&rsquo;-Grade Pharmacist verifies dosages, checks contraindications, and confirms total bill in ৳ BDT.</p>
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
          {/* Card 1: Authentic Sourcing */}
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

          {/* Card 2: Cold Chain Surveillance */}
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

          {/* Card 3: Drug Allergy Interception */}
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

      {/* SECTION 3: Product Data Guidance: How to Add, Edit & Import Inventory */}
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
          {/* Bento Card 1: Offline Sync */}
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

          {/* Bento Card 2: BST Audit Log */}
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

      {/* Call to Action Banner (Rich Pharmacy Look) */}
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

      {/* Footer with Authentic Bangladesh Coordinates */}
      <footer id="contact" className="px-6 lg:px-12 py-8 border-t border-slate-200/90 text-xs text-slate-500 bg-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-extrabold text-slate-900">Pharmly BD · DGDA Model Pharmacy & Healthcare</span>
            <span className="hidden sm:inline">·</span>
            <span>চান্দনা চৌরাস্তা ও জয়দেবপুর, গাজীপুর-১৭০০, বাংলাদেশ (Gazipur, Bangladesh)</span>
          </div>

          <div className="flex items-center gap-5">
            <button 
              onClick={() => openWhatsAppOrder()} 
              className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#25D366] fill-current" />
              <span>WhatsApp Helpline (হোয়াটসঅ্যাপ)</span>
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
