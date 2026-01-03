/**
 * Team Autonomy Collection Operations - AMU Platform
 *
 * Section 4.6: Learning Autonomy Framework
 * Section 4.7: Claude Team Interface
 * Section 4.10: Emergency Protocols
 *
 * Database operations for:
 * - Autonomy settings registry
 * - Task approval queue
 * - Activity logging
 * - Emergency controls
 *
 * "Ubuntu - I am because we are"
 */

import { getFirestore, FieldValue } from '../config/firebase-admin';
import type {
  AutonomyCategory,
  AutonomyRegistry,
  CategoryAutonomy,
  TaskType,
  AutonomyRequest,
  ClaudeTask,
  ClaudeTaskStatus,
  TaskPriority,
  ClaudeActivity,
  ActivityType,
  ActivitySummary,
  EmergencyAction,
  EmergencyActionType,
  EmergencyLevel,
  EmergencyStatus,
  TeamChatMessage,
  TeamChatConversation,
  TeamDashboardData,
  TaskQueueSummary,
  DEFAULT_TASK_TYPES,
  AUTONOMY_REQUEST_THRESHOLD,
} from '@amu/shared';

// Collection names
const COLLECTIONS = {
  AUTONOMY_REGISTRY: 'autonomy_registry',
  AUTONOMY_REQUESTS: 'autonomy_requests',
  CLAUDE_TASKS: 'claude_tasks',
  CLAUDE_ACTIVITIES: 'claude_activities',
  EMERGENCY_ACTIONS: 'emergency_actions',
  TEAM_CHAT_CONVERSATIONS: 'team_chat_conversations',
  TEAM_CHAT_MESSAGES: 'team_chat_messages',
};

// ================================================
// AUTONOMY REGISTRY OPERATIONS
// ================================================

/**
 * Get or create the global autonomy registry
 */
export async function getAutonomyRegistry(): Promise<AutonomyRegistry> {
  const db = getFirestore();
  const doc = await db.collection(COLLECTIONS.AUTONOMY_REGISTRY).doc('global').get();

  if (!doc.exists) {
    // Create default registry
    return await createDefaultAutonomyRegistry();
  }

  return doc.data() as AutonomyRegistry;
}

/**
 * Create the default autonomy registry with all categories
 */
