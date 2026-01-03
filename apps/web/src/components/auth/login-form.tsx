'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginSchema, type LoginInput } from '@amu/shared';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { Button, Input, Label, Alert, AlertDescription } from '@/components/ui';
import { cn } from '@/lib/utils';
import { LOGO_WITH_SLOGAN } from '@/lib/brand-assets';

interface LoginFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
}

// AMU Brand Styling (Section 9)
export function LoginForm({ redirectTo = '/dashboard', onSuccess }: LoginFormProps) {
  const router = useRouter();
  const { login, loginWithGoogle, loading, error, clearError } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    clearError();
    const result = await login(data);

    if (result) {
      onSuccess?.();
      router.push(redirectTo);
    }
  };

  const handleGoogleLogin = async () => {
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

      {/* Header - Montserrat heading, Open Sans body */}
      <div className="text-center">
        <h1 className="font-heading text-2xl font-medium text-amu-navy">Welcome back</h1>
        <p className="mt-2 font-body text-sm text-amu-charcoal">
          Sign in to continue your learning journey
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Login Form */}
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

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" error={!!errors.password}>
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="font-body text-sm text-amu-navy hover:text-amu-navy/80 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amu-slate" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="pl-10 pr-10"
              error={!!errors.password}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-amu-slate hover:text-amu-navy"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="font-body text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button - AMU Navy */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading || isSubmitting}
        >
          Sign in
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-amu-sky" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 font-body text-amu-slate">Or continue with</span>
        </div>
      </div>

      {/* Google Login */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
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

      {/* Register Link */}
      <p className="text-center font-body text-sm text-amu-charcoal">
        Do not have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-amu-navy hover:text-amu-navy/80 hover:underline"
        >
          Create one for free
        </Link>
      </p>
    </div>
  );
}
