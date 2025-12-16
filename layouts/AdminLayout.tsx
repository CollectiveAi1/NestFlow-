import React from 'react';

interface AdminLayoutProps {
  sidebar: React.ReactNode;
  listPanel: React.ReactNode;
  detailPanel: React.ReactNode;
  onCheckIn?: () => void;
  onQuickAdd?: () => void;
  onLogout?: () => void;
}

/**
 * 3-Column Admin Layout
 * 
 * Left: Navigation (Centers/Classrooms)
 * Center: Operational List (Children/Staff)
 * Right: Context/Detail (Timeline/Actions)
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  sidebar, 
  listPanel, 
  detailPanel,
  onCheckIn,
  onQuickAdd,
  onLogout
}) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-100">
      {/* Column 1: Navigation Sidebar */}
      <nav className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-50">
          <span className="text-xl font-display font-bold text-primary-400 tracking-tight">NestFlow</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {sidebar}
        </div>
        
        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-gray-50 bg-white">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Column 2: Main List Area */}
      <main className="flex-1 min-w-[350px] flex flex-col border-r border-gray-200/60 bg-surface-50 z-10">
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0">
          <h2 className="font-display font-bold text-gray-700">Classroom 1A</h2>
          <div className="flex gap-2">
            <button 
              onClick={onCheckIn}
              className="bg-white border border-primary-300 text-primary-500 rounded-full px-4 py-1.5 text-sm font-bold shadow-sm hover:bg-primary-50 transition-colors active:scale-95"
            >
              Check In All
            </button>
            <button 
              onClick={onQuickAdd}
              className="bg-primary-300 text-white rounded-full px-4 py-1.5 text-sm font-bold shadow-sm hover:bg-primary-400 transition-colors active:scale-95"
            >
              + Quick Add
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {listPanel}
        </div>
      </main>

      {/* Column 3: Detail / Context Panel */}
      <aside className="w-[400px] flex-shrink-0 bg-white shadow-xl shadow-gray-200/50 z-30 flex flex-col">
        {detailPanel}
      </aside>
    </div>
  );
};