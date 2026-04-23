'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiAlertCircle, FiLoader, FiUserPlus } from 'react-icons/fi';
import AuthLayout from '../AuthLayout';
import AuthFormFields from '../AuthFormFields';
import AuthAlert from '../AuthAlert';
import { FormData, FormErrors } from '../types';
import { apiFetch } from '@/utils/api-client';

export default function RegisterPage() {
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
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'An error occurred');

        if (data.passwordErrors && Array.isArray(data.passwordErrors)) {
          setPasswordErrors(data.passwordErrors);
        } else {
          setPasswordErrors([]);
        }

        return;
      }

      setPasswordErrors([]);
      setSuccess('Registration successful! Redirecting to projects...');

      setTimeout(() => {
        window.location.href = '/projects';
      }, 1500);
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
      title="Create your account"
      subtitle="Set up secure access for your project workspace and start planning."
    >
      <AuthAlert type="error" message={error} />
      <AuthAlert type="success" message={success} />

      {passwordErrors.length > 0 && (
        <div className="auth-warning-panel mb-6 rounded-2xl border p-4">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="auth-warning-icon mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="auth-copy-strong mb-2 text-sm font-semibold">Password requirements</p>
              <ul className="space-y-1.5">
                {passwordErrors.map((err, idx) => (
                  <li key={idx} className="auth-warning-text flex items-start gap-2 text-sm">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-current/70" />
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthFormFields
          mode="register"
          formData={formData}
          errors={errors}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="auth-button-primary flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <FiLoader className="h-5 w-5 animate-spin" />
              <span>Please wait...</span>
            </>
          ) : (
            <>
              <FiUserPlus className="h-5 w-5" />
              <span>Create account</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="auth-muted text-sm">
          {'Already have an account?'}{' '}
          <Link href="/auth/login" className="auth-link font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
