import { useEffect, useState } from 'react';
import { Zap, Terminal } from 'lucide-react';

interface HeroProps {
  onStartSolving: () => void;
}

export default function Hero({ onStartSolving }: HeroProps) {
  const [activeLine, setActiveLine] = useState(0);

  const rotatingLines = [
    'Live contests every week',
    'Real-time submission judging',
    'Department ranking battles',
    'VS Code-like coding arena',
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveLine((prev) => (prev + 1) % rotatingLines.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-72px)] px-4 md:px-8 text-center">

      {/* University badge with live dot */}
      <div className="animate-fadeUp animate-fadeUp-1 inline-flex items-center gap-2.5 border-[1.5px] border-slate-300/60 px-6 py-2 text-[10px] tracking-[3px] text-slate-700 uppercase font-semibold mb-8">
        <span className="w-[7px] h-[7px] rounded-full bg-blue-500 flex-shrink-0 animate-live-pulse" />
        Southeast University — Online Judge
      </div>

      {/* Giant Display Headline */}
      <div className="animate-fadeUp animate-fadeUp-2 select-none mb-6" style={{ lineHeight: 0.9 }}>
        <div className="flex items-baseline justify-center gap-2 md:gap-4">
          <span className="font-display text-[clamp(64px,14vw,130px)] text-transparent uppercase" style={{ WebkitTextStroke: '2.5px #0f172a' }}>
            SEU
          </span>
          <span className="font-display text-[clamp(64px,14vw,130px)] text-slate-900 uppercase">
            Online
          </span>
        </div>
        <div className="flex items-baseline justify-center gap-2 md:gap-4">
          <span className="font-display text-[clamp(64px,14vw,130px)] text-transparent uppercase" style={{ WebkitTextStroke: '2.5px #0f172a' }}>
            Judge
          </span>
          <span className="font-display text-[clamp(64px,14vw,130px)] bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase">
            2026
          </span>
        </div>
      </div>

      {/* Info Strip with Pills */}
      <div className="animate-fadeUp animate-fadeUp-3 flex items-center gap-3 md:gap-4 flex-wrap justify-center mb-8">
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] tracking-[2.5px] uppercase px-4 py-[6px] rounded-full font-semibold">
          CSE Department
        </span>
        <span className="w-1 h-1 bg-slate-400 rounded-full hidden md:block" />
        <span className="text-[11px] text-slate-500 tracking-[1.5px] uppercase font-medium">
          Competitive Programming & Judging Platform
        </span>
        <span className="w-1 h-1 bg-slate-400 rounded-full hidden md:block" />
        <span className="bg-slate-900 text-white text-[10px] tracking-[2.5px] uppercase px-4 py-[6px] rounded-full font-semibold">
          SEU, Dhaka
        </span>
      </div>

      {/* Rotating feature line */}
      <div className="animate-fadeUp animate-fadeUp-4 mb-10">
        <p className="text-slate-400 text-sm font-medium tracking-wide transition-all duration-300">
          ✦ {rotatingLines[activeLine]}
        </p>
      </div>

      {/* Call To Actions */}
      <div className="animate-fadeUp animate-fadeUp-5 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onStartSolving}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-3.5 rounded-full transition-all shadow-lg shadow-blue-500/15 flex items-center gap-2 hover:scale-[1.03] cursor-pointer text-sm tracking-wide"
        >
          <Zap className="h-4 w-4" />
          Start Solving
        </button>
        <a
          href="#contests"
          className="bg-white text-slate-700 border border-slate-200/80 font-bold px-8 py-3.5 rounded-full transition-all shadow-sm flex items-center gap-2 hover:scale-[1.03] hover:bg-slate-50 cursor-pointer text-sm tracking-wide"
        >
          <Terminal className="h-4 w-4" />
          View Contests
        </a>
      </div>

      {/* Scroll hint at bottom */}
      <div className="animate-fadeUp animate-fadeUp-6 absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[9px] tracking-[2px] text-slate-400 uppercase font-medium">Scroll</span>
        <div
          className="w-[16px] h-[16px] border-r-[1.5px] border-b-[1.5px] border-slate-400"
          style={{ animation: 'bounceDown 1.4s ease-in-out infinite' }}
        />
      </div>

    </section>
  );
}
