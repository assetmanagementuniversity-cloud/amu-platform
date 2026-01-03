/**
 * Team Interface Routes - AMU Platform
 *
 * Section 4.6: Learning Autonomy Framework
 * Section 4.7: Claude Team Interface
 * Section 4.10: Emergency Protocols
 *
 * API endpoints for:
 * - Team dashboard data
 * - Task approval queue
 * - Autonomy management
 * - Emergency controls
 * - Team chat with Claude
 *
 * "Ubuntu - I am because we are"
 */

import { Router } from 'express';
import {
  getTeamDashboardData,
  getAutonomyRegistry,
  grantAutonomy,
  revokeAutonomy,
  setDesignatedApprover,
  getPendingAutonomyRequests,
  respondToAutonomyRequest,
  getAwaitingTasks,
  getTaskQueueSummary,
  respondToTask,
  getRecentActivities,
  getActivitySummary,
  getEmergencyStatus,
  emergencyHaltAllAutonomy,
  restoreAutonomy,
  createEmergencyAction,
  resolveEmergencyAction,
  getOrCreateTeamConversation,
  addTeamChatMessage,
  getTeamChatMessages,
  getUserById,
} from '@amu/database';
import type {
  AutonomyCategory,
  GrantAutonomyInput,
  RevokeAutonomyInput,
  RespondToTaskInput,
  EmergencyHaltInput,
  TeamChatInput,
} from '@amu/shared';
import { createApiError } from '../middleware/error-handler';
import { requireTeamMember, type TeamMemberRequest } from '../middleware/auth';

const router = Router();

// ================================================
// DASHBOARD
// ================================================

/**
 * GET /api/team/dashboard
 * Get complete dashboard data for the current team member
 */
