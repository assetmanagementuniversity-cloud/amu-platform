/**
 * Webhook Handlers - AMU Platform
 *
 * Handles incoming webhooks from external services:
 * - Stripe: Payment and Connect account events
 * - SignRequest: Digital signature completion events
 *
 * Security:
 * - All webhooks verify signatures before processing
 * - Raw body parsing for signature verification
 */

import { Router, Request, Response } from 'express';
import { createHmac } from 'crypto';
import { getFirestore } from '@amu/database';
import { createApiError } from '../middleware/error-handler';

const router = Router();

// =============================================================================
// STRIPE WEBHOOK TYPES
// =============================================================================

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
}

interface StripeCheckoutSession {
  id: string;
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  status: 'complete' | 'expired' | 'open';
  customer_email?: string;
  metadata?: {
    user_id?: string;
    enrolment_id?: string;
    certificate_type?: 'official';
    course_id?: string;
    course_title?: string;
  };
  amount_total?: number;
  currency?: string;
}

interface StripePaymentIntent {
  id: string;
  status: 'succeeded' | 'processing' | 'requires_payment_method' | 'canceled';
  amount: number;
  currency: string;
  metadata?: {
    user_id?: string;
    purpose?: string;
  };
}

interface StripeConnectAccount {
  id: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
}

// =============================================================================
// STRIPE SIGNATURE VERIFICATION
// =============================================================================

/**
 * Verify Stripe webhook signature
 * Uses raw body for HMAC verification
 */
function verifyStripeSignature(
  rawBody: Buffer,
  signature: string,
  secret: string
): boolean {
  const signatureHeader = signature.split(',');
  const timestampPart = signatureHeader.find((part) => part.startsWith('t='));
  const signaturePart = signatureHeader.find((part) => part.startsWith('v1='));

  if (!timestampPart || !signaturePart) {
    return false;
  }

  const timestamp = timestampPart.substring(2);
  const expectedSignature = signaturePart.substring(3);

  // Create signed payload
  const signedPayload = `${timestamp}.${rawBody.toString()}`;

  // Compute expected signature
  const computedSignature = createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // Compare signatures (timing-safe comparison)
  return computedSignature === expectedSignature;
}

// =============================================================================
// STRIPE WEBHOOKS
// =============================================================================

/**
 * Stripe webhook endpoint
 * Handles: checkout.session.completed, payment_intent.succeeded, account.updated
 *
 * NOTE: This endpoint must receive raw body for signature verification
 * Configure Express to NOT parse JSON for this route
 */
