import React from 'react';
import { motion } from 'framer-motion';

const mockInvoices = [
  { id: 'INV-2026-004', date: '2026-04-01', amount: 299.00, status: 'PAID', pdfUrl: '#' },
  { id: 'INV-2026-003', date: '2026-03-01', amount: 299.00, status: 'PAID', pdfUrl: '#' },
  { id: 'INV-2026-002', date: '2026-02-01', amount: 299.00, status: 'PAID', pdfUrl: '#' },
  { id: 'INV-2026-001', date: '2026-01-01', amount: 299.00, status: 'PAID', pdfUrl: '#' },
];

export const BillingDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Plan */}
        <div className="bg-white rounded-2xl shadow-lg border-t-4 border-brand-teal p-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-teal/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-brand-dark mb-1">Current Plan</h2>
                <p className="text-slate-500">Child Care Compass Pro</p>
              </div>
              <span className="bg-brand-teal/10 text-brand-teal px-3 py-1 rounded-full text-xs font-bold">ACTIVE</span>
            </div>
            
            <div className="mb-8">
              <span className="text-4xl font-black text-brand-dark">$299</span>
              <span className="text-slate-500">/month</span>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-5 h-5 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Up to 100 Students
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-5 h-5 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Unlimited Staff Accounts
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-5 h-5 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Premium Support
              </div>
            </div>
            
            <button className="w-full bg-brand-teal hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-float">
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-brand-dark mb-6">Payment Method</h2>
            <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl mb-4">
              <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-500 text-xs">
                VISA
              </div>
              <div>
                <p className="font-bold text-brand-dark">•••• •••• •••• 4242</p>
                <p className="text-xs text-slate-500">Expires 12/28</p>
              </div>
            </div>
          </div>
          <button className="w-full bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold transition-colors">
            Update Payment Method
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-brand-dark">Invoice History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-4 font-medium">Invoice ID</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockInvoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-brand-dark">{invoice.id}</td>
                  <td className="p-4 text-slate-600">{invoice.date}</td>
                  <td className="p-4 text-slate-600">${invoice.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-teal/10 text-brand-teal">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <a href={invoice.pdfUrl} className="text-brand-teal hover:text-teal-700 font-medium text-sm flex items-center justify-end gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
