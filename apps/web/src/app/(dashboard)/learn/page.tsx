'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { ChatInterface } from '@/components/chat';
import { VerifyIdentityBanner } from '@/components/dashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { LOGO_WITH_SLOGAN_INVERTED, LOGO_ONLY } from '@/lib/brand-assets';

export default function LearnPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/learn');
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
          <p className="mt-4 font-body text-sm text-amu-charcoal">Loading your learning space...</p>
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
            <span className="font-body text-sm text-white/90">{user.displayName || user.email}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
              <span className="font-heading text-sm">{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - White background */}
      <main className="flex flex-1 flex-col bg-amu-sky/20 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-4xl flex-1">
          {/* Identity Verification Banner for Tier 2 Users */}
          <VerifyIdentityBanner className="mb-4" />

          {/* Course Context Card - Light Sky Blue highlight (Section 9.5) */}
          <div className="amu-highlight-subtle mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-medium text-amu-navy">
                  GFMAM Competency Framework (311)
                </h2>
                <p className="font-body text-sm text-amu-charcoal">
                  Module 1: Introduction to Asset Management
                </p>
              </div>
              <div className="text-right">
                <div className="font-body text-sm font-medium text-amu-navy">15% Complete</div>
                <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-[15%] rounded-full bg-amu-navy" />
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="h-[calc(100vh-280px)] min-h-[500px]">
            <ChatInterface
              type="learning"
              courseTitle="GFMAM 311"
              moduleTitle="Introduction to Asset Management"
              welcomeMessage="Welcome to your first module! I am here to guide you through the fundamentals of asset management.

Let us start by exploring what asset management means to you. In your experience, what comes to mind when you hear the term 'asset management'?"
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
