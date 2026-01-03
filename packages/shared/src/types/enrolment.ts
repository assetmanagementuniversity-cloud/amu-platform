/**
 * Enrolment types for AMU Platform
 * Based on Section 5.1.7 of the specification
 */

export type EnrolmentStatus = 'active' | 'paused' | 'completed' | 'abandoned';
export type CompetencyStatus = 'not_yet' | 'developing' | 'competent';
export type CertificateType = 'unofficial' | 'official';

export interface CompetencyAchievement {
  competency_id: string;
  competency_title: string;
  achieved_date: Date;
  achievement_level: 'competent';
  evidence_conversation_id?: string;
  evidence_assignment_id?: string;
}

export interface Enrolment {
  enrolment_id: string;
  enrolment_user_id: string;
  enrolment_course_id: string;

  // Status
  enrolment_status: EnrolmentStatus;
  enrolment_started_date: Date;
  enrolment_completed_date?: Date;
  enrolment_last_activity_date: Date;

  // Progress
  enrolment_current_module_id: string;
  enrolment_current_module_title: string;
  enrolment_modules_completed: string[];
  enrolment_progress_percentage: number;

  // Competencies
  enrolment_competencies_achieved: CompetencyAchievement[];
  enrolment_current_competency_id?: string;
  enrolment_current_competency_status?: CompetencyStatus;

  // Language
  enrolment_language: string;

  // Conversations
  enrolment_conversation_ids: string[];
  enrolment_active_conversation_id?: string;

  // Certificate
  enrolment_certificate_generated: boolean;
  enrolment_certificate_type?: CertificateType;
  enrolment_certificate_id?: string;

  // Split Testing (Section 14.6)
  enrolment_split_test_id?: string;
  enrolment_split_test_version?: 'version_a' | 'version_b';
}

/**
 * Enrolment document for Firestore (with serialized dates)
 */
export interface EnrolmentDocument extends Omit<Enrolment, 'enrolment_started_date' | 'enrolment_completed_date' | 'enrolment_last_activity_date' | 'enrolment_competencies_achieved'> {
  enrolment_started_date: string;
  enrolment_completed_date?: string;
  enrolment_last_activity_date: string;
  enrolment_competencies_achieved: Array<Omit<CompetencyAchievement, 'achieved_date'> & { achieved_date: string }>;
}

/**
 * Create enrolment input
 */
export interface CreateEnrolmentInput {
  enrolment_user_id: string;
  enrolment_course_id: string;
  enrolment_language?: string;
}
