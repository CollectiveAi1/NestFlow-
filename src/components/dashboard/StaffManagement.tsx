import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../../lib/api';

const getRatioForAge = (months: number): number => {
  if (months < 12) return 5;
  if (months < 18) return 6;
  if (months < 30) return 7;
  if (months < 132) return 18; // 5-10 years
  return 20; // 11+ years
};

const getStrictestRatio = (childrenAgesInMonths: number[]): number => {
  if (childrenAgesInMonths.length === 0) return 20;
  const minAge = Math.min(...childrenAgesInMonths);
  return getRatioForAge(minAge);
};

const mockRooms = [
  { id: '1', name: 'Infants A', staffCount: 1, childrenAges: [6, 8, 10, 11, 9, 7] }, // 6 kids, 1 staff, max 5 -> Breach
  { id: '2', name: 'Toddlers 1A', staffCount: 2, childrenAges: [14, 15, 16, 24, 28] }, // 5 kids, 2 staff, max 6 -> OK
  { id: '3', name: 'Pre-K', staffCount: 1, childrenAges: [60, 65, 70, 72, 68, 64, 61, 62, 63, 66, 67, 69, 71, 73, 74, 75, 76, 77, 78] }, // 19 kids, 1 staff, max 18 -> Breach
];

export const StaffManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notified, setNotified] = useState(false);
  const queryClient = useQueryClient();

  const { data: staffData = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const response = await staffApi.getAll();
      return response.data;
    },
  });

  const roomsWithStatus = useMemo(() => {
    return mockRooms.map(room => {
      const requiredRatio = getStrictestRatio(room.childrenAges);
      const currentRatio = room.childrenAges.length / room.staffCount;
      const isBreach = currentRatio > requiredRatio;
      return { ...room, requiredRatio, currentRatio, isBreach };
    });
  }, []);

  const breaches = roomsWithStatus.filter(r => r.isBreach);

  useEffect(() => {
    if (breaches.length > 0 && !notified) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Ratio Breach Alert', {
            body: `${breaches.map(b => b.name).join(', ')} exceeded legal staff-to-student ratio.`,
          });
          setNotified(true);
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('Ratio Breach Alert', {
                body: `${breaches.map(b => b.name).join(', ')} exceeded legal staff-to-student ratio.`,
              });
              setNotified(true);
            }
          });
        }
      }
    }
  }, [breaches, notified]);

  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const response = await staffApi.getSchedules();
      return response.data;
    },
  });

  const filteredStaff = staffData.filter((s: any) => 
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading staff data...</div>;
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-8">
      {/* Ratio Alerts */}
      <AnimatePresence>
        {breaches.length > 0 && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="bg-brand-yellow/10 border-l-4 border-brand-yellow text-yellow-800 p-4 rounded-r-lg shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-brand-yellow animate-pulse" />
              <span className="font-bold">Compliance Alert:</span>
              <span>{breaches.length} classroom(s) currently out of ratio. Immediate action required.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Room Cards */}
      <div>
        <h2 className="text-2xl font-bold text-brand-dark mb-4">Live Room Ratios</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roomsWithStatus.map(room => (
            <div 
              key={room.id} 
              className={`bg-white p-6 rounded-2xl shadow-soft border-2 transition-all ${
                room.isBreach ? 'border-brand-yellow animate-pulse shadow-brand-yellow/20' : 'border-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-brand-dark">{room.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  room.isBreach ? 'bg-brand-yellow/20 text-yellow-800' : 'bg-brand-teal/10 text-brand-teal'
                }`}>
                  {room.isBreach ? 'BREACH' : 'COMPLIANT'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Required Ratio:</span>
                  <span className="font-bold">1:{room.requiredRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Staff:</span>
                  <span className="font-bold">{room.staffCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Children:</span>
                  <span className="font-bold">{room.childrenAges.length}</span>
                </div>
              </div>
              
              {room.isBreach && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-brand-yellow font-bold">
                    Action: Assign {Math.ceil(room.childrenAges.length / room.requiredRatio) - room.staffCount} more staff member(s).
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-brand-dark">Staff Directory & Weekly Schedule</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Role</th>
                {days.map(day => (
                  <th key={day} className="p-4 font-medium text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((staff: any) => (
                <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-brand-dark">{staff.first_name} {staff.last_name}</td>
                  <td className="p-4 text-slate-600">{staff.staff_role || staff.role}</td>
                  {days.map(day => {
                    const shift = schedules.find((s: any) => s.staff_id === staff.id && s.day === day);
                    return (
                      <td key={day} className="p-4 text-center">
                        <select 
                          className={`text-xs font-bold px-2 py-1 rounded-lg border-none outline-none cursor-pointer ${
                            shift?.shift_type === 'OPEN' ? 'bg-brand-teal/10 text-brand-teal' :
                            shift?.shift_type === 'CLOSE' ? 'bg-brand-pink/10 text-brand-pink' :
                            shift?.shift_type === 'MID' ? 'bg-brand-sky/20 text-brand-sky' :
                            'bg-slate-100 text-slate-400'
                          }`}
                          value={shift?.shift_type || 'OFF'}
                          onChange={async (e) => {
                            await staffApi.updateSchedule({
                              staffId: staff.id,
                              day,
                              shiftType: e.target.value,
                              weekStartDate: new Date().toISOString().split('T')[0]
                            });
                            queryClient.invalidateQueries({ queryKey: ['schedules'] });
                          }}
                        >
                          <option value="OFF">OFF</option>
                          <option value="OPEN">OPEN (7am-3pm)</option>
                          <option value="MID">MID (9am-5pm)</option>
                          <option value="CLOSE">CLOSE (10am-6pm)</option>
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
