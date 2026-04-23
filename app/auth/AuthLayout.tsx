import { ReactNode } from 'react';
import { BsShieldLock } from 'react-icons/bs';
import AuthBackground from './AuthBackground';
import AuthBranding from './AuthBranding';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="auth-shell relative isolate min-h-[100dvh] overflow-hidden">
      <AuthBackground />
      <div className="auth-shell-gradient pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <AuthBranding />

          <div className="w-full max-w-[32rem] lg:justify-self-end">
            <div className="auth-card rounded-[2rem] p-6 sm:p-8 lg:p-10">
              <div className="mb-8">
                <div className="mb-6 flex items-center gap-4 lg:hidden">
                  <div className="auth-logo-mark flex h-14 w-14 items-center justify-center rounded-[1.35rem]">
                    <BsShieldLock className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <p className="auth-kicker">ProjectHub Workspace</p>
                    <p className="auth-muted mt-1 text-sm">
                      Protected access for your planning workspace
                    </p>
                  </div>
                </div>

                <p className="auth-kicker hidden lg:block">Secure workspace access</p>
                <h2 className="auth-heading mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {title}
                </h2>
                <p className="auth-copy mt-3 max-w-xl text-sm leading-6 sm:text-base">
                  {subtitle}
                </p>
              </div>

              {children}
            </div>

            <p className="auth-muted mt-5 px-2 text-center text-xs sm:text-sm">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
