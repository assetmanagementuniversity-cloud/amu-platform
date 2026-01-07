/**
 * Checkout Routes - AMU Platform
 *
 * Stripe Checkout integration for official certificate purchases.
 * Per Section 3.4.2: Certificate pricing R500-R8,890 depending on qualification.
 *
 * Security:
 * - All routes require authentication
 * - Session metadata ties purchases to learners
 * - Webhook handles fulfilment (see webhooks.ts)
 *
 * "Ubuntu - I am because we are"
 */

import { Router, Response } from 'express';
import Stripe from 'stripe';
import { getFirestore } from '@amu/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { createApiError } from '../middleware/error-handler';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// All checkout routes require authentication
router.use(requireAuth);

// =============================================================================
// TYPES
// =============================================================================

interface CertificatePricing {
  courseId: string;
  courseTitle: string;
  basePrice: number; // in cents
  currency: string;
}

// =============================================================================
// PRICING CONFIGURATION
// =============================================================================

// Certificate prices per course (in cents, ZAR)
// Per Section 3.4.2: R500 for unit standards, up to R8,890 for full qualifications
const CERTIFICATE_PRICES: Record<string, CertificatePricing> = {
  'gfmam-311': {
    courseId: 'gfmam-311',
    courseTitle: 'GFMAM 311: Organisational Context',
    basePrice: 50000, // R500
    currency: 'zar',
  },
  'gfmam-312': {
    courseId: 'gfmam-312',
    courseTitle: 'GFMAM 312: Leadership and Team Dynamics',
    basePrice: 50000, // R500
    currency: 'zar',
  },
  'gfmam-full': {
    courseId: 'gfmam-full',
    courseTitle: 'GFMAM Full Qualification (NQF Level 5)',
    basePrice: 889000, // R8,890
    currency: 'zar',
  },
};

// Referral discount percentage
const REFERRAL_DISCOUNT_PERCENT = 10;

// =============================================================================
// CREATE CHECKOUT SESSION
// =============================================================================

/**
 * POST /api/checkout/certificate-session
 * Create a Stripe Checkout session for certificate purchase
 */
router.post(
  '/certificate-session',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;
    const userEmail = req.userEmail;

    if (!userId || !userEmail) {
      throw createApiError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const { enrolmentId, courseId, referralCode } = req.body;

    if (!enrolmentId || !courseId) {
      throw createApiError(
        'enrolmentId and courseId are required',
        400,
        'MISSING_FIELDS'
      );
    }

    const db = getFirestore();

    try {
      // Verify enrolment exists and belongs to user
      const enrolmentDoc = await db.collection('enrolments').doc(enrolmentId).get();

      if (!enrolmentDoc.exists) {
        throw createApiError('Enrolment not found', 404, 'NOT_FOUND');
      }

      const enrolmentData = enrolmentDoc.data();

      if (enrolmentData?.enrolment_user_id !== userId) {
        throw createApiError('Enrolment does not belong to user', 403, 'FORBIDDEN');
      }

      // Check if already purchased
      if (enrolmentData?.enrolment_official_certificate_purchased) {
        throw createApiError(
          'Official certificate already purchased for this enrolment',
          400,
          'ALREADY_PURCHASED'
        );
      }

      // Get pricing
      const pricing = CERTIFICATE_PRICES[courseId];
      if (!pricing) {
        throw createApiError('Invalid course ID', 400, 'INVALID_COURSE');
      }

      // Calculate price with potential referral discount
      let finalPrice = pricing.basePrice;
      let discountApplied = false;

      if (referralCode) {
        // Validate referral code
        const referralSnapshot = await db
          .collection('referrals')
          .where('referral_code', '==', referralCode)
          .where('referral_status', '==', 'active')
          .limit(1)
          .get();

        if (!referralSnapshot.empty) {
          // Apply 10% discount
          finalPrice = Math.round(pricing.basePrice * (1 - REFERRAL_DISCOUNT_PERCENT / 100));
          discountApplied = true;
        }
      }

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: pricing.currency,
              product_data: {
                name: `Official Certificate: ${pricing.courseTitle}`,
                description: 'SETA-registered official certificate with no watermark',
                metadata: {
                  course_id: courseId,
                  enrolment_id: enrolmentId,
                },
              },
              unit_amount: finalPrice,
            },
            quantity: 1,
          },
        ],
        metadata: {
          user_id: userId,
          enrolment_id: enrolmentId,
          certificate_type: 'official',
          course_id: courseId,
          course_title: pricing.courseTitle,
          referral_code: referralCode || '',
          discount_applied: discountApplied ? 'true' : 'false',
        },
        success_url: `${process.env.FRONTEND_URL}/certificates/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/certificates/purchase?cancelled=true`,
        payment_intent_data: {
          metadata: {
            user_id: userId,
            purpose: 'official_certificate',
            enrolment_id: enrolmentId,
          },
        },
      });

      // Log checkout initiation for analytics
      await db.collection('checkout_sessions').doc(session.id).set({
        session_id: session.id,
        user_id: userId,
        enrolment_id: enrolmentId,
        course_id: courseId,
        amount: finalPrice,
        currency: pricing.currency,
        discount_applied: discountApplied,
        referral_code: referralCode || null,
        status: 'created',
        created_at: new Date().toISOString(),
      });

      res.json({
        success: true,
        sessionId: session.id,
        url: session.url,
        amount: finalPrice,
        currency: pricing.currency,
        discountApplied,
      });
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode) {
        throw error;
      }
      console.error('[Checkout] Error creating session:', error);
      throw createApiError('Failed to create checkout session', 500, 'CHECKOUT_ERROR');
    }
  }
);

