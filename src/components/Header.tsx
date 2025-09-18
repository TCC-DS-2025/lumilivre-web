import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/images/logo.png';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  isSidebarExpanded: boolean;
  setSidebarExpanded: (isExpanded: boolean) => void;
}

export function Header({ isSidebarExpanded, setSidebarExpanded }: HeaderProps) {
  // 2. Pegamos a localização atual da página
  const location = useLocation();
  const isHomePage = location.pathname === '/dashboard' || location.pathname === '/';

  // 3. Criamos o conteúdo da logo como um fragmento de JSX para evitar repetição
  const logoContent = (
    <div className="flex items-center">
      <img src={Logo} alt="LumiLivre Logo" className="h-12 w-12 mr-3 pointer-events-none" />
      <span className="hidden sm:block text-xl font-bold text-gray-800 dark:text-white">
          LumiLivre
      </span>
    </div>
  );

  return (
    <header className="sticky top-0 left-0 w-full z-30 bg-white dark:bg-dark-header shadow-md transition-colors duration-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 select-none">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-4 p-2 rounded-md text-gray-600 dark:text-gray-300"
            onClick={() => setSidebarExpanded(!isSidebarExpanded)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 12h16" /></svg>
          </button>
          
          {/* se estiver não na tela de início fica clicável */}
          {isHomePage ? (
            <div className="flex items-center cursor-default">
              {logoContent}
            </div>
          ) : (
            <Link 
              to="/dashboard" 
              className="flex items-center rounded-lg p-2 -ml-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              {logoContent}
            </Link>
          )}

        </div>
        <div className="flex items-center pr-1.5">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}