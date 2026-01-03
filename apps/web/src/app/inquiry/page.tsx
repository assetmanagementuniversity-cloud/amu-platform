import { Metadata } from 'next';
import Link from 'next/link';
import { ChatInterface } from '@/components/chat';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ask a Question | Asset Management University',
  description: 'Have questions about AMU or asset management education? Chat with our AI assistant.',
};

export default function InquiryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-amu-sky/20">
      {/* Header */}
      <header className="border-b border-amu-sky bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1 font-body text-sm text-amu-slate hover:text-amu-charcoal"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="font-heading text-sm text-amu-charcoal hover:text-amu-navy"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-amu-navy px-4 py-2 font-heading text-sm font-medium text-white hover:bg-[#153e70] transition-colors"
            >
              Create free account
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-3xl flex-1">
          {/* Intro */}
          <div className="mb-6 text-center">
            <h1 className="font-heading text-2xl font-bold text-amu-navy">
              Have questions about AMU?
            </h1>
            <p className="mt-2 font-body text-amu-charcoal">
              Chat with our AI assistant to learn about our courses, approach, and how we can help you.
            </p>
          </div>

          {/* Chat Interface */}
          <div className="h-[calc(100vh-280px)] min-h-[500px]">
            <ChatInterface
              type="inquiry"
              welcomeMessage="Hello! I am here to help you learn about Asset Management University.

Whether you are curious about our courses, our unique AI-facilitated learning approach, or how we can help you develop your asset management capabilities—I am happy to answer your questions.

What would you like to know?"
            />
          </div>

          {/* CTA */}
          <div className="mt-6 rounded-lg bg-amu-sky p-4 text-center">
            <p className="font-body text-sm text-amu-navy">
              Ready to start learning?{' '}
              <Link
                href="/register"
                className="font-heading font-medium text-amu-navy hover:text-amu-navy/80 underline"
              >
                Create your free account
              </Link>{' '}
              and begin your journey today.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
