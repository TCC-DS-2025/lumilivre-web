import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

// 1. Importando o SVG como componente (vite-plugin-svgr)
import LogoIcon from '../assets/icons/logo.svg?react';

interface HeaderProps {
  isSidebarExpanded: boolean;
  setSidebarExpanded: (isExpanded: boolean) => void;
  isSidebarPinned: boolean;
}

export function Header({
  isSidebarExpanded,
  setSidebarExpanded,
  isSidebarPinned,
}: HeaderProps) {
  const location = useLocation();
  const isHomePage = ['/dashboard', '/'].includes(location.pathname);

  // Lógica de espaçamento mantida, mas simplificada na leitura
  const headerSpacingClass = isSidebarPinned
    ? isSidebarExpanded
      ? 'pl-52'
      : 'pl-28'
    : 'pl-28';

  const LogoContent = (
    <div className="flex items-center gap-3">
      <LogoIcon className="h-10 w-10 shrink-0" />
      <span className="hidden sm:block text-xl font-bold text-gray-800 dark:text-white transition-all duration-200">
        LumiLivre
      </span>
    </div>
  );

  return (
    <header className="sticky top-0 left-0 w-full z-30 bg-white dark:bg-dark-header shadow-md transition-all duration-200">
      <div
        className={`flex items-center justify-between h-14 px-4 sm:px-6 select-none transition-all duration-300 ease-in-out ${headerSpacingClass}`}
      >
        <div className="flex items-center">
          <button
            type="button"
            aria-label="Abrir menu lateral"
            className="md:hidden mr-4 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            onClick={() => setSidebarExpanded(!isSidebarExpanded)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 12h16"
              />
            </svg>
          </button>

          {isHomePage ? (
            <div className="flex items-center cursor-default p-1.5 -ml-2">
              {LogoContent}
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="flex items-center rounded-lg p-1.5 -ml-2 group transition-all"
            >
              <div className="transition-opacity duration-200 group-hover:opacity-75">
                {LogoContent}
              </div>
            </Link>
          )}
        </div>

        <div className="flex items-center -mr-1">
          <div className="transform scale-90">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
