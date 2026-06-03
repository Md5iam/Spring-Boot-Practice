import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, Code2, Lock, User, Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSuccess: (user: { id: number; username: string; email: string; roles: string[]; token?: string }) => void;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || 'Invalid username or password.');
        }

        const data = await response.json();
        // Save to local storage for persistence
        localStorage.setItem('seuoj_user', JSON.stringify(data));
        
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onSuccess(data);
          onClose();
        }, 1200);
      } else {
        // Register
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || 'Registration failed. Try a different username/email.');
        }

        // Auto-login upon successful registration
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          localStorage.setItem('seuoj_user', JSON.stringify(data));
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            onSuccess(data);
            onClose();
          }, 1200);
        } else {
          // Switch to login tab on success if auto-login didn't complete
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            setMode('login');
          }, 1200);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background glass overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative z-10 p-8 text-left animate-float">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-4 animate-scaleUp">
            <div className="bg-emerald-500 p-4 rounded-full text-white animate-bounce shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Success!</h3>
              <p className="text-slate-500 text-sm mt-1 font-semibold text-center">
                {mode === 'login' ? 'Welcome to SEU OJ.' : 'Account created successfully.'}
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {mode === 'login' ? 'Sign In to SEU OJ' : 'Register Practice Account'}
              </h3>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2 mb-4">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1.5">Username</label>
                <div className="relative">
                  <User className="h-4.5 w-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    required 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="h-4.5 w-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@seu.edu.bd"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="h-4.5 w-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button 
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-blue-500/10 transition-all hover:scale-[1.02] text-center mt-3 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === 'login' ? 'Authenticate' : 'Create Account'}
              </button>
            </form>

            {/* Form Toggle Links */}
            <div className="mt-6 text-center text-xs font-semibold text-slate-400">
              {mode === 'login' ? (
                <span>
                  New to SEU OJ?{' '}
                  <button onClick={() => setMode('signup')} className="text-blue-600 hover:underline cursor-pointer">
                    Register now
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-blue-600 hover:underline cursor-pointer">
                    Sign In
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
