'use client';

/**
 * Certificate Verification Page
 *
 * Displays certificate details when accessed via QR code
 * URL: /verify/[certificateId]
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, XCircle, Loader2, Award, Calendar, BookOpen, ArrowLeft } from 'lucide-react';
import { verifyCertificate, type Certificate } from '@/lib/certificates';
import { LOGO_WITH_SLOGAN } from '@/lib/brand-assets';

export default function VerifyCertificatePage() {
  const params = useParams();
  const certificateId = params.id as string;

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCertificate() {
      if (!certificateId) {
        setError('No certificate ID provided');
        setLoading(false);
        return;
      }

      try {
        const cert = await verifyCertificate(certificateId);
        if (cert) {
          setCertificate(cert);
        } else {
          setError('Certificate not found');
        }
      } catch (err) {
        setError('Error verifying certificate');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificate();
  }, [certificateId]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-amu-sky/30">
      {/* Header */}
      <header className="bg-amu-navy">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center">
            <Image
              src={LOGO_WITH_SLOGAN}
              alt="Asset Management University"
              width={180}
              height={40}
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-12">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-amu-navy" />
            <p className="mt-4 font-body text-amu-slate">Verifying certificate...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="mt-4 font-heading text-2xl font-bold text-amu-charcoal">
              Verification Failed
            </h1>
            <p className="mt-2 font-body text-amu-slate">{error}</p>
            <p className="mt-4 font-body text-sm text-amu-slate">
              Certificate ID: <code className="rounded bg-amu-sky px-2 py-1">{certificateId}</code>
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-amu-navy px-4 py-2 font-heading text-sm text-white hover:bg-amu-navy/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to AMU
            </Link>
          </div>
        )}

        {/* Certificate Found */}
        {certificate && !loading && (
          <div className="overflow-hidden rounded-xl border border-amu-sky bg-white shadow-sm">
            {/* Success Banner */}
            <div className="bg-emerald-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                <div>
                  <h1 className="font-heading text-lg font-bold text-emerald-800">
                    Certificate Verified
                  </h1>
                  <p className="font-body text-sm text-emerald-700">
                    This is an authentic AMU certificate
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="p-6">
              {/* Unofficial Badge */}
              {certificate.certificate_template === 'unofficial' && (
                <div className="mb-4 inline-block rounded-full bg-amber-100 px-3 py-1">
                  <span className="font-body text-xs font-medium text-amber-800">
                    UNOFFICIAL CERTIFICATE
                  </span>
                </div>
              )}

              {/* Learner Name */}
              <div className="mb-6">
                <p className="font-body text-sm text-amu-slate">Awarded to</p>
                <h2 className="font-heading text-2xl font-bold text-amu-navy">
                  {certificate.certificate_learner_name}
                </h2>
              </div>

              {/* Course Title */}
              <div className="mb-6 rounded-lg bg-amu-sky/50 p-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="mt-0.5 h-5 w-5 text-amu-navy" />
                  <div>
                    <p className="font-body text-sm text-amu-slate">Course Completed</p>
                    <p className="font-heading text-lg font-semibold text-amu-navy">
                      {certificate.certificate_course_title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Issue Date */}
              <div className="mb-6 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-amu-slate" />
                <div>
                  <p className="font-body text-sm text-amu-slate">Issued on</p>
                  <p className="font-body font-medium text-amu-charcoal">
                    {formatDate(certificate.certificate_issued_date)}
                  </p>
                </div>
              </div>

              {/* Competencies */}
              {certificate.certificate_competencies.length > 0 && (
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-amu-navy" />
                    <h3 className="font-heading text-sm font-semibold text-amu-navy">
                      Competencies Achieved ({certificate.certificate_competencies.length})
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {certificate.certificate_competencies.map((comp) => (
                      <li
                        key={comp.competency_id}
                        className="flex items-center gap-2 font-body text-sm text-amu-charcoal"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        {comp.competency_title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certificate ID */}
              <div className="border-t border-amu-sky pt-4">
                <p className="font-body text-xs text-amu-slate">
                  Certificate ID:{' '}
                  <code className="rounded bg-amu-sky px-2 py-0.5">
                    {certificate.certificate_id}
                  </code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="font-body text-sm text-amu-slate">
            &quot;I am because we are&quot; — Ubuntu
          </p>
          <p className="mt-1 font-body text-xs text-amu-slate">
            Asset Management University | assetmanagementuniversity.org
          </p>
        </div>
      </main>
    </div>
  );
}
