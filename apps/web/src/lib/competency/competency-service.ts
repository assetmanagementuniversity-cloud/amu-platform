/**
 * Competency Service - Handles persistence of competency achievements to Firestore
 *
 * Responsibilities:
 * - Save competency achievements with evidence trail
 * - Update enrolment progress
 * - Check for module/course completion
 * - Trigger certificate generation when applicable
 */

import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { ParsedMilestone } from './milestone-parser';
import { generateCertificate } from '@/lib/certificates';

export interface CompetencyAchievement {
  competency_id: string;
  competency_title: string;
  achieved_date: Date;
  achievement_level: 'competent';
  evidence_conversation_id: string;
}

export interface CompetencyProgress {
  competency_id: string;
  status: 'not_yet' | 'developing' | 'competent';
  last_updated: Date;
  evidence_conversation_id?: string;
}

export interface SaveMilestoneParams {
  enrolmentId: string;
  milestone: ParsedMilestone;
  conversationId: string;
  moduleId: string;
}

export interface SaveMilestoneResult {
  success: boolean;
  isModuleComplete?: boolean;
  isCourseComplete?: boolean;
  certificateGenerated?: boolean;
  certificateId?: string;
  error?: string;
}

/**
 * Save a competency milestone achievement to Firestore
 * This updates the enrolment document with the achievement and checks for completion
 */
