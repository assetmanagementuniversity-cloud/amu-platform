'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { mockCourses, type Course as MockCourse } from '@/lib/mock-courses';
import { getCourses, getCourseCategories, type CourseListItem } from '@/lib/api';
import {
  Clock,
  BookOpen,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Target,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

// Unified course type for display (works with both API and mock data)
interface DisplayCourse {
  id: string;
  code: string;
  title: string;
  tagline?: string;
  overview: string;
  duration: string;
  modules: number;
  level: 'Foundation' | 'Intermediate' | 'Advanced';
  category: string;
  prerequisites?: string[];
  learningOutcomes: string[];
  thumbnailUrl?: string;
  nqfLevel?: number;
  credits?: number;
}

interface CourseCardProps {
  course: DisplayCourse;
  onEnrol?: (courseId: string) => void;
}

interface CourseListingProps {
  title?: string;
  subtitle?: string;
  courses?: DisplayCourse[];
  onEnrol?: (courseId: string) => void;
  showFilters?: boolean;
  useMockData?: boolean;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Convert API course to display format
 */
function apiCourseToDisplay(course: CourseListItem): DisplayCourse {
  // Map NQF level to display level
  let level: 'Foundation' | 'Intermediate' | 'Advanced' = 'Foundation';
  if (course.course_nqf_level >= 6) {
    level = 'Advanced';
  } else if (course.course_nqf_level >= 5) {
    level = 'Intermediate';
  }

  return {
    id: course.course_id,
    code: `NQF ${course.course_nqf_level}`,
    title: course.course_title,
    overview: course.course_description,
    duration: `${course.course_duration_hours} hours`,
    modules: course.course_module_count,
    level,
    category: course.course_category,
    thumbnailUrl: course.course_thumbnail_url,
    nqfLevel: course.course_nqf_level,
    credits: course.course_credits,
    learningOutcomes: [], // Not available in list view
  };
}

/**
 * Convert mock course to display format
 */
function mockCourseToDisplay(course: MockCourse): DisplayCourse {
  return {
    id: course.id,
    code: course.code,
    title: course.title,
    tagline: course.tagline,
    overview: course.overview,
    duration: course.duration,
    modules: course.modules,
    level: course.level,
    category: course.category,
    prerequisites: course.prerequisites,
    learningOutcomes: course.learningOutcomes,
  };
}

// =============================================================================
// COURSE CARD COMPONENT
// =============================================================================

// Course Card with Strong Emphasis styling (Section 9.5)
// Sky Blue background (#D9E6F2) with Navy Blue border (#0A2F5C)
function CourseCard({ course, onEnrol }: CourseCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const levelColours: Record<DisplayCourse['level'], string> = {
    Foundation: 'bg-emerald-100 text-emerald-800',
    Intermediate: 'bg-amber-100 text-amber-800',
    Advanced: 'bg-purple-100 text-purple-800',
  };

  return (
    <article
      className={cn(
        // Strong Emphasis highlight box style (Section 9.5)
        'flex flex-col rounded-lg border-2 border-amu-navy bg-amu-sky',
        'transition-shadow duration-200 hover:shadow-lg'
      )}
    >
      {/* Course Header */}
      <header className="p-6 pb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-heading text-sm font-semibold text-amu-navy">
            {course.code}
          </span>
          <span
            className={cn(
              'rounded-full px-3 py-1 font-body text-xs font-medium',
              levelColours[course.level]
            )}
          >
            {course.level}
          </span>
        </div>
        <h3 className="font-heading text-lg font-semibold text-amu-navy">
          {course.title}
        </h3>
        {/* Tagline - Empowering, warm brand voice (Section 9.6) */}
        {course.tagline && (
          <p className="mt-1 font-body text-sm italic text-amu-slate">
            {course.tagline}
          </p>
        )}
      </header>

      {/* Course Overview - Evidence-based (Section 9.7) */}
      <div className="flex-1 px-6">
        <p className="mb-4 font-body text-sm leading-relaxed text-amu-charcoal">
          {course.overview}
        </p>

        {/* Course Metadata */}
        <div className="mb-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-amu-charcoal">
            <Clock className="h-4 w-4 text-amu-slate" />
            <span className="font-body">{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amu-charcoal">
            <BookOpen className="h-4 w-4 text-amu-slate" />
            <span className="font-body">{course.modules} modules</span>
          </div>
          <div className="flex items-center gap-1.5 text-amu-charcoal">
            <GraduationCap className="h-4 w-4 text-amu-slate" />
            <span className="font-body">{course.category}</span>
          </div>
        </div>

        {/* NQF Level and Credits (if available from API) */}
        {(course.nqfLevel || course.credits) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {course.nqfLevel && (
              <span className="rounded-full bg-amu-navy/10 px-3 py-1 font-body text-xs text-amu-navy">
                NQF Level {course.nqfLevel}
              </span>
            )}
            {course.credits && (
              <span className="rounded-full bg-amu-navy/10 px-3 py-1 font-body text-xs text-amu-navy">
                {course.credits} Credits
              </span>
            )}
          </div>
        )}

        {/* Prerequisites (if any) */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="mb-4 rounded-md bg-amber-50 px-3 py-2">
            <p className="font-body text-xs text-amber-800">
              <span className="font-semibold">Prerequisites:</span>{' '}
              {course.prerequisites.join(', ')}
            </p>
          </div>
        )}

        {/* Learning Outcomes - Expandable (only show if available) */}
        {course.learningOutcomes.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex w-full items-center justify-between rounded-md bg-white/60 px-3 py-2 transition-colors hover:bg-white/80"
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amu-navy" />
                <span className="font-heading text-xs font-semibold uppercase tracking-wide text-amu-navy">
                  Learning Outcomes ({course.learningOutcomes.length})
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-amu-navy" />
              ) : (
                <ChevronDown className="h-4 w-4 text-amu-navy" />
              )}
            </button>

            {/* Collapsed preview - show first 3 */}
            {!isExpanded && (
              <ul className="mt-2 space-y-1 px-1">
                {course.learningOutcomes.slice(0, 3).map((outcome, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 font-body text-xs text-amu-charcoal"
                  >
                    <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-amu-navy" />
                    <span className="line-clamp-1">{outcome}</span>
                  </li>
                ))}
                {course.learningOutcomes.length > 3 && (
                  <li className="pl-5 font-body text-xs text-amu-slate">
                    +{course.learningOutcomes.length - 3} more...
                  </li>
                )}
              </ul>
            )}

            {/* Expanded - show all outcomes */}
            {isExpanded && (
              <div className="mt-2 rounded-md bg-white/60 p-3">
                <ul className="space-y-2">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 font-body text-xs text-amu-charcoal"
                    >
                      <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-amu-navy" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enrol Button - Navy Blue interactive styling */}
      <div className="p-6 pt-2">
        <Button
          onClick={() => onEnrol?.(course.id)}
          className="w-full"
          variant="primary"
        >
          Enrol Now
        </Button>
      </div>
    </article>
  );
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function CourseCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border-2 border-amu-slate/30 bg-amu-sky/50 animate-pulse">
      <div className="p-6 pb-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-4 w-20 rounded bg-amu-slate/30" />
          <div className="h-6 w-24 rounded-full bg-amu-slate/30" />
        </div>
        <div className="h-6 w-3/4 rounded bg-amu-slate/30" />
        <div className="mt-2 h-4 w-full rounded bg-amu-slate/20" />
      </div>
      <div className="flex-1 px-6">
        <div className="mb-4 space-y-2">
          <div className="h-4 w-full rounded bg-amu-slate/20" />
          <div className="h-4 w-5/6 rounded bg-amu-slate/20" />
          <div className="h-4 w-4/6 rounded bg-amu-slate/20" />
        </div>
        <div className="mb-4 flex gap-4">
          <div className="h-4 w-20 rounded bg-amu-slate/20" />
          <div className="h-4 w-24 rounded bg-amu-slate/20" />
          <div className="h-4 w-28 rounded bg-amu-slate/20" />
        </div>
      </div>
      <div className="p-6 pt-2">
        <div className="h-10 w-full rounded bg-amu-slate/30" />
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
    <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
      <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
      <h3 className="mt-4 font-heading text-lg font-semibold text-red-800">
        Unable to Load Courses
      </h3>
      <p className="mt-2 font-body text-sm text-red-600">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="mt-4"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COURSE LISTING COMPONENT
// =============================================================================

export function CourseListing({
  title = 'Course Enrolment',
  subtitle = 'Develop your asset management capability with our comprehensive courses',
  courses: propCourses,
  onEnrol,
  showFilters = true,
  useMockData = false,
}: CourseListingProps) {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = React.useState<string>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  // API state
  const [courses, setCourses] = React.useState<DisplayCourse[]>([]);
  const [categories, setCategories] = React.useState<string[]>(['all']);
  const [loading, setLoading] = React.useState(!propCourses && !useMockData);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch courses from API
  React.useEffect(() => {
    // Skip if courses provided via props or using mock data
    if (propCourses || useMockData) {
      if (propCourses) {
        setCourses(propCourses);
        setCategories(['all', ...new Set(propCourses.map((c) => c.category))]);
      } else {
        const mockDisplayCourses = mockCourses.map(mockCourseToDisplay);
        setCourses(mockDisplayCourses);
        setCategories(['all', ...new Set(mockDisplayCourses.map((c) => c.category))]);
      }
      setLoading(false);
      return;
    }

    async function fetchCourses() {
      setLoading(true);
      setError(null);

      try {
        // Fetch courses and categories in parallel
        const [coursesData, categoriesData] = await Promise.all([
          getCourses(),
          getCourseCategories().catch(() => [] as string[]),
        ]);

        const displayCourses = coursesData.map(apiCourseToDisplay);
        setCourses(displayCourses);
        setCategories(['all', ...categoriesData]);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        // Fallback to mock data on error
        const mockDisplayCourses = mockCourses.map(mockCourseToDisplay);
        setCourses(mockDisplayCourses);
        setCategories(['all', ...new Set(mockDisplayCourses.map((c) => c.category))]);
        setError('Unable to load courses from server. Showing sample courses.');
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [propCourses, useMockData]);

  // Filter courses based on selections
  const filteredCourses = React.useMemo(() => {
    return courses.filter((course) => {
      const levelMatch = selectedLevel === 'all' || course.level === selectedLevel;
      const categoryMatch =
        selectedCategory === 'all' || course.category === selectedCategory;
      return levelMatch && categoryMatch;
    });
  }, [courses, selectedLevel, selectedCategory]);

  const handleEnrol = (courseId: string) => {
    if (onEnrol) {
      onEnrol(courseId);
    } else {
      // Default behaviour - navigate to the learning page for this course
      router.push(`/learn/${courseId}`);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Trigger re-fetch by updating a dependency
    window.location.reload();
  };

  return (
    <section className="w-full">
      {/* Page Header - Montserrat 24pt title style (Section 9.3) */}
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-amu-navy md:text-3xl">
          {title}
        </h1>
        <p className="mt-2 font-body text-base text-amu-charcoal">{subtitle}</p>
      </header>

      {/* Error Banner (non-blocking) */}
      {error && !loading && (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="font-body text-sm text-amber-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      {showFilters && !loading && (
        <div className="mb-6 flex flex-wrap gap-4">
          {/* Level Filter */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="level-filter"
              className="font-heading text-xs font-medium text-amu-charcoal"
            >
              Level
            </label>
            <select
              id="level-filter"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-md border border-amu-slate bg-white px-3 py-2 font-body text-sm text-amu-charcoal focus:border-amu-navy focus:outline-none focus:ring-2 focus:ring-amu-navy/20"
            >
              <option value="all">All Levels</option>
              <option value="Foundation">Foundation</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="category-filter"
              className="font-heading text-xs font-medium text-amu-charcoal"
            >
              Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border border-amu-slate bg-white px-3 py-2 font-body text-sm text-amu-charcoal focus:border-amu-navy focus:outline-none focus:ring-2 focus:ring-amu-navy/20"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <p className="pb-2 font-body text-sm text-amu-slate">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}{' '}
              available
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Course Grid */}
      {!loading && filteredCourses.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} onEnrol={handleEnrol} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCourses.length === 0 && courses.length > 0 && (
        <div className="rounded-lg border border-amu-slate/30 bg-amu-sky/30 p-8 text-center">
          <p className="font-body text-amu-charcoal">
            No courses match your selected filters. Please adjust your criteria.
          </p>
        </div>
      )}

      {/* No courses at all */}
      {!loading && courses.length === 0 && !error && (
        <div className="rounded-lg border border-amu-slate/30 bg-amu-sky/30 p-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-amu-slate" />
          <h3 className="mt-4 font-heading text-lg font-semibold text-amu-navy">
            No Courses Available
          </h3>
          <p className="mt-2 font-body text-sm text-amu-charcoal">
            Check back soon for new courses.
          </p>
        </div>
      )}
    </section>
  );
}

// Named exports for flexibility
export { CourseCard, CourseCardSkeleton };
export type { CourseListingProps, CourseCardProps, DisplayCourse };
