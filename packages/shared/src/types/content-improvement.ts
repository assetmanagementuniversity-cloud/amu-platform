/**
 * Content Improvement Types - AMU Platform
 *
 * Intelligent Content Improvement System (Section 14)
 *
 * This system enables continuous evolution of course content through:
 * 1. AI-detected struggle points from competency tracking
 * 2. Ubuntu feedback from learners (anonymized)
 * 3. Conversation pattern analysis
 *
 * Privacy-First: All learner feedback is strictly anonymized.
 * No names, IDs, or PII ever stored in this collection.
 *
 * "Ubuntu - I am because we are"
 */

/**
 * Source of the improvement suggestion
 */
export type ImprovementSource =
  | 'ai_testing'              // Issues found during AI learner testing
  | 'conversation_analysis'   // Patterns from real learner conversations
  | 'competency_tracking'     // Struggle point detection from competency rates
  | 'split_testing'           // A/B testing results
  | 'learner_feedback';       // Direct Ubuntu feedback from learners

/**
 * Category of the improvement
 */
export type ImprovementCategory =
  | 'content_gap'        // Missing information learners need
  | 'unclear_instruction'  // Instructions that confuse learners
  | 'scaffolding'        // Insufficient help when struggling
  | 'examples'           // Need for more/better examples
  | 'terminology'        // Confusing terms or jargon
  | 'structure'          // Module flow and organization
  | 'case_study'         // Case study relevance or clarity
  | 'assessment';        // Assessment question clarity

/**
 * Priority level for improvements
 */
export type ImprovementPriority = 'high' | 'medium' | 'low';

/**
 * Status of the improvement suggestion
 */
export type ImprovementStatus =
  | 'pending'            // Awaiting review
  | 'reviewing'          // Currently being reviewed
  | 'approved'           // Approved, ready to implement
  | 'implemented'        // Change has been made
  | 'rejected'           // Rejected (with reason)
  | 'deferred';          // Deferred for later consideration

/**
 * Struggle Point - Detected from competency tracking
 * All data is aggregated and anonymized
 */
export interface StrugglePoint {
  competency_id: string;
  competency_title: string;
  module_id: string;
  module_title: string;

  // Aggregated statistics (no individual learner data)
  total_attempts: number;
  developing_count: number;
  developing_rate: number;           // Percentage still at 'developing'
  not_yet_count: number;
  not_yet_rate: number;              // Percentage at 'not_yet'
  average_messages_to_competent: number;

  // AI-detected patterns (anonymized)
  common_issues: string[];           // E.g., "Confusion between X and Y"
  common_questions: string[];        // E.g., "What does X mean?"
  suggested_scaffolding: string[];   // AI suggestions

  // Detection metadata
  detected_at: string;
  sample_size: number;
  confidence: number;                // 0.0 to 1.0
}

/**
 * Ubuntu Feedback - Direct learner suggestions (anonymized)
 * Collected at module completion
 *
 * PRIVACY: No learner identifiers stored
 */
export interface UbuntuFeedback {
  feedback_id: string;
  module_id: string;
  module_title: string;

  // The two Ubuntu questions (Section 2.4, 14.2)
  struggle_most: string;             // "What did you struggle with most?"
  make_better: string;               // "How can we make this better for those who learn after you?"

  // Metadata (anonymized)
  submitted_at: string;
  learner_experience_level?: 'beginner' | 'intermediate' | 'advanced';
  completion_time_minutes?: number;

  // AI processing
  ai_processed: boolean;
  ai_categories?: ImprovementCategory[];
  ai_sentiment?: 'positive' | 'neutral' | 'negative' | 'constructive';
  ai_actionable?: boolean;
  ai_summary?: string;
}

/**
 * Conversation Analysis Result
 * Aggregated patterns from 100+ conversations
 */
export interface ConversationAnalysisResult {
  analysis_id: string;
  module_id: string;
  module_title: string;

  // Analysis metadata
  analyzed_at: string;
  conversation_count: number;
  time_period_start: string;
  time_period_end: string;

  // Common questions (aggregated)
  common_questions: {
    question: string;
    percentage: number;        // % of learners who asked this
    category: string;
  }[];

