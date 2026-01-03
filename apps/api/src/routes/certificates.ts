/**
 * Certificates routes
 */

import { Router } from 'express';
import {
  getCertificatesByUserId,
  getCertificateById,
  verifyCertificate,
} from '@amu/database';
import { createApiError } from '../middleware/error-handler';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/certificates
 * Get all certificates for current user
 */
router.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const certificates = await getCertificatesByUserId(req.userId);

    res.json({
      success: true,
      data: certificates.map((cert) => ({
        id: cert.certificate_id,
        courseId: cert.certificate_course_id,
        courseTitle: cert.certificate_course_title,
        type: cert.certificate_type,
        watermark: cert.certificate_watermark,
        setaRegistered: cert.certificate_seta_registered,
        learnerName: cert.certificate_learner_name,
        competencies: cert.certificate_competencies,
        completionDate: cert.certificate_completion_date,
        issueDate: cert.certificate_issue_date,
        code: cert.certificate_code,
        nqfLevel: cert.certificate_nqf_level,
        credits: cert.certificate_credits,
        pdfUrl: cert.certificate_pdf_url,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/certificates/:certificateId
 * Get certificate details
 */
router.get('/:certificateId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { certificateId } = req.params;
    const certificate = await getCertificateById(certificateId);

    if (!certificate) {
      throw createApiError('Certificate not found', 404, 'CERTIFICATE_NOT_FOUND');
    }

    // Verify ownership
    if (certificate.certificate_user_id !== req.userId) {
      throw createApiError('Not authorized to view this certificate', 403, 'FORBIDDEN');
    }

    res.json({
      success: true,
      data: {
        id: certificate.certificate_id,
        enrolmentId: certificate.certificate_enrolment_id,
        courseId: certificate.certificate_course_id,
        courseTitle: certificate.certificate_course_title,
        type: certificate.certificate_type,
        watermark: certificate.certificate_watermark,
        setaRegistered: certificate.certificate_seta_registered,
        learnerName: certificate.certificate_learner_name,
        competencies: certificate.certificate_competencies,
        completionDate: certificate.certificate_completion_date,
        issueDate: certificate.certificate_issue_date,
        code: certificate.certificate_code,
        qrCodeUrl: certificate.certificate_qr_code_url,
        nqfLevel: certificate.certificate_nqf_level,
        credits: certificate.certificate_credits,
        setaRegistrationNumber: certificate.certificate_seta_registration_number,
        pdfUrl: certificate.certificate_pdf_url,
        pricePaid: certificate.certificate_price_paid,
        discountApplied: certificate.certificate_discount_applied,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/certificates/verify/:code
 * Public certificate verification
 */
router.get('/verify/:code', async (req, res, next) => {
  try {
    const { code } = req.params;

    const result = await verifyCertificate(code);

    if (!result.valid) {
      res.json({
        success: true,
        data: {
          valid: false,
          message: 'Certificate not found or invalid',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        valid: true,
        learnerName: result.certificate_learner_name,
        courseTitle: result.certificate_course_title,
        issueDate: result.certificate_issue_date,
        certificateType: result.certificate_type,
        setaRegistered: result.certificate_seta_registered,
        nqfLevel: result.certificate_nqf_level,
        credits: result.certificate_credits,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
