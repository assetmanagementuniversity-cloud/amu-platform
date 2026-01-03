'use client';

/**
 * useEnrolmentProgress - Real-time Firestore listener for enrolment progress
 *
 * Provides:
 * - Live progress percentage updates
 * - Competency achievement status (not_yet, developing, competent)
 * - Module completion tracking
 * - Course completion detection
 */

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export interface CompetencyAchievement {
  competency_id: string;
  competency_title: string;
  achieved_date: Date;
  achievement_level: 'competent';
  evidence_conversation_id: string;
}

export type CompetencyStatus = 'not_yet' | 'developing' | 'competent';
export type EnrolmentStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export interface EnrolmentProgress {
  enrolmentId: string;
  courseId: string;
  status: EnrolmentStatus;
  progressPercentage: number;
  currentModuleId: string;
  currentModuleTitle: string;
  modulesCompleted: string[];
  competenciesAchieved: CompetencyAchievement[];
  currentCompetencyId?: string;
  currentCompetencyStatus?: CompetencyStatus;
  certificateGenerated: boolean;
  certificateId?: string;
  lastActivityDate: Date;
}

export interface UseEnrolmentProgressReturn {
  progress: EnrolmentProgress | null;
  loading: boolean;
  error: string | null;
  isCompetent: (competencyId: string) => boolean;
  isDeveloping: (competencyId: string) => boolean;
  getCompetencyStatus: (competencyId: string) => CompetencyStatus;
  refresh: () => void;
}

/**
 * Hook for real-time enrolment progress updates
 */
export function useEnrolmentProgress(
  enrolmentId: string | undefined
): UseEnrolmentProgressReturn {
  const [progress, setProgress] = useState<EnrolmentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!enrolmentId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const enrolmentRef = doc(db, 'enrolments', enrolmentId);

    // Set up real-time listener
    const unsubscribe: Unsubscribe = onSnapshot(
      enrolmentRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setProgress({
            enrolmentId: snapshot.id,
            courseId: data.enrolment_course_id,
            status: data.enrolment_status,
            progressPercentage: data.enrolment_progress_percentage || 0,
            currentModuleId: data.enrolment_current_module_id,
            currentModuleTitle: data.enrolment_current_module_title,
            modulesCompleted: data.enrolment_modules_completed || [],
            competenciesAchieved: (data.enrolment_competencies_achieved || []).map(
              (a: CompetencyAchievement) => ({
                ...a,
                achieved_date:
                  a.achieved_date instanceof Date
                    ? a.achieved_date
                    : new Date(a.achieved_date),
              })
            ),
            currentCompetencyId: data.enrolment_current_competency_id,
            currentCompetencyStatus: data.enrolment_current_competency_status,
            certificateGenerated: data.enrolment_certificate_generated || false,
            certificateId: data.enrolment_certificate_id,
            lastActivityDate: data.enrolment_last_activity_date?.toDate() || new Date(),
          });
          setError(null);
        } else {
          setProgress(null);
          setError('Enrolment not found');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to enrolment:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [enrolmentId, refreshTrigger]);

  /**
   * Check if a specific competency has been achieved
   */
  const isCompetent = useCallback(
    (competencyId: string): boolean => {
      if (!progress) return false;
      return progress.competenciesAchieved.some(
        (a) => a.competency_id === competencyId
      );
    },
    [progress]
  );

  /**
   * Check if a specific competency is in developing status
   */
  const isDeveloping = useCallback(
    (competencyId: string): boolean => {
      if (!progress) return false;
      if (isCompetent(competencyId)) return false;
      return (
        progress.currentCompetencyId === competencyId &&
        progress.currentCompetencyStatus === 'developing'
      );
    },
    [progress, isCompetent]
  );

  /**
   * Get the status of a specific competency
   */
  const getCompetencyStatus = useCallback(
    (competencyId: string): CompetencyStatus => {
      if (isCompetent(competencyId)) return 'competent';
      if (isDeveloping(competencyId)) return 'developing';
      return 'not_yet';
    },
    [isCompetent, isDeveloping]
  );

  /**
   * Force refresh the progress data
   */
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    progress,
    loading,
    error,
    isCompetent,
    isDeveloping,
    getCompetencyStatus,
    refresh,
  };
}
