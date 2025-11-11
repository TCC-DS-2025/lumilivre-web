import { useState, useEffect, useMemo, useCallback } from 'react';

import { ActionHeader } from '../../components/ActionHeader';
import { SortableTh } from '../../components/SortableTh';
import { TableFooter } from '../../components/TableFooter';
import { Modal } from '../../components/Modal';
import { NovoAluno } from '../../components/forms/NewStudent';
import { LoadingIcon } from '../../components/LoadingIcon';
import { FiltroAvançado } from '../../components/filters/AdvancedFilter';

import {
  buscarAlunosAvancado,
  buscarAlunosParaAdmin,
  type ListaAluno,
} from '../../services/alunoService';
import type { Page } from '../../types';

type StatusPenalidade =
  | 'sem-penalidade'
  | 'advertencia'
  | 'suspensao'
  | 'bloqueio'
  | 'banimento';

const alunosLegend = [
  { status: 'sem-penalidade', label: 'Sem Penalidade', color: 'bg-green-500' },
  { status: 'advertencia', label: 'Advertência', color: 'bg-yellow-500' },
  { status: 'suspensao', label: 'Suspensão', color: 'bg-orange-500' },
  { status: 'bloqueio', label: 'Bloqueio', color: 'bg-red-500' },
  { status: 'banimento', label: 'Banimento', color: 'bg-black' },
];

type AlunoDisplay = ListaAluno & {
  nascimentoDate: Date;
  penalidadeStatus: StatusPenalidade;
};

