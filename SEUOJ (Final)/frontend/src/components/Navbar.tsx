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
    <nav className="sticky top-0 z-50 glassmorphism border-b border-slate-200/80 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onViewChange('landing')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-md shadow-blue-500/10 flex items-center justify-center">
            <Code2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">SEU OJ</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5 font-semibold text-slate-600">
          <button
            onClick={() => onViewChange('problems')}
            className={`px-4 py-2 hover:bg-slate-50 rounded-lg hover:text-blue-600 transition-colors flex items-center gap-2 text-sm cursor-pointer ${
              currentView === 'problems' ? 'text-blue-600 bg-slate-50/80' : ''
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Problems
          </button>
          
          {user && (
            <button
              onClick={() => onViewChange('submissions')}
              className={`px-4 py-2 hover:bg-slate-50 rounded-lg hover:text-blue-600 transition-colors flex items-center gap-2 text-sm cursor-pointer ${
                currentView === 'submissions' ? 'text-blue-600 bg-slate-50/80' : ''
              }`}
            >
              <RefreshCw className="h-4 w-4" />
              Submissions
            </button>
          )}

          <button
            onClick={() => onViewChange('contests')}
            className={`px-4 py-2 hover:bg-slate-50 rounded-lg hover:text-blue-600 transition-colors flex items-center gap-2 text-sm cursor-pointer ${
              currentView === 'contests' ? 'text-blue-600 bg-slate-50/80' : ''
            }`}
          >
            <Trophy className="h-4 w-4" />
            Contests
          </button>
          <button
            onClick={() => onViewChange('leaderboard')}
            className={`px-4 py-2 hover:bg-slate-50 rounded-lg hover:text-blue-600 transition-colors flex items-center gap-2 text-sm cursor-pointer ${
              currentView === 'leaderboard' ? 'text-blue-600 bg-slate-50/80' : ''
            }`}
          >
            <User className="h-4 w-4" />
            Leaderboard
          </button>
          {user?.roles?.includes('ROLE_ADMIN') && (
            <button
              onClick={() => onViewChange('users')}
              className={`px-4 py-2 hover:bg-slate-50 rounded-lg hover:text-blue-600 transition-colors flex items-center gap-2 text-sm cursor-pointer ${
                currentView === 'users' ? 'text-blue-600 bg-slate-50/80' : ''
              }`}
            >
              <Users className="h-4 w-4" />
              Users
            </button>
          )}
        </div>

        {/* Action Buttons (Sign In / Register / Logout) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl">
                <div className="w-6 h-6 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black uppercase">
                  {user.username.substring(0, 2)}
                </div>
                <span className="text-xs font-bold text-slate-800">{user.username}</span>
              </div>
              <button 
                onClick={onLogout}
                className="text-xs font-extrabold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => onAuth('login')}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 cursor-pointer focus:ring-4 focus:ring-blue-500/10 rounded-xl"
              >
                Sign In
              </button>
              <button 
                onClick={() => onAuth('signup')}
                className="ui-btn-primary ui-btn-sm text-sm"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-3">
          {!user && (
            <button 
              onClick={() => onAuth('signup')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Get Started
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-500 hover:text-slate-800 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-3 p-4 bg-white/95 rounded-2xl border border-slate-200/80 shadow-xl flex flex-col gap-2">
          <button
            onClick={() => {
              setIsOpen(false);
              onViewChange('problems');
            }}
            className={`flex items-center gap-2.5 p-3 hover:bg-slate-50 rounded-xl text-slate-700 hover:text-blue-600 font-semibold transition-colors text-left cursor-pointer w-full ${
              currentView === 'problems' ? 'text-blue-600 bg-slate-50' : ''
            }`}
          >
            <BookOpen className="h-5 w-5" />
            Problems
          </button>

          {user && (
            <button
              onClick={() => {
                setIsOpen(false);
                onViewChange('submissions');
              }}
              className={`flex items-center gap-2.5 p-3 hover:bg-slate-50 rounded-xl text-slate-700 hover:text-blue-600 font-semibold transition-colors text-left cursor-pointer w-full ${
                currentView === 'submissions' ? 'text-blue-600 bg-slate-50' : ''
              }`}
            >
              <RefreshCw className="h-5 w-5" />
              Submissions
            </button>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              onViewChange('contests');
            }}
            className={`flex items-center gap-2.5 p-3 hover:bg-slate-50 rounded-xl text-slate-700 hover:text-blue-600 font-semibold transition-colors text-left cursor-pointer w-full ${
              currentView === 'contests' ? 'text-blue-600 bg-slate-50' : ''
            }`}
          >
            <Trophy className="h-5 w-5" />
            Contests
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onViewChange('leaderboard');
            }}
            className={`flex items-center gap-2.5 p-3 hover:bg-slate-50 rounded-xl text-slate-700 hover:text-blue-600 font-semibold transition-colors text-left cursor-pointer w-full ${
              currentView === 'leaderboard' ? 'text-blue-600 bg-slate-50' : ''
            }`}
          >
            <User className="h-5 w-5" />
            Leaderboard
          </button>
          {user?.roles?.includes('ROLE_ADMIN') && (
            <button
              onClick={() => {
                setIsOpen(false);
                onViewChange('users');
              }}
              className={`flex items-center gap-2.5 p-3 hover:bg-slate-50 rounded-xl text-slate-700 hover:text-blue-600 font-semibold transition-colors text-left cursor-pointer w-full ${
                currentView === 'users' ? 'text-blue-600 bg-slate-50' : ''
              }`}
            >
              <Users className="h-5 w-5" />
              Users
            </button>
          )}
          <hr className="border-slate-100 my-2" />
          {user ? (
            <button 
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full text-center py-2.5 font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          ) : (
            <button 
              onClick={() => {
                setIsOpen(false);
                onAuth('login');
              }}
              className="w-full text-center py-2.5 font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
