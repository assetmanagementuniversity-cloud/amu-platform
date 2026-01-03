'use server';

/**
 * Stripe Corporate Subscription Service - AMU Platform
 *
 * Handles Corporate Portal subscriptions for organisations (Section 1.6).
 * Corporate subscriptions unlock:
 * - Full team progress reporting
 * - SETA/Skills Development Act export
 * - Priority support
 * - Bulk enrolment discounts
 *
 * "Ubuntu - I am because we are"
 * Companies enable their teams to grow together.
 */

import Stripe from 'stripe';
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

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

// Corporate subscription price IDs (to be configured in Stripe Dashboard)
const CORPORATE_SUBSCRIPTION_PRICES = {
  // Monthly plans
  starter_monthly: process.env.STRIPE_CORPORATE_STARTER_MONTHLY || 'price_corporate_starter_monthly',
  professional_monthly: process.env.STRIPE_CORPORATE_PRO_MONTHLY || 'price_corporate_pro_monthly',
  enterprise_monthly: process.env.STRIPE_CORPORATE_ENTERPRISE_MONTHLY || 'price_corporate_enterprise_monthly',
  // Annual plans (discounted)
  starter_annual: process.env.STRIPE_CORPORATE_STARTER_ANNUAL || 'price_corporate_starter_annual',
  professional_annual: process.env.STRIPE_CORPORATE_PRO_ANNUAL || 'price_corporate_pro_annual',
  enterprise_annual: process.env.STRIPE_CORPORATE_ENTERPRISE_ANNUAL || 'price_corporate_enterprise_annual',
};

export type CorporatePlanTier = 'starter' | 'professional' | 'enterprise';
export type BillingInterval = 'monthly' | 'annual';

export interface CorporatePlan {
  tier: CorporatePlanTier;
  name: string;
  description: string;
  features: string[];
  maxEmployees: number;
  priceMonthly: number; // ZAR
  priceAnnual: number; // ZAR (total for year)
  includesSetaReports: boolean;
  includesPrioritySupport: boolean;
  bulkDiscount: number; // Percentage discount on certificate purchases
}

/**
 * Corporate plan definitions
 */
export const CORPORATE_PLANS: Record<CorporatePlanTier, CorporatePlan> = {
  starter: {
    tier: 'starter',
    name: 'Starter',
    description: 'For small teams getting started with professional development',
    features: [
      'Up to 25 employees',
      'Basic team progress dashboard',
      'Company code for employee signup',
      'Email invitations',
      'Standard support',
    ],
    maxEmployees: 25,
    priceMonthly: 999, // R999/month
    priceAnnual: 9990, // R9,990/year (save ~17%)
    includesSetaReports: false,
    includesPrioritySupport: false,
    bulkDiscount: 5,
  },
  professional: {
    tier: 'professional',
    name: 'Professional',
    description: 'For growing organisations with compliance requirements',
    features: [
      'Up to 100 employees',
      'Full team progress analytics',
      'SETA/Skills Development Act reports',
      'Company code for employee signup',
      'Bulk email invitations',
      '10% discount on certificates',
      'Priority email support',
    ],
    maxEmployees: 100,
    priceMonthly: 2499, // R2,499/month
    priceAnnual: 24990, // R24,990/year (save ~17%)
    includesSetaReports: true,
    includesPrioritySupport: true,
    bulkDiscount: 10,
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'For large organisations with advanced needs',
    features: [
      'Unlimited employees',
      'Advanced analytics & reporting',
      'Custom SETA/SDL reporting',
      'Single Sign-On (SSO) integration',
      'Custom branding options',
      '15% discount on certificates',
      'Dedicated account manager',
      'Phone & video support',
    ],
    maxEmployees: Infinity,
    priceMonthly: 4999, // R4,999/month
    priceAnnual: 49990, // R49,990/year (save ~17%)
    includesSetaReports: true,
    includesPrioritySupport: true,
    bulkDiscount: 15,
  },
};

export interface CreateCheckoutResult {
  success: boolean;
  checkout_url?: string;
  session_id?: string;
  error?: string;
}

export interface SubscriptionStatusResult {
  success: boolean;
  is_subscribed?: boolean;
  tier?: CorporatePlanTier;
  status?: string;
  current_period_end?: Date;
  cancel_at_period_end?: boolean;
  error?: string;
}

/**
 * Create a Stripe Checkout session for corporate subscription
 */
