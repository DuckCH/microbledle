import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  browserPopupRedirectResolver
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  documentId
} from 'firebase/firestore';
import { getAnalytics, isSupported, logEvent as firebaseLogEvent } from 'firebase/analytics';

// Your web app's Firebase configuration (read strictly from Vite environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Check if actual configuration has been provided via environment variables
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

// Initialize Firebase App safely if configured
let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let analytics = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();

    // Initialize Analytics when running in browser
    if (typeof window !== 'undefined') {
      isSupported().then(yes => {
        if (yes && app) {
          analytics = getAnalytics(app);
        }
      }).catch(() => {});
    }
  } catch (err) {
    console.warn("Failed to initialize Firebase services:", err);
  }
}

// Safely log custom game analytics events without breaking gameplay
export function logAnalyticsEvent(eventName, params = {}) {
  try {
    if (analytics) {
      firebaseLogEvent(analytics, eventName, params);
    }
  } catch (err) {
    // Fail silently in development or when blocked by privacy extensions/adblockers
  }
}

export { auth, db, googleProvider, analytics };

// Google Sign-In with popup
export async function signInWithGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }
  const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
  return result.user;
}

// Email & Password Registration
export async function registerWithEmail(email, password, displayName) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && credential.user) {
    await updateProfile(credential.user, { displayName });
  }
  return credential.user;
}

// Email & Password Sign-In
export async function loginWithEmail(email, password) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// Logout
export async function logoutUser() {
  if (!auth) return;
  await signOut(auth);
}

// Save or merge user progression in Firestore
export async function saveUserProgress(uid, data) {
  if (!isFirebaseConfigured || !db || !uid) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Error saving user progress to Firestore:", err);
  }
}

// Load user progression from Firestore
export async function loadUserProgress(uid) {
  if (!isFirebaseConfigured || !db || !uid) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn("Error loading user progress from Firestore:", err);
  }
  return null;
}

