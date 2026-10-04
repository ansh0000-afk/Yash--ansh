import { initializeApp, getApps, getApp } from 'firebase/app';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import {
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signInWithEmailAndPassword,
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

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const githubProvider = new GithubAuthProvider();

function isGoogleAccountReauthError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /\b16\b[\s\S]*account reauth failed|account reauth failed[\s\S]*\b16\b/i.test(message);
}

export async function signInWithGoogle() {
  let stage = 'platform detection';

  try {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      stage = 'web client ID validation';
      const webClientId = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID?.trim();
      if (!webClientId) {
        throw new Error('Native Google sign-in requires VITE_GOOGLE_WEB_CLIENT_ID.');
      }

      stage = 'native plugin initialization';
      await SocialLogin.initialize({
        google: {
          webClientId,
          mode: 'online'
        }
      });

      stage = 'native Google credential request';
      let result;
      try {
        ({ result } = await SocialLogin.login({
          provider: 'google',
          options: {
            scopes: ['email', 'profile']
          }
        }));
      } catch (error) {
        if (!isGoogleAccountReauthError(error)) {
          throw error;
        }

        stage = 'clear stale Google credential state';
        await SocialLogin.logout({ provider: 'google' });
        await SocialLogin.initialize({
          google: {
            webClientId,
            mode: 'online'
          }
        });

        stage = 'retry native Google credential request';
        ({ result } = await SocialLogin.login({
          provider: 'google',
          options: {
            scopes: ['email', 'profile']
          }
        }));
      }

      if (result.responseType !== 'online' || !result.idToken) {
        throw new Error('Native Google sign-in did not return an ID token.');
      }

      stage = 'Firebase credential exchange';
      const credential = GoogleAuthProvider.credential(result.idToken);
      return await signInWithCredential(auth, credential);
    }

    stage = 'Firebase web popup';
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error(`[Google Sign-In] Failed during ${stage}:`, error);
    throw error;
  }
}

export function signInWithGithub() {
  return signInWithPopup(auth, githubProvider);
}

export type { FirebaseUser };

export {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
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
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Try logging in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by browser settings. Please allow popups for this site.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Firebase sign-in. Add this site hostname in Firebase Console under Authentication > Settings > Authorized domains.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed login attempts. Reset your password or try again later.';
    case 'auth/requires-recent-login':
      return 'Please re-authenticate before performing this action.';
    default:
      return defaultMessage || 'An unexpected authentication error occurred. Please try again.';
  }
}
