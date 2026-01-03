/**
 * Referral types for AMU Platform
 * Based on Section 5.1.11 of the specification
 */

export type ReferralStatus = 'pending' | 'converted' | 'paid';
export type ReferralTier = 1 | 2;

export interface Referral {
  referral_id: string;
  referral_referrer_user_id: string;
  referral_referred_user_id?: string;
  referral_referred_company_id?: string;
  referral_date: Date;

  // Status
  referral_status: ReferralStatus;
  referral_conversion_date?: Date;
  referral_payment_date?: Date;

  // Tier tracking
  referral_tier: ReferralTier;
  referral_source_referral_id?: string;

  // Karma
  referral_karma_earned: number;
  referral_purchase_amount?: number;

  // Payment
  referral_payout_id?: string;
  referral_payout_date?: Date;
}

/**
 * Referral document for Firestore (with serialized dates)
 */
export interface ReferralDocument extends Omit<Referral, 'referral_date' | 'referral_conversion_date' | 'referral_payment_date' | 'referral_payout_date'> {
  referral_date: string;
  referral_conversion_date?: string;
  referral_payment_date?: string;
  referral_payout_date?: string;
}

/**
 * Karma transaction for tracking referral earnings
 */
export interface KarmaTransaction {
  transaction_id: string;
  transaction_user_id: string;
  transaction_type: 'credit' | 'debit' | 'payout';
  transaction_amount: number;
  transaction_balance_after: number;
  transaction_description: string;
  transaction_referral_id?: string;
  transaction_payout_id?: string;
  transaction_date: Date;
}

/**
 * Karma transaction document for Firestore
 */
export interface KarmaTransactionDocument extends Omit<KarmaTransaction, 'transaction_date'> {
  transaction_date: string;
}