// =============================================================================
// GET SESSION STATUS
// =============================================================================

/**
 * GET /api/checkout/session/:sessionId
 * Get status of a checkout session
 */
router.get(
  '/session/:sessionId',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;
    const { sessionId } = req.params;

    if (!userId) {
      throw createApiError('Authentication required', 401, 'UNAUTHORIZED');
    }

    try {
      // First check our database
      const db = getFirestore();
      const sessionDoc = await db.collection('checkout_sessions').doc(sessionId).get();

      if (!sessionDoc.exists) {
        throw createApiError('Session not found', 404, 'NOT_FOUND');
      }

      const sessionData = sessionDoc.data();

      // Verify ownership
      if (sessionData?.user_id !== userId) {
        throw createApiError('Session does not belong to user', 403, 'FORBIDDEN');
      }

      // Get latest status from Stripe
      const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

      // Update our record if status changed
      if (sessionData?.status !== stripeSession.status) {
        await sessionDoc.ref.update({
          status: stripeSession.status,
          payment_status: stripeSession.payment_status,
          updated_at: new Date().toISOString(),
        });
      }

      res.json({
        success: true,
        session: {
          id: stripeSession.id,
          status: stripeSession.status,
          payment_status: stripeSession.payment_status,
          amount_total: stripeSession.amount_total,
          currency: stripeSession.currency,
          customer_email: stripeSession.customer_email,
          enrolment_id: sessionData?.enrolment_id,
          course_id: sessionData?.course_id,
        },
      });
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode) {
        throw error;
      }
      console.error('[Checkout] Error fetching session:', error);
      throw createApiError('Failed to fetch session', 500, 'SESSION_ERROR');
    }
  }
);

// =============================================================================
// GET PRICING
// =============================================================================

/**
 * GET /api/checkout/pricing/:courseId
 * Get certificate pricing for a course
 */
router.get(
  '/pricing/:courseId',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { courseId } = req.params;
    const { referralCode } = req.query;

    const pricing = CERTIFICATE_PRICES[courseId];

    if (!pricing) {
      throw createApiError('Course not found', 404, 'NOT_FOUND');
    }

    let finalPrice = pricing.basePrice;
    let discountAvailable = false;

    // Check if referral code is valid
    if (referralCode) {
      const db = getFirestore();
      const referralSnapshot = await db
        .collection('referrals')
        .where('referral_code', '==', referralCode)
        .where('referral_status', '==', 'active')
        .limit(1)
        .get();

      if (!referralSnapshot.empty) {
        finalPrice = Math.round(pricing.basePrice * (1 - REFERRAL_DISCOUNT_PERCENT / 100));
        discountAvailable = true;
      }
    }

    res.json({
      success: true,
      pricing: {
        courseId: pricing.courseId,
        courseTitle: pricing.courseTitle,
        basePrice: pricing.basePrice,
        finalPrice,
        currency: pricing.currency,
        discountPercent: discountAvailable ? REFERRAL_DISCOUNT_PERCENT : 0,
        discountAvailable,
      },
    });
  }
);

// =============================================================================
// GET USER'S PURCHASE HISTORY
// =============================================================================

/**
 * GET /api/checkout/history
 * Get user's certificate purchase history
 */
router.get(
  '/history',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      throw createApiError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const db = getFirestore();

    const purchasesSnapshot = await db
      .collection('certificate_purchases')
      .where('user_id', '==', userId)
      .orderBy('purchased_at', 'desc')
      .limit(50)
      .get();

    const purchases = purchasesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      purchases,
    });
  }
);

export default router;
