/**
 * Identity Verification Types - AMU Platform
 *
 * Types for the Learner Identity Intake system (Section 5.4, 10.3).
 * Enables Tier 3 verification for SETA compliance.
 *
 * SETA Mandatory Fields per Data-Required-By-SETAs.pdf:
 * - Personal Information (title, name, gender, DOB)
 * - Identification (ID number, citizenship, visa status)
 * - Equity Reporting (race, home language)
 * - Disability Status
 * - Contact Information
 * - Physical Address
 * - Emergency Contact
 * - Employment Details
 * - Academic Background
 *
 * POPI Compliance (Section 26.4):
 * - All identity documents are stored securely
 * - Explicit consent required for data processing
 * - Data used only for SETA registration purposes
 */

import type {
  PersonTitle,
  Gender,
  EquityGroup,
  CitizenStatus,
  AlternativeIdType,
  DisabilityStatus,
  DisabilityDetails,
  HighestQualification,
  SocioeconomicStatus,
  HomeLanguage,
  SAProvince,
  SetaAddress,
  EmergencyContact,
  EmploymentDetails,
} from '@amu/shared/types/user';

// Re-export for convenience
export type {
  PersonTitle,
  Gender,
  EquityGroup,
  CitizenStatus,
  AlternativeIdType,
  DisabilityStatus,
  DisabilityDetails,
  HighestQualification,
  SocioeconomicStatus,
  HomeLanguage,
  SAProvince,
  SetaAddress,
  EmergencyContact,
  EmploymentDetails,
};

/**
 * Verification status
 */
export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

/**
 * Document types accepted for verification
 */
export type DocumentType =
  | 'sa_id'           // South African ID book/card
  | 'sa_id_card'      // Smart ID card
  | 'passport'        // International passport
  | 'proof_of_residence';

/**
 * Complete SETA verification submission input
 * Contains all mandatory fields per Data-Required-By-SETAs.pdf
 */
export interface VerificationSubmissionInput {
  // ========================================
  // PERSONAL INFORMATION
  // ========================================
  title: PersonTitle;
  first_name: string;
  middle_names?: string;
  surname: string;
  maiden_name?: string;
  preferred_name?: string;        // Name on certificates
  gender: Gender;
  date_of_birth: string;

  // ========================================
  // IDENTIFICATION
  // ========================================
  id_document_type: DocumentType;
  id_number?: string;             // SA ID number (13 digits)
  alternative_id_type?: AlternativeIdType;
  alternative_id_number?: string;
  country_of_origin: string;
  citizenship: string;
  citizen_status: CitizenStatus;
  visa_type?: string;

  // ========================================
  // EQUITY REPORTING (B-BBEE Compliance)
  // ========================================
  equity_group: EquityGroup;      // Race - mandatory for SETA
  home_language: HomeLanguage;

  // ========================================
  // DISABILITY STATUS
  // ========================================
  disability_status: DisabilityStatus;
  disability_details?: DisabilityDetails;

  // ========================================
  // CONTACT INFORMATION
  // ========================================
  phone_mobile: string;           // Primary contact
  phone_home?: string;
  phone_work?: string;
  phone_whatsapp?: string;
  email_personal: string;
  email_work?: string;
  preferred_contact_method: 'email' | 'phone' | 'whatsapp';

  // ========================================
  // PHYSICAL ADDRESS
  // ========================================
  address: SetaAddress;

  // ========================================
  // EMERGENCY CONTACT
  // ========================================
  emergency_contact: EmergencyContact;

  // ========================================
  // EMPLOYMENT DETAILS (if employed)
  // ========================================
  employment?: EmploymentDetails;

  // ========================================
  // ACADEMIC BACKGROUND
  // ========================================
  highest_qualification: HighestQualification;
  qualifications_attained?: string[];
  has_matric: boolean;
  matric_year?: number;
  socioeconomic_status: SocioeconomicStatus;

  // ========================================
  // CONSENT
  // ========================================
  popi_consent: boolean;
  popi_consent_date: string;
  marketing_consent?: boolean;
  photo_consent?: boolean;
}

/**
 * Document upload metadata
 */
