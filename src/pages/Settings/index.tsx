import { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

import uploadIconUrl from '../../assets/icons/upload.svg';
import downloadIconUrl from '../../assets/icons/download.svg';
import lockIconUrl from '../../assets/icons/lock.svg';
import sunIconUrl from '../../assets/icons/sun.svg';
import moonIconUrl from '../../assets/icons/moon.svg';
import computerIconUrl from '../../assets/icons/computer.svg';

const SettingItem = ({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center">
      <img src={icon} alt={title} className="w-6 h-6 mr-4 text-lumi-primary" />
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
    <div>{children}</div>
  </div>
);

export function ConfiguracoesPage() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Configurações
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Gerencie suas preferências e dados do sistema.
        </p>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow">
        <div className="p-6">
          <h2 className="text-lg font-bold text-lumi-primary mb-4">
            Gerenciamento de Dados
          </h2>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700">
            <SettingItem
              icon={uploadIconUrl}
              title="Importar Dados"
              description="Importe dados de alunos ou livros a partir de um arquivo."
            >
              <button className="font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105">
                Importar
              </button>
            </SettingItem>
            <SettingItem
              icon={downloadIconUrl}
              title="Exportar Dados"
              description="Exporte relatórios completos em formato CSV ou PDF."
            >
              <button className="font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105">
                Exportar
              </button>
            </SettingItem>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-lumi-primary mb-4">Conta</h2>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700">
            <SettingItem
              icon={lockIconUrl}
              title="Mudar Senha"
              description="Altere sua senha de acesso ao sistema."
            >
              <button className="font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105">
                Alterar
              </button>
            </SettingItem>
          </div>
        </div>

        {/* Seção de Aparência */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-lumi-primary mb-4">
            Aparência
          </h2>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700">
            <SettingItem
              icon={theme === 'light' ? moonIconUrl : sunIconUrl}
              title="Tema"
              description="Escolha entre o tema claro, escuro ou o padrão do sistema."
            >
              <div className="flex items-center space-x-2 p-1 rounded-lg bg-gray-200 dark:bg-gray-700">
                <button
                  className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors duration-200 ${theme === 'light' ? 'bg-white shadow' : 'hover:bg-gray-600'}`}
                >
                  Claro
                </button>
                <button
                  className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-800 text-white shadow' : 'hover:bg-gray-600'}`}
                >
                  Escuro
                </button>
                <button className="px-3 py-1 rounded-md text-sm font-semibold transition-colors duration-200 hover:bg-gray-600">
                  Automático
                </button>
              </div>
            </SettingItem>
          </div>
        </div>
      </div>
    </div>
  );
}
