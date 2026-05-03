export type Role = 'owner' | 'supervisor' | 'guard';
export type ShiftType = 'morning' | 'night' | 'day';

export interface UserPermissions {
  sendReports: boolean;
  sendAlerts: boolean;
  accessBuildings: boolean;
  chat: boolean;
  recordAttendance: boolean;
  viewReports: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  securityId?: string;
  shift?: ShiftType;
  role: Role;
  password?: string;
  avatar?: string;
  deviceFingerprint?: string;
  deviceInfo?: string;
  firstLoginDate?: string;
  rating?: number;
  ratingComment?: string;
  hiddenFromSupervisors?: boolean;
  permissions?: UserPermissions;
}

export interface Report {
  id: string;
  buildingId: string;
  buildingNameEn: string;
  buildingNameAr: string;
  guardId: string;
  guardName: string;
  qrCodeScan: boolean;
  gps?: { lat: number; lng: number };
  image?: string;
  voiceNote?: string;
  note: string;
  status: 'normal' | 'needs_review' | 'emergency';
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Alert {
  id: string;
  type: string;
  note: string;
  senderId: string;
  senderName: string;
  toAll: boolean;
  targetUserId?: string;
  targetRole?: 'all' | 'admins' | string;
  status: 'active' | 'resolved';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // 'all' or specific user ID
  dueDate: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  guardId: string;
  guardName: string;
  shift: ShiftType;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late';
  date: string;
}

export interface LogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}
