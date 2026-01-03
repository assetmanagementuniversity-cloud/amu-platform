'use client';

/**
 * Karma Dashboard - AMU Referral Programme
 *
 * "I am because we are" - Ubuntu philosophy extended to growth
 *
 * Features:
 * - Current balance display (in user's currency)
 * - Lifetime earnings from commissions
 * - Active referral list
 * - Share referral link
 * - Request payout (minimum 100 in user's currency)
 *
 * Commission Model (Section 1.4):
 * - 10% of LIST PRICE for direct referrals (Tier 1)
 * - 10% of LIST PRICE for network referrals (Tier 2)
 * - Commissions earned when referred learners PAY for official certification
 *
 * Styling: Navy Blue (#0A2F5C) and Sky Blue (#D9E6F2) with Montserrat
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Gift,
  Users,
  TrendingUp,
  Copy,
  Check,
  Wallet,
  Share2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Crown,
  Star,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/components/auth';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@amu/shared';
import {
  getKarmaSummary,
  getReferralsList,
  getKarmaTransactions,
  getUserReferralCode,
  generateReferralLink,
  requestPayout,
  KARMA_REWARDS,
  type KarmaSummary,
  type ReferralListItem,
  type KarmaTransaction,
} from '@/lib/referrals';
import {
  createConnectAccount,
  refreshOnboardingLink,
  getConnectAccountStatus,
  processPayoutTransfer,
  getExpressDashboardLink,
} from '@/lib/stripe';
import { useSearchParams, useRouter } from 'next/navigation';

// ============================================
// Main Dashboard Component
// ============================================

export default function KarmaDashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<KarmaSummary | null>(null);
  const [referrals, setReferrals] = useState<ReferralListItem[]>([]);
  const [transactions, setTransactions] = useState<KarmaTransaction[]>([]);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stripeSuccess, setStripeSuccess] = useState(false);

  // Check for Stripe return params
  useEffect(() => {
    const stripeSuccessParam = searchParams.get('stripe_success');
    const stripeRefreshParam = searchParams.get('stripe_refresh');

    if (stripeSuccessParam === 'true') {
      setStripeSuccess(true);
      // Clear the URL params
      router.replace('/referrals', { scroll: false });
    }

    if (stripeRefreshParam === 'true') {
      // User needs to continue onboarding - handled by PayoutSection
      router.replace('/referrals', { scroll: false });
    }
  }, [searchParams, router]);

  // Load dashboard data
  const loadData = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    try {
      // Check and update Stripe account status if user has one
      await getConnectAccountStatus(user.uid);

      const [summaryData, referralsData, transactionsData, codeData] = await Promise.all([
        getKarmaSummary(user.uid),
        getReferralsList(user.uid),
        getKarmaTransactions(user.uid, 10), // Last 10 transactions for activity feed
        getUserReferralCode(user.uid),
      ]);

      setSummary(summaryData);
      setReferrals(referralsData);
      setTransactions(transactionsData);
      setReferralCode(codeData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <DashboardError message={error} onRetry={loadData} />;
  }

  return (
    <div className="min-h-screen bg-amu-sky/20 pb-12">
      {/* Header */}
      <div className="bg-amu-navy px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/10 p-3">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">
                Karma Programme
              </h1>
              <p className="font-body text-sm text-white/70">
                Share the gift of learning, earn rewards together
              </p>
            </div>
          </div>

          {/* Ubuntu Quote */}
          <div className="mt-6 rounded-lg bg-white/10 px-4 py-3">
            <p className="font-body text-sm italic text-white/90">
              "I am because we are" — When your network grows, we all grow together.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="-mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Current Balance"
            value={formatCurrency(summary?.current_balance || 0, summary?.currency)}
            icon={Wallet}
            highlight
          />
          <StatCard
            label="Lifetime Earned"
            value={formatCurrency(summary?.lifetime_earned || 0, summary?.currency)}
            icon={TrendingUp}
          />
          <StatCard
            label="Direct Referrals"
            value={summary?.direct_referrals.toString() || '0'}
            icon={Users}
            subtitle={`${summary?.direct_referral_payments || 0} payments`}
          />
          <StatCard
            label="Network Payments"
            value={summary?.network_payments.toString() || '0'}
            icon={Crown}
            subtitle="10% commission each"
          />
        </div>

        {/* Share Section */}
        <div className="mt-8">
          <ShareSection referralCode={referralCode} />
        </div>

        {/* How It Works */}
        <div className="mt-8">
          <HowItWorks />
        </div>

        {/* Stripe Success Banner */}
        {stripeSuccess && (
          <div className="mt-8 flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-3">
            <Check className="h-5 w-5 text-emerald-600" />
            <p className="font-body text-sm text-emerald-800">
              Bank account connected successfully! You can now request payouts.
            </p>
          </div>
        )}

        {/* Payout Section */}
        {summary && user && (
          <div className="mt-8">
            <PayoutSection
              userId={user.uid}
              userEmail={user.email || ''}
              userName={user.displayName || 'AMU Learner'}
              balance={summary.current_balance}
              currency={summary.currency}
              canPayout={summary.can_request_payout}
              stripeConnected={summary.stripe_connected}
              onPayoutSuccess={loadData}
            />
          </div>
        )}

        {/* Recent Activity Feed */}
        <div className="mt-8">
          <RecentActivityFeed transactions={transactions} currency={summary?.currency || 'ZAR'} />
        </div>

        {/* Referrals List */}
        <div className="mt-8">
          <ReferralsList referrals={referrals} currency={summary?.currency || 'ZAR'} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Stat Card Component
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
// Share Section Component
// ============================================

