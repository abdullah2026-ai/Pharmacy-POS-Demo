import React, { useState } from 'react';
import { Lock, Mail, Key, Shield, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { User } from '../types/pharmacy';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: User) => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess, onClose }) => {
  const [email, setEmail] = useState('superadmin@pharma.bd');
  const [password, setPassword] = useState('Super@123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = storageService.login(email.trim(), password.trim());
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Authentication credentials invalid');
      }
    }, 250);
  };

  const quickFill = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
      <div className="neu-convex max-w-md w-full p-6 lg:p-7 rounded-3xl border border-slate-200 shadow-2xl space-y-5">
        {/* Brand Lockup */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#bbf246] to-[#88c520] mx-auto flex items-center justify-center text-[#062822] font-black text-2xl shadow-md mb-2">
            P
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Pharmly Bangladesh</h2>
          <p className="text-xs text-slate-500 font-medium">Healthcare Pharmacy Management & Inventory System</p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 text-center animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="neu-sunken p-2.5 rounded-2xl">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Work Email / Username
            </label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@pharma.bd"
                className="w-full bg-transparent font-medium text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="neu-sunken p-2.5 rounded-2xl">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Security Password
            </label>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent font-mono text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="neu-accent-btn w-full py-3 rounded-2xl text-xs font-extrabold tracking-wider uppercase transition-transform active:scale-95 shadow-md"
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In to Pharmacy'}
          </button>
        </form>

        {/* Quick Role Fill Testing Strip */}
        <div className="pt-2 border-t border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">
            Default Demo Credentials
          </p>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => quickFill('superadmin@pharma.bd', 'Super@123')}
              className="p-2 rounded-xl neu-btn text-left"
            >
              <span className="font-bold text-slate-900 block truncate">Superadmin</span>
              <span className="text-[9px] text-slate-400 font-mono">Super@123</span>
            </button>

            <button
              type="button"
              onClick={() => quickFill('pharmacist@pharma.bd', 'Pharma@123')}
              className="p-2 rounded-xl neu-btn text-left"
            >
              <span className="font-bold text-slate-900 block truncate">Pharmacist</span>
              <span className="text-[9px] text-slate-400 font-mono">Pharma@123</span>
            </button>

            <button
              type="button"
              onClick={() => quickFill('cashier@pharma.bd', 'Cashier@123')}
              className="p-2 rounded-xl neu-btn text-left"
            >
              <span className="font-bold text-slate-900 block truncate">Sales Cashier</span>
              <span className="text-[9px] text-slate-400 font-mono">Cashier@123</span>
            </button>

            <button
              type="button"
              onClick={() => quickFill('inventory@pharma.bd', 'Stock@123')}
              className="p-2 rounded-xl neu-btn text-left"
            >
              <span className="font-bold text-slate-900 block truncate">Inventory Lead</span>
              <span className="text-[9px] text-slate-400 font-mono">Stock@123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
