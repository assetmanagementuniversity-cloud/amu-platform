/**
 * Users collection operations
 */

import { getFirestore, FieldValue } from '../config/firebase-admin';
import type { User, UserDocument, CreateUserInput } from '@amu/shared';
import { generateReferralCode } from '@amu/shared';

const COLLECTION = 'users';

/**
 * Get a user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const db = getFirestore();
  const doc = await db.collection(COLLECTION).doc(userId).get();

  if (!doc.exists) {
    return null;
  }

  return documentToUser(doc.data() as UserDocument);
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('user_email', '==', email)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return documentToUser(snapshot.docs[0]?.data() as UserDocument);
}

/**
 * Get a user by referral code
 */
export async function getUserByReferralCode(referralCode: string): Promise<User | null> {
  const db = getFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('user_referral_code', '==', referralCode)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return documentToUser(snapshot.docs[0]?.data() as UserDocument);
}

/**
 * Create a new user
 */
export async function createUser(userId: string, input: CreateUserInput): Promise<User> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const userDoc: UserDocument = {
    user_id: userId,
    user_email: input.user_email,
    user_name: input.user_name,
    user_type: input.user_type || 'learner',
    user_email_verified: false,
    user_created_date: now,
    user_last_login_date: now,
    user_auth_provider: input.user_auth_provider,
    user_referred_by: input.user_referred_by,
    user_company_code_used: input.user_company_code_used,
    user_referral_code: generateReferralCode(input.user_name),
    user_karma_balance: 0,
    user_karma_lifetime_earned: 0,
  };

  await db.collection(COLLECTION).doc(userId).set(userDoc);

  return documentToUser(userDoc);
}

/**
 * Update user's last login date
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const db = getFirestore();
  await db.collection(COLLECTION).doc(userId).update({
    user_last_login_date: new Date().toISOString(),
  });
}

/**
 * Update user's email verification status
 */
export async function updateEmailVerified(userId: string, verified: boolean): Promise<void> {
  const db = getFirestore();
  await db.collection(COLLECTION).doc(userId).update({
    user_email_verified: verified,
  });
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'user_name' | 'user_preferred_language' | 'user_location' | 'user_phone_number' | 'user_physical_address'>>
): Promise<void> {
  const db = getFirestore();
  await db.collection(COLLECTION).doc(userId).update(updates);
}

/**
 * Update user learning preferences (detected by Claude)
 */
export async function updateLearningPreferences(
  userId: string,
  preferences: {
    user_learning_style?: string;
    user_experience_level?: User['user_experience_level'];
    user_preferences?: string[];
    user_challenges?: string[];
  }
): Promise<void> {
  const db = getFirestore();
  await db.collection(COLLECTION).doc(userId).update(preferences);
}

/**
 * Update user karma balance
 */
export async function updateKarmaBalance(
  userId: string,
  amount: number,
  isCredit: boolean
): Promise<void> {
  const db = getFirestore();
  const increment = isCredit ? amount : -amount;

  await db.collection(COLLECTION).doc(userId).update({
    user_karma_balance: FieldValue.increment(increment),
    ...(isCredit && { user_karma_lifetime_earned: FieldValue.increment(amount) }),
  });
}

/**
 * Link user to company
 */
export async function linkUserToCompany(
  userId: string,
  companyId: string,
  companyCode: string
): Promise<void> {
  const db = getFirestore();
  await db.collection(COLLECTION).doc(userId).update({
    user_company_id: companyId,
    user_company_code_used: companyCode,
  });
}

/**
 * Convert Firestore document to User type
 */
function documentToUser(doc: UserDocument): User {
  return {
    ...doc,
    user_created_date: new Date(doc.user_created_date),
    user_last_login_date: new Date(doc.user_last_login_date),
    user_seta_registration_date: doc.user_seta_registration_date
      ? new Date(doc.user_seta_registration_date)
      : undefined,
  };
}
