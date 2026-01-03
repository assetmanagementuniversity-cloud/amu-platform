/**
 * Organisation Types - AMU Corporate Portal
 *
 * Types for the Corporate Portal feature enabling B2B relationships.
 * Re-exports shared types and adds web-specific types.
 */

// Re-export shared types
export type {
  Company,
  CompanyDocument,
  CompanyIndustry,
  CreateCompanyInput,
  PaymentMethod,
  EmployeeProgress,
  EmployeeEnrolmentSummary,
  TeamProgressSummary,
  CourseProgressSummary,
} from '@amu/shared';

export { INDUSTRY_LABELS } from '@amu/shared';

/**
 * Result types for service operations
 */
export interface GetCompanyResult {
  success: boolean;
  company?: Company;
  error?: string;
}

export interface CreateCompanyResult {
  success: boolean;
  company_id?: string;
  company_code?: string;
  error?: string;
}

export interface UpdateCompanyResult {
  success: boolean;
  error?: string;
}

export interface GetTeamProgressResult {
  success: boolean;
  summary?: TeamProgressSummary;
  employees?: EmployeeProgress[];
  error?: string;
}

export interface AddEmployeeResult {
  success: boolean;
  error?: string;
}

export interface RemoveEmployeeResult {
  success: boolean;
  error?: string;
}

/**
 * Import the Company type for local use
 */
import type { Company, TeamProgressSummary, EmployeeProgress } from '@amu/shared';
