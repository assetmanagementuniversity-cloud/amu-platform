/**
 * Team Interface & Learning Autonomy Types - AMU Platform
 *
 * Section 4.6: Claude's Autonomous Management - Learning Autonomy Framework
 * Section 4.7: Claude Team Interface
 * Section 4.10: Emergency Protocols
 *
 * Types for:
 * - Autonomy settings and earned trust tracking
 * - Task approval queue
 * - Activity logs
 * - Emergency controls
 *
 * "Ubuntu - I am because we are"
 */

// ================================================
// AUTONOMY CATEGORIES (Section 4.6)
// ================================================

/**
 * Categories of Claude's autonomous operations
 * Each category has a designated team member who can grant/revoke autonomy
 */
export type AutonomyCategory =
  | 'support'      // Learner Support - pricing queries, FAQ, progress updates
  | 'finance'      // Financial Operations - invoice processing, expense tracking
  | 'marketing'    // Marketing & Communications - social media, newsletters
  | 'tech'         // Technical Operations - monitoring, scaling, bug fixes
  | 'compliance';  // Compliance & Regulatory - report preparation, filings

/**
 * Status of autonomy for a specific task type
 */
export type AutonomyStatus =
  | 'ask_first'      // Claude must ask before taking action
  | 'autonomous'     // Claude can act without asking
  | 'suspended';     // Temporarily suspended (e.g., after incident)

/**
 * Individual task type within a category
 */
export interface TaskType {
  task_type_id: string;
  category: AutonomyCategory;
  name: string;                    // e.g., "Pricing queries", "Social media posts"
  description: string;
  example_actions: string[];       // Examples of what falls under this type

  // Autonomy tracking
  status: AutonomyStatus;
  granted_by?: string;             // User ID of team member who granted
  granted_at?: string;             // ISO timestamp
  revoked_by?: string;             // User ID if revoked
  revoked_at?: string;
  revoke_reason?: string;

  // Performance metrics
  total_handled: number;           // Total times this task type handled
  approved_count: number;          // Times approved without modification
  modified_count: number;          // Times modified before approval
  rejected_count: number;          // Times rejected
  success_streak: number;          // Current consecutive successes (for 10-pattern)
  last_handled_at?: string;
}

/**
 * Autonomy settings for a category
 */
export interface CategoryAutonomy {
  category: AutonomyCategory;
  designated_approver_id: string;  // Team member responsible for this category
  designated_approver_name: string;
  task_types: TaskType[];

  // Category-level metrics
  overall_autonomous_percentage: number;  // % of task types with autonomy
  total_actions_today: number;
  total_actions_this_week: number;

  created_at: string;
  updated_at: string;
}

/**
 * Full autonomy registry document
 */
export interface AutonomyRegistry {
  registry_id: string;             // Usually 'global' (singleton)
  categories: CategoryAutonomy[];

  // Global settings
  global_emergency_halt: boolean;  // If true, Claude asks for everything
  halted_by?: string;
  halted_at?: string;
  halt_reason?: string;

  last_updated: string;
}

// ================================================
// AUTONOMY REQUESTS (Section 4.6 Phase 2)
// ================================================

/**
 * Request from Claude to earn autonomy for a task type
 * Based on the 10-success pattern recognition
 */
export interface AutonomyRequest {
  request_id: string;
  category: AutonomyCategory;
  task_type_id: string;
  task_type_name: string;

  // Pattern evidence
  pattern_description: string;     // What Claude has observed
  success_count: number;           // How many successful handlings
  approval_rate: number;           // Percentage approved without modification
  average_response_time_saved: number;  // Minutes saved per task

  // Examples
  recent_examples: {
    task_id: string;
    summary: string;
    outcome: 'approved' | 'modified' | 'rejected';
    handled_at: string;
  }[];

  // Request details
  requested_at: string;
  requested_scope: string;         // What Claude is requesting to handle
  limitations_acknowledged: string[];  // What Claude will still escalate

  // Response
  status: 'pending' | 'granted' | 'declined';
  responded_by?: string;
  responded_at?: string;
  response_notes?: string;
}

// ================================================
// TASK APPROVAL QUEUE (Section 4.7)
// ================================================

