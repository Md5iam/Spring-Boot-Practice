import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, Play, Send, Code, Terminal, FileText, AlertCircle, Loader2, Sparkles, RefreshCw, HelpCircle } from 'lucide-react';

interface UserSession {
  id: number;
  username: string;
  email: string;
  roles: string[];
  jwtToken?: string;
  token?: string;
}

interface CodingArenaProps {
  problemId: number | null;
  contestId: number | null;
  onBack: () => void;
  triggerAuth: (mode?: 'login' | 'signup') => void;
  user: UserSession | null;
  onNavigateToSubmissions: () => void;
}

interface ProblemDetail {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  points: number;
  description: string;
  inputFormat: string;
  outputFormat: string;
  sampleInput: string;
  sampleOutput: string;
  constraints: string[];
  explanation: string;
}

interface SubmissionItem {
  submissionId: number;
  language: string;
  status: string;
  executionTimeMs: number;
  memoryUsedKb: number;
  submittedAt: string;
}

const CPP_MAIN = `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    \n\n    return 0;\n}`;

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function highlightCode(lang: 'python' | 'java' | 'cpp', code: string) {
  const wrap = (cls: string, text: string) => `<span class="${cls}">${text}</span>`;

  // Define language keywords and types
  const keywords =
    lang === 'python'
      ? [
          'def','return','if','elif','else','for','while','break','continue','in','and','or','not',
          'True','False','None','class','import','from','as','try','except','finally','with','pass','print'
        ]
      : lang === 'java'
      ? [
          'public','private','protected','class','static','void','int','long','double','float','boolean','char','String',
          'new','return','if','else','for','while','break','continue','try','catch','finally','throw','throws','import','package'
        ]
      : [
          'int','long','double','float','bool','char','void','auto','const','static','struct','class','public','private','protected',
          'return','if','else','for','while','break','continue','switch','case','default','namespace','using','new','delete','include'
        ];

  const types =
    lang === 'cpp'
      ? ['std','vector','string','map','set','unordered_map','unordered_set','pair','queue','stack','priority_queue']
      : lang === 'python'
      ? ['range','len','list','dict','set','tuple','int','float','str','sum','min','max','sorted','enumerate','zip','map','filter']
      : [];

  const commentPattern = lang === 'python' ? '(#.*)' : '(\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/)';
  const stringPattern = '("(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'|`(?:\\\\.|[^`\\\\])*`)';
  
  const escapedKeywords = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const keywordPattern = `\\b(${escapedKeywords})\\b`;
  
  const typePattern = types.length > 0
    ? `\\b(${types.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`
    : '(\\b\\B)'; // a capturing group that never matches to preserve group indexing
    
  const fnPattern = '\\b([A-Za-z_]\\w*)(?=\\s*\\()';
  const numPattern = '\\b(\\d+(?:\\.\\d+)?)\\b';
  const otherPattern = '([^\\w\\s]+|\\w+|\\s+)';

  const combinedRegex = new RegExp([
    commentPattern,
    stringPattern,
    keywordPattern,
    typePattern,
    fnPattern,
    numPattern,
    otherPattern
  ].join('|'), 'g');

  return code.replace(combinedRegex, (match, comment, str, kw, type, fn, num) => {
    if (comment !== undefined) return wrap('tok-comment', escapeHtml(comment));
    if (str !== undefined) return wrap('tok-string', escapeHtml(str));
    if (kw !== undefined) return wrap('tok-keyword', escapeHtml(kw));
    if (type !== undefined) return wrap('tok-type', escapeHtml(type));
    if (fn !== undefined) return wrap('tok-fn', escapeHtml(fn));
    if (num !== undefined) return wrap('tok-number', escapeHtml(num));
    return escapeHtml(match);
  });
}


export default function CodingArena({ problemId, contestId, onBack, triggerAuth, user, onNavigateToSubmissions }: CodingArenaProps) {
  const [lang, setLang] = useState<'python' | 'java' | 'cpp'>('cpp');
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'explanation'>('description');
  const [stdin, setStdin] = useState('');
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'accepted' | 'wrong'>('idle');
  const [consoleLogs, setConsoleLogs] = useState('');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // Dynamic details and history lists
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const editorPreRef = useRef<HTMLPreElement | null>(null);

  // Mappings for templates and defaults
  const getFallbackProblem = (pid: number): ProblemDetail => {
    return {
      id: pid,
      title: pid === 3 ? 'Department Graph Shortest Path' : 
             pid === 2 ? 'Add Two Polynomials' : 'Two Sum Resolution',
      difficulty: pid === 3 ? 'Hard' : pid === 2 ? 'Medium' : 'Easy',
      category: pid === 3 ? 'Graphs' : pid === 2 ? 'Linked Lists' : 'Arrays',
      points: pid === 3 ? 50 : pid === 2 ? 25 : 10,
      description: pid === 3 
        ? 'Given a directed weighted graph representing Southeast University campus nodes, find the shortest path cost from the source node to the destination node. If no path exists, return -1.'
        : pid === 2
        ? 'You are given two polynomial equations represented as linked list coefficients. Add them together and output the resulting coefficients in descending order.'
        : 'Given an array of integers and an integer target, return indices of the two numbers such that they add up to the target. You may assume that each input would have exactly one solution.',
      inputFormat: 'The first line contains space-separated integers representing the array elements. The second line contains the target integer.',
      outputFormat: 'Output two space-separated integers representing the zero-indexed positions.',
      sampleInput: pid === 3 ? '5 6\n0 1 10\n0 2 5\n1 3 1\n2 1 3\n2 3 9\n3 4 4\n0 4' : pid === 2 ? '3\n1 2 5\n2\n3 4' : '2 7 11 15\n9',
      sampleOutput: pid === 3 ? '9' : pid === 2 ? '1 2 8 4' : '0 1',
      constraints: pid === 3 
        ? ['2 <= nodes <= 10^3', '0 <= edges <= 5 * 10^3', 'All weights are non-negative integers']
        : ['1 <= coefficients <= 100', 'Degree of polynomials <= 10'],
      explanation: 'Examine each item index step by step.'
    };
  };

  const fetchProblemDetail = async () => {
    const activeId = problemId || 1;
    if (!user) {
      setProblem(getFallbackProblem(activeId));
      setLoadingProblem(false);
      return;
    }
    setLoadingProblem(true);
    try {
      const response = await fetch(`/api/problems/${activeId}`, {
        headers: {
          'Authorization': `Bearer ${user.jwtToken || user.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        let diff: 'Easy' | 'Medium' | 'Hard' = 'Easy';
        if (data.difficulty === 'MEDIUM') diff = 'Medium';
        if (data.difficulty === 'HARD') diff = 'Hard';

        setProblem({
          id: data.problemId,
          title: data.title,
          difficulty: diff,
          category: data.tags || 'General',
          points: diff === 'Easy' ? 10 : diff === 'Medium' ? 25 : 50,
          description: data.description,
          inputFormat: data.inputFormat,
          outputFormat: data.outputFormat,
          sampleInput: data.sampleTestCases && data.sampleTestCases.length > 0 ? data.sampleTestCases[0].input : '',
          sampleOutput: data.sampleTestCases && data.sampleTestCases.length > 0 ? data.sampleTestCases[0].expectedOutput : '',
          constraints: data.constraints ? data.constraints.split('\n') : ['Time Limit: 1.0s', 'Memory Limit: 256MB'],
          explanation: data.explanation || ''
        });
      } else {
        setProblem(getFallbackProblem(activeId));
      }
    } catch (e) {
      console.error(e);
      setProblem(getFallbackProblem(activeId));
    } finally {
      setLoadingProblem(false);
    }
  };

  const fetchSubmissionsHistory = async () => {
    if (!user || !problem) return;
    setLoadingSubmissions(true);
    try {
      const response = await fetch(`/api/submissions?problemId=${problem.id}&username=${user.username}`, {
        headers: {
          'Authorization': `Bearer ${user.jwtToken || user.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.content || [];
        setSubmissions(content.map((sub: any) => ({
          submissionId: sub.submissionId,
          language: sub.language,
          status: sub.status,
          executionTimeMs: sub.executionTimeMs || 0,
          memoryUsedKb: sub.memoryUsedKb || 0,
          submittedAt: sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'Just now'
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Sync templates on language or problem change
  useEffect(() => {
    fetchProblemDetail();
  }, [problemId, user]);

  useEffect(() => {
    if (problem) {
      setCode(CPP_MAIN);
      setStdin(problem.sampleInput);
      setRunStatus('idle');
      setSubmitStatus('idle');
      if (activeTab === 'submissions') {
        fetchSubmissionsHistory();
      }
    }
  }, [lang, problem]);

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissionsHistory();
    }
  }, [activeTab]);

  const highlighted = useMemo(() => highlightCode(lang, code), [lang, code]);

  const handleRunCode = async () => {
    if (!problem) return;
    setRunStatus('running');
    setIsConsoleOpen(true);
    setConsoleLogs('Compiling and running...');
    
    try {
      const inputToUse = stdin.trim() !== '' ? stdin : problem.sampleInput || '';
      
      const headers: any = { 'Content-Type': 'application/json' };
      if (user && (user.jwtToken || user.token)) {
          headers['Authorization'] = `Bearer ${user.jwtToken || user.token}`;
      }

      const response = await fetch('/api/run', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          code: code,
          language: lang.toUpperCase(),
          stdin: inputToUse
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'SUCCESS') {
          setRunStatus('success');
          setConsoleLogs(data.stdout || '');
        } else {
          setRunStatus('error');
          setConsoleLogs(data.stderr || data.stdout || `Execution failed with status: ${data.status}`);
        }
      } else {
        throw new Error('Run API failed');
      }
    } catch (e) {
      console.error(e);
      setRunStatus('error');
      setConsoleLogs('[ERROR]: Could not execute code. Server might be down or unreachable.');
    }
  };

  const handleSubmitCode = async () => {
    if (!user || !problem) {
      triggerAuth('login');
      return;
    }
    setSubmitStatus('submitting');

    try {
      const response = await fetch(`/api/problems/${problem.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.jwtToken || user.token}`
        },
        body: JSON.stringify({
          problemId: problem.id,
          code: code,
          language: lang.toUpperCase(),
          contestId: contestId
        })
      });

      if (response.ok) {
        // PENDING is now saved — redirect to submissions
        onNavigateToSubmissions();
      } else {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Submit failed');
      }
    } catch (e) {
      console.error(e);
      setSubmitStatus('wrong');
      setIsConsoleOpen(true);
      setConsoleLogs(e instanceof Error ? e.message : 'Submission failed. Please try again.');
    }
  };

  if (loadingProblem || !problem) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-65px)] bg-slate-50 text-slate-500 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="font-semibold text-sm">Synchronizing coding workspace...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-slate-50 text-slate-700">
      
      {/* Mini Workspace Subheader */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-left">
              <h2 className="font-extrabold text-slate-900 text-base leading-none">{problem.title}</h2>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                problem.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700' :
                problem.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700' :
                'bg-rose-50 text-rose-700'
              }`}>
                {problem.difficulty}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1.5 text-left">
              Points: {problem.points} | Category: {problem.category}
            </span>
          </div>
        </div>

        {/* Runtime Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCode}
            disabled={runStatus === 'running'}
            className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-extrabold px-4.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {runStatus === 'running' ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            ) : (
              <Play className="h-4 w-4 text-slate-500 fill-slate-500" />
            )}
            Run Code
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={submitStatus === 'submitting'}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-extrabold px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer"
          >
            {submitStatus === 'submitting' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit Solution
          </button>
        </div>
      </div>

      {/* Primary Split Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* Left Workspace Panel: Problem Details (50% default width) */}
        <div className="flex-1 lg:max-w-[50%] bg-white border-r border-slate-200/80 flex flex-col overflow-hidden min-h-0">
          
          {/* Tab Selection */}
          <div className="bg-slate-50/50 border-b border-slate-200/80 px-4 py-1 flex gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-3 py-2 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
                activeTab === 'description'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Description
              </span>
            </button>

            {problem.explanation && (
              <button
                onClick={() => setActiveTab('explanation')}
                className={`px-3 py-2 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
                  activeTab === 'explanation'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Explanation
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-2 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
                activeTab === 'submissions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                Submissions
              </span>
            </button>
          </div>

          {/* Description Panel Scrollable Content */}
          <div className="flex-grow p-6 overflow-y-auto min-h-0 text-left">
            {activeTab === 'description' ? (
              <div className="flex flex-col gap-6 animate-scaleUp">
                <div>
                  <h3 className="text-slate-900 font-extrabold text-lg mb-2">Problem Statement</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                    {problem.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-slate-950 font-bold text-xs uppercase tracking-wider mb-2">Input Format</h4>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    {problem.inputFormat}
                  </p>
                </div>

                <div>
                  <h4 className="text-slate-950 font-bold text-xs uppercase tracking-wider mb-2">Output Format</h4>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    {problem.outputFormat}
                  </p>
                </div>

                {/* Example IO blocks */}
                {problem.sampleInput && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-blue-600 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                      <Sparkles className="h-3.5 w-3.5 fill-blue-50/50" />
                      Sample Sandbox Test Case
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block mb-1">Sample Input:</span>
                      <pre className="bg-white border border-slate-200/50 p-2.5 rounded-xl text-slate-800 overflow-x-auto whitespace-pre font-bold">
                        {problem.sampleInput}
                      </pre>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block mb-1">Sample Output:</span>
                      <pre className="bg-white border border-slate-200/50 p-2.5 rounded-xl text-slate-800 overflow-x-auto whitespace-pre font-bold">
                        {problem.sampleOutput}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Constraints lists */}
                <div>
                  <h4 className="text-slate-950 font-bold text-xs uppercase tracking-wider mb-2">Constraints</h4>
                  <ul className="list-disc pl-5 text-slate-500 text-xs font-semibold leading-relaxed flex flex-col gap-1.5">
                    {problem.constraints?.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : activeTab === 'explanation' ? (
              <div className="flex flex-col gap-4 animate-scaleUp">
                <h3 className="text-slate-900 font-extrabold text-lg mb-1">Explanation</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                  {problem.explanation}
                </p>
              </div>
            ) : (
              <div className="animate-scaleUp">
                {!user ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 gap-3">
                    <AlertCircle className="h-10 w-10 text-slate-300" />
                    <div>
                      <h4 className="font-bold text-slate-700">Authentication Required</h4>
                      <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed font-semibold">
                        You must be signed in to view your submissions history.
                      </p>
                      <button 
                        onClick={() => triggerAuth('login')}
                        className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                ) : loadingSubmissions ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-xs font-semibold">Retrieving submissions history...</span>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 gap-3">
                    <AlertCircle className="h-10 w-10 text-slate-300" />
                    <div>
                      <h4 className="font-bold text-slate-700">No submissions found</h4>
                      <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed font-semibold">
                        Please submit your solution. Your full compilation records will appear here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="bg-slate-50 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Language</th>
                          <th className="px-4 py-3">Runtime</th>
                          <th className="px-4 py-3">Memory</th>
                          <th className="px-4 py-3 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 text-xs">
                        {submissions.map((sub) => (
                          <tr key={sub.submissionId} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 font-black ${
                                sub.status === 'ACCEPTED' ? 'text-emerald-600' : 'text-rose-600'
                              }`}>
                                {sub.status === 'ACCEPTED' ? 'Accepted' : sub.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 uppercase tracking-wide">{sub.language}</td>
                            <td className="px-4 py-3 font-mono">{sub.executionTimeMs} ms</td>
                            <td className="px-4 py-3 font-mono">{(sub.memoryUsedKb / 1024).toFixed(2)} MB</td>
                            <td className="px-4 py-3 text-right text-slate-400 text-[10px]">{sub.submittedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Workspace Panel: IDE & Terminal (50% default width) */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[#f8fafc]">
          
          {/* Code Editor Header Controls */}
          <div className="bg-slate-100/80 border-b border-slate-200/80 px-4 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Solution Editor</span>
            </div>
            
            {/* Language Selection Tab */}
            <div className="flex bg-white border border-slate-200/80 p-0.5 rounded-xl shadow-inner gap-1 items-center">
              {(['python', 'java', 'cpp'] as const).map((langItem) => (
                <label
                  key={langItem}
                  onClick={() => setLang(langItem)}
                  className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer select-none ${
                    lang === langItem 
                      ? 'bg-slate-900 text-white' 
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={lang === langItem}
                    readOnly
                    className="accent-white h-3 w-3 pointer-events-none rounded"
                  />
                  <span>{langItem === 'cpp' ? 'C++' : langItem}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Code Editor text canvas */}
          <div className="flex-1 relative min-h-0 overflow-hidden bg-white border-b border-slate-200/80">
            <div className="absolute inset-0 bg-[#0b1020]" />

            <pre
              ref={editorPreRef}
              aria-hidden="true"
              className="absolute inset-0 m-0 overflow-auto p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words editor-pre"
              style={{ tabSize: 4 }}
              dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
            />

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={(e) => {
                if (!editorPreRef.current) return;
                editorPreRef.current.scrollTop = e.currentTarget.scrollTop;
                editorPreRef.current.scrollLeft = e.currentTarget.scrollLeft;
              }}
              spellCheck="false"
              className="absolute inset-0 w-full h-full p-6 font-mono text-sm leading-relaxed focus:outline-none resize-none bg-transparent"
              style={{
                tabSize: 4,
                caretColor: '#e2e8f0',
                color: 'transparent',
                textShadow: '0 0 0 rgba(226,232,240,0.0)',
              }}
            />

            <style>{`
              .tok-comment { color: rgba(148, 163, 184, 0.75); font-style: italic; }
              .tok-string { color: rgb(251, 191, 36); }
              .tok-number { color: rgb(96, 165, 250); }
              .tok-keyword { color: rgb(167, 139, 250); font-weight: 700; }
              .tok-type { color: rgb(45, 212, 191); }
              .tok-fn { color: rgb(34, 211, 238); }
              .editor-pre { color: rgb(226, 232, 240); }
            `}</style>
          </div>

          {/* Standard Input & Terminal Console Panel */}
          <div className={`bg-white border-t border-slate-200/80 flex flex-col shrink-0 transition-all ${
            isConsoleOpen ? 'h-64' : 'h-11'
          }`}>
            
            {/* Console Trigger Header */}
            <div 
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200/80 cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Test Sandbox Console</span>
              </div>
              <span className="text-[10px] text-blue-600 font-extrabold uppercase hover:underline">
                {isConsoleOpen ? 'Collapse console' : 'Expand console'}
              </span>
            </div>

            {/* Console Output and Inputs panels */}
            {isConsoleOpen && (
              <div className="flex-1 flex divide-x divide-slate-200/80 overflow-hidden min-h-0 text-left text-xs font-mono">
                {/* Stdin (Left) */}
                <div className="w-[40%] p-4 flex flex-col overflow-hidden min-h-0">
                  <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-2">Standard Input (stdin)</label>
                  <textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    className="flex-grow w-full bg-slate-50 border border-slate-200/85 p-2 rounded-xl focus:outline-none resize-none font-semibold text-slate-800"
                  />
                </div>
                {/* Console Outputs logs (Right) */}
                <div className="w-[60%] p-4 flex flex-col overflow-hidden min-h-0 bg-[#fafcfd]">
                  <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-2">Console Output Logs</label>
                  <pre className={`flex-grow p-3 rounded-xl overflow-y-auto whitespace-pre-wrap font-bold text-black ${
                    runStatus === 'success' || submitStatus === 'accepted' ? 'bg-[#e6ffed] border border-[#rgba(27,31,36,0.15)]' :
                    runStatus === 'error' || submitStatus === 'wrong' ? 'bg-[#ffebe9] border border-[#rgba(27,31,36,0.15)]' : 'bg-slate-50 border border-slate-200/50'
                  }`}>
                    {consoleLogs ? consoleLogs : (
                      <span className="text-black">
                        No output yet. Click "Run Code" or "Submit Solution".
                      </span>
                    )}
                  </pre>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
