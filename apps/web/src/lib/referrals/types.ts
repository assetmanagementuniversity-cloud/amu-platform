/**
 * Referral Types - AMU Karma Programme
 *
 * Section 1.4 - Two-tier referral system (Karma)
 * "I am because we are" - Ubuntu philosophy extended to growth
 *
 * Key Rules:
 * - Rewards trigger when referred learners PAY for official certification
 * - Both tiers receive 10% of LIST PRICE (before referral discount)
 * - Payouts processed as soon as possible after each payment
 */

/**
 * Karma reward configuration
 */
export const KARMA_REWARDS = {
  /** Tier 1: Direct referral - 10% of list price */
  TIER_1_PERCENTAGE: 0.10,
  /** Tier 2: Referrer of referrer - 10% of list price */
  TIER_2_PERCENTAGE: 0.10,
  /** Minimum balance required for payout (in learner's currency) */
  MINIMUM_PAYOUT: 100,
} as const;

/**
 * Referral relationship status
 * - 'active': Referral link established (user signed up with code)
 * - 'converted': Referred user has made at least one payment
 */
export type ReferralStatus = 'active' | 'converted';

/**
 * Karma transaction types
 */
export type KarmaTransactionType =
  | 'tier1_commission'    // 10% from direct referral's payment
  | 'tier2_commission'    // 10% from referral network payment
  | 'payout'              // Withdrawal to bank account
  | 'adjustment';         // Manual adjustment by admin

/**
 * Payout status
 */
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Supported currencies for payouts
 */
export type PayoutCurrency = 'ZAR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'INR' | 'NGN' | 'KES';

/**
 * Referral relationship record stored in Firestore
 * Created when a user signs up with a referral code
 */
export interface ReferralRecord {
  referral_id: string;
  /** The user who will receive commission (tier 1 referrer) */
  referral_referrer_id: string;
  /** The user who signed up with the referral code */
  referral_referred_id: string;
  /** The referral code used */
  referral_code_used: string;
  /** Current status of the referral relationship */
  referral_status: ReferralStatus;
  /** Total karma earned from this referral (sum of all commissions) */
  referral_total_earned: number;
  /** Number of payments made by referred user */
  referral_payment_count: number;
  /** When the referral relationship was created */
  referral_created_at: Date;
  /** When the first payment was made (converted) */
  referral_first_payment_at?: Date;
}

/**
 * Commission record for a specific payment
 * Created each time a referred user makes a payment
 */
export interface CommissionRecord {
  commission_id: string;
  /** The payment that triggered this commission */
  commission_payment_id: string;
  /** The user receiving the commission */
  commission_recipient_id: string;
  /** The user who made the payment */
  commission_payer_id: string;
  /** Tier 1 (direct) or Tier 2 (network) */
  commission_tier: 1 | 2;
  /** List price of the item purchased (before discount) */
  commission_list_price: number;
  /** Commission percentage applied (0.10 = 10%) */
  commission_percentage: number;
  /** Commission amount earned */
  commission_amount: number;
  /** Currency of the commission */
  commission_currency: string;
  /** Course/certificate that was purchased */
  commission_course_id: string;
  commission_course_title: string;
  /** When the commission was created */
  commission_created_at: Date;
}

/**
 * Karma transaction record
 */
export interface KarmaTransaction {
  transaction_id: string;
  transaction_user_id: string;
  transaction_type: KarmaTransactionType;
  /** Amount (positive for earnings, negative for payouts) */
  transaction_amount: number;
  /** Balance after this transaction */
  transaction_balance_after: number;
  /** Currency of the transaction */
  transaction_currency: string;
  transaction_description: string;
  /** Link to commission record (for commission transactions) */
  transaction_commission_id?: string;
  /** Link to payout record (for payout transactions) */
  transaction_payout_id?: string;
  transaction_created_at: Date;
}

/**
 * Payout request record
 */
export interface PayoutRequest {
  payout_id: string;
  payout_user_id: string;
  payout_amount: number;
  payout_currency: string;
  payout_status: PayoutStatus;
  payout_stripe_transfer_id?: string;
  payout_bank_reference?: string;
  payout_requested_at: Date;
  payout_processed_at?: Date;
  payout_failed_reason?: string;
}

/**
 * User's karma summary for dashboard
 */
export interface KarmaSummary {
  /** Current available balance */
  current_balance: number;
  /** Total earned over lifetime */
  lifetime_earned: number;
  /** Total withdrawn */
  total_withdrawn: number;
  /** User's preferred currency */
  currency: string;
  /** Total direct referrals (users who signed up with their code) */
  direct_referrals: number;
  /** Total payments from direct referrals */
  direct_referral_payments: number;
  /** Total payments from network (tier 2) */
  network_payments: number;
  /** Whether user can request payout (balance >= minimum) */
  can_request_payout: boolean;
  /** Whether Stripe Connect is set up */
  stripe_connected: boolean;
}

/**
 * Referral list item for dashboard display
 */
export interface ReferralListItem {
  referral_id: string;
  referred_name: string;
  referred_initial: string;
  /** Total earned from this referral */
  total_earned: number;
  /** Number of payments made */
  payment_count: number;
  status: ReferralStatus;
  date: Date;
}

/**
 * Commission item for transaction history
 */
export interface CommissionListItem {
  commission_id: string;
  payer_name: string;
  course_title: string;
  tier: 1 | 2;
  list_price: number;
  commission_amount: number;
  currency: string;
  date: Date;
}

/**
 * Result of registering a referral relationship (on signup)
 */
export interface RegisterReferralResult {
  success: boolean;
  referral_id?: string;
  referrer_id?: string;
  referrer_name?: string;
  error?: string;
}

/**
 * Result of processing commission (on payment)
 */
export interface ProcessCommissionResult {
  success: boolean;
  tier1_commission?: number;
  tier2_commission?: number;
  tier1_recipient_id?: string;
  tier2_recipient_id?: string;
  error?: string;
}

/**
 * Result of payout request
 */
export interface PayoutRequestResult {
  success: boolean;
  payout_id?: string;
  requires_stripe_connect?: boolean;
  error?: string;
}
