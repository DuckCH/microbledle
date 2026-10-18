import React, { useState } from 'react';
import { 
  Mail, Send, Copy, Check, MessageSquare, AlertCircle, 
  HelpCircle, Sparkles, Globe, ExternalLink 
} from 'lucide-react';

export default function ContactPage() {
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [category, setCategory] = useState('General Feedback');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');

  const handleCopy = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    const targetEmail = category === 'Bug Report / Clinical Inaccuracy' ? 'info@microbledle.com' : 'contact@microbledle.com';
    const subject = encodeURIComponent(`[Microbledle] ${category} ${senderName ? `from ${senderName}` : ''}`);
    const body = encodeURIComponent(
      `Hello Microbledle Team,\n\n${message || 'I would like to get in touch regarding Microbledle.'}\n\n---\nSender: ${senderName || 'Anonymous'}\nCategory: ${category}\nSent from microbledle.com`
    );
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6 leading-relaxed">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-2 shadow-sm">
          <Mail className="w-3.5 h-3.5" />
          Contact Us
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          We'd Love to Hear From You
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Reach out for clinical corrections, pathogen requests, academic integrations, or feedback.
        </p>
      </div>

      {/* Email Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Contact Email */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                General & Partnerships
              </span>
            </div>
            <div className="text-base font-mono font-bold text-slate-900 dark:text-white break-all">
              contact@microbledle.com
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              For general inquiries, university or medical school course integrations, student clubs, and suggestions.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-center gap-2">
            <button
              onClick={() => handleCopy('contact@microbledle.com')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition flex items-center gap-1.5 shadow-sm"
            >
              {copiedEmail === 'contact@microbledle.com' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Email
                </>
              )}
            </button>
            <a
              href="mailto:contact@microbledle.com"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow"
            >
              <Mail className="w-3.5 h-3.5" /> Send Email
            </a>
          </div>
        </div>

        {/* Info & Support Email */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                Support & Clinical Corrections
              </span>
            </div>
            <div className="text-base font-mono font-bold text-slate-900 dark:text-white break-all">
              info@microbledle.com
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Spotted a typographical or microbiological inaccuracy? Need technical support or account deletion? Email us here.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-center gap-2">
            <button
              onClick={() => handleCopy('info@microbledle.com')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition flex items-center gap-1.5 shadow-sm"
            >
              {copiedEmail === 'info@microbledle.com' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Email
                </>
              )}
            </button>
            <a
              href="mailto:info@microbledle.com"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition flex items-center gap-1.5 shadow"
            >
              <Mail className="w-3.5 h-3.5" /> Send Email
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Compose Message Form */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Send Us a Message
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Select a topic and type your note — clicking Send will launch your email client pre-addressed and formatted.
          </p>
        </div>

        <form onSubmit={handleSendEmail} className="space-y-4">
          {/* Topic selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Subject Category
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'General Feedback',
                'Bug Report / Clinical Inaccuracy',
                'Pathogen Request',
                'Academic Collaboration',
                'Account / Data Deletion'
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    category === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Your Name / Title (Optional)
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g., Dr. Smith / Medical Student Year 4"
              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Message Field */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Message
            </label>
            <textarea
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us your feedback, clue suggestions, or clinical notes..."
              required
              className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open in Email App</span>
            </button>
          </div>
        </form>
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block mb-1">
              Can I use Microbledle for teaching in my medical school course or rounds?
            </strong>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Yes! Microbledle is freely accessible for medical education, residency morning reports, and microbiology small-group tutoring. If you would like custom case packs or classroom stats, please email <code className="text-emerald-500 font-mono">contact@microbledle.com</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block mb-1">
              How often are new cases released?
            </strong>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              A new Daily Case drops synchronously every 24 hours at <strong>00:00 UTC</strong> worldwide. Unlimited random cases are also available anytime in Practice Mode.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
