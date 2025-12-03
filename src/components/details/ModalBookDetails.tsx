import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../Modal';

import {
  atualizarLivro,
  excluirLivroComExemplares,
  buscarLivroPorId,
  buscarLivrosParaAdmin,
  type LivroAgrupado,
  type LivroPayload,
} from '../../services/livroService';

import { useCdds, useEnum, useGeneros } from '../../hooks/useCommonQueries';
import { useToast } from '../../contexts/ToastContext';
import { CustomSelect } from '../CustomSelect';
import { SearchableSelect } from '../SearchableSelect';
import { CustomDatePicker } from '../CustomDatePicker';

import uploadIconUrl from '../../assets/icons/download.svg';
import closeIcon from '../../assets/icons/close.svg';

interface DetalhesLivroModalProps {
  livro: LivroAgrupado | null;
  isOpen: boolean;
  onClose: (foiAtualizado?: boolean) => void;
}

interface FormDataState extends Omit<Partial<LivroPayload>, 'generos'> {
  generos?: string[];
}

export function DetalhesLivroModal({
  livro,
  isOpen,
  onClose,
}: DetalhesLivroModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [foiAtualizado, setFoiAtualizado] = useState(false);
  const [livroVisualizado, setLivroVisualizado] =
    useState<LivroAgrupado | null>(null);

  const { addToast } = useToast();

  const [initialData, setInitialData] = useState<FormDataState>({});
  const [formData, setFormData] = useState<FormDataState>({});

  const [capaFile, setCapaFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);

  const [isNovoAutor, setIsNovoAutor] = useState(false);
  const [isNovaEditora, setIsNovaEditora] = useState(false);

  const { data: cddData } = useCdds();
  const { data: classificacaoData } = useEnum('CLASSIFICACAO_ETARIA');
  const { data: tipoCapaData } = useEnum('TIPO_CAPA');
  const { data: generosData } = useGeneros();

  const { data: livrosData } = useQuery({
    queryKey: ['livros-auxiliares'],
    queryFn: () => buscarLivrosParaAdmin('', 0, 1000),
    staleTime: 1000 * 60 * 10,
    enabled: isOpen,
  });

  const cddOptions = useMemo(() => {
    return (
      cddData?.map((c) => ({
        label: `${c.id} - ${c.nome}`,
        value: String(c.id),
      })) || []
    );
  }, [cddData]);

  const classificacaoOptions = useMemo(() => {
    return (
      classificacaoData?.map((c) => ({
        label: c.status,
        value: c.nome,
      })) || []
    );
  }, [classificacaoData]);

  const tipoCapaOptions = useMemo(() => {
    return (
      tipoCapaData?.map((c) => ({
        label: c.status,
        value: c.nome,
      })) || []
    );
  }, [tipoCapaData]);

  const generosOptions = useMemo(() => {
    return (
      generosData?.map((g) => ({
        label: g.nome,
        value: g.nome,
      })) || []
    );
  }, [generosData]);

  const autoresOptions = useMemo(() => {
    const autoresSet = new Set(
      livrosData?.content?.map((l) => l.autor).filter(Boolean) || [],
    );

    if (formData.autor) {
      autoresSet.add(formData.autor);
    }

    return Array.from(autoresSet)
      .sort()
      .map((a) => ({ label: a, value: a }));
  }, [livrosData, formData.autor]);

  const editorasOptions = useMemo(() => {
    if (!livrosData?.content) return [];
    const editorasUnicas = Array.from(
      new Set(livrosData.content.map((l) => l.editora).filter(Boolean)),
    ).sort();
    return editorasUnicas.map((e) => ({ label: e, value: e }));
  }, [livrosData]);

  useEffect(() => {
    if (livro) {
      setLivroVisualizado(livro);
    }
  }, [livro]);

  useEffect(() => {
    const carregarDetalhesDoLivro = async () => {
      if (livroVisualizado && isOpen) {
        setIsLoading(true);
        setFormData({});
        setCapaFile(null);
        try {
          const response = await buscarLivroPorId(livroVisualizado.id);

          if (response.data) {
            const dadosCompletos = response.data;

            if (dadosCompletos.data_lancamento) {
              dadosCompletos.data_lancamento =
                dadosCompletos.data_lancamento.split('T')[0];
            }

            const nomesDosGeneros = dadosCompletos.generos || [];

            const dadosParaForm = {
              ...dadosCompletos,
              cdd: dadosCompletos.cddCodigo
                ? String(dadosCompletos.cddCodigo)
                : '',
              tipo_capa: dadosCompletos.tipoCapaRaw
                ? String(dadosCompletos.tipoCapaRaw)
                : '',
              classificacao_etaria: dadosCompletos.classificacaoEtariaRaw
                ? String(dadosCompletos.classificacaoEtariaRaw)
                : '',
              generos: nomesDosGeneros,
              autor: dadosCompletos.autor || '',
            };

            // @ts-ignore
            setInitialData(dadosParaForm);
            // @ts-ignore
            setFormData(dadosParaForm);

            setImagemPreview(dadosCompletos.imagem || null);
          }
        } catch (error) {
          console.error('Erro ao buscar detalhes do livro:', error);
          // @ts-ignore
          const fallbackData = {
            ...livroVisualizado,
            generos: [],
            autor: livroVisualizado.autor || '',
          };
          setInitialData(fallbackData);
          setFormData(fallbackData);
        } finally {
          setIsLoading(false);
        }
      }
    };

    carregarDetalhesDoLivro();
  }, [livroVisualizado, isOpen]);

  if (!livroVisualizado) return null;

  const handleClose = () => {
    setIsEditMode(false);
    setIsNovoAutor(false);
    setIsNovaEditora(false);
    onClose(foiAtualizado);
  };

  const handleAlterarClick = () => setIsEditMode(true);

  const handleSalvarClick = async () => {
    if (JSON.stringify(initialData) === JSON.stringify(formData) && !capaFile) {
      addToast({
        type: 'info',
        title: 'Sem alterações',
        description: 'Nenhuma alteração foi identificada.',
      });
      setIsEditMode(false);
      return;
    }

    setIsLoading(true);
    try {
      const payload: LivroPayload = {
        ...formData,
        isbn: formData.isbn!,
        nome: formData.nome!,
        data_lancamento: formData.data_lancamento!,
        numero_paginas: Number(formData.numero_paginas) || 0,
        cdd: formData.cdd ? String(formData.cdd) : '',
        editora: formData.editora!,
        classificacao_etaria: formData.classificacao_etaria || '',
        tipo_capa: formData.tipo_capa ? String(formData.tipo_capa) : '',
        autor: formData.autor || '',
        generos: formData.generos || [],
        volume: Number(formData.volume) || 0,
        imagem: formData.imagem || '',
      } as LivroPayload;

      await atualizarLivro(Number(livroVisualizado.id), payload, capaFile);

      addToast({
        type: 'success',
        title: 'Sucesso',
        description: 'Livro atualizado com sucesso!',
      });
      setInitialData(formData);
      setIsEditMode(false);
      setFoiAtualizado(true);
    } catch (error: any) {
      console.error(error);
      addToast({
        type: 'error',
        title: 'Erro ao salvar',
        description:
          error.response?.data?.mensagem || 'Erro desconhecido ao salvar.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcluirClick = async () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o livro "${livroVisualizado.nome}" e TODOS os seus exemplares? Esta ação não pode ser desfeita.`,
      )
    ) {
      setIsLoading(true);
      try {
        await excluirLivroComExemplares(livroVisualizado.isbn);
        addToast({
          type: 'success',
          title: 'Sucesso',
          description: 'Livro e exemplares excluídos com sucesso!',
        });
        setFoiAtualizado(true);
        handleClose();
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Erro ao excluir',
          description:
            error.response?.data?.mensagem || 'Erro desconhecido ao excluir.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAutorChange = (val: string) => {
    setFormData((prev) => ({ ...prev, autor: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCapaFile(file);
      setImagemPreview(URL.createObjectURL(file));
    }
  };

  const handleAddGeneroSelect = (val: string) => {
    setFormData((prev) => {
      const atuais = prev.generos || [];
      if (!atuais.includes(val)) {
        return { ...prev, generos: [...atuais, val] };
      }
      return prev;
    });
  };

  const removeGenero = (g: string) => {
    if (!isEditMode) return;
    setFormData((prev) => ({
      ...prev,
      generos: prev.generos?.filter((item) => item !== g),
    }));
  };

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1 flex justify-between items-center';
  const linkActionStyles =
    'text-xs text-lumi-primary dark:text-lumi-label cursor-pointer hover:underline font-bold ml-2';
  const inputStyles =
    'w-full h-[38px] px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none text-sm';
  const disabledInputStyles =
    'w-full h-[38px] px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none text-sm flex items-center';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Editando Livro' : 'Detalhes do Livro'}
    >
      <div className="flex flex-col h-full max-h-[600px]">
        <div className="overflow-y-auto overflow-x-hidden p-1 flex-grow pr-2 custom-scrollbar space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-[28%] flex flex-col items-center space-y-4 pt-1">
              <div className="w-[9.5rem] h-[14rem] bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-600 relative group shrink-0">
                {imagemPreview ? (
                  <img
                    src={imagemPreview}
                    alt="Capa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-gray-500 p-2 text-center">
                    Sem capa
                  </span>
                )}

                {isEditMode && (
                  <>
                    <label
                      htmlFor="capaFileModal"
                      className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <img
                        src={uploadIconUrl}
                        alt="Upload"
                        className="h-8 w-8 invert mb-1"
                      />
                      <span className="text-white text-xs font-bold">
                        Trocar Imagem
                      </span>
                    </label>
                    <input
                      id="capaFileModal"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </>
                )}
              </div>

              <div className="w-full space-y-3">
                <div>
                  <label htmlFor="edicao" className={labelStyles}>
                    Edição
                  </label>
                  <input
                    id="edicao"
                    name="edicao"
                    type="text"
                    value={formData.edicao || ''}
                    disabled={!isEditMode}
                    onChange={handleChange}
                    className={isEditMode ? inputStyles : disabledInputStyles}
                  />
                </div>
                <div>
                  <label htmlFor="volume" className={labelStyles}>
                    Volume
                  </label>
                  <input
                    id="volume"
                    name="volume"
                    type="number"
                    value={formData.volume || ''}
                    disabled={!isEditMode}
                    onChange={handleChange}
                    className={isEditMode ? inputStyles : disabledInputStyles}
                  />
                </div>
                <div className="col-span-6">
                  {isEditMode ? (
                    <CustomDatePicker
                      label="Lançamento"
                      value={formData.data_lancamento || ''}
                      onChange={(e) =>
                        handleSelectChange('data_lancamento', e.target.value)
                      }
                    />
                  ) : (
                    <div>
                      <label className={labelStyles}>Lançamento</label>
                      <div className={disabledInputStyles}>
                        {formData.data_lancamento
                          ? new Date(
                              formData.data_lancamento,
                            ).toLocaleDateString('pt-BR')
                          : '-'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full md:w-[72%] space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <label htmlFor="isbn" className={labelStyles}>
                    ISBN
                  </label>
                  <input
                    id="isbn"
                    type="text"
                    value={formData.isbn || ''}
                    disabled
                    className={disabledInputStyles}
                  />
                </div>
                <div className="col-span-8">
                  <label htmlFor="nome" className={labelStyles}>
                    Título do Livro
                  </label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    value={formData.nome || ''}
                    disabled={!isEditMode}
                    onChange={handleChange}
                    className={isEditMode ? inputStyles : disabledInputStyles}
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <div className={labelStyles}>
                    <span>Autor</span>
                    {isEditMode && (
                      <span
                        onClick={() => setIsNovoAutor(!isNovoAutor)}
                        className={linkActionStyles}
                      >
                        {isNovoAutor ? 'Selecionar existente' : 'Novo?'}
                      </span>
                    )}
                  </div>
                  {isEditMode ? (
                    isNovoAutor ? (
                      <input
                        type="text"
                        value={formData.autor || ''}
                        onChange={(e) => handleAutorChange(e.target.value)}
                        className={inputStyles}
                        placeholder="Digite o nome do autor"
                      />
                    ) : (
                      <SearchableSelect
                        value={formData.autor || ''}
                        onChange={handleAutorChange}
                        options={autoresOptions}
                        placeholder="Selecione o autor"
                      />
                    )
                  ) : (
                    <input
                      type="text"
                      value={
                        Array.isArray(formData.autor)
                          ? formData.autor.join(', ')
                          : formData.autor || ''
                      }
                      disabled
                      className={disabledInputStyles}
                    />
                  )}
                </div>

                <div className="col-span-6">
                  <div className={labelStyles}>
                    <span>Editora</span>
                    {isEditMode && (
                      <span
                        onClick={() => setIsNovaEditora(!isNovaEditora)}
                        className={linkActionStyles}
                      >
                        {isNovaEditora ? 'Selecionar existente' : 'Novo?'}
                      </span>
                    )}
                  </div>
                  {isEditMode ? (
                    isNovaEditora ? (
                      <input
                        name="editora"
                        type="text"
                        value={formData.editora || ''}
                        onChange={handleChange}
                        className={inputStyles}
                        placeholder="Digite a editora"
                      />
                    ) : (
                      <SearchableSelect
                        value={formData.editora || ''}
                        onChange={(val) => handleSelectChange('editora', val)}
                        options={editorasOptions}
                        placeholder="Selecione a editora"
                      />
                    )
                  ) : (
                    <input
                      type="text"
                      value={formData.editora || ''}
                      disabled
                      className={disabledInputStyles}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <div className={labelStyles}>
                    <span>Gêneros</span>
                  </div>

                  {isEditMode && (
                    <div className="flex gap-2 mb-2">
                      <div className="w-full">
                        <SearchableSelect
                          value=""
                          onChange={handleAddGeneroSelect}
                          options={generosOptions}
                          placeholder="Selecione para adicionar..."
                        />
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex flex-wrap gap-2 min-h-[38px] p-1 ${!isEditMode ? 'bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-700' : ''}`}
                  >
                    {formData.generos?.map((g) => (
                      <span
                        key={g}
                        className="flex items-center bg-lumi-primary/10 text-lumi-primary dark:text-lumi-label dark:bg-gray-800 px-2 py-1 rounded-md text-xs font-bold border border-lumi-primary/20"
                      >
                        {g}
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => removeGenero(g)}
                            className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                          >
                            <img
                              src={closeIcon}
                              className="w-3 h-3 dark:invert"
                              alt="Remover"
                            />
                          </button>
                        )}
                      </span>
                    ))}
                    {(!formData.generos || formData.generos.length === 0) && (
                      <span className="text-xs text-gray-400 italic mt-1 ml-2">
                        Nenhum gênero selecionado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <label className={labelStyles}>CDD</label>
                  {isEditMode ? (
                    <SearchableSelect
                      value={formData.cdd || ''}
                      onChange={(val) => handleSelectChange('cdd', val)}
                      options={cddOptions}
                      placeholder="Buscar..."
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData.cdd || ''}
                      disabled
                      className={disabledInputStyles}
                    />
                  )}
                </div>
                <div className="col-span-4">
                  <label className={labelStyles}>Classificação</label>
                  {isEditMode ? (
                    <CustomSelect
                      value={formData.classificacao_etaria || ''}
                      onChange={(val) =>
                        handleSelectChange('classificacao_etaria', val)
                      }
                      options={classificacaoOptions}
                      placeholder="Selecione"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData.classificacao_etaria || ''}
                      disabled
                      className={disabledInputStyles}
                    />
                  )}
                </div>
                <div className="col-span-4">
                  <label className={labelStyles}>Capa</label>
                  {isEditMode ? (
                    <CustomSelect
                      value={formData.tipo_capa || ''}
                      onChange={(val) => handleSelectChange('tipo_capa', val)}
                      options={tipoCapaOptions}
                      placeholder="Selecione"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData.tipo_capa || ''}
                      disabled
                      className={disabledInputStyles}
                    />
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="sinopse" className={labelStyles}>
                  Sinopse
                </label>
                <textarea
                  id="sinopse"
                  name="sinopse"
                  value={formData.sinopse || ''}
                  disabled={!isEditMode}
                  onChange={handleChange}
                  className={`${isEditMode ? inputStyles : disabledInputStyles} h-auto min-h-[80px] py-2 resize-none`}
                  rows={3}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <button
            onClick={handleExcluirClick}
            disabled={isLoading || isEditMode}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
          >
            Excluir
          </button>
          {isEditMode ? (
            <button
              onClick={handleSalvarClick}
              disabled={isLoading}
              className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 disabled:bg-gray-400 shadow-md"
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          ) : (
            <button
              onClick={handleAlterarClick}
              className="bg-lumi-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-lumi-primary-hover shadow-md"
            >
              Editar Cadastro
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
