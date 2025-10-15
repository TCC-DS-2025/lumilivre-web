import { useState, useEffect } from 'react';
import { Modal } from './Modal';

import {
  buscarEnum,
  atualizarLivro,
  excluirLivroComExemplares,
  buscarLivroPorIsbn,
  type LivroAgrupado,
  type LivroPayload,
} from '../services/livroService';
import { buscarGeneros, type Genero } from '../services/generoService';

import uploadIconUrl from '../assets/icons/upload.svg';

interface EnumOption {
  nome: string;
  status: string;
}

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

  // estado para guardar os dados iniciais e os dados do formulario
  const [initialData, setInitialData] = useState<FormDataState>({});
  const [formData, setFormData] = useState<FormDataState>({});

  // estados para os selects
  const [todosGeneros, setTodosGeneros] = useState<Genero[]>([]);
  const [cddOptions, setCddOptions] = useState<EnumOption[]>([]);
  const [classificacaoOptions, setClassificacaoOptions] = useState<
    EnumOption[]
  >([]);
  const [tipoCapaOptions, setTipoCapaOptions] = useState<EnumOption[]>([]);

  useEffect(() => {
    const carregarDetalhesDoLivro = async () => {
      if (livro && isOpen) {
        setIsLoading(true);
        setFormData({});
        try {
          const response = await buscarLivroPorIsbn(livro.isbn);
          if (response.data) {
            const dadosCompletos = response.data;

            if (dadosCompletos.data_lancamento) {
              dadosCompletos.data_lancamento =
                dadosCompletos.data_lancamento.split('T')[0];
            }

            const nomesDosGeneros = dadosCompletos.generos?.map((g) => g.nome) || [];

            const dadosParaForm = {
              ...dadosCompletos,
              generos: nomesDosGeneros,
            };

            setInitialData(dadosParaForm);
            setFormData(dadosParaForm);
          }
        } catch (error) {
          console.error('Erro ao buscar detalhes do livro:', error);
          const fallbackData = { ...livro, generos: [] };
          setInitialData(fallbackData);
          setFormData(fallbackData);
        } finally {
          setIsLoading(false);
        }
      }
    };

    carregarDetalhesDoLivro();
  }, [livro, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const carregarDadosIniciais = async () => {
        try {
          const [cdd, classificacao, tipoCapa, generosApi] = await Promise.all([
            buscarEnum('CDD'),
            buscarEnum('CLASSIFICACAO_ETARIA'),
            buscarEnum('TIPO_CAPA'),
            buscarGeneros(),
          ]);
          setCddOptions(cdd);
          setClassificacaoOptions(classificacao);
          setTipoCapaOptions(tipoCapa);
          setTodosGeneros(generosApi);
        } catch (error) {
          console.error('Erro ao carregar dados iniciais do modal', error);
        }
      };
      carregarDadosIniciais();
    }
  }, [isOpen]);

  if (!isOpen || !livro) return null;

  const handleClose = () => {
    setIsEditMode(false);
    onClose(foiAtualizado);
  };

  const handleAlterarClick = () => setIsEditMode(true);

  const handleSalvarClick = async () => {
    if (JSON.stringify(initialData) === JSON.stringify(formData)) {
      alert('Nenhuma alteração foi identificada.');
      setIsEditMode(false);
      return;
    }
    setIsLoading(true);
    try {
      await atualizarLivro(livro.isbn, formData as LivroPayload);
      alert('Livro atualizado com sucesso!');
      setInitialData(formData);
      setIsEditMode(false);
      setFoiAtualizado(true);
    } catch (error: any) {
      alert(
        `Erro ao salvar: ${error.response?.data?.mensagem || 'Erro desconhecido'}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcluirClick = async () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o livro "${livro.nome}" e TODOS os seus exemplares? Esta ação não pode ser desfeita.`,
      )
    ) {
      setIsLoading(true);
      try {
        await excluirLivroComExemplares(livro.isbn);
        alert('Livro e exemplares excluídos com sucesso!');
        setFoiAtualizado(true);
        handleClose();
      } catch (error: any) {
        alert(
          `Erro ao excluir: ${error.response?.data?.mensagem || 'Erro desconhecido'}`,
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGenreToggle = (nomeGenero: string) => {
    setFormData((prev) => {
      const generosAtuais = prev.generos || [];
      const isSelected = generosAtuais.includes(nomeGenero);
      if (isSelected) {
        return {
          ...prev,
          generos: generosAtuais.filter((g) => g !== nomeGenero),
        };
      } else {
        return { ...prev, generos: [...generosAtuais, nomeGenero] };
      }
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputStyles =
    'w-full p-2 border-2 border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none';
  const editableInputStyles =
    'w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition-all duration-200';
  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Editando Livro' : 'Detalhes do Livro'}
    >
      <div className="flex flex-col h-full max-h-[60vh]">
        <div className="overflow-y-auto p-2 pt-0 flex-grow space-y-6">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="w-full md:w-1/4 flex flex-col items-center space-y-4">
              <div className="w-[9.5rem] h-[13.5rem] bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden shadow-lg">
                {formData.imagem ? (
                  <img
                    src={formData.imagem}
                    alt="Capa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-gray-500 p-2 text-center">
                    Sem capa
                  </span>
                )}
              </div>
              {isEditMode && (
                <div>
                  <label
                    htmlFor="capaFileModal"
                    className="flex cursor-pointer items-center justify-center gap-1 text-sm text-lumi-primary transition-opacity hover:opacity-75"
                  >
                    <img src={uploadIconUrl} alt="Upload" className="h-5 w-5" />
                    <span>Trocar Imagem</span>
                  </label>
                  <input
                    id="capaFileModal"
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}
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
                  className={isEditMode ? editableInputStyles : inputStyles}
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
                  className={isEditMode ? editableInputStyles : inputStyles}
                />
              </div>
            </div>

            <div className="w-full md:w-3/4 space-y-4">
              <div>
                <label htmlFor="isbn" className={labelStyles}>
                  ISBN
                </label>
                <input
                  id="isbn"
                  type="text"
                  value={formData.isbn || ''}
                  disabled
                  className={inputStyles}
                />
              </div>
              <div>
                <label htmlFor="nome" className={labelStyles}>
                  Nome do Livro
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formData.nome || ''}
                  disabled={!isEditMode}
                  onChange={handleChange}
                  className={isEditMode ? editableInputStyles : inputStyles}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="autor" className={labelStyles}>
                    Autor(es)
                  </label>
                  <input
                    id="autor"
                    name="autor"
                    type="text"
                    value={formData.autor || ''}
                    disabled={!isEditMode}
                    onChange={handleChange}
                    className={isEditMode ? editableInputStyles : inputStyles}
                  />
                </div>
                <div>
                  <label htmlFor="editora" className={labelStyles}>
                    Editora
                  </label>
                  <input
                    id="editora"
                    name="editora"
                    type="text"
                    value={formData.editora || ''}
                    disabled={!isEditMode}
                    onChange={handleChange}
                    className={isEditMode ? editableInputStyles : inputStyles}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="data_lancamento" className={labelStyles}>
                    Lançamento
                  </label>
                  <input
                    id="data_lancamento"
                    name="data_lancamento"
                    type="date"
                    value={formData.data_lancamento || ''}
                    disabled={!isEditMode}
                    onChange={handleChange}
                    className={isEditMode ? editableInputStyles : inputStyles}
                  />
                </div>
                <div>
                  <label htmlFor="numero_paginas" className={labelStyles}>
                    Páginas
                  </label>
                  <input
                    id="numero_paginas"
                    name="numero_paginas"
                    type="number"
                    value={formData.numero_paginas || ''}
                    disabled={!isEditMode}
                    onChange={handleChange}
                    className={isEditMode ? editableInputStyles : inputStyles}
                  />
                </div>
                <div>
                  <label className={labelStyles}>Gêneros</label>
                  <div className="flex flex-wrap gap-2 p-2 border-2 border-gray-200 dark:border-gray-700 rounded-md min-h-[44px]">
                    {isEditMode
                      ? todosGeneros.map((genero) => {
                          const isSelected = formData.generos?.includes(
                            genero.nome,
                          );
                          return (
                            <button
                              type="button"
                              key={genero.id}
                              onClick={() => handleGenreToggle(genero.nome)}
                              className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                                isSelected
                                  ? 'bg-lumi-primary text-white'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            >
                              {genero.nome}
                            </button>
                          );
                        })
                      : formData.generos?.map((nomeGenero) => (
                          <span
                            key={nomeGenero}
                            className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          >
                            {nomeGenero}
                          </span>
                        ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="cdd" className={labelStyles}>
                    CDD
                  </label>
                  <select
                    id="cdd"
                    name="cdd"
                    value={formData.cdd || ''}
                    disabled={!isEditMode}
                    onChange={handleChange}
                    className={isEditMode ? editableInputStyles : inputStyles}
                  >
                    <option value="">Selecione...</option>
                    {cddOptions.map((opt) => (
                      <option key={opt.nome} value={opt.nome}>
                        {opt.status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="classificacao_etaria" className={labelStyles}>
                    Classificação
                  </label>
                  <select
                    id="classificacao_etaria"
                    name="classificacao_etaria"
                    value={formData.classificacao_etaria || ''}
                    disabled={!isEditMode}
                    onChange={handleChange}
                    className={isEditMode ? editableInputStyles : inputStyles}
                  >
                    <option value="">Selecione...</option>
                    {classificacaoOptions.map((opt) => (
                      <option key={opt.nome} value={opt.nome}>
                        {opt.status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="tipo_capa" className={labelStyles}>
                    Tipo de Capa
                  </label>
                  <select
                    id="tipo_capa"
                    name="tipo_capa"
                    value={formData.tipo_capa || ''}
                    disabled={!isEditMode}
                    onChange={handleChange}
                    className={isEditMode ? editableInputStyles : inputStyles}
                  >
                    <option value="">Selecione...</option>
                    {tipoCapaOptions.map((opt) => (
                      <option key={opt.nome} value={opt.nome}>
                        {opt.status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
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
              className={isEditMode ? editableInputStyles : inputStyles}
              rows={5}
            ></textarea>
          </div>
        </div>
        <div className="flex justify-between items-center mt-6 pt-4 border-t dark:border-gray-700">
          <button
            onClick={handleExcluirClick}
            disabled={isLoading || isEditMode}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Excluir Livro
          </button>
          {isEditMode ? (
            <button
              onClick={handleSalvarClick}
              disabled={isLoading}
              className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          ) : (
            <button
              onClick={handleAlterarClick}
              className="bg-lumi-primary text-white font-bold py-2 px-4 rounded hover:bg-lumi-primary-hover"
            >
              Alterar
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
