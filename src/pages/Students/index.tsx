import { useState, useMemo } from 'react';
import { SortableTh } from '../../components/SortableTh';

import filterIconUrl from '../../assets/icons/filter.svg';
import addIconUrl from '../../assets/icons/add.svg';
import searchIconUrl from '../../assets/icons/search.svg';

type StatusPenalidade =
  | 'sem-penalidade'
  | 'advertencia'
  | 'suspensao'
  | 'inativo';

interface Aluno {
  id: number;
  matricula: string;
  nome: string;
  cpf: string;
  nascimento: Date;
  curso: string;
  email: string;
  contato: string;
  penalidade: StatusPenalidade;
}

const mockAlunos: Aluno[] = [
  {
    id: 1,
    matricula: '23001',
    nome: 'Neemias Cormino',
    cpf: '123.456.789-00',
    nascimento: new Date('2005-05-20'),
    curso: 'Desenvolvimento de Sistemas',
    email: 'neemias.cormino@etec.sp.gov.br',
    contato: '(11) 98765-4321',
    penalidade: 'sem-penalidade',
  },
  {
    id: 2,
    matricula: '23002',
    nome: 'João Selvagem',
    cpf: '111.222.333-44',
    nascimento: new Date('2004-08-15'),
    curso: 'Enfermagem',
    email: 'joao.silva@etec.sp.gov.br',
    contato: '(11) 91234-5678',
    penalidade: 'advertencia',
  },
  {
    id: 3,
    matricula: '23003',
    nome: 'Maria Oliveira',
    cpf: '222.333.444-55',
    nascimento: new Date('2006-01-30'),
    curso: 'Administração',
    email: 'maria.oliveira@etec.sp.gov.br',
    contato: '(11) 95678-1234',
    penalidade: 'suspensao',
  },
  {
    id: 4,
    matricula: '23004',
    nome: 'Carlos Pereira',
    cpf: '333.444.555-66',
    nascimento: new Date('2005-11-10'),
    curso: 'Desenvolvimento de Sistemas',
    email: 'carlos.pereira@etec.sp.gov.br',
    contato: '(11) 98888-7777',
    penalidade: 'inativo',
  },
  {
    id: 5,
    matricula: '23001',
    nome: 'Neemias Cormino',
    cpf: '123.456.789-00',
    nascimento: new Date('2005-05-20'),
    curso: 'Desenvolvimento de Sistemas',
    email: 'neemias.cormino@etec.sp.gov.br',
    contato: '(11) 98765-4321',
    penalidade: 'sem-penalidade',
  },
  {
    id: 6,
    matricula: '23002',
    nome: 'João Selvagem',
    cpf: '111.222.333-44',
    nascimento: new Date('2004-08-15'),
    curso: 'Enfermagem',
    email: 'joao.silva@etec.sp.gov.br',
    contato: '(11) 91234-5678',
    penalidade: 'advertencia',
  },
  {
    id: 7,
    matricula: '23003',
    nome: 'Maria Oliveira',
    cpf: '222.333.444-55',
    nascimento: new Date('2006-01-30'),
    curso: 'Administração',
    email: 'maria.oliveira@etec.sp.gov.br',
    contato: '(11) 95678-1234',
    penalidade: 'suspensao',
  },
  {
    id: 8,
    matricula: '23004',
    nome: 'Carlos Pereira',
    cpf: '333.444.555-66',
    nascimento: new Date('2005-11-10'),
    curso: 'Desenvolvimento de Sistemas',
    email: 'carlos.pereira@etec.sp.gov.br',
    contato: '(11) 98888-7777',
    penalidade: 'inativo',
  },
  {
    id: 9,
    matricula: '23001',
    nome: 'Neemias Cormino',
    cpf: '123.456.789-00',
    nascimento: new Date('2005-05-20'),
    curso: 'Desenvolvimento de Sistemas',
    email: 'neemias.cormino@etec.sp.gov.br',
    contato: '(11) 98765-4321',
    penalidade: 'sem-penalidade',
  },
  {
    id: 10,
    matricula: '23002',
    nome: 'João Selvagem',
    cpf: '111.222.333-44',
    nascimento: new Date('2004-08-15'),
    curso: 'Enfermagem',
    email: 'joao.silva@etec.sp.gov.br',
    contato: '(11) 91234-5678',
    penalidade: 'advertencia',
  },
  {
    id: 11,
    matricula: '23003',
    nome: 'Maria Oliveira',
    cpf: '222.333.444-55',
    nascimento: new Date('2006-01-30'),
    curso: 'Administração',
    email: 'maria.oliveira@etec.sp.gov.br',
    contato: '(11) 95678-1234',
    penalidade: 'suspensao',
  },
  {
    id: 12,
    matricula: '23004',
    nome: 'Carlos Pereira',
    cpf: '333.444.555-66',
    nascimento: new Date('2005-11-10'),
    curso: 'Desenvolvimento de Sistemas',
    email: 'carlos.pereira@etec.sp.gov.br',
    contato: '(11) 98888-7777',
    penalidade: 'inativo',
  },
];