async function createDefaultAutonomyRegistry(): Promise<AutonomyRegistry> {
  const db = getFirestore();
  const now = new Date().toISOString();

  // Import DEFAULT_TASK_TYPES dynamically to avoid circular dependency
  const defaultTaskTypes: Record<AutonomyCategory, Omit<TaskType, 'task_type_id'>[]> = {
    support: [
      {
        category: 'support',
        name: 'Pricing queries',
        description: 'Standard questions about pricing, discounts, and referral codes',
        example_actions: ['Respond with pricing table', 'Explain referral discount'],
        status: 'ask_first',
        total_handled: 0,
        approved_count: 0,
        modified_count: 0,
        rejected_count: 0,
        success_streak: 0,
      },
      {
        category: 'support',
        name: 'FAQ responses',
        description: 'Common questions with standard answers',
        example_actions: ['Answer course duration questions', 'Explain certificate process'],
        status: 'ask_first',
        total_handled: 0,
        approved_count: 0,
        modified_count: 0,
        rejected_count: 0,
        success_streak: 0,
      },
      {
        category: 'support',
        name: 'Progress updates',
        description: 'Informing learners about their progress',
        example_actions: ['Send progress summary', 'Congratulate on completion'],
        status: 'ask_first',
        total_handled: 0,
        approved_count: 0,
        modified_count: 0,
        rejected_count: 0,
        success_streak: 0,
      },
      {
        category: 'support',
        name: 'Certificate delivery',
        description: 'Sending completed certificates to learners',
        example_actions: ['Email certificate PDF', 'Provide download link'],
        status: 'ask_first',
        total_handled: 0,
        approved_count: 0,
        modified_count: 0,
        rejected_count: 0,
        success_streak: 0,
      },
    ],
    finance: [
      {
        category: 'finance',
        name: 'Invoice categorisation',
        description: 'Categorising incoming invoices to correct expense accounts',
        example_actions: ['Assign to marketing expense', 'Flag as infrastructure cost'],
        status: 'ask_first',
        total_handled: 0,
        approved_count: 0,
        modified_count: 0,
        rejected_count: 0,
        success_streak: 0,
      },
      {
        category: 'finance',
        name: 'Report generation',
        description: 'Generating financial reports from Xero data',
        example_actions: ['Monthly P&L report', 'Revenue breakdown by course'],
        status: 'ask_first',
        total_handled: 0,
        approved_count: 0,
        modified_count: 0,
        rejected_count: 0,
        success_streak: 0,
      },
    ],
    marketing: [
      {
        category: 'marketing',
        name: 'Social media posts',
        description: 'Publishing content to social media platforms',
        example_actions: ['Post learner success story', 'Share course announcement'],
        status: 'ask_first',
        total_handled: 0,
        approved_count: 0,
        modified_count: 0,
        rejected_count: 0,
        success_streak: 0,
      },
      {
        category: 'marketing',
        name: 'Newsletter content',
        description: 'Creating and sending newsletter emails',
        example_actions: ['Draft weekly newsletter', 'Announce new course'],
        status: 'ask_first',
        total_handled: 0,
        approved_count: 0,
        modified_count: 0,
        rejected_count: 0,
        success_streak: 0,
      },
    ],
    tech: [
      {
        category: 'tech',
        name: 'Monitoring responses',
        description: 'Responding to system monitoring alerts',
        example_actions: ['Acknowledge alert', 'Scale up resources'],
        status: 'ask_first',
        total_handled: 0,
        approved_count: 0,
        modified_count: 0,
        rejected_count: 0,
        success_streak: 0,
      },
      {
        category: 'tech',
        name: 'Bug fixes',
        description: 'Fixing identified bugs in the codebase',
        example_actions: ['Patch security issue', 'Fix UI bug'],
        status: 'ask_first',
        total_handled: 0,
        approved_count: 0,
        modified_count: 0,
        rejected_count: 0,
        success_streak: 0,
      },
    ],
    compliance: [
      {
        category: 'compliance',
        name: 'Report preparation',
        description: 'Preparing compliance and regulatory reports',
        example_actions: ['Draft SETA report', 'Compile audit data'],
        status: 'ask_first',
        total_handled: 0,
        approved_count: 0,
        modified_count: 0,
        rejected_count: 0,
        success_streak: 0,
      },
    ],
  };

  const categories: CategoryAutonomy[] = (
    ['support', 'finance', 'marketing', 'tech', 'compliance'] as AutonomyCategory[]
  ).map((category) => ({
    category,
    designated_approver_id: '',  // To be set by admin
    designated_approver_name: '',
    task_types: (defaultTaskTypes[category] || []).map((tt, index) => ({
      ...tt,
      task_type_id: `${category}_${index + 1}`,
    })),
    overall_autonomous_percentage: 0,
    total_actions_today: 0,
    total_actions_this_week: 0,
    created_at: now,
    updated_at: now,
  }));

  const registry: AutonomyRegistry = {
    registry_id: 'global',
    categories,
    global_emergency_halt: false,
    last_updated: now,
  };

  await db.collection(COLLECTIONS.AUTONOMY_REGISTRY).doc('global').set(registry);

  return registry;
}

/**
 * Grant autonomy for a specific task type
 */
export async function grantAutonomy(
  category: AutonomyCategory,
  taskTypeId: string,
  grantedById: string,
  grantedByName: string,
  notes?: string
): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const registry = await getAutonomyRegistry();
  const categoryIndex = registry.categories.findIndex((c) => c.category === category);

  if (categoryIndex === -1) {
    throw new Error(`Category ${category} not found`);
  }

  const taskTypeIndex = registry.categories[categoryIndex].task_types.findIndex(
    (tt) => tt.task_type_id === taskTypeId
  );

  if (taskTypeIndex === -1) {
    throw new Error(`Task type ${taskTypeId} not found in category ${category}`);
  }

  // Update the task type
  registry.categories[categoryIndex].task_types[taskTypeIndex].status = 'autonomous';
  registry.categories[categoryIndex].task_types[taskTypeIndex].granted_by = grantedById;
  registry.categories[categoryIndex].task_types[taskTypeIndex].granted_at = now;

  // Recalculate percentage
  const taskTypes = registry.categories[categoryIndex].task_types;
  const autonomousCount = taskTypes.filter((tt) => tt.status === 'autonomous').length;
  registry.categories[categoryIndex].overall_autonomous_percentage =
    Math.round((autonomousCount / taskTypes.length) * 100);

  registry.last_updated = now;

  await db.collection(COLLECTIONS.AUTONOMY_REGISTRY).doc('global').set(registry);

  // Log the activity
  await logActivity({
    activity_type: 'autonomy_granted',
    category,
    title: `Autonomy granted: ${registry.categories[categoryIndex].task_types[taskTypeIndex].name}`,
    description: notes || `${grantedByName} granted autonomy for ${registry.categories[categoryIndex].task_types[taskTypeIndex].name}`,
    action_taken: 'Autonomy status changed to autonomous',
    was_autonomous: false,
    claude_initiated: false,
    team_member_id: grantedById,
    team_member_name: grantedByName,
  });
}

