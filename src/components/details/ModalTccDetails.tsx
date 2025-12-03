import { useState } from 'react';
import { Modal } from '../Modal';
import { useToast } from '../../contexts/ToastContext';
import { excluirTcc, type TccResponse } from '../../services/tccService';

import DownloadIcon from '../../assets/icons/upload.svg?react';

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
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  if (!isOpen || !tcc) return null;

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
          description: 'TCC excluído com sucesso!',
        });
        onClose(true);
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Erro',
          description: error.response?.data?.message || 'Erro ao excluir TCC.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownload = () => {
    if (tcc.arquivoPdf) {
      window.open(tcc.arquivoPdf, '_blank');
    } else {
      addToast({
        type: 'info',
        title: 'Indisponível',
        description: 'Este TCC não possui arquivo PDF anexado.',
      });
    }
  };

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1';
  const valueStyles =
    'text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 p-2 rounded-md border border-gray-200 dark:border-gray-600';

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title="Detalhes do TCC"
    >
      <div className="flex flex-col h-full max-h-[600px]">
        <div className="overflow-y-auto p-1 flex-grow custom-scrollbar pr-2 space-y-4">
          <div>
            <label className={labelStyles}>Título</label>
            <div className={`${valueStyles} font-bold`}>{tcc.titulo}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyles}>Alunos</label>
              <div className={valueStyles}>{tcc.alunos}</div>
            </div>
            <div>
              <label className={labelStyles}>Orientadores</label>
              <div className={valueStyles}>{tcc.orientadores || '-'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelStyles}>Curso</label>
              <div className={valueStyles}>{tcc.curso}</div>
            </div>
            <div>
              <label className={labelStyles}>Ano</label>
              <div className={valueStyles}>{tcc.anoConclusao}</div>
            </div>
            <div>
              <label className={labelStyles}>Semestre</label>
              <div className={valueStyles}>{tcc.semestreConclusao}º</div>
            </div>
          </div>

          {tcc.linkExterno && (
            <div>
              <label className={labelStyles}>Link Externo</label>
              <a
                href={tcc.linkExterno}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-lumi-primary hover:underline break-all"
              >
                {tcc.linkExterno}
              </a>
            </div>
          )}

          {tcc.arquivoPdf ? (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
              <span className="text-green-800 dark:text-green-200 font-medium text-sm">
                Arquivo PDF disponível
              </span>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-bold shadow-sm transition-transform active:scale-95"
              >
                <DownloadIcon className="w-4 h-4 text-white" />
                Baixar
              </button>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-gray-500 text-sm">
              Nenhum arquivo PDF anexado.
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <button
            onClick={handleExcluir}
            disabled={isLoading}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
          >
            <span>Excluir</span>
          </button>

          {/* TODO: botão de editar */}
        </div>
      </div>
    </Modal>
  );
}