interface ShareSectionProps {
  referralCode: string | null;
}

function ShareSection({ referralCode }: ShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralLink = referralCode ? generateReferralLink(referralCode) : '';

  const copyCode = async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareLink = async () => {
    if (!referralLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Asset Management University',
          text: 'Learn asset management for free! Use my referral link to get started.',
          url: referralLink,
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled');
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="rounded-xl border border-amu-sky bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Share2 className="h-5 w-5 text-amu-navy" />
        <h2 className="font-heading text-lg font-semibold text-amu-navy">
          Share Your Referral Code
        </h2>
      </div>

      <p className="mt-2 font-body text-sm text-amu-slate">
        Invite friends to AMU. When they pay for official certification, you earn 10% commission.
        Plus, earn 10% when their referrals pay too!
      </p>

      {/* Referral Code Display */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-amu-sky bg-amu-sky/30 px-4 py-3">
          <span className="font-heading text-lg font-bold tracking-wide text-amu-navy">
            {referralCode || 'Loading...'}
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

        <button
          onClick={shareLink}
          className="flex items-center justify-center gap-2 rounded-lg bg-amu-navy px-6 py-3 font-heading text-sm font-medium text-white transition-colors hover:bg-[#153e70]"
        >
          <Share2 className="h-4 w-4" />
          Share Link
        </button>
      </div>

      {/* Full Link (Collapsible on mobile) */}
      <div className="mt-3">
        <button
          onClick={copyLink}
          className="group flex w-full items-center gap-2 rounded-lg border border-dashed border-amu-slate/30 px-3 py-2 text-left hover:border-amu-navy hover:bg-amu-sky/20"
        >
          <ExternalLink className="h-4 w-4 shrink-0 text-amu-slate group-hover:text-amu-navy" />
          <span className="truncate font-body text-xs text-amu-slate group-hover:text-amu-navy">
            {referralLink}
          </span>
          {copiedLink ? (
            <Check className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <Copy className="ml-auto h-4 w-4 shrink-0 text-amu-slate group-hover:text-amu-navy" />
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================
// How It Works Component
// ============================================

function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: 'Share Your Code',
      description: 'Send your unique referral code to friends and colleagues.',
      icon: Share2,
    },
    {
      step: 2,
      title: 'They Join & Learn',
      description: 'They sign up and complete courses for free on AMU.',
      icon: Users,
    },
    {
      step: 3,
      title: 'They Get Certified',
      description: 'When they pay for official certification, you earn 10% commission!',
      icon: Crown,
    },
    {
      step: 4,
      title: 'Get Paid',
      description: `Request payout once you reach ${KARMA_REWARDS.MINIMUM_PAYOUT} in your currency.`,
      icon: Wallet,
    },
  ];

  return (
    <div className="rounded-xl border border-amu-sky bg-white p-6 shadow-sm">
      <h2 className="font-heading text-lg font-semibold text-amu-navy">How It Works</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.step} className="relative">
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="absolute right-0 top-8 hidden h-0.5 w-4 bg-amu-sky lg:block" />
            )}

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amu-navy text-white">
                <step.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-amu-navy">
                  {step.title}
                </p>
                <p className="mt-0.5 font-body text-xs text-amu-slate">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-Tier Explanation */}
      <div className="mt-6 flex items-center gap-3 rounded-lg bg-amber-50 px-4 py-3">
        <Star className="h-5 w-5 text-amber-600" />
        <p className="font-body text-sm text-amber-800">
          <span className="font-semibold">Two-Tier Rewards!</span> Earn 10% when your referrals pay,
          PLUS 10% when their referrals pay. Your network keeps earning!
        </p>
      </div>
    </div>
  );
}

