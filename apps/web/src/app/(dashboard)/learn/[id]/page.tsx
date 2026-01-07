'use client';

import * as React from 'react';
import { useAuth } from '@/components/auth';
import { ChatInterface } from '@/components/chat';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Target, AlertCircle, Loader2 } from 'lucide-react';
import { LOGO_WITH_SLOGAN_INVERTED, LOGO_ONLY } from '@/lib/brand-assets';
import { getCourseById, type Course as MockCourse } from '@/lib/mock-courses';
import {
  getCourse,
  getActiveEnrolment,
  enrollInCourse,
  getEnrolmentProgress,
  type Course,
  type Enrolment,
  type ModuleProgress,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LearnCoursePageProps {
  params: {
    id: string;
  };
}

// =============================================================================
// LOADING STATE
// =============================================================================

function LoadingState() {
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

// =============================================================================
// ERROR STATE
// =============================================================================

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-amu-sky/20">
      <div className="max-w-md rounded-lg border border-red-200 bg-white p-8 text-center shadow-lg">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 font-heading text-xl font-semibold text-amu-navy">
          Unable to Load Course
        </h2>
        <p className="mt-2 font-body text-sm text-amu-charcoal">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/courses">
            <Button variant="outline">Back to Courses</Button>
          </Link>
          {onRetry && (
            <Button variant="primary" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MODULE LIST
// =============================================================================

interface ModuleListProps {
  modules: ModuleProgress[];
  currentModuleId?: string;
  onSelectModule: (moduleId: string) => void;
}

function ModuleList({ modules, currentModuleId, onSelectModule }: ModuleListProps) {
  const statusColors = {
    not_started: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-amber-100 text-amber-800',
    completed: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <div className="space-y-2">
      <h3 className="font-heading text-sm font-semibold text-amu-navy">Modules</h3>
      {modules.map((module) => (
        <button
          key={module.module_id}
          onClick={() => onSelectModule(module.module_id)}
          className={cn(
            'w-full rounded-md border p-3 text-left transition-colors',
            currentModuleId === module.module_id
              ? 'border-amu-navy bg-amu-sky'
              : 'border-amu-slate/30 bg-white hover:bg-amu-sky/30'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-body text-sm font-medium text-amu-navy">
              {module.module_title}
            </span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs',
                statusColors[module.status]
              )}
            >
              {module.status.replace('_', ' ')}
            </span>
          </div>
          {module.competencies.length > 0 && (
            <div className="mt-1 flex items-center gap-1 text-xs text-amu-charcoal">
              <Target className="h-3 w-3" />
              {module.competencies.filter((c) => c.level === 'competent').length}/
              {module.competencies.length} competencies
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function LearnCoursePage({ params }: LearnCoursePageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [course, setCourse] = React.useState<Course | null>(null);
  const [mockCourse, setMockCourse] = React.useState<MockCourse | null>(null);
  const [enrolment, setEnrolment] = React.useState<Enrolment | null>(null);
  const [modules, setModules] = React.useState<ModuleProgress[]>([]);
  const [currentModuleId, setCurrentModuleId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [enrolling, setEnrolling] = React.useState(false);
  const [useMockData, setUseMockData] = React.useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/learn/${params.id}`);
    }
  }, [user, authLoading, router, params.id]);

  // Fetch course and enrolment data
  React.useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch from API first
        const [courseData, enrolmentData] = await Promise.all([
          getCourse(params.id),
          getActiveEnrolment(params.id),
        ]);

        setCourse(courseData);
        setEnrolment(enrolmentData);

        // If enrolled, fetch progress
        if (enrolmentData) {
          const progress = await getEnrolmentProgress(enrolmentData.enrolment_id);
          setModules(progress);

          // Set current module
          if (enrolmentData.current_module_id) {
            setCurrentModuleId(enrolmentData.current_module_id);
          } else if (progress.length > 0) {
            // Default to first incomplete module
            const incompleteModule = progress.find((m) => m.status !== 'completed');
            setCurrentModuleId(incompleteModule?.module_id || progress[0].module_id);
          }
        }

        setUseMockData(false);
      } catch (err) {
        console.error('Failed to fetch course data:', err);

        // Fallback to mock data
        const mockData = getCourseById(params.id);
        if (mockData) {
          setMockCourse(mockData);
          setUseMockData(true);
          setError(null);
        } else {
          setError('Course not found. Please check the URL and try again.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, params.id]);

  // Handle enrolment
  const handleEnrol = async () => {
    if (!user) return;

    setEnrolling(true);
    try {
      const newEnrolment = await enrollInCourse(params.id);
      setEnrolment(newEnrolment);

      // Fetch progress for new enrolment
      const progress = await getEnrolmentProgress(newEnrolment.enrolment_id);
      setModules(progress);

      if (progress.length > 0) {
        setCurrentModuleId(progress[0].module_id);
      }
    } catch (err) {
      console.error('Failed to enrol:', err);
      setError('Failed to enrol in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  // Handle module selection
  const handleSelectModule = (moduleId: string) => {
    setCurrentModuleId(moduleId);
  };

  // Retry handler
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  // Calculate overall progress
  const overallProgress = React.useMemo(() => {
    if (enrolment) {
      return Math.round(
        modules.reduce((acc, m) => {
          if (m.status === 'completed') return acc + 100;
          if (m.status === 'in_progress') return acc + 50;
          return acc;
        }, 0) / Math.max(modules.length, 1)
      );
    }
    return mockCourse?.progress || 0;
  }, [enrolment, modules, mockCourse]);

  // Get current module
  const currentModule = modules.find((m) => m.module_id === currentModuleId);

  // Loading state
  if (authLoading || loading) {
    return <LoadingState />;
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Error state (no fallback available)
  if (error && !useMockData) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  // Determine display data
  const displayCourse = course || mockCourse;
  if (!displayCourse) {
    return <ErrorState message="Course not found." />;
  }

  // Get display values
  const courseCode = course ? `NQF ${course.course_nqf_level}` : mockCourse?.code || '';
  const courseTitle = course?.course_title || mockCourse?.title || '';
  const courseTagline = mockCourse?.tagline;
  const courseModulesCount = course?.course_modules?.length || mockCourse?.modules || 0;
  const courseDuration = course
    ? `${course.course_duration_hours} hours`
    : mockCourse?.duration || '';
  const courseLevel = mockCourse?.level || 'Intermediate';
  const welcomeMessage =
    mockCourse?.welcomeMessage ||
    `Welcome to ${courseTitle}. I am here to guide you through this module.\n\nLet us begin our exploration. What aspects of this topic are you most interested in learning about?`;

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

      {/* Main Content - White background */}
      <main className="flex flex-1 flex-col bg-amu-sky/20 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-7xl flex-1">
          {/* Back to Courses Button */}
          <Link
            href="/learn"
            className="mb-4 inline-flex items-center gap-2 rounded-md border border-amu-slate bg-white px-4 py-2 font-heading text-sm font-medium text-amu-charcoal transition-colors hover:border-amu-navy hover:bg-amu-sky/30"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Learning
          </Link>

          {/* Error Banner (non-blocking) */}
          {error && useMockData && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="font-body text-sm text-amber-800">
                Unable to connect to server. Showing demo content.
              </p>
            </div>
          )}

          {/* Course Title */}
          <header className="mb-6">
            <p className="font-heading text-sm font-semibold text-amu-slate">{courseCode}</p>
            <h1 className="font-heading text-2xl font-bold text-amu-navy md:text-3xl">
              {courseTitle}
            </h1>
            {courseTagline && (
              <p className="mt-1 font-body text-sm italic text-amu-slate">{courseTagline}</p>
            )}
          </header>

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Sidebar - Module List (desktop) */}
            {(enrolment || useMockData) && modules.length > 0 && (
              <aside className="hidden w-64 flex-shrink-0 lg:block">
                <div className="sticky top-4 rounded-lg border border-amu-slate/30 bg-white p-4">
                  <ModuleList
                    modules={modules}
                    currentModuleId={currentModuleId || undefined}
                    onSelectModule={handleSelectModule}
                  />
                </div>
              </aside>
            )}

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Course Context Card */}
              <div className="amu-highlight-subtle mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading font-medium text-amu-navy">
                      {courseCode}: {courseTitle}
                    </h2>
                    <p className="font-body text-sm text-amu-charcoal">
                      {courseModulesCount} modules · {courseDuration} · {courseLevel}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-body text-sm font-medium text-amu-navy">
                      {overallProgress}% Complete
                    </div>
                    <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-amu-navy transition-all"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Module Info */}
              {currentModule && (
                <div className="mb-4 rounded-md border border-amu-slate/30 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-amu-navy" />
                    <span className="font-heading text-sm font-medium text-amu-navy">
                      {currentModule.module_title}
                    </span>
                  </div>
                  {currentModule.competencies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {currentModule.competencies.map((comp) => (
                        <span
                          key={comp.competency_id}
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs',
                            comp.level === 'competent'
                              ? 'bg-emerald-100 text-emerald-800'
                              : comp.level === 'developing'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {comp.competency_title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Enrolment Required State */}
              {!enrolment && !useMockData && (
                <div className="rounded-lg border-2 border-dashed border-amu-navy/30 bg-white p-8 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-amu-navy/50" />
                  <h3 className="mt-4 font-heading text-lg font-semibold text-amu-navy">
                    Ready to Begin?
                  </h3>
                  <p className="mt-2 font-body text-sm text-amu-charcoal">
                    Enrol in this course to start your learning journey.
                  </p>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={handleEnrol}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      'Enrol Now'
                    )}
                  </Button>
                </div>
              )}

              {/* Chat Interface */}
              {(enrolment || useMockData) && (
                <div className="h-[calc(100vh-480px)] min-h-[400px]">
                  <ChatInterface
                    type="learning"
                    courseTitle={courseCode}
                    moduleTitle={currentModule?.module_title || courseTitle}
                    welcomeMessage={welcomeMessage}
                  />
                </div>
              )}
            </div>
          </div>
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
