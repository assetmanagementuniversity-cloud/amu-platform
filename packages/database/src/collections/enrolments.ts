/**
 * Enrolments collection operations
 */

import { getFirestore, FieldValue } from '../config/firebase-admin';
import type { Enrolment, EnrolmentDocument, CompetencyAchievement } from '@amu/shared';
import { generateId, DEFAULT_LANGUAGE } from '@amu/shared';

const COLLECTION = 'enrolments';

/**
 * Get an enrolment by ID
 */
export async function getEnrolmentById(enrolmentId: string): Promise<Enrolment | null> {
  const db = getFirestore();
  const doc = await db.collection(COLLECTION).doc(enrolmentId).get();

  if (!doc.exists) {
    return null;
  }

  return documentToEnrolment(doc.data() as EnrolmentDocument);
}

/**
 * Get enrolments for a user
 */
export async function getEnrolmentsByUserId(userId: string): Promise<Enrolment[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('enrolment_user_id', '==', userId)
    .orderBy('enrolment_started_date', 'desc')
    .get();

  return snapshot.docs.map((doc) => documentToEnrolment(doc.data() as EnrolmentDocument));
}

/**
 * Get active enrolment for a user in a course
 */
export async function getActiveEnrolment(
  userId: string,
  courseId: string
): Promise<Enrolment | null> {
  const db = getFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('enrolment_user_id', '==', userId)
    .where('enrolment_course_id', '==', courseId)
    .where('enrolment_status', '==', 'active')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return documentToEnrolment(snapshot.docs[0]?.data() as EnrolmentDocument);
}

/**
 * Create a new enrolment
 * Also checks for active split tests and allocates learner if applicable (Section 14.6)
 */
export async function createEnrolment(
  userId: string,
  courseId: string,
  firstModuleId: string,
  firstModuleTitle: string,
  language?: string
): Promise<Enrolment> {
  const db = getFirestore();
  const enrolmentId = generateId('enr');
  const now = new Date().toISOString();

  const enrolmentDoc: EnrolmentDocument = {
    enrolment_id: enrolmentId,
    enrolment_user_id: userId,
    enrolment_course_id: courseId,
    enrolment_status: 'active',
    enrolment_started_date: now,
    enrolment_last_activity_date: now,
    enrolment_current_module_id: firstModuleId,
    enrolment_current_module_title: firstModuleTitle,
    enrolment_modules_completed: [],
    enrolment_progress_percentage: 0,
    enrolment_competencies_achieved: [],
    enrolment_language: language || DEFAULT_LANGUAGE,
    enrolment_conversation_ids: [],
    enrolment_certificate_generated: false,
  };

  await db.collection(COLLECTION).doc(enrolmentId).set(enrolmentDoc);

  // Check for active split test and allocate if applicable (Section 14.6)
  const splitTestAllocation = await checkAndAllocateToSplitTest(
    firstModuleId,
    enrolmentId
  );

  if (splitTestAllocation) {
    await db.collection(COLLECTION).doc(enrolmentId).update({
      enrolment_split_test_id: splitTestAllocation.splitTestId,
      enrolment_split_test_version: splitTestAllocation.version,
    });

    enrolmentDoc.enrolment_split_test_id = splitTestAllocation.splitTestId;
    enrolmentDoc.enrolment_split_test_version = splitTestAllocation.version;
  }

  return documentToEnrolment(enrolmentDoc);
}

/**
 * Check for active split test and allocate learner
 * Internal helper for split test integration
 */
async function checkAndAllocateToSplitTest(
  moduleId: string,
  enrolmentId: string
): Promise<{ splitTestId: string; version: 'version_a' | 'version_b' } | null> {
  try {
    // Import dynamically to avoid circular dependency
    const { checkAndAllocateSplitTest } = await import('./split-tests');
    return await checkAndAllocateSplitTest(moduleId, enrolmentId);
  } catch {
    // Split tests module may not be initialized yet
    return null;
  }
}

