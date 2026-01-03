'use server';

/**
 * Fraud Detection System - AMU Karma Programme
 *
 * Implements anti-abuse measures from Section 20.4:
 * - Self-referral prevention
 * - Same IP detection
 * - Duplicate payment method detection
 * - Suspicious timing patterns
 * - Automatic karma suspension for high-severity flags
 *
 * "Ubuntu - I am because we are" - But we also need to protect the community!
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { generateId } from '@amu/shared';

// ============================================
// Types
// ============================================

export type FraudSeverity = 'low' | 'medium' | 'high';

export interface FraudFlag {
  type: string;
  severity: FraudSeverity;
  detail: string;
  detected_at: Date;
}

export interface FraudCheckResult {
  fraud_likely: boolean;
  flags: FraudFlag[];
  karma_suspended: boolean;
  suspension_reason?: string;
}

export interface SignupMetadata {
  user_id: string;
  ip_address: string;
  user_agent: string;
  referral_code?: string;
  timestamp: Date;
}

// ============================================
// Configuration
// ============================================

const FRAUD_THRESHOLDS = {
  // Maximum referrals from same IP before flagging
  MAX_SAME_IP_REFERRALS: 3,
  // Maximum referrals purchasing in 24 hours before flagging
  MAX_PURCHASES_24H: 5,
  // Maximum referrals with same payment method
  MAX_SAME_PAYMENT_METHOD: 2,
  // Minimum time between referral signups (ms) - 5 minutes
  MIN_SIGNUP_INTERVAL: 5 * 60 * 1000,
  // Time window for rapid signup detection (ms) - 1 hour
  RAPID_SIGNUP_WINDOW: 60 * 60 * 1000,
  // Maximum rapid signups in the window
  MAX_RAPID_SIGNUPS: 10,
};

// ============================================
// Signup Tracking
// ============================================

/**
 * Record signup metadata for fraud detection
 * Call this when a new user signs up with a referral code
 */
