'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { emailSchema } from '@amu/shared';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { Button, Input, Label, Alert, AlertDescription } from '@/components/ui';
import { LOGO_WITH_SLOGAN } from '@/lib/brand-assets';

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// AMU Brand Styling (Section 9)
export function ForgotPasswordForm() {
  const { resetPassword, loading, error, clearError } = useAuthActions();
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    clearError();
    const result = await resetPassword(data.email);

    if (result) {
      setEmailSent(true);
      setSentToEmail(data.email);
    }
  };

  // Success state
  if (emailSent) {
    return (
      <div className="w-full space-y-6">
        {/* AMU Logo - Navy bridge on white background */}
        <div className="flex justify-center">
          <Image
            src={LOGO_WITH_SLOGAN}
            alt="Asset Management University - Develop Capability"
            width={200}
            height={80}
            className="h-16 w-auto"
            priority
          />
        </div>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amu-sky">
            <CheckCircle className="h-6 w-6 text-amu-navy" />
          </div>
          <h1 className="font-heading text-2xl font-medium text-amu-navy">Check your email</h1>
          <p className="mt-2 font-body text-sm text-amu-charcoal">
            We have sent a password reset link to{' '}
            <span className="font-medium text-amu-navy">{sentToEmail}</span>
          </p>
        </div>

        <Alert variant="info">
          <AlertDescription>
            If you do not see the email, check your spam folder. The link will expire in 1 hour.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setEmailSent(false);
              setSentToEmail('');
            }}
          >
            Try a different email
          </Button>

          <Link href="/login" className="block">
            <Button type="button" variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* AMU Logo - Navy bridge on white background */}
      <div className="flex justify-center">
        <Image
          src={LOGO_WITH_SLOGAN}
          alt="Asset Management University - Develop Capability"
          width={200}
          height={80}
          className="h-16 w-auto"
          priority
        />
      </div>

      {/* Header - Montserrat heading, Open Sans body */}
      <div className="text-center">
        <h1 className="font-heading text-2xl font-medium text-amu-navy">Reset your password</h1>
        <p className="mt-2 font-body text-sm text-amu-charcoal">
          Enter your email address and we will send you a link to reset your password
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" error={!!errors.email}>
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amu-slate" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10"
              error={!!errors.email}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="font-body text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button - AMU Navy */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading || isSubmitting}
        >
          Send reset link
        </Button>
      </form>

      {/* Back to Login */}
      <Link href="/login" className="block">
        <Button type="button" variant="ghost" className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Button>
      </Link>
    </div>
  );
}
