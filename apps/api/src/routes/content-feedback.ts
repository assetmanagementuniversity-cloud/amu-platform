/**
 * Content Feedback Routes - AMU Platform
 *
 * Intelligent Content Improvement System (Section 14)
 *
 * Privacy-First API Endpoints:
 * - All feedback is anonymized before storage
 * - NO learner identifiers ever stored
 * - Dashboard shows aggregated data only
 *
 * "Ubuntu - I am because we are"
 */

import { Router } from 'express';
import {
  saveUbuntuFeedback,
  getModuleFeedback,
  getActionableFeedback,
  getContentFeedbackDashboard,
  getOrCreateModuleRecord,
  getModuleRecord,
  updateSuggestionStatus,
  getAllPendingSuggestions,
  getModulesNeedingAnalysis,
  updateModuleAnalysis,
  updateFeedbackAfterProcessing,
  getUnprocessedFeedback,
  getModuleAnalysisHistory,
} from '@amu/database';
import {
  detectStrugglePoints,
  analyzeConversations,
  generateImprovementSuggestions,
  processUbuntuFeedback,
  aggregateFeedbackThemes,
  type CompetencyStats,
  type AnonymizedConversation,
} from '@amu/ai';
import { createApiError } from '../middleware/error-handler';
import { requireAuth, requireAdmin, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// ================================================
// LEARNER FEEDBACK (Privacy-Safe)
// ================================================

/**
 * POST /api/content-feedback/submit
 *
 * Submit Ubuntu feedback after module completion.
 * PRIVACY: Feedback is immediately anonymized - NO learner ID stored.
 */
router.post('/submit', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      moduleId,
      moduleTitle,
      struggleMost,
      makeBetter,
      experienceLevel,
      completionTimeMinutes,
    } = req.body as {
      moduleId: string;
      moduleTitle: string;
      struggleMost: string;
      makeBetter: string;
      experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
      completionTimeMinutes?: number;
    };

    if (!moduleId || !moduleTitle || !struggleMost || !makeBetter) {
      throw createApiError('Missing required fields', 400, 'INVALID_REQUEST');
    }

    // PRIVACY: We do NOT store req.userId or any learner identifier
    const feedback = await saveUbuntuFeedback({
      module_id: moduleId,
      module_title: moduleTitle,
      struggle_most: struggleMost,
      make_better: makeBetter,
      learner_experience_level: experienceLevel,
      completion_time_minutes: completionTimeMinutes,
      ai_processed: false,
    });

    res.json({
      success: true,
      message: 'Thank you for your Ubuntu feedback! Your insights will help future learners.',
      feedbackId: feedback.feedback_id,
    });
  } catch (error) {
    next(error);
  }
});

// ================================================
// ADMIN: DASHBOARD & REVIEW
// ================================================

/**
 * GET /api/content-feedback/dashboard
 *
 * Get content feedback dashboard data.
 * Admin only - shows aggregated, anonymized data.
 */
