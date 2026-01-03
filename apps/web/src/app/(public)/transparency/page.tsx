'use client';

/**
 * Ubuntu Economics Transparency Dashboard - AMU Platform
 *
 * Section 4.3: Ubuntu Public Transparency Account
 *
 * PUBLIC PAGE - No authentication required
 *
 * Displays high-level financial metrics demonstrating Ubuntu Economics:
 * - Total Revenue (Corporate + Individual)
 * - Free Learners Supported
 * - Reserve Allocations
 * - Cost Breakdown
 * - Recent Transactions
 *
 * "Ubuntu - I am because we are"
 * Our finances aren't secret—they demonstrate how we serve the collective.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Users,
  TrendingUp,
  PiggyBank,
  Globe,
  ArrowRight,
  RefreshCw,
  DollarSign,
  Cpu,
  Cloud,
  Mail,
  CreditCard,
  Megaphone,
  CheckCircle,
  Clock,
  ExternalLink,
  Shield,
  BookOpen,
} from 'lucide-react';

// Types
interface UbuntuMetrics {
  period: {
    start: string;
    end: string;
    label: string;
  };
  revenue: {
    total: number;
    corporate: number;
    individual: number;
    growth_percentage: number;
  };
  ubuntu_impact: {
    free_learners_supported: number;
    free_learning_hours: number;
    paid_to_free_ratio: string;
    countries_reached: number;
  };
  karma: {
    total_earned: number;
    total_paid_out: number;
    pending_payouts: number;
    active_referrers: number;
  };
  costs: {
    total: number;
    ai_facilitation: number;
    infrastructure: number;
    payment_processing: number;
    marketing: number;
    other: number;
    cost_per_learner: number;
  };
  reserves: {
    operating_reserve: number;
    operating_reserve_months: number;
    target_reserve_months: number;
    emergency_fund: number;
    surplus_available: number;
  };
  sustainability: {
    net_margin_percentage: number;
    runway_months: number;
    break_even_status: string;
  };
  last_updated: string;
}

interface PublicTransaction {
  transaction_id: string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  description: string;
  amount: number;
  impact_note?: string;
}

export default function TransparencyPage() {
  const [metrics, setMetrics] = useState<UbuntuMetrics | null>(null);
  const [transactions, setTransactions] = useState<PublicTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // In production, these would call the actual API
      // For now, using mock data embedded in the component
      setMetrics(getMockMetrics());
      setTransactions(getMockTransactions());
    } catch (error) {
      console.error('Failed to load transparency data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-ZA').format(num);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#1B2B5B] border-t-transparent" />
          <p className="font-montserrat text-gray-600">Loading transparency data...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <header className="bg-[#1B2B5B] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-center gap-2 text-[#87CEEB]">
            <Heart className="h-5 w-5" />
            <span className="font-montserrat text-sm font-medium uppercase tracking-wider">
              Ubuntu Economics
            </span>
          </div>

          <h1 className="mt-4 font-montserrat text-4xl font-bold md:text-5xl">
            Financial Transparency
          </h1>

          <p className="mt-4 max-w-2xl font-montserrat text-lg text-gray-300">
            "Ubuntu means 'I am because we are.' Our finances aren't secret—they
            demonstrate how we serve the collective. When companies pay for certification,
            individuals learn free. You can verify this, live, anytime."
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <Clock className="h-4 w-4" />
              <span className="font-montserrat text-sm">
                Last updated: {new Date(metrics.last_updated).toLocaleString('en-ZA')}
              </span>
            </div>
            <Button
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Ubuntu Impact Section */}
        <section className="mb-12">
          <h2 className="mb-6 flex items-center gap-2 font-montserrat text-2xl font-bold text-[#1B2B5B]">
            <Heart className="h-6 w-6 text-red-500" />
            Ubuntu Impact
          </h2>

          <div className="grid gap-6 md:grid-cols-4">
            <Card className="border-2 border-[#1B2B5B]/10 bg-gradient-to-br from-[#1B2B5B] to-[#2a3f7a] p-6 text-white">
              <Users className="mb-3 h-8 w-8 text-[#87CEEB]" />
              <p className="font-montserrat text-4xl font-bold">
                {formatNumber(metrics.ubuntu_impact.free_learners_supported)}
              </p>
              <p className="mt-1 font-montserrat text-sm text-gray-300">
                Free Learners Supported
              </p>
              <p className="mt-3 rounded bg-white/10 px-2 py-1 text-xs">
                Each paid certification supports {metrics.ubuntu_impact.paid_to_free_ratio.split(':')[1]} free learners
              </p>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50 p-6">
              <BookOpen className="mb-3 h-8 w-8 text-green-600" />
              <p className="font-montserrat text-4xl font-bold text-green-700">
                {formatNumber(metrics.ubuntu_impact.free_learning_hours)}
              </p>
              <p className="mt-1 font-montserrat text-sm text-green-600">
                Free Learning Hours
              </p>
              <p className="mt-3 text-xs text-green-600/70">
                Hours of AI-facilitated education delivered free
              </p>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50 p-6">
              <Globe className="mb-3 h-8 w-8 text-purple-600" />
              <p className="font-montserrat text-4xl font-bold text-purple-700">
                {metrics.ubuntu_impact.countries_reached}
              </p>
              <p className="mt-1 font-montserrat text-sm text-purple-600">
                Countries Reached
              </p>
              <p className="mt-3 text-xs text-purple-600/70">
                Global impact of accessible education
              </p>
            </Card>

            <Card className="border-2 border-amber-200 bg-amber-50 p-6">
              <TrendingUp className="mb-3 h-8 w-8 text-amber-600" />
              <p className="font-montserrat text-4xl font-bold text-amber-700">
                {metrics.ubuntu_impact.paid_to_free_ratio}
              </p>
              <p className="mt-1 font-montserrat text-sm text-amber-600">
                Paid to Free Ratio
              </p>
              <p className="mt-3 text-xs text-amber-600/70">
                1 paid certification funds 15 free learners
              </p>
            </Card>
          </div>
        </section>

        {/* Revenue Section */}
        <section className="mb-12">
          <h2 className="mb-6 flex items-center gap-2 font-montserrat text-2xl font-bold text-[#1B2B5B]">
            <DollarSign className="h-6 w-6 text-green-500" />
            Revenue ({metrics.period.label})
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <p className="font-montserrat text-sm text-gray-500">Total Revenue</p>
              <p className="mt-2 font-montserrat text-3xl font-bold text-[#1B2B5B]">
                {formatCurrency(metrics.revenue.total)}
              </p>
              {metrics.revenue.growth_percentage > 0 && (
                <p className="mt-2 flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  +{metrics.revenue.growth_percentage}% from last month
                </p>
              )}
            </Card>

            <Card className="p-6">
              <p className="font-montserrat text-sm text-gray-500">Corporate Certifications</p>
              <p className="mt-2 font-montserrat text-3xl font-bold text-blue-600">
                {formatCurrency(metrics.revenue.corporate)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {Math.round((metrics.revenue.corporate / metrics.revenue.total) * 100)}% of total
              </p>
            </Card>

            <Card className="p-6">
              <p className="font-montserrat text-sm text-gray-500">Individual Certifications</p>
              <p className="mt-2 font-montserrat text-3xl font-bold text-purple-600">
                {formatCurrency(metrics.revenue.individual)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {Math.round((metrics.revenue.individual / metrics.revenue.total) * 100)}% of total
              </p>
            </Card>
          </div>
        </section>

        {/* Cost Breakdown Section */}
        <section className="mb-12">
          <h2 className="mb-6 flex items-center gap-2 font-montserrat text-2xl font-bold text-[#1B2B5B]">
            <PiggyBank className="h-6 w-6 text-amber-500" />
            Where Your Money Goes
          </h2>

          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-montserrat text-lg font-semibold text-[#1B2B5B]">
                Total Operating Costs: {formatCurrency(metrics.costs.total)}
              </p>
              <p className="rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                {formatCurrency(metrics.costs.cost_per_learner)}/learner
              </p>
            </div>

            <div className="space-y-4">
              <CostBar
                icon={<Cpu className="h-5 w-5" />}
                label="AI Facilitation (Claude)"
                amount={metrics.costs.ai_facilitation}
                total={metrics.costs.total}
                color="bg-purple-500"
                note="Powers personalized 1:1 learning for every student"
              />
              <CostBar
                icon={<Cloud className="h-5 w-5" />}
                label="Cloud Infrastructure"
                amount={metrics.costs.infrastructure}
                total={metrics.costs.total}
                color="bg-blue-500"
                note="Google Cloud hosting in South Africa"
              />
              <CostBar
                icon={<CreditCard className="h-5 w-5" />}
                label="Payment Processing"
                amount={metrics.costs.payment_processing}
                total={metrics.costs.total}
                color="bg-green-500"
                note="Stripe fees for secure payments"
              />
              <CostBar
                icon={<Megaphone className="h-5 w-5" />}
                label="Marketing"
                amount={metrics.costs.marketing}
                total={metrics.costs.total}
                color="bg-amber-500"
                note="Reaching more learners who need us"
              />
              <CostBar
                icon={<Mail className="h-5 w-5" />}
                label="Other Services"
                amount={metrics.costs.other}
                total={metrics.costs.total}
                color="bg-gray-500"
                note="Email, signatures, accounting"
              />
            </div>
          </Card>
        </section>

        {/* Reserves Section */}
        <section className="mb-12">
          <h2 className="mb-6 flex items-center gap-2 font-montserrat text-2xl font-bold text-[#1B2B5B]">
            <Shield className="h-6 w-6 text-blue-500" />
            Financial Reserves (Ubuntu Love Framework)
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-2 border-blue-200 p-6">
              <p className="font-montserrat text-sm text-gray-500">Operating Reserve</p>
              <p className="mt-2 font-montserrat text-3xl font-bold text-blue-600">
                {formatCurrency(metrics.reserves.operating_reserve)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{
                      width: `${Math.min(
                        (metrics.reserves.operating_reserve_months / metrics.reserves.target_reserve_months) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {metrics.reserves.operating_reserve_months}/{metrics.reserves.target_reserve_months} months
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Target: {metrics.reserves.target_reserve_months} months operating costs
              </p>
            </Card>

            <Card className="border-2 border-red-200 p-6">
              <p className="font-montserrat text-sm text-gray-500">Emergency Fund</p>
              <p className="mt-2 font-montserrat text-3xl font-bold text-red-600">
                {formatCurrency(metrics.reserves.emergency_fund)}
              </p>
              <p className="mt-3 text-sm text-gray-500">
                For unexpected challenges
              </p>
              <p className="mt-2 text-xs text-gray-500">
                5% of annual revenue target
              </p>
            </Card>

            <Card className="border-2 border-green-200 p-6">
              <p className="font-montserrat text-sm text-gray-500">Available Surplus</p>
              <p className="mt-2 font-montserrat text-3xl font-bold text-green-600">
                {formatCurrency(metrics.reserves.surplus_available)}
              </p>
              <p className="mt-3 text-sm text-gray-500">
                For growth & new initiatives
              </p>
              <p className="mt-2 text-xs text-gray-500">
                After reserves are funded
              </p>
            </Card>
          </div>
        </section>

        {/* Karma Economics Section */}
        <section className="mb-12">
          <h2 className="mb-6 flex items-center gap-2 font-montserrat text-2xl font-bold text-[#1B2B5B]">
            <Heart className="h-6 w-6 text-pink-500" />
            Karma Economics (Referral Rewards)
          </h2>

          <div className="grid gap-6 md:grid-cols-4">
            <Card className="p-6 text-center">
              <p className="font-montserrat text-3xl font-bold text-pink-600">
                {formatCurrency(metrics.karma.total_earned)}
              </p>
              <p className="mt-1 font-montserrat text-sm text-gray-500">
                Total Karma Earned
              </p>
            </Card>
            <Card className="p-6 text-center">
              <p className="font-montserrat text-3xl font-bold text-green-600">
                {formatCurrency(metrics.karma.total_paid_out)}
              </p>
              <p className="mt-1 font-montserrat text-sm text-gray-500">
                Paid to Referrers
              </p>
            </Card>
            <Card className="p-6 text-center">
              <p className="font-montserrat text-3xl font-bold text-amber-600">
                {formatCurrency(metrics.karma.pending_payouts)}
              </p>
              <p className="mt-1 font-montserrat text-sm text-gray-500">
                Pending Payouts
              </p>
            </Card>
            <Card className="p-6 text-center">
              <p className="font-montserrat text-3xl font-bold text-purple-600">
                {metrics.karma.active_referrers}
              </p>
              <p className="mt-1 font-montserrat text-sm text-gray-500">
                Active Referrers
              </p>
            </Card>
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="mb-12">
          <h2 className="mb-6 flex items-center gap-2 font-montserrat text-2xl font-bold text-[#1B2B5B]">
            <Clock className="h-6 w-6 text-gray-500" />
            Recent Transactions
          </h2>

          <Card className="overflow-hidden">
            <div className="divide-y">
              {transactions.map((tx) => (
                <div
                  key={tx.transaction_id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        tx.type === 'income'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <PiggyBank className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-montserrat font-medium text-[#1B2B5B]">
                        {tx.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {tx.category} • {new Date(tx.date).toLocaleDateString('en-ZA')}
                      </p>
                      {tx.impact_note && (
                        <p className="mt-1 text-xs text-green-600">
                          <Heart className="mr-1 inline h-3 w-3" />
                          {tx.impact_note}
                        </p>
                      )}
                    </div>
                  </div>
                  <p
                    className={`font-montserrat text-lg font-bold ${
                      tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              View full transaction history in our{' '}
              <a
                href="https://go.xero.com/app/!DnGvB/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#1B2B5B] underline hover:no-underline"
              >
                public Xero account
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </section>

        {/* Verification Notice */}
        <section className="mb-12">
          <Card className="border-2 border-[#87CEEB] bg-[#87CEEB]/10 p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-8 w-8 flex-shrink-0 text-[#1B2B5B]" />
              <div>
                <h3 className="font-montserrat text-lg font-bold text-[#1B2B5B]">
                  Verify Our Finances Yourself
                </h3>
                <p className="mt-2 font-montserrat text-gray-600">
                  We maintain a public read-only Xero account. Anyone can log in and verify
                  our financial statements directly. This is Ubuntu transparency in action.
                </p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="rounded bg-white px-4 py-2">
                    <p className="text-xs text-gray-500">Account</p>
                    <p className="font-mono text-sm">ubuntu@assetmanagementuniversity.org</p>
                  </div>
                  <div className="rounded bg-white px-4 py-2">
                    <p className="text-xs text-gray-500">Access</p>
                    <p className="font-mono text-sm">Read-only (safe to browse)</p>
                  </div>
                </div>
                <Button className="mt-4 bg-[#1B2B5B] hover:bg-[#2a3f7a]" asChild>
                  <a
                    href="https://login.xero.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View in Xero
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="font-montserrat text-2xl font-bold text-[#1B2B5B]">
            Join the Ubuntu Movement
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-montserrat text-gray-600">
            Every certification purchase directly funds free education for those who need it most.
            When you learn with AMU, you're not just investing in yourself—you're investing in others.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button className="bg-[#1B2B5B] hover:bg-[#2a3f7a]" asChild>
              <Link href="/courses">
                Browse Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/about">
                Learn About Ubuntu
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t bg-gray-50 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="font-montserrat text-sm text-gray-500">
            Asset Management University • Ubuntu Economics • Radical Transparency
          </p>
          <p className="mt-2 font-montserrat text-xs text-gray-400">
            "I am because we are" — Together, we make education accessible to all.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ================================================
// HELPER COMPONENTS
// ================================================

function CostBar({
  icon,
  label,
  amount,
  total,
  color,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  amount: number;
  total: number;
  color: string;
  note: string;
}) {
  const percentage = Math.round((amount / total) * 100);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          {icon}
          <span className="font-montserrat font-medium">{label}</span>
        </div>
        <div className="text-right">
          <span className="font-montserrat font-bold text-[#1B2B5B]">
            {formatCurrency(amount)}
          </span>
          <span className="ml-2 text-sm text-gray-500">({percentage}%)</span>
        </div>
      </div>
      <div className="h-3 rounded-full bg-gray-200">
        <div
          className={`h-3 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">{note}</p>
    </div>
  );
}

// ================================================
// MOCK DATA
// ================================================

function getMockMetrics(): UbuntuMetrics {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    period: {
      start: startOfMonth.toISOString(),
      end: now.toISOString(),
      label: now.toLocaleString('en-ZA', { month: 'long', year: 'numeric' }),
    },
    revenue: {
      total: 185000,
      corporate: 148000,
      individual: 37000,
      growth_percentage: 12.5,
    },
    ubuntu_impact: {
      free_learners_supported: 1247,
      free_learning_hours: 8750,
      paid_to_free_ratio: '1:15',
      countries_reached: 12,
    },
    karma: {
      total_earned: 18500,
      total_paid_out: 14200,
      pending_payouts: 4300,
      active_referrers: 47,
    },
    costs: {
      total: 45750,
      ai_facilitation: 20000,
      infrastructure: 8000,
      payment_processing: 5365,
      marketing: 8000,
      other: 4385,
      cost_per_learner: 25,
    },
    reserves: {
      operating_reserve: 137250,
      operating_reserve_months: 3,
      target_reserve_months: 3,
      emergency_fund: 9250,
      surplus_available: 121000,
    },
    sustainability: {
      net_margin_percentage: 75.3,
      runway_months: 12,
      break_even_status: 'sustainable',
    },
    last_updated: now.toISOString(),
  };
}

function getMockTransactions(): PublicTransaction[] {
  const now = new Date();

  return [
    {
      transaction_id: 'tx_001',
      date: new Date(now.getTime() - 86400000).toISOString(),
      type: 'income',
      category: 'Corporate Certification',
      description: 'Mining Corp - 5 QCTO Certifications',
      amount: 44450,
      impact_note: 'Supports 75 free learners',
    },
    {
      transaction_id: 'tx_002',
      date: new Date(now.getTime() - 172800000).toISOString(),
      type: 'expense',
      category: 'AI Services',
      description: 'Anthropic Claude API - Monthly',
      amount: 20000,
    },
    {
      transaction_id: 'tx_003',
      date: new Date(now.getTime() - 259200000).toISOString(),
      type: 'income',
      category: 'Individual Certification',
      description: '8 Individual Certifications',
      amount: 4000,
      impact_note: 'Supports 7 free learners',
    },
    {
      transaction_id: 'tx_004',
      date: new Date(now.getTime() - 345600000).toISOString(),
      type: 'expense',
      category: 'Cloud Infrastructure',
      description: 'Google Cloud Platform - Monthly',
      amount: 8000,
    },
    {
      transaction_id: 'tx_005',
      date: new Date(now.getTime() - 432000000).toISOString(),
      type: 'expense',
      category: 'Referral Commissions',
      description: 'Karma payouts to referrers',
      amount: 14200,
      impact_note: 'Rewarding our community',
    },
  ];
}
