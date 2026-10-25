import React, { useState } from 'react';
import { Settings, ShieldCheck, Building2, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';
import { User } from '../types/pharmacy';

interface SettingsViewProps {
  currentUser: User;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser }) => {
  const [pharmacyName, setPharmacyName] = useState('Pharmly BD Healthcare Pharmacy Ltd.');
  const [dgdaLicense, setDgdaLicense] = useState('DGDA-DL-DHAKA-2026/8941');
  const [branch, setBranch] = useState('Dhanmondi Central Hub, Road 9/A, Dhaka 1209');
  const [hotline, setHotline] = useState('+880 2 9112233');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="neu-flat p-4 lg:p-5 rounded-3xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Pharmacy Licensing & Configuration</h2>
          </div>
          <p className="text-xs text-slate-500">
            Directorate General of Drug Administration (DGDA) compliance credentials
          </p>
        </div>

        {saved && (
          <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved
          </span>
        )}
      </div>

      <div className="neu-flat p-6 rounded-3xl">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="neu-sunken p-3 rounded-2xl">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Pharmacy Trade Name
              </label>
              <input
                type="text"
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div className="neu-sunken p-3 rounded-2xl">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                DGDA Drug License Number
              </label>
              <input
                type="text"
                value={dgdaLicense}
                onChange={(e) => setDgdaLicense(e.target.value)}
                className="w-full bg-transparent font-mono font-bold text-emerald-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="neu-sunken p-3 rounded-2xl">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Official Premises Address
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-transparent text-slate-900 focus:outline-none"
              />
            </div>

            <div className="neu-sunken p-3 rounded-2xl">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Hotline / Emergency Support
              </label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="w-full bg-transparent font-mono text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Pharmacist In-Charge: Kazi Farhan Ahmed (Reg. B-Pharm 14028)
            </p>
            <p className="text-[11px] text-emerald-700">
              License valid through December 2028 under the Drugs Act 1940 & National Drug Policy of Bangladesh.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="neu-accent-btn px-6 py-2.5 rounded-2xl text-xs font-bold"
            >
              Update Pharmacy Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
