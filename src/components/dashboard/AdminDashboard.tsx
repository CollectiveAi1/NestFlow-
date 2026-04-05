import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../../lib/animations';
import { KanbanBoard } from '../KanbanBoard';
import { StaffManagement } from './StaffManagement';
import { BillingDashboard } from './BillingDashboard';

type Tab = 'OVERVIEW' | 'STAFF' | 'BILLING';

export const AdminDashboard: React.FC<{ childrenData: any[], onCheckIn: (id: string) => void, onCheckOut: (id: string) => void }> = ({ childrenData, onCheckIn, onCheckOut }) => {
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="w-full h-full p-6 space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-brand-dark mb-2">Center Operations</h1>
          <p className="text-slate-600">Global Command View</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl overflow-x-auto max-w-full">
          <button 
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'OVERVIEW' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-brand-dark'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('STAFF')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'STAFF' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-brand-dark'}`}
          >
            Manage Staff
          </button>
          <button 
            onClick={() => setActiveTab('BILLING')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'BILLING' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-brand-dark'}`}
          >
            Billing & Plan
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'OVERVIEW' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            {/* Grid Layout for Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tuition Health */}
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                <h2 className="text-xl font-bold text-brand-dark mb-4">Tuition Health</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Paid</span>
                      <span className="font-bold text-brand-teal">$45,200</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-brand-teal h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Late</span>
                      <span className="font-bold text-brand-yellow">$3,150</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-brand-yellow h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Conversion */}
              <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
                <h2 className="text-xl font-bold text-brand-dark mb-4">Lead Conversion</h2>
                <div className="flex items-end gap-2 h-24">
                  <div className="w-1/3 bg-brand-sky rounded-t-lg h-full relative group">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500">120</span>
                  </div>
                  <div className="w-1/3 bg-brand-teal rounded-t-lg h-2/3 relative group">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500">45</span>
                  </div>
                  <div className="w-1/3 bg-brand-yellow rounded-t-lg h-1/3 relative group">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500">12</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-bold">
                  <span className="w-1/3 text-center">Inquiries</span>
                  <span className="w-1/3 text-center">Tours</span>
                  <span className="w-1/3 text-center">Enrolled</span>
                </div>
              </div>
            </div>

            {/* Attendance Kanban */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Live Attendance</h2>
              <KanbanBoard children={childrenData} onCheckIn={onCheckIn} onCheckOut={onCheckOut} />
            </div>
          </motion.div>
        )}

        {activeTab === 'STAFF' && (
          <motion.div key="staff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <StaffManagement />
          </motion.div>
        )}

        {activeTab === 'BILLING' && (
          <motion.div key="billing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <BillingDashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
