'use client';

/**
 * Verify Identity Banner - AMU Platform
 *
 * Displays a prominent banner for Tier 2 users (organisation-linked)
 * who haven't completed identity verification yet.
 *
 * Shown when:
 * - User is linked to an organisation (has company_id)
 * - User is NOT verified (verification_status !== 'verified')
 *
 * Section 5.4, 10.3 of the specification.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Shield,
  ArrowRight,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifyIdentityBannerProps {
  className?: string;
  dismissible?: boolean;
}

export function VerifyIdentityBanner({
  className,
  dismissible = true,
}: VerifyIdentityBannerProps) {
  const { userData, isOrganisationLinked, verificationStatus, userTier } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if dismissed
  if (dismissed) return null;

  // Don't show if not linked to organisation
  if (!isOrganisationLinked) return null;

  // Don't show if already Tier 3 (verified)
  if (userTier === 3) return null;

  // Different banner states based on verification status
  if (verificationStatus === 'pending') {
    return (
      <div
        className={cn(
          'relative rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 p-4 sm:p-6',
          className
        )}
      >
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-2 p-1 text-amber-600 hover:text-amber-800"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-200">
            <Clock className="h-6 w-6 text-amber-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg font-semibold text-amber-800">
              Identity Verification Pending
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              Your documents are being reviewed. This typically takes 1-2 business days.
              You can continue learning in the meantime.
            </p>
            <div className="mt-3 flex items-center gap-4">
              <Link
                href="/settings/identity"
                className="inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-900"
              >
                View Status
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'rejected') {
    return (
      <div
        className={cn(
          'relative rounded-lg bg-gradient-to-r from-red-50 to-red-100 border border-red-200 p-4 sm:p-6',
          className
        )}
      >
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-2 p-1 text-red-600 hover:text-red-800"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-200">
            <AlertCircle className="h-6 w-6 text-red-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg font-semibold text-red-800">
              Identity Verification Failed
            </h3>
            <p className="mt-1 text-sm text-red-700">
              Your verification was not approved. Please review the feedback and resubmit
              your documents to unlock official certificates.
            </p>
            <div className="mt-3">
              <Link
                href="/settings/identity"
                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Resubmit Verification
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Not yet started (none)
  return (
    <div
      className={cn(
        'relative rounded-lg bg-gradient-to-r from-amu-navy to-amu-navy/90 p-4 sm:p-6 text-white overflow-hidden',
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-2 p-1 text-white/60 hover:text-white"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Icon */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20">
          <Shield className="h-7 w-7" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-white/70" />
            <span className="text-sm text-white/70">
              {userData?.user_company_id ? 'Organisation Member' : 'Tier 2 User'}
            </span>
          </div>
          <h3 className="font-heading text-lg font-semibold">
            Verify Your Identity
          </h3>
          <p className="mt-1 text-sm text-white/80">
            Complete identity verification to unlock official SETA-recognised certificates
            and enable your employer to claim Skills Development Act tax rebates.
          </p>
        </div>

        {/* CTA */}
        <div className="sm:shrink-0">
          <Link
            href="/settings/identity"
            className="inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-amu-navy transition-all hover:bg-amu-sky"
          >
            <Shield className="mr-2 h-4 w-4" />
            Verify Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Benefits list */}
      <div className="relative mt-4 grid gap-2 sm:grid-cols-3">
        {[
          'Official SETA certificates',
          'Tax rebates for employer',
          'National qualifications record',
        ].map((benefit, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-white/80">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-400" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
