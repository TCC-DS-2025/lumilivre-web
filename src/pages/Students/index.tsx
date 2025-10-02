import { useState, useMemo, useEffect } from 'react';

import { SortableTh } from '../../components/SortableTh';
import { TableFooter } from '../../components/TableFooter';
import { Modal } from '../../components/Modal';
import { NovoAluno } from '../../components/forms/NewStudent';

import filterIconUrl from '../../assets/icons/filter.svg';
import addIconUrl from '../../assets/icons/add.svg';
import searchIconUrl from '../../assets/icons/search.svg';

import {
  buscarAlunosParaAdmin,
  type ListaAluno,
} from '../../services/alunoService';
import { LoadingIcon } from '../../components/LoadingIcon';

// funcionalidade a desenvolver no backend
type StatusPenalidade =
  | 'sem-penalidade'
  | 'advertencia'
  | 'suspensao'
  | 'inativo';

const alunosLegend = [
  { status: 'sem-penalidade', label: 'Sem Penalidade', color: 'bg-green-500' },
  { status: 'advertencia', label: 'Advertência', color: 'bg-yellow-500' },
  { status: 'suspensao', label: 'Suspensão', color: 'bg-orange-500' },
  { status: 'inativo', label: 'Inativo', color: 'bg-red-500' },
];
interface Aluno extends ListaAluno {
  id: number;
  cpf: string;
  nascimento: Date;
  penalidade: StatusPenalidade | null;
}

