import { useState, useEffect } from 'react';
import { Trophy, Award, Medal, Search, Loader2 } from 'lucide-react';

interface Rank {
  rank: number;
  username: string;
  rating: number;
  solvedCount: number;
}

interface UserSession {
  id: number;
  username: string;
  email: string;
  roles: string[];
  jwtToken?: string;
  token?: string;
}

interface LeaderboardProps {
  user: UserSession | null;
  triggerAuth: (mode?: 'login' | 'signup') => void;
}

export default function Leaderboard({ user, triggerAuth }: LeaderboardProps) {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (user && (user.jwtToken || user.token)) {
        headers['Authorization'] = `Bearer ${user.jwtToken || user.token}`;
      }

      const response = await fetch('/api/users/leaderboard', { headers });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setRanks(data);
        } else {
          setRanks([]);
        }
      } else {
        setRanks([]);
      }
    } catch (e) {
      console.error('Error fetching leaderboard:', e);
      setRanks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const filteredRanks = ranks.filter(r => 
    r.username.toLowerCase().includes(search.toLowerCase())
  );

  const getRatingBadge = (rating: number) => {
    if (rating >= 2400) {
      return (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-rose-50 text-rose-700 border border-rose-200">
          Legendary Grandmaster
        </span>
      );
    } else if (rating >= 2200) {
      return (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-orange-50 text-orange-700 border border-orange-200">
          Master
        </span>
      );
    } else if (rating >= 1900) {
      return (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-violet-50 text-violet-700 border border-violet-200">
          Candidate Master
        </span>
      );
    } else if (rating >= 1600) {
      return (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
          Expert
        </span>
      );
    } else if (rating >= 1400) {
      return (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-cyan-50 text-cyan-700 border border-cyan-200">
          Specialist
        </span>
      );
    } else if (rating >= 1200) {
      return (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
          Pupil
        </span>
      );
    } else {
      return (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-slate-100 text-slate-700 border border-slate-200">
          Newbie
        </span>
      );
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-amber-500 fill-amber-100" />;
      case 2:
        return <Medal className="h-5 w-5 text-slate-400 fill-slate-100" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-700 fill-orange-50" />;
      default:
        return <span className="font-mono text-slate-400 font-bold">#{rank}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 text-left animate-float">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Leaderboard</h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Global rankings based on accepted problem solutions, submission velocity, and contest performance ratings.
          </p>
        </div>
        {!user && (
          <button
            onClick={() => triggerAuth('login')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold px-5 py-3 rounded-2xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
          >
            Sign In to Join Ranks
          </button>
        )}
      </div>

      {/* Top 3 Podiums */}
      {filteredRanks.length >= 3 && search === '' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Second Place */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative md:order-1 order-2 mt-4 md:mt-8">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-100 border border-slate-200 p-2.5 rounded-2xl">
              <Medal className="h-6 w-6 text-slate-400 fill-slate-50" />
            </div>
            <div className="mt-4 font-black text-slate-900 text-lg">{filteredRanks[1].username}</div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">2nd Place</div>
            <div className="flex gap-4 mt-4 w-full border-t border-slate-100 pt-4 text-sm font-semibold">
              <div className="flex-1 text-slate-500">
                <span className="block text-slate-900 font-extrabold">{filteredRanks[1].solvedCount}</span>
                Solved
              </div>
              <div className="flex-1 text-slate-500 border-l border-slate-100">
                <span className="block text-blue-600 font-black">{filteredRanks[1].rating}</span>
                Contest Rating
              </div>
            </div>
          </div>

          {/* First Place */}
          <div className="bg-gradient-to-b from-blue-50/50 to-white border-2 border-blue-200/80 rounded-3xl p-8 shadow-md flex flex-col items-center text-center relative md:order-2 order-1 transform md:-translate-y-2">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-50 border-2 border-amber-200 p-3 rounded-2xl shadow-md">
              <Trophy className="h-7 w-7 text-amber-500 fill-amber-100 animate-bounce" />
            </div>
            <div className="mt-4 font-black text-slate-900 text-xl">{filteredRanks[0].username}</div>
            <div className="text-amber-600 text-xs font-black uppercase tracking-widest mt-1 flex items-center gap-1">
              🏆 Champion
            </div>
            <div className="flex gap-4 mt-6 w-full border-t border-slate-100 pt-4 text-sm font-semibold">
              <div className="flex-1 text-slate-500">
                <span className="block text-slate-900 font-extrabold">{filteredRanks[0].solvedCount}</span>
                Solved
              </div>
              <div className="flex-1 text-slate-500 border-l border-slate-100">
                <span className="block text-blue-600 font-black">{filteredRanks[0].rating}</span>
                Contest Rating
              </div>
            </div>
          </div>

          {/* Third Place */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative md:order-3 order-3 mt-4 md:mt-8">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-50 border border-orange-200 p-2.5 rounded-2xl">
              <Award className="h-6 w-6 text-amber-700 fill-orange-50" />
            </div>
            <div className="mt-4 font-black text-slate-900 text-lg">{filteredRanks[2].username}</div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">3rd Place</div>
            <div className="flex gap-4 mt-4 w-full border-t border-slate-100 pt-4 text-sm font-semibold">
              <div className="flex-1 text-slate-500">
                <span className="block text-slate-900 font-extrabold">{filteredRanks[2].solvedCount}</span>
                Solved
              </div>
              <div className="flex-1 text-slate-500 border-l border-slate-100">
                <span className="block text-blue-600 font-black">{filteredRanks[2].rating}</span>
                Contest Rating
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table Section */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100 overflow-hidden">
        {/* Table Filters */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="h-4.5 w-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by username..."
              className="w-full bg-white border border-slate-200/80 rounded-2xl pl-11 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-blue-500 shadow-sm text-slate-800"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-center w-24">Rank</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4 text-center">Problems Solved</th>
                <th className="px-6 py-4 text-center">Contest Rating</th>
                <th className="px-6 py-4 text-center">Level Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span>Loading ranking tables...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRanks.map((item) => {
                  const isCurrentUser = user && user.username === item.username;
                  return (
                    <tr 
                      key={item.username}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isCurrentUser ? 'bg-blue-50/40 ring-1 ring-inset ring-blue-200/60' : ''
                      }`}
                    >
                      <td className="px-6 py-4.5 text-center flex items-center justify-center h-full min-h-[58px]">
                        {getRankIcon(item.rank)}
                      </td>
                      <td className="px-6 py-4.5 text-slate-900 font-bold">
                        <div className="flex items-center gap-2">
                          <span>{item.username}</span>
                          {isCurrentUser && (
                            <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-center font-mono text-slate-700">
                        {item.solvedCount} solved
                      </td>
                      <td className="px-6 py-4.5 text-center font-mono font-black text-blue-600">
                        {item.rating}
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        {getRatingBadge(item.rating)}
                      </td>
                    </tr>
                  );
                })
              )}

              {!loading && filteredRanks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    No coders found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
