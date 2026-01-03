'use client';

/**
 * Split Test Detail Page - AMU Admin
 *
 * Split Testing Framework (Section 14.6)
 *
 * View and manage individual split test:
 * - Version details
 * - Real-time metrics comparison
 * - Participant breakdown
 * - Statistical analysis
 * - Ethical events log
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
  Play,
  Pause,
  StopCircle,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Rocket,
  FileText,
  Award,
  MessageSquare,
} from 'lucide-react';

interface SplitTest {
  split_test_id: string;
  module_id: string;
  module_title: string;
  course_id: string;
  course_title: string;
  improvement_id?: string;
  status: string;
  created_at: string;
  started_at?: string;
  stopped_at?: string;
  stopped_reason?: string;
  version_a: { name: string; description: string; content_snapshot: string };
  version_b: { name: string; description: string; content_snapshot: string };
  allocation_strategy: string;
  target_sample_size: number;
  current_sample_a: number;
  current_sample_b: number;
  participants: Participant[];
  ethical_events: EthicalEvent[];
  latest_analysis?: Analysis;
  winner?: string;
  winner_deployed?: boolean;
  conclusion_notes?: string;
}

interface Participant {
  enrolment_id: string;
  version: 'version_a' | 'version_b';
  competency_achieved: boolean;
  messages_to_competency?: number;
  satisfaction_score?: number;
  got_stuck: boolean;
  feedback_sentiment?: string;
  assigned_at: string;
}

interface EthicalEvent {
  event_id: string;
  triggered_at: string;
  condition_type: string;
  offending_version: string;
  feedback_summary: string;
  severity: string;
  test_stopped: boolean;
}

interface Analysis {
  analyzed_at: string;
  version_a: Metrics;
  version_b: Metrics;
  competency_rate_difference: number;
  competency_rate_improvement_pct: number;
  statistical_significance: boolean;
  p_value: number;
  winner: string;
  recommendation: string;
  should_deploy_winner: boolean;
}

interface Metrics {
  sample_size: number;
  competency_achievement_rate: number;
  avg_messages_to_competency: number;
  learner_satisfaction_avg: number;
  stuck_rate: number;
  completion_rate: number;
  negative_feedback_count: number;
  very_negative_feedback_count: number;
}

export default function SplitTestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  const { user, isAdmin } = useAuth();

  const [test, setTest] = useState<SplitTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showConcludeModal, setShowConcludeModal] = useState(false);

  useEffect(() => {
    if (user && isAdmin && testId) {
      loadTest();
    }
  }, [user, isAdmin, testId]);

  const loadTest = async () => {
    try {
      const response = await fetch(`/api/split-tests/${testId}`, {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load split test');

      const result = await response.json();
      if (result.success) {
        setTest(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, body?: Record<string, unknown>) => {
    setActionLoading(action);
    try {
      const response = await fetch(`/api/split-tests/${testId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) throw new Error(`Failed to ${action}`);

      loadTest();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConclude = async (winner: string) => {
    await handleAction('conclude', { winner });
    setShowConcludeModal(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-amu-navy border-t-transparent" />
          <p className="text-amu-slate">Loading split test...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !test) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span className="ml-2">{error || 'Test not found'}</span>
        </Alert>
      </div>
    );
  }

  const totalSample = test.current_sample_a + test.current_sample_b;
  const progressPct = Math.round((totalSample / test.target_sample_size) * 100);

  return (
    <div className="mx-auto max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/content-feedback/split-tests')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Split Tests
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-[24pt] font-normal text-amu-navy">
              {test.module_title}
            </h1>
            <p className="text-amu-slate">{test.course_title}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => loadTest()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>

            {test.status === 'draft' && (
              <Button
                onClick={() => handleAction('start')}
                disabled={actionLoading === 'start'}
              >
                <Play className="mr-2 h-4 w-4" />
                Start Test
              </Button>
            )}

            {test.status === 'active' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleAction('pause')}
                  disabled={actionLoading === 'pause'}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
                <Button
                  onClick={() => handleAction('analyze')}
                  disabled={actionLoading === 'analyze'}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analyze
                </Button>
              </>
            )}

            {test.status === 'paused' && (
              <Button
                onClick={() => handleAction('resume')}
                disabled={actionLoading === 'resume'}
              >
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            )}

            {(test.status === 'completed' || test.status === 'stopped_ethics' || test.status === 'stopped_manual') && !test.winner && (
              <Button onClick={() => setShowConcludeModal(true)}>
                <Award className="mr-2 h-4 w-4" />
                Conclude Test
              </Button>
            )}

            {test.status === 'concluded' && test.winner && test.winner !== 'no_difference' && !test.winner_deployed && (
              <Button
                onClick={() => handleAction('deploy')}
                disabled={actionLoading === 'deploy'}
              >
                <Rocket className="mr-2 h-4 w-4" />
                Deploy Winner
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Ethical Events Alert */}
      {test.ethical_events.length > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <Shield className="h-4 w-4 text-red-600" />
          <div className="ml-2">
            <p className="font-medium text-red-800">Ethical Concerns Detected</p>
            <p className="text-sm text-red-700">
              {test.ethical_events[test.ethical_events.length - 1]?.feedback_summary}
            </p>
          </div>
        </Alert>
      )}

      {/* Status & Progress */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold text-amu-navy">
            Test Status
          </h2>

          <div className="mb-4 flex items-center gap-4">
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${
              test.status === 'active' ? 'bg-green-100 text-green-700' :
              test.status === 'stopped_ethics' ? 'bg-red-100 text-red-700' :
              test.status === 'concluded' ? 'bg-purple-100 text-purple-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {test.status.replace('_', ' ')}
            </span>

            {test.winner && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                Winner: {test.winner === 'version_a' ? test.version_a.name : test.winner === 'version_b' ? test.version_b.name : 'No difference'}
              </span>
            )}

            {test.winner_deployed && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                Deployed
              </span>
            )}
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-amu-slate">Progress</span>
              <span className="font-medium text-amu-navy">
                {totalSample} / {test.target_sample_size} ({progressPct}%)
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-amu-slate/20">
              <div
                className="h-full rounded-full bg-amu-navy transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-amu-slate">Version A Participants</p>
              <p className="text-lg font-bold text-amu-navy">{test.current_sample_a}</p>
            </div>
            <div>
              <p className="text-amu-slate">Version B Participants</p>
              <p className="text-lg font-bold text-amu-navy">{test.current_sample_b}</p>
            </div>
            <div>
              <p className="text-amu-slate">Started</p>
              <p className="font-medium text-amu-charcoal">
                {test.started_at ? new Date(test.started_at).toLocaleDateString() : 'Not started'}
              </p>
            </div>
            <div>
              <p className="text-amu-slate">Allocation</p>
              <p className="font-medium text-amu-charcoal">{test.allocation_strategy}</p>
            </div>
          </div>
        </Card>

        {/* Latest Analysis */}
        <Card className="p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold text-amu-navy">
            Latest Analysis
          </h2>

          {test.latest_analysis ? (
            <div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-xs text-blue-600">Version A ({test.version_a.name})</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {test.latest_analysis.version_a.competency_achievement_rate}%
                  </p>
                  <p className="text-xs text-blue-600">competency rate</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-3">
                  <p className="text-xs text-purple-600">Version B ({test.version_b.name})</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {test.latest_analysis.version_b.competency_achievement_rate}%
                  </p>
                  <p className="text-xs text-purple-600">competency rate</p>
                </div>
              </div>

              <div className="mb-4 rounded-lg bg-amu-slate/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-amu-slate">Difference:</span>
                  <span className={`text-lg font-bold ${
                    test.latest_analysis.competency_rate_improvement_pct > 0 ? 'text-green-600' :
                    test.latest_analysis.competency_rate_improvement_pct < 0 ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {test.latest_analysis.competency_rate_improvement_pct > 0 ? '+' : ''}
                    {test.latest_analysis.competency_rate_improvement_pct.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-amu-slate">p-value:</span>
                  <span className={`text-sm font-medium ${
                    test.latest_analysis.p_value < 0.05 ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {test.latest_analysis.p_value.toFixed(3)}
                    {test.latest_analysis.statistical_significance ? ' (significant)' : ' (not significant)'}
                  </span>
                </div>
              </div>

              <p className="text-sm text-amu-charcoal">
                <strong>Recommendation:</strong> {test.latest_analysis.recommendation}
              </p>

              <p className="mt-2 text-xs text-amu-slate">
                Analyzed: {new Date(test.latest_analysis.analyzed_at).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="py-4 text-center text-amu-slate">
              No analysis yet. Run analysis when sufficient data is collected.
            </p>
          )}
        </Card>
      </div>

      {/* Version Details */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-blue-700">
            <FileText className="h-5 w-5" />
            Version A: {test.version_a.name}
          </h2>
          <p className="mb-2 text-sm text-amu-slate">{test.version_a.description}</p>
          <div className="max-h-40 overflow-y-auto rounded bg-amu-slate/5 p-3 text-xs font-mono">
            {test.version_a.content_snapshot.substring(0, 500)}
            {test.version_a.content_snapshot.length > 500 && '...'}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-purple-700">
            <FileText className="h-5 w-5" />
            Version B: {test.version_b.name}
          </h2>
          <p className="mb-2 text-sm text-amu-slate">{test.version_b.description}</p>
          <div className="max-h-40 overflow-y-auto rounded bg-amu-slate/5 p-3 text-xs font-mono">
            {test.version_b.content_snapshot.substring(0, 500)}
            {test.version_b.content_snapshot.length > 500 && '...'}
          </div>
        </Card>
      </div>

      {/* Metrics Comparison */}
      {test.latest_analysis && (
        <Card className="mb-6 p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold text-amu-navy">
            Metrics Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amu-slate/20">
                  <th className="py-2 text-left text-amu-slate">Metric</th>
                  <th className="py-2 text-center text-blue-600">Version A</th>
                  <th className="py-2 text-center text-purple-600">Version B</th>
                  <th className="py-2 text-center text-amu-navy">Difference</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-amu-slate/10">
                  <td className="py-2">Sample Size</td>
                  <td className="py-2 text-center">{test.latest_analysis.version_a.sample_size}</td>
                  <td className="py-2 text-center">{test.latest_analysis.version_b.sample_size}</td>
                  <td className="py-2 text-center">-</td>
                </tr>
                <tr className="border-b border-amu-slate/10">
                  <td className="py-2">Competency Rate</td>
                  <td className="py-2 text-center">{test.latest_analysis.version_a.competency_achievement_rate}%</td>
                  <td className="py-2 text-center">{test.latest_analysis.version_b.competency_achievement_rate}%</td>
                  <td className={`py-2 text-center font-medium ${
                    test.latest_analysis.competency_rate_difference > 0 ? 'text-green-600' :
                    test.latest_analysis.competency_rate_difference < 0 ? 'text-red-600' : ''
                  }`}>
                    {test.latest_analysis.competency_rate_difference > 0 ? '+' : ''}{test.latest_analysis.competency_rate_difference}%
                  </td>
                </tr>
                <tr className="border-b border-amu-slate/10">
                  <td className="py-2">Avg Messages to Competency</td>
                  <td className="py-2 text-center">{test.latest_analysis.version_a.avg_messages_to_competency}</td>
                  <td className="py-2 text-center">{test.latest_analysis.version_b.avg_messages_to_competency}</td>
                  <td className={`py-2 text-center font-medium ${
                    test.latest_analysis.messages_difference < 0 ? 'text-green-600' :
                    test.latest_analysis.messages_difference > 0 ? 'text-red-600' : ''
                  }`}>
                    {test.latest_analysis.messages_difference > 0 ? '+' : ''}{test.latest_analysis.messages_difference}
                  </td>
                </tr>
                <tr className="border-b border-amu-slate/10">
                  <td className="py-2">Satisfaction (1-5)</td>
                  <td className="py-2 text-center">{test.latest_analysis.version_a.learner_satisfaction_avg}</td>
                  <td className="py-2 text-center">{test.latest_analysis.version_b.learner_satisfaction_avg}</td>
                  <td className={`py-2 text-center font-medium ${
                    test.latest_analysis.satisfaction_difference > 0 ? 'text-green-600' :
                    test.latest_analysis.satisfaction_difference < 0 ? 'text-red-600' : ''
                  }`}>
                    {test.latest_analysis.satisfaction_difference > 0 ? '+' : ''}{test.latest_analysis.satisfaction_difference}
                  </td>
                </tr>
                <tr className="border-b border-amu-slate/10">
                  <td className="py-2">Stuck Rate</td>
                  <td className="py-2 text-center">{test.latest_analysis.version_a.stuck_rate}%</td>
                  <td className="py-2 text-center">{test.latest_analysis.version_b.stuck_rate}%</td>
                  <td className="py-2 text-center">-</td>
                </tr>
                <tr>
                  <td className="py-2">Negative Feedback</td>
                  <td className="py-2 text-center">{test.latest_analysis.version_a.negative_feedback_count}</td>
                  <td className="py-2 text-center">{test.latest_analysis.version_b.negative_feedback_count}</td>
                  <td className="py-2 text-center">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Ethical Events */}
      {test.ethical_events.length > 0 && (
        <Card className="mb-6 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-red-700">
            <Shield className="h-5 w-5" />
            Ethical Events Log
          </h2>

          <div className="space-y-3">
            {test.ethical_events.map((event) => (
              <div
                key={event.event_id}
                className="rounded-lg border border-red-200 bg-red-50 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-red-800">
                    {event.condition_type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-red-600">
                    {new Date(event.triggered_at).toLocaleString()}
                  </span>
                </div>
                <p className="mb-1 text-sm text-red-700">
                  Offending version: {event.offending_version}
                </p>
                <p className="text-sm text-red-600">{event.feedback_summary}</p>
                {event.test_stopped && (
                  <p className="mt-2 text-xs font-medium text-red-800">
                    Test was automatically stopped
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Conclude Modal */}
      {showConcludeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md p-6">
            <h2 className="mb-4 font-heading text-lg font-semibold text-amu-navy">
              Conclude Split Test
            </h2>
            <p className="mb-4 text-sm text-amu-slate">
              Select the winning version based on the analysis results:
            </p>

            <div className="mb-4 space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleConclude('version_a')}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                Version A: {test.version_a.name} wins
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleConclude('version_b')}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-purple-600" />
                Version B: {test.version_b.name} wins
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleConclude('no_difference')}
              >
                <Minus className="mr-2 h-4 w-4 text-gray-600" />
                No significant difference
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowConcludeModal(false)}
            >
              Cancel
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
