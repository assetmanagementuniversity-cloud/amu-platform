'use client';

/**
 * Corporate Portal - Company Profile & Team Progress
 *
 * Implements the Corporate Portal for B2B relationships (Section 1.6):
 * - Company profile with partner logo
 * - Team progress dashboard (Section 24.4)
 * - Employee enrolment and competency tracking
 *
 * Branding (Section 9.4, 9.5):
 * - Montserrat 24pt for titles
 * - Partner logo alongside AMU Bridge Logo with h-10 clear space
 * - AMU brand colours throughout
 *
 * "Ubuntu - I am because we are"
 * Companies enable their teams to grow together.
 */

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building2,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  GraduationCap,
  Clock,
  CheckCircle2,
  Settings,
  UserPlus,
  BarChart3,
  ExternalLink,
  Crown,
  FileSpreadsheet,
  Send,
} from 'lucide-react';
import { useAuth } from '@/components/auth';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@amu/shared';
import { LOGO_WITH_SLOGAN } from '@/lib/brand-assets';
import {
  getUserCompany,
  getTeamProgress,
  isCompanyAdmin,
  INDUSTRY_LABELS,
  type Company,
  type TeamProgressSummary,
  type EmployeeProgress,
} from '@/lib/organisation';

// ============================================
// Main Component
// ============================================