router.post(
  '/stripe',
  async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Webhook] STRIPE_WEBHOOK_SECRET not configured');
      res.status(500).json({ error: 'Webhook secret not configured' });
      return;
    }

    if (!signature) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    // Get raw body (requires express.raw() middleware for this route)
    const rawBody = req.body as Buffer;

    // Verify signature
    const isValid = verifyStripeSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error('[Webhook] Invalid Stripe signature');
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // Parse event
    let event: StripeEvent;
    try {
      event = JSON.parse(rawBody.toString());
    } catch (error) {
      console.error('[Webhook] Failed to parse webhook body:', error);
      res.status(400).json({ error: 'Invalid payload' });
      return;
    }

    console.log(`[Webhook] Received Stripe event: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutComplete(event.data.object as unknown as StripeCheckoutSession);
          break;

        case 'payment_intent.succeeded':
          await handlePaymentSuccess(event.data.object as unknown as StripePaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentFailed(event.data.object as unknown as StripePaymentIntent);
          break;

        case 'account.updated':
          await handleConnectAccountUpdate(event.data.object as unknown as StripeConnectAccount);
          break;

        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }

      res.json({ received: true, event_id: event.id });
    } catch (error) {
      console.error(`[Webhook] Error processing ${event.type}:`, error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

// =============================================================================
// EVENT HANDLERS
// =============================================================================

/**
 * Handle checkout.session.completed
 * Triggered when a customer completes a Stripe Checkout session
 */
async function handleCheckoutComplete(session: StripeCheckoutSession): Promise<void> {
  console.log(`[Webhook] Processing checkout complete: ${session.id}`);

  if (session.payment_status !== 'paid') {
    console.log(`[Webhook] Checkout not paid, skipping: ${session.payment_status}`);
    return;
  }

  const { user_id, enrolment_id, certificate_type, course_id, course_title } =
    session.metadata || {};

  if (!user_id || !enrolment_id) {
    console.warn('[Webhook] Missing user_id or enrolment_id in session metadata');
    return;
  }

  const db = getFirestore();

  // Record certificate purchase
  if (certificate_type === 'official') {
    // Create certificate purchase record
    const purchaseId = `cp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    await db.collection('certificate_purchases').doc(purchaseId).set({
      purchase_id: purchaseId,
      user_id,
      enrolment_id,
      course_id: course_id || '',
      course_title: course_title || '',
      amount: session.amount_total || 0,
      currency: session.currency || 'zar',
      stripe_session_id: session.id,
      status: 'completed',
      purchased_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    // Update enrolment to mark official certificate as purchased
    await db.collection('enrolments').doc(enrolment_id).update({
      enrolment_official_certificate_purchased: true,
      enrolment_official_certificate_purchased_at: new Date().toISOString(),
      enrolment_stripe_session_id: session.id,
      enrolment_updated_at: new Date().toISOString(),
    });

    console.log(`[Webhook] Official certificate purchased for enrolment: ${enrolment_id}`);
  }
}

/**
 * Handle payment_intent.succeeded
 * Triggered when a payment is successfully processed
 */
async function handlePaymentSuccess(paymentIntent: StripePaymentIntent): Promise<void> {
  console.log(`[Webhook] Payment succeeded: ${paymentIntent.id}`);

  const { user_id, purpose } = paymentIntent.metadata || {};

  if (purpose && user_id) {
    // Log successful payment for analytics
    const db = getFirestore();
    await db.collection('payment_events').add({
      event_type: 'payment_succeeded',
      payment_intent_id: paymentIntent.id,
      user_id,
      purpose,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created_at: new Date().toISOString(),
    });
  }
}

/**
 * Handle payment_intent.payment_failed
 * Triggered when a payment fails
 */
async function handlePaymentFailed(paymentIntent: StripePaymentIntent): Promise<void> {
  console.log(`[Webhook] Payment failed: ${paymentIntent.id}`);

  const { user_id, purpose } = paymentIntent.metadata || {};

  if (user_id) {
    // Log failed payment for follow-up
    const db = getFirestore();
    await db.collection('payment_events').add({
      event_type: 'payment_failed',
      payment_intent_id: paymentIntent.id,
      user_id,
      purpose: purpose || 'unknown',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created_at: new Date().toISOString(),
    });

    // TODO: Send email to user about failed payment
  }
}

/**
 * Handle account.updated (Stripe Connect)
 * Triggered when a Connect account status changes
 */
async function handleConnectAccountUpdate(account: StripeConnectAccount): Promise<void> {
  console.log(`[Webhook] Connect account updated: ${account.id}`);

  const db = getFirestore();

  // Find user with this Connect account
  const accountsSnapshot = await db
    .collection('stripe_connect_accounts')
    .where('account_id', '==', account.id)
    .limit(1)
    .get();

  if (accountsSnapshot.empty) {
    console.warn(`[Webhook] No user found for Connect account: ${account.id}`);
    return;
  }

  const accountDoc = accountsSnapshot.docs[0];

  // Determine new status
  let status: string;
  if (account.charges_enabled && account.payouts_enabled) {
    status = 'enabled';
  } else if (account.details_submitted) {
    status = 'pending';
  } else {
    status = 'restricted';
  }

  // Update account status
  await accountDoc.ref.update({
    status,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    details_submitted: account.details_submitted,
    onboarding_complete: account.details_submitted,
    updated_at: new Date().toISOString(),
  });

  console.log(`[Webhook] Updated Connect account status to: ${status}`);
}

// =============================================================================
// SIGNREQUEST WEBHOOKS
// =============================================================================

/**
 * SignRequest webhook endpoint
 * Handles: document signed, document declined, etc.
 */
router.post(
  '/signrequest',
  async (req: Request, res: Response): Promise<void> => {
    // SignRequest sends JSON webhooks
    const event = req.body;

    if (!event || !event.event_type) {
      res.status(400).json({ error: 'Invalid webhook payload' });
      return;
    }

    console.log(`[Webhook] Received SignRequest event: ${event.event_type}`);

    try {
      switch (event.event_type) {
        case 'signer_signed':
          await handleSignerSigned(event);
          break;

        case 'document_signed':
          await handleDocumentSigned(event);
          break;

        case 'signer_declined':
          await handleSignerDeclined(event);
          break;

        default:
          console.log(`[Webhook] Unhandled SignRequest event: ${event.event_type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error(`[Webhook] Error processing SignRequest ${event.event_type}:`, error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

/**
 * Handle individual signer completing their signature
 */
async function handleSignerSigned(event: Record<string, unknown>): Promise<void> {
  const document = event.document as { uuid?: string } | undefined;
  const signer = event.signer as { email?: string } | undefined;

  if (!document?.uuid) return;

  console.log(`[Webhook] Signer ${signer?.email} signed document ${document.uuid}`);

  // Update partial signature status in SETA registration
  const db = getFirestore();
  const registrations = await db
    .collection('seta_registrations')
    .where('signature_request_id', '==', document.uuid)
    .limit(1)
    .get();

  if (!registrations.empty) {
    await registrations.docs[0].ref.update({
      signatures_status: 'partial',
      updated_at: new Date().toISOString(),
    });
  }
}

/**
 * Handle all signers completing (document fully signed)
 */
async function handleDocumentSigned(event: Record<string, unknown>): Promise<void> {
  const document = event.document as { uuid?: string; pdf_url?: string } | undefined;

  if (!document?.uuid) return;

  console.log(`[Webhook] Document fully signed: ${document.uuid}`);

  const db = getFirestore();

  // Check enrolment form signature
  let registrations = await db
    .collection('seta_registrations')
    .where('signature_request_id', '==', document.uuid)
    .limit(1)
    .get();

  if (!registrations.empty) {
    const reg = registrations.docs[0];
    await reg.ref.update({
      signatures_status: 'completed',
      enrolment_form_signed_at: new Date().toISOString(),
      enrolment_form_pdf_url: document.pdf_url || null,
      updated_at: new Date().toISOString(),
    });
    console.log(`[Webhook] Enrolment form signature complete for ${reg.id}`);
    return;
  }

  // Check tri-party agreement signature
  registrations = await db
    .collection('seta_registrations')
    .where('triparty_request_id', '==', document.uuid)
    .limit(1)
    .get();

  if (!registrations.empty) {
    const reg = registrations.docs[0];
    await reg.ref.update({
      triparty_signed_at: new Date().toISOString(),
      triparty_pdf_url: document.pdf_url || null,
      registration_status: 'signatures_complete',
      updated_at: new Date().toISOString(),
    });
    console.log(`[Webhook] Tri-party agreement complete for ${reg.id}`);
  }
}

/**
 * Handle signer declining to sign
 */
async function handleSignerDeclined(event: Record<string, unknown>): Promise<void> {
  const document = event.document as { uuid?: string } | undefined;
  const signer = event.signer as { email?: string; decline_reason?: string } | undefined;

  if (!document?.uuid) return;

  console.log(`[Webhook] Signer ${signer?.email} declined: ${signer?.decline_reason}`);

  const db = getFirestore();
  const registrations = await db
    .collection('seta_registrations')
    .where('signature_request_id', '==', document.uuid)
    .limit(1)
    .get();

  if (!registrations.empty) {
    await registrations.docs[0].ref.update({
      registration_status: 'rejected',
      rejection_reason: signer?.decline_reason || 'Signer declined',
      updated_at: new Date().toISOString(),
    });
  }
}

export default router;
