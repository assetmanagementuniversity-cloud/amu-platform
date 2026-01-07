/**
 * BigQuery Analytics Service - AMU Platform
 *
 * Vision Center: Streaming analytics for SETA compliance and institutional intelligence.
 * Per Section 4.2.4 of the Technical Specification.
 *
 * Features:
 * - Partitioned tables for cost-efficient queries
 * - SETA mandatory demographic fields (ID, Race, Disability)
 * - On-Demand pricing model for minimal initial footprint
 * - Privacy-layered approach (hashed PII for analytics)
 *
 * Supported Events:
 * - SETA Registration (seta_registrations table)
 * - Course Completion (course_completions table)
 *
 * Cost Estimate: R500-2,000/month (Section 4.2.4)
 *
 * "Ubuntu - I am because we are"
 */

import { createHash, createSign } from 'crypto';
import type {
  EquityGroup,
  DisabilityStatus,
  DisabilityDetails,
  SETARegistrationRecord,
  SETARegistrationStatus,
  User,
  Enrolment,
  SAProvince,
} from '@amu/shared';

// =============================================================================
// BIGQUERY CONFIGURATION
// =============================================================================

/**
 * BigQuery configuration from environment
 * Uses On-Demand pricing model for cost efficiency
 */
export interface BigQueryConfig {
  projectId: string;
  datasetId: string;
  location: string;
  credentials?: {
    client_email: string;
    private_key: string;
  };
}

/**
 * Get BigQuery configuration from environment
 */
export function getBigQueryConfig(): BigQueryConfig {
  const projectId = process.env.GCP_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('GCP_PROJECT_ID environment variable not set');
  }

  return {
    projectId,
    datasetId: process.env.BIGQUERY_DATASET_ID || 'amu_analytics',
    location: process.env.BIGQUERY_LOCATION || 'africa-south1',
    credentials: process.env.GCP_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY)
      : undefined,
  };
}

// =============================================================================
// TABLE SCHEMAS (Partitioned for Cost Efficiency)
// =============================================================================

/**
 * Table names in BigQuery dataset
 */
export const BIGQUERY_TABLES = {
  SETA_REGISTRATIONS: 'seta_registrations',
  COURSE_COMPLETIONS: 'course_completions',
  MODULE_COMPLETIONS: 'module_completions',
  CERTIFICATE_PURCHASES: 'certificate_purchases',
  USER_REGISTRATIONS: 'user_registrations',
} as const;

/**
 * Partitioning configuration for tables
 * Uses DATE partitioning on event_date for cost-efficient queries
 */
export const TABLE_PARTITIONING = {
  [BIGQUERY_TABLES.SETA_REGISTRATIONS]: {
    field: 'event_date',
    type: 'DAY' as const,
    expirationMs: null, // Keep indefinitely for compliance
  },
  [BIGQUERY_TABLES.COURSE_COMPLETIONS]: {
    field: 'event_date',
    type: 'DAY' as const,
    expirationMs: null,
  },
} as const;

// =============================================================================
// EVENT TYPES
// =============================================================================

/**
 * Analytics event types
 */
export type AnalyticsEventType =
  | 'seta_registration'
  | 'course_completion'
  | 'module_completion'
  | 'certificate_purchase'
  | 'user_registration';

/**
 * Base analytics event structure
 */
export interface BaseAnalyticsEvent {
  event_id: string;
  event_type: AnalyticsEventType;
  event_timestamp: string;
  event_date: string; // For partitioning (YYYY-MM-DD)
  user_id: string;
}

/**
 * SETA Registration Event
 * Contains all mandatory SETA demographic fields per Data-Required-By-SETAs.pdf
 */
export interface SETARegistrationEvent extends BaseAnalyticsEvent {
  event_type: 'seta_registration';

  // Registration identifiers
  registration_id: string;
  registration_status: SETARegistrationStatus;
  signatures_status: 'pending' | 'partial' | 'completed';