export interface DocumentUpload {
  document_type: DocumentType | 'proof_of_residence' | 'profile_photo';
  file_name: string;
  file_size: number;
  file_type: string;
  upload_date: string;
  storage_path: string;
  download_url: string;
}

/**
 * Verification record in Firestore
 */
export interface VerificationRecord {
  verification_id: string;
  user_id: string;

  // All submission data
  submission_data: VerificationSubmissionInput;

  // Documents
  id_document: DocumentUpload;
  proof_of_residence: DocumentUpload;
  profile_photo?: DocumentUpload;

  // Status
  status: VerificationStatus;
  submitted_date: string;
  reviewed_date?: string;
  reviewed_by?: string;
  rejection_reason?: string;

  // AI-assisted verification notes
  ai_verification_notes?: string;
  ai_confidence_score?: number;
}

/**
 * Upload progress callback
 */
export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

/**
 * Service result types
 */
export interface UploadDocumentResult {
  success: boolean;
  storagePath?: string;
  downloadUrl?: string;
  error?: string;
}

export interface SubmitVerificationResult {
  success: boolean;
  verification_id?: string;
  error?: string;
}

export interface GetVerificationStatusResult {
  success: boolean;
  status?: VerificationStatus;
  verification?: VerificationRecord;
  error?: string;
}

/**
 * South African ID validation
 */
export interface SAIDValidation {
  valid: boolean;
  date_of_birth?: string;
  gender?: 'male' | 'female';
  citizenship?: 'citizen' | 'permanent_resident';
  error?: string;
}

/**
 * Form step configuration
 */
export type VerificationStep =
  | 'personal'       // Personal details
  | 'identification' // ID & citizenship
  | 'equity'         // Equity reporting
  | 'contact'        // Contact & address
  | 'employment'     // Employment details
  | 'education'      // Academic background
  | 'documents'      // Document uploads
  | 'consent'        // POPI consent
  | 'review';        // Final review

/**
 * Step validation result
 */
export interface StepValidation {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Options for select fields
 */
export const TITLE_OPTIONS: PersonTitle[] = ['Mr', 'Ms', 'Mrs', 'Dr', 'Prof', 'Rev', 'Other'];

export const GENDER_OPTIONS: Gender[] = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const EQUITY_OPTIONS: EquityGroup[] = [
  'African',
  'Coloured',
  'Indian',
  'White',
  'Other',
  'Prefer not to say',
];

export const CITIZEN_STATUS_OPTIONS: CitizenStatus[] = [
  'SA Citizen',
  'Permanent Resident',
  'Refugee',
  'Work Permit',
  'Study Permit',
  'Other',
];

export const ALTERNATIVE_ID_OPTIONS: AlternativeIdType[] = [
  'Passport',
  'Asylum Seeker Permit',
  'Refugee ID',
  'Work Permit',
  'Study Permit',
  'Other',
];

export const DISABILITY_OPTIONS: DisabilityStatus[] = ['None', 'Yes', 'Prefer not to say'];

export const QUALIFICATION_OPTIONS: HighestQualification[] = [
  'No formal education',
  'Primary school (Grade 1-7)',
  'Some secondary school (Grade 8-11)',
  'Matric / Grade 12',
  'Matric with exemption',
  'Certificate',
  'Higher Certificate',
  'Diploma',
  'Advanced Diploma',
  'Bachelor\'s Degree',
  'Honours Degree',
  'Master\'s Degree',
  'Doctoral Degree',
  'Other',
];

export const SOCIOECONOMIC_OPTIONS: SocioeconomicStatus[] = [
  'Employed',
  'Unemployed seeking work',
  'Unemployed not seeking work',
  'Self-employed',
  'Student',
  'Other',
];

export const LANGUAGE_OPTIONS: HomeLanguage[] = [
  'Afrikaans',
  'English',
  'isiNdebele',
  'isiXhosa',
  'isiZulu',
  'Sepedi',
  'Sesotho',
  'Setswana',
  'siSwati',
  'Tshivenda',
  'Xitsonga',
  'Other',
];

export const PROVINCE_OPTIONS: SAProvince[] = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
];
