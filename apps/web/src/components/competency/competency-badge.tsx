'use client';

/**
 * CompetencyBadge - Visual indicator for competency achievement
 *
 * Displays a celebratory badge when a learner achieves a competency milestone.
 * Uses AMU brand colours: Navy Blue (#0A2F5C) and Sky Blue (#D9E6F2)
 *
 * Features:
 * - Animated entrance when milestone is achieved
 * - Dismissable with callback
 * - Shows competency title and category
 */

import * as React from 'react';
import { X, Award, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCompetencyCategory } from '@/lib/competency';

interface CompetencyBadgeProps {
  competencyId: string;
  competencyTitle: string;
  isVisible: boolean;
  onDismiss: () => void;
  className?: string;
}

export function CompetencyBadge({
  competencyId,
  competencyTitle,
  isVisible,
  onDismiss,
  className,
}: CompetencyBadgeProps) {
  const category = getCompetencyCategory(competencyId);

  // Auto-dismiss after 8 seconds
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
        'animate-in fade-in duration-300',
        className
      )}
      onClick={onDismiss}
    >
      <div
        className={cn(
          'relative mx-4 max-w-md rounded-xl border-2 border-amu-navy bg-white p-8 shadow-2xl',
          'animate-in zoom-in-95 duration-500'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="absolute right-4 top-4 rounded-full p-1 text-amu-slate hover:bg-amu-sky hover:text-amu-navy"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Badge content */}
        <div className="text-center">
          {/* Award icon with animation */}
          <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-amu-sky opacity-75" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-amu-navy">
              <Award className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Celebration text */}
          <h2 className="mb-2 font-heading text-2xl font-bold text-amu-navy">
            Competency Achieved!
          </h2>

          <div className="mb-4 flex items-center justify-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-heading text-sm font-semibold uppercase tracking-wide">
              Mastery Confirmed
            </span>
          </div>

          {/* Competency details */}
          <div className="rounded-lg bg-amu-sky p-4">
            <p className="mb-1 font-body text-xs uppercase tracking-wide text-amu-slate">
              {category}
            </p>
            <p className="font-heading text-lg font-semibold text-amu-navy">
              {competencyTitle}
            </p>
          </div>

          {/* Encouragement message */}
          <p className="mt-4 font-body text-sm text-amu-charcoal">
            Your understanding has been recorded. Keep building your capability!
          </p>

          {/* Continue button */}
          <button
            onClick={onDismiss}
            className="mt-6 w-full rounded-md bg-amu-navy px-6 py-3 font-heading text-sm font-medium text-white transition-colors hover:bg-[#153e70]"
          >
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}
