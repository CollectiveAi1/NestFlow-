import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../../lib/animations';

export const TeacherHub: React.FC<{ childrenData: any[], onCheckIn: (id: string) => void, onCheckOut: (id: string) => void }> = ({ childrenData, onCheckIn, onCheckOut }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="w-full max-w-md mx-auto h-[calc(100vh-80px)] flex flex-col bg-slate-50 shadow-2xl overflow-hidden relative rounded-3xl border-8 border-slate-800 my-4"
    >
      {/* Header */}
      <div className="bg-white p-6 pb-4 shadow-sm z-10">
        <h1 className="text-2xl font-black text-brand-dark">Classroom Hub</h1>
        <p className="text-sm text-slate-500">Toddlers 1A</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        {/* Curriculum Center (Drag & Drop) */}
        <section>
          <h2 className="text-lg font-bold text-brand-dark mb-3">Curriculum Center</h2>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              isDragging ? 'border-brand-teal bg-teal-50' : 'border-slate-300 bg-white hover:border-brand-teal hover:bg-teal-50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
          >
            <div className="w-12 h-12 bg-brand-teal/10 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <p className="font-bold text-slate-700">Upload Lesson Plan</p>
            <p className="text-xs text-slate-500 mt-1">PDF or Word docs</p>
          </motion.div>
        </section>

        {/* High-Speed Attendance */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-brand-dark">Fast Attendance</h2>
            <span className="text-xs font-bold bg-brand-teal/10 text-brand-teal px-2 py-1 rounded-lg">
              {childrenData.filter(c => c.status === 'PRESENT').length} / {childrenData.length} Present
            </span>
          </div>
          
          <div className="space-y-3">
            {childrenData.map(child => (
              <div key={child.id} className="bg-white p-3 rounded-2xl shadow-soft flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                    {child.avatar_url ? (
                      <img src={child.avatar_url} alt={child.first_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                        {child.first_name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{child.first_name} {child.last_name}</p>
                    <p className="text-xs text-slate-500">{child.status}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {child.status !== 'PRESENT' ? (
                    <button 
                      onClick={() => onCheckIn(child.id)}
                      className="min-h-[44px] min-w-[44px] px-4 bg-brand-teal text-white font-bold rounded-xl shadow-sm hover:bg-teal-600 active:scale-95 transition-all"
                    >
                      In
                    </button>
                  ) : (
                    <button 
                      onClick={() => onCheckOut(child.id)}
                      className="min-h-[44px] min-w-[44px] px-4 bg-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-300 active:scale-95 transition-all"
                    >
                      Out
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 flex justify-around items-center z-10">
        <button className="flex flex-col items-center text-brand-teal">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center text-slate-400 hover:text-brand-teal transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="text-[10px] font-bold">Plan</span>
        </button>
        <button className="flex flex-col items-center text-slate-400 hover:text-brand-teal transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <span className="text-[10px] font-bold">Messages</span>
        </button>
      </div>
    </motion.div>
  );
};
