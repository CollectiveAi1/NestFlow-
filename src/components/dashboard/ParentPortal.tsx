import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../../lib/animations';

export const ParentPortal: React.FC = () => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="w-full max-w-2xl mx-auto p-6 space-y-8"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-black text-brand-dark mb-2">Parent Portal</h1>
        <p className="text-slate-600">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Daily Feed */}
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 relative">
          <h2 className="text-2xl font-bold text-brand-teal mb-6">Daily Feed</h2>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="w-0.5 bg-slate-200 absolute left-6 top-0 bottom-0 z-0"></div>
            
            <div className="space-y-8 relative z-10">
              {/* Feed Item 1 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-yellow border-4 border-white shadow-sm flex-shrink-0 flex items-center justify-center text-white font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex-1 border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-brand-dark">Checked In</h3>
                    <span className="text-xs text-slate-500">8:15 AM</span>
                  </div>
                  <p className="text-sm text-slate-600">Dropped off by John Doe.</p>
                </div>
              </div>

              {/* Feed Item 2 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-teal border-4 border-white shadow-sm flex-shrink-0 flex items-center justify-center text-white font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex-1 border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-brand-dark">Art Activity</h3>
                    <span className="text-xs text-slate-500">10:30 AM</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Finger painting! We learned about primary colors today.</p>
                  <div className="w-full h-32 bg-slate-200 rounded-xl overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-brand-pink to-brand-peach opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold">Photo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Messaging */}
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 flex flex-col h-96">
          <h2 className="text-2xl font-bold text-brand-teal mb-4">Messages</h2>
          
          <div className="flex-1 overflow-y-auto space-y-4 p-2">
            <div className="flex justify-end">
              <div className="bg-brand-teal text-white p-3 rounded-l-2xl rounded-tr-2xl max-w-[80%] shadow-sm">
                <p className="text-sm">Hi Jane, did Timmy eat his lunch today?</p>
                <span className="text-[10px] opacity-70 mt-1 block text-right">12:45 PM</span>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-white text-slate-800 border border-slate-200 p-3 rounded-r-2xl rounded-tl-2xl max-w-[80%] shadow-sm">
                <p className="text-sm">Yes he did! He loved the applesauce.</p>
                <span className="text-[10px] text-slate-400 mt-1 block">12:50 PM</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-brand-teal"
            />
            <button className="w-10 h-10 bg-brand-teal text-white rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors">
              <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
