'use client';

import { useAuth } from '@/components/auth';
import { ChatInterface } from '@/components/chat';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LOGO_WITH_SLOGAN_INVERTED, LOGO_ONLY } from '@/lib/brand-assets';
import { getCourseById } from '@/lib/mock-courses';
import { notFound } from 'next/navigation';

interface LearnCoursePageProps {
  params: {
    id: string;
  };
}

export default function LearnCoursePage({ params }: LearnCoursePageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const course = getCourseById(params.id);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/learn/${params.id}`);
    }
  }, [user, loading, router, params.id]);

  // Show 404 if course not found
  if (!course) {
    notFound();
  }

  if (loading) {
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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* AMU Header - Navy Blue background, White text (Section 9.5) */}
      <header className="bg-amu-navy">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            {/* Logo with slogan (inverted for navy background) */}
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
        <div className="mx-auto w-full max-w-4xl flex-1">
          {/* Back to Courses Button - Slate Blue accent border (Section 9.5) */}
          <Link
            href="/courses"
            className="mb-4 inline-flex items-center gap-2 rounded-md border border-amu-slate bg-white px-4 py-2 font-heading text-sm font-medium text-amu-charcoal transition-colors hover:border-amu-navy hover:bg-amu-sky/30"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>

          {/* Course Title - Navy Blue Montserrat 24pt (Section 9.3) */}
          <header className="mb-6">
            <p className="font-heading text-sm font-semibold text-amu-slate">
              {course.code}
            </p>
            <h1 className="font-heading text-2xl font-bold text-amu-navy md:text-3xl">
              {course.title}
            </h1>
            <p className="mt-1 font-body text-sm italic text-amu-slate">
              {course.tagline}
            </p>
          </header>

          {/* Course Context Card - Light Sky Blue highlight (Section 9.5) */}
          <div className="amu-highlight-subtle mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-medium text-amu-navy">
                  {course.code}: {course.title}
                </h2>
                <p className="font-body text-sm text-amu-charcoal">
                  {course.modules} modules · {course.duration} · {course.level}
                </p>
              </div>
              <div className="text-right">
                <div className="font-body text-sm font-medium text-amu-navy">
                  {course.progress || 0}% Complete
                </div>
                <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-amu-navy transition-all"
                    style={{ width: `${course.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface with Course-Specific Welcome Message */}
          <div className="h-[calc(100vh-380px)] min-h-[500px]">
            <ChatInterface
              type="learning"
              courseTitle={course.code}
              moduleTitle={course.title}
              welcomeMessage={course.welcomeMessage}
            />
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
