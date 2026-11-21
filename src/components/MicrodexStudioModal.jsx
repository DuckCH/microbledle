import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Save, Download, GitBranch, BookOpen, Check, AlertCircle, 
  Sparkles, Dna, Stethoscope, Microscope, TestTube2, Pill, 
  ShieldAlert, Plus, Trash2, Key, RefreshCw, ExternalLink, ChevronDown
} from 'lucide-react';
import { TEXTBOOK_REGISTRY, getTextbookById } from '../data/textbooks';
import { downloadPathogensJson, commitPathogensToGitHub } from '../utils/githubSync';
import { savePathogenToCloud, checkIsAdmin, authorizeAdminWithPassphrase } from '../firebase';

export default function MicrodexStudioModal({
  isOpen,
  onClose,
  initialBugId = null,
  allMicrobes = [],
  onUpdateMicrobeInApp,
  user = null,
  profile = null
}) {
  const [isAdminState, setIsAdminState] = useState(false);
  const [passphraseInput, setPassphraseInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Selected pathogen in studio
  const [selectedBugId, setSelectedBugId] = useState(() => initialBugId || allMicrobes[0]?.id || '');
  const [activeTab, setActiveTab] = useState('textbooks'); // 'textbooks' | 'diagnostics' | 'vignette' | 'rx' | 'backup'

  // Form state
  const [formData, setFormData] = useState(null);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // GitHub commit settings
  const [githubToken, setGithubToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('microbledle_github_token') || '';
    }
    return '';
  });
  const [isCommittingGithub, setIsCommittingGithub] = useState(false);
  const [githubCommitResult, setGithubCommitResult] = useState(null);

  // Check admin status on open
  useEffect(() => {
    if (isOpen) {
      const authorized = checkIsAdmin(user, profile);
      setIsAdminState(authorized);
      if (initialBugId) {
        setSelectedBugId(initialBugId);
      }
    }
  }, [isOpen, user, profile, initialBugId]);

  // Load selected bug data into form state
  useEffect(() => {
    if (selectedBugId && allMicrobes.length > 0) {
      const bug = allMicrobes.find(b => b.id === selectedBugId);
      if (bug) {
        setFormData({
          ...bug,
          references: Array.isArray(bug.references) ? [...bug.references] : []
        });
        setSaveSuccessMsg('');
        setSaveErrorMsg('');
        setGithubCommitResult(null);
      }
    }
  }, [selectedBugId, allMicrobes]);

  if (!isOpen) return null;

  // Handle Passphrase Unlock
  const handleUnlockAdmin = (e) => {
    e.preventDefault();
    setAuthError('');
    const ok = authorizeAdminWithPassphrase(passphraseInput);
    if (ok) {
      setIsAdminState(true);
      setPassphraseInput('');
    } else {
      setAuthError('Incorrect Medical Director passphrase. Check your credentials.');
    }
  };

  // Field change handler
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedFieldChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] || {}),
        [field]: value
      }
    }));
  };

  // Reference management (Multi-textbook citations)
  const handleAddReference = () => {
    const defaultTextbook = TEXTBOOK_REGISTRY[0]; // Murray 10th Ed
    const newRef = {
      id: 'ref_' + Date.now(),
      textbookId: defaultTextbook.id,
      textbookTitle: defaultTextbook.title,
      edition: defaultTextbook.edition,
      chapter: '',
      chapterTitle: '',
      pages: '',
      figuresTables: '',
      highYieldPearls: ''
    };
    setFormData(prev => ({
      ...prev,
      references: [...(prev.references || []), newRef]
    }));
  };

  const handleUpdateReference = (index, field, value) => {
    setFormData(prev => {
      const updated = [...(prev.references || [])];
      if (field === 'textbookId') {
        const found = getTextbookById(value);
        updated[index] = {
          ...updated[index],
          textbookId: value,
          textbookTitle: found.title,
          edition: found.edition
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value
        };
      }
      return { ...prev, references: updated };
    });
  };

  const handleRemoveReference = (index) => {
    setFormData(prev => {
      const updated = [...(prev.references || [])];
      updated.splice(index, 1);
      return { ...prev, references: updated };
    });
  };

  // 1. SAVE TO FIREBASE CLOUD (Live push to all active players)
  const handleSaveToCloud = async () => {
    if (!formData) return;
    setIsSavingCloud(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      await savePathogenToCloud(formData);
      if (onUpdateMicrobeInApp) {
        onUpdateMicrobeInApp(formData);
      }
      setSaveSuccessMsg(`Published "${formData.name}" to Cloud Firestore successfully!`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      setSaveErrorMsg(err.message || 'Failed to save to Cloud Firestore.');
    } finally {
      setIsSavingCloud(false);
    }
  };

  // 2. OPTION A: 1-Click Download JSON Backup
  const handleDownloadBackup = () => {
    if (!formData) return;
    // Merge current form into full list
    const updatedFullList = allMicrobes.map(m => m.id === formData.id ? formData : m);
    downloadPathogensJson(updatedFullList, `microbes-backup-${new Date().toISOString().split('T')[0]}.json`);
    setSaveSuccessMsg('Downloaded pristine microbes.json snapshot to your device!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // 3. OPTION B: Direct GitHub Commit via REST API
  const handleCommitToGitHub = async () => {
    if (!githubToken.trim()) {
      setActiveTab('backup');
      setSaveErrorMsg('Please enter your GitHub Personal Access Token in the Backup & GitHub tab first.');
      return;
    }

    setIsCommittingGithub(true);
    setGithubCommitResult(null);
    setSaveErrorMsg('');

    try {
      const updatedFullList = allMicrobes.map(m => m.id === formData.id ? formData : m);
      const res = await commitPathogensToGitHub({
        token: githubToken,
        microbesList: updatedFullList,
        commitMessage: `chore(microdex): update textbook citations for ${formData.name} via In-App Studio`
      });

      setGithubCommitResult(res);
      setSaveSuccessMsg(`Committed directly to GitHub main branch! SHA: ${res.commitSha?.slice(0, 7)}`);
    } catch (err) {
      setSaveErrorMsg(err.message || 'GitHub commit failed.');
    } finally {
      setIsCommittingGithub(false);
    }
  };

  const handleSaveGithubToken = (token) => {
    setGithubToken(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('microbledle_github_token', token.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden text-left">
        
        {/* Studio Top Navbar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Microdex Studio
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300">
                  CMS Database
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Medical Microbiology & Clinical Citations Database Editor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Authorized View */}
        {!isAdminState ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
              <Key className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Medical Director Access</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your administrative passphrase or sign in with an authorized editor email to unlock the Microdex Studio.
              </p>
            </div>

            <form onSubmit={handleUnlockAdmin} className="space-y-3 pt-2">
              <input
                type="password"
                value={passphraseInput}
                onChange={(e) => setPassphraseInput(e.target.value)}
                placeholder="Enter admin passphrase (e.g. Kaoklong_MD)"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              />

              {authError && (
                <div className="text-xs text-rose-400 flex items-center gap-1.5 justify-center">
                  <AlertCircle className="w-4 h-4" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                Unlock Microdex Studio
              </button>
            </form>
          </div>
        ) : (
          /* Authorized Studio Content */
          <>
            {/* Organism Selector & Global Actions Bar */}
            <div className="px-4 py-3 bg-slate-950/50 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* Pathogen Selector */}
              <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                <span className="text-slate-400 font-semibold shrink-0">Pathogen:</span>
                <select
                  value={selectedBugId}
                  onChange={(e) => setSelectedBugId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-1.5 font-bold italic focus:outline-none focus:border-emerald-500 w-full text-xs"
                >
                  {allMicrobes.map(m => (
                    <option key={m.id} value={m.id} className="not-italic">
                      {m.name} ({m.commonName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Actions (Cloud Publish & Backup) */}
              <div className="flex items-center gap-2">
                {/* 1. Publish to Cloud */}
                <button
                  onClick={handleSaveToCloud}
                  disabled={isSavingCloud}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
                  title="Publish updates live to Cloud Firestore"
                >
                  {isSavingCloud ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSavingCloud ? 'Publishing...' : 'Save & Publish'}</span>
                </button>

                {/* 2. Option A: 1-Click JSON Download */}
                <button
                  onClick={handleDownloadBackup}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition"
                  title="Download clean microbes.json snapshot file"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">1-Click JSON</span>
                </button>

                {/* 3. Option B: Direct GitHub Commit */}
                <button
                  onClick={handleCommitToGitHub}
                  disabled={isCommittingGithub}
                  className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                  title="Commit directly to GitHub main branch via REST API"
                >
                  {isCommittingGithub ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitBranch className="w-3.5 h-3.5 text-indigo-400" />}
                  <span className="hidden sm:inline">{isCommittingGithub ? 'Pushing...' : 'Push GitHub'}</span>
                </button>
              </div>
            </div>

            {/* Notification Toasts */}
            {saveSuccessMsg && (
              <div className="px-4 py-2 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fade">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Check className="w-4 h-4" /> {saveSuccessMsg}
                </span>
                {githubCommitResult?.commitUrl && (
                  <a
                    href={githubCommitResult.commitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-[11px] flex items-center gap-1 hover:text-white"
                  >
                    View Commit <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {saveErrorMsg && (
              <div className="px-4 py-2 bg-rose-950/80 border-b border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5 font-semibold animate-fade">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveErrorMsg}</span>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-slate-800 bg-slate-950/30 px-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab('textbooks')}
                className={`px-3 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'textbooks'
                    ? 'border-indigo-400 text-indigo-300 bg-indigo-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Textbook Citations ({formData?.references?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('diagnostics')}
                className={`px-3 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'diagnostics'
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Microscope className="w-3.5 h-3.5 text-emerald-400" />
                <span>Core Diagnostics & Clue</span>
              </button>

              <button
                onClick={() => setActiveTab('vignette')}
                className={`px-3 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'vignette'
                    ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>USMLE Vignette & Pearls</span>
              </button>

              <button
                onClick={() => setActiveTab('rx')}
                className={`px-3 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'rx'
                    ? 'border-teal-400 text-teal-300 bg-teal-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Pill className="w-3.5 h-3.5 text-teal-400" />
                <span>Pharmacotherapy (Rx)</span>
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`px-3 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'backup'
                    ? 'border-purple-400 text-purple-300 bg-purple-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                <span>Backup & GitHub Sync</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {formData && (
                <>
                  {/* TAB 1: TEXTBOOK CITATIONS (MULTI-REFERENCE) */}
                  {activeTab === 'textbooks' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-indigo-400" />
                            <span>Gold-Standard Textbooks Referenced</span>
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Cite Murray 10th Ed, Garcia Parasitology, Mandell ID, or other textbook chapters.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddReference}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Textbook Citation</span>
                        </button>
                      </div>

                      {/* References List */}
                      {(!formData.references || formData.references.length === 0) ? (
                        <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                          <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-xs text-slate-400 font-medium">No textbooks cited yet for {formData.name}.</p>
                          <button
                            type="button"
                            onClick={handleAddReference}
                            className="text-xs text-indigo-400 hover:underline font-bold"
                          >
                            + Add first citation (Murray, Jawetz, Garcia, Manson, etc.)
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {formData.references.map((refItem, idx) => {
                            const textbookMeta = getTextbookById(refItem.textbookId);

                            return (
                              <div 
                                key={refItem.id || idx}
                                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 relative group"
                              >
                                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${textbookMeta.badgeColor}`}>
                                      {textbookMeta.shortName}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-300">
                                      Citation #{idx + 1}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveReference(idx)}
                                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                                    title="Delete Citation"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                  {/* Textbook Picker */}
                                  <div className="sm:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                      Select Textbook Preset
                                    </label>
                                    <select
                                      value={refItem.textbookId || 'murray_10ed'}
                                      onChange={(e) => handleUpdateReference(idx, 'textbookId', e.target.value)}
                                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-xs focus:outline-none focus:border-indigo-500"
                                    >
                                      {TEXTBOOK_REGISTRY.map(t => (
                                        <option key={t.id} value={t.id}>
                                          {t.title} ({t.edition}) — {t.authors}
                                        </option>
                                      ))}
                                    </select>
                                    <span className="text-[10px] text-slate-500 block mt-1">
                                      Scope: {textbookMeta.primaryFocus}
                                    </span>
                                  </div>

                                  {/* Chapter Number & Chapter Title */}
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                      Chapter Number
                                    </label>
                                    <input
                                      type="text"
                                      value={refItem.chapter || ''}
                                      onChange={(e) => handleUpdateReference(idx, 'chapter', e.target.value)}
                                      placeholder="e.g. 31 or 78"
                                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                      Chapter Title
                                    </label>
                                    <input
                                      type="text"
                                      value={refItem.chapterTitle || ''}
                                      onChange={(e) => handleUpdateReference(idx, 'chapterTitle', e.target.value)}
                                      placeholder="e.g. Legionella & Legionellaceae"
                                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>

                                  {/* Pages & Figures/Tables */}
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                      Page Range
                                    </label>
                                    <input
                                      type="text"
                                      value={refItem.pages || ''}
                                      onChange={(e) => handleUpdateReference(idx, 'pages', e.target.value)}
                                      placeholder="e.g. 315-322"
                                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                      Figures / Tables / Box
                                    </label>
                                    <input
                                      type="text"
                                      value={refItem.figuresTables || ''}
                                      onChange={(e) => handleUpdateReference(idx, 'figuresTables', e.target.value)}
                                      placeholder="e.g. Table 31-2 or Fig 78-4"
                                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>

                                  {/* High-Yield Clinical Pearls from this Textbook */}
                                  <div className="sm:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                      High-Yield Textbook Pearl / Board Summary
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={refItem.highYieldPearls || ''}
                                      onChange={(e) => handleUpdateReference(idx, 'highYieldPearls', e.target.value)}
                                      placeholder="Key diagnostic summary extracted from this textbook..."
                                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: CORE DIAGNOSTICS & CLUE */}
                  {activeTab === 'diagnostics' && (
                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Scientific Name (Italic)
                          </label>
                          <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-bold italic text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Common Name / Clinical Alias
                          </label>
                          <input
                            type="text"
                            value={formData.commonName || ''}
                            onChange={(e) => handleFieldChange('commonName', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Taxonomic Phylum / Group
                          </label>
                          <input
                            type="text"
                            value={formData.taxonomy || ''}
                            onChange={(e) => handleFieldChange('taxonomy', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Gram Stain & Cell Wall Type
                          </label>
                          <input
                            type="text"
                            value={formData.morphology?.gram || ''}
                            onChange={(e) => handleNestedFieldChange('morphology', 'gram', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Morphological Shape
                          </label>
                          <input
                            type="text"
                            value={formData.morphology?.shape || ''}
                            onChange={(e) => handleNestedFieldChange('morphology', 'shape', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Oxygen Requirement / Respiration
                          </label>
                          <input
                            type="text"
                            value={formData.respiration || ''}
                            onChange={(e) => handleFieldChange('respiration', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Biochemical Key Test / Marker
                          </label>
                          <input
                            type="text"
                            value={formData.keyTest || ''}
                            onChange={(e) => handleFieldChange('keyTest', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Infection Tropism / Organs
                          </label>
                          <input
                            type="text"
                            value={formData.tropism || ''}
                            onChange={(e) => handleFieldChange('tropism', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Standardized Clinical Start Clue */}
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                            Start Clinical Clue (Standardized: Age + Sex + 1 Chief Complaint)
                          </label>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Zero spoilers rule
                          </span>
                        </div>
                        <input
                          type="text"
                          value={formData.chiefComplaint || ''}
                          onChange={(e) => handleFieldChange('chiefComplaint', e.target.value)}
                          placeholder="e.g. A 42-year-old schoolteacher presents with abrupt onset of high fever"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 3: USMLE VIGNETTE & PEARLS */}
                  {activeTab === 'vignette' && (
                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                          First Aid / USMLE Board Buzzwords
                        </label>
                        <input
                          type="text"
                          value={formData.buzzwords || ''}
                          onChange={(e) => handleFieldChange('buzzwords', e.target.value)}
                          placeholder="Classic buzzwords..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                          Classic Patient Case Vignette
                        </label>
                        <textarea
                          rows={3}
                          value={formData.vignette || ''}
                          onChange={(e) => handleFieldChange('vignette', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500 italic leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                            Virulence Factors & Toxins
                          </label>
                          <textarea
                            rows={3}
                            value={formData.virulence || ''}
                            onChange={(e) => handleFieldChange('virulence', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                            Transmission, Vector & Reservoirs
                          </label>
                          <textarea
                            rows={3}
                            value={formData.transmission || ''}
                            onChange={(e) => handleFieldChange('transmission', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block mb-1">
                            Smear / Histology Finding
                          </label>
                          <textarea
                            rows={2}
                            value={formData.smear || ''}
                            onChange={(e) => handleFieldChange('smear', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block mb-1">
                            Culture Media & Laboratory Identification
                          </label>
                          <textarea
                            rows={2}
                            value={formData.culture || ''}
                            onChange={(e) => handleFieldChange('culture', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: PHARMACOTHERAPY (RX) */}
                  {activeTab === 'rx' && (
                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                          First-Line Antimicrobial (Clinical Standard)
                        </label>
                        <input
                          type="text"
                          value={formData.firstLineRx || ''}
                          onChange={(e) => handleFieldChange('firstLineRx', e.target.value)}
                          placeholder="e.g. Levofloxacin or Azithromycin"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-300 font-bold text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Empiric Rx Challenge (Post-Game Quiz Options)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-emerald-400 block mb-0.5 font-semibold">Correct Answer (Rx)</label>
                            <input
                              type="text"
                              value={formData.empiricRx?.correct || ''}
                              onChange={(e) => handleNestedFieldChange('empiricRx', 'correct', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-amber-400 block mb-0.5 font-semibold">Distractor 1</label>
                            <input
                              type="text"
                              value={formData.empiricRx?.distractors?.[0] || ''}
                              onChange={(e) => {
                                const dists = [...(formData.empiricRx?.distractors || ['', '', ''])];
                                dists[0] = e.target.value;
                                handleNestedFieldChange('empiricRx', 'distractors', dists);
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-amber-400 block mb-0.5 font-semibold">Distractor 2</label>
                            <input
                              type="text"
                              value={formData.empiricRx?.distractors?.[1] || ''}
                              onChange={(e) => {
                                const dists = [...(formData.empiricRx?.distractors || ['', '', ''])];
                                dists[1] = e.target.value;
                                handleNestedFieldChange('empiricRx', 'distractors', dists);
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-amber-400 block mb-0.5 font-semibold">Distractor 3</label>
                            <input
                              type="text"
                              value={formData.empiricRx?.distractors?.[2] || ''}
                              onChange={(e) => {
                                const dists = [...(formData.empiricRx?.distractors || ['', '', ''])];
                                dists[2] = e.target.value;
                                handleNestedFieldChange('empiricRx', 'distractors', dists);
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Clinical Mechanism / Pearl</label>
                          <input
                            type="text"
                            value={formData.empiricRx?.pearl || ''}
                            onChange={(e) => handleNestedFieldChange('empiricRx', 'pearl', e.target.value)}
                            placeholder="Why this antibiotic works..."
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: BACKUP & GITHUB SYNC */}
                  {activeTab === 'backup' && (
                    <div className="space-y-4 text-xs">
                      
                      {/* Option A Card */}
                      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                            <Download className="w-4 h-4 text-cyan-400" />
                            <span>Option A: 1-Click JSON Snapshot Download</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-semibold">
                            Zero Setup
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Generates a full snapshot of all 100 pathogens formatted as clean <code className="text-cyan-300">microbes.json</code> and saves it to your iPad or laptop download folder.
                        </p>
                        <button
                          type="button"
                          onClick={handleDownloadBackup}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold flex items-center gap-1.5 transition text-xs shadow"
                        >
                          <Download className="w-4 h-4 text-cyan-400" />
                          <span>Export & Download microbes.json</span>
                        </button>
                      </div>

                      {/* Option B Card */}
                      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                            <GitBranch className="w-4 h-4 text-indigo-400" />
                            <span>Option B: Direct GitHub Commit via REST API</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-semibold">
                            Automated Cloud Backup
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Pushes updates directly into <strong className="text-white">DuckCH/microbledle</strong> on branch <code className="text-indigo-300">main</code>. Your Personal Access Token (PAT) is stored securely in this browser's local storage and never leaves your device.
                        </p>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            GitHub Personal Access Token (PAT)
                          </label>
                          <input
                            type="password"
                            value={githubToken}
                            onChange={(e) => handleSaveGithubToken(e.target.value)}
                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_xxxxxxxxxxxx"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                          />
                          <span className="text-[10px] text-slate-500 block mt-1">
                            Requires a GitHub fine-grained token with <em>Contents: Read & Write</em> permission on DuckCH/microbledle.
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleCommitToGitHub}
                          disabled={isCommittingGithub || !githubToken.trim()}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold flex items-center gap-1.5 transition text-xs shadow-md disabled:opacity-40"
                        >
                          {isCommittingGithub ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
                          <span>{isCommittingGithub ? 'Committing to GitHub...' : 'Commit & Push to GitHub Main'}</span>
                        </button>
                      </div>

                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 text-[11px]">
                {formData ? `Editing ID: ${formData.id}` : ''}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold transition"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleSaveToCloud}
                  disabled={isSavingCloud}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingCloud ? 'Saving...' : 'Save & Publish Live'}</span>
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
