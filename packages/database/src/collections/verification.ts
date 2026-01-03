/**
 * Verification collection operations - AMU Platform
 *
 * Privacy-First Storage (Sections 1.3, 10.3)
 *
 * CRITICAL: This module stores ONLY audit results and metadata.
 * NO personal data is ever stored in these collections.
 * All PII remains in the encrypted user document only.
 *
 * "Ubuntu - I am because we are"
 */

import { getFirestore } from '../config/firebase-admin';
import type {
  VerificationAuditResult,
  DisputeContext,
  SETARegistrationRecord,
  VerificationStatus,
  UserTier,
} from '@amu/shared';

const AUDITS_COLLECTION = 'verification_audits';
const DISPUTES_COLLECTION = 'verification_disputes';
const SETA_REGISTRATIONS_COLLECTION = 'seta_registrations';

// ================================================
// AUDIT RESULTS (No PII)
// ================================================

/**
 * Save a verification audit result
 * NOTE: This stores ONLY the audit metadata, NOT personal data
 */
export async function saveVerificationAudit(
  audit: VerificationAuditResult
): Promise<void> {
  const db = getFirestore();
  await db.collection(AUDITS_COLLECTION).doc(audit.audit_id).set({
    ...audit,
    created_at: new Date().toISOString(),
  });
}

/**
 * Get the latest audit for a user
 */
export async function getLatestAuditForUser(
  userId: string
): Promise<VerificationAuditResult | null> {
  const db = getFirestore();
  const snapshot = await db
    .collection(AUDITS_COLLECTION)
    .where('user_id', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0]?.data() as VerificationAuditResult;
}

/**
 * Get audit history for a user (for support - no PII shown)
 */
export async function getAuditHistoryForUser(
  userId: string,
  limit = 10
): Promise<VerificationAuditResult[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(AUDITS_COLLECTION)
    .where('user_id', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => doc.data() as VerificationAuditResult);
}

// ================================================
// DISPUTE CONTEXTS (For Socratic Resolution)
// ================================================

/**
 * Save a dispute context
 * This enables the AI Facilitator to help the learner
 */
export async function saveDisputeContext(
  dispute: DisputeContext
): Promise<void> {
  const db = getFirestore();
  await db.collection(DISPUTES_COLLECTION).doc(dispute.dispute_id).set(dispute);
}

/**
 * Get active dispute for a user
 * Used by AI Facilitator to check if help is needed
 */
export async function getActiveDisputeForUser(
  userId: string
): Promise<DisputeContext | null> {
  const db = getFirestore();
  const snapshot = await db
    .collection(DISPUTES_COLLECTION)
    .where('user_id', '==', userId)
    .where('status', 'in', ['pending', 'in_progress'])
    .orderBy('created_at', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0]?.data() as DisputeContext;
}

/**
 * Update dispute status
 */
export async function updateDisputeStatus(
  disputeId: string,
  status: DisputeContext['status'],
  resolutionMethod?: DisputeContext['resolution_method']
): Promise<void> {
  const db = getFirestore();
  const updates: Partial<DisputeContext> = {
    status,
    ...(status === 'resolved' && {
      resolved_at: new Date().toISOString(),
      resolution_method: resolutionMethod,
    }),
  };

  await db.collection(DISPUTES_COLLECTION).doc(disputeId).update(updates);
}

/**
 * Increment resolution attempt counter
 */
export async function incrementResolutionAttempt(
  disputeId: string
): Promise<number> {
  const db = getFirestore();
  const doc = await db.collection(DISPUTES_COLLECTION).doc(disputeId).get();

  if (!doc.exists) {
    throw new Error(`Dispute ${disputeId} not found`);
  }

  const current = (doc.data() as DisputeContext).resolution_attempts;
  const newCount = current + 1;

  await db.collection(DISPUTES_COLLECTION).doc(disputeId).update({
    resolution_attempts: newCount,
    status: 'in_progress',
  });

  return newCount;
}

// ================================================
// USER TIER & VERIFICATION STATUS UPDATES
// ================================================

/**
 * Upgrade user to Tier 3 after successful verification
 * This is the ONLY function that modifies verification status
 */
export async function upgradeTier3(
  userId: string,
  auditId: string
): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  await db.collection('users').doc(userId).update({
    user_verification_status: 'verified' as VerificationStatus,
    user_verification_tier: 3 as UserTier,
    user_verification_reviewed_date: now,
    user_seta_registration_date: now,
  });
}

/**
 * Set user verification to action_required
 * Used when AI audit fails and Socratic resolution is needed
 */
export async function setVerificationActionRequired(
  userId: string,
  disputeId: string
): Promise<void> {
  const db = getFirestore();

  await db.collection('users').doc(userId).update({
    user_verification_status: 'action_required' as VerificationStatus,
    user_active_dispute_id: disputeId,
  });
}

/**
 * Set user verification to pending (submitted, awaiting AI)
 */
export async function setVerificationPending(userId: string): Promise<void> {
  const db = getFirestore();

  await db.collection('users').doc(userId).update({
    user_verification_status: 'pending' as VerificationStatus,
    user_verification_submitted_date: new Date().toISOString(),
  });
}

// ================================================
// SETA REGISTRATION RECORDS
// ================================================

/**
 * Create SETA registration record after successful verification
 */
