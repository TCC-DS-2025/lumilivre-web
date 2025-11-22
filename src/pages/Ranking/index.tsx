import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import {
  buscarRanking,
  type AlunoRanking,
} from '../../services/emprestimoService';
import { buscarCursos, type Curso } from '../../services/cursoService';
import { buscarModulos } from '../../services/moduloService';
import { LoadingIcon } from '../../components/LoadingIcon';

import FilterIcon from '../../assets/icons/filter.svg?react';
import TrophyIcon from '../../assets/icons/ranking-active.svg?react'; // Usando ícone existente como troféu

export function ClassificacaoPage() {
  const [rankingData, setRankingData] = useState<AlunoRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [modulos, setModulos] = useState<string[]>([]);

  const [filtroCurso, setFiltroCurso] = useState<string>('');
  const [filtroModulo, setFiltroModulo] = useState<string>('');
  const [filtroTurno, setFiltroTurno] = useState<string>('');

  // Carregar opções de filtro
  useEffect(() => {
    Promise.all([buscarCursos(), buscarModulos()])
      .then(([cursosRes, modulosRes]) => {
        setCursos(cursosRes.content);
        setModulos(modulosRes);
      })
      .catch(console.error);
  }, []);

  // Buscar dados do ranking
  useEffect(() => {
    const fetchRanking = async () => {
      setIsLoading(true);
      try {
        // Converter filtros para IDs/Valores esperados
        // Nota: O backend espera IDs para curso e turno se possível,
        // mas aqui simplifiquei assumindo que você ajustou o service ou o backend aceita nomes ou IDs.
        // Se o backend pede ID do curso, precisamos achar o ID baseado no nome selecionado ou mudar o select para value={id}.

        // Ajuste: Vamos usar o ID do curso no select abaixo para facilitar
        const cursoId = filtroCurso ? Number(filtroCurso) : undefined;

        // Modulo no backend espera ID (1, 2, 3) mas o service retorna string ("1º Módulo").
        // Vamos fazer um parse simples ou enviar o index + 1 se a lista estiver ordenada.
        // Para simplificar, vou assumir que o backend foi ajustado ou vamos passar null por enquanto se for complexo.
        // Vamos tentar passar o index + 1 baseado na lista de string
        const moduloId = filtroModulo
          ? modulos.indexOf(filtroModulo) + 1
          : undefined;

        // Turno ID: 1-Manha, 2-Tarde, 3-Noite (Exemplo, ajuste conforme seu Enum/Banco)
        let turnoId: number | undefined;
        if (filtroTurno === 'MANHA') turnoId = 1;
        if (filtroTurno === 'TARDE') turnoId = 2;
        if (filtroTurno === 'NOITE') turnoId = 3;
        if (filtroTurno === 'INTEGRAL') turnoId = 4;

        const data = await buscarRanking(15, cursoId, moduloId, turnoId);
        setRankingData(data);
      } catch (error) {
        console.error('Erro ao buscar ranking', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRanking();
  }, [filtroCurso, filtroModulo, filtroTurno, modulos]);

  // Separar Top 3 e o Resto
  const top3 = useMemo(() => rankingData.slice(0, 3), [rankingData]);
  const chartData = useMemo(() => rankingData, [rankingData]);

  // Cores para o gráfico (Lumi Primary e variações)
  const barColors = ['#762075', '#9b2c9a', '#bf3abf', '#d65ad6', '#e085e0'];

  const PodiumItem = ({
    aluno,
    position,
  }: {
    aluno?: AlunoRanking;
    position: 1 | 2 | 3;
  }) => {
    if (!aluno) return <div className="w-1/3"></div>;

    let heightClass = 'h-32';
    let colorClass = 'bg-gray-300';
    let iconColor = 'text-gray-500';
    let orderClass = 'order-2'; // Padrão (2º e 3º lugar)

    if (position === 1) {
      heightClass = 'h-48';
      colorClass = 'bg-yellow-400'; // Ouro
      iconColor = 'text-yellow-600';
      orderClass = 'order-2 -mt-12 z-10'; // 1º lugar no meio e mais alto
    } else if (position === 2) {
      heightClass = 'h-36';
      colorClass = 'bg-gray-300'; // Prata
      iconColor = 'text-gray-500';
      orderClass = 'order-1'; // Esquerda
    } else {
      heightClass = 'h-28';
      colorClass = 'bg-orange-300'; // Bronze
      iconColor = 'text-orange-600';
      orderClass = 'order-3'; // Direita
    }

    return (
      <div
        className={`flex flex-col items-center justify-end w-1/3 ${orderClass} transition-all duration-500 ease-out transform hover:scale-105`}
      >
        <div className="flex flex-col items-center mb-2">
          <TrophyIcon className={`w-8 h-8 mb-1 ${iconColor}`} />
          <span className="font-bold text-gray-800 dark:text-white text-center line-clamp-1 px-1">
            {aluno.nome.split(' ')[0]} {aluno.nome.split(' ').pop()}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
            {aluno.emprestimosCount} empréstimos
          </span>
        </div>
        <div
          className={`w-full ${heightClass} ${colorClass} rounded-t-lg shadow-lg flex items-start justify-center pt-2 relative overflow-hidden`}
        >
          <span className={`text-4xl font-black text-white opacity-50`}>
            {position}
          </span>
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Cabeçalho e Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-dark-card p-4 rounded-lg shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <TrophyIcon className="w-8 h-8 text-lumi-primary" />
            Ranking de Leitores
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Os alunos que mais leem na instituição.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-semibold mr-2">
            <FilterIcon className="w-4 h-4" />
            <span>Filtrar por:</span>
          </div>

          <select
            value={filtroCurso}
            onChange={(e) => setFiltroCurso(e.target.value)}
            className="p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-lumi-primary outline-none"
          >
            <option value="">Todos os Cursos</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <select
            value={filtroModulo}
            onChange={(e) => setFiltroModulo(e.target.value)}
            className="p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-lumi-primary outline-none"
          >
            <option value="">Todos os Módulos</option>
            {modulos.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={filtroTurno}
            onChange={(e) => setFiltroTurno(e.target.value)}
            className="p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-lumi-primary outline-none"
          >
            <option value="">Todos os Turnos</option>
            <option value="MANHA">Manhã</option>
            <option value="TARDE">Tarde</option>
            <option value="NOITE">Noite</option>
            <option value="INTEGRAL">Integral</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center bg-white dark:bg-dark-card rounded-lg shadow-md">
          <LoadingIcon />
        </div>
      ) : rankingData.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center bg-white dark:bg-dark-card rounded-lg shadow-md p-8">
          <TrophyIcon className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-xl text-gray-500">
            Nenhum dado encontrado para os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="flex-grow flex flex-col gap-6">
          {/* Pódio */}
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 flex justify-center items-end min-h-[300px]">
            <div className="flex items-end justify-center w-full max-w-2xl gap-2 sm:gap-4">
              <PodiumItem aluno={top3[1]} position={2} />
              <PodiumItem aluno={top3[0]} position={1} />
              <PodiumItem aluno={top3[2]} position={3} />
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 flex-grow flex flex-col min-h-[400px]">
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">
              Top 15 Alunos com Mais Empréstimos
            </h3>
            <div className="flex-grow w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="nome"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    height={80}
                    tickFormatter={(value) => {
                      const names = value.split(' ');
                      return names.length > 1
                        ? `${names[0]} ${names[names.length - 1]}`
                        : value;
                    }}
                  />
                  <YAxis tick={{ fill: '#6b7280' }} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    itemStyle={{ color: '#374151', fontWeight: 'bold' }}
                    formatter={(value: number) => [
                      `${value} Livros`,
                      'Empréstimos',
                    ]}
                  />
                  <Bar
                    dataKey="emprestimosCount"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index < 3
                            ? '#fbbf24'
                            : barColors[index % barColors.length]
                        }
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
