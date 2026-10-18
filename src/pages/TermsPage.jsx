import React from 'react';
import { AlertTriangle, ShieldAlert, FileText, CheckCircle2, Scale } from 'lucide-react';

export default function TermsPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 leading-relaxed">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-2 shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5" />
          Legal & Clinical Notice
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Terms of Service & Medical Disclaimer
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Effective Date: January 1, {currentYear} • Last Updated: October {currentYear}
        </p>
      </div>

      {/* Prominent Clinical Disclaimer Alert Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-500/50 text-slate-900 dark:text-amber-200 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-black text-sm uppercase tracking-wide">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>MANDATORY CLINICAL & MEDICAL DISCLAIMER</span>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed font-semibold">
          Microbledle is strictly an academic, educational, and entertainment puzzle application. It is created solely to assist medical students, healthcare trainees, and life science learners in revising medical microbiology concepts.
        </p>

        <p className="text-xs sm:text-sm leading-relaxed">
          <strong>Under NO circumstances should any content, puzzle, diagnosis, clue, or antimicrobial regimen presented in Microbledle be construed as medical advice, clinical guidance, or diagnostic instruction for real-world patient care.</strong>
        </p>

        <p className="text-xs text-slate-700 dark:text-amber-300/80 leading-relaxed pt-1 border-t border-amber-200 dark:border-amber-500/30">
          Real patient diagnosis and infectious disease treatment must always be determined by licensed medical doctors and healthcare professionals based on individualized clinical examination, local hospital antibiograms, institutional protocols, and official guidelines from organizations such as the Infectious Diseases Society of America (IDSA), the Centers for Disease Control and Prevention (CDC), and the World Health Organization (WHO).
        </p>
      </div>

      {/* Terms of Service Sections */}
      <div className="space-y-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
        
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            1. Acceptance of Terms
          </h2>
          <p className="leading-relaxed">
            By accessing or playing Microbledle (<code className="text-emerald-600 dark:text-emerald-400 font-mono">microbledle.com</code>), you agree to be bound by these Terms of Service and acknowledge the Medical Disclaimer above. If you do not agree to these terms, please refrain from using the application.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            2. Permitted Academic & Educational Use
          </h2>
          <p className="leading-relaxed">
            Microbledle grants you a personal, non-exclusive, non-transferable, revocable license to access and use the game for:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Personal study and academic revision.</li>
            <li>Medical school small-group teaching, clinical rounds discussions, and student competitions.</li>
            <li>Non-commercial educational demonstration.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            3. Intellectual Property Rights
          </h2>
          <p className="leading-relaxed">
            All original game mechanics, user interface designs, custom graphics, source code, and educational compendia are the intellectual property of Microbledle and are protected by applicable copyright and intellectual property laws (&copy; {currentYear} Microbledle. All rights reserved).
          </p>
          <p className="text-xs leading-relaxed">
            Microbiological taxonomic names, pathogen attributes, and standard medical buzzwords are scientific facts derived from public academic literature and standard clinical textbooks.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            4. Limitation of Liability & Warranty Disclaimer
          </h2>
          <p className="leading-relaxed text-xs">
            Microbledle is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind, whether express or implied. To the fullest extent permitted by law, the creators and contributors of Microbledle disclaim all liability for any damages, losses, or clinical outcomes arising directly or indirectly from the use of or inability to use this educational game.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            5. Modifications to Terms
          </h2>
          <p className="leading-relaxed text-xs">
            We reserve the right to revise or update these terms at any time. Changes become effective immediately upon posting to this page.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            6. Contact for Legal Inquiries
          </h2>
          <p className="leading-relaxed text-xs">
            For legal inquiries, intellectual property questions, or academic partnership terms, please contact:
          </p>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 font-mono text-xs text-slate-800 dark:text-slate-200">
            Email: <a href="mailto:contact@microbledle.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">contact@microbledle.com</a>
          </div>
        </section>

      </div>

    </div>
  );
}
