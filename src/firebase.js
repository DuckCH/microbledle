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
  setDoc 
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBj_HysIPdSQ0xkLXV4uFhJyYWeekEi6vQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "microbledle.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "microbledle",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "microbledle.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "718300540478",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:718300540478:web:26d4e34d4cb9b440256b6f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XHVZXSEBCP"
};

export const isFirebaseConfigured = true;

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics when running in browser
if (typeof window !== 'undefined') {
  isSupported().then(yes => {
    if (yes) getAnalytics(app);
  }).catch(() => {});
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In with popup
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Email & Password Registration
export async function registerWithEmail(email, password, displayName) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && credential.user) {
    await updateProfile(credential.user, { displayName });
  }
  return credential.user;
}

// Email & Password Sign-In
export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// Logout
export async function logoutUser() {
  await signOut(auth);
}

// Save or merge user progression in Firestore
export async function saveUserProgress(uid, data) {
  if (!uid) return;
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
  if (!uid) return null;
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
