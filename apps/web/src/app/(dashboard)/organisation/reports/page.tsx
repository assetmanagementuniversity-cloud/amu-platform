'use client';

/**
 * SETA Reports Page - AMU Corporate Portal
 *
 * Export employee competency achievements for Skills Development Act
 * tax rebate claims (Section 17.6, 24.4).
 *
 * "Ubuntu - I am because we are"
 * Companies enable their teams to grow together.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  getUserCompany,
  isCompanyAdmin,
  generateSetaExport,
  getSetaReportSummary,
} from '@/lib/organisation';
import type { Company } from '@/lib/organisation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Users,
  Award,
  FileText,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Building2,
  TrendingUp,
} from 'lucide-react';

interface ReportSummary {
  total_employees: number;
  employees_with_achievements: number;
  total_competencies: number;
  total_official_certificates: number;
  total_courses_completed: number;
  period_start: string;
  period_end: string;
}

export default function SetaReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Report options
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [includeUnofficial, setIncludeUnofficial] = useState(false);

  // Summary data
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        const companyResult = await getUserCompany(user.uid);
        if (companyResult.success && companyResult.company) {
          setCompany(companyResult.company);

          const adminCheck = await isCompanyAdmin(
            user.uid,
            companyResult.company.company_id
          );
          setIsAdmin(adminCheck);

          // Set default date range (current tax year)
          const now = new Date();
          const taxYearStart = now.getMonth() >= 2 // March onwards
            ? new Date(now.getFullYear(), 2, 1) // March 1 this year
            : new Date(now.getFullYear() - 1, 2, 1); // March 1 last year
          const taxYearEnd = new Date(taxYearStart);
          taxYearEnd.setFullYear(taxYearEnd.getFullYear() + 1);
          taxYearEnd.setDate(taxYearEnd.getDate() - 1);

          setStartDate(taxYearStart.toISOString().split('T')[0]);
          setEndDate(now.toISOString().split('T')[0]);

          // Load summary
          if (adminCheck) {
            await loadSummary(companyResult.company.company_id);
          }
        } else {
          setError('No company found. Please register your organisation first.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load company');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const loadSummary = async (companyId: string) => {
    if (!user) return;

    setLoadingSummary(true);
    try {
      const result = await getSetaReportSummary(
        companyId,
        user.uid,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      if (result.success && result.summary) {
        setSummary(result.summary);
      }
    } catch (err) {
      console.error('Failed to load summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleExport = async () => {
    if (!company || !user) return;

    setIsExporting(true);
    setError(null);
    setExportSuccess(false);

    try {
      const result = await generateSetaExport({
        companyId: company.company_id,
        requesterId: user.uid,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        includeUnofficial,
      });

      if (result.success && result.csv_data) {
        // Create and download the CSV file
        const blob = new Blob([result.csv_data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = result.filename || 'seta_report.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 5000);
      } else {
        setError(result.error || 'Failed to generate export');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDateChange = () => {
    if (company) {
      loadSummary(company.company_id);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-amu-navy border-t-transparent" />
          <p className="text-amu-slate">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <span className="ml-2">{error || 'No company found'}</span>
        </Alert>
        <Button onClick={() => router.push('/organisation/register')}>
          Register Your Organisation
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="ml-2">Only company admins can access SETA reports</span>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/organisation')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amu-navy">
            <FileSpreadsheet className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-[24pt] font-normal text-amu-navy">
              SETA / Skills Development Reports
            </h1>
            <p className="text-amu-slate">
              Export competency achievements for tax rebate claims
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {exportSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="ml-2 text-green-800">
            Report downloaded successfully!
          </span>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Info Card */}
      <Card className="mb-6 bg-amu-sky/20 p-6">
        <h3 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
          <FileText className="h-5 w-5" />
          About SETA Reporting
        </h3>
        <p className="mb-4 text-sm text-amu-charcoal">
          The Skills Development Act (No. 97 of 1998) allows South African companies
          to claim tax rebates for employee training. This report generates a CSV file
          documenting all competency achievements that can be submitted with your
          Workplace Skills Plan (WSP) and Annual Training Report (ATR).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-4">
            <p className="mb-1 text-sm font-medium text-amu-navy">SDL Number</p>
            <p className="text-amu-charcoal">
              {company.company_sdl_number || 'Not configured'}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4">
            <p className="mb-1 text-sm font-medium text-amu-navy">SETA Sector</p>
            <p className="text-amu-charcoal">
              {company.company_seta_sector || 'Not configured'}
            </p>
          </div>
        </div>
        {(!company.company_sdl_number || !company.company_seta_sector) && (
          <p className="mt-4 text-sm text-amber-700">
            Configure your SDL Number and SETA Sector in your company profile for
            complete SETA reporting.
          </p>
        )}
      </Card>

      {/* Summary Stats */}
      {summary && (
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amu-navy">
                  {summary.employees_with_achievements}
                </p>
                <p className="text-xs text-amu-slate">
                  Employees with Achievements
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amu-navy">
                  {summary.total_competencies}
                </p>
                <p className="text-xs text-amu-slate">Total Competencies</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amu-navy">
                  {summary.total_official_certificates}
                </p>
                <p className="text-xs text-amu-slate">Official Certificates</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amu-navy">
                  {summary.total_courses_completed}
                </p>
                <p className="text-xs text-amu-slate">Courses Completed</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Export Options */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
          <Calendar className="h-5 w-5" />
          Report Options
        </h3>

        <div className="space-y-6">
          {/* Date Range */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onBlur={handleDateChange}
              />
              <p className="mt-1 text-xs text-amu-slate">
                SA Tax year: 1 March - 28 February
              </p>
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onBlur={handleDateChange}
              />
            </div>
          </div>

          {/* Certificate Type */}
          <div>
            <Label className="mb-3 block">Certificate Types to Include</Label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="h-4 w-4 rounded border-amu-slate/30"
                />
                <span className="text-sm text-amu-charcoal">
                  Official Certificates (always included)
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeUnofficial}
                  onChange={(e) => setIncludeUnofficial(e.target.checked)}
                  className="h-4 w-4 rounded border-amu-slate/30"
                />
                <span className="text-sm text-amu-charcoal">
                  Include Unofficial Certificates
                </span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                  May not qualify for rebates
                </span>
              </label>
            </div>
          </div>

          {/* Export Button */}
          <div className="border-t border-amu-slate/20 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-amu-charcoal">
                  Ready to Export
                </p>
                <p className="text-sm text-amu-slate">
                  CSV format compatible with Excel and most SETA submission
                  systems
                </p>
              </div>
              <Button
                onClick={handleExport}
                loading={isExporting}
                disabled={isExporting || loadingSummary}
                size="lg"
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV Report
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Report Contents Info */}
      <Card className="mt-6 p-6">
        <h3 className="mb-4 font-heading text-lg font-semibold text-amu-navy">
          What&apos;s Included in the Report
        </h3>
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="mb-2 font-medium text-amu-navy">Employee Information</p>
            <ul className="space-y-1 text-amu-slate">
              <li>- Full Name</li>
              <li>- ID Number (if provided)</li>
              <li>- Email Address</li>
              <li>- Job Title (if provided)</li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-medium text-amu-navy">Training Information</p>
            <ul className="space-y-1 text-amu-slate">
              <li>- Course Title</li>
              <li>- NQF Level & Credits</li>
              <li>- Competency Name & Code</li>
              <li>- Achievement Date</li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-medium text-amu-navy">
              Certificate Information
            </p>
            <ul className="space-y-1 text-amu-slate">
              <li>- Certificate Number</li>
              <li>- Certificate Type (Official/Unofficial)</li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-medium text-amu-navy">Company Information</p>
            <ul className="space-y-1 text-amu-slate">
              <li>- Company Name</li>
              <li>- SDL Number</li>
              <li>- SETA Sector</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
