import { useState, useEffect } from 'react';
import {
  baixarRelatorioPDF,
  type FiltrosRelatorio,
} from '../../services/relatorioService';

import { buscarCursos, type Curso } from '../../services/cursoService';
import { buscarModulos } from '../../services/moduloService';
import { buscarEnum } from '../../services/livroService';
import { Modal } from '../../components/Modal';
import { LoadingIcon } from '../../components/LoadingIcon';

import AddIcon from '../../assets/icons/add.svg?react';
import DownloadIcon from '../../assets/icons/upload.svg';

const ReportItem = ({
  title,
  description,
  onGenerate,
}: {
  title: string;
  description: string;
  onGenerate: () => void;
}) => (
  <div className="flex items-center justify-between p-4 border-b last:border-b-0 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200">
    <div className="flex items-center">
      <div className="p-2 rounded-lg mr-4">
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
      className="flex items-center gap-2 font-semibold text-white py-2 px-4 rounded-lg shadow-md bg-lumi-primary hover:bg-lumi-primary-hover transition-all duration-200 transform hover:scale-105 active:scale-95"
    >
      <span>Gerar</span>
    </button>
  </div>
);

// filtros
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
  const [filtros, setFiltros] = useState<FiltrosRelatorio>({});

  // opções de select
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [modulos, setModulos] = useState<string[]>([]);
  const [statusLivroOpts, setStatusLivroOpts] = useState<any[]>([]);
  const [statusEmpOpts, setStatusEmpOpts] = useState<any[]>([]);
  const [classificacaoOpts, setClassificacaoOpts] = useState<any[]>([]);
  const [tipoCapaOpts, setTipoCapaOpts] = useState<any[]>([]);
  const [penalidadeOpts, setPenalidadeOpts] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFiltros({});
      setIsLoading(false);

      const carregarDados = async () => {
        try {
          if (tipoRelatorio === 'alunos' || tipoRelatorio === 'emprestimos') {
            const [cursosRes, modulosRes] = await Promise.all([
              buscarCursos(),
              buscarModulos(),
            ]);
            setCursos(cursosRes.content);
            setModulos(modulosRes);
          }

          if (tipoRelatorio === 'alunos') {
            const pen = await buscarEnum('PENALIDADE');
            setPenalidadeOpts(pen);
          }

          if (tipoRelatorio === 'livros') {
            const [classif, capas] = await Promise.all([
              buscarEnum('CLASSIFICACAO_ETARIA'),
              buscarEnum('TIPO_CAPA'),
            ]);
            setClassificacaoOpts(classif);
            setTipoCapaOpts(capas);
          }

          if (tipoRelatorio === 'exemplares') {
            const status = await buscarEnum('STATUS_LIVRO');
            setStatusLivroOpts(status);
          }

          if (tipoRelatorio === 'emprestimos') {
            const status = await buscarEnum('STATUS_EMPRESTIMO');
            setStatusEmpOpts(status);
          }
        } catch (error) {
          console.error('Erro ao carregar opções do filtro', error);
        }
      };
      carregarDados();
    }
  }, [isOpen, tipoRelatorio]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleBaixar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipoRelatorio) return;

    setIsLoading(true);
    try {
      await baixarRelatorioPDF(tipoRelatorio, filtros);
      onClose();
    } catch (error) {
      alert('Erro ao gerar o relatório. Tente novamente.');
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary outline-none transition-all';
  const labelClass =
    'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] pb-20">
          <div className="transform scale-110">
            <LoadingIcon />
          </div>
          <p className="text-lg font-semibold text-lumi-primary animate-pulse -mt-12">
            Gerando PDF, aguarde...
          </p>
        </div>
      );
    }

    return (
      <form onSubmit={handleBaixar} className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Deixe em branco os filtros para trazer todos os registros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <label className={labelClass}>Data Início</label>
            <input
              type="date"
              name="dataInicio"
              value={filtros.dataInicio || ''}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Data Fim</label>
            <input
              type="date"
              name="dataFim"
              value={filtros.dataFim || ''}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        {/* --- FILTROS ESPECÍFICOS --- */}

        {/* ALUNOS */}
        {tipoRelatorio === 'alunos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Curso</label>
              <select
                name="idCurso"
                value={filtros.idCurso || ''}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Todos</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Módulo</label>
              <select
                name="idModulo"
                value={filtros.idModulo || ''}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Todos</option>
                {modulos.map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    {m}
                  </option>
                ))}{' '}
              </select>
            </div>
            <div>
              <label className={labelClass}>Penalidade</label>
              <select
                name="penalidade"
                value={filtros.penalidade || ''}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Todas</option>
                {penalidadeOpts.map((p) => (
                  <option key={p.nome} value={p.nome}>
                    {p.status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* LIVROS */}
        {tipoRelatorio === 'livros' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Gênero</label>
              <input
                type="text"
                name="genero"
                placeholder="Ex: Romance"
                value={filtros.genero || ''}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Autor</label>
              <input
                type="text"
                name="autor"
                placeholder="Nome do autor"
                value={filtros.autor || ''}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Código CDD</label>
              <input
                type="text"
                name="cdd"
                placeholder="Ex: 800"
                value={filtros.cdd || ''}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Classificação Etária</label>
              <select
                name="classificacaoEtaria"
                value={filtros.classificacaoEtaria || ''}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Todas</option>
                {classificacaoOpts.map((c) => (
                  <option key={c.nome} value={c.nome}>
                    {c.status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tipo de Capa</label>
              <select
                name="tipoCapa"
                value={filtros.tipoCapa || ''}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Todas</option>
                {tipoCapaOpts.map((t) => (
                  <option key={t.nome} value={t.nome}>
                    {t.status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* EXEMPLARES */}
        {tipoRelatorio === 'exemplares' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status do Exemplar</label>
              <select
                name="statusLivro"
                value={filtros.statusLivro || ''}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Todos</option>
                {statusLivroOpts.map((s) => (
                  <option key={s.nome} value={s.nome}>
                    {s.status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>ISBN ou Tombo</label>
              <input
                type="text"
                name="isbnOuTombo"
                placeholder="Pesquisar..."
                value={filtros.isbnOuTombo || ''}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* EMPRÉSTIMOS */}
        {tipoRelatorio === 'emprestimos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select
                name="statusEmprestimo"
                value={filtros.statusEmprestimo || ''}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Todos</option>
                {statusEmpOpts.map((s) => (
                  <option key={s.nome} value={s.nome}>
                    {s.status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Matrícula do Aluno</label>
              <input
                type="text"
                name="matriculaAluno"
                placeholder="Ex: 12345"
                value={filtros.matriculaAluno || ''}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Curso</label>
              <select
                name="idCurso"
                value={filtros.idCurso || ''}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Todos</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>ISBN ou Tombo</label>
              <input
                type="text"
                name="isbnOuTombo"
                placeholder="Pesquisar..."
                value={filtros.isbnOuTombo || ''}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200"
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Central de Relatórios
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Selecione um tipo de relatório, aplique filtros e baixe o PDF.
        </p>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md flex-grow overflow-y-auto">
        <div className="p-6">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <ReportItem
              title="Relatório de Alunos"
              description="Lista de alunos com filtros por curso, módulo, turno, penalidade e data de inclusão."
              onGenerate={() =>
                handleOpenModal('alunos', 'Relatório de Alunos')
              }
            />
            <ReportItem
              title="Relatório de Livros"
              description="Catálogo de livros com filtros por gênero, autor, CDD, capa e data de inclusão."
              onGenerate={() =>
                handleOpenModal('livros', 'Relatório de Livros')
              }
            />
            <ReportItem
              title="Relatório de Exemplares"
              description="Inventário físico com filtros por status, tombo e data de inclusão."
              onGenerate={() =>
                handleOpenModal('exemplares', 'Relatório de Exemplares')
              }
            />
            <ReportItem
              title="Relatório de Empréstimos"
              description="Histórico de movimentações com filtros por período, status e aluno."
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
