import { useState, useEffect, useRef } from 'react';

import CloseIcon from '../assets/icons/close-sm.svg?react';
import SuccessIcon from '../assets/icons/success.svg?react';
import ErrorIcon from '../assets/icons/error.svg?react';
import WarningIcon from '../assets/icons/warn.svg?react';
import InfoIcon from '../assets/icons/info.svg?react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onRemove: (id: string) => void;
}

export function Toast({ message, onRemove }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const duration = message.duration || 4000;
  const timeRemaining = useRef(duration);
  const timerId = useRef<number | null>(null);

  const types = {
    success: {
      container: 'bg-green-600 dark:bg-green-700',
      bar: 'bg-green-300',
      icon: SuccessIcon,
    },
    error: {
      container: 'bg-red-600 dark:bg-red-700',
      bar: 'bg-red-300',
      icon: ErrorIcon,
    },
    warning: {
      container: 'bg-yellow-500 dark:bg-yellow-600',
      bar: 'bg-yellow-200',
      icon: WarningIcon,
    },
    info: {
      container: 'bg-blue-600 dark:bg-blue-700',
      bar: 'bg-blue-300',
      icon: InfoIcon,
    },
  };

  const { icon: Icon, container, bar } = types[message.type];

  useEffect(() => {
    if (isPaused) return;

    const start = Date.now();
    const initialRemaining = timeRemaining.current;

    timerId.current = setTimeout(() => {
      onRemove(message.id);
    }, initialRemaining);

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const newRemaining = initialRemaining - elapsed;
      const percentage = (newRemaining / duration) * 100;

      setProgress(Math.max(0, percentage));
      timeRemaining.current = newRemaining;
    }, 50);

    return () => {
      if (timerId.current) clearTimeout(timerId.current);
      clearInterval(interval);
    };
  }, [isPaused, duration, message.id, onRemove]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div
      className={`
        relative w-full max-w-sm shadow-lg rounded-lg pointer-events-auto flex overflow-hidden mb-3 animate-slide-in-right text-white
        ${container}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Conteúdo Principal */}
      <div className="flex-1 p-4 flex items-center">
        <div className="shrink-0 pt-0.5">
          <div className="text-white">
            <Icon className="w-8 h-8 fill-current text-white" />
          </div>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-bold text-white">{message.title}</p>
          {message.description && (
            <p className="mt-1 text-sm text-white/90">{message.description}</p>
          )}
        </div>
      </div>

      {/* Botão de Fechar */}
      <div className="flex pr-2">
        <button
          onClick={() => onRemove(message.id)}
          className="w-full rounded-lg p-2 flex items-start justify-center text-white/70 hover:text-white focus:outline-none mt-2"
        >
          <CloseIcon className="w-5 h-5 fill-current dark:text-white" />
        </button>
      </div>

      {/* Barra de Progresso */}
      <div className="absolute bottom-0 left-0 h-1.5 w-full bg-black/10">
        <div
          className={`h-full ${bar} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
