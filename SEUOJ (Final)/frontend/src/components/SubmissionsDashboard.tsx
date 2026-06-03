import { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, X, ExternalLink, Calendar, Cpu, Layers } from 'lucide-react';

interface Submission {
  submissionId: number;
  problemId: number;
  problemTitle: string;
  userId: number;
  username: string;
  language: string;
  status: string;
  executionTimeMs: number;
  memoryUsedKb: number;
  submittedAt: string;
}

interface SubmissionDetail {
  submissionId: number;
  problemId: number;
  problemTitle: string;
  userId: number;
  username: string;
  code: string;
  language: string;
  status: string;
  executionTimeMs: number;
  memoryUsedKb: number;
  errorMessage: string | null;
  submittedAt: string;
}

interface UserSession {
  id: number;
  username: string;
  email: string;
  roles: string[];
  jwtToken?: string;
  token?: string;
}

interface SubmissionsDashboardProps {
  user: UserSession | null;
  triggerAuth: (mode?: 'login' | 'signup') => void;
}

export default function SubmissionsDashboard({ user, triggerAuth }: SubmissionsDashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal detail views state
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchSubmissions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let url = '/api/submissions?pageSize=100&sortBy=submittedAt&sortOrder=desc';
      if (searchUser) {
        url += `&username=${encodeURIComponent(searchUser)}`;
      }
      if (filterStatus !== 'ALL') {
        url += `&status=${filterStatus}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user.jwtToken || user.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.content || [];
        // Sort client-side by submittedAt descending as a safety net
        const sorted = [...content].sort((a: any, b: any) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
        setSubmissions(sorted.map((sub: any) => ({
          submissionId: sub.submissionId,
          problemId: sub.problemId,
          problemTitle: sub.problemTitle,
          userId: sub.userId,
          username: sub.username,
          language: sub.language,
          status: sub.status,
          executionTimeMs: sub.executionTimeMs || 0,
          memoryUsedKb: sub.memoryUsedKb || 0,
          submittedAt: sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'Just now'
        })));
      }
    } catch (e) {
      console.error('Error fetching submissions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user, filterStatus]);

  // Auto-refresh when there are PENDING submissions
  useEffect(() => {
    const hasPending = submissions.some(s => s.status === 'PENDING');
    if (!hasPending || !user) return;

    const interval = setInterval(() => {
      fetchSubmissions();
    }, 3000);

    return () => clearInterval(interval);
  }, [submissions, user]);

  // Debounced/Triggered search by username
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchSubmissions();
    }
  };

  const handleOpenDetail = async (subId: number) => {
    if (!user) return;
    setSelectedSubId(subId);
    setLoadingDetail(true);
    try {
      const response = await fetch(`/api/submissions/${subId}`, {
        headers: {
          'Authorization': `Bearer ${user.jwtToken || user.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDetail({
          submissionId: data.submissionId,
          problemId: data.problemId,
          problemTitle: data.problemTitle,
          userId: data.userId,
          username: data.username,
          code: data.code,
          language: data.language,
          status: data.status,
          executionTimeMs: data.executionTimeMs || 0,
          memoryUsedKb: data.memoryUsedKb || 0,
          errorMessage: data.errorMessage,
          submittedAt: data.submittedAt ? new Date(data.submittedAt).toLocaleString() : 'Just now'
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 text-left animate-float">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Submission Stream</h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Browse compilation audits, evaluation status logs, and execute records across SEUOJ.
          </p>
        </div>
      </div>

      {!user ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-xl shadow-slate-100 flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-slate-300" />
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg">Authentication Needed</h3>
            <p className="text-slate-400 text-sm font-semibold max-w-sm mt-1 leading-relaxed">
              Sign in to view real-time system executions, test suites statistics, and user source codes.
            </p>
          </div>
          <button
            onClick={() => triggerAuth('login')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold px-6 py-3 rounded-2xl shadow-md cursor-pointer"
          >
            Authenticate Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Filters Area */}
          <div className="bg-white border border-slate-200/85 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="h-4.5 w-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                placeholder="Search user submissions (Press Enter)..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800 focus:bg-white transition-all"
              />
            </div>
            
            {/* Status filters selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Filter Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl text-xs font-extrabold text-slate-600 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="WRONG_ANSWER">Wrong Answer</option>
                <option value="TIME_LIMIT_EXCEEDED">Time Limit Exceeded</option>
                <option value="MEMORY_LIMIT_EXCEEDED">Memory Limit Exceeded</option>
                <option value="COMPILATION_ERROR">Compilation Error</option>
                <option value="RUNTIME_ERROR">Runtime Error</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>

          {/* Submissions List Container */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4.5 text-center w-20">ID</th>
                    <th className="px-6 py-4.5">Problem Title</th>
                    <th className="px-6 py-4.5">Author</th>
                    <th className="px-6 py-4.5">Language</th>
                    <th className="px-6 py-4.5">Status</th>
                    <th className="px-6 py-4.5">Runtime</th>
                    <th className="px-6 py-4.5">Memory</th>
                    <th className="px-6 py-4.5 text-right">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          <span>Streaming submissions...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub, index) => (
                      <tr 
                        key={sub.submissionId}
                        onClick={() => handleOpenDetail(sub.submissionId)}
                        className={`hover:bg-slate-50/60 cursor-pointer transition-colors ${index === 0 ? 'bg-blue-50/40 ring-1 ring-inset ring-blue-200/60' : ''}`}
                      >
                        <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs">
                          #{sub.submissionId}
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-bold hover:text-blue-600 transition-colors flex items-center gap-1.5">
                          {sub.problemTitle}
                          <ExternalLink className="h-3 w-3 text-slate-300" />
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {sub.username}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          {sub.language}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                            sub.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700' :
                            sub.status === 'PENDING' ? 'bg-amber-50 text-amber-600 animate-pulse' :
                            'bg-rose-50 text-rose-700'
                          }`}>
                            {sub.status === 'PENDING' && <Loader2 className="h-3 w-3 animate-spin" />}
                            {sub.status === 'PENDING' ? 'Judging...' : sub.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                          {sub.executionTimeMs} ms
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                          {(sub.memoryUsedKb / 1024).toFixed(2)} MB
                        </td>
                        <td className="px-6 py-4 text-right text-[10px] text-slate-400 font-bold">
                          {sub.submittedAt}
                        </td>
                      </tr>
                    ))
                  )}

                  {!loading && submissions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400 italic">
                        No submissions matching the search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Submission Detail Overlay Modal */}
      {selectedSubId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh] animate-scaleUp text-left">
            
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="font-extrabold text-slate-900 text-lg">Submission Details</h3>
                <span className="text-slate-400 text-xs font-mono">#{selectedSubId}</span>
              </div>
              <button 
                onClick={() => {
                  setSelectedSubId(null);
                  setDetail(null);
                }}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
              {loadingDetail || !detail ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="text-xs font-semibold">Retrieving execution record...</span>
                </div>
              ) : (
                <>
                  {/* Status metrics grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-1">Status</span>
                      <span className={`text-sm font-black uppercase ${
                        detail.status === 'ACCEPTED' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {detail.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-1">Time Limit Usage</span>
                      <div className="flex items-center gap-1 text-slate-800 font-mono text-sm font-bold">
                        <Cpu className="h-4 w-4 text-slate-400" />
                        {detail.executionTimeMs} ms
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-1">Memory Footprint</span>
                      <div className="flex items-center gap-1 text-slate-800 font-mono text-sm font-bold">
                        <Layers className="h-4 w-4 text-slate-400" />
                        {(detail.memoryUsedKb / 1024).toFixed(2)} MB
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-1">Language</span>
                      <span className="text-slate-800 text-sm font-extrabold uppercase">{detail.language}</span>
                    </div>
                  </div>

                  {/* Submission metadata info list */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 text-slate-500 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Problem:</span>
                      <span className="text-slate-900 font-bold">{detail.problemTitle}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Submitted by:</span>
                      <span className="text-slate-900 font-bold">{detail.username}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{detail.submittedAt}</span>
                    </div>
                  </div>

                  {/* Code Editor */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Submitted Code</label>
                    <pre className="bg-[#FAFBFD] border border-slate-200/60 p-5 rounded-2xl font-mono text-xs text-slate-800 overflow-x-auto whitespace-pre font-bold max-h-64">
                      {detail.code}
                    </pre>
                  </div>

                  {/* Compiling / Sandbox Error Logs */}
                  {detail.errorMessage && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Compiler stderr</label>
                      <pre className="bg-rose-950 text-rose-300 border border-rose-900 p-4 rounded-2xl font-mono text-xs overflow-x-auto whitespace-pre-wrap font-bold">
                        {detail.errorMessage}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
