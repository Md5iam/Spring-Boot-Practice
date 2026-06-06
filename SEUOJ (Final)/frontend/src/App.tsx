import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Features from './components/Features';
import ActiveContests from './components/ActiveContests';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import BackgroundCodeParticles from './components/BackgroundCodeParticles';

import ProblemsDashboard from './components/ProblemsDashboard';
import CodingArena from './components/CodingArena';
import SubmissionsDashboard from './components/SubmissionsDashboard';
import Leaderboard from './components/Leaderboard';
import ContestsDashboard from './components/ContestsDashboard';
import UsersDashboard from './components/UsersDashboard';

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [view, setView] = useState<'landing' | 'problems' | 'arena' | 'submissions' | 'leaderboard' | 'contests' | 'users'>(() => {
    const stored = localStorage.getItem('seuoj_user');
    return stored ? 'problems' : 'landing';
  });
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
  const [activeContestId, setActiveContestId] = useState<number | null>(null);
  const [selectedContestId, setSelectedContestId] = useState<number | null>(null);
  const [arenaBackView, setArenaBackView] = useState<'problems' | 'contests'>('problems');

  const [user, setUser] = useState<{ id: number; username: string; email: string; roles: string[] } | null>(() => {
    const stored = localStorage.getItem('seuoj_user');
    return stored ? JSON.parse(stored) : null;
  });

  // State-to-Hash URL Synchronization
  useEffect(() => {
    let hash = `#${view}`;
    const params = new URLSearchParams();
    if (view === 'arena') {
      if (selectedProblemId) params.set('problemId', String(selectedProblemId));
      if (activeContestId) params.set('contestId', String(activeContestId));
    } else if (view === 'contests' && selectedContestId) {
      params.set('selectedContestId', String(selectedContestId));
    }
    const paramStr = params.toString();
    if (paramStr) {
      hash += `?${paramStr}`;
    }
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  }, [view, selectedProblemId, activeContestId, selectedContestId]);

  // Hash-to-State Synchronization (Browser Back/Forward Nav)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#';
      const pathPart = hash.split('?')[0].replace('#', '');
      const queryPart = hash.split('?')[1] || '';
      const params = new URLSearchParams(queryPart);

      let newView: typeof view = 'landing';
      if (['problems', 'arena', 'submissions', 'leaderboard', 'contests', 'users'].includes(pathPart)) {
        newView = pathPart as typeof view;
      } else {
        newView = user ? 'problems' : 'landing';
      }

      setView(newView);

      if (newView === 'arena') {
        const pid = params.get('problemId');
        const cid = params.get('contestId');
        if (pid) setSelectedProblemId(Number(pid));
        if (cid) setActiveContestId(Number(cid));
      } else if (newView === 'contests') {
        const scid = params.get('selectedContestId');
        setSelectedContestId(scid ? Number(scid) : null);
      }
    };

    // Initialize on mount
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  const triggerAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleViewChange = (newView: typeof view) => {
    if (user && newView === 'landing') {
      setView('problems');
    } else {
      setView(newView);
    }
    if (newView === 'contests') {
      setSelectedContestId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('seuoj_user');
    setUser(null);
    setView('landing');
  };

  const handleSelectProblem = (problemId: number, contestId?: number) => {
    setSelectedProblemId(problemId);
    setActiveContestId(contestId ?? null);
    if (contestId) {
      setSelectedContestId(contestId);
    }
    setArenaBackView(contestId ? 'contests' : 'problems');
    setView('arena');
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-ide-bg text-ide-text overflow-hidden">
      {/* Dynamic programming background code floating drift */}
      {view !== 'arena' && <BackgroundCodeParticles isLanding={view === 'landing'} />}

      {/* Sticky header */}
      <Navbar 
        onAuth={triggerAuth} 
        currentView={view} 
        onViewChange={handleViewChange} 
        user={user}
        onLogout={handleLogout}
      />

      {/* Main landing container */}
      <main className="flex-grow">
        {view === 'landing' ? (
          <>
            {/* Interactive hero with VS-Code/Leetcode compiler */}
            <Hero onStartSolving={() => user ? setView('problems') : triggerAuth('signup')} />

            {/* Dynamic statistics metrics counters */}
            <Stats />

            {/* Sandboxed execution and rating lists features grid */}
            <Features />

            {/* Live and Upcoming scheduling contests section */}
            <ActiveContests onAction={() => user ? setView('contests') : triggerAuth('login')} />
          </>
        ) : view === 'problems' ? (
          <ProblemsDashboard onSelectProblem={handleSelectProblem} user={user} />
        ) : view === 'submissions' ? (
          <SubmissionsDashboard user={user} triggerAuth={triggerAuth} />
        ) : view === 'leaderboard' ? (
          <Leaderboard user={user} triggerAuth={triggerAuth} />
        ) : view === 'contests' ? (
          <ContestsDashboard 
            user={user} 
            triggerAuth={triggerAuth} 
            onSelectProblem={handleSelectProblem}
            selectedContestId={selectedContestId}
            setSelectedContestId={setSelectedContestId}
          />
        ) : view === 'users' ? (
          <UsersDashboard user={user} />
        ) : (
          <CodingArena 
            problemId={selectedProblemId} 
            contestId={activeContestId}
            onBack={() => setView(arenaBackView)} 
            triggerAuth={triggerAuth} 
            user={user}
            onNavigateToSubmissions={() => setView('submissions')}
          />
        )}
      </main>

      {/* Professional footer with logo copyright and direct links */}
      {view !== 'arena' && <Footer />}

      {/* Authentication Sign In / Registration Modal Prompt Overlay */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialMode={authMode} 
        onSuccess={(data) => {
          setUser(data);
          setView('problems');
        }}
      />
    </div>
  );
}
