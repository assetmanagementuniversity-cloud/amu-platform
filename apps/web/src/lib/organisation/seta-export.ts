'use server';

/**
 * SETA/Skills Development Act Export Service - AMU Platform
 *
 * Generates CSV reports of employee competency achievements for
 * Skills Development Act tax rebate claims (Section 17.6, 24.4).
 *
 * South African Skills Development Act (No. 97 of 1998):
 * - Companies can claim tax rebates for employee training
 * - Requires documented proof of competency achievements
 * - SETA (Sector Education and Training Authority) reporting
 *
 * "Ubuntu - I am because we are"
 * Companies enable their teams to grow together.
 */

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Company } from '@amu/shared';

export interface SetaReportRow {
  // Employee Information
  employee_name: string;
  employee_id_number?: string;
  employee_email: string;
  employee_job_title?: string;

  // Course Information
  course_title: string;
  course_nqf_level?: number;
  course_credits?: number;

  // Competency Achievement
  competency_name: string;
  competency_code?: string;
  achievement_date: string;

  // Certificate Information
  certificate_number?: string;
  certificate_is_official: boolean;

  // Company Information
  company_name: string;
  company_sdl_number?: string;
  company_seta_sector?: string;
}

export interface SetaExportResult {
  success: boolean;
  csv_data?: string;
  filename?: string;
  row_count?: number;
  error?: string;
}

export interface SetaExportOptions {
  companyId: string;
  requesterId: string;
  startDate?: Date;
  endDate?: Date;
  includeUnofficial?: boolean;
}

/**
 * Generate SETA/Skills Development Act CSV export
 */
export async function generateSetaExport(
  options: SetaExportOptions
): Promise<SetaExportResult> {
  try {
    const { companyId, requesterId, startDate, endDate, includeUnofficial = false } = options;

    // Verify company exists and requester is admin
    const companyRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyRef);

    if (!companyDoc.exists()) {
      return { success: false, error: 'Company not found' };
    }

    const companyData = companyDoc.data() as Company;

    if (!companyData.company_admin_user_ids?.includes(requesterId)) {
      return { success: false, error: 'Only company admins can export SETA reports' };
    }

    // Get all employees in the company
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, where('user_company_id', '==', companyId));
    const usersSnapshot = await getDocs(usersQuery);

    const employeeIds = usersSnapshot.docs.map((doc) => doc.id);
    const employeeData = new Map(
      usersSnapshot.docs.map((doc) => [doc.id, doc.data()])
    );

    // Collect all competency achievements
    const rows: SetaReportRow[] = [];

    for (const userId of employeeIds) {
      const userData = employeeData.get(userId);
      if (!userData) continue;

      // Get all enrolments for this employee
      const enrolmentsRef = collection(db, 'enrolments');
      const enrolmentQuery = query(
        enrolmentsRef,
        where('enrolment_user_id', '==', userId)
      );
      const enrolmentSnapshot = await getDocs(enrolmentQuery);

      for (const enrolDoc of enrolmentSnapshot.docs) {
        const enrolData = enrolDoc.data();

        // Skip if not completed and no competencies achieved
        const competenciesAchieved = enrolData.enrolment_competencies_achieved || [];
        if (competenciesAchieved.length === 0) continue;

        // Filter by certificate type if not including unofficial
        const hasOfficialCert = enrolData.enrolment_certificate_is_official === true;
        if (!includeUnofficial && !hasOfficialCert) continue;

        // Get course details
        const courseId = enrolData.enrolment_course_id;
        const courseRef = doc(db, 'courses', courseId);
        const courseDoc = await getDoc(courseRef);
        const courseData = courseDoc.exists() ? courseDoc.data() : null;

        // For each competency achieved, create a row
        for (const competency of competenciesAchieved) {
          const achievementDate = competency.achieved_date?.toDate?.() ||
            enrolData.enrolment_completion_date?.toDate?.() ||
            new Date();

          // Apply date filters
          if (startDate && achievementDate < startDate) continue;
          if (endDate && achievementDate > endDate) continue;

          rows.push({
            // Employee Information
            employee_name: userData.user_name || 'Unknown',
            employee_id_number: userData.user_id_number,
            employee_email: userData.user_email || '',
            employee_job_title: userData.user_job_title,

            // Course Information
            course_title: enrolData.enrolment_course_title || courseData?.course_title || 'Unknown Course',
            course_nqf_level: courseData?.course_nqf_level,
            course_credits: courseData?.course_credits,

            // Competency Achievement
            competency_name: competency.competency_name || competency.name || 'Unknown Competency',
            competency_code: competency.competency_code || competency.code,
            achievement_date: achievementDate.toISOString().split('T')[0],

            // Certificate Information
            certificate_number: enrolData.enrolment_certificate_id,
            certificate_is_official: hasOfficialCert,

            // Company Information
            company_name: companyData.company_name,
            company_sdl_number: companyData.company_sdl_number,
            company_seta_sector: companyData.company_seta_sector,
          });
        }
      }
    }

    if (rows.length === 0) {
      return {
        success: false,
        error: 'No competency achievements found for the selected criteria',
      };
    }

    // Generate CSV
    const csvData = generateCsv(rows);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `SETA_Report_${companyData.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.csv`;

    return {
      success: true,
      csv_data: csvData,
      filename,
      row_count: rows.length,
    };
  } catch (error) {
    console.error('Error generating SETA export:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate export',
    };
  }
}

