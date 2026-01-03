'use server';

/**
 * Referral Service - AMU Karma Programme
 *
 * Implements the two-tier referral system (Section 1.4):
 * - Both tiers receive 10% of LIST PRICE (before referral discount)
 * - Commissions trigger on PAYMENT, not on signup
 * - Payouts processed as soon as possible after each payment
 *
 * "Ubuntu - I am because we are"
 * Growth through community, not competition.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  runTransaction,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { generateId } from '@amu/shared';
import {
  KARMA_REWARDS,
  type ReferralRecord,
  type CommissionRecord,
  type KarmaTransaction,
  type PayoutRequest,
  type KarmaSummary,
  type ReferralListItem,
  type RegisterReferralResult,
  type ProcessCommissionResult,
  type PayoutRequestResult,
} from './types';
import {
  sendKarmaEarnedEmail,
  sendReferralSignupEmail,
  sendPayoutRequestedEmail,
} from '@/lib/email';
import { preCommissionFraudCheck } from './fraud-detection';

// ============================================
// Referral Code Validation
// ============================================

/**
 * Validate a referral code and get the referrer's user ID
 */
export async function validateReferralCode(
  code: string
): Promise<{ valid: boolean; referrerId?: string; referrerName?: string }> {
  if (!code || code.trim().length === 0) {
    return { valid: false };
  }

  try {
    // Query users collection for matching referral code
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('user_referral_code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { valid: false };
    }

    const referrerDoc = snapshot.docs[0];
    const referrerData = referrerDoc.data();

    return {
      valid: true,
      referrerId: referrerDoc.id,
      referrerName: referrerData.user_name || 'A friend',
    };
  } catch (error) {
    console.error('Error validating referral code:', error);
    return { valid: false };
  }
}

// ============================================
// Referral Registration (on Signup)
// ============================================

/**
 * Register a referral relationship when a user signs up with a referral code.
 * This does NOT credit any karma - karma is only credited when payment is made.
 * Sends notification email to the referrer.
 */
export async function registerReferral(
  newUserId: string,
  newUserName: string,
  referralCode: string
): Promise<RegisterReferralResult> {
  try {
    // Validate the referral code
    const validation = await validateReferralCode(referralCode);
    if (!validation.valid || !validation.referrerId) {
      return { success: false, error: 'Invalid referral code' };
    }

    const referrerId = validation.referrerId;

    // Prevent self-referral
    if (referrerId === newUserId) {
      return { success: false, error: 'Cannot use your own referral code' };
    }

    // Check if referral already exists
    const existingQuery = query(
      collection(db, 'referrals'),
      where('referral_referred_id', '==', newUserId)
    );
    const existingDocs = await getDocs(existingQuery);

    if (!existingDocs.empty) {
      return { success: false, error: 'User already has a referrer' };
    }

    // Get the referrer's data to find tier 2 referrer
    const referrerDoc = await getDoc(doc(db, 'users', referrerId));
    if (!referrerDoc.exists()) {
      return { success: false, error: 'Referrer not found' };
    }

    const referrerData = referrerDoc.data();
    const tier2ReferrerId = referrerData.user_referred_by_id || null;

    // Create referral relationship record
    const referralId = generateId('ref');
    const now = Timestamp.now();

    await runTransaction(db, async (transaction) => {
      // Create referral record
      const referralRef = doc(db, 'referrals', referralId);
      const referralData: Omit<ReferralRecord, 'referral_created_at' | 'referral_first_payment_at'> & {
        referral_created_at: Timestamp;
        referral_tier2_referrer_id?: string;
      } = {
        referral_id: referralId,
        referral_referrer_id: referrerId,
        referral_referred_id: newUserId,
        referral_code_used: referralCode.toUpperCase(),
        referral_status: 'active',
        referral_total_earned: 0,
        referral_payment_count: 0,
        referral_created_at: now,
        // Store tier 2 referrer for commission processing
        referral_tier2_referrer_id: tier2ReferrerId || undefined,
      };
      transaction.set(referralRef, referralData);

      // Update new user with referrer info
      const newUserRef = doc(db, 'users', newUserId);
      transaction.update(newUserRef, {
        user_referred_by_id: referrerId,
        user_referred_by_code: referralCode.toUpperCase(),
      });
    });

    // Send notification email to referrer
    try {
      const referrerDoc = await getDoc(doc(db, 'users', referrerId));
      if (referrerDoc.exists()) {
        const referrerData = referrerDoc.data();
        await sendReferralSignupEmail(
          referrerData.user_email,
          referrerData.user_name || 'Friend',
          newUserName,
          referralCode.toUpperCase()
        );
      }
    } catch (emailError) {
      // Don't fail the registration if email fails
      console.error('Error sending referral signup email:', emailError);
    }

    return {
      success: true,
      referral_id: referralId,
      referrer_id: referrerId,
      referrer_name: validation.referrerName,
    };
  } catch (error) {
    console.error('Error registering referral:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to register referral',
    };
  }
}

