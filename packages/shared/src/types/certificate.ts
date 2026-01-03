/**
 * Certificate types for AMU Platform
 * Based on Section 5.1.10 of the specification
 */

import type { CertificateType } from './enrolment';

export interface Certificate {
  certificate_id: string;
  certificate_user_id: string;
  certificate_enrolment_id: string;
  certificate_course_id: string;

  // Type
  certificate_type: CertificateType;
  certificate_watermark: boolean;
  certificate_seta_registered: boolean;

  // Details
  certificate_learner_name: string;
  certificate_course_title: string;
  certificate_competencies: string[];
  certificate_completion_date: Date;
  certificate_issue_date: Date;

  // Verification
  certificate_code: string;
  certificate_qr_code_url: string;

  // Files
  certificate_pdf_url: string;
  certificate_pdf_size_bytes: number;

  // SETA (for official certificates)
  certificate_nqf_level?: number;
  certificate_credits?: number;
  certificate_seta_registration_number?: string;

  // Payment (for official certificates)
  certificate_payment_id?: string;
  certificate_price_paid?: number;
  certificate_discount_applied?: number;
  certificate_referrer_user_id?: string;
}

/**
 * Certificate document for Firestore (with serialized dates)
 */
export interface CertificateDocument extends Omit<Certificate, 'certificate_completion_date' | 'certificate_issue_date'> {
  certificate_completion_date: string;
  certificate_issue_date: string;
}

/**
 * Certificate verification result (public endpoint)
 */
export interface CertificateVerificationResult {
  valid: boolean;
  certificate_learner_name?: string;
  certificate_course_title?: string;
  certificate_issue_date?: string;
  certificate_type?: CertificateType;
  certificate_seta_registered?: boolean;
  certificate_nqf_level?: number;
  certificate_credits?: number;
}

/**
 * Generate certificate input
 */
export interface GenerateCertificateInput {
  enrolment_id: string;
  certificate_type: CertificateType;
}
