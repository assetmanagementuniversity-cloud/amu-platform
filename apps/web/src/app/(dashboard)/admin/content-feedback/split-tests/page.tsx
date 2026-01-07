'use client';

/**
 * Split Tests Management Page - AMU Admin
 *
 * Split Testing Framework (Section 14.6)
 *
 * Manage A/B tests of content improvements:
 * - View active and completed tests
 * - Monitor progress and metrics
 * - Handle ethical stop events
 * - Deploy winning versions
 *
 * "Ubuntu - I am because we are"
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Beaker,
  Shield,
  Rocket,
} from 'lucide-react';

interface SplitTestSummary {
  split_test_id: string;
  module_title: string;
  course_title: string;
  status: string;
  target_sample_size: number;
  current_total_sample: number;
  progress_percentage: number;
  version_a_competency_rate: number;
  version_b_competency_rate: number;
  current_difference_pct: number;
  has_ethical_concerns: boolean;
  days_running: number;
  started_at?: string;
}

export default function SplitTestsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [tests, setTests] = useState<SplitTestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user && isAdmin) {
      loadTests();
    }
  }, [user, isAdmin]);

  const loadTests = async () => {
    try {
      const statusParam = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`/api/split-tests/summaries${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load split tests');

      const result = await response.json();
      if (result.success) {
        setTests(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (testId: string, action: string) => {
    setActionLoading(testId);
    try {
      const response = await fetch(`/api/split-tests/${testId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Failed to ${action} test`);

      loadTests();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: React.ReactNode }> = {
      draft: { color: 'bg-gray-100 text-gray-700', icon: <Clock className="h-3 w-3" /> },
      active: { color: 'bg-green-100 text-green-700', icon: <Play className="h-3 w-3" /> },
      paused: { color: 'bg-amber-100 text-amber-700', icon: <Pause className="h-3 w-3" /> },
      completed: { color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="h-3 w-3" /> },
      stopped_ethics: { color: 'bg-red-100 text-red-700', icon: <Shield className="h-3 w-3" /> },
      stopped_manual: { color: 'bg-gray-100 text-gray-700', icon: <StopCircle className="h-3 w-3" /> },
      concluded: { color: 'bg-purple-100 text-purple-700', icon: <Rocket className="h-3 w-3" /> },
    };
    return badges[status] || badges.draft;
  };

  const getDifferenceIndicator = (diff: number) => {
    if (diff > 5) return { color: 'text-green-600', icon: <TrendingUp className="h-4 w-4" /> };
    if (diff < -5) return { color: 'text-red-600', icon: <TrendingDown className="h-4 w-4" /> };
    return { color: 'text-gray-500', icon: null };
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-amu-navy border-t-transparent" />
          <p className="text-amu-slate">Loading split tests...</p>
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

  // Separate tests by status
  const activeTests = tests.filter(t => t.status === 'active');
  const draftTests = tests.filter(t => t.status === 'draft');
  const completedTests = tests.filter(t =>
    ['completed', 'stopped_ethics', 'stopped_manual', 'concluded'].includes(t.status)
  );

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
          Back to Content Feedback
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600">
              <Beaker className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-[24pt] font-normal text-amu-navy">
                Split Tests
              </h1>
              <p className="text-amu-slate">
                A/B testing framework for content improvements
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => loadTests()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <span className="ml-2">{error}</span>
        </Alert>
      )}

      {/* Ethical Override Notice */}
      <Card className="mb-6 border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">Ethical Overrides Active</p>
            <p className="text-sm text-amber-700">
              Tests automatically stop if a learner expresses significant distress or 3 consecutive
              learners rate satisfaction below 3/5. Learner wellbeing always comes first.
            </p>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Play className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-amu-navy">{activeTests.length}</p>
              <p className="text-xs text-amu-slate">Active Tests</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-gray-500" />
            <div>
              <p className="text-2xl font-bold text-amu-navy">{draftTests.length}</p>
              <p className="text-xs text-amu-slate">Draft Tests</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-amu-navy">{completedTests.length}</p>
              <p className="text-xs text-amu-slate">Completed</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-amu-navy">
                {activeTests.reduce((sum, t) => sum + t.current_total_sample, 0)}
              </p>
              <p className="text-xs text-amu-slate">Active Participants</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Tests */}
      {activeTests.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 font-heading text-lg font-semibold text-amu-navy">
            Active Tests
          </h2>
          <div className="space-y-4">
            {activeTests.map((test) => (
              <Card key={test.split_test_id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-medium text-amu-navy">{test.module_title}</h3>
                      {test.has_ethical_concerns && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                          <AlertTriangle className="mr-1 inline h-3 w-3" />
                          Concerns
                        </span>
                      )}
                    </div>
                    <p className="mb-3 text-sm text-amu-slate">{test.course_title}</p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-amu-slate">
                          {test.current_total_sample} / {test.target_sample_size} participants
                        </span>
                        <span className="font-medium text-amu-navy">
                          {test.progress_percentage}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-amu-slate/20">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{ width: `${test.progress_percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics Comparison */}
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-amu-slate">Version A:</span>{' '}
                        <span className="font-medium text-amu-navy">
                          {test.version_a_competency_rate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-amu-slate">Version B:</span>{' '}
                        <span className="font-medium text-amu-navy">
                          {test.version_b_competency_rate}%
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 ${getDifferenceIndicator(test.current_difference_pct).color}`}>
                        {getDifferenceIndicator(test.current_difference_pct).icon}
                        <span className="font-medium">
                          {test.current_difference_pct > 0 ? '+' : ''}{test.current_difference_pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-amu-slate">
                        {test.days_running} days running
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/content-feedback/split-tests/${test.split_test_id}`)}
                    >
                      <BarChart3 className="mr-1 h-4 w-4" />
                      Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(test.split_test_id, 'pause')}
                      disabled={actionLoading === test.split_test_id}
                    >
                      <Pause className="mr-1 h-4 w-4" />
                      Pause
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(test.split_test_id, 'analyze')}
                      disabled={actionLoading === test.split_test_id}
                    >
                      Analyze
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Draft Tests */}
      {draftTests.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 font-heading text-lg font-semibold text-amu-navy">
            Draft Tests (Ready to Start)
          </h2>
          <div className="space-y-4">
            {draftTests.map((test) => (
              <Card key={test.split_test_id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-amu-navy">{test.module_title}</h3>
                    <p className="text-sm text-amu-slate">{test.course_title}</p>
                    <p className="mt-1 text-xs text-amu-slate">
                      Target: {test.target_sample_size} participants
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAction(test.split_test_id, 'start')}
                      disabled={actionLoading === test.split_test_id}
                    >
                      <Play className="mr-1 h-4 w-4" />
                      Start Test
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/content-feedback/split-tests/${test.split_test_id}`)}
                    >
                      Configure
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tests */}
      {completedTests.length > 0 && (
        <div>
          <h2 className="mb-4 font-heading text-lg font-semibold text-amu-navy">
            Completed Tests
          </h2>
          <div className="space-y-4">
            {completedTests.map((test) => {
              const badge = getStatusBadge(test.status);
              return (
                <Card key={test.split_test_id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-medium text-amu-navy">{test.module_title}</h3>
                          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${badge.color}`}>
                            {badge.icon}
                            {test.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-amu-slate">{test.course_title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right text-sm">
                        <p className="text-amu-slate">Final Result</p>
                        <p className={`font-medium ${getDifferenceIndicator(test.current_difference_pct).color}`}>
                          {test.current_difference_pct > 0 ? '+' : ''}{test.current_difference_pct.toFixed(1)}%
                          {test.current_difference_pct > 5 ? ' (B wins)' : test.current_difference_pct < -5 ? ' (A wins)' : ' (No diff)'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/content-feedback/split-tests/${test.split_test_id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {tests.length === 0 && (
        <Card className="p-8 text-center">
          <Beaker className="mx-auto mb-4 h-12 w-12 text-amu-slate/50" />
          <h3 className="mb-2 font-heading text-lg font-semibold text-amu-navy">
            No Split Tests Yet
          </h3>
          <p className="mb-4 text-amu-slate">
            Create a split test from an approved content improvement suggestion.
          </p>
          <Button onClick={() => router.push('/admin/content-feedback')}>
            View Suggestions
          </Button>
        </Card>
      )}
    </div>
  );
}
