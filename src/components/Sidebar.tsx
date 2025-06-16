import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import HomeIcon from '../assets/icons/home.svg';
import HomeActiveIcon from '../assets/icons/home-active.svg';
import BookIcon from '../assets/icons/books.svg';
import BookActiveIcon from '../assets/icons/books-active.svg';
import UsersIcon from '../assets/icons/users.svg';
import UsersActiveIcon from '../assets/icons/users-active.svg';
import CoursesIcon from '../assets/icons/courses.svg';
import CoursesActiveIcon from '../assets/icons/courses-active.svg';
import LoansIcon from '../assets/icons/loans.svg';
import LoansActiveIcon from '../assets/icons/loans-active.svg';
import CddIcon from '../assets/icons/cdd.svg';
import CddActiveIcon from '../assets/icons/cdd-active.svg';
import GenresIcon from '../assets/icons/genres.svg';
import GenresActiveIcon from '../assets/icons/genres-active.svg';
import AuthorsIcon from '../assets/icons/authors.svg';
import AuthorsActiveIcon from '../assets/icons/authors-active.svg';
import SettingsIcon from '../assets/icons/settings.svg';
import SettingsActiveIcon from '../assets/icons/settings-active.svg';
import LogoutIcon from '../assets/icons/logout.svg';

const navLinks = [
  { path: '/dashboard', label: 'Início', icon: HomeIcon, activeIcon: HomeActiveIcon },
  { path: '/livros', label: 'Livros', icon: BookIcon, activeIcon: BookActiveIcon },
  { path: '/alunos', label: 'Alunos', icon: UsersIcon, activeIcon: UsersActiveIcon },
  { path: '/cursos', label: 'Cursos', icon: CoursesIcon, activeIcon: CoursesActiveIcon },
  { path: '/emprestimos', label: 'Empréstimos', icon: LoansIcon, activeIcon: LoansActiveIcon },
  { path: '/cdd', label: 'CDD', icon: CddIcon, activeIcon: CddActiveIcon },
  { path: '/generos', label: 'Gêneros', icon: GenresIcon, activeIcon: GenresActiveIcon },
  { path: '/autores', label: 'Autores', icon: AuthorsIcon, activeIcon: AuthorsActiveIcon },
];

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`bg-lumi-primary text-gray-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="h-20 flex items-center p-4 border-b border-white/10">
        <div className={`transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-2xl font-bold text-white whitespace-nowrap">Lumi Livre</h1>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-white/20 ${isExpanded ? '' : 'justify-center'} ${isActive ? 'bg-white/20' : ''}`}
          >
            {({ isActive }) => (
              <>
                {isActive ? <link.activeIcon className="w-6 h-6 shrink-0" /> : <link.icon className="w-6 h-6 shrink-0" />}
                {isExpanded && (
                  <span className={`ml-4 text-sm whitespace-nowrap ${isActive ? 'font-bold text-white' : 'text-gray-300'}`}>
                    {link.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-white/10 space-y-2">
        <NavLink
          to="/configuracoes"
          className={({ isActive }) => `flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-white/20 ${isExpanded ? '' : 'justify-center'} ${isActive ? 'bg-white/20' : ''}`}
        >
          {({ isActive }) => (
            <>
              {isActive ? <SettingsActiveIcon className="w-6 h-6 shrink-0" /> : <SettingsIcon className="w-6 h-6 shrink-0" />}
              {isExpanded && (
                <span className={`ml-4 text-sm whitespace-nowrap ${isActive ? 'font-bold text-white' : 'text-gray-300'}`}>
                  Configurações
                </span>
              )}
            </>
          )}
        </NavLink>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center p-3 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors duration-200 ${isExpanded ? '' : 'justify-center'}`}
        >
          <LogoutIcon className="w-6 h-6 shrink-0 fill-current" />
          {isExpanded && <span className="ml-4 text-sm font-semibold whitespace-nowrap">Sair</span>}
        </button>
      </div>
    </aside>
  );
}