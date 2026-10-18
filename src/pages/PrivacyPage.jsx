import React from 'react';

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 leading-relaxed">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Effective Date: January 1, {currentYear} • Last Updated: October {currentYear}
        </p>
      </div>

      {/* Detailed Legal Sections */}
      <div className="space-y-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
        
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            1. Introduction & Scope
          </h2>
          <p className="leading-relaxed">
            Welcome to <strong>Microbledle</strong> (<code className="text-emerald-600 dark:text-emerald-400 font-mono">microbledle.com</code>). This Privacy Policy explains how Microbledle collects, stores, protects, and handles your information when you access or play our web application and services. We are dedicated to respecting user privacy and keeping data collection as minimal as possible.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            2. Information We Collect
          </h2>
          <p className="leading-relaxed">
            We only collect information directly necessary to provide game functionality:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-xs">
            <li>
              <strong>Authentication Information:</strong> If you sign in via Google OAuth or email, we receive your email address, unique authentication identifier (UID), and default display name. We use this strictly to link your statistics across devices.
            </li>
            <li>
              <strong>Gameplay Progression Data:</strong> When you complete cases, we store your game stats (games played, win count, streak records, guess distribution, and unlocked Bugdex IDs) in Google Cloud Firestore.
            </li>
            <li>
              <strong>Browser Local Storage:</strong> To provide instant offline responsiveness and zero-latency state recovery, your current day's progress, theme preference (light/dark mode), and audio mute settings are cached directly on your device.
            </li>
            <li>
              <strong>Anonymous Telemetry & Analytics:</strong> We use Google Analytics for Firebase to observe aggregated events (e.g. daily case completions, error rates). This telemetry is completely anonymized and contains no personally identifiable medical or personal data.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            3. How We Use Information
          </h2>
          <p className="leading-relaxed text-xs">
            The information collected is used exclusively for:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Displaying global daily case and all-time rankings on the Leaderboard.</li>
            <li>Synchronizing your case outcomes, streaks, and Bugdex collection across multiple devices (e.g. phone, iPad, laptop).</li>
            <li>Diagnosing server stability issues and refining game balance.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            4. Information Sharing & Third-Party Disclosure
          </h2>
          <p className="leading-relaxed">
            <strong>We do not sell, trade, rent, or commercialize your personal information to third parties under any circumstances.</strong>
          </p>
          <p className="leading-relaxed text-xs">
            Data is stored securely on <strong>Google Firebase</strong> infrastructure (Authentication, Cloud Firestore, Firebase Hosting), which maintains world-class ISO 27001, SOC 1/2/3, and GDPR compliance.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            5. Your Rights & Data Deletion
          </h2>
          <p className="leading-relaxed">
            In compliance with global data privacy regulations (including GDPR and CCPA), you have the right to request:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>An export of the gameplay data associated with your account.</li>
            <li>The total, permanent deletion of your account, scores, and profile from our Firestore database.</li>
          </ul>
          <p className="text-xs pt-1">
            To request data deletion, simply send an email from your registered account to <a href="mailto:contact@microbledle.com" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">contact@microbledle.com</a> with the subject <em>"Data Deletion Request"</em>. We will process your deletion within 48 hours.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            6. Children's Privacy
          </h2>
          <p className="leading-relaxed text-xs">
            Microbledle is intended for medical students, healthcare trainees, and adult learners. We do not knowingly collect personal identifiable information from children under the age of 13.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            7. Contact Us About Privacy
          </h2>
          <p className="leading-relaxed text-xs">
            If you have any questions, inquiries, or concerns regarding this Privacy Policy, please contact our privacy compliance team at:
          </p>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 font-mono text-xs text-slate-800 dark:text-slate-200">
            Email: <a href="mailto:contact@microbledle.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">contact@microbledle.com</a>
          </div>
        </section>

      </div>

    </div>
  );
}
