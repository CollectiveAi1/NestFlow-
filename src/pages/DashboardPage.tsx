import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { childrenApi, attendanceApi } from '../lib/api';
import { useStore } from '../store/useStore';
import { socketService } from '../lib/socket';
import { UserRole } from '../types';
import { AnimatePresence } from 'framer-motion';

import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { TeacherHub } from '../components/dashboard/TeacherHub';
import { ParentPortal } from '../components/dashboard/ParentPortal';

export const DashboardPage: React.FC = () => {
  const { user, showToast } = useStore();
  const queryClient = useQueryClient();
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');

  // Fetch children
  const { data: children = [], isLoading } = useQuery({
    queryKey: ['children', selectedClassroom],
    queryFn: async () => {
      const response = await childrenApi.getAll(selectedClassroom);
      return response.data;
    },
    enabled: user?.role === UserRole.ADMIN || user?.role === UserRole.TEACHER,
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (childId: string) => attendanceApi.checkIn(childId),
    onSuccess: (_, childId) => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      showToast('Child checked in successfully', 'success');

      // Emit socket event
      const child = children.find((c: any) => c.id === childId);
      if (child?.classroom_id) {
        socketService.emitAttendanceUpdate(child.classroom_id, childId, 'PRESENT');
      }
    },
    onError: () => {
      showToast('Failed to check in child', 'error');
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: (childId: string) => attendanceApi.checkOut(childId),
    onSuccess: (_, childId) => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      showToast('Child checked out successfully', 'success');

      // Emit socket event
      const child = children.find((c: any) => c.id === childId);
      if (child?.classroom_id) {
        socketService.emitAttendanceUpdate(child.classroom_id, childId, 'CHECKED_OUT');
      }
    },
    onError: () => {
      showToast('Failed to check out child', 'error');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-slate-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {user?.role === UserRole.ADMIN && (
        <AdminDashboard 
          key="admin" 
          childrenData={children} 
          onCheckIn={(id) => checkInMutation.mutate(id)} 
          onCheckOut={(id) => checkOutMutation.mutate(id)} 
        />
      )}
      {user?.role === UserRole.TEACHER && (
        <TeacherHub 
          key="teacher" 
          childrenData={children} 
          onCheckIn={(id) => checkInMutation.mutate(id)} 
          onCheckOut={(id) => checkOutMutation.mutate(id)} 
        />
      )}
      {user?.role === UserRole.PARENT && (
        <ParentPortal key="parent" />
      )}
    </AnimatePresence>
  );
};
