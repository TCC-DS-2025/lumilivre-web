import { type InputHTMLAttributes, type ElementType, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ElementType;
  error?: string | null;
}

export function InputFloatingLabel({
  label,
  icon: Icon,
  id,
  error,
  className = '',
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasContent =
    props.value !== undefined && String(props.value).length > 0;
  const shouldFloatLabel = isFocused || hasContent;

  return (
    <div className={`relative group ${className}`}>
      <input
        id={id}
        className={`w-full pl-10 pr-4 py-3.5 bg-transparent border-2 rounded-lg outline-none text-gray-800 dark:text-gray-100
          ${
            error
              ? 'border-red-500'
              : isFocused
                ? 'border-lumi-primary dark:border-lumi-primary'
                : 'border-gray-300 dark:border-gray-600'
          }
        `}
        onFocus={(e) => {
          setIsFocused(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (onBlur) onBlur(e);
        }}
        {...props}
      />

      <label
        htmlFor={id}
        className={`absolute cursor-text px-1 pointer-events-none bg-gray-50 dark:bg-dark-background text-lumi-label
          ${
            shouldFloatLabel
              ? '-top-2 left-3 text-xs font-bold'
              : 'top-1/2 left-10 -translate-y-1/2 text-base'
          }

          ${
            error
              ? 'text-red-500'
              : 'text-lumi-label'
          }
        `}
      >
        {label}
      </label>

      {Icon && (
        <Icon
          className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5
            ${
              error
                ? 'text-red-500'
                : isFocused
                  ? 'text-lumi-primary dark:text-lumi-label'
                  : 'text-gray-400'
            }
          `}
        />
      )}
    </div>
  );
}