export async function recordSignupMetadata(
  userId: string,
  ipAddress: string,
  userAgent: string,
  referralCode?: string
): Promise<void> {
  try {
    const metadataRef = doc(db, 'signup_metadata', userId);
    await setDoc(metadataRef, {
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      referral_code: referralCode?.toUpperCase() || null,
      created_at: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error recording signup metadata:', error);
  }
}

/**
 * Record payment fingerprint for fraud detection
 * Call this after a successful payment
 */
export async function recordPaymentFingerprint(
  userId: string,
  paymentMethodFingerprint: string,
  paymentMethodType: string
): Promise<void> {
  try {
    const fingerprintId = generateId('pf');
    const fingerprintRef = doc(db, 'payment_fingerprints', fingerprintId);
    await setDoc(fingerprintRef, {
      fingerprint_id: fingerprintId,
      user_id: userId,
      fingerprint: paymentMethodFingerprint,
      method_type: paymentMethodType,
      created_at: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error recording payment fingerprint:', error);
  }
}

// ============================================
// Fraud Detection
// ============================================

/**
 * Perform comprehensive fraud check on a referrer
 * Call this periodically or after suspicious activity
 */
export async function detectReferralFraud(
  referrerId: string
): Promise<FraudCheckResult> {
  const flags: FraudFlag[] = [];
  const now = new Date();

  try {
    // Get referrer's direct referrals
    const referralsQuery = query(
      collection(db, 'referrals'),
      where('referral_referrer_id', '==', referrerId)
    );
    const referralsSnapshot = await getDocs(referralsQuery);

    if (referralsSnapshot.empty) {
      return { fraud_likely: false, flags: [], karma_suspended: false };
    }

    const referredUserIds = referralsSnapshot.docs.map(
      (doc) => doc.data().referral_referred_id
    );

    // Check 1: Suspicious timing - many purchases in 24 hours
    const recentPurchases = referralsSnapshot.docs.filter((doc) => {
      const data = doc.data();
      if (!data.referral_first_payment_at) return false;
      const paymentTime = data.referral_first_payment_at.toDate();
      const hoursSincePayment = (now.getTime() - paymentTime.getTime()) / (1000 * 60 * 60);
      return hoursSincePayment <= 24;
    });

    if (recentPurchases.length > FRAUD_THRESHOLDS.MAX_PURCHASES_24H) {
      flags.push({
        type: 'suspicious_timing',
        severity: 'medium',
        detail: `${recentPurchases.length} referrals purchased certificates in last 24 hours`,
        detected_at: now,
      });
    }

    // Check 2: Same IP addresses
    const ipCounts = await getIPAddressCounts(referredUserIds);
    const suspiciousIPs = Object.entries(ipCounts).filter(
      ([_, count]) => count > FRAUD_THRESHOLDS.MAX_SAME_IP_REFERRALS
    );

    if (suspiciousIPs.length > 0) {
      const maxCount = Math.max(...suspiciousIPs.map(([_, count]) => count));
      flags.push({
        type: 'same_ip_signups',
        severity: 'high',
        detail: `${maxCount} referrals signed up from the same IP address`,
        detected_at: now,
      });
    }

    // Check 3: Duplicate payment methods
    const paymentMethodCounts = await getPaymentMethodCounts(referredUserIds);
    const duplicatePaymentMethods = Object.entries(paymentMethodCounts).filter(
      ([_, count]) => count > FRAUD_THRESHOLDS.MAX_SAME_PAYMENT_METHOD
    );

    if (duplicatePaymentMethods.length > 0) {
      const maxCount = Math.max(...duplicatePaymentMethods.map(([_, count]) => count));
      flags.push({
        type: 'duplicate_payment_methods',
        severity: 'high',
        detail: `${maxCount} referrals using the same payment method`,
        detected_at: now,
      });
    }

    // Check 4: Rapid signups (many in short time window)
    const signupTimings = await getSignupTimings(referredUserIds);
    const rapidSignups = countRapidSignups(signupTimings);

    if (rapidSignups > FRAUD_THRESHOLDS.MAX_RAPID_SIGNUPS) {
      flags.push({
        type: 'rapid_signups',
        severity: 'medium',
        detail: `${rapidSignups} referrals signed up within 1 hour window`,
        detected_at: now,
      });
    }

    // Check 5: Self-referral via payment method match
    const referrerPaymentMethods = await getUserPaymentFingerprints(referrerId);
    for (const userId of referredUserIds) {
      const userPaymentMethods = await getUserPaymentFingerprints(userId);
      const overlap = referrerPaymentMethods.filter((fp) =>
        userPaymentMethods.includes(fp)
      );
      if (overlap.length > 0) {
        flags.push({
          type: 'self_referral_payment',
          severity: 'high',
          detail: `Referral ${userId} shares payment method with referrer`,
          detected_at: now,
        });
        break; // One flag is enough
      }
    }

    // Determine if karma should be suspended
    const hasHighSeverity = flags.some((f) => f.severity === 'high');
    let karmaSuspended = false;
    let suspensionReason: string | undefined;

    if (hasHighSeverity) {
      karmaSuspended = await suspendKarma(referrerId, flags);
      suspensionReason = 'High severity fraud indicators detected. Pending investigation.';
    }

    // Log fraud check result
    await logFraudCheck(referrerId, flags, karmaSuspended);

    return {
      fraud_likely: flags.length > 0,
      flags,
      karma_suspended: karmaSuspended,
      suspension_reason: suspensionReason,
    };
  } catch (error) {
    console.error('Error in fraud detection:', error);
    return { fraud_likely: false, flags: [], karma_suspended: false };
  }
}

/**
 * Quick fraud check before crediting commission
 * Returns true if commission should be credited, false if suspicious
 */
export async function preCommissionFraudCheck(
  referrerId: string,
  payerId: string,
  payerIP?: string,
  payerPaymentFingerprint?: string
): Promise<{ allow: boolean; reason?: string }> {
  try {
    // Check 1: Self-referral by ID
    if (referrerId === payerId) {
      return { allow: false, reason: 'Self-referral detected' };
    }

    // Check 2: Same IP as referrer
    if (payerIP) {
      const referrerMetadata = await getDoc(doc(db, 'signup_metadata', referrerId));
      if (referrerMetadata.exists()) {
        const referrerIP = referrerMetadata.data().ip_address;
        if (referrerIP === payerIP) {
          return { allow: false, reason: 'Payer IP matches referrer IP' };
        }
      }
    }

    // Check 3: Same payment method as referrer
    if (payerPaymentFingerprint) {
      const referrerFingerprints = await getUserPaymentFingerprints(referrerId);
      if (referrerFingerprints.includes(payerPaymentFingerprint)) {
        return { allow: false, reason: 'Payer payment method matches referrer' };
      }
    }

    // Check 4: Referrer karma not suspended
    const referrerDoc = await getDoc(doc(db, 'users', referrerId));
    if (referrerDoc.exists()) {
      const referrerData = referrerDoc.data();
      if (referrerData.user_karma_suspended) {
        return { allow: false, reason: 'Referrer karma is suspended pending investigation' };
      }
    }

    return { allow: true };
  } catch (error) {
    console.error('Error in pre-commission fraud check:', error);
    // Allow on error to not block legitimate transactions
    return { allow: true };
  }
}

// ============================================
// Helper Functions
// ============================================

async function getIPAddressCounts(userIds: string[]): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  for (const userId of userIds) {
    const metadataDoc = await getDoc(doc(db, 'signup_metadata', userId));
    if (metadataDoc.exists()) {
      const ip = metadataDoc.data().ip_address;
      if (ip) {
        counts[ip] = (counts[ip] || 0) + 1;
      }
    }
  }

  return counts;
}

async function getPaymentMethodCounts(userIds: string[]): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  for (const userId of userIds) {
    const fingerprints = await getUserPaymentFingerprints(userId);
    for (const fp of fingerprints) {
      counts[fp] = (counts[fp] || 0) + 1;
    }
  }

  return counts;
}

async function getUserPaymentFingerprints(userId: string): Promise<string[]> {
  const q = query(
    collection(db, 'payment_fingerprints'),
    where('user_id', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data().fingerprint);
}

async function getSignupTimings(userIds: string[]): Promise<Date[]> {
  const timings: Date[] = [];

  for (const userId of userIds) {
    const metadataDoc = await getDoc(doc(db, 'signup_metadata', userId));
    if (metadataDoc.exists()) {
      const timestamp = metadataDoc.data().created_at;
      if (timestamp) {
        timings.push(timestamp.toDate());
      }
    }
  }

  return timings.sort((a, b) => a.getTime() - b.getTime());
}

function countRapidSignups(timings: Date[]): number {
  if (timings.length < 2) return 0;

  let maxInWindow = 0;

  for (let i = 0; i < timings.length; i++) {
    const windowStart = timings[i].getTime();
    const windowEnd = windowStart + FRAUD_THRESHOLDS.RAPID_SIGNUP_WINDOW;
    let countInWindow = 0;

    for (let j = i; j < timings.length; j++) {
      if (timings[j].getTime() <= windowEnd) {
        countInWindow++;
      } else {
        break;
      }
    }

    maxInWindow = Math.max(maxInWindow, countInWindow);
  }

  return maxInWindow;
}

async function suspendKarma(userId: string, flags: FraudFlag[]): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      user_karma_suspended: true,
      user_karma_suspended_at: Timestamp.now(),
      user_karma_suspension_reason: flags.map((f) => f.detail).join('; '),
    });

    // Create suspension record for admin review
    const suspensionId = generateId('sus');
    await setDoc(doc(db, 'karma_suspensions', suspensionId), {
      suspension_id: suspensionId,
      user_id: userId,
      flags: flags.map((f) => ({
        type: f.type,
        severity: f.severity,
        detail: f.detail,
      })),
      status: 'pending_review',
      created_at: Timestamp.now(),
    });

    return true;
  } catch (error) {
    console.error('Error suspending karma:', error);
    return false;
  }
}

