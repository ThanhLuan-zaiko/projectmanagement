'use client';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export default function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  id,
}: SwitchProps) {
  // Ensure checked is always a boolean
  const isChecked = Boolean(checked);
  
  return (
    <label
      className={`flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      htmlFor={id}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={isChecked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`
            w-11 h-6 rounded-full transition-colors duration-200
            ${isChecked ? 'bg-blue-500' : 'bg-slate-600'}
            ${disabled ? 'opacity-50' : ''}
          `}
        >
          <div
            className={`
              absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md
              transform transition-transform duration-200
              ${isChecked ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </div>
      </div>
      {label && (
        <span className="text-sm text-slate-300">{label}</span>
      )}
    </label>
  );
}
