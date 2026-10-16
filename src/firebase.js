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

// Firebase configuration using Vite environment variables (or placeholder fallback)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoPlaceholderKey1234567890",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "microbledle.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "microbledle",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "microbledle.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

// Check if actual configuration has been provided by user
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_API_KEY !== "AIzaSyDemoPlaceholderKey1234567890"
);

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In with popup
export async function signInWithGoogle() {
  if (!isFirebaseConfigured) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Email & Password Registration
export async function registerWithEmail(email, password, displayName) {
  if (!isFirebaseConfigured) {
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
  if (!isFirebaseConfigured) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// Logout
export async function logoutUser() {
  await signOut(auth);
}

// Save or merge user progression in Firestore
export async function saveUserProgress(uid, data) {
  if (!isFirebaseConfigured || !uid) return;
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
  if (!isFirebaseConfigured || !uid) return null;
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
