/**
 * Certificate Types - AMU Certificate Generation System
 *
 * Types for generating and managing learner certificates
 * following AMU Brand Guidelines (Section 9)
 */

/**
 * Certificate template types
 * - unofficial: Free certificate with UNOFFICIAL watermark
 * - official: SETA-registered certificate (future)
 */
export type CertificateTemplate = 'unofficial' | 'official';

/**
 * Certificate status in the system
 */
export type CertificateStatus = 'pending' | 'generated' | 'revoked';

/**
 * Competency achievement for certificate display
 */
export interface CertificateCompetency {
  competency_id: string;
  competency_title: string;
  achieved_date: Date;
}

/**
 * Certificate data stored in Firestore
 */
export interface Certificate {
  certificate_id: string;
  certificate_learner_id: string;
  certificate_learner_name: string;
  certificate_course_id: string;
  certificate_course_title: string;
  certificate_enrolment_id: string;
  certificate_competencies: CertificateCompetency[];
  certificate_template: CertificateTemplate;
  certificate_status: CertificateStatus;
  certificate_issued_date: Date;
  certificate_pdf_url?: string;
  certificate_verification_url: string;
  certificate_created_at: Date;
  certificate_updated_at: Date;
}

/**
 * Parameters for generating a certificate
 */
export interface GenerateCertificateParams {
  enrolmentId: string;
  learnerId: string;
  learnerName: string;
  courseId: string;
  courseTitle: string;
  competencies: CertificateCompetency[];
  template?: CertificateTemplate;
}

/**
 * Result of certificate generation
 */
export interface GenerateCertificateResult {
  success: boolean;
  certificateId?: string;
  pdfBuffer?: Buffer;
  verificationUrl?: string;
  error?: string;
}

/**
 * AMU Brand colours for certificate styling
 */
export const AMU_COLORS = {
  navy: '#0A2F5C',      // Primary - Navy Blue
  sky: '#D9E6F2',       // Secondary - Sky Blue
  slate: '#64748B',     // Accent - Slate Blue
  charcoal: '#1E293B',  // Text - Charcoal
  white: '#FFFFFF',     // Background
  gold: '#B8860B',      // Certificate accent
} as const;

/**
 * Certificate dimensions (A4 Landscape)
 */
export const CERTIFICATE_DIMENSIONS = {
  width: 842,   // A4 landscape width in points (297mm)
  height: 595,  // A4 landscape height in points (210mm)
  margin: 40,
  innerMargin: 60,
} as const;
