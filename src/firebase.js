import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged
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
  getDocs
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

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

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();

    // Initialize Analytics when running in browser
    if (typeof window !== 'undefined') {
      isSupported().then(yes => {
        if (yes && app) getAnalytics(app);
      }).catch(() => {});
    }
  } catch (err) {
    console.warn("Failed to initialize Firebase services:", err);
  }
}

export { auth, db, googleProvider };

// Google Sign-In with popup
export async function signInWithGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }
  const result = await signInWithPopup(auth, googleProvider);
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
export async function submitDailyScore(dateStr, uid, scoreData) {
  if (!isFirebaseConfigured || !db || !uid || !dateStr) return;
  try {
    const scoreDocRef = doc(db, 'daily_leaderboard', dateStr, 'scores', uid);
    await setDoc(scoreDocRef, {
      ...scoreData,
      uid,
      submittedAt: scoreData.submittedAt || new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Error submitting daily score:", err);
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

