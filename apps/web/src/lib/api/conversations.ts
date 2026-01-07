/**
 * Conversations API Service - AMU Platform
 *
 * API functions for AI-facilitated learning conversations.
 *
 * "Ubuntu - I am because we are"
 */

import { apiClient, ApiRequestError } from './client';

// =============================================================================
// TYPES
// =============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export type ConversationStatus = 'active' | 'paused' | 'completed';

export interface Message {
  message_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  metadata?: {
    competency_assessment?: {
      competency_id: string;
      level: 'not_yet' | 'developing' | 'competent';
      evidence: string;
    };
    scaffolding_applied?: boolean;
    topic_tags?: string[];
  };
}

export interface Conversation {
  conversation_id: string;
  enrolment_id: string;
  module_id: string;
  module_title: string;
  status: ConversationStatus;
  started_at: string;
  last_message_at: string;
  message_count: number;
  current_topic?: string;
  competencies_addressed: string[];
}

export interface ConversationListItem {
  conversation_id: string;
  module_title: string;
  status: ConversationStatus;
  started_at: string;
  last_message_at: string;
  message_count: number;
  preview?: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface SendMessageResponse {
  user_message: Message;
  assistant_message: Message;
  competency_update?: {
    competency_id: string;
    competency_title: string;
    new_level: 'not_yet' | 'developing' | 'competent';
    previous_level?: 'not_yet' | 'developing' | 'competent';
  };
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Get conversations for an enrolment
 */
export async function getConversations(enrolmentId: string): Promise<ConversationListItem[]> {
  const response = await apiClient.get<{ conversations: ConversationListItem[] }>(
    `/conversations?enrolment_id=${enrolmentId}`
  );

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to fetch conversations',
      response.code || 'FETCH_ERROR',
      500
    );
  }

  return response.data.conversations;
}

/**
 * Get a single conversation with messages
 */
export async function getConversation(conversationId: string): Promise<ConversationWithMessages> {
  const response = await apiClient.get<{ conversation: ConversationWithMessages }>(
    `/conversations/${conversationId}`
  );

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Conversation not found',
      response.code || 'NOT_FOUND',
      404
    );
  }

  return response.data.conversation;
}

/**
 * Start a new conversation for a module
 */
export async function startConversation(
  enrolmentId: string,
  moduleId: string
): Promise<ConversationWithMessages> {
  const response = await apiClient.post<{ conversation: ConversationWithMessages }>(
    '/conversations',
    {
      enrolment_id: enrolmentId,
      module_id: moduleId,
    }
  );

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to start conversation',
      response.code || 'START_ERROR',
      500
    );
  }

  return response.data.conversation;
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<SendMessageResponse> {
  const response = await apiClient.post<SendMessageResponse>(
    `/conversations/${conversationId}/messages`,
    { content }
  );

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to send message',
      response.code || 'SEND_ERROR',
      500
    );
  }

  return response.data;
}

/**
 * Get conversation messages with pagination
 */
export async function getMessages(
  conversationId: string,
  options?: { limit?: number; before?: string }
): Promise<Message[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.before) params.set('before', options.before);

  const queryString = params.toString();
  const endpoint = queryString
    ? `/conversations/${conversationId}/messages?${queryString}`
    : `/conversations/${conversationId}/messages`;

  const response = await apiClient.get<{ messages: Message[] }>(endpoint);

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to fetch messages',
      response.code || 'FETCH_ERROR',
      500
    );
  }

  return response.data.messages;
}

/**
 * Get or create active conversation for a module
 */
export async function getOrCreateConversation(
  enrolmentId: string,
  moduleId: string
): Promise<ConversationWithMessages> {
  const response = await apiClient.post<{ conversation: ConversationWithMessages }>(
    '/conversations/get-or-create',
    {
      enrolment_id: enrolmentId,
      module_id: moduleId,
    }
  );

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to get conversation',
      response.code || 'ERROR',
      500
    );
  }

  return response.data.conversation;
}

/**
 * Pause a conversation
 */
export async function pauseConversation(conversationId: string): Promise<Conversation> {
  const response = await apiClient.patch<{ conversation: Conversation }>(
    `/conversations/${conversationId}`,
    { status: 'paused' }
  );

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to pause conversation',
      response.code || 'UPDATE_ERROR',
      500
    );
  }

  return response.data.conversation;
}

/**
 * Resume a paused conversation
 */
export async function resumeConversation(conversationId: string): Promise<Conversation> {
  const response = await apiClient.patch<{ conversation: Conversation }>(
    `/conversations/${conversationId}`,
    { status: 'active' }
  );

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to resume conversation',
      response.code || 'UPDATE_ERROR',
      500
    );
  }

  return response.data.conversation;
}

/**
 * Get conversation summary (for context management)
 */
export async function getConversationSummary(conversationId: string): Promise<{
  summary: string;
  key_points: string[];
  competencies_discussed: string[];
  topics_covered: string[];
}> {
  const response = await apiClient.get<{
    summary: string;
    key_points: string[];
    competencies_discussed: string[];
    topics_covered: string[];
  }>(`/conversations/${conversationId}/summary`);

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to get summary',
      response.code || 'FETCH_ERROR',
      500
    );
  }

  return response.data;
}

/**
 * Request scaffolding support
 * Used when learner indicates they're struggling
 */
export async function requestScaffolding(
  conversationId: string,
  topic?: string
): Promise<Message> {
  const response = await apiClient.post<{ message: Message }>(
    `/conversations/${conversationId}/scaffold`,
    { topic }
  );

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to get scaffolding support',
      response.code || 'SCAFFOLD_ERROR',
      500
    );
  }

  return response.data.message;
}
