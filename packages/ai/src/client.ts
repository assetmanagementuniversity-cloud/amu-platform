/**
 * Anthropic Claude API client configuration
 */

import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_CONFIG } from '@amu/shared';

let anthropicClient: Anthropic | null = null;

/**
 * Initialize and get the Anthropic client
 */
export function getAnthropicClient(): Anthropic {
  if (anthropicClient) {
    return anthropicClient;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  anthropicClient = new Anthropic({
    apiKey,
  });

  return anthropicClient;
}

/**
 * Default configuration for Claude API calls
 */
export const defaultConfig = {
  model: ANTHROPIC_CONFIG.MODEL,
  max_tokens: ANTHROPIC_CONFIG.MAX_TOKENS,
  temperature: ANTHROPIC_CONFIG.TEMPERATURE,
};

export type MessageRole = 'user' | 'assistant';

export interface ClaudeMessage {
  role: MessageRole;
  content: string;
}

export interface ClaudeResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  stopReason: string;
}

/**
 * Send a message to Claude and get a response
 */
export async function sendMessage(
  systemPrompt: string,
  messages: ClaudeMessage[],
  options?: Partial<typeof defaultConfig>
): Promise<ClaudeResponse> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    ...defaultConfig,
    ...options,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  // Extract text content from response
  const textContent = response.content.find((block) => block.type === 'text');
  const content = textContent && 'text' in textContent ? textContent.text : '';

  return {
    content,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    stopReason: response.stop_reason || 'unknown',
  };
}
