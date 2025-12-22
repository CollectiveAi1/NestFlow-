import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AdminLayout } from './layouts/AdminLayout';
import { NestCard } from './components/NestCard';
import { ActivityFeedItem } from './components/ActivityFeedItem';
import { Child, Activity, ActivityType, Guardian, Invoice, Classroom, EnrollmentStatus, HealthProfile, Immunization, Medication, StaffMember, UserRole, ShiftAssignment, ShiftType, ConsentTemplate, SignedConsentForm } from './types';

// --- MOCK DATA ---

const CONSENT_TEMPLATES: ConsentTemplate[] = [
  { id: 't1', title: 'Media Release', isRequired: true, content: 'I hereby grant permission to NestFlow to take and use photographs and/or digital images of my child for use in social media and marketing materials.' },
  { id: 't2', title: 'Emergency Authorization', isRequired: true, content: 'In the event of an emergency, I authorize NestFlow staff to seek immediate medical attention for my child and agree to cover all resulting costs.' },
  { id: 't3', title: 'Allergy Acknowledgment', isRequired: true, content: 'I have provided a full and accurate list of my child\'s allergies and understand the center\'s protocols for managing allergic reactions.' },
  { id: 't4', title: 'Behavior Agreement', isRequired: false, content: 'I agree to uphold the center\'s community standards regarding behavior and conflict resolution between students.' },
];

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 's1',
    name: 'Ms. Frizzle',
    role: 'Lead Teacher',
    email: 'frizzle@sunnyvale.edu',
    phone: '555-0201',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frizzle',
    bio: 'Dedicated to making every day a field trip. Expert in STEM and magical school buses.',
    joinedDate: '2021-08-15',
    assignedClassroomIds: ['toddlers', 'preschool']
  },
  {
    id: 's2',
    name: 'Mr. Rogers',
    role: 'Co-Teacher',
    email: 'rogers@sunnyvale.edu',
    phone: '555-0202',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rogers',
    bio: 'Focuses on emotional intelligence and community building.',
    joinedDate: '2022-01-10',
    assignedClassroomIds: ['infants']
  }
];

const INITIAL_SHIFTS: ShiftAssignment[] = [
  { staffId: 's1', day: 'Mon', type: 'OPEN' },
  { staffId: 's1', day: 'Tue', type: 'OPEN' },
  { staffId: 's2', day: 'Mon', type: 'MID' },
];

const INITIAL_CLASSROOMS: Classroom[] = [
  { id: 'infants', name: 'Infants', enrolled: 12, capacity: 15, staffIds: ['s2'] },
  { id: 'toddlers', name: 'Toddlers 1A', enrolled: 3, capacity: 5, staffIds: ['s1'] },
  { id: 'preschool', name: 'Preschool', enrolled: 22, capacity: 24, staffIds: ['s1'] },
];

const INITIAL_CHILDREN: Child[] = [
  { 
    id: '1', 
    firstName: 'Leo', 
    lastName: 'Dasher', 
    avatarUrl: 'https://picsum.photos/200/200?random=1', 
    classroom: 'Toddlers 1A', 
    classroomId: 'toddlers', 
    status: 'PRESENT', 
    enrollmentStatus: 'ENROLLED',
    lastActivityTime: '10m ago', 
    allergies: ['Peanuts'], 
    dob: '2020-05-12',
    notes: 'Leo loves building blocks and outdoor play.'
  },
  { id: 'w1', firstName: 'Cooper', lastName: 'Waites', avatarUrl: 'https://picsum.photos/200/200?random=50', classroom: 'Toddlers 1A', classroomId: 'toddlers', status: 'ABSENT', enrollmentStatus: 'WAITLIST', dob: '2021-02-10' },
];

const INITIAL_GUARDIANS: Record<string, Guardian[]> = {
  '1': [{ id: 'g1', name: 'Sarah Dasher', relation: 'Mother', phone: '555-0101', email: 'sarah@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=g1' }],
};

const INITIAL_HEALTH_PROFILES: Record<string, HealthProfile> = {
  '1': {
    childId: '1',
    bloodType: 'O+',
    doctorName: 'Dr. Smith',
    doctorPhone: '555-0011',
    immunizations: [
      { id: 'imm1', name: 'MMR', dueDate: '2023-01-01', status: 'COMPLIANT' }
    ],
    medications: [
      { id: 'med1', name: 'Vitamin D', dosage: '1 drop', frequency: 'Daily', instructions: 'After breakfast' }
    ],
    specialNeeds: 'Peanut allergy'
  }
};

