/**
 * Identity Verification Types - AMU Platform
 *
 * Privacy-First Verification System (Sections 1.3, 10.3)
 * NO HUMAN may ever view student personal data.
 * All verification is automated via AI.
 *
 * "Ubuntu - I am because we are"
 */

/**
 * Verification status - tracks the automated verification process
 */
export type VerificationStatus =
  | 'none'                      // No verification submitted
  | 'pending'                   // Submitted, awaiting AI processing
  | 'processing'                // AI verification in progress
  | 'verified'                  // AI audit passed, Tier 3 granted
  | 'action_required'           // AI found discrepancies, needs learner input
  | 'seta_confirmed';           // SETA enrolment confirmed

/**
 * AI Audit result - returned by the verification engine
 */
export type AuditResult = 'pass' | 'fail' | 'needs_clarification';

/**
 * Individual check result from the AI audit
 */
export interface AuditCheckResult {
  check_name: string;
  passed: boolean;
  confidence: number;          // 0.0 to 1.0
  details?: string;            // Non-PII explanation
}

/**
 * Complete verification audit result
 * NOTE: Contains NO personal data - only audit metadata
 */
export interface VerificationAuditResult {
  audit_id: string;
  user_id: string;
  timestamp: string;

  // Overall result
  result: AuditResult;
  overall_confidence: number;

  // Individual checks (no PII stored)
  checks: {
    id_document_readable: AuditCheckResult;
    id_number_valid: AuditCheckResult;
    id_number_matches_dob_gender: AuditCheckResult;
    name_matches_document: AuditCheckResult;
    address_document_valid: AuditCheckResult;
    seta_fields_complete: AuditCheckResult;
    seta_fields_consistent: AuditCheckResult;
  };

  // If failed - reason codes (NOT the actual data)
  failure_reasons?: VerificationFailureReason[];

  // Tokens used for audit
  ai_tokens_used: number;
}

/**
 * Failure reasons - used to guide Socratic resolution
 * These are codes, not actual data
 */
export type VerificationFailureReason =
  | 'id_document_unreadable'
  | 'id_document_expired'
  | 'id_number_invalid_checksum'
  | 'id_number_dob_mismatch'
  | 'id_number_gender_mismatch'
  | 'name_mismatch'
  | 'name_spelling_unclear'
  | 'address_document_unreadable'
  | 'address_not_recent'
  | 'seta_fields_incomplete'
  | 'seta_fields_inconsistent'
  | 'document_potentially_altered'
  | 'citizenship_visa_mismatch';

/**
 * Dispute context - stored when verification fails
 * Used by AI Facilitator for Socratic resolution
 * Contains NO actual user data - only guidance for AI
 */
export interface DisputeContext {
  dispute_id: string;
  user_id: string;
  created_at: string;
  resolved_at?: string;

  // Status
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated';

  // Failure reasons (codes only, not data)
  failure_reasons: VerificationFailureReason[];

  // Resolution attempts
  resolution_attempts: number;
  max_attempts: number;  // Typically 3

  // Fields that need correction (field names, not values)
  fields_needing_attention: string[];

  // Socratic guidance for AI (generated, no PII)
  resolution_guidance: string;

  // If resolved
  resolution_method?: 'learner_correction' | 'document_resubmit' | 'manual_override';
}

/**
 * SA ID validation result
 */
export interface SAIDValidationResult {
  valid: boolean;
  date_of_birth?: string;       // YYYY-MM-DD extracted from ID
  gender?: 'male' | 'female';   // Extracted from ID
  citizenship?: 'citizen' | 'permanent_resident';
  checksum_valid: boolean;
  error?: string;
}

/**
 * Document OCR extraction result
 * NOTE: This is passed to AI and NOT stored
 */
export interface DocumentExtractionResult {
  success: boolean;
  document_type: 'id_card' | 'id_book' | 'passport' | 'proof_of_residence';
  extracted_text: string;
  confidence: number;
  error?: string;
}

/**
 * Verification submission payload
 * Sent to the verification engine
 */
export interface VerificationSubmissionPayload {
  user_id: string;

  // Document storage paths (not the actual documents)
  id_document_path: string;
  proof_of_residence_path: string;

  // Form data hash (for integrity verification)
  form_data_hash: string;

  // Submission timestamp
  submitted_at: string;
}

/**
 * Email notification types for verification
 */
export type VerificationEmailType =
  | 'verification_received'
  | 'verification_processing'
  | 'seta_enrolment_confirmed'
  | 'action_required'
  | 'tier_upgrade_complete';

/**
 * SETA registration status per Section 7.1.3
 */
export type SETARegistrationStatus =
  | 'not_started'
  | 'documents_pending'
  | 'awaiting_signatures'      // Status when signatures requested
  | 'signatures_complete'
  | 'submitted_to_seta'
  | 'seta_confirmed'
  | 'rejected';

/**
 * SETA registration data - stored after successful verification
 * Extended with signature tracking per Section 7.1.4
 */
export interface SETARegistrationRecord {
  registration_id: string;
  user_id: string;
  registered_at: string;

  // Status tracking per Section 7.1.3
  registration_status: SETARegistrationStatus;

  // SETA-specific IDs (generated, not user data)
  seta_learner_number?: string;
  chieta_registration_id?: string;

  // Verification reference
  verification_audit_id: string;

  // Learner Information (references User document)
  learner_name: string;
  learner_email: string;

  // Qualification
  qualification_id: string;
  qualification_title: string;

  // Employer (for tri-party agreement)
  employer_name?: string;
  employer_contact?: string;
  workplace_supervisor?: string;

  // Signature Tracking (Section 7.1.4)
  signature_request_id?: string;
  triparty_request_id?: string;
  signatures_status: 'pending' | 'partial' | 'completed';

  // Signed Document URLs (after signing complete)
  signed_enrolment_url?: string;
  signed_triparty_url?: string;

  // Prerequisites per Section 7.1.5
  all_courses_completed: boolean;
  documents_verified: boolean;
  payment_status: 'pending' | 'completed';

  // SETA Submission
  submission_date?: string;
  submission_reference?: string;
  seta_response?: string;

  // Consent references (dates only)
  popi_consent_date: string;
  marketing_consent: boolean;
  photo_consent: boolean;

  // Timestamps
  updated_at?: string;
}

/**
 * Verification engine configuration
 */
export interface VerificationEngineConfig {
  // AI settings
  ai_model: string;
  max_tokens: number;
  temperature: number;

  // Confidence thresholds
  min_overall_confidence: number;      // e.g., 0.85
  min_check_confidence: number;        // e.g., 0.75

  // Document processing
  ocr_provider: 'google_vision' | 'azure_cv' | 'aws_textract';
  max_document_size_mb: number;

  // Dispute settings
  max_resolution_attempts: number;

  // Privacy settings
  log_pii: false;  // MUST always be false
  retention_days: number;
}

/**
 * Default verification engine configuration
 */
export const DEFAULT_VERIFICATION_CONFIG: VerificationEngineConfig = {
  ai_model: 'claude-sonnet-4-20250514',
  max_tokens: 4096,
  temperature: 0.1,  // Low for consistency
  min_overall_confidence: 0.85,
  min_check_confidence: 0.75,
  ocr_provider: 'google_vision',
  max_document_size_mb: 10,
  max_resolution_attempts: 3,
  log_pii: false,
  retention_days: 90,
};
