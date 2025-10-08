import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import {
  type LivroAgrupado,
  type LivroPayload,
} from '../services/livroService';
import {
  atualizarLivro,
  excluirLivroComExemplares,
} from '../services/livroService';

interface DetalhesLivroModalProps {
  livro: LivroAgrupado | null;
  isOpen: boolean;
  onClose: (foiAtualizado?: boolean) => void;
}

export function DetalhesLivroModal({
  livro,
  isOpen,
  onClose,
}: DetalhesLivroModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<LivroPayload>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [foiAtualizado, setFoiAtualizado] = useState(false);

  useEffect(() => {
    if (livro) {
      setFormData(livro);
    }
  }, [livro]);

  if (!isOpen || !livro) {
    return null;
  }

  const handleClose = () => {
    setIsEditMode(false);
    onClose(foiAtualizado);
  };

  const handleAlterarClick = () => {
    setIsEditMode(true);
  };

  const handleSalvarClick = async () => {
    setIsLoading(true);
    try {
      await atualizarLivro(livro.isbn, formData as LivroPayload);
      alert('Livro atualizado com sucesso!');
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
        setFoiAtualizado(true);
        handleClose();
      } catch (error: any) {
        console.log(
          `Erro ao excluir: ${error.response?.data?.mensagem || 'Erro desconhecido'}`,
        );
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

  const inputStyles =
    'w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600';
  const editableInputStyles =
    'w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500 focus:ring-2 focus:ring-lumi-primary';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Detalhes do Livro">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">ISBN</label>
            <input
              type="text"
              value={livro.isbn}
              disabled
              className={inputStyles}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Nome</label>
            <input
              type="text"
              name="nome"
              value={formData.nome || ''}
              disabled={!isEditMode}
              onChange={handleChange}
              className={isEditMode ? editableInputStyles : inputStyles}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Autor</label>
            <input
              type="text"
              name="autor"
              value={formData.autor || ''}
              disabled={!isEditMode}
              onChange={handleChange}
              className={isEditMode ? editableInputStyles : inputStyles}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Editora</label>
            <input
              type="text"
              name="editora"
              value={formData.editora || ''}
              disabled={!isEditMode}
              onChange={handleChange}
              className={isEditMode ? editableInputStyles : inputStyles}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t dark:border-gray-700">
        <button
          onClick={handleExcluirClick}
          disabled={isLoading}
          className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 disabled:bg-gray-400"
        >
          Excluir
        </button>

        {isEditMode ? (
          <button
            onClick={handleSalvarClick}
            disabled={isLoading}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
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
    </Modal>
  );
}
