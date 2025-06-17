import Logo from '../assets/images/logo.png';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  isSidebarExpanded: boolean;
  setSidebarExpanded: (isExpanded: boolean) => void;
}

export function Header({ isSidebarExpanded, setSidebarExpanded }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-30 bg-white dark:bg-dark-header shadow-md">
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button 
            className="lg:hidden mr-4 p-2 rounded-md text-gray-600 dark:text-gray-300"
            onClick={() => setSidebarExpanded(!isSidebarExpanded)}
          >
            {/* Ícone de menu (pode ser um SVG real) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 12h16" /></svg>
          </button>
          <img src={Logo} alt="Lumi Livre Logo" className="h-12 w-12 mr-3" />
          <span className="hidden sm:block text-xl font-bold text-gray-800 dark:text-white">
            Lumi Livre
          </span>
        </div>
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}