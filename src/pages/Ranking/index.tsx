import { useState, useEffect, useRef, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

import {
  buscarRanking,
  type AlunoRanking,
} from '../../services/emprestimoService';
import {
  buscarCursos,
  buscarEstatisticasGrafico,
  type EstatisticaGrafico,
  type Curso,
} from '../../services/cursoService';
import { buscarModulos } from '../../services/moduloService';
import { LoadingIcon } from '../../components/LoadingIcon';
import { CustomSelect } from '../../components/CustomSelect';

import CrownIcon from '../../assets/icons/crown.svg?react';
import Medal1Icon from '../../assets/icons/medal1.svg?react';
import Medal2Icon from '../../assets/icons/medal2.svg?react';
import Medal3Icon from '../../assets/icons/medal3.svg?react';
import FilterIcon from '../../assets/icons/filter.svg?react';

const BAR_COLORS = ['#762075', '#9b2c9a', '#bf3abf', '#d65ad6', '#e085e0'];
const TOP_3_COLORS = ['#EAB308', '#9CA3AF', '#F97316'];

const PIE_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#ff6b6b',
  '#4ecdc4',
];

// Gráfico de Pizza Reutilizável
const PieChartCard = ({
  title,
  data,
  emptyMessage,
}: {
  title: string;
  data: EstatisticaGrafico[];
  emptyMessage: string;
}) => (
  <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4">
    <h4 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 text-center uppercase tracking-wide">
      {title}
    </h4>
    <div className="flex-grow relative flex items-center justify-center min-h-[200px]">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data as any[]}
              dataKey="total"
              nameKey="nome"
              cx="50%"
              cy="50%"
              outerRadius={60}
              innerRadius={35}
              paddingAngle={5}
              label={({ percent = 0 }) => `${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              itemStyle={{ color: '#374151', fontWeight: 'bold' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-gray-400 text-xs text-center px-4">
          {emptyMessage}
        </div>
      )}
    </div>
  </div>
);

// Item do Pódio
const PodiumItem = ({
  aluno,
  position,
}: {
  aluno?: AlunoRanking;
  position: 1 | 2 | 3;
}) => {
  let heightClass = 'h-[45%]';
  let colorClass = 'bg-gray-200 dark:bg-gray-700';
  let Medal = Medal3Icon;
  let medalColorClass = 'text-orange-400';
  let orderClass = 'order-3';
  let zIndex = 'z-0';

  if (position === 1) {
    heightClass = 'h-[85%]';
    colorClass = 'bg-gradient-to-t from-yellow-400 to-yellow-300';
    Medal = Medal1Icon;
    medalColorClass = 'text-yellow-500 drop-shadow-sm';
    orderClass = 'order-2';
    zIndex = 'z-10';
  } else if (position === 2) {
    heightClass = 'h-[55%]';
    colorClass = 'bg-gradient-to-t from-gray-300 to-gray-200';
    Medal = Medal2Icon;
    medalColorClass = 'text-gray-400';
    orderClass = 'order-3';
  } else {
    heightClass = 'h-[45%]';
    colorClass = 'bg-gradient-to-t from-orange-400 to-orange-300';
    Medal = Medal3Icon;
    medalColorClass = 'text-orange-600 dark:text-orange-500';
    orderClass = 'order-1';
  }

  return (
    <div
      className={`flex flex-col items-center justify-end w-1/3 ${orderClass} ${zIndex} h-full transition-all duration-500 hover:scale-105`}
    >
      <div className="flex flex-col items-center mb-2 w-full">
        <Medal className={`w-8 h-8 sm:w-12 sm:h-12 mb-1 ${medalColorClass}`} />
        {aluno ? (
          <>
            <span className="font-bold text-gray-800 dark:text-white text-center text-xs sm:text-sm line-clamp-1 w-full px-1">
              {aluno.nome.split(' ')[0]}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-lumi-primary dark:text-lumi-label bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full shadow-sm mt-1 border border-gray-100 dark:border-gray-600 whitespace-nowrap">
              {aluno.emprestimosCount} livros
            </span>
          </>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </div>
      <div
        className={`w-full ${heightClass} ${colorClass} rounded-t-lg shadow-lg flex items-start justify-center pt-2 relative overflow-hidden border-t border-white/20`}
      >
        <span className="text-3xl sm:text-5xl font-black text-white/40 mix-blend-overlay select-none">
          {position}
        </span>
      </div>
    </div>
  );
};

export function ClassificacaoPage() {
  const [isLoading, setIsLoading] = useState(true);

  const [podiumData, setPodiumData] = useState<AlunoRanking[]>([]);
  const [chartData, setChartData] = useState<AlunoRanking[]>([]);
  const [pieDataCurso, setPieDataCurso] = useState<EstatisticaGrafico[]>([]);
  const [pieDataModulo, setPieDataModulo] = useState<EstatisticaGrafico[]>([]);
  const [pieDataTurno, setPieDataTurno] = useState<EstatisticaGrafico[]>([]);

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [modulos, setModulos] = useState<string[]>([]);
  const [filtroCurso, setFiltroCurso] = useState<string>('');
  const [filtroModulo, setFiltroModulo] = useState<string>('');
  const [filtroTurno, setFiltroTurno] = useState<string>('');
  const [filtroPieMobile, setFiltroPieMobile] = useState<
    'curso' | 'modulo' | 'turno'
  >('curso');

  const [chartLimit, setChartLimit] = useState(10);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      setIsLoading(true);
      try {
        const results = await Promise.allSettled([
          buscarRanking(3),
          buscarCursos(),
          buscarModulos(),
          buscarEstatisticasGrafico('curso'),
          buscarEstatisticasGrafico('modulo'),
          buscarEstatisticasGrafico('turno'),
        ]);

        if (results[0].status === 'fulfilled') setPodiumData(results[0].value);
        if (results[1].status === 'fulfilled')
          setCursos(results[1].value.content);
        if (results[2].status === 'fulfilled') setModulos(results[2].value);
        if (results[3].status === 'fulfilled')
          setPieDataCurso(results[3].value);
        if (results[4].status === 'fulfilled')
          setPieDataModulo(results[4].value);
        if (results[5].status === 'fulfilled')
          setPieDataTurno(results[5].value);
      } catch (error) {
        console.error('Erro crítico ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    const updateChartLimit = () => {
      if (chartContainerRef.current) {
        const width = chartContainerRef.current.offsetWidth;
        if (width <= 0) return;

        const calculatedLimit = Math.floor((width - 50) / 32);
        setChartLimit(Math.max(5, Math.min(calculatedLimit, 100)));
      }
    };

    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(updateChartLimit);
    });

    if (chartContainerRef.current) {
      observer.observe(chartContainerRef.current);
      setTimeout(updateChartLimit, 100);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchChartRanking = async () => {
      try {
        const cursoId = filtroCurso ? Number(filtroCurso) : undefined;
        const moduloId = filtroModulo
          ? modulos.indexOf(filtroModulo) + 1
          : undefined;

        let turnoId: number | undefined;
        if (filtroTurno === 'MANHA') turnoId = 1;
        if (filtroTurno === 'TARDE') turnoId = 2;
        if (filtroTurno === 'NOITE') turnoId = 3;
        if (filtroTurno === 'INTEGRAL') turnoId = 4;

        const data = await buscarRanking(
          chartLimit,
          cursoId,
          moduloId,
          turnoId,
        );
        setChartData(data);
      } catch (error) {
        console.error('Erro ao buscar ranking do gráfico', error);
        setChartData([]);
      }
    };

    const timeoutId = setTimeout(fetchChartRanking, 300);
    return () => clearTimeout(timeoutId);
  }, [filtroCurso, filtroModulo, filtroTurno, modulos, chartLimit]);

  const cursoOptions = useMemo(
    () => [
      { label: 'Todos os Cursos', value: '' },
      ...cursos.map((c) => ({ label: c.nome, value: c.id })),
    ],
    [cursos],
  );

  const moduloOptions = useMemo(
    () => [
      { label: 'Todos os Módulos', value: '' },
      ...modulos.map((m) => ({ label: m, value: m })),
    ],
    [modulos],
  );

  const turnoOptions = [
    { label: 'Todos os Turnos', value: '' },
    { label: 'Manhã', value: 'MANHA' },
    { label: 'Tarde', value: 'TARDE' },
    { label: 'Noite', value: 'NOITE' },
    { label: 'Integral', value: 'INTEGRAL' },
  ];

  const pieFilterOptions = [
    { label: 'Por Curso', value: 'curso' },
    { label: 'Por Módulo', value: 'modulo' },
    { label: 'Por Turno', value: 'turno' },
  ];

  if (isLoading) return <LoadingIcon />;

  return (
    <div className="flex flex-col h-full overflow-hidden shadow-lg">
      <div className="flex items-center gap-3 mb-4 shrink-0 select-none px-1">
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
          <CrownIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Classificação dos Leitores
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Acompanhe o desempenho de leitura dos alunos e cursos.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-xl  border border-gray-100 dark:border-gray-700 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Pódio */}
            <div className="flex flex-col h-full min-h-[400px] xl:col-span-5">
              <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2 shrink-0">
                <span className="w-1 h-6 bg-lumi-primary dark:bg-lumi-label rounded-full"></span>
                Pódio dos Maiores Leitores
              </h3>
              <div className="flex-grow bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4 flex items-end justify-center h-96">
                <div className="flex items-end justify-center w-full max-w-lg gap-2 sm:gap-4 h-full">
                  <PodiumItem aluno={podiumData[2]} position={3} />
                  <PodiumItem aluno={podiumData[0]} position={1} />
                  <PodiumItem aluno={podiumData[1]} position={2} />
                </div>
              </div>
            </div>

            {/* Gráficos de Pizza */}
            <div className="flex flex-col h-full min-h-[400px] xl:col-span-7">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 shrink-0">
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <span className="w-1 h-6 bg-lumi-primary dark:bg-lumi-label rounded-full"></span>
                  Distribuição de Empréstimos
                </h3>

                <div className="w-40 self-end sm:self-auto xl:hidden">
                  <CustomSelect
                    value={filtroPieMobile}
                    onChange={(val) => setFiltroPieMobile(val as any)}
                    options={pieFilterOptions}
                    icon={<FilterIcon className="w-4 h-4" />}
                  />
                </div>
              </div>

              <div className="flex-grow h-full">
                {/* Mobile */}
                <div className="xl:hidden h-96">
                  {filtroPieMobile === 'curso' && (
                    <PieChartCard
                      title="Por Curso"
                      data={pieDataCurso}
                      emptyMessage="Sem dados de cursos"
                    />
                  )}
                  {filtroPieMobile === 'modulo' && (
                    <PieChartCard
                      title="Por Módulo"
                      data={pieDataModulo}
                      emptyMessage="Sem dados de módulos"
                    />
                  )}
                  {filtroPieMobile === 'turno' && (
                    <PieChartCard
                      title="Por Turno"
                      data={pieDataTurno}
                      emptyMessage="Sem dados de turnos"
                    />
                  )}
                </div>

                {/* Desktop */}
                <div className="hidden xl:grid grid-cols-3 gap-4 h-96">
                  <PieChartCard
                    title="Por Curso"
                    data={pieDataCurso}
                    emptyMessage="Sem dados"
                  />
                  <PieChartCard
                    title="Por Módulo"
                    data={pieDataModulo}
                    emptyMessage="Sem dados"
                  />
                  <PieChartCard
                    title="Por Turno"
                    data={pieDataTurno}
                    emptyMessage="Sem dados"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* GRÁFICO DE BARRAS */}
          <div className="flex flex-col min-h-[500px]">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
              <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <span className="w-1 h-6 bg-lumi-primary dark:bg-lumi-label rounded-full"></span>
                Top Alunos com Mais Empréstimos
              </h3>

              <div className="flex flex-wrap gap-3 items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 w-full xl:w-auto">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wide mr-1">
                  <FilterIcon className="w-4 h-4" />
                  Filtrar:
                </div>
                <div className="w-full sm:w-48">
                  <CustomSelect
                    value={filtroCurso}
                    onChange={setFiltroCurso}
                    options={cursoOptions}
                    placeholder="Todos os Cursos"
                  />
                </div>
                <div className="w-full sm:w-40">
                  <CustomSelect
                    value={filtroModulo}
                    onChange={setFiltroModulo}
                    options={moduloOptions}
                    placeholder="Todos os Módulos"
                  />
                </div>
                <div className="w-full sm:w-40">
                  <CustomSelect
                    value={filtroTurno}
                    onChange={setFiltroTurno}
                    options={turnoOptions}
                    placeholder="Todos os Turnos"
                  />
                </div>
              </div>
            </div>

            <div className="w-full h-[500px]" ref={chartContainerRef}>
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
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
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      }}
                      itemStyle={{ color: '#374151', fontWeight: 'bold' }}
                      formatter={(value: number) => [
                        `${value} Livros`,
                        'Total Empréstimos',
                      ]}
                    />
                    <Bar
                      dataKey="emprestimosCount"
                      radius={[6, 6, 0, 0]}
                      animationDuration={1500}
                      barSize={40}
                    >
                      {chartData.map((_, index) => {
                        let fillColor =
                          BAR_COLORS[index % BAR_COLORS.length];
                        if (index === 0) fillColor = TOP_3_COLORS[0]; // Ouro
                        if (index === 1) fillColor = TOP_3_COLORS[1]; // Prata
                        if (index === 2) fillColor = TOP_3_COLORS[2]; // Bronze

                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={fillColor}
                            className="hover:opacity-80 transition-opacity cursor-pointer dark:hover:brightness-110"
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                  Nenhum aluno encontrado com os filtros selecionados.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}