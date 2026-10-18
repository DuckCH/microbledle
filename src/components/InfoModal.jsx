import React, { useState } from 'react';
import { 
  X, Info, Mail, ShieldCheck, AlertTriangle, BookOpen, 
  Copy, Check, ExternalLink, Heart, Sparkles, Send, Globe, MessageSquare
} from 'lucide-react';

export default function InfoModal({ isOpen, onClose, initialTab = 'about' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [feedbackCategory, setFeedbackCategory] = useState('General Feedback');
  const [feedbackText, setFeedbackText] = useState('');

  if (!isOpen) return null;

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleSendDraft = () => {
    const subject = encodeURIComponent(`[Microbledle ${feedbackCategory}]`);
    const body = encodeURIComponent(feedbackText ? `${feedbackText}\n\n---\nSent from Microbledle App` : '');
    window.location.href = `mailto:contact@microbledle.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden text-left">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                Microbledle Information
              </h2>
              <p className="text-xs text-slate-400">
                Medical microbiology deduction & learning
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 shrink-0 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'about'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'contact'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Us</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'privacy'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'terms'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Terms & Disclaimer</span>
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
              activeTab === 'sources'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>References</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-300 text-sm leading-relaxed">
          
          {/* TAB 1: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-fade">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Our Mission
                </span>
                <h3 className="text-lg font-black text-white mt-1.5 mb-2">
                  Gamified Medical Microbiology for Healthcare Learners
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <strong>Microbledle</strong> is a daily diagnostic deduction game engineered for medical students, infectious disease fellows, clinical microbiologists, and life science enthusiasts. Instead of memorizing static flashcards, players analyze real clinical vignettes, Gram stains, biochemical markers, and antimicrobial regimens to solve daily mystery cases.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Experience</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <strong className="text-emerald-400 block mb-1">🧪 Daily Deduction</strong>
                    Diagnose the target pathogen in 6 guesses or fewer with property feedback across morphology, Gram stain, respiration, taxonomy, and tropism.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <strong className="text-teal-400 block mb-1">💊 Rx Challenge</strong>
                    Test empirical first-line antimicrobial chemotherapy decisions for each correctly diagnosed case.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <strong className="text-cyan-400 block mb-1">📖 USMLE Bugdex Compendium</strong>
                    Unlock 40+ high-yield medical microbiology profile cards packed with board-exam buzzwords and culture media.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <strong className="text-amber-400 block mb-1">🏆 Career Progression</strong>
                    Level up from Pre-Med to Attending Physician as you maintain streaks and earn XP worldwide.
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Built with passion for clinical education & medical curiosity.</span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Heart className="w-3.5 h-3.5 fill-emerald-400" /> Microbledle Team
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT US */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-fade">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Get in Touch</h3>
                <p className="text-xs text-slate-400">
                  Have feedback, detected a medical inaccuracy, want to suggest a new bug, or discuss academic collaboration? We'd love to hear from you.
                </p>
              </div>

              {/* Email Card */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    Official Email
                  </span>
                  <div className="text-sm font-mono font-bold text-white break-all">
                    contact@microbledle.com
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    For feedback, clinical corrections, suggestions, or inquiries.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyEmail('contact@microbledle.com')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-750 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 transition flex items-center gap-1"
                  >
                    {copiedEmail === 'contact@microbledle.com' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </>
                    )}
                  </button>
                  <a
                    href="mailto:contact@microbledle.com"
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email Us
                  </a>
                </div>
              </div>

              {/* Quick Message Helper */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 block">
                  Quick Email Draft
                </span>
                
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'General Feedback', 
                    'Bug Report / Correction', 
                    'Pathogen Suggestion', 
                    'Academic Collaboration'
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFeedbackCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        feedbackCategory === cat 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <textarea
                  rows="3"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Type your notes or feedback here (e.g., suggestion for Pseudomonas clue, clinical typo)..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSendDraft}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                  >
                    <Send className="w-3.5 h-3.5" /> Open in Email App
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fade text-xs leading-relaxed">
              <div>
                <h3 className="text-base font-bold text-white mb-0.5">Privacy Policy</h3>
                <p className="text-[11px] text-slate-400">Last updated: {new Date().getFullYear()}</p>
              </div>

              <div className="space-y-3 text-slate-300">
                <p>
                  At <strong>Microbledle</strong>, accessible from microbledle.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information we collect and record, and how we use it.
                </p>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                  <strong className="text-emerald-400 text-xs block">1. What Information We Collect</strong>
                  <p>
                    <strong>Authentication Data:</strong> When you sign in with Google or create an account, we receive basic profile info (your email address and Google display name) to link your gameplay statistics across devices.
                  </p>
                  <p>
                    <strong>Game Progress & Stats:</strong> We store your solved cases, guess distribution, Bugdex unlock IDs, current streak, and XP in Firebase Firestore.
                  </p>
                  <p>
                    <strong>Local Storage:</strong> We use browser localStorage to keep your current day's active game board and theme preference (light/dark mode) intact without constant network requests.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                  <strong className="text-emerald-400 text-xs block">2. How We Use Your Information</strong>
                  <p>
                    We use the information solely to calculate leaderboards, sync your game progress between multiple devices, and maintain fair play. We <strong>never</strong> sell, monetize, or share your personal data with third-party data brokers or advertisers.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                  <strong className="text-emerald-400 text-xs block">3. Analytics & Cookies</strong>
                  <p>
                    We use Google Analytics for Firebase to record anonymous aggregated metrics (e.g. daily case participation rates, general completion rates) to improve game balance and fix bugs. No intrusive tracking cookies are deployed.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                  <strong className="text-emerald-400 text-xs block">4. Data Deletion Requests</strong>
                  <p>
                    You have the right to request the deletion of your account and associated game stats at any time. Simply email us at <code className="text-emerald-400 font-mono">contact@microbledle.com</code> with your account email.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TERMS & MEDICAL DISCLAIMER */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fade text-xs leading-relaxed">
              <div>
                <h3 className="text-base font-bold text-white mb-0.5">Terms of Service & Medical Disclaimer</h3>
                <p className="text-[11px] text-slate-400">Strict educational use notice</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>MANDATORY CLINICAL DISCLAIMER</span>
                </div>
                <p className="leading-relaxed">
                  <strong>Microbledle is strictly an academic, educational, and entertainment puzzle game.</strong> It is designed to assist medical and healthcare students in reinforcing medical microbiology knowledge.
                </p>
                <p className="leading-relaxed font-semibold">
                  Under NO circumstances should any information, clue, diagnosis, or antimicrobial regimen presented in Microbledle be construed as medical advice, clinical decision support, or clinical practice guidelines for real patients.
                </p>
                <p className="leading-relaxed text-[11px] text-amber-300/80">
                  Real clinical management must always rely on individualized patient assessment, licensed supervising medical professionals, institutional hospital antibiograms, and official infectious disease guidelines (IDSA, CDC, WHO, UpToDate).
                </p>
              </div>

              <div className="space-y-2.5 text-slate-300">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <strong className="text-white block mb-0.5">Academic Fair Use</strong>
                  Microbledle content is freely accessible for individual study, classroom interactive rounds, and student study groups.
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <strong className="text-white block mb-0.5">Intellectual Property</strong>
                  The original gameplay mechanics, design, artwork, and educational curation are copyright &copy; {new Date().getFullYear()} Microbledle.
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REFERENCES & SOURCES */}
          {activeTab === 'sources' && (
            <div className="space-y-4 animate-fade text-xs leading-relaxed">
              <div>
                <h3 className="text-base font-bold text-white mb-0.5">Scientific References & Compendia</h3>
                <p className="text-[11px] text-slate-400">Standardized clinical references used across pathogen profiles</p>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">Murray, Rosenthal, Pfaller</strong>
                    <span className="text-slate-400">Medical Microbiology (Elsevier) — Primary reference for bacterial taxonomy, Gram morphology, and biochemical tests.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">Jawetz, Melnick, & Adelberg's</strong>
                    <span className="text-slate-400">Medical Microbiology (McGraw Hill) — Reference for virulence factors, toxins, culture criteria, and infectious pathogenesis.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">CDC & WHO Public Health Guidelines</strong>
                    <span className="text-slate-400">Centers for Disease Control and Prevention & World Health Organization surveillance reports, clinical syndromic presentations, and vector epidemiology.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">USMLE Step 1 & Board Compendia</strong>
                    <span className="text-slate-400">High-yield clinical associations, classic board exam buzzwords, and first-line empirical therapies.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>microbledle.com</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
