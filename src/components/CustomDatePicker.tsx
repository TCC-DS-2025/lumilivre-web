import { type InputHTMLAttributes, forwardRef } from 'react';

import CalendarIcon from '../assets/icons/date.svg?react';

interface CustomDatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
}

export const CustomDatePicker = forwardRef<
  HTMLInputElement,
  CustomDatePickerProps
>(({ label, error, className = '', ...props }, ref) => {
  const inputStyles = `w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border-2 rounded-lg outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 min-h-[44px]
      ${
        error
          ? 'border-red-500 focus:border-red-500'
          : 'border-gray-300 dark:border-gray-600 focus:border-lumi-primary dark:focus:border-lumi-primary'
      }
      ${className}
    `;

  const labelStyles =
    'block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1';

  return (
    <div className="w-full">
      <label htmlFor={props.id} className={labelStyles}>
        {label}
      </label>

      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <CalendarIcon
            className={`w-5 h-5 ${
              error
                ? 'text-red-500'
                : 'text-gray-400 group-focus-within:text-lumi-primary dark:group-focus-within:text-lumi-label'
            }`}
          />
        </div>

        <input ref={ref} type="date" className={inputStyles} {...props} />
      </div>

      {error && <span className="text-xs text-red-500 mt-1 ml-1">{error}</span>}
    </div>
  );
});

CustomDatePicker.displayName = 'CustomDatePicker';
