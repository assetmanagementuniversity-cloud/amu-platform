'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { mockCourses, type Course } from '@/lib/mock-courses';
import {
  Clock,
  BookOpen,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  onEnrol?: (courseId: string) => void;
}

// Course Card with Strong Emphasis styling (Section 9.5)
// Sky Blue background (#D9E6F2) with Navy Blue border (#0A2F5C)
function CourseCard({ course, onEnrol }: CourseCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const levelColours: Record<Course['level'], string> = {
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
        <p className="mt-1 font-body text-sm italic text-amu-slate">
          {course.tagline}
        </p>
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

        {/* Prerequisites (if any) */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="mb-4 rounded-md bg-amber-50 px-3 py-2">
            <p className="font-body text-xs text-amber-800">
              <span className="font-semibold">Prerequisites:</span>{' '}
              {course.prerequisites.join(', ')}
            </p>
          </div>
        )}

        {/* Learning Outcomes - Expandable */}
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

interface CourseListingProps {
  title?: string;
  subtitle?: string;
  courses?: Course[];
  onEnrol?: (courseId: string) => void;
  showFilters?: boolean;
}

// Main CourseListing component
export function CourseListing({
  title = 'Course Enrolment',
  subtitle = 'Develop your asset management capability with our comprehensive courses',
  courses = mockCourses,
  onEnrol,
  showFilters = true,
}: CourseListingProps) {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = React.useState<string>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  // Get unique categories from courses
  const categories = React.useMemo(() => {
    return ['all', ...new Set(courses.map((c) => c.category))];
  }, [courses]);

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

  return (
    <section className="w-full">
      {/* Page Header - Montserrat 24pt title style (Section 9.3) */}
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-amu-navy md:text-3xl">
          {title}
        </h1>
        <p className="mt-2 font-body text-base text-amu-charcoal">{subtitle}</p>
      </header>

      {/* Filters */}
      {showFilters && (
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

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} onEnrol={handleEnrol} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-amu-slate/30 bg-amu-sky/30 p-8 text-center">
          <p className="font-body text-amu-charcoal">
            No courses match your selected filters. Please adjust your criteria.
          </p>
        </div>
      )}
    </section>
  );
}

// Named exports for flexibility
export { CourseCard };
export type { CourseListingProps, CourseCardProps };
