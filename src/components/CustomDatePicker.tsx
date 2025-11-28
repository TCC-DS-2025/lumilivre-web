import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { createPortal } from 'react-dom';

import CalendarIcon from '../assets/icons/date.svg?react';
import ArrowLeftIcon from '../assets/icons/arrow-left.svg?react';
import ArrowRightIcon from '../assets/icons/arrow-right.svg?react';
import ArrowDropIcon from '../assets/icons/arrow-drop.svg?react';

interface CustomDatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string | null;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CustomDatePicker = forwardRef<
  HTMLInputElement,
  CustomDatePickerProps
>(({ label, error, className = '', value, onChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'days' | 'years'>('days');

  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [direction, setDirection] = useState<'down' | 'up'>('down');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  useEffect(() => {
    if (value) {
      const [year, month, day] = String(value).split('-');
      if (year && month && day) {
        setInputValue(`${day}/${month}/${year}`);
        setViewDate(new Date(Number(year), Number(month) - 1, Number(day)));
      }
    } else {
      setInputValue('');
    }
  }, [value]);

  // --- Lógica de Posicionamento do Portal ---
  const updatePosition = () => {
    if (containerRef.current && isOpen) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const calendarHeight = 320;
      const margin = 4;

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Decide se abre para cima ou para baixo
      let newDirection: 'down' | 'up' = 'down';
      let top = rect.bottom + margin;

      if (spaceBelow < calendarHeight && spaceAbove > calendarHeight) {
        newDirection = 'up';
        top = rect.top - margin;
        top = rect.top - calendarHeight - margin;
      }

      setDirection(newDirection);
      setCoords({
        top: newDirection === 'down' ? rect.bottom + margin : rect.top - margin,
        left: rect.left,
      });
    }
  };

  // Listeners para reposicionar ao rolar ou redimensionar
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

      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        calendarRef.current &&
        !calendarRef.current.contains(target)
      ) {
        setIsOpen(false);
        setViewMode('days');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Lógica de Data ---

  const daysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (month: number, year: number) =>
    new Date(year, month, 1).getDay();

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const isoDate = newDate.toISOString().split('T')[0];
    const displayDate = newDate.toLocaleDateString('pt-BR');

    setInputValue(displayDate);
    triggerChange(isoDate);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');

    if (val.length > 8) val = val.slice(0, 8);
    if (val.length >= 5) {
      val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
    } else if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }

    setInputValue(val);

    if (val.length === 10) {
      const [day, month, year] = val.split('/').map(Number);
      const dateObj = new Date(year, month - 1, day);

      if (
        dateObj.getFullYear() === year &&
        dateObj.getMonth() === month - 1 &&
        dateObj.getDate() === day
      ) {
        setViewDate(dateObj);
        const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        triggerChange(isoDate);
      }
    } else if (val === '') {
      triggerChange('');
    }
  };

  const triggerChange = (dateString: string) => {
    if (onChange && inputRef.current) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set;

      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(inputRef.current, dateString);
      }

      const event = new Event('change', { bubbles: true });
      inputRef.current.dispatchEvent(event);

      const syntheticEvent = {
        ...event,
        target: { ...inputRef.current, value: dateString, name: props.name },
        currentTarget: inputRef.current,
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
    }
  };

  const changeMonth = (offset: number) => {
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1),
    );
  };

  const changeYear = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setViewMode('days');
  };

  // --- Renderização do Calendário ---

  const renderDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysCount = daysInMonth(month, year);
    const startDay = getFirstDayOfMonth(month, year);

    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    for (let d = 1; d <= daysCount; d++) {
      const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = String(value) === currentDateStr;
      const isToday =
        new Date().toDateString() === new Date(year, month, d).toDateString();

      days.push(
        <button
          key={d}
          type="button"
          onClick={() => handleDateClick(d)}
          className={`
            w-8 h-8 text-sm rounded-full flex items-center justify-center
            ${
              isSelected
                ? 'bg-lumi-primary text-white font-bold'
                : isToday
                  ? 'text-lumi-primary font-bold border border-lumi-primary'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }
          `}
        >
          {d}
        </button>,
      );
    }
    return days;
  };

  const renderYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let y = currentYear - 100; y <= currentYear + 10; y++) {
      years.push(y);
    }

    return (
      <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-2">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => changeYear(y)}
            ref={
              y === viewDate.getFullYear()
                ? (el) => el?.scrollIntoView({ block: 'center' })
                : null
            }
            className={`
              py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 
              ${y === viewDate.getFullYear() ? 'bg-lumi-primary/10 text-lumi-primary font-bold' : 'text-gray-700 dark:text-gray-200'}
            `}
          >
            {y}
          </button>
        ))}
      </div>
    );
  };

  // --- Renderização do Portal ---
  const renderCalendarPortal = () => {
    const style: React.CSSProperties = {
      position: 'fixed',
      left: coords.left,
      zIndex: 9999,
    };

    if (direction === 'down') {
      style.top = coords.top;
    } else {
      style.top = coords.top;
    }

    return createPortal(
      <div
        ref={calendarRef}
        style={style}
        className={`
          w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-xl overflow-hidden ease-out
          ${direction === 'up' ? 'origin-bottom' : 'origin-top'}
          ${
            isOpen
              ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto'
              : `opacity-0 scale-y-0 pointer-events-none ${direction === 'up' ? 'translate-y-2' : '-translate-y-2'}`
          }
        `}
        onMouseDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          {viewMode === 'days' && (
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <ArrowLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'days' ? 'years' : 'days')}
            className="flex items-center gap-1 text-sm font-bold text-gray-800 dark:text-white hover:text-lumi-primary"
          >
            {viewMode === 'days'
              ? `${viewDate.toLocaleString('pt-BR', { month: 'long' })} ${viewDate.getFullYear()}`
              : 'Selecione o Ano'}
            <ArrowDropIcon
              className={`w-4 h-4 ${viewMode === 'years' ? 'rotate-180' : ''}`}
            />
          </button>

          {viewMode === 'days' && (
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <ArrowRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>

        {/* Corpo */}
        <div className="p-2">
          {viewMode === 'days' ? (
            <>
              <div className="grid grid-cols-7 mb-2 text-center">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                  <span key={i} className="text-xs font-semibold text-gray-400">
                    {day}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 justify-items-center">
                {renderDays()}
              </div>
            </>
          ) : (
            renderYears()
          )}
        </div>
      </div>,
      document.body,
    );
  };

  // --- Estilos ---

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1';

  const hasValue = inputValue.length > 0;
  const iconColorClass =
    isOpen || hasValue ? 'text-lumi-label' : 'text-gray-400';

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={props.id} className={labelStyles}>
          {label}
        </label>
      )}

      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          className={`
            w-full pl-3 pr-10 py-2 text-sm bg-white dark:bg-gray-800 border rounded-md outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
            ${
              error
                ? 'border-red-500 focus:border-red-500'
                : `border-gray-300 dark:border-gray-600 focus:border-lumi-primary dark:focus:border-lumi-primary ${isOpen ? 'border-lumi-primary ring-1 ring-lumi-primary' : ''}`
            }
          `}
          placeholder="dia/mês/ano"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
          maxLength={10}
          {...props}
        />

        <div
          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1"
          onClick={() => {
            inputRef.current?.focus();
            setIsOpen(!isOpen);
          }}
        >
          <CalendarIcon
            className={`w-4 h-4 transition-colors ${iconColorClass}`}
          />
        </div>
      </div>

      {renderCalendarPortal()}

      {error && <span className="text-xs text-red-500 mt-1 ml-1">{error}</span>}
    </div>
  );
});

CustomDatePicker.displayName = 'CustomDatePicker';
