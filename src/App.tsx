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

  // Tweak 2: "Real-time" polling cross-tab storage listener to update instantly without refreshing!
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
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

  useEffect(() => {
    localStorage.setItem('qa_app_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('qa_app_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('qa_app_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('qa_app_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('qa_app_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('qa_app_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('qa_app_logs', JSON.stringify(logs));
  }, [logs]);

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
    setLogs([newLog, ...logs]);
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
      setLogs([newLog, ...logs]);
    }
    setCurrentUser(null);
  };

  const handleRegister = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
    const newLog: LogEntry = {
      id: Date.now().toString(),
      userId: newUser.id,
      userName: newUser.name,
      action: `تم تسجيل حساب مستخدم جديد: ${newUser.name} (${newUser.role})`,
      timestamp: new Date().toISOString(),
    };
    setLogs([newLog, ...logs]);
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
          onUpdateUsers={setUsers}
          onUpdateReports={setReports}
          onUpdateTasks={setTasks}
          onUpdateAlerts={setAlerts}
          onUpdateAttendance={setAttendance}
          onUpdateChatMessages={setChatMessages}
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
          onUpdateReports={setReports}
          onUpdateTasks={setTasks}
          onUpdateAlerts={setAlerts}
          onUpdateChatMessages={setChatMessages}
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
          onUpdateReports={setReports}
          onUpdateTasks={setTasks}
          onUpdateAlerts={setAlerts}
          onUpdateAttendance={setAttendance}
          onUpdateChatMessages={setChatMessages}
          onToggleLang={handleToggleLang}
        />
      )}
    </div>
  );
}
