'use client';

import { useAuth } from '@/components/auth';
import { CourseListing } from '@/components/learning';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { LOGO_WITH_SLOGAN_INVERTED, LOGO_ONLY } from '@/lib/brand-assets';

export default function CoursesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/courses');
    }
  }, [user, loading, router]);

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
            Loading courses...
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

      {/* Main Content - Light Sky Blue background */}
      <main className="flex flex-1 flex-col bg-amu-sky/20 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <CourseListing />
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
