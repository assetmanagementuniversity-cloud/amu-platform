/**
 * Courses and Modules collection operations
 */

import { getFirestore } from '../config/firebase-admin';
import type { Course, CourseDocument, Module, ModuleDocument } from '@amu/shared';

const COURSES_COLLECTION = 'courses';
const MODULES_COLLECTION = 'modules';

/**
 * Get all published courses
 */
export async function getPublishedCourses(): Promise<Course[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(COURSES_COLLECTION)
    .where('course_published', '==', true)
    .orderBy('course_title')
    .get();

  return snapshot.docs.map((doc) => documentToCourse(doc.data() as CourseDocument));
}

/**
 * Get a course by ID
 */
export async function getCourseById(courseId: string): Promise<Course | null> {
  const db = getFirestore();
  const doc = await db.collection(COURSES_COLLECTION).doc(courseId).get();

  if (!doc.exists) {
    return null;
  }

  return documentToCourse(doc.data() as CourseDocument);
}

/**
 * Get courses by type
 */
export async function getCoursesByType(courseType: Course['course_type']): Promise<Course[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(COURSES_COLLECTION)
    .where('course_type', '==', courseType)
    .where('course_published', '==', true)
    .orderBy('course_title')
    .get();

  return snapshot.docs.map((doc) => documentToCourse(doc.data() as CourseDocument));
}

/**
 * Get a module by ID
 */
export async function getModuleById(moduleId: string): Promise<Module | null> {
  const db = getFirestore();
  const doc = await db.collection(MODULES_COLLECTION).doc(moduleId).get();

  if (!doc.exists) {
    return null;
  }

  return documentToModule(doc.data() as ModuleDocument);
}

/**
 * Get modules for a course
 */
export async function getModulesByCourseId(courseId: string): Promise<Module[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(MODULES_COLLECTION)
    .where('module_course_id', '==', courseId)
    .orderBy('module_order')
    .get();

  return snapshot.docs.map((doc) => documentToModule(doc.data() as ModuleDocument));
}

/**
 * Get course with its modules
 */
export async function getCourseWithModules(
  courseId: string
): Promise<{ course: Course; modules: Module[] } | null> {
  const course = await getCourseById(courseId);

  if (!course) {
    return null;
  }

  const modules = await getModulesByCourseId(courseId);

  return { course, modules };
}

/**
 * Convert Firestore document to Course type
 */
function documentToCourse(doc: CourseDocument): Course {
  return {
    ...doc,
    course_last_updated_date: new Date(doc.course_last_updated_date),
    course_created_date: new Date(doc.course_created_date),
  };
}

/**
 * Convert Firestore document to Module type
 */
function documentToModule(doc: ModuleDocument): Module {
  return {
    ...doc,
    module_last_updated_date: new Date(doc.module_last_updated_date),
  };
}
