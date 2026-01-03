import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Create Account | Asset Management University',
  description: 'Create your free AMU account and start your asset management learning journey.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