export function AlunosPage() {
  const [alunos] = useState<Aluno[]>(mockAlunos);
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
      if (a[key] < b[key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [alunos, sortConfig]);

  const requestSort = (key: keyof Aluno) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const PenalidadeIndicator = ({ status }: { status: StatusPenalidade }) => {
    const colorMap = {
      'sem-penalidade': 'bg-green-500',
      advertencia: 'bg-yellow-500',
      suspensao: 'bg-orange-500',
      inativo: 'bg-red-500',
    };
    const titleMap = {
      'sem-penalidade': 'Sem Penalidades',
      advertencia: 'Advertência',
      suspensao: 'Suspensão',
      inativo: 'Inativo',
    };
    return (
      <div
        className={`w-3 h-3 rounded-full mx-auto shadow-md ${colorMap[status]}`}
        title={titleMap[status]}
      />
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="relative ml-3 mr-2 transition-all duration-200 transform hover:scale-105 select-none">
            <input
              type="text"
              placeholder="Faça sua pesquisa de aluno"
              className="pl-10 pr-4 py-2 w-[500px] rounded-lg bg-white dark:bg-dark-card dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none shadow-md transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <img
                src={searchIconUrl}
                alt="Pesquisar"
                className="w-5 h-5 text-gray-400"
              />
            </div>
          </div>
          <button className="flex items-center bg-white dark:bg-dark-card dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-110 shadow-md select-none">
            <img src={filterIconUrl} alt="Filtros" className="w-5 h-5 mr-2" />
            <span>Filtro Avançado</span>
          </button>
        </div>
        <button className="flex items-center mr-3 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105 shadow-md select-none">
          <img src={addIconUrl} alt="Novo Aluno" className="w-6 h-6 mr-2" />
          <span>NOVO ALUNO</span>
        </button>
      </div>

      <div className="bg-white dark:bg-dark-card transition-colors duration-200 rounded-lg shadow-md flex-grow flex flex-col min-h-0">
        <div className="overflow-y-auto bg-white dark:bg-dark-card transition-colors duration-200 rounded-lg">
          <table className="min-w-full table-auto ">
            <colgroup>
              <col style={{ width: '10%' }} /> {/* Penalidade */}
              <col style={{ width: '10%' }} /> {/* Matrícula */}
              <col style={{ width: '15%' }} /> {/* Curso */}
              <col style={{ width: '20%' }} /> {/* Aluno */}
              <col style={{ width: '10%' }} /> {/* Nascimento */}
              <col style={{ width: '20%' }} /> {/* Email */}
              <col style={{ width: '10%' }} /> {/* Contato */}
              <col style={{ width: '5%' }} /> {/* Ações */}
            </colgroup>
            <thead className="sticky top-0 bg-lumi-primary shadow-md z-10">
              <tr className="select-none">
                <SortableTh
                  className="p-4 text-sm font-bold text-white tracking-wider rounded-tl-lg transition-all duration-200 hover:bg-white/30"
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
                  onClick={() => requestSort('curso')}
                  sortConfig={sortConfig}
                  sortKey="curso"
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
                  onClick={() => requestSort('contato')}
                  sortConfig={sortConfig}
                  sortKey="contato"
                >
                  Contato
                </SortableTh>
                <th className="p-4 text-sm font-bold text-white tracking-wider rounded-tr-lg">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y text-center bg-white dark:bg-dark-card transition-colors duration-200">
              {sortedAlunos.map((item) => (
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
                    {item.curso}
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
                    {item.contato}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <button className="bg-lumi-primary text-white text-xs font-bold py-1 px-3 rounded hover:bg-lumi-primary-hover transition-transform duration-200 hover:scale-105 shadow-md select-none">
                      DETALHES
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
