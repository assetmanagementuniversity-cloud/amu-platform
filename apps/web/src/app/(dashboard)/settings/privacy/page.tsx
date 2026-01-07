'use client';

/**
 * Privacy Dashboard - AMU Platform
 *
 * POPI Act Compliance Page (Section 7.3.3)
 *
 * Allows learners to:
 * - View what data AMU holds about them
 * - See data processing purposes
 * - View third-party sharing disclosures
 * - Export their personal data
 * - Request account deletion
 * - Manage consent preferences
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
  Download,
  Trash2,
  Eye,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  XCircle,
  Building2,
  CreditCard,
  FileSignature,
  Database,
  ArrowLeft,
  Mail,
  Bell,
  BellOff,
} from 'lucide-react';

// ============================================
// Types
// ============================================

interface DataCategory {
  category: string;
  description: string;
  purpose: string;
  retention: string;
  thirdPartySharing?: string;
}

interface ThirdPartyRecipient {
  recipient: string;
  purpose: string;
  data_shared: string[];
}

interface PrivacySummary {
  has_seta_registration: boolean;
  enrolments_count: number;
  certificates_count: number;
  marketing_consent: boolean;
  deletion_pending: boolean;
  deletion_scheduled_date: string | null;
  last_login: string | null;
  account_created: string | null;
}

interface PrivacyData {
  user_id: string;
  email: string;
  data_categories: DataCategory[];
  personal_data: {
    profile: Record<string, unknown>;
    enrolments: Record<string, unknown>[];
    certificates: Record<string, unknown>[];
    conversations_count: number;
    seta_registration?: Record<string, unknown>;
  };
  consents: {
    consent_type: string;
    consented: boolean;
    consented_at: string;
  }[];
  data_processing_purposes: string[];
  third_party_sharing: ThirdPartyRecipient[];
  generated_at: string;
}

// ============================================
// API Functions
// ============================================

async function fetchPrivacySummary(token: string): Promise<PrivacySummary> {
  const response = await fetch('/api/privacy/summary', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch summary');
  return data.data;
}

async function fetchPrivacyData(token: string): Promise<PrivacyData> {
  const response = await fetch('/api/privacy/my-data', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch data');
  return data.data;
}

async function requestDataExport(token: string): Promise<{ export_id: string; message: string }> {
  const response = await fetch('/api/privacy/export', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to request export');
  return data;
}

async function requestAccountDeletion(
  token: string,
  reason: string
): Promise<{ deletion_id: string; scheduled_date: string }> {
  const response = await fetch('/api/privacy/delete', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      confirmation: 'DELETE MY ACCOUNT',
      reason,
    }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to request deletion');
  return data;
}

async function cancelAccountDeletion(token: string): Promise<void> {
  const response = await fetch('/api/privacy/delete/cancel', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to cancel deletion');
}

async function updateMarketingConsent(token: string, consented: boolean): Promise<void> {
  const response = await fetch('/api/privacy/consents/marketing', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ consented }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to update consent');
}

// ============================================
// Main Component
// ============================================

export default function PrivacyDashboardPage() {
  const router = useRouter();
  const { user, getIdToken } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PrivacySummary | null>(null);
  const [privacyData, setPrivacyData] = useState<PrivacyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Section expand states
  const [showDataDetails, setShowDataDetails] = useState(false);
  const [showThirdParties, setShowThirdParties] = useState(false);
  const [showPersonalData, setShowPersonalData] = useState(false);

  // Action states
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [marketingLoading, setMarketingLoading] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const [summaryData, fullData] = await Promise.all([
        fetchPrivacySummary(token),
        fetchPrivacyData(token),
      ]);

      setSummary(summaryData);
      setPrivacyData(fullData);
    } catch (err) {
      console.error('Error loading privacy data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load privacy data');
    } finally {
      setLoading(false);
    }
  }, [user, getIdToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle data export
  const handleExport = async () => {
    if (!user) return;

    try {
      setExportLoading(true);
      setError(null);

      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      await requestDataExport(token);
      setExportSuccess(true);

      // Reset after 5 seconds
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err) {
      console.error('Error requesting export:', err);
      setError(err instanceof Error ? err.message : 'Failed to request data export');
    } finally {
      setExportLoading(false);
    }
  };

  // Handle account deletion
  const handleDelete = async () => {
    if (!user || !deleteReason.trim()) return;

    try {
      setDeleteLoading(true);
      setError(null);

      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      await requestAccountDeletion(token, deleteReason);

      // Refresh data to show pending deletion
      await loadData();
      setShowDeleteConfirm(false);
      setDeleteReason('');
    } catch (err) {
      console.error('Error requesting deletion:', err);
      setError(err instanceof Error ? err.message : 'Failed to request account deletion');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle cancel deletion
  const handleCancelDeletion = async () => {
    if (!user) return;

    try {
      setDeleteLoading(true);
      setError(null);

      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      await cancelAccountDeletion(token);

      // Refresh data
      await loadData();
    } catch (err) {
      console.error('Error cancelling deletion:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel deletion');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle marketing consent toggle
  const handleMarketingToggle = async () => {
    if (!user || !summary) return;

    try {
      setMarketingLoading(true);
      setError(null);

      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const newValue = !summary.marketing_consent;
      await updateMarketingConsent(token, newValue);

      // Update local state
      setSummary((prev) => prev ? { ...prev, marketing_consent: newValue } : null);
    } catch (err) {
      console.error('Error updating marketing consent:', err);
      setError(err instanceof Error ? err.message : 'Failed to update consent');
    } finally {
      setMarketingLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amu-navy" />
          <p className="mt-4 text-amu-slate">Loading your privacy settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm text-amu-slate hover:text-amu-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amu-navy">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-amu-navy">
              Privacy & Data Protection
            </h1>
            <p className="mt-1 text-amu-slate">
              Manage your personal data in accordance with the Protection of Personal Information Act (POPIA)
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

      {/* Deletion Pending Alert */}
      {summary?.deletion_pending && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <div className="ml-2">
            <p className="font-medium text-red-800">Account Deletion Scheduled</p>
            <p className="text-sm text-red-700">
              Your account will be deleted on{' '}
              {new Date(summary.deletion_scheduled_date!).toLocaleDateString('en-ZA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              . You can cancel this request below.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
              onClick={handleCancelDeletion}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Cancel Deletion Request
            </Button>
          </div>
        </Alert>
      )}

      {/* Quick Summary */}
      {summary && (
        <Card className="mb-6 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
            <Eye className="h-5 w-5" />
            Your Data Summary
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-amu-sky/30 p-4 text-center">
              <p className="text-2xl font-bold text-amu-navy">{summary.enrolments_count}</p>
              <p className="text-sm text-amu-slate">Course Enrolments</p>
            </div>
            <div className="rounded-lg bg-amu-sky/30 p-4 text-center">
              <p className="text-2xl font-bold text-amu-navy">{summary.certificates_count}</p>
              <p className="text-sm text-amu-slate">Certificates</p>
            </div>
            <div className="rounded-lg bg-amu-sky/30 p-4 text-center">
              <p className="text-2xl font-bold text-amu-navy">
                {summary.has_seta_registration ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-amu-slate">SETA Registration</p>
            </div>
            <div className="rounded-lg bg-amu-sky/30 p-4 text-center">
              <p className="text-sm text-amu-navy">
                {summary.account_created
                  ? new Date(summary.account_created).toLocaleDateString('en-ZA')
                  : 'Unknown'}
              </p>
              <p className="text-sm text-amu-slate">Member Since</p>
            </div>
          </div>
        </Card>
      )}

      {/* Data We Collect */}
      {privacyData && (
        <Card className="mb-6 overflow-hidden">
          <button
            onClick={() => setShowDataDetails(!showDataDetails)}
            className="flex w-full items-center justify-between p-6 text-left hover:bg-amu-sky/10"
          >
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-amu-navy" />
              <div>
                <h2 className="font-heading text-lg font-semibold text-amu-navy">
                  Data We Collect
                </h2>
                <p className="text-sm text-amu-slate">
                  {privacyData.data_categories.length} categories of personal information
                </p>
              </div>
            </div>
            {showDataDetails ? (
              <ChevronUp className="h-5 w-5 text-amu-slate" />
            ) : (
              <ChevronDown className="h-5 w-5 text-amu-slate" />
            )}
          </button>

          {showDataDetails && (
            <div className="border-t border-amu-slate/10 p-6">
              <div className="space-y-4">
                {privacyData.data_categories.map((category, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-amu-slate/20 p-4"
                  >
                    <h3 className="font-medium text-amu-charcoal">{category.category}</h3>
                    <p className="mt-1 text-sm text-amu-slate">{category.description}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs">
                      <span className="flex items-center gap-1 text-amu-navy">
                        <Settings className="h-3 w-3" />
                        Purpose: {category.purpose}
                      </span>
                      <span className="flex items-center gap-1 text-amu-slate">
                        <Clock className="h-3 w-3" />
                        Retention: {category.retention}
                      </span>
                    </div>
                    {category.thirdPartySharing && (
                      <p className="mt-2 text-xs text-amber-700">
                        Shared with: {category.thirdPartySharing}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="mb-2 font-medium text-amu-charcoal">
                  Why We Process Your Data
                </h3>
                <ul className="space-y-1">
                  {privacyData.data_processing_purposes.map((purpose, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-amu-slate">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      {purpose}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Third-Party Sharing */}
      {privacyData && (
        <Card className="mb-6 overflow-hidden">
          <button
            onClick={() => setShowThirdParties(!showThirdParties)}
            className="flex w-full items-center justify-between p-6 text-left hover:bg-amu-sky/10"
          >
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-amu-navy" />
              <div>
                <h2 className="font-heading text-lg font-semibold text-amu-navy">
                  Third-Party Data Sharing
                </h2>
                <p className="text-sm text-amu-slate">
                  {privacyData.third_party_sharing.length} organisations may receive your data
                </p>
              </div>
            </div>
            {showThirdParties ? (
              <ChevronUp className="h-5 w-5 text-amu-slate" />
            ) : (
              <ChevronDown className="h-5 w-5 text-amu-slate" />
            )}
          </button>

          {showThirdParties && (
            <div className="border-t border-amu-slate/10 p-6">
              <div className="space-y-4">
                {privacyData.third_party_sharing.map((recipient, index) => {
                  const IconComponent =
                    recipient.recipient.includes('CHIETA') ? Building2 :
                    recipient.recipient.includes('Stripe') ? CreditCard :
                    recipient.recipient.includes('SignRequest') ? FileSignature :
                    Database;

                  return (
                    <div
                      key={index}
                      className="rounded-lg border border-amu-slate/20 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className="mt-0.5 h-5 w-5 text-amu-navy" />
                        <div className="flex-1">
                          <h3 className="font-medium text-amu-charcoal">
                            {recipient.recipient}
                          </h3>
                          <p className="mt-1 text-sm text-amu-slate">
                            {recipient.purpose}
                          </p>
                          <div className="mt-2">
                            <p className="text-xs font-medium text-amu-charcoal">Data shared:</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {recipient.data_shared.map((data, i) => (
                                <span
                                  key={i}
                                  className="rounded bg-amu-sky/50 px-2 py-0.5 text-xs text-amu-charcoal"
                                >
                                  {data}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* View Personal Data */}
      {privacyData && (
        <Card className="mb-6 overflow-hidden">
          <button
            onClick={() => setShowPersonalData(!showPersonalData)}
            className="flex w-full items-center justify-between p-6 text-left hover:bg-amu-sky/10"
          >
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-amu-navy" />
              <div>
                <h2 className="font-heading text-lg font-semibold text-amu-navy">
                  View Your Personal Data
                </h2>
                <p className="text-sm text-amu-slate">
                  See all the information AMU holds about you
                </p>
              </div>
            </div>
            {showPersonalData ? (
              <ChevronUp className="h-5 w-5 text-amu-slate" />
            ) : (
              <ChevronDown className="h-5 w-5 text-amu-slate" />
            )}
          </button>

          {showPersonalData && (
            <div className="border-t border-amu-slate/10 p-6">
              <div className="space-y-6">
                {/* Profile Data */}
                <div>
                  <h3 className="mb-2 font-medium text-amu-charcoal">Profile Information</h3>
                  <div className="rounded-lg bg-amu-slate/5 p-4">
                    <pre className="overflow-x-auto text-xs text-amu-charcoal">
                      {JSON.stringify(privacyData.personal_data.profile, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Enrolments */}
                {privacyData.personal_data.enrolments.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-medium text-amu-charcoal">
                      Course Enrolments ({privacyData.personal_data.enrolments.length})
                    </h3>
                    <div className="rounded-lg bg-amu-slate/5 p-4">
                      <pre className="overflow-x-auto text-xs text-amu-charcoal">
                        {JSON.stringify(privacyData.personal_data.enrolments, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Certificates */}
                {privacyData.personal_data.certificates.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-medium text-amu-charcoal">
                      Certificates ({privacyData.personal_data.certificates.length})
                    </h3>
                    <div className="rounded-lg bg-amu-slate/5 p-4">
                      <pre className="overflow-x-auto text-xs text-amu-charcoal">
                        {JSON.stringify(privacyData.personal_data.certificates, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* SETA Registration */}
                {privacyData.personal_data.seta_registration && (
                  <div>
                    <h3 className="mb-2 font-medium text-amu-charcoal">SETA Registration</h3>
                    <div className="rounded-lg bg-amu-slate/5 p-4">
                      <pre className="overflow-x-auto text-xs text-amu-charcoal">
                        {JSON.stringify(privacyData.personal_data.seta_registration, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Conversations Count */}
                <div>
                  <h3 className="mb-2 font-medium text-amu-charcoal">Learning Conversations</h3>
                  <p className="text-sm text-amu-slate">
                    You have {privacyData.personal_data.conversations_count} learning conversation(s) stored.
                  </p>
                </div>

                <p className="text-xs text-amu-slate">
                  Data generated at: {new Date(privacyData.generated_at).toLocaleString('en-ZA')}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Consent Management */}
      <Card className="mb-6 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
          <Settings className="h-5 w-5" />
          Consent Preferences
        </h2>

        <div className="space-y-4">
          {/* Marketing Consent */}
          <div className="flex items-center justify-between rounded-lg border border-amu-slate/20 p-4">
            <div className="flex items-center gap-3">
              {summary?.marketing_consent ? (
                <Bell className="h-5 w-5 text-amu-navy" />
              ) : (
                <BellOff className="h-5 w-5 text-amu-slate" />
              )}
              <div>
                <p className="font-medium text-amu-charcoal">Marketing Communications</p>
                <p className="text-sm text-amu-slate">
                  Receive emails about new courses and learning opportunities
                </p>
              </div>
            </div>
            <Button
              variant={summary?.marketing_consent ? 'outline' : 'default'}
              size="sm"
              onClick={handleMarketingToggle}
              disabled={marketingLoading}
            >
              {marketingLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : summary?.marketing_consent ? (
                'Opt Out'
              ) : (
                'Opt In'
              )}
            </Button>
          </div>

          {/* Other Consents (read-only) */}
          {privacyData?.consents
            .filter((c) => c.consent_type !== 'Marketing Communications')
            .map((consent, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-amu-slate/20 p-4"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-amu-charcoal">{consent.consent_type}</p>
                    <p className="text-sm text-amu-slate">
                      Consented on {new Date(consent.consented_at).toLocaleDateString('en-ZA')}
                    </p>
                  </div>
                </div>
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Active
                </span>
              </div>
            ))}
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
          Your Rights Under POPIA
        </h2>

        <div className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between rounded-lg border border-amu-slate/20 p-4">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-amu-navy" />
              <div>
                <p className="font-medium text-amu-charcoal">Export My Data</p>
                <p className="text-sm text-amu-slate">
                  Download a copy of all your personal data
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exportLoading || exportSuccess}
            >
              {exportLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : exportSuccess ? (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Sent
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Request Export
                </>
              )}
            </Button>
          </div>

          {exportSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="ml-2 text-green-800">
                Your data export has been queued. You will receive an email with a download link within 24 hours.
              </span>
            </Alert>
          )}

          {/* Delete Account */}
          {!summary?.deletion_pending && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <Trash2 className="mt-0.5 h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-red-800">Delete My Account</p>
                  <p className="mt-1 text-sm text-red-700">
                    Permanently delete your account and all associated data. This action has a 30-day grace
                    period during which you can cancel the request.
                  </p>

                  {!showDeleteConfirm ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Request Account Deletion
                    </Button>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-red-800">
                          Please tell us why you are leaving (optional):
                        </label>
                        <textarea
                          value={deleteReason}
                          onChange={(e) => setDeleteReason(e.target.value)}
                          placeholder="Your feedback helps us improve..."
                          rows={3}
                          className="mt-1 w-full rounded-md border border-red-300 bg-white p-2 text-sm focus:border-red-500 focus:ring-red-500"
                        />
                      </div>

                      <Alert variant="error">
                        <AlertCircle className="h-4 w-4" />
                        <span className="ml-2">
                          Warning: If you have an active SETA registration, some data must be retained
                          for regulatory compliance. Contact support for more information.
                        </span>
                      </Alert>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteReason('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="error"
                          size="sm"
                          onClick={handleDelete}
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Confirm Deletion
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Footer Note */}
      <p className="mt-6 text-center text-xs text-amu-slate">
        For questions about your privacy rights, contact our Data Protection Officer at{' '}
        <a href="mailto:privacy@amu.ac.za" className="text-amu-navy hover:underline">
          privacy@amu.ac.za
        </a>
      </p>
    </div>
  );
}
