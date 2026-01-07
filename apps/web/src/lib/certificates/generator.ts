'use server';

/**
 * Certificate Generator - AMU Certificate Generation System
 *
 * Generates beautiful PDF certificates for learners who complete courses.
 * Uses PDFKit for server-side PDF generation.
 *
 * Features:
 * - A4 Landscape format
 * - AMU Brand styling (Navy Blue #0A2F5C, Sky Blue #D9E6F2)
 * - UNOFFICIAL watermark for free certificates
 * - QR code for verification
 * - List of achieved competencies
 * - AMU Bridge Logo with slogan
 */

import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import {
  doc as firestoreDoc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { LOGO_WITH_SLOGAN } from '@/lib/brand-assets';
import {
  type GenerateCertificateParams,
  type GenerateCertificateResult,
  type Certificate,
  type CertificateCompetency,
  type SETACertificateDetails,
  AMU_COLORS,
  CERTIFICATE_DIMENSIONS,
} from './types';

// Base URL for verification
const VERIFICATION_BASE_URL = 'https://assetmanagementuniversity.org/verify';

/**
 * Generate a unique certificate ID
 */
function generateCertificateId(): string {
  const uuid = uuidv4();
  // Format: AMU-XXXX-XXXX-XXXX (uppercase, no hyphens from uuid)
  const clean = uuid.replace(/-/g, '').toUpperCase();
  return `AMU-${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}`;
}

/**
 * Format date for certificate display (UK format)
 */
function formatCertificateDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Generate QR code as base64 data URL
 */
async function generateQRCode(url: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 100,
      margin: 1,
      color: {
        dark: AMU_COLORS.navy,
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Convert base64 data URL to buffer for PDFKit
 */
function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Draw decorative border on certificate
 */
function drawDecorativeBorder(doc: PDFKit.PDFDocument): void {
  const { width, height, margin } = CERTIFICATE_DIMENSIONS;

  // Outer border - Navy Blue
  doc
    .strokeColor(AMU_COLORS.navy)
    .lineWidth(3)
    .rect(margin, margin, width - 2 * margin, height - 2 * margin)
    .stroke();

  // Inner border - lighter
  doc
    .strokeColor(AMU_COLORS.slate)
    .lineWidth(1)
    .rect(margin + 8, margin + 8, width - 2 * margin - 16, height - 2 * margin - 16)
    .stroke();

  // Corner flourishes
  const cornerSize = 20;
  const corners = [
    { x: margin + 15, y: margin + 15 },
    { x: width - margin - 15, y: margin + 15 },
    { x: margin + 15, y: height - margin - 15 },
    { x: width - margin - 15, y: height - margin - 15 },
  ];

  doc.strokeColor(AMU_COLORS.navy).lineWidth(2);

  corners.forEach((corner, index) => {
    const xDir = index % 2 === 0 ? 1 : -1;
    const yDir = index < 2 ? 1 : -1;

    // Horizontal line
    doc
      .moveTo(corner.x, corner.y)
      .lineTo(corner.x + cornerSize * xDir, corner.y)
      .stroke();

    // Vertical line
    doc
      .moveTo(corner.x, corner.y)
      .lineTo(corner.x, corner.y + cornerSize * yDir)
      .stroke();
  });
}

/**
 * Draw the UNOFFICIAL watermark diagonally
 */
function drawUnofficialWatermark(doc: PDFKit.PDFDocument): void {
  const { width, height } = CERTIFICATE_DIMENSIONS;

  doc.save();

  // Position at centre and rotate
  doc.translate(width / 2, height / 2);
  doc.rotate(-30);

  // Draw watermark text
  doc
    .fontSize(72)
    .fillColor(AMU_COLORS.sky)
    .opacity(0.3)
    .text('UNOFFICIAL', -200, -30, {
      width: 400,
      align: 'center',
    });

  doc.restore();
  doc.opacity(1);
}

/**
 * Draw official certificate gold seal emblem
 */
function drawOfficialSeal(doc: PDFKit.PDFDocument): void {
  const { width, margin } = CERTIFICATE_DIMENSIONS;

  const sealX = width - margin - 80;
  const sealY = margin + 30;
  const sealRadius = 35;

  // Outer gold circle
  doc
    .circle(sealX, sealY, sealRadius)
    .fillColor(AMU_COLORS.gold)
    .fill();

  // Inner navy circle
  doc
    .circle(sealX, sealY, sealRadius - 5)
    .strokeColor(AMU_COLORS.navy)
    .lineWidth(2)
    .stroke();

  // Inner gold ring
  doc
    .circle(sealX, sealY, sealRadius - 10)
    .strokeColor(AMU_COLORS.gold)
    .lineWidth(1)
    .stroke();

  // "OFFICIAL" text in seal
  doc
    .fontSize(7)
    .fillColor(AMU_COLORS.navy)
    .text('OFFICIAL', sealX - 20, sealY - 12, {
      width: 40,
      align: 'center',
    });

  // "SETA" text below
  doc
    .fontSize(9)
    .fillColor(AMU_COLORS.navy)
    .text('SETA', sealX - 15, sealY, {
      width: 30,
      align: 'center',
    });

  // "REGISTERED" text
  doc
    .fontSize(5)
    .fillColor(AMU_COLORS.navy)
    .text('REGISTERED', sealX - 20, sealY + 12, {
      width: 40,
      align: 'center',
    });
}

/**
 * Draw SETA registration details for official certificates
 */
function drawSETADetails(
  doc: PDFKit.PDFDocument,
  setaDetails: SETACertificateDetails
): void {
  const { width, height, margin } = CERTIFICATE_DIMENSIONS;

  const boxWidth = 200;
  const boxHeight = 45;
  const boxX = (width - boxWidth) / 2;
  const boxY = height - margin - 110;

  // Draw background box
  doc
    .rect(boxX, boxY, boxWidth, boxHeight)
    .fillColor(AMU_COLORS.sky)
    .fill();

  // Draw border
  doc
    .rect(boxX, boxY, boxWidth, boxHeight)
    .strokeColor(AMU_COLORS.navy)
    .lineWidth(1)
    .stroke();

  // SETA Name header
  doc
    .fontSize(8)
    .fillColor(AMU_COLORS.navy)
    .text(`Registered with ${setaDetails.setaName}`, boxX, boxY + 8, {
      width: boxWidth,
      align: 'center',
    });

  // NQF Level and Credits
  doc
    .fontSize(10)
    .fillColor(AMU_COLORS.charcoal)
    .text(
      `NQF Level ${setaDetails.nqfLevel} • ${setaDetails.credits} Credits`,
      boxX,
      boxY + 20,
      {
        width: boxWidth,
        align: 'center',
      }
    );

  // Registration number if available
  if (setaDetails.registrationNumber) {
    doc
      .fontSize(6)
      .fillColor(AMU_COLORS.slate)
      .text(`Reg. No: ${setaDetails.registrationNumber}`, boxX, boxY + 34, {
        width: boxWidth,
        align: 'center',
      });
  }
}

/**
 * Draw the AMU logo
 */
function drawLogo(doc: PDFKit.PDFDocument): void {
  const { width, margin } = CERTIFICATE_DIMENSIONS;

  try {
    const logoBuffer = dataUrlToBuffer(LOGO_WITH_SLOGAN);
    // Centre the logo at top
    const logoWidth = 180;
    const logoHeight = 50;
    const logoX = (width - logoWidth) / 2;
    const logoY = margin + 25;

    doc.image(logoBuffer, logoX, logoY, {
      width: logoWidth,
      height: logoHeight,
      align: 'center',
    });
  } catch (error) {
    // Fallback to text if logo fails
    console.error('Error loading logo:', error);
    doc
      .fontSize(24)
      .fillColor(AMU_COLORS.navy)
      .text('Asset Management University', 0, margin + 30, {
        width: width,
        align: 'center',
      });
  }
}

/**
 * Draw certificate title section
 */
function drawTitle(doc: PDFKit.PDFDocument): void {
  const { width } = CERTIFICATE_DIMENSIONS;

  // "Certificate of Achievement" title
  doc
    .fontSize(14)
    .fillColor(AMU_COLORS.slate)
    .text('CERTIFICATE OF ACHIEVEMENT', 0, 110, {
      width: width,
      align: 'center',
      characterSpacing: 3,
    });

  // Decorative line under title
  const lineY = 135;
  const lineWidth = 200;
  const lineX = (width - lineWidth) / 2;

  doc
    .strokeColor(AMU_COLORS.navy)
    .lineWidth(1)
    .moveTo(lineX, lineY)
    .lineTo(lineX + lineWidth, lineY)
    .stroke();
}

/**
 * Draw the main certificate content
 */
function drawContent(
  doc: PDFKit.PDFDocument,
  learnerName: string,
  courseTitle: string,
  competencies: CertificateCompetency[],
  issueDate: Date
): void {
  const { width, margin, innerMargin } = CERTIFICATE_DIMENSIONS;
  const contentWidth = width - 2 * innerMargin;

  // "This is to certify that"
  doc
    .fontSize(12)
    .fillColor(AMU_COLORS.charcoal)
    .text('This is to certify that', 0, 155, {
      width: width,
      align: 'center',
    });

  // Learner's name - prominent
  doc
    .fontSize(32)
    .fillColor(AMU_COLORS.navy)
    .text(learnerName, 0, 175, {
      width: width,
      align: 'center',
    });

  // "has successfully demonstrated competency in"
  doc
    .fontSize(12)
    .fillColor(AMU_COLORS.charcoal)
    .text('has successfully demonstrated competency in', 0, 220, {
      width: width,
      align: 'center',
    });

  // Course title - prominent
  doc
    .fontSize(22)
    .fillColor(AMU_COLORS.navy)
    .text(courseTitle, innerMargin, 245, {
      width: contentWidth,
      align: 'center',
    });

  // Competencies section
  if (competencies.length > 0) {
    doc
      .fontSize(10)
      .fillColor(AMU_COLORS.slate)
      .text('Competencies Achieved:', innerMargin, 285, {
        width: contentWidth,
        align: 'center',
      });

    // List competencies (max 6 to fit nicely)
    const displayCompetencies = competencies.slice(0, 6);
    let yPos = 300;

    displayCompetencies.forEach((comp) => {
      doc
        .fontSize(9)
        .fillColor(AMU_COLORS.charcoal)
        .text(`• ${comp.competency_title}`, innerMargin + 100, yPos, {
          width: contentWidth - 200,
          align: 'left',
        });
      yPos += 14;
    });

    if (competencies.length > 6) {
      doc
        .fontSize(8)
        .fillColor(AMU_COLORS.slate)
        .text(`...and ${competencies.length - 6} more competencies`, innerMargin, yPos, {
          width: contentWidth,
          align: 'center',
        });
    }
  }

  // Issue date
  doc
    .fontSize(11)
    .fillColor(AMU_COLORS.charcoal)
    .text(`Issued on ${formatCertificateDate(issueDate)}`, 0, 420, {
      width: width,
      align: 'center',
    });
}

/**
 * Draw QR code and verification info
 */
async function drawVerification(
  doc: PDFKit.PDFDocument,
  verificationUrl: string,
  certificateId: string
): Promise<void> {
  const { margin, height } = CERTIFICATE_DIMENSIONS;

  // Generate and draw QR code
  const qrDataUrl = await generateQRCode(verificationUrl);
  const qrBuffer = dataUrlToBuffer(qrDataUrl);

  const qrSize = 70;
  const qrX = margin + 30;
  const qrY = height - margin - qrSize - 30;

  doc.image(qrBuffer, qrX, qrY, {
    width: qrSize,
    height: qrSize,
  });

  // Verification text
  doc
    .fontSize(7)
    .fillColor(AMU_COLORS.slate)
    .text('Verify this certificate at:', qrX - 5, qrY + qrSize + 5, {
      width: qrSize + 30,
      align: 'center',
    })
    .fontSize(6)
    .text(verificationUrl, qrX - 15, qrY + qrSize + 15, {
      width: qrSize + 50,
      align: 'center',
    });

  // Certificate ID
  doc
    .fontSize(7)
    .fillColor(AMU_COLORS.slate)
    .text(`Certificate ID: ${certificateId}`, qrX - 5, qrY + qrSize + 30, {
      width: qrSize + 30,
      align: 'center',
    });
}

/**
 * Draw signature section
 */
function drawSignature(doc: PDFKit.PDFDocument): void {
  const { width, height, margin } = CERTIFICATE_DIMENSIONS;

  const sigX = width - margin - 180;
  const sigY = height - margin - 80;

  // Signature line
  doc
    .strokeColor(AMU_COLORS.navy)
    .lineWidth(1)
    .moveTo(sigX, sigY + 30)
    .lineTo(sigX + 150, sigY + 30)
    .stroke();

  // "AMU Team" signature text
  doc
    .fontSize(14)
    .fillColor(AMU_COLORS.navy)
    .text('AMU Team', sigX, sigY + 35, {
      width: 150,
      align: 'center',
    });

  // Role
  doc
    .fontSize(9)
    .fillColor(AMU_COLORS.slate)
    .text('Asset Management University', sigX, sigY + 52, {
      width: 150,
      align: 'center',
    });
}

/**
 * Draw footer with Ubuntu philosophy
 */
function drawFooter(doc: PDFKit.PDFDocument): void {
  const { width, height, margin } = CERTIFICATE_DIMENSIONS;

  // Ubuntu quote
  doc
    .fontSize(8)
    .fillColor(AMU_COLORS.slate)
    .text('"I am because we are" — Ubuntu', 0, height - margin - 15, {
      width: width,
      align: 'center',
    });

  // Website
  doc
    .fontSize(7)
    .fillColor(AMU_COLORS.slate)
    .text('assetmanagementuniversity.org', 0, height - margin - 5, {
      width: width,
      align: 'center',
    });
}

/**
 * Main certificate generation function
 */
export async function generateCertificate(
  params: GenerateCertificateParams
): Promise<GenerateCertificateResult> {
  const {
    enrolmentId,
    learnerId,
    learnerName,
    courseId,
    courseTitle,
    competencies,
    template = 'unofficial',
    setaDetails,
  } = params;

  // Validate that official certificates have SETA details
  if (template === 'official' && !setaDetails) {
    return {
      success: false,
      error: 'Official certificates require SETA registration details',
    };
  }

  try {
    // Generate unique certificate ID
    const certificateId = generateCertificateId();
    const verificationUrl = `${VERIFICATION_BASE_URL}/${certificateId}`;
    const issueDate = new Date();

    // Create PDF document (A4 Landscape)
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: {
        top: CERTIFICATE_DIMENSIONS.margin,
        bottom: CERTIFICATE_DIMENSIONS.margin,
        left: CERTIFICATE_DIMENSIONS.margin,
        right: CERTIFICATE_DIMENSIONS.margin,
      },
      info: {
        Title: `AMU Certificate - ${courseTitle}`,
        Author: 'Asset Management University',
        Subject: `Certificate of Achievement for ${learnerName}`,
        Keywords: 'certificate, asset management, competency',
        Creator: 'AMU Certificate Generator',
      },
    });

    // Collect PDF data in buffer
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Draw certificate elements
    // 1. Decorative border
    drawDecorativeBorder(doc);

    // 2. Template-specific elements
    if (template === 'unofficial') {
      // UNOFFICIAL watermark for free certificates
      drawUnofficialWatermark(doc);
    } else if (template === 'official') {
      // Gold seal for official SETA-registered certificates
      drawOfficialSeal(doc);
    }

    // 3. Logo
    drawLogo(doc);

    // 4. Title
    drawTitle(doc);

    // 5. Main content
    drawContent(doc, learnerName, courseTitle, competencies, issueDate);

    // 6. SETA details (for official certificates)
    if (template === 'official' && setaDetails) {
      drawSETADetails(doc, setaDetails);
    }

    // 7. QR code and verification
    await drawVerification(doc, verificationUrl, certificateId);

    // 8. Signature
    drawSignature(doc);

    // 9. Footer
    drawFooter(doc);

    // Finalise PDF
    doc.end();

    // Wait for PDF generation to complete
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);
    });

    // Save certificate record to Firestore
    const certificate: Certificate = {
      certificate_id: certificateId,
      certificate_learner_id: learnerId,
      certificate_learner_name: learnerName,
      certificate_course_id: courseId,
      certificate_course_title: courseTitle,
      certificate_enrolment_id: enrolmentId,
      certificate_competencies: competencies,
      certificate_template: template,
      certificate_status: 'generated',
      certificate_issued_date: issueDate,
      certificate_verification_url: verificationUrl,
      certificate_created_at: new Date(),
      certificate_updated_at: new Date(),
      // Include SETA details for official certificates
      ...(template === 'official' && setaDetails
        ? {
            certificate_seta_name: setaDetails.setaName,
            certificate_nqf_level: setaDetails.nqfLevel,
            certificate_credits: setaDetails.credits,
            certificate_seta_registration_number: setaDetails.registrationNumber,
          }
        : {}),
    };

    // Store in Firestore
    await setDoc(firestoreDoc(db, 'certificates', certificateId), {
      ...certificate,
      certificate_issued_date: Timestamp.fromDate(issueDate),
      certificate_created_at: Timestamp.now(),
      certificate_updated_at: Timestamp.now(),
      certificate_competencies: competencies.map((c) => ({
        ...c,
        achieved_date: Timestamp.fromDate(c.achieved_date),
      })),
    });

    // Update enrolment with certificate ID
    const enrolmentRef = firestoreDoc(db, 'enrolments', enrolmentId);
    await updateDoc(enrolmentRef, {
      enrolment_certificate_generated: true,
      enrolment_certificate_id: certificateId,
      enrolment_updated_at: Timestamp.now(),
    });

    return {
      success: true,
      certificateId,
      pdfBuffer,
      verificationUrl,
    };
  } catch (error) {
    console.error('Error generating certificate:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error generating certificate',
    };
  }
}

/**
 * Retrieve certificate data for verification
 */
export async function verifyCertificate(
  certificateId: string
): Promise<Certificate | null> {
  try {
    const certRef = firestoreDoc(db, 'certificates', certificateId);
    const certDoc = await getDoc(certRef);

    if (!certDoc.exists()) {
      return null;
    }

    const data = certDoc.data();
    return {
      ...data,
      certificate_issued_date: data.certificate_issued_date?.toDate() || new Date(),
      certificate_created_at: data.certificate_created_at?.toDate() || new Date(),
      certificate_updated_at: data.certificate_updated_at?.toDate() || new Date(),
      certificate_competencies: (data.certificate_competencies || []).map(
        (c: { achieved_date: { toDate: () => Date } }) => ({
          ...c,
          achieved_date: c.achieved_date?.toDate() || new Date(),
        })
      ),
    } as Certificate;
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return null;
  }
}
