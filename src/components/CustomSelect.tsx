import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

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
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  className = '',
  icon,
  buttonClassName = 'px-3 py-2',
  invertArrow = false,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const [menuPlacement, setMenuPlacement] = useState<'up' | 'down'>('down');

  const [coords, setCoords] = useState({
    left: 0,
    width: 0,
    top: 0,
    bottom: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // --- Posicionamento Inteligente ---
  const updatePosition = () => {
    if (containerRef.current && isOpen) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const maxHeight = 240;
      const margin = 4;

      const spaceBelow = viewportHeight - rect.bottom;

      const newPlacement = spaceBelow < maxHeight + margin ? 'up' : 'down';

      setMenuPlacement(newPlacement);

      setCoords({
        left: rect.left,
        width: rect.width,
        top: rect.bottom + margin,
        bottom: viewportHeight - rect.top + margin,
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // --- Fechar ao clicar fora ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const dropdownElement = document.getElementById(
        `dropdown-portal-custom-${placeholder}`,
      );

      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownElement &&
        !dropdownElement.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, placeholder]);

  // --- Resetar highlight ao abrir ---
  useEffect(() => {
    if (isOpen) {
      const index = options.findIndex(
        (opt) => String(opt.value) === String(value),
      );
      setHighlightedIndex(index >= 0 ? index : 0);
    }
  }, [isOpen, value, options]);

  // --- Navegação por Teclado ---
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : prev,
        );
        scrollIntoView(highlightedIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        scrollIntoView(highlightedIndex - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (options[highlightedIndex]) {
          handleSelect(options[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  const scrollIntoView = (index: number) => {
    if (listRef.current) {
      const element = listRef.current.children[index] as HTMLElement;
      if (element) {
        element.scrollIntoView({ block: 'nearest' });
      }
    }
  };

  const handleSelect = (val: string | number) => {
    onChange(String(val));
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value),
  );

  const hasValue = value !== '' && value !== null && value !== undefined;

  // Lógica da seta (ícone)
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

  // --- Renderização do Dropdown (Portal) ---
  const renderDropdown = () => {
    const style: React.CSSProperties = {
      position: 'fixed',
      left: coords.left,
      width: coords.width,
      maxHeight: '240px',
      zIndex: 9999,
    };

    if (menuPlacement === 'down') {
      style.top = coords.top;
    } else {
      style.bottom = coords.bottom;
    }

    const animationClasses = isOpen
      ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto'
      : menuPlacement === 'down'
        ? 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
        : 'opacity-0 scale-y-95 translate-y-2 pointer-events-none';

    const originClass =
      menuPlacement === 'down' ? 'origin-top' : 'origin-bottom';

    return createPortal(
      <div
        id={`dropdown-portal-custom-${placeholder}`}
        style={style}
        className={`
          overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg ease-out
          ${originClass}
          ${animationClasses}
        `}
        onMouseDown={(e) => e.preventDefault()}
        ref={listRef}
      >
        {options.map((option, index) => {
          const isSelected = String(value) === String(option.value);
          const isHighlighted = index === highlightedIndex;

          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => handleSelect(option.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                w-full text-left px-3 py-2 text-sm truncate block
                ${
                  isSelected
                    ? 'bg-lumi-primary/10 text-lumi-primary font-bold'
                    : 'text-gray-700 dark:text-gray-200'
                }
                ${
                  isHighlighted && !isSelected
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : ''
                }
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>,
      document.body,
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md
          ${buttonClassName}
          ${
            disabled
              ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed border-gray-200 dark:border-gray-600 text-gray-400'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-lumi-primary'
          }
          ${isOpen ? 'ring-2 ring-lumi-primary border-lumi-primary' : ''}
        `}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && (
            <span className="text-gray-500 dark:text-gray-400">{icon}</span>
          )}
          <span className="truncate text-gray-700 dark:text-white">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <span
          className={`text-[10px] ml-2 ${rotationClass} ${arrowColorClass}`}
        >
          <ArrowIcon className="w-4 h-4 fill-current" />
        </span>
      </button>

      {renderDropdown()}
    </div>
  );
}
