'use server';

/**
 * Stripe Connect Service - AMU Karma Payout System
 *
 * Handles Stripe Connect Express accounts for learners worldwide.
 * Express accounts are the recommended type for platforms that want
 * a hands-off approach to identity verification and payout management.
 *
 * Supported countries: All Stripe Connect supported countries
 * See: https://stripe.com/docs/connect/express-accounts#supported-countries
 *
 * Flow:
 * 1. User clicks "Connect Bank Account" on Karma dashboard
 * 2. We create a Connect Express account (country auto-detected or selected)
 * 3. User completes Stripe's hosted onboarding
 * 4. Once enabled, user can request payouts
 * 5. Payouts are processed as transfers to their connected account
 */

import Stripe from 'stripe';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type {
  CreateConnectAccountResult,
  RefreshOnboardingResult,
  AccountStatusResult,
  PayoutTransferResult,
  ConnectAccountStatus,
} from './types';

// Initialize Stripe (server-side only)
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2024-11-20.acacia',
    typescript: true,
  });
};

// Base URL for Connect returns
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

/**
 * Create a Stripe Connect Express account for a user
 * and return the onboarding link
 *
 * @param userId - The user's ID
 * @param email - The user's email
 * @param name - The user's name
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'ZA', 'NG')
 *                      If not provided, Stripe will determine from onboarding
 */
export async function createConnectAccount(
  userId: string,
  email: string,
  name: string,
  countryCode?: string
): Promise<CreateConnectAccountResult> {
  try {
    const stripe = getStripe();
    const baseUrl = getBaseUrl();

    // Check if user already has a Connect account
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    const existingAccountId = userData.user_stripe_connect_account_id;

    // If account exists, check if onboarding is complete
    if (existingAccountId) {
      const account = await stripe.accounts.retrieve(existingAccountId);

      if (account.details_submitted) {
        return {
          success: false,
          error: 'Account already connected. Please refresh the page.',
        };
      }

      // Account exists but onboarding not complete - create new link
      const accountLink = await stripe.accountLinks.create({
        account: existingAccountId,
        refresh_url: `${baseUrl}/referrals?stripe_refresh=true`,
        return_url: `${baseUrl}/referrals?stripe_success=true`,
        type: 'account_onboarding',
      });

      return {
        success: true,
        account_id: existingAccountId,
        onboarding_url: accountLink.url,
      };
    }

    // Build account creation params
    // Country is optional - if not provided, Stripe determines from onboarding
    const accountParams: Stripe.AccountCreateParams = {
      type: 'express',
      email: email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        name: `AMU Learner - ${name}`,
        product_description: 'Receiving referral rewards from Asset Management University',
        mcc: '8299', // Educational Services
        url: 'https://assetmanagementuniversity.org',
      },
      metadata: {
        user_id: userId,
        platform: 'amu',
        purpose: 'karma_payouts',
      },
      settings: {
        payouts: {
          schedule: {
            interval: 'manual', // We control when payouts happen
          },
        },
      },
    };

    // Add country if provided
    if (countryCode) {
      accountParams.country = countryCode;
      accountParams.individual = {
        email: email,
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || name.split(' ')[0],
      };
    }

    // Create new Express account
    const account = await stripe.accounts.create(accountParams);

    // Store account ID in user document
    await updateDoc(userRef, {
      user_stripe_connect_account_id: account.id,
      user_updated_at: Timestamp.now(),
    });

    // Store Connect account details
    await setDoc(doc(db, 'stripe_connect_accounts', account.id), {
      account_id: account.id,
      user_id: userId,
      status: 'pending' as ConnectAccountStatus,
      charges_enabled: false,
      payouts_enabled: false,
      details_submitted: false,
      onboarding_complete: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${baseUrl}/referrals?stripe_refresh=true`,
      return_url: `${baseUrl}/referrals?stripe_success=true`,
      type: 'account_onboarding',
    });

    return {
      success: true,
      account_id: account.id,
      onboarding_url: accountLink.url,
    };
  } catch (error) {
    console.error('Error creating Connect account:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Failed to create connected account',
    };
  }
}

/**
 * Refresh the onboarding link for an existing account
 * (Used when user returns to complete onboarding)
 */
export async function refreshOnboardingLink(
  userId: string
): Promise<RefreshOnboardingResult> {
  try {
    const stripe = getStripe();
    const baseUrl = getBaseUrl();

    // Get user's Connect account ID
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const accountId = userDoc.data().user_stripe_connect_account_id;

    if (!accountId) {
      return { success: false, error: 'No connected account found' };
    }

    // Create new onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/referrals?stripe_refresh=true`,
      return_url: `${baseUrl}/referrals?stripe_success=true`,
      type: 'account_onboarding',
    });

    return {
      success: true,
      onboarding_url: accountLink.url,
    };
  } catch (error) {
    console.error('Error refreshing onboarding link:', error);
    return {
      success: false,
      error: 'Failed to create onboarding link',
    };
  }
}