router.get('/dashboard', requireTeamMember, async (req: TeamMemberRequest, res, next) => {
  try {
    const userId = req.userId!;

    // Get user details
    const user = await getUserById(userId);
    if (!user) {
      throw createApiError('User not found', 404, 'NOT_FOUND');
    }

    const dashboardData = await getTeamDashboardData(
      userId,
      user.user_name,
      user.user_email,
      req.teamMemberRole || 'team_member',
      (req.categoriesManaged || []) as AutonomyCategory[]
    );

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
});

// ================================================
// AUTONOMY MANAGEMENT
// ================================================

/**
 * GET /api/team/autonomy
 * Get the autonomy registry
 */
router.get('/autonomy', requireTeamMember, async (_req, res, next) => {
  try {
    const registry = await getAutonomyRegistry();

    res.json({
      success: true,
      data: registry,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/team/autonomy/grant
 * Grant autonomy for a task type
 */
router.post('/autonomy/grant', requireTeamMember, async (req: TeamMemberRequest, res, next) => {
  try {
    const { category, task_type_id, notes } = req.body as GrantAutonomyInput;

    if (!category || !task_type_id) {
      throw createApiError('Category and task_type_id required', 400, 'INVALID_REQUEST');
    }

    const user = await getUserById(req.userId!);
    if (!user) {
      throw createApiError('User not found', 404, 'NOT_FOUND');
    }

    await grantAutonomy(
      category,
      task_type_id,
      req.userId!,
      user.user_name,
      notes
    );

    res.json({
      success: true,
      message: 'Autonomy granted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/team/autonomy/revoke
 * Revoke autonomy for a task type
 */
router.post('/autonomy/revoke', requireTeamMember, async (req: TeamMemberRequest, res, next) => {
  try {
    const { category, task_type_id, reason } = req.body as RevokeAutonomyInput;

    if (!category || !task_type_id || !reason) {
      throw createApiError('Category, task_type_id, and reason required', 400, 'INVALID_REQUEST');
    }

    const user = await getUserById(req.userId!);
    if (!user) {
      throw createApiError('User not found', 404, 'NOT_FOUND');
    }

    await revokeAutonomy(
      category,
      task_type_id,
      req.userId!,
      user.user_name,
      reason
    );

    res.json({
      success: true,
      message: 'Autonomy revoked successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/team/autonomy/set-approver
 * Set designated approver for a category
 */
router.post('/autonomy/set-approver', requireTeamMember, async (req: TeamMemberRequest, res, next) => {
  try {
    const { category, approver_id, approver_name } = req.body as {
      category: AutonomyCategory;
      approver_id: string;
      approver_name: string;
    };

    if (!category || !approver_id || !approver_name) {
      throw createApiError('Category, approver_id, and approver_name required', 400, 'INVALID_REQUEST');
    }

    // Only admins can set approvers
    if (!req.isAdmin) {
      throw createApiError('Admin access required to set approvers', 403, 'FORBIDDEN');
    }

    await setDesignatedApprover(category, approver_id, approver_name);

    res.json({
      success: true,
      message: `Approver set for ${category}`,
    });
  } catch (error) {
    next(error);
  }
});

// ================================================
// AUTONOMY REQUESTS
// ================================================

/**
 * GET /api/team/autonomy/requests
 * Get pending autonomy requests
 */
router.get('/autonomy/requests', requireTeamMember, async (_req, res, next) => {
  try {
    const requests = await getPendingAutonomyRequests();

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/team/autonomy/requests/:id/respond
 * Respond to an autonomy request
 */
router.post('/autonomy/requests/:id/respond', requireTeamMember, async (req: TeamMemberRequest, res, next) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body as { action: 'granted' | 'declined'; notes?: string };

    if (!action || !['granted', 'declined'].includes(action)) {
      throw createApiError('Valid action (granted/declined) required', 400, 'INVALID_REQUEST');
    }

    const user = await getUserById(req.userId!);
    if (!user) {
      throw createApiError('User not found', 404, 'NOT_FOUND');
    }

    await respondToAutonomyRequest(id, action, req.userId!, user.user_name, notes);

    res.json({
      success: true,
      message: `Autonomy request ${action}`,
    });
  } catch (error) {
    next(error);
  }
});

// ================================================
// TASK QUEUE
// ================================================

/**
 * GET /api/team/tasks
 * Get tasks awaiting approval
 */
router.get('/tasks', requireTeamMember, async (req: TeamMemberRequest, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const myTasksOnly = req.query.mine === 'true';

    const tasks = await getAwaitingTasks(myTasksOnly ? req.userId : undefined, limit);

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/team/tasks/summary
 * Get task queue summary
 */
router.get('/tasks/summary', requireTeamMember, async (req: TeamMemberRequest, res, next) => {
  try {
    const myTasksOnly = req.query.mine === 'true';
    const summary = await getTaskQueueSummary(myTasksOnly ? req.userId : undefined);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/team/tasks/:id/respond
 * Respond to a task
 */
router.post('/tasks/:id/respond', requireTeamMember, async (req: TeamMemberRequest, res, next) => {
  try {
    const { id } = req.params;
    const { action, modification_notes, final_response } = req.body as RespondToTaskInput;

    if (!action || !['approved', 'modified', 'rejected', 'escalated'].includes(action)) {
      throw createApiError('Valid action required', 400, 'INVALID_REQUEST');
    }

    const user = await getUserById(req.userId!);
    if (!user) {
      throw createApiError('User not found', 404, 'NOT_FOUND');
    }

    await respondToTask(
      id,
      action,
      req.userId!,
      user.user_name,
      modification_notes,
      final_response
    );

    res.json({
      success: true,
      message: `Task ${action}`,
    });
  } catch (error) {
    next(error);
  }
});

// ================================================
// ACTIVITY LOG
// ================================================

/**
 * GET /api/team/activities
 * Get recent activities
 */
router.get('/activities', requireTeamMember, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const activities = await getRecentActivities(limit);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/team/activities/summary
 * Get activity summary
 */
router.get('/activities/summary', requireTeamMember, async (req, res, next) => {
  try {
    const period = (req.query.period as 'today' | 'this_week' | 'this_month') || 'today';
    const summary = await getActivitySummary(period);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
});

// ================================================
// EMERGENCY CONTROLS
// ================================================

/**
 * GET /api/team/emergency/status
 * Get current emergency status
 */
router.get('/emergency/status', requireTeamMember, async (_req, res, next) => {
  try {
    const status = await getEmergencyStatus();

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/team/emergency/halt-all
 * Emergency halt all autonomy (any team member can do this)
 */
router.post('/emergency/halt-all', requireTeamMember, async (req: TeamMemberRequest, res, next) => {
  try {
    const { reason } = req.body as { reason: string };

    if (!reason) {
      throw createApiError('Reason required for emergency halt', 400, 'INVALID_REQUEST');
    }

    const user = await getUserById(req.userId!);
    if (!user) {
      throw createApiError('User not found', 404, 'NOT_FOUND');
    }

    const action = await emergencyHaltAllAutonomy(req.userId!, user.user_name, reason);

    res.json({
      success: true,
      message: 'EMERGENCY: All autonomy halted. Claude will now ask for approval on all actions.',
      data: action,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/team/emergency/restore
 * Restore autonomy after emergency
 */
router.post('/emergency/restore', requireTeamMember, async (req: TeamMemberRequest, res, next) => {
  try {
    const { notes } = req.body as { notes: string };

    if (!notes) {
      throw createApiError('Notes required for restoration', 400, 'INVALID_REQUEST');
    }

    const user = await getUserById(req.userId!);
    if (!user) {
      throw createApiError('User not found', 404, 'NOT_FOUND');
    }

    await restoreAutonomy(req.userId!, user.user_name, notes);

    res.json({
      success: true,
      message: 'Autonomy restored. Claude will resume autonomous operations per granted trust.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/team/emergency/action
 * Create a specific emergency action
 */
router.post('/emergency/action', requireTeamMember, async (req: TeamMemberRequest, res, next) => {
  try {
    const { action_type, reason, scope, category, task_type_id } = req.body as EmergencyHaltInput;

    if (!action_type || !reason) {
      throw createApiError('Action type and reason required', 400, 'INVALID_REQUEST');
    }

    const user = await getUserById(req.userId!);
    if (!user) {
      throw createApiError('User not found', 404, 'NOT_FOUND');
    }

    const action = await createEmergencyAction(
      action_type,
      'level_2',
      `Emergency: ${action_type}`,
      reason,
      scope || 'Not specified',
      req.userId!,
      user.user_name,
      ['Affected systems'],
      undefined
    );

    res.json({
      success: true,
      message: `Emergency action created: ${action_type}`,
      data: action,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/team/emergency/:id/resolve
 * Resolve an emergency action
 */
router.post('/emergency/:id/resolve', requireTeamMember, async (req: TeamMemberRequest, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body as { notes: string };

    if (!notes) {
      throw createApiError('Resolution notes required', 400, 'INVALID_REQUEST');
    }

    const user = await getUserById(req.userId!);
    if (!user) {
      throw createApiError('User not found', 404, 'NOT_FOUND');
    }

    await resolveEmergencyAction(id, req.userId!, user.user_name, notes);

    res.json({
      success: true,
      message: 'Emergency resolved',
    });
  } catch (error) {
    next(error);
  }
});

// ================================================
// TEAM CHAT WITH CLAUDE
// ================================================

/**
 * GET /api/team/chat
 * Get or create team chat conversation
 */
router.get('/chat', requireTeamMember, async (req: TeamMemberRequest, res, next) => {
  try {
    const user = await getUserById(req.userId!);
    if (!user) {
      throw createApiError('User not found', 404, 'NOT_FOUND');
    }

    const conversation = await getOrCreateTeamConversation(req.userId!, user.user_name);

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/team/chat/:conversationId/messages
 * Get messages for a conversation
 */
router.get('/chat/:conversationId/messages', requireTeamMember, async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const messages = await getTeamChatMessages(conversationId, limit);

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/team/chat/message
 * Send a message to Claude
 */
router.post('/chat/message', requireTeamMember, async (req: TeamMemberRequest, res, next) => {
  try {
    const { conversation_id, message, related_task_id } = req.body as TeamChatInput;

    if (!message) {
      throw createApiError('Message required', 400, 'INVALID_REQUEST');
    }

    const user = await getUserById(req.userId!);
    if (!user) {
      throw createApiError('User not found', 404, 'NOT_FOUND');
    }

    // Get or create conversation
    let conversationId = conversation_id;
    if (!conversationId) {
      const conversation = await getOrCreateTeamConversation(req.userId!, user.user_name);
      conversationId = conversation.conversation_id;
    }

    // Add user's message
    const userMessage = await addTeamChatMessage(
      conversationId,
      'team_member',
      message,
      req.userId,
      user.user_name
    );

    // TODO: In a real implementation, this would call Claude API
    // For now, we'll add a placeholder response
    const claudeResponse = `I understand you're asking about: "${message.substring(0, 100)}...". ` +
      `I'm Claude, your AI team member. I'm here to help with operations, answer questions, ` +
      `and assist with tasks. How can I help you further?`;

    const claudeMessage = await addTeamChatMessage(
      conversationId,
      'claude',
      claudeResponse
    );

    res.json({
      success: true,
      data: {
        conversation_id: conversationId,
        user_message: userMessage,
        claude_response: claudeMessage,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
