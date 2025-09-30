import { useEffect, type ReactNode } from 'react';

import closeIcon from '../assets/icons/close.svg';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div // fundo com blur
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm select-none"
    >
      <div
        className={`bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-2xl m-4 transition-all duration-200`}
        onClick={(e) => e.stopPropagation()} // Impede que o clique fora do modal o feche
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="ml-2 text-xl font-bold text-gray-800 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="transition-all duration-200 transform hover:scale-110 hover:opacity-75"
          >
            <img
              src={closeIcon}
              className="w-8 h-8"
              alt="Ícone 'X' de fechar"
            />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