/**
 * Check the status of a user's Connect account
 */
export async function getConnectAccountStatus(
  userId: string
): Promise<AccountStatusResult> {
  try {
    const stripe = getStripe();

    // Get user's Connect account ID
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const accountId = userDoc.data().user_stripe_connect_account_id;

    if (!accountId) {
      return {
        success: true,
        status: 'not_created',
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
      };
    }

    // Retrieve account from Stripe
    const account = await stripe.accounts.retrieve(accountId);

    // Determine status
    let status: ConnectAccountStatus = 'pending';
    if (account.details_submitted && account.payouts_enabled) {
      status = 'enabled';
    } else if (account.details_submitted && !account.payouts_enabled) {
      status = 'restricted';
    } else if (!account.details_submitted) {
      status = 'pending';
    }

    // Update stored status
    const connectAccountRef = doc(db, 'stripe_connect_accounts', accountId);
    await updateDoc(connectAccountRef, {
      status,
      charges_enabled: account.charges_enabled || false,
      payouts_enabled: account.payouts_enabled || false,
      details_submitted: account.details_submitted || false,
      onboarding_complete: account.details_submitted || false,
      updated_at: Timestamp.now(),
    });

    return {
      success: true,
      status,
      charges_enabled: account.charges_enabled || false,
      payouts_enabled: account.payouts_enabled || false,
      details_submitted: account.details_submitted || false,
    };
  } catch (error) {
    console.error('Error getting Connect account status:', error);
    return {
      success: false,
      error: 'Failed to check account status',
    };
  }
}

/**
 * Process a payout transfer to a user's connected account
 *
 * @param userId - The user requesting the payout
 * @param amount - Amount in the user's currency (will be converted to minor units)
 * @param currency - Currency code (e.g., 'ZAR', 'USD', 'EUR')
 * @param payoutId - The payout record ID
 */
export async function processPayoutTransfer(
  userId: string,
  amount: number,
  currency: string,
  payoutId: string
): Promise<PayoutTransferResult> {
  try {
    const stripe = getStripe();

    // Validate amount (minimum payout is 100 in any currency)
    if (amount < 100) {
      return {
        success: false,
        error: `Minimum payout amount is ${currency} 100`,
      };
    }

    // Get user's Connect account
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    const accountId = userData.user_stripe_connect_account_id;

    if (!accountId) {
      return {
        success: false,
        error: 'Please connect your bank account first',
      };
    }

    // Verify account is enabled for payouts
    const account = await stripe.accounts.retrieve(accountId);

    if (!account.payouts_enabled) {
      return {
        success: false,
        error: 'Your account is not yet enabled for payouts. Please complete onboarding.',
      };
    }

    // Convert amount to minor units (cents/pence/etc.)
    // Most currencies use 100 minor units, but some (like JPY) use 1
    const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP', 'PYG', 'UGX', 'RWF'];
    const amountInMinorUnits = zeroDecimalCurrencies.includes(currency.toUpperCase())
      ? Math.round(amount)
      : Math.round(amount * 100);

    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: amountInMinorUnits,
      currency: currency.toLowerCase(),
      destination: accountId,
      description: `AMU Karma Payout - ${payoutId}`,
      metadata: {
        user_id: userId,
        payout_id: payoutId,
        platform: 'amu',
        type: 'karma_payout',
        original_amount: amount.toString(),
        original_currency: currency,
      },
    });

    return {
      success: true,
      transfer_id: transfer.id,
      amount: amount,
    };
  } catch (error) {
    console.error('Error processing payout transfer:', error);

    if (error instanceof Stripe.errors.StripeError) {
      // Handle specific Stripe errors
      if (error.code === 'insufficient_funds') {
        return {
          success: false,
          error: 'Platform has insufficient funds. Please contact support.',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Failed to process payout',
    };
  }
}

/**
 * Get the Stripe Express dashboard login link for a user
 * (Allows users to manage their connected account)
 */
export async function getExpressDashboardLink(
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const stripe = getStripe();

    // Get user's Connect account ID
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const accountId = userDoc.data().user_stripe_connect_account_id;

    if (!accountId) {
      return { success: false, error: 'No connected account found' };
    }

    // Create login link
    const loginLink = await stripe.accounts.createLoginLink(accountId);

    return {
      success: true,
      url: loginLink.url,
    };
  } catch (error) {
    console.error('Error creating dashboard link:', error);
    return {
      success: false,
      error: 'Failed to create dashboard link',
    };
  }
}

/**
 * Check if Stripe is configured
 */
export async function isStripeConfigured(): Promise<boolean> {
  return !!process.env.STRIPE_SECRET_KEY;
}
