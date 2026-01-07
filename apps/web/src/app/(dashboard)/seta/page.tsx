'use client';

/**
 * SETA Dashboard Page - AMU Platform
 *
 * Overview of learner's SETA registration status, digital signatures,
 * certificates, and qualification pathway.
 *
 * Per Section 7.1: SETA/CHIETA integration for official recognition.
 *
 * "Ubuntu - I am because we are"
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import {
  Building2,
  Award,
  FileSignature,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  ArrowLeft,
  Loader2,
  GraduationCap,
  FileText,
  Shield,
  ExternalLink,
  RefreshCw,
  Mail,
} from 'lucide-react';
import Link from 'next/link';

// =============================================================================
// TYPES
// =============================================================================

interface SETARegistration {
  registration_id: string;
  registration_status: string;
  signatures_status: string;
  enrolment_form_signed_at?: string;
  enrolment_form_pdf_url?: string;
  triparty_signed_at?: string;
  triparty_pdf_url?: string;
  submitted_to_seta_at?: string;
  seta_reference_number?: string;
  seta_approval_date?: string;
  created_at: string;
  updated_at: string;
}

interface Certificate {
  id: string;
  certificate_course_title: string;
  certificate_template: 'official' | 'unofficial';
  certificate_status: string;
  certificate_issued_date: string;
  certificate_pdf_url?: string;
  certificate_verification_url: string;
  certificate_nqf_level?: number;
  certificate_credits?: number;
}

interface QualificationProgress {
  qualification_title: string;
  nqf_level: number;
  total_credits: number;
  earned_credits: number;
  modules_completed: number;
  modules_total: number;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function SETADashboardPage() {
  const router = useRouter();
  const { user, getIdToken, verificationStatus } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<SETARegistration | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [progress, setProgress] = useState<QualificationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendingSignature, setResendingSignature] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      // Fetch SETA registration
      const regResponse = await fetch('/api/verification/my-data', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const regData = await regResponse.json();
      if (regData.success) {
        setRegistration(regData.data);
      }

      // Fetch certificates
      const certResponse = await fetch('/api/certificates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const certData = await certResponse.json();
      if (certData.success) {
        setCertificates(certData.certificates || []);
      }

      // Mock qualification progress (in production, this would come from an API)
      setProgress({
        qualification_title: 'GFMAM Asset Management (NQF Level 5)',
        nqf_level: 5,
        total_credits: 120,
        earned_credits: 8,
        modules_completed: 1,
        modules_total: 15,
      });
    } catch (err) {
      console.error('Error fetching SETA data:', err);
      setError('Failed to load SETA information');
    } finally {
      setLoading(false);
    }
  }, [user, getIdToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Resend signature request
  const handleResendSignature = async () => {
    if (!user || !registration) return;

    try {
      setResendingSignature(true);
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch('/api/seta/resend-signature', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registration_id: registration.registration_id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Signature request has been resent. Please check your email.');
      } else {
        alert(data.error || 'Failed to resend signature request');
      }
    } catch (err) {
      console.error('Error resending signature:', err);
      alert('Failed to resend signature request');
    } finally {
      setResendingSignature(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amu-navy" />
          <p className="mt-4 text-amu-slate">Loading SETA dashboard...</p>
        </div>
      </div>
    );
  }

  // Not verified - redirect to verification
  if (verificationStatus !== 'verified') {
    return (
      <div className="mx-auto max-w-2xl py-8 px-4">
        <Card className="p-8 text-center">
          <Shield className="mx-auto h-16 w-16 text-amu-slate/50" />
          <h2 className="mt-4 font-heading text-xl font-semibold text-amu-navy">
            Identity Verification Required
          </h2>
          <p className="mt-2 text-amu-slate">
            You need to complete identity verification before accessing SETA features.
          </p>
          <Link href="/settings/identity">
            <Button className="mt-6">Start Verification</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const officialCerts = certificates.filter((c) => c.certificate_template === 'official');
  const unofficialCerts = certificates.filter((c) => c.certificate_template === 'unofficial');

  return (
    <div className="mx-auto max-w-5xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm text-amu-slate hover:text-amu-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amu-navy">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-amu-navy">
              SETA Dashboard
            </h1>
            <p className="mt-1 text-amu-slate">
              Manage your SETA registration, digital signatures, and official certificates
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <span className="ml-2">{error}</span>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Registration Status */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-amu-slate/10 px-6 py-4">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                <FileSignature className="h-5 w-5" />
                Registration Status
              </h2>
              <RegistrationBadge status={registration?.registration_status || 'pending'} />
            </div>

            <div className="p-6">
              {/* Progress Steps */}
              <div className="space-y-4">
                <RegistrationStep
                  label="Identity Verified"
                  status="completed"
                  description="Your identity has been verified"
                  icon={Shield}
                />

                <RegistrationStep
                  label="Enrolment Form Signed"
                  status={
                    registration?.enrolment_form_signed_at
                      ? 'completed'
                      : registration?.signatures_status === 'partial'
                      ? 'in_progress'
                      : 'pending'
                  }
                  description={
                    registration?.enrolment_form_signed_at
                      ? `Signed on ${new Date(registration.enrolment_form_signed_at).toLocaleDateString('en-ZA')}`
                      : 'Awaiting your signature'
                  }
                  icon={FileText}
                  action={
                    !registration?.enrolment_form_signed_at && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResendSignature}
                        disabled={resendingSignature}
                      >
                        {resendingSignature ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="mr-2 h-4 w-4" />
                        )}
                        Resend Email
                      </Button>
                    )
                  }
                />

                <RegistrationStep
                  label="Tri-Party Agreement"
                  status={
                    registration?.triparty_signed_at
                      ? 'completed'
                      : registration?.enrolment_form_signed_at
                      ? 'in_progress'
                      : 'pending'
                  }
                  description={
                    registration?.triparty_signed_at
                      ? `Signed on ${new Date(registration.triparty_signed_at).toLocaleDateString('en-ZA')}`
                      : 'Requires learner, employer, and provider signatures'
                  }
                  icon={FileSignature}
                />

                <RegistrationStep
                  label="Submitted to CHIETA"
                  status={
                    registration?.submitted_to_seta_at
                      ? 'completed'
                      : registration?.registration_status === 'signatures_complete'
                      ? 'in_progress'
                      : 'pending'
                  }
                  description={
                    registration?.seta_reference_number
                      ? `Reference: ${registration.seta_reference_number}`
                      : 'Will be submitted once all signatures are complete'
                  }
                  icon={Building2}
                />
              </div>

              {/* Download Documents */}
              {(registration?.enrolment_form_pdf_url || registration?.triparty_pdf_url) && (
                <div className="mt-6 border-t border-amu-slate/10 pt-6">
                  <h3 className="mb-3 font-heading text-sm font-semibold text-amu-navy">
                    Signed Documents
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {registration?.enrolment_form_pdf_url && (
                      <a
                        href={registration.enrolment_form_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-amu-slate/20 px-4 py-2 text-sm text-amu-navy hover:bg-amu-sky/10"
                      >
                        <Download className="h-4 w-4" />
                        Enrolment Form
                      </a>
                    )}
                    {registration?.triparty_pdf_url && (
                      <a
                        href={registration.triparty_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-amu-slate/20 px-4 py-2 text-sm text-amu-navy hover:bg-amu-sky/10"
                      >
                        <Download className="h-4 w-4" />
                        Tri-Party Agreement
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Official Certificates */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                <Award className="h-5 w-5" />
                Official Certificates
              </h2>
              <span className="rounded bg-amu-navy px-2 py-0.5 text-xs font-medium text-white">
                {officialCerts.length}
              </span>
            </div>

            {officialCerts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-amu-slate/30 p-8 text-center">
                <Award className="mx-auto h-12 w-12 text-amu-slate/30" />
                <p className="mt-4 text-sm text-amu-slate">
                  No official certificates yet. Complete courses and purchase official
                  certificates to see them here.
                </p>
                <Link href="/certificates/purchase">
                  <Button variant="outline" className="mt-4">
                    Purchase Certificate
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {officialCerts.map((cert) => (
                  <CertificateCard key={cert.id} certificate={cert} />
                ))}
              </div>
            )}
          </Card>

          {/* Unofficial Certificates */}
          {unofficialCerts.length > 0 && (
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                  <FileText className="h-5 w-5" />
                  Unofficial Certificates
                </h2>
                <span className="rounded bg-amu-slate/20 px-2 py-0.5 text-xs font-medium text-amu-slate">
                  {unofficialCerts.length}
                </span>
              </div>

              <p className="mb-4 text-sm text-amu-slate">
                These certificates have a watermark. Upgrade to official certificates
                for SETA recognition.
              </p>

              <div className="space-y-3">
                {unofficialCerts.map((cert) => (
                  <CertificateCard key={cert.id} certificate={cert} showUpgrade />
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Qualification Progress */}
          {progress && (
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                <GraduationCap className="h-5 w-5" />
                Qualification Progress
              </h2>

              <div className="mb-4">
                <p className="font-medium text-amu-charcoal">{progress.qualification_title}</p>
                <p className="text-sm text-amu-slate">NQF Level {progress.nqf_level}</p>
              </div>

              {/* Credits Progress Bar */}
              <div className="mb-4">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-amu-slate">Credits Earned</span>
                  <span className="font-medium text-amu-navy">
                    {progress.earned_credits} / {progress.total_credits}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-amu-sky/50">
                  <div
                    className="h-full rounded-full bg-amu-navy transition-all"
                    style={{
                      width: `${(progress.earned_credits / progress.total_credits) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Modules Progress */}
              <div className="mb-4">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-amu-slate">Modules Completed</span>
                  <span className="font-medium text-amu-navy">
                    {progress.modules_completed} / {progress.modules_total}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-amu-sky/50">
                  <div
                    className="h-full rounded-full bg-green-600 transition-all"
                    style={{
                      width: `${(progress.modules_completed / progress.modules_total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <Link href="/learn">
                <Button variant="outline" className="w-full">
                  Continue Learning
                </Button>
              </Link>
            </Card>
          )}

          {/* CHIETA Info */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
              <Building2 className="h-5 w-5" />
              About CHIETA
            </h2>

            <p className="mb-4 text-sm text-amu-slate">
              The Chemical Industries Education and Training Authority (CHIETA)
              is the SETA responsible for asset management qualifications in South Africa.
            </p>

            <ul className="space-y-2 text-sm text-amu-charcoal">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                Nationally recognised qualifications
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                NQF-aligned unit standards
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                B-BBEE skills development points
              </li>
            </ul>

            <a
              href="https://www.chieta.org.za"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-1 text-sm text-amu-navy hover:underline"
            >
              Visit CHIETA website
              <ExternalLink className="h-3 w-3" />
            </a>
          </Card>

          {/* Support */}
          <Card className="p-6">
            <h2 className="mb-4 font-heading text-lg font-semibold text-amu-navy">
              Need Help?
            </h2>
            <p className="mb-4 text-sm text-amu-slate">
              Questions about your SETA registration or certificates?
            </p>
            <a href="mailto:seta@amu.ac.za">
              <Button variant="outline" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Contact SETA Support
              </Button>
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function RegistrationBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' },
    awaiting_signatures: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      label: 'Awaiting Signatures',
    },
    signatures_complete: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'Signatures Complete',
    },
    submitted_to_seta: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      label: 'Submitted to SETA',
    },
    approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
  };

  const config = configs[status] || configs.pending;

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

function RegistrationStep({
  label,
  status,
  description,
  icon: Icon,
  action,
}: {
  label: string;
  status: 'completed' | 'in_progress' | 'pending';
  description: string;
  icon: typeof CheckCircle;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          status === 'completed'
            ? 'bg-green-100 text-green-600'
            : status === 'in_progress'
            ? 'bg-amber-100 text-amber-600'
            : 'bg-amu-slate/10 text-amu-slate'
        }`}
      >
        {status === 'completed' ? (
          <CheckCircle className="h-5 w-5" />
        ) : status === 'in_progress' ? (
          <Clock className="h-5 w-5" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </div>
      <div className="flex-1">
        <p
          className={`font-medium ${
            status === 'completed'
              ? 'text-green-800'
              : status === 'in_progress'
              ? 'text-amber-800'
              : 'text-amu-slate'
          }`}
        >
          {label}
        </p>
        <p className="text-sm text-amu-slate">{description}</p>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}

function CertificateCard({
  certificate,
  showUpgrade,
}: {
  certificate: Certificate;
  showUpgrade?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-amu-slate/20 p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            certificate.certificate_template === 'official'
              ? 'bg-amu-navy text-white'
              : 'bg-amu-slate/10 text-amu-slate'
          }`}
        >
          <Award className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-amu-charcoal">
            {certificate.certificate_course_title}
          </p>
          <p className="text-sm text-amu-slate">
            Issued {new Date(certificate.certificate_issued_date).toLocaleDateString('en-ZA')}
            {certificate.certificate_nqf_level &&
              ` | NQF ${certificate.certificate_nqf_level}`}
            {certificate.certificate_credits &&
              ` | ${certificate.certificate_credits} credits`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {certificate.certificate_pdf_url && (
          <a
            href={certificate.certificate_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-2 text-amu-navy hover:bg-amu-sky/20"
            title="Download Certificate"
          >
            <Download className="h-5 w-5" />
          </a>
        )}
        {showUpgrade && (
          <Link href={`/certificates/purchase?certificate_id=${certificate.id}`}>
            <Button size="sm">Upgrade</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
