import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Ensure persistent session in local storage
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase persistence setup warning:', err);
});

export type { FirebaseUser };

export {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged
};

/**
 * Format Firebase Auth errors into friendly error messages
 */
export function getFriendlyAuthErrorMessage(errorCode: string, defaultMessage?: string): string {
  const normalizedCode = typeof errorCode === 'string' ? errorCode.trim() : '';

  switch (normalizedCode) {
    case 'auth/invalid-email':
    case 'auth/missing-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/invalid-password':
    case 'auth/missing-password':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/email-already-in-use':
    case 'auth/email-already-exists':
    case 'auth/account-exists-with-different-credential':
      return 'This email is already registered. Please use the sign-in method you used when creating the account.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was cancelled. Please try again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is disabled for this Firebase project. Enable the Email/Password provider in Firebase Console.';
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not configured for this project. Enable the Email/Password provider in Firebase Console.';
    case 'auth/invalid-api-key':
      return 'Firebase configuration is invalid. Check the Firebase API key in the app configuration.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/app-not-authorized':
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Firebase sign-in. Add this site hostname in Firebase Console under Authentication > Settings > Authorized domains.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/web-storage-unsupported':
      return 'Your browser is blocking local storage, which Firebase needs to keep you signed in. Enable site storage and try again.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed login attempts. Reset your password or try again later.';
    case 'auth/requires-recent-login':
      return 'Please re-authenticate before performing this action.';
    default:
      return defaultMessage || (normalizedCode && normalizedCode !== 'auth/unknown-error'
        ? `Authentication failed (${normalizedCode}). Please try again or contact support.`
        : 'An unexpected authentication error occurred. Please try again.');
  }
}