/**
 * Priority levels for tasks
 */
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';

/**
 * Current status of a task
 */
export type ClaudeTaskStatus =
  | 'awaiting_approval'    // Waiting for team member
  | 'approved'             // Approved, action taken
  | 'modified'             // Modified by team member, then approved
  | 'rejected'             // Rejected, no action taken
  | 'auto_handled'         // Handled automatically (has autonomy)
  | 'escalated'            // Escalated to higher authority
  | 'expired';             // No response within time limit

/**
 * A task requiring team member input
 */
export interface ClaudeTask {
  task_id: string;
  category: AutonomyCategory;
  task_type_id: string;
  task_type_name: string;

  // Task details
  title: string;
  description: string;
  priority: TaskPriority;

  // Claude's recommendation
  recommendation: string;          // What Claude recommends
  recommendation_rationale: string;  // Why Claude recommends this
  draft_response?: string;         // Draft content if applicable

  // Context
  context: {
    source: string;                // Where this came from (email, chat, system)
    source_id?: string;            // Reference ID
    related_entity_type?: string;  // learner, company, vendor, etc.
    related_entity_id?: string;
    additional_context?: Record<string, unknown>;
  };

  // Approval tracking
  assigned_to_id: string;          // Team member this is assigned to
  assigned_to_name: string;
  status: ClaudeTaskStatus;

  created_at: string;
  expires_at?: string;             // When this becomes stale

  // Response
  responded_at?: string;
  responded_by_id?: string;
  responded_by_name?: string;
  response_action?: 'approved' | 'modified' | 'rejected' | 'escalated';
  modification_notes?: string;     // If modified, what changed
  final_response?: string;         // The actual response sent
}

/**
 * Summary for dashboard display
 */
export interface TaskQueueSummary {
  total_awaiting: number;
  urgent_count: number;
  high_priority_count: number;
  oldest_task_hours: number;       // Hours since oldest task created
  by_category: Record<AutonomyCategory, number>;
}

// ================================================
// ACTIVITY LOG (Section 4.7)
// ================================================

/**
 * Type of activity
 */
export type ActivityType =
  | 'task_handled'         // Claude handled a task (with or without approval)
  | 'autonomy_granted'     // Autonomy was granted
  | 'autonomy_revoked'     // Autonomy was revoked
  | 'emergency_action'     // Emergency protocol triggered
  | 'system_action'        // System maintenance, deployment, etc.
  | 'escalation'           // Something was escalated
  | 'chat_interaction';    // Team member chatted with Claude

/**
 * A logged activity
 */
export interface ClaudeActivity {
  activity_id: string;
  activity_type: ActivityType;
  category?: AutonomyCategory;

  // Activity details
  title: string;
  description: string;

  // What was done
  action_taken: string;
  was_autonomous: boolean;         // True if Claude acted without approval

  // Context
  related_task_id?: string;
  related_entity_type?: string;
  related_entity_id?: string;

  // Who was involved
  claude_initiated: boolean;
  team_member_id?: string;
  team_member_name?: string;

  // Timestamps
  occurred_at: string;

  // Metrics impact
  metrics?: {
    time_saved_minutes?: number;
    cost_impact?: number;
    learners_affected?: number;
  };
}

/**
 * Activity summary for dashboard
 */
export interface ActivitySummary {
  period: 'today' | 'this_week' | 'this_month';
  total_activities: number;
  autonomous_actions: number;
  approved_actions: number;
  escalations: number;

  by_category: Record<AutonomyCategory, {
    total: number;
    autonomous: number;
  }>;

  time_saved_minutes: number;

  // Top activities
  recent_activities: ClaudeActivity[];
}

// ================================================
// EMERGENCY CONTROLS (Section 4.10)
// ================================================

/**
 * Emergency level classification
 */
export type EmergencyLevel =
  | 'level_1'   // Critical - immediate threat (minutes response)
  | 'level_2'   // Serious - significant issue (hours response)
  | 'level_3';  // Operational - problem needing attention (24h response)

/**
 * Type of emergency action
 */
