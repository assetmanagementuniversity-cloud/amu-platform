/**
 * Enrolments API Service - AMU Platform
 *
 * API functions for managing course enrolments.
 *
 * "Ubuntu - I am because we are"
 */

import { apiClient, ApiRequestError } from './client';

// =============================================================================
// TYPES
// =============================================================================

export type EnrolmentStatus = 'active' | 'completed' | 'paused' | 'withdrawn';

export type CompetencyLevel = 'not_yet' | 'developing' | 'competent';

export interface CompetencyProgress {
  competency_id: string;
  competency_title: string;
  level: CompetencyLevel;
  last_assessed: string;
  evidence_count: number;
}

export interface ModuleProgress {
  module_id: string;
  module_title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at?: string;
  completed_at?: string;
  competencies: CompetencyProgress[];
  conversation_count: number;
}

export interface Enrolment {
  enrolment_id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  course_thumbnail_url?: string;
  status: EnrolmentStatus;
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  last_activity_at: string;
  current_module_id?: string;
  modules_progress: ModuleProgress[];
  overall_progress_percent: number;
}

export interface EnrolmentListItem {
  enrolment_id: string;
  course_id: string;
  course_title: string;
  course_thumbnail_url?: string;
  status: EnrolmentStatus;
  enrolled_at: string;
  last_activity_at: string;
  overall_progress_percent: number;
  current_module_title?: string;
}

export interface EnrolmentFilters {
  status?: EnrolmentStatus;
  limit?: number;
  offset?: number;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Get user's enrolments
 */
export async function getEnrolments(filters?: EnrolmentFilters): Promise<EnrolmentListItem[]> {
  const params = new URLSearchParams();

  if (filters?.status) params.set('status', filters.status);
  if (filters?.limit) params.set('limit', filters.limit.toString());
  if (filters?.offset) params.set('offset', filters.offset.toString());

  const queryString = params.toString();
  const endpoint = queryString ? `/enrolments?${queryString}` : '/enrolments';

  const response = await apiClient.get<{ enrolments: EnrolmentListItem[] }>(endpoint);

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to fetch enrolments',
      response.code || 'FETCH_ERROR',
      500
    );
  }

  return response.data.enrolments;
}

/**
 * Get a single enrolment by ID
 */
export async function getEnrolment(enrolmentId: string): Promise<Enrolment> {
  const response = await apiClient.get<{ enrolment: Enrolment }>(`/enrolments/${enrolmentId}`);

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Enrolment not found',
      response.code || 'NOT_FOUND',
      404
    );
  }

  return response.data.enrolment;
}

/**
 * Enrol in a course
 */
export async function enrollInCourse(courseId: string): Promise<Enrolment> {
  const response = await apiClient.post<{ enrolment: Enrolment }>('/enrolments', {
    course_id: courseId,
  });

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to enrol in course',
      response.code || 'ENROL_ERROR',
      500
    );
  }

  return response.data.enrolment;
}

/**
 * Update enrolment status
 */
export async function updateEnrolmentStatus(
  enrolmentId: string,
  status: EnrolmentStatus
): Promise<Enrolment> {
  const response = await apiClient.patch<{ enrolment: Enrolment }>(
    `/enrolments/${enrolmentId}`,
    { status }
  );

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to update enrolment',
      response.code || 'UPDATE_ERROR',
      500
    );
  }

  return response.data.enrolment;
}

/**
 * Get enrolment progress details
 */
export async function getEnrolmentProgress(enrolmentId: string): Promise<ModuleProgress[]> {
  const response = await apiClient.get<{ modules: ModuleProgress[] }>(
    `/enrolments/${enrolmentId}/progress`
  );

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to fetch progress',
      response.code || 'FETCH_ERROR',
      500
    );
  }

  return response.data.modules;
}

/**
 * Start a module within an enrolment
 */
export async function startModule(enrolmentId: string, moduleId: string): Promise<ModuleProgress> {
  const response = await apiClient.post<{ module: ModuleProgress }>(
    `/enrolments/${enrolmentId}/modules/${moduleId}/start`
  );

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to start module',
      response.code || 'START_ERROR',
      500
    );
  }

  return response.data.module;
}

/**
 * Get active enrolment for a course (if exists)
 */
export async function getActiveEnrolment(courseId: string): Promise<Enrolment | null> {
  const response = await apiClient.get<{ enrolment: Enrolment | null }>(
    `/enrolments/course/${courseId}`
  );

  if (!response.success) {
    // Return null if not found - not an error for this case
    return null;
  }

  return response.data?.enrolment || null;
}

/**
 * Get learning statistics for dashboard
 */
export async function getLearningStats(): Promise<{
  total_courses: number;
  completed_courses: number;
  active_courses: number;
  total_hours: number;
  competencies_achieved: number;
}> {
  const response = await apiClient.get<{
    stats: {
      total_courses: number;
      completed_courses: number;
      active_courses: number;
      total_hours: number;
      competencies_achieved: number;
    };
  }>('/enrolments/stats');

  if (!response.success || !response.data) {
    // Return default stats on error
    return {
      total_courses: 0,
      completed_courses: 0,
      active_courses: 0,
      total_hours: 0,
      competencies_achieved: 0,
    };
  }

  return response.data.stats;
}
