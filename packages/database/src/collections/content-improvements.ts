/**
 * Content Improvements collection operations - AMU Platform
 *
 * Intelligent Content Improvement System (Section 14)
 *
 * PRIVACY-FIRST: All data stored here is strictly anonymized.
 * NO learner identifiers, names, or PII ever stored.
 * Feedback is linked only by anonymous feedback_id.
 *
 * "Ubuntu - I am because we are"
 */

import { getFirestore, FieldValue } from '../config/firebase-admin';
import type {
  ContentImprovementRecord,
  UbuntuFeedback,
  ImprovementSuggestion,
  StrugglePoint,
  ConversationAnalysisResult,
  ContentFeedbackDashboardData,
  ImprovementStatus,
  DEFAULT_ANALYSIS_CONFIG,
} from '@amu/shared';

const IMPROVEMENTS_COLLECTION = 'content_improvements';
const FEEDBACK_COLLECTION = 'ubuntu_feedback';
const ANALYSES_COLLECTION = 'conversation_analyses';

// ================================================
// CONTENT IMPROVEMENT RECORDS
// ================================================

/**
 * Get or create content improvement record for a module
 */
export async function getOrCreateModuleRecord(
  moduleId: string,
  moduleTitle: string,
  courseId: string,
  courseTitle: string
): Promise<ContentImprovementRecord> {
  const db = getFirestore();
  const doc = await db.collection(IMPROVEMENTS_COLLECTION).doc(moduleId).get();

  if (doc.exists) {
    return doc.data() as ContentImprovementRecord;
  }

  const now = new Date().toISOString();
  const newRecord: ContentImprovementRecord = {
    record_id: moduleId,
    module_id: moduleId,
    module_title: moduleTitle,
    course_id: courseId,
    course_title: courseTitle,
    last_analysis_at: now,
    total_conversations_analyzed: 0,
    total_feedback_collected: 0,
    struggle_points: [],
    learner_feedback: [],
    suggestions: [],
    analyses: [],
    summary: {
      high_priority_count: 0,
      pending_suggestions: 0,
      implemented_suggestions: 0,
      average_developing_rate: 0,
      top_struggle_competencies: [],
      common_feedback_themes: [],
    },
    created_at: now,
    updated_at: now,
  };

  await db.collection(IMPROVEMENTS_COLLECTION).doc(moduleId).set(newRecord);
  return newRecord;
}

/**
 * Get content improvement record for a module
 */
export async function getModuleRecord(
  moduleId: string
): Promise<ContentImprovementRecord | null> {
  const db = getFirestore();
  const doc = await db.collection(IMPROVEMENTS_COLLECTION).doc(moduleId).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as ContentImprovementRecord;
}

/**
 * Update module record after new analysis
 */
export async function updateModuleAnalysis(
  moduleId: string,
  analysis: ConversationAnalysisResult,
  strugglePoints: StrugglePoint[],
  suggestions: ImprovementSuggestion[]
): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  await db.collection(IMPROVEMENTS_COLLECTION).doc(moduleId).update({
    last_analysis_at: now,
    updated_at: now,
    struggle_points: strugglePoints,
    suggestions: suggestions,
    total_conversations_analyzed: analysis.conversation_count,
    'summary.high_priority_count': suggestions.filter(s => s.priority === 'high').length,
    'summary.pending_suggestions': suggestions.filter(s => s.status === 'pending').length,
    'summary.average_developing_rate': calculateAverageDevelopingRate(strugglePoints),
    'summary.top_struggle_competencies': strugglePoints.slice(0, 5).map(s => s.competency_title),
  });

  // Store full analysis separately for history
  await db.collection(ANALYSES_COLLECTION).doc(analysis.analysis_id).set({
    ...analysis,
    module_id: moduleId,
    stored_at: now,
  });
}

/**
 * Calculate average developing rate from struggle points
 */
function calculateAverageDevelopingRate(strugglePoints: StrugglePoint[]): number {
  if (strugglePoints.length === 0) return 0;
  const sum = strugglePoints.reduce((acc, s) => acc + s.developing_rate, 0);
  return Math.round((sum / strugglePoints.length) * 10) / 10;
}

// ================================================
// UBUNTU FEEDBACK (Anonymized)
// ================================================

/**
 * Save Ubuntu feedback (anonymized)
 * NO learner ID or name is ever stored
 */