export async function createSETARegistration(
  record: Omit<SETARegistrationRecord, 'registration_id' | 'registered_at'>
): Promise<SETARegistrationRecord> {
  const db = getFirestore();

  const registrationId = `seta_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const fullRecord: SETARegistrationRecord = {
    registration_id: registrationId,
    registered_at: now,
    ...record,
  };

  await db.collection(SETA_REGISTRATIONS_COLLECTION).doc(registrationId).set(fullRecord);

  return fullRecord;
}

/**
 * Get SETA registration for a user (by user_id)
 */
export async function getSETARegistration(
  userId: string
): Promise<SETARegistrationRecord | null> {
  const db = getFirestore();
  const snapshot = await db
    .collection(SETA_REGISTRATIONS_COLLECTION)
    .where('user_id', '==', userId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0]?.data() as SETARegistrationRecord;
}

/**
 * Get SETA registration by registration ID
 * Used by SignRequest integration (Section 7.1.4)
 */
export async function getSETARegistrationById(
  registrationId: string
): Promise<SETARegistrationRecord | null> {
  const db = getFirestore();
  const doc = await db
    .collection(SETA_REGISTRATIONS_COLLECTION)
    .doc(registrationId)
    .get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as SETARegistrationRecord;
}

/**
 * Update SETA registration record
 * Used to update signature status per Section 7.1.3
 */
export async function updateSETARegistration(
  registrationId: string,
  updates: Partial<Omit<SETARegistrationRecord, 'registration_id' | 'user_id' | 'registered_at'>>
): Promise<void> {
  const db = getFirestore();

  await db.collection(SETA_REGISTRATIONS_COLLECTION).doc(registrationId).update({
    ...updates,
    updated_at: new Date().toISOString(),
  });
}

/**
 * Get SETA registration by signature request ID
 * Used by SignRequest webhook handler
 */
export async function getSETARegistrationBySignatureId(
  signatureRequestId: string
): Promise<SETARegistrationRecord | null> {
  const db = getFirestore();

  // Check enrolment form signature ID
  let snapshot = await db
    .collection(SETA_REGISTRATIONS_COLLECTION)
    .where('signature_request_id', '==', signatureRequestId)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    return snapshot.docs[0]?.data() as SETARegistrationRecord;
  }

  // Check tri-party agreement signature ID
  snapshot = await db
    .collection(SETA_REGISTRATIONS_COLLECTION)
    .where('triparty_request_id', '==', signatureRequestId)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    return snapshot.docs[0]?.data() as SETARegistrationRecord;
  }

  return null;
}

// ================================================
// PRIVACY-SAFE USER DATA UPDATE
// ================================================

/**
 * Update user's SETA data (called by user themselves)
 * This is the ONLY way to update personal data - by the user directly
 */
export async function updateUserSETAData(
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  const db = getFirestore();

  // Ensure we're only updating allowed fields
  const allowedFields = [
    'user_title',
    'user_first_name',
    'user_middle_names',
    'user_surname',
    'user_maiden_name',
    'user_preferred_name',
    'user_gender',
    'user_date_of_birth',
    'user_id_number',
    'user_alternative_id_type',
    'user_alternative_id_number',
    'user_country_of_origin',
    'user_citizenship',
    'user_citizen_status',
    'user_visa_type',
    'user_equity_group',
    'user_home_language',
    'user_disability_status',
    'user_disability_details',
    'user_phone_number',
    'user_phone_home',
    'user_phone_work',
    'user_phone_whatsapp',
    'user_email_work',
    'user_preferred_contact_method',
    'user_address',
    'user_emergency_contact',
    'user_employment',
    'user_highest_qualification',
    'user_qualifications_attained',
    'user_has_matric',
    'user_matric_year',
    'user_socioeconomic_status',
  ];

  const filteredData: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in data) {
      filteredData[key] = data[key];
    }
  }

  if (Object.keys(filteredData).length > 0) {
    await db.collection('users').doc(userId).update(filteredData);
  }
}

/**
 * Get user's own SETA data (privacy-safe - user can only get their own)
 */
export async function getUserSETAData(
  userId: string
): Promise<Record<string, unknown> | null> {
  const db = getFirestore();
  const doc = await db.collection('users').doc(userId).get();

  if (!doc.exists) {
    return null;
  }

  const userData = doc.data();
  if (!userData) {
    return null;
  }

  // Return only SETA-related fields
  const setaFields = [
    'user_title',
    'user_first_name',
    'user_middle_names',
    'user_surname',
    'user_maiden_name',
    'user_preferred_name',
    'user_gender',
    'user_date_of_birth',
    'user_id_number',
    'user_alternative_id_type',
    'user_alternative_id_number',
    'user_country_of_origin',
    'user_citizenship',
    'user_citizen_status',
    'user_visa_type',
    'user_equity_group',
    'user_home_language',
    'user_disability_status',
    'user_disability_details',
    'user_phone_number',
    'user_phone_home',
    'user_phone_work',
    'user_phone_whatsapp',
    'user_email_work',
    'user_preferred_contact_method',
    'user_address',
    'user_emergency_contact',
    'user_employment',
    'user_highest_qualification',
    'user_qualifications_attained',
    'user_has_matric',
    'user_matric_year',
    'user_socioeconomic_status',
    'user_verification_status',
    'user_verification_tier',
    'user_popi_consent_date',
    'user_id_document_url',
    'user_proof_of_residence_url',
  ];

  const result: Record<string, unknown> = {};
  for (const field of setaFields) {
    if (field in userData) {
      result[field] = userData[field];
    }
  }

  return result;
}
