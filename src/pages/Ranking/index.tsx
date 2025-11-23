import { useState, useEffect } from 'react';
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

// Importamos a função genérica buscarEstatisticasGrafico daqui
import {
  buscarCursos,
  buscarEstatisticasGrafico, 
  type EstatisticaGrafico,
  type Curso,
} from '../../services/cursoService';

import { buscarModulos } from '../../services/moduloService';

import { LoadingIcon } from '../../components/LoadingIcon';

// Ícones
import CrownIcon from '../../assets/icons/crown.svg?react';
import Medal1Icon from '../../assets/icons/medal1.svg?react';
import Medal2Icon from '../../assets/icons/medal2.svg?react';
import Medal3Icon from '../../assets/icons/medal3.svg?react';
import FilterIcon from '../../assets/icons/filter.svg?react';

export function ClassificacaoPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Dados
  const [podiumData, setPodiumData] = useState<AlunoRanking[]>([]); // Sempre fixo
  const [chartData, setChartData] = useState<AlunoRanking[]>([]); // Filtrável
  const [pieData, setPieData] = useState<EstatisticaGrafico[]>([]);

  // Listas para os selects
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [modulos, setModulos] = useState<string[]>([]);

  // Filtros do Gráfico de Barras
  const [filtroCurso, setFiltroCurso] = useState<string>('');
  const [filtroModulo, setFiltroModulo] = useState<string>('');
  const [filtroTurno, setFiltroTurno] = useState<string>('');

  // Filtro do Gráfico de Pizza
  const [filtroPieTipo, setFiltroPieTipo] = useState<'curso' | 'modulo' | 'turno'>('curso');

  // Responsividade do Gráfico de Barras
  const [chartLimit, setChartLimit] = useState(15);

  // Cores
  const barColors = ['#762075', '#9b2c9a', '#bf3abf', '#d65ad6', '#e085e0'];
  const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff6b6b', '#4ecdc4'];

  // 1. Carregamento Inicial
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      setIsLoading(true);
      try {
        const [cursosRes, modulosRes, podiumRes] = await Promise.all([
          buscarCursos(),
          buscarModulos(),
          buscarRanking(3) // Busca apenas os top 3 globais para o pódio fixo
        ]);
        setCursos(cursosRes.content);
        setModulos(modulosRes);
        setPodiumData(podiumRes);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais', error);
      } finally {
        setIsLoading(false);
      }
    };
    carregarDadosIniciais();
  }, []);

  // 2. Responsividade do Gráfico de Barras
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setChartLimit(5);       // Mobile
      else if (width < 1024) setChartLimit(10); // Tablet
      else if (width < 1440) setChartLimit(15); // Laptop
      else setChartLimit(25);                   // Desktop Grande
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Busca do Gráfico de Barras (Filtros + Responsividade)
  useEffect(() => {
    const fetchChartRanking = async () => {
      try {
        const cursoId = filtroCurso ? Number(filtroCurso) : undefined;
        const moduloId = filtroModulo ? modulos.indexOf(filtroModulo) + 1 : undefined;
        
        let turnoId: number | undefined;
        if (filtroTurno === 'MANHA') turnoId = 1;
        if (filtroTurno === 'TARDE') turnoId = 2;
        if (filtroTurno === 'NOITE') turnoId = 3;
        if (filtroTurno === 'INTEGRAL') turnoId = 4;

        const data = await buscarRanking(chartLimit, cursoId, moduloId, turnoId);
        setChartData(data);
      } catch (error) {
        console.error('Erro ao buscar ranking do gráfico', error);
      }
    };

    fetchChartRanking();
  }, [filtroCurso, filtroModulo, filtroTurno, modulos, chartLimit]);

  // 4. Busca do Gráfico de Pizza (Usando seu service genérico)
  useEffect(() => {
    const carregarDadosPizza = async () => {
      try {
        // Usa a função que já existe no cursoService que aceita 'curso' | 'modulo' | 'turno'
        const dados = await buscarEstatisticasGrafico(filtroPieTipo);
        setPieData(dados);
      } catch (error) {
        console.error('Erro ao carregar estatísticas do gráfico de pizza:', error);
        setPieData([]);
      }
    };
    carregarDadosPizza();
  }, [filtroPieTipo]);

  // Componente do Pódio
  const PodiumItem = ({ aluno, position }: { aluno?: AlunoRanking; position: 1 | 2 | 3 }) => {
    if (!aluno) return <div className="w-1/3"></div>;

    let heightClass = 'h-32';
    let colorClass = 'bg-gray-200 dark:bg-gray-700';
    let Medal = Medal3Icon;
    let medalColorClass = 'text-orange-400'; 
    let orderClass = 'order-2';
    
    if (position === 1) {
      heightClass = 'h-40';
      colorClass = 'bg-gradient-to-t from-yellow-400 to-yellow-300';
      Medal = Medal1Icon;
      medalColorClass = 'text-yellow-500 drop-shadow-sm';
      orderClass = 'order-2 -mt-12 z-10';
    } else if (position === 2) {
      heightClass = 'h-28';
      colorClass = 'bg-gradient-to-t from-gray-300 to-gray-200';
      Medal = Medal2Icon;
      medalColorClass = 'text-gray-400';
      orderClass = 'order-3';
    } else {
      heightClass = 'h-20';
      colorClass = 'bg-gradient-to-t from-orange-300 to-orange-200';
      Medal = Medal3Icon;
      medalColorClass = 'text-orange-500';
      orderClass = 'order-1';
    }

    return (
      <div className={`flex flex-col items-center justify-end w-1/3 ${orderClass} transition-all duration-500 ease-out hover:scale-105`}>
        <div className="flex flex-col items-center mb-3">
          <Medal className={`w-12 h-12 mb-2 ${medalColorClass}`} />
          
          <span className="font-bold text-gray-800 dark:text-white text-center line-clamp-1 px-1 text-sm sm:text-base">
            {aluno.nome.split(' ')[0]} {aluno.nome.split(' ').pop()}
          </span>
          <span className="text-xs font-bold text-lumi-primary dark:text-lumi-label bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full shadow-sm mt-1 border border-gray-100 dark:border-gray-600">
            {aluno.emprestimosCount} livros
          </span>
        </div>
        <div className={`w-full ${heightClass} ${colorClass} rounded-t-xl shadow-lg flex items-start justify-center pt-2 relative overflow-hidden border-t border-white/20`}>
          <span className="text-5xl font-black text-white/40 mix-blend-overlay select-none">
            {position}
          </span>
        </div>
      </div>
    );
  };

  const selectStyles =
    'p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-lumi-primary outline-none transition-all shadow-sm cursor-pointer';

  if (isLoading) return <LoadingIcon />;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      <div className="flex items-center gap-3 mb-4 shrink-0 select-none px-1">
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full transition-all duration-200">
          <CrownIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Classificação dos Leitores da Instituição
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Acompanhe o desempenho de leitura dos alunos e cursos.
          </p>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 pb-4">
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 flex flex-col gap-8 transition-all duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[400px]">
            {/* Pódio */}
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-lumi-primary dark:bg-lumi-label rounded-full"></span>
                Pódio dos Maiores Leitores
              </h3>
              <div className="flex-grow flex items-end justify-center pb-4 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex items-end justify-center w-full max-w-lg gap-2 sm:gap-4">
                  <PodiumItem aluno={podiumData[1]} position={2} />
                  <PodiumItem aluno={podiumData[0]} position={1} />
                  <PodiumItem aluno={podiumData[2]} position={3} />
                </div>
              </div>
            </div>

            {/* Gráfico de Pizza */}
            <div className="flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <span className="w-1 h-6 bg-lumi-primary dark:bg-lumi-label rounded-full"></span>
                  Total de Empréstimos
                </h3>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <FilterIcon className="w-4 h-4 text-gray-400" />
                  <select
                    value={filtroPieTipo}
                    onChange={(e) => setFiltroPieTipo(e.target.value as any)}
                    className={selectStyles}
                  >
                    <option value="curso">Por Curso</option>
                    <option value="modulo">Por Módulo</option>
                    <option value="turno">Por Turno</option>
                  </select>
                </div>
              </div>

              <div className="flex-grow bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 relative flex items-center justify-center">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData as any[]}
                        dataKey="total"
                        nameKey="nome"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={5}
                        label={({ percent = 0 }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} stroke="none" />
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
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <span className="text-lg">Sem dados estatísticos</span>
                    <span className="text-sm">Tente mudar o filtro ou cadastrar empréstimos.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Gráfico de Barras */}
          <div className="flex flex-col min-h-[450px]">
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

                <select
                  value={filtroCurso}
                  onChange={(e) => setFiltroCurso(e.target.value)}
                  className={`${selectStyles} flex-grow xl:flex-grow-0`}
                >
                  <option value="">Todos os Cursos</option>
                  {cursos.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>

                <select
                  value={filtroModulo}
                  onChange={(e) => setFiltroModulo(e.target.value)}
                  className={`${selectStyles} flex-grow xl:flex-grow-0`}
                >
                  <option value="">Todos os Módulos</option>
                  {modulos.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <select
                  value={filtroTurno}
                  onChange={(e) => setFiltroTurno(e.target.value)}
                  className={`${selectStyles} flex-grow xl:flex-grow-0`}
                >
                  <option value="">Todos os Turnos</option>
                  <option value="MANHA">Manhã</option>
                  <option value="TARDE">Tarde</option>
                  <option value="NOITE">Noite</option>
                  <option value="INTEGRAL">Integral</option>
                </select>
              </div>
            </div>

            <div className="flex-grow w-full h-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
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
                      formatter={(value: number) => [`${value} Livros`, 'Total Empréstimos']}
                    />
                    <Bar
                      dataKey="emprestimosCount"
                      radius={[6, 6, 0, 0]}
                      animationDuration={1500}
                      barSize={40}
                    >
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index < 3 ? '#fbbf24' : barColors[index % barColors.length]}
                          className="hover:opacity-80 transition-opacity cursor-pointer dark:hover:brightness-110"
                        />
                      ))}
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