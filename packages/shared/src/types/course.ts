/**
 * Course and Module types for AMU Platform
 * Based on Sections 5.1.5 and 5.1.6 of the specification
 */

export type CourseType = 'gfmam' | 'qcto_knowledge' | 'qcto_practical' | 'qcto_work_experience';
export type CourseLevel = 'foundation' | 'intermediate' | 'advanced';
export type AssessmentType = 'conversation' | 'assignment' | 'both';

export interface Course {
  course_id: string;
  course_title: string;
  course_description: string;
  course_type: CourseType;
  course_level: CourseLevel;

  // QCTO/SETA
  course_nqf_level?: number;
  course_credits?: number;
  course_notional_hours?: number;

  // Structure
  course_module_ids: string[];
  course_prerequisite_course_ids?: string[];

  // Certification Pricing (list prices - discounts applied at checkout)
  course_certificate_price: number;
  course_estimated_facilitation_hours: number;

  // Content
  course_learning_outcomes: string[];
  course_competency_framework: string;

  // Metadata
  course_published: boolean;
  course_version: string;
  course_last_updated_date: Date;
  course_created_date: Date;
}

export interface Competency {
  competency_id: string;
  competency_title: string;
  competency_description: string;
  competency_evidence_criteria: string[];
  competency_assessment_type: AssessmentType;
}

export interface Module {
  module_id: string;
  module_course_id: string;
  module_title: string;
  module_description: string;
  module_order: number;

  // Content
  module_learning_objectives: string[];
  module_case_study_id: string;
  module_competencies: Competency[];

  // Facilitator Guidance
  module_facilitator_playbook: string;
  module_discovery_questions: string[];
  module_scaffolding_strategies: string[];
  module_common_misconceptions: string[];

  // Estimated Time
  module_estimated_hours: number;

  // GitHub
  module_github_path: string;
  module_version: string;
  module_last_updated_date: Date;
}

/**
 * Course document for Firestore (with serialized dates)
 */
export interface CourseDocument extends Omit<Course, 'course_last_updated_date' | 'course_created_date'> {
  course_last_updated_date: string;
  course_created_date: string;
}

/**
 * Module document for Firestore (with serialized dates)
 */
export interface ModuleDocument extends Omit<Module, 'module_last_updated_date'> {
  module_last_updated_date: string;
}
