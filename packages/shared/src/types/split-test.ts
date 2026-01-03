/**
 * Split Testing Types - AMU Platform
 *
 * Split Testing Framework (Section 14.6)
 *
 * Enables rigorous A/B testing of content improvements with:
 * - Random 50/50 allocation
 * - Comparative metrics tracking
 * - Ethical stop conditions for learner protection
 *
 * "Ubuntu - I am because we are"
 */

/**
 * Split test status
 */
export type SplitTestStatus =
  | 'draft'           // Being configured
  | 'active'          // Running
  | 'paused'          // Temporarily paused
  | 'completed'       // Sample size reached
  | 'stopped_ethics'  // Stopped due to ethical concerns
  | 'stopped_manual'  // Manually stopped by admin
  | 'concluded';      // Analysis complete, winner selected

/**
 * Allocation strategy for split tests
 */
export type AllocationStrategy =
  | 'random_50_50'    // Equal random split
  | 'random_70_30'    // Favor current version
  | 'sequential';     // First N get A, rest get B

/**
 * Stop condition types
 */
export type StopConditionType =
  | 'sample_reached'            // Target sample size met
  | 'significant_difference'    // Statistical significance achieved
  | 'learner_offended'          // Ethical: learner very upset
  | 'pattern_of_dissatisfaction' // Ethical: 3+ dissatisfied in a row
  | 'manual_stop'               // Admin stopped manually
  | 'time_limit';               // Max duration reached

/**
 * Split test version content
 */
export interface SplitTestVersion {
  name: string;
  description: string;
  content_type: 'scaffolding' | 'case_study' | 'playbook' | 'competency_criteria' | 'full_module';
  content_snapshot: string;  // The actual content (or reference to it)
  content_hash?: string;     // For integrity verification
}

/**
 * Metrics to track per version
 */
export interface SplitTestMetrics {
  sample_size: number;
  competency_achievement_rate: number;  // % who achieved competent
  avg_messages_to_competency: number;
  median_messages_to_competency: number;
  learner_satisfaction_avg: number;     // 1-5 scale
  stuck_rate: number;                   // % who got stuck (>15 messages)
  completion_rate: number;              // % who completed the module
  dropout_rate: number;                 // % who abandoned
  negative_feedback_count: number;
  very_negative_feedback_count: number; // For ethical stops
}

/**
 * Individual learner result in split test
 */
export interface SplitTestParticipant {
  enrolment_id: string;
  version: 'version_a' | 'version_b';
  assigned_at: string;

  // Outcome metrics
  competency_achieved: boolean;
  messages_to_competency?: number;
  time_to_competency_minutes?: number;
  satisfaction_score?: number;          // 1-5
  got_stuck: boolean;
  completed_module: boolean;
  abandoned: boolean;

  // Feedback (anonymized - no learner ID in feedback text)
  feedback_sentiment?: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  feedback_text_anonymized?: string;

  // Timestamps
  started_at: string;
  completed_at?: string;
}

/**
 * Stop condition configuration
 */
export interface StopConditionConfig {
  sample_reached: boolean;           // Stop when target sample reached
  significant_difference: boolean;   // Stop when p < 0.05
  min_sample_for_significance: number; // Min samples before checking significance
  learner_very_offended: boolean;    // ETHICAL: Stop on any very negative
  three_dissatisfied_in_row: boolean; // ETHICAL: Stop on 3 consecutive bad
  max_duration_days?: number;        // Optional time limit
}

/**
 * Statistical analysis result
 */
export interface SplitTestAnalysis {
  analyzed_at: string;

  version_a: SplitTestMetrics;
  version_b: SplitTestMetrics;

  // Statistical tests
  competency_rate_difference: number;  // B - A
  competency_rate_improvement_pct: number;  // ((B-A)/A) * 100
  messages_difference: number;
  satisfaction_difference: number;

  // Significance testing
  statistical_significance: boolean;
  p_value: number;
  confidence_interval_lower: number;
  confidence_interval_upper: number;

  // Recommendation
  winner: 'version_a' | 'version_b' | 'no_difference';
  recommendation: string;
  should_deploy_winner: boolean;
}

