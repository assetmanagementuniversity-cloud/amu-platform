/**
 * API Services Index - AMU Platform
 *
 * Central export for all API service functions.
 *
 * "Ubuntu - I am because we are"
 */

// Client
export { apiClient, initializeApiClient, ApiClient, ApiRequestError } from './client';
export type { ApiResponse, ApiError, RequestOptions } from './client';

// Courses
export {
  getCourses,
  getCourse,
  getCourseCategories,
  searchCourses,
  getRecommendedCourses,
} from './courses';
export type { Course, CourseModule, CourseListItem, CourseFilters } from './courses';

// Enrolments
export {
  getEnrolments,
  getEnrolment,
  enrollInCourse,
  updateEnrolmentStatus,
  getEnrolmentProgress,
  startModule,
  getActiveEnrolment,
  getLearningStats,
} from './enrolments';
export type {
  Enrolment,
  EnrolmentListItem,
  EnrolmentFilters,
  EnrolmentStatus,
  CompetencyLevel,
  CompetencyProgress,
  ModuleProgress,
} from './enrolments';

// Certificates
export {
  getCertificates,
  getCertificate,
  generateUnofficialCertificate,
  requestOfficialCertificate,
  downloadCertificate,
  verifyCertificate,
  getCertificateForEnrolment,
  checkOfficialCertificateEligibility,
} from './certificates';
export type {
  Certificate,
  CertificateListItem,
  CertificateType,
  CertificateStatus,
  CertificateVerification,
} from './certificates';

// Conversations
export {
  getConversations,
  getConversation,
  startConversation,
  sendMessage,
  getMessages,
  getOrCreateConversation,
  pauseConversation,
  resumeConversation,
  getConversationSummary,
  requestScaffolding,
} from './conversations';
export type {
  Conversation,
  ConversationListItem,
  ConversationWithMessages,
  ConversationStatus,
  Message,
  MessageRole,
  SendMessageResponse,
} from './conversations';
