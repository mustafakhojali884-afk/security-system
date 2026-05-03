import { useState, useEffect } from 'react';
import { User, ShiftType } from '../types';
import { translations } from '../translations';
import { Shield, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import GuardsLogo from './GuardsLogo';

interface LoginSignupProps {
  onLogin: (user: User) => void;
  users: User[];
  onRegister: (newUser: User) => void;
  lang: 'ar' | 'en';
  forcedRole: 'owner' | 'supervisor' | 'guard';
}

export default function LoginSignup({ onLogin, users, onRegister, lang, forcedRole }: LoginSignupProps) {
  const t = translations[lang];

  const [isLogin, setIsLogin] = useState(forcedRole === 'owner');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [securityId, setSecurityId] = useState('');
  const [shift, setShift] = useState<ShiftType>('morning');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const [deviceInfo, setDeviceInfo] = useState('');

  useEffect(() => {
    const ua = navigator.userAgent;
    const w = window.screen.width;
    const h = window.screen.height;
    const threads = navigator.hardwareConcurrency || 4;
    const fp = `fp_${ua.substring(ua.indexOf('(') + 1, ua.indexOf(')'))}_${w}x${h}_th${threads}`;
    setDeviceFingerprint(fp);

    let os = "Unknown OS";
    if (ua.indexOf("Win") !== -1) os = "Windows";
    if (ua.indexOf("Mac") !== -1) os = "MacOS";
    if (ua.indexOf("X11") !== -1) os = "Linux";
    if (ua.indexOf("Android") !== -1) os = "Android";
    if (ua.indexOf("iPod") !== -1 || ua.indexOf("iPad") !== -1 || ua.indexOf("iPhone") !== -1) os = "iOS";

    let browser = "Unknown Browser";
    if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
    else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
    else if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) browser = "Safari";
    else if (ua.indexOf("Edge") !== -1) browser = "Edge";

    setDeviceInfo(`${browser} / ${os} (${w}x${h})`);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError(lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Email and password are required');
      return;
    }

    // Explicit owner test override
    if (forcedRole === 'owner' && email === 'mustafakhojali884@gmail.com' && password === 'mus2003kh') {
      const ownerAccount = users.find((u) => u.email === 'mustafakhojali884@gmail.com');
      if (ownerAccount) {
        onLogin(ownerAccount);
        return;
      }
    }

    const matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password &&
        u.role === forcedRole
    );

    if (matchedUser) {
      if (matchedUser.deviceFingerprint && matchedUser.deviceFingerprint !== deviceFingerprint) {
        setError(t.fingerprint_error);
        return;
      }

      if (!matchedUser.deviceFingerprint) {
        matchedUser.deviceFingerprint = deviceFingerprint;
        matchedUser.deviceInfo = deviceInfo;
        matchedUser.firstLoginDate = new Date().toISOString().split('T')[0];
      }

      setSuccess(lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
      setTimeout(() => {
        onLogin(matchedUser);
      }, 600);
    } else {
      setError(lang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة أو الصلاحية مختلفة' : 'Invalid email, password, or direct path role');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError(lang === 'ar' ? 'يرجى ملء كافة الحقول الأساسية' : 'Basic fields are required');
      return;
    }

    // Ensure guards complete standard info
    if (forcedRole === 'guard' && (!phone || !securityId)) {
      setError(lang === 'ar' ? 'يرجى إدخال الهاتف ورقم السكيورتي للحراس' : 'Phone and Security ID are required for guards');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      setError(lang === 'ar' ? 'هذا البريد الإلكتروني مسجل مسبقاً' : 'Email is already registered');
      return;
    }

    // Assign exactly Guard to any new user registration
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      securityId: securityId || 'SEC-NEW',
      shift: shift || 'morning',
      role: 'guard',
      password,
      deviceFingerprint,
      deviceInfo,
      firstLoginDate: new Date().toISOString().split('T')[0],
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

    onRegister(newUser);
    setSuccess(lang === 'ar' ? 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول كحارس.' : 'Account successfully created! Please log in as guard.');
    setTimeout(() => {
      setIsLogin(true);
    }, 1200);
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-950 font-sans antialiased text-slate-100" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="hidden md:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-x border-slate-800/80 relative overflow-hidden select-none">
        <div className="z-10">
          <GuardsLogo className="h-12 w-12" lang={lang} />
        </div>
        <div className="z-10 max-w-lg">
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug">
            {lang === 'ar' ? 'نظام إدارة العمليات الأمنية الذكي' : 'Smart Security Operations System'}
            <br />
            <span className="text-amber-400">QA SECURITY</span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed">
            {lang === 'ar'
              ? 'المنصة المتكاملة والمخصصة حسب صلاحية الدخول. تأكد من استخدام الرابط الصحيح لدورك في المنظومة الأمنية.'
              : 'Direct secure access path tailored to your role. Connect instantly to scan reports and keep your perimeter safe.'}
          </p>
        </div>
        <div className="z-10 text-slate-500 text-xs flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-500/80" />
          <span>{lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'} &copy; 2026 QA SECURITY</span>
        </div>
      </div>

      {/* Auth Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 bg-slate-950 text-slate-100 relative overflow-y-auto animate-in fade-in duration-300">
        <div className="max-w-md mx-auto w-full">
          {forcedRole !== 'owner' && (
            <div className="flex justify-between items-center mb-8 border-b border-slate-800">
              <button
                onClick={() => setIsLogin(true)}
                className={`pb-3.5 text-base font-bold flex-1 text-center border-b-2 transition duration-200 cursor-pointer ${
                  isLogin ? 'border-amber-400 text-amber-400 font-black' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.login_btn}
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`pb-3.5 text-base font-bold flex-1 text-center border-b-2 transition duration-200 cursor-pointer ${
                  !isLogin ? 'border-amber-400 text-amber-400 font-black' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.register_btn}
              </button>
            </div>
          )}

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-2xl relative">
            <div className="mb-4">
              <span className="text-xs bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-amber-400 font-black rounded-lg">
                {forcedRole.toUpperCase()}
              </span>
            </div>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">{t.email}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@qa.com"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 focus:ring-amber-500/20 text-white rounded-xl px-4 py-3 outline-none transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">{t.password}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 focus:ring-amber-500/20 text-white rounded-xl px-4 py-3 outline-none transition pr-4 pl-12 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 ltr:right-4 rtl:left-4 flex items-center text-slate-500 hover:text-slate-300 transition"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold py-3.5 rounded-xl transition shadow-xl flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Shield className="h-5 w-5" />
                  {t.login_btn}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">{t.name}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 focus:ring-amber-500/20 text-white rounded-xl px-4 py-2.5 outline-none transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">{t.email}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@qa.com"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 focus:ring-amber-500/20 text-white rounded-xl px-4 py-2.5 outline-none transition text-sm"
                  />
                </div>

                {/* Always request standard fields since default is always Guard */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1">{t.phone}</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+249..."
                      className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 focus:ring-amber-500/20 text-white rounded-xl px-4 py-2.5 outline-none transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1">{t.security_id}</label>
                    <input
                      type="text"
                      required
                      value={securityId}
                      onChange={(e) => setSecurityId(e.target.value)}
                      placeholder="SEC-XXX"
                      className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 focus:ring-amber-500/20 text-white rounded-xl px-4 py-2.5 outline-none transition text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">{t.shift_type}</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as ShiftType)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 focus:ring-amber-500/20 text-white rounded-xl px-4 py-2.5 outline-none transition text-sm"
                  >
                    <option value="morning">{t.morning}</option>
                    <option value="night">{t.night}</option>
                    <option value="day">{t.day}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">{t.password}</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 focus:ring-amber-500/20 text-white rounded-xl px-4 py-2.5 outline-none transition text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-xl transition shadow-xl flex items-center justify-center gap-2 mt-4 text-base cursor-pointer"
                >
                  <CheckCircle className="h-5 w-5" />
                  {t.register_btn}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
