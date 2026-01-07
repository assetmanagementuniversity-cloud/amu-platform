'use server';

/**
 * Identity Verification Service - AMU Platform
 *
 * Implements the Learner Identity Intake system (Section 5.4, 10.3):
 * - Secure document upload to Cloud Storage
 * - SA ID number validation
 * - Verification status tracking
 *
 * POPI Compliance (Section 26.4):
 * - All identity documents are stored securely in Firebase Storage
 * - Access restricted to user and authorized administrators
 * - Explicit consent required before data processing
 * - Data used only for SETA registration purposes
 *
 * "Ubuntu - I am because we are"
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { generateId } from '@amu/shared';
import type {
  VerificationStatus,
  DocumentType,
  VerificationSubmissionInput,
  VerificationRecord,
  UploadDocumentResult,
  SubmitVerificationResult,
  GetVerificationStatusResult,
  SAIDValidation,
} from './types';

// ============================================
// SA ID Validation (Section 10.3)
// ============================================

/**
 * Validate South African ID number
 * SA ID format: YYMMDD SSSS C A Z
 * - YYMMDD: Date of birth
 * - SSSS: Gender (0000-4999 female, 5000-9999 male)
 * - C: Citizenship (0 = SA citizen, 1 = permanent resident)
 * - A: Usually 8 (was used for race classification, now always 8)
 * - Z: Check digit (Luhn algorithm)
 */
