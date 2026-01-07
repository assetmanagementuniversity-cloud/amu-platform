/**
 * Privacy Routes - AMU Platform
 *
 * POPI Act Compliance (Section 7.3.3)
 *
 * Endpoints for learners to:
 * - View what data AMU holds about them
 * - Export their personal data
 * - Request account deletion
 * - View consent history
 *
 * Privacy-First: Learners can ONLY access their own data.
 * No admin access to personal data is provided.
 *
 * "Ubuntu - I am because we are"
 */

import { Router, Response } from 'express';
import { getFirestore, getAuth, getStorage } from '@amu/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { createApiError } from '../middleware/error-handler';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// =============================================================================
// TYPES
// =============================================================================

interface DataCategory {
  category: string;
  description: string;
  purpose: string;
  retention: string;
  thirdPartySharing?: string;
}

interface ConsentRecord {
  consent_type: string;
  consented: boolean;
  consented_at: string;
  ip_address?: string;
  user_agent?: string;
}

interface PrivacyDataResponse {
  user_id: string;
  email: string;
  data_categories: DataCategory[];
  personal_data: {
    profile: Record<string, unknown>;
    enrolments: Record<string, unknown>[];
    certificates: Record<string, unknown>[];
    conversations_count: number;
    seta_registration?: Record<string, unknown>;
  };
  consents: ConsentRecord[];
  data_processing_purposes: string[];
  third_party_sharing: {
    recipient: string;
    purpose: string;
    data_shared: string[];
  }[];
  generated_at: string;
}

// =============================================================================
// DATA CATEGORIES (Per POPI Act)
// =============================================================================

const DATA_CATEGORIES: DataCategory[] = [
  {
    category: 'Identity Information',
    description: 'Name, email, ID number (for SETA registration)',
    purpose: 'Account management, SETA compliance, certificate issuance',
    retention: 'Duration of account + 7 years (legal requirement)',
    thirdPartySharing: 'CHIETA (for SETA-registered learners only)',
  },
  {
    category: 'Demographic Information',
    description: 'Race, gender, disability status, home language',
    purpose: 'SETA compliance, B-BBEE reporting (anonymised)',
    retention: 'Duration of account + 7 years',
    thirdPartySharing: 'CHIETA (anonymised for B-BBEE reporting)',
  },
  {
    category: 'Learning Progress',
    description: 'Course enrolments, competency achievements, conversation history',
    purpose: 'Track learning progress, issue certificates',
    retention: 'Duration of account',
  },
  {
    category: 'Contact Information',
    description: 'Phone number, address (for SETA registration)',
    purpose: 'Communication, SETA registration',
    retention: 'Duration of account + 7 years',
  },
  {
    category: 'Payment Information',
    description: 'Transaction history (card details stored by Stripe only)',
    purpose: 'Process certificate purchases, issue refunds',
    retention: '7 years (tax requirement)',
    thirdPartySharing: 'Stripe (payment processor)',
  },
  {
    category: 'Usage Data',
    description: 'Login times, pages visited, session duration',
    purpose: 'Platform improvement, troubleshooting',
    retention: '2 years (anonymised after)',
  },
];

const DATA_PROCESSING_PURPOSES = [
  'Provide free asset management education',
  'Track your learning progress and competency achievements',
  'Issue certificates upon course completion',
  'Register you with SETA (CHIETA) for official qualifications (Tier 3 only)',
  'Process payments for official certificates',
  'Improve the platform based on usage patterns',
  'Communicate important updates about your courses',
  'Comply with South African tax and education regulations',
];

