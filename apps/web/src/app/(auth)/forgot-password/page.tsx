import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Reset Password | Asset Management University',
  description: 'Reset your AMU account password.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
