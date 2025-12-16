import React, { useState, useEffect } from 'react';
import { AdminLayout } from './layouts/AdminLayout';
import { NestCard } from './components/NestCard';
import { ActivityFeedItem } from './components/ActivityFeedItem';
import { Child, Activity, ActivityType, Guardian, Invoice, Classroom } from './types';

// --- MOCK DATA ---

const CENTERS = [
  { id: 'c1', name: 'Sunny Vale Academy' },
  { id: 'c2', name: 'North Hills Campus' },
];

const INITIAL_CLASSROOMS: Classroom[] = [
  { id: 'infants', name: '👶 Infants', enrolled: 12, capacity: 15, staff: [] },
  { id: 'toddlers', name: '🧸 Toddlers 1A', enrolled: 18, capacity: 20, staff: [] },
  { id: 'preschool', name: '🎨 Preschool', enrolled: 22, capacity: 24, staff: [] },
];

const INITIAL_CHILDREN: Child[] = [
  // Toddlers
  { 
    id: '1', 
    firstName: 'Leo', 
    lastName: 'Dasher', 
    avatarUrl: 'https://picsum.photos/200/200?random=1', 
    classroom: 'Toddlers 1A', 
    classroomId: 'toddlers', 
    status: 'PRESENT', 
    lastActivityTime: '10m ago', 
    allergies: ['Peanuts'], 
    dob: '2020-05-12',
    notes: 'Leo loves building blocks and outdoor play. Please ensure sunscreen is applied before going outside.'
  },
  { id: '2', firstName: 'Mia', lastName: 'Wong', avatarUrl: 'https://picsum.photos/200/200?random=2', classroom: 'Toddlers 1A', classroomId: 'toddlers', status: 'PRESENT', lastActivityTime: '15m ago', dob: '2020-08-22', notes: 'Mia naps best with her favorite blanket.' },
  { id: '3', firstName: 'Noah', lastName: 'Smith', avatarUrl: 'https://picsum.photos/200/200?random=3', classroom: 'Toddlers 1A', classroomId: 'toddlers', status: 'ABSENT', dob: '2020-04-10', notes: 'Allergic to bees (Epipen in bag).' },
  // Infants
  { id: '4', firstName: 'Ava', lastName: 'Jones', avatarUrl: 'https://picsum.photos/200/200?random=4', classroom: 'Infants', classroomId: 'infants', status: 'PRESENT', lastActivityTime: '1h ago', dob: '2022-01-15', notes: 'Needs bottle every 3 hours.' },
  { id: '5', firstName: 'Lucas', lastName: 'Brown', avatarUrl: 'https://picsum.photos/200/200?random=5', classroom: 'Infants', classroomId: 'infants', status: 'PRESENT', lastActivityTime: 'Just now', dob: '2022-03-30', notes: '' },
  // Preschool
  { id: '6', firstName: 'Emma', lastName: 'Davis', avatarUrl: 'https://picsum.photos/200/200?random=6', classroom: 'Preschool', classroomId: 'preschool', status: 'PRESENT', lastActivityTime: '2h ago', dob: '2019-11-05', notes: 'Loves painting and drawing.' },
];

const MOCK_ACTIVITIES: Activity[] = [
  { 
    id: 'a1', 
    childId: '1', 
    type: ActivityType.PHOTO, 
    title: 'Art Time Fun!', 
    description: 'Leo loved painting with the new watercolors today.',
    mediaUrl: 'https://picsum.photos/600/400?random=10', 
    timestamp: '10:30 AM', 
    authorName: 'Mr. T' 
  },
  { 
    id: 'a2', 
    childId: '1', 
    type: ActivityType.MEAL, 
    title: 'Lunch', 
    description: 'Ate all the carrots, left the peas.', 
    timestamp: '12:15 PM', 
    authorName: 'Ms. Sarah' 
  },
  { 
    id: 'a3', 
    childId: '1', 
    type: ActivityType.NAP, 
    title: 'Nap Started', 
    timestamp: '1:00 PM', 
    authorName: 'Ms. Sarah' 
  },
  { 
    id: 'a4', 
    childId: '4', 
    type: ActivityType.NAP, 
    title: 'Morning Nap', 
    timestamp: '9:00 AM', 
    authorName: 'Mrs. P' 
  },
];

const INITIAL_GUARDIANS: Record<string, Guardian[]> = {
  '1': [
    { id: 'g1', name: 'Sarah Dasher', relation: 'Mother', phone: '555-0101', email: 'sarah@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=g1' },
    { id: 'g2', name: 'Mike Dasher', relation: 'Father', phone: '555-0102', email: 'mike@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=g2' },
  ]
};

