import { useState, useEffect } from 'react';
import { User, Report, Task, AttendanceRecord, ChatMessage, Alert, LogEntry } from './types';
import { initialUsers, initialReports, initialTasks, initialAttendance, initialChatMessages, initialLogs } from './mockData';
import LoginSignup from './components/LoginSignup';
import OwnerDashboard from './components/OwnerDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import GuardDashboard from './components/GuardDashboard';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    const stored = localStorage.getItem('qa_app_lang');
    return stored === 'en' ? 'en' : 'ar';
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [forcedRole, setForcedRole] = useState<'owner' | 'supervisor' | 'guard'>('owner');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#/supervisor') setForcedRole('supervisor');
      else if (hash === '#/guard') setForcedRole('guard');
      else setForcedRole('owner');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('qa_app_current_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('qa_app_users');
    return storedUsers ? JSON.parse(storedUsers) : initialUsers;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const storedReports = localStorage.getItem('qa_app_reports');
    return storedReports ? JSON.parse(storedReports) : initialReports;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const storedTasks = localStorage.getItem('qa_app_tasks');
    return storedTasks ? JSON.parse(storedTasks) : initialTasks;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const storedAttendance = localStorage.getItem('qa_app_attendance');
    return storedAttendance ? JSON.parse(storedAttendance) : initialAttendance;
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const storedAlerts = localStorage.getItem('qa_app_alerts');
    return storedAlerts ? JSON.parse(storedAlerts) : [];
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const storedChat = localStorage.getItem('qa_app_chat');
    return storedChat ? JSON.parse(storedChat) : initialChatMessages;
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const storedLogs = localStorage.getItem('qa_app_logs');
    return storedLogs ? JSON.parse(storedLogs) : initialLogs;
  });

  // Cross-tab storage change listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) {
        // Full refresh
        const u = localStorage.getItem('qa_app_users');
        if (u) setUsers(JSON.parse(u));
        const r = localStorage.getItem('qa_app_reports');
        if (r) setReports(JSON.parse(r));
        const t = localStorage.getItem('qa_app_tasks');
        if (t) setTasks(JSON.parse(t));
        const a = localStorage.getItem('qa_app_alerts');
        if (a) setAlerts(JSON.parse(a));
        const att = localStorage.getItem('qa_app_attendance');
        if (att) setAttendance(JSON.parse(att));
        const c = localStorage.getItem('qa_app_chat');
        if (c) setChatMessages(JSON.parse(c));
        const l = localStorage.getItem('qa_app_logs');
        if (l) setLogs(JSON.parse(l));
        return;
      }
      if (e.key === 'qa_app_users' && e.newValue) setUsers(JSON.parse(e.newValue));
      if (e.key === 'qa_app_reports' && e.newValue) setReports(JSON.parse(e.newValue));
      if (e.key === 'qa_app_tasks' && e.newValue) setTasks(JSON.parse(e.newValue));
      if (e.key === 'qa_app_alerts' && e.newValue) setAlerts(JSON.parse(e.newValue));
      if (e.key === 'qa_app_attendance' && e.newValue) setAttendance(JSON.parse(e.newValue));
      if (e.key === 'qa_app_chat' && e.newValue) setChatMessages(JSON.parse(e.newValue));
      if (e.key === 'qa_app_logs' && e.newValue) setLogs(JSON.parse(e.newValue));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleUpdateUsers = (updated: User[]) => {
    setUsers(updated);
    localStorage.setItem('qa_app_users', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateReports = (updated: Report[]) => {
    setReports(updated);
    localStorage.setItem('qa_app_reports', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateTasks = (updated: Task[]) => {
    setTasks(updated);
    localStorage.setItem('qa_app_tasks', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateAlerts = (updated: Alert[]) => {
    setAlerts(updated);
    localStorage.setItem('qa_app_alerts', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateAttendance = (updated: AttendanceRecord[]) => {
    setAttendance(updated);
    localStorage.setItem('qa_app_attendance', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateChatMessages = (updated: ChatMessage[]) => {
    setChatMessages(updated);
    localStorage.setItem('qa_app_chat', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    localStorage.setItem('qa_app_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('qa_app_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('qa_app_current_user');
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    const newLog: LogEntry = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      action: `تم تسجيل دخول المستخدم (${user.name}) بنجاح.`,
      timestamp: new Date().toISOString(),
    };
    const nLogs = [newLog, ...logs];
    setLogs(nLogs);
    localStorage.setItem('qa_app_logs', JSON.stringify(nLogs));
    window.dispatchEvent(new Event('storage'));
  };

  const handleLogout = () => {
    if (currentUser) {
      const newLog: LogEntry = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        action: `قام المستخدم (${currentUser.name}) بتسجيل الخروج.`,
        timestamp: new Date().toISOString(),
      };
      const nLogs = [newLog, ...logs];
      setLogs(nLogs);
      localStorage.setItem('qa_app_logs', JSON.stringify(nLogs));
      window.dispatchEvent(new Event('storage'));
    }
    setCurrentUser(null);
  };

  const handleRegister = (newUser: User) => {
    setUsers((prev) => {
      const uList = [...prev, newUser];
      localStorage.setItem('qa_app_users', JSON.stringify(uList));
      window.dispatchEvent(new Event('storage'));
      return uList;
    });
    const newLog: LogEntry = {
      id: Date.now().toString(),
      userId: newUser.id,
      userName: newUser.name,
      action: `تم تسجيل حساب مستخدم جديد: ${newUser.name} (${newUser.role})`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => {
      const lList = [newLog, ...prev];
      localStorage.setItem('qa_app_logs', JSON.stringify(lList));
      window.dispatchEvent(new Event('storage'));
      return lList;
    });
  };

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans select-none" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {!currentUser && (
        <div className="w-full flex items-center justify-center gap-3 bg-slate-900/60 border-b border-slate-800 p-2.5">
          <a
            href="#/owner"
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer border ${
              forcedRole === 'owner' ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md' : 'border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            /owner
          </a>
          <a
            href="#/supervisor"
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer border ${
              forcedRole === 'supervisor' ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md' : 'border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            /supervisor
          </a>
          <a
            href="#/guard"
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer border ${
              forcedRole === 'guard' ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md' : 'border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            /guard
          </a>
        </div>
      )}

      {!isOnline && (
        <div className="bg-amber-600/90 text-white font-bold text-xs text-center py-1.5 animate-pulse flex items-center justify-center gap-2 border-b border-amber-500/30 tracking-wide select-none z-50">
          <span>{lang === 'ar' ? 'أنت الآن في وضع عدم الاتصال بالإنترنت' : 'You are currently offline'}</span>
        </div>
      )}

      {!currentUser ? (
        <LoginSignup
          onLogin={handleLogin}
          users={users}
          onRegister={handleRegister}
          lang={lang}
          forcedRole={forcedRole}
        />
      ) : currentUser.role === 'owner' ? (
        <OwnerDashboard
          currentUser={currentUser}
          users={users}
          reports={reports}
          tasks={tasks}
          alerts={alerts}
          attendance={attendance}
          chatMessages={chatMessages}
          logs={logs}
          lang={lang}
          onLogout={handleLogout}
          onUpdateUsers={handleUpdateUsers}
          onUpdateReports={handleUpdateReports}
          onUpdateTasks={handleUpdateTasks}
          onUpdateAlerts={handleUpdateAlerts}
          onUpdateAttendance={handleUpdateAttendance}
          onUpdateChatMessages={handleUpdateChatMessages}
          onToggleLang={handleToggleLang}
        />
      ) : currentUser.role === 'supervisor' ? (
        <SupervisorDashboard
          currentUser={currentUser}
          users={users}
          reports={reports}
          tasks={tasks}
          alerts={alerts}
          chatMessages={chatMessages}
          lang={lang}
          onLogout={handleLogout}
          onUpdateReports={handleUpdateReports}
          onUpdateTasks={handleUpdateTasks}
          onUpdateAlerts={handleUpdateAlerts}
          onUpdateChatMessages={handleUpdateChatMessages}
          onToggleLang={handleToggleLang}
        />
      ) : (
        <GuardDashboard
          currentUser={currentUser}
          users={users}
          reports={reports}
          tasks={tasks}
          alerts={alerts}
          attendance={attendance}
          chatMessages={chatMessages}
          lang={lang}
          onLogout={handleLogout}
          onUpdateReports={handleUpdateReports}
          onUpdateTasks={handleUpdateTasks}
          onUpdateAlerts={handleUpdateAlerts}
          onUpdateAttendance={handleUpdateAttendance}
          onUpdateChatMessages={handleUpdateChatMessages}
          onToggleLang={handleToggleLang}
        />
      )}
    </div>
  );
}
