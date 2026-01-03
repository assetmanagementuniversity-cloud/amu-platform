/**
 * Stripe Connect Types - AMU Karma Payout System
 *
 * Stripe Connect Express accounts for South African learners
 * to receive their Karma payouts directly to their bank accounts.
 */

/**
 * Stripe Connect account status
 */
export type ConnectAccountStatus =
  | 'not_created'
  | 'pending'
  | 'restricted'
  | 'enabled'
  | 'disabled';

/**
 * Stripe Connect account info stored in Firestore
 */
export interface StripeConnectAccount {
  account_id: string;
  user_id: string;
  status: ConnectAccountStatus;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  onboarding_complete: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Result of creating a Connect account
 */
export interface CreateConnectAccountResult {
  success: boolean;
  account_id?: string;
  onboarding_url?: string;
  error?: string;
}

/**
 * Result of refreshing onboarding link
 */
export interface RefreshOnboardingResult {
  success: boolean;
  onboarding_url?: string;
  error?: string;
}

/**
 * Result of checking account status
 */
export interface AccountStatusResult {
  success: boolean;
  status?: ConnectAccountStatus;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
  error?: string;
}

/**
 * Result of processing a payout transfer
 */
export interface PayoutTransferResult {
  success: boolean;
  transfer_id?: string;
  amount?: number;
  error?: string;
}

/**
 * Stripe Connect onboarding return URLs
 */
export interface OnboardingUrls {
  return_url: string;
  refresh_url: string;
}