router.get('/dashboard', requireAdmin, async (_req, res, next) => {
  try {
    const dashboard = await getContentFeedbackDashboard();

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content-feedback/module/:moduleId
 *
 * Get detailed feedback data for a specific module.
 * Admin only.
 */
router.get('/module/:moduleId', requireAdmin, async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    const record = await getModuleRecord(moduleId);
    if (!record) {
      throw createApiError('Module not found', 404, 'NOT_FOUND');
    }

    // Get recent feedback (anonymized)
    const feedback = await getModuleFeedback(moduleId, 50);

    // Get actionable feedback
    const actionableFeedback = await getActionableFeedback(moduleId, 20);

    // Get analysis history
    const analysisHistory = await getModuleAnalysisHistory(moduleId, 5);

    res.json({
      success: true,
      data: {
        record,
        recentFeedback: feedback,
        actionableFeedback,
        analysisHistory,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content-feedback/suggestions
 *
 * Get all pending improvement suggestions.
 * Admin only.
 */
router.get('/suggestions', requireAdmin, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const suggestions = await getAllPendingSuggestions(limit);

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/content-feedback/suggestion/:moduleId/:suggestionId
 *
 * Update suggestion status (approve, reject, implement).
 * Admin only.
 */
router.put(
  '/suggestion/:moduleId/:suggestionId',
  requireAdmin,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { moduleId, suggestionId } = req.params;
      const { status, notes } = req.body as {
        status: 'approved' | 'rejected' | 'implemented' | 'deferred';
        notes?: string;
      };

      if (!status) {
        throw createApiError('Status is required', 400, 'INVALID_REQUEST');
      }

      const validStatuses = ['approved', 'rejected', 'implemented', 'deferred'];
      if (!validStatuses.includes(status)) {
        throw createApiError('Invalid status', 400, 'INVALID_REQUEST');
      }

      // Get reviewer name (admin who is reviewing)
      const reviewedBy = req.userId || 'admin';

      await updateSuggestionStatus(moduleId, suggestionId, status, reviewedBy, notes);

      res.json({
        success: true,
        message: `Suggestion ${status}`,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ================================================
// ADMIN: ANALYSIS TRIGGERS
// ================================================

/**
 * POST /api/content-feedback/analyze/:moduleId
 *
 * Trigger analysis for a specific module.
 * Admin only.
 */
router.post('/analyze/:moduleId', requireAdmin, async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const {
      moduleTitle,
      courseId,
      courseTitle,
      competencyStats,
      conversations,
    } = req.body as {
      moduleTitle: string;
      courseId: string;
      courseTitle: string;
      competencyStats: CompetencyStats[];
      conversations: AnonymizedConversation[];
    };

    if (!moduleTitle || !courseId || !courseTitle) {
      throw createApiError('Missing module metadata', 400, 'INVALID_REQUEST');
    }

    // Ensure module record exists
    await getOrCreateModuleRecord(moduleId, moduleTitle, courseId, courseTitle);

    // Step 1: Detect struggle points from competency stats
    const strugglePoints = await detectStrugglePoints(competencyStats || []);

    // Step 2: Analyze conversations (if provided)
    let analysis = null;
    if (conversations && conversations.length >= 10) {
      analysis = await analyzeConversations(conversations, moduleId, moduleTitle);
    }

    // Step 3: Get existing feedback
    const feedback = await getModuleFeedback(moduleId, 100);

    // Step 4: Generate improvement suggestions
    let suggestions: Awaited<ReturnType<typeof generateImprovementSuggestions>> = [];
    if (analysis) {
      suggestions = await generateImprovementSuggestions(analysis, strugglePoints, feedback);
    }

    // Step 5: Create a minimal analysis result if no conversations
    const analysisResult = analysis || {
      analysis_id: `analysis_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`,
      module_id: moduleId,
      module_title: moduleTitle,
      analyzed_at: new Date().toISOString(),
      conversation_count: 0,
      time_period_start: new Date().toISOString(),
      time_period_end: new Date().toISOString(),
      common_questions: [],
      struggle_points: strugglePoints.map(s => ({
        competency_id: s.competency_id,
        competency_title: s.competency_title,
        stuck_rate: s.developing_rate + s.not_yet_rate,
        common_issue: s.common_issues[0] || '',
      })),
      competency_rates: [],
      engagement: {
        average_messages_per_session: 0,
        completion_rate: 0,
        languages_used: ['English'],
      },
      findings: [],
      strengths: [],
    };

    // Step 6: Update module record
    await updateModuleAnalysis(moduleId, analysisResult, strugglePoints, suggestions);

    res.json({
      success: true,
      data: {
        strugglePointsDetected: strugglePoints.length,
        suggestionsGenerated: suggestions.length,
        highPrioritySuggestions: suggestions.filter(s => s.priority === 'high').length,
        conversationsAnalyzed: conversations?.length || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content-feedback/modules-needing-analysis
 *
 * Get list of modules that need analysis.
 * Admin only.
 */
router.get('/modules-needing-analysis', requireAdmin, async (req, res, next) => {
  try {
    const minConversations = parseInt(req.query.minConversations as string) || 100;
    const frequencyDays = parseInt(req.query.frequencyDays as string) || 7;

    const modules = await getModulesNeedingAnalysis({
      minConversations,
      frequencyDays,
    });

    res.json({
      success: true,
      data: modules,
    });
  } catch (error) {
    next(error);
  }
});

// ================================================
// INTERNAL: AI PROCESSING (Automated)
// ================================================

/**
 * POST /api/content-feedback/process-feedback
 *
 * Process unprocessed feedback with AI.
 * Internal/cron job endpoint.
 */
router.post('/process-feedback', requireAdmin, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    // Get unprocessed feedback
    const unprocessedFeedback = await getUnprocessedFeedback(limit);

    if (unprocessedFeedback.length === 0) {
      res.json({
        success: true,
        message: 'No feedback to process',
        processed: 0,
      });
      return;
    }

    let processedCount = 0;

    // Process each feedback item
    for (const feedback of unprocessedFeedback) {
      try {
        const processed = await processUbuntuFeedback(feedback);

        if (processed.ai_processed) {
          await updateFeedbackAfterProcessing(feedback.feedback_id, {
            ai_categories: processed.ai_categories,
            ai_sentiment: processed.ai_sentiment,
            ai_actionable: processed.ai_actionable,
            ai_summary: processed.ai_summary,
          });
          processedCount++;
        }
      } catch (err) {
        // Log error but continue processing others
        console.error(`Failed to process feedback ${feedback.feedback_id}:`, err);
      }
    }

    res.json({
      success: true,
      message: `Processed ${processedCount} of ${unprocessedFeedback.length} feedback items`,
      processed: processedCount,
      total: unprocessedFeedback.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/content-feedback/aggregate-themes/:moduleId
 *
 * Aggregate feedback themes for a module.
 * Admin only.
 */
router.post('/aggregate-themes/:moduleId', requireAdmin, async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    // Get all feedback for module
    const feedback = await getModuleFeedback(moduleId, 200);

    if (feedback.length < 5) {
      res.json({
        success: true,
        message: 'Not enough feedback to aggregate themes',
        themes: [],
      });
      return;
    }

    // Aggregate themes using AI
    const themes = await aggregateFeedbackThemes(feedback);

    res.json({
      success: true,
      data: themes,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
