import { useState, useEffect } from 'react';
import { Search, CheckCircle2, Circle, AlertCircle, Sparkles, Flame, HelpCircle, Loader2, Plus, Eye } from 'lucide-react';
import ProblemCreationModal from './ProblemCreationModal';
import ProblemReviewModal from './ProblemReviewModal';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acceptance: string;
  category: string;
  points: number;
  status: 'solved' | 'unsolved' | 'attempted';
}

interface PendingProblem {
  problemId: number;
  title: string;
  difficulty: string;
  tags: string;
  description: string;
}

interface UserSession {
  id: number;
  username: string;
  email: string;
  roles: string[];
  jwtToken?: string;
  token?: string;
}

interface ProblemsDashboardProps {
  onSelectProblem: (problemId: number) => void;
  user: UserSession | null;
}

export default function ProblemsDashboard({ onSelectProblem, user }: ProblemsDashboardProps) {
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Problem creation modal state
  const [isCreationOpen, setIsCreationOpen] = useState(false);

  // Admin approval queue state
  const [pendingProblems, setPendingProblems] = useState<PendingProblem[]>([]);
  const [reviewProblemId, setReviewProblemId] = useState<number | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const dummyProblemsList: Problem[] = [
    { id: 1, title: 'Two Sum Resolution', difficulty: 'Easy', acceptance: '82.4%', category: 'Arrays', points: 10, status: 'solved' },
    { id: 2, title: 'Add Two Polynomials', difficulty: 'Medium', acceptance: '56.1%', category: 'Linked Lists', points: 25, status: 'attempted' },
    { id: 3, title: 'Department Graph Shortest Path', difficulty: 'Hard', acceptance: '34.8%', category: 'Graphs', points: 50, status: 'unsolved' },
    { id: 4, title: 'Quick Sort Partition Resolver', difficulty: 'Easy', acceptance: '74.2%', category: 'Sorting', points: 15, status: 'solved' },
    { id: 5, title: 'Dynamic Knapsack Weights', difficulty: 'Hard', acceptance: '28.1%', category: 'Dynamic Programming', points: 60, status: 'unsolved' },
    { id: 6, title: 'Valid Parentheses Checker', difficulty: 'Easy', acceptance: '89.0%', category: 'Stacks', points: 10, status: 'solved' },
    { id: 7, title: 'Binary Tree Level Average', difficulty: 'Medium', acceptance: '61.7%', category: 'Trees', points: 30, status: 'unsolved' },
    { id: 8, title: 'Longest Palindrome Substring', difficulty: 'Medium', acceptance: '48.9%', category: 'Strings', points: 30, status: 'attempted' },
  ];

  const fetchProblems = async () => {
    if (!user) {
      setProblems(dummyProblemsList);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/problems?pageSize=100', {
        headers: {
          'Authorization': `Bearer ${user.jwtToken || user.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.content || [];
        setProblems(content.map((p: any) => {
          let diff: 'Easy' | 'Medium' | 'Hard' = 'Easy';
          if (p.difficulty === 'MEDIUM') diff = 'Medium';
          if (p.difficulty === 'HARD') diff = 'Hard';

          return {
            id: p.problemId,
            title: p.title,
            difficulty: diff,
            acceptance: p.acceptanceRate ? `${(p.acceptanceRate * 100).toFixed(1)}%` : '50.0%',
            category: p.tags || 'General',
            points: diff === 'Easy' ? 10 : diff === 'Medium' ? 25 : 50,
            status: p.userStatus?.toLowerCase() || 'unsolved'
          };
        }));
      } else {
        setProblems(dummyProblemsList);
      }
    } catch (e) {
      console.error(e);
      setProblems(dummyProblemsList);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingProblems = async () => {
    if (!user || !user.roles.includes('ROLE_ADMIN')) return;
    try {
      const response = await fetch('/api/admin/problems/pending?pageSize=50', {
        headers: {
          'Authorization': `Bearer ${user.jwtToken || user.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPendingProblems(data.content || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSeedDatabase = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      // Seed default problems
      const problemsToSeed = [
        {
          title: 'Two Sum Resolution',
          difficulty: 'EASY',
          tags: 'Arrays',
          description: 'Given an array of integers and an integer target, return indices of the two numbers such that they add up to the target.',
          inputFormat: 'Line 1: space-separated integers representing the array.\nLine 2: target integer.',
          outputFormat: 'Indices of the two numbers separated by space.',
          constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9',
          explanation: 'Check elements and use a map to look up targets.',
          timeLimitMs: 1000,
          memoryLimitMb: 256,
          testCases: [
            { input: '2 7 11 15\n9', expectedOutput: '0 1', type: 'SAMPLE' },
            { input: '3 2 4\n6', expectedOutput: '1 2', type: 'HIDDEN' }
          ]
        },
        {
          title: 'Add Two Polynomials',
          difficulty: 'MEDIUM',
          tags: 'Linked Lists',
          description: 'Add two polynomial equations represented as linked lists and return resulting coefficients descending.',
          inputFormat: 'First line N elements. Second line M elements.',
          outputFormat: 'Polynomial sum elements.',
          constraints: 'Coefficients <= 100\nDegree <= 10',
          explanation: 'Traverse lists and sum coefficients of matching degrees.',
          timeLimitMs: 1000,
          memoryLimitMb: 256,
          testCases: [
            { input: '3\n1 2 5\n2\n3 4', expectedOutput: '1 2 8 4', type: 'SAMPLE' },
            { input: '1\n5\n1\n5', expectedOutput: '10', type: 'HIDDEN' }
          ]
        },
        {
          title: 'Department Graph Shortest Path',
          difficulty: 'HARD',
          tags: 'Graphs',
          description: 'Find the shortest path costs in directed graphs representing Southeast University node networks.',
          inputFormat: 'Nodes count N and edges count M, followed by M lines of edges.',
          outputFormat: 'Shortest path weight integer.',
          constraints: 'Nodes <= 1000\nEdges <= 5000',
          explanation: 'Implement Dijkstra algorithm using priority queues.',
          timeLimitMs: 1500,
          memoryLimitMb: 256,
          testCases: [
            { input: '5 6\n0 1 10\n0 2 5\n1 3 1\n2 1 3\n2 3 9\n3 4 4\n0 4', expectedOutput: '9', type: 'SAMPLE' },
            { input: '3 2\n0 1 1\n1 2 2\n0 2', expectedOutput: '3', type: 'HIDDEN' }
          ]
        }
      ];

      for (const p of problemsToSeed) {
        await fetch('/api/admin/problems', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.jwtToken || user.token}`
          },
          body: JSON.stringify(p)
        });
      }

      await fetchProblems();
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchProblems();
    if (user && user.roles.includes('ROLE_ADMIN')) {
      fetchPendingProblems();
    }
  }, [user]);

  const filteredProblems = problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.category.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = filterDifficulty === 'All' || p.difficulty === filterDifficulty;
    return matchesSearch && matchesDiff;
  });

  const totalSolved = problems.filter(p => p.status === 'solved').length;
  const easyCount = problems.filter(p => p.difficulty === 'Easy').length;
  const easySolved = problems.filter(p => p.difficulty === 'Easy' && p.status === 'solved').length;
  const medCount = problems.filter(p => p.difficulty === 'Medium').length;
  const medSolved = problems.filter(p => p.difficulty === 'Medium' && p.status === 'solved').length;
  const hardCount = problems.filter(p => p.difficulty === 'Hard').length;
  const hardSolved = problems.filter(p => p.difficulty === 'Hard' && p.status === 'solved').length;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 text-left animate-float">
      
      {/* Daily Challenge Highlight Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-500/10 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex-1">
          <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5 fill-white/20" />
            Daily Department Challenge
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            Two Sum Resolution
          </h2>
          <p className="text-blue-100 text-sm md:text-base max-w-xl font-medium">
            Solve the daily featured problem to secure double contest points and rise up the department leaderboard!
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto self-stretch md:self-auto">
          {user && (
            <button
              onClick={() => setIsCreationOpen(true)}
              className="bg-blue-700/50 hover:bg-blue-700 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg border border-blue-400/30 flex items-center gap-2 whitespace-nowrap justify-center cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              {user.roles.includes('ROLE_ADMIN') ? 'Create Problem' : 'Propose Problem'}
            </button>
          )}

          <button 
            onClick={() => onSelectProblem(1)}
            className="bg-white hover:bg-slate-50 text-blue-600 font-extrabold px-6 py-3.5 rounded-2xl shadow-lg transition-all hover:scale-[1.02] flex items-center gap-2 whitespace-nowrap justify-center cursor-pointer"
          >
            <Flame className="h-4.5 w-4.5 text-amber-500 fill-amber-400" />
            Attempt Challenge
          </button>
        </div>
      </div>

      {/* Admin Pending Approvals Box */}
      {user && user.roles.includes('ROLE_ADMIN') && pendingProblems.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-3xl p-6 mb-10">
          <h3 className="font-extrabold text-amber-900 text-base mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Pending Problem Proposals Queue ({pendingProblems.length})
          </h3>
          <div className="flex flex-col gap-3">
            {pendingProblems.map((p) => (
              <div 
                key={p.problemId} 
                className="bg-white border border-slate-200/60 p-4.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{p.title}</h4>
                  <p className="text-slate-500 text-xs font-semibold mt-1">
                    Tags: {p.tags || 'General'} | Difficulty: {p.difficulty}
                  </p>
                  <p className="text-slate-400 text-[11px] font-semibold mt-1 max-w-2xl line-clamp-2">
                    {p.description}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setReviewProblemId(p.problemId);
                    setIsReviewOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase px-4 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Review Proposal
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Database Seeding Prompt for Admin */}
      {user && user.roles.includes('ROLE_ADMIN') && problems.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-extrabold text-blue-900 text-base">SEUOJ Platform Database Empty</h4>
            <p className="text-blue-600 text-xs font-semibold mt-1">
              You are logged in as an Administrator. Seed standard competitive programming challenges to populate the system database.
            </p>
          </div>
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold px-5 py-3 rounded-2xl transition-all shadow-md shadow-blue-500/10 flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {seeding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Seeding Problems...
              </>
            ) : (
              'Seed SEUOJ Database'
            )}
          </button>
        </div>
      )}

      {/* Grid: Main Table Content (8 cols) & Sidebar Stats (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main List Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="h-4.5 w-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems by name or topic..."
                className="w-full bg-white border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-blue-500 shadow-sm text-slate-800"
              />
            </div>
            
            {/* Difficulty Tabs */}
            <div className="flex items-center bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-sm self-start sm:self-auto">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setFilterDifficulty(diff)}
                  className={`text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    filterDifficulty === diff
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4.5 text-center w-16">Status</th>
                    <th className="px-6 py-4.5">Problem Title</th>
                    <th className="px-6 py-4.5">Category</th>
                    <th className="px-6 py-4.5">Difficulty</th>
                    <th className="px-6 py-4.5 text-center">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          <span>Loading challenges from server...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProblems.map((p) => (
                      <tr 
                        key={p.id}
                        onClick={() => onSelectProblem(p.id)}
                        className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 text-center">
                          {p.status === 'solved' && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto fill-emerald-50" />
                          )}
                          {p.status === 'attempted' && (
                            <AlertCircle className="h-5 w-5 text-rose-500 mx-auto fill-rose-50" />
                          )}
                          {p.status === 'unsolved' && (
                            <Circle className="h-5 w-5 text-slate-300 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-bold hover:text-blue-600 transition-colors">
                          {p.title}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          {p.category}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                            p.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700' :
                            p.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700' :
                            'bg-rose-50 text-rose-700'
                          }`}>
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-slate-900 font-bold">
                          {p.points}
                        </td>
                      </tr>
                    ))
                  )}

                  {!loading && filteredProblems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                        No problems found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Progress Widget Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4">Solve Progress</h3>
            
            {/* Simple Radial solving gauge */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-full">
                <div className="text-center">
                  <span className="text-xl font-black text-slate-900 leading-none">
                    {problems.length > 0 ? Math.round((totalSolved / problems.length) * 100) : 0}%
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">SOLVED</span>
                </div>
              </div>
              <div className="flex-grow flex flex-col gap-1 text-slate-500 text-xs">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Solved:</span>
                  <span>{totalSolved} / {problems.length}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all" 
                    style={{ width: `${problems.length > 0 ? (totalSolved / problems.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Metrics broken down by difficulties */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-emerald-600 font-bold">Easy</span>
                <span className="text-slate-600 font-bold">{easySolved} / {easyCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-600 font-bold">Medium</span>
                <span className="text-slate-600 font-bold">{medSolved} / {medCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-rose-600 font-bold">Hard</span>
                <span className="text-slate-600 font-bold">{hardSolved} / {hardCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Contest Widget */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200/50 p-6 flex items-start gap-4">
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-1.5">Contest rating rules</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                Standard problems yield points corresponding to difficulty level. Contest performance updates your contest rating.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Creation Modal Container */}
      <ProblemCreationModal 
      isOpen={isCreationOpen} 
      onClose={() => setIsCreationOpen(false)}
      onSuccess={() => {
        fetchProblems();
        if (user?.roles.includes('ROLE_ADMIN')) {
          fetchPendingProblems();
        }
      }}
      user={user}
      />

      {/* Review Modal Container */}
      <ProblemReviewModal
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
          setReviewProblemId(null);
        }}
        problemId={reviewProblemId}
        user={user}
        onSuccess={() => {
          fetchProblems();
          fetchPendingProblems();
        }}
      />

    </div>
  );
}