async function logFraudCheck(
  userId: string,
  flags: FraudFlag[],
  suspended: boolean
): Promise<void> {
  try {
    const logId = generateId('flog');
    await setDoc(doc(db, 'fraud_check_logs', logId), {
      log_id: logId,
      user_id: userId,
      flags_count: flags.length,
      flags: flags.map((f) => ({
        type: f.type,
        severity: f.severity,
        detail: f.detail,
      })),
      karma_suspended: suspended,
      checked_at: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error logging fraud check:', error);
  }
}

// ============================================
// Admin Functions
// ============================================

/**
 * Get pending fraud suspensions for admin review
 */
export async function getPendingSuspensions(): Promise<
  Array<{
    suspension_id: string;
    user_id: string;
    flags: Array<{ type: string; severity: string; detail: string }>;
    created_at: Date;
  }>
> {
  try {
    const q = query(
      collection(db, 'karma_suspensions'),
      where('status', '==', 'pending_review')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        suspension_id: data.suspension_id,
        user_id: data.user_id,
        flags: data.flags,
        created_at: data.created_at.toDate(),
      };
    });
  } catch (error) {
    console.error('Error getting pending suspensions:', error);
    return [];
  }
}

/**
 * Resolve a karma suspension (admin action)
 */
export async function resolveSuspension(
  suspensionId: string,
  resolution: 'cleared' | 'confirmed_fraud',
  adminNotes: string
): Promise<boolean> {
  try {
    // Get the suspension
    const suspensionRef = doc(db, 'karma_suspensions', suspensionId);
    const suspensionDoc = await getDoc(suspensionRef);

    if (!suspensionDoc.exists()) {
      return false;
    }

    const suspensionData = suspensionDoc.data();
    const userId = suspensionData.user_id;

    // Update suspension status
    await updateDoc(suspensionRef, {
      status: resolution,
      admin_notes: adminNotes,
      resolved_at: Timestamp.now(),
    });

    // Update user's karma suspension status
    if (resolution === 'cleared') {
      // Reinstate karma
      await updateDoc(doc(db, 'users', userId), {
        user_karma_suspended: false,
        user_karma_suspension_reason: null,
      });
    } else if (resolution === 'confirmed_fraud') {
      // Keep suspended and zero out karma
      await updateDoc(doc(db, 'users', userId), {
        user_karma_balance: 0,
        user_karma_suspended: true,
        user_karma_suspension_reason: 'Confirmed fraud - karma forfeited',
      });
    }

    return true;
  } catch (error) {
    console.error('Error resolving suspension:', error);
    return false;
  }
}
