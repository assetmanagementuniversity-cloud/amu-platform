'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth';
import {
  getConversation,
  sendMessage as sendMessageApi,
  createConversation,
  type Conversation,
  type ConversationMessage,
} from '@/lib/api';

// ============================================
// Types
// ============================================

export interface UseConversationOptions {
  conversationId?: string;
  enrolmentId?: string;
  moduleId?: string;
  competencyId?: string;
  type?: 'inquiry' | 'learning' | 'assessment';
  onMessageReceived?: (message: ConversationMessage) => void;
}

export interface UseConversationReturn {
  // State
  conversation: Conversation | null;
  messages: ConversationMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  // Actions
  sendMessage: (content: string) => Promise<boolean>;
  refreshConversation: () => Promise<void>;
  clearError: () => void;
}

// ============================================
// Hook
// ============================================

export function useConversation(
  options: UseConversationOptions = {}
): UseConversationReturn {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationIdRef = useRef<string | null>(options.conversationId || null);

  /**
   * Get Firebase auth token
   */
  const getToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  }, [user]);

  /**
   * Load or create conversation
   */
  const initializeConversation = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      // If we have a conversation ID, load it
      if (conversationIdRef.current) {
        const response = await getConversation(conversationIdRef.current, token);

        if (response.success && response.data) {
          setConversation(response.data);
          setMessages(response.data.messages || []);
        } else {
          setError(response.error?.message || 'Failed to load conversation');
        }
      }
      // Otherwise, create a new conversation if we have the required data
      else if (options.type) {
        const response = await createConversation(
          {
            conversation_type: options.type,
            conversation_enrolment_id: options.enrolmentId,
            conversation_module_id: options.moduleId,
            conversation_competency_id: options.competencyId,
          },
          token
        );

        if (response.success && response.data) {
          conversationIdRef.current = response.data.id;
          setConversation(response.data);
          setMessages([]);
        } else {
          setError(response.error?.message || 'Failed to create conversation');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [user, getToken, options.type, options.enrolmentId, options.moduleId, options.competencyId]);

  /**
   * Refresh conversation data
   */
  const refreshConversation = useCallback(async () => {
    if (!conversationIdRef.current) return;

    const token = await getToken();
    if (!token) return;

    const response = await getConversation(conversationIdRef.current, token);

    if (response.success && response.data) {
      setConversation(response.data);
      setMessages(response.data.messages || []);
    }
  }, [getToken]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!conversationIdRef.current || !content.trim()) {
        return false;
      }

      setIsSending(true);
      setError(null);

      // Optimistically add user message
      const optimisticUserMessage: ConversationMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticUserMessage]);

      try {
        const token = await getToken();
        if (!token) {
          setError('Authentication required');
          // Remove optimistic message
          setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMessage.id));
          return false;
        }

        const response = await sendMessageApi(
          conversationIdRef.current,
          content.trim(),
          token
        );

        if (response.success && response.data) {
          // Replace optimistic message with real one and add assistant response
          setMessages((prev) => {
            const withoutOptimistic = prev.filter(
              (m) => m.id !== optimisticUserMessage.id
            );
            return [
              ...withoutOptimistic,
              response.data!.userMessage,
              response.data!.assistantMessage,
            ];
          });

          // Call callback if provided
          options.onMessageReceived?.(response.data.assistantMessage);

          return true;
        } else {
          // Remove optimistic message on error
          setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMessage.id));
          setError(response.error?.message || 'Failed to send message');
          return false;
        }
      } catch (err) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMessage.id));
        setError(err instanceof Error ? err.message : 'An error occurred');
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [getToken, options]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize conversation on mount or when dependencies change
  useEffect(() => {
    if (options.conversationId) {
      conversationIdRef.current = options.conversationId;
    }
    initializeConversation();
  }, [initializeConversation, options.conversationId]);

  return {
    conversation,
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    refreshConversation,
    clearError,
  };
}
