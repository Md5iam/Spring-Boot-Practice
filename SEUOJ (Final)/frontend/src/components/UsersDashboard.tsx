import { useState, useEffect } from 'react';
import { Search, ShieldAlert, ShieldAlert as UserMinus, ShieldCheck as UserCheck, ShieldCheck, AlertCircle, Ban, Star, Loader2 } from 'lucide-react';

interface UserDTO {
  userId: number;
  userName: string;
  email: string;
  rating: number;
  solvedCount: number;
  isBanned: boolean;
  joinedDate?: string;
}

interface UserSession {
  id: number;
  username: string;
  email: string;
  roles: string[];
  jwtToken?: string;
  token?: string;
}

interface UsersDashboardProps {
  user: UserSession | null;
}

export default function UsersDashboard({ user }: UsersDashboardProps) {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Ban Modal state
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (user && (user.jwtToken || user.token)) {
        headers['Authorization'] = `Bearer ${user.jwtToken || user.token}`;
      }
      const response = await fetch('/api/admin/users', { headers });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.roles?.includes('ROLE_ADMIN')) {
      fetchUsers();
    }
  }, [user]);

  const handleOpenBanModal = (targetUser: UserDTO) => {
    setSelectedUser(targetUser);
    setBanReason('');
    setBanDuration('');
    setActionError('');
    setActionSuccess('');
    setBanModalOpen(true);
  };

  const handleBanUser = async () => {
    if (!selectedUser || !user) return;
    if (!banReason.trim()) {
      setActionError('Ban reason is required.');
      return;
    }

    try {
      const token = user.jwtToken || user.token;
      let url = `/api/admin/users/${selectedUser.userId}/ban?reason=${encodeURIComponent(banReason)}`;
      if (banDuration && parseInt(banDuration) > 0) {
        url += `&durationMinutes=${parseInt(banDuration)}`;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setActionSuccess(`User @${selectedUser.userName} has been banned.`);
        setTimeout(() => {
          setBanModalOpen(false);
          fetchUsers();
        }, 1500);
      } else {
        const err = await response.json();
        setActionError(err.message || 'Failed to ban user.');
      }
    } catch (e) {
      setActionError('Server connection error.');
    }
  };

  const handleUnbanUser = async (targetUser: UserDTO) => {
    if (!user) return;
    try {
      const token = user.jwtToken || user.token;
      const response = await fetch(`/api/admin/users/${targetUser.userId}/unban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error('Failed to unban user:', e);
    }
  };

  const handlePromoteUser = async (targetUser: UserDTO) => {
    if (!user) return;
    try {
      const token = user.jwtToken || user.token;
      const response = await fetch(`/api/admin/users/${targetUser.userId}/promote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error('Failed to promote user:', e);
    }
  };

  const getRankName = (rating: number) => {
    if (rating >= 2400) return { name: 'Grandmaster', style: 'text-red-600 font-extrabold' };
    if (rating >= 2200) return { name: 'Master', style: 'text-orange-500 font-extrabold' };
    if (rating >= 1900) return { name: 'Candidate Master', style: 'text-violet-500 font-bold' };
    if (rating >= 1600) return { name: 'Expert', style: 'text-blue-500 font-bold' };
    if (rating >= 1400) return { name: 'Specialist', style: 'text-cyan-500 font-bold' };
    if (rating >= 1200) return { name: 'Pupil', style: 'text-green-500 font-semibold' };
    return { name: 'Newbie', style: 'text-slate-400 font-semibold' };
  };

  const filteredUsers = users.filter(u =>
    u.userName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 text-slate-800">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <ShieldAlert className="h-8 w-8 text-blue-600" />
            User Management Portal
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Admin console to ban, unban, promote or inspect registered contestant accounts.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white border border-slate-200/85 rounded-3xl">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 font-semibold">
          <Star className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          No users match your query.
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden border-collapse">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Rank / Rating</th>
                  <th className="px-6 py-4">Solved Problems</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredUsers.map((u) => {
                  const rank = getRankName(u.rating);
                  return (
                    <tr key={u.userId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <span className="block text-sm font-extrabold text-slate-900">@{u.userName}</span>
                          <span className="block text-xs text-slate-400 font-medium">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`block text-xs uppercase tracking-wide font-black ${rank.style}`}>
                          {rank.name}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">Rating: {u.rating}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-900 font-bold">{u.solvedCount}</span> solved
                      </td>
                      <td className="px-6 py-4">
                        {u.isBanned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100">
                            <Ban className="h-3 w-3" />
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <ShieldCheck className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {u.isBanned ? (
                            <button
                              onClick={() => handleUnbanUser(u)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenBanModal(u)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <UserMinus className="h-3.5 w-3.5" />
                              Ban Account
                            </button>
                          )}
                          
                          <button
                            onClick={() => handlePromoteUser(u)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            Promote Admin
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ban Input Modal */}
      {banModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200/80 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Ban Account</h3>
                <p className="text-slate-400 text-xs font-semibold">User: @{selectedUser.userName}</p>
              </div>
            </div>

            {actionError && (
              <div className="bg-rose-50 border border-rose-200/60 rounded-2xl p-3 flex items-start gap-2.5 mb-4 text-xs font-bold text-rose-600">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            {actionSuccess && (
              <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-3 flex items-start gap-2.5 mb-4 text-xs font-bold text-emerald-600">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{actionSuccess}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Reason for Ban</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="e.g. Repeated plagiarism detected, inappropriate submission content..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-250/80 rounded-2xl px-4 py-3 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Duration (minutes, optional)</label>
                <input
                  type="number"
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  placeholder="Leave empty for permanent ban"
                  className="w-full bg-slate-50 border border-slate-250/80 rounded-2xl px-4 py-3 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setBanModalOpen(false)}
                className="px-4 py-2.5 border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBanUser}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl shadow transition-colors cursor-pointer"
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
