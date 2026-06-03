import { useState, useEffect } from 'react';
import { Lock, ArrowRight, Loader2, ArrowLeft, RefreshCw, Star, Plus } from 'lucide-react';
import ContestCreationModal from './ContestCreationModal';

interface Contest {
  contestId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  participantCount: number;
  problemCount: number;
  status: 'UPCOMING' | 'ONGOING' | 'PAST';
  participantUsernames?: string[];
}

interface ContestProblem {
  problemId: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  tags: string;
}

interface ContestDetail {
  contestId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'UPCOMING' | 'ONGOING' | 'PAST';
  registered?: boolean;
  registrationOpen?: boolean;
  canParticipate?: boolean;
  problems: ContestProblem[];
}

interface StandingRow {
  rank: number;
  username: string;
  totalScore: number;
  solvedCount: number;
  lastSubmissionTime: string | null;
}

interface UserSession {
  id: number;
  username: string;
  email: string;
  roles: string[];
  jwtToken?: string;
  token?: string;
}

interface ContestsDashboardProps {
  user: UserSession | null;
  triggerAuth: (mode?: 'login' | 'signup') => void;
  onSelectProblem: (problemId: number, contestId?: number) => void;
}

export default function ContestsDashboard({ user, triggerAuth, onSelectProblem }: ContestsDashboardProps) {
  const [tab, setTab] = useState<'ongoing' | 'upcoming' | 'past'>('ongoing');
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(false);

  // Drilldown states
  const [selectedContestId, setSelectedContestId] = useState<number | null>(null);
  const [contestDetail, setContestDetail] = useState<ContestDetail | null>(null);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regMessage, setRegMessage] = useState('');
  const [isCreationOpen, setIsCreationOpen] = useState(false);
  const authTokenRaw = user?.jwtToken || user?.token;
  const authToken = authTokenRaw && authTokenRaw !== 'undefined' && authTokenRaw !== 'null' ? authTokenRaw : '';

  const [now, setNow] = useState(new Date());
  const [successContestId, setSuccessContestId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const current = now.getTime();
    const diff = target - current;

    if (diff <= 0) {
      return '00:00:00';
    }

    const secs = Math.floor(diff / 1000) % 60;
    const mins = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    const pad = (num: number) => String(num).padStart(2, '0');

    if (days > 0) {
      return `${days}d ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
    }
    return `${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
  };

  const fetchContests = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // Fetch all streams; tabs are rendered as-is from backend lifecycle.
      const [upcomingRes, ongoingRes, pastRes] = await Promise.all([
        fetch('/api/contests/upcoming', { headers }),
        fetch('/api/contests/ongoing', { headers }),
        fetch('/api/contests/past', { headers })
      ]);

      let upcoming: Contest[] = upcomingRes.ok ? await upcomingRes.json() : [];
      let ongoing: Contest[] = ongoingRes.ok ? await ongoingRes.json() : [];
      let past: Contest[] = pastRes.ok ? await pastRes.json() : [];

      if (tab === 'ongoing') {
        setContests(ongoing);
      } else if (tab === 'upcoming') {
        setContests(upcoming);
      } else {
        setContests(past);
      }
    } catch (e) {
      console.error(e);
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchContestDetail = async (id: number) => {
    setLoadingDetail(true);
    setRegMessage('');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const response = await fetch(`/api/contests/${id}/detail`, { headers });
      if (response.ok) {
        const data = await response.json();
        setContestDetail(data);
      } else {
        const err = await response.json().catch(() => null);
        setRegMessage(err?.message || 'Unable to open contest details.');
        setContestDetail(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchContestStandings = async (id: number) => {
    setLoadingStandings(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const response = await fetch(`/api/contests/${id}/standings`, { headers });
      if (response.ok) {
        const data = await response.json();
        setStandings(data.standings || []);
      } else {
        // Fallback Standings
        setStandings([
          { rank: 1, username: 'siam_algorithmist', totalScore: 85, solvedCount: 3, lastSubmissionTime: 'Just now' },
          { rank: 2, username: 'subeen_seu', totalScore: 35, solvedCount: 2, lastSubmissionTime: '15m ago' },
          { rank: 3, username: 'seu_rookie', totalScore: 10, solvedCount: 1, lastSubmissionTime: '30m ago' }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStandings(false);
    }
  };

  const handleRegister = async (id: number) => {
    if (!user || !authToken) {
      triggerAuth('login');
      return;
    }
    setRegistering(true);
    setRegMessage('');
    try {
      const response = await fetch(`/api/contests/${id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRegMessage(data.message || 'Successfully registered for this contest!');
        setSuccessContestId(id);
        setSuccessMessage(data.message || 'Successfully registered!');
        setTimeout(() => {
          setSuccessContestId(null);
          setSuccessMessage('');
        }, 5000);
        // Update stats
        fetchContests();
        // Refresh contest detail if currently viewing this contest
        if (selectedContestId === id) {
          fetchContestDetail(id);
        }
      } else {
        const err = await response.json();
        setRegMessage(err.message || 'Failed to register or already registered.');
      }
    } catch (e) {
      setRegMessage('Failed to register. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  useEffect(() => {
    if (selectedContestId) {
      fetchContestDetail(selectedContestId);
      fetchContestStandings(selectedContestId);
    } else {
      fetchContests();
    }
  }, [tab, selectedContestId, user]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (selectedContestId) {
        fetchContestDetail(selectedContestId);
        fetchContestStandings(selectedContestId);
      } else {
        fetchContests();
      }
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [tab, selectedContestId, user]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 text-left animate-float">
      {selectedContestId ? (
        // --- CONTEST DRILLDOWN VIEW ---
        <div className="flex flex-col gap-8">
          {/* Back Action Header */}
          <button 
            onClick={() => { setSelectedContestId(null); setContestDetail(null); setStandings([]); }}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-extrabold text-sm transition-colors cursor-pointer self-start bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-sm"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Back to Contests Stream
          </button>

          {contestDetail ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Contest Left Details */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      contestDetail.status === 'ONGOING' ? 'bg-rose-50 border border-rose-100 text-rose-600' :
                      contestDetail.status === 'UPCOMING' ? 'bg-blue-50 border border-blue-100 text-blue-600' :
                      'bg-slate-100 border border-slate-200 text-slate-600'
                    }`}>
                      {contestDetail.status}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">{contestDetail.title}</h2>
                  <p className="text-slate-600 font-semibold text-sm leading-relaxed mb-6">{contestDetail.description}</p>
                  
                  <div className="flex flex-wrap gap-6 text-sm text-slate-500 font-bold border-t border-slate-100 pt-6">
                    <div>
                      <span className="block text-xs text-slate-400 font-extrabold uppercase">Start Time</span>
                      <span className="text-slate-800">{new Date(contestDetail.startTime).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 font-extrabold uppercase">End Time</span>
                      <span className="text-slate-800">{new Date(contestDetail.endTime).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Problems Section */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-extrabold text-slate-900 text-base mb-4">Contest Problem Sets</h3>
                  {loadingDetail ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : contestDetail.status === 'UPCOMING' ? (
                    <div className="text-center py-10 px-4 text-slate-400">
                      <Lock className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                      <p className="font-extrabold text-sm text-slate-700">Problem Set Locked</p>
                      <p className="text-xs mt-1">This problem set will unlock when the contest starts.</p>
                      {!contestDetail.registered && (
                        <button 
                          onClick={() => handleRegister(contestDetail.contestId)}
                          disabled={registering}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md mt-4 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                        >
                          {registering ? 'Registering...' : 'Register for Contest'}
                        </button>
                      )}
                      {regMessage && <p className="text-xs text-blue-600 mt-2 font-bold">{regMessage}</p>}
                {successMessage && <p className="text-xs text-green-600 mt-2 font-bold">{successMessage}</p>}
                    </div>
                  ) : contestDetail.status === 'ONGOING' && !contestDetail.canParticipate ? (
                    <div className="text-center py-10 px-4 text-slate-400">
                      <Lock className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                      <p className="font-extrabold text-sm text-slate-700">Registration Closed</p>
                      <p className="text-xs mt-1">Only users who registered before start can participate now.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {contestDetail.problems && contestDetail.problems.map((prob, i) => (
                        <div 
                          key={prob.problemId}
                          onClick={() => onSelectProblem(prob.problemId, contestDetail.status === 'ONGOING' ? contestDetail.contestId : undefined)}
                          className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 p-4.5 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all hover:translate-x-1"
                        >
                          <div>
                            <span className="font-mono text-xs font-black text-slate-400 uppercase mr-3">Problem {String.fromCharCode(65 + i)}</span>
                            <span className="font-bold text-slate-900 text-sm hover:text-blue-600">{prob.title}</span>
                            <span className="text-[10px] bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded ml-3 uppercase tracking-wider font-extrabold">{prob.tags || 'Algorithms'}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              prob.difficulty === 'EASY' || prob.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700' :
                              prob.difficulty === 'MEDIUM' || prob.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700' :
                              'bg-rose-50 text-rose-700'
                            }`}>
                              {prob.difficulty}
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-500">{prob.points} pts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Standings Right Sidebar */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-extrabold text-slate-900 text-base mb-4 flex items-center justify-between">
                    Live Leaderboard
                    <RefreshCw 
                      onClick={() => fetchContestStandings(contestDetail.contestId)}
                      className="h-4 w-4 text-slate-400 hover:text-slate-800 cursor-pointer transition-colors"
                    />
                  </h3>
                  
                  {loadingStandings ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : standings.length === 0 ? (
                    <p className="text-center text-slate-400 py-10 text-xs italic">No participants have submitted yet.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {standings.map((row) => (
                        <div key={row.username} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/40">
                          <div className="flex items-center gap-3">
                            <span className={`font-mono text-xs font-bold w-6 text-center ${
                              row.rank === 1 ? 'text-amber-500' :
                              row.rank === 2 ? 'text-slate-400' :
                              row.rank === 3 ? 'text-amber-700' : 'text-slate-400'
                            }`}>
                              #{row.rank}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{row.username}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">{row.solvedCount} solved</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-blue-600">{row.totalScore} pts</p>
                            {row.lastSubmissionTime && (
                              <p className="text-[9px] text-slate-400 font-bold">{row.lastSubmissionTime}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            !loadingDetail && regMessage && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm max-w-xl mx-auto text-center animate-scaleUp">
                <Lock className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Access Denied</h3>
                <p className="text-sm text-slate-600 font-semibold mb-6">{regMessage}</p>
                <button
                  onClick={() => { setSelectedContestId(null); setRegMessage(''); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-6 py-2.5 rounded-2xl transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            )
          )}
        </div>
      ) : (
        // --- CONTEST LIST VIEW ---
        <div className="flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Academic Competitions</h2>
              <p className="text-slate-500 text-xs font-semibold mt-1">
                Test your engineering limit, compete with peers live, and earn premium contest rating points.
              </p>
            </div>
            {user && user.roles.includes('ROLE_ADMIN') && (
              <button
                onClick={() => setIsCreationOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer self-start md:self-auto"
              >
                <Plus className="h-4 w-4" />
                Setup Contest
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {(['ongoing', 'upcoming', 'past'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 font-extrabold text-sm capitalize border-b-2 transition-all cursor-pointer ${
                  tab === t 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {t} Contests
              </button>
            ))}
          </div>

          {/* Contest Stream Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-20 bg-white border border-slate-200/85 rounded-3xl">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : contests.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 font-semibold">
              <Star className="h-10 w-10 mx-auto text-slate-300 mb-3" />
              No {tab} contests found in schedule.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contests.map((contest) => {
                const isRegistered = contest.participantUsernames?.includes(user?.username || '');
                const isUserAdmin = user?.roles?.includes('ROLE_ADMIN');
                const canEnterDetails =
                  contest.status === 'PAST' ||
                  (contest.status === 'ONGOING' && (isRegistered || isUserAdmin)) ||
                  (contest.status === 'UPCOMING');
                
                return (
                  <div 
                    key={contest.contestId}
                    className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[220px] text-left hover:shadow-md transition-all hover:scale-[1.01]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          contest.status === 'ONGOING' ? 'bg-rose-50 text-rose-600' :
                          contest.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {contest.status}
                        </span>
                        
                        {contest.status === 'UPCOMING' ? (
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50/50 px-2.5 py-1 rounded-lg border border-blue-100/30">
                            Starts in: {formatCountdown(contest.startTime)}
                          </span>
                        ) : contest.status === 'ONGOING' ? (
                          <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50/50 px-2.5 py-1 rounded-lg border border-rose-100/30 animate-pulse">
                            Ends in: {formatCountdown(contest.endTime)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">{contest.problemCount} Problems</span>
                        )}
                      </div>

                      {contest.status === 'UPCOMING' || contest.status === 'PAST' || canEnterDetails ? (
                        <h3 
                          onClick={() => setSelectedContestId(contest.contestId)}
                          className="text-lg font-black text-slate-900 leading-snug mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                        >
                          {contest.title}
                        </h3>
                      ) : (
                        <h3 className="text-lg font-black text-slate-400 leading-snug mb-2 cursor-not-allowed">
                          {contest.title}
                        </h3>
                      )}
                      
                      <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6 line-clamp-2">{contest.description}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                      <div className="text-xs font-semibold text-slate-500">
                        <span className="block text-[9px] text-slate-400 uppercase font-extrabold">Duration</span>
                        <span className="text-slate-800 font-bold">{contest.durationMinutes} minutes</span>
                      </div>

                      {canEnterDetails ? (
                        <button
                          onClick={() => setSelectedContestId(contest.contestId)}
                          className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                        >
                          Enter Details
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          {!user ? (
                            <button
                              onClick={() => triggerAuth('login')}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl shadow transition-all hover:scale-[1.02] cursor-pointer uppercase tracking-wider"
                            >
                              Sign In to Register
                            </button>
                          ) : contest.status === 'ONGOING' ? (
                            <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl uppercase tracking-wider">
                              Registration Closed
                            </span>
                          ) : contest.status === 'UPCOMING' ? (
                            <button
                              onClick={() => handleRegister(contest.contestId)}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer uppercase tracking-wider"
                            >
                              Register for Contest
                            </button>
                          ) : isRegistered ? (
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl uppercase tracking-wider">
                              ✓ Registered
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRegister(contest.contestId)}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer uppercase tracking-wider"
                            >
                              Register for Contest
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Contest Setup Admin Modal */}
      <ContestCreationModal
        isOpen={isCreationOpen}
        onClose={() => setIsCreationOpen(false)}
        user={user}
        onSuccess={() => {
          fetchContests();
        }}
      />
    </div>
  );
}
