'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  validationErrors?: string[];
  validationWarnings?: string[];
  validationInfo?: string[];
  showValidation?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  validationErrors = [],
  validationWarnings = [],
  validationInfo = [],
  showValidation = false,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const hasValidation = showValidation && (
    validationErrors.length > 0 ||
    validationWarnings.length > 0 ||
    validationInfo.length > 0
  );

  const modalContent = (
    <div
      className="theme-modal-overlay fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Container */}
      <div className="relative w-full">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-75" />

        {/* Modal Content */}
        <div className={`theme-modal-surface relative border border-slate-700 ${sizeClasses[size]} w-full mx-auto rounded-2xl shadow-2xl overflow-hidden`}>

          {/* Top Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />

          {/* Header */}
          <div className="theme-modal-header relative px-6 py-5 border-b border-slate-700">
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                    <div className="w-5 h-5 border-2 border-white/30 rounded-lg" />
                  </div>
                  <span>{title}</span>
                </h2>
                {subtitle && (
                  <p className="text-sm text-slate-400 ml-13">{subtitle}</p>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-xl transition-all duration-200 group flex-shrink-0 ml-4 hover:rotate-90"
                aria-label="Close modal"
              >
                <FiX className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Validation Messages */}
          {hasValidation && (
            <div className="px-6 py-4 space-y-3 bg-slate-800/50 border-b border-slate-700">
              {/* Errors */}
              {validationErrors.length > 0 && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-300 mb-1">
                      {validationErrors.length === 1 ? 'Validation Error' : `${validationErrors.length} Validation Errors`}
                    </p>
                    <ul className="space-y-1">
                      {validationErrors.map((error, idx) => (
                        <li key={idx} className="text-sm text-red-300/80 flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {validationWarnings.length > 0 && (
                <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <FiAlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-300 mb-1">
                      {validationWarnings.length === 1 ? 'Warning' : `${validationWarnings.length} Warnings`}
                    </p>
                    <ul className="space-y-1">
                      {validationWarnings.map((warning, idx) => (
                        <li key={idx} className="text-sm text-yellow-300/80 flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Info */}
              {validationInfo.length > 0 && (
                <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <FiInfo className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-300 mb-1">
                      Information
                    </p>
                    <ul className="space-y-1">
                      {validationInfo.map((info, idx) => (
                        <li key={idx} className="text-sm text-blue-300/80 flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          {info}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Body */}
          <div
            className="px-6 py-6 max-h-[calc(90vh-200px)] overflow-y-auto overflow-x-hidden"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(71 85 105 / 0.5) transparent',
            }}
          >
            {children}
          </div>

          {/* Footer Border */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
        </div>

        {/* Keyboard Hint */}
        <div className="theme-modal-hint mt-4 hidden text-center text-xs sm:block">
          Press <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-400 mx-1">Esc</kbd> to close
        </div>
      </div>
    </div>
  );

  // Use portal to render modal outside parent stacking context
  return createPortal(modalContent, document.body);
}
