import React from 'react';
import { X, Download, Smartphone, Share2, PlusSquare, CheckCircle, Sparkles } from 'lucide-react';

export default function InstallModal({ 
  isOpen, 
  onClose, 
  onInstallClick, 
  canInstallPrompt, 
  isIos 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl relative p-6 text-left overflow-hidden">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Icon & Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-lg shadow-emerald-950/50 shrink-0 bg-slate-900 ring-2 ring-emerald-500/20">
            <img 
              src="./apple-touch-icon.png" 
              alt="Microbledle" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              Install Microbledle
            </h3>
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" /> Progressive Web App (PWA)
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="space-y-2.5 text-xs text-slate-300 mb-6 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Full-Screen Gameplay:</strong> No address bars or browser clutter.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Offline Access:</strong> Practice and review Microdex pathogens anytime.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>One-Tap Home Screen Icon:</strong> Fast launch like a native medical app.</span>
          </div>
        </div>

        {/* Installation Instructions */}
        {canInstallPrompt ? (
          <div className="space-y-3">
            <button
              onClick={onInstallClick}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition active:scale-[0.99] text-xs"
            >
              <Download className="w-4 h-4" /> Install Microbledle Now
            </button>
            <p className="text-[11px] text-center text-slate-400">
              Free, secure, and takes 0 MB storage.
            </p>
          </div>
        ) : isIos ? (
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 text-xs">
            <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
              <Smartphone className="w-4 h-4" /> Installing on iOS (iPhone / iPad):
            </div>
            <ol className="space-y-2 text-slate-300 pl-1 list-decimal list-inside">
              <li>Tap the <strong className="text-white">Share</strong> button <span className="inline-block px-1.5 py-0.5 rounded bg-slate-700 text-slate-200">⎋</span> at the bottom of Safari.</li>
              <li>Scroll down and select <strong className="text-white">'Add to Home Screen'</strong> <span className="inline-block px-1.5 py-0.5 rounded bg-slate-700 text-slate-200">➕</span>.</li>
              <li>Tap <strong className="text-emerald-400">'Add'</strong> in the top-right corner.</li>
            </ol>
          </div>
        ) : (
          <div className="space-y-2 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/60 text-xs text-slate-300 text-center">
            <p className="font-semibold text-emerald-400">
              Desktop & Mobile Supported
            </p>
            <p className="text-[11px] text-slate-400">
              To install manually, click the install icon in your browser URL bar or browser menu (<strong className="text-white">'Install Microbledle'</strong>).
            </p>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            Maybe later
          </button>
        </div>

      </div>
    </div>
  );
}
