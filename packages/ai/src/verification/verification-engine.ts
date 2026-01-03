/**
 * Automated AI Verification Engine - AMU Platform
 *
 * Privacy-First Identity Verification (Sections 1.3, 5.4, 10.3)
 *
 * CRITICAL PRIVACY MANDATE:
 * - NO human (including admins) may EVER see student personal data
 * - All verification is automated via AI
 * - This engine processes data statelessly - nothing is logged with PII
 * - Only audit RESULTS (pass/fail) are stored, never the actual data
 *
 * "Ubuntu - I am because we are"
 */

import type {
  VerificationAuditResult,
  AuditCheckResult,
  AuditResult,
  DisputeContext,
  VerificationFailureReason,
  SAIDValidationResult,
  DEFAULT_VERIFICATION_CONFIG,
} from '@amu/shared';
import { sendMessage } from '../client';
import { validateSAID, datesMatch, gendersMatch } from './id-validator';
import {
  DOCUMENT_AUDIT_SYSTEM_PROMPT,
  SETA_FIELDS_AUDIT_SYSTEM_PROMPT,
  buildDocumentAuditPrompt,
  buildSETAFieldsAuditPrompt,
  parseDocumentAuditResponse,
  parseSETAFieldsAuditResponse,
  type DocumentAuditResponse,
  type SETAFieldsAuditResponse,
} from './audit-prompts';

/**
 * Form data structure (received from frontend)
 * This is processed and NOT stored by the engine
 */
export interface VerificationFormData {
  // Personal
  title: string;
  firstName: string;
  middleNames: string;
  surname: string;
  preferredName: string;
  gender: string;
  dateOfBirth: string;

  // Identification
  idNumber: string;
  citizenStatus: string;
  alternativeIdType?: string;
  alternativeIdNumber?: string;

  // Equity
  equityGroup: string;
  homeLanguage: string;
  disabilityStatus: string;
  disabilityDetails?: Record<string, string>;

  // Contact
  phoneMobile: string;
  emailPersonal: string;

  // Address
  addressStreetName: string;
  addressSuburb: string;
  addressCity: string;
  addressProvince: string;
  addressPostalCode: string;

  // Emergency
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;

  // Employment
  isEmployed: boolean;
  employerName?: string;
  position?: string;
  supervisorName?: string;
  supervisorPhone?: string;
  supervisorEmail?: string;

  // Education
  highestQualification: string;
  hasMatric: boolean;
  socioeconomicStatus: string;

  // Consent
  popiConsent: boolean;
  popiConsentDate: string;
}

/**
 * OCR extraction results (from document processing)
 */
export interface OCRResults {
  idDocument: {
    text: string;
    confidence: number;
  };
  proofOfResidence: {
    text: string;
    confidence: number;
  };
}

/**
 * Verification engine result
 */
export interface VerificationEngineResult {
  success: boolean;
  auditResult: VerificationAuditResult;
  disputeContext?: DisputeContext;
  shouldUpgradeTier: boolean;
  shouldSendConfirmationEmail: boolean;
}

/**
 * Generate a unique audit ID
 */
function generateAuditId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `audit_${timestamp}_${random}`;
}

/**
 * Generate a unique dispute ID
 */
function generateDisputeId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `dispute_${timestamp}_${random}`;
}

/**
 * Main verification engine function
 *
 * This is the core function that:
 * 1. Validates the ID number (Luhn checksum)
 * 2. Sends documents to AI for audit
 * 3. Checks SETA field completeness
 * 4. Returns pass/fail with no PII
 */
