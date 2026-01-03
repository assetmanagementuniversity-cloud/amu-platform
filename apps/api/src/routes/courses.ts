/**
 * Courses routes
 */

import { Router } from 'express';
import {
  getPublishedCourses,
  getCourseById,
  getCourseWithModules,
  getModuleById,
} from '@amu/database';
import { createApiError } from '../middleware/error-handler';

const router = Router();

/**
 * GET /api/courses
 * Get all published courses
 */
router.get('/', async (_req, res, next) => {
  try {
    const courses = await getPublishedCourses();

    res.json({
      success: true,
      data: courses.map((course) => ({
        id: course.course_id,
        title: course.course_title,
        description: course.course_description,
        type: course.course_type,
        level: course.course_level,
        nqfLevel: course.course_nqf_level,
        credits: course.course_credits,
        certificatePrice: course.course_certificate_price,
        estimatedHours: course.course_estimated_facilitation_hours,
        learningOutcomes: course.course_learning_outcomes,
        moduleCount: course.course_module_ids.length,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/:courseId
 * Get course details with modules
 */
router.get('/:courseId', async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await getCourseWithModules(courseId);

    if (!result) {
      throw createApiError('Course not found', 404, 'COURSE_NOT_FOUND');
    }

    const { course, modules } = result;

    res.json({
      success: true,
      data: {
        id: course.course_id,
        title: course.course_title,
        description: course.course_description,
        type: course.course_type,
        level: course.course_level,
        nqfLevel: course.course_nqf_level,
        credits: course.course_credits,
        notionalHours: course.course_notional_hours,
        certificatePrice: course.course_certificate_price,
        estimatedHours: course.course_estimated_facilitation_hours,
        learningOutcomes: course.course_learning_outcomes,
        competencyFramework: course.course_competency_framework,
        prerequisites: course.course_prerequisite_course_ids,
        modules: modules.map((module) => ({
          id: module.module_id,
          title: module.module_title,
          description: module.module_description,
          order: module.module_order,
          learningObjectives: module.module_learning_objectives,
          estimatedHours: module.module_estimated_hours,
          competencies: module.module_competencies.map((c) => ({
            id: c.competency_id,
            title: c.competency_title,
            description: c.competency_description,
            assessmentType: c.competency_assessment_type,
          })),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/:courseId/modules/:moduleId
 * Get module details
 */
router.get('/:courseId/modules/:moduleId', async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    const module = await getModuleById(moduleId);

    if (!module) {
      throw createApiError('Module not found', 404, 'MODULE_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        id: module.module_id,
        courseId: module.module_course_id,
        title: module.module_title,
        description: module.module_description,
        order: module.module_order,
        learningObjectives: module.module_learning_objectives,
        caseStudyId: module.module_case_study_id,
        estimatedHours: module.module_estimated_hours,
        competencies: module.module_competencies.map((c) => ({
          id: c.competency_id,
          title: c.competency_title,
          description: c.competency_description,
          evidenceCriteria: c.competency_evidence_criteria,
          assessmentType: c.competency_assessment_type,
        })),
        discoveryQuestions: module.module_discovery_questions,
        commonMisconceptions: module.module_common_misconceptions,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