export default function OrganisationPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [teamProgress, setTeamProgress] = useState<TeamProgressSummary | null>(null);
  const [employees, setEmployees] = useState<EmployeeProgress[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    try {
      // Get user's company
      const companyResult = await getUserCompany(user.uid);
      if (!companyResult.success || !companyResult.company) {
        setError('You are not linked to a company');
        setLoading(false);
        return;
      }

      setCompany(companyResult.company);

      // Check if user is admin
      const adminStatus = await isCompanyAdmin(user.uid, companyResult.company.company_id);
      setIsAdmin(adminStatus);

      // Get team progress if admin
      if (adminStatus) {
        const progressResult = await getTeamProgress(
          companyResult.company.company_id,
          user.uid
        );
        if (progressResult.success) {
          setTeamProgress(progressResult.summary || null);
          setEmployees(progressResult.employees || []);
        }
      }
    } catch (err) {
      setError('Failed to load company data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !company) {
    return <NoCompanyState error={error} />;
  }

  return (
    <div className="min-h-screen bg-amu-sky/20 pb-12">
      {/* Company Header with Co-Branding */}
      <CompanyHeader company={company} isAdmin={isAdmin} />

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        {teamProgress && (
          <div className="-mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Employees"
              value={teamProgress.total_employees.toString()}
              icon={Users}
              subtitle={`${teamProgress.active_learners} active learners`}
            />
            <StatCard
              label="Course Enrolments"
              value={teamProgress.total_enrolments.toString()}
              icon={BookOpen}
              subtitle={`${teamProgress.completed_courses} completed`}
              highlight
            />
            <StatCard
              label="Competencies Achieved"
              value={teamProgress.total_competencies_achieved.toString()}
              icon={Award}
              subtitle="Across all learners"
            />
            <StatCard
              label="Certificates"
              value={(teamProgress.official_certificates + teamProgress.unofficial_certificates).toString()}
              icon={GraduationCap}
              subtitle={`${teamProgress.official_certificates} official`}
            />
          </div>
        )}

        {/* Company Code Section */}
        <div className="mt-8">
          <CompanyCodeSection code={company.company_code} />
        </div>

        {/* Admin Quick Actions */}
        {isAdmin && (
          <div className="mt-8">
            <AdminQuickActions />
          </div>
        )}

        {/* Course Progress Summary */}
        {teamProgress && teamProgress.courses_progress.length > 0 && (
          <div className="mt-8">
            <CourseProgressSection courses={teamProgress.courses_progress} />
          </div>
        )}

        {/* Team Progress Table */}
        {isAdmin && (
          <div className="mt-8">
            <TeamProgressTable employees={employees} />
          </div>
        )}

        {/* Non-Admin View */}
        {!isAdmin && (
          <div className="mt-8 rounded-xl border border-amu-sky bg-white p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-amu-slate/50" />
            <h3 className="mt-4 font-heading text-lg font-semibold text-amu-charcoal">
              Employee View
            </h3>
            <p className="mt-2 font-body text-sm text-amu-slate">
              You are linked to {company.company_name}. Contact your training manager
              for access to team progress data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Company Header with Co-Branding (Section 9.4, 9.5)
// ============================================

interface CompanyHeaderProps {
  company: Company;
  isAdmin: boolean;
}

function CompanyHeader({ company, isAdmin }: CompanyHeaderProps) {
  return (
    <div className="bg-amu-navy px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Co-Branded Logo Section - Partner logo with h-10 clear space */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* Partner Logo + AMU Bridge Logo */}
          <div className="flex items-center gap-6">
            {/* Partner/Company Logo */}
            {company.company_logo_url ? (
              <div className="flex h-10 items-center">
                <Image
                  src={company.company_logo_url}
                  alt={company.company_name}
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            )}

            {/* Divider with clear space */}
            <div className="h-10 w-px bg-white/30" />

            {/* AMU Bridge Logo (h-10 height per Section 9.4) */}
            <Link href="/" className="flex h-10 items-center">
              <Image
                src={LOGO_WITH_SLOGAN}
                alt="Asset Management University"
                width={160}
                height={40}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
          </div>

          {/* Admin Badge */}
          {isAdmin && (
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
              <Settings className="h-4 w-4 text-white" />
              <span className="font-body text-sm text-white">Training Manager</span>
            </div>
          )}
        </div>

        {/* Company Title - Montserrat 24pt per Section 9.3 */}
        <div className="mt-6">
          <h1 className="font-heading text-[24pt] font-normal text-white">
            {company.company_name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-body text-sm text-white/80">
              {INDUSTRY_LABELS[company.company_industry] || company.company_industry}
            </span>
            {company.company_seta_sector && (
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-body text-sm text-white/80">
                {company.company_seta_sector}
              </span>
            )}
          </div>
        </div>

        {/* Ubuntu Quote */}
        <div className="mt-6 rounded-lg bg-white/10 px-4 py-3">
          <p className="font-body text-sm italic text-white/90">
            "I am because we are" — Growing together as a team strengthens everyone.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Stat Card
// ============================================

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  subtitle?: string;
  highlight?: boolean;
}

function StatCard({ label, value, icon: Icon, subtitle, highlight }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
        highlight ? 'border-amu-navy' : 'border-amu-sky'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-body text-sm text-amu-slate">{label}</p>
          <p
            className={cn(
              'mt-1 font-heading text-2xl font-bold',
              highlight ? 'text-amu-navy' : 'text-amu-charcoal'
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 font-body text-xs text-amu-slate">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            'rounded-lg p-2',
            highlight ? 'bg-amu-navy text-white' : 'bg-amu-sky text-amu-navy'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Company Code Section
// ============================================

interface CompanyCodeSectionProps {
  code: string;
}

function CompanyCodeSection({ code }: CompanyCodeSectionProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-amu-sky bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-amu-navy" />
        <h2 className="font-heading text-lg font-semibold text-amu-navy">
          Company Code
        </h2>
      </div>

      <p className="mt-2 font-body text-sm text-amu-slate">
        Share this code with employees so they can link their accounts to your company
        during registration.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-amu-sky bg-amu-sky/30 px-4 py-3">
          <span className="font-heading text-xl font-bold tracking-wider text-amu-navy">
            {code}
          </span>
          <button
            onClick={copyCode}
            className="ml-auto rounded-md p-1.5 text-amu-slate hover:bg-white hover:text-amu-navy"
            title="Copy code"
          >
            {copied ? (
              <Check className="h-5 w-5 text-emerald-600" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Admin Quick Actions
// ============================================

function AdminQuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Link
        href="/organisation/sponsor"
        className="group flex items-center gap-4 rounded-xl border border-amu-sky bg-white p-4 transition-all hover:border-amu-navy hover:shadow-md"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
          <Send className="h-6 w-6" />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-amu-charcoal">
            Sponsor Learners
          </p>
          <p className="font-body text-xs text-amu-slate">
            Invite employees
          </p>
        </div>
        <ChevronRight className="ml-auto h-5 w-5 text-amu-slate group-hover:text-amu-navy" />
      </Link>

      <Link
        href="/organisation/reports"
        className="group flex items-center gap-4 rounded-xl border border-amu-sky bg-white p-4 transition-all hover:border-amu-navy hover:shadow-md"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-amu-charcoal">
            SETA Reports
          </p>
          <p className="font-body text-xs text-amu-slate">
            Export for tax rebates
          </p>
        </div>
        <ChevronRight className="ml-auto h-5 w-5 text-amu-slate group-hover:text-amu-navy" />
      </Link>

      <Link
        href="/organisation/subscription"
        className="group flex items-center gap-4 rounded-xl border border-amu-sky bg-white p-4 transition-all hover:border-amu-navy hover:shadow-md"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
          <Crown className="h-6 w-6" />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-amu-charcoal">
            Subscription
          </p>
          <p className="font-body text-xs text-amu-slate">
            Manage your plan
          </p>
        </div>
        <ChevronRight className="ml-auto h-5 w-5 text-amu-slate group-hover:text-amu-navy" />
      </Link>

      <Link
        href="/organisation/register"
        className="group flex items-center gap-4 rounded-xl border border-amu-sky bg-white p-4 transition-all hover:border-amu-navy hover:shadow-md"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-amu-charcoal">
            Company Settings
          </p>
          <p className="font-body text-xs text-amu-slate">
            Edit company profile
          </p>
        </div>
        <ChevronRight className="ml-auto h-5 w-5 text-amu-slate group-hover:text-amu-navy" />
      </Link>
    </div>
  );
}

// ============================================
// Course Progress Section
// ============================================

interface CourseProgressSectionProps {
  courses: Array<{
    course_id: string;
    course_title: string;
    enrolled_count: number;
    completed_count: number;
    average_progress: number;
  }>;
}

function CourseProgressSection({ courses }: CourseProgressSectionProps) {
  return (
    <div className="rounded-xl border border-amu-sky bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-amu-sky px-6 py-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-amu-navy" />
          <h2 className="font-heading text-lg font-semibold text-amu-navy">
            Course Progress
          </h2>
        </div>
      </div>

      <div className="divide-y divide-amu-sky/50">
        {courses.map((course) => (
          <div
            key={course.course_id}
            className="flex items-center gap-4 px-6 py-4"
          >
            <div className="flex-1 min-w-0">
              <p className="font-heading text-sm font-medium text-amu-charcoal truncate">
                {course.course_title}
              </p>
              <div className="mt-2 flex items-center gap-4">
                {/* Progress Bar */}
                <div className="flex-1 h-2 bg-amu-sky rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amu-navy rounded-full transition-all"
                    style={{ width: `${course.average_progress}%` }}
                  />
                </div>
                <span className="font-body text-sm text-amu-slate shrink-0">
                  {course.average_progress}%
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-center">
                <p className="font-heading text-lg font-bold text-amu-navy">
                  {course.enrolled_count}
                </p>
                <p className="font-body text-xs text-amu-slate">Enrolled</p>
              </div>
              <div className="text-center">
                <p className="font-heading text-lg font-bold text-emerald-600">
                  {course.completed_count}
                </p>
                <p className="font-body text-xs text-amu-slate">Completed</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Team Progress Table (Section 24.4)
// ============================================

interface TeamProgressTableProps {
  employees: EmployeeProgress[];
}

function TeamProgressTable({ employees }: TeamProgressTableProps) {
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  if (employees.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-amu-slate/30 bg-white p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-amu-slate/50" />
        <h3 className="mt-4 font-heading text-lg font-semibold text-amu-charcoal">
          No Team Members Yet
        </h3>
        <p className="mt-2 font-body text-sm text-amu-slate">
          Share your company code with employees to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amu-sky bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-amu-sky px-6 py-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-amu-navy" />
          <h2 className="font-heading text-lg font-semibold text-amu-navy">
            Team Progress
          </h2>
        </div>
        <span className="font-body text-sm text-amu-slate">
          {employees.length} employee{employees.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="divide-y divide-amu-sky/50">
        {employees.map((employee) => (
          <div key={employee.user_id}>
            {/* Employee Row */}
            <button
              onClick={() =>
                setExpandedEmployee(
                  expandedEmployee === employee.user_id ? null : employee.user_id
                )
              }
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-amu-sky/10 transition-colors text-left"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amu-navy text-white font-heading text-sm font-bold">
                {employee.user_name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm font-medium text-amu-charcoal truncate">
                  {employee.user_name}
                </p>
                <p className="font-body text-xs text-amu-slate truncate">
                  {employee.user_email}
                </p>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-6">
                <div className="text-center">
                  <p className="font-heading text-sm font-bold text-amu-navy">
                    {employee.total_courses_enrolled}
                  </p>
                  <p className="font-body text-xs text-amu-slate">Courses</p>
                </div>
                <div className="text-center">
                  <p className="font-heading text-sm font-bold text-emerald-600">
                    {employee.total_competencies_achieved}
                  </p>
                  <p className="font-body text-xs text-amu-slate">Competencies</p>
                </div>
                <div className="text-center">
                  {employee.last_activity_date ? (
                    <>
                      <p className="font-body text-sm text-amu-charcoal">
                        {formatTimeAgo(employee.last_activity_date)}
                      </p>
                      <p className="font-body text-xs text-amu-slate">Last Active</p>
                    </>
                  ) : (
                    <p className="font-body text-xs text-amu-slate">No activity</p>
                  )}
                </div>
              </div>

              {/* Expand Icon */}
              <ChevronRight
                className={cn(
                  'h-5 w-5 text-amu-slate transition-transform',
                  expandedEmployee === employee.user_id && 'rotate-90'
                )}
              />
            </button>

            {/* Expanded Enrolments */}
            {expandedEmployee === employee.user_id && employee.enrolments.length > 0 && (
              <div className="bg-amu-sky/20 px-6 py-4 border-t border-amu-sky/50">
                <h4 className="font-heading text-xs font-semibold text-amu-navy uppercase tracking-wide mb-3">
                  Enrolments
                </h4>
                <div className="space-y-3">
                  {employee.enrolments.map((enrolment) => (
                    <div
                      key={enrolment.enrolment_id}
                      className="flex items-center gap-4 rounded-lg bg-white p-3"
                    >
                      {/* Status Icon */}
                      <div
                        className={cn(
                          'rounded-full p-1.5',
                          enrolment.enrolment_status === 'completed'
                            ? 'bg-emerald-100 text-emerald-600'
                            : enrolment.enrolment_status === 'active'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-amber-100 text-amber-600'
                        )}
                      >
                        {enrolment.enrolment_status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : enrolment.enrolment_status === 'active' ? (
                          <BookOpen className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-heading text-sm font-medium text-amu-charcoal truncate">
                          {enrolment.course_title}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          {/* Progress */}
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex-1 h-1.5 bg-amu-sky rounded-full overflow-hidden max-w-[120px]">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  enrolment.enrolment_status === 'completed'
                                    ? 'bg-emerald-500'
                                    : 'bg-amu-navy'
                                )}
                                style={{ width: `${enrolment.progress_percentage}%` }}
                              />
                            </div>
                            <span className="font-body text-xs text-amu-slate">
                              {enrolment.progress_percentage}%
                            </span>
                          </div>

                          {/* Competencies */}
                          <span className="font-body text-xs text-amu-slate">
                            {enrolment.competencies_achieved}/{enrolment.competencies_total} competencies
                          </span>
                        </div>
                      </div>

                      {/* Certificate Badge */}
                      {enrolment.certificate_id && (
                        <div
                          className={cn(
                            'flex items-center gap-1 rounded-full px-2 py-1',
                            enrolment.certificate_is_official
                              ? 'bg-amu-navy text-white'
                              : 'bg-amber-100 text-amber-700'
                          )}
                        >
                          <GraduationCap className="h-3 w-3" />
                          <span className="font-body text-xs font-medium">
                            {enrolment.certificate_is_official ? 'Official' : 'Unofficial'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Helper Functions
// ============================================

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ============================================
// Loading Skeleton
// ============================================

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-amu-sky/20 pb-12">
      <div className="bg-amu-navy px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-6">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-white/20" />
            <div className="h-10 w-px bg-white/30" />
            <div className="h-10 w-40 animate-pulse rounded bg-white/20" />
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-9 w-64 animate-pulse rounded bg-white/20" />
            <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white" />
          ))}
        </div>

        <div className="mt-8 h-40 animate-pulse rounded-xl bg-white" />
        <div className="mt-8 h-64 animate-pulse rounded-xl bg-white" />
      </div>
    </div>
  );
}

// ============================================
// No Company State
// ============================================

interface NoCompanyStateProps {
  error: string | null;
}

function NoCompanyState({ error }: NoCompanyStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-amu-sky/20 px-4">
      <div className="max-w-md text-center">
        <Building2 className="mx-auto h-16 w-16 text-amu-slate/50" />
        <h2 className="mt-6 font-heading text-xl font-semibold text-amu-charcoal">
          No Company Linked
        </h2>
        <p className="mt-2 font-body text-sm text-amu-slate">
          {error || 'You are not currently linked to a company account.'}
        </p>
        <p className="mt-4 font-body text-sm text-amu-slate">
          If your employer has registered with AMU, ask them for your company code
          to link your account.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/organisation/register"
            className="inline-flex items-center gap-2 rounded-lg bg-amu-navy px-4 py-2 font-heading text-sm text-white hover:bg-amu-navy/90"
          >
            <Building2 className="h-4 w-4" />
            Register Organisation
          </Link>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 rounded-lg border border-amu-slate/30 px-4 py-2 font-heading text-sm text-amu-charcoal hover:bg-amu-sky/30"
          >
            Continue Learning
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
