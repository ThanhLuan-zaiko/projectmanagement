'use client';

import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { createPortal } from 'react-dom';

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
}

export default function CustomSelect({
  name,
  value,
  options,
  onChange,
  required = false,
  placeholder = 'Select...',
  usePortal = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current && usePortal) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen, usePortal]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    // Create a synthetic event to match the existing onChange signature
    const syntheticEvent = {
      target: {
        name,
        value: optionValue,
      },
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

    onChange(syntheticEvent);
    setIsOpen(false);
  };

  const DropdownContent = () => (
    <div 
      className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
      style={usePortal ? {
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 9999,
      } : {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: '0.5rem',
        zIndex: 50,
      }}
    >
      <div 
        className="py-2 max-h-60 overflow-y-auto"
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
              className={`
                w-full px-4 py-2.5 flex items-center gap-3 transition-colors
                ${
                  isSelected
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }
              `}
            >
              {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
              <span className={`flex-1 text-left ${option.color || ''}`}>
                {option.label}
              </span>
              {isSelected && (
                <FiCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative" ref={selectRef}>
      {/* Hidden native select for form submission - no required to avoid browser validation issues */}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="absolute opacity-0 pointer-events-none -z-10"
        tabIndex={-1}
      />

      {/* Custom Select Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between hover:bg-slate-700/70"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
          <span className={selectedOption?.color || 'text-white'}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <FiChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        usePortal ? createPortal(<DropdownContent />, document.body) : <DropdownContent />
      )}
    </div>
  );
}
