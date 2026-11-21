# 🗺️ Microbledle & WikiMicrobe Project Roadmap

Official product roadmap, architectural milestones, and ecosystem expansion plans for **Microbledle** and **WikiMicrobe**.

---

## 📌 Vision & Ecosystem

```
   ┌─────────────────────────────────────────────────────────────┐
   │                     MICROBIOLOGY ECOSYSTEM                  │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌───────────────────────────────┐        ┌───────────────────────────────┐
│     🎮 microbledle.com        │        │      📚 wikimicrobe.com       │
│   Daily Microbiology Game     │◄──────►│  Gold-Standard Medical Wiki   │
│  • Mystery Case & Streaks     │        │  • Microdex 100 Organisms     │
│  • Practice Mode & Leaderboard│        │  • 7 Textbook Chapter Summaries│
│  • Gamified Clinical Diagnosis│        │  • High-Yield Board Pearls    │
└───────────────────────────────┘        └───────────────────────────────┘
         ▲                                                 ▲
         └────────────────────────┬────────────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  │   Shared Firebase Cloud DB    │
                  │   Single Source of Truth      │
                  │  (Instant Real-Time Sync)     │
                  └───────────────────────────────┘
```

---

## 🚀 Milestone 1: Dedicated Route Architecture *(Current Sprint)*
- [x] Symmetrical 3-card Main Menu layout (Daily Case, Practice Mode, WikiMicrobe).
- [x] Microdex A-to-Z alphabetical sorting and 3:4 high-res cover artwork.
- [x] Admin secure authentication without plaintext passwords.
- [x] **Hash-Based Page Routing**:
  - `/#daily` ➔ Dedicated Full-Page Daily Case view.
  - `/#practice` ➔ Dedicated Full-Page Practice Mode view.
  - `/#wikimicrobe` ➔ Dedicated Full-Page WikiMicrobe Bookshelf view.
  - `/#microdex` ➔ Dedicated Full-Page Microdex Compendium view.
- [x] **Native Navigation**:
  - iPad swipe-back and browser Back/Forward button history management.
  - Deep linking support (`/#microdex?id=saureus`, `/#textbook?id=murray_10ed&ch=1`, `/#daily?date=YYYY-MM-DD`).
- [x] **Performance Optimization**:
  - Offscreen DOM suppression (`display: none` / GPU compositor layer optimization) ensuring silky-smooth 120 FPS rendering on ProMotion iPad Safari.

---

## 🌐 Milestone 2: WikiMicrobe Domain & Ecosystem Gateway *(Completed)*
- [x] **Domain Acquisition**: Secured `wikimicrobe.com` via Cloudflare Registrar (active through October 2027 with free WHOIS privacy).
- [x] **Firebase Cross-Domain Authorization**:
  - Added `wikimicrobe.com` and `www.wikimicrobe.com` to Firebase Authentication Authorized Domains.
  - Enabled cross-domain authenticated admin writes and real-time cloud sync.
- [x] **DNS & Gateway Routing**:
  - Configured Cloudflare Edge Proxy and 301 Redirect Rule forwarding `https://wikimicrobe.com` ➔ `https://microbledle.com/#wikimicrobe`.
- [x] **Hub & Spoke Traffic Loop**:
  - In-game post-diagnosis action: *"Read Textbook Summaries on WikiMicrobe →"*.
  - Library header banner: *"Test your clinical microbiology knowledge on today's mystery case! ➔ Play Microbledle Daily Case"*.

---

## 📖 Milestone 3: Comprehensive Reference Textbook Catalog
- [x] **Phase 3.1: Studio CMS Safety & 1-Click Backups** (Completed Nov 2026):
  - [x] **Unified 1-Click Ecosystem Backup**: Downloads single timestamped JSON file (`microbledle-ecosystem-backup-YYYY-MM-DD.json`) bundling all 100 pathogens and all authored textbook chapter summaries.
  - [x] **Granular 1-Click Exports**: Separate downloads for `microbes.json` (pathogen database) and `chapter-summaries.json` (WikiMicrobe textbook notes).
  - [x] **Disaster Recovery & Restore**: Automatic format detector and schema validator (`parseBackupJson()`) with item count preview.
  - [x] **Live Firestore Cloud & Local Sync**: 1-Click restore updates Firestore under authenticated admin account (`users/ADMIN_UID`) and local app state simultaneously.
  - [x] **Direct GitHub REST Sync**: Automated push to `main` branch for both `src/data/microbes.json` and `src/data/bundledChapterSummaries.json` via GitHub PAT.
- [ ] **Phase 3.2: Flagship Reference Content Authoring & Seeding (Murray 10th Ed)**:
  - [ ] Semi-automated textbook ingestion pipeline (AI extraction + Human medical review).
  - [ ] Key Chapters: *Staphylococcus* (Ch 18), *Streptococcus* (Ch 19), *Enterobacteriaceae* (Ch 27), *Pseudomonas* (Ch 30), etc.
  - [ ] Markdown tables for diagnostic tests, virulence factors, and treatment regimens.
  - [ ] Bidirectional deep linking to Microdex pathogen IDs.
- [ ] **Phase 3.3: Multi-Textbook Expansion**:
  - **Patrick R. Murray (10th Ed)**: 84 Chapters (Bacteriology, Virology, Mycology, Parasitology).
  - **Jawetz, Melnick & Adelberg (29th Ed)**: 48 Chapters.
  - **Lynne Shore Garcia (6th Ed)**: 40 Chapters (Diagnostic Medical Parasitology).
  - **Manson's Tropical Diseases (24th Ed)**: Tropical Medicine & Vector-borne Infections.
  - **Mandell, Douglas, and Bennett (10th Ed 2026)**: Principles & Practice of Infectious Diseases.
  - **Abul K. Abbas (11th Ed)**: Cellular and Molecular Immunology.
  - **IDSA / CDC / Sanford Guidelines**: Clinical Antibiograms & Stewardship.

---

## 🏛️ Milestone 4: Standalone WikiMicrobe Web Application
- [ ] Dedicated responsive web app deployed on `wikimicrobe.com`.
- [ ] Wikipedia / Amboss style clean reading experience with dark/light themes.
- [ ] Search engine optimization (SEO) with server-rendered metadata for Google indexing.
- [ ] Fast client-side fuzzy search across all chapters, buzzwords, and drug regimens.
- [ ] Offline PWA support with service worker caching for clinical ward rounds.
