'use client';

import { useSyncExternalStore } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, preference, toggleTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const isLightMode = theme === 'light';
  const isFollowingSystem = preference === 'system';
  const displayLightMode = mounted && isLightMode;
  const buttonLabel = mounted
    ? isLightMode
      ? 'Switch to dark mode'
      : 'Switch to light mode'
    : 'Toggle theme';

  return (
    <div
      className="pointer-events-none fixed right-3 z-[140] sm:right-4 lg:right-6"
      style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={buttonLabel}
        title={buttonLabel}
        className={`theme-fab pointer-events-auto group flex items-center gap-3 rounded-full px-2.5 py-2.5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 2xl:px-3 2xl:py-3 ${
          mounted ? 'opacity-100 translate-y-0' : 'translate-y-2 opacity-0'
        }`}
      >
        <span className="theme-toggle-track relative flex h-10 w-[4.25rem] items-center rounded-full p-1 2xl:h-11 2xl:w-[4.75rem]">
          <span
            className={`theme-toggle-thumb absolute top-1 h-8 w-8 rounded-full transition-transform duration-300 ease-out 2xl:h-9 2xl:w-9 ${
              displayLightMode ? 'translate-x-7 2xl:translate-x-8' : 'translate-x-0'
            }`}
          />
          <span className="relative z-10 flex w-full items-center justify-between px-1.5">
            <FiMoon
              className={`h-4 w-4 transition-colors duration-300 ${
                displayLightMode ? 'text-slate-500' : 'text-slate-950'
              }`}
            />
            <FiSun
              className={`h-4 w-4 transition-colors duration-300 ${
                displayLightMode ? 'text-slate-950' : 'text-slate-500'
              }`}
            />
          </span>
        </span>

        <span className="hidden min-w-0 text-left 2xl:block">
          <span className="block text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
            Theme
          </span>
          <span className="mt-0.5 block text-sm font-semibold text-white">
            {mounted ? (displayLightMode ? 'Light mode' : 'Dark mode') : 'Theme'}
          </span>
          {mounted && isFollowingSystem && (
            <span className="mt-0.5 block text-xs text-slate-500">
              Following system by default
            </span>
          )}
        </span>
      </button>
    </div>
  );
}
