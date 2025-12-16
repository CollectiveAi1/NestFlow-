export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT'
}

export enum ActivityType {
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
  PHOTO = 'PHOTO',
  MEAL = 'MEAL',
  NAP = 'NAP',
  INCIDENT = 'INCIDENT',
  NOTE = 'NOTE'
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  classroom: string;
  classroomId: string; // Added for filtering
  status: 'PRESENT' | 'ABSENT' | 'CHECKED_OUT';
  lastActivityTime?: string;
  allergies?: string[];
  dob?: string; // Added for profile
  notes?: string; // Added for editable profile notes
}

export interface Activity {
  id: string;
  childId: string;
  type: ActivityType;
  title: string;
  description?: string;
  mediaUrl?: string;
  timestamp: string;
  authorName: string;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  enrolled: number;
  staff: string[];
}

export interface Guardian {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  avatarUrl: string;
}

export interface Invoice {
  id: string;
  title: string;
  amount: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  date: string;
}