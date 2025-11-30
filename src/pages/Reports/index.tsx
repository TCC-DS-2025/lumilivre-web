import { useState, useEffect } from 'react';
import { useRef } from 'react';

import {
  baixarRelatorioPDF,
  type FiltrosRelatorio,
} from '../../services/relatorioService';
import { buscarCursos } from '../../services/cursoService';
import { buscarModulos } from '../../services/moduloService';
import { buscarTurnos } from '../../services/turnoService';
import {
  buscarEnum,
  buscarCdds,
  buscarLivrosParaAdmin,
} from '../../services/livroService';
import { buscarGeneros } from '../../services/generoService';
import { buscarAlunosParaAdmin } from '../../services/alunoService';

import { Modal } from '../../components/Modal';
import { CustomSelect } from '../../components/CustomSelect';
import { CustomDatePicker } from '../../components/CustomDatePicker';
import { SearchableSelect } from '../../components/SearchableSelect';

import { LoadingIcon } from '../../components/LoadingIcon';
import AddIcon from '../../assets/icons/add.svg?react';
import DownloadIcon from '../../assets/icons/upload.svg';
import ReportPaperIcon from '../../assets/icons/report-paper.svg?react';

interface ReportItemProps {
  title: string;
  description: string;
  onGenerate: () => void;
}

interface Option {
  label: string;
  value: string | number;
}

const ReportItem = ({ title, description, onGenerate }: ReportItemProps) => (
  <div className="flex items-center justify-between p-4 border-b last:border-b-0 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:duration-0">
    <div className="flex items-center">
      <div className="p-2 rounded-lg mr-4 bg-gray-100 dark:bg-gray-700">
        <AddIcon className="w-6 h-6 text-lumi-primary dark:text-lumi-label" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
    <button
      onClick={onGenerate}
      className="flex items-center gap-2 font-semibold text-white py-2 px-4 rounded-lg shadow-md bg-lumi-primary hover:bg-lumi-primary-hover transform hover:scale-105 active:scale-95"
    >
      <span>Gerar</span>
    </button>
  </div>
);

interface ModalFiltrosProps {
  isOpen: boolean;
  onClose: () => void;
  tipoRelatorio: 'alunos' | 'livros' | 'exemplares' | 'emprestimos' | null;
  titulo: string;
}

