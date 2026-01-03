/**
 * User types for AMU Platform
 * Based on Section 5.1.3 of the specification
 *
 * SETA Compliance: Fields required for CHIETA/QCTO registration
 * per Data-Required-By-SETAs.pdf specification.
 */

export type UserType = 'learner' | 'training_manager';
export type AuthProvider = 'email' | 'google';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * User verification status (Section 5.4)
 */
export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

/**
 * User tier level (Section 5.4):
 * - Tier 1: Basic user (registered)
 * - Tier 2: Organisation-linked (has company_code)
 * - Tier 3: Verified identity (ID documents approved)
 */
export type UserTier = 1 | 2 | 3;

/**
 * SETA Mandatory Types
 */
export type PersonTitle = 'Mr' | 'Ms' | 'Mrs' | 'Dr' | 'Prof' | 'Rev' | 'Other';

export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

/**
 * Equity/Race categories for SETA B-BBEE reporting
 * As required by South African Skills Development Act
 */
export type EquityGroup =
  | 'African'
  | 'Coloured'
  | 'Indian'
  | 'White'
  | 'Other'
  | 'Prefer not to say';

/**
 * Citizenship status for SETA registration
 */
export type CitizenStatus =
  | 'SA Citizen'
  | 'Permanent Resident'
  | 'Refugee'
  | 'Work Permit'
  | 'Study Permit'
  | 'Other';

/**
 * Alternative ID types for non-SA citizens
 */
export type AlternativeIdType =
  | 'Passport'
  | 'Asylum Seeker Permit'
  | 'Refugee ID'
  | 'Work Permit'
  | 'Study Permit'
  | 'Other';

/**
 * Disability status for SETA compliance
 */
export type DisabilityStatus = 'None' | 'Yes' | 'Prefer not to say';

/**
 * Types of disabilities for detailed SETA reporting
 */
export interface DisabilityDetails {
  eyesight?: string;
  hearing?: string;
  walking?: string;
  memory?: string;
  communicating?: string;
  self_care?: string;
}

/**
 * Highest qualification levels for SETA
 */
export type HighestQualification =
  | 'No formal education'
  | 'Primary school (Grade 1-7)'
  | 'Some secondary school (Grade 8-11)'
  | 'Matric / Grade 12'
  | 'Matric with exemption'
  | 'Certificate'
  | 'Higher Certificate'
  | 'Diploma'
  | 'Advanced Diploma'
  | 'Bachelor\'s Degree'
  | 'Honours Degree'
  | 'Master\'s Degree'
  | 'Doctoral Degree'
  | 'Other';

/**
 * Socioeconomic status for equity reporting
 */
export type SocioeconomicStatus =
  | 'Employed'
  | 'Unemployed seeking work'
  | 'Unemployed not seeking work'
  | 'Self-employed'
  | 'Student'
  | 'Other';

/**
 * South African provinces
 */
export type SAProvince =
  | 'Eastern Cape'
  | 'Free State'
  | 'Gauteng'
  | 'KwaZulu-Natal'
  | 'Limpopo'
  | 'Mpumalanga'
  | 'Northern Cape'
  | 'North West'
  | 'Western Cape';

/**
 * Home languages for SETA
 */
export type HomeLanguage =
  | 'Afrikaans'
  | 'English'
  | 'isiNdebele'
  | 'isiXhosa'
  | 'isiZulu'
  | 'Sepedi'
  | 'Sesotho'
  | 'Setswana'
  | 'siSwati'
  | 'Tshivenda'
  | 'Xitsonga'
  | 'Other';

/**
 * Structured address for SETA compliance
 */
export interface SetaAddress {
  building_name?: string;
  unit_number?: string;
  street_number?: string;
  street_name: string;
  suburb: string;
  city: string;
  province: SAProvince;
  postal_code: string;
  country: string;
}

/**
 * Emergency contact details
 */
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone_number: string;
}

/**
 * Employment details for SETA workplace experience
 */
export interface EmploymentDetails {
  company_name: string;
  position: string;
  years_in_position?: number;
  supervisor_name?: string;
  supervisor_phone?: string;
  supervisor_email?: string;
}

export interface User {
  // Identity
  user_id: string;
  user_email: string;
  user_name: string;
  user_type: UserType;

