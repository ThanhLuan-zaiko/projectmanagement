'use client';

import { createPortal } from 'react-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

interface CustomSelectProps {
  name: string;
  value: string;
  options: SelectOption[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
  usePortal?: boolean;
  disabled?: boolean;
}

export default function CustomSelect({
  name,
  value,
  options,
  onChange,
  required = false,
  placeholder = 'Select...',
  usePortal = false,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateDropdownPosition = useCallback(() => {
    if (!buttonRef.current || !usePortal) {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, [usePortal]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (selectRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !usePortal) {
      return;
    }

    updateDropdownPosition();

    const handleViewportChange = () => {
      updateDropdownPosition();
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen, updateDropdownPosition, usePortal]);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue: string) => {
    const syntheticEvent = {
      target: {
        name,
        value: optionValue,
      },
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

    onChange(syntheticEvent);
    setIsOpen(false);
  };

  const DropdownContent = (
    <div
      ref={dropdownRef}
      className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-black/50"
      style={
        usePortal
          ? {
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 9999,
            }
          : {
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.5rem',
              zIndex: 50,
            }
      }
    >
      <div
        className="max-h-60 overflow-y-auto py-2"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(71 85 105 / 0.5) transparent',
        }}
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 transition-colors ${
                isSelected
                  ? 'bg-blue-600/20 text-blue-300'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {option.icon && <span className="shrink-0">{option.icon}</span>}
              <span className={`flex-1 text-left ${option.color || ''}`}>{option.label}</span>
              {isSelected && <FiCheck className="h-4 w-4 shrink-0 text-blue-300" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative" ref={selectRef}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="pointer-events-none absolute -z-10 opacity-0"
        tabIndex={-1}
        aria-hidden="true"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) {
            return;
          }

          setIsOpen((currentValue) => !currentValue);
        }}
        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
          disabled
            ? 'cursor-not-allowed border-white/5 bg-white/[0.03] text-slate-500'
            : 'border-white/10 bg-white/5 text-white hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-cyan-400/50'
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={`truncate ${selectedOption?.color || (disabled ? 'text-slate-500' : 'text-white')}`}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <FiChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } ${disabled ? 'text-slate-600' : 'text-slate-400'}`}
        />
      </button>

      {isOpen && (usePortal ? createPortal(DropdownContent, document.body) : DropdownContent)}
    </div>
  );
}
