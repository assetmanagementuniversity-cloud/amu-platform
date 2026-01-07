'use client';

/**
 * Auth Context - AMU Platform
 *
 * Provides authentication state and user data throughout the app.
 * Combines Firebase Auth user with Firestore user document data.
 *
 * User Tiers (Section 5.4):
 * - Tier 1: Basic user (registered)
 * - Tier 2: Organisation-linked (has company_code)
 * - Tier 3: Verified identity (ID documents approved)
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';

/**
 * User verification status
 */
export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

/**
 * User tier based on verification level
 */
export type UserTier = 1 | 2 | 3;

/**
 * Extended user data from Firestore
 */
export interface UserData {
  user_id: string;
  user_email: string;
  user_name: string;
  user_type: 'learner' | 'training_manager' | 'admin';

  // Company linkage (Tier 2)
  user_company_id?: string;
  user_company_code_used?: string;

  // Identity verification (Tier 3)
  user_verification_status: VerificationStatus;
  user_verification_tier: UserTier;
  user_id_document_url?: string;
  user_proof_of_residence_url?: string;
  user_popi_consent_date?: string;
  user_verification_submitted_date?: string;
  user_verification_reviewed_date?: string;
  user_verification_rejected_reason?: string;

  // Personal details for SETA
  user_id_number?: string;
  user_physical_address?: string;
  user_phone_number?: string;
  user_first_name?: string;
  user_surname?: string;
  user_equity_group?: string;
  user_disability_status?: string;
  user_disability_details?: {
    eyesight?: string;
    hearing?: string;
    walking?: string;
    memory?: string;
    communicating?: string;
    self_care?: string;
  };

  // Referrals
  user_referral_code: string;
  user_karma_balance: number;

  // Other fields
  user_email_verified: boolean;
  user_created_date: string;
  user_last_login_date: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  userTier: UserTier;
  isOrganisationLinked: boolean;
  isIdentityVerified: boolean;
  verificationStatus: VerificationStatus;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  userTier: 1,
  isOrganisationLinked: false,
  isIdentityVerified: false,
  verificationStatus: 'none',
  isAdmin: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setUserData(null);
        setLoading(false);
        return;
      }

      // Listen to user document changes
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const unsubscribeDoc = onSnapshot(
        userDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setUserData({
              user_id: docSnapshot.id,
              user_email: data.user_email || firebaseUser.email || '',
              user_name: data.user_name || firebaseUser.displayName || '',
              user_type: data.user_type || 'learner',
              user_company_id: data.user_company_id,
              user_company_code_used: data.user_company_code_used,
              user_verification_status: data.user_verification_status || 'none',
              user_verification_tier: data.user_verification_tier || 1,
              user_id_document_url: data.user_id_document_url,
              user_proof_of_residence_url: data.user_proof_of_residence_url,
              user_popi_consent_date: data.user_popi_consent_date,
              user_verification_submitted_date: data.user_verification_submitted_date,
              user_verification_reviewed_date: data.user_verification_reviewed_date,
              user_verification_rejected_reason: data.user_verification_rejected_reason,
              user_id_number: data.user_id_number,
              user_physical_address: data.user_physical_address,
              user_phone_number: data.user_phone_number,
              user_first_name: data.user_first_name,
              user_surname: data.user_surname,
              user_equity_group: data.user_equity_group,
              user_disability_status: data.user_disability_status,
              user_disability_details: data.user_disability_details,
              user_referral_code: data.user_referral_code || '',
              user_karma_balance: data.user_karma_balance || 0,
              user_email_verified: data.user_email_verified || false,
              user_created_date: data.user_created_date || '',
              user_last_login_date: data.user_last_login_date || '',
            } as UserData);
          } else {
            // User document doesn't exist yet (new user)
            setUserData(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error listening to user document:', error);
          setLoading(false);
        }
      );

      // Cleanup doc listener when auth changes
      return () => unsubscribeDoc();
    });

    return () => unsubscribeAuth();
  }, []);

  // Compute derived values
  const isOrganisationLinked = !!userData?.user_company_id;
  const isIdentityVerified = userData?.user_verification_status === 'verified';
  const verificationStatus = userData?.user_verification_status || 'none';
  const isAdmin = userData?.user_type === 'admin' || 
    userData?.user_email?.endsWith('@assetmanagementuniversity.org') || false;

  // Determine user tier
  let userTier: UserTier = 1;
  if (isIdentityVerified) {
    userTier = 3;
  } else if (isOrganisationLinked) {
    userTier = 2;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        userTier,
        isOrganisationLinked,
        isIdentityVerified,
        verificationStatus,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
