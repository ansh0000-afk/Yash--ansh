import React, { useState, useEffect } from 'react';
import {
  CLASS_12_MAHARASHTRA_COMMERCE_SUBJECTS,
  MAHARASHTRA_HSC_BOARD_INFO,
  HSCCommerceSubject,
} from '../data/maharashtraHSCCommerce';
import {
  DEFAULT_COMMERCE_TIMETABLE,
  CommerceTimetableSlot,
} from '../data/commerceData';
import { 
  BookOpen, 
  Calculator, 
  Briefcase, 
  TrendingUp, 
  Code2, 
  Sparkles, 
  GraduationCap, 
  FileText, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  Download, 
  Calendar, 
  ChevronRight, 
  HelpCircle, 
  BarChart3, 
  RotateCcw, 
  Play, 
  Check, 
  Copy, 
  Filter, 
  Zap,
  Tag,
  Printer,
  Target,
  FileCheck,
  Share2,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface CommerceStudyHubViewProps {
  onAskAgentAboutTopic?: (topic: string) => void;
}

export type CommerceTab = 'subjects' | 'question_bank' | 'mcq_quiz' | 'sample_papers' | 'timetable' | 'progress';

export const CommerceStudyHubView: React.FC<CommerceStudyHubViewProps> = ({
  onAskAgentAboutTopic
}) => {
  const [activeTab, setActiveTab] = useState<CommerceTab>('subjects');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('accountancy');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [noteTypeFilter, setNoteTypeFilter] = useState<'all' | 'chapter' | 'short' | 'formula'>('all');
  const [qbTypeFilter, setQbTypeFilter] = useState<'all' | 'short' | 'long' | 'numerical'>('all');

  const [completedChapterIds, setCompletedChapterIds] = useState<Record<string, string[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem('mh_hsc_completed_chapters') || '{}');
    } catch {
      return {};
    }
  });

  // MCQ Quiz Engine State
  const [activeMcqSubjectId, setActiveMcqSubjectId] = useState<string>('accountancy');
  const [userMcqAnswers, setUserMcqAnswers] = useState<Record<string, number>>({});
  
  // Bookmarks / Favorites State
  const [favoriteNoteIds, setFavoriteNoteIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mh_commerce_fav_notes') || '[]');
    } catch {
      return [];
    }
  });

  const toggleFavoriteNote = (id: string) => {
    setFavoriteNoteIds(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('mh_commerce_fav_notes', JSON.stringify(next));
      return next;
    });
  };

  // Exam Countdown (Target Board Exam Date: Feb 15, 2026)
  const [daysToExam, setDaysToExam] = useState<number>(193);

  useEffect(() => {
    const examDate = new Date('2026-02-15T00:00:00');
    const now = new Date();
    const diffTime = Math.max(0, examDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysToExam(diffDays);
  }, []);

  const toggleChapterCompletion = (subjectId: string, chapterId: string) => {
    setCompletedChapterIds((current) => {
      const subjectCompletedIds = current[subjectId] || [];
      const updatedSubjectIds = subjectCompletedIds.includes(chapterId)
        ? subjectCompletedIds.filter((id) => id !== chapterId)
        : [...subjectCompletedIds, chapterId];
      const updated = { ...current, [subjectId]: updatedSubjectIds };
      localStorage.setItem('mh_hsc_completed_chapters', JSON.stringify(updated));
      return updated;
    });
  };

  const totalChapters = CLASS_12_MAHARASHTRA_COMMERCE_SUBJECTS.reduce(
    (total, subject) => total + subject.chapters.length,
    0,
  );
  const completedChapters = CLASS_12_MAHARASHTRA_COMMERCE_SUBJECTS.reduce(
    (total, subject) => total + (completedChapterIds[subject.id]?.length || 0),
    0,
  );
  const overallProgress = totalChapters
    ? Math.round((completedChapters / totalChapters) * 100)
    : 0;

  // Download / Export Notes as Text File
  const handleDownloadNote = (title: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Selected subject object
  const selectedSubject = CLASS_12_MAHARASHTRA_COMMERCE_SUBJECTS.find(
  s => s.id === selectedSubjectId) || CLASS_12_MAHARASHTRA_COMMERCE_SUBJECTS[0];
  const activeMcqSubject = CLASS_12_MAHARASHTRA_COMMERCE_SUBJECTS.find(
  s => s.id === activeMcqSubjectId) || CLASS_12_MAHARASHTRA_COMMERCE_SUBJECTS[0];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator': return Calculator;
      case 'Briefcase': return Briefcase;
      case 'TrendingUp': return TrendingUp;
      case 'Code2': return Code2;
      case 'Sparkles': return Sparkles;
      case 'GraduationCap': return GraduationCap;
      case 'FileText': return FileText;
      default: return BookOpen;
    }
  };

  // MCQ Quiz Score Calculation
  const totalMcqsInActiveSubject = activeMcqSubject.mcqs.length;
  let correctCount = 0;
  activeMcqSubject.mcqs.forEach((mcq) => {
    if (userMcqAnswers[mcq.id] === mcq.correctAnswerIndex) {
      correctCount++;
    }
  });

  // Global Search & Filters
  const filteredNotes = selectedSubject.notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.keyPoints.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (noteTypeFilter === 'formula') return Boolean(n.importantFormulaeOrTerms && n.importantFormulaeOrTerms.length > 0);
    return true;
  });

  const filteredQuestionBank = selectedSubject.questionBank.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.chapter.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (qbTypeFilter !== 'all' && q.type !== qbTypeFilter) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      
      {/* Top Banner & Hub Title */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-amber-700 text-white shadow-xl shadow-amber-600/20">
            <Award className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Maharashtra Board HSC Class 12 Commerce
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                MSBSHSE 2025-26
              </span>
            </div>
            <p className="text-xs text-slate-400">BK & Accountancy, OCM, Economics, SP, Math & Stats, English, Marathi, Hindi & IT</p>
          </div>
        </div>

        {/* Board Exam Countdown & Streak Widget */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-amber-500/30 text-xs">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-amber-400 font-bold block leading-none">BOARD COUNTDOWN</span>
              <span className="text-xs font-black text-white">{daysToExam} Days Left</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative hidden md:block w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Commerce topics..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
        {[
          { id: 'subjects', label: 'Notes & Syllabus', icon: BookOpen },
          { id: 'question_bank', label: 'Question Bank', icon: HelpCircle },
          { id: 'mcq_quiz', label: 'MCQs Quiz Test', icon: Zap },
          { id: 'sample_papers', label: 'Sample Papers & PYQs', icon: FileText },
          { id: 'timetable', label: 'Study Schedule', icon: Calendar },
          { id: 'progress', label: 'Progress & Goals', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CommerceTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      {/* Subject Chips Navigation */}
      {(activeTab === 'subjects' || activeTab === 'question_bank' || activeTab === 'mcq_quiz' || activeTab === 'sample_papers') && (
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mr-1">Subject:</span>
          {CLASS_12_MAHARASHTRA_COMMERCE_SUBJECTS.map((subj) => {
            const Icon = getSubjectIcon(subj.iconName);
            const isSelected = (activeTab === 'mcq_quiz' ? activeMcqSubjectId : selectedSubjectId) === subj.id;
            return (
              <button
                key={subj.id}
                onClick={() => {
                  if (activeTab === 'mcq_quiz') setActiveMcqSubjectId(subj.id);
                  else setSelectedSubjectId(subj.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-400 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{subj.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 no-scrollbar">
        
        {/* 1. SUBJECTS & NOTES TAB */}
        {activeTab === 'subjects' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Active Subject Banner */}
            <div className={`p-6 rounded-3xl bg-gradient-to-r ${selectedSubject.color} text-white space-y-2 shadow-2xl relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-extrabold bg-black/30 px-2.5 py-0.5 rounded-full border border-white/20 uppercase">
                    Code: {selectedSubject.code}
                  </span>
                  <h3 className="text-2xl font-black">{selectedSubject.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black">{selectedSubject.chaptersCount} Chapters</div>
                  <div className="text-xs text-white/80">Class 12 Commerce Syllabus</div>
                </div>
              </div>
              <p className="text-xs text-white/90 leading-relaxed max-w-2xl">{selectedSubject.description}</p>
            </div>

            {/* Note Category Filters */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase mr-1">Filter Notes:</span>
                {[
                  { id: 'all', label: 'All Notes' },
                  { id: 'formula', label: 'Formulas & Terms' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setNoteTypeFilter(f.id as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                      noteTypeFilter === f.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-500 font-mono">Showing {filteredNotes.length} notes</span>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNotes.map((note) => (
                  <div key={note.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all space-y-4 shadow-xl flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {note.chapter}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDownloadNote(note.title, `${note.title}\n\n${note.summary}\n\nKey Points:\n${note.keyPoints.join('\n')}\n\nFormulas/Terms:\n${(note.importantFormulaeOrTerms || []).join('\n')}`)}
                            className="text-slate-400 hover:text-amber-400 p-1.5 transition rounded-lg hover:bg-slate-800"
                            title="Download TXT Note"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCopy(note.id, `${note.title}\n\n${note.summary}\n\nKey Points:\n${note.keyPoints.join('\n')}`)}
                            className="text-slate-400 hover:text-white p-1.5 transition rounded-lg hover:bg-slate-800"
                            title="Copy Note"
                          >
                            {copiedId === note.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">{note.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                        {note.summary}
                      </p>

                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Key High-Yield Points:</span>
                        <ul className="space-y-1 text-xs text-slate-400 pl-4 list-disc">
                          {note.keyPoints.map((kp, kIdx) => (
                            <li key={kIdx} className="leading-normal">{kp}</li>
                          ))}
                        </ul>
                      </div>

                      {note.importantFormulaeOrTerms && (
                        <div className="pt-2 border-t border-slate-800/80 space-y-1">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Formulae / Terms:</span>
                          <div className="space-y-1 text-xs font-mono text-emerald-300 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20">
                            {note.importantFormulaeOrTerms.map((f, fIdx) => (
                              <div key={fIdx}>• {f}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {onAskAgentAboutTopic && (
                      <div className="pt-3 border-t border-slate-800 flex justify-end">
                        <button
                          onClick={() => onAskAgentAboutTopic(`${selectedSubject.name}: ${note.title}`)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                          <span>Ask AI Tutor for Detailed Explanation</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. QUESTION BANK TAB */}
        {activeTab === 'question_bank' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  <span>{selectedSubject.name} Question Bank</span>
                </h3>
                <p className="text-xs text-slate-400">Short, Long & Numerical Board Exam Model Questions with Full Answers</p>
              </div>

              {/* Question Type Filter */}
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'short', label: 'Short' },
                  { id: 'long', label: 'Long' },
                  { id: 'numerical', label: 'Numericals' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setQbTypeFilter(f.id as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                      qbTypeFilter === f.id
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredQuestionBank.map((qb) => (
                <div key={qb.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400 font-semibold">{qb.chapter}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        qb.type === 'long' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}>
                        {qb.type} ({qb.marks} Marks)
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white flex items-start gap-2 leading-snug">
                    <span className="text-amber-400 font-mono">Q:</span>
                    <span>{qb.question}</span>
                  </h4>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Model Answer / Step-by-Step Explanation:</span>
                    <p className="whitespace-pre-wrap">{qb.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. MCQ QUIZ TEST TAB */}
        {activeTab === 'mcq_quiz' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl text-center">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  INTERACTIVE MCQ QUIZ
                </span>
                <h3 className="text-lg font-black text-white">{activeMcqSubject.name} Practice Quiz</h3>
                <p className="text-xs text-slate-400">Test your conceptual knowledge for Board MCQs with instant feedback & explanations.</p>
              </div>

              {/* Quiz Score Header */}
              <div className="flex items-center justify-around p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-center">
                  <div className="text-xs text-slate-500 font-bold uppercase">Total MCQs</div>
                  <div className="text-xl font-black text-white">{totalMcqsInActiveSubject}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500 font-bold uppercase">Answered</div>
                  <div className="text-xl font-black text-indigo-400">{Object.keys(userMcqAnswers).length}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500 font-bold uppercase">Score</div>
                  <div className="text-xl font-black text-emerald-400">{correctCount} / {totalMcqsInActiveSubject}</div>
                </div>
              </div>

              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setUserMcqAnswers({})}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Quiz
                </button>
              </div>
            </div>

            {/* MCQ List */}
            <div className="space-y-5">
              {activeMcqSubject.mcqs.map((mcq, idx) => {
                const selectedOption = userMcqAnswers[mcq.id];
                const isAnswered = selectedOption !== undefined;

                return (
                  <div key={mcq.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Question {idx + 1} • {mcq.chapter}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-relaxed">{mcq.question}</h4>

                    <div className="space-y-2">
                      {mcq.options.map((opt, oIdx) => {
                        const isChosen = selectedOption === oIdx;
                        const isCorrect = mcq.correctAnswerIndex === oIdx;

                        let btnStyle = 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700';
                        if (isAnswered) {
                          if (isCorrect) btnStyle = 'bg-emerald-950/80 text-emerald-200 border-emerald-500/50 font-bold';
                          else if (isChosen) btnStyle = 'bg-rose-950/80 text-rose-200 border-rose-500/50 font-bold';
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => {
                              setUserMcqAnswers(prev => ({ ...prev, [mcq.id]: oIdx }));
                            }}
                            className={`w-full p-3 rounded-2xl border text-xs text-left transition flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                            {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                            {isAnswered && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1 animate-fade-in">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Explanation:</span>
                        <p className="leading-relaxed">{mcq.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. SAMPLE PAPERS & PYQS TAB */}
        {activeTab === 'sample_papers' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>{selectedSubject.name} Sample Papers & Model Tests</span>
              </h3>

              {selectedSubject.samplePapers.map((sp) => (
                <div key={sp.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{sp.title}</h4>
                      <p className="text-xs text-slate-400">Total Marks: {sp.totalMarks} • Duration: {sp.duration}</p>
                    </div>
                    <span className="text-xs font-mono bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-500/30 self-start sm:self-auto">
                      Year {sp.year}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exam Sections & Weightage:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sp.sections.map((sec, sIdx) => (
                        <div key={sIdx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                          <div className="font-bold text-white">{sec.sectionName}</div>
                          <div className="text-[11px] text-slate-400">{sec.instructions}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Solution Key Summary:</span>
                    <p>{sp.solutions}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* PYQs Section */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span>Previous Year Board Question Papers (PYQs 2021-2025)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedSubject.previousYearPapers.map((pyq) => (
                  <div key={pyq.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-purple-300 font-bold uppercase bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/20">
                        {pyq.board} • {pyq.year}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{pyq.totalMarks} Marks</span>
                    </div>

                    <h4 className="text-xs font-bold text-white">{pyq.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      {pyq.solutionsSummary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. COMMERCE TIMETABLE TAB */}
        {activeTab === 'timetable' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <span>Class 12 Commerce Smart Study Schedule</span>
                </h3>
                <p className="text-xs text-slate-400">Structured daily study slots, numerical practice, and revision targets</p>
              </div>

              <div className="text-xs font-mono bg-amber-500/20 text-amber-300 font-bold px-3 py-1.5 rounded-2xl border border-amber-500/30 shrink-0">
                Weekly Target: 20 Hours
              </div>
            </div>

            <div className="space-y-3">
              {DEFAULT_COMMERCE_TIMETABLE.map((slot) => (
                <div key={slot.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-xs font-bold shrink-0">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {slot.timeSlot}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{slot.subjectName}</span>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-bold">
                          {slot.day}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{slot.topic}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {slot.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">{slot.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. PROGRESS TRACKER & GOALS TAB */}
        {activeTab === 'progress' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Board Exam Readiness Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/80 via-orange-950/60 to-slate-900 border border-amber-500/20 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Commerce Board Exam Readiness</h3>
                    <p className="text-xs text-slate-400">Chapter completion across {CLASS_12_MAHARASHTRA_COMMERCE_SUBJECTS.length} selected subjects.</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-amber-400">{overallProgress}%</div>
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase">{completedChapters} / {totalChapters} Chapters</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full shadow-lg transition-all" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>

            {/* Subject Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CLASS_12_MAHARASHTRA_COMMERCE_SUBJECTS.map((subj) => {
                const subjectCompletedIds = completedChapterIds[subj.id] || [];
                const completedCount = subjectCompletedIds.length;
                const pct = subj.chapters.length
                  ? Math.round((completedCount / subj.chapters.length) * 100)
                  : 0;
                const Icon = getSubjectIcon(subj.iconName);

                return (
                  <details key={subj.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
                    <summary className="cursor-pointer list-none space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-slate-950 text-amber-400 border border-slate-800">
                            <Icon className="w-4 h-4" />
                          </div>
                          <h4 className="text-xs font-bold text-white">{subj.name}</h4>
                        </div>
                        <span className="text-xs font-black text-amber-400">{completedCount}/{subj.chapters.length} Chapters</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400 font-semibold pt-1">
                        <span>{subj.notes.length} Notes</span>
                        <span>{subj.mcqs.length} MCQs</span>
                        <span>{subj.questionBank.length} Solved Questions</span>
                        <span>{subj.samplePapers.length} Practice Papers</span>
                      </div>
                    </summary>
                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-1">
                      {subj.chapters.map((chapter) => {
                        const isCompleted = subjectCompletedIds.includes(chapter.id);
                        return (
                          <label key={chapter.id} className="flex items-start gap-2.5 p-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800/70 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => toggleChapterCompletion(subj.id, chapter.id)}
                              className="mt-0.5 accent-amber-500"
                            />
                            <span className={isCompleted ? 'text-slate-500 line-through' : ''}>
                              {chapter.number}. {chapter.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