  // Struggle points detected
  struggle_points: {
    competency_id: string;
    competency_title: string;
    stuck_rate: number;        // % who got stuck
    common_issue: string;
  }[];

  // Competency achievement rates
  competency_rates: {
    competency_id: string;
    competency_title: string;
    competent_rate: number;
    developing_rate: number;
    not_yet_rate: number;
  }[];

  // Engagement metrics
  engagement: {
    average_messages_per_session: number;
    completion_rate: number;
    languages_used: string[];
  };

  // AI findings
  findings: ConversationFinding[];
  strengths: string[];
}

/**
 * Individual finding from conversation analysis
 */
export interface ConversationFinding {
  category: ImprovementCategory;
  severity: 'high' | 'medium' | 'low';
  description: string;
  evidence: string;
  impact: string;
  location: string;
}

/**
 * Improvement Suggestion - Generated by AI or from feedback
 */
export interface ImprovementSuggestion {
  suggestion_id: string;
  module_id: string;
  module_title: string;

  // Source and category
  source: ImprovementSource;
  category: ImprovementCategory;
  priority: ImprovementPriority;
  status: ImprovementStatus;

  // Suggestion details
  title: string;
  current_state: string;           // What exists now
  proposed_change: string;         // Specific revision to make
  expected_impact: string;         // How this improves learning
  estimated_effort: 'small' | 'medium' | 'large';  // < 1 hour, 1-3 hours, > 3 hours

  // Context
  affected_competency_id?: string;
  affected_competency_title?: string;
  evidence: string;                // Data supporting this suggestion

  // Linked feedback (anonymized references only)
  linked_feedback_count: number;   // How many learners mentioned this
  linked_analysis_ids: string[];   // Which analyses found this

  // Timestamps
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  implemented_at?: string;

  // Review notes (from Muhammad Ali)
  review_notes?: string;
  rejection_reason?: string;
}

/**
 * Content Improvement Record
 * Main document stored in content_improvements collection
 */
export interface ContentImprovementRecord {
  record_id: string;
  module_id: string;
  module_title: string;
  course_id: string;
  course_title: string;

  // Aggregated data
  last_analysis_at: string;
  total_conversations_analyzed: number;
  total_feedback_collected: number;

  // Struggle points (Section 14.3)
  struggle_points: StrugglePoint[];

  // Learner feedback (Section 14.2 - anonymized)
  learner_feedback: UbuntuFeedback[];

  // AI-generated suggestions
  suggestions: ImprovementSuggestion[];

  // Conversation analyses
  analyses: ConversationAnalysisResult[];

  // Summary statistics
  summary: {
    high_priority_count: number;
    pending_suggestions: number;
    implemented_suggestions: number;
    average_developing_rate: number;
    top_struggle_competencies: string[];
    common_feedback_themes: string[];
  };

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Content Feedback Dashboard Data
 * Prepared data for the admin dashboard
 */
export interface ContentFeedbackDashboardData {
  // Overview metrics
  total_modules: number;
  modules_needing_attention: number;
  pending_suggestions: number;
  feedback_this_week: number;

  // Modules sorted by priority
  modules: {
    module_id: string;
    module_title: string;
    course_title: string;
    developing_rate: number;
    struggle_point_count: number;
    feedback_count: number;
    pending_suggestions: number;
    priority_score: number;
  }[];

  // Top struggle points across all modules
  top_struggle_points: {
    competency_title: string;
    module_title: string;
    developing_rate: number;
    common_issue: string;
  }[];

  // Recent feedback themes (aggregated, anonymized)
  feedback_themes: {
    theme: string;
    count: number;
    sentiment: string;
  }[];
}

/**
 * Analysis trigger configuration
 */
export interface AnalysisTriggerConfig {
  min_conversations: number;       // Minimum conversations before analysis (default: 100)
  analysis_frequency_days: number; // Days between analyses (default: 7)
  high_priority_threshold: number; // Developing rate above this triggers high priority (default: 40)
  notification_enabled: boolean;
}

/**
 * Default analysis configuration
 */
export const DEFAULT_ANALYSIS_CONFIG: AnalysisTriggerConfig = {
  min_conversations: 100,
  analysis_frequency_days: 7,
  high_priority_threshold: 40,
  notification_enabled: true,
};
