/**
 * @amu/ai - Anthropic Claude API integration for AMU Platform
 */

// Client
export { getAnthropicClient, sendMessage, defaultConfig } from './client';
export type { ClaudeMessage, ClaudeResponse } from './client';

// Prompts
export * from './prompts';

// Context
export * from './context';

// Facilitation
export {
  generateLearningResponse,
  generateInquiryResponse,
  generateConversationSummary,
  assessCompetency,
} from './facilitation';
export type { FacilitationResult, CompetencyAssessmentResult } from './facilitation';

// Verification (Privacy-First AI Verification)
export * from './verification';

// Marketing (Opportunity Detection & Campaign Recommendations)
export * from './marketing';

// Search & Discovery (Natural Language Search & Career Pathways)
export * from './search';
