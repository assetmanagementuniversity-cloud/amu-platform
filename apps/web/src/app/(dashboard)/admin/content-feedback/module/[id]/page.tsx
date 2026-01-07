'use client';

/**
 * Module Content Feedback Detail Page - AMU Admin
 *
 * Intelligent Content Improvement System (Section 14)
 *
 * Shows detailed feedback for a specific module:
 * - Struggle points with competency breakdown
 * - Ubuntu feedback (anonymized)
 * - AI-generated improvement suggestions with actions
 *
 * Privacy-First: All data anonymized.
 *
 * "Ubuntu - I am because we are"
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  Target,
  ThumbsUp,
  ThumbsDown,
  Minus,
  XCircle,
  Beaker,
} from 'lucide-react';

interface ModuleRecord {
  record_id: string;
  module_id: string;
  module_title: string;
  course_id?: string;
  course_title: string;
  last_analysis_at: string;
  total_conversations_analyzed: number;
  total_feedback_collected: number;
  struggle_points: StrugglePoint[];
  suggestions: Suggestion[];
  summary: {
    high_priority_count: number;
    pending_suggestions: number;
    implemented_suggestions: number;
    average_developing_rate: number;
    top_struggle_competencies: string[];
    common_feedback_themes: string[];
  };
}

interface StrugglePoint {
  competency_id: string;
  competency_title: string;
  developing_rate: number;
  not_yet_rate: number;
  total_attempts: number;
  common_issues: string[];
  common_questions: string[];
  confidence: number;
}

interface Suggestion {
  suggestion_id: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
  title: string;
  current_state: string;
  proposed_change: string;
  expected_impact: string;
  estimated_effort: 'small' | 'medium' | 'large';
  evidence: string;
  created_at: string;
  reviewed_at?: string;
  review_notes?: string;
  split_test_id?: string;  // If a split test was launched for this suggestion
}

interface Feedback {
  feedback_id: string;
  struggle_most: string;
  make_better: string;
  ai_sentiment?: string;
  ai_actionable?: boolean;
  ai_summary?: string;
  submitted_at: string;
}

export default function ModuleFeedbackDetailPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.id as string;
  const { user, isAdmin } = useAuth();

  const [record, setRecord] = useState<ModuleRecord | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user && isAdmin && moduleId) {
      loadModuleData();
    }
  }, [user, isAdmin, moduleId]);

  const loadModuleData = async () => {
    try {
      const response = await fetch(`/api/content-feedback/module/${moduleId}`, {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load module data');
      }

      const result = await response.json();
      if (result.success) {
        setRecord(result.data.record);
        setFeedback(result.data.recentFeedback || []);
      } else {
        setError(result.error || 'Failed to load module data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionAction = async (
    suggestionId: string,
    action: 'approved' | 'rejected' | 'implemented' | 'deferred'
  ) => {
    setActionLoading(suggestionId);
    try {
      const response = await fetch(
        `/api/content-feedback/suggestion/${moduleId}/${suggestionId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${await user?.getIdToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: action }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update suggestion');
      }

      // Reload data
      loadModuleData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update suggestion');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Launch a split test for an approved suggestion (Section 14.6)
   */
  const handleLaunchSplitTest = async (suggestion: Suggestion) => {
    if (!record) return;

    const confirmLaunch = confirm(
      `Launch a split test for "${suggestion.title}"?\n\n` +
      `This will randomly assign new learners to either:\n` +
      `• Version A: Current content\n` +
      `• Version B: ${suggestion.title}\n\n` +
      `The test includes ethical safeguards and will automatically stop if learners show distress.`
    );

    if (!confirmLaunch) return;

    setActionLoading(`split_${suggestion.suggestion_id}`);
    try {
      const response = await fetch('/api/split-tests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          module_id: record.module_id,
          module_title: record.module_title,
          course_id: record.course_id || 'unknown',
          course_title: record.course_title,
          improvement_id: suggestion.suggestion_id,

          version_a: {
            name: 'Current',
            description: 'Current content version',
            content_type: 'scaffolding',
            content_snapshot: suggestion.current_state,
          },

          version_b: {
            name: suggestion.title,
            description: suggestion.expected_impact,
            content_type: 'scaffolding',
            content_snapshot: suggestion.proposed_change,
          },

          target_sample_size: 100,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create split test');
      }

      const result = await response.json();

      alert(`Split test created! ID: ${result.data.split_test_id}\n\nGo to Split Tests to start it.`);

      // Navigate to split tests page
      router.push('/admin/content-feedback/split-tests');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create split test');
    } finally {
      setActionLoading(null);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-amber-100 text-amber-700',
      low: 'bg-green-100 text-green-700',
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      implemented: 'bg-purple-100 text-purple-700',
      rejected: 'bg-gray-100 text-gray-700',
      deferred: 'bg-amber-100 text-amber-700',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case 'constructive':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-amu-navy border-t-transparent" />
          <p className="text-amu-slate">Loading module feedback...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Alert variant="error">
          <AlertTriangle className="h-4 w-4" />
          <span className="ml-2">Admin access required</span>
        </Alert>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Alert variant="error" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <span className="ml-2">{error || 'Module not found'}</span>
        </Alert>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/content-feedback')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-[24pt] font-normal text-amu-navy">
              {record.module_title}
            </h1>
            <p className="text-amu-slate">{record.course_title}</p>
          </div>
          <div className="text-right text-sm text-amu-slate">
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last analysis: {new Date(record.last_analysis_at).toLocaleDateString()}
            </p>
            <p className="mt-1">
              {record.total_conversations_analyzed} conversations analyzed
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-amu-navy">
                {record.summary.average_developing_rate}%
              </p>
              <p className="text-xs text-amu-slate">Avg Developing Rate</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-amu-navy">
                {record.struggle_points.length}
              </p>
              <p className="text-xs text-amu-slate">Struggle Points</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-amu-navy">
                {record.summary.pending_suggestions}
              </p>
              <p className="text-xs text-amu-slate">Pending Suggestions</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-amu-navy">
                {record.total_feedback_collected}
              </p>
              <p className="text-xs text-amu-slate">Feedback Collected</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Struggle Points */}
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
            <Target className="h-5 w-5" />
            Struggle Points
          </h2>

          {record.struggle_points.length === 0 ? (
            <p className="py-8 text-center text-amu-slate">
              No struggle points detected. Great news!
            </p>
          ) : (
            <div className="space-y-4">
              {record.struggle_points.map((sp) => (
                <div
                  key={sp.competency_id}
                  className="rounded-lg border border-amu-slate/20 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium text-amu-navy">{sp.competency_title}</p>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-medium text-red-700">
                      {sp.developing_rate}% developing
                    </span>
                  </div>

                  <div className="mb-3 flex items-center gap-4 text-xs text-amu-slate">
                    <span>{sp.total_attempts} attempts</span>
                    <span>{sp.not_yet_rate}% not yet</span>
                    <span>Confidence: {Math.round(sp.confidence * 100)}%</span>
                  </div>

                  {sp.common_issues.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-amu-charcoal">Common Issues:</p>
                      <ul className="mt-1 list-inside list-disc text-xs text-amu-slate">
                        {sp.common_issues.slice(0, 3).map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {sp.common_questions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amu-charcoal">Common Questions:</p>
                      <ul className="mt-1 list-inside list-disc text-xs text-amu-slate">
                        {sp.common_questions.slice(0, 3).map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Feedback */}
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
            <MessageSquare className="h-5 w-5" />
            Ubuntu Feedback (Anonymized)
          </h2>

          {feedback.length === 0 ? (
            <p className="py-8 text-center text-amu-slate">
              No feedback collected yet.
            </p>
          ) : (
            <div className="max-h-[500px] space-y-4 overflow-y-auto">
              {feedback.slice(0, 10).map((fb) => (
                <div
                  key={fb.feedback_id}
                  className="rounded-lg border border-amu-slate/20 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSentimentIcon(fb.ai_sentiment)}
                      <span className="text-xs text-amu-slate">
                        {new Date(fb.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                    {fb.ai_actionable && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                        Actionable
                      </span>
                    )}
                  </div>

                  <div className="mb-2">
                    <p className="text-xs font-medium text-amu-charcoal">Struggled with:</p>
                    <p className="text-sm text-amu-slate">{fb.struggle_most}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-amu-charcoal">Suggestion:</p>
                    <p className="text-sm text-amu-slate">{fb.make_better}</p>
                  </div>

                  {fb.ai_summary && (
                    <p className="mt-2 text-xs italic text-amu-charcoal">
                      AI Summary: {fb.ai_summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Improvement Suggestions */}
      <Card className="mt-6 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
          <Lightbulb className="h-5 w-5" />
          Improvement Suggestions
        </h2>

        {record.suggestions.length === 0 ? (
          <p className="py-8 text-center text-amu-slate">
            No suggestions generated yet. Run analysis to generate suggestions.
          </p>
        ) : (
          <div className="space-y-4">
            {record.suggestions.map((suggestion) => (
              <div
                key={suggestion.suggestion_id}
                className="rounded-lg border border-amu-slate/20 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityBadge(suggestion.priority)}`}>
                      {suggestion.priority}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(suggestion.status)}`}>
                      {suggestion.status}
                    </span>
                    <span className="text-xs text-amu-slate">{suggestion.category}</span>
                  </div>
                  <span className="text-xs text-amu-slate">
                    Effort: {suggestion.estimated_effort}
                  </span>
                </div>

                <h3 className="mb-2 font-medium text-amu-navy">{suggestion.title}</h3>

                <div className="mb-3 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-amu-charcoal">Current State:</p>
                    <p className="text-amu-slate">{suggestion.current_state}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amu-charcoal">Proposed Change:</p>
                    <p className="text-amu-slate">{suggestion.proposed_change}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-medium text-amu-charcoal">Expected Impact:</p>
                  <p className="text-sm text-amu-slate">{suggestion.expected_impact}</p>
                </div>

                <div className="mb-4 rounded bg-amu-slate/5 p-2">
                  <p className="text-xs font-medium text-amu-charcoal">Evidence:</p>
                  <p className="text-xs text-amu-slate">{suggestion.evidence}</p>
                </div>

                {suggestion.status === 'pending' && (
                  <div className="flex items-center gap-2 border-t border-amu-slate/20 pt-3">
                    <Button
                      size="sm"
                      onClick={() => handleSuggestionAction(suggestion.suggestion_id, 'approved')}
                      disabled={actionLoading === suggestion.suggestion_id}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSuggestionAction(suggestion.suggestion_id, 'implemented')}
                      disabled={actionLoading === suggestion.suggestion_id}
                    >
                      Implemented
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSuggestionAction(suggestion.suggestion_id, 'deferred')}
                      disabled={actionLoading === suggestion.suggestion_id}
                    >
                      Defer
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSuggestionAction(suggestion.suggestion_id, 'rejected')}
                      disabled={actionLoading === suggestion.suggestion_id}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}

                {suggestion.status === 'approved' && (
                  <div className="flex items-center gap-2 border-t border-amu-slate/20 pt-3">
                    <Button
                      size="sm"
                      onClick={() => handleLaunchSplitTest(suggestion)}
                      disabled={actionLoading === `split_${suggestion.suggestion_id}` || !!suggestion.split_test_id}
                    >
                      <Beaker className="mr-1 h-4 w-4" />
                      {suggestion.split_test_id ? 'Split Test Created' : 'Launch Split Test'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSuggestionAction(suggestion.suggestion_id, 'implemented')}
                      disabled={actionLoading === suggestion.suggestion_id}
                    >
                      Mark Implemented
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSuggestionAction(suggestion.suggestion_id, 'deferred')}
                      disabled={actionLoading === suggestion.suggestion_id}
                    >
                      Defer
                    </Button>
                    {suggestion.split_test_id && (
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => router.push(`/admin/content-feedback/split-tests/${suggestion.split_test_id}`)}
                      >
                        View Test
                      </Button>
                    )}
                  </div>
                )}

                {suggestion.review_notes && (
                  <div className="mt-3 rounded bg-blue-50 p-2 text-xs text-blue-700">
                    Review notes: {suggestion.review_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
