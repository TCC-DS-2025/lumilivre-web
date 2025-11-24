import { useEffect, useState, type ReactNode } from 'react';

import CloseIcon from '../assets/icons/close.svg?react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsAnimatingOut(false);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimatingOut(true);
      document.body.style.overflow = 'auto';

      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center select-none
        ${isAnimatingOut ? 'animate-fade-out' : 'animate-fade-in'}
      `}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`
          relative bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-3xl m-4 
          ${isAnimatingOut ? 'animate-shrink-out' : 'animate-grow-in'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="ml-2 text-xl font-bold text-gray-800 dark:text-white">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-md"
            aria-label="Fechar modal"
          >
            <CloseIcon className="w-8 h-8 text-lumi-primary dark:text-lumi-label  hover:text-opacity-75" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
