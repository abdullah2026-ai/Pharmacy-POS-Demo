import React, { useRef } from 'react';
import { Printer, X, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Order } from '../types/pharmacy';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.timestamp).toLocaleString('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
      <div className="neu-convex max-w-xl w-full p-6 rounded-3xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Top Actions (No Print) */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Bangladesh DGDA Standard Pharmacy Invoice
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="neu-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>
            <button
              onClick={onClose}
              className="neu-btn p-1.5 rounded-xl text-slate-500 hover:text-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Pharmacy Memo Canvas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-900 font-sans shadow-xs">
          {/* Pharmacy Letterhead */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-lg bg-[#062822] text-[#bbf246] font-black text-sm flex items-center justify-center">
                P
              </span>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-950">Pharmly BD Healthcare Pharmacy</h2>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              House 42, Road 9/A, Dhanmondi Central Hub, Dhaka 1209, Bangladesh
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              DGDA Drug License No: <strong className="text-slate-800">DGDA-DL-DHAKA-2026/8941</strong> · Hotline: +880 2 9112233
            </p>
          </div>

          {/* Invoice Meta Bar */}
          <div className="grid grid-cols-2 gap-2 py-3 text-xs border-b border-slate-200">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase">Customer / Patient</p>
              <p className="font-bold text-slate-900">{order.customerName}</p>
              <p className="text-[11px] text-slate-500 font-mono">{order.customerPhone}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-[10px] font-bold uppercase">Invoice Number</p>
              <p className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber}</p>
              <p className="text-[10px] text-slate-500 font-mono">{formattedDate} (BST)</p>
            </div>
          </div>

          {order.doctorName && (
            <div className="py-2 text-[11px] border-b border-slate-100 flex justify-between">
              <span>Physician: <strong className="text-slate-800">{order.doctorName}</strong></span>
              {order.prescriptionNumber && <span>Rx Ref: <strong className="font-mono">{order.prescriptionNumber}</strong></span>}
            </div>
          )}

          {/* Itemized Table */}
          <div className="my-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-300 font-bold text-slate-700">
                  <th className="py-1.5">Item & Generic</th>
                  <th className="py-1.5 text-center">Batch</th>
                  <th className="py-1.5 text-center">Qty</th>
                  <th className="py-1.5 text-right">Price (৳)</th>
                  <th className="py-1.5 text-right">Total (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-1.5 font-sans font-medium text-slate-800">
                      <span>{item.brandName}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{item.genericName} ({item.strength})</span>
                    </td>
                    <td className="py-1.5 text-center text-[10px] text-slate-600">{item.batchNumber}</td>
                    <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                    <td className="py-1.5 text-right tabular-nums">৳{item.unitPrice.toFixed(2)}</td>
                    <td className="py-1.5 text-right font-bold tabular-nums">৳{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Settlement Totals */}
          <div className="pt-2 border-t border-slate-300 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">৳{order.subtotal.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount Applied:</span>
                <span className="font-mono">-৳{order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Bangladesh VAT (2.4%):</span>
              <span className="font-mono">৳{order.vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-900 font-bold text-slate-950 text-sm">
              <span>Net Payable (BDT):</span>
              <span className="font-mono text-base font-extrabold tabular-nums">৳{order.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment & Pharmacist Footer */}
          <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-center text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Payment: <strong>{order.paymentMethod}</strong> ({order.status})</span>
              <span>Dispensed By: <strong>{order.cashierName}</strong></span>
            </div>
            <p className="font-medium text-slate-700 pt-1">
              ঔষধ শিশুদের নাগালের বাইরে রাখুন · চিকিৎসকের পরামর্শ অনুযায়ী সেব্য
            </p>
            <p className="text-[9px] text-slate-400">
              Computer Generated Tax Invoice · Thank you for visiting Pharmly BD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
