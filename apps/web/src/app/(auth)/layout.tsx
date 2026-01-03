import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LOGO_WITH_SLOGAN_INVERTED, LOGO_ONLY } from '@/lib/brand-assets';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* AMU Header - Navy Blue background, White text (Section 9.5) */}
      <header className="bg-amu-navy">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            {/* Logo with slogan (inverted for navy background) */}
            <Image
              src={LOGO_WITH_SLOGAN_INVERTED}
              alt="Asset Management University - Develop Capability"
              width={200}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>
      </header>

      {/* Main Content - White background with subtle highlight */}
      <main className="flex flex-1 items-center justify-center bg-amu-sky/30 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-amu-slate/20 bg-white p-8 shadow-sm">
            <Suspense fallback={<AuthLoadingSkeleton />}>
              {children}
            </Suspense>
          </div>
        </div>
      </main>

      {/* AMU Footer - Light Sky Blue background (Section 9.5) */}
      <footer className="amu-footer-bar">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-system text-amu-charcoal">
            You can. | assetmanagementuniversity.org
          </p>
          <p className="mt-1 text-xs text-amu-charcoal/70">
            &copy; {new Date().getFullYear()} Asset Management University. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function AuthLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Logo skeleton */}
      <div className="flex justify-center">
        <Image
          src={LOGO_ONLY}
          alt="Asset Management University - Develop Capability"
          width={40}
          height={40}
          className="h-10 w-10 animate-pulse opacity-50"
        />
      </div>
      <div className="space-y-2 text-center">
        <div className="mx-auto h-8 w-48 animate-pulse rounded bg-amu-sky" />
        <div className="mx-auto h-4 w-64 animate-pulse rounded bg-amu-sky/50" />
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-20 animate-pulse rounded bg-amu-sky" />
          <div className="h-10 w-full animate-pulse rounded bg-amu-sky/50" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-16 animate-pulse rounded bg-amu-sky" />
          <div className="h-10 w-full animate-pulse rounded bg-amu-sky/50" />
        </div>
        <div className="h-10 w-full animate-pulse rounded bg-amu-navy/20" />
      </div>
    </div>
  );
}