export async function validateSAID(idNumber: string): SAIDValidation {
  // Remove spaces and validate length
  const cleanId = idNumber.replace(/\s/g, '');

  if (cleanId.length !== 13) {
    return { valid: false, error: 'ID number must be exactly 13 digits' };
  }

  if (!/^\d{13}$/.test(cleanId)) {
    return { valid: false, error: 'ID number must contain only digits' };
  }

  // Extract components
  const year = parseInt(cleanId.substring(0, 2), 10);
  const month = parseInt(cleanId.substring(2, 4), 10);
  const day = parseInt(cleanId.substring(4, 6), 10);
  const genderDigits = parseInt(cleanId.substring(6, 10), 10);
  const citizenshipDigit = parseInt(cleanId.substring(10, 11), 10);
  const checkDigit = parseInt(cleanId.substring(12, 13), 10);

  // Validate month (1-12)
  if (month < 1 || month > 12) {
    return { valid: false, error: 'Invalid month in ID number' };
  }

  // Validate day (1-31, simplified check)
  if (day < 1 || day > 31) {
    return { valid: false, error: 'Invalid day in ID number' };
  }

  // Validate citizenship (0 or 1)
  if (citizenshipDigit !== 0 && citizenshipDigit !== 1) {
    return { valid: false, error: 'Invalid citizenship digit' };
  }

  // Luhn algorithm validation
  if (!validateLuhn(cleanId)) {
    return { valid: false, error: 'Invalid ID number (checksum failed)' };
  }

  // Determine full year (assume 1900s if > 22, else 2000s)
  const currentYear = new Date().getFullYear() % 100;
  const fullYear = year > currentYear ? 1900 + year : 2000 + year;

  // Format date of birth
  const dob = `${fullYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  return {
    valid: true,
    date_of_birth: dob,
    gender: genderDigits < 5000 ? 'female' : 'male',
    citizenship: citizenshipDigit === 0 ? 'citizen' : 'permanent_resident',
  };
}

/**
 * Luhn algorithm for ID validation
 */
function validateLuhn(idNumber: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = idNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(idNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// ============================================
// Document Upload Service
// ============================================

/**
 * Generate a secure upload URL for client-side upload
 * Returns the storage path where the document should be uploaded
 */
export async function getDocumentUploadPath(
  userId: string,
  documentType: DocumentType | 'proof_of_residence',
  fileExtension: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // Validate file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const ext = fileExtension.toLowerCase().replace('.', '');

    if (!allowedExtensions.includes(ext)) {
      return {
        success: false,
        error: 'Only JPG, PNG, and PDF files are allowed',
      };
    }

    // Generate storage path
    const timestamp = Date.now();
    const path = `identity-documents/${userId}/${documentType}_${timestamp}.${ext}`;

    return {
      success: true,
      path,
    };
  } catch (error) {
    console.error('Error generating upload path:', error);
    return {
      success: false,
      error: 'Failed to generate upload path',
    };
  }
}

/**
 * Record a successful document upload
 */
export async function recordDocumentUpload(
  userId: string,
  documentType: DocumentType | 'proof_of_residence',
  storagePath: string,
  downloadUrl: string,
  fileName: string,
  fileSize: number,
  fileType: string
): Promise<UploadDocumentResult> {
  try {
    const userRef = doc(db, 'users', userId);

    // Update user document with upload info
    const updateField =
      documentType === 'proof_of_residence'
        ? 'user_proof_of_residence_url'
        : 'user_id_document_url';

    await updateDoc(userRef, {
      [updateField]: downloadUrl,
      [`${updateField}_path`]: storagePath,
      [`${updateField}_uploaded_at`]: Timestamp.now(),
    });

    return {
      success: true,
      storage_path: storagePath,
      download_url: downloadUrl,
    };
  } catch (error) {
    console.error('Error recording document upload:', error);
    return {
      success: false,
      error: 'Failed to record document upload',
    };
  }
}

// ============================================
// Verification Submission
// ============================================

/**
 * Submit identity verification request
 */
export async function submitVerification(
  userId: string,
  input: VerificationSubmissionInput,
  idDocumentUrl: string,
  proofOfResidenceUrl: string
): Promise<SubmitVerificationResult> {
  try {
    // Validate POPI consent
    if (!input.popi_consent) {
      return {
        success: false,
        error: 'POPI consent is required for identity verification',
      };
    }

    // Validate SA ID if provided
    if (input.id_document_type === 'sa_id' || input.id_document_type === 'sa_id_card') {
      const idValidation = validateSAID(input.id_number);
      if (!idValidation.valid) {
        return {
          success: false,
          error: idValidation.error || 'Invalid South African ID number',
        };
      }
    }

    // Verify documents were uploaded
    if (!idDocumentUrl) {
      return {
        success: false,
        error: 'ID document upload is required',
      };
    }

    if (!proofOfResidenceUrl) {
      return {
        success: false,
        error: 'Proof of residence upload is required',
      };
    }

    const verificationId = generateId('ver');
    const submittedDate = Timestamp.now();

    // Create verification record
    const verificationRef = doc(db, 'identity_verifications', verificationId);
    await setDoc(verificationRef, {
      verification_id: verificationId,
      user_id: userId,
      full_legal_name: input.full_legal_name,
      id_number: input.id_number,
      date_of_birth: input.date_of_birth,
      nationality: input.nationality,
      physical_address: input.physical_address,
      phone_number: input.phone_number,
      id_document_type: input.id_document_type,
      id_document_url: idDocumentUrl,
      proof_of_residence_url: proofOfResidenceUrl,
      status: 'pending' as VerificationStatus,
      submitted_date: submittedDate,
      popi_consent: true,
      popi_consent_date: input.popi_consent_date,
    });

    // Update user document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      user_verification_status: 'pending',
      user_verification_tier: 2, // Still Tier 2 until verified
      user_id_number: input.id_number,
      user_physical_address: input.physical_address,
      user_phone_number: input.phone_number,
      user_popi_consent_date: input.popi_consent_date,
      user_verification_submitted_date: submittedDate,
      user_name: input.full_legal_name, // Update name to legal name
    });

    return {
      success: true,
      verification_id: verificationId,
    };
  } catch (error) {
    console.error('Error submitting verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit verification',
    };
  }
}

// ============================================
// Verification Status
// ============================================

/**
 * Get verification status for a user
 */
export async function getVerificationStatus(
  userId: string
): Promise<GetVerificationStatusResult> {
  try {
    // Get user document for basic status
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    const status = (userData.user_verification_status || 'none') as VerificationStatus;

    // If no verification submitted, return basic status
    if (status === 'none') {
      return {
        success: true,
        status: 'none',
      };
    }

    // Get full verification record
    const verificationsRef = collection(db, 'identity_verifications');
    const q = query(
      verificationsRef,
      where('user_id', '==', userId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        success: true,
        status,
      };
    }

    // Get most recent verification
    const verificationDoc = snapshot.docs[0];
    const verificationData = verificationDoc.data();

    return {
      success: true,
      status: verificationData.status as VerificationStatus,
      verification: {
        verification_id: verificationDoc.id,
        user_id: verificationData.user_id,
        full_legal_name: verificationData.full_legal_name,
        id_number: verificationData.id_number,
        date_of_birth: verificationData.date_of_birth,
        nationality: verificationData.nationality,
        physical_address: verificationData.physical_address,
        phone_number: verificationData.phone_number,
        id_document_type: verificationData.id_document_type,
        id_document: {
          document_type: verificationData.id_document_type,
          file_name: '',
          file_size: 0,
          file_type: '',
          upload_date: verificationData.submitted_date?.toDate?.()?.toISOString() || '',
          storage_path: '',
          download_url: verificationData.id_document_url,
        },
        proof_of_residence: {
          document_type: 'proof_of_residence',
          file_name: '',
          file_size: 0,
          file_type: '',
          upload_date: verificationData.submitted_date?.toDate?.()?.toISOString() || '',
          storage_path: '',
          download_url: verificationData.proof_of_residence_url,
        },
        status: verificationData.status,
        submitted_date: verificationData.submitted_date?.toDate?.()?.toISOString() || '',
        reviewed_date: verificationData.reviewed_date?.toDate?.()?.toISOString(),
        reviewed_by: verificationData.reviewed_by,
        rejection_reason: verificationData.rejection_reason,
        popi_consent: verificationData.popi_consent,
        popi_consent_date: verificationData.popi_consent_date,
      } as VerificationRecord,
    };
  } catch (error) {
    console.error('Error getting verification status:', error);
    return {
      success: false,
      error: 'Failed to get verification status',
    };
  }
}

/**
 * Check if user needs identity verification
 * Returns true if user is Tier 2 (org-linked) but not yet Tier 3 (verified)
 */
export async function needsIdentityVerification(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();

    // Check if user is linked to a company
    const hasCompany = !!userData.user_company_id;

    // Check verification status
    const verificationStatus = userData.user_verification_status || 'none';

    // Needs verification if linked to company but not verified
    return hasCompany && verificationStatus !== 'verified';
  } catch (error) {
    console.error('Error checking verification needs:', error);
    return false;
  }
}

// ============================================
// Admin Functions (for verification review)
// ============================================

/**
 * Approve identity verification (admin only)
 */
export async function approveVerification(
  verificationId: string,
  adminUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const verificationRef = doc(db, 'identity_verifications', verificationId);
    const verificationDoc = await getDoc(verificationRef);

    if (!verificationDoc.exists()) {
      return { success: false, error: 'Verification not found' };
    }

    const verificationData = verificationDoc.data();
    const userId = verificationData.user_id;

    // Update verification record
    await updateDoc(verificationRef, {
      status: 'verified',
      reviewed_date: Timestamp.now(),
      reviewed_by: adminUserId,
    });

    // Update user document to Tier 3
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      user_verification_status: 'verified',
      user_verification_tier: 3,
      user_verification_reviewed_date: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error approving verification:', error);
    return {
      success: false,
      error: 'Failed to approve verification',
    };
  }
}

/**
 * Reject identity verification (admin only)
 */
export async function rejectVerification(
  verificationId: string,
  adminUserId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const verificationRef = doc(db, 'identity_verifications', verificationId);
    const verificationDoc = await getDoc(verificationRef);

    if (!verificationDoc.exists()) {
      return { success: false, error: 'Verification not found' };
    }

    const verificationData = verificationDoc.data();
    const userId = verificationData.user_id;

    // Update verification record
    await updateDoc(verificationRef, {
      status: 'rejected',
      reviewed_date: Timestamp.now(),
      reviewed_by: adminUserId,
      rejection_reason: reason,
    });

    // Update user document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      user_verification_status: 'rejected',
      user_verification_reviewed_date: Timestamp.now(),
      user_verification_rejected_reason: reason,
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting verification:', error);
    return {
      success: false,
      error: 'Failed to reject verification',
    };
  }
}
