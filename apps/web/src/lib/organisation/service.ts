'use server';

/**
 * Organisation Service - AMU Corporate Portal
 *
 * Implements the Corporate Portal for B2B relationships (Section 1.6):
 * - Company registration and management
 * - Employee linking via company code
 * - Team progress tracking (Section 24.4)
 * - Bulk enrolment management
 *
 * "Ubuntu - I am because we are"
 * Companies enable their teams to grow together.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { generateId } from '@amu/shared';
import type {
  Company,
  CompanyIndustry,
  CreateCompanyInput,
  EmployeeProgress,
  EmployeeEnrolmentSummary,
  TeamProgressSummary,
  CourseProgressSummary,
} from '@amu/shared';
import type {
  GetCompanyResult,
  CreateCompanyResult,
  UpdateCompanyResult,
  GetTeamProgressResult,
  AddEmployeeResult,
  RemoveEmployeeResult,
} from './types';

// ============================================
// Company CRUD Operations
// ============================================

/**
 * Get company by ID
 */
export async function getCompany(companyId: string): Promise<GetCompanyResult> {
  try {
    const companyRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyRef);

    if (!companyDoc.exists()) {
      return { success: false, error: 'Company not found' };
    }

    const data = companyDoc.data();
    return {
      success: true,
      company: {
        ...data,
        company_created_date: data.company_created_date?.toDate() || new Date(),
      } as Company,
    };
  } catch (error) {
    console.error('Error getting company:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get company',
    };
  }
}

/**
 * Get company by company code (for employee signup)
 */
