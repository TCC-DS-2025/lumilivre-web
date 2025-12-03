import { useState } from 'react';

import { Modal } from './Modal';
import { InputFloatingLabel } from './InputFloatingLabel';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

import LockIcon from '../assets/icons/lock.svg?react';

export function MandatoryPasswordChangeModal() {
  const { user, completePasswordChange } = useAuth();
  const { addToast } = useToast();
  
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user?.isInitialPassword) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha.length < 6) {
      addToast({ type: 'warning', title: 'Senha curta', description: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      addToast({ type: 'warning', title: 'Erro', description: 'As novas senhas não conferem.' });
      return;
    }

    setIsLoading(true);

    try {
      await api.put('/usuarios/alterar-senha', {
        matricula: '',
        senhaAtual: senhaAtual,
        novaSenha: novaSenha
      });

      addToast({ type: 'success', title: 'Sucesso', description: 'Senha alterada com sucesso!' });
      completePasswordChange();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.mensagem || 'Erro ao alterar senha.';
      addToast({ type: 'error', title: 'Erro', description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => {}}
      preventClose={true}
      title="Alteração de Primeira Senha"
    >
      <div className="space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Por motivos de segurança, você deve alterar sua senha inicial antes de continuar utilizando o sistema.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputFloatingLabel
            id="senhaAtual"
            label="Senha Atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            icon={LockIcon}
            required
          />
          
          <InputFloatingLabel
            id="novaSenha"
            label="Nova Senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            icon={LockIcon}
            required
          />

          <InputFloatingLabel
            id="confirmarSenha"
            label="Confirmar Nova Senha"
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            icon={LockIcon}
            required
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-lumi-primary hover:bg-lumi-primary-hover text-white font-bold py-3 px-4 rounded-lg shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'SALVANDO...' : 'SALVAR'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}