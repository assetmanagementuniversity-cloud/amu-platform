/**
 * Constants for AMU Platform
 */

// Competency assessment levels
export const COMPETENCY_LEVELS = {
  NOT_YET: 'not_yet',
  DEVELOPING: 'developing',
  COMPETENT: 'competent',
} as const;

// Certificate types
export const CERTIFICATE_TYPES = {
  UNOFFICIAL: 'unofficial',
  OFFICIAL: 'official',
} as const;

// Enrolment statuses
export const ENROLMENT_STATUSES = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const;

// Conversation types
export const CONVERSATION_TYPES = {
  INQUIRY: 'inquiry',
  LEARNING: 'learning',
  ASSESSMENT: 'assessment',
} as const;

// Payment statuses
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// Referral tiers
export const REFERRAL_TIERS = {
  TIER_1: 1,
  TIER_2: 2,
} as const;

// Referral commission rates (percentage of list price)
export const REFERRAL_COMMISSION_RATE = 0.1; // 10%
export const REFERRAL_DISCOUNT_RATE = 0.1; // 10%

// Context token budgets (from Section 5.4.4)
export const CONTEXT_TOKEN_BUDGETS = {
  LEARNER_PROFILE: 500,
  COURSE_CONTEXT: 300,
  RECENT_MESSAGES: 2000,
  SUMMARIES: 3000,
  CURRENT_COMPETENCY: 200,
  FACILITATOR_PLAYBOOK: 500,
  CASE_STUDY: 1500,
  TOTAL: 8000,
} as const;

// Summary generation threshold
export const SUMMARY_MESSAGE_THRESHOLD = 10;
export const SUMMARY_MINIMUM_MESSAGES = 5;

// Rate limiting defaults
export const RATE_LIMITS = {
  API_GENERAL: 100, // requests per minute
  API_AI: 20, // requests per minute
  LOGIN_ATTEMPTS: 5, // per 15 minutes
  PASSWORD_RESET: 3, // per hour
  PAYMENT_ATTEMPTS: 10, // per hour
} as const;

// File upload limits (in bytes)
export const FILE_LIMITS = {
  SETA_DOCUMENT: 10 * 1024 * 1024, // 10MB
  ASSIGNMENT: 25 * 1024 * 1024, // 25MB
} as const;

// Supported languages (ISO codes)
export const SUPPORTED_LANGUAGES = [
  'en', // English
  'zu', // Zulu
  'af', // Afrikaans
  'xh', // Xhosa
  'st', // Sotho
  'tn', // Tswana
  'ts', // Tsonga
  've', // Venda
  'ss', // Swazi
  'nr', // Ndebele
  'nso', // Northern Sotho
] as const;

// Default language
export const DEFAULT_LANGUAGE = 'en';

// Currency
export const CURRENCY = 'ZAR';

// Anthropic model configuration
export const ANTHROPIC_CONFIG = {
  MODEL: 'claude-sonnet-4-5-20250514',
  MAX_TOKENS: 2000,
  TEMPERATURE: 1.0,
} as const;
