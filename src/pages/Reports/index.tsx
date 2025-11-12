import { useState } from 'react';
import { gerarRelatorio } from '../../services/relatorioService';

import SUBSTITUIR from '../../assets/icons/SUBSTITUIR.svg';

const ReportItem = ({
  icon,
  title,
  description,
  onGenerate,
}: {
  icon: string;
  title: string;
  description: string;
  onGenerate: () => void;
}) => (
  <div className="flex items-center justify-between p-4 border-b last:border-b-0 border-gray-200 dark:border-gray-700">
    <div className="flex items-center">
      <img src={icon} alt={title} className="w-6 h-6 mr-4" />
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
    <button
      onClick={onGenerate}
      className="flex items-center gap-2 font-semibold text-white py-2 px-4 rounded-lg shadow-md bg-lumi-primary hover:bg-lumi-primary-hover transition-all duration-200 transform hover:scale-105"
    >
      <img src={SUBSTITUIR} alt="Gerar" className="w-5 h-5" />
      <span>Gerar Relatório</span>
    </button>
  </div>
);

export function RelatoriosPage() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [statusEmprestimo, setStatusEmprestimo] = useState<
    'ATIVO' | 'CONCLUIDO' | 'ATRASADO' | ''
  >('');

  const handleGerarRelatorioEmprestimos = () => {
    gerarRelatorio('emprestimos', {
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      status: statusEmprestimo || undefined,
    });
  };

  const inputStyles =
    'w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition-all duration-200';
  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1';

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Central de Relatórios
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Gere e baixe relatórios em PDF sobre as operações da biblioteca.
        </p>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-bold text-lumi-primary dark:text-lumi-label mb-4">
            Relatórios Gerais
          </h2>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700">
            <ReportItem
              icon={SUBSTITUIR}
              title="Relatório de Alunos"
              description="Gera uma lista completa de todos os alunos cadastrados no sistema."
              onGenerate={() => gerarRelatorio('alunos')}
            />
            <ReportItem
              icon={SUBSTITUIR}
              title="Relatório de Livros"
              description="Gera uma lista de todos os títulos de livros, com autores e quantidade de exemplares."
              onGenerate={() => gerarRelatorio('livros')}
            />
            <ReportItem
              icon={SUBSTITUIR}
              title="Relatório de Exemplares"
              description="Gera uma lista detalhada de cada exemplar físico, incluindo seu status e localização."
              onGenerate={() => gerarRelatorio('exemplares')}
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-lumi-primary dark:text-lumi-label mb-4">
            Relatório de Empréstimos
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 -mt-2">
            Filtre os empréstimos por um período ou status específico. Deixe os
            campos em branco para incluir todos os registros.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="dataInicio" className={labelStyles}>
                Data de Início
              </label>
              <input
                type="date"
                id="dataInicio"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className={inputStyles}
              />
            </div>
            <div>
              <label htmlFor="dataFim" className={labelStyles}>
                Data Final
              </label>
              <input
                type="date"
                id="dataFim"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className={inputStyles}
              />
            </div>
            <div>
              <label htmlFor="status" className={labelStyles}>
                Status do Empréstimo
              </label>
              <select
                id="status"
                value={statusEmprestimo}
                onChange={(e) => setStatusEmprestimo(e.target.value as any)}
                className={inputStyles}
              >
                <option value="">Todos</option>
                <option value="ATIVO">Ativo</option>
                <option value="CONCLUIDO">Concluído</option>
                <option value="ATRASADO">Atrasado</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleGerarRelatorioEmprestimos}
              className="flex items-center gap-2 font-bold text-white py-2 px-6 rounded-lg shadow-md bg-lumi-primary hover:bg-lumi-primary-hover transition-all duration-200 transform hover:scale-105"
            >
              <img src={SUBSTITUIR} alt="Gerar" className="w-5 h-5" />
              <span>Gerar Relatório de Empréstimos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
