import React, { useState, useEffect } from 'react';
import { 
  X, ArrowLeft, BookOpen, Edit3, Save, Sparkles, Check, AlertCircle, 
  Tag, ExternalLink, RefreshCw, Key, ShieldCheck, FileText, ChevronRight
} from 'lucide-react';
import { verifyAndAuthorizeAdmin, saveChapterSummaryToCloud } from '../firebase';

export default function ChapterWikiModal({
  isOpen,
  onClose,
  textbook,
  chapter,
  summaryData = null,
  onSaveSummary,
  allMicrobes = [],
  onOpenPathogen,
  isAdmin = false
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Form fields for editing
  const [title, setTitle] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [highYieldPearls, setHighYieldPearls] = useState('');
  const [figuresTables, setFiguresTables] = useState('');
  const [selectedBugs, setSelectedBugs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Load existing chapter summary data when chapter changes
  useEffect(() => {
    if (chapter) {
      setTitle(summaryData?.title || chapter.title || '');
      setSummaryText(summaryData?.summary || '');
      setHighYieldPearls(summaryData?.highYieldPearls || '');
      setFiguresTables(summaryData?.figuresTables || '');
      setSelectedBugs(summaryData?.linkedBugs || chapter.linkedBugs || []);
      setIsEditing(false);
      setShowPasswordPrompt(false);
      setPasswordError('');
      setSaveSuccess(false);
      setSaveError('');
    }
  }, [chapter, summaryData, isOpen]);

  if (!isOpen || !chapter || !textbook) return null;

  const handleStartEdit = () => {
    if (isAdmin) {
      setIsEditing(true);
    } else {
      setShowPasswordPrompt(true);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setIsVerifying(true);
    try {
      await verifyAndAuthorizeAdmin(passwordInput);
      setIsEditing(true);
      setShowPasswordPrompt(false);
      setPasswordInput('');
    } catch (err) {
      setPasswordError(err.message || 'Incorrect admin password.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleToggleBug = (bugId) => {
    setSelectedBugs(prev => 
      prev.includes(bugId) ? prev.filter(id => id !== bugId) : [...prev, bugId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    const updatedPayload = {
      chapterNumber: chapter.chapterNumber,
      title: title.trim() || chapter.title,
      section: chapter.section,
      summary: summaryText.trim(),
      highYieldPearls: highYieldPearls.trim(),
      figuresTables: figuresTables.trim(),
      linkedBugs: selectedBugs,
      updatedAt: new Date().toISOString()
    };

    try {
      await saveChapterSummaryToCloud(textbook.id, chapter.chapterNumber, updatedPayload);
      if (onSaveSummary) {
        onSaveSummary(textbook.id, chapter.chapterNumber, updatedPayload);
      }
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save summary to Cloud Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-fade"
      style={{ zIndex: 110 }}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden text-left">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0"
              title="Back to Chapters"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold truncate">
                <span>{textbook.title}</span>
                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                <span className="text-indigo-400">Chapter {chapter.chapterNumber}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate mt-0.5">
                {title || chapter.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isEditing && (
              <button
                onClick={handleStartEdit}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition bg-indigo-950/80 border-indigo-500/50 text-indigo-300 hover:bg-indigo-900 shadow-sm"
                title="Edit Chapter Summary"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Edit Summary</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Password Prompt Sub-Modal (if not yet unlocked) */}
          {showPasswordPrompt && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 animate-fade">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Key className="w-4 h-4" />
                <span>Admin Password Required to Edit Summary</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Enter your administrative password to unlock edit mode.
              </p>
              <form onSubmit={handlePasswordSubmit} className="flex items-center gap-2">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password"
                  disabled={isVerifying}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isVerifying || !passwordInput.trim()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition"
                >
                  {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Unlock</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordPrompt(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
              </form>
              {passwordError && (
                <div className="text-rose-400 text-[11px] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>
          )}

          {/* Feedback Messages */}
          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fade">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Chapter summary saved and published to Cloud live!</span>
            </div>
          )}
          {saveError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-fade">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* EDIT MODE */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Chapter Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  High-Yield USMLE Board Pearls (Key Takeaways)
                </label>
                <textarea
                  rows={3}
                  value={highYieldPearls}
                  onChange={(e) => setHighYieldPearls(e.target.value)}
                  placeholder="Key diagnostic markers, hallmark toxins, first-line empiric drugs..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-slate-200 text-xs focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                  Chapter Summary & Microbiology Notes
                </label>
                <textarea
                  rows={9}
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  placeholder="Write your study notes and comprehensive chapter summary here..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  High-Yield Figures & Tables Reference
                </label>
                <input
                  type="text"
                  value={figuresTables}
                  onChange={(e) => setFiguresTables(e.target.value)}
                  placeholder="e.g. Table 18-1 (Virulence factors), Box 18-2 (TSST-1 mechanism)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Linked Pathogens Selector */}
              <div>
                <label className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-1.5">
                  Linked Microdex Pathogens ({selectedBugs.length} tagged)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {allMicrobes.map(bug => {
                    const isSelected = selectedBugs.includes(bug.id);
                    return (
                      <button
                        key={bug.id}
                        type="button"
                        onClick={() => handleToggleBug(bug.id)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition ${
                          isSelected 
                            ? 'bg-teal-950/80 border-teal-500/70 text-teal-300 font-bold' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{bug.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50 transition"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSaving ? 'Saving...' : 'Save & Publish Live'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* READING VIEW */
            <div className="space-y-4">
              
              {/* High-Yield Pearls Box */}
              {highYieldPearls ? (
                <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>High-Yield USMLE Board Pearls</span>
                  </div>
                  <p className="text-amber-100/90 italic leading-relaxed text-[11px] whitespace-pre-wrap">
                    "{highYieldPearls}"
                  </p>
                </div>
              ) : null}

              {/* Full Summary Text */}
              {summaryText ? (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="font-bold text-indigo-400 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Chapter Summary & Notes:</span>
                  </span>
                  <div className="text-slate-200 leading-relaxed text-xs whitespace-pre-wrap font-sans">
                    {summaryText}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-slate-400 text-xs font-medium">
                    No summary written yet for Chapter {chapter.chapterNumber}.
                  </p>
                  <button
                    onClick={handleStartEdit}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Click to Write Summary & Notes</span>
                  </button>
                </div>
              )}

              {/* High-Yield Figures & Tables */}
              {figuresTables && (
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Referenced Figures & Tables:
                  </span>
                  <p className="text-slate-300 font-mono text-[11px]">{figuresTables}</p>
                </div>
              )}

              {/* Linked Pathogens in Microdex */}
              {selectedBugs.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-teal-950/20 border border-teal-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-400 text-xs flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Pathogens Covered in This Chapter ({selectedBugs.length}):</span>
                    </span>
                    <span className="text-[10px] text-teal-300/80 font-mono">Click to view in Microdex</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {selectedBugs.map(bugId => {
                      const foundBug = allMicrobes.find(b => b.id === bugId);
                      const displayName = foundBug ? foundBug.name : bugId;
                      return (
                        <button
                          key={bugId}
                          type="button"
                          onClick={() => {
                            if (onOpenPathogen) {
                              onOpenPathogen(bugId);
                            }
                          }}
                          className="px-2.5 py-1 rounded-xl bg-teal-950/80 hover:bg-teal-900 border border-teal-500/40 text-teal-300 text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                          title={`Open ${displayName} flashcard in Microdex`}
                        >
                          <span className="italic">{displayName}</span>
                          <ExternalLink className="w-3 h-3 text-teal-400 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
