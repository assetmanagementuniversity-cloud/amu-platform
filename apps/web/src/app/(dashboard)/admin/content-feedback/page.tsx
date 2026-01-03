'use client';

/**
 * Content Feedback Dashboard - AMU Admin
 *
 * Intelligent Content Improvement System (Section 14)
 *
 * Shows aggregated, anonymized insights:
 * - Struggle points detected from competency tracking
 * - Ubuntu feedback from learners (anonymized)
 * - AI-generated improvement suggestions
 *
 * Privacy-First: NO learner identifiers shown. All data anonymized.
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
  BarChart3,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  ChevronRight,
  Users,
  BookOpen,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Beaker,
} from 'lucide-react';

interface DashboardData {
  total_modules: number;
  modules_needing_attention: number;
  pending_suggestions: number;
  feedback_this_week: number;
  modules: ModuleData[];
  top_struggle_points: StrugglePointSummary[];
  feedback_themes: FeedbackTheme[];
}

interface ModuleData {
  module_id: string;
  module_title: string;
  course_title: string;
  developing_rate: number;
  struggle_point_count: number;
  feedback_count: number;
  pending_suggestions: number;
  priority_score: number;
}

interface StrugglePointSummary {
  competency_title: string;
  module_title: string;
  developing_rate: number;
  common_issue: string;
}

interface FeedbackTheme {
  theme: string;
  count: number;
  sentiment: string;
}

export default function ContentFeedbackDashboard() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      loadDashboard();
    } else if (user && !isAdmin) {
      setError('Admin access required');
      setLoading(false);
    }
  }, [user, isAdmin]);

  const loadDashboard = async () => {
    try {
      const response = await fetch('/api/content-feedback/dashboard', {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }

      const result = await response.json();
      if (result.success) {
        setDashboard(result.data);
      } else {
        setError(result.error || 'Failed to load dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const getPriorityColor = (score: number) => {
    if (score >= 100) return 'text-red-600 bg-red-50';
    if (score >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  const getDevelopingRateColor = (rate: number) => {
    if (rate >= 40) return 'text-red-600';
    if (rate >= 25) return 'text-amber-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-amu-navy border-t-transparent" />
          <p className="text-amu-slate">Loading content feedback data...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span className="ml-2">Admin access required to view this page</span>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <span className="ml-2">{error}</span>
        </Alert>
        <Button onClick={handleRefresh}>Try Again</Button>
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
          onClick={() => router.push('/admin')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amu-navy">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-[24pt] font-normal text-amu-navy">
                Content Feedback Dashboard
              </h1>
              <p className="text-amu-slate">
                Anonymized insights to improve learning content
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Privacy Notice */}
      <Card className="mb-6 border-amu-sky bg-amu-sky/20 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-amu-navy" />
          <div>
            <p className="font-medium text-amu-navy">Privacy-First Design</p>
            <p className="text-sm text-amu-charcoal">
              All data shown is aggregated and anonymized. No learner names or identifiers are ever stored or displayed.
            </p>
          </div>
        </div>
      </Card>

      {/* Overview Stats */}
      {dashboard && (
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amu-navy">
                  {dashboard.total_modules}
                </p>
                <p className="text-xs text-amu-slate">Total Modules</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amu-navy">
                  {dashboard.modules_needing_attention}
                </p>
                <p className="text-xs text-amu-slate">Need Attention</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Lightbulb className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amu-navy">
                  {dashboard.pending_suggestions}
                </p>
                <p className="text-xs text-amu-slate">Pending Suggestions</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amu-navy">
                  {dashboard.feedback_this_week}
                </p>
                <p className="text-xs text-amu-slate">Feedback This Week</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Modules Priority List */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-amu-navy">
                Modules by Priority
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/content-feedback/suggestions')}
              >
                View All Suggestions
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {dashboard?.modules.length === 0 ? (
              <p className="py-8 text-center text-amu-slate">
                No module data available yet.
              </p>
            ) : (
              <div className="space-y-3">
                {dashboard?.modules.slice(0, 8).map((module) => (
                  <button
                    key={module.module_id}
                    onClick={() => router.push(`/admin/content-feedback/module/${module.module_id}`)}
                    className="flex w-full items-center justify-between rounded-lg border border-amu-slate/20 p-4 text-left transition-colors hover:bg-amu-slate/5"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-amu-navy">
                        {module.module_title}
                      </p>
                      <p className="text-sm text-amu-slate">{module.course_title}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs">
                        <span className={getDevelopingRateColor(module.developing_rate)}>
                          <TrendingUp className="mr-1 inline h-3 w-3" />
                          {module.developing_rate}% developing
                        </span>
                        <span className="text-amu-slate">
                          <AlertTriangle className="mr-1 inline h-3 w-3" />
                          {module.struggle_point_count} struggle points
                        </span>
                        <span className="text-amu-slate">
                          <MessageSquare className="mr-1 inline h-3 w-3" />
                          {module.feedback_count} feedback
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityColor(module.priority_score)}`}>
                        {module.pending_suggestions} pending
                      </span>
                      <ChevronRight className="mt-2 h-4 w-4 text-amu-slate" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Top Struggle Points */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Top Struggle Points
            </h2>

            {dashboard?.top_struggle_points.length === 0 ? (
              <p className="py-4 text-center text-sm text-amu-slate">
                No struggle points detected yet.
              </p>
            ) : (
              <div className="space-y-4">
                {dashboard?.top_struggle_points.slice(0, 5).map((sp, i) => (
                  <div key={i} className="rounded-lg bg-amu-slate/5 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-amu-navy">
                        {sp.competency_title}
                      </p>
                      <span className={`text-sm font-bold ${getDevelopingRateColor(sp.developing_rate)}`}>
                        {sp.developing_rate}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-amu-slate">{sp.module_title}</p>
                    {sp.common_issue && (
                      <p className="mt-2 text-xs italic text-amu-charcoal">
                        &quot;{sp.common_issue}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Feedback Themes */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
              <Users className="h-5 w-5 text-amu-navy" />
              Ubuntu Feedback Themes
            </h2>

            {dashboard?.feedback_themes.length === 0 ? (
              <p className="py-4 text-center text-sm text-amu-slate">
                Not enough feedback to identify themes.
              </p>
            ) : (
              <div className="space-y-3">
                {dashboard?.feedback_themes.slice(0, 6).map((theme, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-amu-slate/10 p-3"
                  >
                    <div className="flex items-center gap-2">
                      {theme.sentiment === 'constructive' ? (
                        <ThumbsUp className="h-4 w-4 text-blue-500" />
                      ) : theme.sentiment === 'negative' ? (
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-amu-slate" />
                      )}
                      <span className="text-sm text-amu-charcoal">{theme.theme}</span>
                    </div>
                    <span className="rounded-full bg-amu-slate/10 px-2 py-0.5 text-xs text-amu-slate">
                      {theme.count}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-4 text-center text-xs text-amu-slate">
              Themes extracted from anonymized learner feedback
            </p>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="mb-4 font-heading text-lg font-semibold text-amu-navy">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/admin/content-feedback/suggestions')}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Review Suggestions
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/admin/content-feedback/split-tests')}
              >
                <Beaker className="mr-2 h-4 w-4" />
                Manage Split Tests
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/admin/content-feedback/feedback')}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                View Raw Feedback
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/admin/content-feedback/analysis')}
              >
                <Clock className="mr-2 h-4 w-4" />
                Run Analysis
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