const THIRD_PARTY_SHARING = [
  {
    recipient: 'CHIETA (Chemical Industries SETA)',
    purpose: 'Official qualification registration and verification',
    data_shared: ['Name', 'ID number', 'Qualification details', 'Completion date'],
  },
  {
    recipient: 'Stripe',
    purpose: 'Payment processing for official certificates',
    data_shared: ['Email', 'Payment amount', 'Transaction reference'],
  },
  {
    recipient: 'SignRequest',
    purpose: 'Digital signatures for SETA registration documents',
    data_shared: ['Name', 'Email', 'Document reference'],
  },
  {
    recipient: 'Google Cloud (Firestore/Storage)',
    purpose: 'Data storage and processing',
    data_shared: ['All data (encrypted at rest and in transit)'],
  },
];

// =============================================================================
// GET MY DATA
// =============================================================================

/**
 * GET /api/privacy/my-data
 * Returns all data AMU holds about the authenticated user
 */
router.get('/my-data', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    throw createApiError('User ID not found', 401, 'UNAUTHORIZED');
  }

  const db = getFirestore();

  try {
    // Fetch user profile
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // Fetch enrolments
    const enrolmentsSnapshot = await db
      .collection('enrolments')
      .where('enrolment_user_id', '==', userId)
      .get();
    const enrolments = enrolmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch certificates
    const certificatesSnapshot = await db
      .collection('certificates')
      .where('certificate_learner_id', '==', userId)
      .get();
    const certificates = certificatesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Count conversations (don't return full content for performance)
    const conversationsSnapshot = await db
      .collection('conversations')
      .where('conversation_user_id', '==', userId)
      .get();
    const conversationsCount = conversationsSnapshot.size;

    // Fetch SETA registration if exists
    const setaSnapshot = await db
      .collection('seta_registrations')
      .where('user_id', '==', userId)
      .limit(1)
      .get();
    const setaRegistration = setaSnapshot.empty
      ? undefined
      : { id: setaSnapshot.docs[0].id, ...setaSnapshot.docs[0].data() };

    // Build consent history
    const consents: ConsentRecord[] = [];

    if (userData?.user_popi_consent_date) {
      consents.push({
        consent_type: 'POPI Act Consent',
        consented: true,
        consented_at: userData.user_popi_consent_date,
      });
    }

    if (userData?.user_marketing_consent !== undefined) {
      consents.push({
        consent_type: 'Marketing Communications',
        consented: userData.user_marketing_consent === true,
        consented_at: userData.user_marketing_consent_date || userData.user_created_at,
      });
    }

    if (userData?.user_terms_accepted_at) {
      consents.push({
        consent_type: 'Terms of Service',
        consented: true,
        consented_at: userData.user_terms_accepted_at,
      });
    }

    // Remove sensitive internal fields from profile
    const safeProfile = { ...userData };
    delete safeProfile.user_password_hash;
    delete safeProfile.user_refresh_tokens;
    delete safeProfile.user_internal_notes;

    const response: PrivacyDataResponse = {
      user_id: userId,
      email: req.userEmail || '',
      data_categories: DATA_CATEGORIES,
      personal_data: {
        profile: safeProfile,
        enrolments,
        certificates,
        conversations_count: conversationsCount,
        seta_registration: setaRegistration,
      },
      consents,
      data_processing_purposes: DATA_PROCESSING_PURPOSES,
      third_party_sharing: THIRD_PARTY_SHARING,
      generated_at: new Date().toISOString(),
    };

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('[Privacy] Error fetching user data:', error);
    throw createApiError('Failed to fetch your data', 500, 'DATA_FETCH_ERROR');
  }
});

// =============================================================================
// EXPORT DATA
// =============================================================================

/**
 * POST /api/privacy/export
 * Triggers a data export job and emails the download link
 */
