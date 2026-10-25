import React, { useMemo } from 'react';
import { CreditCard, Banknote, Smartphone, TrendingUp, ShieldCheck, Download, Calendar } from 'lucide-react';
import { Order } from '../types/pharmacy';

interface PaymentsViewProps {
  orders: Order[];
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ orders }) => {
  // Method breakdown
  const methodStats = useMemo(() => {
    const stats: Record<string, { count: number; total: number }> = {
      CASH: { count: 0, total: 0 },
      BKASH: { count: 0, total: 0 },
      NAGAD: { count: 0, total: 0 },
      ROCKET: { count: 0, total: 0 },
      CARD: { count: 0, total: 0 },
      DUE: { count: 0, total: 0 },
    };

    orders.forEach(ord => {
      const m = ord.paymentMethod || 'CASH';
      if (!stats[m]) stats[m] = { count: 0, total: 0 };
      stats[m].count += 1;
      stats[m].total += ord.grandTotal || 0;
    });

    return stats;
  }, [orders]);

  const totalCollected = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const totalVat = orders.reduce((sum, o) => sum + (o.vatAmount || 0), 0);
  const totalDiscounts = orders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="neu-flat p-4 lg:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Payments & Financial Reconciliation</h2>
          </div>
          <p className="text-xs text-slate-500">
            Multi-channel settlements via bKash, Nagad, Cards and Cash with Bangladesh VAT audits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl neu-sunken-sm text-xs font-mono font-bold text-emerald-800">
            NBR VAT Rate: 2.4%
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="neu-flat p-5 rounded-3xl">
          <p className="text-xs font-bold text-slate-500 uppercase">Gross Sales Revenue</p>
          <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono tabular-nums block mt-1">
            ৳{totalCollected.toFixed(2)}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Total revenue collected</p>
        </div>

        <div className="neu-flat p-5 rounded-3xl">
          <p className="text-xs font-bold text-slate-500 uppercase">National Board of Revenue (VAT)</p>
          <span className="text-2xl lg:text-3xl font-extrabold text-emerald-700 font-mono tabular-nums block mt-1">
            ৳{totalVat.toFixed(2)}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Statutory 2.4% pharmacy VAT liability</p>
        </div>

        <div className="neu-flat p-5 rounded-3xl">
          <p className="text-xs font-bold text-slate-500 uppercase">Customer Subsidies & Discounts</p>
          <span className="text-2xl lg:text-3xl font-extrabold text-amber-700 font-mono tabular-nums block mt-1">
            ৳{totalDiscounts.toFixed(2)}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Promotional and senior citizen waivers</p>
        </div>
      </div>

      {/* Channel Breakdown */}
      <div className="neu-flat p-5 rounded-3xl">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Settlement by Payment Channel</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'CASH', label: 'Cash at Counter', icon: Banknote, color: 'text-slate-800' },
            { id: 'BKASH', label: 'bKash Merchant', icon: Smartphone, color: 'text-pink-600' },
            { id: 'NAGAD', label: 'Nagad Pay', icon: Smartphone, color: 'text-orange-600' },
            { id: 'ROCKET', label: 'DBBL Rocket', icon: Smartphone, color: 'text-purple-600' },
            { id: 'CARD', label: 'Debit/Credit POS', icon: CreditCard, color: 'text-blue-600' },
            { id: 'DUE', label: 'Corporate Due', icon: Banknote, color: 'text-amber-600' },
          ].map(ch => {
            const stat = methodStats[ch.id] || { count: 0, total: 0 };
            const Icon = ch.icon;

            return (
              <div key={ch.id} className="p-3.5 neu-sunken-sm rounded-2xl flex flex-col justify-between">
                <div>
                  <Icon className={`w-4 h-4 ${ch.color} mb-1`} />
                  <p className="font-bold text-xs text-slate-800">{ch.label}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{stat.count} transactions</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                    ৳{stat.total.toFixed(0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
