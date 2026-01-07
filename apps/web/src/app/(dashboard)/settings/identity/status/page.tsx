'use client';

/**
 * Verification Status Page - AMU Platform
 *
 * Shows the current status of identity verification and SETA registration.
 * Per Section 10.3: AI-automated verification with Socratic dispute resolution.
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
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Upload,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Loader2,
  MessageSquare,
  FileSignature,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

// =============================================================================
// TYPES
// =============================================================================

interface VerificationStatusData {
  hasSubmitted: boolean;
  latestResult: 'success' | 'failure' | null;
  overallConfidence: number | null;
  hasActiveDispute: boolean;
  disputeStatus: string | null;
  fieldsNeedingAttention: string[];
  resolutionAttempts: number;
  maxAttempts: number;
}

interface DisputeGuidance {
  hasDispute: boolean;
  guidance?: string;
  fieldsToReview?: string[];
  attemptsRemaining?: number;
}

interface SETARegistration {
  registration_status: string;
  signatures_status: string;
  enrolment_form_signed_at?: string;
  triparty_signed_at?: string;
  submitted_to_seta_at?: string;
  seta_reference_number?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function VerificationStatusPage() {
  const router = useRouter();
  const { user, getIdToken, verificationStatus } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<VerificationStatusData | null>(null);
  const [guidance, setGuidance] = useState<DisputeGuidance | null>(null);
  const [setaReg, setSetaReg] = useState<SETARegistration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch status
  const fetchStatus = useCallback(async () => {
    if (!user) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      // Fetch verification status
      const statusResponse = await fetch('/api/verification/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statusData = await statusResponse.json();

      if (statusData.success) {
        setStatus(statusData.data);
      }

      // Fetch dispute guidance if needed
      const guidanceResponse = await fetch('/api/verification/dispute-guidance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const guidanceData = await guidanceResponse.json();

      if (guidanceData.success) {
        setGuidance(guidanceData.data);
      }

      // Fetch SETA registration if verified
      if (verificationStatus === 'verified') {
        const setaResponse = await fetch('/api/verification/my-data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const setaData = await setaResponse.json();

        if (setaData.success && setaData.data) {
          setSetaReg(setaData.data);
        }
      }
    } catch (err) {
      console.error('Error fetching status:', err);
      setError('Failed to load verification status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, getIdToken, verificationStatus]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatus();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amu-navy" />
          <p className="mt-4 text-amu-slate">Loading verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm text-amu-slate hover:text-amu-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amu-navy">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold text-amu-navy">
                Verification Status
              </h1>
              <p className="mt-1 text-amu-slate">
                Track your identity verification and SETA registration progress
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <span className="ml-2">{error}</span>
        </Alert>
      )}

      {/* Main Status Card */}
      <Card className="mb-6 overflow-hidden">
        <StatusHeader status={verificationStatus} />

        <div className="p-6">
          {/* Not Started */}
          {verificationStatus === 'none' && (
            <div className="text-center">
              <p className="mb-6 text-amu-slate">
                You haven't started the identity verification process yet.
                Complete verification to unlock Tier 3 benefits including official
                SETA-registered certificates.
              </p>
              <Link href="/settings/identity">
                <Button>
                  Start Verification
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          {/* Pending */}
          {verificationStatus === 'pending' && (
            <div>
              <div className="mb-6 rounded-lg bg-amber-50 p-4">
                <h3 className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold text-amber-800">
                  <Clock className="h-4 w-4" />
                  Verification In Progress
                </h3>
                <p className="text-sm text-amber-700">
                  Your documents are being verified automatically by our AI system.
                  This typically completes within minutes.
                </p>
              </div>

              <div className="space-y-3">
                <StatusStep
                  label="Documents Uploaded"
                  status="completed"
                  icon={Upload}
                />
                <StatusStep
                  label="AI Verification"
                  status="in_progress"
                  icon={Shield}
                />
                <StatusStep
                  label="SETA Registration"
                  status="pending"
                  icon={Building2}
                />
                <StatusStep
                  label="Digital Signatures"
                  status="pending"
                  icon={FileSignature}
                />
              </div>
            </div>
          )}

          {/* Action Required (Dispute) */}
          {verificationStatus === 'action_required' && guidance?.hasDispute && (
            <div>
              <Alert className="mb-6 border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <div className="ml-2">
                  <p className="font-medium text-amber-800">Action Required</p>
                  <p className="text-sm text-amber-700">
                    We found some issues that need your attention.
                    {guidance.attemptsRemaining !== undefined &&
                      ` You have ${guidance.attemptsRemaining} attempt(s) remaining.`}
                  </p>
                </div>
              </Alert>

              {guidance.fieldsToReview && guidance.fieldsToReview.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 font-heading text-sm font-semibold text-amu-navy">
                    Fields Needing Attention:
                  </h3>
                  <ul className="space-y-2">
                    {guidance.fieldsToReview.map((field, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-amu-charcoal"
                      >
                        <XCircle className="h-4 w-4 text-amber-500" />
                        {formatFieldName(field)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {guidance.guidance && (
                <div className="mb-6 rounded-lg bg-amu-sky/30 p-4">
                  <h3 className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
                    <MessageSquare className="h-4 w-4" />
                    Guidance
                  </h3>
                  <p className="text-sm text-amu-charcoal">{guidance.guidance}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Link href="/settings/identity/edit">
                  <Button>
                    Update Information
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/learn">
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat with Facilitator
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Verified */}
          {verificationStatus === 'verified' && (
            <div>
              <div className="mb-6 rounded-lg bg-green-50 p-4">
                <h3 className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  Tier 3 Verified
                </h3>
                <p className="text-sm text-green-700">
                  Your identity has been verified. You are now eligible for
                  official SETA-registered certificates.
                </p>
              </div>

              {/* SETA Registration Progress */}
              {setaReg && (
                <div className="space-y-3">
                  <h3 className="font-heading text-sm font-semibold text-amu-navy">
                    SETA Registration Progress
                  </h3>

                  <StatusStep
                    label="Identity Verified"
                    status="completed"
                    icon={Shield}
                  />
                  <StatusStep
                    label="Enrolment Form"
                    status={
                      setaReg.enrolment_form_signed_at
                        ? 'completed'
                        : setaReg.signatures_status === 'partial'
                        ? 'in_progress'
                        : 'pending'
                    }
                    icon={FileText}
                    detail={
                      setaReg.enrolment_form_signed_at
                        ? `Signed ${new Date(setaReg.enrolment_form_signed_at).toLocaleDateString('en-ZA')}`
                        : undefined
                    }
                  />
                  <StatusStep
                    label="Tri-Party Agreement"
                    status={
                      setaReg.triparty_signed_at
                        ? 'completed'
                        : setaReg.enrolment_form_signed_at
                        ? 'in_progress'
                        : 'pending'
                    }
                    icon={FileSignature}
                    detail={
                      setaReg.triparty_signed_at
                        ? `Signed ${new Date(setaReg.triparty_signed_at).toLocaleDateString('en-ZA')}`
                        : undefined
                    }
                  />
                  <StatusStep
                    label="Submitted to SETA"
                    status={
                      setaReg.submitted_to_seta_at
                        ? 'completed'
                        : setaReg.registration_status === 'signatures_complete'
                        ? 'in_progress'
                        : 'pending'
                    }
                    icon={Building2}
                    detail={
                      setaReg.seta_reference_number
                        ? `Reference: ${setaReg.seta_reference_number}`
                        : undefined
                    }
                  />
                </div>
              )}

              <div className="mt-6">
                <Link href="/seta">
                  <Button>
                    View SETA Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Rejected */}
          {verificationStatus === 'rejected' && (
            <div>
              <Alert variant="destructive" className="mb-6">
                <XCircle className="h-4 w-4" />
                <div className="ml-2">
                  <p className="font-medium">Verification Not Approved</p>
                  <p className="text-sm">
                    Your verification was not approved after multiple attempts.
                    Please contact support for assistance.
                  </p>
                </div>
              </Alert>

              <Link href="mailto:support@amu.ac.za">
                <Button variant="outline">Contact Support</Button>
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* Benefits Card */}
      {verificationStatus !== 'verified' && (
        <Card className="p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold text-amu-navy">
            Tier 3 Benefits
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-amu-charcoal">
                  Official SETA Certificates
                </p>
                <p className="text-sm text-amu-slate">
                  Receive certificates without the &quot;UNOFFICIAL&quot; watermark
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-amu-charcoal">
                  National Learner Records Database
                </p>
                <p className="text-sm text-amu-slate">
                  Your achievements are recorded on the NLRD
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-amu-charcoal">
                  Skills Development Tax Benefits
                </p>
                <p className="text-sm text-amu-slate">
                  Your employer can claim SDL refunds for your training
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-amu-charcoal">
                  B-BBEE Recognition
                </p>
                <p className="text-sm text-amu-slate">
                  Contributes to your employer&apos;s B-BBEE scorecard
                </p>
              </div>
            </li>
          </ul>
        </Card>
      )}
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function StatusHeader({ status }: { status: string }) {
  const configs: Record<
    string,
    { bg: string; icon: typeof CheckCircle; iconBg: string; title: string }
  > = {
    none: {
      bg: 'bg-amu-sky/30',
      icon: Shield,
      iconBg: 'bg-amu-slate/20 text-amu-slate',
      title: 'Not Started',
    },
    pending: {
      bg: 'bg-amber-50',
      icon: Clock,
      iconBg: 'bg-amber-100 text-amber-600',
      title: 'Verification Pending',
    },
    action_required: {
      bg: 'bg-amber-50',
      icon: AlertCircle,
      iconBg: 'bg-amber-100 text-amber-600',
      title: 'Action Required',
    },
    verified: {
      bg: 'bg-green-50',
      icon: CheckCircle,
      iconBg: 'bg-green-100 text-green-600',
      title: 'Verified - Tier 3',
    },
    rejected: {
      bg: 'bg-red-50',
      icon: XCircle,
      iconBg: 'bg-red-100 text-red-600',
      title: 'Not Approved',
    },
  };

  const config = configs[status] || configs.none;
  const IconComponent = config.icon;

  return (
    <div className={`${config.bg} px-6 py-6 text-center`}>
      <div
        className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${config.iconBg}`}
      >
        <IconComponent className="h-8 w-8" />
      </div>
      <h2 className="font-heading text-xl font-semibold text-amu-navy">
        {config.title}
      </h2>
    </div>
  );
}

function StatusStep({
  label,
  status,
  icon: Icon,
  detail,
}: {
  label: string;
  status: 'completed' | 'in_progress' | 'pending';
  icon: typeof CheckCircle;
  detail?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          status === 'completed'
            ? 'bg-green-100 text-green-600'
            : status === 'in_progress'
            ? 'bg-amber-100 text-amber-600'
            : 'bg-amu-slate/10 text-amu-slate'
        }`}
      >
        {status === 'completed' ? (
          <CheckCircle className="h-4 w-4" />
        ) : status === 'in_progress' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${
            status === 'completed'
              ? 'text-green-800'
              : status === 'in_progress'
              ? 'text-amber-800'
              : 'text-amu-slate'
          }`}
        >
          {label}
        </p>
        {detail && <p className="text-xs text-amu-slate">{detail}</p>}
      </div>
    </div>
  );
}

function formatFieldName(field: string): string {
  // Convert snake_case to Title Case
  return field
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