/**
 * Revoke autonomy for a specific task type
 */
export async function revokeAutonomy(
  category: AutonomyCategory,
  taskTypeId: string,
  revokedById: string,
  revokedByName: string,
  reason: string
): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const registry = await getAutonomyRegistry();
  const categoryIndex = registry.categories.findIndex((c) => c.category === category);

  if (categoryIndex === -1) {
    throw new Error(`Category ${category} not found`);
  }

  const taskTypeIndex = registry.categories[categoryIndex].task_types.findIndex(
    (tt) => tt.task_type_id === taskTypeId
  );

  if (taskTypeIndex === -1) {
    throw new Error(`Task type ${taskTypeId} not found in category ${category}`);
  }

  const taskTypeName = registry.categories[categoryIndex].task_types[taskTypeIndex].name;

  // Update the task type
  registry.categories[categoryIndex].task_types[taskTypeIndex].status = 'ask_first';
  registry.categories[categoryIndex].task_types[taskTypeIndex].revoked_by = revokedById;
  registry.categories[categoryIndex].task_types[taskTypeIndex].revoked_at = now;
  registry.categories[categoryIndex].task_types[taskTypeIndex].revoke_reason = reason;
  registry.categories[categoryIndex].task_types[taskTypeIndex].success_streak = 0;

  // Recalculate percentage
  const taskTypes = registry.categories[categoryIndex].task_types;
  const autonomousCount = taskTypes.filter((tt) => tt.status === 'autonomous').length;
  registry.categories[categoryIndex].overall_autonomous_percentage =
    Math.round((autonomousCount / taskTypes.length) * 100);

  registry.last_updated = now;

  await db.collection(COLLECTIONS.AUTONOMY_REGISTRY).doc('global').set(registry);

  // Log the activity
  await logActivity({
    activity_type: 'autonomy_revoked',
    category,
    title: `Autonomy revoked: ${taskTypeName}`,
    description: `${revokedByName} revoked autonomy. Reason: ${reason}`,
    action_taken: 'Autonomy status changed to ask_first',
    was_autonomous: false,
    claude_initiated: false,
    team_member_id: revokedById,
    team_member_name: revokedByName,
  });
}

/**
 * Check if Claude has autonomy for a task type
 */
export async function hasAutonomy(
  category: AutonomyCategory,
  taskTypeId: string
): Promise<boolean> {
  const registry = await getAutonomyRegistry();

  // Check global emergency halt
  if (registry.global_emergency_halt) {
    return false;
  }

  const categoryData = registry.categories.find((c) => c.category === category);
  if (!categoryData) {
    return false;
  }

  const taskType = categoryData.task_types.find((tt) => tt.task_type_id === taskTypeId);
  if (!taskType) {
    return false;
  }

  return taskType.status === 'autonomous';
}

/**
 * Update task type metrics after handling
 */
export async function updateTaskTypeMetrics(
  category: AutonomyCategory,
  taskTypeId: string,
  outcome: 'approved' | 'modified' | 'rejected'
): Promise<{ shouldRequestAutonomy: boolean; successStreak: number }> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const registry = await getAutonomyRegistry();
  const categoryIndex = registry.categories.findIndex((c) => c.category === category);

  if (categoryIndex === -1) {
    return { shouldRequestAutonomy: false, successStreak: 0 };
  }

  const taskTypeIndex = registry.categories[categoryIndex].task_types.findIndex(
    (tt) => tt.task_type_id === taskTypeId
  );

  if (taskTypeIndex === -1) {
    return { shouldRequestAutonomy: false, successStreak: 0 };
  }

  const taskType = registry.categories[categoryIndex].task_types[taskTypeIndex];

  // Update metrics
  taskType.total_handled++;
  taskType.last_handled_at = now;

  if (outcome === 'approved') {
    taskType.approved_count++;
    taskType.success_streak++;
  } else if (outcome === 'modified') {
    taskType.modified_count++;
    taskType.success_streak = 0;  // Reset streak on modification
  } else {
    taskType.rejected_count++;
    taskType.success_streak = 0;  // Reset streak on rejection
  }

  registry.categories[categoryIndex].task_types[taskTypeIndex] = taskType;
  registry.last_updated = now;

  await db.collection(COLLECTIONS.AUTONOMY_REGISTRY).doc('global').set(registry);

  // Check if should request autonomy (10-success pattern)
  const shouldRequestAutonomy =
    taskType.status === 'ask_first' &&
    taskType.success_streak >= 10 &&
    taskType.approved_count >= 10;

  return { shouldRequestAutonomy, successStreak: taskType.success_streak };
}

