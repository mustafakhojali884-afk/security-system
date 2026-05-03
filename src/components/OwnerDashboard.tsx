import { useState } from 'react';
import { User, Report, Task, AttendanceRecord, ChatMessage, LogEntry, Alert } from '../types';
import { translations, buildingsList } from '../translations';
import {
  Shield,
  Search,
  LogOut,
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  FileText,
  AlertOctagon,
  Users,
  Grid,
  MessageSquare,
  Archive,
  Settings,
  ShieldAlert,
  MapPin,
  RefreshCw,
  Eye,
  EyeOff,
  Edit2,
  UserPlus,
  QrCode,
  Image,
  X
} from 'lucide-react';
import GuardsLogo from './GuardsLogo';

interface OwnerDashboardProps {
  currentUser: User;
  users: User[];
  reports: Report[];
  tasks: Task[];
  alerts: Alert[];
  attendance: AttendanceRecord[];
  chatMessages: ChatMessage[];
  logs: LogEntry[];
  lang: 'ar' | 'en';
  onLogout: () => void;
  onUpdateUsers: (updated: User[]) => void;
  onUpdateReports: (updated: Report[]) => void;
  onUpdateTasks: (updated: Task[]) => void;
  onUpdateAlerts: (updated: Alert[]) => void;
  onUpdateAttendance: (updated: AttendanceRecord[]) => void;
  onUpdateChatMessages: (updated: ChatMessage[]) => void;
  onToggleLang: () => void;
}

