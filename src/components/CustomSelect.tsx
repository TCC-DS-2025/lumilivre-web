import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';

import ArrowIcon from '../assets/icons/arrow-drop.svg?react';

interface Option {
  label: string;
  value: string | number;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  direction?: 'up' | 'down';
  buttonClassName?: string;
  invertArrow?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  className = '',
  icon,
  direction = 'down',
  buttonClassName = 'px-3 py-2',
  invertArrow = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [listMaxHeight, setListMaxHeight] = useState<number>(240);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const margin = 16;
      const defaultMaxHeight = 240;

      let availableSpace = 0;

      if (direction === 'down') {
        availableSpace = viewportHeight - rect.bottom - margin;
      } else {
        availableSpace = rect.top - margin;
      }

      setListMaxHeight(
        Math.max(100, Math.min(availableSpace, defaultMaxHeight)),
      );
    }
  }, [isOpen, direction]);

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value),
  );

  const hasValue = value !== '' && value !== null && value !== undefined;

  const rotationClass = invertArrow
    ? isOpen
      ? 'rotate-0'
      : 'rotate-180'
    : isOpen
      ? 'rotate-180'
      : 'rotate-0';

  const arrowColorClass =
    isOpen || hasValue
      ? 'text-lumi-label opacity-100'
      : 'text-gray-500 dark:text-gray-400 opacity-70';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-lumi-primary
          ${buttonClassName}
          ${
            isOpen
              ? 'bg-gray-100 dark:bg-gray-700'
              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
          }
        `}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && (
            <span className="text-gray-500 dark:text-gray-400">{icon}</span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <span
          className={`text-[10px] ml-2 ${rotationClass} ${arrowColorClass}`}
        >
          <ArrowIcon className="w-4 h-4 fill-current" />
        </span>
      </button>

      <div
        style={{ maxHeight: `${listMaxHeight}px` }}
        className={`
          absolute left-0 w-full overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 ease-out
          ${
            direction === 'up'
              ? 'bottom-full mb-1 origin-bottom'
              : 'top-full mt-1 origin-top'
          }

          ${
            isOpen
              ? 'opacity-100 scale-y-100 translate-y-0'
              : `opacity-0 scale-y-0 pointer-events-none ${
                  direction === 'up' ? 'translate-y-2' : '-translate-y-2'
                }`
          }
        `}
      >
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => {
              onChange(String(option.value));
              setIsOpen(false);
            }}
            className={`
              w-full text-left px-3 py-2 text-sm duration-150 truncate
              ${
                String(value) === String(option.value)
                  ? 'bg-lumi-primary/10 text-lumi-primary font-bold'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