function ModalFiltrosRelatorio({
  isOpen,
  onClose,
  tipoRelatorio,
  titulo,
}: ModalFiltrosProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosRelatorio>({});

  const [cursosOpts, setCursosOpts] = useState<Option[]>([]);
  const [modulosOpts, setModulosOpts] = useState<Option[]>([]);
  const [generosOpts, setGenerosOpts] = useState<Option[]>([]);
  const [turnoOpts, setTurnoOpts] = useState<Option[]>([]);

  const [statusLivroOpts, setStatusLivroOpts] = useState<Option[]>([]);
  const [statusEmpOpts, setStatusEmpOpts] = useState<Option[]>([]);
  const [classificacaoOpts, setClassificacaoOpts] = useState<Option[]>([]);
  const [tipoCapaOpts, setTipoCapaOpts] = useState<Option[]>([]);
  const [penalidadeOpts, setPenalidadeOpts] = useState<Option[]>([]);
  const [cddOpts, setCddOpts] = useState<Option[]>([]);

  const [autoresOpts, setAutoresOpts] = useState<Option[]>([]);
  const [editorasOpts, setEditorasOpts] = useState<Option[]>([]);
  const [livrosSelectOpts, setLivrosSelectOpts] = useState<Option[]>([]);
  const [alunosSelectOpts, setAlunosSelectOpts] = useState<Option[]>([]);

  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen && tipoRelatorio) {
      setFiltros({});
      setIsLoading(false);
      setIsDataLoading(true);

      const carregarDados = async () => {
        try {
          const promises = [];

          if (tipoRelatorio === 'alunos' || tipoRelatorio === 'emprestimos') {
            promises.push(
              buscarCursos().then((res) =>
                setCursosOpts([
                  { label: 'Todos', value: '' },
                  ...res.content.map((c) => ({ label: c.nome, value: c.id })),
                ]),
              ),
            );

            promises.push(
              buscarModulos().then((res) =>
                setModulosOpts([
                  { label: 'Todos', value: '' },
                  ...res.map((m: any) => ({ label: m.nome, value: m.id })),
                ]),
              ),
            );

            promises.push(
              buscarTurnos().then((res) =>
                setTurnoOpts([
                  { label: 'Todos', value: '' },
                  ...res.map((t: any) => ({ label: t.nome, value: t.id })),
                ]),
              ),
            );
          }

          if (tipoRelatorio === 'alunos') {
            promises.push(
              buscarEnum('PENALIDADE').then((res) =>
                setPenalidadeOpts([
                  { label: 'Todas', value: '' },
                  ...res.map((p) => ({ label: p.status, value: p.nome })),
                ]),
              ),
            );
          }

          if (tipoRelatorio === 'livros') {
            promises.push(
              buscarGeneros().then((res) =>
                setGenerosOpts([
                  { label: 'Todos', value: '' },
                  ...res.map((g) => ({ label: g.nome, value: g.nome })),
                ]),
              ),
            );
            promises.push(
              buscarCdds().then((res) =>
                setCddOpts([
                  { label: 'Todos', value: '' },
                  ...res.map((c) => ({
                    label: `${c.id} - ${c.nome}`,
                    value: c.id,
                  })),
                ]),
              ),
            );
            promises.push(
              buscarEnum('CLASSIFICACAO_ETARIA').then((res) =>
                setClassificacaoOpts([
                  { label: 'Todas', value: '' },
                  ...res.map((c) => ({ label: c.status, value: c.nome })),
                ]),
              ),
            );
            promises.push(
              buscarEnum('TIPO_CAPA').then((res) =>
                setTipoCapaOpts([
                  { label: 'Todas', value: '' },
                  ...res.map((t) => ({ label: t.status, value: t.nome })),
                ]),
              ),
            );
          }

          if (tipoRelatorio === 'exemplares') {
            promises.push(
              buscarEnum('STATUS_LIVRO').then((res) =>
                setStatusLivroOpts([
                  { label: 'Todos', value: '' },
                  ...res.map((s) => ({ label: s.status, value: s.nome })),
                ]),
              ),
            );
          }

          if (tipoRelatorio === 'emprestimos') {
            promises.push(
              buscarEnum('STATUS_EMPRESTIMO').then((res) =>
                setStatusEmpOpts([
                  { label: 'Todos', value: '' },
                  ...res.map((s) => ({ label: s.status, value: s.nome })),
                ]),
              ),
            );
          }

          if (['livros', 'exemplares', 'emprestimos'].includes(tipoRelatorio)) {
            promises.push(
              buscarLivrosParaAdmin('', 0, 1000).then((res) => {
                const livrosUnicos = new Map();
                res.content.forEach((l) => {
                  if (l.isbn && !livrosUnicos.has(l.isbn)) {
                    livrosUnicos.set(l.isbn, l.nome);
                  }
                });
                const opts = Array.from(livrosUnicos.entries()).map(
                  ([isbn, nome]) => ({
                    label: `${nome} (ISBN: ${isbn})`,
                    value: isbn,
                  }),
                );
                setLivrosSelectOpts([{ label: 'Todos', value: '' }, ...opts]);

                const autoresUnicos = Array.from(
                  new Set(res.content.map((l) => l.autor).filter(Boolean)),
                ).sort();
                setAutoresOpts([
                  { label: 'Todos', value: '' },
                  ...autoresUnicos.map((a) => ({ label: a, value: a })),
                ]);

                const editorasUnicas = Array.from(
                  new Set(res.content.map((l) => l.editora).filter(Boolean)),
                ).sort();
                setEditorasOpts([
                  { label: 'Todas', value: '' },
                  ...editorasUnicas.map((e) => ({ label: e, value: e })),
                ]);
              }),
            );
          }

          if (tipoRelatorio === 'emprestimos') {
            promises.push(
              buscarAlunosParaAdmin('', 0, 1000).then((res) => {
                const opts = res.content.map((a) => ({
                  label: `${a.nomeCompleto} (Mat: ${a.matricula})`,
                  value: a.matricula,
                }));
                setAlunosSelectOpts([{ label: 'Todos', value: '' }, ...opts]);
              }),
            );
          }

          await Promise.all(promises);
        } catch (error) {
          console.error('Erro ao carregar opções do filtro', error);
        } finally {
          setIsDataLoading(false);
        }
      };
      carregarDados();
    }
  }, [isOpen, tipoRelatorio]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isLoading) {
      setProgress(10);

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            return 90;
          }
          const increment = Math.random() * 15;
          return Math.min(prev + increment, 90);
        });
      }, 800);
    } else {
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleBaixar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipoRelatorio) return;

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      await baixarRelatorioPDF(
        tipoRelatorio,
        filtros,
        abortControllerRef.current.signal,
      );

      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 600));

      onClose();
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        console.log('Download cancelado pelo usuário');
        return;
      }

      console.error(error);
      if (error.response?.status === 404) {
        alert('Nenhum registro encontrado para os filtros selecionados.');
      } else {
        alert(
          'Erro ao gerar o relatório. Verifique se há dados para este período.',
        );
      }
    } finally {
      if (progress !== 100) {
        setIsLoading(false);
      }
    }
  };

  const handleCancelar = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setProgress(0);
  };

  const labelClass =
    'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] pb-10 px-8">
          <div className="transform scale-110">
            <LoadingIcon />
          </div>

          <p className="text-lg font-bold text-lumi-primary dark:text-lumi-label animate-pulse mb-3">
            {progress === 100 ? 'Download Iniciado!' : 'Gerando PDF...'}
          </p>

          <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden mb-6">
            <div
              className="bg-lumi-primary h-2.5 rounded-full duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {progress < 100 && (
            <button
              type="button"
              onClick={handleCancelar}
              className="text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-md"
            >
              Cancelar
            </button>
          )}
        </div>
      );
    }

    if (isDataLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] pb-20">
          <div className="transform scale-110">
            <LoadingIcon />
          </div>
          <p className="text-lg font-semibold text-lumi-primary animate-pulse -mt-12">
            Carregando filtros...
          </p>
        </div>
      );
    }

    return (
      <form onSubmit={handleBaixar} className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-4 border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Deixe em branco os filtros para trazer todos os registros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <CustomDatePicker
            label="Data Início"
            id="dataInicio"
            name="dataInicio"
            value={filtros.dataInicio || ''}
            onChange={handleInputChange}
          />
          <CustomDatePicker
            label="Data Fim"
            id="dataFim"
            name="dataFim"
            value={filtros.dataFim || ''}
            onChange={handleInputChange}
          />
        </div>

        {/* --- FILTROS ESPECÍFICOS --- */}

        {tipoRelatorio === 'alunos' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Curso</label>
                <CustomSelect
                  value={filtros.idCurso || ''}
                  onChange={(val) => handleSelectChange('idCurso', val)}
                  placeholder="Selecione o Curso"
                  options={cursosOpts}
                />
              </div>
              <div>
                <label className={labelClass}>Módulo</label>
                <CustomSelect
                  value={filtros.idModulo || ''}
                  onChange={(val) => handleSelectChange('idModulo', val)}
                  placeholder="Selecione o Módulo"
                  options={modulosOpts}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Turno</label>
                <CustomSelect
                  value={filtros.idTurno || ''}
                  onChange={(val) => handleSelectChange('idTurno', val)}
                  placeholder="Selecione o Turno"
                  options={turnoOpts}
                />
              </div>
              <div>
                <label className={labelClass}>Penalidade</label>
                <CustomSelect
                  value={filtros.penalidade || ''}
                  onChange={(val) => handleSelectChange('penalidade', val)}
                  placeholder="Selecione a Penalidade"
                  options={penalidadeOpts}
                />
              </div>
            </div>
          </>
        )}

        {tipoRelatorio === 'livros' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableSelect
                label="Gênero"
                value={filtros.genero || ''}
                onChange={(val) => handleSelectChange('genero', val)}
                options={generosOpts}
              />
              <SearchableSelect
                label="Autor"
                value={filtros.autor || ''}
                onChange={(val) => handleSelectChange('autor', val)}
                options={autoresOpts}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableSelect
                label="Editora"
                value={filtros.editora || ''}
                onChange={(val) => handleSelectChange('editora', val)}
                options={editorasOpts}
              />
              <SearchableSelect
                label="CDD"
                value={filtros.cdd || ''}
                onChange={(val) => handleSelectChange('cdd', val)}
                options={cddOpts}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Classificação</label>
                <CustomSelect
                  value={filtros.classificacaoEtaria || ''}
                  onChange={(val) =>
                    handleSelectChange('classificacaoEtaria', val)
                  }
                  options={classificacaoOpts}
                />
              </div>
              <div>
                <label className={labelClass}>Capa</label>
                <CustomSelect
                  value={filtros.tipoCapa || ''}
                  onChange={(val) => handleSelectChange('tipoCapa', val)}
                  placeholder="Selecione o Tipo da Capa"
                  options={tipoCapaOpts}
                />
              </div>
            </div>
          </>
        )}

        {tipoRelatorio === 'exemplares' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status do Exemplar</label>
              <CustomSelect
                value={filtros.statusLivro || ''}
                onChange={(val) => handleSelectChange('statusLivro', val)}
                options={statusLivroOpts}
              />
            </div>
            <SearchableSelect
              label="Livro (Nome ou ISBN)"
              value={filtros.isbnOuTombo || ''}
              onChange={(val) => handleSelectChange('isbnOuTombo', val)}
              options={livrosSelectOpts}
            />
          </div>
        )}

        {tipoRelatorio === 'emprestimos' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Status</label>
                <CustomSelect
                  value={filtros.statusEmprestimo || ''}
                  onChange={(val) =>
                    handleSelectChange('statusEmprestimo', val)
                  }
                  options={statusEmpOpts}
                />
              </div>
              <div>
                <label className={labelClass}>Curso</label>
                <CustomSelect
                  value={filtros.idCurso || ''}
                  onChange={(val) => handleSelectChange('idCurso', val)}
                  placeholder="Selecione o Curso"
                  options={cursosOpts}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableSelect
                label="Aluno (Nome ou Matrícula)"
                value={filtros.matriculaAluno || ''}
                onChange={(val) => handleSelectChange('matriculaAluno', val)}
                options={alunosSelectOpts}
              />
              <SearchableSelect
                label="Livro (Nome ou ISBN)"
                value={filtros.isbnOuTombo || ''}
                onChange={(val) => handleSelectChange('isbnOuTombo', val)}
                options={livrosSelectOpts}
              />
            </div>
          </>
        )}

        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform active:scale-95"
          >
            <img
              src={DownloadIcon}
              className="w-5 h-5 invert brightness-0"
              alt=""
            />
            <span>Baixar PDF</span>
          </button>
        </div>
      </form>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo}>
      {renderContent()}
    </Modal>
  );
}

