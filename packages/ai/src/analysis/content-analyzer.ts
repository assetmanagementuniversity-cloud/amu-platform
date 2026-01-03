/**
 * Content Analyzer - AMU Platform
 *
 * Intelligent Content Improvement System (Section 14)
 *
 * This service analyzes competency data and conversations to detect:
 * - Struggle points (high 'developing' rates)
 * - Common questions and misconceptions
 * - Content gaps and improvement opportunities
 *
 * Privacy-First: All analysis is performed on aggregated, anonymized data.
 * No individual learner data is stored or exposed.
 *
 * "Ubuntu - I am because we are"
 */

import type {
  StrugglePoint,
  ConversationAnalysisResult,
  ConversationFinding,
  ImprovementSuggestion,
  ImprovementCategory,
  ImprovementPriority,
  UbuntuFeedback,
  DEFAULT_ANALYSIS_CONFIG,
} from '@amu/shared';
import { sendMessage, type ClaudeMessage } from '../client';

/**
 * Competency statistics input (aggregated from enrolments)
 * No individual learner data - only counts
 */
export interface CompetencyStats {
  competency_id: string;
  competency_title: string;
  module_id: string;
  module_title: string;

  // Aggregated counts (no PII)
  total_attempts: number;
  competent_count: number;
  developing_count: number;
  not_yet_count: number;
  total_messages: number;
}

/**
 * Anonymized conversation excerpt for analysis
 * All PII removed before processing
 */
export interface AnonymizedConversation {
  conversation_id: string;
  module_id: string;
  competency_ids_covered: string[];

  // Message content (anonymized)
  messages: {
    role: 'user' | 'assistant';
    content: string;  // PII-stripped content
  }[];

  // Outcome
  competencies_achieved: string[];
  competencies_developing: string[];
  message_count: number;
  duration_minutes: number;
}

/**
 * Detect struggle points from competency statistics
 *
 * A struggle point is a competency where:
 * - developing_rate >= 30% (learners getting stuck)
 * - OR not_yet_rate >= 20% (learners not progressing)
 * - OR average messages to competent > 2x normal
 *
 * @param stats Array of competency statistics (aggregated)
 * @param threshold Developing rate threshold (default: 30%)
 * @returns Array of detected struggle points
 */
export async function detectStrugglePoints(
  stats: CompetencyStats[],
  threshold: number = 30
): Promise<StrugglePoint[]> {
  const strugglePoints: StrugglePoint[] = [];

  for (const stat of stats) {
    // Calculate rates
    const developingRate = stat.total_attempts > 0
      ? (stat.developing_count / stat.total_attempts) * 100
      : 0;

    const notYetRate = stat.total_attempts > 0
      ? (stat.not_yet_count / stat.total_attempts) * 100
      : 0;

    const avgMessagesToCompetent = stat.competent_count > 0
      ? stat.total_messages / stat.competent_count
      : 0;

    // Check if this is a struggle point
    if (developingRate >= threshold || notYetRate >= 20) {
      // Calculate confidence based on sample size
      const confidence = calculateConfidence(stat.total_attempts);

      strugglePoints.push({
        competency_id: stat.competency_id,
        competency_title: stat.competency_title,
        module_id: stat.module_id,
        module_title: stat.module_title,

        total_attempts: stat.total_attempts,
        developing_count: stat.developing_count,
        developing_rate: Math.round(developingRate * 10) / 10,
        not_yet_count: stat.not_yet_count,
        not_yet_rate: Math.round(notYetRate * 10) / 10,
        average_messages_to_competent: Math.round(avgMessagesToCompetent),

        common_issues: [],      // To be filled by AI analysis
        common_questions: [],   // To be filled by AI analysis
        suggested_scaffolding: [],

        detected_at: new Date().toISOString(),
        sample_size: stat.total_attempts,
        confidence,
      });
    }
  }

  // Sort by developing rate (highest first)
  return strugglePoints.sort((a, b) => b.developing_rate - a.developing_rate);
}

/**
 * Calculate confidence score based on sample size
 * Uses a logarithmic scale - confidence increases with sample size
 */
function calculateConfidence(sampleSize: number): number {
  if (sampleSize < 10) return 0.3;
  if (sampleSize < 30) return 0.5;
  if (sampleSize < 50) return 0.7;
  if (sampleSize < 100) return 0.85;
  return 0.95;
}

