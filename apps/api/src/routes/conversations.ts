/**
 * Conversations routes - Core AI facilitation endpoints
 */

import { Router } from 'express';
import {
  createConversation,
  getConversationById,
  getConversationsByUserId,
  getRecentMessages,
  getRecentSummaries,
  addMessage,
  createSummary,
  addConversationToEnrolment,
  getEnrolmentById,
  getUserById,
  getCourseById,
  getModuleById,
} from '@amu/database';
import {
  generateLearningResponse,
  generateInquiryResponse,
  generateConversationSummary,
} from '@amu/ai';
import { createConversationSchema, sendMessageSchema, SUMMARY_MESSAGE_THRESHOLD } from '@amu/shared';
import { createApiError } from '../middleware/error-handler';
import { requireAuth, optionalAuth, type AuthenticatedRequest } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rate-limit';

const router = Router();

/**
 * GET /api/conversations
 * Get all conversations for current user
 */
router.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const conversations = await getConversationsByUserId(req.userId);

    res.json({
      success: true,
      data: conversations.map((conv) => ({
        id: conv.conversation_id,
        type: conv.conversation_type,
        status: conv.conversation_status,
        enrolmentId: conv.conversation_enrolment_id,
        moduleId: conv.conversation_module_id,
        startedDate: conv.conversation_started_date,
        lastMessageDate: conv.conversation_last_message_date,
        messageCount: conv.conversation_message_count,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/conversations
 * Create a new conversation
 */
router.post('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const input = createConversationSchema.parse(req.body);

    // Create conversation
    const conversation = await createConversation({
      conversation_user_id: req.userId,
      conversation_enrolment_id: input.conversation_enrolment_id,
      conversation_type: input.conversation_type,
      conversation_module_id: input.conversation_module_id,
      conversation_competency_id: input.conversation_competency_id,
    });

    // Link to enrolment if provided
    if (input.conversation_enrolment_id) {
      await addConversationToEnrolment(input.conversation_enrolment_id, conversation.conversation_id);
    }

    res.status(201).json({
      success: true,
      data: {
        id: conversation.conversation_id,
        type: conversation.conversation_type,
        status: conversation.conversation_status,
        enrolmentId: conversation.conversation_enrolment_id,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/conversations/:conversationId
 * Get conversation details with recent messages
 */
router.get('/:conversationId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { conversationId } = req.params;
    const conversation = await getConversationById(conversationId);

    if (!conversation) {
      throw createApiError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    // Verify ownership
    if (conversation.conversation_user_id !== req.userId) {
      throw createApiError('Not authorized to view this conversation', 403, 'FORBIDDEN');
    }

    // Get recent messages
    const messages = await getRecentMessages(conversationId, 50);

    res.json({
      success: true,
      data: {
        id: conversation.conversation_id,
        type: conversation.conversation_type,
        status: conversation.conversation_status,
        enrolmentId: conversation.conversation_enrolment_id,
        moduleId: conversation.conversation_module_id,
        competencyId: conversation.conversation_competency_id,
        startedDate: conversation.conversation_started_date,
        lastMessageDate: conversation.conversation_last_message_date,
        messageCount: conversation.conversation_message_count,
        totalTokensUsed: conversation.conversation_total_tokens_used,
        messages: messages.map((msg) => ({
          id: msg.message_id,
          role: msg.message_role,
          content: msg.message_content,
          timestamp: msg.message_timestamp,
          assessment: msg.message_competency_assessment,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/conversations/:conversationId/messages
 * Send a message and get AI response
 */
router.post(
  '/:conversationId/messages',
  requireAuth,
  aiRateLimiter,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.userId) {
        throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      const { conversationId } = req.params;
      const input = sendMessageSchema.parse(req.body);

      // Get conversation
      const conversation = await getConversationById(conversationId);
      if (!conversation) {
        throw createApiError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
      }

      // Verify ownership
      if (conversation.conversation_user_id !== req.userId) {
        throw createApiError('Not authorized', 403, 'FORBIDDEN');
      }

      // Save user message
      const userMessage = await addMessage(conversationId, 'user', input.content);

      // Generate AI response based on conversation type
      let aiResponse: { response: string; inputTokens: number; outputTokens: number; needsSummary: boolean };

      if (conversation.conversation_type === 'inquiry') {
        // Inquiry conversation (pre-enrolment)
        const recentMessages = await getRecentMessages(conversationId, 20);
        aiResponse = await generateInquiryResponse(recentMessages, input.content);
      } else {
        // Learning conversation - need full context
        const user = await getUserById(req.userId);
        if (!user) {
          throw createApiError('User not found', 404, 'USER_NOT_FOUND');
        }

        if (!conversation.conversation_enrolment_id) {
          throw createApiError('Learning conversation requires enrolment', 400, 'ENROLMENT_REQUIRED');
        }

        const enrolment = await getEnrolmentById(conversation.conversation_enrolment_id);
        if (!enrolment) {
          throw createApiError('Enrolment not found', 404, 'ENROLMENT_NOT_FOUND');
        }

        const course = await getCourseById(enrolment.enrolment_course_id);
        if (!course) {
          throw createApiError('Course not found', 404, 'COURSE_NOT_FOUND');
        }

        const module = await getModuleById(enrolment.enrolment_current_module_id);
        if (!module) {
          throw createApiError('Module not found', 404, 'MODULE_NOT_FOUND');
        }

        const recentMessages = await getRecentMessages(conversationId, 20);
        const summaries = await getRecentSummaries(conversationId, 3);

        aiResponse = await generateLearningResponse(
          {
            user,
            course,
            module,
            enrolment,
            recentMessages,
            summaries,
            currentCompetencyId: conversation.conversation_competency_id,
          },
          input.content
        );
      }

      // Save AI response
      const assistantMessage = await addMessage(
        conversationId,
        'assistant',
        aiResponse.response,
        { input: aiResponse.inputTokens, output: aiResponse.outputTokens }
      );

      // Generate summary if needed
      if (aiResponse.needsSummary && conversation.conversation_message_count >= SUMMARY_MESSAGE_THRESHOLD) {
        try {
          const user = await getUserById(req.userId);
          const enrolment = conversation.conversation_enrolment_id
            ? await getEnrolmentById(conversation.conversation_enrolment_id)
            : null;

          const messagesForSummary = await getRecentMessages(conversationId, SUMMARY_MESSAGE_THRESHOLD);

          const summaryResult = await generateConversationSummary(
            messagesForSummary,
            conversation.conversation_summary_count + 1,
            user?.user_name || 'Learner',
            enrolment?.enrolment_current_module_title || 'Unknown Module'
          );

          await createSummary(
            conversationId,
            conversation.conversation_summary_count + 1,
            messagesForSummary[0]?.message_id || '',
            messagesForSummary[messagesForSummary.length - 1]?.message_id || '',
            messagesForSummary.length,
            {
              text: summaryResult.summary.text,
              keyInsights: summaryResult.summary.keyInsights,
              breakthroughs: summaryResult.summary.breakthroughs,
              struggles: summaryResult.summary.struggles,
              notableMoments: summaryResult.summary.notableMoments,
            },
            summaryResult.tokensUsed
          );
        } catch (summaryError) {
          // Log but don't fail the request
          console.error('Failed to generate summary:', summaryError);
        }
      }

      res.json({
        success: true,
        data: {
          userMessage: {
            id: userMessage.message_id,
            role: userMessage.message_role,
            content: userMessage.message_content,
            timestamp: userMessage.message_timestamp,
          },
          assistantMessage: {
            id: assistantMessage.message_id,
            role: assistantMessage.message_role,
            content: assistantMessage.message_content,
            timestamp: assistantMessage.message_timestamp,
          },
          tokensUsed: aiResponse.inputTokens + aiResponse.outputTokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
