/**
 * Payment types for AMU Platform
 * Based on Section 5.1.12 of the specification
 */

export type PaymentType = 'certificate' | 'seta_registration' | 'prepaid_credits';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface Payment {
  payment_id: string;
  payment_user_id: string;
  payment_company_id?: string;
  payment_type: PaymentType;

  // Amount
  payment_amount: number;
  payment_list_price: number;
  payment_discount_amount: number;
  payment_currency: 'ZAR';

  // Referral
  payment_referrer_user_id?: string;
  payment_tier1_commission?: number;
  payment_tier2_referrer_user_id?: string;
  payment_tier2_commission?: number;

  // Stripe
  payment_stripe_payment_intent_id: string;
  payment_stripe_charge_id?: string;
  payment_stripe_receipt_url?: string;

  // Status
  payment_status: PaymentStatus;
  payment_created_date: Date;
  payment_completed_date?: Date;

  // Related Items
  payment_certificate_ids?: string[];
  payment_seta_registration_id?: string;
}

/**
 * Payment document for Firestore (with serialized dates)
 */
export interface PaymentDocument extends Omit<Payment, 'payment_created_date' | 'payment_completed_date'> {
  payment_created_date: string;
  payment_completed_date?: string;
}

/**
 * Create payment intent input
 */
export interface CreatePaymentIntentInput {
  user_id: string;
  company_id?: string;
  certificate_ids: string[];
  referral_code?: string;
}

/**
 * Payment intent response
 */
export interface PaymentIntentResponse {
  client_secret: string;
  payment_id: string;
  amount: number;
  discount_applied: number;
}