export async function runVerificationAudit(
  userId: string,
  formData: VerificationFormData,
  ocrResults: OCRResults
): Promise<VerificationEngineResult> {
  const auditId = generateAuditId();
  const timestamp = new Date().toISOString();

  // Track total tokens used
  let totalTokensUsed = 0;

  // ================================================
  // STEP 1: Validate SA ID Number (Luhn Algorithm)
  // ================================================
  const isSACitizen = formData.citizenStatus === 'SA Citizen';
  let idValidation: SAIDValidationResult;

  if (isSACitizen && formData.idNumber) {
    idValidation = validateSAID(formData.idNumber);
  } else {
    // Non-SA citizen - ID validation not applicable
    idValidation = {
      valid: true,
      checksum_valid: true,
    };
  }

  // ================================================
  // STEP 2: AI Document Audit
  // ================================================
  const documentAuditPrompt = buildDocumentAuditPrompt({
    idDocumentText: ocrResults.idDocument.text,
    proofOfResidenceText: ocrResults.proofOfResidence.text,
    idNumberValidation: {
      valid: idValidation.valid,
      extractedDOB: idValidation.date_of_birth,
      extractedGender: idValidation.gender,
      checksumValid: idValidation.checksum_valid,
    },
    formDataForComparison: {
      firstName: formData.firstName,
      surname: formData.surname,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      idNumber: formData.idNumber || formData.alternativeIdNumber || '',
      addressCity: formData.addressCity,
      addressProvince: formData.addressProvince,
    },
  });

  const documentAuditResponse = await sendMessage(
    DOCUMENT_AUDIT_SYSTEM_PROMPT,
    [{ role: 'user', content: documentAuditPrompt }],
    { temperature: 0.1 } // Low temperature for consistency
  );

  totalTokensUsed += documentAuditResponse.inputTokens + documentAuditResponse.outputTokens;

  const documentAudit = parseDocumentAuditResponse(documentAuditResponse.content);

  if (!documentAudit) {
    // AI response parsing failed - needs manual review
    // But we can't have manual review! Set as action_required
    return createFailureResult(
      auditId,
      userId,
      timestamp,
      ['id_document_unreadable'],
      ['ID Document'],
      totalTokensUsed
    );
  }

  // ================================================
  // STEP 3: SETA Fields Completeness Check
  // ================================================
  const fieldsPresent = checkFieldsPresent(formData);
  const fieldsValid = checkFieldsValid(formData);

  const setaAuditPrompt = buildSETAFieldsAuditPrompt({
    fieldsPresent,
    fieldsValid,
    citizenStatus: formData.citizenStatus,
    hasAlternativeId: !!(formData.alternativeIdType && formData.alternativeIdNumber),
    disabilityStatus: formData.disabilityStatus,
    hasDisabilityDetails:
      formData.disabilityStatus === 'Yes' &&
      Object.values(formData.disabilityDetails || {}).some((v) => v),
    isEmployed: formData.isEmployed,
    hasEmploymentDetails: !!(formData.employerName && formData.position),
  });

  const setaAuditResponse = await sendMessage(
    SETA_FIELDS_AUDIT_SYSTEM_PROMPT,
    [{ role: 'user', content: setaAuditPrompt }],
    { temperature: 0.1 }
  );

  totalTokensUsed += setaAuditResponse.inputTokens + setaAuditResponse.outputTokens;

  const setaAudit = parseSETAFieldsAuditResponse(setaAuditResponse.content);

  // ================================================
  // STEP 4: Compile Audit Results
  // ================================================
  const checks = buildAuditChecks(documentAudit, setaAudit, idValidation);
  const failureReasons = collectFailureReasons(documentAudit, setaAudit, idValidation);

  // Determine overall result
  const allChecksPassed = Object.values(checks).every((check) => check.passed);
  const overallConfidence = calculateOverallConfidence(checks);

  let overallResult: AuditResult;
  if (allChecksPassed && overallConfidence >= 0.85) {
    overallResult = 'pass';
  } else if (failureReasons.length > 0) {
    overallResult = 'fail';
  } else {
    overallResult = 'needs_clarification';
  }

  // ================================================
  // STEP 5: Build Final Result
  // ================================================
  const auditResult: VerificationAuditResult = {
    audit_id: auditId,
    user_id: userId,
    timestamp,
    result: overallResult,
    overall_confidence: overallConfidence,
    checks,
    failure_reasons: failureReasons as VerificationFailureReason[],
    ai_tokens_used: totalTokensUsed,
  };

  if (overallResult === 'pass') {
    // SUCCESS - Upgrade to Tier 3
    return {
      success: true,
      auditResult,
      shouldUpgradeTier: true,
      shouldSendConfirmationEmail: true,
    };
  } else {
    // FAILURE - Create dispute context for Socratic resolution
    const disputeContext = createDisputeContext(
      userId,
      failureReasons,
      documentAudit,
      setaAudit
    );

    return {
      success: false,
      auditResult,
      disputeContext,
      shouldUpgradeTier: false,
      shouldSendConfirmationEmail: false,
    };
  }
}

