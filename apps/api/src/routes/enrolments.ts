/**
 * Enrolments routes
 */

import { Router } from 'express';
import {
  createEnrolment,
  getEnrolmentById,
  getEnrolmentsByUserId,
  getActiveEnrolment,
  updateEnrolmentProgress,
  getCourseWithModules,
} from '@amu/database';
import { createEnrolmentSchema } from '@amu/shared';
import { createApiError } from '../middleware/error-handler';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/enrolments
 * Get all enrolments for current user
 */
router.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const enrolments = await getEnrolmentsByUserId(req.userId);

    res.json({
      success: true,
      data: enrolments.map((enrolment) => ({
        id: enrolment.enrolment_id,
        courseId: enrolment.enrolment_course_id,
        status: enrolment.enrolment_status,
        startedDate: enrolment.enrolment_started_date,
        completedDate: enrolment.enrolment_completed_date,
        lastActivityDate: enrolment.enrolment_last_activity_date,
        currentModuleId: enrolment.enrolment_current_module_id,
        currentModuleTitle: enrolment.enrolment_current_module_title,
        progressPercentage: enrolment.enrolment_progress_percentage,
        modulesCompleted: enrolment.enrolment_modules_completed.length,
        competenciesAchieved: enrolment.enrolment_competencies_achieved.length,
        certificateGenerated: enrolment.enrolment_certificate_generated,
        certificateType: enrolment.enrolment_certificate_type,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/enrolments
 * Create a new enrolment
 */
router.post('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    // Validate input
    const input = createEnrolmentSchema.parse(req.body);

    // Check if already enrolled
    const existingEnrolment = await getActiveEnrolment(req.userId, input.enrolment_course_id);
    if (existingEnrolment) {
      throw createApiError('Already enrolled in this course', 409, 'ALREADY_ENROLLED');
    }

    // Get course and first module
    const courseData = await getCourseWithModules(input.enrolment_course_id);
    if (!courseData) {
      throw createApiError('Course not found', 404, 'COURSE_NOT_FOUND');
    }

    const { modules } = courseData;
    if (modules.length === 0) {
      throw createApiError('Course has no modules', 400, 'NO_MODULES');
    }

    const firstModule = modules[0];
    if (!firstModule) {
      throw createApiError('First module not found', 400, 'NO_MODULES');
    }

    // Create enrolment
    const enrolment = await createEnrolment(
      req.userId,
      input.enrolment_course_id,
      firstModule.module_id,
      firstModule.module_title,
      input.enrolment_language
    );

    res.status(201).json({
      success: true,
      data: {
        id: enrolment.enrolment_id,
        courseId: enrolment.enrolment_course_id,
        status: enrolment.enrolment_status,
        currentModuleId: enrolment.enrolment_current_module_id,
        currentModuleTitle: enrolment.enrolment_current_module_title,
        language: enrolment.enrolment_language,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/enrolments/:enrolmentId
 * Get enrolment details
 */
router.get('/:enrolmentId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { enrolmentId } = req.params;
    const enrolment = await getEnrolmentById(enrolmentId);

    if (!enrolment) {
      throw createApiError('Enrolment not found', 404, 'ENROLMENT_NOT_FOUND');
    }

    // Verify ownership
    if (enrolment.enrolment_user_id !== req.userId) {
      throw createApiError('Not authorized to view this enrolment', 403, 'FORBIDDEN');
    }

    res.json({
      success: true,
      data: {
        id: enrolment.enrolment_id,
        courseId: enrolment.enrolment_course_id,
        status: enrolment.enrolment_status,
        startedDate: enrolment.enrolment_started_date,
        completedDate: enrolment.enrolment_completed_date,
        lastActivityDate: enrolment.enrolment_last_activity_date,
        currentModuleId: enrolment.enrolment_current_module_id,
        currentModuleTitle: enrolment.enrolment_current_module_title,
        modulesCompleted: enrolment.enrolment_modules_completed,
        progressPercentage: enrolment.enrolment_progress_percentage,
        competenciesAchieved: enrolment.enrolment_competencies_achieved,
        currentCompetencyId: enrolment.enrolment_current_competency_id,
        currentCompetencyStatus: enrolment.enrolment_current_competency_status,
        language: enrolment.enrolment_language,
        conversationIds: enrolment.enrolment_conversation_ids,
        activeConversationId: enrolment.enrolment_active_conversation_id,
        certificateGenerated: enrolment.enrolment_certificate_generated,
        certificateType: enrolment.enrolment_certificate_type,
        certificateId: enrolment.enrolment_certificate_id,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/enrolments/:enrolmentId/progress
 * Update enrolment progress
 */
router.patch('/:enrolmentId/progress', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.userId) {
      throw createApiError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { enrolmentId } = req.params;
    const enrolment = await getEnrolmentById(enrolmentId);

    if (!enrolment) {
      throw createApiError('Enrolment not found', 404, 'ENROLMENT_NOT_FOUND');
    }

    // Verify ownership
    if (enrolment.enrolment_user_id !== req.userId) {
      throw createApiError('Not authorized to update this enrolment', 403, 'FORBIDDEN');
    }

    const { currentModuleId, currentModuleTitle, modulesCompleted, progressPercentage } = req.body;

    await updateEnrolmentProgress(enrolmentId, {
      current_module_id: currentModuleId,
      current_module_title: currentModuleTitle,
      modules_completed: modulesCompleted,
      progress_percentage: progressPercentage,
    });

    res.json({
      success: true,
      message: 'Progress updated',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