/**
 * Set designated approver for a category
 */
export async function setDesignatedApprover(
  category: AutonomyCategory,
  approverId: string,
  approverName: string
): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const registry = await getAutonomyRegistry();
  const categoryIndex = registry.categories.findIndex((c) => c.category === category);

  if (categoryIndex === -1) {
    throw new Error(`Category ${category} not found`);
  }

  registry.categories[categoryIndex].designated_approver_id = approverId;
  registry.categories[categoryIndex].designated_approver_name = approverName;
  registry.categories[categoryIndex].updated_at = now;
  registry.last_updated = now;

  await db.collection(COLLECTIONS.AUTONOMY_REGISTRY).doc('global').set(registry);
}

// ================================================
// AUTONOMY REQUEST OPERATIONS
// ================================================

/**
 * Create an autonomy request (Claude requesting to earn trust)
 */
export async function createAutonomyRequest(
  category: AutonomyCategory,
  taskTypeId: string,
  taskTypeName: string,
  patternDescription: string,
  successCount: number,
  approvalRate: number,
  avgTimeSaved: number,
  recentExamples: AutonomyRequest['recent_examples'],
  requestedScope: string,
  limitationsAcknowledged: string[]
): Promise<AutonomyRequest> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const request: AutonomyRequest = {
    request_id: `ar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    category,
    task_type_id: taskTypeId,
    task_type_name: taskTypeName,
    pattern_description: patternDescription,
    success_count: successCount,
    approval_rate: approvalRate,
    average_response_time_saved: avgTimeSaved,
    recent_examples: recentExamples,
    requested_at: now,
    requested_scope: requestedScope,
    limitations_acknowledged: limitationsAcknowledged,
    status: 'pending',
  };

  await db.collection(COLLECTIONS.AUTONOMY_REQUESTS).doc(request.request_id).set(request);

  return request;
}

/**
 * Get pending autonomy requests
 */
export async function getPendingAutonomyRequests(): Promise<AutonomyRequest[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(COLLECTIONS.AUTONOMY_REQUESTS)
    .where('status', '==', 'pending')
    .orderBy('requested_at', 'desc')
    .get();

  return snapshot.docs.map((doc) => doc.data() as AutonomyRequest);
}

/**
 * Respond to an autonomy request
 */
export async function respondToAutonomyRequest(
  requestId: string,
  action: 'granted' | 'declined',
  respondedById: string,
  respondedByName: string,
  notes?: string
): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const doc = await db.collection(COLLECTIONS.AUTONOMY_REQUESTS).doc(requestId).get();
  if (!doc.exists) {
    throw new Error('Autonomy request not found');
  }

  const request = doc.data() as AutonomyRequest;

  await db.collection(COLLECTIONS.AUTONOMY_REQUESTS).doc(requestId).update({
    status: action,
    responded_by: respondedById,
    responded_at: now,
    response_notes: notes,
  });

  // If granted, actually grant the autonomy
  if (action === 'granted') {
    await grantAutonomy(
      request.category,
      request.task_type_id,
      respondedById,
      respondedByName,
      notes
    );
  }
}

// ================================================
// CLAUDE TASKS (APPROVAL QUEUE) OPERATIONS
// ================================================

/**
 * Create a task for approval
 */
export async function createClaudeTask(input: {
  category: AutonomyCategory;
  task_type_id: string;
  task_type_name: string;
  title: string;
  description: string;
  priority: TaskPriority;
  recommendation: string;
  recommendation_rationale: string;
  draft_response?: string;
  context: ClaudeTask['context'];
  assigned_to_id: string;
  assigned_to_name: string;
  expires_in_hours?: number;
}): Promise<ClaudeTask> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const task: ClaudeTask = {
    task_id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    category: input.category,
    task_type_id: input.task_type_id,
    task_type_name: input.task_type_name,
    title: input.title,
    description: input.description,
    priority: input.priority,
    recommendation: input.recommendation,
    recommendation_rationale: input.recommendation_rationale,
    draft_response: input.draft_response,
    context: input.context,
    assigned_to_id: input.assigned_to_id,
    assigned_to_name: input.assigned_to_name,
    status: 'awaiting_approval',
    created_at: now,
    expires_at: input.expires_in_hours
      ? new Date(Date.now() + input.expires_in_hours * 60 * 60 * 1000).toISOString()
      : undefined,
  };

  await db.collection(COLLECTIONS.CLAUDE_TASKS).doc(task.task_id).set(task);

  return task;
}

/**
 * Get tasks awaiting approval for a team member
 */
export async function getAwaitingTasks(
  teamMemberId?: string,
  limit = 50
): Promise<ClaudeTask[]> {
  const db = getFirestore();
  let query = db
    .collection(COLLECTIONS.CLAUDE_TASKS)
    .where('status', '==', 'awaiting_approval')
    .orderBy('created_at', 'desc')
    .limit(limit);

  if (teamMemberId) {
    query = db
      .collection(COLLECTIONS.CLAUDE_TASKS)
      .where('status', '==', 'awaiting_approval')
      .where('assigned_to_id', '==', teamMemberId)
      .orderBy('created_at', 'desc')
      .limit(limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => doc.data() as ClaudeTask);
}

/**
 * Get task queue summary
 */
export async function getTaskQueueSummary(teamMemberId?: string): Promise<TaskQueueSummary> {
  const tasks = await getAwaitingTasks(teamMemberId, 1000);

  const byCategory: Record<AutonomyCategory, number> = {
    support: 0,
    finance: 0,
    marketing: 0,
    tech: 0,
    compliance: 0,
  };

  let urgentCount = 0;
  let highPriorityCount = 0;
  let oldestTaskHours = 0;

  tasks.forEach((task) => {
    byCategory[task.category]++;
    if (task.priority === 'urgent') urgentCount++;
    if (task.priority === 'high') highPriorityCount++;

    const hoursSinceCreated = (Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreated > oldestTaskHours) {
      oldestTaskHours = hoursSinceCreated;
    }
  });

  return {
    total_awaiting: tasks.length,
    urgent_count: urgentCount,
    high_priority_count: highPriorityCount,
    oldest_task_hours: Math.round(oldestTaskHours),
    by_category: byCategory,
  };
}

/**
 * Respond to a task
 */
export async function respondToTask(
  taskId: string,
  action: 'approved' | 'modified' | 'rejected' | 'escalated',
  respondedById: string,
  respondedByName: string,
  modificationNotes?: string,
  finalResponse?: string
): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const doc = await db.collection(COLLECTIONS.CLAUDE_TASKS).doc(taskId).get();
  if (!doc.exists) {
    throw new Error('Task not found');
  }

  const task = doc.data() as ClaudeTask;

  const status: ClaudeTaskStatus =
    action === 'escalated' ? 'escalated' :
    action === 'rejected' ? 'rejected' :
    action === 'modified' ? 'modified' : 'approved';

  await db.collection(COLLECTIONS.CLAUDE_TASKS).doc(taskId).update({
    status,
    responded_at: now,
    responded_by_id: respondedById,
    responded_by_name: respondedByName,
    response_action: action,
    modification_notes: modificationNotes,
    final_response: finalResponse || task.draft_response,
  });

  // Update task type metrics
  if (action !== 'escalated') {
    const { shouldRequestAutonomy, successStreak } = await updateTaskTypeMetrics(
      task.category,
      task.task_type_id,
      action
    );

    // If we should request autonomy, create the request
    if (shouldRequestAutonomy) {
      // Get recent examples
      const recentTasks = await getRecentTasksForTaskType(task.category, task.task_type_id, 5);
      const recentExamples = recentTasks.map((t) => ({
        task_id: t.task_id,
        summary: t.title,
        outcome: t.response_action as 'approved' | 'modified' | 'rejected',
        handled_at: t.responded_at || t.created_at,
      }));

      await createAutonomyRequest(
        task.category,
        task.task_type_id,
        task.task_type_name,
        `${successStreak} consecutive tasks approved without modification`,
        successStreak,
        100,  // 100% approval rate in streak
        30,   // Estimated 30 minutes saved per task
        recentExamples,
        `Handle ${task.task_type_name} automatically`,
        ['Will still escalate novel variations', 'Will log all actions for visibility']
      );
    }
  }

  // Log the activity
  await logActivity({
    activity_type: 'task_handled',
    category: task.category,
    title: `Task ${action}: ${task.title}`,
    description: modificationNotes || `Task was ${action}`,
    action_taken: finalResponse || task.recommendation,
    was_autonomous: false,
    claude_initiated: true,
    team_member_id: respondedById,
    team_member_name: respondedByName,
    related_task_id: taskId,
  });
}

/**
 * Get recent tasks for a specific task type
 */
async function getRecentTasksForTaskType(
  category: AutonomyCategory,
  taskTypeId: string,
  limit: number
): Promise<ClaudeTask[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(COLLECTIONS.CLAUDE_TASKS)
    .where('category', '==', category)
    .where('task_type_id', '==', taskTypeId)
    .where('status', 'in', ['approved', 'modified', 'rejected'])
    .orderBy('responded_at', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => doc.data() as ClaudeTask);
}

/**
 * Log a task that was handled autonomously
 */
export async function logAutonomousTask(input: {
  category: AutonomyCategory;
  task_type_id: string;
  task_type_name: string;
  title: string;
  description: string;
  action_taken: string;
}): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const task: ClaudeTask = {
    task_id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    category: input.category,
    task_type_id: input.task_type_id,
    task_type_name: input.task_type_name,
    title: input.title,
    description: input.description,
    priority: 'normal',
    recommendation: input.action_taken,
    recommendation_rationale: 'Handled autonomously based on granted trust',
    context: { source: 'autonomous' },
    assigned_to_id: 'claude',
    assigned_to_name: 'Claude',
    status: 'auto_handled',
    created_at: now,
    responded_at: now,
  };

  await db.collection(COLLECTIONS.CLAUDE_TASKS).doc(task.task_id).set(task);

  // Log the activity
  await logActivity({
    activity_type: 'task_handled',
    category: input.category,
    title: input.title,
    description: input.description,
    action_taken: input.action_taken,
    was_autonomous: true,
    claude_initiated: true,
    related_task_id: task.task_id,
  });
}

// ================================================
// ACTIVITY LOG OPERATIONS
// ================================================

/**
 * Log an activity
 */
export async function logActivity(input: {
  activity_type: ActivityType;
  category?: AutonomyCategory;
  title: string;
  description: string;
  action_taken: string;
  was_autonomous: boolean;
  claude_initiated: boolean;
  team_member_id?: string;
  team_member_name?: string;
  related_task_id?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  metrics?: ClaudeActivity['metrics'];
}): Promise<ClaudeActivity> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const activity: ClaudeActivity = {
    activity_id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    activity_type: input.activity_type,
    category: input.category,
    title: input.title,
    description: input.description,
    action_taken: input.action_taken,
    was_autonomous: input.was_autonomous,
    related_task_id: input.related_task_id,
    related_entity_type: input.related_entity_type,
    related_entity_id: input.related_entity_id,
    claude_initiated: input.claude_initiated,
    team_member_id: input.team_member_id,
    team_member_name: input.team_member_name,
    occurred_at: now,
    metrics: input.metrics,
  };

  await db.collection(COLLECTIONS.CLAUDE_ACTIVITIES).doc(activity.activity_id).set(activity);

  return activity;
}

/**
 * Get recent activities
 */
export async function getRecentActivities(limit = 50): Promise<ClaudeActivity[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(COLLECTIONS.CLAUDE_ACTIVITIES)
    .orderBy('occurred_at', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => doc.data() as ClaudeActivity);
}

/**
 * Get activity summary
 */
export async function getActivitySummary(
  period: 'today' | 'this_week' | 'this_month'
): Promise<ActivitySummary> {
  const db = getFirestore();

  // Calculate start date based on period
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'this_week':
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const snapshot = await db
    .collection(COLLECTIONS.CLAUDE_ACTIVITIES)
    .where('occurred_at', '>=', startDate.toISOString())
    .orderBy('occurred_at', 'desc')
    .get();

  const activities = snapshot.docs.map((doc) => doc.data() as ClaudeActivity);

  const byCategory: Record<AutonomyCategory, { total: number; autonomous: number }> = {
    support: { total: 0, autonomous: 0 },
    finance: { total: 0, autonomous: 0 },
    marketing: { total: 0, autonomous: 0 },
    tech: { total: 0, autonomous: 0 },
    compliance: { total: 0, autonomous: 0 },
  };

  let autonomousActions = 0;
  let approvedActions = 0;
  let escalations = 0;
  let timeSavedMinutes = 0;

  activities.forEach((activity) => {
    if (activity.category) {
      byCategory[activity.category].total++;
      if (activity.was_autonomous) {
        byCategory[activity.category].autonomous++;
      }
    }

    if (activity.was_autonomous) autonomousActions++;
    if (activity.activity_type === 'task_handled' && !activity.was_autonomous) approvedActions++;
    if (activity.activity_type === 'escalation') escalations++;
    if (activity.metrics?.time_saved_minutes) {
      timeSavedMinutes += activity.metrics.time_saved_minutes;
    }
  });

  return {
    period,
    total_activities: activities.length,
    autonomous_actions: autonomousActions,
    approved_actions: approvedActions,
    escalations,
    by_category: byCategory,
    time_saved_minutes: timeSavedMinutes,
    recent_activities: activities.slice(0, 10),
  };
}

// ================================================
// EMERGENCY CONTROL OPERATIONS
// ================================================

/**
 * Create an emergency action
 */
export async function createEmergencyAction(
  actionType: EmergencyActionType,
  level: EmergencyLevel,
  title: string,
  reason: string,
  scope: string,
  initiatedById: string,
  initiatedByName: string,
  affectedSystems: string[],
  affectedUsersCount?: number
): Promise<EmergencyAction> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const action: EmergencyAction = {
    action_id: `emerg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    action_type: actionType,
    emergency_level: level,
    title,
    reason,
    scope,
    initiated_by_id: initiatedById,
    initiated_by_name: initiatedByName,
    initiated_at: now,
    requires_confirmation: level === 'level_1',
    status: 'active',
    affected_systems: affectedSystems,
    affected_users_count: affectedUsersCount,
  };

  await db.collection(COLLECTIONS.EMERGENCY_ACTIONS).doc(action.action_id).set(action);

  // If halting all autonomy, update registry
  if (actionType === 'halt_all_autonomy') {
    const registry = await getAutonomyRegistry();
    registry.global_emergency_halt = true;
    registry.halted_by = initiatedById;
    registry.halted_at = now;
    registry.halt_reason = reason;
    registry.last_updated = now;
    await db.collection(COLLECTIONS.AUTONOMY_REGISTRY).doc('global').set(registry);
  }

  // Log the activity
  await logActivity({
    activity_type: 'emergency_action',
    title: `EMERGENCY: ${title}`,
    description: reason,
    action_taken: `${actionType} - ${scope}`,
    was_autonomous: false,
    claude_initiated: false,
    team_member_id: initiatedById,
    team_member_name: initiatedByName,
  });

  return action;
}