/**
 * Check which mandatory fields are present
 */
function checkFieldsPresent(formData: VerificationFormData): Record<string, boolean> {
  return {
    title: !!formData.title,
    firstName: !!formData.firstName,
    surname: !!formData.surname,
    gender: !!formData.gender,
    dateOfBirth: !!formData.dateOfBirth,
    identification:
      !!formData.idNumber || !!(formData.alternativeIdType && formData.alternativeIdNumber),
    citizenStatus: !!formData.citizenStatus,
    equityGroup: !!formData.equityGroup,
    homeLanguage: !!formData.homeLanguage,
    disabilityStatus: !!formData.disabilityStatus,
    phoneMobile: !!formData.phoneMobile,
    emailPersonal: !!formData.emailPersonal,
    addressStreetName: !!formData.addressStreetName,
    addressCity: !!formData.addressCity,
    addressProvince: !!formData.addressProvince,
    addressPostalCode: !!formData.addressPostalCode,
    emergencyName: !!formData.emergencyName,
    emergencyPhone: !!formData.emergencyPhone,
    highestQualification: !!formData.highestQualification,
    socioeconomicStatus: !!formData.socioeconomicStatus,
    popiConsent: formData.popiConsent === true,
  };
}

/**
 * Check which fields have valid values
 */
function checkFieldsValid(formData: VerificationFormData): Record<string, boolean> {
  return {
    title: ['Mr', 'Ms', 'Mrs', 'Dr', 'Prof', 'Rev', 'Other'].includes(formData.title),
    firstName: formData.firstName.length >= 2,
    surname: formData.surname.length >= 2,
    gender: ['Male', 'Female', 'Other', 'Prefer not to say'].includes(formData.gender),
    dateOfBirth: isValidDate(formData.dateOfBirth),
    phoneMobile: isValidPhoneNumber(formData.phoneMobile),
    emailPersonal: isValidEmail(formData.emailPersonal),
    addressPostalCode: /^\d{4}$/.test(formData.addressPostalCode),
    emergencyPhone: isValidPhoneNumber(formData.emergencyPhone),
    popiConsentDate: isValidDate(formData.popiConsentDate),
  };
}

/**
 * Validate date format
 */
function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Validate SA phone number
 */
function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s-]/g, '');
  // SA phone numbers: 10 digits starting with 0, or +27 followed by 9 digits
  return /^0\d{9}$/.test(cleaned) || /^\+27\d{9}$/.test(cleaned);
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Build audit check results
 */
