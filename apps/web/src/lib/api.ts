/**
 * API client for AMU backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
}

/**
 * Make an API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          message: data.error?.message || 'An error occurred',
          code: data.error?.code || 'UNKNOWN_ERROR',
        },
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
      },
    };
  }
}

// ============================================
// Conversation API Types
// ============================================

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  assessment?: {
    competency_id: string;
    status: 'not_yet' | 'developing' | 'competent';
  };
}

export interface Conversation {
  id: string;
  type: 'inquiry' | 'learning' | 'assessment';
  status: 'active' | 'paused' | 'completed';
  enrolmentId?: string;
  moduleId?: string;
  competencyId?: string;
  startedDate: string;
  lastMessageDate?: string;
  messageCount: number;
  totalTokensUsed?: number;
  messages: ConversationMessage[];
}

export interface SendMessageResponse {
  userMessage: ConversationMessage;
  assistantMessage: ConversationMessage;
  tokensUsed: number;
}

// ============================================
// Conversation API Functions
// ============================================

export async function getConversation(
  conversationId: string,
  token: string
): Promise<ApiResponse<Conversation>> {
  return apiRequest<Conversation>(`/api/conversations/${conversationId}`, {
    token,
  });
}

export async function getConversations(
  token: string
): Promise<ApiResponse<Conversation[]>> {
  return apiRequest<Conversation[]>('/api/conversations', { token });
}

export async function createConversation(
  data: {
    conversation_type: 'inquiry' | 'learning' | 'assessment';
    conversation_enrolment_id?: string;
    conversation_module_id?: string;
    conversation_competency_id?: string;
  },
  token: string
): Promise<ApiResponse<Conversation>> {
  return apiRequest<Conversation>('/api/conversations', {
    method: 'POST',
    body: data,
    token,
  });
}

export async function sendMessage(
  conversationId: string,
  content: string,
  token: string
): Promise<ApiResponse<SendMessageResponse>> {
  return apiRequest<SendMessageResponse>(
    `/api/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: { content },
      token,
    }
  );
}
