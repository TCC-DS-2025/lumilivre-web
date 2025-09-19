import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import homeIconUrl from '../assets/icons/home.svg';
import homeActiveIconUrl from '../assets/icons/home-active.svg';
import bookIconUrl from '../assets/icons/books.svg';
import bookActiveIconUrl from '../assets/icons/books-active.svg';
import usersIconUrl from '../assets/icons/users.svg';
import usersActiveIconUrl from '../assets/icons/users-active.svg';
import loansIconUrl from '../assets/icons/loans.svg';
import loansActiveIconUrl from '../assets/icons/loans-active.svg';
import settingsIconUrl from '../assets/icons/settings.svg';
import settingsActiveIconUrl from '../assets/icons/settings-active.svg';
import logoutIconUrl from '../assets/icons/logout.svg';
import reportIconUrl from '../assets/icons/report.svg';
import reportActiveIconUrl from '../assets/icons/report-active.svg';
import rankingIconUrl from '../assets/icons/ranking.svg';
import rankingActiveIconUrl from '../assets/icons/ranking-active.svg';

const navLinks = [
  {
    path: '/dashboard',
    label: 'Início',
    icon: homeIconUrl,
    activeIcon: homeActiveIconUrl,
  },
  {
    path: '/emprestimos',
    label: 'Empréstimos',
    icon: loansIconUrl,
    activeIcon: loansActiveIconUrl,
  },
  {
    path: '/livros',
    label: 'Livros',
    icon: bookIconUrl,
    activeIcon: bookActiveIconUrl,
  },
  {
    path: '/alunos',
    label: 'Alunos',
    icon: usersIconUrl,
    activeIcon: usersActiveIconUrl,
  },
  {
    path: '/classificacao',
    label: 'Classificação',
    icon: rankingIconUrl,
    activeIcon: rankingActiveIconUrl,
  },
  {
    path: '/relatorios',
    label: 'Relatórios',
    icon: reportIconUrl,
    activeIcon: reportActiveIconUrl,
  },
];

interface SidebarProps {
  isExpanded: boolean;
  setExpanded: (isExpanded: boolean) => void;
}

export function Sidebar({ isExpanded, setExpanded }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-lumi-primary text-gray-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out shadow-md select-none z-20 ${isExpanded ? 'w-52' : 'w-24'}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto mt-4">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center p-3 justify-center rounded-lg transition-colors duration-200 hover:bg-white/20 ${isActive ? 'bg-white/20' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <img
                  src={isActive ? link.activeIcon : link.icon}
                  alt={link.label}
                  className="w-6 h-6 shrink-0 pointer-events-none"
                />
                <div
                  className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'w-40 ml-4' : 'w-0'}`}
                >
                  <span
                    className={`whitespace-nowrap ${isActive ? 'font-bold text-white' : 'text-gray-300'}`}
                  >
                    {link.label}
                  </span>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-white/10 space-y-2">
        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            `flex items-center p-3 justify-center rounded-lg transition-colors duration-200 hover:bg-white/20 ${isActive ? 'bg-white/20' : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <img
                src={isActive ? settingsActiveIconUrl : settingsIconUrl}
                alt="Configurações"
                className="w-6 h-6 shrink-0 pointer-events-none"
              />
              <div
                className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'w-40 ml-4' : 'w-0'}`}
              >
                <span
                  className={`whitespace-nowrap ${isActive ? 'font-bold text-white' : 'text-gray-300'}`}
                >
                  Configurações
                </span>
              </div>
            </>
          )}
        </NavLink>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center p-3 justify-center rounded-lg hover:bg-white/20 transition-colors duration-200`}
        >
          <img
            src={logoutIconUrl}
            alt="Sair"
            className="w-6 h-6 shrink-0 pointer-events-none"
          />
          <div
            className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'w-40 ml-4' : 'w-0'}`}
          >
            <span className="font-semibold whitespace-nowrap text-red-400">
              Sair
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}
