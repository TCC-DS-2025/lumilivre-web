import {
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type SVGProps,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { ThemeContext } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Importando SVGs como componentes React
import DownloadIcon from '../../assets/icons/download.svg?react';
import LockIcon from '../../assets/icons/lock.svg?react';
import SunIcon from '../../assets/icons/sun.svg?react';
import MoonIcon from '../../assets/icons/moon.svg?react';
import AutoIcon from '../../assets/icons/auto.svg?react'; // Certifique-se de criar este arquivo
import BackIcon from '../../assets/icons/arrow-left.svg?react';
import LogoutIcon from '../../assets/icons/logout.svg?react';

// Interface para as props do Item de Configuração
interface SettingItemProps {
  Icon: React.FunctionComponent<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  children: ReactNode;
  iconClassName?: string; // Para ajustes finos de tamanho (ex: lua)
}

const SettingItem = ({
  Icon,
  title,
  description,
  children,
  iconClassName = 'w-6 h-6',
}: SettingItemProps) => (
  <div className="flex items-center justify-between p-4 border-b last:border-b-0 border-gray-200 dark:border-gray-700 transition-all duration-200">
    <div className="flex items-center">
      <Icon
        className={`${iconClassName} mr-4 text-lumi-primary dark:text-lumi-label transition-all duration-200 select-none`}
      />
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white transition-all duration-200">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
    <div>{children}</div>
  </div>
);

const SubPageHeader = ({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) => (
  <div className="flex items-center mb-4 select-none">
    <button
      onClick={onBack}
      className="p-2 mr-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 group"
    >
      <BackIcon className="w-5 h-5 text-lumi-primary dark:text-lumi-label" />
    </button>
    <h2 className="text-lg font-bold text-lumi-primary dark:text-lumi-label select-none">
      {title}
    </h2>
  </div>
);

export function ConfiguracoesPage() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';

  const [currentView, setCurrentView] = useState<'main' | 'import'>('main');

  const [effectiveTheme, setEffectiveTheme] = useState(theme);

  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) =>
        setEffectiveTheme(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setEffectiveTheme(theme);
    }
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderImportView = () => (
    <div className="p-6">
      <SubPageHeader
        title="Importar Dados"
        onBack={() => setCurrentView('main')}
      />
      <div className="rounded-lg border border-gray-200 dark:border-gray-700">
        <SettingItem
          Icon={DownloadIcon}
          title="Importar Alunos"
          description="Adicione um arquivo CSV ou XLSX com a relação de alunos"
        >
          <button className="font-semibold dark:text-white py-2 px-4 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 select-none">
            Selecionar
          </button>
        </SettingItem>
        <SettingItem
          Icon={DownloadIcon}
          title="Importar Livros"
          description="Adicione um arquivo CSV ou XLSX com a relação de livros"
        >
          <button className="font-semibold dark:text-white py-2 px-4 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 select-none">
            Selecionar
          </button>
        </SettingItem>
        <SettingItem
          Icon={DownloadIcon}
          title="Importar Exemplares"
          description="Adicione um arquivo CSV ou XLSX com a relação de exemplares dos livros"
        >
          <button className="font-semibold dark:text-white py-2 px-4 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 select-none">
            Selecionar
          </button>
        </SettingItem>
      </div>
    </div>
  );

  const renderMainView = () => (
    <>
      {/* Seção visível apenas para ADMIN */}
      {isAdmin && (
        <div className="p-6">
          <h2 className="text-lg font-bold text-lumi-primary dark:text-lumi-label mb-4 select-none">
            Gerenciamento de Dados
          </h2>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
            <SettingItem
              Icon={DownloadIcon}
              title="Importar Dados"
              description="Importe dados de alunos ou livros a partir de um arquivo."
            >
              <button
                onClick={() => setCurrentView('import')}
                className="font-semibold dark:text-white py-2 px-4 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 select-none"
              >
                Mais Opções
              </button>
            </SettingItem>
          </div>
        </div>
      )}

      <div
        className={`p-6 ${isAdmin ? 'border-t' : ''} border-gray-200 dark:border-gray-700 transition-all duration-200`}
      >
        <h2 className="text-lg font-bold text-lumi-primary dark:text-lumi-label mb-4 select-none">
          Aparência
        </h2>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
          <SettingItem
            Icon={
              theme === 'system'
                ? AutoIcon
                : effectiveTheme === 'light'
                  ? SunIcon
                  : MoonIcon
            }
            iconClassName={
              effectiveTheme === 'dark' && theme !== 'system'
                ? 'w-6 h-5'
                : 'w-6 h-6'
            }
            title="Tema"
            description="Escolha entre o tema claro, escuro ou o padrão seu sistema."
          >
            <div className="flex items-center space-x-2 p-1 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700 transition-all duration-200 select-none">
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-md transition-all duration-200 ${theme === 'light' ? 'bg-white shadow text-lumi-primary' : 'hover:bg-gray-600 text-gray-500 dark:text-gray-400'}`}
                title="Claro"
              >
                Claro
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-md transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800 shadow text-lumi-label' : 'hover:bg-gray-600 text-gray-500 dark:text-gray-400'}`}
                title="Escuro"
              >
                Escuro
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-2 rounded-md transition-all duration-200 ${theme === 'system' ? 'bg-lumi-primary shadow text-white' : 'hover:bg-gray-600 text-gray-500 dark:text-gray-400'}`}
                title="Automático"
              >
                Automático
              </button>
            </div>
          </SettingItem>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-gray-700 transition-all duration-200">
        <h2 className="text-lg font-bold text-lumi-primary dark:text-lumi-label mb-4 select-none">
          Conta
        </h2>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
          <SettingItem
            Icon={LockIcon}
            title="Mudar Senha"
            description="Altere sua senha de acesso ao sistema."
          >
            <button
              onClick={() => navigate('/mudar-senha')}
              className="font-semibold dark:text-white py-2 px-4 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 select-none"
            >
              Alterar
            </button>
          </SettingItem>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 shrink-0 select-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white transition-all duration-200">
            {isAdmin ? 'Olá, Administrador!' : 'Olá, Bibliotecário!'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 transition-all duration-200">
            Gerencie suas preferências do sistema.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 py-2 pl-4 pr-2 rounded-lg shadow-md bg-red-600 text-white hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
        >
          <span className="font-bold">Sair da Conta</span>
          {/* LogoutIcon permanece branco (text-white herdado do botão) */}
          <LogoutIcon className="w-6 h-6 text-white" />
        </button>
      </div>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow overflow-y-auto transition-all duration-200">
        {currentView === 'main' && renderMainView()}
        {currentView === 'import' && renderImportView()}
      </div>
    </div>
  );
}
