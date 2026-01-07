'use client';

/**
 * Checkout Button Component - AMU Platform
 *
 * Stripe Checkout button for certificate purchases.
 * Handles session creation and redirect to Stripe hosted checkout.
 *
 * "Ubuntu - I am because we are"
 */

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';

interface CheckoutButtonProps {
  enrolmentId: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency?: string;
  referralCode?: string;
  discountApplied?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CheckoutButton({
  enrolmentId,
  courseId,
  courseTitle,
  amount,
  currency = 'ZAR',
  referralCode,
  discountApplied,
  disabled,
  className,
}: CheckoutButtonProps) {
  const { getIdToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getIdToken();
      if (!token) {
        setError('Please sign in to purchase');
        return;
      }

      const response = await fetch('/api/checkout/certificate-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrolmentId,
          courseId,
          referralCode,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to create checkout session');
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Invalid checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to initiate checkout');
    } finally {
      setLoading(false);
    }
  };

  // Format price for display
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  };

  return (
    <div className={className}>
      <Button
        onClick={handleCheckout}
        disabled={disabled || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Purchase Certificate - {formatPrice(amount)}
          </>
        )}
      </Button>

      {discountApplied && (
        <p className="mt-2 text-center text-sm text-green-600">
          10% referral discount applied!
        </p>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
