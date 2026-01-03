'use client';

/**
 * Company Registration Page - AMU Corporate Portal
 *
 * Allows new organisations to sign up with their details
 * and auto-generates a unique 8-character Company Code (Section 9.3).
 *
 * "Ubuntu - I am because we are"
 * Companies enable their teams to grow together.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { createCompany, INDUSTRY_LABELS } from '@/lib/organisation';
import type { CompanyIndustry, PaymentMethod } from '@/lib/organisation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import {
  Building2,
  CheckCircle,
  Copy,
  ArrowRight,
  Briefcase,
  Mail,
  FileText,
  CreditCard,
} from 'lucide-react';

export default function CompanyRegistrationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    companyId: string;
    companyCode: string;
  } | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    registrationNumber: '',
    taxNumber: '',
    industry: 'manufacturing' as CompanyIndustry,
    contactEmail: '',
    paymentMethod: 'invoice' as PaymentMethod,
    setaSector: '',
    sdlNumber: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createCompany({
        company_name: formData.companyName,
        company_registration_number: formData.registrationNumber,
        company_tax_number: formData.taxNumber || undefined,
        company_industry: formData.industry,
        company_training_manager_user_id: user.uid,
        company_payment_method: formData.paymentMethod,
        company_contact_email: formData.contactEmail || undefined,
        company_seta_sector: formData.setaSector || undefined,
        company_sdl_number: formData.sdlNumber || undefined,
      });

      if (result.success && result.company_id && result.company_code) {
        setSuccess({
          companyId: result.company_id,
          companyCode: result.company_code,
        });
      } else {
        setError(result.error || 'Failed to create company');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCompanyCode = async () => {
    if (success?.companyCode) {
      await navigator.clipboard.writeText(success.companyCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  // Success state - show company code
  if (success) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Card className="overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-600 px-6 py-8 text-center text-white">
            <CheckCircle className="mx-auto mb-4 h-16 w-16" />
            <h1 className="font-heading text-2xl font-semibold">
              Company Registered Successfully!
            </h1>
            <p className="mt-2 text-green-100">
              Your organisation is now set up on AMU
            </p>
          </div>

          {/* Company Code Section */}
          <div className="p-6">
            <div className="mb-6 rounded-lg bg-amu-sky/30 p-6 text-center">
              <p className="mb-2 text-sm text-amu-charcoal">
                Your Unique Company Code
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-heading text-3xl font-bold tracking-wider text-amu-navy">
                  {success.companyCode}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyCompanyCode}
                  title="Copy code"
                >
                  {codeCopied ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="mt-4 text-sm text-amu-slate">
                Share this code with your employees so they can link their
                accounts to your company during signup or from their profile.
              </p>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-semibold text-amu-navy">
                Next Steps
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-amu-slate/20 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amu-navy text-white">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-amu-charcoal">
                      Invite Your Team
                    </p>
                    <p className="text-sm text-amu-slate">
                      Use the Sponsor Learners feature to send bulk invitations
                      to your employees.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-amu-slate/20 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amu-navy text-white">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-amu-charcoal">
                      Track Progress
                    </p>
                    <p className="text-sm text-amu-slate">
                      Monitor your team&apos;s learning journey from the
                      Organisation Dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-amu-slate/20 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amu-navy text-white">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-amu-charcoal">
                      Export Reports
                    </p>
                    <p className="text-sm text-amu-slate">
                      Generate SETA/Skills Development Act reports for tax
                      rebate claims.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1"
                onClick={() => router.push('/organisation/sponsor')}
              >
                Invite Employees
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/organisation')}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amu-navy">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-heading text-[24pt] font-normal text-amu-navy">
          Register Your Organisation
        </h1>
        <p className="mt-2 text-amu-slate">
          Set up your company to manage team training and track progress
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Details Section */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
              <Briefcase className="h-5 w-5" />
              Company Details
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="e.g., Acme Manufacturing (Pty) Ltd"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="registrationNumber">
                    Registration Number *
                  </Label>
                  <Input
                    id="registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 2024/123456/07"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="taxNumber">Tax Number (Optional)</Label>
                  <Input
                    id="taxNumber"
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 9012345678"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="industry">Industry *</Label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-amu-slate/30 bg-white px-3 py-2 font-body text-sm text-amu-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amu-navy focus-visible:ring-offset-2"
                  required
                >
                  {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
              <Mail className="h-5 w-5" />
              Contact Information
            </h2>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="training@company.co.za"
              />
              <p className="mt-1 text-sm text-amu-slate">
                This email will receive training reports and notifications
              </p>
            </div>
          </div>

          {/* SETA/SDL Section */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
              <FileText className="h-5 w-5" />
              SETA / Skills Development
            </h2>
            <p className="mb-4 text-sm text-amu-slate">
              Required for Skills Development Act tax rebate claims (Section
              17.6)
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="setaSector">SETA Sector</Label>
                <Input
                  id="setaSector"
                  name="setaSector"
                  value={formData.setaSector}
                  onChange={handleInputChange}
                  placeholder="e.g., MERSETA, CHIETA"
                />
              </div>
              <div>
                <Label htmlFor="sdlNumber">SDL Number</Label>
                <Input
                  id="sdlNumber"
                  name="sdlNumber"
                  value={formData.sdlNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., L123456789"
                />
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </h2>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amu-slate/20 p-4 hover:bg-amu-sky/10">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="invoice"
                  checked={formData.paymentMethod === 'invoice'}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-amu-charcoal">Invoice</p>
                  <p className="text-sm text-amu-slate">
                    Receive monthly invoices for employee training
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amu-slate/20 p-4 hover:bg-amu-sky/10">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="prepaid"
                  checked={formData.paymentMethod === 'prepaid'}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-amu-charcoal">
                    Prepaid Balance
                  </p>
                  <p className="text-sm text-amu-slate">
                    Load credits in advance for employee certificates
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amu-slate/20 p-4 hover:bg-amu-sky/10">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={formData.paymentMethod === 'credit_card'}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-amu-charcoal">Credit Card</p>
                  <p className="text-sm text-amu-slate">
                    Pay automatically when employees purchase certificates
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="border-t border-amu-slate/20 pt-6">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting || !user}
            >
              Register Organisation
            </Button>
            <p className="mt-4 text-center text-sm text-amu-slate">
              By registering, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