const INITIAL_SIGNED_FORMS: SignedConsentForm[] = [
  { id: 'f1', childId: '1', templateId: 't1', status: 'SIGNED', signedAt: '2023-10-01', signerName: 'Sarah Dasher' },
  { id: 'f2', childId: '1', templateId: 't2', status: 'PENDING' },
];

type ChildDetailTab = 'TIMELINE' | 'PROFILE' | 'HEALTH' | 'GUARDIANS' | 'FORMS';
type StaffDetailTab = 'INFO' | 'ASSIGNMENTS';
type AppSection = 'DAILY_OPS' | 'STUDENTS' | 'ENROLLMENT' | 'TEAM' | 'COMMUNICATIONS' | 'CONSENT_FORMS' | 'CRM_DASHBOARD' | 'STAFF_SCHEDULE' | 'PARENT_HEALTH' | 'PARENT_PROFILE';

const LoginScreen: React.FC<{ onLogin: (role: UserRole, userEmail: string) => void }> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => { 
      setIsLoading(false); 
      onLogin(role, email || (role === UserRole.ADMIN ? 'manager@nestflow.app' : role === UserRole.TEACHER ? 'frizzle@sunnyvale.edu' : 'sarah@example.com')); 
    }, 800);
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center relative overflow-hidden p-6">
      <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[32px] shadow-2xl w-full max-w-md z-10 border border-white relative">
         <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-300 to-primary-50 rounded-blob mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">N</div>
            <h1 className="font-display text-4xl font-bold text-gray-800 mb-2 tracking-tight">NestFlow</h1>
            <p className="text-gray-500 font-medium tracking-tight">Center Management Platform</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex bg-gray-100 rounded-2xl p-1.5 border border-gray-200 overflow-x-auto no-scrollbar">
               <button type="button" onClick={() => { setRole(UserRole.ADMIN); setEmail('manager@nestflow.app'); }} className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-bold transition-all ${role === UserRole.ADMIN ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}>Manager</button>
               <button type="button" onClick={() => { setRole(UserRole.TEACHER); setEmail('frizzle@sunnyvale.edu'); }} className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-bold transition-all ${role === UserRole.TEACHER ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}>Teacher</button>
               <button type="button" onClick={() => { setRole(UserRole.PARENT); setEmail('sarah@example.com'); }} className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-bold transition-all ${role === UserRole.PARENT ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}>Parent</button>
            </div>
            <div className="space-y-4">
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-4 bg-white/50 border border-gray-200 rounded-2xl outline-none transition-all font-medium text-gray-700" required />
              <input type="password" placeholder="Password" defaultValue="password123" className="w-full px-5 py-4 bg-white/50 border border-gray-200 rounded-2xl outline-none transition-all font-medium text-gray-700" required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-5 bg-primary-400 hover:bg-primary-500 text-white font-display font-bold text-lg rounded-2xl transition-all shadow-xl shadow-primary-200">
              {isLoading ? 'Connecting...' : 'Sign In'}
            </button>
         </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ role: UserRole, email: string } | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [activeSection, setActiveSection] = useState<AppSection>('DAILY_OPS');
  
  const [classrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
  const [children, setChildren] = useState<Child[]>(INITIAL_CHILDREN);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [shifts, setShifts] = useState<ShiftAssignment[]>(INITIAL_SHIFTS);
  const [signedForms, setSignedForms] = useState<SignedConsentForm[]>(INITIAL_SIGNED_FORMS);
  const [guardiansMap] = useState<Record<string, Guardian[]>>(INITIAL_GUARDIANS);
  const [healthMap] = useState<Record<string, HealthProfile>>(INITIAL_HEALTH_PROFILES);

  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [activeChildTab, setActiveChildTab] = useState<ChildDetailTab>('TIMELINE');
  const [activeStaffTab, setActiveStaffTab] = useState<StaffDetailTab>('INFO');
  
  const [signingForm, setSigningForm] = useState<ConsentTemplate | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logic to filter children based on Parent role
  const myChildren = useMemo(() => {
    if (currentUser?.role !== UserRole.PARENT) return [];
    // Mock filtering: if parent email is 'sarah@example.com', return child '1'
    return children.filter(c => {
      const guardians = guardiansMap[c.id] || [];
      return guardians.some(g => g.email === currentUser.email);
    });
  }, [children, currentUser, guardiansMap]);

  useEffect(() => {
    if (currentUser?.role === UserRole.PARENT && myChildren.length > 0) {
      setSelectedChildId(myChildren[0].id);
    }
  }, [currentUser, myChildren]);

  const teacherProfile = useMemo(() => staff.find(s => s.email === currentUser?.email), [staff, currentUser]);
  const accessibleClassrooms = useMemo(() => 
    currentUser?.role === UserRole.ADMIN ? classrooms : classrooms.filter(c => teacherProfile?.assignedClassroomIds.includes(c.id)),
    [currentUser, classrooms, teacherProfile]
  );

  const selectedChild = useMemo(() => children.find(c => c.id === selectedChildId), [children, selectedChildId]);
  const selectedStaff = useMemo(() => staff.find(s => s.id === selectedStaffId), [staff, selectedStaffId]);

  useEffect(() => {
    if (currentUser?.role !== UserRole.PARENT && accessibleClassrooms.length > 0 && !selectedClassroomId) {
      setSelectedClassroomId(accessibleClassrooms[0].id);
    }
  }, [accessibleClassrooms, selectedClassroomId, currentUser]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSignForm = (templateId: string) => {
    if (!selectedChildId) return;
    const newSignedForm: SignedConsentForm = {
      id: `f-${Date.now()}`,
      childId: selectedChildId,
      templateId,
      status: 'SIGNED',
      signedAt: new Date().toISOString().split('T')[0],
      signerName: guardiansMap[selectedChildId]?.[0]?.name || 'Parent'
    };
    
    setSignedForms(prev => {
      const filtered = prev.filter(f => !(f.childId === selectedChildId && f.templateId === templateId));
      return [...filtered, newSignedForm];
    });
    setSigningForm(null);
    showToast('Form signed successfully!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (selectedChildId) {
        setChildren(prev => prev.map(c => c.id === selectedChildId ? { ...c, avatarUrl: base64 } : c));
        showToast(`Updated photo!`);
      } else if (selectedStaffId) {
        setStaff(prev => prev.map(s => s.id === selectedStaffId ? { ...s, avatarUrl: base64 } : s));
        showToast(`Updated photo!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const SidebarContent = () => {
    if (currentUser?.role === UserRole.PARENT) {
      return (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2">My Child</h3>
            <button onClick={() => { setActiveSection('DAILY_OPS'); setActiveChildTab('TIMELINE'); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'DAILY_OPS' && activeChildTab === 'TIMELINE' ? 'bg-primary-100 text-primary-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>🏠 Daily Feed</button>
            <button onClick={() => { setActiveSection('PARENT_HEALTH'); setActiveChildTab('HEALTH'); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'PARENT_HEALTH' ? 'bg-primary-100 text-primary-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>🏥 Medical Log</button>
            <button onClick={() => { setActiveSection('CONSENT_FORMS'); setActiveChildTab('FORMS'); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'CONSENT_FORMS' ? 'bg-primary-100 text-primary-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>📜 Consent Forms</button>
            <button onClick={() => { setActiveSection('PARENT_PROFILE'); setActiveChildTab('PROFILE'); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'PARENT_PROFILE' ? 'bg-primary-100 text-primary-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>👤 Child Profile</button>
          </div>
          <div className="p-4 bg-accent-50 rounded-2xl border border-accent-100">
             <p className="text-[10px] font-bold text-accent-400 uppercase tracking-widest mb-1">Tuition Balance</p>
             <p className="text-xl font-display font-bold text-accent-400">$0.00</p>
             <button className="mt-3 w-full py-2 bg-white border border-accent-100 rounded-xl text-[10px] font-bold text-accent-400 hover:bg-accent-100 transition-colors">Pay Now</button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {currentUser?.role === UserRole.ADMIN && (
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2">Admin Suite</h3>
            <button onClick={() => setActiveSection('CRM_DASHBOARD')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'CRM_DASHBOARD' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>📊 CRM Health</button>
            <button onClick={() => setActiveSection('CONSENT_FORMS')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'CONSENT_FORMS' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>📜 Consent Hub</button>
            <button onClick={() => setActiveSection('STAFF_SCHEDULE')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'STAFF_SCHEDULE' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>🗓️ Schedule</button>
          </div>
        )}
        <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2">Operations</h3>
            <button onClick={() => setActiveSection('DAILY_OPS')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'DAILY_OPS' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>🏠 Feed</button>
            <button onClick={() => { setActiveSection('STUDENTS'); setSelectedChildId(null); setSelectedStaffId(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'STUDENTS' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>👶 Students</button>
            <button onClick={() => { setActiveSection('TEAM'); setSelectedChildId(null); setSelectedStaffId(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold ${activeSection === 'TEAM' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>👥 Staff</button>
        </div>
      </div>
    );
  };

  const ListPanelContent = () => {
    if (currentUser?.role === UserRole.PARENT) {
      return (
        <div className="space-y-6 animate-in slide-in-from-left-4">
           <div className="bg-gradient-to-br from-primary-400 to-primary-300 p-6 rounded-[32px] text-white shadow-lg relative overflow-hidden mb-6">
              <div className="relative z-10">
                <h2 className="text-2xl font-display font-bold">Welcome, Sarah!</h2>
                <p className="text-sm opacity-90 mt-1">Here's Leo's day at a glance.</p>
              </div>
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
           </div>
           <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Children</h3>
              {myChildren.map(child => (
                <NestCard key={child.id} child={child} selected={selectedChildId === child.id} onClick={() => setSelectedChildId(child.id)} />
              ))}
           </div>
        </div>
      );
    }

    if (activeSection === 'CONSENT_FORMS') {
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
           <h2 className="text-xl font-display font-bold text-gray-800">Consent Templates</h2>
           <div className="space-y-4">
              {CONSENT_TEMPLATES.map(temp => (
                <div key={temp.id} className="p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm">
                   <div className="flex justify-between items-start mb-2">
                     <h4 className="font-bold text-gray-800">{temp.title}</h4>
                     <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${temp.isRequired ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                       {temp.isRequired ? 'Required' : 'Optional'}
                     </span>
                   </div>
                   <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{temp.content}</p>
                </div>
              ))}
           </div>
        </div>
      );
    }

    if (activeSection === 'STUDENTS') {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-gray-800">Roster</h2>
          <div className="grid gap-4">
            {children.filter(c => c.enrollmentStatus === 'ENROLLED').map(child => (
              <NestCard key={child.id} child={child} selected={selectedChildId === child.id} onClick={() => { setSelectedChildId(child.id); setSelectedStaffId(null); setActiveChildTab('HEALTH'); }} />
            ))}
          </div>
        </div>
      );
    }

    if (activeSection === 'TEAM') {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-gray-800">Staff</h2>
          <div className="grid gap-4">
            {staff.map(s => (
              <div key={s.id} onClick={() => { setSelectedStaffId(s.id); setSelectedChildId(null); }} className={`flex items-center gap-4 p-4 bg-white rounded-nest border transition-all cursor-pointer ${selectedStaffId === s.id ? 'ring-2 ring-primary-300 border-transparent shadow-md' : 'border-gray-100'}`}>
                <img src={s.avatarUrl} className="w-12 h-12 rounded-blob bg-primary-50" />
                <div><h4 className="font-bold text-gray-800">{s.name}</h4><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.role}</p></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Daily Log</h3>
        {children.filter(c => c.classroomId === selectedClassroomId && c.enrollmentStatus === 'ENROLLED').map(child => (
          <NestCard key={child.id} child={child} selected={selectedChildId === child.id} onClick={() => setSelectedChildId(child.id)} />
        ))}
      </div>
    );
  };

  const DetailPanelContent = () => {
    if (activeSection === 'CONSENT_FORMS' && currentUser?.role !== UserRole.PARENT && !selectedChild) {
      return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-4">
           <div className="p-8 border-b border-gray-100 bg-primary-50/30">
            <h3 className="text-xl font-display font-bold text-gray-800">Compliance Tracker</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Completion by classroom</p>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
             {classrooms.map(room => {
               const roomChildren = children.filter(c => c.classroomId === room.id && c.enrollmentStatus === 'ENROLLED');
               const requiredCount = roomChildren.length * CONSENT_TEMPLATES.filter(t => t.isRequired).length;
               const completedCount = roomChildren.reduce((acc, c) => {
                 const childForms = signedForms.filter(f => f.childId === c.id && f.status === 'SIGNED');
                 return acc + childForms.length;
               }, 0);
               const percentage = requiredCount > 0 ? Math.round((completedCount / requiredCount) * 100) : 100;

               return (
                 <div key={room.id} className="space-y-2">
                   <div className="flex justify-between items-end">
                     <h4 className="font-bold text-gray-800 text-sm">{room.name}</h4>
                     <span className="text-[10px] font-bold text-primary-500">{percentage}% Signed</span>
                   </div>
                   <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                     <div className="bg-primary-300 h-full transition-all duration-700" style={{ width: `${percentage}%` }}></div>
                   </div>
                 </div>
               );
             })}
          </div>
        </div>
      );
    }

    if (selectedChild) {
      const guardians = guardiansMap[selectedChild.id] || [];
      const health = healthMap[selectedChild.id];
      const childForms = CONSENT_TEMPLATES.map(t => {
        const signed = signedForms.find(f => f.childId === selectedChild.id && f.templateId === t.id);
        return { template: t, signed };
      });

      return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-4">
          <div className="h-40 bg-primary-100 relative group overflow-hidden shrink-0">
             <div className="absolute -bottom-8 left-6 flex items-end gap-4">
                <div className="relative">
                  <img src={selectedChild.avatarUrl} className="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-white object-cover" />
                  <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-gray-100 shadow-lg flex items-center justify-center text-xs">📸</button>
                </div>
                <div className="mb-10">
                   <h2 className="text-2xl font-display font-bold text-gray-800">{selectedChild.firstName} {selectedChild.lastName}</h2>
                   <p className="text-gray-500 text-xs font-bold uppercase">{selectedChild.classroom}</p>
                </div>
             </div>
          </div>
          <div className="mt-12 px-6 flex gap-1 border-b border-gray-100 overflow-x-auto no-scrollbar shrink-0">
            {['TIMELINE', 'HEALTH', 'GUARDIANS', 'FORMS', 'PROFILE'].map(tab => {
              const isActive = activeChildTab === tab;
              return (
                <button 
                  key={tab} 
                  onClick={() => setActiveChildTab(tab as ChildDetailTab)} 
                  className={`px-4 py-3 text-[10px] font-bold relative transition-colors ${isActive ? 'text-primary-500' : 'text-gray-400'}`}
                >
                  {tab}
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-300 rounded-t-full" />}
                </button>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto p-8">
             {activeChildTab === 'FORMS' && (
               <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Documents for Approval</h3>
                    <div className="flex items-center gap-1.5 bg-primary-50 px-2 py-1 rounded-full">
                       <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                       <span className="text-[9px] font-bold text-primary-600">
                         {childForms.filter(f => f.signed?.status === 'SIGNED').length}/{CONSENT_TEMPLATES.length} Signed
                       </span>
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                   {childForms.map(({ template, signed }) => (
                     <div key={template.id} className={`p-4 rounded-[24px] border transition-all ${signed?.status === 'SIGNED' ? 'bg-white border-gray-100 shadow-sm opacity-60' : 'bg-white border-primary-100 shadow-md ring-1 ring-primary-50'}`}>
                       <div className="flex justify-between items-start mb-1">
                         <h4 className="text-sm font-bold text-gray-800">{template.title}</h4>
                         {signed?.status === 'SIGNED' ? (
                           <span className="text-[9px] font-bold text-green-500 flex items-center gap-1">✅ COMPLETED</span>
                         ) : (
                           <button onClick={() => setSigningForm(template)} className="text-[9px] font-bold bg-primary-400 text-white px-2 py-1 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-transform">ACTION REQUIRED</button>
                         )}
                       </div>
                       {signed?.status === 'SIGNED' ? (
                         <div className="text-[10px] text-gray-400 flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                            <span>Signed by {signed.signerName}</span>
                            <span>{signed.signedAt}</span>
                         </div>
                       ) : (
                         <p className="text-[10px] text-gray-400 mt-2">Please review and sign this authorization form.</p>
                       )}
                     </div>
                   ))}
                 </div>

                 {signingForm && (
                   <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
                      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
                         <div className="flex justify-between items-start">
                           <h3 className="text-2xl font-display font-bold text-gray-800">{signingForm.title}</h3>
                           <button onClick={() => setSigningForm(null)} className="text-gray-300 hover:text-gray-500 transition-colors text-2xl">×</button>
                         </div>
                         <div className="p-6 bg-surface-50 rounded-2xl border border-gray-100 max-h-[250px] overflow-y-auto">
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">{signingForm.content}</p>
                         </div>
                         <div className="space-y-4">
                           <div className="space-y-1">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Parent Digital Signature</label>
                             <input type="text" placeholder="Type your full name" className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-100 transition-all font-bold text-gray-700" />
                           </div>
                           <button onClick={() => handleSignForm(signingForm.id)} className="w-full py-4 bg-primary-400 text-white font-display font-bold text-lg rounded-2xl shadow-xl shadow-primary-200 hover:bg-primary-500 active:scale-95 transition-all">Sign Document</button>
                         </div>
                      </div>
                   </div>
                 )}
               </div>
             )}

             {activeChildTab === 'HEALTH' && (
               <div className="space-y-8 animate-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medical Log & Info</h3>
                    <button className="text-[10px] font-bold text-primary-400 uppercase hover:underline">Request Update</button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Blood Type</p>
                      <p className="text-sm font-bold text-gray-700">{health?.bloodType || 'Unknown'}</p>
                    </div>
                    <div className="bg-surface-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Doctor</p>
                      <p className="text-sm font-bold text-gray-700">{health?.doctorName || 'Dr. Not Listed'}</p>
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <p className="text-[10px] font-bold text-red-400 uppercase mb-1">Critical Warnings</p>
                    <p className="text-sm font-bold text-red-700">{health?.specialNeeds || 'No special needs recorded.'}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase">Medications</h4>
                    {health?.medications.map(med => (
                      <div key={med.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        <p className="text-sm font-bold text-gray-800">{med.name} - {med.dosage}</p>
                        <p className="text-xs text-gray-400">{med.frequency} • {med.instructions}</p>
                      </div>
                    ))}
                  </div>
               </div>
             )}

             {activeChildTab === 'TIMELINE' && (
               <div className="space-y-6">
                 <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent Activity</h3>
                 <ActivityFeedItem activity={{
                   id: 'act1',
                   childId: selectedChild.id,
                   type: ActivityType.PHOTO,
                   title: 'Creative Hour!',
                   description: `${selectedChild.firstName} built a masterpiece today using blocks!`,
                   mediaUrl: 'https://picsum.photos/400/300?random=10',
                   timestamp: '11:30 AM',
                   authorName: 'Ms. Frizzle'
                 }} />
                 <ActivityFeedItem activity={{
                   id: 'act2',
                   childId: selectedChild.id,
                   type: ActivityType.MEAL,
                   title: 'Lunch Time',
                   description: `Finished all the peas and carrots. Great appetite today!`,
                   timestamp: '12:45 PM',
                   authorName: 'Chef Bob'
                 }} />
               </div>
             )}

             {activeChildTab === 'PROFILE' && (
               <div className="space-y-6">
                  <div className="p-6 bg-surface-50 rounded-[32px] border border-gray-100">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3">About {selectedChild.firstName}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">{selectedChild.notes}</p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase pl-2">Guardians</h4>
                    {guardians.map(g => (
                      <div key={g.id} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        <img src={g.avatarUrl} className="w-12 h-12 rounded-full shadow-inner" />
                        <div>
                          <p className="text-sm font-bold text-gray-800">{g.name}</p>
                          <p className="text-[10px] text-primary-400 font-bold uppercase">{g.relation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
             )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-3xl shadow-inner animate-pulse">🌱</div>
        <h3 className="text-lg font-display font-bold text-gray-600">Nest Hub</h3>
        <p className="text-xs mt-2 max-w-[240px] leading-relaxed">Select a feature from the navigation sidebar to view records or sign documents.</p>
      </div>
    );
  };

  if (!isAuthenticated) return <LoginScreen onLogin={(role, email) => { setCurrentUser({ role, email }); setIsAuthenticated(true); }} />;

  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      <AdminLayout
        sidebar={<SidebarContent />}
        listPanel={<ListPanelContent />}
        detailPanel={<DetailPanelContent />}
        onLogout={() => { setIsAuthenticated(false); setCurrentUser(null); setSelectedChildId(null); setSelectedStaffId(null); setActiveSection('DAILY_OPS'); }}
        onGoHome={() => setActiveSection('DAILY_OPS')}
      />
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl font-bold text-white z-50 animate-in slide-in-from-bottom-8 ${toast.type === 'success' ? 'bg-gray-900/90' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}
    </>
  );
};

export default App;
