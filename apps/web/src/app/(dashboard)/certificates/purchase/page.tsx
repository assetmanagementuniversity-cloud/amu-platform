'use client';

/**
 * Certificate Purchase Page - AMU Platform
 *
 * Allows learners to purchase official certificates for completed courses.
 * Per Section 3.4.2: Official certificates R500-R8,890.
 *
 * "Ubuntu - I am because we are"
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckoutButton, PaymentHistory } from '@/components/payments';
import {
  Award,
  Shield,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Tag,
  FileText,
  Building2,
  GraduationCap,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

// =============================================================================
// TYPES
// =============================================================================

interface Enrolment {
  id: string;
  enrolment_course_id: string;
  enrolment_course_title: string;
  enrolment_status: string;
  enrolment_official_certificate_purchased: boolean;
  enrolment_completion_date?: string;
}

interface PricingInfo {
  courseId: string;
  courseTitle: string;
  basePrice: number;
  finalPrice: number;
  currency: string;
  discountPercent: number;
  discountAvailable: boolean;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CertificatePurchasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, getIdToken } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [enrolments, setEnrolments] = useState<Enrolment[]>([]);
  const [selectedEnrolment, setSelectedEnrolment] = useState<Enrolment | null>(null);
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for cancelled param
  const wasCancelled = searchParams.get('cancelled') === 'true';

  // Fetch completed enrolments
  useEffect(() => {
    async function fetchEnrolments() {
      if (!user) return;

      try {
        const token = await getIdToken();
        if (!token) return;

        const response = await fetch('/api/enrolments', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch enrolments');
        }

        const data = await response.json();

        // Filter for completed enrolments that haven't purchased official cert
        const eligibleEnrolments = (data.enrolments || []).filter(
          (e: Enrolment) =>
            e.enrolment_status === 'completed' &&
            !e.enrolment_official_certificate_purchased
        );

        setEnrolments(eligibleEnrolments);

        // Auto-select if enrolment_id in query
        const enrolmentId = searchParams.get('enrolment_id');
        if (enrolmentId) {
          const found = eligibleEnrolments.find(
            (e: Enrolment) => e.id === enrolmentId
          );
          if (found) {
            setSelectedEnrolment(found);
          }
        }
      } catch (err) {
        console.error('Error fetching enrolments:', err);
        setError('Failed to load your completed courses');
      } finally {
        setLoading(false);
      }
    }

    fetchEnrolments();
  }, [user, getIdToken, searchParams]);

  // Fetch pricing when enrolment selected
  useEffect(() => {
    async function fetchPricing() {
      if (!selectedEnrolment) {
        setPricing(null);
        return;
      }

      try {
        const token = await getIdToken();
        if (!token) return;

        const url = new URL('/api/checkout/pricing/' + selectedEnrolment.enrolment_course_id, window.location.origin);
        if (referralCode) {
          url.searchParams.set('referralCode', referralCode);
        }

        const response = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (data.success) {
          setPricing(data.pricing);
          setReferralApplied(data.pricing.discountAvailable);
        } else {
          setError(data.error || 'Failed to load pricing');
        }
      } catch (err) {
        console.error('Error fetching pricing:', err);
        setError('Failed to load pricing');
      }
    }

    fetchPricing();
  }, [selectedEnrolment, referralCode, getIdToken]);

  // Apply referral code
  const handleApplyReferral = () => {
    // Re-fetch pricing will happen via useEffect
    if (!referralCode.trim()) {
      setReferralApplied(false);
    }
  };

  // Format price for display
  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amu-navy" />
          <p className="mt-4 text-amu-slate">Loading your certificates...</p>
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
          Back
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amu-navy">
            <Award className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-amu-navy">
              Purchase Official Certificate
            </h1>
            <p className="mt-1 text-amu-slate">
              Get a SETA-registered certificate without the &quot;UNOFFICIAL&quot; watermark
            </p>
          </div>
        </div>
      </div>

      {/* Cancelled Alert */}
      {wasCancelled && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span className="ml-2 text-amber-800">
            Checkout was cancelled. You can try again when you&apos;re ready.
          </span>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <span className="ml-2">{error}</span>
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* No Eligible Courses */}
          {enrolments.length === 0 && (
            <Card className="p-8 text-center">
              <XCircle className="mx-auto h-12 w-12 text-amu-slate/50" />
              <h3 className="mt-4 font-heading text-lg font-semibold text-amu-navy">
                No Eligible Courses
              </h3>
              <p className="mt-2 text-sm text-amu-slate">
                Complete a course to unlock official certificate purchase.
                You must be assessed as &quot;Competent&quot; to be eligible.
              </p>
              <Link href="/learn">
                <Button className="mt-6">
                  Continue Learning
                </Button>
              </Link>
            </Card>
          )}

          {/* Course Selection */}
          {enrolments.length > 0 && !selectedEnrolment && (
            <Card className="p-6">
              <h2 className="mb-4 font-heading text-lg font-semibold text-amu-navy">
                Select a Course
              </h2>
              <p className="mb-6 text-sm text-amu-slate">
                Choose which course you&apos;d like to purchase an official certificate for:
              </p>

              <div className="space-y-3">
                {enrolments.map((enrolment) => (
                  <button
                    key={enrolment.id}
                    onClick={() => setSelectedEnrolment(enrolment)}
                    className="flex w-full items-center gap-4 rounded-lg border border-amu-slate/20 p-4 text-left transition-colors hover:border-amu-navy hover:bg-amu-sky/10"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-amu-charcoal">
                        {enrolment.enrolment_course_title}
                      </h3>
                      <p className="text-sm text-amu-slate">
                        Completed{' '}
                        {enrolment.enrolment_completion_date
                          ? new Date(
                              enrolment.enrolment_completion_date
                            ).toLocaleDateString('en-ZA')
                          : ''}
                      </p>
                    </div>
                    <Award className="h-5 w-5 text-amu-navy" />
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Selected Course */}
          {selectedEnrolment && pricing && (
            <div className="space-y-6">
              {/* Course Info */}
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amu-navy">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-heading text-lg font-semibold text-amu-navy">
                        {selectedEnrolment.enrolment_course_title}
                      </h2>
                      <p className="text-sm text-amu-slate">
                        Official SETA-Registered Certificate
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEnrolment(null)}
                  >
                    Change
                  </Button>
                </div>
              </Card>

              {/* Benefits */}
              <Card className="p-6">
                <h3 className="mb-4 font-heading text-lg font-semibold text-amu-navy">
                  Official Certificate Benefits
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amu-navy" />
                    <div>
                      <p className="font-medium text-amu-charcoal">No Watermark</p>
                      <p className="text-sm text-amu-slate">
                        Clean certificate without &quot;UNOFFICIAL&quot; text
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-amu-navy" />
                    <div>
                      <p className="font-medium text-amu-charcoal">SETA Registered</p>
                      <p className="text-sm text-amu-slate">
                        Recorded on the National Learner Records Database
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-amu-navy" />
                    <div>
                      <p className="font-medium text-amu-charcoal">Skills Levy Eligible</p>
                      <p className="text-sm text-amu-slate">
                        Your employer can claim back training costs
                      </p>
                    </div>
                  </li>
                </ul>
              </Card>

              {/* Referral Code */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5 text-amu-navy" />
                  <h3 className="font-heading text-lg font-semibold text-amu-navy">
                    Have a Referral Code?
                  </h3>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="Enter referral code"
                      className="uppercase"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleApplyReferral}
                    disabled={!referralCode.trim()}
                  >
                    Apply
                  </Button>
                </div>

                {referralApplied && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    10% discount applied!
                  </p>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar - Pricing */}
        <div className="lg:col-span-1">
          {selectedEnrolment && pricing && (
            <Card className="sticky top-4 p-6">
              <h3 className="mb-4 font-heading text-lg font-semibold text-amu-navy">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-amu-slate">Official Certificate</span>
                  <span className="font-medium">
                    {formatPrice(pricing.basePrice, pricing.currency)}
                  </span>
                </div>

                {pricing.discountAvailable && (
                  <div className="flex justify-between text-green-600">
                    <span>Referral Discount (10%)</span>
                    <span>
                      -{formatPrice(pricing.basePrice - pricing.finalPrice, pricing.currency)}
                    </span>
                  </div>
                )}

                <div className="border-t border-amu-slate/20 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-amu-charcoal">Total</span>
                    <span className="text-amu-navy">
                      {formatPrice(pricing.finalPrice, pricing.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <CheckoutButton
                  enrolmentId={selectedEnrolment.id}
                  courseId={selectedEnrolment.enrolment_course_id}
                  courseTitle={selectedEnrolment.enrolment_course_title}
                  amount={pricing.finalPrice}
                  currency={pricing.currency}
                  referralCode={referralApplied ? referralCode : undefined}
                  discountApplied={referralApplied}
                />
              </div>

              <p className="mt-4 text-center text-xs text-amu-slate">
                Secure payment powered by Stripe
              </p>
            </Card>
          )}

          {/* Purchase History */}
          <div className="mt-6">
            <PaymentHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
