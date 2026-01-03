'use client';

import { useState, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import type { CreateUserInput, User } from '@amu/shared';
import { generateReferralCode } from '@amu/shared';

// ============================================
// Types
// ============================================

export interface AuthError {
  code: string;
  message: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  referralCode?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// ============================================
// Error Mapping (User-friendly messages)
// ============================================

function mapFirebaseError(error: unknown): AuthError {
  const firebaseError = error as { code?: string; message?: string };
  const code = firebaseError.code || 'unknown';

  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email address is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
    'auth/weak-password': 'Please choose a stronger password (at least 8 characters).',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
  };

  return {
    code,
    message: errorMessages[code] || 'An unexpected error occurred. Please try again.',
  };
}

// ============================================
// Create User Profile in Firestore
// ============================================

async function createUserProfile(
  userId: string,
  input: CreateUserInput
): Promise<void> {
  const userRef = doc(db, 'users', userId);

  // Check if user profile already exists
  const existingDoc = await getDoc(userRef);
  if (existingDoc.exists()) {
    return; // Profile already exists
  }

  // Generate unique referral code from user's name
  const referralCode = generateReferralCode(input.user_name);

  // Create user document with snake_case fields
  const userData: Omit<User, 'user_created_date' | 'user_last_login_date'> & {
    user_created_date: ReturnType<typeof serverTimestamp>;
    user_last_login_date: ReturnType<typeof serverTimestamp>;
  } = {
    user_id: userId,
    user_email: input.user_email,
    user_name: input.user_name,
    user_type: input.user_type || 'learner',
    user_email_verified: false,
    user_created_date: serverTimestamp(),
    user_last_login_date: serverTimestamp(),
    user_auth_provider: input.user_auth_provider,
    user_referral_code: referralCode,
    user_karma_balance: 0,
    user_karma_lifetime_earned: 0,
    user_referred_by: input.user_referred_by,
    user_company_code_used: input.user_company_code_used,
  };

  await setDoc(userRef, userData);
}

// ============================================
// Hook: useAuthActions
// ============================================

export function useAuthActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  /**
   * Register with email and password
   */
  const register = useCallback(
    async (data: RegisterData): Promise<UserCredential | null> => {
      setLoading(true);
      setError(null);

      try {
        // Create Firebase auth account
        const credential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        // Update display name
        await updateProfile(credential.user, {
          displayName: data.name,
        });

        // Create user profile in Firestore
        await createUserProfile(credential.user.uid, {
          user_email: data.email,
          user_name: data.name,
          user_type: 'learner',
          user_auth_provider: 'email',
          user_referred_by: data.referralCode,
        });

        setLoading(false);
        return credential;
      } catch (err) {
        const authError = mapFirebaseError(err);
        setError(authError);
        setLoading(false);
        return null;
      }
    },
    []
  );

  /**
   * Sign in with email and password
   */
  const login = useCallback(
    async (data: LoginData): Promise<UserCredential | null> => {
      setLoading(true);
      setError(null);

      try {
        const credential = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        // Update last login date
        const userRef = doc(db, 'users', credential.user.uid);
        await setDoc(
          userRef,
          { user_last_login_date: serverTimestamp() },
          { merge: true }
        );

        setLoading(false);
        return credential;
      } catch (err) {
        const authError = mapFirebaseError(err);
        setError(authError);
        setLoading(false);
        return null;
      }
    },
    []
  );

  /**
   * Sign in with Google
   */
  const loginWithGoogle = useCallback(async (): Promise<UserCredential | null> => {
    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);

      // Create or update user profile
      await createUserProfile(credential.user.uid, {
        user_email: credential.user.email || '',
        user_name: credential.user.displayName || 'Learner',
        user_type: 'learner',
        user_auth_provider: 'google',
      });

      // Update last login date
      const userRef = doc(db, 'users', credential.user.uid);
      await setDoc(
        userRef,
        { user_last_login_date: serverTimestamp() },
        { merge: true }
      );

      setLoading(false);
      return credential;
    } catch (err) {
      const authError = mapFirebaseError(err);
      setError(authError);
      setLoading(false);
      return null;
    }
  }, []);

  /**
   * Sign out
   */
  const logout = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await signOut(auth);
      setLoading(false);
      return true;
    } catch (err) {
      const authError = mapFirebaseError(err);
      setError(authError);
      setLoading(false);
      return false;
    }
  }, []);

  /**
   * Send password reset email
   */
  const resetPassword = useCallback(
    async (email: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        await sendPasswordResetEmail(auth, email);
        setLoading(false);
        return true;
      } catch (err) {
        const authError = mapFirebaseError(err);
        setError(authError);
        setLoading(false);
        return false;
      }
    },
    []
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    clearError,
  };
}
