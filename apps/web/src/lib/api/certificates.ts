/**
 * Certificates API Service - AMU Platform
 *
 * API functions for certificate generation and management.
 *
 * "Ubuntu - I am because we are"
 */

import { apiClient, ApiRequestError } from './client';

// =============================================================================
// TYPES
// =============================================================================

export type CertificateType = 'unofficial' | 'official';

export type CertificateStatus =
  | 'pending_payment'
  | 'pending_verification'
  | 'pending_signature'
  | 'issued'
  | 'revoked';

export interface Certificate {
  certificate_id: string;
  user_id: string;
  enrolment_id: string;
  course_id: string;
  course_title: string;
  type: CertificateType;
  status: CertificateStatus;
  issued_at?: string;
  expires_at?: string;
  certificate_number?: string;
  seta_registration_number?: string;
  download_url?: string;
  verification_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CertificateListItem {
  certificate_id: string;
  course_title: string;
  type: CertificateType;
  status: CertificateStatus;
  issued_at?: string;
  certificate_number?: string;
}

export interface CertificateVerification {
  valid: boolean;
  certificate?: {
    certificate_number: string;
    holder_name: string;
    course_title: string;
    issued_at: string;
    type: CertificateType;
    seta_registration_number?: string;
  };
  message?: string;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Get user's certificates
 */
export async function getCertificates(): Promise<CertificateListItem[]> {
  const response = await apiClient.get<{ certificates: CertificateListItem[] }>('/certificates');

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to fetch certificates',
      response.code || 'FETCH_ERROR',
      500
    );
  }

  return response.data.certificates;
}

/**
 * Get a single certificate by ID
 */
export async function getCertificate(certificateId: string): Promise<Certificate> {
  const response = await apiClient.get<{ certificate: Certificate }>(
    `/certificates/${certificateId}`
  );

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Certificate not found',
      response.code || 'NOT_FOUND',
      404
    );
  }

  return response.data.certificate;
}

/**
 * Generate an unofficial certificate
 */
export async function generateUnofficialCertificate(enrolmentId: string): Promise<Certificate> {
  const response = await apiClient.post<{ certificate: Certificate }>(
    `/certificates/generate/unofficial`,
    { enrolment_id: enrolmentId }
  );

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to generate certificate',
      response.code || 'GENERATE_ERROR',
      500
    );
  }

  return response.data.certificate;
}

/**
 * Request an official certificate (requires payment)
 */
export async function requestOfficialCertificate(
  enrolmentId: string,
  paymentIntentId: string
): Promise<Certificate> {
  const response = await apiClient.post<{ certificate: Certificate }>(
    `/certificates/generate/official`,
    {
      enrolment_id: enrolmentId,
      payment_intent_id: paymentIntentId,
    }
  );

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to request certificate',
      response.code || 'REQUEST_ERROR',
      500
    );
  }

  return response.data.certificate;
}

/**
 * Download certificate PDF
 */
export async function downloadCertificate(certificateId: string): Promise<Blob> {
  const response = await fetch(`/api/certificates/${certificateId}/download`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${await getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new ApiRequestError(
      'Failed to download certificate',
      'DOWNLOAD_ERROR',
      response.status
    );
  }

  return response.blob();
}

/**
 * Verify a certificate by certificate number
 */
export async function verifyCertificate(
  certificateNumber: string
): Promise<CertificateVerification> {
  const response = await apiClient.get<CertificateVerification>(
    `/certificates/verify/${encodeURIComponent(certificateNumber)}`
  );

  if (!response.success) {
    return {
      valid: false,
      message: response.error || 'Certificate not found',
    };
  }

  return response.data as CertificateVerification;
}

/**
 * Get certificate for an enrolment
 */
export async function getCertificateForEnrolment(
  enrolmentId: string
): Promise<Certificate | null> {
  const response = await apiClient.get<{ certificate: Certificate | null }>(
    `/certificates/enrolment/${enrolmentId}`
  );

  if (!response.success) {
    return null;
  }

  return response.data?.certificate || null;
}

/**
 * Check if user is eligible for official certificate
 */
export async function checkOfficialCertificateEligibility(enrolmentId: string): Promise<{
  eligible: boolean;
  reason?: string;
  requirements?: {
    course_completed: boolean;
    identity_verified: boolean;
    seta_registered: boolean;
  };
}> {
  const response = await apiClient.get<{
    eligible: boolean;
    reason?: string;
    requirements?: {
      course_completed: boolean;
      identity_verified: boolean;
      seta_registered: boolean;
    };
  }>(`/certificates/eligibility/${enrolmentId}`);

  if (!response.success || !response.data) {
    return {
      eligible: false,
      reason: response.error || 'Unable to check eligibility',
    };
  }

  return response.data;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get auth token for download requests
 * This is a workaround since we need raw blob response
 */
async function getAuthToken(): Promise<string> {
  // This will be set up by the auth context
  // For now, return empty string - the apiClient will handle auth
  return '';
}
