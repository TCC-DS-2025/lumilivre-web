import { useState, useEffect, useMemo } from 'react';

import { Modal } from '../Modal';
import { useToast } from '../../contexts/ToastContext';
import {
  excluirTcc,
  atualizarTcc,
  type TccResponse,
  type TccPayload,
} from '../../services/tccService';
import { useCursos } from '../../hooks/useCommonQueries';
import { CustomSelect } from '../CustomSelect';
import DownloadIcon from '../../assets/icons/upload.svg?react';
import UploadIcon from '../../assets/icons/upload.svg';

interface ModalTccDetailsProps {
  tcc: TccResponse | null;
  isOpen: boolean;
  onClose: (foiAlterado?: boolean) => void;
}

export function ModalTccDetails({
  tcc,
  isOpen,
  onClose,
}: ModalTccDetailsProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState<Partial<TccPayload>>({});
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const { data: cursosList } = useCursos();

  const cursosOptions = useMemo(() => {
    return (cursosList || []).map((c) => ({
      label: c.nome,
      value: c.id,
    }));
  }, [cursosList]);

  const semestreOptions = [
    { label: '1º Semestre', value: '1' },
    { label: '2º Semestre', value: '2' },
  ];

  useEffect(() => {
    if (tcc && isOpen) {
      setIsEditMode(false);
      setPdfFile(null);
      setFotoFile(null);

      // @ts-ignore
      setFotoPreview(tcc.foto || null);

      const cursoEncontrado = cursosList?.find((c) => c.nome === tcc.curso);

      setFormData({
        titulo: tcc.titulo,
        alunos: tcc.alunos,
        orientadores: tcc.orientadores,
        curso_id: cursoEncontrado ? cursoEncontrado.id : 0,
        anoConclusao: tcc.anoConclusao,
        semestreConclusao: tcc.semestreConclusao,
        linkExterno: tcc.linkExterno || '',
        ativo: tcc.ativo,
      });
    }
  }, [tcc, isOpen, cursosList]);

  if (!isOpen || !tcc) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        addToast({
          type: 'warning',
          title: 'Formato inválido',
          description: 'Selecione um PDF.',
        });
        return;
      }
      setPdfFile(file);
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSalvar = async () => {
    if (!formData.titulo || !formData.alunos || !formData.curso_id) {
      addToast({
        type: 'warning',
        title: 'Campos obrigatórios',
        description: 'Preencha Título, Alunos e Curso.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await atualizarTcc(tcc.id, formData as TccPayload, pdfFile, fotoFile);
      addToast({
        type: 'success',
        title: 'Sucesso',
        description: 'TCC atualizado!',
      });
      onClose(true);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao atualizar.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcluir = async () => {
    if (
      window.confirm(`Tem certeza que deseja excluir o TCC "${tcc.titulo}"?`)
    ) {
      setIsLoading(true);
      try {
        await excluirTcc(tcc.id);
        addToast({
          type: 'success',
          title: 'Sucesso',
          description: 'TCC excluído!',
        });
        onClose(true);
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Erro',
          description: 'Erro ao excluir TCC.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownload = () => {
    if (tcc.arquivoPdf) window.open(tcc.arquivoPdf, '_blank');
  };

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1';
  const inputStyles =
    'w-full h-[38px] px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary outline-none text-sm';
  const disabledStyles =
    'text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 p-2 rounded-md border border-gray-200 dark:border-gray-600 min-h-[38px] flex items-center';

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title={isEditMode ? 'Editar TCC' : 'Detalhes do TCC'}
    >
      <div className="flex flex-col h-full max-h-[600px]">
        <div className="overflow-y-auto p-1 flex-grow custom-scrollbar pr-2 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-[28%] flex flex-col items-center space-y-4 pt-1">
              <div className="w-[9.5rem] h-[14rem] bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-600 relative group shrink-0">
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Capa TCC"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-gray-500 text-center p-2">
                    Capa do TCC
                  </span>
                )}

                {isEditMode && (
                  <>
                    <label
                      htmlFor="fotoFileEdit"
                      className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <img
                        src={UploadIcon}
                        alt="Upload"
                        className="h-8 w-8 invert mb-1"
                      />
                      <span className="text-white text-xs font-bold">
                        Trocar Imagem
                      </span>
                    </label>
                    <input
                      id="fotoFileEdit"
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="w-full md:w-[72%] space-y-4">
              <div>
                <label className={labelStyles}>Título</label>
                {isEditMode ? (
                  <input
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    className={inputStyles}
                  />
                ) : (
                  <div className={`${disabledStyles} font-bold`}>
                    {tcc.titulo}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyles}>Alunos</label>
                  {isEditMode ? (
                    <input
                      name="alunos"
                      value={formData.alunos}
                      onChange={handleChange}
                      className={inputStyles}
                    />
                  ) : (
                    <div className={disabledStyles}>{tcc.alunos}</div>
                  )}
                </div>
                <div>
                  <label className={labelStyles}>Orientadores</label>
                  {isEditMode ? (
                    <input
                      name="orientadores"
                      value={formData.orientadores}
                      onChange={handleChange}
                      className={inputStyles}
                    />
                  ) : (
                    <div className={disabledStyles}>
                      {tcc.orientadores || '-'}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelStyles}>Curso</label>
                  {isEditMode ? (
                    <CustomSelect
                      value={formData.curso_id || ''}
                      onChange={(val) =>
                        handleSelectChange('curso_id', Number(val))
                      }
                      options={cursosOptions}
                      placeholder="Selecione"
                    />
                  ) : (
                    <div className={disabledStyles}>{tcc.curso}</div>
                  )}
                </div>
                <div>
                  <label className={labelStyles}>Ano</label>
                  {isEditMode ? (
                    <input
                      name="anoConclusao"
                      type="number"
                      value={formData.anoConclusao}
                      onChange={handleChange}
                      className={inputStyles}
                    />
                  ) : (
                    <div className={disabledStyles}>{tcc.anoConclusao}</div>
                  )}
                </div>
                <div>
                  <label className={labelStyles}>Semestre</label>
                  {isEditMode ? (
                    <CustomSelect
                      value={formData.semestreConclusao || ''}
                      onChange={(val) =>
                        handleSelectChange('semestreConclusao', val)
                      }
                      options={semestreOptions}
                      placeholder="Selecione"
                    />
                  ) : (
                    <div className={disabledStyles}>
                      {tcc.semestreConclusao}º
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={labelStyles}>Link Externo</label>
                {isEditMode ? (
                  <input
                    name="linkExterno"
                    value={formData.linkExterno}
                    onChange={handleChange}
                    className={inputStyles}
                  />
                ) : tcc.linkExterno ? (
                  <a
                    href={tcc.linkExterno}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-lumi-primary hover:underline break-all block p-2"
                  >
                    {tcc.linkExterno}
                  </a>
                ) : (
                  <div className={disabledStyles}>-</div>
                )}
              </div>

              {isEditMode ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50">
                  <img
                    src={UploadIcon}
                    alt="Upload"
                    className="w-8 h-8 mb-2 opacity-50 dark:invert"
                  />
                  <label
                    htmlFor="pdfFileEdit"
                    className="cursor-pointer text-lumi-primary font-bold hover:underline text-sm"
                  >
                    {pdfFile
                      ? pdfFile.name
                      : 'Clique para substituir o PDF (Opcional)'}
                  </label>
                  <input
                    id="pdfFileEdit"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : tcc.arquivoPdf ? (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                  <span className="text-green-800 dark:text-green-200 font-medium text-sm">
                    Arquivo PDF disponível
                  </span>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-bold shadow-sm"
                  >
                    <DownloadIcon className="w-4 h-4 text-white" /> Baixar
                  </button>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-gray-500 text-sm">
                  Nenhum arquivo PDF anexado.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <button
            onClick={handleExcluir}
            disabled={isLoading || isEditMode}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 shadow-md"
          >
            Excluir
          </button>

          {isEditMode ? (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditMode(false)}
                disabled={isLoading}
                className="text-gray-600 dark:text-gray-400 font-bold py-2 px-4 hover:underline"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                disabled={isLoading}
                className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 disabled:bg-gray-400 shadow-md"
              >
                {isLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              className="bg-lumi-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-lumi-primary-hover shadow-md"
            >
              Editar
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