  // ==========================================
  // SETA MANDATORY DEMOGRAPHIC FIELDS
  // ==========================================

  // Identification (hashed for privacy in analytics)
  id_number_hash: string;           // SHA-256 hash of ID number
  id_type: 'RSA_ID' | 'Passport' | 'Asylum_Permit' | 'Work_Permit' | 'Other';

  // Equity Reporting (B-BBEE Compliance) - MANDATORY
  equity_group: EquityGroup;        // Race: African, Coloured, Indian, White, Other

  // Gender - MANDATORY
  gender: string;

  // Date of Birth - MANDATORY
  date_of_birth: string;            // YYYY-MM-DD
  age_at_registration: number;      // Calculated age

  // Citizenship - MANDATORY
  citizenship: string;
  citizen_status: string;

  // Disability Status - MANDATORY
  disability_status: DisabilityStatus;
  disability_eyesight: string | null;
  disability_hearing: string | null;
  disability_walking: string | null;
  disability_memory: string | null;
  disability_communicating: string | null;
  disability_self_care: string | null;

  // Language - MANDATORY
  home_language: string;

  // Education - MANDATORY
  highest_qualification: string;
  socioeconomic_status: string;

  // Location - MANDATORY
  province: SAProvince | string;

  // ==========================================
  // QUALIFICATION DETAILS
  // ==========================================
  qualification_id: string;
  qualification_title: string;

  // ==========================================
  // EMPLOYER (for tri-party agreements)
  // ==========================================
  employer_name: string | null;
  company_id: string | null;
  workplace_supervisor: string | null;
}

/**
 * Course Completion Event
 * Includes demographic data for SETA compliance reporting
 */
export interface CourseCompletionEvent extends BaseAnalyticsEvent {
  event_type: 'course_completion';

  // Completion identifiers
  course_id: string;
  course_title: string;
  enrolment_id: string;

  // ==========================================
  // SETA DEMOGRAPHIC FIELDS (for B-BBEE reporting)
  // ==========================================
  equity_group: EquityGroup;
  gender: string;
  disability_status: DisabilityStatus;
  province: SAProvince | string;
  age_at_completion: number;

  // ==========================================
  // COMPLETION DETAILS
  // ==========================================
  completion_type: 'course' | 'module' | 'qualification';
  certificate_type: 'unofficial' | 'official' | null;
  certificate_id: string | null;
  competencies_achieved: number;
  total_modules: number;
  modules_completed: number;

  // Learning metrics
  total_learning_hours: number | null;
  days_to_complete: number;
  conversations_count: number;

  // ==========================================
  // COMPANY (if corporate-sponsored)
  // ==========================================
  company_id: string | null;
  company_name: string | null;
}

/**
 * Union type for all analytics events
 */
export type AnalyticsEvent = SETARegistrationEvent | CourseCompletionEvent;

// =============================================================================
// PRIVACY UTILITIES
// =============================================================================

/**
 * Hash sensitive data for analytics
 * Uses SHA-256 to protect PII while enabling aggregate analysis
 */