export type EmergencyActionType =
  | 'halt_all_autonomy'        // Stop all autonomous actions
  | 'halt_category'            // Stop autonomy for one category
  | 'halt_task_type'           // Stop autonomy for one task type
  | 'rollback_deployment'      // Rollback to previous version
  | 'disable_feature'          // Disable a specific feature
  | 'block_user'               // Block a specific user
  | 'emergency_shutdown'       // Complete system shutdown
  | 'restore_autonomy';        // Restore halted autonomy

/**
 * An emergency control action
 */
export interface EmergencyAction {
  action_id: string;
  action_type: EmergencyActionType;
  emergency_level: EmergencyLevel;

  // Action details
  title: string;
  reason: string;
  scope: string;                   // What is affected

  // Who initiated
  initiated_by_id: string;
  initiated_by_name: string;
  initiated_at: string;

  // Confirmation (some actions need multiple approvals)
  requires_confirmation: boolean;
  confirmed_by_ids?: string[];
  confirmed_at?: string;

  // Status
  status: 'pending' | 'active' | 'resolved';
  resolved_at?: string;
  resolved_by_id?: string;
  resolution_notes?: string;

  // Impact
  affected_systems: string[];
  affected_users_count?: number;
}

/**
 * Current emergency status
 */
export interface EmergencyStatus {
  any_active: boolean;
  active_emergencies: EmergencyAction[];

  // Quick status
  global_autonomy_halted: boolean;
  halted_categories: AutonomyCategory[];

  // Recent
  last_emergency_at?: string;
  last_emergency_type?: EmergencyActionType;
}

// ================================================
// TEAM CHAT (Section 4.7)
// ================================================

/**
 * A message in team chat with Claude
 */
export interface TeamChatMessage {
  message_id: string;
  conversation_id: string;

  role: 'team_member' | 'claude';
  content: string;

  // If from team member
  team_member_id?: string;
  team_member_name?: string;

  // Message metadata
  created_at: string;

  // Related context
  related_task_id?: string;
  related_activity_id?: string;

  // Attachments
  attachments?: {
    type: 'report' | 'chart' | 'document' | 'link';
    title: string;
    url?: string;
    data?: Record<string, unknown>;
  }[];
}

/**
 * A team chat conversation
 */
export interface TeamChatConversation {
  conversation_id: string;
  team_member_id: string;
  team_member_name: string;

  // Conversation state
  status: 'active' | 'resolved' | 'archived';
  topic?: string;                  // Brief topic if identifiable

  // Message tracking
  message_count: number;
  last_message_at: string;
  last_message_preview: string;

  created_at: string;
  updated_at: string;
}

// ================================================
// DASHBOARD TYPES (Section 4.7)
// ================================================

/**
 * Complete dashboard data for team interface
 */
export interface TeamDashboardData {
  // Current user
  team_member: {
    id: string;
    name: string;
    email: string;
    role: string;
    categories_managed: AutonomyCategory[];
  };

  // Task queue
  task_queue: {
    summary: TaskQueueSummary;
    awaiting_tasks: ClaudeTask[];
  };

  // Activity
  activity: {
    summary: ActivitySummary;
    recent: ClaudeActivity[];
  };

  // Autonomy
  autonomy: {
    registry: AutonomyRegistry;
    pending_requests: AutonomyRequest[];
  };

  // Emergency
  emergency: EmergencyStatus;

  // System health (basic)
  system_health: {
    status: 'healthy' | 'degraded' | 'critical';
    uptime_percentage: number;
    active_learners_today: number;
    api_latency_ms: number;
  };
}

// ================================================
// API INPUT TYPES
// ================================================

export interface GrantAutonomyInput {
  category: AutonomyCategory;
  task_type_id: string;
  notes?: string;
}

export interface RevokeAutonomyInput {
  category: AutonomyCategory;
  task_type_id: string;
  reason: string;
}

export interface RespondToTaskInput {
  task_id: string;
  action: 'approved' | 'modified' | 'rejected' | 'escalated';
  modification_notes?: string;
  final_response?: string;
}

export interface EmergencyHaltInput {
  action_type: EmergencyActionType;
  reason: string;
  scope?: string;
  category?: AutonomyCategory;
  task_type_id?: string;
}