// ============================================
// Commission Processing (on Payment)
// ============================================

/**
 * Process commissions when a referred user makes a payment.
 * Called by the payment processing system after successful payment.
 *
 * @param payerId - The user who made the payment
 * @param paymentId - The payment ID
 * @param listPrice - The LIST PRICE of the item (before referral discount)
 * @param currency - Currency of the payment
 * @param courseId - The course/certificate being purchased
 * @param courseTitle - Title of the course
 * @param payerIP - Optional: payer's IP for fraud detection
 * @param payerPaymentFingerprint - Optional: payment method fingerprint for fraud detection
 */
export async function processPaymentCommission(
  payerId: string,
  paymentId: string,
  listPrice: number,
  currency: string,
  courseId: string,
  courseTitle: string,
  payerIP?: string,
  payerPaymentFingerprint?: string
): Promise<ProcessCommissionResult> {
  try {
    // Find the referral relationship for this payer
    const referralQuery = query(
      collection(db, 'referrals'),
      where('referral_referred_id', '==', payerId)
    );
    const referralDocs = await getDocs(referralQuery);

    if (referralDocs.empty) {
      // User has no referrer - no commission to process
      return { success: true };
    }

    const referralDoc = referralDocs.docs[0];
    const referralData = referralDoc.data();
    const tier1ReferrerId = referralData.referral_referrer_id;
    const tier2ReferrerId = referralData.referral_tier2_referrer_id;

    // Fraud check for Tier 1
    const tier1FraudCheck = await preCommissionFraudCheck(
      tier1ReferrerId,
      payerId,
      payerIP,
      payerPaymentFingerprint
    );

    if (!tier1FraudCheck.allow) {
      console.warn(
        `[Fraud Detection] Tier 1 commission blocked for ${tier1ReferrerId}: ${tier1FraudCheck.reason}`
      );
      return {
        success: false,
        error: `Commission blocked: ${tier1FraudCheck.reason}`,
      };
    }

    // Fraud check for Tier 2 (if applicable)
    if (tier2ReferrerId) {
      const tier2FraudCheck = await preCommissionFraudCheck(
        tier2ReferrerId,
        payerId,
        payerIP,
        payerPaymentFingerprint
      );

      if (!tier2FraudCheck.allow) {
        console.warn(
          `[Fraud Detection] Tier 2 commission blocked for ${tier2ReferrerId}: ${tier2FraudCheck.reason}`
        );
        // Don't block Tier 1 if only Tier 2 fails, just skip Tier 2
      }
    }

    // Calculate commissions (10% of list price each)
    const tier1Commission = Math.round(listPrice * KARMA_REWARDS.TIER_1_PERCENTAGE * 100) / 100;
    const tier2Commission = tier2ReferrerId
      ? Math.round(listPrice * KARMA_REWARDS.TIER_2_PERCENTAGE * 100) / 100
      : 0;

    const now = Timestamp.now();

    // Store referrer info for email notifications after transaction
    let tier1Email = '';
    let tier1Name = '';
    let tier1NewBalance = 0;
    let tier2Email = '';
    let tier2Name = '';
    let tier2NewBalance = 0;
    let payerName = 'A learner';

    await runTransaction(db, async (transaction) => {
      // Get payer's name for descriptions
      const payerDoc = await transaction.get(doc(db, 'users', payerId));
      payerName = payerDoc.exists() ? payerDoc.data().user_name || 'A learner' : 'A learner';

      // Process Tier 1 commission
      const tier1CommissionId = generateId('com');
      const tier1CommissionRef = doc(db, 'commissions', tier1CommissionId);

      const tier1CommissionRecord: Omit<CommissionRecord, 'commission_created_at'> & {
        commission_created_at: Timestamp;
      } = {
        commission_id: tier1CommissionId,
        commission_payment_id: paymentId,
        commission_recipient_id: tier1ReferrerId,
        commission_payer_id: payerId,
        commission_tier: 1,
        commission_list_price: listPrice,
        commission_percentage: KARMA_REWARDS.TIER_1_PERCENTAGE,
        commission_amount: tier1Commission,
        commission_currency: currency,
        commission_course_id: courseId,
        commission_course_title: courseTitle,
        commission_created_at: now,
      };
      transaction.set(tier1CommissionRef, tier1CommissionRecord);

      // Credit Tier 1 referrer's karma balance
      const tier1UserRef = doc(db, 'users', tier1ReferrerId);
      const tier1UserDoc = await transaction.get(tier1UserRef);
      const tier1CurrentBalance = tier1UserDoc.exists()
        ? (tier1UserDoc.data().user_karma_balance || 0)
        : 0;

      // Capture tier 1 info for email notification
      if (tier1UserDoc.exists()) {
        const tier1Data = tier1UserDoc.data();
        tier1Email = tier1Data.user_email || '';
        tier1Name = tier1Data.user_name || 'Friend';
        tier1NewBalance = tier1CurrentBalance + tier1Commission;
      }

      transaction.update(tier1UserRef, {
        user_karma_balance: increment(tier1Commission),
        user_karma_lifetime_earned: increment(tier1Commission),
        user_karma_currency: currency, // Track user's primary currency
      });

      // Create karma transaction for Tier 1
      const tier1TxId = generateId('ktx');
      transaction.set(doc(db, 'karma_transactions', tier1TxId), {
        transaction_id: tier1TxId,
        transaction_user_id: tier1ReferrerId,
        transaction_type: 'tier1_commission',
        transaction_amount: tier1Commission,
        transaction_balance_after: tier1CurrentBalance + tier1Commission,
        transaction_currency: currency,
        transaction_description: `10% commission: ${payerName} purchased ${courseTitle}`,
        transaction_commission_id: tier1CommissionId,
        transaction_created_at: now,
      });

      // Update referral record
      const isFirstPayment = referralData.referral_payment_count === 0;
      transaction.update(referralDoc.ref, {
        referral_status: 'converted',
        referral_total_earned: increment(tier1Commission),
        referral_payment_count: increment(1),
        ...(isFirstPayment && { referral_first_payment_at: now }),
      });

      // Process Tier 2 commission if applicable
      if (tier2ReferrerId && tier2Commission > 0) {
        const tier2CommissionId = generateId('com');
        const tier2CommissionRef = doc(db, 'commissions', tier2CommissionId);

        transaction.set(tier2CommissionRef, {
          commission_id: tier2CommissionId,
          commission_payment_id: paymentId,
          commission_recipient_id: tier2ReferrerId,
          commission_payer_id: payerId,
          commission_tier: 2,
          commission_list_price: listPrice,
          commission_percentage: KARMA_REWARDS.TIER_2_PERCENTAGE,
          commission_amount: tier2Commission,
          commission_currency: currency,
          commission_course_id: courseId,
          commission_course_title: courseTitle,
          commission_created_at: now,
        });

        // Credit Tier 2 referrer's karma balance
        const tier2UserRef = doc(db, 'users', tier2ReferrerId);
        const tier2UserDoc = await transaction.get(tier2UserRef);
        const tier2CurrentBalance = tier2UserDoc.exists()
          ? (tier2UserDoc.data().user_karma_balance || 0)
          : 0;

        // Capture tier 2 info for email notification
        if (tier2UserDoc.exists()) {
          const tier2Data = tier2UserDoc.data();
          tier2Email = tier2Data.user_email || '';
          tier2Name = tier2Data.user_name || 'Friend';
          tier2NewBalance = tier2CurrentBalance + tier2Commission;
        }

        transaction.update(tier2UserRef, {
          user_karma_balance: increment(tier2Commission),
          user_karma_lifetime_earned: increment(tier2Commission),
          user_karma_currency: currency,
        });

        // Create karma transaction for Tier 2
        const tier2TxId = generateId('ktx');
        transaction.set(doc(db, 'karma_transactions', tier2TxId), {
          transaction_id: tier2TxId,
          transaction_user_id: tier2ReferrerId,
          transaction_type: 'tier2_commission',
          transaction_amount: tier2Commission,
          transaction_balance_after: tier2CurrentBalance + tier2Commission,
          transaction_currency: currency,
          transaction_description: `10% network commission: ${payerName} purchased ${courseTitle}`,
          transaction_commission_id: tier2CommissionId,
          transaction_created_at: now,
        });
      }
    });

    // Send email notifications after successful transaction
    // These are fire-and-forget - don't fail the commission if email fails
    try {
      // Notify Tier 1 referrer
      if (tier1Email) {
        await sendKarmaEarnedEmail(
          tier1Email,
          tier1Name,
          tier1Commission,
          currency,
          1,
          payerName,
          courseTitle,
          tier1NewBalance
        );
      }

      // Notify Tier 2 referrer
      if (tier2Email && tier2Commission > 0) {
        await sendKarmaEarnedEmail(
          tier2Email,
          tier2Name,
          tier2Commission,
          currency,
          2,
          payerName,
          courseTitle,
          tier2NewBalance
        );
      }
    } catch (emailError) {
      // Log but don't fail - commission was already processed
      console.error('Error sending karma earned emails:', emailError);
    }

    return {
      success: true,
      tier1_commission: tier1Commission,
      tier2_commission: tier2Commission || undefined,
      tier1_recipient_id: tier1ReferrerId,
      tier2_recipient_id: tier2ReferrerId || undefined,
    };
  } catch (error) {
    console.error('Error processing commission:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process commission',
    };
  }
}

