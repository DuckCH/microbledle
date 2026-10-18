import React from 'react';
import { 
  ArrowLeft, Sun, Moon, Info, Mail, ShieldCheck, AlertTriangle, BookOpen, Sparkles
} from 'lucide-react';

export default function StaticPageLayout({ 
  currentPage, 
  onNavigate, 
  onBack, 
  backLabel = 'Back to Menu',
  theme, 
  onToggleTheme, 
  children 
}) {
  const navItems = [
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact Us', icon: Mail },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'terms', label: 'Terms & Disclaimer', icon: AlertTriangle },
    { id: 'references', label: 'References', icon: BookOpen }
  ];

  return (
    <div className="w-full max-w-4xl flex-1 flex flex-col gap-6 animate-fade">
      
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="p-2 md:px-3 md:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white transition flex items-center gap-1.5 text-xs font-semibold shadow-sm shrink-0"
            title={backLabel}
          >
            <ArrowLeft className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>{backLabel}</span>
          </button>

          <div 
            onClick={onBack}
            className="flex items-center gap-3 cursor-pointer group"
            title="Return to Main Menu"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-md shrink-0 bg-slate-950 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
              <img 
                src="./apple-touch-icon.png" 
                alt="Microbledle Logo" 
                className="w-full h-full object-cover rounded-2xl" 
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
                MICROBLEDLE
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Medical Microbiology Deduction
              </p>
            </div>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-indigo-500" />
            )}
          </button>
        </div>
      </header>

      {/* Page Navigation Tabs */}
      <nav className="w-full p-1.5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-1 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl text-left">
        {children}
      </main>

    </div>
  );
}