export async function getCompanyByCode(
  code: string
): Promise<GetCompanyResult> {
  try {
    const companiesRef = collection(db, 'companies');
    const q = query(companiesRef, where('company_code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: 'Company code not found' };
    }

    const companyDoc = snapshot.docs[0];
    const data = companyDoc.data();

    return {
      success: true,
      company: {
        ...data,
        company_created_date: data.company_created_date?.toDate() || new Date(),
      } as Company,
    };
  } catch (error) {
    console.error('Error getting company by code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get company',
    };
  }
}

/**
 * Get company for a user (if they belong to one)
 */
export async function getUserCompany(userId: string): Promise<GetCompanyResult> {
  try {
    // Get user document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    const companyId = userData.user_company_id;

    if (!companyId) {
      return { success: false, error: 'User is not linked to a company' };
    }

    return await getCompany(companyId);
  } catch (error) {
    console.error('Error getting user company:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get company',
    };
  }
}

/**
 * Create a new company
 */
export async function createCompany(
  input: CreateCompanyInput
): Promise<CreateCompanyResult> {
  try {
    const companyId = generateId('org');
    const companyCode = generateCompanyCode(input.company_name);

    const companyData: Omit<Company, 'company_created_date'> & {
      company_created_date: Timestamp;
    } = {
      company_id: companyId,
      company_name: input.company_name,
      company_registration_number: input.company_registration_number,
      company_tax_number: input.company_tax_number,
      company_industry: input.company_industry,
      company_logo_url: input.company_logo_url,
      company_code: companyCode,
      company_referrer_user_id: input.company_referrer_user_id,
      company_discount_active: !!input.company_referrer_user_id,
      company_admin_user_ids: [input.company_training_manager_user_id],
      company_training_manager_user_id: input.company_training_manager_user_id,
      company_created_date: Timestamp.now(),
      company_contact_email: input.company_contact_email,
      company_payment_method: input.company_payment_method,
      company_seta_sector: input.company_seta_sector,
      company_sdl_number: input.company_sdl_number,
      company_total_employees: 1,
      company_active_learners: 0,
      company_certificates_earned: 0,
      company_certificates_official: 0,
    };

    await runTransaction(db, async (transaction) => {
      // Create company document
      const companyRef = doc(db, 'companies', companyId);
      transaction.set(companyRef, companyData);

      // Link the training manager to the company
      const userRef = doc(db, 'users', input.company_training_manager_user_id);
      transaction.update(userRef, {
        user_company_id: companyId,
        user_company_code_used: companyCode,
        user_type: 'training_manager',
      });
    });

    return {
      success: true,
      company_id: companyId,
      company_code: companyCode,
    };
  } catch (error) {
    console.error('Error creating company:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create company',
    };
  }
}

/**
 * Update company details
 */
export async function updateCompany(
  companyId: string,
  userId: string,
  updates: Partial<Pick<Company,
    | 'company_name'
    | 'company_logo_url'
    | 'company_industry'
    | 'company_contact_email'
    | 'company_contact_phone'
    | 'company_address'
    | 'company_seta_sector'
    | 'company_sdl_number'
  >>
): Promise<UpdateCompanyResult> {
  try {
    // Verify user is an admin
    const companyResult = await getCompany(companyId);
    if (!companyResult.success || !companyResult.company) {
      return { success: false, error: 'Company not found' };
    }

    if (!companyResult.company.company_admin_user_ids.includes(userId)) {
      return { success: false, error: 'Not authorized to update company' };
    }

    const companyRef = doc(db, 'companies', companyId);
    await updateDoc(companyRef, updates);

    return { success: true };
  } catch (error) {
    console.error('Error updating company:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update company',
    };
  }
}

/**
 * Add an admin to the company
 */
export async function addCompanyAdmin(
  companyId: string,
  requesterId: string,
  newAdminId: string
): Promise<UpdateCompanyResult> {
  try {
    const companyResult = await getCompany(companyId);
    if (!companyResult.success || !companyResult.company) {
      return { success: false, error: 'Company not found' };
    }

    if (!companyResult.company.company_admin_user_ids.includes(requesterId)) {
      return { success: false, error: 'Not authorized to add admins' };
    }

    const companyRef = doc(db, 'companies', companyId);
    await updateDoc(companyRef, {
      company_admin_user_ids: arrayUnion(newAdminId),
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding company admin:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add admin',
    };
  }
}

// ============================================
// Employee Management
// ============================================

/**
 * Link an employee to a company using company code
 */
export async function linkEmployeeToCompany(
  userId: string,
  companyCode: string
): Promise<AddEmployeeResult> {
  try {
    // Find company by code
    const companyResult = await getCompanyByCode(companyCode);
    if (!companyResult.success || !companyResult.company) {
      return { success: false, error: 'Invalid company code' };
    }

    const company = companyResult.company;

    await runTransaction(db, async (transaction) => {
      // Update user with company link
      const userRef = doc(db, 'users', userId);
      transaction.update(userRef, {
        user_company_id: company.company_id,
        user_company_code_used: companyCode.toUpperCase(),
      });

      // Increment company employee count
      const companyRef = doc(db, 'companies', company.company_id);
      transaction.update(companyRef, {
        company_total_employees: (company.company_total_employees || 0) + 1,
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Error linking employee:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to link employee',
    };
  }
}

/**
 * Remove an employee from a company
 */
export async function removeEmployeeFromCompany(
  companyId: string,
  requesterId: string,
  employeeId: string
): Promise<RemoveEmployeeResult> {
  try {
    const companyResult = await getCompany(companyId);
    if (!companyResult.success || !companyResult.company) {
      return { success: false, error: 'Company not found' };
    }

    if (!companyResult.company.company_admin_user_ids.includes(requesterId)) {
      return { success: false, error: 'Not authorized to remove employees' };
    }

    // Cannot remove self if only admin
    if (
      employeeId === requesterId &&
      companyResult.company.company_admin_user_ids.length === 1
    ) {
      return { success: false, error: 'Cannot remove the only admin' };
    }

    await runTransaction(db, async (transaction) => {
      // Remove company link from user
      const userRef = doc(db, 'users', employeeId);
      transaction.update(userRef, {
        user_company_id: null,
        user_company_code_used: null,
      });

      // Update company stats and remove from admins if applicable
      const companyRef = doc(db, 'companies', companyId);
      transaction.update(companyRef, {
        company_total_employees: Math.max(0, (companyResult.company!.company_total_employees || 1) - 1),
        company_admin_user_ids: arrayRemove(employeeId),
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing employee:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove employee',
    };
  }
}

/**
 * Get all employees for a company
 */
export async function getCompanyEmployees(
  companyId: string
): Promise<{ success: boolean; employees?: Array<{ user_id: string; user_name: string; user_email: string }>; error?: string }> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('user_company_id', '==', companyId));
    const snapshot = await getDocs(q);

    const employees = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        user_id: doc.id,
        user_name: data.user_name || 'Unknown',
        user_email: data.user_email || '',
      };
    });

    return { success: true, employees };
  } catch (error) {
    console.error('Error getting employees:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get employees',
    };
  }
}

// ============================================
// Team Progress (Section 24.4)
// ============================================

/**
 * Get team progress summary and individual employee progress
 */
export async function getTeamProgress(
  companyId: string,
  requesterId: string
): Promise<GetTeamProgressResult> {
  try {
    // Verify requester is an admin
    const companyResult = await getCompany(companyId);
    if (!companyResult.success || !companyResult.company) {
      return { success: false, error: 'Company not found' };
    }

    if (!companyResult.company.company_admin_user_ids.includes(requesterId)) {
      return { success: false, error: 'Not authorized to view team progress' };
    }

    // Get all employees
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, where('user_company_id', '==', companyId));
    const usersSnapshot = await getDocs(usersQuery);

    const employeeIds = usersSnapshot.docs.map((doc) => doc.id);
    const employeeData = new Map(
      usersSnapshot.docs.map((doc) => [doc.id, doc.data()])
    );

    // Get all enrolments for these employees
    const enrolmentsRef = collection(db, 'enrolments');
    const employeeProgress: EmployeeProgress[] = [];
    const courseStats = new Map<string, { enrolled: number; completed: number; totalProgress: number }>();

    let totalEnrolments = 0;
    let completedCourses = 0;
    let totalCompetenciesAchieved = 0;
    let officialCertificates = 0;
    let unofficialCertificates = 0;
    let activeLearnersSet = new Set<string>();

    for (const userId of employeeIds) {
      const userData = employeeData.get(userId);
      if (!userData) continue;

      const enrolmentQuery = query(
        enrolmentsRef,
        where('enrolment_user_id', '==', userId)
      );
      const enrolmentSnapshot = await getDocs(enrolmentQuery);

      const enrolments: EmployeeEnrolmentSummary[] = [];
      let userCompetenciesAchieved = 0;
      let userCoursesCompleted = 0;
      let lastActivity: Date | undefined;

      for (const enrolDoc of enrolmentSnapshot.docs) {
        const enrolData = enrolDoc.data();
        totalEnrolments++;

        const competenciesAchieved = enrolData.enrolment_competencies_achieved?.length || 0;
        userCompetenciesAchieved += competenciesAchieved;
        totalCompetenciesAchieved += competenciesAchieved;

        const isCompleted = enrolData.enrolment_status === 'completed';
        if (isCompleted) {
          completedCourses++;
          userCoursesCompleted++;

          if (enrolData.enrolment_certificate_is_official) {
            officialCertificates++;
          } else if (enrolData.enrolment_certificate_id) {
            unofficialCertificates++;
          }
        }

        // Track active learners
        const lastActivityDate = enrolData.enrolment_last_activity_date?.toDate();
        if (lastActivityDate) {
          const daysSinceActivity = (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceActivity <= 30) {
            activeLearnersSet.add(userId);
          }
          if (!lastActivity || lastActivityDate > lastActivity) {
            lastActivity = lastActivityDate;
          }
        }

        // Course stats aggregation
        const courseId = enrolData.enrolment_course_id;
        const existing = courseStats.get(courseId) || { enrolled: 0, completed: 0, totalProgress: 0 };
        existing.enrolled++;
        if (isCompleted) existing.completed++;
        existing.totalProgress += enrolData.enrolment_progress_percentage || 0;
        courseStats.set(courseId, existing);

        enrolments.push({
          enrolment_id: enrolDoc.id,
          course_id: courseId,
          course_title: enrolData.enrolment_course_title || 'Unknown Course',
          enrolment_status: enrolData.enrolment_status,
          progress_percentage: enrolData.enrolment_progress_percentage || 0,
          competencies_achieved: competenciesAchieved,
          competencies_total: enrolData.enrolment_total_competencies || 0,
          last_activity_date: lastActivityDate,
          certificate_id: enrolData.enrolment_certificate_id,
          certificate_is_official: enrolData.enrolment_certificate_is_official,
        });
      }

      employeeProgress.push({
        user_id: userId,
        user_name: userData.user_name || 'Unknown',
        user_email: userData.user_email || '',
        enrolments,
        total_courses_enrolled: enrolments.length,
        total_courses_completed: userCoursesCompleted,
        total_competencies_achieved: userCompetenciesAchieved,
        last_activity_date: lastActivity,
      });
    }

    // Build course progress summary
    const coursesProgress: CourseProgressSummary[] = [];
    for (const [courseId, stats] of courseStats.entries()) {
      // Get course title
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      const courseTitle = courseDoc.exists()
        ? courseDoc.data().course_title || 'Unknown'
        : 'Unknown Course';

      coursesProgress.push({
        course_id: courseId,
        course_title: courseTitle,
        enrolled_count: stats.enrolled,
        completed_count: stats.completed,
        average_progress: stats.enrolled > 0 ? Math.round(stats.totalProgress / stats.enrolled) : 0,
      });
    }

    const summary: TeamProgressSummary = {
      total_employees: employeeIds.length,
      active_learners: activeLearnersSet.size,
      total_enrolments: totalEnrolments,
      completed_courses: completedCourses,
      total_competencies_achieved: totalCompetenciesAchieved,
      official_certificates: officialCertificates,
      unofficial_certificates: unofficialCertificates,
      courses_progress: coursesProgress.sort((a, b) => b.enrolled_count - a.enrolled_count),
    };

    return {
      success: true,
      summary,
      employees: employeeProgress.sort((a, b) =>
        (b.last_activity_date?.getTime() || 0) - (a.last_activity_date?.getTime() || 0)
      ),
    };
  } catch (error) {
    console.error('Error getting team progress:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get team progress',
    };
  }
}

/**
 * Check if user is a company admin
 */
export async function isCompanyAdmin(
  userId: string,
  companyId: string
): Promise<boolean> {
  try {
    const companyResult = await getCompany(companyId);
    if (!companyResult.success || !companyResult.company) {
      return false;
    }
    return companyResult.company.company_admin_user_ids.includes(userId);
  } catch {
    return false;
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a unique company code from company name
 */
function generateCompanyCode(companyName: string): string {
  // Take first 3-4 characters of significant words
  const words = companyName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  let code = '';
  if (words.length >= 2) {
    code = (words[0].substring(0, 3) + words[1].substring(0, 2)).toUpperCase();
  } else if (words.length === 1) {
    code = words[0].substring(0, 5).toUpperCase();
  } else {
    code = 'ORG';
  }

  // Add random suffix for uniqueness
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${code}-${suffix}`;
}
