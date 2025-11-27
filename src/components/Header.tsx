import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

import LogoIcon from '../assets/icons/logo.svg?react';
import MenuIcon from '../assets/icons/menu.svg?react';

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

  const getHeaderSpacingClass = () => {
    if (!isSidebarPinned) return 'pl-28';
    return isSidebarExpanded ? 'pl-52' : 'pl-28';
  };

  const LogoContent = (
    <div className="flex items-center gap-3">
      <LogoIcon className="h-10 w-10 shrink-0 text-lumi-primary" />
      <span className="hidden sm:block text-xl font-bold text-gray-800 dark:text-white">
        LumiLivre
      </span>
    </div>
  );

  return (
    <header className="sticky top-0 left-0 w-full z-30 bg-white dark:bg-dark-header shadow-md">
      <div
        className={`
          flex items-center justify-between h-14 px-4 sm:px-6 select-none
          ${getHeaderSpacingClass()}
        `}
      >
        <div className="flex items-center">
          <button
            type="button"
            aria-label="Alternar menu lateral"
            className="md:hidden mr-4 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setSidebarExpanded(!isSidebarExpanded)}
          >
            <MenuIcon className="h-6 w-6 fill-current" />
          </button>

          {isHomePage ? (
            <div className="flex items-center cursor-default p-1.5 -ml-2">
              {LogoContent}
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="flex items-center rounded-lg p-1.5 -ml-2 group"
            >
              <div className="group-hover:opacity-75">{LogoContent}</div>
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
