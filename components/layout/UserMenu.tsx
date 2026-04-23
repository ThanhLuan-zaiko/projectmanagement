'use client';

import { useState, useRef, useEffect, type CSSProperties } from 'react';
import Image from 'next/image';
import { FiLock, FiLogOut, FiChevronDown } from 'react-icons/fi';
import ChangePasswordModal from './ChangePasswordModal';
import { logoutUser } from '@/hooks/useAuth';

interface UserMenuProps {
  user: {
    user_id: string;
    email: string;
    username: string;
    full_name: string;
    role: string;
    avatar_url?: string;
  } | null;
  dropdownMode?: 'anchored' | 'fixed';
  fixedDesktopTop?: number;
  fixedDesktopRight?: number;
  fixedMobileTop?: number;
  fixedMobileInset?: number;
  dropdownWidth?: number;
}

export default function UserMenu({
  user,
  dropdownMode = 'anchored',
  fixedDesktopTop = 112,
  fixedDesktopRight = 24,
  fixedMobileTop = 88,
  fixedMobileInset = 16,
  dropdownWidth = 288,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setDropdownStyle({});
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current) {
        return;
      }

      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const edgePadding = 16;

      if (dropdownMode === 'fixed') {
        if (viewportWidth < 640) {
          setDropdownStyle({
            top: Math.min(fixedMobileTop, viewportHeight - edgePadding),
            left: fixedMobileInset,
            right: fixedMobileInset,
            width: 'auto',
            maxWidth: `calc(100vw - ${fixedMobileInset * 2}px)`,
          });
          return;
        }

        setDropdownStyle({
          top: Math.min(fixedDesktopTop, viewportHeight - edgePadding),
          right: fixedDesktopRight,
          width: Math.min(dropdownWidth, viewportWidth - fixedDesktopRight - edgePadding),
        });
        return;
      }

      if (viewportWidth < 640) {
        setDropdownStyle({
          top: Math.min(rect.bottom + 10, viewportHeight - edgePadding),
          left: edgePadding,
          right: edgePadding,
          width: 'auto',
          maxWidth: `calc(100vw - ${edgePadding * 2}px)`,
        });
        return;
      }

      const right = Math.max(edgePadding, viewportWidth - rect.right);
      const availableWidth = viewportWidth - right - edgePadding;

      setDropdownStyle({
        top: Math.min(rect.bottom + 10, viewportHeight - edgePadding),
        right,
        width: Math.min(dropdownWidth, availableWidth),
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    if (dropdownMode === 'anchored') {
      window.addEventListener('scroll', updatePosition, true);
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      if (dropdownMode === 'anchored') {
        window.removeEventListener('scroll', updatePosition, true);
      }
    };
  }, [
    dropdownMode,
    dropdownWidth,
    fixedDesktopRight,
    fixedDesktopTop,
    fixedMobileInset,
    fixedMobileTop,
    isOpen,
  ]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setIsOpen(false);
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const handlePasswordChange = () => {
    setIsOpen(false);
    setShowPasswordModal(true);
  };

  if (!user) return null;

  const displayName = user.full_name || user.username;
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <div className={`relative ${isOpen ? 'z-[1300]' : 'z-[999]'}`} ref={menuRef}>
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/30 transition-all duration-200 group"
        >
          {/* Avatar */}
          <div className="relative">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={displayName}
                loader={({ src }) => src}
                unoptimized
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover border-2 border-slate-600 group-hover:border-blue-500 transition-colors"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-slate-600 group-hover:border-blue-500 transition-colors">
                <span className="text-white text-sm font-semibold">{initials}</span>
              </div>
            )}
            {/* Online status indicator */}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-800" />
          </div>

          {/* User info */}
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-white">{displayName}</span>
            <span className="text-xs text-slate-400 capitalize">{user.role}</span>
          </div>

          {/* Dropdown arrow */}
          <FiChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="fixed z-[1400] overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-2xl shadow-black/55 backdrop-blur-xl"
            style={dropdownStyle}
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-base font-semibold">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={handlePasswordChange}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/30 hover:text-white transition-colors"
              >
                <FiLock className="w-4 h-4" />
                <span>Change Password</span>
              </button>

              <div className="my-1 border-t border-slate-700/50" />

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
}