function buildAuditChecks(
  documentAudit: DocumentAuditResponse | null,
  setaAudit: SETAFieldsAuditResponse | null,
  idValidation: SAIDValidationResult
): VerificationAuditResult['checks'] {
  return {
    id_document_readable: {
      check_name: 'ID Document Readable',
      passed: documentAudit?.id_document_readable.passed ?? false,
      confidence: documentAudit?.id_document_readable.confidence ?? 0,
      details: documentAudit?.id_document_readable.issue || undefined,
    },
    id_number_valid: {
      check_name: 'ID Number Valid (Luhn)',
      passed: idValidation.valid && idValidation.checksum_valid,
      confidence: idValidation.valid ? 1.0 : 0,
      details: idValidation.error || undefined,
    },
    id_number_matches_dob_gender: {
      check_name: 'ID Number Matches DOB/Gender',
      passed:
        (documentAudit?.dob_matches.passed ?? false) &&
        (documentAudit?.gender_matches.passed ?? false),
      confidence:
        ((documentAudit?.dob_matches.confidence ?? 0) +
          (documentAudit?.gender_matches.confidence ?? 0)) /
        2,
    },
    name_matches_document: {
      check_name: 'Name Matches Document',
      passed: documentAudit?.name_matches.passed ?? false,
      confidence: documentAudit?.name_matches.confidence ?? 0,
      details: documentAudit?.name_matches.issue || undefined,
    },
    address_document_valid: {
      check_name: 'Address Document Valid',
      passed: documentAudit?.proof_of_residence_valid.passed ?? false,
      confidence: documentAudit?.proof_of_residence_valid.confidence ?? 0,
      details: documentAudit?.proof_of_residence_valid.issue || undefined,
    },
    seta_fields_complete: {
      check_name: 'SETA Fields Complete',
      passed: setaAudit?.all_mandatory_fields_present ?? false,
      confidence: setaAudit?.confidence ?? 0,
      details: setaAudit?.missing_fields.length
        ? `Missing: ${setaAudit.missing_fields.join(', ')}`
        : undefined,
    },
    seta_fields_consistent: {
      check_name: 'SETA Fields Consistent',
      passed:
        (setaAudit?.all_fields_consistent ?? false) && (setaAudit?.all_fields_valid ?? false),
      confidence: setaAudit?.confidence ?? 0,
      details: setaAudit?.consistency_issues.length
        ? setaAudit.consistency_issues.join('; ')
        : undefined,
    },
  };
}

/**
 * Collect all failure reasons
 */
function collectFailureReasons(
  documentAudit: DocumentAuditResponse | null,
  setaAudit: SETAFieldsAuditResponse | null,
  idValidation: SAIDValidationResult
): string[] {
  const reasons: string[] = [];

  // ID validation failures
  if (!idValidation.checksum_valid) {
    reasons.push('id_number_invalid_checksum');
  }

  // Document audit failures
  if (documentAudit?.failure_reasons) {
    reasons.push(...documentAudit.failure_reasons);
  }

  // SETA field failures
  if (setaAudit && !setaAudit.all_mandatory_fields_present) {
    reasons.push('seta_fields_incomplete');
  }
  if (setaAudit && !setaAudit.all_fields_consistent) {
    reasons.push('seta_fields_inconsistent');
  }

  // Fraud detection
  if (documentAudit?.fraud_indicators.detected) {
    reasons.push('document_potentially_altered');
  }

  return [...new Set(reasons)]; // Deduplicate
}

/**
 * Calculate overall confidence score
 */
function calculateOverallConfidence(
  checks: VerificationAuditResult['checks']
): number {
  const checkValues = Object.values(checks);
  const totalConfidence = checkValues.reduce((sum, check) => sum + check.confidence, 0);
  return totalConfidence / checkValues.length;
}

/**
 * Create dispute context for Socratic resolution
 */