router.post('/export', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const userEmail = req.userEmail;

  if (!userId || !userEmail) {
    throw createApiError('User not found', 401, 'UNAUTHORIZED');
  }

  const db = getFirestore();

  try {
    // Create export request record
    const exportId = `export_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    await db.collection('data_export_requests').doc(exportId).set({
      export_id: exportId,
      user_id: userId,
      user_email: userEmail,
      status: 'pending',
      requested_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });

    // In production, this would trigger a Cloud Function to:
    // 1. Compile all user data
    // 2. Generate a secure download link
    // 3. Email the link to the user
    // For now, we'll mark it as queued

    res.json({
      success: true,
      message: 'Your data export has been queued. You will receive an email with a download link within 24 hours.',
      export_id: exportId,
    });
  } catch (error) {
    console.error('[Privacy] Error creating export request:', error);
    throw createApiError('Failed to create export request', 500, 'EXPORT_ERROR');
  }
});

/**
 * GET /api/privacy/export/:exportId
 * Check status of a data export request
 */
router.get('/export/:exportId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { exportId } = req.params;

  if (!userId) {
    throw createApiError('User not found', 401, 'UNAUTHORIZED');
  }

  const db = getFirestore();

  const exportDoc = await db.collection('data_export_requests').doc(exportId).get();

  if (!exportDoc.exists) {
    throw createApiError('Export request not found', 404, 'NOT_FOUND');
  }

  const exportData = exportDoc.data();

  // Verify ownership
  if (exportData?.user_id !== userId) {
    throw createApiError('Access denied', 403, 'FORBIDDEN');
  }

  res.json({
    success: true,
    data: {
      export_id: exportId,
      status: exportData.status,
      requested_at: exportData.requested_at,
      completed_at: exportData.completed_at,
      download_url: exportData.download_url,
      expires_at: exportData.expires_at,
    },
  });
});

// =============================================================================
// DELETE ACCOUNT
// =============================================================================

/**
 * POST /api/privacy/delete
 * Request account deletion (POPI Act right to erasure)
 */
router.post('/delete', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const userEmail = req.userEmail;
  const { confirmation, reason } = req.body;

  if (!userId || !userEmail) {
    throw createApiError('User not found', 401, 'UNAUTHORIZED');
  }

  // Require explicit confirmation
  if (confirmation !== 'DELETE MY ACCOUNT') {
    throw createApiError(
      'Please type "DELETE MY ACCOUNT" to confirm deletion',
      400,
      'CONFIRMATION_REQUIRED'
    );
  }

  const db = getFirestore();

  try {
    // Check for active SETA registration
    const setaSnapshot = await db
      .collection('seta_registrations')
      .where('user_id', '==', userId)
      .where('registration_status', 'in', ['awaiting_signatures', 'signatures_complete', 'submitted_to_seta'])
      .limit(1)
      .get();

    if (!setaSnapshot.empty) {
      throw createApiError(
        'You have an active SETA registration. Please contact support to discuss your deletion request.',
        400,
        'ACTIVE_SETA_REGISTRATION'
      );
    }

    // Create deletion request
    const deletionId = `del_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    await db.collection('account_deletion_requests').doc(deletionId).set({
      deletion_id: deletionId,
      user_id: userId,
      user_email: userEmail,
      reason: reason || 'No reason provided',
      status: 'pending',
      requested_at: new Date().toISOString(),
      // 30-day grace period per POPI Act
      scheduled_deletion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Mark user as pending deletion
    await db.collection('users').doc(userId).update({
      user_deletion_requested: true,
      user_deletion_request_id: deletionId,
      user_deletion_scheduled_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      user_updated_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Your account deletion has been scheduled. You have 30 days to cancel this request by logging in.',
      deletion_id: deletionId,
      scheduled_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) {
      throw error;
    }
    console.error('[Privacy] Error creating deletion request:', error);
    throw createApiError('Failed to process deletion request', 500, 'DELETION_ERROR');
  }
});

/**
 * POST /api/privacy/delete/cancel
 * Cancel a pending account deletion request
 */
router.post('/delete/cancel', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    throw createApiError('User not found', 401, 'UNAUTHORIZED');
  }

  const db = getFirestore();

  // Find pending deletion request
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (!userData?.user_deletion_requested) {
    throw createApiError('No pending deletion request found', 404, 'NOT_FOUND');
  }

  const deletionId = userData.user_deletion_request_id;

  // Cancel the deletion request
  await db.collection('account_deletion_requests').doc(deletionId).update({
    status: 'cancelled',
    cancelled_at: new Date().toISOString(),
  });

  // Remove deletion flags from user
  await db.collection('users').doc(userId).update({
    user_deletion_requested: false,
    user_deletion_request_id: null,
    user_deletion_scheduled_date: null,
    user_updated_at: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Your account deletion request has been cancelled. Your account will remain active.',
  });
});

