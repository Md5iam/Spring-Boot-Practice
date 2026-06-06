import { useState, useEffect } from 'react';
import { X, Check, Trash2, Loader2, Info, Eye, Clock } from 'lucide-react';

interface TestCase {
  input: string;
  expectedOutput: string;
  type: 'SAMPLE' | 'HIDDEN';
}

interface ProblemDetail {
  problemId: number;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  explanation: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  testCases?: TestCase[];
}

interface UserSession {
  id: number;
  username: string;
  email: string;
  roles: string[];
  jwtToken?: string;
  token?: string;
}

interface ProblemReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemId: number | null;
  user: UserSession | null;
  onSuccess: () => void;
}

export default function ProblemReviewModal({ isOpen, onClose, problemId, user, onSuccess }: ProblemReviewModalProps) {
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen && problemId && user) {
      fetchProblemDetails();
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, problemId, user]);

  const fetchProblemDetails = async () => {
    if (!problemId || !user) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/problems/${problemId}`, {
        headers: {
          'Authorization': `Bearer ${user.jwtToken || user.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Since getProblemById returns sampleTestCases, let's also fetch all test cases from admin endpoint
        const tcResponse = await fetch(`/api/admin/problems/${problemId}/testcases`, {
          headers: {
            'Authorization': `Bearer ${user.jwtToken || user.token}`
          }
        });
        const testCases = tcResponse.ok ? await tcResponse.json() : [];
        setProblem({ ...data, testCases });
      } else {
        setErrorMsg('Failed to load problem details.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('An error occurred while fetching details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!problemId || !user) return;
    setActionLoading('approve');
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await fetch(`/api/admin/problems/${problemId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.jwtToken || user.token}`
        }
      });
      if (response.ok) {
        setSuccessMsg('Problem approved and published successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        const err = await response.json();
        setErrorMsg(err.message || 'Failed to approve problem.');
      }
    } catch (e) {
      setErrorMsg('A network error occurred.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!problemId || !user) return;
    if (!window.confirm('Are you sure you want to REJECT and permanently DELETE this problem proposal?')) {
      return;
    }
    setActionLoading('reject');
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await fetch(`/api/admin/problems/${problemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.jwtToken || user.token}`
        }
      });
      if (response.ok) {
        setSuccessMsg('Problem proposal rejected and deleted.');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        const err = await response.json();
        setErrorMsg(err.message || 'Failed to delete problem proposal.');
      }
    } catch (e) {
      setErrorMsg('A network error occurred.');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-scaleUp text-left">
        
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Review Coding Challenge Proposal
              </h3>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">
                Pending Administrator Decision
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
              <Info className="h-4.5 w-4.5 shrink-0" />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
              <Check className="h-4.5 w-4.5 shrink-0" />
              {successMsg}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : problem ? (
            <div className="flex flex-col gap-6">
              {/* Meta information row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Difficulty</span>
                  <span className={`inline-block mt-1 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    problem.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-700' :
                    problem.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-700' :
                    'bg-rose-50 text-rose-700'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Category / Tags</span>
                  <span className="text-slate-800 font-bold text-xs mt-1 block">{problem.tags || 'General'}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Time Limit</span>
                  <span className="text-slate-850 font-bold text-xs mt-1 block flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {problem.timeLimitMs} ms
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Memory Limit</span>
                  <span className="text-slate-850 font-bold text-xs mt-1 block">{problem.memoryLimitMb} MB</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Title</h4>
                <p className="text-slate-900 font-extrabold text-base">{problem.title}</p>
              </div>

              <div>
                <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Problem Statement</h4>
                <p className="text-slate-650 text-sm font-medium leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 whitespace-pre-wrap">{problem.description}</p>
              </div>

              {/* Input Format & Output Format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Input Format</h4>
                  <p className="text-slate-600 text-xs font-semibold bg-slate-55 p-3.5 rounded-xl border border-slate-200/50 whitespace-pre-wrap">{problem.inputFormat}</p>
                </div>
                <div>
                  <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Output Format</h4>
                  <p className="text-slate-600 text-xs font-semibold bg-slate-55 p-3.5 rounded-xl border border-slate-200/50 whitespace-pre-wrap">{problem.outputFormat}</p>
                </div>
              </div>

              {/* Constraints */}
              <div>
                <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Constraints</h4>
                <pre className="text-slate-600 text-xs font-semibold bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/50 whitespace-pre-wrap font-mono">{problem.constraints}</pre>
              </div>

              {/* Explanation */}
              {problem.explanation && (
                <div>
                  <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Explanation</h4>
                  <p className="text-slate-650 text-sm font-medium leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 whitespace-pre-wrap">{problem.explanation}</p>
                </div>
              )}

              {/* Test Cases List */}
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm mb-3">Proposed Test Cases ({problem.testCases?.length || 0})</h4>
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                  {problem.testCases?.map((tc, idx) => (
                    <div key={idx} className={`border rounded-2xl p-4 flex flex-col gap-2 ${
                      tc.type === 'SAMPLE' ? 'bg-blue-50/20 border-blue-200/50' : 'bg-amber-50/10 border-amber-200/30'
                    }`}>
                      <span className={`self-start text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        tc.type === 'SAMPLE' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {tc.type} Testcase #{idx + 1}
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block mb-1">Input</span>
                          <pre className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs font-mono overflow-x-auto">{tc.input}</pre>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block mb-1">Expected Output</span>
                          <pre className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs font-mono overflow-x-auto">{tc.expectedOutput}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-400 my-10 italic">No problem selected.</p>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <button
            onClick={onClose}
            className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-extrabold px-6 py-3 rounded-2xl text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleReject}
              disabled={actionLoading !== null}
              className="bg-rose-50 border border-rose-200 hover:bg-rose-600 hover:text-white text-rose-600 font-extrabold px-6 py-3 rounded-2xl text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {actionLoading === 'reject' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Reject proposal
            </button>

            <button
              onClick={handleApprove}
              disabled={actionLoading !== null}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-8 py-3 rounded-2xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
            >
              {actionLoading === 'approve' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Approve & Publish
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
