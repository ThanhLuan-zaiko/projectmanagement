import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
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
  return (
    <>
      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiMail className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
              errors.email ? 'border-red-400' : 'border-white/10'
            } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            placeholder="your@email.com"
          />
        </div>
        {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
      </div>

      {/* Username Field (Register Only) */}
      {mode === 'register' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiUser className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={onChange}
              className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                errors.username ? 'border-red-400' : 'border-white/10'
              } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              placeholder="johndoe"
            />
          </div>
          {errors.username && <p className="mt-2 text-sm text-red-400">{errors.username}</p>}
        </div>
      )}

      {/* Full Name Field (Register Only) */}
      {mode === 'register' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiUser className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={onChange}
              className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                errors.full_name ? 'border-red-400' : 'border-white/10'
              } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              placeholder="John Doe"
            />
          </div>
          {errors.full_name && <p className="mt-2 text-sm text-red-400">{errors.full_name}</p>}
        </div>
      )}

      {/* Phone Field (Register Only) */}
      {mode === 'register' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Phone Number <span className="text-slate-500">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiPhone className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="+84 123 456 789"
            />
          </div>
        </div>
      )}

      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiLock className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={onChange}
            className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${
              errors.password ? 'border-red-400' : 'border-white/10'
            } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
          >
            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
      </div>
    </>
  );
}
