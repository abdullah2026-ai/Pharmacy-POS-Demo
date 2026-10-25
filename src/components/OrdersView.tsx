import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  Printer, 
  Trash2, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  Clock, 
  RotateCcw,
  Receipt,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { Order } from '../types/pharmacy';

interface OrdersViewProps {
  orders: Order[];
  onOpenOrderInvoice: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: 'Delivered' | 'Pending' | 'Refunded') => void;
  onDeleteOrder: (orderId: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onOpenOrderInvoice,
  onUpdateStatus,
  onDeleteOrder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Delivered' | 'Pending' | 'Refunded'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  const filteredOrders = orders.filter(order => {
    const matchQuery = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      (order.doctorName && order.doctorName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchPayment = paymentFilter === 'ALL' || order.paymentMethod === paymentFilter;

    return matchQuery && matchStatus && matchPayment;
  });

  const exportOrdersCsv = () => {
    if (orders.length === 0) {
      alert('No sales orders to export yet.');
      return;
    }
    const headers = ['Order Number', 'Date', 'Customer Name', 'Customer Phone', 'Doctor', 'Prescription #', 'Payment Method', 'Subtotal (BDT)', 'VAT (BDT)', 'Discount (BDT)', 'Grand Total (BDT)', 'Status', 'Updated By'];
    const rows = orders.map(o => [
      o.orderNumber,
      new Date(o.timestamp).toLocaleString('en-GB'),
      o.customerName,
      o.customerPhone,
      o.doctorName || 'Walk-in OTC',
      o.prescriptionNumber || '',
      o.paymentMethod,
      o.subtotal.toFixed(2),
      o.vatAmount.toFixed(2),
      o.discountAmount.toFixed(2),
      o.grandTotal.toFixed(2),
      o.status,
      o.lastUpdatedBy
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pharmly_sales_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar */}
      <div className="neu-flat p-4 lg:p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="neu-sunken flex items-center px-3.5 py-2">
            <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Customer, Phone, or Doctor..."
              className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="neu-sunken-sm px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Delivery Statuses</option>
              <option value="Delivered">Delivered (Completed)</option>
              <option value="Pending">Pending Fulfillment</option>
              <option value="Refunded">Refunded / Void</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="neu-sunken-sm px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Payments</option>
              <option value="CASH">Cash</option>
              <option value="BKASH">bKash</option>
              <option value="NAGAD">Nagad</option>
              <option value="ROCKET">Rocket</option>
              <option value="CARD">Debit/Credit Card</option>
              <option value="DUE">Due/Credit</option>
            </select>
          </div>

          {/* Export Orders CSV */}
          {orders.length > 0 && (
            <button
              onClick={exportOrdersCsv}
              className="neu-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="neu-flat p-5 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Dispensing Sales Orders</h2>
            <p className="text-xs text-slate-500">Itemized Financial Receipts and Prescription Audits</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600">
            {filteredOrders.length} Invoices Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-400 font-semibold">
                <th className="pb-3 pl-2">Order #</th>
                <th className="pb-3">Customer & Phone</th>
                <th className="pb-3">Prescribing Physician</th>
                <th className="pb-3 text-center">Items</th>
                <th className="pb-3 text-right">Grand Total (৳)</th>
                <th className="pb-3 text-center">Method</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-center">Timestamp</th>
                <th className="pb-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 pl-2 font-mono font-bold text-slate-800">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5 font-medium text-slate-900">
                    <div>
                      <span>{order.customerName}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{order.customerPhone}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-slate-600">
                    <div>
                      <span>{order.doctorName || 'Walk-in OTC'}</span>
                      {order.prescriptionNumber && (
                        <span className="block text-[10px] text-emerald-700 font-mono">{order.prescriptionNumber}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 text-center font-mono tabular-nums text-slate-700">
                    {order.items.length} meds
                  </td>
                  <td className="py-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                    ৳{order.grandTotal.toFixed(2)}
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-800">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value as any)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-0 focus:outline-none cursor-pointer ${
                        order.status === 'Delivered' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : order.status === 'Pending' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      <option value="Delivered">Delivered</option>
                      <option value="Pending">Pending</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="py-3.5 text-center font-mono text-[11px] text-slate-400">
                    {new Date(order.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onOpenOrderInvoice(order)}
                        title="View & Print Official Receipt"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenOrderInvoice(order)}
                        title="Thermal Print"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Void order ${order.orderNumber}? Stock and audit logs will be updated.`)) {
                            onDeleteOrder(order.id);
                          }
                        }}
                        title="Void Order"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <Receipt className="w-8 h-8 text-slate-300" />
                      <p className="font-bold text-slate-700 text-xs">No Sales Invoices Found</p>
                      <p className="text-[11px] text-slate-400">
                        {orders.length === 0 
                          ? 'Zero sales recorded yet. All data is fresh and ready for your first sale in the POS register!' 
                          : 'No orders matched your search criteria.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