export async function saveUbuntuFeedback(
  feedback: Omit<UbuntuFeedback, 'feedback_id' | 'submitted_at'>
): Promise<UbuntuFeedback> {
  const db = getFirestore();

  const feedbackId = `fb_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const fullFeedback: UbuntuFeedback = {
    feedback_id: feedbackId,
    submitted_at: now,
    ...feedback,
    ai_processed: false,
  };

  // Store in dedicated feedback collection
  await db.collection(FEEDBACK_COLLECTION).doc(feedbackId).set(fullFeedback);

  // Update module's feedback count
  await db.collection(IMPROVEMENTS_COLLECTION).doc(feedback.module_id).update({
    total_feedback_collected: FieldValue.increment(1),
    updated_at: now,
  });

  return fullFeedback;
}

/**
 * Get unprocessed feedback for AI analysis
 */
export async function getUnprocessedFeedback(
  limit = 50
): Promise<UbuntuFeedback[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(FEEDBACK_COLLECTION)
    .where('ai_processed', '==', false)
    .orderBy('submitted_at', 'asc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => doc.data() as UbuntuFeedback);
}

/**
 * Update feedback after AI processing
 */
export async function updateFeedbackAfterProcessing(
  feedbackId: string,
  aiData: Pick<UbuntuFeedback, 'ai_categories' | 'ai_sentiment' | 'ai_actionable' | 'ai_summary'>
): Promise<void> {
  const db = getFirestore();

  await db.collection(FEEDBACK_COLLECTION).doc(feedbackId).update({
    ai_processed: true,
    ai_categories: aiData.ai_categories,
    ai_sentiment: aiData.ai_sentiment,
    ai_actionable: aiData.ai_actionable,
    ai_summary: aiData.ai_summary,
  });
}

/**
 * Get recent feedback for a module (anonymized)
 */
export async function getModuleFeedback(
  moduleId: string,
  limit = 100
): Promise<UbuntuFeedback[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(FEEDBACK_COLLECTION)
    .where('module_id', '==', moduleId)
    .orderBy('submitted_at', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => doc.data() as UbuntuFeedback);
}

/**
 * Get actionable feedback for a module
 */
export async function getActionableFeedback(
  moduleId: string,
  limit = 50
): Promise<UbuntuFeedback[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(FEEDBACK_COLLECTION)
    .where('module_id', '==', moduleId)
    .where('ai_actionable', '==', true)
    .orderBy('submitted_at', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => doc.data() as UbuntuFeedback);
}

// ================================================
// IMPROVEMENT SUGGESTIONS
// ================================================

/**
 * Update suggestion status (admin action)
 */
export async function updateSuggestionStatus(
  moduleId: string,
  suggestionId: string,
  status: ImprovementStatus,
  reviewedBy: string,
  notes?: string
): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  const doc = await db.collection(IMPROVEMENTS_COLLECTION).doc(moduleId).get();
  if (!doc.exists) {
    throw new Error(`Module ${moduleId} not found`);
  }

  const record = doc.data() as ContentImprovementRecord;
  const suggestions = record.suggestions.map(s => {
    if (s.suggestion_id === suggestionId) {
      return {
        ...s,
        status,
        reviewed_at: now,
        reviewed_by: reviewedBy,
        review_notes: notes,
        ...(status === 'implemented' && { implemented_at: now }),
        ...(status === 'rejected' && { rejection_reason: notes }),
      };
    }
    return s;
  });

  // Recalculate summary
  const pendingCount = suggestions.filter(s => s.status === 'pending').length;
  const implementedCount = suggestions.filter(s => s.status === 'implemented').length;
  const highPriorityCount = suggestions.filter(s => s.priority === 'high' && s.status === 'pending').length;

  await db.collection(IMPROVEMENTS_COLLECTION).doc(moduleId).update({
    suggestions,
    updated_at: now,
    'summary.pending_suggestions': pendingCount,
    'summary.implemented_suggestions': implementedCount,
    'summary.high_priority_count': highPriorityCount,
  });
}

/**
 * Get pending suggestions across all modules
 */
export async function getAllPendingSuggestions(
  limit = 50
): Promise<{ moduleId: string; moduleTitle: string; suggestion: ImprovementSuggestion }[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(IMPROVEMENTS_COLLECTION)
    .where('summary.pending_suggestions', '>', 0)
    .orderBy('summary.pending_suggestions', 'desc')
    .limit(limit)
    .get();

  const results: { moduleId: string; moduleTitle: string; suggestion: ImprovementSuggestion }[] = [];

  snapshot.docs.forEach(doc => {
    const record = doc.data() as ContentImprovementRecord;
    record.suggestions
      .filter(s => s.status === 'pending')
      .forEach(suggestion => {
        results.push({
          moduleId: record.module_id,
          moduleTitle: record.module_title,
          suggestion,
        });
      });
  });

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  results.sort((a, b) => priorityOrder[a.suggestion.priority] - priorityOrder[b.suggestion.priority]);

  return results.slice(0, limit);
}

// ================================================
// DASHBOARD DATA
// ================================================

/**
 * Get dashboard data for content feedback admin view
 */
export async function getContentFeedbackDashboard(): Promise<ContentFeedbackDashboardData> {
  const db = getFirestore();

  // Get all module records
  const modulesSnapshot = await db.collection(IMPROVEMENTS_COLLECTION).get();
  const modules: ContentImprovementRecord[] = modulesSnapshot.docs.map(
    doc => doc.data() as ContentImprovementRecord
  );

  // Get recent feedback count (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentFeedbackSnapshot = await db
    .collection(FEEDBACK_COLLECTION)
    .where('submitted_at', '>=', weekAgo.toISOString())
    .get();

  // Calculate dashboard metrics
  const modulesNeedingAttention = modules.filter(
    m => m.summary.pending_suggestions > 0 || m.summary.average_developing_rate > 30
  ).length;

  const totalPendingSuggestions = modules.reduce(
    (sum, m) => sum + m.summary.pending_suggestions, 0
  );

  // Build modules list sorted by priority
  const modulesList = modules.map(m => {
    const priorityScore = calculatePriorityScore(m);
    return {
      module_id: m.module_id,
      module_title: m.module_title,
      course_title: m.course_title,
      developing_rate: m.summary.average_developing_rate,
      struggle_point_count: m.struggle_points.length,
      feedback_count: m.total_feedback_collected,
      pending_suggestions: m.summary.pending_suggestions,
      priority_score: priorityScore,
    };
  }).sort((a, b) => b.priority_score - a.priority_score);

  // Get top struggle points
  const allStrugglePoints = modules.flatMap(m =>
    m.struggle_points.map(s => ({
      competency_title: s.competency_title,
      module_title: m.module_title,
      developing_rate: s.developing_rate,
      common_issue: s.common_issues[0] || 'Under investigation',
    }))
  );
  const topStrugglePoints = allStrugglePoints
    .sort((a, b) => b.developing_rate - a.developing_rate)
    .slice(0, 10);

  // Aggregate feedback themes
  const feedbackThemes = aggregateFeedbackThemesFromModules(modules);

  return {
    total_modules: modules.length,
    modules_needing_attention: modulesNeedingAttention,
    pending_suggestions: totalPendingSuggestions,
    feedback_this_week: recentFeedbackSnapshot.size,
    modules: modulesList,
    top_struggle_points: topStrugglePoints,
    feedback_themes: feedbackThemes,
  };
}

/**
 * Calculate priority score for a module
 */
function calculatePriorityScore(record: ContentImprovementRecord): number {
  const DEVELOPING_WEIGHT = 2;
  const STRUGGLE_WEIGHT = 10;
  const SUGGESTION_WEIGHT = 5;
  const FEEDBACK_WEIGHT = 3;

  return (
    record.summary.average_developing_rate * DEVELOPING_WEIGHT +
    record.struggle_points.length * STRUGGLE_WEIGHT +
    record.summary.pending_suggestions * SUGGESTION_WEIGHT +
    Math.min(record.total_feedback_collected, 50) * FEEDBACK_WEIGHT
  );
}

/**
 * Aggregate feedback themes from all modules
 */
function aggregateFeedbackThemesFromModules(
  modules: ContentImprovementRecord[]
): { theme: string; count: number; sentiment: string }[] {
  const themeMap = new Map<string, { count: number; sentiments: string[] }>();

  modules.forEach(m => {
    m.summary.common_feedback_themes.forEach(theme => {
      const existing = themeMap.get(theme) || { count: 0, sentiments: [] };
      existing.count++;
      themeMap.set(theme, existing);
    });
  });

  return Array.from(themeMap.entries())
    .map(([theme, data]) => ({
      theme,
      count: data.count,
      sentiment: 'constructive', // Default
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// ================================================
// ANALYSIS SCHEDULING
// ================================================

/**
 * Get modules that need analysis
 * Based on:
 * - Haven't been analyzed in analysis_frequency_days
 * - Have at least min_conversations new conversations
 */
export async function getModulesNeedingAnalysis(
  config: { minConversations: number; frequencyDays: number } = {
    minConversations: 100,
    frequencyDays: 7,
  }
): Promise<string[]> {
  const db = getFirestore();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.frequencyDays);

  const snapshot = await db
    .collection(IMPROVEMENTS_COLLECTION)
    .where('last_analysis_at', '<', cutoffDate.toISOString())
    .get();

  // Filter by conversation count (would need to check against enrolments)
  // For now, return all modules that haven't been analyzed recently
  return snapshot.docs.map(doc => doc.id);
}

/**
 * Get analysis history for a module
 */
export async function getModuleAnalysisHistory(
  moduleId: string,
  limit = 10
): Promise<ConversationAnalysisResult[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(ANALYSES_COLLECTION)
    .where('module_id', '==', moduleId)
    .orderBy('analyzed_at', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => doc.data() as ConversationAnalysisResult);
}
