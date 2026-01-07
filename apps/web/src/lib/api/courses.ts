/**
 * Courses API Service - AMU Platform
 *
 * API functions for fetching course data.
 *
 * "Ubuntu - I am because we are"
 */

import { apiClient, ApiRequestError } from './client';

// =============================================================================
// TYPES
// =============================================================================

export interface Course {
  course_id: string;
  course_title: string;
  course_description: string;
  course_category: string;
  course_nqf_level: number;
  course_credits: number;
  course_duration_hours: number;
  course_modules: CourseModule[];
  course_competencies: string[];
  course_prerequisites: string[];
  course_thumbnail_url?: string;
  course_status: 'draft' | 'published' | 'archived';
  course_created_at: string;
  course_updated_at: string;
}

export interface CourseModule {
  module_id: string;
  module_title: string;
  module_description: string;
  module_order: number;
  module_duration_minutes: number;
  module_competencies: string[];
}

export interface CourseListItem {
  course_id: string;
  course_title: string;
  course_description: string;
  course_category: string;
  course_nqf_level: number;
  course_credits: number;
  course_duration_hours: number;
  course_thumbnail_url?: string;
  course_module_count: number;
}

export interface CourseFilters {
  category?: string;
  nqfLevel?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Get all published courses
 */
export async function getCourses(filters?: CourseFilters): Promise<CourseListItem[]> {
  const params = new URLSearchParams();

  if (filters?.category) params.set('category', filters.category);
  if (filters?.nqfLevel) params.set('nqf_level', filters.nqfLevel.toString());
  if (filters?.search) params.set('search', filters.search);
  if (filters?.limit) params.set('limit', filters.limit.toString());
  if (filters?.offset) params.set('offset', filters.offset.toString());

  const queryString = params.toString();
  const endpoint = queryString ? `/courses?${queryString}` : '/courses';

  const response = await apiClient.get<{ courses: CourseListItem[] }>(endpoint);

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to fetch courses',
      response.code || 'FETCH_ERROR',
      500
    );
  }

  return response.data.courses;
}

/**
 * Get a single course by ID
 */
export async function getCourse(courseId: string): Promise<Course> {
  const response = await apiClient.get<{ course: Course }>(`/courses/${courseId}`);

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Course not found',
      response.code || 'NOT_FOUND',
      404
    );
  }

  return response.data.course;
}

/**
 * Get course categories
 */
export async function getCourseCategories(): Promise<string[]> {
  const response = await apiClient.get<{ categories: string[] }>('/courses/categories');

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Failed to fetch categories',
      response.code || 'FETCH_ERROR',
      500
    );
  }

  return response.data.categories;
}

/**
 * Search courses
 */
export async function searchCourses(query: string): Promise<CourseListItem[]> {
  const response = await apiClient.get<{ courses: CourseListItem[] }>(
    `/search?q=${encodeURIComponent(query)}&type=courses`
  );

  if (!response.success || !response.data) {
    throw new ApiRequestError(
      response.error || 'Search failed',
      response.code || 'SEARCH_ERROR',
      500
    );
  }

  return response.data.courses;
}

/**
 * Get recommended courses for user
 */
export async function getRecommendedCourses(limit = 3): Promise<CourseListItem[]> {
  const response = await apiClient.get<{ courses: CourseListItem[] }>(
    `/courses/recommended?limit=${limit}`
  );

  if (!response.success || !response.data) {
    // Return empty array for recommendations - not critical
    return [];
  }

  return response.data.courses;
}
