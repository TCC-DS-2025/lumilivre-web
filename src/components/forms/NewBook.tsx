import { useState, useEffect } from 'react';

import {
  cadastrarLivro,
  uploadCapaLivro,
  buscarEnum,
  type LivroPayload,
} from '../../services/livroService';
import { buscarLivroPorIsbn } from '../../services/googleBooksService';
import { buscarGeneros, type Genero } from '../../services/generoService';

import uploadIconUrl from '../../assets/icons/upload.svg';

interface EnumOption {
  nome: string;
  status: string;
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

  const [todosGeneros, setTodosGeneros] = useState<Genero[]>([]);
  const [cddOptions, setCddOptions] = useState<EnumOption[]>([]);
  const [classificacaoOptions, setClassificacaoOptions] = useState<
    EnumOption[]
  >([]);
  const [tipoCapaOptions, setTipoCapaOptions] = useState<EnumOption[]>([]);

  useEffect(() => {
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
        console.error('Erro ao carregar enums', error);
      }
    };
    carregarDadosIniciais();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIsbnBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const isbn = e.target.value.replace(/-/g, '');
    if (isbn.length === 10 || isbn.length === 13) {
      setIsBuscandoIsbn(true);
      setImagemPreview(null);
      try {
        const dadosDoGoogle = await buscarLivroPorIsbn(isbn);
        if (dadosDoGoogle) {
          setFormData((prev) => ({
            ...prev,
            ...dadosDoGoogle,
          }));
          setImagemPreview(dadosDoGoogle.imagem);
        } else {
          alert(
            'ISBN não encontrado. Por favor, preencha os campos manualmente.',
          );
        }
      } catch (error) {
        console.error(error);
        alert('Ocorreu um erro ao buscar as informações do livro.');
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: LivroPayload = {
        ...formData,
        isbn: formData.isbn!,
        nome: formData.nome!,
        data_lancamento: formData.data_lancamento!,
        numero_paginas: Number(formData.numero_paginas) || 0,
        cdd: formData.cdd!,
        editora: formData.editora!,
        classificacao_etaria: formData.classificacao_etaria!,
        tipo_capa: formData.tipo_capa!,
        autor: formData.autor!,
        generos: formData.generos || [],
      };

      await cadastrarLivro(payload);

      if (capaFile) {
        await uploadCapaLivro(formData.isbn!, capaFile);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao cadastrar livro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles =
    'w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition-all duration-200 select-none';
  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1';
  const highlightedInputStyles =
    'w-full p-2 border-2 border-lumi-primary dark:border-lumi-label rounded-md bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary outline-none transition-all duration-200';

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      <form
        id="form-novo-livro"
        onSubmit={handleSubmit}
        className="overflow-y-auto p-2 pt-0 flex-grow space-y-6"
      >
        <div className="flex flex-col md:flex-row gap-5">
          {/* coluna da esquerda: imagem e etc */}
          <div className="w-full md:w-1/4 flex flex-col items-center space-y-4">
            <div className="w-[9.5rem] h-[13.5rem] bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden shadow-lg">
              {isBuscandoIsbn ? (
                <span className="text-sm text-gray-500">Buscando...</span>
              ) : imagemPreview ? (
                <img
                  src={imagemPreview}
                  alt="Capa do livro"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm text-gray-500 text-center p-2">
                  Capa do Livro
                </span>
              )}
            </div>
            <div>
              <label
                htmlFor="capaFile"
                className="flex cursor-pointer items-center justify-center gap-1 -mb-2.5 -mt-2 text-sm text-lumi-primary transition-opacity hover:opacity-75"
              >
                <img
                  src={uploadIconUrl}
                  alt="Upload de capa"
                  className="h-5 w-5"
                />
                <span>Upload</span>
              </label>
              <input
                id="capaFile"
                name="capaFile"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div>
              <label htmlFor="edicao" className={labelStyles}>
                Edição
              </label>
              <input
                id="edicao"
                name="edicao"
                type="text"
                value={formData.edicao}
                onChange={handleChange}
                className={inputStyles}
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
                value={formData.volume}
                onChange={handleChange}
                className={inputStyles}
              />
            </div>
          </div>

          {/* coluna da direita: campos principais */}
          <div className="w-full md:w-3/4 space-y-4">
            <div>
              <label htmlFor="isbn" className={labelStyles}>
                ISBN*
              </label>
              <input
                id="isbn"
                name="isbn"
                type="text"
                required
                value={formData.isbn}
                onChange={handleChange}
                onBlur={handleIsbnBlur}
                className={highlightedInputStyles}
                placeholder="Digite e saia do campo para buscar"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="nome" className={labelStyles}>
                Nome do Livro*
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                value={formData.nome}
                onChange={handleChange}
                className={highlightedInputStyles}
              />
              {/* Futuramente, a pesquisa aqui será inteligente, sugerindo livros enquanto você digita. */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="autor" className={labelStyles}>
                  Autor(es)*
                </label>
                <input
                  id="autor"
                  name="autor"
                  type="text"
                  required
                  value={formData.autor}
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>
              <div>
                <label htmlFor="editora" className={labelStyles}>
                  Editora*
                </label>
                <input
                  id="editora"
                  name="editora"
                  type="text"
                  required
                  value={formData.editora}
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="data_lancamento" className={labelStyles}>
                  Lançamento*
                </label>
                <input
                  id="data_lancamento"
                  name="data_lancamento"
                  type="date"
                  required
                  value={formData.data_lancamento}
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>
              <div>
                <label htmlFor="numero_paginas" className={labelStyles}>
                  Páginas*
                </label>
                <input
                  id="numero_paginas"
                  name="numero_paginas"
                  type="number"
                  required
                  value={formData.numero_paginas}
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>

              <div>
                <label className={labelStyles}>Gêneros*</label>
                <div className="flex flex-wrap gap-2 p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md min-h-[44px]">
                  {todosGeneros.map((genero) => {
                    const isSelected = formData.generos?.includes(genero.nome);
                    return (
                      <button
                        type="button"
                        key={genero.id}
                        onClick={() => handleGenreToggle(genero.nome)}
                        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${
                          isSelected
                            ? 'bg-lumi-primary text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {genero.nome}
                      </button>
                    );
                  })}
                  {/* criar novos gêneros dinamicamente no futuro? */}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="cdd" className={labelStyles}>
                  CDD*
                </label>
                <select
                  id="cdd"
                  name="cdd"
                  required
                  value={formData.cdd}
                  onChange={handleChange}
                  className={inputStyles}
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
                  Classificação*
                </label>
                <select
                  id="classificacao_etaria"
                  name="classificacao_etaria"
                  required
                  value={formData.classificacao_etaria}
                  onChange={handleChange}
                  className={inputStyles}
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
                  Tipo de Capa*
                </label>
                <select
                  id="tipo_capa"
                  name="tipo_capa"
                  required
                  value={formData.tipo_capa}
                  onChange={handleChange}
                  className={inputStyles}
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

        {/* campo sinopse */}
        <div>
          <label htmlFor="sinopse" className={labelStyles}>
            Sinopse
          </label>
          <textarea
            id="sinopse"
            name="sinopse"
            value={formData.sinopse}
            onChange={handleChange}
            className={inputStyles}
            rows={5}
          ></textarea>
        </div>
      </form>
      <button
        type="submit"
        form="form-novo-livro"
        disabled={isLoading || isBuscandoIsbn}
        className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md shadow-md transition duration-200 disabled:bg-gray-400"
      >
        {isLoading
          ? 'Salvando...'
          : isBuscandoIsbn
            ? 'Buscando dados...'
            : 'SALVAR'}
      </button>
    </div>
  );
}