/**
 * Ethical stop event
 */
export interface EthicalStopEvent {
  event_id: string;
  triggered_at: string;
  condition_type: 'learner_offended' | 'pattern_of_dissatisfaction';
  offending_version: 'version_a' | 'version_b';

  // Context (anonymized - no learner IDs)
  feedback_summary: string;
  consecutive_negative_count?: number;
  severity: 'warning' | 'stop';

  // Action taken
  test_stopped: boolean;
  admin_notified: boolean;
  notification_sent_at?: string;
}

/**
 * Main Split Test record
 */
export interface SplitTest {
  split_test_id: string;

  // Context
  module_id: string;
  module_title: string;
  course_id: string;
  course_title: string;
  improvement_id?: string;           // Link to approved suggestion

  // Status
  status: SplitTestStatus;
  created_at: string;
  started_at?: string;
  paused_at?: string;
  completed_at?: string;
  stopped_at?: string;
  stopped_reason?: StopConditionType;

  // Versions
  version_a: SplitTestVersion;       // Current/control
  version_b: SplitTestVersion;       // Proposed improvement

  // Allocation
  allocation_strategy: AllocationStrategy;
  target_sample_size: number;        // Total (e.g., 100 = 50 per version)
  current_sample_a: number;
  current_sample_b: number;

  // Metrics to track
  tracked_metrics: (keyof SplitTestMetrics)[];

  // Stop conditions
  stop_conditions: StopConditionConfig;

  // Results (populated as test runs)
  participants: SplitTestParticipant[];
  ethical_events: EthicalStopEvent[];

  // Analysis
  latest_analysis?: SplitTestAnalysis;
  analysis_history: SplitTestAnalysis[];

  // Conclusion
  winner?: 'version_a' | 'version_b' | 'no_difference';
  winner_deployed?: boolean;
  deployed_at?: string;
  conclusion_notes?: string;

  // Admin
  created_by: string;
  reviewed_by?: string;
}

/**
 * Firestore document (serialized dates)
 */
export interface SplitTestDocument extends Omit<SplitTest,
  | 'created_at' | 'started_at' | 'paused_at' | 'completed_at' | 'stopped_at' | 'deployed_at'
> {
  created_at: string;
  started_at?: string;
  paused_at?: string;
  completed_at?: string;
  stopped_at?: string;
  deployed_at?: string;
}

/**
 * Input for creating a new split test
 */
export interface CreateSplitTestInput {
  module_id: string;
  module_title: string;
  course_id: string;
  course_title: string;
  improvement_id?: string;

  version_a: SplitTestVersion;
  version_b: SplitTestVersion;

  target_sample_size?: number;  // Default: 100
  allocation_strategy?: AllocationStrategy;  // Default: random_50_50

  stop_conditions?: Partial<StopConditionConfig>;

  created_by: string;
}

/**
 * Split test summary for dashboard
 */
export interface SplitTestSummary {
  split_test_id: string;
  module_title: string;
  course_title: string;
  status: SplitTestStatus;

  // Progress
  target_sample_size: number;
  current_total_sample: number;
  progress_percentage: number;

  // Current metrics
  version_a_competency_rate: number;
  version_b_competency_rate: number;
  current_difference_pct: number;

  // Status indicators
  has_ethical_concerns: boolean;
  days_running: number;

  started_at?: string;
}

/**
 * Default stop conditions
 */
export const DEFAULT_STOP_CONDITIONS: StopConditionConfig = {
  sample_reached: true,
  significant_difference: true,
  min_sample_for_significance: 30,  // Need at least 30 per version
  learner_very_offended: true,      // ETHICAL: Always enabled
  three_dissatisfied_in_row: true,  // ETHICAL: Always enabled
  max_duration_days: 30,            // Max 30 days
};

/**
 * Default metrics to track
 */
export const DEFAULT_TRACKED_METRICS: (keyof SplitTestMetrics)[] = [
  'competency_achievement_rate',
  'avg_messages_to_competency',
  'learner_satisfaction_avg',
  'stuck_rate',
  'completion_rate',
];
