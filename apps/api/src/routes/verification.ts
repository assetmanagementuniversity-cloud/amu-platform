/**
 * Identity Verification Routes - AMU Platform
 *
 * Privacy-First API Endpoints (Sections 1.3, 10.3)
 *
 * CRITICAL PRIVACY MANDATE:
 * - NO admin endpoints to view user data
 * - Users can ONLY access their OWN data
 * - Verification is fully automated via AI
 * - Disputes resolved through Socratic dialogue
 *
 * "Ubuntu - I am because we are"
 */

import { Router } from 'express';
import {
  saveVerificationAudit,
  saveDisputeContext,
  upgradeTier3,
  setVerificationActionRequired,
  setVerificationPending,
  getActiveDisputeForUser,
  updateDisputeStatus,
  getUserSETAData,
  updateUserSETAData,
  getLatestAuditForUser,
  createSETARegistration,
} from '@amu/database';
import {
  runVerificationAudit,
  type VerificationFormData,
  type OCRResults,
} from '@amu/ai';
import { createApiError } from '../middleware/error-handler';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/verification/submit
 *
 * Submit identity verification for automated AI audit.
 * This triggers the entire verification pipeline:
 * 1. Mark status as pending
 * 2. Run AI audit (document + SETA fields)
 * 3. Either upgrade to Tier 3 OR create dispute for resolution
 */