export default function OwnerDashboard({
  currentUser,
  users,
  reports,
  tasks,
  alerts,
  attendance,
  chatMessages,
  lang,
  onLogout,
  onUpdateUsers,
  onUpdateReports,
  onUpdateTasks,
  onUpdateAlerts,
  onUpdateAttendance,
  onUpdateChatMessages,
  onToggleLang
}: OwnerDashboardProps) {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'alerts' | 'buildings' | 'users' | 'attendance' | 'tasks' | 'chat' | 'archive' | 'log' | 'settings'>('dashboard');

  const [themeColor] = useState<'yellow' | 'green' | 'red' | 'white' | 'black' | 'purple'>('yellow');

  const [globalSearch, setGlobalSearch] = useState('');

  // Local States for reports
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [newReportBuilding, setNewReportBuilding] = useState('1');
  const [newReportNote, setNewReportNote] = useState('');
  const [newReportStatus, setNewReportStatus] = useState<'normal' | 'needs_review' | 'emergency'>('normal');
  const [newReportImage, setNewReportImage] = useState<string>('');
  const [qrScannedSuccess, setQrScannedSuccess] = useState(false);

  // Alert targeted custom types states
  const [alertType, setAlertType] = useState('fire');
  const [manualAlertType, setManualAlertType] = useState('');
  const [alertTarget, setAlertTarget] = useState<'all' | 'admins' | string>('all');
  const [alertNote, setAlertNote] = useState('');

  // Task creation state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDue, setTaskDue] = useState('');

  // User management / Add state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addPass, setAddPass] = useState('');
  const [addRole, setAddRole] = useState<'guard' | 'supervisor'>('guard');

  // Emergency Mode Global State
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  // Chat conversation state
  const [selectedChatUser, setSelectedChatUser] = useState<string>('');
  const [chatInput, setChatInput] = useState('');

  // Computed values
  const activeThemeClass = {
    yellow: 'from-amber-500/20 via-orange-500/5 text-amber-400 bg-amber-500 border-amber-500/30',
    green: 'from-emerald-500/20 via-teal-500/5 text-emerald-400 bg-emerald-500 border-emerald-500/30',
    red: 'from-red-500/20 via-pink-500/5 text-red-400 bg-red-500 border-red-500/30',
    white: 'from-slate-200/20 via-slate-400/5 text-slate-200 bg-white border-slate-200/30',
    black: 'from-slate-800/20 via-slate-900/5 text-slate-400 bg-slate-950 border-slate-700/30',
    purple: 'from-purple-500/20 via-indigo-500/5 text-purple-400 bg-purple-500 border-purple-500/30',
  }[themeColor];

  const themeAccent = {
    yellow: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
    green: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
    red: 'bg-red-500 hover:bg-red-400 text-slate-950',
    white: 'bg-white hover:bg-slate-200 text-slate-950',
    black: 'bg-slate-800 hover:bg-slate-700 text-white',
    purple: 'bg-purple-500 hover:bg-purple-400 text-slate-950',
  }[themeColor];

  const activeReportsToday = reports.filter((r) => r.createdAt.includes('2026-02-10')).length;

  const handleQrScanMock = () => {
    const randomB = buildingsList[Math.floor(Math.random() * buildingsList.length)];
    setNewReportBuilding(randomB.id);
    setQrScannedSuccess(true);
    setTimeout(() => setQrScannedSuccess(false), 2000);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewReportImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportNote) return;

    const selectedB = buildingsList.find((b) => b.id === newReportBuilding);
    if (!selectedB) return;

    const newReport: Report = {
      id: Date.now().toString(),
      buildingId: selectedB.id,
      buildingNameEn: selectedB.en,
      buildingNameAr: selectedB.ar,
      guardId: currentUser.id,
      guardName: currentUser.name,
      qrCodeScan: true,
      gps: { lat: 15.5007, lng: 32.5599 },
      image: newReportImage,
      note: newReportNote,
      status: newReportStatus,
      createdAt: new Date().toISOString(),
    };

    onUpdateReports([newReport, ...reports]);
    setNewReportNote('');
    setNewReportImage('');
  };

  const handleDeleteReport = (id: string) => {
    if (confirm(t.confirm_delete)) {
      onUpdateReports(reports.filter((r) => r.id !== id));
    }
  };

  const handleEditReportClick = (report: Report) => {
    setEditingReport(report);
    setNewReportBuilding(report.buildingId);
    setNewReportNote(report.note);
    setNewReportStatus(report.status);
    setNewReportImage(report.image || '');
  };

  const handleUpdateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;
    const selectedB = buildingsList.find((b) => b.id === newReportBuilding);
    if (!selectedB) return;

    const updated = reports.map((r) => {
      if (r.id === editingReport.id) {
        return {
          ...r,
          buildingId: selectedB.id,
          buildingNameEn: selectedB.en,
          buildingNameAr: selectedB.ar,
          note: newReportNote,
          status: newReportStatus,
          image: newReportImage,
          updatedBy: currentUser.name,
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    });

    onUpdateReports(updated);
    setEditingReport(null);
    setNewReportNote('');
    setNewReportImage('');
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) return;
    if (confirm(t.confirm_delete)) {
      onUpdateUsers(users.filter((u) => u.id !== userId));
    }
  };

  const handleTogglePermission = (userId: string, permKey: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const currentPerms: any = u.permissions || {
          sendReports: true,
          sendAlerts: true,
          accessBuildings: true,
          chat: true,
          recordAttendance: true,
          viewReports: true
        };
        return {
          ...u,
          permissions: {
            ...currentPerms,
            [permKey]: !currentPerms[permKey]
          }
        };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addEmail || !addPass) return;

    const nUser: User = {
      id: Date.now().toString(),
      name: addName,
      email: addEmail,
      phone: addPhone,
      role: addRole,
      password: addPass,
      rating: 5,
      permissions: {
        sendReports: true,
        sendAlerts: true,
        accessBuildings: true,
        chat: true,
        recordAttendance: true,
        viewReports: true
      }
    };

    onUpdateUsers([...users, nUser]);
    setAddName('');
    setAddEmail('');
    setAddPhone('');
    setAddPass('');
    setIsAddUserOpen(false);
  };

  const handleToggleHideUser = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, hiddenFromSupervisors: !u.hiddenFromSupervisors };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleResetDevice = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, deviceFingerprint: undefined, deviceInfo: undefined };
      }
      return u;
    });
    onUpdateUsers(updated);
    alert(t.fingerprint_reset_success);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDesc) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: taskTitle,
      description: taskDesc,
      assignedTo: 'all',
      dueDate: taskDue,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    onUpdateTasks([newTask, ...tasks]);
    setTaskTitle('');
    setTaskDesc('');
    setTaskDue('');
  };

  const handleCheckInGuard = (guard: User) => {
    const checkInRecord: AttendanceRecord = {
      id: Date.now().toString(),
      guardId: guard.id,
      guardName: guard.name,
      shift: guard.shift || 'morning',
      checkIn: new Date().toLocaleTimeString('ar-EG'),
      status: 'present',
      date: new Date().toISOString().split('T')[0],
    };
    onUpdateAttendance([checkInRecord, ...attendance]);
  };

  const handleCheckOutGuard = (recordId: string) => {
    const updated = attendance.map((rec) => {
      if (rec.id === recordId) {
        return { ...rec, checkOut: new Date().toLocaleTimeString('ar-EG') };
      }
      return rec;
    });
    onUpdateAttendance(updated);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const typeLabel = alertType === 'other' ? manualAlertType : alertType;
    if (!typeLabel) return;

    const newAlert: Alert = {
      id: Date.now().toString(),
      type: typeLabel,
      note: alertNote || `${t.sos_red_alert} - ${typeLabel}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      toAll: alertTarget === 'all',
      targetRole: alertTarget === 'admins' ? 'admins' : 'all',
      targetUserId: alertTarget !== 'all' && alertTarget !== 'admins' ? alertTarget : undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    onUpdateAlerts([newAlert, ...alerts]);
    setAlertNote('');
    setManualAlertType('');
  };

  const handleDeleteAlert = (id: string) => {
    if (confirm(t.confirm_delete)) {
      onUpdateAlerts(alerts.filter((a) => a.id !== id));
    }
  };

  const activeConversationUser = users.find((u) => u.id === selectedChatUser);
  const activeChatLog = chatMessages.filter(
    (msg) =>
      (msg.senderId === currentUser.id && msg.receiverId === selectedChatUser) ||
      (msg.senderId === selectedChatUser && msg.receiverId === currentUser.id)
  );

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput || !selectedChatUser) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: selectedChatUser,
      message: chatInput,
      createdAt: new Date().toISOString(),
    };

    onUpdateChatMessages([...chatMessages, newMessage]);
    setChatInput('');
  };

  const handleDeleteChatMessage = (id: string) => {
    if (confirm(t.confirm_delete)) {
      onUpdateChatMessages(chatMessages.filter((m) => m.id !== id));
    }
  };

  return (
    <div
      className={`min-h-screen bg-slate-950 font-sans transition-all duration-300 antialiased overflow-hidden`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {isEmergencyMode && (
        <div className="w-full bg-red-600/90 text-white font-extrabold text-sm text-center py-2 animate-pulse tracking-widest border-b border-red-500/60 z-50 shadow-lg flex items-center justify-center gap-2">
          <ShieldAlert className="h-5 w-5 animate-spin" />
          <span>CRITICAL EMERGENCY MODE ACTIVE</span>
          <button
            onClick={() => setIsEmergencyMode(false)}
            className="px-2 py-0.5 bg-white text-red-600 rounded-lg text-xs font-bold"
          >
            RESOLVE
          </button>
        </div>
      )}

      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap justify-between items-center gap-4">
          <GuardsLogo className="h-10 w-10" lang={lang} />

          <div className="flex items-center gap-4">
            <div className="text-left md:text-right">
              <p className="text-sm font-black text-white leading-tight">أهلاً، {currentUser.name}</p>
              <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-2.5 py-0.5 rounded-full mt-1 font-bold">
                <Shield className="h-3 w-3" />
                {t.owner}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl border border-slate-700/60 transition text-sm font-bold cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-800/60 bg-slate-900/20 backdrop-blur select-none">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto flex items-center justify-start md:justify-center gap-2 py-3 scrollbar-none">
          {[
            { id: 'dashboard', icon: Grid, label: t.dashboard },
            { id: 'reports', icon: FileText, label: t.reports },
            { id: 'alerts', icon: AlertOctagon, label: t.alerts },
            { id: 'buildings', icon: MapPin, label: t.buildings },
            { id: 'users', icon: Users, label: t.users },
            { id: 'attendance', icon: Calendar, label: t.attendance },
            { id: 'tasks', icon: CheckCircle, label: t.tasks },
            { id: 'chat', icon: MessageSquare, label: t.chat },
            { id: 'archive', icon: Archive, label: t.archive },
            { id: 'log', icon: RefreshCw, label: t.log },
            { id: 'settings', icon: Settings, label: t.settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition duration-200 border whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? `${activeThemeClass} bg-slate-900/60 shadow-lg`
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
        {/* ==================================== DASHBOARD TAB ==================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in-20 duration-300">
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-slate-900 border border-amber-500/20 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg relative overflow-hidden">
              <div className="absolute inset-y-0 right-0 w-32 bg-[radial-gradient(circle_at_right,rgba(245,158,11,0.04),transparent_60%)] pointer-events-none"></div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Shield className="h-6 w-6 text-amber-400 animate-pulse" />
                  {lang === 'ar' ? 'نظام العمليات الأمنية المتكامل QA SECURITY' : 'Integrated QA SECURITY Hub'}
                </h2>
                <p className="text-slate-400 mt-1 text-sm max-w-xl leading-relaxed">
                  {lang === 'ar'
                    ? 'بصفتك المالك، يمكنك التحكم الكامل بنشاط الحراس، ومتابعة جميع المباني والتقارير بشكل فوري.'
                    : 'Full access to the guard logs, building status checks, emergency alerts, and system analytics.'}
                </p>
              </div>
              <button
                onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                className="w-full md:w-auto font-black flex items-center justify-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition shadow-lg shrink-0 text-sm tracking-wide cursor-pointer"
              >
                <ShieldAlert className="h-5 w-5" />
                {t.emergency_mode}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-32 backdrop-blur">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-sm font-bold">{t.total_active_guards}</span>
                  <Users className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-3xl font-extrabold text-white">
                  {users.filter((u) => u.role === 'guard').length}
                </span>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-32 backdrop-blur">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-sm font-bold">{t.reports_today}</span>
                  <FileText className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-3xl font-extrabold text-white">{activeReportsToday}</span>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-32 backdrop-blur">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-sm font-bold">{t.total_alerts}</span>
                  <AlertOctagon className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-3xl font-extrabold text-white">{alerts.length}</span>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-32 backdrop-blur">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-sm font-bold">{t.buildings}</span>
                  <MapPin className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-3xl font-extrabold text-white">{buildingsList.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================================== REPORTS TAB ==================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in-20 duration-300">
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-slate-800 pb-3">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Plus className="h-5 w-5 text-amber-400" />
                  {editingReport ? t.edit : t.add_report}
                </h3>
                {/* Tweak 3: QR code Auto-entry */}
                <button
                  type="button"
                  onClick={handleQrScanMock}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-xl cursor-pointer text-xs transition duration-200 shadow-md animate-pulse"
                >
                  <QrCode className="h-4 w-4" />
                  {t.qr_scan}
                </button>
              </div>

              {qrScannedSuccess && (
                <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    {lang === 'ar'
                      ? 'تم مسح QR وتعبئة البيانات بنجاح!'
                      : 'QR code scanned, details populated successfully!'}
                  </span>
                </div>
              )}

              <form onSubmit={editingReport ? handleUpdateReport : handleAddReport} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.building}</label>
                  <select
                    value={newReportBuilding}
                    onChange={(e) => setNewReportBuilding(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none transition text-sm"
                  >
                    {buildingsList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {lang === 'ar' ? b.ar : b.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.manual_report}</label>
                  <input
                    type="text"
                    required
                    value={newReportNote}
                    onChange={(e) => setNewReportNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.status}</label>
                  <div className="flex gap-2">
                    <select
                      value={newReportStatus}
                      onChange={(e) => setNewReportStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none transition text-sm"
                    >
                      <option value="normal">{t.status_normal}</option>
                      <option value="needs_review">{t.status_review}</option>
                      <option value="emergency">{t.status_emergency}</option>
                    </select>
                  </div>
                </div>

                {/* Tweak 4: Added inline Image preview / selector */}
                <div className="md:col-span-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-2 border-t border-slate-800/60 pt-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 transition duration-200">
                      <Image className="h-4 w-4 text-amber-400" />
                      {t.take_photo}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileChange}
                      />
                    </label>
                    {newReportImage && (
                      <div className="flex items-center gap-2 bg-slate-950 p-1.5 border border-slate-800 rounded-xl relative">
                        <img src={newReportImage} alt="Preview" className="h-10 w-10 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setNewReportImage('')}
                          className="p-1 hover:text-red-400 text-slate-500 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      type="submit"
                      className={`font-black rounded-xl transition duration-200 text-sm px-5 py-3 cursor-pointer w-full md:w-auto ${themeAccent}`}
                    >
                      {editingReport ? t.save : t.send}
                    </button>
                    {editingReport && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReport(null);
                          setNewReportNote('');
                          setNewReportImage('');
                        }}
                        className="font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-5 py-3 cursor-pointer"
                      >
                        {t.cancel}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Reports List */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm backdrop-blur">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800/80 text-slate-400 text-xs font-bold tracking-wider">
                      <th className="px-5 py-4">{t.building}</th>
                      <th className="px-5 py-4">{t.manual_report}</th>
                      <th className="px-5 py-4">{t.sender}</th>
                      <th className="px-5 py-4">{t.status}</th>
                      <th className="px-5 py-4">{t.time}</th>
                      <th className="px-5 py-4 text-center">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 text-sm">
                    {reports.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/20 transition duration-200">
                        <td className="px-5 py-4 font-black text-white">
                          {lang === 'ar' ? r.buildingNameAr : r.buildingNameEn}
                        </td>
                        <td className="px-5 py-4 max-w-xs truncate text-xs text-slate-300">
                          {r.note}
                          {r.image && (
                            <span className="block mt-1">
                              <img src={r.image} alt="Report capture" className="h-8 w-8 object-cover rounded" />
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-400">{r.guardName}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                              r.status === 'emergency'
                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                : r.status === 'needs_review'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-mono text-slate-500 select-all">
                          {new Date(r.createdAt).toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditReportClick(r)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 transition"
                              title={t.edit}
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReport(r.id)}
                              className="p-1.5 text-slate-400 hover:text-red-400 transition"
                              title={t.delete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================== ALERTS TAB ==================================== */}
        {activeTab === 'alerts' && (
          <div className="space-y-6 animate-in fade-in-20 duration-300">
            {/* Tweak 2: Manual extra other options Alert form + Target picker options */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur shadow-sm">
              <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-amber-400" />
                {lang === 'ar' ? 'إرسال تنبيه مخصص' : 'Broadcast Custom Alert'}
              </h3>
              <form onSubmit={handleCreateAlert} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.status}</label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none transition text-sm"
                  >
                    <option value="fire">Fire / حريق</option>
                    <option value="combat">Riot / قتال</option>
                    <option value="flood">Flood / فيضان</option>
                    <option value="other">Other (Manual) / أخرى</option>
                  </select>
                </div>
                {alertType === 'other' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">
                      {lang === 'ar' ? 'اكتب نوع التنبيه' : 'Alert Title'}
                    </label>
                    <input
                      type="text"
                      required
                      value={manualAlertType}
                      onChange={(e) => setManualAlertType(e.target.value)}
                      placeholder="Enter emergency type..."
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none transition text-sm"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">
                    {lang === 'ar' ? 'توجيه الإرسال إلى' : 'Target Recipient'}
                  </label>
                  <select
                    value={alertTarget}
                    onChange={(e) => setAlertTarget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none transition text-sm"
                  >
                    <option value="all">Everyone / إرسال للكل</option>
                    <option value="admins">Admins Only / إرسال للإداريين فقط</option>
                    {users
                      .filter((u) => u.id !== currentUser.id)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>
                <div className={alertType === 'other' ? 'md:col-span-1' : 'md:col-span-2'}>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.manual_report}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={alertNote}
                      onChange={(e) => setAlertNote(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none transition text-sm"
                    />
                    <button
                      type="submit"
                      className={`font-black rounded-xl cursor-pointer text-sm px-4 py-2.5 transition duration-200 shrink-0 ${themeAccent}`}
                    >
                      {t.send}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl shadow backdrop-blur">
              <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                {lang === 'ar' ? 'سجل التنبيهات والإنذارات' : 'Emergency Notifications Log'}
              </h3>
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl flex items-center justify-between gap-4 animate-in fade-in-30"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-red-400 text-base">{a.type}</span>
                        <span className="text-[10px] bg-red-500/10 border border-red-500/30 text-red-300 px-2 py-0.5 rounded-full font-bold">
                          {a.senderName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{a.note}</p>
                      <span className="text-[10px] text-slate-500 block mt-2">
                        {new Date(a.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteAlert(a.id)}
                      className="p-2 bg-slate-900/80 hover:bg-red-500/20 border border-slate-800 hover:border-red-500/40 text-slate-500 hover:text-red-400 rounded-xl transition cursor-pointer"
                      title={t.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================== USERS TAB ==================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in-20 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Filter users..."
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pr-10 pl-10 py-2 outline-none transition text-sm"
                />
              </div>

              <button
                onClick={() => setIsAddUserOpen(!isAddUserOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition duration-200 text-sm font-black cursor-pointer shadow-md ${themeAccent}`}
              >
                <UserPlus className="h-5 w-5" />
                {lang === 'ar' ? 'إضافة مستخدم يدوي' : 'Direct Add User'}
              </button>
            </div>

            {isAddUserOpen && (
              <form
                onSubmit={handleAddUser}
                className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-4 items-end animate-in slide-in-from-top duration-300 backdrop-blur"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.name}</label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.email}</label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.password}</label>
                  <input
                    type="password"
                    required
                    value={addPass}
                    onChange={(e) => setAddPass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.role}</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 outline-none transition text-sm"
                  >
                    <option value="guard">{t.guard}</option>
                    <option value="supervisor">{t.supervisor}</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className={`py-2 px-4 font-black rounded-xl cursor-pointer text-sm transition duration-200 ${themeAccent}`}
                >
                  {t.save}
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {users
                .filter((u) => {
                  if (globalSearch) {
                    return (
                      u.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
                      u.email.toLowerCase().includes(globalSearch.toLowerCase())
                    );
                  }
                  return true;
                })
                .map((u) => (
                  <div
                    key={u.id}
                    className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between gap-4 backdrop-blur shadow-sm animate-in fade-in-25 duration-200"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-white">{u.name}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                u.role === 'owner'
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                  : u.role === 'supervisor'
                                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              }`}
                            >
                              {u.role}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 block select-all font-mono mt-1">
                            {u.email}
                          </span>
                        </div>

                        {u.role !== 'owner' && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-slate-950 rounded-xl transition duration-200 cursor-pointer text-xs font-bold"
                          >
                            Delete
                          </button>
                        )}
                      </div>

                      {/* Tweak 5: Granular Advanced Permissions Toggles */}
                      {u.role !== 'owner' && (
                        <div className="mt-4 bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl space-y-2 select-text">
                          <p className="text-xs font-bold text-amber-400 mb-2 border-b border-slate-800 pb-1">
                            {lang === 'ar' ? 'تعديل صلاحيات المستخدم' : 'Adjust Advanced User Permissions'}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs">
                            {[
                              { key: 'sendReports', label: lang === 'ar' ? 'إرسال تقارير' : 'Send Reports' },
                              { key: 'sendAlerts', label: lang === 'ar' ? 'إرسال تنبيهات' : 'Send Alerts' },
                              { key: 'accessBuildings', label: lang === 'ar' ? 'الوصول للمباني' : 'Access Buildings' },
                              { key: 'chat', label: lang === 'ar' ? 'الشات' : 'Direct Chat' },
                              { key: 'recordAttendance', label: lang === 'ar' ? 'تسجيل الحضور' : 'Clock In/Out' },
                              { key: 'viewReports', label: lang === 'ar' ? 'رؤية التقارير' : 'View Reports' }
                            ].map((perm) => {
                              const perms = u.permissions || {
                                sendReports: true,
                                sendAlerts: true,
                                accessBuildings: true,
                                chat: true,
                                recordAttendance: true,
                                viewReports: true
                              };
                              return (
                                <label
                                  key={perm.key}
                                  className="flex items-center gap-2 text-slate-400 font-bold cursor-pointer select-none"
                                >
                                  <input
                                    type="checkbox"
                                    checked={perms[perm.key as keyof typeof perms]}
                                    onChange={() => handleTogglePermission(u.id, perm.key as any)}
                                    className="accent-amber-500 rounded"
                                  />
                                  <span>{perm.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 mt-4 pt-3 text-slate-500 text-xs">
                        {u.role !== 'owner' && (
                          <button
                            onClick={() => handleResetDevice(u.id)}
                            disabled={!u.deviceFingerprint}
                            className="text-[10px] flex items-center gap-1 font-bold bg-slate-800 hover:bg-slate-700 hover:text-amber-400 disabled:opacity-50 transition px-2.5 py-1 rounded-xl cursor-pointer"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            {t.reset_device}
                          </button>
                        )}
                        {u.role !== 'owner' && (
                          <button
                            onClick={() => handleToggleHideUser(u.id)}
                            className="text-[10px] flex items-center gap-1 font-bold bg-slate-800 hover:bg-slate-700 hover:text-amber-400 transition px-2.5 py-1 rounded-xl cursor-pointer"
                          >
                            {u.hiddenFromSupervisors ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {u.hiddenFromSupervisors ? t.unhide_from_supervisors : t.hide_from_supervisors}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in-20 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur shadow-sm h-fit">
                <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-amber-400" />
                  {lang === 'ar' ? 'تسجيل حضور حارس يدوياً' : 'Manual Guard Check In'}
                </h3>
                <div className="space-y-2.5 max-h-60 overflow-y-auto scrollbar-none">
                  {users
                    .filter((u) => u.role === 'guard')
                    .map((guard) => {
                      const hasCheckedIn = attendance.some((r) => r.guardId === guard.id);
                      return (
                        <div
                          key={guard.id}
                          className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-xl flex items-center justify-between gap-3"
                        >
                          <div>
                            <span className="text-sm font-bold text-slate-200 block">{guard.name}</span>
                          </div>
                          {hasCheckedIn ? (
                            <span className="text-[10px] font-black bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-xl">
                              Checked In
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCheckInGuard(guard)}
                              className={`text-[11px] font-black cursor-pointer px-3 py-1.5 rounded-xl transition duration-200 ${themeAccent}`}
                            >
                              Check In
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-400" />
                    {lang === 'ar' ? 'بيانات حضور اليوم' : 'Daily Attendance Status Records'}
                  </h3>
                  <div className="space-y-3.5 max-h-80 overflow-y-auto scrollbar-none">
                    {attendance.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 animate-in fade-in-20 duration-200"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">{rec.guardName}</span>
                          </div>
                        </div>
                        {!rec.checkOut ? (
                          <button
                            onClick={() => handleCheckOutGuard(rec.id)}
                            className="text-xs font-black bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-xl cursor-pointer transition duration-200"
                          >
                            Check Out
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-500">Checked Out</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================== OTHER TABS FALLBACK TO BASICS ==================================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in-20 duration-300">
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur shadow-sm">
              <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-amber-400" />
                {t.new_task}
              </h3>
              <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.new_task}</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.task_desc}</label>
                  <input
                    type="text"
                    required
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 outline-none transition text-sm"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className={`font-black cursor-pointer rounded-xl transition duration-200 text-sm px-4 py-2 w-full ${themeAccent}`}
                  >
                    {t.send}
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col justify-between gap-4 backdrop-blur shadow-sm animate-in fade-in-25"
                >
                  <div>
                    <h4 className="text-base font-extrabold text-white leading-tight">{task.title}</h4>
                    <p className="text-xs text-slate-400 mt-2">{task.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic chat thread messaging */}
        {activeTab === 'chat' && (
          <div className="space-y-6 animate-in fade-in-20 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl backdrop-blur shadow-sm max-h-[70vh] overflow-y-auto scrollbar-none">
                <h3 className="text-sm font-extrabold text-slate-400 mb-3 px-1">{t.chat}</h3>
                <div className="space-y-2">
                  {users
                    .filter((u) => u.id !== currentUser.id)
                    .map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedChatUser(user.id)}
                        className={`w-full text-right flex items-center justify-between p-3.5 rounded-xl border transition duration-200 cursor-pointer ${
                          selectedChatUser === user.id
                            ? `${activeThemeClass}`
                            : 'border-transparent text-slate-300 hover:bg-slate-800/40'
                        }`}
                      >
                        <div>
                          <span className="text-sm font-bold block">{user.name}</span>
                          <span className="text-[10px] text-slate-500 font-bold">
                            {user.role}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur shadow-sm flex flex-col justify-between h-[65vh]">
                {!activeConversationUser ? (
                  <p className="text-xs text-slate-500 p-8 text-center flex-1 flex items-center justify-center">
                    Choose chat user to continue thread...
                  </p>
                ) : (
                  <>
                    <div className="border-b border-slate-800/80 flex justify-between items-center mb-3">
                      <div>
                        <h4 className="text-sm font-extrabold text-white">{activeConversationUser.name}</h4>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 mb-3 flex flex-col scrollbar-none select-text">
                      {activeChatLog.map((msg) => {
                        const isSelf = msg.senderId === currentUser.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col gap-1 max-w-[80%] break-words ${
                              isSelf ? 'self-end items-end' : 'self-start items-start'
                            }`}
                          >
                            <div
                              className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                                isSelf
                                  ? `${themeAccent} rounded-br-none`
                                  : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-bl-none'
                              }`}
                            >
                              {msg.message}
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono px-1">
                              <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                              {isSelf && (
                                <button
                                  onClick={() => handleDeleteChatMessage(msg.id)}
                                  className="hover:text-red-400 font-bold transition cursor-pointer"
                                >
                                  {t.delete}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <form onSubmit={handleSendChat} className="flex gap-2.5 border-t border-slate-800/80 pt-3">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type message here..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 text-white rounded-xl px-4 py-3 outline-none transition text-sm"
                      />
                      <button
                        type="submit"
                        className={`font-black rounded-xl transition cursor-pointer text-sm px-5 py-3 ${themeAccent}`}
                      >
                        {t.send}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-md mx-auto bg-slate-900/40 border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow backdrop-blur animate-in fade-in-20 duration-300">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <Settings className="h-5 w-5 text-amber-400" />
              {t.settings}
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">{t.language}</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
                  <button
                    onClick={onToggleLang}
                    className={`py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                      lang === 'ar' ? `${themeAccent}` : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    onClick={onToggleLang}
                    className={`py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                      lang === 'en' ? `${themeAccent}` : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
