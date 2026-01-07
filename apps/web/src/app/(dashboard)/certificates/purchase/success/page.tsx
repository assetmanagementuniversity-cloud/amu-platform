'use client';

/**
 * Certificate Purchase Success Page - AMU Platform
 *
 * Displayed after successful Stripe checkout.
 *
 * "Ubuntu - I am because we are"
 */

import { Suspense } from 'react';
import { PaymentSuccess } from '@/components/payments';
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-amu-navy" />
        <p className="mt-4 text-amu-slate">Loading payment details...</p>
      </div>
    </div>
  );
}

export default function CertificatePurchaseSuccessPage() {
  return (
    <div className="mx-auto max-w-4xl py-8 px-4">
      <Suspense fallback={<LoadingFallback />}>
        <PaymentSuccess />
      </Suspense>
    </div>
  );
}
