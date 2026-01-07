/**
 * Type exports for AMU Platform
 * Re-exports all types from individual type files
 */

// User types
export { type UserType, type AuthProvider, type ExperienceLevel, type UserTier, type PersonTitle, type Gender, type EquityGroup, type CitizenStatus, type AlternativeIdType, type DisabilityStatus, type DisabilityDetails, type HighestQualification, type SocioeconomicStatus, type SAProvince, type HomeLanguage, type SetaAddress, type EmergencyContact, type EmploymentDetails, type User, type UserDocument, type CreateUserInput } from './user';

// Company types
export * from './company';

// Course types
export * from './course';

// Enrolment types
export * from './enrolment';

// Conversation types
export * from './conversation';

// Certificate types
export * from './certificate';

// Referral types
export * from './referral';

// Payment types
export * from './payment';

// Verification types (Privacy-First AI Verification)
export * from './verification';

// Content Improvement types (Section 14)
export * from './content-improvement';

// Split Testing types (Section 14.6)
export * from './split-test';

// Team Interface & Learning Autonomy types (Section 4.6, 4.7)
export * from './team-autonomy';

// Financial Transparency types (Section 4.3, 4.8)
export * from './finance';
