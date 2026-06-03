import { Calendar, Users, Trophy, Award, ArrowRight, Flame } from 'lucide-react';

interface ActiveContestsProps {
  onAction: () => void;
}

export default function ActiveContests({ onAction }: ActiveContestsProps) {

  return (
    <section id="contests" className="bg-slate-50 border-y border-slate-200/80 py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto text-left">
        
        {/* Headers */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block mb-2">Academic Competitions</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-none tracking-tight">
              Active Contest Schedule
            </h2>
            <p className="text-slate-500 font-medium mt-3">
              Engage in live programming challenges, secure high scoring positions, and raise your academic coding rank.
            </p>
          </div>
          <button className="text-sm font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 hover:underline whitespace-nowrap bg-white border border-slate-200/80 px-5 py-3 rounded-2xl shadow-sm">
            View All Contests
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Contest Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Ongoing Contest (Large Left Card) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl shadow-slate-100 relative overflow-hidden flex flex-col justify-between min-h-[360px] text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Header indicators */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <span className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                Live Now
              </span>
              <span className="text-slate-400 text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500" />
                120 Points
              </span>
            </div>

            {/* Contest Info */}
            <div className="mb-8">
              <h3 className="text-2xl font-extrabold text-slate-900 leading-tight mb-3">
                SEU Inter-Department Programming Contest 2026
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium mb-6">
                The annual flagship coding competition for Southeast University departments. Put your algorithms skills to the test and win cash prizes!
              </p>

              {/* Contest Metadata */}
              <div className="flex items-center gap-6 text-slate-500 text-sm font-semibold">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4.5 w-4.5 text-blue-500" />
                  128 Solvers Active
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-indigo-500" />
                  Ends in: <span className="font-bold text-rose-600 font-mono">02h 45m 12s</span>
                </span>
              </div>
            </div>

            {/* CTA action */}
            <button 
              onClick={onAction}
              className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg shadow-rose-500/10 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="h-4.5 w-4.5" />
              Enter Arena & Solve
            </button>

          </div>

          {/* Right Side Column (Upcoming & Past Contests) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Upcoming Contest Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Upcoming
                  </span>
                  <span className="text-slate-400 text-xs font-semibold">May 30, 2026 — 15:00</span>
                </div>
                <h4 className="text-lg font-extrabold text-slate-900 leading-snug mb-2">
                  SEU Rookie Clash Round 1
                </h4>
                <p className="text-slate-500 text-xs leading-relaxed font-medium mb-4">
                  Designed for junior university programmers to learn basic syntax limits and standard algorithmic logic.
                </p>
              </div>

              {/* Actions and registration */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Duration: 3h | 6 Problems
                </span>
                
                <button
                  onClick={onAction}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Register Now
                </button>
              </div>
            </div>

            {/* Past Contest Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Completed
                  </span>
                  <span className="text-slate-400 text-xs font-semibold">May 15, 2026</span>
                </div>
                <h4 className="text-lg font-extrabold text-slate-900 leading-snug mb-3">
                  SEUOJ Spring Warmup 2026
                </h4>
                
                {/* Scoreboard Winners Pod */}
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3 flex flex-col gap-2 mb-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Top Scoreboard Winners</span>
                  <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      1st: CSE_Overlord
                    </span>
                    <span className="text-slate-400 font-bold">120 pts</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-slate-400" />
                      2nd: Siam_SEU
                    </span>
                    <span className="text-slate-400 font-bold">100 pts</span>
                  </div>
                </div>
              </div>

              {/* View Standings trigger */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  96 Participants Ranked
                </span>
                <button className="text-xs font-extrabold text-slate-600 hover:text-blue-600 transition-all">
                  View Standings
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
