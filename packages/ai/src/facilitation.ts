/**
 * Core facilitation logic for AI-assisted learning
 */

import type { User, Course, Module, Enrolment, Message, ConversationSummary } from '@amu/shared';
import { SUMMARY_MESSAGE_THRESHOLD, SUMMARY_MINIMUM_MESSAGES } from '@amu/shared';
import { sendMessage, type ClaudeMessage, type ClaudeResponse } from './client';
import {
  buildLearningConversationContext,
  buildInquiryConversationContext,
  needsSummarisation,
  getRecentMessageCount,
  type LearningContext,
} from './context/builder';
import {
  buildSummarySystemPrompt,
  buildSummaryUserMessage,
  parseSummaryResponse,
  type ParsedSummary,
} from './prompts/summary-prompt';

/**
 * Result of a facilitation response
 */
export interface FacilitationResult {
  response: string;
  inputTokens: number;
  outputTokens: number;
  needsSummary: boolean;
}

/**
 * Generate a facilitated response for a learning conversation
 */
export async function generateLearningResponse(
  context: LearningContext,
  userMessage: string
): Promise<FacilitationResult> {
  // Build context
  const { systemPrompt, messages } = buildLearningConversationContext(context);

  // Add the new user message
  const allMessages: ClaudeMessage[] = [
    ...messages,
    { role: 'user', content: userMessage },
  ];

  // Send to Claude
  const response = await sendMessage(systemPrompt, allMessages);

  // Check if we need to generate a summary
  const needsSummary = needsSummarisation(
    context.recentMessages.length + 1,
    context.enrolment.enrolment_conversation_ids.length > 0
      ? response.inputTokens + response.outputTokens
      : 0
  );

  return {
    response: response.content,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    needsSummary,
  };
}

/**
 * Generate a response for an inquiry conversation (pre-enrolment)
 */
export async function generateInquiryResponse(
  recentMessages: Message[],
  userMessage: string
): Promise<FacilitationResult> {
  // Build context
  const { systemPrompt, messages } = buildInquiryConversationContext(recentMessages);

  // Add the new user message
  const allMessages: ClaudeMessage[] = [
    ...messages,
    { role: 'user', content: userMessage },
  ];

  // Send to Claude
  const response = await sendMessage(systemPrompt, allMessages);

  return {
    response: response.content,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    needsSummary: false, // Inquiry conversations don't need summaries
  };
}

/**
 * Generate a conversation summary
 */
export async function generateConversationSummary(
  messages: Message[],
  sessionNumber: number,
  learnerName: string,
  moduleTitle: string
): Promise<{
  summary: ParsedSummary;
  tokensUsed: number;
}> {
  if (messages.length < SUMMARY_MINIMUM_MESSAGES) {
    throw new Error(
      `Cannot generate summary: need at least ${SUMMARY_MINIMUM_MESSAGES} messages, got ${messages.length}`
    );
  }

  const systemPrompt = buildSummarySystemPrompt();
  const userMessage = buildSummaryUserMessage(messages, sessionNumber, learnerName, moduleTitle);

  const response = await sendMessage(systemPrompt, [{ role: 'user', content: userMessage }]);

  const summary = parseSummaryResponse(response.content);

  return {
    summary,
    tokensUsed: response.inputTokens + response.outputTokens,
  };
}

/**
 * Assess competency based on conversation evidence
 */
export interface CompetencyAssessmentResult {
  competencyId: string;
  assessmentResult: 'not_yet' | 'developing' | 'competent';
  evidenceCaptured: string;
  confidence: number;
}

export async function assessCompetency(
  messages: Message[],
  competencyTitle: string,
  competencyDescription: string,
  evidenceCriteria: string[]
): Promise<CompetencyAssessmentResult & { tokensUsed: number }> {
  const systemPrompt = `You are an educational assessor. Evaluate whether the learner has demonstrated competency based on the conversation evidence.

COMPETENCY: ${competencyTitle}
DESCRIPTION: ${competencyDescription}

EVIDENCE CRITERIA (learner must demonstrate all):
${evidenceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Respond with a JSON object:
{
  "assessmentResult": "not_yet" | "developing" | "competent",
  "evidenceCaptured": "Brief summary of evidence observed",
  "confidence": 0.0 to 1.0,
  "criteriaMetStatus": {
    "criterion1": true/false,
    "criterion2": true/false,
    ...
  }
}

Only mark "competent" if ALL criteria are clearly demonstrated. Mark "developing" if some criteria are met. Mark "not_yet" if minimal evidence is present.`;

  const conversationText = messages
    .map((m) => `${m.message_role.toUpperCase()}: ${m.message_content}`)
    .join('\n\n');

  const response = await sendMessage(systemPrompt, [
    { role: 'user', content: `Assess this conversation:\n\n${conversationText}` },
  ]);

  // Parse the response
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        competencyId: '', // To be filled by caller
        assessmentResult: parsed.assessmentResult || 'not_yet',
        evidenceCaptured: parsed.evidenceCaptured || '',
        confidence: parsed.confidence || 0.5,
        tokensUsed: response.inputTokens + response.outputTokens,
      };
    }
  } catch {
    // Fallback
  }

  return {
    competencyId: '',
    assessmentResult: 'not_yet',
    evidenceCaptured: 'Assessment could not be parsed',
    confidence: 0,
    tokensUsed: response.inputTokens + response.outputTokens,
  };
}