// ============================================
// Payout Section Component
// ============================================

interface PayoutSectionProps {
  userId: string;
  userEmail: string;
  userName: string;
  balance: number;
  currency: string;
  canPayout: boolean;
  stripeConnected: boolean;
  onPayoutSuccess: () => void;
}

function PayoutSection({
  userId,
  userEmail,
  userName,
  balance,
  currency,
  canPayout,
  stripeConnected,
  onPayoutSuccess,
}: PayoutSectionProps) {
  const [requesting, setRequesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle connecting bank account via Stripe Connect
  const handleConnectBankAccount = async () => {
    setConnecting(true);
    setError(null);

    try {
      const result = await createConnectAccount(userId, userEmail, userName);

      if (result.success && result.onboarding_url) {
        // Redirect to Stripe onboarding
        window.location.href = result.onboarding_url;
      } else {
        setError(result.error || 'Failed to create connected account');
        setConnecting(false);
      }
    } catch (err) {
      setError('An error occurred while connecting your account');
      setConnecting(false);
    }
  };

  // Handle refreshing onboarding link (for incomplete accounts)
  const handleRefreshOnboarding = async () => {
    setConnecting(true);
    setError(null);

    try {
      const result = await refreshOnboardingLink(userId);

      if (result.success && result.onboarding_url) {
        window.location.href = result.onboarding_url;
      } else {
        setError(result.error || 'Failed to refresh onboarding link');
        setConnecting(false);
      }
    } catch (err) {
      setError('An error occurred');
      setConnecting(false);
    }
  };

  // Handle payout request
  const handleRequestPayout = async () => {
    if (!canPayout) return;

    setRequesting(true);
    setError(null);

    try {
      // First request the payout (creates payout record, deducts balance)
      const payoutResult = await requestPayout(userId);

      if (payoutResult.success && payoutResult.payout_id) {
        // Process the actual Stripe transfer
        const transferResult = await processPayoutTransfer(
          userId,
          balance,
          currency,
          payoutResult.payout_id
        );

        if (transferResult.success) {
          setSuccess(true);
          onPayoutSuccess();
        } else {
          // Payout record created but transfer failed
          // The payout will be processed manually
          setError(
            transferResult.error ||
              'Payout registered but transfer pending. We\'ll process it manually.'
          );
          onPayoutSuccess();
        }
      } else if (payoutResult.requires_stripe_connect) {
        setError('Please connect your bank account first.');
      } else {
        setError(payoutResult.error || 'Failed to request payout');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setRequesting(false);
    }
  };

  // Handle opening Stripe Express dashboard
  const handleViewDashboard = async () => {
    try {
      const result = await getExpressDashboardLink(userId);
      if (result.success && result.url) {
        window.open(result.url, '_blank');
      } else {
        setError('Could not open dashboard');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className="rounded-xl border border-amu-sky bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-amu-navy" />
        <h2 className="font-heading text-lg font-semibold text-amu-navy">
          Request Payout
        </h2>
      </div>

      {success ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-3">
          <Check className="h-5 w-5 text-emerald-600" />
          <p className="font-body text-sm text-emerald-800">
            Payout request submitted! Your funds will arrive in 3-5 business days.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2 font-body text-sm text-amu-slate">
            Minimum payout amount is {currency} {KARMA_REWARDS.MINIMUM_PAYOUT}. Your current balance
            is <span className="font-semibold text-amu-navy">{formatCurrency(balance, currency)}</span>.
          </p>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <p className="font-body text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
            {!stripeConnected ? (
              <button
                onClick={handleConnectBankAccount}
                disabled={connecting}
                className="flex items-center justify-center gap-2 rounded-lg bg-amu-navy px-4 py-2.5 font-heading text-sm font-medium text-white transition-colors hover:bg-[#153e70] disabled:opacity-50"
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect Bank Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleRequestPayout}
                  disabled={!canPayout || requesting}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 font-heading text-sm font-medium transition-colors',
                    canPayout
                      ? 'bg-amu-navy text-white hover:bg-[#153e70]'
                      : 'cursor-not-allowed bg-amu-slate/20 text-amu-slate'
                  )}
                >
                  {requesting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4" />
                      Request Payout ({formatCurrency(balance, currency)})
                    </>
                  )}
                </button>

                <button
                  onClick={handleViewDashboard}
                  className="flex items-center justify-center gap-2 rounded-lg border border-amu-slate/30 px-4 py-2.5 font-heading text-sm font-medium text-amu-slate transition-colors hover:border-amu-navy hover:text-amu-navy"
                >
                  <ExternalLink className="h-4 w-4" />
                  Manage Bank Account
                </button>
              </>
            )}

            {!canPayout && stripeConnected && balance > 0 && (
              <p className="font-body text-xs text-amu-slate">
                Need {currency} {KARMA_REWARDS.MINIMUM_PAYOUT - balance} more to request payout
              </p>
            )}
          </div>

          {/* Help text for non-connected users */}
          {!stripeConnected && (
            <p className="mt-3 font-body text-xs text-amu-slate">
              We use Stripe to securely process payouts to your bank account worldwide.
              You'll be redirected to complete a quick verification process.
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// Recent Activity Feed Component
// ============================================

interface RecentActivityFeedProps {
  transactions: KarmaTransaction[];
  currency: string;
}

function RecentActivityFeed({ transactions, currency }: RecentActivityFeedProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-amu-slate/30 bg-white p-8 text-center">
        <Activity className="mx-auto h-12 w-12 text-amu-slate/50" />
        <h3 className="mt-4 font-heading text-lg font-semibold text-amu-charcoal">
          No Activity Yet
        </h3>
        <p className="mt-2 font-body text-sm text-amu-slate">
          When you earn karma or receive payouts, activity will appear here.
        </p>
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'tier1_commission':
      case 'tier2_commission':
        return ArrowUpRight;
      case 'payout':
        return ArrowDownRight;
      default:
        return Clock;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'tier1_commission':
      case 'tier2_commission':
        return 'text-emerald-600 bg-emerald-50';
      case 'payout':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-amu-slate bg-amu-sky/50';
    }
  };

  const getTransactionLabel = (type: string): string => {
    switch (type) {
      case 'tier1_commission':
        return 'Tier 1 Commission';
      case 'tier2_commission':
        return 'Tier 2 Commission';
      case 'payout':
        return 'Payout';
      default:
        return 'Transaction';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="rounded-xl border border-amu-sky bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-amu-sky px-6 py-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-amu-navy" />
          <h2 className="font-heading text-lg font-semibold text-amu-navy">
            Recent Activity
          </h2>
        </div>
        <span className="font-body text-xs text-amu-slate">
          Last {transactions.length} transactions
        </span>
      </div>

      <div className="divide-y divide-amu-sky/50">
        {transactions.map((tx) => {
          const IconComponent = getTransactionIcon(tx.transaction_type);
          const colorClass = getTransactionColor(tx.transaction_type);
          const isPositive = tx.transaction_amount > 0;

          return (
            <div
              key={tx.transaction_id}
              className="flex items-center gap-4 px-6 py-4 hover:bg-amu-sky/10 transition-colors"
            >
              {/* Icon */}
              <div className={cn('rounded-full p-2', colorClass)}>
                <IconComponent className="h-4 w-4" />
              </div>

              {/* Description */}
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm font-medium text-amu-charcoal truncate">
                  {tx.transaction_description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 font-body text-xs font-medium',
                    tx.transaction_type === 'tier1_commission' && 'bg-amber-100 text-amber-700',
                    tx.transaction_type === 'tier2_commission' && 'bg-purple-100 text-purple-700',
                    tx.transaction_type === 'payout' && 'bg-blue-100 text-blue-700'
                  )}>
                    {getTransactionLabel(tx.transaction_type)}
                  </span>
                  <span className="font-body text-xs text-amu-slate">
                    {formatTimeAgo(tx.transaction_created_at)}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right">
                <p className={cn(
                  'font-heading text-sm font-semibold',
                  isPositive ? 'text-emerald-600' : 'text-blue-600'
                )}>
                  {isPositive ? '+' : ''}{formatCurrency(tx.transaction_amount, tx.transaction_currency)}
                </p>
                <p className="font-body text-xs text-amu-slate">
                  Balance: {formatCurrency(tx.transaction_balance_after, tx.transaction_currency)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// Referrals List Component
// ============================================

interface ReferralsListProps {
  referrals: ReferralListItem[];
  currency: string;
}

function ReferralsList({ referrals, currency }: ReferralsListProps) {
  if (referrals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-amu-slate/30 bg-white p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-amu-slate/50" />
        <h3 className="mt-4 font-heading text-lg font-semibold text-amu-charcoal">
          No Referrals Yet
        </h3>
        <p className="mt-2 font-body text-sm text-amu-slate">
          Share your referral code to start earning karma rewards!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amu-sky bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-amu-sky px-6 py-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-amu-navy" />
          <h2 className="font-heading text-lg font-semibold text-amu-navy">
            Your Direct Referrals ({referrals.length})
          </h2>
        </div>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 font-body text-xs font-medium text-amber-700">
          Tier 1
        </span>
      </div>

      <div className="divide-y divide-amu-sky/50">
        {referrals.map((referral) => (
          <div
            key={referral.referral_id}
            className="flex items-center gap-4 px-6 py-4 hover:bg-amu-sky/10 transition-colors"
          >
            {/* Avatar */}
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold',
                referral.status === 'converted'
                  ? 'bg-amu-navy text-white'
                  : 'bg-amu-sky text-amu-navy'
              )}
            >
              {referral.referred_initial}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-heading text-sm font-medium text-amu-charcoal truncate">
                  {referral.referred_name}
                </p>
                <span className="hidden sm:inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 font-body text-[10px] font-medium text-amber-600">
                  T1
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-body text-xs font-medium',
                    referral.status === 'converted'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {referral.status === 'converted' ? (
                    <>
                      <Check className="h-3 w-3" />
                      {referral.payment_count} payment{referral.payment_count !== 1 ? 's' : ''}
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" />
                      Awaiting purchase
                    </>
                  )}
                </span>
                <span className="font-body text-xs text-amu-slate">
                  Joined {new Date(referral.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Earnings */}
            <div className="text-right shrink-0">
              {referral.total_earned > 0 ? (
                <p className="font-heading text-sm font-semibold text-emerald-600">
                  +{formatCurrency(referral.total_earned, currency)}
                </p>
              ) : (
                <p className="font-heading text-sm text-amu-slate">
                  —
                </p>
              )}
              <p className="font-body text-xs text-amu-slate">
                {referral.status === 'converted' ? 'Tier 1 (10%)' : 'pending'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tier explanation footer */}
      <div className="border-t border-amu-sky bg-amu-sky/20 px-6 py-3">
        <p className="font-body text-xs text-amu-slate text-center">
          <span className="font-medium text-amber-600">Tier 1</span> = Direct referrals (10%) &bull;
          <span className="font-medium text-purple-600 ml-1">Tier 2</span> = Their referrals (10%)
        </p>
      </div>
    </div>
  );
}

// ============================================
// Loading Skeleton
// ============================================

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-amu-sky/20 pb-12">
      <div className="bg-amu-navy px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 animate-pulse rounded-full bg-white/20" />
            <div className="space-y-2">
              <div className="h-8 w-48 animate-pulse rounded bg-white/20" />
              <div className="h-4 w-64 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white" />
          ))}
        </div>

        <div className="mt-8 h-48 animate-pulse rounded-xl bg-white" />
        <div className="mt-8 h-64 animate-pulse rounded-xl bg-white" />
      </div>
    </div>
  );
}

// ============================================
// Error State
// ============================================

interface DashboardErrorProps {
  message: string;
  onRetry: () => void;
}

function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-amu-sky/20 px-4">
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 font-heading text-xl font-semibold text-amu-charcoal">
          Something went wrong
        </h2>
        <p className="mt-2 font-body text-sm text-amu-slate">{message}</p>
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-amu-navy px-4 py-2 font-heading text-sm text-white hover:bg-[#153e70]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