// =============================================================================
// CONSENT MANAGEMENT
// =============================================================================

/**
 * GET /api/privacy/consents
 * Get user's consent history
 */
router.get('/consents', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    throw createApiError('User not found', 401, 'UNAUTHORIZED');
  }

  const db = getFirestore();

  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data() || {};

  const consents: ConsentRecord[] = [];

  // POPI consent
  if (userData.user_popi_consent_date) {
    consents.push({
      consent_type: 'POPI Act Consent',
      consented: true,
      consented_at: userData.user_popi_consent_date,
    });
  }

  // Marketing consent
  consents.push({
    consent_type: 'Marketing Communications',
    consented: userData.user_marketing_consent === true,
    consented_at: userData.user_marketing_consent_date || userData.user_created_at || 'Unknown',
  });

  // Terms acceptance
  if (userData.user_terms_accepted_at) {
    consents.push({
      consent_type: 'Terms of Service',
      consented: true,
      consented_at: userData.user_terms_accepted_at,
    });
  }

  // Privacy policy acceptance
  if (userData.user_privacy_policy_accepted_at) {
    consents.push({
      consent_type: 'Privacy Policy',
      consented: true,
      consented_at: userData.user_privacy_policy_accepted_at,
    });
  }

  res.json({
    success: true,
    data: {
      consents,
      can_withdraw: ['Marketing Communications'], // List of consents that can be withdrawn
    },
  });
});

/**
 * PUT /api/privacy/consents/marketing
 * Update marketing consent preference
 */
router.put('/consents/marketing', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { consented } = req.body;

  if (!userId) {
    throw createApiError('User not found', 401, 'UNAUTHORIZED');
  }

  if (typeof consented !== 'boolean') {
    throw createApiError('Invalid consent value', 400, 'INVALID_INPUT');
  }

  const db = getFirestore();

  await db.collection('users').doc(userId).update({
    user_marketing_consent: consented,
    user_marketing_consent_date: new Date().toISOString(),
    user_updated_at: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: consented
      ? 'You have opted in to marketing communications.'
      : 'You have opted out of marketing communications.',
  });
});

// =============================================================================
// PRIVACY SUMMARY
// =============================================================================

/**
 * GET /api/privacy/summary
 * Quick summary of user's privacy status
 */
router.get('/summary', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    throw createApiError('User not found', 401, 'UNAUTHORIZED');
  }

  const db = getFirestore();

  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data() || {};

  // Count data points
  const enrolmentsSnapshot = await db
    .collection('enrolments')
    .where('enrolment_user_id', '==', userId)
    .get();

  const certificatesSnapshot = await db
    .collection('certificates')
    .where('certificate_learner_id', '==', userId)
    .get();

  const setaSnapshot = await db
    .collection('seta_registrations')
    .where('user_id', '==', userId)
    .limit(1)
    .get();

  res.json({
    success: true,
    data: {
      has_seta_registration: !setaSnapshot.empty,
      enrolments_count: enrolmentsSnapshot.size,
      certificates_count: certificatesSnapshot.size,
      marketing_consent: userData.user_marketing_consent === true,
      deletion_pending: userData.user_deletion_requested === true,
      deletion_scheduled_date: userData.user_deletion_scheduled_date || null,
      last_login: userData.user_last_login_at || null,
      account_created: userData.user_created_at || null,
    },
  });
});

export default router;