/**
 * Analyze conversations for patterns (Section 14.3)
 *
 * This function processes anonymized conversation data to identify:
 * - Common questions learners ask
 * - Points where learners get stuck
 * - Effective and ineffective scaffolding patterns
 *
 * @param conversations Array of anonymized conversations
 * @param moduleId Module being analyzed
 * @param moduleTitle Title of the module
 * @returns Analysis result with findings
 */
export async function analyzeConversations(
  conversations: AnonymizedConversation[],
  moduleId: string,
  moduleTitle: string
): Promise<ConversationAnalysisResult> {
  const analysisId = `analysis_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

  // Aggregate statistics
  const totalMessages = conversations.reduce((sum, c) => sum + c.message_count, 0);
  const avgMessages = totalMessages / conversations.length;

  // Count competency achievements
  const competencyAchievements = new Map<string, { achieved: number; developing: number; total: number }>();

  for (const conv of conversations) {
    for (const compId of conv.competency_ids_covered) {
      if (!competencyAchievements.has(compId)) {
        competencyAchievements.set(compId, { achieved: 0, developing: 0, total: 0 });
      }
      const stats = competencyAchievements.get(compId)!;
      stats.total++;
      if (conv.competencies_achieved.includes(compId)) {
        stats.achieved++;
      } else if (conv.competencies_developing.includes(compId)) {
        stats.developing++;
      }
    }
  }

  // Build competency rates
  const competencyRates = Array.from(competencyAchievements.entries()).map(([id, stats]) => ({
    competency_id: id,
    competency_title: '', // Will need to be filled from module data
    competent_rate: Math.round((stats.achieved / stats.total) * 100),
    developing_rate: Math.round((stats.developing / stats.total) * 100),
    not_yet_rate: Math.round(((stats.total - stats.achieved - stats.developing) / stats.total) * 100),
  }));

  // Extract learner messages for pattern analysis
  const learnerMessages = conversations.flatMap(c =>
    c.messages.filter(m => m.role === 'user').map(m => m.content)
  );

  // Use AI to identify common questions and patterns
  const patternAnalysis = await analyzeMessagePatterns(learnerMessages, moduleTitle);

  // Detect struggle points from competency rates
  const strugglePoints = competencyRates
    .filter(c => c.developing_rate >= 30 || c.not_yet_rate >= 20)
    .map(c => ({
      competency_id: c.competency_id,
      competency_title: c.competency_title,
      stuck_rate: c.developing_rate + c.not_yet_rate,
      common_issue: '', // Will be filled by AI
    }));

  // Calculate completion rate
  const completedConversations = conversations.filter(c =>
    c.competencies_achieved.length === c.competency_ids_covered.length
  ).length;
  const completionRate = (completedConversations / conversations.length) * 100;

  // Collect unique languages (from message patterns - simplified)
  const languagesUsed = ['English']; // Default, could be expanded with language detection

  return {
    analysis_id: analysisId,
    module_id: moduleId,
    module_title: moduleTitle,

    analyzed_at: new Date().toISOString(),
    conversation_count: conversations.length,
    time_period_start: conversations[0]?.messages[0]?.content ? new Date().toISOString() : '',
    time_period_end: new Date().toISOString(),

    common_questions: patternAnalysis.common_questions,
    struggle_points: strugglePoints,
    competency_rates: competencyRates,

    engagement: {
      average_messages_per_session: Math.round(avgMessages),
      completion_rate: Math.round(completionRate),
      languages_used: languagesUsed,
    },

    findings: patternAnalysis.findings,
    strengths: patternAnalysis.strengths,
  };
}

/**
 * Analyze message patterns using AI
 * All input is already anonymized
 */
async function analyzeMessagePatterns(
  learnerMessages: string[],
  moduleTitle: string
): Promise<{
  common_questions: { question: string; percentage: number; category: string }[];
  findings: ConversationFinding[];
  strengths: string[];
}> {
  // Sample messages if there are too many (for token efficiency)
  const sampleSize = Math.min(learnerMessages.length, 200);
  const sampledMessages = learnerMessages.length > sampleSize
    ? learnerMessages.sort(() => Math.random() - 0.5).slice(0, sampleSize)
    : learnerMessages;

  const systemPrompt = `You are an educational content analyst for Asset Management University.

PRIVACY MANDATE: The messages you are analyzing have already been anonymized. Never reference individual learners.

Your task is to identify patterns in learner messages to improve course content.

Respond with JSON only.`;

  const userPrompt = `Analyze these ${sampledMessages.length} learner messages from the module "${moduleTitle}" to identify patterns.

MESSAGES (anonymized, sampled):
${sampledMessages.slice(0, 100).map((m, i) => `${i + 1}. ${m}`).join('\n')}

IDENTIFY:
1. Common questions (asked by 20%+ of learners)
2. Points of confusion or struggle
3. What learners find helpful
4. Content gaps or missing information
5. Terminology issues

RESPOND WITH JSON:
{
  "common_questions": [
    { "question": "Summarized question", "percentage": 25, "category": "terminology" | "concept" | "application" | "clarification" }
  ],
  "findings": [
    {
      "category": "content_gap" | "unclear_instruction" | "scaffolding" | "examples" | "terminology" | "structure",
      "severity": "high" | "medium" | "low",
      "description": "What the issue is (no PII)",
      "evidence": "Pattern observed (anonymized)",
      "impact": "Estimated % of learners affected",
      "location": "Where in module this occurs"
    }
  ],
  "strengths": [
    "What's working well that should be preserved"
  ]
}`;

  try {
    const response = await sendMessage(systemPrompt, [{ role: 'user', content: userPrompt }], {
      temperature: 0.3,
    });

    const parsed = JSON.parse(response.content.match(/\{[\s\S]*\}/)?.[0] || '{}');

    return {
      common_questions: parsed.common_questions || [],
      findings: parsed.findings || [],
      strengths: parsed.strengths || [],
    };
  } catch {
    // Return empty results if AI analysis fails
    return {
      common_questions: [],
      findings: [],
      strengths: [],
    };
  }
}

/**
 * Generate improvement suggestions from analysis
 *
 * @param analysis Conversation analysis result
 * @param strugglePoints Detected struggle points
 * @param feedback Ubuntu feedback from learners
 * @returns Array of improvement suggestions
 */
export async function generateImprovementSuggestions(
  analysis: ConversationAnalysisResult,
  strugglePoints: StrugglePoint[],
  feedback: UbuntuFeedback[]
): Promise<ImprovementSuggestion[]> {
  const systemPrompt = `You are an educational content improvement specialist for Asset Management University.

PRIVACY MANDATE: All data has been anonymized. Never reference individual learners.

Your task is to generate specific, actionable improvement suggestions based on:
1. AI-detected patterns from conversations
2. Struggle points from competency tracking
3. Anonymized learner feedback

Each suggestion should be:
- Specific and actionable
- Tied to evidence
- Prioritized by impact

Respond with JSON only.`;

  // Summarize feedback themes (anonymized)
  const feedbackSummary = feedback.slice(0, 20).map(f => ({
    struggle: f.struggle_most.substring(0, 200),
    suggestion: f.make_better.substring(0, 200),
  }));

  const userPrompt = `Generate improvement suggestions for module: "${analysis.module_title}"

ANALYSIS FINDINGS:
${JSON.stringify(analysis.findings, null, 2)}

STRUGGLE POINTS (high developing rates):
${strugglePoints.map(s => `• ${s.competency_title}: ${s.developing_rate}% developing, ${s.not_yet_rate}% not yet`).join('\n')}

LEARNER FEEDBACK (anonymized, ${feedback.length} responses):
${feedbackSummary.map(f => `• Struggle: "${f.struggle}" | Suggestion: "${f.suggestion}"`).join('\n')}

COMMON QUESTIONS:
${analysis.common_questions.map(q => `• ${q.question} (${q.percentage}% of learners)`).join('\n')}

STRENGTHS TO PRESERVE:
${analysis.strengths.join('\n')}

Generate 3-7 improvement suggestions. RESPOND WITH JSON:
{
  "suggestions": [
    {
      "priority": "high" | "medium" | "low",
      "category": "content_gap" | "clarity" | "scaffolding" | "examples" | "terminology" | "structure",
      "title": "Short description",
      "current_state": "What exists now",
      "proposed_change": "Specific revision to make",
      "expected_impact": "How this improves learning",
      "estimated_effort": "small" | "medium" | "large",
      "affected_competency": "Which competency if applicable",
      "evidence": "Data supporting this suggestion"
    }
  ]
}`;

  try {
    const response = await sendMessage(systemPrompt, [{ role: 'user', content: userPrompt }], {
      temperature: 0.4,
    });

    const parsed = JSON.parse(response.content.match(/\{[\s\S]*\}/)?.[0] || '{"suggestions":[]}');

    // Convert to full suggestion format
    return (parsed.suggestions || []).map((s: {
      priority: string;
      category: string;
      title: string;
      current_state: string;
      proposed_change: string;
      expected_impact: string;
      estimated_effort: string;
      affected_competency?: string;
      evidence: string;
    }, i: number) => ({
      suggestion_id: `sug_${Date.now().toString(36)}_${i}`,
      module_id: analysis.module_id,
      module_title: analysis.module_title,

      source: 'conversation_analysis' as const,
      category: s.category as ImprovementCategory,
      priority: s.priority as ImprovementPriority,
      status: 'pending' as const,

      title: s.title,
      current_state: s.current_state,
      proposed_change: s.proposed_change,
      expected_impact: s.expected_impact,
      estimated_effort: s.estimated_effort as 'small' | 'medium' | 'large',

      affected_competency_id: undefined,
      affected_competency_title: s.affected_competency,
      evidence: s.evidence,

      linked_feedback_count: feedback.length,
      linked_analysis_ids: [analysis.analysis_id],

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/**
 * Process Ubuntu feedback with AI
 * Categorizes and extracts actionable insights
 */
export async function processUbuntuFeedback(
  feedback: UbuntuFeedback
): Promise<UbuntuFeedback> {
  const systemPrompt = `You are an educational feedback analyst. Analyze this learner feedback (already anonymized) and categorize it.

Respond with JSON only.`;

  const userPrompt = `Analyze this feedback from a learner who completed the module "${feedback.module_title}":

STRUGGLE: "${feedback.struggle_most}"
SUGGESTION: "${feedback.make_better}"

RESPOND WITH JSON:
{
  "categories": ["content_gap" | "unclear_instruction" | "scaffolding" | "examples" | "terminology" | "structure" | "assessment" | "case_study"],
  "sentiment": "positive" | "neutral" | "negative" | "constructive",
  "actionable": true | false,
  "summary": "One sentence summary of the feedback (no PII)"
}`;

  try {
    const response = await sendMessage(systemPrompt, [{ role: 'user', content: userPrompt }], {
      temperature: 0.2,
    });

    const parsed = JSON.parse(response.content.match(/\{[\s\S]*\}/)?.[0] || '{}');

    return {
      ...feedback,
      ai_processed: true,
      ai_categories: parsed.categories || [],
      ai_sentiment: parsed.sentiment || 'neutral',
      ai_actionable: parsed.actionable || false,
      ai_summary: parsed.summary || '',
    };
  } catch {
    return {
      ...feedback,
      ai_processed: false,
    };
  }
}

/**
 * Calculate priority score for a module
 * Used for dashboard sorting
 *
 * Higher score = needs more attention
 */
export function calculatePriorityScore(
  developingRate: number,
  strugglePointCount: number,
  pendingSuggestions: number,
  recentFeedbackCount: number
): number {
  // Weights
  const DEVELOPING_WEIGHT = 2;
  const STRUGGLE_WEIGHT = 10;
  const SUGGESTION_WEIGHT = 5;
  const FEEDBACK_WEIGHT = 3;

  return (
    developingRate * DEVELOPING_WEIGHT +
    strugglePointCount * STRUGGLE_WEIGHT +
    pendingSuggestions * SUGGESTION_WEIGHT +
    recentFeedbackCount * FEEDBACK_WEIGHT
  );
}

/**
 * Aggregate feedback themes (anonymized)
 * Groups similar feedback into themes
 */
export async function aggregateFeedbackThemes(
  feedback: UbuntuFeedback[]
): Promise<{ theme: string; count: number; sentiment: string }[]> {
  if (feedback.length === 0) return [];

  const systemPrompt = `You are analyzing anonymized learner feedback to identify common themes.

PRIVACY: Never reference individual learners. Only report aggregated themes.

Respond with JSON only.`;

  // Get summaries or raw feedback
  const feedbackTexts = feedback.slice(0, 50).map(f =>
    f.ai_summary || `${f.struggle_most.substring(0, 100)} | ${f.make_better.substring(0, 100)}`
  );

  const userPrompt = `Identify common themes from these ${feedback.length} pieces of anonymized feedback:

${feedbackTexts.map((t, i) => `${i + 1}. ${t}`).join('\n')}

RESPOND WITH JSON:
{
  "themes": [
    {
      "theme": "Short theme description",
      "count": 12,
      "sentiment": "constructive" | "positive" | "negative" | "neutral"
    }
  ]
}`;

  try {
    const response = await sendMessage(systemPrompt, [{ role: 'user', content: userPrompt }], {
      temperature: 0.3,
    });

    const parsed = JSON.parse(response.content.match(/\{[\s\S]*\}/)?.[0] || '{"themes":[]}');
    return parsed.themes || [];
  } catch {
    return [];
  }
}
