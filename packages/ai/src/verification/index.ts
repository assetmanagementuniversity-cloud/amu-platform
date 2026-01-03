/**
 * Verification Module Exports - AMU Platform
 *
 * Privacy-First AI Verification System
 * NO human access to student data - all verification is automated.
 *
 * "Ubuntu - I am because we are"
 */

// Main verification engine
export {
  runVerificationAudit,
  type VerificationFormData,
  type OCRResults,
  type VerificationEngineResult,
} from './verification-engine';

// ID validation utilities
export {
  validateSAID,
  extractDOBFromID,
  extractGenderFromID,
  maskIDNumber,
  datesMatch,
  gendersMatch,
} from './id-validator';

// AI prompts for verification
export {
  DOCUMENT_AUDIT_SYSTEM_PROMPT,
  SETA_FIELDS_AUDIT_SYSTEM_PROMPT,
  DISPUTE_RESOLUTION_SYSTEM_PROMPT,
  buildDocumentAuditPrompt,
  buildSETAFieldsAuditPrompt,
  buildDisputeResolutionPrompt,
  parseDocumentAuditResponse,
  parseSETAFieldsAuditResponse,
  type DocumentAuditResponse,
  type SETAFieldsAuditResponse,
} from './audit-prompts';
