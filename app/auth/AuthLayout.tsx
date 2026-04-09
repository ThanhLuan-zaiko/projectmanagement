import { ReactNode } from 'react';
import { BsShieldLock } from 'react-icons/bs';
import AuthBranding from './AuthBranding';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        <AuthBranding />

        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="lg:hidden flex justify-center mb-4">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <BsShieldLock className="w-10 h-10 text-blue-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
              <p className="text-slate-300">{subtitle}</p>
            </div>

            {children}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