/**
 * Resolve an emergency action
 */
export async function resolveEmergencyAction(
  actionId: string,
  resolvedById: string,
  resolvedByName: string,
  resolutionNotes: string
): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const doc = await db.collection(COLLECTIONS.EMERGENCY_ACTIONS).doc(actionId).get();
  if (!doc.exists) {
    throw new Error('Emergency action not found');
  }

  const action = doc.data() as EmergencyAction;

  await db.collection(COLLECTIONS.EMERGENCY_ACTIONS).doc(actionId).update({
    status: 'resolved',
    resolved_at: now,
    resolved_by_id: resolvedById,
    resolution_notes: resolutionNotes,
  });

  // If was halt_all_autonomy, restore
  if (action.action_type === 'halt_all_autonomy') {
    const registry = await getAutonomyRegistry();
    registry.global_emergency_halt = false;
    registry.last_updated = now;
    await db.collection(COLLECTIONS.AUTONOMY_REGISTRY).doc('global').set(registry);
  }

  // Log the activity
  await logActivity({
    activity_type: 'emergency_action',
    title: `RESOLVED: ${action.title}`,
    description: resolutionNotes,
    action_taken: `Emergency resolved by ${resolvedByName}`,
    was_autonomous: false,
    claude_initiated: false,
    team_member_id: resolvedById,
    team_member_name: resolvedByName,
  });
}

