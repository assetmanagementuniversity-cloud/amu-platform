/**
 * Auth components barrel export
 */

// Re-export AuthProvider and useAuth from the new lib/auth module
// for backward compatibility with existing imports
export { AuthProvider, useAuth } from '@/lib/auth/auth-context';

// Component exports
export { LoginForm } from './login-form';
export { RegisterForm } from './register-form';
export { ForgotPasswordForm } from './forgot-password-form';