// Submit score for today's daily case to the global daily leaderboard
export async function submitDailyScore(dateStr, uid, scoreData, forceOverwrite = false) {
  if (!isFirebaseConfigured || !db || !uid || !dateStr) return;
  try {
    const scoreDocRef = doc(db, 'daily_leaderboard', dateStr, 'scores', uid);
    if (!forceOverwrite) {
      const snap = await getDoc(scoreDocRef);
      if (snap.exists()) {
        const existing = snap.data();
        if (existing && existing.guessesCount) {
          console.log("Daily score already recorded for today, preserving original score:", existing);
          return;
        }
      }
    }
    await setDoc(scoreDocRef, {
      ...scoreData,
      uid,
      submittedAt: scoreData.submittedAt || new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Error submitting daily score:", err);
  }
}

// Update profile across daily leaderboard score if exists
export async function updateDailyScoreProfile(dateStr, uid, profileData) {
  if (!isFirebaseConfigured || !db || !uid || !dateStr) return;
  try {
    const scoreDocRef = doc(db, 'daily_leaderboard', dateStr, 'scores', uid);
    const snap = await getDoc(scoreDocRef);
    if (snap.exists()) {
      await setDoc(scoreDocRef, {
        ...(profileData.displayName ? { displayName: profileData.displayName } : {}),
        ...(profileData.avatar ? { avatar: profileData.avatar } : {}),
        ...(profileData.status !== undefined ? { status: profileData.status } : {})
      }, { merge: true });
    }
  } catch (err) {
    console.warn("Could not update daily score profile:", err);
  }
}

// Fetch global daily leaderboard for a given UTC date
export async function getDailyLeaderboard(dateStr, maxResults = 50) {
  if (!isFirebaseConfigured || !db || !dateStr) return [];
  try {
    const scoresColRef = collection(db, 'daily_leaderboard', dateStr, 'scores');
    // Fetch recent daily scores and sort in memory to avoid Firestore composite index requirement
    const q = query(scoresColRef, limit(maxResults * 2));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((docSnap) => {
      results.push({ id: docSnap.id, ...docSnap.data() });
    });

    // Enrich with latest user profiles from users collection so name/avatar/status updates stay in sync
    const uids = results.map(r => r.uid).filter(uid => uid && !uid.startsWith('guest_'));
    if (uids.length > 0) {
      try {
        const userMap = new Map();
        for (let i = 0; i < uids.length; i += 30) {
          const chunk = uids.slice(i, i + 30);
          const uQuery = query(collection(db, 'users'), where(documentId(), 'in', chunk));
          const uSnap = await getDocs(uQuery);
          uSnap.forEach(uDoc => {
            userMap.set(uDoc.id, uDoc.data());
          });
        }

        results.forEach(r => {
          if (r.uid && userMap.has(r.uid)) {
            const uData = userMap.get(r.uid);
            const prof = uData.profile || {};
            if (prof.displayName || uData.displayName) {
              r.displayName = prof.displayName || uData.displayName;
            }
            if (prof.avatar) {
              r.avatar = prof.avatar;
            }
            if (prof.status !== undefined) {
              r.status = prof.status;
            }
          }
        });
      } catch (enrichErr) {
        console.warn("Could not enrich daily scores with latest profiles:", enrichErr);
      }
    }

    // Rank by: 1. Fewest guesses, 2. Earliest submission timestamp
    results.sort((a, b) => {
      const gA = Number(a.guessesCount) || 6;
      const gB = Number(b.guessesCount) || 6;
      if (gA !== gB) return gA - gB;
      const tA = a.submittedAt ? new Date(a.submittedAt).getTime() : Infinity;
      const tB = b.submittedAt ? new Date(b.submittedAt).getTime() : Infinity;
      return tA - tB;
    });

    return results.slice(0, maxResults);
  } catch (err) {
    console.warn("Error fetching daily leaderboard:", err);
    return [];
  }
}

// Fetch all-time hall of fame
export async function getAllTimeLeaderboard(maxResults = 50) {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const usersColRef = collection(db, 'users');
    const q = query(usersColRef, limit(maxResults * 2));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && (data.stats || data.profile)) {
        results.push({ id: docSnap.id, ...data });
      }
    });

    // Rank by: 1. Most wins, 2. Current streak, 3. Total games played
    results.sort((a, b) => {
      const winsA = Number(a.stats?.wins) || 0;
      const winsB = Number(b.stats?.wins) || 0;
      if (winsB !== winsA) return winsB - winsA;

      const streakA = Number(a.stats?.streak) || 0;
      const streakB = Number(b.stats?.streak) || 0;
      if (streakB !== streakA) return streakB - streakA;

      const playedA = Number(a.stats?.played) || 0;
      const playedB = Number(b.stats?.played) || 0;
      return playedB - playedA;
    });

    return results.slice(0, maxResults);
  } catch (err) {
    console.warn("Error fetching all-time leaderboard:", err);
    return [];
  }
}

// ==========================================
// MICRODEX STUDIO & PATHOGEN CLOUD DATABASE
// ==========================================

export const ADMIN_AUTH_EMAIL = 'admin@microbledle.com';
export const ADMIN_UID = 'BxgUhQPaKFe339Kpn0lpsYotNit2';
const ADMIN_LOCAL_STORAGE_KEY = 'microbledle_admin_token';

/**
 * Check if the current user or device has admin privileges to edit Microdex.
 * Validates either active admin Firebase Auth session or saved admin authorization token.
 */
export function checkIsAdmin(user = null, userProfile = null) {
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem(ADMIN_LOCAL_STORAGE_KEY);
    if (localToken === 'admin_authorized_medical_editor') {
      return true;
    }
  }

  if (auth?.currentUser && (auth.currentUser.uid === ADMIN_UID || auth.currentUser.email === ADMIN_AUTH_EMAIL)) {
    return true;
  }

  if (user && (user.uid === ADMIN_UID || user.email === ADMIN_AUTH_EMAIL)) {
    return true;
  }

  return false;
}

/**
 * Verify admin password securely through Firebase Authentication.
 * No plaintext password exists in HTML, JS, or GitHub.
 * Firebase verifies against Google's secure auth servers.
 */
