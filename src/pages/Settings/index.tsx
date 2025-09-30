import { useContext, useEffect, useState, type ReactNode } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

import uploadIconUrl from '../../assets/icons/upload.svg';
import downloadIconUrl from '../../assets/icons/download.svg';
import lockIconUrl from '../../assets/icons/lock.svg';
import sunIconUrl from '../../assets/icons/sun.svg';
import moonIconUrl from '../../assets/icons/moon.svg';
import backIconUrl from '../../assets/icons/arrow-left.svg';

const SettingItem = ({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <div className="flex items-center justify-between p-4 border-b last:border-b-0 border-gray-200 dark:border-gray-700 transition-all duration-200">
    <div className="flex items-center">
      <img
        src={icon}
        alt={title}
        className="w-6 h-6 mr-4 text-lumi-primary transition-all duration-200 select-none"
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
      className="p-2 mr-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
    >
      <img src={backIconUrl} alt="Voltar" className="w-5 h-5" />
    </button>
    <h2 className="text-lg font-bold text-lumi-primary dark:text-lumi-label select-none">
      {title}
    </h2>
  </div>
);

export function ConfiguracoesPage() {
  const { theme, setTheme } = useContext(ThemeContext);

  const [currentView, setCurrentView] = useState<
    'main' | 'import' | 'export' | 'password'
  >('main');

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

  const renderImportView = () => (
    <div className="p-6">
      <SubPageHeader
        title="Importar Dados"
        onBack={() => setCurrentView('main')}
      />
      <div className="rounded-lg border border-gray-200 dark:border-gray-700">
        <SettingItem
          icon={downloadIconUrl}
          title="Importar Alunos"
          description="Envie um arquivo CSV com a lista de novos alunos."
        >
          <button className="font-semibold dark:text-white py-2 px-4 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 select-none">
            Selecionar Arquivo
          </button>
        </SettingItem>
        <SettingItem
          icon={downloadIconUrl}
          title="Importar Livros"
          description="Envie um arquivo CSV com a lista de novos livros."
        >
          <button className="font-semibold dark:text-white py-2 px-4 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 select-none">
            Selecionar Arquivo
          </button>
        </SettingItem>
      </div>
    </div>
  );

  const renderExportView = () => (
    <div className="p-6">
      <SubPageHeader
        title="Exportar Dados"
        onBack={() => setCurrentView('main')}
      />
      <div className="rounded-lg border border-gray-200 dark:border-gray-700">
        <SettingItem
          icon={uploadIconUrl}
          title="Exportar Empréstimos"
          description="Gere um arquivo com todos os empréstimos cadastrados."
        >
          <button className="font-semibold dark:text-white py-2 px-4 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 select-none">
            Baixar Arquivo
          </button>
        </SettingItem>
        <SettingItem
          icon={uploadIconUrl}
          title="Exportar Alunos"
          description="Gere um arquivo com todos os alunos cadastrados."
        >
          <button className="font-semibold dark:text-white py-2 px-4 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 select-none">
            Baixar Arquivo
          </button>
        </SettingItem>
      </div>
    </div>
  );

  const renderPasswordView = () => (
    <div className="p-6">
      <SubPageHeader
        title="Mudar Senha"
        onBack={() => setCurrentView('main')}
      />
      <div className="max-w-md mx-auto">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-lumi-label mb-1 pl-3">
              Senha Atual
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 bg-white dark:bg-transparent rounded-md shadow-lg border text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition-all duration-200 transform hover:scale-105 hover:bg-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-lumi-label mb-1 pl-3">
              Nova Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 bg-white dark:bg-transparent rounded-md shadow-lg border text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition-all duration-200 transform hover:scale-105 hover:bg-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-lumi-label mb-1 pl-3">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 bg-white dark:bg-transparent rounded-md shadow-lg border text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition-all duration-200 transform hover:scale-105 hover:bg-gray-300"
            />
          </div>
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="mt-2 w-full bg-lumi-primary hover:bg-lumi-primary-hover text-white font-bold py-3 px-4 rounded-md shadow-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumi-primary disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
            >
              Confirmar Troca de Senha
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderMainView = () => (
    <>
      <div className="p-6">
        <h2 className="text-lg font-bold text-lumi-primary dark:text-lumi-label mb-4 select-none">
          Gerenciamento de Dados
        </h2>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
          <SettingItem
            icon={downloadIconUrl}
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
          <SettingItem
            icon={uploadIconUrl}
            title="Exportar Dados"
            description="Exporte relatórios completos em formato CSV ou PDF."
          >
            <button
              onClick={() => setCurrentView('export')}
              className="font-semibold dark:text-white py-2 px-4 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 select-none"
            >
              Mais Opções
            </button>
          </SettingItem>
        </div>
      </div>
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 transition-all duration-200">
        <h2 className="text-lg font-bold text-lumi-primary dark:text-lumi-label mb-4 select-none">
          Aparência
        </h2>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
          <SettingItem
            icon={effectiveTheme === 'light' ? moonIconUrl : sunIconUrl}
            title="Tema"
            description="Escolha entre o tema claro, escuro ou o padrão do sistema."
          >
            <div className="flex items-center space-x-2 p-1 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700 transition-all duration-200 select-none">
              <button
                onClick={() => setTheme('light')}
                className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors duration-200 ${theme === 'light' ? 'bg-white shadow' : 'hover:bg-gray-600'}`}
              >
                Claro
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-800 text-white shadow' : 'hover:bg-gray-600'}`}
              >
                Escuro
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors duration-200 ${theme === 'system' ? 'bg-lumi-primary text-white shadow' : 'hover:bg-gray-600'}`}
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
            icon={lockIconUrl}
            title="Mudar Senha"
            description="Altere sua senha de acesso ao sistema."
          >
            <button
              onClick={() => setCurrentView('password')}
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
      <div className="mb-6 shrink-0 select-none">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white transition-all duration-200">
          Olá, Bibliotecário!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 transition-all duration-200">
          Gerencie suas preferências e dados do sistema.
        </p>
      </div>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow overflow-y-auto transition-all duration-200">
        {currentView === 'main' && renderMainView()}
        {currentView === 'import' && renderImportView()}
        {currentView === 'export' && renderExportView()}
        {currentView === 'password' && renderPasswordView()}
      </div>
    </div>
  );
}
