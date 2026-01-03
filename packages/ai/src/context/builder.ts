/**
 * Context builder for Claude conversations
 * Implements intelligent context management from Section 5.4.4
 */

import type { User, Course, Module, Enrolment, Message, ConversationSummary, DisputeContext } from '@amu/shared';
import { CONTEXT_TOKEN_BUDGETS } from '@amu/shared';
import {
  buildLearningSystemPrompt,
  buildInquirySystemPrompt,
  type LearnerProfile,
  type CourseContext,
  type CompetencyContext,
} from '../prompts/system-prompt';
import type { ClaudeMessage } from '../client';

/**
 * Context for a learning conversation
 */
export interface LearningContext {
  user: User;
  course: Course;
  module: Module;
  enrolment: Enrolment;
  recentMessages: Message[];
  summaries: ConversationSummary[];
  currentCompetencyId?: string;
  // Privacy-First Dispute Resolution (Section 10.3)
  activeDispute?: DisputeContext;
}

/**
 * Build the system prompt and messages for a learning conversation
 */
export function buildLearningConversationContext(context: LearningContext): {
  systemPrompt: string;
  messages: ClaudeMessage[];
} {
  const { user, course, module, enrolment, recentMessages, summaries, currentCompetencyId, activeDispute } =
    context;

  // Build learner profile
  const learnerProfile: LearnerProfile = {
    name: user.user_name,
    preferredLanguage: user.user_preferred_language,
    location: user.user_location,
    experienceLevel: user.user_experience_level,
    learningStyle: user.user_learning_style,
    preferences: user.user_preferences,
    challenges: user.user_challenges,
  };

  // Build course context
  const courseContext: CourseContext = {
    courseTitle: course.course_title,
    currentModule: {
      title: module.module_title,
      learningObjectives: module.module_learning_objectives,
      caseStudyId: module.module_case_study_id,
    },
    facilitatorPlaybook: module.module_facilitator_playbook,
  };

  // Build competency context if assessing
  let competencyContext: CompetencyContext | undefined;
  if (currentCompetencyId) {
    const competency = module.module_competencies.find(
      (c) => c.competency_id === currentCompetencyId
    );
    if (competency) {
      competencyContext = {
        title: competency.competency_title,
        description: competency.competency_description,
        evidenceCriteria: competency.competency_evidence_criteria,
        currentStatus: enrolment.enrolment_current_competency_status,
      };
    }
  }

  // Build system prompt
  const systemPrompt = buildLearningSystemPrompt({
    learnerProfile,
    courseContext,
    competencyContext,
    conversationSummaries: summaries.slice(-3), // Last 3 summaries max
    activeDispute, // Privacy-first dispute resolution context
  });

  // Convert recent messages to Claude format
  const messages: ClaudeMessage[] = recentMessages.map((m) => ({
    role: m.message_role,
    content: m.message_content,
  }));

  return { systemPrompt, messages };
}

/**
 * Build context for an inquiry conversation (pre-enrolment)
 */
export function buildInquiryConversationContext(recentMessages: Message[]): {
  systemPrompt: string;
  messages: ClaudeMessage[];
} {
  const systemPrompt = buildInquirySystemPrompt();

  const messages: ClaudeMessage[] = recentMessages.map((m) => ({
    role: m.message_role,
    content: m.message_content,
  }));

  return { systemPrompt, messages };
}

/**
 * Estimate token count for a string (rough approximation)
 * Claude uses ~4 characters per token on average for English text
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if context exceeds budget and needs summarisation
 */
export function needsSummarisation(
  messageCount: number,
  totalTokensUsed: number
): boolean {
  // Summarise every 10 messages (from specification)
  if (messageCount > 0 && messageCount % 10 === 0) {
    return true;
  }

  // Or if we're approaching token budget
  if (totalTokensUsed > CONTEXT_TOKEN_BUDGETS.TOTAL * 0.8) {
    return true;
  }

  return false;
}

/**
 * Get the number of recent messages to include based on available token budget
 */
export function getRecentMessageCount(
  summaryCount: number,
  hasCompetencyContext: boolean
): number {
  // Base budget for recent messages
  let availableBudget = CONTEXT_TOKEN_BUDGETS.RECENT_MESSAGES;

  // If we have many summaries, they take up budget
  if (summaryCount > 2) {
    // Reduce message budget as summaries increase
    availableBudget = Math.floor(availableBudget * 0.7);
  }

  // Estimate ~100 tokens per message on average
  // Return between 10-20 messages
  const estimatedCount = Math.floor(availableBudget / 100);
  return Math.max(10, Math.min(20, estimatedCount));
}
