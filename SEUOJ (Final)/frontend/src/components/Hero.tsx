import { useEffect, useState } from 'react';
import { Play, Code2, CheckCircle2, Terminal, Zap, Orbit } from 'lucide-react';

interface HeroProps {
  onStartSolving: () => void;
}

export default function Hero({ onStartSolving }: HeroProps) {
  const [code, setCode] = useState(`# Python 3 solution for A+B problem
a, b = map(int, input().split())
print(a + b)`);
  
  const [status, setStatus] = useState<'idle' | 'running' | 'success'>('idle');
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

  const handleRun = () => {
    setStatus('running');
    setTimeout(() => {
      setStatus('success');
    }, 1800);
  };

  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute -top-16 -right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-soft -z-10 pointer-events-none" />
      <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse-soft -z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:36px_36px] opacity-[0.08] pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Content Column */}
        <div className="lg:col-span-5 flex flex-col items-start text-left">
          
          <div className="inline-flex items-center gap-2 mb-6 text-sm font-extrabold text-slate-700">
            <Orbit className="h-4 w-4 text-indigo-500 animate-spin" />
            <span className="transition-all duration-300">{rotatingLines[activeLine]}</span>
          </div>

          {/* Main Title Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
            Code, Compete,<br />
            and <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Excel</span> with SEUOJ
          </h1>

          {/* Subtext Paragraph */}
          <p className="text-slate-500 md:text-lg mb-8 leading-relaxed font-medium">
            The state-of-the-art competitive programming and online judging platform engineered for Southeast University. Refine your problem-solving skills, conquer live contests, and track your ranking.
          </p>

          {/* Call To Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onStartSolving}
              className="ui-btn-primary"
            >
              <Zap className="h-5 w-5" />
              Start Solving
            </button>
            <a
              href="#contests"
              className="ui-btn-secondary"
            >
              <Terminal className="h-5 w-5" />
              View Contests
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="ui-pill bg-emerald-50 text-emerald-700 border border-emerald-100">100ms Judge Avg</span>
            <span className="ui-pill bg-violet-50 text-violet-700 border border-violet-100">Live Leaderboard</span>
            <span className="ui-pill bg-amber-50 text-amber-700 border border-amber-100">Contest Rating</span>
          </div>

        </div>

        {/* Right Interactive Mock Cloud IDE Column */}
        <div className="lg:col-span-7 w-full">
          <div className="ui-card-elevated overflow-hidden text-left ide-shadow-lg">
            
            {/* Editor Window Header Bar */}
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
              
              {/* Window Controls */}
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-400 block" />
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 block" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 block" />
                <span className="text-xs text-slate-400 font-semibold tracking-wide ml-3 flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-blue-500" />
                  A_Plus_B.py — Python 3
                </span>
              </div>

            </div>

            {/* Code Textarea Window */}
            <div className="p-6 font-mono text-sm bg-white min-h-[160px] flex gap-4">
              
              {/* Line Numbers */}
              <div className="text-slate-300 select-none text-right flex flex-col gap-1.5 font-medium border-r border-slate-100 pr-4">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
              </div>

              {/* Code Input */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
                className="w-full h-24 focus:outline-none resize-none text-slate-800 bg-transparent font-medium leading-relaxed"
              />

            </div>

            {/* Simulated Execution Details Panel */}
            <div className="bg-slate-50/80 p-5 border-t border-slate-200/80 flex flex-col gap-4">
              
              {/* Input details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Standard Input</span>
                  <span className="font-mono text-sm text-slate-700 font-semibold">5 7</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Expected Output</span>
                  <span className="font-mono text-sm text-slate-700 font-semibold">12</span>
                </div>
              </div>

              {/* Action and Output Alert Trigger */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                
                {/* Run Button */}
                <button
                  onClick={handleRun}
                  disabled={status === 'running'}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50"
                >
                  <Play className={`h-4 w-4 fill-white ${status === 'running' ? 'animate-spin' : ''}`} />
                  {status === 'running' ? 'Compiling on Judge0...' : 'Run Code'}
                </button>

                {/* State Outputs */}
                <div className="flex-1 flex justify-end">
                  {status === 'running' && (
                    <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm animate-pulse">
                      <Zap className="h-4 w-4 text-blue-500 animate-bounce" />
                      Executing standard test cases...
                    </div>
                  )}

                  {status === 'success' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3.5 shadow-sm shadow-emerald-500/5 animate-float w-full sm:w-auto">
                      <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-emerald-800 block">Status: ACCEPTED</span>
                        <span className="text-[10px] font-bold text-emerald-600 block">Time: 12ms | Memory: 4212 KB</span>
                      </div>
                    </div>
                  )}

                  {status === 'idle' && (
                    <span className="text-xs font-semibold text-slate-400 italic">
                      Click "Run Code" to test against sandbox.
                    </span>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
