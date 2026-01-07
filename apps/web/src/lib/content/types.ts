/**
 * Content Types - AMU Platform
 *
 * Types for course content loaded from the amu-content GitHub repo.
 * Per Section 6.3: Content stored in separate public repository.
 *
 * "Ubuntu - I am because we are"
 */

// =============================================================================
// MODULE STRUCTURE
// =============================================================================

/**
 * Course module metadata (from module.json)
 */
export interface ModuleMetadata {
  module_id: string;
  module_title: string;
  module_description: string;
  module_version: string;
  module_last_updated: string;
  module_estimated_duration_minutes: number;
  module_nqf_level: number;
  module_credits: number;
  module_prerequisites?: string[];
  module_learning_outcomes: LearningOutcome[];
  module_keywords: string[];
  module_seta_codes?: string[];
}

/**
 * Learning outcome within a module
 */
export interface LearningOutcome {
  outcome_id: string;
  outcome_description: string;
  outcome_assessment_criteria: string[];
  outcome_bloom_level: BloomLevel;
}

/**
 * Bloom's taxonomy levels for learning outcomes
 */
export type BloomLevel =
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create';

// =============================================================================
// COMPETENCY DEFINITIONS
// =============================================================================

/**
 * Competency definition (from competencies.json)
 */
export interface Competency {
  competency_id: string;
  competency_title: string;
  competency_description: string;
  competency_indicators: CompetencyIndicator[];
  competency_related_outcomes: string[];
}

/**
 * Indicator for competency assessment
 */
export interface CompetencyIndicator {
  indicator_id: string;
  indicator_description: string;
  indicator_level: 'essential' | 'developing' | 'advanced';
}

// =============================================================================
// CASE STUDY
// =============================================================================

/**
 * Case study content structure
 */
export interface CaseStudy {
  case_study_id: string;
  case_study_title: string;
  case_study_context: string;
  case_study_scenario: string;
  case_study_discussion_points: string[];
  case_study_key_learnings: string[];
  case_study_related_competencies: string[];
}

// =============================================================================
// FACILITATOR CONTENT
// =============================================================================

/**
 * Facilitator playbook for AI facilitation
 */
export interface FacilitatorPlaybook {
  playbook_module_id: string;
  playbook_discovery_questions: DiscoveryQuestion[];
  playbook_scaffolding_strategies: ScaffoldingStrategy[];
  playbook_common_misconceptions: Misconception[];
  playbook_discussion_prompts: string[];
  playbook_assessment_rubric: AssessmentRubric;
}

/**
 * Discovery question for Socratic facilitation
 */
export interface DiscoveryQuestion {
  question_id: string;
  question_text: string;
  question_purpose: string;
  question_competency: string;
  question_follow_ups: string[];
}

/**
 * Scaffolding strategy for struggling learners
 */
export interface ScaffoldingStrategy {
  strategy_id: string;
  strategy_trigger: string;
  strategy_approach: string;
  strategy_examples: string[];
}

/**
 * Common misconception to address
 */
export interface Misconception {
  misconception_id: string;
  misconception_description: string;
  misconception_correction: string;
  misconception_indicators: string[];
}

/**
 * Assessment rubric for competency determination
 */
export interface AssessmentRubric {
  rubric_competent: string[];
  rubric_developing: string[];
  rubric_not_yet: string[];
}

// =============================================================================
// EMAIL TEMPLATES
// =============================================================================

/**
 * Email template content
 */
export interface EmailTemplate {
  template_id: string;
  template_name: string;
  template_subject: string;
  template_body_markdown: string;
  template_variables: string[];
}

// =============================================================================
// UI TEXT
// =============================================================================

/**
 * UI messages and text content
 */
export interface UIMessages {
  messages: Record<string, Record<string, string>>;
  version: string;
  last_updated: string;
}

// =============================================================================
// CONTENT CACHE
// =============================================================================

/**
 * Cached content entry
 */
export interface CachedContent<T> {
  content: T;
  cached_at: number;
  expires_at: number;
  source: 'github' | 'firestore';
}

/**
 * Content loading result
 */
export interface ContentLoadResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  fromCache: boolean;
}