// ============================================
// Karma Dashboard Data
// ============================================

/**
 * Get karma summary for a user's dashboard
 */
export async function getKarmaSummary(userId: string): Promise<KarmaSummary | null> {
  try {
    // Get user data
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    const currency = userData.user_karma_currency || 'ZAR';

    // Count direct referrals
    const referralsRef = collection(db, 'referrals');
    const referralsQuery = query(
      referralsRef,
      where('referral_referrer_id', '==', userId)
    );
    const referralsSnapshot = await getDocs(referralsQuery);
    const directReferrals = referralsSnapshot.size;

    // Count tier 1 commissions (payments from direct referrals)
    const tier1Query = query(
      collection(db, 'commissions'),
      where('commission_recipient_id', '==', userId),
      where('commission_tier', '==', 1)
    );
    const tier1Snapshot = await getDocs(tier1Query);

    // Count tier 2 commissions (network payments)
    const tier2Query = query(
      collection(db, 'commissions'),
      where('commission_recipient_id', '==', userId),
      where('commission_tier', '==', 2)
    );
    const tier2Snapshot = await getDocs(tier2Query);

    // Get total withdrawn
    const payoutsRef = collection(db, 'payouts');
    const payoutsQuery = query(
      payoutsRef,
      where('payout_user_id', '==', userId),
      where('payout_status', '==', 'completed')
    );
    const payoutsSnapshot = await getDocs(payoutsQuery);
    const totalWithdrawn = payoutsSnapshot.docs.reduce(
      (sum, doc) => sum + (doc.data().payout_amount || 0),
      0
    );

    const currentBalance = userData.user_karma_balance || 0;

    return {
      current_balance: currentBalance,
      lifetime_earned: userData.user_karma_lifetime_earned || 0,
      total_withdrawn: totalWithdrawn,
      currency: currency,
      direct_referrals: directReferrals,
      direct_referral_payments: tier1Snapshot.size,
      network_payments: tier2Snapshot.size,
      can_request_payout: currentBalance >= KARMA_REWARDS.MINIMUM_PAYOUT,
      stripe_connected: !!userData.user_stripe_connect_account_id,
    };
  } catch (error) {
    console.error('Error getting karma summary:', error);
    return null;
  }
}