export async function saveMilestoneAchievement(
  params: SaveMilestoneParams
): Promise<SaveMilestoneResult> {
  const { enrolmentId, milestone, conversationId, moduleId } = params;

  try {
    const enrolmentRef = doc(db, 'enrolments', enrolmentId);

    // Use a transaction to ensure atomic updates
    const result = await runTransaction(db, async (transaction) => {
      const enrolmentDoc = await transaction.get(enrolmentRef);

      if (!enrolmentDoc.exists()) {
        throw new Error('Enrolment not found');
      }

      const enrolmentData = enrolmentDoc.data();
      const existingAchievements: CompetencyAchievement[] =
        enrolmentData.enrolment_competencies_achieved || [];

      // Check if this competency is already achieved
      const alreadyAchieved = existingAchievements.some(
        (a) => a.competency_id === milestone.competencyId
      );

      if (milestone.type === 'complete' && !alreadyAchieved) {
        // Create the achievement record
        const achievement: CompetencyAchievement = {
          competency_id: milestone.competencyId,
          competency_title: milestone.competencyTitle || milestone.competencyId,
          achieved_date: new Date(),
          achievement_level: 'competent',
          evidence_conversation_id: conversationId,
        };

        // Update the enrolment with the new achievement
        transaction.update(enrolmentRef, {
          enrolment_competencies_achieved: arrayUnion(achievement),
          enrolment_current_competency_status: 'competent',
          enrolment_last_activity_date: Timestamp.now(),
        });

        // Check if module is complete (all competencies achieved)
        const updatedAchievements = [...existingAchievements, achievement];
        const moduleComplete = await checkModuleCompletion(
          moduleId,
          updatedAchievements
        );

        if (moduleComplete) {
          // Update modules completed array
          const modulesCompleted: string[] =
            enrolmentData.enrolment_modules_completed || [];
          if (!modulesCompleted.includes(moduleId)) {
            transaction.update(enrolmentRef, {
              enrolment_modules_completed: arrayUnion(moduleId),
            });
          }

          // Check if entire course is complete
          const courseComplete = await checkCourseCompletion(
            enrolmentData.enrolment_course_id,
            [...modulesCompleted, moduleId]
          );

          if (courseComplete) {
            transaction.update(enrolmentRef, {
              enrolment_status: 'completed',
              enrolment_completed_date: Timestamp.now(),
            });
          }

          return {
            moduleComplete,
            courseComplete,
            enrolmentData,
            updatedAchievements,
          };
        }

        return { moduleComplete: false, courseComplete: false };
      } else if (milestone.type === 'progress') {
        // Update current competency status to developing
        transaction.update(enrolmentRef, {
          enrolment_current_competency_id: milestone.competencyId,
          enrolment_current_competency_status: 'developing',
          enrolment_last_activity_date: Timestamp.now(),
        });

        return { moduleComplete: false, courseComplete: false };
      }

      return { moduleComplete: false, courseComplete: false };
    });

    // If course is complete, trigger certificate generation
    let certificateGenerated = false;
    let certificateId: string | undefined;

    if (result.courseComplete && result.enrolmentData && result.updatedAchievements) {
      try {
        // Get learner name from user document
        const userRef = doc(db, 'users', result.enrolmentData.enrolment_user_id);
        const userDoc = await getDoc(userRef);
        const learnerName = userDoc.exists()
          ? userDoc.data().user_display_name || 'Learner'
          : 'Learner';

        // Get course title
        const courseRef = doc(db, 'courses', result.enrolmentData.enrolment_course_id);
        const courseDoc = await getDoc(courseRef);
        const courseTitle = courseDoc.exists()
          ? courseDoc.data().course_title || 'Course'
          : 'Course';

        // Generate certificate
        const certResult = await generateCertificate({
          enrolmentId,
          learnerId: result.enrolmentData.enrolment_user_id,
          learnerName,
          courseId: result.enrolmentData.enrolment_course_id,
          courseTitle,
          competencies: result.updatedAchievements.map((a) => ({
            competency_id: a.competency_id,
            competency_title: a.competency_title,
            achieved_date: a.achieved_date,
          })),
          template: 'unofficial',
        });

        if (certResult.success) {
          certificateGenerated = true;
          certificateId = certResult.certificateId;
          console.log('Certificate generated successfully:', certificateId);
        } else {
          console.error('Certificate generation failed:', certResult.error);
        }
      } catch (certError) {
        console.error('Error triggering certificate generation:', certError);
      }
    }

    return {
      success: true,
      isModuleComplete: result.moduleComplete,
      isCourseComplete: result.courseComplete,
      certificateGenerated,
      certificateId,
    };
  } catch (error) {
    console.error('Error saving milestone:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if all competencies in a module have been achieved
 */
async function checkModuleCompletion(
  moduleId: string,
  achievements: CompetencyAchievement[]
): Promise<boolean> {
  try {
    const moduleRef = doc(db, 'modules', moduleId);
    const moduleDoc = await getDoc(moduleRef);

    if (!moduleDoc.exists()) {
      return false;
    }

    const moduleData = moduleDoc.data();
    const moduleCompetencies: { competency_id: string }[] =
      moduleData.module_competencies || [];

    // Check if all module competencies are in achievements
    const achievedIds = new Set(achievements.map((a) => a.competency_id));
    return moduleCompetencies.every((c) => achievedIds.has(c.competency_id));
  } catch (error) {
    console.error('Error checking module completion:', error);
    return false;
  }
}

/**
 * Check if all modules in a course have been completed
 */
async function checkCourseCompletion(
  courseId: string,
  completedModuleIds: string[]
): Promise<boolean> {
  try {
    const courseRef = doc(db, 'courses', courseId);
    const courseDoc = await getDoc(courseRef);

    if (!courseDoc.exists()) {
      return false;
    }

    const courseData = courseDoc.data();
    const courseModuleIds: string[] = courseData.course_module_ids || [];

    // Check if all course modules are in completedModuleIds
    const completedSet = new Set(completedModuleIds);
    return courseModuleIds.every((id) => completedSet.has(id));
  } catch (error) {
    console.error('Error checking course completion:', error);
    return false;
  }
}

/**
 * Calculate progress percentage based on achievements
 */
export function calculateProgressPercentage(
  totalCompetencies: number,
  achievedCount: number
): number {
  if (totalCompetencies === 0) return 0;
  return Math.round((achievedCount / totalCompetencies) * 100);
}

/**
 * Update the enrolment progress percentage
 */
export async function updateEnrolmentProgress(
  enrolmentId: string,
  progressPercentage: number
): Promise<void> {
  try {
    const enrolmentRef = doc(db, 'enrolments', enrolmentId);
    await updateDoc(enrolmentRef, {
      enrolment_progress_percentage: progressPercentage,
      enrolment_last_activity_date: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating enrolment progress:', error);
  }
}
