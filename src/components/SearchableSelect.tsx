import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useLayoutEffect,
} from 'react';

import ArrowIcon from '../assets/icons/arrow-drop.svg?react';
import SearchIcon from '../assets/icons/search.svg?react';
import CloseIcon from '../assets/icons/close.svg?react';

interface Option {
  label: string;
  value: string | number;
}

interface SearchableSelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  label,
  className = '',
  disabled = false,
  isLoading = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [listMaxHeight, setListMaxHeight] = useState<number>(240);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const margin = 16;
      const defaultMaxHeight = 240;

      const availableSpace = viewportHeight - rect.bottom - margin;

      setListMaxHeight(
        Math.max(150, Math.min(availableSpace, defaultMaxHeight)),
      );
    }
  }, [isOpen]);

  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value) === String(value));
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [options, searchTerm]);

  const handleSelect = (optionValue: string | number) => {
    onChange(String(optionValue));
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const hasValue = value !== '' && value !== null && value !== undefined;

  const arrowColorClass =
    isOpen || (hasValue && !disabled) ? 'text-lumi-label' : 'text-gray-400';

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className={labelStyles}>{label}</label>}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md
          ${
            disabled
              ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-400 border-gray-200 dark:border-gray-600'
              : 'bg-white dark:bg-gray-800 cursor-pointer border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary'
          }
          ${isOpen ? 'ring-2 ring-lumi-primary border-lumi-primary' : ''}
        `}
      >
        <div className="flex items-center gap-2 truncate">
          <span
            className={`truncate ${
              !selectedOption
                ? 'text-gray-500 dark:text-gray-400'
                : 'text-gray-700 dark:text-gray-200'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 ml-2">
          {value && !disabled && (
            <div
              role="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 flex items-center justify-center"
              title="Limpar seleção"
            >
              <CloseIcon className="w-4 h-4" />
            </div>
          )}

          <span className={`text-[10px] flex items-center ${arrowColorClass}`}>
            <ArrowIcon
              className={`w-4 h-4 fill-current ${isOpen ? 'rotate-180' : ''}`}
            />
          </span>
        </div>
      </button>

      <div
        style={{ maxHeight: `${listMaxHeight}px` }}
        className={`
          absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-xl flex flex-col overflow-hidden origin-top
          ${
            isOpen
              ? 'opacity-100 scale-y-100 translate-y-0'
              : 'opacity-0 scale-y-0 -translate-y-2 pointer-events-none'
          }
        `}
      >
        <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 shrink-0">
          <div className="relative">
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-lumi-primary text-gray-800 dark:text-gray-100 placeholder-gray-400"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              tabIndex={isOpen ? 0 : -1}
            />
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto custom-scrollbar py-1">
          {isLoading ? (
            <li className="px-4 py-3 text-sm text-gray-500 text-center">
              Carregando...
            </li>
          ) : filteredOptions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center italic">
              Nenhum resultado encontrado.
            </li>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = String(value) === String(option.value);
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    tabIndex={isOpen ? 0 : -1}
                    className={`
                      w-full text-left px-4 py-2 text-sm
                      ${
                        isSelected
                          ? 'bg-lumi-primary/10 text-lumi-primary font-bold'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