export function RelatoriosPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{
    type: 'alunos' | 'livros' | 'exemplares' | 'emprestimos';
    title: string;
  } | null>(null);

  const handleOpenModal = (
    type: 'alunos' | 'livros' | 'exemplares' | 'emprestimos',
    title: string,
  ) => {
    setSelectedReport({ type, title });
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6 shrink-0 select-none">
        <div className="p-2 bg-lumi-primary/10 dark:bg-lumi-primary/20 rounded-full">
          <ReportPaperIcon className="w-8 h-8 text-lumi-primary dark:text-lumi-label" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Central de Relatórios
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Selecione um tipo de relatório, aplique filtros e baixe o PDF.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow overflow-y-auto border border-gray-100 dark:border-gray-700">
        <div className="p-6">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <ReportItem
              title="Relatório de Alunos"
              description="Lista de alunos com filtros por curso, módulo, turno, penalidade e data de inclusão."
              onGenerate={() =>
                handleOpenModal('alunos', 'Relatório de Alunos')
              }
            />
            <ReportItem
              title="Relatório de Livros"
              description="Catálogo de livros com filtros por gênero, autor, editora, CDD, capa e data de lançamento."
              onGenerate={() =>
                handleOpenModal('livros', 'Relatório de Livros')
              }
            />
            <ReportItem
              title="Relatório de Exemplares"
              description="Inventário físico com filtros por status, livro e data de inclusão."
              onGenerate={() =>
                handleOpenModal('exemplares', 'Relatório de Exemplares')
              }
            />
            <ReportItem
              title="Relatório de Empréstimos"
              description="Histórico de movimentações com filtros por período, status, aluno e livro."
              onGenerate={() =>
                handleOpenModal('emprestimos', 'Relatório de Empréstimos')
              }
            />
          </div>
        </div>
      </div>

      <ModalFiltrosRelatorio
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tipoRelatorio={selectedReport?.type || null}
        titulo={selectedReport?.title || ''}
      />
    </div>
  );
}
