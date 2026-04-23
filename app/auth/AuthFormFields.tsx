import { FiEye, FiEyeOff, FiLock, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import { FormData, FormErrors } from './types';

interface AuthFormFieldsProps {
  mode: 'login' | 'register';
  formData: FormData;
  errors: FormErrors;
  showPassword: boolean;
  onTogglePassword: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AuthFormFields({
  mode,
  formData,
  errors,
  showPassword,
  onTogglePassword,
  onChange,
}: AuthFormFieldsProps) {
  const inputClasses = (hasError: boolean, hasAction = false) =>
    `auth-input w-full rounded-2xl border py-3.5 text-sm transition-all ${
      hasAction ? 'pl-12 pr-12' : 'pl-12 pr-4'
    } ${hasError ? 'auth-input-error' : ''}`;

  return (
    <>
      <div>
        <label htmlFor="email" className="auth-copy-strong mb-2 block text-sm font-medium">
          Email address
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <FiMail className="auth-input-icon h-5 w-5" />
          </div>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            aria-invalid={Boolean(errors.email)}
            className={inputClasses(Boolean(errors.email))}
            placeholder="your@email.com"
          />
        </div>
        {errors.email && <p className="auth-field-error mt-2 text-sm">{errors.email}</p>}
      </div>

      {mode === 'register' && (
        <div>
          <label htmlFor="username" className="auth-copy-strong mb-2 block text-sm font-medium">
            Username
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <FiUser className="auth-input-icon h-5 w-5" />
            </div>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={onChange}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              aria-invalid={Boolean(errors.username)}
              className={inputClasses(Boolean(errors.username))}
              placeholder="johndoe"
            />
          </div>
          {errors.username && <p className="auth-field-error mt-2 text-sm">{errors.username}</p>}
        </div>
      )}

      {mode === 'register' && (
        <div>
          <label htmlFor="full_name" className="auth-copy-strong mb-2 block text-sm font-medium">
            Full name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <FiUser className="auth-input-icon h-5 w-5" />
            </div>
            <input
              id="full_name"
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={onChange}
              autoComplete="name"
              required
              aria-invalid={Boolean(errors.full_name)}
              className={inputClasses(Boolean(errors.full_name))}
              placeholder="John Doe"
            />
          </div>
          {errors.full_name && <p className="auth-field-error mt-2 text-sm">{errors.full_name}</p>}
        </div>
      )}

      {mode === 'register' && (
        <div>
          <label htmlFor="phone" className="auth-copy-strong mb-2 block text-sm font-medium">
            Phone number <span className="auth-muted">(Optional)</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <FiPhone className="auth-input-icon h-5 w-5" />
            </div>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              autoComplete="tel"
              className={inputClasses(false)}
              placeholder="+84 123 456 789"
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="password" className="auth-copy-strong mb-2 block text-sm font-medium">
          Password
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <FiLock className="auth-input-icon h-5 w-5" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={onChange}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            aria-invalid={Boolean(errors.password)}
            className={inputClasses(Boolean(errors.password), true)}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="auth-input-button absolute inset-y-0 right-0 flex items-center pr-4 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="auth-field-error mt-2 text-sm">{errors.password}</p>}
      </div>
    </>
  );
}
