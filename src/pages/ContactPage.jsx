import React, { useState } from 'react';
import { 
  Mail, Send, Copy, Check, CheckCircle2, AlertCircle, 
  Loader2, MessageSquare, RefreshCw 
} from 'lucide-react';

export default function ContactPage() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [category, setCategory] = useState('Feedback / Suggestion');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  
  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText('contact@microbledle.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !senderEmail.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('https://formsubmit.co/ajax/contact@microbledle.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: senderName.trim() || 'Anonymous Player',
          email: senderEmail.trim(),
          _replyto: senderEmail.trim(),
          _subject: `[Microbledle Contact] ${category} from ${senderName.trim() || 'Player'}`,
          category: category,
          message: message.trim(),
          _template: 'table',
          _captcha: 'false'
        })
      });

      const data = await response.json();

      if (response.ok || data.success === 'true' || data.success === true) {
        setSubmitSuccess(true);
        setMessage('');
      } else {
        throw new Error(data.message || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      setSubmitError('Unable to send message directly right now. You can try again or send an email directly to contact@microbledle.com.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMailtoFallback = () => {
    const subject = encodeURIComponent(`[Microbledle] ${category} from ${senderName || 'Player'}`);
    const body = encodeURIComponent(
      `Hello Microbledle Team,\n\n${message || 'I would like to get in touch regarding Microbledle.'}\n\n---\nFrom: ${senderName || 'Anonymous'}\nReply-To: ${senderEmail || 'Not provided'}\nCategory: ${category}`
    );
    window.location.href = `mailto:contact@microbledle.com?subject=${subject}&body=${body}`;
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
          Get in Touch
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Have feedback, spotted a typo, want to suggest a bug, or just want to say hi? We'd love to hear from you.
        </p>
      </div>

      {/* Primary Email Banner */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 inline-block mb-1.5">
            Official Email
          </span>
          <div className="text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-white">
            contact@microbledle.com
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Send us a message using the form below, or email us directly anytime.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition flex items-center gap-1.5 shadow-sm"
          >
            {copiedEmail ? (
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
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow"
          >
            <Mail className="w-3.5 h-3.5" /> Open Email App
          </a>
        </div>
      </div>

      {/* Website Contact Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span>Send a Message via Website</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Fill out the form below to deliver a message straight to our inbox at <strong className="text-slate-800 dark:text-slate-200">contact@microbledle.com</strong>.
          </p>
        </div>

        {submitSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-600/50 text-center space-y-3 animate-fade">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Message Sent Successfully!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
                Thank you for reaching out! Your message was delivered to our team at <code className="font-mono text-emerald-600 dark:text-emerald-400">contact@microbledle.com</code>. We will reply to your email address soon.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSubmitSuccess(false);
                setSubmitError('');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Send Another Message</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/60 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p>{submitError}</p>
                  <button
                    type="button"
                    onClick={handleMailtoFallback}
                    className="text-emerald-600 dark:text-emerald-400 font-bold underline hover:no-underline text-xs"
                  >
                    Click here to send via your email app instead
                  </button>
                </div>
              </div>
            )}

            {/* Category Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Topic
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Feedback / Suggestion',
                  'Bug / Typo in a Case',
                  'Suggest a Pathogen',
                  'School / Study Group',
                  'Other'
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      category === cat
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Name and Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sender Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Sender Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Your Email <span className="text-emerald-500 font-normal">(so we can reply)</span>
                </label>
                <input
                  type="email"
                  required
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Your Message
              </label>
              <textarea
                rows="4"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your note, feedback, or suggestion here..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Delivered directly to contact@microbledle.com
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block mb-1">
              Can I use Microbledle for classes or study groups?
            </strong>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Yes! Microbledle is completely free for medical schools, student clubs, study groups, and teaching rounds. If you need custom cases or features, feel free to drop us a message!
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block mb-1">
              When does the new daily case come out?
            </strong>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              A new Daily Case drops every day at <strong>00:00 UTC</strong> worldwide. You can also play unlimited random cases anytime in Practice Mode.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