export async function verifyAndAuthorizeAdmin(enteredPassword) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured.');
  }

  const cleanPassword = (enteredPassword || '').trim();
  if (!cleanPassword) {
    throw new Error('Please enter the admin password.');
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, ADMIN_AUTH_EMAIL, cleanPassword);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_LOCAL_STORAGE_KEY, 'admin_authorized_medical_editor');
    }
    return cred.user;
  } catch (err) {
    console.warn('Firebase admin authentication failed:', err.code, err.message);
    if (
      err.code === 'auth/wrong-password' || 
      err.code === 'auth/invalid-credential' || 
      err.code === 'auth/invalid-login-credentials' ||
      err.code === 'auth/user-not-found'
    ) {
      throw new Error('Incorrect admin password.');
    } else if (err.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    }
    throw new Error('Authentication failed: ' + (err.message || 'Please check your connection.'));
  }
}

/**
 * Save or update a single pathogen in Firestore.
 * Automatically saves to the admin user document (guaranteed writable by admin & readable by all players)
 * and attempts microbes_v1 collection.
 */
export async function savePathogenToCloud(pathogenData) {
  if (!isFirebaseConfigured || !db || !pathogenData?.id) {
    return false;
  }
  try {
    const nowIso = new Date().toISOString();
    
    // 1. Save directly to the Admin User document (users/ADMIN_UID)
    // This succeeds with current Firestore rules without throwing permission errors
    const adminDocRef = doc(db, 'users', ADMIN_UID);
    await setDoc(adminDocRef, {
      lastUpdatedAt: nowIso,
      publishedMicrobes: {
        [pathogenData.id]: {
          ...pathogenData,
          updatedAt: nowIso
        }
      }
    }, { merge: true });

    // 2. Also try writing to dedicated collections (microbes_v1 & meta/microbes)
    try {
      const bugDocRef = doc(db, 'microbes_v1', pathogenData.id);
      await setDoc(bugDocRef, {
        ...pathogenData,
        updatedAt: nowIso
      }, { merge: true });

      const metaDocRef = doc(db, 'meta', 'microbes');
      await setDoc(metaDocRef, {
        lastUpdatedAt: nowIso,
        lastUpdatedBugId: pathogenData.id,
        lastUpdatedBugName: pathogenData.name
      }, { merge: true });
    } catch {
      // Ignored if custom collection write rule is restricted; users/ADMIN_UID is live!
    }

    return true;
  } catch (err) {
    console.warn("Error saving pathogen to Firestore:", err);
    throw err;
  }
}

/**
 * Fetch all custom/edited pathogens from Firestore.
 * Merges from admin published document and microbes_v1 collection.
 * Returns map: { [bugId]: bugData }
 */
export async function loadCloudPathogens() {
  if (!isFirebaseConfigured || !db) return {};
  const resultMap = {};

  // 1. Load from admin published document
  try {
    const adminDocRef = doc(db, 'users', ADMIN_UID);
    const snap = await getDoc(adminDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.publishedMicrobes) {
        Object.assign(resultMap, data.publishedMicrobes);
      }
    }
  } catch (err) {
    console.warn("Could not read admin published microbes document:", err);
  }

  // 2. Load from microbes_v1 collection if populated
  try {
    const colRef = collection(db, 'microbes_v1');
    const snap = await getDocs(colRef);
    snap.forEach((docSnap) => {
      resultMap[docSnap.id] = docSnap.data();
    });
  } catch {
    // optional fallback
  }

  return resultMap;
}

/**
 * Fetch metadata to check if cloud has newer updates
 */
export async function getCloudPathogensMetadata() {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const adminDocRef = doc(db, 'users', ADMIN_UID);
    const snap = await getDoc(adminDocRef);
    if (snap.exists() && snap.data()?.lastUpdatedAt) {
      return {
        lastUpdatedAt: snap.data().lastUpdatedAt
      };
    }
    const metaDocRef = doc(db, 'meta', 'microbes');
    const metaSnap = await getDoc(metaDocRef);
    if (metaSnap.exists()) {
      return metaSnap.data();
    }
  } catch (err) {
    console.warn("Error fetching cloud pathogens metadata:", err);
  }
  return null;
}


