import { NavLink } from 'react-router-dom';

import HomeIcon from '../assets/icons/home.svg?react';
import HomeActiveIcon from '../assets/icons/home-active.svg?react';
import BookIcon from '../assets/icons/books.svg?react';
import BookActiveIcon from '../assets/icons/books-active.svg?react';
import UsersIcon from '../assets/icons/users.svg?react';
import UsersActiveIcon from '../assets/icons/users-active.svg?react';
import LoansIcon from '../assets/icons/loans.svg?react';
import LoansActiveIcon from '../assets/icons/loans-active.svg?react';
import SettingsIcon from '../assets/icons/settings.svg?react';
import SettingsActiveIcon from '../assets/icons/settings-active.svg?react';
import ReportIcon from '../assets/icons/report.svg?react';
import ReportActiveIcon from '../assets/icons/report-active.svg?react';
import RankingIcon from '../assets/icons/ranking.svg?react';
import RankingActiveIcon from '../assets/icons/ranking-active.svg?react';
import PinIcon from '../assets/icons/pin.svg?react';
import PinActiveIcon from '../assets/icons/pin-active.svg?react';

const navLinks = [
  {
    path: '/dashboard',
    label: 'Início',
    Icon: HomeIcon,
    ActiveIcon: HomeActiveIcon,
  },
  {
    path: '/emprestimos',
    label: 'Empréstimos',
    Icon: LoansIcon,
    ActiveIcon: LoansActiveIcon,
  },
  {
    path: '/livros',
    label: 'Livros',
    Icon: BookIcon,
    ActiveIcon: BookActiveIcon,
  },
  {
    path: '/alunos',
    label: 'Alunos',
    Icon: UsersIcon,
    ActiveIcon: UsersActiveIcon,
  },
  {
    path: '/classificacao',
    label: 'Classificação',
    Icon: RankingIcon,
    ActiveIcon: RankingActiveIcon,
  },
  {
    path: '/relatorios',
    label: 'Relatórios',
    Icon: ReportIcon,
    ActiveIcon: ReportActiveIcon,
  },
];

interface SidebarProps {
  isExpanded: boolean;
  setExpanded: (isExpanded: boolean) => void;
  isPinned: boolean;
  setPinned: (isPinned: boolean) => void;
}

export function Sidebar({
  isExpanded,
  setExpanded,
  isPinned,
  setPinned,
}: SidebarProps) {
  const handleMouseEnter = () => {
    if (!isPinned) {
      setExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setExpanded(false);
    }
  };

  const handlePinToggle = () => {
    const newPinState = !isPinned;
    setPinned(newPinState);
    setExpanded(newPinState);
  };

  const PinComponent = isPinned ? PinActiveIcon : PinIcon;

  return (
    <aside
      className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] bg-lumi-primary text-gray-200 flex flex-col shrink-0 duration-300 shadow-[8px_0_15px_rgba(0,0,0,0.2)] select-none z-40 ${
        isExpanded ? 'w-48' : 'w-20'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative top-1 flex items-center justify-end">
        <button
          onClick={handlePinToggle}
          className={`hover:opacity-75 p-2 ${
            isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          title={isPinned ? 'Desafixar menu' : 'Fixar menu'}
        >
          <PinComponent className="w-6 h-6 text-white" />
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center p-3 justify-center rounded-lg hover:bg-white/20 ${
                isActive ? 'bg-white/20' : ''
              }`
            }
          >
            {({ isActive }) => {
              const IconComponent = isActive ? link.ActiveIcon : link.Icon;

              return (
                <>
                  <IconComponent
                    className={`w-6 h-6 shrink-0 pointer-events-none ${
                      isActive ? 'text-white' : 'text-gray-300'
                    }`}
                  />
                  <div
                    className={`overflow-hidden duration-300 ${
                      isExpanded ? 'w-40 ml-4' : 'w-0'
                    }`}
                  >
                    <span
                      className={`whitespace-nowrap ${
                        isActive ? 'font-bold text-white' : 'text-gray-300'
                      }`}
                    >
                      {link.label}
                    </span>
                  </div>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-white/10 space-y-2">
        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            `flex items-center p-3 justify-center rounded-lg hover:bg-white/20 ${
              isActive ? 'bg-white/20' : ''
            }`
          }
        >
          {({ isActive }) => {
            const SettingsComponent = isActive
              ? SettingsActiveIcon
              : SettingsIcon;

            return (
              <>
                <SettingsComponent
                  className={`w-6 h-6 shrink-0 pointer-events-none ${
                    isActive ? 'text-white' : 'text-gray-300'
                  }`}
                />
                <div
                  className={`overflow-hidden duration-300 ${
                    isExpanded ? 'w-40 ml-4' : 'w-0'
                  }`}
                >
                  <span
                    className={`whitespace-nowrap ${
                      isActive ? 'font-bold text-white' : 'text-gray-300'
                    }`}
                  >
                    Configurações
                  </span>
                </div>
              </>
            );
          }}
        </NavLink>
      </div>
    </aside>
  );
}
