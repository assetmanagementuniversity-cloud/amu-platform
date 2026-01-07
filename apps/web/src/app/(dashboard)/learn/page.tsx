'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { VerifyIdentityBanner } from '@/components/dashboard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LOGO_WITH_SLOGAN_INVERTED, LOGO_ONLY } from '@/lib/brand-assets';
import { getEnrolments, getLearningStats, type EnrolmentListItem } from '@/lib/api';
import { mockCourses } from '@/lib/mock-courses';
import {
  BookOpen,
  Clock,
  ChevronRight,
  GraduationCap,
  Trophy,
  Target,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface LearningStats {
  total_courses: number;
  completed_courses: number;
  active_courses: number;
  total_hours: number;
  competencies_achieved: number;
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function EnrolmentCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border-2 border-amu-slate/30 bg-amu-sky/50 p-4 animate-pulse">
      <div className="h-16 w-16 rounded-lg bg-amu-slate/30" />
      <div className="flex-1">
        <div className="h-5 w-3/4 rounded bg-amu-slate/30" />
        <div className="mt-2 h-4 w-1/2 rounded bg-amu-slate/20" />
        <div className="mt-2 h-2 w-full rounded-full bg-amu-slate/20" />
      </div>
      <div className="h-10 w-24 rounded bg-amu-slate/30" />
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-amu-slate/30 bg-white p-4 animate-pulse">
      <div className="h-8 w-8 rounded-full bg-amu-slate/30" />
      <div className="mt-2 h-6 w-12 rounded bg-amu-slate/30" />
      <div className="mt-1 h-4 w-20 rounded bg-amu-slate/20" />
    </div>
  );
}

// =============================================================================
// STAT CARD
// =============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  className?: string;
}

function StatCard({ icon, value, label, className }: StatCardProps) {
  return (
    <div className={cn('rounded-lg border border-amu-slate/30 bg-white p-4', className)}>
      <div className="text-amu-navy">{icon}</div>
      <div className="mt-2 font-heading text-2xl font-bold text-amu-navy">{value}</div>
      <div className="font-body text-sm text-amu-charcoal">{label}</div>
    </div>
  );
}

// =============================================================================
// ENROLMENT CARD
// =============================================================================

interface EnrolmentCardProps {
  enrolment: EnrolmentListItem;
}

function EnrolmentCard({ enrolment }: EnrolmentCardProps) {
  const statusColors = {
    active: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-blue-100 text-blue-800',
    paused: 'bg-amber-100 text-amber-800',
    withdrawn: 'bg-red-100 text-red-800',
  };

  return (
    <Link
      href={`/learn/${enrolment.course_id}`}
      className="flex items-center gap-4 rounded-lg border-2 border-amu-navy bg-amu-sky p-4 transition-shadow hover:shadow-lg"
    >
      {/* Thumbnail or placeholder */}
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-amu-navy/10">
        {enrolment.course_thumbnail_url ? (
          <Image
            src={enrolment.course_thumbnail_url}
            alt={enrolment.course_title}
            width={64}
            height={64}
            className="h-16 w-16 rounded-lg object-cover"
          />
        ) : (
          <BookOpen className="h-8 w-8 text-amu-navy" />
        )}
      </div>

      {/* Course info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-lg font-semibold text-amu-navy truncate">
            {enrolment.course_title}
          </h3>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-body text-xs font-medium',
              statusColors[enrolment.status]
            )}
          >
            {enrolment.status.charAt(0).toUpperCase() + enrolment.status.slice(1)}
          </span>
        </div>
        {enrolment.current_module_title && (
          <p className="mt-1 font-body text-sm text-amu-charcoal truncate">
            Current: {enrolment.current_module_title}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-amu-navy transition-all"
              style={{ width: `${enrolment.overall_progress_percent}%` }}
            />
          </div>
          <span className="font-body text-xs text-amu-charcoal">
            {enrolment.overall_progress_percent}%
          </span>
        </div>
      </div>

      {/* Continue button */}
      <div className="flex-shrink-0">
        <Button variant="primary" size="sm" className="gap-1">
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Link>
  );
}

// =============================================================================
// MOCK ENROLMENT CARD (fallback)
// =============================================================================

interface MockEnrolmentCardProps {
  courseId: string;
  courseTitle: string;
  moduleTitle: string;
  progress: number;
}

