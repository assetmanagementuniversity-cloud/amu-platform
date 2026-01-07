'use client';

/**
 * Payment Success Component - AMU Platform
 *
 * Displays success message after Stripe checkout completion.
 * Shows certificate download information.
 *
 * "Ubuntu - I am because we are"
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CheckCircle,
  Download,
  Loader2,
  Mail,
  ArrowRight,
  Award,
} from 'lucide-react';
import Link from 'next/link';

interface SessionDetails {
  id: string;
  status: string;
  payment_status: string;
  amount_total: number;
  currency: string;
  customer_email: string;
  enrolment_id: string;
  course_id: string;
}

export function PaymentSuccess() {
  const searchParams = useSearchParams();
  const { getIdToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        const token = await getIdToken();
        if (!token) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/checkout/session/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to fetch session');
          return;
        }

        setSession(data.session);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [searchParams, getIdToken]);

  // Format price for display
  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amu-navy" />
          <p className="mt-4 text-amu-slate">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span className="text-3xl">!</span>
        </div>
        <h2 className="mb-2 font-heading text-xl font-semibold text-red-800">
          Something went wrong
        </h2>
        <p className="mb-6 text-amu-slate">{error || 'Unable to confirm payment'}</p>
        <Link href="/learn">
          <Button>Return to Learning</Button>
        </Link>
      </Card>
    );
  }

  const isSuccessful = session.payment_status === 'paid';

  return (
    <Card className="mx-auto max-w-lg overflow-hidden">
      {/* Success Header */}
      <div className={`${isSuccessful ? 'bg-green-50' : 'bg-amber-50'} px-6 py-8 text-center`}>
        <div
          className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
            isSuccessful ? 'bg-green-100' : 'bg-amber-100'
          }`}
        >
          {isSuccessful ? (
            <CheckCircle className="h-10 w-10 text-green-600" />
          ) : (
            <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
          )}
        </div>

        <h1 className="font-heading text-2xl font-semibold text-amu-navy">
          {isSuccessful ? 'Payment Successful!' : 'Payment Processing'}
        </h1>

        <p className="mt-2 text-amu-charcoal">
          {isSuccessful
            ? 'Your official certificate is being prepared.'
            : 'Your payment is being processed. Please wait.'}
        </p>
      </div>

      {/* Details */}
      <div className="p-6">
        <div className="mb-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-amu-slate">Amount Paid</span>
            <span className="font-medium">
              {formatPrice(session.amount_total, session.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-amu-slate">Email</span>
            <span className="font-medium">{session.customer_email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amu-slate">Reference</span>
            <span className="font-mono text-xs">{session.id.slice(0, 20)}...</span>
          </div>
        </div>

        {/* Next Steps */}
        {isSuccessful && (
          <div className="rounded-lg bg-amu-sky/30 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-amu-navy">
              <Award className="h-4 w-4" />
              What Happens Next?
            </h3>
            <ul className="space-y-2 text-sm text-amu-charcoal">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span>Your official certificate (without watermark) is being generated</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amu-navy" />
                <span>
                  You will receive an email at <strong>{session.customer_email}</strong> when
                  ready
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Download className="mt-0.5 h-4 w-4 shrink-0 text-amu-navy" />
                <span>Download will also be available from your certificates page</span>
              </li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Link href="/certificates">
            <Button className="w-full">
              <Award className="mr-2 h-4 w-4" />
              View My Certificates
            </Button>
          </Link>
          <Link href="/learn">
            <Button variant="outline" className="w-full">
              Continue Learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
