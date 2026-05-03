import { User, Report, Task, AttendanceRecord, ChatMessage, LogEntry } from './types';

export const initialUsers: User[] = [
  {
    id: '1',
    name: 'Mustafa K.',
    email: 'mustafakhojali884@gmail.com',
    phone: '+249912345678',
    role: 'owner',
    password: 'mus2003kh',
    deviceFingerprint: 'mock_fingerprint_owner',
    deviceInfo: 'Chrome / Windows (Owner Device)',
    firstLoginDate: '2026-01-01',
    rating: 5,
    permissions: {
      sendReports: true,
      sendAlerts: true,
      accessBuildings: true,
      chat: true,
      recordAttendance: true,
      viewReports: true
    }
  },
  {
    id: '2',
    name: 'Ahmed Supervisor',
    email: 'ahmed.sup@qa.com',
    phone: '+249111222333',
    role: 'supervisor',
    password: '123',
    deviceFingerprint: 'mock_fingerprint_sup1',
    deviceInfo: 'Safari / iPhone',
    firstLoginDate: '2026-01-02',
    rating: 4.5,
    permissions: {
      sendReports: true,
      sendAlerts: true,
      accessBuildings: true,
      chat: true,
      recordAttendance: true,
      viewReports: true
    }
  },
  {
    id: '3',
    name: 'Ali Guard',
    email: 'ali.guard@qa.com',
    phone: '+249111222555',
    securityId: 'SEC-001',
    shift: 'morning',
    role: 'guard',
    password: '123',
    deviceFingerprint: 'mock_fingerprint_g1',
    deviceInfo: 'Firefox / Android',
    firstLoginDate: '2026-01-03',
    rating: 4.5,
    permissions: {
      sendReports: true,
      sendAlerts: true,
      accessBuildings: true,
      chat: true,
      recordAttendance: true,
      viewReports: true
    }
  }
];

export const initialReports: Report[] = [
  {
    id: '1',
    buildingId: '1',
    buildingNameEn: 'GATE 1',
    buildingNameAr: 'البوابة 1',
    guardId: '3',
    guardName: 'Ali Guard',
    qrCodeScan: true,
    gps: { lat: 15.5007, lng: 32.5599 },
    note: 'كل شيء طبيعي ولا توجد أي ملاحظات أمنية.',
    status: 'normal',
    createdAt: '2026-02-10T10:00:00Z',
  }
];

export const initialTasks: Task[] = [
  {
    id: '1',
    title: 'تفتيش سور المبنى 2',
    description: 'تفقد السور بالكامل من الجهة الغربية والتأكد من عدم وجود اختراقات.',
    assignedTo: '3',
    dueDate: '2026-02-12T15:00',
    status: 'pending',
    createdAt: '2026-02-10T09:00:00Z',
  }
];

export const initialAttendance: AttendanceRecord[] = [
  {
    id: '1',
    guardId: '3',
    guardName: 'Ali Guard',
    shift: 'morning',
    checkIn: '08:00',
    status: 'present',
    date: '2026-02-10',
  }
];

export const initialChatMessages: ChatMessage[] = [];
export const initialLogs: LogEntry[] = [];