/**
 * Update enrolment progress
 */
export async function updateEnrolmentProgress(
  enrolmentId: string,
  updates: {
    current_module_id?: string;
    current_module_title?: string;
    modules_completed?: string[];
    progress_percentage?: number;
    current_competency_id?: string;
    current_competency_status?: Enrolment['enrolment_current_competency_status'];
  }
): Promise<void> {
  const db = getFirestore();
  const updateData: Record<string, unknown> = {
    enrolment_last_activity_date: new Date().toISOString(),
  };

  if (updates.current_module_id) {
    updateData.enrolment_current_module_id = updates.current_module_id;
  }
  if (updates.current_module_title) {
    updateData.enrolment_current_module_title = updates.current_module_title;
  }
  if (updates.modules_completed) {
    updateData.enrolment_modules_completed = updates.modules_completed;
  }
  if (updates.progress_percentage !== undefined) {
    updateData.enrolment_progress_percentage = updates.progress_percentage;
  }
  if (updates.current_competency_id) {
    updateData.enrolment_current_competency_id = updates.current_competency_id;
  }
  if (updates.current_competency_status) {
    updateData.enrolment_current_competency_status = updates.current_competency_status;
  }

  await db.collection(COLLECTION).doc(enrolmentId).update(updateData);
}

/**
 * Add competency achievement
 */
export async function addCompetencyAchievement(
  enrolmentId: string,
  achievement: Omit<CompetencyAchievement, 'achieved_date'>
): Promise<void> {
  const db = getFirestore();
  const achievementWithDate = {
    ...achievement,
    achieved_date: new Date().toISOString(),
  };

  await db.collection(COLLECTION).doc(enrolmentId).update({
    enrolment_competencies_achieved: FieldValue.arrayUnion(achievementWithDate),
    enrolment_last_activity_date: new Date().toISOString(),
  });
}

/**
 * Add conversation to enrolment
 */
export async function addConversationToEnrolment(
  enrolmentId: string,
  conversationId: string
): Promise<void> {
  const db = getFirestore();
  await db.collection(COLLECTION).doc(enrolmentId).update({
    enrolment_conversation_ids: FieldValue.arrayUnion(conversationId),
    enrolment_active_conversation_id: conversationId,
    enrolment_last_activity_date: new Date().toISOString(),
  });
}

/**
 * Complete enrolment
 */
export async function completeEnrolment(enrolmentId: string): Promise<void> {
  const db = getFirestore();
  const now = new Date().toISOString();

  await db.collection(COLLECTION).doc(enrolmentId).update({
    enrolment_status: 'completed',
    enrolment_completed_date: now,
    enrolment_last_activity_date: now,
    enrolment_progress_percentage: 100,
  });
}

/**
 * Update certificate info
 */
export async function updateEnrolmentCertificate(
  enrolmentId: string,
  certificateId: string,
  certificateType: Enrolment['enrolment_certificate_type']
): Promise<void> {
  const db = getFirestore();
  await db.collection(COLLECTION).doc(enrolmentId).update({
    enrolment_certificate_generated: true,
    enrolment_certificate_id: certificateId,
    enrolment_certificate_type: certificateType,
  });
}

/**
 * Convert Firestore document to Enrolment type
 */
function documentToEnrolment(doc: EnrolmentDocument): Enrolment {
  return {
    ...doc,
    enrolment_started_date: new Date(doc.enrolment_started_date),
    enrolment_completed_date: doc.enrolment_completed_date
      ? new Date(doc.enrolment_completed_date)
      : undefined,
    enrolment_last_activity_date: new Date(doc.enrolment_last_activity_date),
    enrolment_competencies_achieved: doc.enrolment_competencies_achieved.map((a) => ({
      ...a,
      achieved_date: new Date(a.achieved_date),
    })),
  };
}
