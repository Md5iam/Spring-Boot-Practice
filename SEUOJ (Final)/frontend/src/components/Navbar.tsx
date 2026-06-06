import { useState } from 'react';
import { Code2, Menu, X, Trophy, BookOpen, User, Users, LogOut, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onAuth: (mode: 'login' | 'signup') => void;
  currentView: 'landing' | 'problems' | 'arena' | 'submissions' | 'leaderboard' | 'contests' | 'users';
  onViewChange: (view: 'landing' | 'problems' | 'arena' | 'submissions' | 'leaderboard' | 'contests' | 'users') => void;
  user: { id: number; username: string; email: string; roles: string[] } | null;
  onLogout: () => void;
}

export default function Navbar({ onAuth, currentView, onViewChange, user, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative z-50 px-4 md:px-6 pt-4">
      <nav className="bg-slate-800 rounded-full flex items-center px-4 md:px-6 py-2.5 gap-2 shadow-xl shadow-slate-900/15 max-w-7xl mx-auto">

        {/* Brand Logo */}
        <div 
          onClick={() => onViewChange('landing')}
          className="flex items-center gap-2.5 cursor-pointer min-w-[120px]"
        >
          <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 p-2 rounded-xl flex items-center justify-center">
            <Code2 className="h-4 w-4 text-white" />
          </div>
          <div className="leading-tight">
            <span className="text-[10px] text-white/50 uppercase tracking-[2px] font-light block">→ Online Judge</span>
            <span className="text-[12px] font-bold text-white tracking-wide uppercase">
              SEU <span className="font-black">OJ</span>
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links (Centered) */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          <button
            onClick={() => onViewChange('problems')}
            className={`px-3 py-1.5 rounded-full text-[10.5px] font-medium tracking-[1.2px] uppercase transition-all cursor-pointer ${
              currentView === 'problems'
                ? 'bg-blue-600 text-white'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Problems
          </button>

          {user && (
            <button
              onClick={() => onViewChange('submissions')}
              className={`px-3 py-1.5 rounded-full text-[10.5px] font-medium tracking-[1.2px] uppercase transition-all cursor-pointer ${
                currentView === 'submissions'
                  ? 'bg-blue-600 text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              Submissions
            </button>
          )}

          <button
            onClick={() => onViewChange('contests')}
            className={`px-3 py-1.5 rounded-full text-[10.5px] font-medium tracking-[1.2px] uppercase transition-all cursor-pointer ${
              currentView === 'contests'
                ? 'bg-blue-600 text-white'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Contests
          </button>

          <button
            onClick={() => onViewChange('leaderboard')}
            className={`px-3 py-1.5 rounded-full text-[10.5px] font-medium tracking-[1.2px] uppercase transition-all cursor-pointer ${
              currentView === 'leaderboard'
                ? 'bg-blue-600 text-white'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Leaderboard
          </button>
        </div>

        {/* Right Side: Admin + Auth */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <>
              {user.roles?.includes('ROLE_ADMIN') && (
                <button
                  onClick={() => onViewChange('users')}
                  className={`px-3 py-1.5 rounded-full text-[10.5px] font-medium tracking-[1.2px] uppercase transition-all cursor-pointer ${
                    currentView === 'users'
                      ? 'bg-blue-600 text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  Users
                </button>
              )}
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                <div className="w-5 h-5 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-md flex items-center justify-center text-white text-[8px] font-black uppercase">
                  {user.username.substring(0, 2)}
                </div>
                <span className="text-[10px] font-semibold text-white/90">{user.username}</span>
              </div>
              <button 
                onClick={onLogout}
                className="text-[10px] font-semibold text-white/50 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => onAuth('login')}
                className="text-[10.5px] font-medium text-white/80 hover:text-white transition-colors px-3 py-1.5 cursor-pointer tracking-[1px] uppercase"
              >
                Sign In
              </button>
              <button 
                onClick={() => onAuth('signup')}
                className="bg-white text-slate-900 font-bold text-[12px] px-5 py-2 rounded-full cursor-pointer hover:scale-[1.04] hover:shadow-lg transition-all tracking-wide"
              >
                Register Now
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2 ml-auto">
          {!user && (
            <button 
              onClick={() => onAuth('signup')}
              className="bg-white text-slate-900 text-[10px] font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer"
            >
              Register
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white/70 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-2 mx-2 p-4 bg-slate-800 rounded-2xl shadow-2xl flex flex-col gap-1.5 border border-slate-700/50">
          <button
            onClick={() => { setIsOpen(false); onViewChange('problems'); }}
            className={`flex items-center gap-2.5 p-3 rounded-xl text-sm font-medium text-left cursor-pointer w-full transition-colors ${
              currentView === 'problems' ? 'text-blue-400 bg-white/5' : 'text-white/80 hover:bg-white/5'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Problems
          </button>

          {user && (
            <button
              onClick={() => { setIsOpen(false); onViewChange('submissions'); }}
              className={`flex items-center gap-2.5 p-3 rounded-xl text-sm font-medium text-left cursor-pointer w-full transition-colors ${
                currentView === 'submissions' ? 'text-blue-400 bg-white/5' : 'text-white/80 hover:bg-white/5'
              }`}
            >
              <RefreshCw className="h-4 w-4" />
              Submissions
            </button>
          )}

          <button
            onClick={() => { setIsOpen(false); onViewChange('contests'); }}
            className={`flex items-center gap-2.5 p-3 rounded-xl text-sm font-medium text-left cursor-pointer w-full transition-colors ${
              currentView === 'contests' ? 'text-blue-400 bg-white/5' : 'text-white/80 hover:bg-white/5'
            }`}
          >
            <Trophy className="h-4 w-4" />
            Contests
          </button>

          <button
            onClick={() => { setIsOpen(false); onViewChange('leaderboard'); }}
            className={`flex items-center gap-2.5 p-3 rounded-xl text-sm font-medium text-left cursor-pointer w-full transition-colors ${
              currentView === 'leaderboard' ? 'text-blue-400 bg-white/5' : 'text-white/80 hover:bg-white/5'
            }`}
          >
            <User className="h-4 w-4" />
            Leaderboard
          </button>

          {user?.roles?.includes('ROLE_ADMIN') && (
            <button
              onClick={() => { setIsOpen(false); onViewChange('users'); }}
              className={`flex items-center gap-2.5 p-3 rounded-xl text-sm font-medium text-left cursor-pointer w-full transition-colors ${
                currentView === 'users' ? 'text-blue-400 bg-white/5' : 'text-white/80 hover:bg-white/5'
              }`}
            >
              <Users className="h-4 w-4" />
              Users
            </button>
          )}

          <hr className="border-slate-700/50 my-2" />
          {user ? (
            <button 
              onClick={() => { setIsOpen(false); onLogout(); }}
              className="w-full text-center py-2.5 font-semibold text-rose-400 hover:bg-white/5 rounded-xl transition-colors cursor-pointer text-sm"
            >
              Sign Out
            </button>
          ) : (
            <button 
              onClick={() => { setIsOpen(false); onAuth('login'); }}
              className="w-full text-center py-2.5 font-semibold text-white/80 hover:bg-white/5 rounded-xl transition-colors cursor-pointer text-sm"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </header>
  );
}