const INITIAL_INVOICES: Record<string, Invoice[]> = {
  '1': [
    { id: 'inv1', title: 'October Tuition', amount: '$1,200.00', status: 'PAID', date: 'Oct 1, 2023' },
    { id: 'inv2', title: 'November Tuition', amount: '$1,200.00', status: 'PENDING', date: 'Nov 1, 2023' },
  ],
  '2': [
    { id: 'inv3', title: 'November Tuition', amount: '$1,150.00', status: 'PAID', date: 'Nov 1, 2023' },
  ],
  '3': [
    { id: 'inv4', title: 'September Tuition', amount: '$1,200.00', status: 'OVERDUE', date: 'Sep 1, 2023' },
    { id: 'inv5', title: 'October Tuition', amount: '$1,200.00', status: 'OVERDUE', date: 'Oct 1, 2023' },
    { id: 'inv6', title: 'November Tuition', amount: '$1,200.00', status: 'PENDING', date: 'Nov 1, 2023' },
  ],
  '4': [
    { id: 'inv7', title: 'Registration Fee', amount: '$150.00', status: 'PAID', date: 'Jan 15, 2023' },
    { id: 'inv8', title: 'November Tuition (Pro-rated)', amount: '$600.00', status: 'PAID', date: 'Nov 1, 2023' },
  ]
};

type DetailTab = 'TIMELINE' | 'PROFILE' | 'GUARDIANS' | 'BILLING';

// --- LOGIN COMPONENT ---