export async function createCorporateCheckout(
  companyId: string,
  userId: string,
  tier: CorporatePlanTier,
  interval: BillingInterval
): Promise<CreateCheckoutResult> {
  try {
    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Verify user is company admin
    const companyRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyRef);

    if (!companyDoc.exists()) {
      return { success: false, error: 'Company not found' };
    }

    const companyData = companyDoc.data();
    if (!companyData.company_admin_user_ids?.includes(userId)) {
      return { success: false, error: 'Only company admins can manage subscriptions' };
    }

    // Get or create Stripe customer for the company
    let customerId = companyData.company_stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: companyData.company_contact_email,
        name: companyData.company_name,
        metadata: {
          company_id: companyId,
          platform: 'amu',
          type: 'corporate',
        },
      });
      customerId = customer.id;

      // Save customer ID to company
      await updateDoc(companyRef, {
        company_stripe_customer_id: customerId,
      });
    }

    // Get the price ID for the selected plan
    const priceKey = `${tier}_${interval}` as keyof typeof CORPORATE_SUBSCRIPTION_PRICES;
    const priceId = CORPORATE_SUBSCRIPTION_PRICES[priceKey];

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/organisation/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/organisation/subscription?cancelled=true`,
      metadata: {
        company_id: companyId,
        user_id: userId,
        tier,
        interval,
        platform: 'amu',
      },
      subscription_data: {
        metadata: {
          company_id: companyId,
          tier,
          platform: 'amu',
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    });

    return {
      success: true,
      checkout_url: session.url || undefined,
      session_id: session.id,
    };
  } catch (error) {
    console.error('Error creating corporate checkout:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to create checkout session' };
  }
}

/**
 * Get the subscription status for a company
 */
export async function getCorporateSubscriptionStatus(
  companyId: string
): Promise<SubscriptionStatusResult> {
  try {
    const stripe = getStripe();

    // Get company data
    const companyRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyRef);

    if (!companyDoc.exists()) {
      return { success: false, error: 'Company not found' };
    }

    const companyData = companyDoc.data();
    const customerId = companyData.company_stripe_customer_id;

    if (!customerId) {
      return {
        success: true,
        is_subscribed: false,
      };
    }

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // Check for past_due or cancelled
      const allSubs = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
      });

      if (allSubs.data.length > 0) {
        const sub = allSubs.data[0];
        return {
          success: true,
          is_subscribed: false,
          status: sub.status,
          tier: sub.metadata.tier as CorporatePlanTier,
          current_period_end: new Date(sub.current_period_end * 1000),
          cancel_at_period_end: sub.cancel_at_period_end,
        };
      }

      return {
        success: true,
        is_subscribed: false,
      };
    }

    const subscription = subscriptions.data[0];

    return {
      success: true,
      is_subscribed: true,
      tier: subscription.metadata.tier as CorporatePlanTier,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return { success: false, error: 'Failed to get subscription status' };
  }
}

/**
 * Create a customer portal session for managing subscription
 */
export async function createCustomerPortalSession(
  companyId: string,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Verify user is company admin
    const companyRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyRef);

    if (!companyDoc.exists()) {
      return { success: false, error: 'Company not found' };
    }

    const companyData = companyDoc.data();
    if (!companyData.company_admin_user_ids?.includes(userId)) {
      return { success: false, error: 'Only company admins can manage subscriptions' };
    }

    const customerId = companyData.company_stripe_customer_id;
    if (!customerId) {
      return { success: false, error: 'No subscription found' };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/organisation/subscription`,
    });

    return {
      success: true,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return { success: false, error: 'Failed to create portal session' };
  }
}

/**
 * Handle webhook for subscription events
 * (To be called from API route)
 */
export async function handleSubscriptionWebhook(
  event: Stripe.Event
): Promise<{ success: boolean; error?: string }> {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const companyId = subscription.metadata.company_id;
        const tier = subscription.metadata.tier as CorporatePlanTier;

        if (companyId) {
          const companyRef = doc(db, 'companies', companyId);
          await updateDoc(companyRef, {
            company_subscription_tier: tier,
            company_subscription_status: subscription.status,
            company_subscription_id: subscription.id,
            company_subscription_current_period_end: Timestamp.fromDate(
              new Date(subscription.current_period_end * 1000)
            ),
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const companyId = subscription.metadata.company_id;

        if (companyId) {
          const companyRef = doc(db, 'companies', companyId);
          await updateDoc(companyRef, {
            company_subscription_tier: null,
            company_subscription_status: 'cancelled',
            company_subscription_id: null,
          });
        }
        break;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling subscription webhook:', error);
    return { success: false, error: 'Webhook handling failed' };
  }
}