function createDisputeContext(
  userId: string,
  failureReasons: string[],
  documentAudit: DocumentAuditResponse | null,
  setaAudit: SETAFieldsAuditResponse | null
): DisputeContext {
  // Determine which fields need attention
  const fieldsNeedingAttention: string[] = [];

  if (failureReasons.includes('name_mismatch') || failureReasons.includes('name_spelling_unclear')) {
    fieldsNeedingAttention.push('First Name', 'Surname');
  }
  if (failureReasons.includes('id_number_invalid_checksum') || failureReasons.includes('id_number_dob_mismatch')) {
    fieldsNeedingAttention.push('ID Number', 'Date of Birth');
  }
  if (failureReasons.includes('id_number_gender_mismatch')) {
    fieldsNeedingAttention.push('Gender');
  }
  if (failureReasons.includes('address_not_recent') || failureReasons.includes('address_document_unreadable')) {
    fieldsNeedingAttention.push('Proof of Residence');
  }
  if (failureReasons.includes('id_document_unreadable') || failureReasons.includes('id_document_expired')) {
    fieldsNeedingAttention.push('ID Document');
  }
  if (setaAudit?.missing_fields) {
    fieldsNeedingAttention.push(...setaAudit.missing_fields);
  }
  if (setaAudit?.invalid_fields) {
    fieldsNeedingAttention.push(...setaAudit.invalid_fields);
  }

  // Generate resolution guidance (no PII)
  const resolutionGuidance = generateResolutionGuidance(failureReasons);

  return {
    dispute_id: generateDisputeId(),
    user_id: userId,
    created_at: new Date().toISOString(),
    status: 'pending',
    failure_reasons: failureReasons as VerificationFailureReason[],
    resolution_attempts: 0,
    max_attempts: 3,
    fields_needing_attention: [...new Set(fieldsNeedingAttention)],
    resolution_guidance: resolutionGuidance,
  };
}

/**
 * Generate guidance text for dispute resolution
 */
function generateResolutionGuidance(failureReasons: string[]): string {
  const guidance: string[] = [];

  if (failureReasons.some((r) => r.includes('document'))) {
    guidance.push('Please check that your uploaded documents are clear and readable.');
  }
  if (failureReasons.some((r) => r.includes('id_number'))) {
    guidance.push('Please verify your ID number is entered correctly.');
  }
  if (failureReasons.some((r) => r.includes('name'))) {
    guidance.push('Please ensure your name matches exactly as it appears on your ID.');
  }
  if (failureReasons.some((r) => r.includes('seta'))) {
    guidance.push('Please complete all required fields for SETA registration.');
  }

  return guidance.join(' ');
}

/**
 * Create a failure result when audit cannot be completed
 */
function createFailureResult(
  auditId: string,
  userId: string,
  timestamp: string,
  failureReasons: VerificationFailureReason[],
  fieldsNeedingAttention: string[],
  tokensUsed: number
): VerificationEngineResult {
  const auditResult: VerificationAuditResult = {
    audit_id: auditId,
    user_id: userId,
    timestamp,
    result: 'fail',
    overall_confidence: 0,
    checks: {
      id_document_readable: {
        check_name: 'ID Document Readable',
        passed: false,
        confidence: 0,
      },
      id_number_valid: {
        check_name: 'ID Number Valid',
        passed: false,
        confidence: 0,
      },
      id_number_matches_dob_gender: {
        check_name: 'ID Matches DOB/Gender',
        passed: false,
        confidence: 0,
      },
      name_matches_document: {
        check_name: 'Name Matches',
        passed: false,
        confidence: 0,
      },
      address_document_valid: {
        check_name: 'Address Document Valid',
        passed: false,
        confidence: 0,
      },
      seta_fields_complete: {
        check_name: 'SETA Fields Complete',
        passed: false,
        confidence: 0,
      },
      seta_fields_consistent: {
        check_name: 'SETA Fields Consistent',
        passed: false,
        confidence: 0,
      },
    },
    failure_reasons: failureReasons,
    ai_tokens_used: tokensUsed,
  };

  return {
    success: false,
    auditResult,
    disputeContext: {
      dispute_id: generateDisputeId(),
      user_id: userId,
      created_at: timestamp,
      status: 'pending',
      failure_reasons: failureReasons,
      resolution_attempts: 0,
      max_attempts: 3,
      fields_needing_attention: fieldsNeedingAttention,
      resolution_guidance: 'Please ensure your documents are clear and all information is accurate.',
    },
    shouldUpgradeTier: false,
    shouldSendConfirmationEmail: false,
  };
}