/**
 * Get list of referrals for dashboard display
 */
export async function getReferralsList(
  userId: string,
  limit: number = 20
): Promise<ReferralListItem[]> {
  try {
    const referralsRef = collection(db, 'referrals');
    const q = query(
      referralsRef,
      where('referral_referrer_id', '==', userId),
      orderBy('referral_created_at', 'desc')
    );

    const snapshot = await getDocs(q);
    const referrals: ReferralListItem[] = [];

    for (const refDoc of snapshot.docs.slice(0, limit)) {
      const refData = refDoc.data();

      // Get referred user's name
      let referredName = 'Anonymous';
      let referredInitial = 'A';

      if (refData.referral_referred_id) {
        const referredUserDoc = await getDoc(
          doc(db, 'users', refData.referral_referred_id)
        );
        if (referredUserDoc.exists()) {
          const referredUserData = referredUserDoc.data();
          referredName = referredUserData.user_name || 'Anonymous';
          referredInitial = referredName.charAt(0).toUpperCase();
        }
      }

      referrals.push({
        referral_id: refData.referral_id,
        referred_name: referredName,
        referred_initial: referredInitial,
        total_earned: refData.referral_total_earned || 0,
        payment_count: refData.referral_payment_count || 0,
        status: refData.referral_status,
        date: refData.referral_created_at?.toDate() || new Date(),
      });
    }

    return referrals;
  } catch (error) {
    console.error('Error getting referrals list:', error);
    return [];
  }
}

