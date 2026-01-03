'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, User, Eye, EyeOff, Gift, Check, X } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@amu/shared';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { Button, Input, Label, Alert, AlertDescription } from '@/components/ui';
import { cn } from '@/lib/utils';
import { LOGO_WITH_SLOGAN } from '@/lib/brand-assets';

interface RegisterFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
}

export function RegisterForm({ redirectTo = '/dashboard', onSuccess }: RegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser, loginWithGoogle, loading, error, clearError } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);

  // Get referral code from URL if present
  const referralCodeFromUrl = searchParams.get('ref') || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      referralCode: referralCodeFromUrl,
    },
  });

  const password = watch('password', '');

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const onSubmit = async (data: RegisterInput) => {
    clearError();
    const result = await registerUser({
      email: data.email,
      password: data.password,
      name: data.name,
      referralCode: data.referralCode,
    });

    if (result) {
      onSuccess?.();
      router.push(redirectTo);
    }
  };

  const handleGoogleRegister = async () => {
    clearError();
    const result = await loginWithGoogle();

    if (result) {
      onSuccess?.();
      router.push(redirectTo);
    }
  };

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

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-heading font-medium text-amu-navy">Create your account</h1>
        <p className="mt-2 text-sm text-amu-charcoal">
          Start your free learning journey with AMU
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" error={!!errors.name}>
            Full name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amu-slate" />
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              className="pl-10"
              error={!!errors.name}
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

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
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" error={!!errors.password}>
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amu-slate" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              className="pl-10 pr-10"
              error={!!errors.password}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-amu-slate hover:text-amu-charcoal"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Password Strength Indicators */}
          {password.length > 0 && (
            <div className="space-y-1 pt-1">
              <PasswordCheck passed={passwordChecks.length} label="At least 8 characters" />
              <PasswordCheck passed={passwordChecks.uppercase} label="One uppercase letter" />
              <PasswordCheck passed={passwordChecks.number} label="One number" />
            </div>
          )}

          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Referral Code Field (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="referralCode">
            Referral code{' '}
            <span className="font-normal text-amu-slate">(optional)</span>
          </Label>
          <div className="relative">
            <Gift className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amu-slate" />
            <Input
              id="referralCode"
              type="text"
              placeholder="Enter referral code if you have one"
              className="pl-10"
              {...register('referralCode')}
            />
          </div>
          {referralCodeFromUrl && (
            <p className="text-sm text-amu-navy">
              Referral code applied from invitation link
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading || isSubmitting}
        >
          Create account
        </Button>
      </form>

      {/* Terms Notice */}
      <p className="text-center text-xs text-amu-slate">
        By creating an account, you agree to our{' '}
        <Link href="/terms" className="text-amu-navy hover:text-amu-navy/80">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-amu-navy hover:text-amu-navy/80">
          Privacy Policy
        </Link>
      </p>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-amu-sky" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-amu-slate">Or continue with</span>
        </div>
      </div>

      {/* Google Register */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleRegister}
        disabled={loading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      {/* Login Link */}
      <p className="text-center text-sm text-amu-charcoal">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-amu-navy hover:text-amu-navy/80"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

// ============================================
// Password Check Component
// ============================================

function PasswordCheck({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {passed ? (
        <Check className="h-3 w-3 text-amu-navy" />
      ) : (
        <X className="h-3 w-3 text-amu-slate/50" />
      )}
      <span className={cn(passed ? 'text-amu-navy' : 'text-amu-slate')}>
        {label}
      </span>
    </div>
  );
}
