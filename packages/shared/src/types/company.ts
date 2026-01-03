/**
 * Company/Organisation types for AMU Platform
 * Based on Section 5.1.4 and Section 9.1 of the specification
 *
 * Corporate Portal enables B2B relationships:
 * - Bulk learner enrolment
 * - Team progress tracking
 * - Skills Development Act reporting
 * - Custom branding (partner logo)
 */

export type PaymentMethod = 'invoice' | 'prepaid' | 'credit_card';

export type CompanyIndustry =
  | 'manufacturing'
  | 'mining'
  | 'chemical'
  | 'engineering'
  | 'construction'
  | 'utilities'
  | 'transport'
  | 'healthcare'
  | 'education'
  | 'government'
  | 'financial_services'
  | 'retail'
  | 'agriculture'
  | 'technology'
  | 'other';

export interface Company {
  company_id: string;
  company_name: string;
  company_registration_number: string;
  company_tax_number?: string;

  // Branding (Section 9.4, 9.5)
  company_logo_url?: string;
  company_industry: CompanyIndustry;

  // Company Code (for employee signup)
  company_code: string;
  company_referrer_user_id?: string;
  company_discount_active: boolean;

  // Administration (Section 9.1)
  company_admin_user_ids: string[];
  company_training_manager_user_id: string;
  company_created_date: Date;

  // Contact Information
  company_contact_email?: string;
  company_contact_phone?: string;
  company_address?: string;

  // Payment
  company_payment_method: PaymentMethod;
  company_stripe_customer_id?: string;
  company_prepaid_balance?: number;

  // SETA/SDL Information
  company_seta_sector?: string;
  company_sdl_number?: string;

  // Stats (denormalised for dashboard performance)
  company_total_employees: number;
  company_active_learners: number;
  company_certificates_earned: number;
  company_certificates_official: number;
}

/**
 * Company document for Firestore (with serialized dates)
 */
export interface CompanyDocument extends Omit<Company, 'company_created_date'> {
  company_created_date: string;
}

/**
 * Company creation input
 */
export interface CreateCompanyInput {
  company_name: string;
  company_registration_number: string;
  company_tax_number?: string;
  company_industry: CompanyIndustry;
  company_training_manager_user_id: string;
  company_payment_method: PaymentMethod;
  company_referrer_user_id?: string;
  company_logo_url?: string;
  company_contact_email?: string;
  company_seta_sector?: string;
  company_sdl_number?: string;
}

/**
 * Employee progress summary for Team Progress view (Section 24.4)
 */
export interface EmployeeProgress {
  user_id: string;
  user_name: string;
  user_email: string;

  // Current enrolments
  enrolments: EmployeeEnrolmentSummary[];

  // Overall stats
  total_courses_enrolled: number;
  total_courses_completed: number;
  total_competencies_achieved: number;
  last_activity_date?: Date;
}

export interface EmployeeEnrolmentSummary {
  enrolment_id: string;
  course_id: string;
  course_title: string;
  enrolment_status: 'active' | 'completed' | 'paused';
  progress_percentage: number;
  competencies_achieved: number;
  competencies_total: number;
  last_activity_date?: Date;
  certificate_id?: string;
  certificate_is_official?: boolean;
}

/**
 * Team progress aggregate stats
 */
export interface TeamProgressSummary {
  total_employees: number;
  active_learners: number;
  total_enrolments: number;
  completed_courses: number;
  total_competencies_achieved: number;
  official_certificates: number;
  unofficial_certificates: number;

  // Progress by course
  courses_progress: CourseProgressSummary[];
}

export interface CourseProgressSummary {
  course_id: string;
  course_title: string;
  enrolled_count: number;
  completed_count: number;
  average_progress: number;
}

/**
 * Industry display names
 */
export const INDUSTRY_LABELS: Record<CompanyIndustry, string> = {
  manufacturing: 'Manufacturing',
  mining: 'Mining',
  chemical: 'Chemical',
  engineering: 'Engineering',
  construction: 'Construction',
  utilities: 'Utilities',
  transport: 'Transport & Logistics',
  healthcare: 'Healthcare',
  education: 'Education',
  government: 'Government',
  financial_services: 'Financial Services',
  retail: 'Retail',
  agriculture: 'Agriculture',
  technology: 'Technology',
  other: 'Other',
};