// const mockAlunos: Aluno[] = [
//   {
//     id: 1,
//     matricula: '23001',
//     nome: 'Neemias Cormino',
//     cpf: '123.456.789-00',
//     nascimento: new Date('2005-05-20'),
//     cursoNome: 'Desenvolvimento de Sistemas',
//     email: 'neemias.cormino@etec.sp.gov.br',
//     celular: '(11) 98765-4321',
//     penalidade: 'sem-penalidade',
//   },
//   {
//     id: 2,
//     matricula: '23002',
//     nome: 'João Selvagem',
//     cpf: '111.222.333-44',
//     nascimento: new Date('2004-08-15'),
//     cursoNome: 'Enfermagem',
//     email: 'joao.selvagem@etec.sp.gov.br',
//     celular: '(11) 91234-5678',
//     penalidade: 'advertencia',
//   },
//   {
//     id: 3,
//     matricula: '23003',
//     nome: 'Maria Oliveira',
//     cpf: '222.333.444-55',
//     nascimento: new Date('2006-01-30'),
//     cursoNome: 'Administração',
//     email: 'maria.oliveira@etec.sp.gov.br',
//     celular: '(11) 95678-1234',
//     penalidade: 'suspensao',
//   },
//   {
//     id: 4,
//     matricula: '23004',
//     nome: 'Carlos Pereira',
//     cpf: '333.444.555-66',
//     nascimento: new Date('2005-11-10'),
//     cursoNome: 'Logística',
//     email: 'carlos.pereira@etec.sp.gov.br',
//     celular: '(11) 98888-7777',
//     penalidade: 'inativo',
//   },
//   {
//     id: 5,
//     matricula: '23005',
//     nome: 'Ana Beatriz Souza',
//     cpf: '444.555.666-77',
//     nascimento: new Date('2006-02-18'),
//     cursoNome: 'Contabilidade',
//     email: 'ana.souza@etec.sp.gov.br',
//     celular: '(11) 93456-7890',
//     penalidade: 'sem-penalidade',
//   },
//   {
//     id: 6,
//     matricula: '23006',
//     nome: 'Pedro Henrique Santos',
//     cpf: '555.666.777-88',
//     nascimento: new Date('2004-07-12'),
//     cursoNome: 'Desenvolvimento de Sistemas',
//     email: 'pedro.santos@etec.sp.gov.br',
//     celular: '(11) 92345-6789',
//     penalidade: 'advertencia',
//   },
//   {
//     id: 7,
//     matricula: '23007',
//     nome: 'Luana Costa',
//     cpf: '666.777.888-99',
//     nascimento: new Date('2005-12-05'),
//     cursoNome: 'Enfermagem',
//     email: 'luana.costa@etec.sp.gov.br',
//     celular: '(11) 93210-9876',
//     penalidade: 'sem-penalidade',
//   },
//   {
//     id: 8,
//     matricula: '23008',
//     nome: 'Rafael Almeida',
//     cpf: '777.888.999-00',
//     nascimento: new Date('2006-03-22'),
//     cursoNome: 'Administração',
//     email: 'rafael.almeida@etec.sp.gov.br',
//     celular: '(11) 97654-3210',
//     penalidade: 'suspensao',
//   },
//   {
//     id: 9,
//     matricula: '23009',
//     nome: 'Gabriela Martins',
//     cpf: '888.999.000-11',
//     nascimento: new Date('2005-09-17'),
//     cursoNome: 'Logística',
//     email: 'gabriela.martins@etec.sp.gov.br',
//     celular: '(11) 94567-1234',
//     penalidade: 'sem-penalidade',
//   },
//   {
//     id: 10,
//     matricula: '23010',
//     nome: 'Felipe Rocha',
//     cpf: '999.000.111-22',
//     nascimento: new Date('2004-04-28'),
//     cursoNome: 'Contabilidade',
//     email: 'felipe.rocha@etec.sp.gov.br',
//     celular: '(11) 98700-1122',
//     penalidade: 'advertencia',
//   },
//   {
//     id: 11,
//     matricula: '23011',
//     nome: 'Larissa Lima',
//     cpf: '101.202.303-44',
//     nascimento: new Date('2006-06-14'),
//     cursoNome: 'Desenvolvimento de Sistemas',
//     email: 'larissa.lima@etec.sp.gov.br',
//     celular: '(11) 94433-2211',
//     penalidade: 'sem-penalidade',
//   },
//   {
//     id: 12,
//     matricula: '23012',
//     nome: 'Mateus Fernandes',
//     cpf: '202.303.404-55',
//     nascimento: new Date('2005-10-03'),
//     cursoNome: 'Enfermagem',
//     email: 'mateus.fernandes@etec.sp.gov.br',
//     celular: '(11) 95522-3344',
//     penalidade: 'inativo',
//   },
//   {
//     id: 13,
//     matricula: '23013',
//     nome: 'Isabela Nunes',
//     cpf: '303.404.505-66',
//     nascimento: new Date('2004-01-25'),
//     cursoNome: 'Administração',
//     email: 'isabela.nunes@etec.sp.gov.br',
//     celular: '(11) 92233-4455',
//     penalidade: 'suspensao',
//   },
//   {
//     id: 14,
//     matricula: '23014',
//     nome: 'Lucas Barbosa',
//     cpf: '404.505.606-77',
//     nascimento: new Date('2006-08-09'),
//     cursoNome: 'Logística',
//     email: 'lucas.barbosa@etec.sp.gov.br',
//     celular: '(11) 93344-5566',
//     penalidade: 'sem-penalidade',
//   },
//   {
//     id: 15,
//     matricula: '23015',
//     nome: 'Camila Duarte',
//     cpf: '505.606.707-88',
//     nascimento: new Date('2005-11-19'),
//     cursoNome: 'Contabilidade',
//     email: 'camila.duarte@etec.sp.gov.br',
//     celular: '(11) 94455-6677',
//     penalidade: 'advertencia',
//   },
//   {
//     id: 16,
//     matricula: '23016',
//     nome: 'Thiago Ribeiro',
//     cpf: '606.707.808-99',
//     nascimento: new Date('2006-07-07'),
//     cursoNome: 'Desenvolvimento de Sistemas',
//     email: 'thiago.ribeiro@etec.sp.gov.br',
//     celular: '(11) 95566-7788',
//     penalidade: 'sem-penalidade',
//   },
//   {
//     id: 17,
//     matricula: '23017',
//     nome: 'Juliana Mendes',
//     cpf: '707.808.909-00',
//     nascimento: new Date('2004-03-29'),
//     cursoNome: 'Enfermagem',
//     email: 'juliana.mendes@etec.sp.gov.br',
//     celular: '(11) 96677-8899',
//     penalidade: 'suspensao',
//   },
//   {
//     id: 18,
//     matricula: '23018',
//     nome: 'Gustavo Azevedo',
//     cpf: '808.909.010-11',
//     nascimento: new Date('2005-12-25'),
//     cursoNome: 'Administração',
//     email: 'gustavo.azevedo@etec.sp.gov.br',
//     celular: '(11) 97788-9900',
//     penalidade: 'sem-penalidade',
//   },
//   {
//     id: 19,
//     matricula: '23019',
//     nome: 'Fernanda Castro',
//     cpf: '909.010.111-22',
//     nascimento: new Date('2006-05-02'),
//     cursoNome: 'Logística',
//     email: 'fernanda.castro@etec.sp.gov.br',
//     celular: '(11) 98899-0011',
//     penalidade: 'advertencia',
//   },
//   {
//     id: 20,
//     matricula: '23020',
//     nome: 'André Lopes',
//     cpf: '010.111.212-33',
//     nascimento: new Date('2004-09-13'),
//     cursoNome: 'Contabilidade',
//     email: 'andre.lopes@etec.sp.gov.br',
//     celular: '(11) 99900-1122',
//     penalidade: 'inativo',
//   },
// ];

