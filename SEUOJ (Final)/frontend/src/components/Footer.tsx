import { Code2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-12 px-4 md:px-8 text-slate-500 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-2 rounded-lg flex items-center justify-center">
            <Code2 className="h-5 w-5 text-slate-700" />
          </div>
          <div className="text-left">
            <span className="font-bold text-slate-900 block">SEUOJ</span>
            <span className="text-[10px] text-slate-400 font-semibold block">© 2026 Southeast University Online Judge. All rights reserved.</span>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-400">
          Southeast University Online Judge Platform
        </div>

        {/* Right navigation links */}
        <div className="flex items-center gap-6 font-semibold text-xs">
          <a href="#problems" className="hover:text-slate-900 transition-colors">Problems</a>
          <a href="#contests" className="hover:text-slate-900 transition-colors">Contests</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
            Github
          </a>
        </div>

      </div>
    </footer>
  );
}