/**
 * Get current emergency status
 */
export async function getEmergencyStatus(): Promise<EmergencyStatus> {
  const db = getFirestore();

  const snapshot = await db
    .collection(COLLECTIONS.EMERGENCY_ACTIONS)
    .where('status', '==', 'active')
    .orderBy('initiated_at', 'desc')
    .get();

  const activeEmergencies = snapshot.docs.map((doc) => doc.data() as EmergencyAction);

  const registry = await getAutonomyRegistry();

  const haltedCategories: AutonomyCategory[] = [];
  // Check if any categories have all task types suspended
  registry.categories.forEach((cat) => {
    const allSuspended = cat.task_types.every((tt) => tt.status === 'suspended');
    if (allSuspended) {
      haltedCategories.push(cat.category);
    }
  });

  return {
    any_active: activeEmergencies.length > 0,
    active_emergencies: activeEmergencies,
    global_autonomy_halted: registry.global_emergency_halt,
    halted_categories: haltedCategories,
    last_emergency_at: activeEmergencies[0]?.initiated_at,
    last_emergency_type: activeEmergencies[0]?.action_type,
  };
}

/**
 * Halt all autonomy immediately (emergency button)
 */
export async function emergencyHaltAllAutonomy(
  initiatedById: string,
  initiatedByName: string,
  reason: string
): Promise<EmergencyAction> {
  return createEmergencyAction(
    'halt_all_autonomy',
    'level_1',
    'All Autonomy Halted',
    reason,
    'Global - all categories',
    initiatedById,
    initiatedByName,
    ['All autonomous operations'],
    undefined
  );
}

