/**
 * Summary generation prompts for conversation context management
 * Based on Section 5.4.5 of the specification
 */

import type { Message } from '@amu/shared';

/**
 * Build the system prompt for generating conversation summaries
 */
export function buildSummarySystemPrompt(): string {
  return `You are a learning conversation summariser. Your task is to create a concise but comprehensive summary of a learning conversation session.

The summary should capture:
1. Key concepts discussed and understood
2. Breakthrough moments (when the learner had an "aha!" moment)
3. Areas where the learner struggled
4. Notable responses or examples the learner provided
5. Progress toward learning objectives
6. Any personal context the learner shared that's relevant for future sessions

The summary will be used to maintain context in future conversations, so include details that would help continue the learning journey effectively.

Output your summary in the following JSON format:
{
  "text": "A narrative summary of the session (2-3 paragraphs)",
  "keyInsights": ["Insight 1", "Insight 2", ...],
  "breakthroughs": ["Breakthrough 1", ...],
  "struggles": ["Struggle 1", ...],
  "notableMoments": ["Notable moment 1", ...]
}

Each array should contain 0-5 items. Be specific and concrete in your summaries.`;
}

/**
 * Build the user message for summary generation
 */
export function buildSummaryUserMessage(
  messages: Message[],
  sessionNumber: number,
  learnerName: string,
  moduleTitle: string
): string {
  const conversationText = messages
    .map((m) => `${m.message_role.toUpperCase()}: ${m.message_content}`)
    .join('\n\n');

  return `Please summarise Session ${sessionNumber} of ${learnerName}'s learning conversation in the module "${moduleTitle}".

CONVERSATION:
${conversationText}`;
}

/**
 * Parse the summary response from Claude
 */
export interface ParsedSummary {
  text: string;
  keyInsights: string[];
  breakthroughs: string[];
  struggles: string[];
  notableMoments: string[];
}

export function parseSummaryResponse(response: string): ParsedSummary {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as ParsedSummary;
      return {
        text: parsed.text || '',
        keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
        breakthroughs: Array.isArray(parsed.breakthroughs) ? parsed.breakthroughs : [],
        struggles: Array.isArray(parsed.struggles) ? parsed.struggles : [],
        notableMoments: Array.isArray(parsed.notableMoments) ? parsed.notableMoments : [],
      };
    }
  } catch {
    // If JSON parsing fails, use the whole response as text
  }

  // Fallback: use the response as plain text
  return {
    text: response,
    keyInsights: [],
    breakthroughs: [],
    struggles: [],
    notableMoments: [],
  };
}
