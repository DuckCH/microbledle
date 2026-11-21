/**
 * Textbook Cover Visual Configurations & Metadata
 * Defines visual book designs, edition emblems, spine accents, and publishers.
 */

export const TEXTBOOK_COVERS = {
  microdex: {
    id: 'microdex',
    isMicrodex: true,
    title: 'Microdex',
    subtitle: 'THE MEDICAL MICROBIOLOGY LIBRARY',
    edition: '100 Organisms • 2026 Edition',
    authors: 'Microbledle Medical Editorial Board',
    publisher: 'Microbledle Press',
    coverImage: './assets/covers/microdex_cover.jpg',
    colorTheme: {
      gradient: 'from-emerald-950 via-slate-900 to-cyan-950',
      border: 'border-emerald-500/50 hover:border-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      accent: 'emerald',
      glow: 'shadow-emerald-500/20'
    },
    primaryFocus: 'Clinical Cases • Morphology • Antibiotics • Keywords'
  },

  murray_10ed: {
    id: 'murray_10ed',
    title: 'Medical Microbiology',
    edition: '10th Edition',
    authors: 'Patrick R. Murray, Ken S. Rosenthal, Michael A. Pfaller',
    publisher: 'Elsevier',
    year: '2025/2026',
    isbn: '978-0323937108',
    coverImage: null, // Will use authentic high-res CSS/SVG rendered cover
    colorTheme: {
      gradient: 'from-rose-950 via-slate-900 to-indigo-950',
      border: 'border-indigo-500/50 hover:border-indigo-400',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      accent: 'indigo',
      glow: 'shadow-indigo-500/20',
      coverBg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-red-950',
      coverSpine: 'bg-red-700'
    },
    primaryFocus: 'General Microbiology, Bacteriology, Virology & Diagnostic Flowcharts'
  },

  jawetz_29ed: {
    id: 'jawetz_29ed',
    title: 'Jawetz, Melnick & Adelberg’s Medical Microbiology',
    edition: '29th Edition',
    authors: 'Stefan Riedel, Jeffery A. Hobden, Steve Miller, Stephen A. Morse',
    publisher: 'McGraw Hill Lange',
    year: '2024',
    isbn: '978-1260463477',
    coverImage: null,
    colorTheme: {
      gradient: 'from-amber-950 via-slate-900 to-sky-950',
      border: 'border-amber-500/50 hover:border-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      accent: 'amber',
      glow: 'shadow-amber-500/20',
      coverBg: 'bg-gradient-to-br from-sky-950 via-slate-900 to-amber-950',
      coverSpine: 'bg-amber-600'
    },
    primaryFocus: 'Pathophysiology, Biochemical Reactions & Microbial Genetics'
  },

  garcia_6ed: {
    id: 'garcia_6ed',
    title: 'Diagnostic Medical Parasitology',
    edition: '6th Edition',
    authors: 'Lynne Shore Garcia',
    publisher: 'ASM Press / Wiley',
    year: '2021',
    isbn: '978-1555818999',
    coverImage: null,
    colorTheme: {
      gradient: 'from-teal-950 via-slate-900 to-purple-950',
      border: 'border-teal-500/50 hover:border-teal-400',
      badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      accent: 'teal',
      glow: 'shadow-teal-500/20',
      coverBg: 'bg-gradient-to-br from-purple-950 via-slate-900 to-teal-950',
      coverSpine: 'bg-teal-600'
    },
    primaryFocus: 'Helminths, Protozoa, Stool/Blood Smears & Larval Stage Differentiation'
  },

  manson_24ed: {
    id: 'manson_24ed',
    title: 'Manson’s Tropical Diseases',
    edition: '24th Edition',
    authors: 'Jeremy Farrar, Peter J. Hotez, Thomas Junghanss, Gagandeep Kang',
    publisher: 'Elsevier',
    year: '2024',
    isbn: '978-0702079597',
    coverImage: null,
    colorTheme: {
      gradient: 'from-cyan-950 via-slate-900 to-emerald-950',
      border: 'border-cyan-500/50 hover:border-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      accent: 'cyan',
      glow: 'shadow-cyan-500/20',
      coverBg: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-cyan-950',
      coverSpine: 'bg-cyan-600'
    },
    primaryFocus: 'Tropical Infections, Vector-Borne Pathogens & Global Health'
  },

  mandell_10ed: {
    id: 'mandell_10ed',
    title: 'Mandell, Douglas, and Bennett’s Principles and Practice of Infectious Diseases',
    edition: '10th Edition (2026)',
    authors: 'John E. Bennett, Raphael Dolin, Martin J. Blaser',
    publisher: 'Elsevier',
    year: '2026',
    isbn: '978-0323933926',
    coverImage: null,
    colorTheme: {
      gradient: 'from-rose-950 via-slate-900 to-slate-950',
      border: 'border-rose-500/50 hover:border-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      accent: 'rose',
      glow: 'shadow-rose-500/20',
      coverBg: 'bg-gradient-to-br from-zinc-950 via-slate-900 to-rose-950',
      coverSpine: 'bg-rose-700'
    },
    primaryFocus: 'Clinical Pharmacotherapy, Antimicrobial Stewardship & Empiric Regimens'
  },

  abbas_11ed: {
    id: 'abbas_11ed',
    title: 'Cellular and Molecular Immunology',
    edition: '11th Edition',
    authors: 'Abul K. Abbas, Andrew H. Lichtman, Shiv Pillai',
    publisher: 'Elsevier',
    year: '2024/2025',
    isbn: '978-0323936491',
    coverImage: null,
    colorTheme: {
      gradient: 'from-purple-950 via-slate-900 to-pink-950',
      border: 'border-purple-500/50 hover:border-purple-400',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      accent: 'purple',
      glow: 'shadow-purple-500/20',
      coverBg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950',
      coverSpine: 'bg-purple-600'
    },
    primaryFocus: 'Host Immune Defense, Superantigens & Pathogen Immune Evasion'
  },

  custom_guidelines: {
    id: 'custom_guidelines',
    title: 'Clinical Antibiograms & Hospital Guidelines',
    edition: '2026 Guidelines',
    authors: 'CDC / IDSA / Sanford Guide / Hospital Antibiogram',
    publisher: 'IDSA / CDC Guidelines',
    year: '2026',
    isbn: 'Clinical Reference',
    coverImage: null,
    colorTheme: {
      gradient: 'from-slate-950 via-slate-900 to-blue-950',
      border: 'border-blue-500/50 hover:border-blue-400',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      accent: 'blue',
      glow: 'shadow-blue-500/20',
      coverBg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950',
      coverSpine: 'bg-blue-600'
    },
    primaryFocus: 'Local Antibiograms, Multi-Drug Resistant Patterns & Prophylaxis Bundles'
  }
};

export function getCoverMeta(id) {
  return TEXTBOOK_COVERS[id] || TEXTBOOK_COVERS.murray_10ed;
}
