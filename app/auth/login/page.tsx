'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiLogIn, FiLoader } from 'react-icons/fi';
import AuthLayout from '../AuthLayout';
import AuthFormFields from '../AuthFormFields';
import AuthAlert from '../AuthAlert';
import { FormData, FormErrors } from '../types';
import { apiFetch } from '@/utils/api-client';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/projects';
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
    full_name: '',
    phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'An error occurred');
        return;
      }

      setSuccess('Login successful! Redirecting...');

      // Redirect to dashboard or original destination
      setTimeout(() => {
        window.location.href = redirect;
      }, 1000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your projects, schedules, and team updates."
    >
      <AuthAlert type="error" message={error} />
      <AuthAlert type="success" message={success} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthFormFields
          mode="login"
          formData={formData}
          errors={errors}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          onChange={handleChange}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="auth-button-primary flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Please wait...</span>
            </>
          ) : (
            <>
              <FiLogIn className="w-5 h-5" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 text-center">
        <p className="auth-muted text-sm">
          {"Don't have an account?"}{' '}
          <Link
            href="/auth/register"
            className="auth-link font-semibold transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-shell auth-muted flex min-h-[100dvh] items-center justify-center px-6 text-sm">
          Loading sign-in...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
