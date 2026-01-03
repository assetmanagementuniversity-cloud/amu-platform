/**
 * Zod validation schemas for AMU Platform
 */

import { z } from 'zod';
import {
  COMPETENCY_LEVELS,
  CERTIFICATE_TYPES,
  ENROLMENT_STATUSES,
  CONVERSATION_TYPES,
  PAYMENT_STATUSES,
  SUPPORTED_LANGUAGES,
} from '../constants';

// ============================================
// Common Schemas
// ============================================

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters');

export const messageContentSchema = z
  .string()
  .min(1, 'Message cannot be empty')
  .max(10000, 'Message must be at most 10,000 characters');

// ============================================
// User Schemas
// ============================================

export const userTypeSchema = z.enum(['learner', 'training_manager']);
export const authProviderSchema = z.enum(['email', 'google']);
export const experienceLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);

export const createUserSchema = z.object({
  user_email: emailSchema,
  user_name: nameSchema,
  user_type: userTypeSchema.optional().default('learner'),
  user_auth_provider: authProviderSchema,
  user_referred_by: z.string().optional(),
  user_company_code_used: z.string().optional(),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// ============================================
// Company Schemas
// ============================================

export const paymentMethodSchema = z.enum(['invoice', 'prepaid', 'credit_card']);

export const createCompanySchema = z.object({
  company_name: z.string().min(2).max(200),
  company_registration_number: z.string().min(1),
  company_tax_number: z.string().optional(),
  company_payment_method: paymentMethodSchema,
  company_referrer_user_id: z.string().optional(),
});

// ============================================
// Course Schemas
// ============================================

export const courseTypeSchema = z.enum(['gfmam', 'qcto_knowledge', 'qcto_practical', 'qcto_work_experience']);
export const courseLevelSchema = z.enum(['foundation', 'intermediate', 'advanced']);
export const assessmentTypeSchema = z.enum(['conversation', 'assignment', 'both']);

// ============================================
// Enrolment Schemas
// ============================================

export const enrolmentStatusSchema = z.enum(['active', 'paused', 'completed', 'abandoned']);
export const competencyStatusSchema = z.enum(['not_yet', 'developing', 'competent']);
export const certificateTypeSchema = z.enum(['unofficial', 'official']);

export const createEnrolmentSchema = z.object({
  enrolment_course_id: z.string().min(1),
  enrolment_language: z.enum(SUPPORTED_LANGUAGES as unknown as [string, ...string[]]).optional(),
});

// ============================================
// Conversation Schemas
// ============================================

export const conversationTypeSchema = z.enum(['inquiry', 'learning', 'assessment']);
export const conversationStatusSchema = z.enum(['active', 'paused', 'completed']);
export const messageRoleSchema = z.enum(['user', 'assistant']);

export const createConversationSchema = z.object({
  conversation_enrolment_id: z.string().optional(),
  conversation_type: conversationTypeSchema,
  conversation_module_id: z.string().optional(),
  conversation_competency_id: z.string().optional(),
});

export const sendMessageSchema = z.object({
  content: messageContentSchema,
});

// ============================================
// Payment Schemas
// ============================================

export const paymentTypeSchema = z.enum(['certificate', 'seta_registration', 'prepaid_credits']);
export const paymentStatusSchema = z.enum(['pending', 'succeeded', 'failed', 'refunded']);

export const createPaymentIntentSchema = z.object({
  certificate_ids: z.array(z.string()).min(1),
  referral_code: z.string().optional(),
});

// ============================================
// Referral Schemas
// ============================================

export const referralStatusSchema = z.enum(['pending', 'converted', 'paid']);
export const referralTierSchema = z.union([z.literal(1), z.literal(2)]);

export const validateReferralCodeSchema = z.object({
  code: z.string().min(1),
});

// ============================================
// Type Exports for Schema Inference
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type CreateEnrolmentInput = z.infer<typeof createEnrolmentSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