/**
 * Restore autonomy after emergency
 */
export async function restoreAutonomy(
  initiatedById: string,
  initiatedByName: string,
  notes: string
): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  // Find and resolve active halt
  const snapshot = await db
    .collection(COLLECTIONS.EMERGENCY_ACTIONS)
    .where('action_type', '==', 'halt_all_autonomy')
    .where('status', '==', 'active')
    .get();

  for (const doc of snapshot.docs) {
    await resolveEmergencyAction(doc.id, initiatedById, initiatedByName, notes);
  }

  // Create restore action
  await createEmergencyAction(
    'restore_autonomy',
    'level_2',
    'Autonomy Restored',
    notes,
    'Global - all categories',
    initiatedById,
    initiatedByName,
    ['All autonomous operations']
  );
}

// ================================================
// TEAM CHAT OPERATIONS
// ================================================

/**
 * Create or get team chat conversation
 */
export async function getOrCreateTeamConversation(
  teamMemberId: string,
  teamMemberName: string
): Promise<TeamChatConversation> {
  const db = getFirestore();

  // Check for existing active conversation
  const snapshot = await db
    .collection(COLLECTIONS.TEAM_CHAT_CONVERSATIONS)
    .where('team_member_id', '==', teamMemberId)
    .where('status', '==', 'active')
    .orderBy('updated_at', 'desc')
    .limit(1)
    .get();

  if (!snapshot.empty) {
    return snapshot.docs[0].data() as TeamChatConversation;
  }

  // Create new conversation
  const now = new Date().toISOString();
  const conversation: TeamChatConversation = {
    conversation_id: `teamchat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    team_member_id: teamMemberId,
    team_member_name: teamMemberName,
    status: 'active',
    message_count: 0,
    last_message_at: now,
    last_message_preview: '',
    created_at: now,
    updated_at: now,
  };

  await db.collection(COLLECTIONS.TEAM_CHAT_CONVERSATIONS).doc(conversation.conversation_id).set(conversation);

  return conversation;
}

/**
 * Add message to team chat
 */
export async function addTeamChatMessage(
  conversationId: string,
  role: 'team_member' | 'claude',
  content: string,
  teamMemberId?: string,
  teamMemberName?: string
): Promise<TeamChatMessage> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const message: TeamChatMessage = {
    message_id: `tcmsg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    conversation_id: conversationId,
    role,
    content,
    team_member_id: teamMemberId,
    team_member_name: teamMemberName,
    created_at: now,
  };

  await db.collection(COLLECTIONS.TEAM_CHAT_MESSAGES).doc(message.message_id).set(message);

  // Update conversation
  await db.collection(COLLECTIONS.TEAM_CHAT_CONVERSATIONS).doc(conversationId).update({
    message_count: FieldValue.increment(1),
    last_message_at: now,
    last_message_preview: content.substring(0, 100),
    updated_at: now,
  });

  return message;
}

