'use client';

/**
 * CompetencyProgress - Sidebar component showing learner's progress
 *
 * Features:
 * - Real-time updates via Firestore listener
 * - Visual status indicators (not_yet, developing, competent)
 * - Programme Progress header (UK English)
 * - AMU brand colours: Navy Blue (#0A2F5C), Sky Blue (#D9E6F2)
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useEnrolmentProgress, CompetencyStatus } from '@/hooks/use-enrolment-progress';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface CompetencyItem {
  id: string;
  title: string;
}

interface CompetencyProgressProps {
  enrolmentId: string;
  competencies: CompetencyItem[];
  className?: string;
}

/**
 * Status indicator component
 */
function StatusIndicator({ status }: { status: CompetencyStatus }) {
  switch (status) {
    case 'competent':
      return (
        <span className="flex items-center gap-1.5 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs font-medium">Competent</span>
        </span>
      );
    case 'developing':
      return (
        <span className="flex items-center gap-1.5 text-amber-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs font-medium">Developing</span>
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1.5 text-amu-slate">
          <Circle className="h-4 w-4" />
          <span className="text-xs font-medium">Not Started</span>
        </span>
      );
  }
}

export function CompetencyProgress({
  enrolmentId,
  competencies,
  className,
}: CompetencyProgressProps) {
  const { progress, loading, error, getCompetencyStatus } = useEnrolmentProgress(enrolmentId);

  // Calculate overall progress
  const achievedCount = progress?.competenciesAchieved.length || 0;
  const totalCount = competencies.length;
  const progressPercentage = totalCount > 0 ? Math.round((achievedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className={cn('rounded-lg border border-amu-sky bg-white p-4', className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-amu-navy" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('rounded-lg border border-red-200 bg-red-50 p-4', className)}>
        <p className="text-sm text-red-600">Error loading progress</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-amu-sky bg-white', className)}>
      {/* Header */}
      <div className="border-b border-amu-sky bg-amu-sky/30 px-4 py-3">
        <h3 className="font-heading text-sm font-semibold text-amu-navy">
          Programme Progress
        </h3>
      </div>

      {/* Progress bar */}
      <div className="border-b border-amu-sky px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-body text-xs text-amu-slate">
            {achievedCount} of {totalCount} competencies
          </span>
          <span className="font-heading text-sm font-semibold text-amu-navy">
            {progressPercentage}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-amu-sky">
          <div
            className="h-full rounded-full bg-amu-navy transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Competency list */}
      <div className="divide-y divide-amu-sky/50">
        {competencies.map((competency) => {
          const status = getCompetencyStatus(competency.id);
          const isActive = progress?.currentCompetencyId === competency.id;

          return (
            <div
              key={competency.id}
              className={cn(
                'px-4 py-3 transition-colors',
                isActive && 'bg-amu-sky/20',
                status === 'competent' && 'bg-emerald-50/50'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p
                  className={cn(
                    'font-body text-sm',
                    status === 'competent' ? 'text-amu-charcoal' : 'text-amu-slate',
                    isActive && 'font-medium text-amu-navy'
                  )}
                >
                  {competency.title}
                </p>
                <StatusIndicator status={status} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion message */}
      {progressPercentage === 100 && (
        <div className="border-t border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-center font-heading text-sm font-semibold text-emerald-700">
            Module Complete!
          </p>
        </div>
      )}
    </div>
  );
}