/**
 * Generate CSV string from rows
 */
function generateCsv(rows: SetaReportRow[]): string {
  // CSV Header
  const headers = [
    'Employee Name',
    'ID Number',
    'Email',
    'Job Title',
    'Course Title',
    'NQF Level',
    'Credits',
    'Competency Name',
    'Competency Code',
    'Achievement Date',
    'Certificate Number',
    'Certificate Type',
    'Company Name',
    'SDL Number',
    'SETA Sector',
  ];

  // CSV Rows
  const csvRows = rows.map((row) => [
    escapeCsvField(row.employee_name),
    escapeCsvField(row.employee_id_number || ''),
    escapeCsvField(row.employee_email),
    escapeCsvField(row.employee_job_title || ''),
    escapeCsvField(row.course_title),
    row.course_nqf_level?.toString() || '',
    row.course_credits?.toString() || '',
    escapeCsvField(row.competency_name),
    escapeCsvField(row.competency_code || ''),
    row.achievement_date,
    escapeCsvField(row.certificate_number || ''),
    row.certificate_is_official ? 'Official' : 'Unofficial',
    escapeCsvField(row.company_name),
    escapeCsvField(row.company_sdl_number || ''),
    escapeCsvField(row.company_seta_sector || ''),
  ]);

  // Add BOM for Excel compatibility with UTF-8
  const BOM = '\uFEFF';
  return BOM + [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
}

/**
 * Escape a field for CSV format
 */
function escapeCsvField(field: string): string {
  if (!field) return '';

  // If field contains comma, newline, or quote, wrap in quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Get summary statistics for SETA reporting period
 */
export async function getSetaReportSummary(
  companyId: string,
  requesterId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  success: boolean;
  summary?: {
    total_employees: number;
    employees_with_achievements: number;
    total_competencies: number;
    total_official_certificates: number;
    total_courses_completed: number;
    period_start: string;
    period_end: string;
  };
  error?: string;
}> {
  try {
    // Verify company and admin
    const companyRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyRef);

    if (!companyDoc.exists()) {
      return { success: false, error: 'Company not found' };
    }

    const companyData = companyDoc.data() as Company;

    if (!companyData.company_admin_user_ids?.includes(requesterId)) {
      return { success: false, error: 'Not authorized' };
    }

    // Get all employees
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, where('user_company_id', '==', companyId));
    const usersSnapshot = await getDocs(usersQuery);

    const employeeIds = usersSnapshot.docs.map((doc) => doc.id);

    let totalCompetencies = 0;
    let totalOfficialCerts = 0;
    let totalCoursesCompleted = 0;
    const employeesWithAchievements = new Set<string>();

    for (const userId of employeeIds) {
      const enrolmentsRef = collection(db, 'enrolments');
      const enrolmentQuery = query(
        enrolmentsRef,
        where('enrolment_user_id', '==', userId)
      );
      const enrolmentSnapshot = await getDocs(enrolmentQuery);

      for (const enrolDoc of enrolmentSnapshot.docs) {
        const enrolData = enrolDoc.data();

        const competencies = enrolData.enrolment_competencies_achieved || [];
        const completionDate = enrolData.enrolment_completion_date?.toDate();

        // Apply date filters
        if (completionDate) {
          if (startDate && completionDate < startDate) continue;
          if (endDate && completionDate > endDate) continue;
        }

        if (competencies.length > 0) {
          employeesWithAchievements.add(userId);
          totalCompetencies += competencies.length;
        }

        if (enrolData.enrolment_status === 'completed') {
          totalCoursesCompleted++;
          if (enrolData.enrolment_certificate_is_official) {
            totalOfficialCerts++;
          }
        }
      }
    }

    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), 0, 1); // Jan 1 of current year
    const defaultEnd = now;

    return {
      success: true,
      summary: {
        total_employees: employeeIds.length,
        employees_with_achievements: employeesWithAchievements.size,
        total_competencies: totalCompetencies,
        total_official_certificates: totalOfficialCerts,
        total_courses_completed: totalCoursesCompleted,
        period_start: (startDate || defaultStart).toISOString().split('T')[0],
        period_end: (endDate || defaultEnd).toISOString().split('T')[0],
      },
    };
  } catch (error) {
    console.error('Error getting SETA summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get summary',
    };
  }
}