const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('TEACHER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp) {
        // Sign Up Simulation
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            setIsLoading(false);
            return;
        }

        setTimeout(() => {
            setIsLoading(false);
            setSignUpSuccess(true);
            // In a real app, this is where backend would trigger email
        }, 1500);
    } else {
        // Login Simulation
        setTimeout(() => {
            setIsLoading(false);
            onLogin();
        }, 1000);
    }
  };

  const handleSwitchMode = () => {
      setIsSignUp(!isSignUp);
      setSignUpSuccess(false);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
  };

  if (signUpSuccess) {
      return (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center relative overflow-hidden">
            <div className="bg-white/90 backdrop-blur-md p-8 md:p-12 rounded-nest shadow-2xl w-full max-w-md z-10 border border-white text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                    📧
                </div>
                <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">Check your inbox!</h2>
                <p className="text-gray-500 mb-8">
                    We've sent a confirmation link to <span className="font-bold text-gray-700">{email}</span>. 
                    Please verify your email to activate your account.
                </p>
                <button 
                    onClick={() => {
                        setSignUpSuccess(false);
                        setIsSignUp(false); // Go to login
                    }}
                    className="w-full py-3 bg-primary-400 hover:bg-primary-500 text-white font-display font-bold rounded-xl shadow-lg shadow-primary-200/50 transition-all"
                >
                    Back to Sign In
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[40%] left-[30%] w-[20%] h-[20%] bg-primary-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>

      <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-nest shadow-2xl w-full max-w-md z-10 border border-white relative overflow-hidden transition-all duration-500">
         {/* Top Accent Line */}
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-300 to-accent-300"></div>

         <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-primary-500 mb-2 tracking-tight">NestFlow</h1>
            <p className="text-gray-500 font-medium">
                {isSignUp ? "Join our flock today." : "Childcare managed with care."}
            </p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            
            {isSignUp && (
                <div className="space-y-1 animate-in slide-in-from-top-4 fade-in duration-300">
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                   <input 
                     type="text" 
                     required
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value)}
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all shadow-sm"
                     placeholder="Ms. Frizzle"
                   />
                </div>
            )}

            <div className="space-y-1">
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
               <input 
                 type="email" 
                 required
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all shadow-sm"
                 placeholder="teacher@nestflow.app"
               />
            </div>

            <div className="space-y-1">
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Password</label>
               <input 
                 type="password" 
                 required
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all shadow-sm"
                 placeholder="••••••••"
               />
            </div>

            {isSignUp && (
                <>
                    <div className="space-y-1 animate-in slide-in-from-top-4 fade-in duration-300 delay-100">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Confirm Password</label>
                        <input 
                            type="password" 
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all shadow-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <div className="space-y-1 animate-in slide-in-from-top-4 fade-in duration-300 delay-150">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">I am a...</label>
                        <div className="flex gap-2">
                            {['TEACHER', 'ADMIN', 'PARENT'].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                                        role === r 
                                        ? 'bg-primary-100 border-primary-300 text-primary-600' 
                                        : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-primary-400 hover:bg-primary-500 text-white font-display font-bold text-lg rounded-xl shadow-lg shadow-primary-200/50 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mt-6"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
         </form>

         <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <button 
                    onClick={handleSwitchMode} 
                    className="text-primary-500 hover:text-primary-600 font-bold ml-1 hover:underline transition-all"
                >
                    {isSignUp ? "Sign In" : "Sign Up"}
                </button>
            </p>
         </div>
         
         <div className="mt-8 text-center text-xs text-gray-300">
           Protected by 256-bit Blob Encryption
         </div>
      </div>
    </div>
  );
};

// --- APP COMPONENT ---

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Toast Notification State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Center State
  const [selectedCenterId, setSelectedCenterId] = useState<string>('c1');

  // Data State
  const [classrooms, setClassrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
  const [children, setChildren] = useState<Child[]>(INITIAL_CHILDREN);
  const [guardiansMap, setGuardiansMap] = useState<Record<string, Guardian[]>>(INITIAL_GUARDIANS);
  const [invoicesMap, setInvoicesMap] = useState<Record<string, Invoice[]>>(INITIAL_INVOICES);
  
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('toddlers');
  const [selectedChildId, setSelectedChildId] = useState<string | null>('1');
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('TIMELINE');
  
  // Add Classroom State
  const [isAddingClassroom, setIsAddingClassroom] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState('');

  // Edit Mode State (Full Profile)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Child>>({});

  // Inline Notes Edit State
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesBuffer, setNotesBuffer] = useState('');

  // Add Guardian State
  const [isAddingGuardian, setIsAddingGuardian] = useState(false);
  const [newGuardianData, setNewGuardianData] = useState<Partial<Guardian>>({});

  // Payment Processing State
  const [processingInvoiceId, setProcessingInvoiceId] = useState<string | null>(null);

  // Health Analytics Modal State
  const [isHealthAnalyticsOpen, setIsHealthAnalyticsOpen] = useState(false);

  // Derived State
  const filteredChildren = children.filter(c => c.classroomId === selectedClassroomId);
  const selectedChild = children.find(c => c.id === selectedChildId);
  const currentClassroom = classrooms.find(c => c.id === selectedClassroomId);

  // Helper function to parse money string to number
  const parseMoney = (str: string) => parseFloat(str.replace(/[^0-9.-]+/g,""));

  // Calculate Real-time Metrics
  const calculateMetrics = () => {
      const totalChildren = children.length;
      const present = children.filter(c => c.status === 'PRESENT').length;
      const absent = children.filter(c => c.status === 'ABSENT').length;
      const checkedOut = children.filter(c => c.status === 'CHECKED_OUT').length;
      
      const totalCapacity = classrooms.reduce((acc, room) => acc + room.capacity, 0);
      
      // Billing Calculation
      const allInvoices = Object.values(invoicesMap).flat() as Invoice[];
      const totalRevenue = allInvoices
          .filter(i => i.status === 'PAID')
          .reduce((acc, i) => acc + parseMoney(i.amount), 0);
      const pendingRevenue = allInvoices
          .filter(i => i.status === 'PENDING')
          .reduce((acc, i) => acc + parseMoney(i.amount), 0);
      const overdueRevenue = allInvoices
          .filter(i => i.status === 'OVERDUE')
          .reduce((acc, i) => acc + parseMoney(i.amount), 0);

      return {
          attendance: { 
              total: totalChildren, 
              present, 
              absent, 
              checkedOut, 
              rate: totalChildren ? Math.round((present / totalChildren) * 100) : 0 
          },
          capacity: { 
              total: totalCapacity, 
              enrolled: totalChildren, 
              utilization: totalCapacity ? Math.round((totalChildren / totalCapacity) * 100) : 0 
          },
          billing: { 
              totalRevenue, 
              pendingRevenue, 
              overdueRevenue 
          },
          classrooms: classrooms.map(room => {
               const roomChildren = children.filter(c => c.classroomId === room.id);
               const roomPresent = roomChildren.filter(c => c.status === 'PRESENT').length;
               return { 
                   ...room, 
                   actualEnrolled: roomChildren.length, 
                   presentCount: roomPresent,
                   utilization: Math.round((roomChildren.length / room.capacity) * 100)
               };
          })
      };
  }

  const metrics = calculateMetrics();

  // Effects
  useEffect(() => {
    // Reset editing states when switching children
    setIsEditingProfile(false);
    setIsEditingNotes(false);
    setIsAddingGuardian(false);
    setNewGuardianData({});
    setProcessingInvoiceId(null);
  }, [selectedChildId]);

  // --- Handlers ---

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleSaveClassroom = () => {
    if (newClassroomName.trim()) {
      const newId = `room_${Date.now()}`;
      const newClassroom: Classroom = {
        id: newId,
        name: newClassroomName.trim(),
        enrolled: 0,
        capacity: 15, // Default capacity
        staff: []
      };
      
      setClassrooms(prev => [...prev, newClassroom]);
      setSelectedClassroomId(newId);
      setSelectedChildId(null);
      
      // Reset state
      setIsAddingClassroom(false);
      setNewClassroomName('');
    }
  };

  const handleQuickAdd = () => {
    if (!currentClassroom) return;
    
    const newChild: Child = {
      id: `new_${Date.now()}`,
      firstName: 'New',
      lastName: 'Student',
      avatarUrl: `https://api.dicebear.com/7.x/micah/svg?seed=${Date.now()}&backgroundColor=b6e3f4`,
      classroom: currentClassroom.name.replace(/^[^\s]+\s/, ''), // Remove emoji
      classroomId: currentClassroom.id,
      status: 'ABSENT',
      dob: '',
      notes: '',
      allergies: [],
    };

    setChildren(prev => [newChild, ...prev]);
    setSelectedChildId(newChild.id);
    setActiveDetailTab('PROFILE'); // Switch to profile tab immediately
    setEditFormData(newChild); // Pre-fill form
    setIsEditingProfile(true); // Enter edit mode immediately
  };

  const handleCheckIn = () => {
    // Check in all absent children in the current classroom
    let count = 0;
    const updatedChildren = children.map(child => {
      if (child.classroomId === selectedClassroomId && child.status === 'ABSENT') {
        count++;
        return { ...child, status: 'PRESENT', lastActivityTime: 'Just now' };
      }
      return child;
    });

    if (count > 0) {
      setChildren(updatedChildren as Child[]);
      alert(`Checked in ${count} children to ${currentClassroom?.name}!`);
    } else {
      alert(`Everyone in ${currentClassroom?.name} is already checked in.`);
    }
  };

  const handleChildStatusChange = (status: 'PRESENT' | 'ABSENT' | 'CHECKED_OUT') => {
    if (!selectedChild) return;
    
    // Add confirmation before checking out
    if (status === 'CHECKED_OUT') {
      const confirmed = window.confirm(`Are you sure you want to check out ${selectedChild.firstName}?`);
      if (!confirmed) return;
    }

    setChildren(prev => prev.map(c => 
        c.id === selectedChild.id ? { ...c, status: status, lastActivityTime: 'Just now' } : c
    ));
  };

  // Full Profile Edit Handlers
  const handleEditProfile = () => {
    if (selectedChild) {
      setEditFormData({ ...selectedChild });
      setIsEditingProfile(true);
      setIsEditingNotes(false); // Close inline notes if open
    }
  };

  const handleSaveProfile = () => {
    if (!selectedChild) return;

    const updatedChildren = children.map(c => 
      c.id === selectedChild.id ? { ...c, ...editFormData } as Child : c
    );
    setChildren(updatedChildren);
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Inline Notes Edit Handlers
  const handleStartEditNotes = () => {
    if (selectedChild) {
      setNotesBuffer(selectedChild.notes || '');
      setIsEditingNotes(true);
    }
  };

  const handleSaveNotes = () => {
    if (!selectedChild) return;
    const updatedChildren = children.map(c => 
      c.id === selectedChild.id ? { ...c, notes: notesBuffer } : c
    );
    setChildren(updatedChildren);
    setIsEditingNotes(false);
  };

  // Add Guardian Handlers
  const handleSaveGuardian = () => {
    if (!selectedChild || !newGuardianData.name || !newGuardianData.relation) return;

    const newGuardian: Guardian = {
      id: `g_${Date.now()}`,
      name: newGuardianData.name || 'Unknown',
      relation: newGuardianData.relation || 'Guardian',
      phone: newGuardianData.phone || '',
      email: newGuardianData.email || '',
      avatarUrl: `https://ui-avatars.com/api/?name=${newGuardianData.name}&background=random&color=fff`,
    };

    setGuardiansMap(prev => ({
      ...prev,
      [selectedChild.id]: [...(prev[selectedChild.id] || []), newGuardian]
    }));

    setIsAddingGuardian(false);
    setNewGuardianData({});
  };

  const handleCancelGuardian = () => {
    setIsAddingGuardian(false);
    setNewGuardianData({});
  };

  // Payment Handler
  const handlePayInvoice = (invoiceId: string) => {
    if (!selectedChild) return;

    setProcessingInvoiceId(invoiceId);

    // Simulate API Network Delay
    setTimeout(() => {
        setInvoicesMap(prev => {
            const childInvoices = prev[selectedChild.id] || [];
            return {
                ...prev,
                [selectedChild.id]: childInvoices.map(inv => 
                    inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv
                )
            };
        });
        setProcessingInvoiceId(null);
        
        // Show Success Toast
        setToast({ message: 'Payment successful! Invoice marked as PAID.', type: 'success' });
        setTimeout(() => setToast(null), 3000);
    }, 1500);
  };

  // --- Components ---

  const SidebarContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2">Centers</h3>
        <div className="space-y-1">
          {CENTERS.map(center => (
            <div 
                key={center.id}
                onClick={() => {
                    setSelectedCenterId(center.id);
                    setToast({ message: `Switched to ${center.name}`, type: 'success' });
                    setTimeout(() => setToast(null), 2000);
                }}
                className={`px-3 py-2 rounded-lg font-medium text-sm cursor-pointer transition-colors ${
                    selectedCenterId === center.id
                    ? 'bg-primary-100 text-primary-500 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
                {center.name}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-3 pl-2 pr-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Classrooms</h3>
            {!isAddingClassroom && (
              <button
                  onClick={() => setIsAddingClassroom(true)}
                  className="text-xs text-primary-400 hover:text-primary-600 font-bold px-2 py-1 hover:bg-primary-50 rounded transition-colors"
                  title="Add New Classroom"
              >
                  + Add
              </button>
            )}
        </div>
        
        {isAddingClassroom && (
          <div className="mx-2 mb-3 bg-white p-3 rounded-lg border border-primary-200 shadow-sm animate-fade-in">
            <input 
              type="text" 
              value={newClassroomName}
              onChange={(e) => setNewClassroomName(e.target.value)}
              placeholder="Room Name (e.g. 🦁 Lions)"
              className="w-full text-sm border border-gray-300 rounded p-1.5 mb-2 focus:ring-2 focus:ring-primary-300 focus:outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setIsAddingClassroom(false);
                  setNewClassroomName('');
                }}
                className="text-[10px] font-bold text-gray-500 hover:text-gray-700 px-2 py-1"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveClassroom}
                disabled={!newClassroomName.trim()}
                className="text-[10px] font-bold bg-primary-400 text-white px-3 py-1 rounded hover:bg-primary-500 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {classrooms.map(room => {
            const isActive = room.id === selectedClassroomId;
            const enrolledInRoom = children.filter(c => c.classroomId === room.id).length;
            
            return (
              <div 
                key={room.id}
                onClick={() => {
                  setSelectedClassroomId(room.id);
                  setSelectedChildId(null); // Deselect child when changing rooms
                }}
                className={`
                  flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200
                  ${isActive 
                    ? 'bg-white border border-gray-100 shadow-sm text-gray-900 font-bold' 
                    : 'text-gray-600 hover:bg-gray-50 font-medium border border-transparent'}
                `}
              >
                <span className="truncate max-w-[140px]">{room.name}</span>
                <span className={`
                  text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0
                  ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                `}>
                  {enrolledInRoom}/{room.capacity}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Control Center Widget - Now Clickable & Dynamic */}
      <div 
        onClick={() => setIsHealthAnalyticsOpen(true)}
        className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-white hover:shadow-md transition-all group"
      >
        <div className="flex justify-between items-start mb-2">
            <h4 className="text-xs font-bold text-gray-500">Center Health</h4>
            <span className="text-[10px] font-bold bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">View Analytics</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-2xl font-display font-bold text-gray-800 group-hover:text-primary-500 transition-colors">
                {metrics.attendance.rate}%
            </div>
            <div className="text-[10px] text-gray-400 flex items-center gap-1">
                Attendance 
                <span className={metrics.attendance.rate > 85 ? 'text-green-500' : 'text-orange-500'}>
                    {metrics.attendance.rate > 85 ? '▲ Good' : '▼ Low'}
                </span>
            </div>
          </div>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs ${metrics.attendance.rate > 85 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
             {metrics.attendance.rate > 85 ? '👍' : '⚠️'}
          </div>
        </div>
      </div>
    </div>
  );

  const ListPanelContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {filteredChildren.length} Children
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {filteredChildren.map(child => (
          <NestCard 
            key={child.id} 
            child={child} 
            selected={selectedChildId === child.id}
            onClick={() => setSelectedChildId(child.id)}
          />
        ))}
        {filteredChildren.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">🍃</div>
            <p>No children in this room yet.</p>
            <p className="text-xs mt-2">Use "Quick Add" to enroll someone.</p>
          </div>
        )}
      </div>
    </div>
  );

  const DetailPanelContent = () => {
    if (!selectedChild) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl">
            👋
          </div>
          <h3 className="text-lg font-bold text-gray-600">Welcome to {currentClassroom?.name}</h3>
          <p className="text-sm mt-2">Select a child from the list to view their nest.</p>
        </div>
      );
    }

    const childActivities = MOCK_ACTIVITIES.filter(a => a.childId === selectedChild.id);
    const guardians = guardiansMap[selectedChild.id] || [];
    const invoices = invoicesMap[selectedChild.id] || [];

    const tabs: {id: DetailTab, label: string}[] = [
      { id: 'TIMELINE', label: 'Timeline' },
      { id: 'PROFILE', label: 'Profile' },
      { id: 'GUARDIANS', label: `Guardians (${guardians.length})` },
      { id: 'BILLING', label: 'Billing' },
    ];

    // Helper to calculate balance
    const calculateBalance = () => {
        return invoices.reduce((acc, inv) => {
            if (inv.status === 'PENDING' || inv.status === 'OVERDUE') {
                const amount = parseFloat(inv.amount.replace(/[^0-9.-]+/g,""));
                return acc + amount;
            }
            return acc;
        }, 0);
    };

    return (
      <div className="flex flex-col h-full">
        {/* Child Header - Sticky */}
        <div className="bg-white shrink-0 z-20">
            <div className="h-40 bg-primary-100 relative overflow-hidden group">
                {/* Decorative Background Patterns */}
                <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[200%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <img 
                    src={`https://picsum.photos/800/400?random=${selectedChild.id}`} 
                    className="w-full h-full object-cover opacity-40 mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                    alt="Cover"
                />
                <div className="absolute -bottom-10 left-6">
                    <img 
                    src={selectedChild.avatarUrl} 
                    className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                    alt={selectedChild.firstName}
                    />
                </div>
            </div>
            
            <div className="mt-12 px-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 group">
                            <h2 className="text-2xl font-display font-bold text-gray-800">{selectedChild.firstName} {selectedChild.lastName}</h2>
                            <button 
                                onClick={() => {
                                    setActiveDetailTab('PROFILE');
                                    handleEditProfile();
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold bg-gray-100 hover:bg-primary-100 text-gray-600 hover:text-primary-600 px-2 py-1 rounded-lg"
                                title="Edit Profile"
                            >
                                Edit
                            </button>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">{selectedChild.classroom}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            selectedChild.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 
                            selectedChild.status === 'CHECKED_OUT' ? 'bg-orange-100 text-orange-600' : 
                            'bg-gray-100 text-gray-500'
                        }`}>
                            {selectedChild.status === 'CHECKED_OUT' ? 'GONE HOME' : selectedChild.status}
                        </span>
                        
                        {selectedChild.status === 'PRESENT' ? (
                            <button 
                                onClick={() => handleChildStatusChange('CHECKED_OUT')}
                                className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                            >
                                Check Out
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleChildStatusChange('PRESENT')}
                                className="bg-green-50 text-green-600 border border-green-100 hover:bg-green-100 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                            >
                                Check In
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-6 border-b border-gray-100">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveDetailTab(tab.id)}
                            className={`
                                px-4 py-3 text-sm font-bold relative transition-colors
                                ${activeDetailTab === tab.id ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'}
                            `}
                        >
                            {tab.label}
                            {activeDetailTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-300 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-white relative">
            {activeDetailTab === 'TIMELINE' && (
                <div className="px-6 py-6">
                    {childActivities.length > 0 ? (
                        childActivities.map(act => (
                            <ActivityFeedItem key={act.id} activity={act} />
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            <p>No activity recorded today.</p>
                        </div>
                    )}
                </div>
            )}

            {activeDetailTab === 'PROFILE' && (
                <div className="p-6 space-y-6">
                    {isEditingProfile ? (
                       // --- FULL PROFILE EDIT MODE ---
                       <div className="space-y-6">
                         {/* Image Upload Section */}
                         <div className="flex flex-col items-center justify-center py-4">
                            <div className="relative group w-24 h-24">
                                <img 
                                    src={editFormData.avatarUrl || selectedChild.avatarUrl} 
                                    alt="Profile Preview" 
                                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                                />
                                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-white text-xs font-bold">📷 Edit</span>
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2 font-medium">Click to upload new photo</p>
                         </div>

                         <div className="bg-surface-50 p-5 rounded-2xl border border-primary-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-display font-bold text-gray-800">Edit Basic Info</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1">First Name</label>
                                    <input 
                                        type="text" 
                                        value={editFormData.firstName || ''}
                                        onChange={e => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1">Last Name</label>
                                    <input 
                                        type="text" 
                                        value={editFormData.lastName || ''}
                                        onChange={e => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        value={editFormData.dob || ''}
                                        onChange={e => setEditFormData(prev => ({ ...prev, dob: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1">Allergies (comma sep)</label>
                                    <input 
                                        type="text" 
                                        value={editFormData.allergies?.join(', ') || ''}
                                        onChange={e => setEditFormData(prev => ({ ...prev, allergies: e.target.value.split(',').map(s => s.trim()) }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
                                    />
                                </div>
                            </div>
                         </div>
                         
                         <div className="bg-surface-50 p-5 rounded-2xl border border-primary-200 shadow-sm">
                             <h4 className="font-display font-bold text-gray-800 mb-2">Notes</h4>
                             <textarea 
                                rows={4}
                                value={editFormData.notes || ''}
                                onChange={e => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
                             />
                         </div>

                         <div className="flex justify-end gap-3 pt-4">
                             <button 
                                onClick={handleCancelEdit}
                                className="px-5 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors"
                             >
                                 Cancel
                             </button>
                             <button 
                                onClick={handleSaveProfile}
                                className="px-5 py-2 rounded-xl bg-primary-400 text-white font-bold hover:bg-primary-500 shadow-md transition-all active:scale-95"
                             >
                                 Save Changes
                             </button>
                         </div>
                       </div>
                    ) : (
                        // --- VIEW MODE ---
                        <div className="space-y-6 relative">
                            <button 
                                onClick={handleEditProfile}
                                className="absolute top-0 right-0 text-primary-400 hover:text-primary-500 text-sm font-bold flex items-center gap-1"
                            >
                                ✏️ Edit Profile
                            </button>
                            
                            <div className="bg-surface-50 p-5 rounded-2xl border border-gray-100">
                                <h4 className="font-display font-bold text-gray-800 mb-4">Basic Info</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-400 mb-1">Date of Birth</p>
                                        <p className="font-medium text-gray-700">{selectedChild.dob || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-1">Age</p>
                                        <p className="font-medium text-gray-700">3 Years</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-1">Allergies</p>
                                        {selectedChild.allergies && selectedChild.allergies.length > 0 ? (
                                            <span className="inline-block bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">
                                                {selectedChild.allergies.join(', ')}
                                            </span>
                                        ) : (
                                            <p className="text-gray-500">None</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface-50 p-5 rounded-2xl border border-gray-100 relative group">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-display font-bold text-gray-800">Notes</h4>
                                    {!isEditingNotes && (
                                        <button 
                                            onClick={handleStartEditNotes}
                                            className="text-gray-400 hover:text-primary-500 transition-colors"
                                            title="Quick Edit Notes"
                                        >
                                            ✏️
                                        </button>
                                    )}
                                </div>
                                
                                {isEditingNotes ? (
                                    <div className="space-y-3">
                                        <textarea
                                            value={notesBuffer}
                                            onChange={(e) => setNotesBuffer(e.target.value)}
                                            rows={4}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm bg-white"
                                            placeholder="Add notes about the child..."
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => setIsEditingNotes(false)}
                                                className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={handleSaveNotes}
                                                className="text-xs font-bold bg-primary-400 text-white px-3 py-1.5 rounded-lg hover:bg-primary-500 shadow-sm"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600 leading-relaxed min-h-[40px] cursor-pointer hover:bg-white/50 rounded-lg p-1 transition-colors -ml-1" onClick={handleStartEditNotes}>
                                        {selectedChild.notes || <span className="text-gray-400 italic">No notes available. Click pencil to add.</span>}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeDetailTab === 'GUARDIANS' && (
                <div className="p-6 space-y-4">
                    {guardians.length > 0 ? guardians.map(guardian => (
                        <div key={guardian.id} className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                            <img src={guardian.avatarUrl} alt={guardian.name} className="w-12 h-12 rounded-full object-cover" />
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800">{guardian.name}</h4>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{guardian.relation}</p>
                                <div className="text-xs text-gray-400 mt-1 space-x-2">
                                    {guardian.phone && <span>📞 {guardian.phone}</span>}
                                    {guardian.email && <span>✉️ {guardian.email}</span>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center hover:bg-primary-200">
                                    📞
                                </button>
                                <button className="w-8 h-8 rounded-full bg-accent-300 text-white flex items-center justify-center hover:bg-accent-400">
                                    ✉️
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-gray-400 py-8">No guardian info available.</div>
                    )}
                    
                    {isAddingGuardian ? (
                        <div className="bg-surface-50 border border-primary-200 rounded-2xl p-4 shadow-sm animate-fade-in">
                            <h4 className="font-bold text-gray-800 mb-3 text-sm">Add New Pickup Contact</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Name *</label>
                                        <input 
                                            type="text"
                                            value={newGuardianData.name || ''}
                                            onChange={e => setNewGuardianData(prev => ({...prev, name: e.target.value}))}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-300 focus:outline-none"
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Relation *</label>
                                        <input 
                                            type="text"
                                            value={newGuardianData.relation || ''}
                                            onChange={e => setNewGuardianData(prev => ({...prev, relation: e.target.value}))}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-300 focus:outline-none"
                                            placeholder="Grandmother"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Phone</label>
                                        <input 
                                            type="tel"
                                            value={newGuardianData.phone || ''}
                                            onChange={e => setNewGuardianData(prev => ({...prev, phone: e.target.value}))}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-300 focus:outline-none"
                                            placeholder="555-0123"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Email</label>
                                        <input 
                                            type="email"
                                            value={newGuardianData.email || ''}
                                            onChange={e => setNewGuardianData(prev => ({...prev, email: e.target.value}))}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-300 focus:outline-none"
                                            placeholder="jane@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button 
                                        onClick={handleCancelGuardian}
                                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSaveGuardian}
                                        disabled={!newGuardianData.name || !newGuardianData.relation}
                                        className="px-4 py-2 bg-primary-400 text-white rounded-lg text-xs font-bold hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Save Contact
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsAddingGuardian(true)}
                            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-primary-300 hover:text-primary-400 transition-colors"
                        >
                            + Add Authorized Pickup
                        </button>
                    )}
                </div>
            )}

            {activeDetailTab === 'BILLING' && (
                <div className="p-6">
                    <div className="bg-primary-50 p-6 rounded-2xl mb-6 text-center">
                        <p className="text-primary-400 text-sm font-bold uppercase tracking-widest mb-1">Current Balance</p>
                        <p className={`text-3xl font-display font-bold ${calculateBalance() > 0 ? 'text-accent-400' : 'text-primary-500'}`}>
                            ${calculateBalance().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        {calculateBalance() > 0 ? (
                            <p className="text-xs text-accent-400 mt-2 font-medium">Action Required</p>
                        ) : (
                            <p className="text-xs text-primary-400 mt-2">All caught up! 🎉</p>
                        )}
                    </div>

                    <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Invoice History</h4>
                    <div className="space-y-3">
                        {invoices.length > 0 ? invoices.map(inv => (
                            <div key={inv.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
                                <div>
                                    <p className="font-bold text-gray-800">{inv.title}</p>
                                    <p className="text-xs text-gray-400">{inv.date}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <p className="font-mono font-bold text-gray-700">{inv.amount}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                            inv.status === 'PAID' 
                                            ? 'bg-green-100 text-green-600' 
                                            : inv.status === 'OVERDUE' 
                                                ? 'bg-red-100 text-red-600' 
                                                : 'bg-orange-100 text-orange-500'
                                        }`}>
                                            {inv.status}
                                        </span>
                                        {inv.status !== 'PAID' && (
                                            <button 
                                                onClick={() => handlePayInvoice(inv.id)}
                                                disabled={processingInvoiceId === inv.id}
                                                className={`text-[10px] font-bold px-3 py-1 rounded transition-colors ${
                                                    processingInvoiceId === inv.id 
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                    : 'bg-gray-800 text-white hover:bg-gray-700'
                                                }`}
                                            >
                                                {processingInvoiceId === inv.id ? '...' : 'Pay'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-center text-sm">No invoices found.</p>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Sticky Action Bar (Only on Timeline) */}
        {activeDetailTab === 'TIMELINE' && (
            <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0 z-30">
            <div className="flex gap-2">
                <input 
                type="text" 
                placeholder={`Add note for ${selectedChild.firstName}...`} 
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
                />
                <button className="bg-accent-300 hover:bg-accent-400 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all hover:scale-105 font-bold text-xl">
                +
                </button>
            </div>
            </div>
        )}

        {/* --- TOAST NOTIFICATION --- */}
        {toast && (
            <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300 z-50 ${
                toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
            }`}>
                <span className="text-xl">{toast.type === 'success' ? '✅' : '❌'}</span>
                <span className="font-bold">{toast.message}</span>
            </div>
        )}

      </div>
    );
  }

  // --- CONDITIONAL RENDER ---

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
        <AdminLayout
        sidebar={<SidebarContent />}
        listPanel={<ListPanelContent />}
        detailPanel={<DetailPanelContent />}
        onCheckIn={handleCheckIn}
        onQuickAdd={handleQuickAdd}
        onLogout={handleLogout}
        />
        
        {/* --- Health Analytics Modal --- */}
        {isHealthAnalyticsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col scale-100">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-surface-50">
                        <div>
                        <h2 className="text-2xl font-display font-bold text-gray-800">Center Health Analytics</h2>
                        <p className="text-gray-500 text-sm">Real-time performance metrics</p>
                        </div>
                        <button 
                            onClick={() => setIsHealthAnalyticsOpen(false)} 
                            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-xl font-bold transition-colors"
                        >
                            ×
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="p-8 overflow-y-auto bg-gray-50/50 flex-1 space-y-8">
                        
                        {/* 1. Attendance Overview */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Daily Attendance</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                                    <div className="text-gray-500 text-xs font-bold uppercase">Total Children</div>
                                    <div className="text-4xl font-display font-bold text-gray-800">{metrics.attendance.total}</div>
                                </div>
                                <div className="bg-green-50 p-5 rounded-2xl border border-green-100 shadow-sm flex flex-col justify-between h-32">
                                    <div className="text-green-600 text-xs font-bold uppercase">Present</div>
                                    <div className="text-4xl font-display font-bold text-green-700">{metrics.attendance.present}</div>
                                </div>
                                <div className="bg-red-50 p-5 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-between h-32">
                                    <div className="text-red-600 text-xs font-bold uppercase">Absent</div>
                                    <div className="text-4xl font-display font-bold text-red-700">{metrics.attendance.absent}</div>
                                </div>
                                <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 shadow-sm flex flex-col justify-between h-32">
                                    <div className="text-orange-600 text-xs font-bold uppercase">Gone Home</div>
                                    <div className="text-4xl font-display font-bold text-orange-700">{metrics.attendance.checkedOut}</div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Financial Health */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Financial Health</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-6 rounded-2xl border-l-4 border-green-400 shadow-sm">
                                    <div className="text-gray-400 text-xs font-bold uppercase mb-1">Collected Revenue</div>
                                    <div className="text-2xl font-mono font-bold text-gray-800">
                                        ${metrics.billing.totalRevenue.toLocaleString()}
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border-l-4 border-yellow-400 shadow-sm">
                                    <div className="text-gray-400 text-xs font-bold uppercase mb-1">Pending Invoices</div>
                                    <div className="text-2xl font-mono font-bold text-gray-800">
                                        ${metrics.billing.pendingRevenue.toLocaleString()}
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border-l-4 border-red-400 shadow-sm">
                                    <div className="text-gray-400 text-xs font-bold uppercase mb-1">Overdue Amount</div>
                                    <div className="text-2xl font-mono font-bold text-red-600">
                                        ${metrics.billing.overdueRevenue.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Classroom Capacity Table */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Classroom Utilization</h3>
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Classroom</th>
                                            <th className="px-6 py-4">Enrolled</th>
                                            <th className="px-6 py-4">Present Today</th>
                                            <th className="px-6 py-4">Capacity</th>
                                            <th className="px-6 py-4">Utilization</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {metrics.classrooms.map(room => (
                                            <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-800">{room.name}</td>
                                                <td className="px-6 py-4 text-gray-600">{room.actualEnrolled}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold text-xs">
                                                        {room.presentCount}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400">{room.capacity}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full ${room.utilization > 90 ? 'bg-red-400' : 'bg-primary-400'}`} 
                                                                style={{ width: `${room.utilization}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-500">{room.utilization}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default App;