import { useState, useMemo } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useCursos } from '../../hooks/useCommonQueries';
import { cadastrarTcc, type TccPayload } from '../../services/tccService';
import { CustomSelect } from '../CustomSelect';

import uploadIconUrl from '../../assets/icons/upload.svg';

interface NewTccProps {
  onClose: () => void;
  onSuccess: () => void;
}

const estadoInicial: TccPayload = {
  titulo: '',
  alunos: '',
  orientadores: '',
  curso_id: 0,
  anoConclusao: new Date().getFullYear().toString(),
  semestreConclusao: '1',
  linkExterno: '',
  ativo: true,
};

export function NovoTcc({ onClose, onSuccess }: NewTccProps) {
  const [formData, setFormData] = useState<TccPayload>(estadoInicial);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { addToast } = useToast();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          description: 'Por favor, selecione um arquivo PDF.',
        });
        return;
      }
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      await cadastrarTcc(formData, pdfFile);

      addToast({
        type: 'success',
        title: 'Sucesso',
        description: 'TCC cadastrado com sucesso!',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      addToast({
        type: 'error',
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao cadastrar TCC.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1';
  const inputStyles =
    'w-full h-[38px] px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary outline-none text-sm';
  const buttonClass =
    'w-full bg-lumi-primary hover:bg-lumi-primary-hover text-white font-bold py-3.5 px-4 rounded-lg shadow-md disabled:opacity-70 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col h-full max-h-[600px] overflow-hidden">
      <form
        id="form-novo-tcc"
        onSubmit={handleSubmit}
        className="overflow-y-auto p-1 flex-grow custom-scrollbar pr-2 space-y-4"
      >
        <div>
          <label htmlFor="titulo" className={labelStyles}>
            Título do Trabalho*
          </label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            value={formData.titulo}
            onChange={handleChange}
            className={inputStyles}
            placeholder="Ex: Sistema de Gerenciamento Bibliotecário (LumiLivre)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="alunos" className={labelStyles}>
              Alunos*
            </label>
            <input
              id="alunos"
              name="alunos"
              type="text"
              value={formData.alunos}
              onChange={handleChange}
              className={inputStyles}
              placeholder="João, Maria, José"
            />
          </div>
          <div>
            <label htmlFor="orientadores" className={labelStyles}>
              Orientadores
            </label>
            <input
              id="orientadores"
              name="orientadores"
              type="text"
              value={formData.orientadores}
              onChange={handleChange}
              className={inputStyles}
              placeholder="Prof. Adriano, Jacques"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelStyles}>Curso*</label>
            <CustomSelect
              value={formData.curso_id}
              onChange={(val) => handleSelectChange('curso_id', Number(val))}
              options={cursosOptions}
              placeholder="Selecione"
            />
          </div>
          <div>
            <label htmlFor="anoConclusao" className={labelStyles}>
              Ano de Conclusão
            </label>
            <input
              id="anoConclusao"
              name="anoConclusao"
              type="number"
              value={formData.anoConclusao}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>
          <div>
            <label className={labelStyles}>Semestre de Conclusão</label>
            <CustomSelect
              value={formData.semestreConclusao}
              onChange={(val) => handleSelectChange('semestreConclusao', val)}
              options={semestreOptions}
              placeholder="Selecione"
            />
          </div>
        </div>


        <div>
          <label htmlFor="linkExterno" className={labelStyles}>
            Link Externo (Repositório/Drive)
          </label>
          <input
            id="linkExterno"
            name="linkExterno"
            type="text"
            value={formData.linkExterno}
            onChange={handleChange}
            className={inputStyles}
            placeholder="https://..."
          />
        </div>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50">
          <img
            src={uploadIconUrl}
            alt="Upload"
            className="w-8 h-8 mb-2 opacity-50 dark:invert"
          />
          <label
            htmlFor="pdfFile"
            className="cursor-pointer text-lumi-primary font-bold hover:underline text-sm"
          >
            {pdfFile ? pdfFile.name : 'Clique para selecionar o PDF do TCC'}
          </label>
          <input
            id="pdfFile"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          {pdfFile && (
            <button
              type="button"
              onClick={() => setPdfFile(null)}
              className="text-xs text-red-500 mt-2 hover:underline"
            >
              Remover
            </button>
          )}
        </div>
      </form>

      <div className="pt-3 mt-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
        <button
          type="submit"
          form="form-novo-tcc"
          disabled={isLoading}
          className={buttonClass}
        >
          {isLoading ? 'SALVANDO...' : 'CADASTRAR TCC'}
        </button>
      </div>
    </div>
  );
}
