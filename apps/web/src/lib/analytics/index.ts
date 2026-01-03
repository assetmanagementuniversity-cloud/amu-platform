/**
 * Analytics Module - AMU Platform
 *
 * Exports for Vision Center analytics services.
 * Per Section 4.2.4 of the Technical Specification.
 *
 * "Ubuntu - I am because we are"
 */

// BigQuery Analytics Service
export {
  // Main streaming function
  streamToBigQuery,

  // BigQuery client
  BigQueryAnalyticsClient,
  getClient,

  // Configuration
  getBigQueryConfig,
  BIGQUERY_TABLES,
  TABLE_PARTITIONING,

  // Event types
  type AnalyticsEventType,
  type BaseAnalyticsEvent,
  type SETARegistrationEvent,
  type CourseCompletionEvent,
  type AnalyticsEvent,

  // Streaming data types
  type SETARegistrationStreamData,
  type CourseCompletionStreamData,
  type StreamResult,

  // Configuration type
  type BigQueryConfig,

  // Utility functions
  hashPII,
  calculateAge,
  generateEventId,
  getEventDate,

  // SQL templates for table creation (reference)
  CREATE_SETA_REGISTRATIONS_SQL,
  CREATE_COURSE_COMPLETIONS_SQL,

  // Example SETA compliance queries (reference)
  SETA_COMPLIANCE_QUERIES,
} from './bigquery';
