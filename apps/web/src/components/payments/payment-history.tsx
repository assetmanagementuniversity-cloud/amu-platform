'use client';

/**
 * Payment History Component - AMU Platform
 *
 * Displays user's certificate purchase history.
 *
 * "Ubuntu - I am because we are"
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Card } from '@/components/ui/card';
import {
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Receipt,
  Download,
} from 'lucide-react';

interface Purchase {
  id: string;
  purchase_id: string;
  course_title: string;
  amount: number;
  currency: string;
  status: string;
  purchased_at: string;
  certificate_url?: string;
}

export function PaymentHistory() {
  const { getIdToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const token = await getIdToken();
        if (!token) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/checkout/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to load history');
          return;
        }

        setPurchases(data.purchases);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [getIdToken]);

  // Format price for display
  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            <Clock className="h-3 w-3" />
            Processing
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
            <XCircle className="h-3 w-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-amu-navy" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Receipt className="mx-auto h-12 w-12 text-amu-slate/50" />
        <h3 className="mt-4 font-heading text-lg font-semibold text-amu-navy">
          No Purchases Yet
        </h3>
        <p className="mt-2 text-sm text-amu-slate">
          Your certificate purchase history will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
        <Receipt className="h-5 w-5" />
        Purchase History
      </h2>

      <div className="space-y-3">
        {purchases.map((purchase) => (
          <Card key={purchase.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-amu-charcoal">
                  {purchase.course_title}
                </h3>
                <p className="text-sm text-amu-slate">
                  {formatDate(purchase.purchased_at)}
                </p>
              </div>

              <div className="text-right">
                <p className="font-medium text-amu-navy">
                  {formatPrice(purchase.amount, purchase.currency)}
                </p>
                <StatusBadge status={purchase.status} />
              </div>
            </div>

            {purchase.status === 'completed' && purchase.certificate_url && (
              <div className="mt-3 border-t border-amu-slate/10 pt-3">
                <a
                  href={purchase.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-amu-navy hover:underline"
                >
                  <Download className="h-4 w-4" />
                  Download Certificate
                </a>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
