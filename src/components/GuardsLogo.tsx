import { Shield } from 'lucide-react';

interface GuardsLogoProps {
  className?: string;
  lang?: string;
}

export default function GuardsLogo({ className = "h-10 w-10", lang = 'ar' }: GuardsLogoProps) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600 opacity-60 blur-sm animate-pulse"></div>
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-700 shadow-xl">
          <Shield className={`${className} text-amber-400 stroke-[2]`} />
        </div>
      </div>
      <div>
        <h1 className="text-xl font-black bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent tracking-wide leading-none select-none">
          QA SECURITY
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-medium tracking-wider select-none">
          {lang === 'ar' ? 'المنظومة الأمنية المتكاملة' : 'Integrated Security System'}
        </p>
      </div>
    </div>
  );
}