export interface TeamChatInput {
  conversation_id?: string;        // If continuing existing conversation
  message: string;
  related_task_id?: string;
}

// ================================================
// DEFAULTS
// ================================================

/**
 * Default task types for each category
 */
export const DEFAULT_TASK_TYPES: Record<AutonomyCategory, Omit<TaskType, 'task_type_id'>[]> = {
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
    {
      category: 'finance',
      name: 'Expense tracking',
      description: 'Recording and tracking expenses',
      example_actions: ['Log vendor payment', 'Track subscription costs'],
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
      description: 'Publishing content to social media platforms (LinkedIn, Twitter/X, Facebook)',
      example_actions: ['Post learner success story', 'Share course announcement', 'Industry insights post'],
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
      example_actions: ['Draft weekly newsletter', 'Announce new course', 'Share industry news'],
      status: 'ask_first',
      total_handled: 0,
      approved_count: 0,
      modified_count: 0,
      rejected_count: 0,
      success_streak: 0,
    },
    {
      category: 'marketing',
      name: 'Corporate outreach',
      description: 'Initial outreach to potential corporate clients',
      example_actions: ['Draft intro email', 'Respond to inquiry', 'Follow-up messages'],
      status: 'ask_first',
      total_handled: 0,
      approved_count: 0,
      modified_count: 0,
      rejected_count: 0,
      success_streak: 0,
    },
    {
      category: 'marketing',
      name: 'Campaign recommendations',
      description: 'Analysing data to recommend marketing campaigns based on learner demographics',
      example_actions: ['Identify growth opportunities', 'Draft campaign proposals', 'Segment analysis'],
      status: 'ask_first',
      total_handled: 0,
      approved_count: 0,
      modified_count: 0,
      rejected_count: 0,
      success_streak: 0,
    },
    {
      category: 'marketing',
      name: 'Campaign execution',
      description: 'Executing approved marketing campaigns across channels',
      example_actions: ['Schedule social posts', 'Send email sequences', 'Monitor engagement'],
      status: 'ask_first',
      total_handled: 0,
      approved_count: 0,
      modified_count: 0,
      rejected_count: 0,
      success_streak: 0,
    },
    {
      category: 'marketing',
      name: 'Content calendar management',
      description: 'Planning and scheduling content across marketing channels',
      example_actions: ['Create content schedule', 'Adjust posting times', 'Coordinate campaigns'],
      status: 'ask_first',
      total_handled: 0,
      approved_count: 0,
      modified_count: 0,
      rejected_count: 0,
      success_streak: 0,
    },
    {
      category: 'marketing',
      name: 'Reactivation campaigns',
      description: 'Re-engaging dormant learners through targeted outreach',
      example_actions: ['Send re-engagement emails', 'Personalised nudges', 'Course recommendations'],
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
    {
      category: 'tech',
      name: 'Deployment management',
      description: 'Managing deployments and rollbacks',
      example_actions: ['Deploy to staging', 'Rollback failed deployment'],
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
    {
      category: 'compliance',
      name: 'Filing reminders',
      description: 'Sending reminders about upcoming filing deadlines',
      example_actions: ['CIPC annual return reminder', 'Tax deadline alert'],
      status: 'ask_first',
      total_handled: 0,
      approved_count: 0,
      modified_count: 0,
      rejected_count: 0,
      success_streak: 0,
    },
  ],
};

/**
 * Success streak threshold for autonomy request (Section 4.6 Phase 2)
 */
export const AUTONOMY_REQUEST_THRESHOLD = 10;

/**
 * Category display names
 */
export const CATEGORY_DISPLAY_NAMES: Record<AutonomyCategory, string> = {
  support: 'Learner Support',
  finance: 'Financial Operations',
  marketing: 'Marketing & Communications',
  tech: 'Technical Operations',
  compliance: 'Compliance & Regulatory',
};

/**
 * Category icons (Lucide icon names)
 */
export const CATEGORY_ICONS: Record<AutonomyCategory, string> = {
  support: 'HeadphonesIcon',
  finance: 'WalletIcon',
  marketing: 'MegaphoneIcon',
  tech: 'CpuIcon',
  compliance: 'FileCheckIcon',
};