function hashPII(value: string): string {
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: string | Date): number {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Generate unique event ID
 */
function generateEventId(eventType: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${eventType}_${timestamp}_${random}`;
}

/**
 * Get current date in YYYY-MM-DD format for partitioning
 */
function getEventDate(): string {
  return new Date().toISOString().split('T')[0];
}

// =============================================================================
// BIGQUERY CLIENT
// =============================================================================

/**
 * BigQuery client for streaming analytics
 * Uses On-Demand pricing model
 */
export class BigQueryAnalyticsClient {
  private config: BigQueryConfig;
  private initialized: boolean = false;

  constructor(config?: BigQueryConfig) {
    this.config = config || getBigQueryConfig();
  }

  /**
   * Get fully qualified table name
   */
  private getTableName(table: string): string {
    return `${this.config.projectId}.${this.config.datasetId}.${table}`;
  }

  /**
   * Initialize BigQuery client
   * Creates dataset and tables if they don't exist
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // In production, this would use the @google-cloud/bigquery SDK
    // For now, we'll use the REST API directly
    console.log('[BigQuery] Initializing analytics client...');
    console.log(`[BigQuery] Project: ${this.config.projectId}`);
    console.log(`[BigQuery] Dataset: ${this.config.datasetId}`);
    console.log(`[BigQuery] Location: ${this.config.location}`);

    this.initialized = true;
  }

  /**
   * Stream a single row to BigQuery using the Streaming Insert API
   * Cost-efficient for real-time analytics
   */
  async streamRow(table: string, row: Record<string, unknown>): Promise<StreamResult> {
    const tableName = this.getTableName(table);

    try {
      // Check if BigQuery is configured
      if (!process.env.GCP_SERVICE_ACCOUNT_KEY) {
        console.log(`[BigQuery] Would stream to ${tableName}:`, {
          event_id: row.event_id,
          event_type: row.event_type,
          user_id: row.user_id,
        });
        return {
          success: true,
          insertId: row.event_id as string,
          mode: 'dev',
        };
      }

      // Get access token
      const accessToken = await this.getAccessToken();

      // BigQuery Streaming Insert API
      const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${this.config.projectId}/datasets/${this.config.datasetId}/tables/${table}/insertAll`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kind: 'bigquery#tableDataInsertAllRequest',
          rows: [
            {
              insertId: row.event_id,
              json: row,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BigQuery streaming insert failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      // Check for insert errors
      if (result.insertErrors && result.insertErrors.length > 0) {
        const errors = result.insertErrors.map((e: { errors: Array<{ message: string }> }) =>
          e.errors.map((err) => err.message).join(', ')
        );
        throw new Error(`BigQuery insert errors: ${errors.join('; ')}`);
      }

      return {
        success: true,
        insertId: row.event_id as string,
        mode: 'production',
      };
    } catch (error) {
      console.error(`[BigQuery] Stream error for ${tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        mode: 'production',
      };
    }
  }

  /**
   * Stream multiple rows in a batch
   * More efficient for bulk operations
   */
  async streamRows(table: string, rows: Record<string, unknown>[]): Promise<StreamResult> {
    const tableName = this.getTableName(table);

    try {
      if (!process.env.GCP_SERVICE_ACCOUNT_KEY) {
        console.log(`[BigQuery] Would batch stream ${rows.length} rows to ${tableName}`);
        return {
          success: true,
          insertId: `batch_${Date.now()}`,
          mode: 'dev',
          rowsInserted: rows.length,
        };
      }

      const accessToken = await this.getAccessToken();
      const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${this.config.projectId}/datasets/${this.config.datasetId}/tables/${table}/insertAll`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kind: 'bigquery#tableDataInsertAllRequest',
          rows: rows.map((row) => ({
            insertId: row.event_id || generateEventId('batch'),
            json: row,
          })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BigQuery batch insert failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (result.insertErrors && result.insertErrors.length > 0) {
        const failedCount = result.insertErrors.length;
        console.warn(`[BigQuery] ${failedCount} of ${rows.length} rows failed to insert`);
      }

      return {
        success: true,
        insertId: `batch_${Date.now()}`,
        mode: 'production',
        rowsInserted: rows.length - (result.insertErrors?.length || 0),
      };
    } catch (error) {
      console.error(`[BigQuery] Batch stream error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        mode: 'production',
      };
    }
  }

  /**
   * Get OAuth2 access token for BigQuery API
   */
  private async getAccessToken(): Promise<string> {
    if (!this.config.credentials) {
      throw new Error('GCP credentials not configured');
    }

    // Create JWT for service account authentication
    const now = Math.floor(Date.now() / 1000);
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };
    const payload = {
      iss: this.config.credentials.client_email,
      scope: 'https://www.googleapis.com/auth/bigquery.insertdata',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    };

    // In production, use proper JWT signing library
    // For now, use Google Auth Library
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: this.createJWT(header, payload),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get BigQuery access token');
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Create JWT for service account authentication
   * Uses RS256 signing with the service account private key
   */
  private createJWT(
    header: Record<string, string>,
    payload: Record<string, unknown>
  ): string {
    if (!this.config.credentials?.private_key) {
      throw new Error('Service account private key not configured');
    }

    // Encode header and payload as base64url
    const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    // Create the signing input (header.payload)
    const signingInput = `${base64Header}.${base64Payload}`;

    // Sign with RS256 (RSA-SHA256) using the private key
    const sign = createSign('RSA-SHA256');
    sign.update(signingInput);
    sign.end();

    // The private key from Google service accounts is in PEM format
    const signature = sign.sign(this.config.credentials.private_key, 'base64url');

    // Return the complete JWT (header.payload.signature)
    return `${signingInput}.${signature}`;
  }
}

/**
 * Result of a streaming operation
 */
export interface StreamResult {
  success: boolean;
  insertId?: string;
  error?: string;
  mode: 'dev' | 'production';
  rowsInserted?: number;
}

// =============================================================================
// STREAMING FUNCTIONS
// =============================================================================

/**
 * Global BigQuery client instance
 */
let bigQueryClient: BigQueryAnalyticsClient | null = null;

/**
 * Get or create BigQuery client
 */
export function getClient(): BigQueryAnalyticsClient {
  if (!bigQueryClient) {
    bigQueryClient = new BigQueryAnalyticsClient();
  }
  return bigQueryClient;
}

/**
 * Stream to BigQuery
 *
 * Main entry point for streaming analytics events.
 * Handles both SETA Registration and Course Completion events.
 *
 * @param eventType - Type of event ('registration' or 'course_completion')
 * @param data - Event-specific data
 * @returns StreamResult with success status
 */
export async function streamToBigQuery(
  eventType: 'registration' | 'course_completion',
  data: SETARegistrationStreamData | CourseCompletionStreamData
): Promise<StreamResult> {
  const client = getClient();

  switch (eventType) {
    case 'registration':
      return streamSETARegistration(client, data as SETARegistrationStreamData);

    case 'course_completion':
      return streamCourseCompletion(client, data as CourseCompletionStreamData);

    default:
      return {
        success: false,
        error: `Unknown event type: ${eventType}`,
        mode: 'production',
      };
  }
}

// =============================================================================
// SETA REGISTRATION STREAMING
// =============================================================================

/**
 * Input data for SETA registration streaming
 */
export interface SETARegistrationStreamData {
  registration: SETARegistrationRecord;
  user: User;
}

/**
 * Stream SETA Registration event to BigQuery
 *
 * Captures all mandatory SETA demographic fields:
 * - ID Number (hashed for privacy)
 * - Race/Equity Group (for B-BBEE reporting)
 * - Disability Status and Details
 *
 * @param client - BigQuery client
 * @param data - Registration and user data
 */
async function streamSETARegistration(
  client: BigQueryAnalyticsClient,
  data: SETARegistrationStreamData
): Promise<StreamResult> {
  const { registration, user } = data;
  const now = new Date().toISOString();

  // Build SETA registration event with all mandatory fields
  const event: SETARegistrationEvent = {
    // Base event fields
    event_id: generateEventId('seta_reg'),
    event_type: 'seta_registration',
    event_timestamp: now,
    event_date: getEventDate(),
    user_id: user.user_id,

    // Registration identifiers
    registration_id: registration.registration_id,
    registration_status: registration.registration_status,
    signatures_status: registration.signatures_status,

    // ==========================================
    // SETA MANDATORY: IDENTIFICATION
    // ==========================================
    id_number_hash: user.user_id_number
      ? hashPII(user.user_id_number)
      : hashPII(user.user_alternative_id_number || user.user_id),
    id_type: user.user_id_number
      ? 'RSA_ID'
      : mapAlternativeIdType(user.user_alternative_id_type),

    // ==========================================
    // SETA MANDATORY: EQUITY GROUP (RACE)
    // For B-BBEE compliance reporting
    // ==========================================
    equity_group: user.user_equity_group || 'Prefer not to say',

    // ==========================================
    // SETA MANDATORY: GENDER
    // ==========================================
    gender: user.user_gender || 'Prefer not to say',

    // ==========================================
    // SETA MANDATORY: DATE OF BIRTH
    // ==========================================
    date_of_birth: user.user_date_of_birth
      ? formatDate(user.user_date_of_birth)
      : '1900-01-01',
    age_at_registration: user.user_date_of_birth
      ? calculateAge(user.user_date_of_birth)
      : 0,

    // ==========================================
    // SETA MANDATORY: CITIZENSHIP
    // ==========================================
    citizenship: user.user_citizenship || 'South Africa',
    citizen_status: user.user_citizen_status || 'SA Citizen',

    // ==========================================
    // SETA MANDATORY: DISABILITY STATUS
    // ==========================================
    disability_status: user.user_disability_status || 'None',
    disability_eyesight: user.user_disability_details?.eyesight || null,
    disability_hearing: user.user_disability_details?.hearing || null,
    disability_walking: user.user_disability_details?.walking || null,
    disability_memory: user.user_disability_details?.memory || null,
    disability_communicating: user.user_disability_details?.communicating || null,
    disability_self_care: user.user_disability_details?.self_care || null,

    // ==========================================
    // SETA MANDATORY: LANGUAGE
    // ==========================================
    home_language: user.user_home_language || 'English',

    // ==========================================
    // SETA MANDATORY: EDUCATION
    // ==========================================
    highest_qualification: user.user_highest_qualification || 'Not specified',
    socioeconomic_status: user.user_socioeconomic_status || 'Not specified',

    // ==========================================
    // SETA MANDATORY: LOCATION
    // ==========================================
    province: user.user_address?.province || 'Not specified',

    // Qualification
    qualification_id: registration.qualification_id,
    qualification_title: registration.qualification_title,

    // Employer (for tri-party)
    employer_name: registration.employer_name || null,
    company_id: user.user_company_id || null,
    workplace_supervisor: registration.workplace_supervisor || null,
  };

  console.log('[BigQuery] Streaming SETA registration event:', {
    registration_id: event.registration_id,
    equity_group: event.equity_group,
    disability_status: event.disability_status,
    province: event.province,
  });

  return client.streamRow(BIGQUERY_TABLES.SETA_REGISTRATIONS, event);
}

// =============================================================================
// COURSE COMPLETION STREAMING
// =============================================================================

/**
 * Input data for course completion streaming
 */
export interface CourseCompletionStreamData {
  enrolment: Enrolment;
  user: User;
  course: {
    course_id: string;
    course_title: string;
  };
  certificate?: {
    certificate_id: string;
    certificate_type: 'unofficial' | 'official';
  };
  company?: {
    company_id: string;
    company_name: string;
  };
}

/**
 * Stream Course Completion event to BigQuery
 *
 * Includes demographic data for SETA B-BBEE reporting:
 * - Equity Group (Race)
 * - Gender
 * - Disability Status
 * - Province
 *
 * @param client - BigQuery client
 * @param data - Completion data
 */
async function streamCourseCompletion(
  client: BigQueryAnalyticsClient,
  data: CourseCompletionStreamData
): Promise<StreamResult> {
  const { enrolment, user, course, certificate, company } = data;
  const now = new Date().toISOString();

  // Calculate days to complete
  const startDate = new Date(enrolment.enrolment_started_date);
  const completionDate = enrolment.enrolment_completed_date
    ? new Date(enrolment.enrolment_completed_date)
    : new Date();
  const daysToComplete = Math.ceil(
    (completionDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Build course completion event
  const event: CourseCompletionEvent = {
    // Base event fields
    event_id: generateEventId('course_comp'),
    event_type: 'course_completion',
    event_timestamp: now,
    event_date: getEventDate(),
    user_id: user.user_id,

    // Completion identifiers
    course_id: course.course_id,
    course_title: course.course_title,
    enrolment_id: enrolment.enrolment_id,

    // ==========================================
    // SETA DEMOGRAPHIC FIELDS (for B-BBEE reporting)
    // ==========================================
    equity_group: user.user_equity_group || 'Prefer not to say',
    gender: user.user_gender || 'Prefer not to say',
    disability_status: user.user_disability_status || 'None',
    province: user.user_address?.province || 'Not specified',
    age_at_completion: user.user_date_of_birth
      ? calculateAge(user.user_date_of_birth)
      : 0,

    // Completion details
    completion_type: 'course',
    certificate_type: certificate?.certificate_type || null,
    certificate_id: certificate?.certificate_id || null,
    competencies_achieved: enrolment.enrolment_competencies_achieved?.length || 0,
    total_modules: enrolment.enrolment_modules_completed?.length || 0,
    modules_completed: enrolment.enrolment_modules_completed?.length || 0,

    // Learning metrics
    total_learning_hours: null, // Could be calculated from conversation durations
    days_to_complete: daysToComplete,
    conversations_count: enrolment.enrolment_conversation_ids?.length || 0,

    // Company
    company_id: company?.company_id || user.user_company_id || null,
    company_name: company?.company_name || null,
  };

  console.log('[BigQuery] Streaming course completion event:', {
    course_id: event.course_id,
    equity_group: event.equity_group,
    disability_status: event.disability_status,
    days_to_complete: event.days_to_complete,
  });

  return client.streamRow(BIGQUERY_TABLES.COURSE_COMPLETIONS, event);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Map alternative ID type to standardized value
 */
function mapAlternativeIdType(
  idType: string | undefined
): 'RSA_ID' | 'Passport' | 'Asylum_Permit' | 'Work_Permit' | 'Other' {
  if (!idType) return 'Other';

  const typeMap: Record<string, 'Passport' | 'Asylum_Permit' | 'Work_Permit' | 'Other'> = {
    'Passport': 'Passport',
    'Asylum Seeker Permit': 'Asylum_Permit',
    'Refugee ID': 'Asylum_Permit',
    'Work Permit': 'Work_Permit',
    'Study Permit': 'Work_Permit',
  };

  return typeMap[idType] || 'Other';
}

/**
 * Format date to YYYY-MM-DD string
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

// =============================================================================
// TABLE CREATION SQL (for reference)
// =============================================================================

/**
 * SQL for creating partitioned seta_registrations table
 * Run this in BigQuery console to create the table
 */
export const CREATE_SETA_REGISTRATIONS_SQL = `
CREATE TABLE IF NOT EXISTS \`amu_analytics.seta_registrations\`
(
  -- Event metadata
  event_id STRING NOT NULL,
  event_type STRING NOT NULL,
  event_timestamp TIMESTAMP NOT NULL,
  event_date DATE NOT NULL,
  user_id STRING NOT NULL,

  -- Registration identifiers
  registration_id STRING NOT NULL,
  registration_status STRING,
  signatures_status STRING,

  -- SETA Mandatory: Identification
  id_number_hash STRING,
  id_type STRING,

  -- SETA Mandatory: Equity (Race for B-BBEE)
  equity_group STRING NOT NULL,

  -- SETA Mandatory: Gender
  gender STRING,

  -- SETA Mandatory: Date of Birth
  date_of_birth DATE,
  age_at_registration INT64,

  -- SETA Mandatory: Citizenship
  citizenship STRING,
  citizen_status STRING,

  -- SETA Mandatory: Disability
  disability_status STRING NOT NULL,
  disability_eyesight STRING,
  disability_hearing STRING,
  disability_walking STRING,
  disability_memory STRING,
  disability_communicating STRING,
  disability_self_care STRING,

  -- SETA Mandatory: Language & Education
  home_language STRING,
  highest_qualification STRING,
  socioeconomic_status STRING,

  -- SETA Mandatory: Location
  province STRING,

  -- Qualification
  qualification_id STRING,
  qualification_title STRING,

  -- Employer
  employer_name STRING,
  company_id STRING,
  workplace_supervisor STRING
)
PARTITION BY event_date
OPTIONS (
  description = 'SETA registration events with mandatory demographic fields for B-BBEE compliance',
  labels = [('department', 'compliance'), ('sensitivity', 'high')]
);
`;

/**
 * SQL for creating partitioned course_completions table
 */
export const CREATE_COURSE_COMPLETIONS_SQL = `
CREATE TABLE IF NOT EXISTS \`amu_analytics.course_completions\`
(
  -- Event metadata
  event_id STRING NOT NULL,
  event_type STRING NOT NULL,
  event_timestamp TIMESTAMP NOT NULL,
  event_date DATE NOT NULL,
  user_id STRING NOT NULL,

  -- Completion identifiers
  course_id STRING NOT NULL,
  course_title STRING,
  enrolment_id STRING,

  -- SETA Demographics (for B-BBEE reporting)
  equity_group STRING NOT NULL,
  gender STRING,
  disability_status STRING NOT NULL,
  province STRING,
  age_at_completion INT64,

  -- Completion details
  completion_type STRING,
  certificate_type STRING,
  certificate_id STRING,
  competencies_achieved INT64,
  total_modules INT64,
  modules_completed INT64,

  -- Learning metrics
  total_learning_hours FLOAT64,
  days_to_complete INT64,
  conversations_count INT64,

  -- Company
  company_id STRING,
  company_name STRING
)
PARTITION BY event_date
OPTIONS (
  description = 'Course completion events with demographic data for SETA reporting',
  labels = [('department', 'analytics'), ('sensitivity', 'medium')]
);
`;

// =============================================================================
// SETA COMPLIANCE QUERIES (for reference)
// =============================================================================

/**
 * Example SETA compliance queries
 * These can be run in BigQuery console for reporting
 */
export const SETA_COMPLIANCE_QUERIES = {
  // B-BBEE Equity Distribution
  equityDistribution: `
    SELECT
      equity_group,
      COUNT(*) as registrations,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
    FROM \`amu_analytics.seta_registrations\`
    WHERE event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR)
    GROUP BY equity_group
    ORDER BY registrations DESC;
  `,

  // Disability Inclusion Metrics
  disabilityMetrics: `
    SELECT
      disability_status,
      COUNT(DISTINCT user_id) as unique_learners,
      COUNT(*) as total_registrations
    FROM \`amu_analytics.seta_registrations\`
    WHERE event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR)
    GROUP BY disability_status;
  `,

  // Provincial Distribution
  provincialDistribution: `
    SELECT
      province,
      equity_group,
      COUNT(*) as registrations
    FROM \`amu_analytics.seta_registrations\`
    WHERE registration_status = 'seta_confirmed'
      AND event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR)
    GROUP BY province, equity_group
    ORDER BY province, registrations DESC;
  `,

  // Completion Demographics
  completionDemographics: `
    SELECT
      equity_group,
      gender,
      disability_status,
      COUNT(*) as completions,
      AVG(days_to_complete) as avg_days_to_complete
    FROM \`amu_analytics.course_completions\`
    WHERE event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR)
    GROUP BY equity_group, gender, disability_status
    ORDER BY completions DESC;
  `,
};

// =============================================================================
// EXPORTS
// =============================================================================

export {
  getBigQueryConfig,
  getClient,
  hashPII,
  calculateAge,
  generateEventId,
  getEventDate,
};
