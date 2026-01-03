/**
 * Split Tests collection operations - AMU Platform
 *
 * Split Testing Framework (Section 14.6)
 *
 * Enables rigorous A/B testing of content improvements:
 * - Random allocation of learners to versions
 * - Comparative metrics tracking
 * - Ethical stop conditions for learner protection
 *
 * "Ubuntu - I am because we are"
 */

import { getFirestore, FieldValue } from '../config/firebase-admin';
import type {
  SplitTest,
  SplitTestDocument,
  SplitTestSummary,
  SplitTestParticipant,
  SplitTestAnalysis,
  SplitTestMetrics,
  EthicalStopEvent,
  CreateSplitTestInput,
  SplitTestStatus,
  StopConditionType,
  DEFAULT_STOP_CONDITIONS,
  DEFAULT_TRACKED_METRICS,
} from '@amu/shared';

const COLLECTION = 'split_tests';

// ================================================
// SPLIT TEST CRUD
// ================================================

/**
 * Create a new split test
 */
export async function createSplitTest(
  input: CreateSplitTestInput
): Promise<SplitTest> {
  const db = getFirestore();

  const splitTestId = `split_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const splitTest: SplitTestDocument = {
    split_test_id: splitTestId,

    module_id: input.module_id,
    module_title: input.module_title,
    course_id: input.course_id,
    course_title: input.course_title,
    improvement_id: input.improvement_id,

    status: 'draft',
    created_at: now,

    version_a: input.version_a,
    version_b: input.version_b,

    allocation_strategy: input.allocation_strategy || 'random_50_50',
    target_sample_size: input.target_sample_size || 100,
    current_sample_a: 0,
    current_sample_b: 0,

    tracked_metrics: DEFAULT_TRACKED_METRICS,

    stop_conditions: {
      ...DEFAULT_STOP_CONDITIONS,
      ...input.stop_conditions,
    },

    participants: [],
    ethical_events: [],
    analysis_history: [],

    created_by: input.created_by,
  };

  await db.collection(COLLECTION).doc(splitTestId).set(splitTest);

  return documentToSplitTest(splitTest);
}

/**
 * Get split test by ID
 */
export async function getSplitTest(splitTestId: string): Promise<SplitTest | null> {
  const db = getFirestore();
  const doc = await db.collection(COLLECTION).doc(splitTestId).get();

  if (!doc.exists) {
    return null;
  }

  return documentToSplitTest(doc.data() as SplitTestDocument);
}

/**
 * Get active split test for a module
 */
export async function getActiveSplitTestForModule(
  moduleId: string
): Promise<SplitTest | null> {
  const db = getFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('module_id', '==', moduleId)
    .where('status', '==', 'active')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return documentToSplitTest(snapshot.docs[0]?.data() as SplitTestDocument);
}

/**
 * Get all split tests (with optional status filter)
 */
export async function getAllSplitTests(
  status?: SplitTestStatus,
  limit = 50
): Promise<SplitTest[]> {
  const db = getFirestore();
  let query = db.collection(COLLECTION).orderBy('created_at', 'desc');

  if (status) {
    query = query.where('status', '==', status);
  }

  const snapshot = await query.limit(limit).get();

  return snapshot.docs.map(doc => documentToSplitTest(doc.data() as SplitTestDocument));
}

/**
 * Start a split test
 */
export async function startSplitTest(splitTestId: string): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  await db.collection(COLLECTION).doc(splitTestId).update({
    status: 'active',
    started_at: now,
  });
}

/**
 * Pause a split test
 */
export async function pauseSplitTest(splitTestId: string): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  await db.collection(COLLECTION).doc(splitTestId).update({
    status: 'paused',
    paused_at: now,
  });
}

/**
 * Resume a paused split test
 */
export async function resumeSplitTest(splitTestId: string): Promise<void> {
  const db = getFirestore();

  await db.collection(COLLECTION).doc(splitTestId).update({
    status: 'active',
    paused_at: FieldValue.delete(),
  });
}

/**
 * Stop a split test (with reason)
 */
export async function stopSplitTest(
  splitTestId: string,
  reason: StopConditionType,
  details?: Record<string, unknown>
): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const status: SplitTestStatus = reason === 'learner_offended' || reason === 'pattern_of_dissatisfaction'
    ? 'stopped_ethics'
    : reason === 'manual_stop'
      ? 'stopped_manual'
      : 'completed';

  await db.collection(COLLECTION).doc(splitTestId).update({
    status,
    stopped_at: now,
    stopped_reason: reason,
    ...(details && { stopped_details: details }),
  });
}

/**
 * Conclude a split test with winner
 */
export async function concludeSplitTest(
  splitTestId: string,
  winner: 'version_a' | 'version_b' | 'no_difference',
  notes?: string
): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  await db.collection(COLLECTION).doc(splitTestId).update({
    status: 'concluded',
    completed_at: now,
    winner,
    conclusion_notes: notes,
  });
}

/**
 * Mark winner as deployed
 */
export async function markWinnerDeployed(splitTestId: string): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  await db.collection(COLLECTION).doc(splitTestId).update({
    winner_deployed: true,
    deployed_at: now,
  });
}

// ================================================
// ALLOCATION ENGINE
// ================================================

/**
 * Allocate a learner to a split test version
 * Returns the version and updates counters
 */
export async function allocateToSplitTest(
  splitTestId: string,
  enrolmentId: string
): Promise<'version_a' | 'version_b'> {
  const db = getFirestore();

  const splitTest = await getSplitTest(splitTestId);
  if (!splitTest) {
    throw new Error(`Split test ${splitTestId} not found`);
  }

  if (splitTest.status !== 'active') {
    throw new Error(`Split test ${splitTestId} is not active`);
  }

  // Determine version based on allocation strategy
  let version: 'version_a' | 'version_b';

  switch (splitTest.allocation_strategy) {
    case 'random_50_50':
      version = Math.random() < 0.5 ? 'version_a' : 'version_b';
      break;

    case 'random_70_30':
      version = Math.random() < 0.7 ? 'version_a' : 'version_b';
      break;

    case 'sequential':
      // First half get A, second half get B
      const totalSoFar = splitTest.current_sample_a + splitTest.current_sample_b;
      version = totalSoFar < splitTest.target_sample_size / 2 ? 'version_a' : 'version_b';
      break;

    default:
      version = Math.random() < 0.5 ? 'version_a' : 'version_b';
  }

  // Create participant record
  const participant: SplitTestParticipant = {
    enrolment_id: enrolmentId,
    version,
    assigned_at: new Date().toISOString(),
    competency_achieved: false,
    got_stuck: false,
    completed_module: false,
    abandoned: false,
    started_at: new Date().toISOString(),
  };

  // Update split test with new participant
  const updateField = version === 'version_a' ? 'current_sample_a' : 'current_sample_b';

  await db.collection(COLLECTION).doc(splitTestId).update({
    [updateField]: FieldValue.increment(1),
    participants: FieldValue.arrayUnion(participant),
  });

  return version;
}

/**
 * Check if a module has an active split test and allocate if so
 * Returns null if no active test
 */
export async function checkAndAllocateSplitTest(
  moduleId: string,
  enrolmentId: string
): Promise<{ splitTestId: string; version: 'version_a' | 'version_b' } | null> {
  const splitTest = await getActiveSplitTestForModule(moduleId);

  if (!splitTest) {
    return null;
  }

  // Check if target already reached
  const totalSamples = splitTest.current_sample_a + splitTest.current_sample_b;
  if (totalSamples >= splitTest.target_sample_size) {
    // Stop the test
    await stopSplitTest(splitTest.split_test_id, 'sample_reached');
    return null;
  }

  const version = await allocateToSplitTest(splitTest.split_test_id, enrolmentId);

  return {
    splitTestId: splitTest.split_test_id,
    version,
  };
}

// ================================================
// METRICS TRACKING
// ================================================

/**
 * Update participant outcome in a split test
 */
export async function updateParticipantOutcome(
  splitTestId: string,
  enrolmentId: string,
  outcome: Partial<Pick<SplitTestParticipant,
    | 'competency_achieved'
    | 'messages_to_competency'
    | 'time_to_competency_minutes'
    | 'satisfaction_score'
    | 'got_stuck'
    | 'completed_module'
    | 'abandoned'
    | 'feedback_sentiment'
    | 'feedback_text_anonymized'
    | 'completed_at'
  >>
): Promise<void> {
  const db = getFirestore();

  const splitTest = await getSplitTest(splitTestId);
  if (!splitTest) {
    throw new Error(`Split test ${splitTestId} not found`);
  }

  // Find and update the participant
  const updatedParticipants = splitTest.participants.map(p => {
    if (p.enrolment_id === enrolmentId) {
      return {
        ...p,
        ...outcome,
        completed_at: outcome.completed_at || p.completed_at,
      };
    }
    return p;
  });

  await db.collection(COLLECTION).doc(splitTestId).update({
    participants: updatedParticipants,
  });

  // Check for ethical stop conditions after feedback
  if (outcome.feedback_sentiment === 'very_negative') {
    await checkEthicalStopConditions(splitTestId);
  }
}

/**
 * Record satisfaction score for a participant
 */
export async function recordSatisfactionScore(
  splitTestId: string,
  enrolmentId: string,
  score: number,
  feedbackText?: string,
  sentiment?: SplitTestParticipant['feedback_sentiment']
): Promise<void> {
  await updateParticipantOutcome(splitTestId, enrolmentId, {
    satisfaction_score: score,
    feedback_text_anonymized: feedbackText,
    feedback_sentiment: sentiment,
  });
}

/**
 * Calculate metrics for a version
 */
export function calculateVersionMetrics(
  participants: SplitTestParticipant[],
  version: 'version_a' | 'version_b'
): SplitTestMetrics {
  const versionParticipants = participants.filter(p => p.version === version);

  if (versionParticipants.length === 0) {
    return {
      sample_size: 0,
      competency_achievement_rate: 0,
      avg_messages_to_competency: 0,
      median_messages_to_competency: 0,
      learner_satisfaction_avg: 0,
      stuck_rate: 0,
      completion_rate: 0,
      dropout_rate: 0,
      negative_feedback_count: 0,
      very_negative_feedback_count: 0,
    };
  }

  const total = versionParticipants.length;
  const achieved = versionParticipants.filter(p => p.competency_achieved).length;
  const stuck = versionParticipants.filter(p => p.got_stuck).length;
  const completed = versionParticipants.filter(p => p.completed_module).length;
  const abandoned = versionParticipants.filter(p => p.abandoned).length;

  const messagesArray = versionParticipants
    .filter(p => p.messages_to_competency !== undefined)
    .map(p => p.messages_to_competency!);

  const satisfactionScores = versionParticipants
    .filter(p => p.satisfaction_score !== undefined)
    .map(p => p.satisfaction_score!);

  const negativeFeedback = versionParticipants.filter(
    p => p.feedback_sentiment === 'negative' || p.feedback_sentiment === 'very_negative'
  ).length;

  const veryNegativeFeedback = versionParticipants.filter(
    p => p.feedback_sentiment === 'very_negative'
  ).length;

  // Calculate median
  const sortedMessages = [...messagesArray].sort((a, b) => a - b);
  const median = sortedMessages.length > 0
    ? sortedMessages[Math.floor(sortedMessages.length / 2)] || 0
    : 0;

  return {
    sample_size: total,
    competency_achievement_rate: Math.round((achieved / total) * 100 * 10) / 10,
    avg_messages_to_competency: messagesArray.length > 0
      ? Math.round((messagesArray.reduce((a, b) => a + b, 0) / messagesArray.length) * 10) / 10
      : 0,
    median_messages_to_competency: median,
    learner_satisfaction_avg: satisfactionScores.length > 0
      ? Math.round((satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length) * 10) / 10
      : 0,
    stuck_rate: Math.round((stuck / total) * 100 * 10) / 10,
    completion_rate: Math.round((completed / total) * 100 * 10) / 10,
    dropout_rate: Math.round((abandoned / total) * 100 * 10) / 10,
    negative_feedback_count: negativeFeedback,
    very_negative_feedback_count: veryNegativeFeedback,
  };
}

// ================================================
// ETHICAL STOP CONDITIONS
// ================================================

/**
 * Check ethical stop conditions for a split test
 * Returns true if test was stopped
 */
export async function checkEthicalStopConditions(
  splitTestId: string
): Promise<boolean> {
  const splitTest = await getSplitTest(splitTestId);
  if (!splitTest || splitTest.status !== 'active') {
    return false;
  }

  const { participants, stop_conditions } = splitTest;

  // ETHICAL CONDITION 1: Any learner very offended/upset
  if (stop_conditions.learner_very_offended) {
    const veryNegative = participants.find(p => p.feedback_sentiment === 'very_negative');

    if (veryNegative) {
      const event: EthicalStopEvent = {
        event_id: `eth_${Date.now().toString(36)}`,
        triggered_at: new Date().toISOString(),
        condition_type: 'learner_offended',
        offending_version: veryNegative.version,
        feedback_summary: veryNegative.feedback_text_anonymized || 'Learner expressed significant distress',
        severity: 'stop',
        test_stopped: true,
        admin_notified: true,
        notification_sent_at: new Date().toISOString(),
      };

      await recordEthicalEvent(splitTestId, event);
      await stopSplitTest(splitTestId, 'learner_offended', {
        offending_version: veryNegative.version,
      });

      console.warn(`⚠️  ETHICAL STOP: Split test ${splitTestId} stopped - learner distress detected`);
      return true;
    }
  }

  // ETHICAL CONDITION 2: Three dissatisfied in a row
  if (stop_conditions.three_dissatisfied_in_row) {
    // Get last 3 participants with satisfaction scores
    const withScores = participants
      .filter(p => p.satisfaction_score !== undefined)
      .sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime());

    if (withScores.length >= 3) {
      const lastThree = withScores.slice(0, 3);
      const allDissatisfied = lastThree.every(p => (p.satisfaction_score || 0) < 3);

      if (allDissatisfied) {
        // Check if they're all from the same version
        const versions = new Set(lastThree.map(p => p.version));

        if (versions.size === 1) {
          const problematicVersion = lastThree[0]?.version || 'version_b';

          const event: EthicalStopEvent = {
            event_id: `eth_${Date.now().toString(36)}`,
            triggered_at: new Date().toISOString(),
            condition_type: 'pattern_of_dissatisfaction',
            offending_version: problematicVersion,
            feedback_summary: 'Three consecutive learners rated satisfaction below 3/5',
            consecutive_negative_count: 3,
            severity: 'stop',
            test_stopped: true,
            admin_notified: true,
            notification_sent_at: new Date().toISOString(),
          };

          await recordEthicalEvent(splitTestId, event);
          await stopSplitTest(splitTestId, 'pattern_of_dissatisfaction', {
            problematic_version: problematicVersion,
          });

          console.warn(`⚠️  ETHICAL STOP: Split test ${splitTestId} stopped - pattern of dissatisfaction`);
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Record an ethical event
 */
async function recordEthicalEvent(
  splitTestId: string,
  event: EthicalStopEvent
): Promise<void> {
  const db = getFirestore();

  await db.collection(COLLECTION).doc(splitTestId).update({
    ethical_events: FieldValue.arrayUnion(event),
  });
}

// ================================================
// STATISTICAL ANALYSIS
// ================================================

/**
 * Perform t-test for two samples
 * Returns p-value (simplified implementation)
 */
function performTTest(
  sample1: number[],
  sample2: number[]
): { t_statistic: number; p_value: number } {
  if (sample1.length < 2 || sample2.length < 2) {
    return { t_statistic: 0, p_value: 1 };
  }

  const mean1 = sample1.reduce((a, b) => a + b, 0) / sample1.length;
  const mean2 = sample2.reduce((a, b) => a + b, 0) / sample2.length;

  const var1 = sample1.reduce((sum, x) => sum + Math.pow(x - mean1, 2), 0) / (sample1.length - 1);
  const var2 = sample2.reduce((sum, x) => sum + Math.pow(x - mean2, 2), 0) / (sample2.length - 1);

  const pooledSE = Math.sqrt(var1 / sample1.length + var2 / sample2.length);

  if (pooledSE === 0) {
    return { t_statistic: 0, p_value: 1 };
  }

  const t = (mean1 - mean2) / pooledSE;
  const df = sample1.length + sample2.length - 2;

  // Simplified p-value approximation (for production, use a proper stats library)
  const absT = Math.abs(t);
  let pValue = 1;

  if (df >= 30) {
    // Approximate using normal distribution for large samples
    pValue = 2 * (1 - normalCDF(absT));
  } else {
    // Very rough approximation for small samples
    pValue = Math.exp(-0.717 * absT - 0.416 * absT * absT);
  }

  return {
    t_statistic: Math.round(t * 1000) / 1000,
    p_value: Math.max(0.001, Math.min(1, Math.round(pValue * 1000) / 1000)),
  };
}

/**
 * Standard normal CDF approximation
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Analyze split test results
 */
export async function analyzeSplitTestResults(
  splitTestId: string
): Promise<SplitTestAnalysis> {
  const splitTest = await getSplitTest(splitTestId);
  if (!splitTest) {
    throw new Error(`Split test ${splitTestId} not found`);
  }

  const { participants } = splitTest;

  // Calculate metrics for each version
  const metricsA = calculateVersionMetrics(participants, 'version_a');
  const metricsB = calculateVersionMetrics(participants, 'version_b');

  // Get arrays for t-test
  const achievedA = participants.filter(p => p.version === 'version_a').map(p => p.competency_achieved ? 1 : 0);
  const achievedB = participants.filter(p => p.version === 'version_b').map(p => p.competency_achieved ? 1 : 0);

  // Perform statistical test
  const tTest = performTTest(achievedA, achievedB);

  // Calculate differences
  const competencyDiff = metricsB.competency_achievement_rate - metricsA.competency_achievement_rate;
  const improvementPct = metricsA.competency_achievement_rate > 0
    ? (competencyDiff / metricsA.competency_achievement_rate) * 100
    : 0;

  // Determine winner
  let winner: 'version_a' | 'version_b' | 'no_difference' = 'no_difference';
  let shouldDeploy = false;

  if (tTest.p_value < 0.05) {
    winner = competencyDiff > 0 ? 'version_b' : 'version_a';
    shouldDeploy = true;
  }

  // Generate recommendation
  let recommendation: string;
  if (!shouldDeploy) {
    recommendation = 'No statistically significant difference detected. Consider keeping current version or extending the test.';
  } else if (winner === 'version_b') {
    recommendation = `Deploy Version B (${splitTest.version_b.name}): ${Math.abs(improvementPct).toFixed(1)}% improvement in competency achievement rate.`;
  } else {
    recommendation = `Keep Version A (${splitTest.version_a.name}): Version B showed ${Math.abs(improvementPct).toFixed(1)}% worse performance.`;
  }

  const analysis: SplitTestAnalysis = {
    analyzed_at: new Date().toISOString(),

    version_a: metricsA,
    version_b: metricsB,

    competency_rate_difference: Math.round(competencyDiff * 10) / 10,
    competency_rate_improvement_pct: Math.round(improvementPct * 10) / 10,
    messages_difference: Math.round((metricsB.avg_messages_to_competency - metricsA.avg_messages_to_competency) * 10) / 10,
    satisfaction_difference: Math.round((metricsB.learner_satisfaction_avg - metricsA.learner_satisfaction_avg) * 10) / 10,

    statistical_significance: tTest.p_value < 0.05,
    p_value: tTest.p_value,
    confidence_interval_lower: competencyDiff - 1.96 * Math.sqrt(
      (metricsA.competency_achievement_rate * (100 - metricsA.competency_achievement_rate)) / metricsA.sample_size +
      (metricsB.competency_achievement_rate * (100 - metricsB.competency_achievement_rate)) / metricsB.sample_size
    ) / 100,
    confidence_interval_upper: competencyDiff + 1.96 * Math.sqrt(
      (metricsA.competency_achievement_rate * (100 - metricsA.competency_achievement_rate)) / metricsA.sample_size +
      (metricsB.competency_achievement_rate * (100 - metricsB.competency_achievement_rate)) / metricsB.sample_size
    ) / 100,

    winner,
    recommendation,
    should_deploy_winner: shouldDeploy,
  };

  // Save analysis
  const db = getFirestore();
  await db.collection(COLLECTION).doc(splitTestId).update({
    latest_analysis: analysis,
    analysis_history: FieldValue.arrayUnion(analysis),
  });

  return analysis;
}

/**
 * Check if sample size reached and stop if needed
 */
export async function checkSampleSizeReached(splitTestId: string): Promise<boolean> {
  const splitTest = await getSplitTest(splitTestId);
  if (!splitTest || splitTest.status !== 'active') {
    return false;
  }

  const totalSamples = splitTest.current_sample_a + splitTest.current_sample_b;

  if (totalSamples >= splitTest.target_sample_size) {
    await stopSplitTest(splitTestId, 'sample_reached');

    // Auto-analyze
    await analyzeSplitTestResults(splitTestId);

    return true;
  }

  return false;
}

// ================================================
// DASHBOARD DATA
// ================================================

/**
 * Get split test summaries for dashboard
 */
export async function getSplitTestSummaries(
  status?: SplitTestStatus
): Promise<SplitTestSummary[]> {
  const tests = await getAllSplitTests(status);

  return tests.map(test => {
    const totalSample = test.current_sample_a + test.current_sample_b;
    const metricsA = calculateVersionMetrics(test.participants, 'version_a');
    const metricsB = calculateVersionMetrics(test.participants, 'version_b');

    const daysRunning = test.started_at
      ? Math.floor((Date.now() - new Date(test.started_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      split_test_id: test.split_test_id,
      module_title: test.module_title,
      course_title: test.course_title,
      status: test.status,

      target_sample_size: test.target_sample_size,
      current_total_sample: totalSample,
      progress_percentage: Math.round((totalSample / test.target_sample_size) * 100),

      version_a_competency_rate: metricsA.competency_achievement_rate,
      version_b_competency_rate: metricsB.competency_achievement_rate,
      current_difference_pct: metricsB.competency_achievement_rate - metricsA.competency_achievement_rate,

      has_ethical_concerns: test.ethical_events.length > 0,
      days_running: daysRunning,

      started_at: test.started_at,
    };
  });
}

// ================================================
// HELPERS
// ================================================

/**
 * Convert Firestore document to SplitTest
 */
function documentToSplitTest(doc: SplitTestDocument): SplitTest {
  return {
    ...doc,
    created_at: doc.created_at,
    started_at: doc.started_at,
    paused_at: doc.paused_at,
    completed_at: doc.completed_at,
    stopped_at: doc.stopped_at,
    deployed_at: doc.deployed_at,
  };
}
