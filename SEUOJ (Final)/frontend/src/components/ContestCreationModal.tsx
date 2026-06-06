import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { X, Trophy, Calendar, BookOpen, Search, Plus, Trash2, Loader2, Award } from 'lucide-react';

interface UserSession {
  id: number;
  username: string;
  email: string;
  roles: string[];
  jwtToken?: string;
  token?: string;
}

interface ContestCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSession | null;
  onSuccess: () => void;
  editContestId?: number | null;
}

interface RepositoryProblem {
  problemId: number;
  title: string;
  difficulty: string;
}

interface AddedProblem {
  problemId: number;
  title: string;
  points: number;
}

export default function ContestCreationModal({ isOpen, onClose, user, onSuccess, editContestId }: ContestCreationModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Problem selection states
  const [search, setSearch] = useState('');
  const [repoProblems, setRepoProblems] = useState<RepositoryProblem[]>([]);
  const [addedProblems, setAddedProblems] = useState<AddedProblem[]>([]);
  const [originalProblems, setOriginalProblems] = useState<AddedProblem[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const fetchContestToEdit = async () => {
    try {
      const token = user?.jwtToken || user?.token;
      const response = await fetch(`/api/contests/${editContestId}/detail`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTitle(data.title);
        setDescription(data.description);
        setStartTime(formatDateForInput(data.startTime));
        setEndTime(formatDateForInput(data.endTime));
        const mappedProbs = (data.problems || []).map((p: any) => ({
          problemId: p.problemId,
          title: p.title,
          points: p.points
        }));
        setAddedProblems(mappedProbs);
        setOriginalProblems(mappedProbs);
      } else {
        setErrorMsg('Failed to fetch contest details for editing.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Error loading contest details.');
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchProblems();
      if (editContestId) {
        fetchContestToEdit();
      } else {
        // Reset form states
        setTitle('');
        setDescription('');
        setStartTime('');
        setEndTime('');
        setAddedProblems([]);
        setOriginalProblems([]);
        setErrorMsg('');
        setSuccessMsg('');
      }
    }
  }, [isOpen, user, editContestId]);

  const fetchProblems = async () => {
    setLoadingProblems(true);
    try {
      const response = await fetch('/api/problems?pageSize=100');
      if (response.ok) {
        const data = await response.json();
        setRepoProblems(data.content || []);
      }
    } catch (e) {
      console.error('Failed to load repo problems', e);
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleAddProblem = (prob: RepositoryProblem) => {
    if (addedProblems.some(p => p.problemId === prob.problemId)) {
      return;
    }
    setAddedProblems([...addedProblems, { problemId: prob.problemId, title: prob.title, points: 100 }]);
  };

  const handleRemoveProblem = (problemId: number) => {
    setAddedProblems(addedProblems.filter(p => p.problemId !== problemId));
  };

  const handleUpdatePoints = (problemId: number, points: number) => {
    setAddedProblems(addedProblems.map(p => p.problemId === problemId ? { ...p, points: Math.max(1, points) } : p));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim() || !description.trim() || !startTime || !endTime) {
      setErrorMsg('Please populate all required contest fields.');
      return;
    }

    if (startTime >= endTime) {
      setErrorMsg('End Time must occur after the Start Time.');
      return;
    }

    if (addedProblems.length === 0) {
      setErrorMsg('You must assign at least one problem to the contest problem set.');
      return;
    }

    setLoading(true);
    try {
      const token = user.jwtToken || user.token;

      if (editContestId) {
        // 1. Update the contest metadata
        const contestResponse = await fetch(`/api/admin/contests/${editContestId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            description,
            startTime,
            endTime
          })
        });

        if (!contestResponse.ok) {
          const err = await contestResponse.json();
          throw new Error(err.message || 'Failed to update contest settings.');
        }

        // 2. Diff problems:
        // Problems to remove: in original but not in added, or if in both but points changed (so we recreate)
        const toRemove = originalProblems.filter(op => 
          !addedProblems.some(ap => ap.problemId === op.problemId && ap.points === op.points)
        );

        // Problems to add: in added but not in original, or points changed
        const toAdd = addedProblems.filter(ap => 
          !originalProblems.some(op => op.problemId === ap.problemId && op.points === ap.points)
        );

        // Remove old problem associations
        for (const op of toRemove) {
          await fetch(`/api/admin/contests/${editContestId}/problems/${op.problemId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }

        // Add new/updated problem associations
        for (const ap of toAdd) {
          await fetch(`/api/admin/contests/${editContestId}/problems?problemId=${ap.problemId}&points=${ap.points}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        }

        setSuccessMsg('Contest settings and problem mappings updated successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);

      } else {
        // 1. Create the contest
        const contestResponse = await fetch('/api/admin/contests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            description,
            startTime: startTime,
            endTime: endTime
          })
        });

        if (!contestResponse.ok) {
          const err = await contestResponse.json();
          throw new Error(err.message || 'Failed to create contest instance.');
        }

        const createdContest = await contestResponse.json();
        const contestId = createdContest.contestId;

        // 2. Add each problem to the contest
        for (const item of addedProblems) {
          const probResponse = await fetch(`/api/admin/contests/${contestId}/problems?problemId=${item.problemId}&points=${item.points}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (!probResponse.ok) {
            console.error(`Failed to assign problem ID ${item.problemId} to contest.`);
          }
        }

        setSuccessMsg('Contest established and scheduled successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while establishing/updating the contest.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredRepo = repoProblems.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) &&
    !addedProblems.some(ap => ap.problemId === p.problemId)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-float">
        
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
                {editContestId ? 'Edit Contest Settings' : 'Setup Contest'}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic Competition Platform</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Left Form: Details */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Contest Metadata
            </h4>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-extrabold uppercase">Contest Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., SEU Inter-Department Programming Clash"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 text-slate-800"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-extrabold uppercase">Contest Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about prizes, syllabus, allowed lang, etc."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-extrabold uppercase">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-extrabold uppercase">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 text-slate-800"
                />
              </div>
            </div>

            {/* Error / Success Notifications */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl px-4.5 py-3 text-xs font-bold leading-relaxed">
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl px-4.5 py-3 text-xs font-bold leading-relaxed">
                🎉 {successMsg}
              </div>
            )}
          </div>

          {/* Right Form: Problem Set Setup */}
          <div className="lg:col-span-6 flex flex-col gap-5 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Configure Problem Set
            </h4>

            {/* Assigned Problems List */}
            <div className="flex flex-col gap-3 min-h-[150px] max-h-[220px] overflow-y-auto bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase mb-1">
                Assigned Problems ({addedProblems.length})
              </span>
              {addedProblems.length === 0 ? (
                <p className="text-slate-400 font-medium text-xs my-auto text-center italic">No problems assigned yet. Search and add below.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {addedProblems.map((ap) => (
                    <div key={ap.problemId} className="bg-white border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between gap-4">
                      <div className="overflow-hidden">
                        <p className="font-bold text-xs text-slate-800 truncate">{ap.title}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <input
                          type="number"
                          value={ap.points}
                          onChange={(e) => handleUpdatePoints(ap.problemId, parseInt(e.target.value) || 0)}
                          placeholder="Points"
                          className="w-16 bg-slate-50 border border-slate-200 rounded-lg text-center px-1 py-1 text-xs font-mono font-bold text-slate-700 focus:outline-none"
                        />
                        <button 
                          onClick={() => handleRemoveProblem(ap.problemId)}
                          className="text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Repository Search & Add */}
            <div className="flex flex-col gap-3 flex-grow">
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search repository problems..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800"
                />
              </div>

              <div className="max-h-[160px] overflow-y-auto border border-slate-100 rounded-2xl divide-y divide-slate-100 flex-grow">
                {loadingProblems ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  </div>
                ) : filteredRepo.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6 italic">No unassigned repository problems found.</p>
                ) : (
                  filteredRepo.map((prob) => (
                    <div key={prob.problemId} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                      <div className="overflow-hidden pr-2">
                        <p className="text-xs font-bold text-slate-800 truncate">{prob.title}</p>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                          prob.difficulty === 'EASY' || prob.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700' :
                          prob.difficulty === 'MEDIUM' || prob.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {prob.difficulty}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddProblem(prob)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-xl transition-all cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            onClick={onClose}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-extrabold text-xs px-5 py-3 rounded-2xl shadow-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                {editContestId ? 'Updating...' : 'Scheduling...'}
              </>
            ) : (
              <>
                <Award className="h-4 w-4" />
                {editContestId ? 'Save Changes' : 'Establish Contest'}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