export function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [termoBusca, setTermoBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('');

  useEffect(() => {
    const carregarAlunos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const paginaDeAlunos = await buscarAlunosParaAdmin(
          filtroAtivo,
          currentPage - 1,
          itemsPerPage,
        );

        // garante que o status é válido
        const toStatusPenalidade = (
          status: string | null,
        ): StatusPenalidade => {
          const lowerStatus = status?.toLowerCase().replace('_', '-');
          switch (lowerStatus) {
            case 'sem-penalidade':
            case 'advertencia':
            case 'suspensao':
            case 'inativo':
              return lowerStatus;
            default:
              return 'sem-penalidade'; // fallback seguro
          }
        };

        const alunosDaApi: Aluno[] = paginaDeAlunos.content.map(
          (dto, index) => ({
            ...dto, // ListaAluno (nome, email, celular, etc.)
            id: index,
            cpf: 'N/A', // endpoint /home?
            nascimento: new Date(), // endpoint /home?
            penalidade: toStatusPenalidade(dto.penalidade),
          }),
        );

        //const dadosFinais = [...alunosDaApi, ...mockAlunos]; // com mock
        const dadosFinais = alunosDaApi; // sem mock
        setAlunos(dadosFinais);
      } catch (err) {
        console.error('Erro ao carregar alunos:', err);
        setError('Não foi possível carregar os dados dos alunos.');
      } finally {
        setIsLoading(false);
      }
    };

    carregarAlunos();
  }, [currentPage, itemsPerPage, filtroAtivo]);

  const handleBusca = () => {
    setCurrentPage(1); // Sempre volta para a primeira página ao fazer uma nova busca
    setFiltroAtivo(termoBusca);
  };

  // organização das colunas
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Aluno;
    direction: 'asc' | 'desc';
  }>({ key: 'nome', direction: 'asc' });

  const sortedAlunos = useMemo(() => {
    let sortableItems = [...alunos];

    sortableItems.sort((a, b) => {
      const key = sortConfig.key;

      if (key === 'nascimento') {
        return sortConfig.direction === 'asc'
          ? a[key].getTime() - b[key].getTime()
          : b[key].getTime() - a[key].getTime();
      }

      const valA = a[key as keyof typeof a];
      const valB = b[key as keyof typeof b];

      if (valA === null) return -1;
      if (valB === null) return 1;

      if (valA < valB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sortableItems;
  }, [alunos, sortConfig]);

  const totalPages = Math.ceil(alunos.length / itemsPerPage);

  const requestSort = (key: keyof Aluno) => {
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
    // se o valor for nulo ou inválido
    const safeStatus = status || 'sem-penalidade';

    const colorMap: Record<StatusPenalidade, string> = {
      'sem-penalidade': 'bg-green-500',
      advertencia: 'bg-yellow-500',
      suspensao: 'bg-orange-500',
      inativo: 'bg-red-500',
    };
    const titleMap: Record<StatusPenalidade, string> = {
      'sem-penalidade': 'Sem Penalidades',
      advertencia: 'Advertência',
      suspensao: 'Suspensão',
      inativo: 'Inativo',
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
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="relative ml-3 mr-2 transition-all duration-200 transform hover:scale-105 select-none">
            <button
              onClick={handleBusca}
              className="absolute inset-y-0 right-0 px-4 rounded-r-lg flex items-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
            >
              <img src={searchIconUrl} alt="Pesquisar" className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Faça sua pesquisa de aluno"
              className="pl-5 py-2 w-[500px] rounded-lg bg-white dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none shadow-md transition-all duration-200"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBusca();
              }}
            />
          </div>
          <button className="flex items-center bg-white dark:bg-dark-card dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-110 shadow-md select-none">
            <span>Filtro Avançado</span>
            <img src={filterIconUrl} alt="Filtros" className="w-5 h-5 ml-2" />
          </button>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center mr-3 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105 shadow-md select-none"
        >
          <img src={addIconUrl} alt="Novo Aluno" className="w-6 h-6 mr-2" />
          <span>NOVO ALUNO</span>
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Novo Aluno"
      >
        <NovoAluno onClose={() => setIsModalOpen(false)} />
      </Modal>

      <div className="bg-white dark:bg-dark-card transition-colors duration-200 rounded-lg shadow-md flex-grow flex flex-col min-h-0">
        <div className="overflow-y-auto flex-grow bg-white dark:bg-dark-card transition-colors duration-200 rounded-t-lg">
          <table className="min-w-full table-auto ">
            <colgroup>
              <col style={{ width: '10%' }} />
              {/* Penalidade */}
              <col style={{ width: '10%' }} />
              {/* Matrícula */}
              <col style={{ width: '15%' }} />
              {/* Curso */}
              <col style={{ width: '20%' }} />
              {/* Aluno */}
              <col style={{ width: '10%' }} />
              {/* Nascimento */}
              <col style={{ width: '20%' }} />
              {/* Email */}
              <col style={{ width: '10%' }} />
              {/* Contato */}
              <col style={{ width: '5%' }} />
              {/* Ações */}
            </colgroup>
            <thead className="sticky top-0 bg-lumi-primary shadow-md z-10">
              <tr className="select-none">
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('penalidade')}
                  sortConfig={sortConfig}
                  sortKey="penalidade"
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
                  onClick={() => requestSort('cursoNome')} // curso
                  sortConfig={sortConfig}
                  sortKey="cursoNome"
                >
                  Curso
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('nome')}
                  sortConfig={sortConfig}
                  sortKey="nome"
                >
                  Aluno
                </SortableTh>
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider transition-all duration-200 hover:bg-white/30"
                  onClick={() => requestSort('nascimento')}
                  sortConfig={sortConfig}
                  sortKey="nascimento"
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
                sortedAlunos.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 hover:duration-0"
                  >
                    <td className="p-4 whitespace-nowrap">
                      <PenalidadeIndicator status={item.penalidade} />
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm font-bold text-gray-700 dark:text-gray-300">
                      {item.matricula}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 truncate">
                      {item.cursoNome}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm font-bold text-gray-700 dark:text-gray-300 truncate">
                      {item.nome}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.nascimento.toLocaleDateString('pt-BR')}
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
            totalPages,
            itemsPerPage,
            totalItems: alunos.length,
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