/**
 * Get karma transaction history
 */
export async function getKarmaTransactions(
  userId: string,
  limit: number = 50
): Promise<KarmaTransaction[]> {
  try {
    const txRef = collection(db, 'karma_transactions');
    const q = query(
      txRef,
      where('transaction_user_id', '==', userId),
      orderBy('transaction_created_at', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map((txDoc) => {
      const data = txDoc.data();
      return {
        ...data,
        transaction_created_at: data.transaction_created_at?.toDate() || new Date(),
      } as KarmaTransaction;
    });
  } catch (error) {
    console.error('Error getting karma transactions:', error);
    return [];
  }
}

// ============================================
// Payout Requests
// ============================================

/**
 * Request a payout of karma balance
 */
export async function requestPayout(userId: string): Promise<PayoutRequestResult> {
  try {
    // Get user data
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    const currentBalance = userData.user_karma_balance || 0;
    const currency = userData.user_karma_currency || 'ZAR';

    // Check minimum balance
    if (currentBalance < KARMA_REWARDS.MINIMUM_PAYOUT) {
      return {
        success: false,
        error: `Minimum payout amount is ${currency} ${KARMA_REWARDS.MINIMUM_PAYOUT}. Your current balance is ${currency} ${currentBalance}.`,
      };
    }

    // Check if Stripe Connect is set up
    if (!userData.user_stripe_connect_account_id) {
      return {
        success: false,
        requires_stripe_connect: true,
        error: 'Please connect your bank account to receive payouts.',
      };
    }

    // Check for pending payout
    const pendingPayoutsQuery = query(
      collection(db, 'payouts'),
      where('payout_user_id', '==', userId),
      where('payout_status', 'in', ['pending', 'processing'])
    );
    const pendingPayouts = await getDocs(pendingPayoutsQuery);

    if (!pendingPayouts.empty) {
      return {
        success: false,
        error: 'You already have a pending payout request.',
      };
    }

    // Create payout request using transaction
    const payoutId = generateId('payout');
    const userName = userData.user_name || 'Friend';
    const userEmail = userData.user_email;

    await runTransaction(db, async (transaction) => {
      // Deduct from user balance
      transaction.update(userRef, {
        user_karma_balance: increment(-currentBalance),
      });

      // Create payout record
      const payoutRef = doc(db, 'payouts', payoutId);
      const payoutData: Omit<PayoutRequest, 'payout_requested_at'> & {
        payout_requested_at: Timestamp;
      } = {
        payout_id: payoutId,
        payout_user_id: userId,
        payout_amount: currentBalance,
        payout_currency: currency,
        payout_status: 'pending',
        payout_requested_at: Timestamp.now(),
      };
      transaction.set(payoutRef, payoutData);

      // Create karma transaction for the debit
      const txId = generateId('ktx');
      const txRef = doc(db, 'karma_transactions', txId);
      transaction.set(txRef, {
        transaction_id: txId,
        transaction_user_id: userId,
        transaction_type: 'payout',
        transaction_amount: -currentBalance,
        transaction_balance_after: 0,
        transaction_currency: currency,
        transaction_description: `Payout request for ${currency} ${currentBalance}`,
        transaction_payout_id: payoutId,
        transaction_created_at: Timestamp.now(),
      });
    });

    // Send payout requested email notification
    try {
      if (userEmail) {
        await sendPayoutRequestedEmail(
          userEmail,
          userName,
          currentBalance,
          currency,
          payoutId
        );
      }
    } catch (emailError) {
      // Log but don't fail - payout was already created
      console.error('Error sending payout requested email:', emailError);
    }

    return {
      success: true,
      payout_id: payoutId,
    };
  } catch (error) {
    console.error('Error requesting payout:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to request payout',
    };
  }
}

/**
 * Get user's referral code
 */
export async function getUserReferralCode(userId: string): Promise<string | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data().user_referral_code || null;
  } catch (error) {
    console.error('Error getting referral code:', error);
    return null;
  }
}

/**
 * Generate referral link for sharing
 */
export function generateReferralLink(referralCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://assetmanagementuniversity.org';
  return `${baseUrl}/register?ref=${encodeURIComponent(referralCode)}`;
}
