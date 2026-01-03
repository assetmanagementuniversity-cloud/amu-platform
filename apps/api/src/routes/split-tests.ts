/**
 * Split Tests Routes - AMU Platform
 *
 * Split Testing Framework (Section 14.6)
 *
 * API endpoints for managing A/B tests of content improvements:
 * - Create and manage split tests
 * - Record participant outcomes
 * - Analyze results
 * - Handle ethical stop conditions
 *
 * "Ubuntu - I am because we are"
 */

import { Router } from 'express';
import {
  createSplitTest,
  getSplitTest,
  getAllSplitTests,
  startSplitTest,
  pauseSplitTest,
  resumeSplitTest,
  stopSplitTest,
  concludeSplitTest,
  markWinnerDeployed,
  updateParticipantOutcome,
  recordSatisfactionScore,
  analyzeSplitTestResults,
  getSplitTestSummaries,
  checkEthicalStopConditions,
  checkSampleSizeReached,
} from '@amu/database';
import type { CreateSplitTestInput, SplitTestStatus } from '@amu/shared';
import { createApiError } from '../middleware/error-handler';
import { requireAuth, requireAdmin, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// ================================================
// ADMIN: SPLIT TEST MANAGEMENT
// ================================================

/**
 * POST /api/split-tests
 * Create a new split test from an approved suggestion
 */
router.post('/', requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = req.body as CreateSplitTestInput;

    if (!input.module_id || !input.version_a || !input.version_b) {
      throw createApiError('Missing required fields', 400, 'INVALID_REQUEST');
    }

    // Ensure creator is set
    input.created_by = req.userId || 'admin';

    const splitTest = await createSplitTest(input);

    res.json({
      success: true,
      data: splitTest,
      message: 'Split test created successfully. Start it when ready.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/split-tests
 * Get all split tests (with optional status filter)
 */
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const status = req.query.status as SplitTestStatus | undefined;
    const limit = parseInt(req.query.limit as string) || 50;

    const tests = await getAllSplitTests(status, limit);

    res.json({
      success: true,
      data: tests,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/split-tests/summaries
 * Get split test summaries for dashboard
 */
router.get('/summaries', requireAdmin, async (req, res, next) => {
  try {
    const status = req.query.status as SplitTestStatus | undefined;
    const summaries = await getSplitTestSummaries(status);

    res.json({
      success: true,
      data: summaries,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/split-tests/:id
 * Get a specific split test with full details
 */
router.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const splitTest = await getSplitTest(id);

    if (!splitTest) {
      throw createApiError('Split test not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      data: splitTest,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/split-tests/:id/start
 * Start a split test
 */
router.post('/:id/start', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const splitTest = await getSplitTest(id);
    if (!splitTest) {
      throw createApiError('Split test not found', 404, 'NOT_FOUND');
    }

    if (splitTest.status !== 'draft' && splitTest.status !== 'paused') {
      throw createApiError(
        `Cannot start test in ${splitTest.status} status`,
        400,
        'INVALID_STATE'
      );
    }

    await startSplitTest(id);

    res.json({
      success: true,
      message: 'Split test started. Learners will now be randomly allocated.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/split-tests/:id/pause
 * Pause an active split test
 */
router.post('/:id/pause', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const splitTest = await getSplitTest(id);
    if (!splitTest) {
      throw createApiError('Split test not found', 404, 'NOT_FOUND');
    }

    if (splitTest.status !== 'active') {
      throw createApiError('Can only pause active tests', 400, 'INVALID_STATE');
    }

    await pauseSplitTest(id);

    res.json({
      success: true,
      message: 'Split test paused. No new allocations will occur.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/split-tests/:id/resume
 * Resume a paused split test
 */
router.post('/:id/resume', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const splitTest = await getSplitTest(id);
    if (!splitTest) {
      throw createApiError('Split test not found', 404, 'NOT_FOUND');
    }

    if (splitTest.status !== 'paused') {
      throw createApiError('Can only resume paused tests', 400, 'INVALID_STATE');
    }

    await resumeSplitTest(id);

    res.json({
      success: true,
      message: 'Split test resumed.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/split-tests/:id/stop
 * Manually stop a split test
 */
router.post('/:id/stop', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body as { reason?: string };

    const splitTest = await getSplitTest(id);
    if (!splitTest) {
      throw createApiError('Split test not found', 404, 'NOT_FOUND');
    }

    if (splitTest.status !== 'active' && splitTest.status !== 'paused') {
      throw createApiError('Test is not running', 400, 'INVALID_STATE');
    }

    await stopSplitTest(id, 'manual_stop', { reason });

    res.json({
      success: true,
      message: 'Split test stopped manually.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/split-tests/:id/analyze
 * Trigger analysis of split test results
 */
router.post('/:id/analyze', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const splitTest = await getSplitTest(id);
    if (!splitTest) {
      throw createApiError('Split test not found', 404, 'NOT_FOUND');
    }

    const analysis = await analyzeSplitTestResults(id);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/split-tests/:id/conclude
 * Conclude a split test and select winner
 */
router.post('/:id/conclude', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { winner, notes } = req.body as {
      winner: 'version_a' | 'version_b' | 'no_difference';
      notes?: string;
    };

    if (!winner) {
      throw createApiError('Winner selection required', 400, 'INVALID_REQUEST');
    }

    const splitTest = await getSplitTest(id);
    if (!splitTest) {
      throw createApiError('Split test not found', 404, 'NOT_FOUND');
    }

    await concludeSplitTest(id, winner, notes);

    res.json({
      success: true,
      message: `Split test concluded. Winner: ${winner}`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/split-tests/:id/deploy
 * Mark winning version as deployed
 */
router.post('/:id/deploy', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const splitTest = await getSplitTest(id);
    if (!splitTest) {
      throw createApiError('Split test not found', 404, 'NOT_FOUND');
    }

    if (splitTest.status !== 'concluded') {
      throw createApiError('Test must be concluded before deploying', 400, 'INVALID_STATE');
    }

    if (!splitTest.winner || splitTest.winner === 'no_difference') {
      throw createApiError('No winner to deploy', 400, 'INVALID_STATE');
    }

    await markWinnerDeployed(id);

    res.json({
      success: true,
      message: `Winner (${splitTest.winner}) marked as deployed.`,
    });
  } catch (error) {
    next(error);
  }
});

// ================================================
// METRICS RECORDING (Internal/Automated)
// ================================================

/**
 * POST /api/split-tests/:id/outcome
 * Record participant outcome
 */
router.post('/:id/outcome', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { enrolmentId, outcome } = req.body as {
      enrolmentId: string;
      outcome: {
        competency_achieved?: boolean;
        messages_to_competency?: number;
        time_to_competency_minutes?: number;
        got_stuck?: boolean;
        completed_module?: boolean;
        abandoned?: boolean;
      };
    };

    if (!enrolmentId) {
      throw createApiError('Enrolment ID required', 400, 'INVALID_REQUEST');
    }

    await updateParticipantOutcome(id, enrolmentId, outcome);

    // Check stop conditions
    await checkSampleSizeReached(id);

    res.json({
      success: true,
      message: 'Outcome recorded',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/split-tests/:id/satisfaction
 * Record satisfaction score (triggers ethical checks)
 */
router.post('/:id/satisfaction', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { enrolmentId, score, feedbackText, sentiment } = req.body as {
      enrolmentId: string;
      score: number;
      feedbackText?: string;
      sentiment?: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
    };

    if (!enrolmentId || score === undefined) {
      throw createApiError('Enrolment ID and score required', 400, 'INVALID_REQUEST');
    }

    if (score < 1 || score > 5) {
      throw createApiError('Score must be between 1 and 5', 400, 'INVALID_REQUEST');
    }

    await recordSatisfactionScore(id, enrolmentId, score, feedbackText, sentiment);

    // This automatically checks ethical stop conditions
    const stopped = await checkEthicalStopConditions(id);

    res.json({
      success: true,
      message: stopped ? 'Satisfaction recorded. TEST STOPPED due to ethical concerns.' : 'Satisfaction recorded',
      ethicalStop: stopped,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/split-tests/:id/check-conditions
 * Manually check all stop conditions
 */
router.post('/:id/check-conditions', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const ethicalStop = await checkEthicalStopConditions(id);
    const sampleReached = await checkSampleSizeReached(id);

    res.json({
      success: true,
      data: {
        ethicalStop,
        sampleReached,
        testStopped: ethicalStop || sampleReached,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
