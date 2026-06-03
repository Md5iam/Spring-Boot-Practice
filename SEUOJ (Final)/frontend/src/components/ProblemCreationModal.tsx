import { useState } from 'react';
import { X, Plus, Trash2, Loader2, Info, CheckCircle } from 'lucide-react';

interface TestCaseItem {
  input: string;
  expectedOutput: string;
  type: 'SAMPLE' | 'HIDDEN';
}

interface UserSession {
  id: number;
  username: string;
  email: string;
  roles: string[];
  jwtToken?: string;
  token?: string;
}

interface ProblemCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: UserSession | null;
}

export default function ProblemCreationModal({ isOpen, onClose, onSuccess, user }: ProblemCreationModalProps) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState('');
  const [explanation, setExplanation] = useState('');
  const [timeLimitMs, setTimeLimitMs] = useState(1000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(256);
  
  // Test cases states
  const [testCases, setTestCases] = useState<TestCaseItem[]>([
    { input: '', expectedOutput: '', type: 'SAMPLE' },
    { input: '', expectedOutput: '', type: 'HIDDEN' }
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isAdmin = user?.roles.includes('ROLE_ADMIN') || false;

  const handleAddTestCase = (type: 'SAMPLE' | 'HIDDEN') => {
    setTestCases([...testCases, { input: '', expectedOutput: '', type }]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, idx) => idx !== index));
  };

  const handleTestCaseChange = (index: number, field: 'input' | 'expectedOutput', value: string) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    // Validate test cases
    const validTestCases = testCases.filter(tc => tc.input.trim() !== '' && tc.expectedOutput.trim() !== '');
    if (validTestCases.length === 0) {
      setErrorMsg('Please specify at least one valid test case.');
      setLoading(false);
      return;
    }

    const payload = {
      title,
      difficulty,
      tags: category,
      description,
      inputFormat,
      outputFormat,
      constraints,
      explanation,
      timeLimitMs,
      memoryLimitMb,
      testCases: validTestCases
    };

    // Determine Endpoint
    const endpoint = isAdmin ? '/api/admin/problems' : '/api/problems';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.jwtToken || user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccessMsg(
          isAdmin 
            ? 'Problem created and published successfully!' 
            : 'Problem submitted for approval! An admin will review it shortly.'
        );
        setTimeout(() => {
          onSuccess();
          onClose();
          // Reset Form
          setTitle('');
          setCategory('');
          setDescription('');
          setInputFormat('');
          setOutputFormat('');
          setConstraints('');
          setExplanation('');
          setTestCases([
            { input: '', expectedOutput: '', type: 'SAMPLE' },
            { input: '', expectedOutput: '', type: 'HIDDEN' }
          ]);
          setSuccessMsg('');
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.message || 'Failed to submit problem.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-scaleUp text-left">
        
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              {isAdmin ? 'Publish Coding Challenge' : 'Propose Coding Challenge'}
            </h3>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">
              {isAdmin ? 'Direct Publication (No Approval Required)' : 'Submitted for Administrator Verification'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
          
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
              <Info className="h-4.5 w-4.5 shrink-0" />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              {successMsg}
            </div>
          )}

          {/* Title and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Problem Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sum of two values"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-850 transition-all"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Category (Tags)</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Arrays, DP, Math"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Time Limit (ms)</label>
              <input
                type="number"
                required
                value={timeLimitMs}
                onChange={(e) => setTimeLimitMs(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Memory Limit (MB)</label>
              <input
                type="number"
                required
                value={memoryLimitMb}
                onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Description statement */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Problem Statement (Description)</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive explanation of what the problem is..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 transition-all resize-none"
            />
          </div>

          {/* IO format and constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Input Format</label>
              <textarea
                required
                rows={2}
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
                placeholder="Describe the shape/lines of inputs..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 transition-all resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Output Format</label>
              <textarea
                required
                rows={2}
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                placeholder="Describe the expected shape/lines of outputs..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 transition-all resize-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Constraints (Separate lines)</label>
            <textarea
              required
              rows={2}
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g. 1 <= N <= 10^5"
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 transition-all resize-none"
            />
          </div>

          {/* Explanation Section */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Basic Explanations</label>
            <textarea
              required
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain the sample execution logic or optimal approaches..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 transition-all resize-none"
            />
          </div>

          {/* Test cases list inputs */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Sandbox Test Cases</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Supply testcases. Visible ones are displayed to users, hidden ones evaluate final submissions.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAddTestCase('SAMPLE')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  + Sample
                </button>
                <button
                  type="button"
                  onClick={() => handleAddTestCase('HIDDEN')}
                  className="bg-slate-150 hover:bg-slate-200 text-slate-800 text-[10px] font-black uppercase px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  + Hidden
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {testCases.map((tc, index) => (
                <div 
                  key={index} 
                  className={`border rounded-2xl p-4 flex flex-col gap-3 transition-colors ${
                    tc.type === 'SAMPLE' ? 'bg-slate-50/50 border-slate-200' : 'bg-amber-50/20 border-amber-250/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      tc.type === 'SAMPLE' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {tc.type} Testcase #{index + 1}
                    </span>
                    {testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTestCase(index)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block mb-1.5">Input</span>
                      <textarea
                        required
                        rows={2}
                        value={tc.input}
                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                        placeholder="Stdin input data..."
                        className="w-full bg-white border border-slate-200/80 rounded-xl p-2.5 font-mono text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block mb-1.5">Expected Output</span>
                      <textarea
                        required
                        rows={2}
                        value={tc.expectedOutput}
                        onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                        placeholder="Stdout output data..."
                        className="w-full bg-white border border-slate-200/80 rounded-xl p-2.5 font-mono text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form submit CTA */}
          <div className="border-t border-slate-100 pt-6 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold px-6 py-3 rounded-2xl text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-8 py-3 rounded-2xl text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isAdmin ? 'Publish Challenge' : 'Submit for Approval'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
