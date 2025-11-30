import { useState, useEffect } from 'react';

import {
  cadastrarLivro,
  buscarEnum,
  buscarCdds,
  buscarLivrosParaAdmin,
  type LivroPayload,
} from '../../services/livroService';
import { buscarGeneros } from '../../services/generoService';
import { buscarLivroPorIsbn } from '../../services/googleBooksService';

import { useToast } from '../../contexts/ToastContext';
import { CustomSelect } from '../CustomSelect';
import { SearchableSelect } from '../SearchableSelect';
import { CustomDatePicker } from '../CustomDatePicker';

import uploadIconUrl from '../../assets/icons/download.svg';
import closeIcon from '../../assets/icons/close.svg';
import addIcon from '../../assets/icons/add.svg';

interface Option {
  label: string;
  value: string | number;
}

interface NewBookProps {
  onClose: () => void;
  onSuccess: () => void;
}

const estadoInicialFormulario: Partial<LivroPayload> = {
  isbn: '',
  nome: '',
  data_lancamento: '',
  numero_paginas: 0,
  cdd: '',
  editora: '',
  classificacao_etaria: '',
  tipo_capa: '',
  generos: [],
  autor: '',
  sinopse: '',
  edicao: '',
  volume: 0,
};

export function NovoLivro({ onClose, onSuccess }: NewBookProps) {
  const [formData, setFormData] = useState<Partial<LivroPayload>>(
    estadoInicialFormulario,
  );

  const [capaFile, setCapaFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuscandoIsbn, setIsBuscandoIsbn] = useState(false);

  const [isNovoAutor, setIsNovoAutor] = useState(false);
  const [isNovaEditora, setIsNovaEditora] = useState(false);
  const [isNovoGenero, setIsNovoGenero] = useState(false);
  const [novoGeneroInput, setNovoGeneroInput] = useState('');

  const [cddOptions, setCddOptions] = useState<Option[]>([]);
  const [classificacaoOptions, setClassificacaoOptions] = useState<Option[]>(
    [],
  );
  const [tipoCapaOptions, setTipoCapaOptions] = useState<Option[]>([]);
  const [autoresOptions, setAutoresOptions] = useState<Option[]>([]);
  const [editorasOptions, setEditorasOptions] = useState<Option[]>([]);
  const [generosOptions, setGenerosOptions] = useState<Option[]>([]);

  const { addToast } = useToast();

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [
          cddData,
          classificacaoData,
          tipoCapaData,
          generosData,
          livrosData,
        ] = await Promise.all([
          buscarCdds(),
          buscarEnum('CLASSIFICACAO_ETARIA'),
          buscarEnum('TIPO_CAPA'),
          buscarGeneros(),
          buscarLivrosParaAdmin('', 0, 1000),
        ]);

        setCddOptions(
          cddData.map((c) => ({
            label: `${c.id} - ${c.nome}`,
            value: String(c.id),
          })),
        );

        setClassificacaoOptions(
          classificacaoData.map((c) => ({
            label: c.status,
            value: c.nome,
          })),
        );

        setTipoCapaOptions(
          tipoCapaData.map((c) => ({
            label: c.status,
            value: c.nome,
          })),
        );

        setGenerosOptions(
          generosData.map((g) => ({ label: g.nome, value: g.nome })),
        );

        const autoresUnicos = Array.from(
          new Set(livrosData.content.map((l) => l.autor).filter(Boolean)),
        ).sort();
        setAutoresOptions(autoresUnicos.map((a) => ({ label: a, value: a })));

        const editorasUnicas = Array.from(
          new Set(livrosData.content.map((l) => l.editora).filter(Boolean)),
        ).sort();
        setEditorasOptions(editorasUnicas.map((e) => ({ label: e, value: e })));
      } catch (error) {
        console.error('Erro ao carregar dados iniciais', error);
      }
    };
    carregarDados();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAutorChange = (val: string) => {
    setFormData((prev) => ({ ...prev, autor: val }));
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

  const handleAddGeneroInput = () => {
    if (novoGeneroInput.trim()) {
      handleAddGeneroSelect(novoGeneroInput.trim());
      setNovoGeneroInput('');
      setIsNovoGenero(false);
    }
  };

  const removeGenero = (g: string) => {
    setFormData((prev) => ({
      ...prev,
      generos: prev.generos?.filter((item) => item !== g),
    }));
  };

  const handleIsbnBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const isbn = e.target.value.replace(/-/g, '');
    if (isbn.length === 10 || isbn.length === 13) {
      setIsBuscandoIsbn(true);
      try {
        const dados = await buscarLivroPorIsbn(isbn);
        if (dados) {
          setFormData((prev) => ({
            ...prev,
            ...dados,
            autor: dados.autor || '',
            generos: dados.generos || [],
          }));
          if (dados.imagem) setImagemPreview(dados.imagem);
          if (dados.autor) setIsNovoAutor(true);
          if (dados.editora) setIsNovaEditora(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsBuscandoIsbn(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCapaFile(file);
      setImagemPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const autoresString = Array.isArray(formData.autor)
        ? formData.autor.join(', ')
        : formData.autor || '';

      const payload: LivroPayload = {
        ...formData,
        isbn: formData.isbn || '',
        nome: formData.nome!,
        data_lancamento: formData.data_lancamento
          ? formData.data_lancamento
          : null,
        numero_paginas: Number(formData.numero_paginas) || 0,
        cdd: formData.cdd ? String(formData.cdd) : '',
        editora: formData.editora!,
        classificacao_etaria: formData.classificacao_etaria || '',
        tipo_capa: formData.tipo_capa ? String(formData.tipo_capa) : '',
        autor: autoresString,
        generos: formData.generos || [],
        volume: Number(formData.volume) || 0,
      } as LivroPayload;

      await cadastrarLivro(payload, capaFile);

      addToast({
        type: 'success',
        title: 'Livro Cadastrado',
        description: `O livro "${formData.nome}" foi salvo com sucesso!`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      addToast({
        type: 'error',
        title: 'Falha no cadastro',
        description:
          error.response?.data?.mensagem || 'Ocorreu um erro inesperado.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1 flex justify-between items-center';
  const linkActionStyles =
    'text-xs text-lumi-primary dark:text-lumi-label cursor-pointer hover:underline font-bold ml-2';
  const inputStyles =
    'w-full h-[38px] px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none text-sm';
  const buttonClass =
    'w-full bg-lumi-primary hover:bg-lumi-primary-hover active:bg-purple-900 text-white text-[17px] font-bold py-3.5 px-4 border-2 border-transparent rounded-lg shadow-md transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumi-primary disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none tracking-wide';

  return (
    <div className="flex flex-col h-full max-h-[600px] overflow-hidden">
      <form
        id="form-novo-livro"
        onSubmit={handleSubmit}
        className="overflow-y-auto overflow-x-hidden p-1 flex-grow pr-2 custom-scrollbar"
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-[28%] flex flex-col items-center space-y-4 pt-1">
            <div className="w-[9.5rem] h-[14rem] bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-600 relative group shrink-0">
              {isBuscandoIsbn ? (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-lumi-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-xs text-gray-500">Buscando...</span>
                </div>
              ) : imagemPreview ? (
                <img
                  src={imagemPreview}
                  alt="Capa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm text-gray-500 text-center p-2">
                  Capa do Livro
                </span>
              )}
              <label
                htmlFor="capaFile"
                className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <img
                  src={uploadIconUrl}
                  alt="Upload"
                  className="h-8 w-8 invert mb-1"
                />
                <span className="text-white text-xs font-bold">
                  Alterar Capa
                </span>
              </label>
              <input
                id="capaFile"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
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
                  onChange={handleChange}
                  className={inputStyles}
                  placeholder="Ex: 1ª"
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
                  onChange={handleChange}
                  className={inputStyles}
                  placeholder="Ex: 1"
                />
              </div>
              <div className="col-span-6">
                <CustomDatePicker
                  label="Lançamento"
                  value={formData.data_lancamento || ''}
                  onChange={(e) =>
                    handleSelectChange('data_lancamento', e.target.value)
                  }
                />
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
                  name="isbn"
                  type="text"
                  required
                  value={formData.isbn || ''}
                  onChange={handleChange}
                  onBlur={handleIsbnBlur}
                  className={`${inputStyles} border-lumi-primary/50 focus:border-lumi-primary`}
                  placeholder="Buscar..."
                />
              </div>
              <div className="col-span-8">
                <label htmlFor="nome" className={labelStyles}>
                  Título do Livro*
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  value={formData.nome || ''}
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <div className={labelStyles}>
                  <span>Autor*</span>
                  <span
                    onClick={() => setIsNovoAutor(!isNovoAutor)}
                    className={linkActionStyles}
                  >
                    {isNovoAutor ? 'Selecionar existente' : 'Novo?'}
                  </span>
                </div>
                {isNovoAutor ? (
                  <input
                    type="text"
                    value={formData.autor || ''}
                    onChange={(e) => handleAutorChange(e.target.value)}
                    className={inputStyles}
                    placeholder="Digite o nome do autor"
                  />
                ) : (
                  <SearchableSelect
                    value={formData.autor?.[0] || ''}
                    onChange={handleAutorChange}
                    options={autoresOptions}
                    placeholder="Selecione o autor"
                  />
                )}
              </div>
              <div className="col-span-6">
                <div className={labelStyles}>
                  <span>Editora*</span>
                  <span
                    onClick={() => setIsNovaEditora(!isNovaEditora)}
                    className={linkActionStyles}
                  >
                    {isNovaEditora ? 'Selecionar existente' : 'Novo?'}
                  </span>
                </div>
                {isNovaEditora ? (
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
                )}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className={labelStyles}>
                  <span>Gêneros*</span>
                  <span
                    onClick={() => setIsNovoGenero(!isNovoGenero)}
                    className={linkActionStyles}
                  >
                    {isNovoGenero ? 'Selecionar existente' : 'Novo?'}
                  </span>
                </div>
                <div className="flex gap-2 mb-2">
                  {isNovoGenero ? (
                    <div className="flex w-full gap-2">
                      <input
                        type="text"
                        value={novoGeneroInput}
                        onChange={(e) => setNovoGeneroInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          (e.preventDefault(), handleAddGeneroInput())
                        }
                        className={inputStyles}
                        placeholder="Digite e pressione Enter ou clique no +"
                      />
                      <button
                        type="button"
                        onClick={handleAddGeneroInput}
                        className="bg-green-500 p-2 rounded-md hover:bg-green-600"
                      >
                        <img
                          src={addIcon}
                          className="w-5 h-5 invert"
                          alt="Adicionar"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full">
                      <SearchableSelect
                        value=""
                        onChange={handleAddGeneroSelect}
                        options={generosOptions}
                        placeholder="Selecione para adicionar..."
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 min-h-[32px]">
                  {formData.generos?.map((g) => (
                    <span
                      key={g}
                      className="flex items-center bg-lumi-primary/10 text-lumi-primary dark:text-lumi-label dark:bg-gray-700 px-2 py-1 rounded-md text-xs font-bold border border-lumi-primary/20"
                    >
                      {g}
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
                    </span>
                  ))}
                  {(!formData.generos || formData.generos.length === 0) && (
                    <span className="text-xs text-gray-400 italic mt-1">
                      Nenhum gênero selecionado
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className={labelStyles}>CDD</label>
                <SearchableSelect
                  value={formData.cdd || ''}
                  onChange={(val) => handleSelectChange('cdd', val)}
                  options={cddOptions}
                  placeholder="Buscar..."
                />
              </div>
              <div className="col-span-4">
                <label className={labelStyles}>Classificação*</label>
                <CustomSelect
                  value={formData.classificacao_etaria || ''}
                  onChange={(val) =>
                    handleSelectChange('classificacao_etaria', val)
                  }
                  options={classificacaoOptions}
                  placeholder="Selecione"
                />
              </div>
              <div className="col-span-4">
                <label className={labelStyles}>Capa</label>
                <CustomSelect
                  value={formData.tipo_capa || ''}
                  onChange={(val) => handleSelectChange('tipo_capa', val)}
                  options={tipoCapaOptions}
                  placeholder="Selecione"
                />
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
                onChange={handleChange}
                className={`${inputStyles} h-auto min-h-[80px] py-2 resize-none`}
                rows={3}
              ></textarea>
            </div>
          </div>
        </div>
      </form>

      <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-700 shrink-0">
        <button
          type="submit"
          form="form-novo-livro"
          disabled={isLoading || isBuscandoIsbn}
          className={buttonClass}
        >
          {isLoading
            ? 'SALVANDO...'
            : isBuscandoIsbn
              ? 'BUSCANDO DADOS...'
              : 'CADASTRAR LIVRO'}
        </button>
      </div>
    </div>
  );
}
