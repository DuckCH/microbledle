import React, { useState, useMemo } from 'react';
import { 
  X, Search, BookOpen, CheckCircle2, Lock, Sparkles, 
  Microscope, TestTube2, Stethoscope, Dna, Pill, Eye, EyeOff,
  Flame, Award, ShieldAlert, ArrowRight
} from 'lucide-react';
import microbes from '../data/microbes.json';

function getGramBadge(gram) {
  const g = gram.toLowerCase();
  if (g.includes('virus') || g.includes('viral') || g.includes('rna') || g.includes('dna')) {
    return { bg: 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300', dot: 'bg-emerald-400', label: 'Virus' };
  }
  if (g.includes('parasite') || g.includes('protozo') || g.includes('flagellate') || g.includes('amoeba')) {
    return { bg: 'bg-teal-950/70 border-teal-700/60 text-teal-300', dot: 'bg-teal-400', label: 'Parasite' };
  }
  if (g.includes('fungal') || g.includes('fungi') || g.includes('yeast') || g.includes('mold')) {
    return { bg: 'bg-amber-950/70 border-amber-700/60 text-amber-300', dot: 'bg-amber-400', label: 'Fungi' };
  }
  if (g.includes('acid-fast')) {
    return { bg: 'bg-red-950/70 border-red-700/60 text-red-300', dot: 'bg-red-400', label: 'Acid-Fast' };
  }
  if (g.includes('spirochete')) {
    return { bg: 'bg-cyan-950/70 border-cyan-700/60 text-cyan-300', dot: 'bg-cyan-400', label: 'Spirochete' };
  }
  if (g.includes('no cell wall') || g.includes('atypical') || g.includes('intracellular')) {
    return { bg: 'bg-indigo-950/70 border-indigo-700/60 text-indigo-300', dot: 'bg-indigo-400', label: 'Atypical' };
  }
  if (g.includes('positive')) {
    return { bg: 'bg-purple-950/70 border-purple-700/60 text-purple-300', dot: 'bg-purple-400', label: 'Gram +' };
  }
  if (g.includes('negative')) {
    return { bg: 'bg-rose-950/70 border-rose-700/60 text-rose-300', dot: 'bg-rose-400', label: 'Gram −' };
  }
  return { bg: 'bg-slate-800/70 border-slate-700/60 text-slate-300', dot: 'bg-slate-400', label: 'Microbe' };
}

export default function BugdexModal({ isOpen, onClose, unlockedBugIds = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [studyMode, setStudyMode] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);

  const unlockedSet = useMemo(() => new Set(unlockedBugIds), [unlockedBugIds]);

  const filterOptions = [
    'All', 
    'Bacteria', 
    'Viruses', 
    'Fungi', 
    'Parasites', 
    'Gram +', 
    'Gram −', 
    'Acid-Fast', 
    'Spirochete'
  ];

  const filteredMicrobes = useMemo(() => {
    return microbes.filter(bug => {
      // Filter category
      if (activeFilter !== 'All') {
        const gram = bug.morphology.gram.toLowerCase();
        const tax = bug.taxonomy.toLowerCase();

        if (activeFilter === 'Bacteria') {
          const isNonBacterial = tax.includes('virus') || tax.includes('fungi') || tax.includes('parasite') || tax.includes('apicomplexa') || tax.includes('metamonada') || tax.includes('amoebozoa') || tax.includes('ascomycota') || tax.includes('basidiomycota') || gram.includes('viral') || gram.includes('fungal') || gram.includes('parasite');
          if (isNonBacterial) return false;
        } else if (activeFilter === 'Viruses') {
          if (!tax.includes('virus') && !gram.includes('viral')) return false;
        } else if (activeFilter === 'Fungi') {
          if (!tax.includes('fungi') && !tax.includes('ascomycota') && !tax.includes('basidiomycota') && !gram.includes('fungal')) return false;
        } else if (activeFilter === 'Parasites') {
          if (!tax.includes('parasite') && !tax.includes('protozoa') && !tax.includes('apicomplexa') && !tax.includes('metamonada') && !tax.includes('amoebozoa') && !gram.includes('parasite')) return false;
        } else if (activeFilter === 'Gram +') {
          if (!gram.includes('positive')) return false;
        } else if (activeFilter === 'Gram −') {
          if (!gram.includes('negative')) return false;
        } else if (activeFilter === 'Acid-Fast') {
          if (!gram.includes('acid-fast')) return false;
        } else if (activeFilter === 'Spirochete') {
          if (!gram.includes('spirochete') && !tax.includes('spirochaetota')) return false;
        }
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = bug.name.toLowerCase().includes(term);
        const matchesCommon = bug.commonName.toLowerCase().includes(term);
        const matchesBuzz = bug.buzzwords?.toLowerCase().includes(term);
        const matchesTropism = bug.tropism.toLowerCase().includes(term);
        if (!matchesName && !matchesCommon && !matchesBuzz && !matchesTropism) return false;
      }

      return true;
    });
  }, [activeFilter, searchTerm]);

  const masteryPercentage = Math.round((unlockedSet.size / microbes.length) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fade">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Bugdex Library
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Quick Guide
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pathogen Guide & High-Yield Exam Notes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Study Mode Toggle */}
            <button
              onClick={() => setStudyMode(!studyMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                studyMode 
                  ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' 
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Reveal all pathogens for exam studying"
            >
              {studyMode ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
              {studyMode ? 'Study Mode Active' : 'Study Mode (Reveal All)'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress & Search Controls */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 shrink-0 space-y-3">
          
          {/* Progress Bar */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              Mastery: <strong className="text-white">{unlockedSet.size}</strong> of {microbes.length} Diagnosed
            </span>
            <span className="font-mono font-bold text-emerald-400">{masteryPercentage}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              style={{ width: `${Math.max(4, masteryPercentage)}%` }} 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            />
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                placeholder="Search by pathogen, buzzword, disease, or symptom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setActiveFilter(opt)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    activeFilter === opt
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pathogens Cards Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredMicrobes.map((bug) => {
            const isUnlocked = unlockedSet.has(bug.id) || studyMode;
            const gramBadge = getGramBadge(bug.morphology.gram);

            return (
              <div
                key={bug.id}
                onClick={() => isUnlocked && setSelectedBug(bug)}
                className={`p-3.5 rounded-2xl border transition-all text-left relative flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-slate-700/80 hover:border-emerald-500/60 hover:bg-slate-800/80 cursor-pointer shadow-lg group'
                    : 'bg-slate-900/30 border-slate-800/60 opacity-60 select-none'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${gramBadge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${gramBadge.dot}`} />
                      {gramBadge.label}
                    </span>

                    {isUnlocked ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {unlockedSet.has(bug.id) ? 'Mastered' : 'Preview'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Undiscovered
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-emerald-300 italic group-hover:text-emerald-200 transition">
                    {isUnlocked ? bug.name : 'Unknown Pathogen'}
                  </h3>
                  <div className="text-[11px] text-slate-400 not-italic">
                    {isUnlocked ? bug.commonName : 'Solve in Daily/Practice to reveal'}
                  </div>

                  {isUnlocked && (
                    <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 italic">
                      "{bug.buzzwords || bug.smear}"
                    </p>
                  )}
                </div>

                {isUnlocked && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[170px]">{bug.tropism}</span>
                    <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                      View Flashcard <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detailed Pathogen Flashcard Modal */}
        {selectedBug && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade">
            <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 md:p-7 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
              <button 
                onClick={() => setSelectedBug(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Title & Taxonomy Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getGramBadge(selectedBug.morphology.gram).bg}`}>
                    {getGramBadge(selectedBug.morphology.gram).label}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{selectedBug.taxonomy}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-emerald-400 italic">
                  {selectedBug.name}
                </h2>
                <div className="text-sm text-slate-300 font-medium">
                  {selectedBug.commonName} • {selectedBug.morphology.shape} • {selectedBug.respiration}
                </div>
              </div>

              {/* High-Yield Sections */}
              <div className="space-y-3 text-xs">
                
                {/* 1. First Aid Buzzwords */}
                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200">
                  <span className="font-bold flex items-center gap-1.5 text-amber-400 text-xs mb-1">
                    <Sparkles className="w-4 h-4" /> Board Exam Buzzwords & Associations:
                  </span>
                  <p className="leading-relaxed font-medium">{selectedBug.buzzwords}</p>
                </div>

                {/* 2. Virulence Factors */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-200">
                  <span className="font-bold flex items-center gap-1.5 text-cyan-400 text-xs mb-1">
                    <Dna className="w-4 h-4" /> Virulence Factors & Toxins:
                  </span>
                  <p className="leading-relaxed">{selectedBug.virulence}</p>
                </div>

                {/* 3. Clinical Vignette */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-200">
                  <span className="font-bold flex items-center gap-1.5 text-rose-400 text-xs mb-1">
                    <Stethoscope className="w-4 h-4" /> Classic Patient Presentation:
                  </span>
                  <p className="italic font-serif leading-relaxed text-slate-300">"{selectedBug.vignette}"</p>
                </div>

                {/* 4. Diagnostics: Smear & Culture */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300">
                    <span className="font-bold flex items-center gap-1.5 text-cyan-300 text-xs mb-1">
                      <Microscope className="w-3.5 h-3.5" /> Smear & Morphology:
                    </span>
                    <p className="leading-relaxed">{selectedBug.smear}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300">
                    <span className="font-bold flex items-center gap-1.5 text-teal-300 text-xs mb-1">
                      <TestTube2 className="w-3.5 h-3.5" /> Culture & Media:
                    </span>
                    <p className="leading-relaxed">{selectedBug.culture}</p>
                  </div>
                </div>

                {/* 5. Pharmacotherapy & Tropism */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-700/50 text-emerald-200">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-400 text-xs mb-1">
                      <Pill className="w-3.5 h-3.5" /> First-Line Treatment:
                    </span>
                    <p className="leading-relaxed">{selectedBug.firstLineRx}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300">
                    <span className="font-bold flex items-center gap-1.5 text-purple-400 text-xs mb-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> Transmission & Reservoirs:
                    </span>
                    <p className="leading-relaxed">{selectedBug.transmission}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