/**
 * Get messages for a conversation
 */
export async function getTeamChatMessages(
  conversationId: string,
  limit = 50
): Promise<TeamChatMessage[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(COLLECTIONS.TEAM_CHAT_MESSAGES)
    .where('conversation_id', '==', conversationId)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => doc.data() as TeamChatMessage).reverse();
}

// ================================================
// DASHBOARD DATA AGGREGATION
// ================================================

/**
 * Get complete dashboard data for a team member
 */
export async function getTeamDashboardData(
  teamMemberId: string,
  teamMemberName: string,
  teamMemberEmail: string,
  teamMemberRole: string,
  categoriesManaged: AutonomyCategory[]
): Promise<TeamDashboardData> {
  const [
    registry,
    pendingRequests,
    taskQueueSummary,
    awaitingTasks,
    activitySummary,
    recentActivities,
    emergencyStatus,
  ] = await Promise.all([
    getAutonomyRegistry(),
    getPendingAutonomyRequests(),
    getTaskQueueSummary(teamMemberId),
    getAwaitingTasks(teamMemberId, 20),
    getActivitySummary('today'),
    getRecentActivities(10),
    getEmergencyStatus(),
  ]);

  return {
    team_member: {
      id: teamMemberId,
      name: teamMemberName,
      email: teamMemberEmail,
      role: teamMemberRole,
      categories_managed: categoriesManaged,
    },
    task_queue: {
      summary: taskQueueSummary,
      awaiting_tasks: awaitingTasks,
    },
    activity: {
      summary: activitySummary,
      recent: recentActivities,
    },
    autonomy: {
      registry,
      pending_requests: pendingRequests,
    },
    emergency: emergencyStatus,
    system_health: {
      status: emergencyStatus.any_active ? 'degraded' : 'healthy',
      uptime_percentage: 99.5,  // TODO: Get from actual monitoring
      active_learners_today: 0,  // TODO: Get from analytics
      api_latency_ms: 150,  // TODO: Get from monitoring
    },
  };
}
