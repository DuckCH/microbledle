/**
 * Microbledle Gold-Standard Medical Reference Textbooks Registry
 * Configured directly from the medical student library.
 */

export const TEXTBOOK_REGISTRY = [
  {
    id: 'murray_10ed',
    shortName: 'Murray 10th Ed',
    title: 'Medical Microbiology',
    authors: 'Patrick R. Murray, Ken S. Rosenthal, Michael A. Pfaller',
    edition: '10th Edition',
    badgeColor: 'bg-indigo-950/70 border-indigo-500/50 text-indigo-300',
    dotColor: 'bg-indigo-400',
    primaryFocus: 'General Microbiology, Bacteriology, Virology & Diagnostic Flowcharts'
  },
  {
    id: 'jawetz_29ed',
    shortName: 'Jawetz 29th Ed',
    title: 'Jawetz, Melnick & Adelberg’s Medical Microbiology',
    authors: 'Stefan Riedel, Jeffery A. Hobden, et al.',
    edition: '29th Edition',
    badgeColor: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
    dotColor: 'bg-amber-400',
    primaryFocus: 'Pathophysiology, Biochemical Reactions & Microbial Genetics'
  },
  {
    id: 'garcia_6ed',
    shortName: 'Garcia Parasitology 6th Ed',
    title: 'Diagnostic Medical Parasitology',
    authors: 'Lynne Shore Garcia',
    edition: '6th Edition',
    badgeColor: 'bg-teal-950/70 border-teal-500/50 text-teal-300',
    dotColor: 'bg-teal-400',
    primaryFocus: 'Helminths, Protozoa, Stool/Blood Smears & Larval Stage Differentiation'
  },
  {
    id: 'manson_24ed',
    shortName: 'Manson Tropical 24th Ed',
    title: 'Manson’s Tropical Diseases',
    authors: 'Jeremy Farrar, Peter J. Hotez, et al.',
    edition: '24th Edition',
    badgeColor: 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300',
    dotColor: 'bg-cyan-400',
    primaryFocus: 'Tropical Infections, Vector-Borne Pathogens & Global Health'
  },
  {
    id: 'mandell_10ed',
    shortName: 'Mandell ID 10th Ed (2026)',
    title: 'Mandell, Douglas, and Bennett’s Principles and Practice of Infectious Diseases',
    authors: 'John E. Bennett, Raphael Dolin, Martin J. Blaser',
    edition: '10th Edition (2026)',
    badgeColor: 'bg-rose-950/70 border-rose-500/50 text-rose-300',
    dotColor: 'bg-rose-400',
    primaryFocus: 'Clinical Pharmacotherapy, Antimicrobial Stewardship & Empiric Regimens'
  },
  {
    id: 'abbas_11ed',
    shortName: 'Abbas Immunology 11th Ed',
    title: 'Cellular and Molecular Immunology',
    authors: 'Abul K. Abbas, Andrew H. Lichtman, Shiv Pillai',
    edition: '11th Edition',
    badgeColor: 'bg-purple-950/70 border-purple-500/50 text-purple-300',
    dotColor: 'bg-purple-400',
    primaryFocus: 'Host Immune Defense, Superantigens & Pathogen Immune Evasion'
  },
  {
    id: 'custom_guidelines',
    shortName: 'Clinical Guidelines / Antibiogram',
    title: 'CDC / IDSA / Hospital Guidelines',
    authors: 'CDC MMWR / IDSA / Sanford Guide',
    edition: 'Current Guidelines',
    badgeColor: 'bg-slate-800 border-slate-600 text-slate-300',
    dotColor: 'bg-slate-400',
    primaryFocus: 'Specialized Antibiograms, Outbreak Reports & Public Health'
  }
];

export function getTextbookById(id) {
  return TEXTBOOK_REGISTRY.find(t => t.id === id) || TEXTBOOK_REGISTRY[0];
}
