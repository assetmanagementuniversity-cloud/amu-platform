import { Metadata } from 'next';
import { LoginForm } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Sign In | Asset Management University',
  description: 'Sign in to your AMU account to continue your learning journey.',
};

export default function LoginPage() {
  return <LoginForm />;
}