  // Authentication
  user_email_verified: boolean;
  user_created_date: Date;
  user_last_login_date: Date;
  user_auth_provider: AuthProvider;

  // ========================================
  // SETA MANDATORY FIELDS (Tier 3)
  // Per Data-Required-By-SETAs.pdf
  // ========================================

  // Personal Information
  user_title?: PersonTitle;
  user_first_name?: string;
  user_middle_names?: string;
  user_surname?: string;
  user_maiden_name?: string;
  user_preferred_name?: string;  // Name on certificates
  user_gender?: Gender;
  user_date_of_birth?: Date;

  // Identification
  user_id_number?: string;                    // SA ID Number (13 digits)
  user_alternative_id_type?: AlternativeIdType;  // For non-SA citizens
  user_alternative_id_number?: string;
  user_country_of_origin?: string;
  user_citizenship?: string;
  user_citizen_status?: CitizenStatus;
  user_visa_type?: string;

  // Equity Reporting (B-BBEE compliance)
  user_equity_group?: EquityGroup;            // Race - mandatory for SETA
  user_home_language?: HomeLanguage;

  // Disability Status (SETA compliance)
  user_disability_status?: DisabilityStatus;
  user_disability_details?: DisabilityDetails;

  // Contact Information
  user_phone_number?: string;                 // Primary phone
  user_phone_home?: string;
  user_phone_work?: string;
  user_phone_whatsapp?: string;
  user_email_work?: string;
  user_preferred_contact_method?: 'email' | 'phone' | 'whatsapp';
  user_marital_status?: string;

  // Physical Address (Structured for SETA)
  user_physical_address?: string;             // Legacy single field
  user_address?: SetaAddress;                 // Structured address

  // Emergency Contact (SETA requirement)
  user_emergency_contact?: EmergencyContact;

  // Employment Details (for workplace experience modules)
  user_employment?: EmploymentDetails;

  // Academic Background (SETA requirement)
  user_highest_qualification?: HighestQualification;
  user_qualifications_attained?: string[];    // List of qualifications
  user_has_matric?: boolean;
  user_matric_year?: number;
  user_socioeconomic_status?: SocioeconomicStatus;

  // Profile (optional - legacy fields)
  user_preferred_language?: string;
  user_location?: string;

  // Learning Preferences (detected over time)
  user_learning_style?: string;
  user_experience_level?: ExperienceLevel;
  user_preferences?: string[];
  user_challenges?: string[];

  // Company Linkage (Tier 2)
  user_company_id?: string;
  user_company_code_used?: string;

  // Identity Verification (Tier 3) - Section 5.4, 10.3
  user_verification_status: VerificationStatus;
  user_verification_tier: UserTier;
  user_id_document_url?: string;
  user_proof_of_residence_url?: string;
  user_profile_photo_url?: string;
  user_popi_consent_date?: Date;
  user_popi_marketing_consent?: boolean;
  user_popi_photo_consent?: boolean;
  user_verification_submitted_date?: Date;
  user_verification_reviewed_date?: Date;
  user_verification_rejected_reason?: string;

  // Referral Programme
  user_referred_by?: string;
  user_referral_code: string;
  user_karma_balance: number;
  user_karma_lifetime_earned: number;

  // Payment (Post-MVP)
  user_stripe_customer_id?: string;
  user_stripe_connect_account_id?: string;

  // SETA Registration
  user_seta_registration_id?: string;
  user_seta_registration_date?: Date;
  user_seta_learner_number?: string;          // SETA-assigned learner number
}

/**
 * User document for Firestore (with serialized dates)
 */
export interface UserDocument extends Omit<User,
  | 'user_created_date'
  | 'user_last_login_date'
  | 'user_date_of_birth'
  | 'user_seta_registration_date'
  | 'user_popi_consent_date'
  | 'user_verification_submitted_date'
  | 'user_verification_reviewed_date'
> {
  user_created_date: string;
  user_last_login_date: string;
  user_date_of_birth?: string;
  user_seta_registration_date?: string;
  user_popi_consent_date?: string;
  user_verification_submitted_date?: string;
  user_verification_reviewed_date?: string;
}

/**
 * User creation input
 */
export interface CreateUserInput {
  user_email: string;
  user_name: string;
  user_type?: UserType;
  user_auth_provider: AuthProvider;
  user_referred_by?: string;
  user_company_code_used?: string;
}
