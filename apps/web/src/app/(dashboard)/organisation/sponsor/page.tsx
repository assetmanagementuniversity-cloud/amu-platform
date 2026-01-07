'use client';

/**
 * Sponsor Learners Page - AMU Corporate Portal
 *
 * Bulk enrolment interface where managers can enter employee emails
 * to send invitations linked to the company code.
 *
 * "Ubuntu - I am because we are"
 * Companies enable their teams to grow together.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { getUserCompany, isCompanyAdmin } from '@/lib/organisation';
import { sendBulkCorporateInvitations } from '@/lib/email';
import type { Company } from '@/lib/organisation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import {
  Users,
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Copy,
  ArrowLeft,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface InvitationResult {
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

export default function SponsorLearnersPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email input states
  const [emails, setEmails] = useState<string[]>(['']);
  const [bulkInput, setBulkInput] = useState('');
  const [inputMode, setInputMode] = useState<'individual' | 'bulk'>('individual');

  // Submission states
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<InvitationResult | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    async function loadCompany() {
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
        } else {
          setError('No company found. Please register your organisation first.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load company');
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [user]);

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const removeEmailField = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails.length > 0 ? newEmails : ['']);
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const parseEmailsFromBulk = (input: string): string[] => {
    // Split by newlines, commas, semicolons, or spaces
    return input
      .split(/[\n,;\s]+/)
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email && email.includes('@'));
  };

  const getEmailList = (): string[] => {
    if (inputMode === 'bulk') {
      return parseEmailsFromBulk(bulkInput);
    }
    return emails
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email && email.includes('@'));
  };

  const validateEmails = (emailList: string[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    emailList.forEach((email) => {
      if (!emailRegex.test(email)) {
        errors.push(`Invalid email format: ${email}`);
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const handleSendInvitations = async () => {
    if (!company || !user || !userData) return;

    const emailList = getEmailList();
    if (emailList.length === 0) {
      setError('Please enter at least one valid email address');
      return;
    }

    const validation = validateEmails(emailList);
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }

    setIsSending(true);
    setError(null);
    setResult(null);

    try {
      const sendResult = await sendBulkCorporateInvitations(
        emailList,
        company.company_name,
        company.company_code,
        userData.user_name || 'Training Manager'
      );

      setResult({
        sent: sendResult.sent,
        failed: sendResult.failed,
        errors: sendResult.errors,
      });

      // Clear form on success
      if (sendResult.success) {
        setEmails(['']);
        setBulkInput('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitations');
    } finally {
      setIsSending(false);
    }
  };

  const copyCompanyCode = async () => {
    if (company?.company_code) {
      await navigator.clipboard.writeText(company.company_code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-amu-navy border-t-transparent" />
          <p className="text-amu-slate">Loading company information...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Alert variant="error" className="mb-6">
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
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <span className="ml-2">
            You must be a company admin to invite employees
          </span>
        </Alert>
      </div>
    );
  }

  const emailList = getEmailList();

  return (
    <div className="mx-auto max-w-3xl py-8">
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
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-[24pt] font-normal text-amu-navy">
              Sponsor Learners
            </h1>
            <p className="text-amu-slate">
              Invite employees to join {company.company_name}
            </p>
          </div>
        </div>
      </div>

      {/* Company Code Card */}
      <Card className="mb-6 overflow-hidden">
        <div className="border-b border-amu-slate/20 bg-amu-sky/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amu-slate">Company Code</p>
              <div className="flex items-center gap-2">
                <span className="font-heading text-xl font-bold tracking-wider text-amu-navy">
                  {company.company_code}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyCompanyCode}
                  className="h-8 w-8"
                >
                  {codeCopied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="max-w-xs text-right text-sm text-amu-slate">
              Employees can also use this code during signup or from their
              profile settings
            </p>
          </div>
        </div>
      </Card>

      {/* Success/Error Messages */}
      {result && (
        <Alert
          variant={result.failed === 0 ? 'default' : 'destructive'}
          className="mb-6"
        >
          <div className="flex items-start gap-3">
            {result.failed === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <div>
              <p className="font-medium">
                {result.sent} invitation{result.sent !== 1 ? 's' : ''} sent
                {result.failed > 0 && `, ${result.failed} failed`}
              </p>
              {result.errors.length > 0 && (
                <ul className="mt-2 text-sm">
                  {result.errors.map((err, i) => (
                    <li key={i}>
                      {err.email}: {err.error}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Email Input Card */}
      <Card className="p-6">
        {/* Input Mode Toggle */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={inputMode === 'individual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('individual')}
          >
            <Mail className="mr-2 h-4 w-4" />
            Individual Emails
          </Button>
          <Button
            variant={inputMode === 'bulk' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('bulk')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
        </div>

        {inputMode === 'individual' ? (
          /* Individual Email Input */
          <div className="space-y-4">
            <Label>Employee Email Addresses</Label>
            {emails.map((email, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => updateEmail(index, e.target.value)}
                  placeholder="employee@company.co.za"
                  className="flex-1"
                />
                {emails.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEmailField(index)}
                    className="shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addEmailField}>
              <Plus className="mr-2 h-4 w-4" />
              Add Another Email
            </Button>
          </div>
        ) : (
          /* Bulk Import */
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulkEmails">
                Paste Email Addresses (one per line, or comma/semicolon
                separated)
              </Label>
              <textarea
                id="bulkEmails"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="john@company.co.za&#10;jane@company.co.za&#10;bob@company.co.za"
                rows={8}
                className="mt-2 flex w-full rounded-md border border-amu-slate/30 bg-white px-3 py-2 font-body text-sm text-amu-charcoal placeholder:text-amu-slate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amu-navy focus-visible:ring-offset-2"
              />
            </div>
            {bulkInput && (
              <p className="text-sm text-amu-slate">
                {emailList.length} valid email{emailList.length !== 1 ? 's' : ''}{' '}
                detected
              </p>
            )}
          </div>
        )}

        {/* Preview & Send */}
        <div className="mt-6 border-t border-amu-slate/20 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-amu-charcoal">Ready to send</p>
              <p className="text-sm text-amu-slate">
                {emailList.length} invitation{emailList.length !== 1 ? 's' : ''}{' '}
                will be sent
              </p>
            </div>
            <Button
              onClick={handleSendInvitations}
              disabled={emailList.length === 0 || isSending}
              loading={isSending}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Invitations
            </Button>
          </div>

          {/* Email Preview */}
          {emailList.length > 0 && (
            <div className="rounded-lg bg-amu-sky/20 p-4">
              <p className="mb-2 text-sm font-medium text-amu-charcoal">
                Email Preview:
              </p>
              <div className="flex flex-wrap gap-2">
                {emailList.slice(0, 10).map((email, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-white px-3 py-1 text-sm text-amu-charcoal"
                  >
                    {email}
                  </span>
                ))}
                {emailList.length > 10 && (
                  <span className="rounded-full bg-amu-navy px-3 py-1 text-sm text-white">
                    +{emailList.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Information Card */}
      <Card className="mt-6 bg-amu-sky/20 p-6">
        <h3 className="mb-3 font-heading text-lg font-semibold text-amu-navy">
          What happens next?
        </h3>
        <ul className="space-y-2 text-sm text-amu-charcoal">
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <span>
              Each employee receives an email invitation with your company code
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <span>
              They create an account (or link existing) using the company code
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <span>
              Their progress automatically appears on your Team Progress
              dashboard
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <span>
              Generate SETA reports for Skills Development Act tax rebates
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
