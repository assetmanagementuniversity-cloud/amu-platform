/**
 * Search Routes - AMU Platform
 *
 * Section 21: Global Search & Intelligent Discovery
 *
 * Provides API endpoints for:
 * - Natural language course search
 * - Career pathway recommendations
 * - Search analytics and content gap logging
 *
 * "Ubuntu - I am because we are"
 */

import { Router } from 'express';
import {
  getSearchIndex,
  searchModulesByKeywords,
  logContentGap,
  getContentGaps,
  updateContentGapStatus,
  getPrerequisiteChain,
  CAREER_PATHS,
  getCareerPathsForCompetencies,
} from '@amu/database';
import {
  interpretSearchQuery,
  rankModulesForQuery,
  getCareerRecommendations,
  generateNextStepRecommendations,
  generateCareerPathwayAnalysis,
} from '@amu/ai';
import { getEnrolmentsByUserId } from '@amu/database';
import { createApiError } from '../middleware/error-handler';

const router = Router();

// ============================================================================
// Search Endpoints
// ============================================================================

/**
 * POST /api/search
 * Natural language search with Claude interpretation
 */
router.post('/', async (req, res, next) => {
  try {
    const { query, filter, userId } = req.body;

    if (!query || typeof query !== 'string') {
      throw createApiError('Search query is required', 400, 'INVALID_QUERY');
    }

    // Get search index
    const allModules = await getSearchIndex();

    // Get user context if authenticated
    let completedModuleIds: string[] = [];
    if (userId) {
      const enrolments = await getEnrolmentsByUserId(userId);
      completedModuleIds = enrolments
        .filter((e) => e.enrolment_status === 'completed')
        .map((e) => e.enrolment_course_id);
    }

    // Interpret query with Claude
    const interpretedQuery = await interpretSearchQuery(query, {
      completedModules: completedModuleIds,
    });

    // Apply framework filter if specified
    let filteredModules = allModules;
    if (filter && filter !== 'all') {
      filteredModules = allModules.filter((m) => m.framework === filter);
    }

    // Rank modules using AI
    const searchResult = await rankModulesForQuery(
      interpretedQuery,
      filteredModules,
      completedModuleIds
    );

    // Log content gap if detected
    if (searchResult.contentGapDetected) {
      await logContentGap(query, searchResult.recommendations.length, userId);
    }

    // Log search analytics
    await logSearchAnalytics({
      query,
      interpretedIntent: interpretedQuery.intent.type,
      resultCount: searchResult.recommendations.length,
      userId,
      filter,
      timestamp: new Date(),
    });

    res.json({
      success: true,
      data: {
        query: interpretedQuery,
        results: searchResult.recommendations.map((rec) => ({
          moduleId: rec.module.id,
          moduleTitle: rec.module.title,
          description: rec.module.description,
          framework: rec.module.framework,
          level: rec.module.level,
          nqfLevel: rec.module.nqfLevel,
          credits: rec.module.credits,
          relevanceScore: rec.relevanceScore,
          matchReason: rec.matchReason,
          careerAlignment: rec.careerAlignment,
          prerequisitesMet: rec.prerequisitesMet,
          learningOutcomes: rec.module.learningOutcomes,
        })),
        careerInsight: searchResult.careerInsight,
        suggestedLearningPath: searchResult.suggestedLearningPath,
        contentGapDetected: searchResult.contentGapDetected,
        contentGapSuggestion: searchResult.contentGapSuggestion,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/search/career-path
 * Get career path recommendations
 */
router.post('/career-path', async (req, res, next) => {
  try {
    const { role, userId } = req.body;

    if (!role || typeof role !== 'string') {
      throw createApiError('Career role is required', 400, 'INVALID_ROLE');
    }

    // Find the career path
    const careerPath = CAREER_PATHS.find(
      (p) => p.role.toLowerCase() === role.toLowerCase()
    );

    if (!careerPath) {
      throw createApiError('Career path not found', 404, 'CAREER_PATH_NOT_FOUND');
    }

    // Get user's completed modules and competencies
    let completedModuleIds: string[] = [];
    let achievedCompetencies: string[] = [];

    if (userId) {
      const enrolments = await getEnrolmentsByUserId(userId);
      completedModuleIds = enrolments
        .filter((e) => e.enrolment_status === 'completed')
        .map((e) => e.enrolment_course_id);

      achievedCompetencies = enrolments.flatMap((e) =>
        e.enrolment_competencies_achieved.map((c) => c.competency_id)
      );
    }

    // Get search index for module data
    const allModules = await getSearchIndex();

    // Get career recommendations using AI
    const recommendations = await getCareerRecommendations(
      careerPath,
      completedModuleIds,
      allModules
    );

    res.json({
      success: true,
      data: {
        role: careerPath.role,
        description: careerPath.description,
        seniorityLevel: careerPath.seniorityLevel,
        progressPercentage: recommendations.progressPercentage,
        careerInsight: recommendations.careerInsight,
        nextSteps: recommendations.nextSteps.map((step) => ({
          moduleId: step.module.id,
          moduleTitle: step.module.title,
          description: step.module.description,
          framework: step.module.framework,
          level: step.module.level,
          nqfLevel: step.module.nqfLevel,
          credits: step.module.credits,
          relevanceScore: step.relevanceScore,
          matchReason: step.matchReason,
          careerAlignment: step.careerAlignment,
          prerequisitesMet: step.prerequisitesMet,
          learningOutcomes: step.module.learningOutcomes,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/search/next-step
 * Get personalized "Next Step" recommendation
 */
router.post('/next-step', async (req, res, next) => {
  try {
    const { userId, careerGoal, currentRole } = req.body;

    if (!userId) {
      throw createApiError('User ID is required', 400, 'USER_ID_REQUIRED');
    }

    // Get user's enrolments
    const enrolments = await getEnrolmentsByUserId(userId);

    const completedModuleIds = enrolments
      .filter((e) => e.enrolment_status === 'completed')
      .map((e) => e.enrolment_course_id);

    const achievedCompetencies = enrolments.flatMap((e) =>
      e.enrolment_competencies_achieved
    );

    // Get search index
    const allModules = await getSearchIndex();

    // Find target career path if specified
    const targetPath = careerGoal
      ? CAREER_PATHS.find((p) => p.role.toLowerCase() === careerGoal.toLowerCase())
      : undefined;

    // Generate recommendations
    const recommendations = await generateNextStepRecommendations(
      {
        userId,
        completedModuleIds,
        competenciesAchieved: achievedCompetencies,
        currentEnrolments: enrolments.filter((e) => e.enrolment_status === 'active'),
        careerGoal,
        currentRole,
        experienceLevel: determineExperienceLevel(achievedCompetencies.length),
      },
      allModules,
      targetPath
    );

    res.json({
      success: true,
      data: {
        recommendations: recommendations.map((rec) => ({
          moduleId: rec.moduleId,
          moduleTitle: rec.moduleTitle,
          framework: rec.framework,
          reason: rec.reason,
          gapsAddressed: rec.gapsAddressed,
          careerImpact: rec.careerImpact,
          priority: rec.priority,
          estimatedHours: rec.estimatedHours,
          prerequisitesMet: rec.prerequisitesMet,
          missingPrerequisites: rec.missingPrerequisites,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search/career-paths
 * Get available career paths
 */
router.get('/career-paths', async (_req, res, next) => {
  try {
    res.json({
      success: true,
      data: CAREER_PATHS.map((path) => ({
        role: path.role,
        description: path.description,
        seniorityLevel: path.seniorityLevel,
        requiredCompetencies: path.requiredCompetencies,
        recommendedModuleCount: path.recommendedModules.length,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search/modules/:moduleId/prerequisites
 * Get prerequisite chain for a module
 */
router.get('/modules/:moduleId/prerequisites', async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    const chain = await getPrerequisiteChain(moduleId);

    res.json({
      success: true,
      data: {
        moduleId,
        prerequisites: chain.map((m) => ({
          id: m.id,
          title: m.title,
          framework: m.framework,
          level: m.level,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// Content Gap Analytics Endpoints
// ============================================================================

/**
 * GET /api/search/content-gaps
 * Get content gaps for review (admin only)
 */
router.get('/content-gaps', async (req, res, next) => {
  try {
    const { status, limit } = req.query;

    const gaps = await getContentGaps(
      status as 'new' | 'reviewed' | 'addressed' | undefined,
      limit ? parseInt(limit as string, 10) : 50
    );

    res.json({
      success: true,
      data: gaps.map((gap) => ({
        id: gap.id,
        searchQuery: gap.searchQuery,
        timestamp: gap.timestamp.toISOString(),
        matchedCount: gap.matchedCount,
        suggestedTopics: gap.suggestedTopics,
        status: gap.status,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/search/content-gaps/:gapId
 * Update content gap status (admin only)
 */
router.patch('/content-gaps/:gapId', async (req, res, next) => {
  try {
    const { gapId } = req.params;
    const { status, suggestedTopics } = req.body;

    if (!status || !['new', 'reviewed', 'addressed'].includes(status)) {
      throw createApiError('Valid status is required', 400, 'INVALID_STATUS');
    }

    await updateContentGapStatus(gapId, status, suggestedTopics);

    res.json({
      success: true,
      message: 'Content gap status updated',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search/analytics
 * Get search analytics summary (admin only)
 */
router.get('/analytics', async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    // Get analytics from Firestore
    const analytics = await getSearchAnalytics(parseInt(days as string, 10));

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// Helper Functions
// ============================================================================

function determineExperienceLevel(
  competencyCount: number
): 'entry' | 'developing' | 'experienced' | 'expert' {
  if (competencyCount === 0) return 'entry';
  if (competencyCount < 10) return 'developing';
  if (competencyCount < 25) return 'experienced';
  return 'expert';
}

interface SearchAnalyticsEntry {
  query: string;
  interpretedIntent: string;
  resultCount: number;
  userId?: string;
  filter?: string;
  timestamp: Date;
}

async function logSearchAnalytics(entry: SearchAnalyticsEntry): Promise<void> {
  try {
    // Import Firestore dynamically to avoid initialization issues
    const { getFirestore } = await import('@amu/database');
    const db = getFirestore();

    const entryId = `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await db.collection('search_analytics').doc(entryId).set({
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    });
  } catch (error) {
    // Log but don't fail the request
    console.error('[Search Analytics] Failed to log:', error);
  }
}

interface SearchAnalyticsSummary {
  totalSearches: number;
  uniqueUsers: number;
  topQueries: { query: string; count: number }[];
  intentDistribution: { intent: string; count: number }[];
  averageResultCount: number;
  contentGapCount: number;
}

async function getSearchAnalytics(days: number): Promise<SearchAnalyticsSummary> {
  try {
    const { getFirestore } = await import('@amu/database');
    const db = getFirestore();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const snapshot = await db
      .collection('search_analytics')
      .where('timestamp', '>=', startDate.toISOString())
      .get();

    const entries = snapshot.docs.map((doc) => doc.data() as SearchAnalyticsEntry);

    // Calculate analytics
    const uniqueUsers = new Set(entries.filter((e) => e.userId).map((e) => e.userId));
    const queryCount = new Map<string, number>();
    const intentCount = new Map<string, number>();
    let totalResultCount = 0;

    for (const entry of entries) {
      // Count queries
      const normalizedQuery = entry.query.toLowerCase().trim();
      queryCount.set(normalizedQuery, (queryCount.get(normalizedQuery) || 0) + 1);

      // Count intents
      intentCount.set(
        entry.interpretedIntent,
        (intentCount.get(entry.interpretedIntent) || 0) + 1
      );

      // Sum results
      totalResultCount += entry.resultCount;
    }

    // Get content gaps count
    const gaps = await getContentGaps('new', 1000);

    return {
      totalSearches: entries.length,
      uniqueUsers: uniqueUsers.size,
      topQueries: Array.from(queryCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([query, count]) => ({ query, count })),
      intentDistribution: Array.from(intentCount.entries())
        .map(([intent, count]) => ({ intent, count })),
      averageResultCount:
        entries.length > 0 ? Math.round(totalResultCount / entries.length) : 0,
      contentGapCount: gaps.length,
    };
  } catch (error) {
    console.error('[Search Analytics] Failed to get analytics:', error);
    return {
      totalSearches: 0,
      uniqueUsers: 0,
      topQueries: [],
      intentDistribution: [],
      averageResultCount: 0,
      contentGapCount: 0,
    };
  }
}

export default router;
