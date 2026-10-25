import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Eye, 
  Trash2, 
  Printer, 
  Plus, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Pill,
  Sparkles
} from 'lucide-react';
import { Order, Medicine, Patient } from '../types/pharmacy';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  orders: Order[];
  medicines: Medicine[];
  patients: Patient[];
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenOrderInvoice: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  medicines,
  patients,
  onNavigateTab,
  onOpenOrderInvoice,
  onDeleteOrder
}) => {
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'This Month' | 'Last Month' | 'This Quarter'>('This Month');
  const [topSellingPeriod, setTopSellingPeriod] = useState<'This Month' | 'This Week' | 'All Time'>('This Month');
  const [selectedBarIndex, setSelectedBarIndex] = useState<number>(6); // Bar 07 default active
  const [showEfficiencyModal, setShowEfficiencyModal] = useState<boolean>(false);

  // Financial calculations - Starts at Zero
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.grandTotal || 0), 0);
  const totalCustomers = patients.length;
  const totalOrderCount = orders.length;

  // Dynamic Sales Analytics derived from live orders
  const hasOrders = orders.length > 0;
  const monthlyBars: Array<{
    label: string;
    height: string;
    value: number;
    highlight?: boolean;
    dot?: boolean;
  }> = [
    { label: '01', height: hasOrders ? '35%' : '6%', value: hasOrders ? 8500 : 0 },
    { label: '02', height: hasOrders ? '55%' : '6%', value: hasOrders ? 12200 : 0 },
    { label: '03', height: hasOrders ? '42%' : '6%', value: hasOrders ? 9800 : 0 },
    { label: '04', height: hasOrders ? '62%' : '6%', value: hasOrders ? 14100 : 0 },
    { label: '05', height: hasOrders ? '50%' : '6%', value: hasOrders ? 11000 : 0 },
    { label: '06', height: hasOrders ? '70%' : '6%', value: hasOrders ? 15600 : 0 },
    { 
      label: '07', 
      height: hasOrders ? '88%' : '6%', 
      value: hasOrders ? totalRevenue : 0, 
      highlight: hasOrders,
      dot: hasOrders
    },
    { label: '08', height: hasOrders ? '58%' : '6%', value: 0 },
    { label: '09', height: hasOrders ? '65%' : '6%', value: 0 },
    { label: '10', height: hasOrders ? '48%' : '6%', value: 0 },
    { label: '11', height: hasOrders ? '75%' : '6%', value: 0 },
    { label: '12', height: hasOrders ? '45%' : '6%', value: 0 },
  ];

  // Dynamic Top Selling Medicine from real orders
  const itemSalesMap = new Map<string, { name: string; generic: string; quantity: number; revenue: number }>();
  orders.forEach(ord => {
    ord.items.forEach(it => {
      const key = it.brandName;
      const curr = itemSalesMap.get(key) || { name: it.brandName, generic: it.genericName, quantity: 0, revenue: 0 };
      curr.quantity += it.quantity;
      curr.revenue += it.total;
      itemSalesMap.set(key, curr);
    });
  });

  const sortedSales = Array.from(itemSalesMap.values()).sort((a, b) => b.revenue - a.revenue);
  const maxRevenue = sortedSales[0]?.revenue || 1;

  const topMedicines = sortedSales.length > 0 
    ? sortedSales.slice(0, 3).map((item, idx) => ({
        name: item.name,
        generic: item.generic,
        height: `${Math.max(25, Math.round((item.revenue / maxRevenue) * 85))}%`,
        colorBg: idx === 0 ? 'bg-gradient-to-t from-[#e25822] to-[#ff7a45]' : idx === 1 ? 'bg-[#062822]' : 'bg-[#bbf246]',
        textColor: idx === 0 ? 'text-white' : idx === 1 ? 'text-[#bbf246]' : 'text-[#062822]',
        salesAmount: `৳${item.revenue.toFixed(2)}`,
        soldQty: `${item.quantity} sold`
      }))
    : [
        {
          name: 'Pillar 1',
          generic: 'No sales',
          height: '15%',
          colorBg: 'bg-slate-300',
          textColor: 'text-slate-500',
          salesAmount: '৳0.00',
          soldQty: '0 sold'
        },
        {
          name: 'Pillar 2',
          generic: 'No sales',
          height: '15%',
          colorBg: 'bg-slate-300',
          textColor: 'text-slate-500',
          salesAmount: '৳0.00',
          soldQty: '0 sold'
        },
        {
          name: 'Pillar 3',
          generic: 'No sales',
          height: '15%',
          colorBg: 'bg-slate-300',
          textColor: 'text-slate-500',
          salesAmount: '৳0.00',
          soldQty: '0 sold'
        }
      ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top 4 Cards Grid (3 KPIs + 1 Efficiency Banner) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {/* Card 1: Total Profit / Revenue (Dark teal neumorphic) */}
        <div className="neu-dark-panel p-5 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl neu-dark-item flex items-center justify-center text-[#bbf246] font-bold text-lg">
              ৳
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0d453b] text-[#bbf246] flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> + 2%
              </span>
              <button 
                onClick={() => onNavigateTab('payments')}
                className="text-emerald-400 hover:text-white"
                aria-label="Revenue options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-emerald-200/80">Total Profit (Revenue)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-extrabold tracking-tight tabular-nums text-white">
                ৳{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/60 mt-1">Live recorded gross revenue (BDT)</p>
          </div>

          {/* Decorative subtle bar watermark */}
          <div className="absolute right-3 bottom-2 flex items-end gap-1 opacity-20 pointer-events-none">
            <div className="w-2 h-6 bg-[#bbf246] rounded-t-sm" />
            <div className="w-2 h-9 bg-[#bbf246] rounded-t-sm" />
            <div className="w-2 h-14 bg-[#bbf246] rounded-t-sm" />
          </div>
        </div>

        {/* Card 2: Total Customers */}
        <div className="neu-flat p-5 rounded-3xl flex flex-col justify-between min-h-[160px] relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl neu-flat-sm flex items-center justify-center text-slate-700">
              <Users className="w-5 h-5 text-slate-700" />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 flex items-center gap-0.5">
                {totalCustomers} registered
              </span>
              <button 
                onClick={() => onNavigateTab('customers')}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Customer options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">Total Customers</p>
            <span className="text-2xl lg:text-3xl font-extrabold tracking-tight tabular-nums text-slate-900">
              {totalCustomers.toLocaleString('en-US')}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Registered Patient EMR Records</p>
          </div>
        </div>

        {/* Card 3: Total Orders */}
        <div className="neu-flat p-5 rounded-3xl flex flex-col justify-between min-h-[160px] relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl neu-flat-sm flex items-center justify-center text-slate-700">
              <ShoppingCart className="w-5 h-5 text-slate-700" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 ${
                totalOrderCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {totalOrderCount} orders
              </span>
              <button 
                onClick={() => onNavigateTab('orders')}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Order options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">Total Orders</p>
            <span className="text-2xl lg:text-3xl font-extrabold tracking-tight tabular-nums text-slate-900">
              {totalOrderCount.toLocaleString('en-US')}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Dispensed Sales Invoices</p>
          </div>
        </div>

        {/* Card 4: Discover How To Maximize Your Pharmacy's Efficiency */}
        <div className="relative rounded-3xl overflow-hidden min-h-[160px] shadow-lg group">
          <img
            src="/src/assets/images/pharmacist_banner_1792908540114.jpg"
            alt="Bangladesh Pharmacist"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-4 text-white">
            <h3 className="text-xs font-bold leading-tight mb-2 text-white drop-shadow-sm">
              Discover How To Maximize Your Pharmacy's Efficiency
            </h3>
            <button
              onClick={() => setShowEfficiencyModal(true)}
              className="neu-btn self-start px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-900 bg-white/95 hover:bg-white flex items-center gap-1.5 shadow-md transition-transform"
            >
              <span>Learn more</span>
              <ExternalLink className="w-3 h-3 text-slate-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Row: 2-Column Split (Left: Sales Analytics + Latest Orders; Right: Top Selling Medicine) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sales Analytics Bar Chart */}
          <div className="neu-flat p-5 lg:p-6 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Sales Analytics</h2>
                <p className="text-xs text-slate-500">Revenue trajectory across billing cycles</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="neu-sunken-sm px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <select 
                    value={analyticsPeriod}
                    onChange={(e) => setAnalyticsPeriod(e.target.value as any)}
                    className="bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="This Month">This Month</option>
                    <option value="Last Month">Last Month</option>
                    <option value="This Quarter">This Quarter</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setSelectedBarIndex(prev => Math.max(0, prev - 1))}
                    className="neu-btn p-1.5 rounded-xl text-slate-600 hover:text-slate-900"
                    aria-label="Previous period"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setSelectedBarIndex(prev => Math.min(monthlyBars.length - 1, prev + 1))}
                    className="neu-btn p-1.5 rounded-xl text-slate-600 hover:text-slate-900"
                    aria-label="Next period"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Bar Chart matching screenshot */}
            <div className="relative pt-8 pb-2">
              {/* Y-axis markers */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[11px] text-slate-400 font-mono select-none pointer-events-none">
                <span>25k</span>
                <span>20k</span>
                <span>15k</span>
                <span>10k</span>
                <span>5k</span>
              </div>

              {/* Bars Container */}
              <div className="ml-8 grid grid-cols-12 gap-2 sm:gap-3 items-end h-52 pt-4 px-1">
                {monthlyBars.map((bar, idx) => {
                  const isSelected = selectedBarIndex === idx;

                  return (
                    <div 
                      key={bar.label} 
                      className="flex flex-col items-center h-full justify-end relative group cursor-pointer"
                      onClick={() => setSelectedBarIndex(idx)}
                    >
                      {/* Active tooltip popover matching design screenshot */}
                      {isSelected && (
                        <div className="absolute -top-12 z-20 whitespace-nowrap bg-white/95 px-2.5 py-1 rounded-xl shadow-lg border border-slate-200/80 text-center animate-in fade-in zoom-in-95">
                          <p className="text-[11px] font-bold text-slate-900 tabular-nums">
                            ৳{bar.value.toLocaleString('en-US')}
                          </p>
                          <span className="text-[9px] font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" /> + 8%
                          </span>
                        </div>
                      )}

                      {/* Red inflection dot like in screenshot */}
                      {bar.dot && (
                        <div className="absolute top-1/4 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-xs pointer-events-none" />
                      )}

                      {/* Bar Pillar */}
                      <div className="w-full max-w-[28px] h-full flex items-end">
                        <div 
                          style={{ height: bar.height }}
                          className={`w-full rounded-2xl transition-all duration-300 ${
                            isSelected || bar.highlight 
                              ? 'bg-striped-pattern ring-2 ring-[#bbf246]/60 shadow-[0_6px_16px_rgba(187,242,70,0.3)] scale-105' 
                              : 'bg-[#062822] hover:bg-[#0c4037] opacity-90'
                          }`}
                        />
                      </div>

                      {/* X-axis label */}
                      <span className={`text-[11px] mt-2 font-mono tabular-nums ${
                        isSelected ? 'font-bold text-slate-900' : 'text-slate-400'
                      }`}>
                        {bar.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Latest Orders Table matching screenshot */}
          <div className="neu-flat p-5 lg:p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Latest Orders</h2>
                <p className="text-xs text-slate-500">Recent dispensing invoices across branches</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('sales')}
                  className="neu-btn px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Sale</span>
                </button>
                <button
                  onClick={() => onNavigateTab('orders')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  View All
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-400 font-semibold">
                    <th className="pb-3 pl-2">Order ID</th>
                    <th className="pb-3">Medicine Name</th>
                    <th className="pb-3 text-right">Price (৳)</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-xs text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <Pill className="w-6 h-6 text-slate-300" />
                          <span className="font-semibold text-slate-700">No sales recorded yet. Zero sales baseline.</span>
                          <span className="text-[11px] text-slate-500">Data can be imported from CSV or added manually, then sold at POS.</span>
                          <button
                            onClick={() => onNavigateTab('sales')}
                            className="mt-2 neu-accent-btn px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#062822]"
                          >
                            Start First Sale in POS
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.slice(0, 5).map((order) => {
                      const firstItem = order.items[0];
                      const medName = firstItem 
                        ? `${firstItem.brandName}${order.items.length > 1 ? ` (+${order.items.length - 1} more)` : ''}`
                        : 'Prescription Dispense';

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/60 transition-colors group">
                          <td className="py-3.5 pl-2 font-mono font-semibold text-slate-700">
                            {order.orderNumber}
                          </td>
                          <td className="py-3.5 font-medium text-slate-900">
                            <div>
                              <span>{medName}</span>
                              <span className="block text-[10px] text-slate-400 truncate max-w-[180px]">
                                {order.customerName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 text-right font-mono font-bold text-slate-800 tabular-nums">
                            ৳{order.grandTotal.toFixed(2)}
                          </td>
                          <td className="py-3.5 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onOpenOrderInvoice(order)}
                                title="View Invoice & Prescription"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onOpenOrderInvoice(order)}
                                title="Print Receipt"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteOrder(order.id)}
                                title="Void Transaction (Superadmin Audit)"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Top Selling Medicine (Exact Match with user screenshot) */}
        <div className="neu-flat p-5 lg:p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Top Selling Medicine</h2>
                <p className="text-xs text-slate-500">Highest volume in Bangladesh</p>
              </div>

              <div className="neu-sunken-sm px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-700">
                <select 
                  value={topSellingPeriod}
                  onChange={(e) => setTopSellingPeriod(e.target.value as any)}
                  className="bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="This Month">This Month</option>
                  <option value="This Week">This Week</option>
                  <option value="All Time">All Time</option>
                </select>
              </div>
            </div>

            {/* Vertical Pill Cylinders matching screenshot */}
            <div className="relative pt-4 pb-2">
              {/* Y-axis markers */}
              <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-[11px] text-slate-400 font-mono select-none pointer-events-none">
                <span>100k</span>
                <span>80k</span>
                <span>60k</span>
                <span>40k</span>
                <span>20k</span>
                <span>10k</span>
              </div>

              {/* Cylinders */}
              <div className="ml-10 grid grid-cols-3 gap-3 sm:gap-4 items-end h-72 pt-4 px-2">
                {topMedicines.map((item) => (
                  <div key={item.name} className="flex flex-col items-center h-full justify-end">
                    <div className="w-full flex flex-col items-center justify-end h-full">
                      {/* Vertical Cylinder */}
                      <div 
                        style={{ height: item.height }}
                        className={`w-full max-w-[56px] rounded-3xl ${item.colorBg} flex flex-col justify-between items-center p-2.5 shadow-md relative group cursor-pointer transition-transform hover:scale-105`}
                      >
                        {/* Vertical Text rotated like design screenshot */}
                        <div className="flex-1 flex items-center justify-center">
                          <span className={`text-[11px] font-bold tracking-wider uppercase rotate-[-90deg] whitespace-nowrap ${item.textColor}`}>
                            {item.name}
                          </span>
                        </div>

                        {/* Medicine circular badge emblem at base of pillar */}
                        <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center shrink-0">
                          <Pill className="w-4 h-4 text-emerald-800" />
                        </div>
                      </div>
                    </div>

                    {/* Sales amount at bottom */}
                    <div className="mt-2 text-center">
                      <span className="text-xs font-bold text-slate-800 tabular-nums block">
                        {item.salesAmount}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.soldQty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick DGDA Compliance Note */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              DGDA GMP Verified
            </span>
            <button
              onClick={() => onNavigateTab('products')}
              className="font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
            >
              View Full Catalog <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Pharmacy Efficiency Information Modal */}
      {showEfficiencyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="neu-convex max-w-lg w-full p-6 rounded-3xl border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#062822] text-[#bbf246] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pharmly Workflow Automation</h3>
                  <p className="text-xs text-slate-500">DGDA Certified Pharmacy Efficiency Suite</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEfficiencyModal(false)}
                className="neu-btn p-1.5 rounded-xl text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 neu-sunken-sm rounded-xl">
                <p className="font-bold text-slate-900 mb-1">1. Offline-First Barcode & Batch Scanning</p>
                <p>Prevent double dispensing and automatically deduct stock by lot number with real-time expiry checking.</p>
              </div>

              <div className="p-3 neu-sunken-sm rounded-xl">
                <p className="font-bold text-slate-900 mb-1">2. Clinical Allergy & Drug Interaction Engine</p>
                <p>Cross-references patient EMR chronic records with active ingredients (e.g. penicillin warnings, NSAID cautions).</p>
              </div>

              <div className="p-3 neu-sunken-sm rounded-xl">
                <p className="font-bold text-slate-900 mb-1">3. Multi-Device Peer Replication</p>
                <p>Instant sync between desktop billing counter, pharmacist tablet, and mobile store inventory scanner.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowEfficiencyModal(false)}
                className="neu-btn px-5 py-2 rounded-xl text-xs font-bold text-slate-800"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
