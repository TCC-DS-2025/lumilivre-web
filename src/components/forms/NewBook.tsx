import { useState, useEffect } from 'react';
import { cadastrarLivro, uploadCapaLivro, buscarEnum, type LivroPayload } from '../../services/livroService';

interface EnumOption {
  nome: string;
  status: string;
}

interface NewBookProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NovoLivro({ onClose, onSuccess }: NewBookProps) {
  const [formData, setFormData] = useState<LivroPayload>({
    isbn: '', nome: '', data_lancamento: '', numero_paginas: 0, cdd: '',
    editora: '', classificacao_etaria: '', tipo_capa: '', genero: '', autor: ''
  });
  const [capaFile, setCapaFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // estados para os enums
  const [cddOptions, setCddOptions] = useState<EnumOption[]>([]);
  const [classificacaoOptions, setClassificacaoOptions] = useState<EnumOption[]>([]);
  const [tipoCapaOptions, setTipoCapaOptions] = useState<EnumOption[]>([]);

  useEffect(() => {
    // Carrega os enums da API quando o componente monta
    const carregarEnums = async () => {
      try {
        const [cdd, classificacao, tipoCapa] = await Promise.all([
          buscarEnum('CDD'),
          buscarEnum('CLASSIFICACAO_ETARIA'),
          buscarEnum('TIPO_CAPA'),
        ]);
        setCddOptions(cdd);
        setClassificacaoOptions(classificacao);
        setTipoCapaOptions(tipoCapa);
      } catch (error) {
        console.error("Erro ao carregar enums", error);
        alert("Não foi possível carregar as opções de cadastro. Tente novamente.");
      }
    };
    carregarEnums();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCapaFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // cadastro dos dados do livro
      await cadastrarLivro({
        ...formData,
        numero_paginas: Number(formData.numero_paginas),
      });

      // se houver um arquivo de capa, fazer o upload
      if (capaFile) {
        await uploadCapaLivro(formData.isbn, capaFile);
      }

      alert('Livro cadastrado com sucesso!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao cadastrar livro:', error);
      alert(`Falha no cadastro: ${error.response?.data?.mensagem || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition-all duration-200";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-white mb-1";

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      <div className="overflow-y-auto p-2 pt-0 flex-grow">
        <form id="form-novo-livro" onSubmit={handleSubmit} className="space-y-4">
          {/* Adicione todos os inputs e selects aqui, similar ao NewStudent.tsx */}
          {/* Exemplo para o campo Nome e ISBN */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nome" className={labelStyles}>Nome do Livro*</label>
              <input id="nome" name="nome" type="text" required value={formData.nome} onChange={handleChange} className={inputStyles} />
            </div>
            <div>
              <label htmlFor="isbn" className={labelStyles}>ISBN*</label>
              <input id="isbn" name="isbn" type="text" required value={formData.isbn} onChange={handleChange} className={inputStyles} />
            </div>
          </div>
          {/* Exemplo para um select de CDD */}
          <div>
            <label htmlFor="cdd" className={labelStyles}>CDD*</label>
            <select id="cdd" name="cdd" required value={formData.cdd} onChange={handleChange} className={inputStyles}>
              <option value="">Selecione...</option>
              {cddOptions.map(opt => <option key={opt.nome} value={opt.nome}>{opt.status}</option>)}
            </select>
          </div>
          {/* ... adicione os outros campos: autor, editora, genero, data_lancamento, etc. ... */}
          <div>
            <label htmlFor="capaFile" className={labelStyles}>Capa do Livro</label>
            <input id="capaFile" name="capaFile" type="file" onChange={handleFileChange} accept="image/*" className={inputStyles} />
          </div>
        </form>
      </div>
      <button
        type="submit"
        form="form-novo-livro"
        disabled={isLoading}
        className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md shadow-md transition duration-200 disabled:bg-gray-400"
      >
        {isLoading ? 'Salvando...' : 'SALVAR LIVRO'}
      </button>
    </div>
  );
}