function MockEnrolmentCard({ courseId, courseTitle, moduleTitle, progress }: MockEnrolmentCardProps) {
  return (
    <Link
      href={`/learn/${courseId}`}
      className="flex items-center gap-4 rounded-lg border-2 border-amu-navy bg-amu-sky p-4 transition-shadow hover:shadow-lg"
    >
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-amu-navy/10">
        <BookOpen className="h-8 w-8 text-amu-navy" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-heading text-lg font-semibold text-amu-navy truncate">
          {courseTitle}
        </h3>
        <p className="mt-1 font-body text-sm text-amu-charcoal truncate">
          {moduleTitle}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-amu-navy transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-body text-xs text-amu-charcoal">{progress}%</span>
        </div>
      </div>

      <div className="flex-shrink-0">
        <Button variant="primary" size="sm" className="gap-1">
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Link>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function LearnPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // API state
  const [enrolments, setEnrolments] = React.useState<EnrolmentListItem[]>([]);
  const [stats, setStats] = React.useState<LearningStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [useMockData, setUseMockData] = React.useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/learn');
    }
  }, [user, authLoading, router]);

  // Fetch enrolments and stats
  React.useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [enrolmentsData, statsData] = await Promise.all([
          getEnrolments({ status: 'active' }),
          getLearningStats(),
        ]);

        setEnrolments(enrolmentsData);
        setStats(statsData);
        setUseMockData(false);
      } catch (err) {
        console.error('Failed to fetch learning data:', err);
        setError('Unable to load your courses from server.');
        setUseMockData(true);
        // Use mock stats
        setStats({
          total_courses: mockCourses.length,
          completed_courses: 0,
          active_courses: 1,
          total_hours: 8,
          competencies_achieved: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Image
            src={LOGO_ONLY}
            alt="Asset Management University - Develop Capability"
            width={40}
            height={40}
            className="mx-auto h-10 w-10 animate-pulse"
          />
          <p className="mt-4 font-body text-sm text-amu-charcoal">
            Loading your learning space...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasEnrolments = enrolments.length > 0 || useMockData;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* AMU Header - Navy Blue background, White text (Section 9.5) */}
      <header className="bg-amu-navy">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Image
              src={LOGO_WITH_SLOGAN_INVERTED}
              alt="Asset Management University - Develop Capability"
              width={200}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-body text-sm text-white/90">
              {user.displayName || user.email}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
              <span className="font-heading text-sm">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Light Sky Blue background */}
      <main className="flex flex-1 flex-col bg-amu-sky/20 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-7xl">
          {/* Identity Verification Banner for Tier 2 Users */}
          <VerifyIdentityBanner className="mb-6" />

          {/* Page Header */}
          <header className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-amu-navy md:text-3xl">
              My Learning
            </h1>
            <p className="mt-2 font-body text-base text-amu-charcoal">
              Continue your journey towards asset management mastery
            </p>
          </header>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <p className="font-body text-sm text-amber-800">{error}</p>
              </div>
            </div>
          )}

          {/* Learning Stats */}
          {loading ? (
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          ) : stats && (
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                icon={<BookOpen className="h-6 w-6" />}
                value={stats.active_courses}
                label="Active Courses"
              />
              <StatCard
                icon={<Trophy className="h-6 w-6" />}
                value={stats.completed_courses}
                label="Completed"
              />
              <StatCard
                icon={<Clock className="h-6 w-6" />}
                value={stats.total_hours}
                label="Hours Learned"
              />
              <StatCard
                icon={<Target className="h-6 w-6" />}
                value={stats.competencies_achieved}
                label="Competencies"
              />
            </div>
          )}

          {/* Active Enrolments Section */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold text-amu-navy">
                Continue Learning
              </h2>
              <Link href="/courses">
                <Button variant="outline" size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Browse Courses
                </Button>
              </Link>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <EnrolmentCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Enrolments List */}
            {!loading && hasEnrolments && (
              <div className="space-y-4">
                {useMockData ? (
                  // Show mock course as active enrolment
                  <MockEnrolmentCard
                    courseId="gfmam-311"
                    courseTitle="GFMAM 311: Foundations of Asset Management"
                    moduleTitle="Module 1: Introduction to Asset Management"
                    progress={15}
                  />
                ) : (
                  enrolments.map((enrolment) => (
                    <EnrolmentCard key={enrolment.enrolment_id} enrolment={enrolment} />
                  ))
                )}
              </div>
            )}

            {/* Empty State */}
            {!loading && !hasEnrolments && (
              <div className="rounded-lg border-2 border-dashed border-amu-slate/30 bg-white p-8 text-center">
                <GraduationCap className="mx-auto h-12 w-12 text-amu-slate" />
                <h3 className="mt-4 font-heading text-lg font-semibold text-amu-navy">
                  No Active Courses
                </h3>
                <p className="mt-2 font-body text-sm text-amu-charcoal">
                  Start your learning journey by enrolling in a course.
                </p>
                <Link href="/courses">
                  <Button variant="primary" className="mt-4">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            )}
          </section>

          {/* Completed Courses Section (if any) */}
          {!loading && stats && stats.completed_courses > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 font-heading text-xl font-semibold text-amu-navy">
                Completed Courses
              </h2>
              <p className="font-body text-sm text-amu-charcoal">
                You have completed {stats.completed_courses} course
                {stats.completed_courses !== 1 ? 's' : ''}. View your certificates in the{' '}
                <Link href="/certificates" className="text-amu-navy underline hover:no-underline">
                  Certificates
                </Link>{' '}
                section.
              </p>
            </section>
          )}
        </div>
      </main>

      {/* AMU Footer - Light Sky Blue background (Section 9.5) */}
      <footer className="amu-footer-bar">
        <p className="font-system text-amu-charcoal">
          You can. | assetmanagementuniversity.org
        </p>
      </footer>
    </div>
  );
}
