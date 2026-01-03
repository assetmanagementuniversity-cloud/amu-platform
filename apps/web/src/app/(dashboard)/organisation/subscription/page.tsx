'use client';

/**
 * Corporate Subscription Page - AMU Corporate Portal
 *
 * Allows organisations to subscribe to unlock the full reporting suite.
 * (Section 1.6 of Final-spec-Sections-1-to-3-Business-case-and-philosophy.md)
 *
 * "Ubuntu - I am because we are"
 * Companies enable their teams to grow together.
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { getUserCompany, isCompanyAdmin } from '@/lib/organisation';
import {
  CORPORATE_PLANS,
  createCorporateCheckout,
  getCorporateSubscriptionStatus,
  createCustomerPortalSession,
} from '@/lib/stripe';
import type { Company } from '@/lib/organisation';
import type { CorporatePlanTier, BillingInterval } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import {
  Check,
  Crown,
  Building2,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Settings,
  Zap,
} from 'lucide-react';

export default function CorporateSubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscription state
  const [currentTier, setCurrentTier] = useState<CorporatePlanTier | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null);

  // UI state
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('annual');
  const [processingTier, setProcessingTier] = useState<CorporatePlanTier | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check for success/cancel from Stripe redirect
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
    }
  }, [searchParams]);

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

          // Get subscription status
          const subStatus = await getCorporateSubscriptionStatus(
            companyResult.company.company_id
          );
          if (subStatus.success) {
            if (subStatus.is_subscribed && subStatus.tier) {
              setCurrentTier(subStatus.tier);
              setSubscriptionStatus(subStatus.status || null);
              setPeriodEnd(subStatus.current_period_end || null);
            }
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

  const handleSubscribe = async (tier: CorporatePlanTier) => {
    if (!company || !user) return;

    setProcessingTier(tier);
    setError(null);

    try {
      const result = await createCorporateCheckout(
        company.company_id,
        user.uid,
        tier,
        billingInterval
      );

      if (result.success && result.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = result.checkout_url;
      } else {
        setError(result.error || 'Failed to create checkout session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!company || !user) return;

    setProcessingTier('professional'); // Use as loading indicator
    try {
      const result = await createCustomerPortalSession(company.company_id, user.uid);
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        setError(result.error || 'Failed to open billing portal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessingTier(null);
    }
  };

  const formatPrice = (amount: number) => {
    return `R${amount.toLocaleString('en-ZA')}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-amu-navy border-t-transparent" />
          <p className="text-amu-slate">Loading subscription details...</p>
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
          <span className="ml-2">
            Only company admins can manage subscriptions
          </span>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-8">
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
            <Crown className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-[24pt] font-normal text-amu-navy">
              Corporate Subscription
            </h1>
            <p className="text-amu-slate">
              Unlock full reporting and team management features
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="ml-2 text-green-800">
            Subscription activated successfully! Welcome to{' '}
            {currentTier && CORPORATE_PLANS[currentTier].name}.
          </span>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Current Subscription Status */}
      {currentTier && (
        <Card className="mb-8 overflow-hidden">
          <div className="border-b border-amu-slate/20 bg-gradient-to-r from-amu-navy to-amu-navy/80 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm opacity-80">Current Plan</p>
                <p className="font-heading text-xl font-semibold">
                  {CORPORATE_PLANS[currentTier].name}
                </p>
              </div>
              <div className="text-right text-white">
                <p className="text-sm opacity-80">Status</p>
                <p className="font-semibold capitalize">{subscriptionStatus}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              {periodEnd && (
                <p className="text-sm text-amu-slate">
                  Next billing date:{' '}
                  <span className="font-medium text-amu-charcoal">
                    {periodEnd.toLocaleDateString('en-ZA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </p>
              )}
            </div>
            <Button variant="outline" onClick={handleManageSubscription}>
              <Settings className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
          </div>
        </Card>
      )}

      {/* Billing Toggle */}
      {!currentTier && (
        <div className="mb-8 flex items-center justify-center gap-4">
          <span
            className={`text-sm ${
              billingInterval === 'monthly'
                ? 'font-semibold text-amu-navy'
                : 'text-amu-slate'
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBillingInterval(
                billingInterval === 'monthly' ? 'annual' : 'monthly'
              )
            }
            className={`relative h-8 w-14 rounded-full transition-colors ${
              billingInterval === 'annual' ? 'bg-amu-navy' : 'bg-amu-slate/30'
            }`}
          >
            <div
              className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                billingInterval === 'annual' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span
            className={`text-sm ${
              billingInterval === 'annual'
                ? 'font-semibold text-amu-navy'
                : 'text-amu-slate'
            }`}
          >
            Annual
          </span>
          {billingInterval === 'annual' && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Save 17%
            </span>
          )}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {(Object.entries(CORPORATE_PLANS) as [CorporatePlanTier, typeof CORPORATE_PLANS.starter][]).map(
          ([tier, plan]) => {
            const isCurrentPlan = currentTier === tier;
            const isPopular = tier === 'professional';
            const price =
              billingInterval === 'monthly'
                ? plan.priceMonthly
                : Math.round(plan.priceAnnual / 12);

            return (
              <Card
                key={tier}
                className={`relative overflow-hidden ${
                  isPopular
                    ? 'border-2 border-amu-navy shadow-lg'
                    : 'border-amu-slate/20'
                } ${isCurrentPlan ? 'bg-amu-sky/20' : ''}`}
              >
                {isPopular && (
                  <div className="absolute right-0 top-0 rounded-bl-lg bg-amu-navy px-3 py-1">
                    <span className="text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute left-0 top-0 rounded-br-lg bg-green-600 px-3 py-1">
                    <span className="text-xs font-semibold text-white">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Header */}
                  <div className="mb-6">
                    <h3 className="font-heading text-xl font-semibold text-amu-navy">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-sm text-amu-slate">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="font-heading text-4xl font-bold text-amu-navy">
                        {formatPrice(price)}
                      </span>
                      <span className="text-amu-slate">/month</span>
                    </div>
                    {billingInterval === 'annual' && (
                      <p className="mt-1 text-sm text-amu-slate">
                        Billed {formatPrice(plan.priceAnnual)} annually
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mb-6 space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                        <span className="text-sm text-amu-charcoal">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {!currentTier ? (
                    <Button
                      className="w-full"
                      variant={isPopular ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(tier)}
                      loading={processingTier === tier}
                      disabled={!!processingTier}
                    >
                      {processingTier === tier ? (
                        'Processing...'
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Get Started
                        </>
                      )}
                    </Button>
                  ) : isCurrentPlan ? (
                    <Button className="w-full" variant="outline" disabled>
                      <Check className="mr-2 h-4 w-4" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleManageSubscription}
                    >
                      Switch Plan
                    </Button>
                  )}
                </div>
              </Card>
            );
          }
        )}
      </div>

      {/* Feature Comparison */}
      <div className="mt-12">
        <h2 className="mb-6 text-center font-heading text-2xl font-semibold text-amu-navy">
          What&apos;s Included
        </h2>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amu-slate/20 bg-amu-sky/30">
                  <th className="px-6 py-4 text-left font-heading font-semibold text-amu-navy">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center font-heading font-semibold text-amu-navy">
                    Starter
                  </th>
                  <th className="px-6 py-4 text-center font-heading font-semibold text-amu-navy">
                    Professional
                  </th>
                  <th className="px-6 py-4 text-center font-heading font-semibold text-amu-navy">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amu-slate/10">
                <tr>
                  <td className="px-6 py-4 text-amu-charcoal">Max Employees</td>
                  <td className="px-6 py-4 text-center text-amu-charcoal">25</td>
                  <td className="px-6 py-4 text-center text-amu-charcoal">100</td>
                  <td className="px-6 py-4 text-center text-amu-charcoal">
                    Unlimited
                  </td>
                </tr>
                <tr className="bg-amu-sky/10">
                  <td className="px-6 py-4 text-amu-charcoal">
                    Team Progress Dashboard
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-green-600" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-green-600" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-green-600" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-amu-charcoal">
                    SETA/SDL Reports
                  </td>
                  <td className="px-6 py-4 text-center text-amu-slate">-</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-green-600" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-green-600" />
                  </td>
                </tr>
                <tr className="bg-amu-sky/10">
                  <td className="px-6 py-4 text-amu-charcoal">
                    Certificate Discount
                  </td>
                  <td className="px-6 py-4 text-center text-amu-charcoal">5%</td>
                  <td className="px-6 py-4 text-center text-amu-charcoal">10%</td>
                  <td className="px-6 py-4 text-center text-amu-charcoal">15%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-amu-charcoal">Priority Support</td>
                  <td className="px-6 py-4 text-center text-amu-slate">-</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-green-600" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-green-600" />
                  </td>
                </tr>
                <tr className="bg-amu-sky/10">
                  <td className="px-6 py-4 text-amu-charcoal">
                    Dedicated Account Manager
                  </td>
                  <td className="px-6 py-4 text-center text-amu-slate">-</td>
                  <td className="px-6 py-4 text-center text-amu-slate">-</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-green-600" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* FAQ / Contact */}
      <div className="mt-12 text-center">
        <p className="text-amu-slate">
          Have questions about corporate subscriptions?{' '}
          <a
            href="mailto:corporate@assetmanagementuniversity.org"
            className="font-medium text-amu-navy hover:underline"
          >
            Contact our sales team
          </a>
        </p>
      </div>
    </div>
  );
}
