/**
 * Certificates collection operations
 */

import { getFirestore } from '../config/firebase-admin';
import type {
  Certificate,
  CertificateDocument,
  CertificateVerificationResult,
  CertificateType,
} from '@amu/shared';
import { generateId, generateCertificateCode } from '@amu/shared';

const COLLECTION = 'certificates';

/**
 * Get a certificate by ID
 */
export async function getCertificateById(certificateId: string): Promise<Certificate | null> {
  const db = getFirestore();
  const doc = await db.collection(COLLECTION).doc(certificateId).get();

  if (!doc.exists) {
    return null;
  }

  return documentToCertificate(doc.data() as CertificateDocument);
}

/**
 * Get a certificate by verification code
 */
export async function getCertificateByCode(code: string): Promise<Certificate | null> {
  const db = getFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('certificate_code', '==', code)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return documentToCertificate(snapshot.docs[0]?.data() as CertificateDocument);
}

/**
 * Get certificates for a user
 */
export async function getCertificatesByUserId(userId: string): Promise<Certificate[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('certificate_user_id', '==', userId)
    .orderBy('certificate_issue_date', 'desc')
    .get();

  return snapshot.docs.map((doc) => documentToCertificate(doc.data() as CertificateDocument));
}

/**
 * Create a new certificate
 */
export async function createCertificate(input: {
  userId: string;
  enrolmentId: string;
  courseId: string;
  learnerName: string;
  courseTitle: string;
  competencies: string[];
  certificateType: CertificateType;
  nqfLevel?: number;
  credits?: number;
  pdfUrl: string;
  pdfSizeBytes: number;
  qrCodeUrl: string;
}): Promise<Certificate> {
  const db = getFirestore();
  const certificateId = generateId('cert');
  const now = new Date().toISOString();

  const certificateDoc: CertificateDocument = {
    certificate_id: certificateId,
    certificate_user_id: input.userId,
    certificate_enrolment_id: input.enrolmentId,
    certificate_course_id: input.courseId,
    certificate_type: input.certificateType,
    certificate_watermark: input.certificateType === 'unofficial',
    certificate_seta_registered: false,
    certificate_learner_name: input.learnerName,
    certificate_course_title: input.courseTitle,
    certificate_competencies: input.competencies,
    certificate_completion_date: now,
    certificate_issue_date: now,
    certificate_code: generateCertificateCode(),
    certificate_qr_code_url: input.qrCodeUrl,
    certificate_pdf_url: input.pdfUrl,
    certificate_pdf_size_bytes: input.pdfSizeBytes,
    certificate_nqf_level: input.nqfLevel,
    certificate_credits: input.credits,
  };

  await db.collection(COLLECTION).doc(certificateId).set(certificateDoc);

  return documentToCertificate(certificateDoc);
}

/**
 * Upgrade certificate to official (after payment)
 */
export async function upgradeCertificateToOfficial(
  certificateId: string,
  paymentDetails: {
    paymentId: string;
    pricePaid: number;
    discountApplied: number;
    referrerUserId?: string;
    newPdfUrl: string;
  }
): Promise<void> {
  const db = getFirestore();
  await db.collection(COLLECTION).doc(certificateId).update({
    certificate_type: 'official',
    certificate_watermark: false,
    certificate_payment_id: paymentDetails.paymentId,
    certificate_price_paid: paymentDetails.pricePaid,
    certificate_discount_applied: paymentDetails.discountApplied,
    certificate_referrer_user_id: paymentDetails.referrerUserId,
    certificate_pdf_url: paymentDetails.newPdfUrl,
    certificate_issue_date: new Date().toISOString(),
  });
}

/**
 * Update SETA registration status
 */
export async function updateSetaRegistration(
  certificateId: string,
  registrationNumber: string
): Promise<void> {
  const db = getFirestore();
  await db.collection(COLLECTION).doc(certificateId).update({
    certificate_seta_registered: true,
    certificate_seta_registration_number: registrationNumber,
  });
}

/**
 * Verify a certificate (public endpoint)
 */
export async function verifyCertificate(code: string): Promise<CertificateVerificationResult> {
  const certificate = await getCertificateByCode(code);

  if (!certificate) {
    return { valid: false };
  }

  return {
    valid: true,
    certificate_learner_name: certificate.certificate_learner_name,
    certificate_course_title: certificate.certificate_course_title,
    certificate_issue_date: certificate.certificate_issue_date.toISOString(),
    certificate_type: certificate.certificate_type,
    certificate_seta_registered: certificate.certificate_seta_registered,
    certificate_nqf_level: certificate.certificate_nqf_level,
    certificate_credits: certificate.certificate_credits,
  };
}

/**
 * Convert Firestore document to Certificate type
 */
function documentToCertificate(doc: CertificateDocument): Certificate {
  return {
    ...doc,
    certificate_completion_date: new Date(doc.certificate_completion_date),
    certificate_issue_date: new Date(doc.certificate_issue_date),
  };
}
