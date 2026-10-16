import React, { useState } from 'react';
import { 
  X, Mail, Lock, User, AlertCircle, CheckCircle2, 
  ArrowRight, ShieldCheck, Sparkles, KeyRound, ExternalLink
} from 'lucide-react';
import { 
  signInWithGoogle, 
  registerWithEmail, 
  loginWithEmail, 
  isFirebaseConfigured 
} from '../firebase';

export default function AuthModal({ isOpen, onClose, onDemoLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (!isFirebaseConfigured) {
        // Fallback to demo login if Firebase keys not configured
        if (onDemoLogin) {
          onDemoLogin({
            uid: 'demo_google_user_123',
            displayName: 'Medical Student (Demo)',
            email: 'student@med.edu',
            photoURL: null
          });
          onClose();
        }
        return;
      }
      await signInWithGoogle();
      onClose();
    } catch (err) {
      if (err.message === 'FIREBASE_NOT_CONFIGURED') {
        setErrorMsg('Firebase credentials not set in .env. Use Demo Login or configure Firebase.');
      } else {
        setErrorMsg(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      if (!isFirebaseConfigured) {
        if (onDemoLogin) {
          onDemoLogin({
            uid: `demo_user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
            displayName: displayName.trim() || email.split('@')[0],
            email: email,
            photoURL: null
          });
          onClose();
        }
        return;
      }

      if (isRegister) {
        await registerWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      let msg = err.message || 'Authentication error';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Try signing in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    if (onDemoLogin) {
      onDemoLogin({
        uid: 'demo_resident_456',
        displayName: 'Dr. Resident (Cloud Sync)',
        email: 'resident@microbledle.med',
        photoURL: null
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden text-left p-6">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to sync your streaks, daily cases, and Bugdex across all devices
          </p>
        </div>

        {/* Firebase Config Notice banner if .env not configured */}
        {!isFirebaseConfigured && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs">
            <div className="flex items-center justify-between font-bold text-amber-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Firebase Sync Ready
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-900/60 border border-amber-700">Demo Active</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-300">
              You can test cloud accounts right now with <strong>1-Click Demo Login</strong>, or connect your real Firebase project by setting <code className="bg-amber-950 px-1 py-0.5 rounded text-white">.env</code> keys!
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-600/60 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google One-Click Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl flex items-center justify-center gap-3 text-slate-100 font-semibold text-xs transition shadow-sm hover:border-slate-600 active:scale-[0.99] mb-4"
        >
          {/* Official Google SVG G-logo */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.14z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.09-6.68-4.9H1.21v3.13C3.25 21.43 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.32 14.3c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3V6.57H1.21C.44 8.11 0 9.99 0 12s.44 3.89 1.21 5.43l4.11-3.13z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.57 1.21 6.57l4.11 3.13c.94-2.81 3.58-4.95 6.68-4.95z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-slate-800"></div>
          <span className="px-3 text-[11px] text-slate-500 uppercase font-semibold">or email</span>
          <div className="flex-1 border-t border-slate-800"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          
          {isRegister && (
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Full Name / Handle (e.g. Dr. Alex)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="email"
              placeholder="medical.student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="password"
              placeholder="Password (minimum 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-2xl flex items-center justify-center gap-2 text-white text-xs shadow-lg shadow-emerald-900/40 transition active:scale-[0.99] mt-2"
          >
            {loading ? 'Authenticating...' : (isRegister ? 'Register Account' : 'Sign In with Email')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Mode & Demo Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col gap-2 text-center text-xs">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
            }}
            className="text-slate-400 hover:text-emerald-400 font-medium transition"
          >
            {isRegister 
              ? 'Already have an account? Sign in here' 
              : "Don't have an account? Create one"}
          </button>

          {!isFirebaseConfigured && (
            <button
              onClick={handleDemoMode}
              className="text-amber-400 hover:underline font-semibold text-[11px] mt-1"
            >
              ⚡ Instant 1-Click Demo Login
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
