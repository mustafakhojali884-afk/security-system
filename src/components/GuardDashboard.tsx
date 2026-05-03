import { useState } from 'react';
import { User, Report, Task, AttendanceRecord, ChatMessage, Alert } from '../types';
import { translations, buildingsList } from '../translations';
import {
  Clock,
  Plus,
  FileText,
  AlertOctagon,
  MessageSquare,
  Settings,
  MapPin,
  Calendar,
  LogOut,
  QrCode,
  Image,
  X,
  UserCheck,
  CheckCircle
} from 'lucide-react';
import GuardsLogo from './GuardsLogo';

interface GuardDashboardProps {
  currentUser: User;
  users: User[];
  reports: Report[];
  tasks: Task[];
  alerts: Alert[];
  attendance: AttendanceRecord[];
  chatMessages: ChatMessage[];
  lang: 'ar' | 'en';
  onLogout: () => void;
  onUpdateReports: (updated: Report[]) => void;
  onUpdateTasks: (updated: Task[]) => void;
  onUpdateAlerts: (updated: Alert[]) => void;
  onUpdateAttendance: (updated: AttendanceRecord[]) => void;
  onUpdateChatMessages: (updated: ChatMessage[]) => void;
  onToggleLang: () => void;
}

export default function GuardDashboard({
  currentUser,
  users,
  reports,
  tasks,
  alerts,
  attendance,
  chatMessages,
  lang,
  onLogout,
  onUpdateReports,
  onUpdateTasks,
  onUpdateAlerts,
  onUpdateAttendance,
  onUpdateChatMessages,
  onToggleLang
}: GuardDashboardProps) {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'reports' | 'buildings' | 'attendance' | 'alerts' | 'chat' | 'settings'>('reports');

  const [themeColor] = useState<'yellow' | 'green' | 'red' | 'white' | 'black' | 'purple'>('yellow');

  // New report form states
  const [newReportBuilding, setNewReportBuilding] = useState('1');
  const [newReportNote, setNewReportNote] = useState('');
  const [newReportStatus, setNewReportStatus] = useState<'normal' | 'needs_review' | 'emergency'>('normal');
  const [newReportImage, setNewReportImage] = useState<string>('');
  const [qrScannedSuccess, setQrScannedSuccess] = useState(false);

  // Custom alert target creation states for guard
  const [alertType, setAlertType] = useState('fire');
  const [manualAlertType, setManualAlertType] = useState('');
  const [alertTarget, setAlertTarget] = useState<'all' | 'admins'>('all');
  const [alertNote, setAlertNote] = useState('');

  const [chatInput, setChatInput] = useState('');

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

  const myReports = reports.filter((r) => r.guardId === currentUser.id);
  const myTasks = tasks.filter((t) => t.assignedTo === currentUser.id || t.assignedTo === 'all');
  const myAttendanceRecords = attendance.filter((rec) => rec.guardId === currentUser.id);

  const handleQrScanMock = () => {
    // Tweak 3: Autopopulate mock after QR Scan in reports
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

  const handleToggleCheckIn = () => {
    const hasCheckedIn = myAttendanceRecords.some((rec) => !rec.checkOut);

    if (!hasCheckedIn) {
      const checkInRecord: AttendanceRecord = {
        id: Date.now().toString(),
        guardId: currentUser.id,
        guardName: currentUser.name,
        shift: currentUser.shift || 'morning',
        checkIn: new Date().toLocaleTimeString('ar-EG'),
        status: 'present',
        date: new Date().toISOString().split('T')[0],
      };
      onUpdateAttendance([checkInRecord, ...attendance]);
    } else {
      const updated = attendance.map((rec) => {
        if (rec.guardId === currentUser.id && !rec.checkOut) {
          return { ...rec, checkOut: new Date().toLocaleTimeString('ar-EG') };
        }
        return rec;
      });
      onUpdateAttendance(updated);
    }
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const typeLabel = alertType === 'other' ? manualAlertType : alertType;
    if (!typeLabel) return;

    // Tweak 2: Limit the alerting scope of the guard to 'all' or 'admins'
    const newAlert: Alert = {
      id: Date.now().toString(),
      type: typeLabel,
      note: alertNote || `${t.sos_red_alert} - ${typeLabel}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      toAll: alertTarget === 'all',
      targetRole: alertTarget === 'admins' ? 'admins' : 'all',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    onUpdateAlerts([newAlert, ...alerts]);
    setAlertNote('');
    setManualAlertType('');
  };

  const activeOwner = users.find((u) => u.role === 'owner');
  const activeChatLog = chatMessages.filter(
    (msg) =>
      (msg.senderId === currentUser.id && msg.receiverId === activeOwner?.id) ||
      (msg.senderId === activeOwner?.id && msg.receiverId === currentUser.id)
  );

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput || !activeOwner) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: activeOwner.id,
      message: chatInput,
      createdAt: new Date().toISOString(),
    };

    onUpdateChatMessages([...chatMessages, newMessage]);
    setChatInput('');
  };

  const handleCompleteTask = (id: string) => {
    onUpdateTasks(tasks.map((t) => (t.id === id ? { ...t, status: 'completed' } : t)));
  };

  const isCheckedIn = myAttendanceRecords.some((rec) => !rec.checkOut);

  return (
    <div className="min-h-screen bg-slate-950 font-sans transition-all duration-300 antialiased overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap justify-between items-center gap-4">
          <GuardsLogo className="h-10 w-10" lang={lang} />

          <div className="flex items-center gap-4">
            <div className="text-left md:text-right">
              <p className="text-sm font-black text-white leading-tight">أهلاً، {currentUser.name}</p>
              <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full mt-1 font-bold">
                <UserCheck className="h-3 w-3" />
                {t.guard}
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
            { id: 'reports', icon: FileText, label: t.reports },
            { id: 'buildings', icon: MapPin, label: t.buildings },
            { id: 'attendance', icon: Calendar, label: t.attendance },
            { id: 'alerts', icon: AlertOctagon, label: t.alerts },
            { id: 'chat', icon: MessageSquare, label: t.chat },
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
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-slate-900 border border-emerald-500/20 p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-400" />
              {t.profile}
            </h2>
            <p className="text-slate-400 mt-1 text-sm max-w-xl leading-relaxed">
              {lang === 'ar'
                ? 'مرحباً بك في بوابتك الأمنية الخاصة لتأكيد النوبات، مسح الباركود ورفع التقارير المباشرة للمشرفين.'
                : 'Manage shift check-in, check your upcoming security tasks, and report on building areas directly.'}
            </p>
          </div>
          <button
            onClick={handleToggleCheckIn}
            className={`w-full md:w-auto font-black flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl transition shadow-lg cursor-pointer text-sm ${
              isCheckedIn ? 'bg-red-600 hover:bg-red-500 text-white' : `${themeAccent}`
            }`}
          >
            <Clock className="h-5 w-5" />
            {isCheckedIn ? t.check_out : t.check_in}
          </button>
        </div>

        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in-20 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur shadow-sm h-fit">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3 flex-wrap gap-2">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-amber-400" />
                    {t.add_report}
                  </h3>
                  {/* Tweak 3: QR auto populator scan trigger */}
                  <button
                    type="button"
                    onClick={handleQrScanMock}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3.5 py-2.5 rounded-xl cursor-pointer text-xs transition duration-200 shadow-md animate-pulse"
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

                <form onSubmit={handleAddReport} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.building}</label>
                    <select
                      value={newReportBuilding}
                      onChange={(e) => setNewReportBuilding(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-white rounded-xl px-3.5 py-2 outline-none transition text-sm"
                    >
                      {buildingsList.map((b) => (
                        <option key={b.id} value={b.id}>
                          {lang === 'ar' ? b.ar : b.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.manual_report}</label>
                    <textarea
                      rows={2}
                      required
                      value={newReportNote}
                      onChange={(e) => setNewReportNote(e.target.value)}
                      placeholder="Write descriptive findings here..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-white rounded-xl px-3.5 py-2 outline-none transition text-sm"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.status}</label>
                    <select
                      value={newReportStatus}
                      onChange={(e) => setNewReportStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 outline-none transition text-sm"
                    >
                      <option value="normal">{t.status_normal}</option>
                      <option value="needs_review">{t.status_review}</option>
                      <option value="emergency">{t.status_emergency}</option>
                    </select>
                  </div>

                  {/* Tweak 4: File add / snap image preview */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2 border-t border-slate-800/60 pt-3">
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
                      <div className="flex items-center gap-2 bg-slate-950 p-1.5 border border-slate-800 rounded-xl relative animate-in zoom-in-50 duration-200">
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

                  <button
                    type="submit"
                    className={`w-full py-3 font-black cursor-pointer rounded-xl transition duration-200 text-sm flex items-center justify-center gap-2 ${themeAccent}`}
                  >
                    <Plus className="h-4 w-4" />
                    {t.send}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl shadow-sm backdrop-blur flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-400" />
                    {lang === 'ar' ? 'سجل تقاريري السابقة' : 'My Past Submissions'}
                  </h3>
                  <div className="space-y-3.5 max-h-[50vh] overflow-y-auto scrollbar-none">
                    {myReports.length === 0 ? (
                      <p className="text-xs text-slate-500 p-4 text-center">لا توجد تقارير مسجلة بواسطتك بعد</p>
                    ) : (
                      myReports.map((r) => (
                        <div
                          key={r.id}
                          className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl flex items-center justify-between gap-4 animate-in fade-in-20 duration-200"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-extrabold text-white">
                                {lang === 'ar' ? r.buildingNameAr : r.buildingNameEn}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-2">
                              {r.note}
                              {r.image && (
                                <span className="block mt-1">
                                  <img src={r.image} alt="Report snap" className="h-8 w-8 object-cover rounded" />
                                </span>
                              )}
                            </p>
                            <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                              {new Date(r.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================== OTHER TABS ==================================== */}
        {activeTab === 'buildings' && (
          <div className="space-y-6 animate-in fade-in-20 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl backdrop-blur shadow-sm max-h-[70vh] overflow-y-auto scrollbar-none">
                <h3 className="text-sm font-extrabold text-slate-400 mb-3 px-1">{t.buildings}</h3>
                <div className="space-y-1.5">
                  {buildingsList.map((b) => {
                    const count = myReports.filter((r) => r.buildingId === b.id).length;
                    return (
                      <button
                        key={b.id}
                        onClick={() => setNewReportBuilding(b.id)}
                        className={`w-full text-right flex items-center justify-between px-3.5 py-3 rounded-xl border transition duration-200 cursor-pointer ${
                          newReportBuilding === b.id
                            ? `${activeThemeClass}`
                            : 'border-transparent text-slate-300 hover:bg-slate-800/40'
                        }`}
                      >
                        <span className="text-sm font-bold">{lang === 'ar' ? b.ar : b.en}</span>
                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-amber-400" />
                    {lang === 'ar'
                      ? `تقاريرك الخاصة في ${buildingsList.find((b) => b.id === newReportBuilding)?.ar}`
                      : `Your personal logs for ${buildingsList.find((b) => b.id === newReportBuilding)?.en}`}
                  </h3>
                  <div className="space-y-3 max-h-[55vh] overflow-y-auto scrollbar-none">
                    {myReports.filter((r) => r.buildingId === newReportBuilding).length === 0 ? (
                      <p className="text-xs text-slate-500 p-4 text-center">لا توجد تقارير مسجلة لهذا المبنى</p>
                    ) : (
                      myReports
                        .filter((r) => r.buildingId === newReportBuilding)
                        .map((r) => (
                          <div
                            key={r.id}
                            className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl flex items-center justify-between gap-4"
                          >
                            <div>
                              <p className="text-xs text-slate-300 mt-2">{r.note}</p>
                              <span className="text-[10px] text-slate-500 mt-1 block">
                                {new Date(r.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in-20 duration-300">
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur shadow-sm max-w-lg mx-auto">
              <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                {lang === 'ar' ? 'سجل نوبات حضوري' : 'Personal Duty Clock Log'}
              </h3>
              <div className="space-y-3">
                {myAttendanceRecords.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">لم تسجل أي نوبة حضور اليوم بعد</p>
                ) : (
                  myAttendanceRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl flex items-center justify-between gap-4 animate-in fade-in-20 duration-200"
                    >
                      <div>
                        <span className="text-sm font-black text-white">{rec.date}</span>
                        <div className="text-xs text-slate-400 mt-1 flex gap-4">
                          <span>
                            In:{' '}
                            <span className="font-bold text-slate-300 font-mono">
                              {rec.checkIn}
                            </span>
                          </span>
                          <span>
                            Out:{' '}
                            <span className="font-bold text-slate-300 font-mono">
                              {rec.checkOut || '—'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6 animate-in fade-in-20 duration-300">
            {/* Tweak 2: Manual extra other options Alert form + Limited target scopes */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur shadow-sm max-w-lg mx-auto">
              <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-amber-400" />
                {lang === 'ar' ? 'إرسال تنبيه مخصص' : 'Broadcast Custom Alert'}
              </h3>
              <form onSubmit={handleCreateAlert} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.status}</label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none transition text-sm"
                  >
                    <option value="fire">Fire / حريق</option>
                    <option value="combat">Riot / قتال</option>
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
                    onChange={(e) => setAlertTarget(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none transition text-sm"
                  >
                    <option value="all">Everyone / إرسال للكل</option>
                    <option value="admins">Admins Only / إرسال للإداريين فقط</option>
                  </select>
                </div>
                <div>
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
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-xl mx-auto bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur shadow-sm h-[65vh] flex flex-col justify-between animate-in fade-in-20 duration-300">
            {!activeOwner ? (
              <p className="text-xs text-slate-500 p-8 text-center flex-1 flex items-center justify-center">
                Owner direct private chat is unavailable
              </p>
            ) : (
              <>
                <div className="border-b border-slate-800/80 flex items-center justify-between mb-3 select-none">
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{activeOwner.name}</h4>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 mb-3 flex flex-col select-text scrollbar-none">
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
                        <span className="text-[9px] text-slate-500 font-mono px-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendChat} className="flex gap-2.5 border-t border-slate-800/80 pt-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type message to the owner..."
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 outline-none transition text-sm"
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
                    className={`py-2 rounded-lg text-xs font-black transition cursor-pointer duration-200 ${
                      lang === 'ar' ? `${themeAccent}` : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    onClick={onToggleLang}
                    className={`py-2 rounded-lg text-xs font-black transition cursor-pointer duration-200 ${
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

        {myTasks.length > 0 && (
          <div className="mt-8 bg-slate-900/20 border border-slate-800 p-5 rounded-2xl backdrop-blur shadow-sm max-w-3xl mx-auto">
            <h3 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400" />
              {lang === 'ar' ? 'المهام والتعليمات المباشرة المسندة إليك' : 'Tasks Specifically Assigned to You'}
            </h3>
            <div className="space-y-3">
              {myTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 bg-slate-950/40 border border-slate-800/40 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 animate-in slide-in-from-bottom duration-200 select-text"
                >
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{task.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className={`text-xs font-black rounded-xl px-3 py-1.5 cursor-pointer self-end ${themeAccent}`}
                    >
                      Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
