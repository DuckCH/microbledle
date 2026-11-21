/**
 * Gold-Standard Medical Reference Textbooks Chapter Index
 * Pre-populated official chapter index catalogs for Microbledle Library.
 */

export const TEXTBOOK_CHAPTERS = {
  // ==========================================
  // 1. MURRAY MEDICAL MICROBIOLOGY (10th Ed)
  // ==========================================
  murray_10ed: [
    // Section 1: Introduction
    { chapterNumber: 1, title: 'Introduction to Medical Microbiology', section: 'Introduction', linkedBugs: [] },
    { chapterNumber: 2, title: 'Human Microbiome in Health and Disease', section: 'Introduction', linkedBugs: ['bfragilis', 'ecoli', 'lacidophilus'] },
    { chapterNumber: 3, title: 'Sterilization, Disinfection, and Antisepsis', section: 'Introduction', linkedBugs: ['bspores', 'cdifficile'] },

    // Section 2: General Principles of Medical Microbiology
    { chapterNumber: 4, title: 'Bacterial Classification, Structure, and Replication', section: 'General Principles', linkedBugs: ['saureus', 'ecoli'] },
    { chapterNumber: 5, title: 'Bacterial Metabolism and Genetics', section: 'General Principles', linkedBugs: [] },
    { chapterNumber: 6, title: 'Viral Classification, Structure, and Replication', section: 'General Principles', linkedBugs: ['influenza', 'hiv'] },
    { chapterNumber: 7, title: 'Fungal Classification, Structure, and Replication', section: 'General Principles', linkedBugs: ['calbicans', 'cneoformans'] },
    { chapterNumber: 8, title: 'Parasitic Classification, Structure, and Replication', section: 'General Principles', linkedBugs: ['pfalciparum', 'gduodenalis'] },

    // Section 3: Basic Concepts in the Immune Response
    { chapterNumber: 9, title: 'Innate Host Defenses', section: 'Immune Response', linkedBugs: [] },
    { chapterNumber: 10, title: 'Cellular Immune Responses', section: 'Immune Response', linkedBugs: ['mtuberculosis', 'lmonocytogenes'] },
    { chapterNumber: 11, title: 'Humoral Immune Responses', section: 'Immune Response', linkedBugs: ['spneumoniae', 'nmeningitidis'] },
    { chapterNumber: 12, title: 'Antimicrobial Vaccines', section: 'Immune Response', linkedBugs: ['spneumoniae', 'hbv', 'hpv'] },

    // Section 4: General Principles of Laboratory Diagnosis
    { chapterNumber: 13, title: 'Microscopic Principles and Applications', section: 'Laboratory Diagnosis', linkedBugs: ['saureus', 'treponema_pallidum'] },
    { chapterNumber: 14, title: 'Molecular Diagnostics in Microbiology', section: 'Laboratory Diagnosis', linkedBugs: ['hiv', 'hcv', 'covid19'] },
    { chapterNumber: 15, title: 'Serologic and Immunodiagnostic Principles', section: 'Laboratory Diagnosis', linkedBugs: ['epstein_barr', 'syphilis'] },

    // Section 5: Bacteriology
    { chapterNumber: 16, title: 'Antibacterial Agents and Resistance Mechanisms', section: 'Bacteriology', linkedBugs: ['mrsa', 'vre', 'cre'] },
    { chapterNumber: 17, title: 'Staphylococcus and Related Gram-Positive Cocci', section: 'Bacteriology', linkedBugs: ['saureus', 'sepidermidis', 'ssaprophyticus'] },
    { chapterNumber: 18, title: 'Streptococcus: Group A, Group B, and Enterococcus', section: 'Bacteriology', linkedBugs: ['spyogenes', 'sagalactiae', 'efaecalis'] },
    { chapterNumber: 19, title: 'Streptococcus pneumoniae and Viridans Streptococci', section: 'Bacteriology', linkedBugs: ['spneumoniae', 'smutans', 'sbovis'] },
    { chapterNumber: 20, title: 'Bacillus anthracis and Bacillus cereus', section: 'Bacteriology', linkedBugs: ['banthracis', 'bcereus'] },
    { chapterNumber: 21, title: 'Listeria monocytogenes and Erysipelothrix', section: 'Bacteriology', linkedBugs: ['lmonocytogenes', 'erhusiopathiae'] },
    { chapterNumber: 22, title: 'Corynebacterium diphtheriae and Related Species', section: 'Bacteriology', linkedBugs: ['cdiphtheriae', 'cminutissimum'] },
    { chapterNumber: 23, title: 'Nocardia and Related Actinomycetes', section: 'Bacteriology', linkedBugs: ['nasteroides', 'abrasiliensis'] },
    { chapterNumber: 24, title: 'Mycobacterium tuberculosis and Acid-Fast Bacilli', section: 'Bacteriology', linkedBugs: ['mtuberculosis', 'mleprae', 'mavium'] },
    { chapterNumber: 25, title: 'Neisseria meningitidis and Neisseria gonorrhoeae', section: 'Bacteriology', linkedBugs: ['nmeningitidis', 'ngonorrhoeae'] },
    { chapterNumber: 26, title: 'Enterobacteriaceae: Escherichia, Klebsiella, Proteus', section: 'Bacteriology', linkedBugs: ['ecoli', 'kpneumoniae', 'pmirabilis'] },
    { chapterNumber: 27, title: 'Salmonella and Shigella Infections', section: 'Bacteriology', linkedBugs: ['styphi', 'senterica', 'sdysenteriae'] },
    { chapterNumber: 28, title: 'Yersinia: Y. pestis, Y. enterocolitica, Y. pseudotuberculosis', section: 'Bacteriology', linkedBugs: ['ypestis', 'yenterocolitica'] },
    { chapterNumber: 29, title: 'Vibrio cholerae, V. parahaemolyticus, V. vulnificus', section: 'Bacteriology', linkedBugs: ['vcholerae', 'vparahaemolyticus', 'vvulnificus'] },
    { chapterNumber: 30, title: 'Campylobacter jejuni and Helicobacter pylori', section: 'Bacteriology', linkedBugs: ['cjejuni', 'hpylori'] },
    { chapterNumber: 31, title: 'Pseudomonas aeruginosa and Burkholderia', section: 'Bacteriology', linkedBugs: ['paeruginosa', 'bcepacia', 'bpseudomallei'] },
    { chapterNumber: 32, title: 'Haemophilus influenzae and H. ducreyi', section: 'Bacteriology', linkedBugs: ['hinfluenzae', 'hducreyi'] },
    { chapterNumber: 33, title: 'Bordetella pertussis and Bordetella parapertussis', section: 'Bacteriology', linkedBugs: ['bpertussis', 'bparapertussis'] },
    { chapterNumber: 34, title: 'Francisella tularensis and Brucella species', section: 'Bacteriology', linkedBugs: ['ftularensis', 'babortus', 'bmelitensis'] },
    { chapterNumber: 35, title: 'Legionella pneumophila and Related Legionellaceae', section: 'Bacteriology', linkedBugs: ['lpneumophila', 'lmicdadei'] },
    { chapterNumber: 36, title: 'Clostridium tetani, C. botulinum, C. perfringens', section: 'Bacteriology', linkedBugs: ['ctetani', 'cbotulinum', 'cperfringens'] },
    { chapterNumber: 37, title: 'Clostridioides difficile: Pseudomembranous Colitis', section: 'Bacteriology', linkedBugs: ['cdifficile'] },
    { chapterNumber: 38, title: 'Anaerobic Gram-Negative Bacilli: Bacteroides, Prevotella', section: 'Bacteriology', linkedBugs: ['bfragilis', 'fnecrophorum'] },
    { chapterNumber: 39, title: 'Treponema pallidum and Syphilitic Manifestations', section: 'Bacteriology', linkedBugs: ['tpallidum'] },
    { chapterNumber: 40, title: 'Borrelia burgdorferi (Lyme) and Borrelia recurrentis', section: 'Bacteriology', linkedBugs: ['bburgdorferi', 'brecurrentis'] },
    { chapterNumber: 41, title: 'Leptospira interrogans and Weil Disease', section: 'Bacteriology', linkedBugs: ['linterrogans'] },
    { chapterNumber: 42, title: 'Mycoplasma pneumoniae and Ureaplasma', section: 'Bacteriology', linkedBugs: ['mpneumoniae', 'uhominis'] },
    { chapterNumber: 43, title: 'Rickettsia rickettsii, R. prowazekii, Orientia tsutsugamushi', section: 'Bacteriology', linkedBugs: ['rrickettsii', 'rprowazekii', 'otsutsugamushi'] },
    { chapterNumber: 44, title: 'Coxiella burnetii and Q Fever', section: 'Bacteriology', linkedBugs: ['cburnetii'] },
    { chapterNumber: 45, title: 'Chlamydia trachomatis, C. pneumoniae, C. psittaci', section: 'Bacteriology', linkedBugs: ['ctrachomatis', 'cpneumoniae', 'cpsittaci'] },

    // Section 6: Virology
    { chapterNumber: 46, title: 'Antiviral Agents and Targets of Inhibition', section: 'Virology', linkedBugs: ['hsv1', 'hsv2', 'hiv'] },
    { chapterNumber: 47, title: 'Poxviruses: Smallpox, Monkeypox, and Molluscum', section: 'Virology', linkedBugs: ['variola', 'mpx', 'molluscum'] },
    { chapterNumber: 48, title: 'Herpes Simplex Viruses 1 & 2, and Varicella-Zoster', section: 'Virology', linkedBugs: ['hsv1', 'hsv2', 'vzv'] },
    { chapterNumber: 49, title: 'Epstein-Barr Virus and Cytomegalovirus', section: 'Virology', linkedBugs: ['ebv', 'cmv'] },
    { chapterNumber: 50, title: 'Human Herpesviruses 6, 7, and 8 (Kaposi Sarcoma)', section: 'Virology', linkedBugs: ['hhv6', 'hhv8'] },
    { chapterNumber: 51, title: 'Adenoviruses and Parvovirus B19', section: 'Virology', linkedBugs: ['adenovirus', 'parvob19'] },
    { chapterNumber: 52, title: 'Human Papillomaviruses and Polyomaviruses (JC/BK)', section: 'Virology', linkedBugs: ['hpv16', 'hpv18', 'jcvirus', 'bkvirus'] },
    { chapterNumber: 53, title: 'Picornaviruses: Enteroviruses, Coxsackie, Polio, Echo', section: 'Virology', linkedBugs: ['poliovirus', 'coxsackiea', 'coxsackieb', 'rhinovirus'] },
    { chapterNumber: 54, title: 'Coronaviruses: Common Cold, SARS-CoV, SARS-CoV-2, MERS', section: 'Virology', linkedBugs: ['sarscov2', 'merscov'] },
    { chapterNumber: 55, title: 'Noroviruses and Rotaviruses: Viral Gastroenteritis', section: 'Virology', linkedBugs: ['norovirus', 'rotavirus'] },
    { chapterNumber: 56, title: 'Orthomyxoviruses: Influenza A, B, and C', section: 'Virology', linkedBugs: ['influenzaa', 'influenzab'] },
    { chapterNumber: 57, title: 'Paramyxoviruses: Measles, Mumps, Parainfluenza, RSV', section: 'Virology', linkedBugs: ['measles', 'mumps', 'rsv'] },
    { chapterNumber: 58, title: 'Rhabdoviruses: Rabies Virus Pathogenesis', section: 'Virology', linkedBugs: ['rabies'] },
    { chapterNumber: 59, title: 'Filoviruses: Ebola and Marburg Hemorrhagic Fevers', section: 'Virology', linkedBugs: ['ebola', 'marburg'] },
    { chapterNumber: 60, title: 'Flaviruses: Dengue, Zika, Yellow Fever, West Nile, JEV', section: 'Virology', linkedBugs: ['dengue', 'zika', 'yellowfever', 'westnile'] },
    { chapterNumber: 61, title: 'Hepatitis Viruses: HAV, HBV, HCV, HDV, HEV', section: 'Virology', linkedBugs: ['hav', 'hbv', 'hcv', 'hdv', 'hev'] },
    { chapterNumber: 62, title: 'Retroviruses: HIV-1, HIV-2, and HTLV-1', section: 'Virology', linkedBugs: ['hiv1', 'hiv2', 'htlv1'] },
    { chapterNumber: 63, title: 'Prion Diseases: Kuru, CJD, and Variant CJD', section: 'Virology', linkedBugs: ['prion_cjd'] },

    // Section 7: Mycology
    { chapterNumber: 64, title: 'Antifungal Agents and Sites of Action', section: 'Mycology', linkedBugs: ['calbicans', 'aspergillus'] },
    { chapterNumber: 65, title: 'Cutaneous and Subcutaneous Mycoses: Dermatophytes, Sporothrix', section: 'Mycology', linkedBugs: ['trichophyton', 'microsporum', 'sschenckii'] },
    { chapterNumber: 66, title: 'Systemic Dimorphic Mycoses: Histoplasma capsulatum', section: 'Mycology', linkedBugs: ['hcapsulatum'] },
    { chapterNumber: 67, title: 'Systemic Dimorphic Mycoses: Blastomyces dermatitidis', section: 'Mycology', linkedBugs: ['bdermatitidis'] },
    { chapterNumber: 68, title: 'Systemic Dimorphic Mycoses: Coccidioides immitis/posadasii', section: 'Mycology', linkedBugs: ['cimmitis'] },
    { chapterNumber: 69, title: 'Talaromyces marneffei and Paracoccidioides brasiliensis', section: 'Mycology', linkedBugs: ['tmarneffei', 'pbrasiliensis'] },
    { chapterNumber: 70, title: 'Opportunistic Mycoses: Candida albicans, C. auris, C. glabrata', section: 'Mycology', linkedBugs: ['calbicans', 'cauris', 'cglabrata'] },
    { chapterNumber: 71, title: 'Opportunistic Mycoses: Cryptococcus neoformans & C. gattii', section: 'Mycology', linkedBugs: ['cneoformans', 'cgattii'] },
    { chapterNumber: 72, title: 'Opportunistic Mycoses: Aspergillus fumigatus & Mucorales', section: 'Mycology', linkedBugs: ['afumigatus', 'rhizopus', 'mucor'] },
    { chapterNumber: 73, title: 'Pneumocystis jirovecii Pneumonia (PJP)', section: 'Mycology', linkedBugs: ['pjirovecii'] },

    // Section 8: Parasitology
    { chapterNumber: 74, title: 'Antiparasitic Agents and Drug Targets', section: 'Parasitology', linkedBugs: ['pfalciparum', 'sstercoralis'] },
    { chapterNumber: 75, title: 'Intestinal Protozoa: Entamoeba histolytica, Giardia duodenalis', section: 'Parasitology', linkedBugs: ['ehistolytica', 'gduodenalis', 'cparvum'] },
    { chapterNumber: 76, title: 'Urogenital and Free-Living Protozoa: Trichomonas, Naegleria', section: 'Parasitology', linkedBugs: ['tvaginalis', 'nfowleri', 'acanthamoeba'] },
    { chapterNumber: 77, title: 'Blood & Tissue Protozoa: Plasmodium falciparum, vivax, malariae, ovale', section: 'Parasitology', linkedBugs: ['pfalciparum', 'pvivax', 'pmalariae', 'povale'] },
    { chapterNumber: 78, title: 'Blood & Tissue Protozoa: Babesia microti and Toxoplasma gondii', section: 'Parasitology', linkedBugs: ['bmicroti', 'tgondii'] },
    { chapterNumber: 79, title: 'Kinetoplastids: Leishmania donovani and Trypanosoma cruzi/brucei', section: 'Parasitology', linkedBugs: ['ldonovani', 'tcruzi', 'tbrucei'] },
    { chapterNumber: 80, title: 'Intestinal Nematodes: Ascaris, Enterobius, Trichuris, Hookworms', section: 'Parasitology', linkedBugs: ['alumbricoides', 'evermicularis', 'ttrichiura', 'aduedenale'] },
    { chapterNumber: 81, title: 'Strongyloides stercoralis and Hyperinfection Syndrome', section: 'Parasitology', linkedBugs: ['sstercoralis'] },
    { chapterNumber: 82, title: 'Tissue Nematodes: Trichinella, Toxocara, Filariasis (Wuchereria, Onchocerca)', section: 'Parasitology', linkedBugs: ['tspiralis', 'wbancrofti', 'ovolvulus', 'loaloa'] },
    { chapterNumber: 83, title: 'Trematodes (Flukes): Schistosoma, Clonorchis, Paragonimus', section: 'Parasitology', linkedBugs: ['smansoni', 'shaematobium', 'ccharlesi', 'pwestermani'] },
    { chapterNumber: 84, title: 'Cestodes (Tapeworms): Taenia solium, T. saginata, D. latum, Echinococcus', section: 'Parasitology', linkedBugs: ['tsolium', 'tsaginata', 'dlatum', 'egranulosus'] }
  ],

  // ==========================================
  // 2. JAWETZ MEDICAL MICROBIOLOGY (29th Ed)
  // ==========================================
  jawetz_29ed: [
    { chapterNumber: 1, title: 'The Science of Microbiology', section: 'Fundamentals', linkedBugs: [] },
    { chapterNumber: 2, title: 'Cell Structure and Physiology', section: 'Fundamentals', linkedBugs: [] },
    { chapterNumber: 3, title: 'Classification of Bacteria', section: 'Fundamentals', linkedBugs: [] },
    { chapterNumber: 4, title: 'Growth, Survival, and Death of Microorganisms', section: 'Fundamentals', linkedBugs: [] },
    { chapterNumber: 5, title: 'Cultivation of Microorganisms', section: 'Fundamentals', linkedBugs: [] },
    { chapterNumber: 6, title: 'Microbial Metabolism & Energy Production', section: 'Fundamentals', linkedBugs: [] },
    { chapterNumber: 7, title: 'Microbial Genetics & Gene Transfer', section: 'Fundamentals', linkedBugs: [] },
    { chapterNumber: 8, title: 'Immunology: Mechanisms of Host Defense', section: 'Immunology', linkedBugs: [] },
    { chapterNumber: 9, title: 'Pathogenesis of Bacterial Infection', section: 'Bacteriology', linkedBugs: ['saureus', 'ecoli'] },
    { chapterNumber: 10, title: 'Normal Human Microbiota', section: 'Bacteriology', linkedBugs: [] },
    { chapterNumber: 11, title: 'Spore-Forming Gram-Positive Bacilli: Bacillus & Clostridium', section: 'Bacteriology', linkedBugs: ['banthracis', 'ctetani', 'cbotulinum'] },
    { chapterNumber: 12, title: 'Non-Spore-Forming Gram-Positive Bacilli: Corynebacterium, Listeria', section: 'Bacteriology', linkedBugs: ['cdiphtheriae', 'lmonocytogenes'] },
    { chapterNumber: 13, title: 'The Staphylococci', section: 'Bacteriology', linkedBugs: ['saureus', 'sepidermidis'] },
    { chapterNumber: 14, title: 'The Streptococci, Enterococci, & Related Genera', section: 'Bacteriology', linkedBugs: ['spyogenes', 'spneumoniae', 'efaecalis'] },
    { chapterNumber: 15, title: 'Enteric Gram-Negative Rods (Enterobacteriaceae)', section: 'Bacteriology', linkedBugs: ['ecoli', 'kpneumoniae', 'pmirabilis'] },
    { chapterNumber: 16, title: 'Pseudomonads and Acinetobacter', section: 'Bacteriology', linkedBugs: ['paeruginosa', 'abaumannii'] },
    { chapterNumber: 17, title: 'Vibrios, Campylobacters, & Helicobacter', section: 'Bacteriology', linkedBugs: ['vcholerae', 'cjejuni', 'hpylori'] },
    { chapterNumber: 18, title: 'Haemophilus, Bordetella, Brucella, & Francisella', section: 'Bacteriology', linkedBugs: ['hinfluenzae', 'bpertussis', 'ftularensis'] },
    { chapterNumber: 19, title: 'Yersinia and Pasteurella', section: 'Bacteriology', linkedBugs: ['ypestis', 'pmultocida'] },
    { chapterNumber: 20, title: 'The Neisseriae', section: 'Bacteriology', linkedBugs: ['nmeningitidis', 'ngonorrhoeae'] },
    { chapterNumber: 21, title: 'Infections Caused by Anaerobic Bacteria', section: 'Bacteriology', linkedBugs: ['bfragilis', 'fnecrophorum'] },
    { chapterNumber: 22, title: 'Legionellae, Bartonella, & Unusual Bacterial Pathogens', section: 'Bacteriology', linkedBugs: ['lpneumophila', 'bhenselae'] },
    { chapterNumber: 23, title: 'Mycobacteria (Tuberculosis & Leprosy)', section: 'Bacteriology', linkedBugs: ['mtuberculosis', 'mleprae'] },
    { chapterNumber: 24, title: 'Spirochetes & Other Spiral Microorganisms', section: 'Bacteriology', linkedBugs: ['tpallidum', 'bburgdorferi', 'linterrogans'] },
    { chapterNumber: 25, title: 'Mycoplasmas & Cell Wall-Defective Bacteria', section: 'Bacteriology', linkedBugs: ['mpneumoniae'] },
    { chapterNumber: 26, title: 'Rickettsia & Related Genera', section: 'Bacteriology', linkedBugs: ['rrickettsii', 'cburnetii'] },
    { chapterNumber: 27, title: 'Chlamydiae', section: 'Bacteriology', linkedBugs: ['ctrachomatis', 'cpsittaci'] },
    { chapterNumber: 28, title: 'Antimicrobial Chemotherapy', section: 'Bacteriology', linkedBugs: ['mrsa', 'vre'] },
    { chapterNumber: 29, title: 'General Properties of Viruses', section: 'Virology', linkedBugs: [] },
    { chapterNumber: 30, title: 'Pathogenesis and Control of Viral Diseases', section: 'Virology', linkedBugs: [] },
    { chapterNumber: 31, title: 'Parvoviruses and Adenoviruses', section: 'Virology', linkedBugs: ['parvob19', 'adenovirus'] },
    { chapterNumber: 32, title: 'Herpesviruses', section: 'Virology', linkedBugs: ['hsv1', 'hsv2', 'vzv', 'cmv', 'ebv'] },
    { chapterNumber: 33, title: 'Poxviruses', section: 'Virology', linkedBugs: ['variola', 'mpx'] },
    { chapterNumber: 34, title: 'Hepatitis Viruses', section: 'Virology', linkedBugs: ['hav', 'hbv', 'hcv', 'hdv', 'hev'] },
    { chapterNumber: 35, title: 'Picornaviruses', section: 'Virology', linkedBugs: ['poliovirus', 'coxsackiea', 'rhinovirus'] },
    { chapterNumber: 36, title: 'Reoviruses, Rotaviruses, & Caliciviruses', section: 'Virology', linkedBugs: ['rotavirus', 'norovirus'] },
    { chapterNumber: 37, title: 'Arthropod-Borne & Rodent-Borne Viral Diseases', section: 'Virology', linkedBugs: ['dengue', 'yellowfever', 'hantavirus'] },
    { chapterNumber: 38, title: 'Orthomyxoviruses (Influenza Viruses)', section: 'Virology', linkedBugs: ['influenzaa', 'influenzab'] },
    { chapterNumber: 39, title: 'Paramyxoviruses and Rubella Virus', section: 'Virology', linkedBugs: ['measles', 'mumps', 'rsv', 'rubella'] },
    { chapterNumber: 40, title: 'Coronaviruses', section: 'Virology', linkedBugs: ['sarscov2', 'merscov'] },
    { chapterNumber: 41, title: 'Rabies, Slow Virus Infections, & Prion Diseases', section: 'Virology', linkedBugs: ['rabies', 'prion_cjd'] },
    { chapterNumber: 42, title: 'Human Cancer Viruses (HPV, HTLV, EBV, KSHV)', section: 'Virology', linkedBugs: ['hpv16', 'ebv', 'htlv1'] },
    { chapterNumber: 43, title: 'AIDS and Lentiviruses', section: 'Virology', linkedBugs: ['hiv1', 'hiv2'] },
    { chapterNumber: 44, title: 'Medical Mycology', section: 'Mycology', linkedBugs: ['calbicans', 'cneoformans', 'afumigatus'] },
    { chapterNumber: 45, title: 'Medical Parasitology', section: 'Parasitology', linkedBugs: ['pfalciparum', 'sstercoralis', 'tgondii'] },
    { chapterNumber: 46, title: 'Principles of Diagnostic Medical Microbiology', section: 'Diagnostic Correlation', linkedBugs: [] },
    { chapterNumber: 47, title: 'Cases and Clinical Correlations', section: 'Diagnostic Correlation', linkedBugs: [] },
    { chapterNumber: 48, title: 'Checklists and USMLE High-Yield Review', section: 'Diagnostic Correlation', linkedBugs: [] }
  ],

  // ==========================================
  // 3. GARCIA DIAGNOSTIC PARASITOLOGY (6th Ed)
  // ==========================================
  garcia_6ed: [
    { chapterNumber: 1, title: 'Philosophy and Approach to Diagnostic Parasitology', section: 'Diagnostic Principles', linkedBugs: [] },
    { chapterNumber: 2, title: 'Stool Specimen Collection, Fixation, and Processing', section: 'Diagnostic Principles', linkedBugs: ['ehistolytica', 'gduodenalis'] },
    { chapterNumber: 3, title: 'Microscopic Examination of Stool (Saline, Iodine, Smears)', section: 'Diagnostic Principles', linkedBugs: ['sstercoralis', 'alumbricoides'] },
    { chapterNumber: 4, title: 'Permanently Stained Smears: Trichrome and Iron Hematoxylin', section: 'Diagnostic Principles', linkedBugs: ['ehistolytica', 'edispar'] },
    { chapterNumber: 5, title: 'Special Stains: Modified Acid-Fast for Coccidia & Microsporidia', section: 'Diagnostic Principles', linkedBugs: ['cparvum', 'cbaylei', 'isobellii'] },
    { chapterNumber: 6, title: 'Intestinal Protozoa: Amebae (Entamoeba histolytica vs dispar)', section: 'Protozoology', linkedBugs: ['ehistolytica', 'edispar', 'ehartmanni'] },
    { chapterNumber: 7, title: 'Intestinal Protozoa: Flagellates (Giardia, Dientamoeba)', section: 'Protozoology', linkedBugs: ['gduodenalis', 'dfragilis'] },
    { chapterNumber: 8, title: 'Intestinal Protozoa: Ciliates & Blastocystis hominis', section: 'Protozoology', linkedBugs: ['bcoli', 'bhomini'] },
    { chapterNumber: 9, title: 'Intestinal Coccidia: Cryptosporidium, Cyclospora, Cystoisospora', section: 'Protozoology', linkedBugs: ['cparvum', 'ccayetanensis', 'cbaylei'] },
    { chapterNumber: 10, title: 'Microsporidia in Immunocompromised Hosts', section: 'Protozoology', linkedBugs: ['eenterocytozoon', 'eencephalitozoon'] },
    { chapterNumber: 11, title: 'Free-Living Amebae: Naegleria, Acanthamoeba, Balamuthia', section: 'Protozoology', linkedBugs: ['nfowleri', 'acanthamoeba', 'bmandrillaris'] },
    { chapterNumber: 12, title: 'Blood & Tissue Parasites: Specimen Collection and Staining', section: 'Blood Parasitology', linkedBugs: ['pfalciparum', 'bmicroti'] },
    { chapterNumber: 13, title: 'Malaria: Plasmodium falciparum, vivax, ovale, malariae, knowlesi', section: 'Blood Parasitology', linkedBugs: ['pfalciparum', 'pvivax', 'pmalariae', 'povale', 'pknowlesi'] },
    { chapterNumber: 14, title: 'Babesia Species and Differentiation from Malaria Rings', section: 'Blood Parasitology', linkedBugs: ['bmicroti', 'bdivergens'] },
    { chapterNumber: 15, title: 'Leishmania Species and Cutaneous/Visceral Kala-Azar', section: 'Blood Parasitology', linkedBugs: ['ldonovani', 'lmajor', 'lbraziliensis'] },
    { chapterNumber: 16, title: 'Trypanosomes: Chagas Disease & African Sleeping Sickness', section: 'Blood Parasitology', linkedBugs: ['tcruzi', 'tbrucei'] },
    { chapterNumber: 17, title: 'Toxoplasma gondii: Tachyzoites, Bradyzoites, & Congenital Tetrad', section: 'Tissue Parasitology', linkedBugs: ['tgondii'] },
    { chapterNumber: 18, title: 'Intestinal Nematodes: Ascaris lumbricoides', section: 'Helminthology', linkedBugs: ['alumbricoides'] },
    { chapterNumber: 19, title: 'Intestinal Nematodes: Enterobius vermicularis (Scotch Tape Test)', section: 'Helminthology', linkedBugs: ['evermicularis'] },
    { chapterNumber: 20, title: 'Intestinal Nematodes: Trichuris trichiura (Whipworm)', section: 'Helminthology', linkedBugs: ['ttrichiura'] },
    { chapterNumber: 21, title: 'Hookworms: Necator americanus and Ancylostoma duodenale', section: 'Helminthology', linkedBugs: ['namericanus', 'aduodenale'] },
    { chapterNumber: 22, title: 'Strongyloides stercoralis: Agar Plate, Baermann, Hyperinfection', section: 'Helminthology', linkedBugs: ['sstercoralis'] },
    { chapterNumber: 23, title: 'Tissue Nematodes: Trichinella spiralis & Muscle Biopsy', section: 'Helminthology', linkedBugs: ['tspiralis'] },
    { chapterNumber: 24, title: 'Tissue Nematodes: Toxocara canis/cati & Visceral Larva Migrans', section: 'Helminthology', linkedBugs: ['tcanis'] },
    { chapterNumber: 25, title: 'Tissue Nematodes: Cutaneous Larva Migrans (Creeping Eruption)', section: 'Helminthology', linkedBugs: ['abraziliense'] },
    { chapterNumber: 26, title: 'Filarial Nematodes: Wuchereria bancrofti & Brugia malayi', section: 'Helminthology', linkedBugs: ['wbancrofti', 'bmalayi'] },
    { chapterNumber: 27, title: 'Filarial Nematodes: Loa loa (African Eye Worm) & Onchocerca volvulus', section: 'Helminthology', linkedBugs: ['loaloa', 'ovolvulus'] },
    { chapterNumber: 28, title: 'Blood Flukes: Schistosoma mansoni, S. haematobium, S. japonicum', section: 'Helminthology', linkedBugs: ['smansoni', 'shaematobium', 'sjaponicum'] },
    { chapterNumber: 29, title: 'Liver Flukes: Fasciola hepatica and Clonorchis sinensis', section: 'Helminthology', linkedBugs: ['fhepatica', 'csinensis'] },
    { chapterNumber: 30, title: 'Lung Flukes: Paragonimus westermani', section: 'Helminthology', linkedBugs: ['pwestermani'] },
    { chapterNumber: 31, title: 'Intestinal Tapeworms: Taenia saginata and Taenia solium', section: 'Helminthology', linkedBugs: ['tsaginata', 'tsolium'] },
    { chapterNumber: 32, title: 'Neurocysticercosis: Taenia solium Cysticercus in Brain', section: 'Helminthology', linkedBugs: ['tsolium_neuro'] },
    { chapterNumber: 33, title: 'Fish Tapeworm: Diphyllobothrium latum & Vitamin B12 Deficiency', section: 'Helminthology', linkedBugs: ['dlatum'] },
    { chapterNumber: 34, title: 'Hydatid Disease: Echinococcus granulosus & E. multilocularis', section: 'Helminthology', linkedBugs: ['egranulosus', 'emultilocularis'] },
    { chapterNumber: 35, title: 'Hymenolepis nana (Dwarf Tapeworm) and Dipylidium caninum', section: 'Helminthology', linkedBugs: ['hnana'] },
    { chapterNumber: 36, title: 'Artifacts and Pseudoparasites Commonly Confused with Parasites', section: 'Quality Control', linkedBugs: [] },
    { chapterNumber: 37, title: 'Serodiagnosis of Parasitic Infections', section: 'Diagnostic Methods', linkedBugs: ['tgondii', 'echinococcus'] },
    { chapterNumber: 38, title: 'Molecular Methods (PCR, MALDI-TOF) in Parasite Identification', section: 'Diagnostic Methods', linkedBugs: ['pfalciparum', 'leishmania'] },
    { chapterNumber: 39, title: 'Antiparasitic Susceptibility and Resistance Patterns', section: 'Therapeutics', linkedBugs: ['pfalciparum_resistant'] },
    { chapterNumber: 40, title: 'Laboratory Safety, Quality Assurance, and Regulatory Compliance', section: 'Quality Control', linkedBugs: [] }
  ],

  // ==========================================
  // 4. MANSON'S TROPICAL DISEASES (24th Ed)
  // ==========================================
  manson_24ed: [
    { chapterNumber: 1, title: 'Health in the Tropics & Global Disease Burden', section: 'Principles', linkedBugs: [] },
    { chapterNumber: 2, title: 'Travel Medicine and Imported Infections', section: 'Principles', linkedBugs: [] },
    { chapterNumber: 3, title: 'Malaria: Pathogenesis, Severe Falciparum, & Artemisinin Resistance', section: 'Protozoology', linkedBugs: ['pfalciparum', 'pvivax'] },
    { chapterNumber: 4, title: 'Visceral and Cutaneous Leishmaniasis (Kala-Azar)', section: 'Protozoology', linkedBugs: ['ldonovani', 'lmajor'] },
    { chapterNumber: 5, title: 'Human African Trypanosomiasis (Sleeping Sickness)', section: 'Protozoology', linkedBugs: ['tbrucei'] },
    { chapterNumber: 6, title: 'American Trypanosomiasis (Chagas Disease)', section: 'Protozoology', linkedBugs: ['tcruzi'] },
    { chapterNumber: 7, title: 'Amebiasis & Liver Abscess Formation', section: 'Protozoology', linkedBugs: ['ehistolytica'] },
    { chapterNumber: 8, title: 'Schistosomiasis: Hepatosplenomegaly & Bladder Carcinoma', section: 'Helminthology', linkedBugs: ['smansoni', 'shaematobium'] },
    { chapterNumber: 9, title: 'Lymphatic Filariasis & Elephantiasis', section: 'Helminthology', linkedBugs: ['wbancrofti', 'bmalayi'] },
    { chapterNumber: 10, title: 'Onchocerciasis (River Blindness) and Simulium Blackflies', section: 'Helminthology', linkedBugs: ['ovolvulus'] },
    { chapterNumber: 11, title: 'Soil-Transmitted Helminths & Deworming Programs', section: 'Helminthology', linkedBugs: ['alumbricoides', 'sstercoralis', 'ttrichiura'] },
    { chapterNumber: 12, title: 'Echinococcosis and Cystic Hydatid Surgery', section: 'Helminthology', linkedBugs: ['egranulosus'] },
    { chapterNumber: 13, title: 'Mycobacterium leprae (Hansen Disease & Reactions)', section: 'Mycobacteria', linkedBugs: ['mleprae'] },
    { chapterNumber: 14, title: 'Buruli Ulcer (Mycobacterium ulcerans)', section: 'Mycobacteria', linkedBugs: ['mulcerans'] },
    { chapterNumber: 15, title: 'Melioidosis: Burkholderia pseudomallei in Tropical Soils', section: 'Bacteriology', linkedBugs: ['bpseudomallei'] },
    { chapterNumber: 16, title: 'Scrub Typhus: Orientia tsutsugamushi & Chigger Vectors', section: 'Bacteriology', linkedBugs: ['otsutsugamushi'] },
    { chapterNumber: 17, title: 'Leptospirosis & Flood-Associated Outbreaks', section: 'Bacteriology', linkedBugs: ['linterrogans'] },
    { chapterNumber: 18, title: 'Dengue and Severe Dengue Shock Syndrome', section: 'Arboviruses', linkedBugs: ['dengue'] },
    { chapterNumber: 19, title: 'Zika Virus and Congenital Microcephaly', section: 'Arboviruses', linkedBugs: ['zika'] },
    { chapterNumber: 20, title: 'Yellow Fever & Live-Attenuated 17D Vaccine', section: 'Arboviruses', linkedBugs: ['yellowfever'] },
    { chapterNumber: 21, title: 'Viral Hemorrhagic Fevers: Ebola, Marburg, Lassa', section: 'Hemorrhagic Fevers', linkedBugs: ['ebola', 'marburg', 'lassa'] },
    { chapterNumber: 22, title: 'Rabies Post-Exposure Prophylaxis (PEP)', section: 'Virology', linkedBugs: ['rabies'] },
    { chapterNumber: 23, title: 'Venomous Snakes, Spiders, Scorpions & Marine Envenomation', section: 'Toxins & Venoms', linkedBugs: [] }
  ],

  // ==========================================
  // 5. MANDELL INFECTIOUS DISEASES (10th Ed 2026)
  // ==========================================
  mandell_10ed: [
    { chapterNumber: 1, title: 'Principles of Antimicrobial Therapy and Stewardship', section: 'Therapeutics', linkedBugs: [] },
    { chapterNumber: 2, title: 'Pharmacokinetics and Pharmacodynamics (PK/PD) of Antibacterials', section: 'Therapeutics', linkedBugs: [] },
    { chapterNumber: 3, title: 'Sepsis, Severe Sepsis, and Septic Shock Management', section: 'Clinical Syndromes', linkedBugs: ['ecoli', 'saureus', 'paeruginosa'] },
    { chapterNumber: 4, title: 'Fever of Unknown Origin (FUO): Diagnostic Algorithm', section: 'Clinical Syndromes', linkedBugs: ['mtuberculosis', 'ebv', 'cmv'] },
    { chapterNumber: 5, title: 'Infective Endocarditis: Duke Criteria & Empiric Regimens', section: 'Cardiovascular', linkedBugs: ['saureus', 'sepidermidis', 'sviridans', 'efaecalis'] },
    { chapterNumber: 6, title: 'Cardiovascular Device & Vascular Graft Infections', section: 'Cardiovascular', linkedBugs: ['sepidermidis', 'saureus'] },
    { chapterNumber: 7, title: 'Acute Meningitis: Community-Acquired vs Healthcare-Associated', section: 'CNS Infections', linkedBugs: ['spneumoniae', 'nmeningitidis', 'lmonocytogenes'] },
    { chapterNumber: 8, title: 'Brain Abscess and Encephalitis (HSV & Arboviral)', section: 'CNS Infections', linkedBugs: ['hsv1', 'sviridans', 'tgondii'] },
    { chapterNumber: 9, title: 'Community-Acquired Pneumonia (CAP): CURB-65 & Guidelines', section: 'Respiratory', linkedBugs: ['spneumoniae', 'lpneumophila', 'mpneumoniae'] },
    { chapterNumber: 10, title: 'Hospital-Acquired and Ventilator-Associated Pneumonia (HAP/VAP)', section: 'Respiratory', linkedBugs: ['paeruginosa', 'kpneumoniae', 'mrsa'] },
    { chapterNumber: 11, title: 'Aspiration Pneumonia & Lung Abscess: Anaerobic Ecology', section: 'Respiratory', linkedBugs: ['bfragilis', 'fnecrophorum'] },
    { chapterNumber: 12, title: 'Tuberculosis: Latent TB vs Active Cavitary Pulmonary Disease', section: 'Respiratory', linkedBugs: ['mtuberculosis'] },
    { chapterNumber: 13, title: 'Intra-Abdominal Infections and Peritonitis (Primary vs Secondary)', section: 'Gastrointestinal', linkedBugs: ['ecoli', 'bfragilis', 'enterococcus'] },
    { chapterNumber: 14, title: 'Clostridioides difficile Colitis: Fidaxomicin vs Vancomycin', section: 'Gastrointestinal', linkedBugs: ['cdifficile'] },
    { chapterNumber: 15, title: 'Infectious Diarrhea: Foodborne, Waterborne, and Secretory Pathogens', section: 'Gastrointestinal', linkedBugs: ['cjejuni', 'senterica', 'vcholerae'] },
    { chapterNumber: 16, title: 'Urinary Tract Infections and Acute Pyelonephritis', section: 'Urogenital', linkedBugs: ['ecoli', 'kpneumoniae', 'pmirabilis', 'ssaprophyticus'] },
    { chapterNumber: 17, title: 'Sexually Transmitted Infections: Syphilis, Gonorrhea, Chlamydia', section: 'Urogenital', linkedBugs: ['tpallidum', 'ngonorrhoeae', 'ctrachomatis'] },
    { chapterNumber: 18, title: 'Skin and Soft Tissue Infections: Cellulitis, Abscess, Necrotizing Fasciitis', section: 'Dermatology & Bone', linkedBugs: ['spyogenes', 'saureus', 'cperfringens'] },
    { chapterNumber: 19, title: 'Osteomyelitis and Prosthetic Joint Infections (PJI)', section: 'Dermatology & Bone', linkedBugs: ['saureus', 'sepidermidis', 'salmonella'] },
    { chapterNumber: 20, title: 'Infections in Immunocompromised Hosts and Neutropenic Fever', section: 'Immunocompromised', linkedBugs: ['paeruginosa', 'afumigatus', 'calbicans'] },
    { chapterNumber: 21, title: 'Solid Organ and Stem Cell Transplant Infections', section: 'Immunocompromised', linkedBugs: ['cmv', 'ebv', 'pjirovecii', 'bk_virus'] },
    { chapterNumber: 22, title: 'HIV Medicine: Antiretroviral Therapy (ART) and Opportunistic Prophylaxis', section: 'HIV & Retrovirology', linkedBugs: ['hiv1', 'pjirovecii', 'cneoformans', 'tgondii'] }
  ],

  // ==========================================
  // 6. ABBAS CELLULAR & MOLECULAR IMMUNOLOGY (11th Ed)
  // ==========================================
  abbas_11ed: [
    { chapterNumber: 1, title: 'Properties and Overview of Immune Responses', section: 'General Immunology', linkedBugs: [] },
    { chapterNumber: 2, title: 'Cells and Tissues of the Immune System', section: 'General Immunology', linkedBugs: [] },
    { chapterNumber: 3, title: 'Leukocyte Circulation and Migration into Tissues', section: 'General Immunology', linkedBugs: [] },
    { chapterNumber: 4, title: 'Innate Immunity: PRRs, TLRs, NLRs, and Complement System', section: 'Innate Immunity', linkedBugs: ['saureus', 'ecoli', 'nmeningitidis'] },
    { chapterNumber: 5, title: 'Antibodies and Antigens: Structure and Functions', section: 'Adaptive Immunity', linkedBugs: [] },
    { chapterNumber: 6, title: 'MHC Molecules and Antigen Presentation to T Lymphocytes', section: 'Adaptive Immunity', linkedBugs: ['mtuberculosis', 'influenza'] },
    { chapterNumber: 7, title: 'Immune Receptors and Antigen Recognition (TCR and BCR)', section: 'Adaptive Immunity', linkedBugs: [] },
    { chapterNumber: 8, title: 'Development of B and T Lymphocytes (V(D)J Recombination)', section: 'Adaptive Immunity', linkedBugs: [] },
    { chapterNumber: 9, title: 'Activation of T Lymphocytes (Co-Stimulation & Checkpoints)', section: 'T Cell Immunity', linkedBugs: [] },
    { chapterNumber: 10, title: 'Effector Mechanisms of Cell-Mediated Immunity (Th1, Th2, Th17)', section: 'T Cell Immunity', linkedBugs: ['mtuberculosis', 'calbicans', 'helminths'] },
    { chapterNumber: 11, title: 'B Cell Activation and Humoral Immune Responses (Germinal Centers)', section: 'B Cell Immunity', linkedBugs: ['spneumoniae', 'tetanus'] },
    { chapterNumber: 12, title: 'Effector Mechanisms of Humoral Immunity: Opsonization & Neutralization', section: 'B Cell Immunity', linkedBugs: ['spneumoniae', 'nmeningitidis'] },
    { chapterNumber: 13, title: 'Specialized Immunity at Epithelial Barriers and in Immune-Privileged Tissues', section: 'Mucosal Immunity', linkedBugs: ['rotavirus', 'salmonella'] },
    { chapterNumber: 14, title: 'Immunologic Tolerance and Autoimmunity (Central vs Peripheral)', section: 'Tolerance & Autoimmunity', linkedBugs: [] },
    { chapterNumber: 15, title: 'Immunity to Microbes: Extracellular Bacteria, Viruses, Fungi, Parasites', section: 'Microbial Immunity', linkedBugs: ['saureus', 'influenza', 'calbicans', 'pfalciparum'] },
    { chapterNumber: 16, title: 'Transplantation Immunology & Graft Rejection', section: 'Clinical Immunology', linkedBugs: [] },
    { chapterNumber: 17, title: 'Immunity to Tumors and Cancer Immunotherapy (PD-1 / CTLA-4)', section: 'Clinical Immunology', linkedBugs: [] },
    { chapterNumber: 18, title: 'Hypersensitivity Disorders (Type I, II, III, and IV Reactions)', section: 'Hypersensitivity', linkedBugs: ['penicillin_allergy', 'tuberculosis_ppd'] },
    { chapterNumber: 19, title: 'Allergy and IgE-Mediated Diseases', section: 'Hypersensitivity', linkedBugs: [] },
    { chapterNumber: 20, title: 'Congenital (Primary) Immunodeficiencies (SCID, XLA, CGD, CVID)', section: 'Immunodeficiency', linkedBugs: ['saureus_cgd', 'aspergillus_cgd', 'candida_scid'] },
    { chapterNumber: 21, title: 'Acquired Immunodeficiencies and Pathogenesis of HIV/AIDS', section: 'Immunodeficiency', linkedBugs: ['hiv1', 'pjirovecii', 'cneoformans'] }
  ],

  // ==========================================
  // 7. CLINICAL GUIDELINES & ANTIBIOGRAMS
  // ==========================================
  custom_guidelines: [
    { chapterNumber: 1, title: 'Hospital Antibiogram: Gram-Positive Isolates & Sensitivities', section: 'Antibiograms', linkedBugs: ['saureus', 'mrsa', 'efaecalis'] },
    { chapterNumber: 2, title: 'Hospital Antibiogram: Gram-Negative Isolates & ESBL/CRE Rates', section: 'Antibiograms', linkedBugs: ['ecoli', 'kpneumoniae', 'paeruginosa'] },
    { chapterNumber: 3, title: 'IDSA Guidelines: Sepsis & Septic Shock 1-Hour Bundle', section: 'Empiric Regimens', linkedBugs: ['ecoli', 'saureus'] },
    { chapterNumber: 4, title: 'IDSA Guidelines: Community-Acquired Pneumonia (CAP)', section: 'Empiric Regimens', linkedBugs: ['spneumoniae', 'lpneumophila'] },
    { chapterNumber: 5, title: 'IDSA Guidelines: Complicated Urinary Tract Infections & Pyelonephritis', section: 'Empiric Regimens', linkedBugs: ['ecoli', 'pmirabilis'] },
    { chapterNumber: 6, title: 'CDC MMWR: Outbreak Investigations & Notifiable Pathogens', section: 'Public Health', linkedBugs: ['measles', 'cholera', 'anthrax'] },
    { chapterNumber: 7, title: 'Surgical Prophylaxis Guidelines: Cefazolin, Vancomycin & Timing', section: 'Surgical Stewardship', linkedBugs: ['saureus', 'sepidermidis'] }
  ]
};

/**
 * Helper to fetch chapter list for a given textbook ID
 */
export function getChaptersForTextbook(textbookId) {
  return TEXTBOOK_CHAPTERS[textbookId] || [];
}

/**
 * Helper to find a specific chapter
 */
export function getChapterByNumber(textbookId, chapterNumber) {
  const list = getChaptersForTextbook(textbookId);
  return list.find(c => c.chapterNumber === Number(chapterNumber)) || null;
}