export function AlunosPage() {
  // estados da pagina
  const [alunos, setAlunos] = useState<AlunoDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // estados de paginação e filtro
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pageData, setPageData] = useState<Page<AlunoDisplay> | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterParams, setFilterParams] = useState({
    penalidade: '',
    cursoNome: '',
    turno: '',
    modulo: '',
    dataNascimento: '',
  });
  const [activeFilters, setActiveFilters] = useState({});

  const hasActiveFilters = useMemo(() => {
    return Object.values(activeFilters).some((value) => value !== '');
  }, [activeFilters]);

  // organização das colunas
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AlunoDisplay;
    direction: 'asc' | 'desc';
  }>({ key: 'nomeCompleto', direction: 'asc' });

  const fetchAlunos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let paginaDeAlunos;
      const params = {
        page: currentPage - 1,
        size: itemsPerPage,
        sort: `${sortConfig.key},${sortConfig.direction}`,
      };

      if (hasActiveFilters) {
        paginaDeAlunos = await buscarAlunosAvancado({
          ...activeFilters,
          ...params,
        });
      } else {
        paginaDeAlunos = await buscarAlunosParaAdmin(
          filtroAtivo,
          params.page,
          params.size,
          params.sort,
        );
      }

      if (!paginaDeAlunos || !paginaDeAlunos.content) {
        setAlunos([]);
        setPageData(null);
        return;
      }

      // garante que o status é válido
      const toStatusPenalidade = (status: string | null): StatusPenalidade => {
        if (status === null) {
          return 'sem-penalidade';
        }
        const lowerStatus = status.toLowerCase();
        switch (lowerStatus) {
          case 'advertencia':
          case 'suspensao':
          case 'bloqueio':
          case 'banimento':
            return lowerStatus;
          default:
            return 'sem-penalidade'; // fallback seguro
        }
      };

      const alunosDaApi = paginaDeAlunos.content.map((dto) => ({
        ...dto, // ListaAluno
        nascimentoDate: new Date(dto.dataNascimento),
        penalidadeStatus: toStatusPenalidade(dto.penalidade),
      }));

      setPageData({ ...paginaDeAlunos, content: alunosDaApi });
      setAlunos(alunosDaApi);
    } catch (err) {
      console.error('Erro ao carregar alunos:', err);
      setError('Não foi possível carregar os dados dos alunos.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, filtroAtivo, activeFilters, sortConfig]);

  useEffect(() => {
    fetchAlunos();
  }, [fetchAlunos]);

  const handleCadastroSucesso = () => {
    fetchAlunos();
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setActiveFilters(filterParams);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setCurrentPage(1);
    setFilterParams({
      penalidade: '',
      cursoNome: '',
      turno: '',
      modulo: '',
      dataNascimento: '',
    });
    setActiveFilters({});
    setIsFilterOpen(false);
  };

  const handleBusca = () => {
    setCurrentPage(1);
    setActiveFilters({});
    setFiltroAtivo(termoBusca);
  };

  const sortedAlunos = useMemo(() => {
    let sortableItems = [...alunos];
    sortableItems.sort((a, b) => {
      const key = sortConfig.key;
      if (key === 'nascimentoDate') {
        // Use o campo de Data real
        return sortConfig.direction === 'asc'
          ? a[key].getTime() - b[key].getTime()
          : b[key].getTime() - a[key].getTime();
      }
      const valA = a[key as keyof typeof a];
      const valB = b[key as keyof typeof b];
      if (valA === null) return 1;
      if (valB === null) return -1;
      return sortConfig.direction === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
    return sortableItems;
  }, [alunos, sortConfig]);

  const requestSort = (key: keyof AlunoDisplay) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // configurações do status de penalidade
  const PenalidadeIndicator = ({
    status,
  }: {
    status: StatusPenalidade | null;
  }) => {
    const safeStatus = status || 'sem-penalidade';

    const colorMap: Record<StatusPenalidade, string> = {
      'sem-penalidade': 'bg-green-500',
      advertencia: 'bg-yellow-500',
      suspensao: 'bg-orange-500',
      bloqueio: 'bg-red-500',
      banimento: 'bg-black',
    };
    const titleMap: Record<StatusPenalidade, string> = {
      'sem-penalidade': 'Sem Penalidades',
      advertencia: 'Advertência',
      suspensao: 'Suspensão',
      bloqueio: 'Bloqueio',
      banimento: 'Banimento',
    };

    return (
      <div
        className={`w-3 h-3 rounded-full mx-auto shadow-md ${colorMap[safeStatus]}`}
        title={titleMap[safeStatus]}
      />
    );
  };

  // modal do popup de cadastro
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <ActionHeader
        searchTerm={termoBusca}
        onSearchChange={setTermoBusca}
        onSearchSubmit={handleBusca}
        searchPlaceholder="Pesquise pelo nome do aluno ou curso"
        onAddNew={() => setIsModalOpen(true)}
        addNewButtonLabel="NOVO ALUNO"
        showFilterButton={true}
        onFilterToggle={() => setIsFilterOpen((prev) => !prev)}
      />

      {isFilterOpen && (
        <div className="relative">
          {' '}
          <FiltroAvançado
            filters={filterParams}
            onFilterChange={(field, value) =>
              setFilterParams((prev) => ({ ...prev, [field]: value }))
            }
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Novo Aluno"
      >
        <NovoAluno
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleCadastroSucesso}
        />
      </Modal>

      <div className="bg-white dark:bg-dark-card transition-colors duration-200 rounded-lg shadow-md flex-grow flex flex-col min-h-0">
        <div className="overflow-y-auto flex-grow bg-white dark:bg-dark-card transition-colors duration-200 rounded-t-lg">
          <table className="min-w-full table-auto">
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '5%' }} />
            </colgroup>
            <thead className="sticky top-0 bg-lumi-primary shadow-md z-10">
              <tr className="select-none">
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('penalidadeStatus')}
                  sortConfig={sortConfig}
                  sortKey="penalidadeStatus"
                >
                  Penalidade
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('matricula')}
                  sortConfig={sortConfig}
                  sortKey="matricula"
                >
                  Matrícula
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('cursoNome')}
                  sortConfig={sortConfig}
                  sortKey="cursoNome"
                >
                  Curso
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('nomeCompleto')}
                  sortConfig={sortConfig}
                  sortKey="nome"
                >
                  Aluno
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('nascimentoDate')}
                  sortConfig={sortConfig}
                  sortKey="nascimentoDate"
                >
                  Nascimento
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('email')}
                  sortConfig={sortConfig}
                  sortKey="email"
                >
                  Email
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('celular')} // contato
                  sortConfig={sortConfig}
                  sortKey="celular"
                >
                  Contato
                </SortableTh>
                <th className="p-4 text-sm font-bold text-white tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y text-center bg-white dark:bg-dark-card transition-colors duration-200">
              {/* logica de carregamento dos dados da api */}
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8">
                    <LoadingIcon />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : sortedAlunos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              ) : (
                alunos.map((item) => (
                  <tr
                    key={item.matricula}
                    className="transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 hover:duration-0"
                  >
                    <td className="p-4 whitespace-nowrap">
                      <PenalidadeIndicator status={item.penalidadeStatus} />
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm font-bold text-gray-700 dark:text-gray-300">
                      {item.matricula}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 truncate">
                      {item.cursoNome}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm font-bold text-gray-700 dark:text-gray-300 truncate">
                      {item.nomeCompleto}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.nascimentoDate.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 truncate">
                      {item.email}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.celular}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <button className="bg-lumi-primary text-white text-xs font-bold py-1 px-3 rounded hover:bg-lumi-primary-hover transition-transform duration-200 hover:scale-110 shadow-md select-none">
                        DETALHES
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TableFooter
          legendItems={alunosLegend.map((l) => ({
            label: l.label,
            color: l.color,
          }))}
          pagination={{
            currentPage,
            totalPages: pageData?.totalPages ?? 1,
            itemsPerPage,
            totalItems: pageData?.totalElements ?? 0,
          }}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