router.post('/submit', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { formData, ocrResults } = req.body as {
      formData: VerificationFormData;
      ocrResults: OCRResults;
    };

    if (!formData || !ocrResults) {
      throw createApiError('Missing form data or OCR results', 400, 'INVALID_REQUEST');
    }

    // Step 1: Mark verification as pending
    await setVerificationPending(req.userId);

    // Step 2: Run AI verification audit
    const result = await runVerificationAudit(req.userId, formData, ocrResults);

    // Step 3: Save audit result (no PII)
    await saveVerificationAudit(result.auditResult);

    if (result.success) {
      // SUCCESS: Upgrade to Tier 3
      await upgradeTier3(req.userId, result.auditResult.audit_id);

      // Create SETA registration record
      await createSETARegistration({
        user_id: req.userId,
        verification_audit_id: result.auditResult.audit_id,
        popi_consent_date: new Date().toISOString(),
        marketing_consent: formData.popiConsent,  // This comes from the form
        photo_consent: false,  // Default, can be updated
      });

      // TODO: Send SETA confirmation email
      // await sendSETAConfirmationEmail(req.userId);

      res.json({
        success: true,
        data: {
          status: 'verified',
          tier: 3,
          message: 'Your identity has been verified. You are now eligible for SETA registration.',
        },
      });
    } else {
      // FAILURE: Create dispute context for Socratic resolution
      if (result.disputeContext) {
        await saveDisputeContext(result.disputeContext);
        await setVerificationActionRequired(req.userId, result.disputeContext.dispute_id);
      }

      res.json({
        success: false,
        data: {
          status: 'action_required',
          // IMPORTANT: We do NOT send failure details here
          // The AI Facilitator will explain via Socratic dialogue
          message: 'We found some issues that need your attention. Please check your learning chat for guidance.',
          fieldsToReview: result.disputeContext?.fields_needing_attention || [],
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/verification/status
 *
 * Get current verification status for the authenticated user.
 * Returns status and any active dispute (no personal data).
 */
router.get('/status', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const latestAudit = await getLatestAuditForUser(req.userId);
    const activeDispute = await getActiveDisputeForUser(req.userId);

    res.json({
      success: true,
      data: {
        hasSubmitted: !!latestAudit,
        latestResult: latestAudit?.result || null,
        overallConfidence: latestAudit?.overall_confidence || null,
        hasActiveDispute: !!activeDispute,
        disputeStatus: activeDispute?.status || null,
        fieldsNeedingAttention: activeDispute?.fields_needing_attention || [],
        resolutionAttempts: activeDispute?.resolution_attempts || 0,
        maxAttempts: activeDispute?.max_attempts || 3,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/verification/my-data
 *
 * Get the user's own SETA data for editing.
 * Privacy-safe: Users can ONLY access their own data.
 */
router.get('/my-data', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const data = await getUserSETAData(req.userId);

    if (!data) {
      throw createApiError('User data not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/verification/my-data
 *
 * Update the user's own SETA data.
 * Privacy-safe: Users can ONLY update their own data.
 * After update, if there's an active dispute, mark it for re-verification.
 */
router.put('/my-data', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const updates = req.body;

    if (!updates || typeof updates !== 'object') {
      throw createApiError('Invalid update data', 400, 'INVALID_REQUEST');
    }

    // Update the user's data
    await updateUserSETAData(req.userId, updates);

    // Check for active dispute
    const activeDispute = await getActiveDisputeForUser(req.userId);
    if (activeDispute) {
      // Mark dispute as ready for re-verification
      await updateDisputeStatus(activeDispute.dispute_id, 'pending');
    }

    res.json({
      success: true,
      message: 'Your information has been updated. You may need to re-submit for verification.',
      needsResubmission: !!activeDispute,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/verification/resubmit
 *
 * Resubmit verification after correcting issues.
 * Used after Socratic resolution guides the learner.
 */
router.post('/resubmit', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { formData, ocrResults } = req.body as {
      formData: VerificationFormData;
      ocrResults: OCRResults;
    };

    if (!formData || !ocrResults) {
      throw createApiError('Missing form data or OCR results', 400, 'INVALID_REQUEST');
    }

    // Check for active dispute
    const activeDispute = await getActiveDisputeForUser(req.userId);
    if (activeDispute && activeDispute.resolution_attempts >= activeDispute.max_attempts) {
      throw createApiError(
        'Maximum resolution attempts reached. Please contact support.',
        400,
        'MAX_ATTEMPTS_EXCEEDED'
      );
    }

    // Mark as pending
    await setVerificationPending(req.userId);

    // Run AI verification
    const result = await runVerificationAudit(req.userId, formData, ocrResults);

    // Save audit
    await saveVerificationAudit(result.auditResult);

    if (result.success) {
      // SUCCESS: Resolve dispute and upgrade
      if (activeDispute) {
        await updateDisputeStatus(activeDispute.dispute_id, 'resolved', 'learner_correction');
      }

      await upgradeTier3(req.userId, result.auditResult.audit_id);

      await createSETARegistration({
        user_id: req.userId,
        verification_audit_id: result.auditResult.audit_id,
        popi_consent_date: new Date().toISOString(),
        marketing_consent: formData.popiConsent,
        photo_consent: false,
      });

      res.json({
        success: true,
        data: {
          status: 'verified',
          tier: 3,
          message: 'Your identity has been verified successfully!',
        },
      });
    } else {
      // Still failing - update dispute
      if (result.disputeContext) {
        await saveDisputeContext(result.disputeContext);
        await setVerificationActionRequired(req.userId, result.disputeContext.dispute_id);
      }

      res.json({
        success: false,
        data: {
          status: 'action_required',
          message: 'Some issues remain. Check your learning chat for guidance.',
          fieldsToReview: result.disputeContext?.fields_needing_attention || [],
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/verification/dispute-guidance
 *
 * Get AI-generated guidance for resolving the current dispute.
 * Used by the frontend to show resolution hints (no PII exposed).
 */
router.get('/dispute-guidance', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const activeDispute = await getActiveDisputeForUser(req.userId);

    if (!activeDispute) {
      res.json({
        success: true,
        data: {
          hasDispute: false,
        },
      });
      return;
    }

    // Return guidance without any PII
    res.json({
      success: true,
      data: {
        hasDispute: true,
        guidance: activeDispute.resolution_guidance,
        fieldsToReview: activeDispute.fields_needing_attention,
        attemptsRemaining: activeDispute.max_attempts - activeDispute.resolution_attempts,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
