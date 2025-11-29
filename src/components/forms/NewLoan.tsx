import { useState, useEffect } from 'react';

import {
  cadastrarEmprestimo,
  type EmprestimoPayload,
} from '../../services/emprestimoService';
import { buscarAlunosParaAdmin } from '../../services/alunoService';
import { buscarLivrosAgrupados } from '../../services/livroService';
import { buscarExemplaresPorLivroId } from '../../services/exemplarService';

import { SearchableSelect } from '../SearchableSelect';
import { CustomDatePicker } from '../CustomDatePicker';

interface Option {
  label: string;
  value: string | number;
}

interface NewLoanProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NovoEmprestimo({ onClose, onSuccess }: NewLoanProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExemplares, setIsLoadingExemplares] = useState(false);

  const [alunoMatricula, setAlunoMatricula] = useState('');
  const [livroId, setLivroId] = useState('');
  const [exemplarTombo, setExemplarTombo] = useState('');

  const hoje = new Date().toISOString().split('T')[0];
  const dataDevolucaoPadrao = new Date();
  dataDevolucaoPadrao.setDate(dataDevolucaoPadrao.getDate() + 7);
  const devolucaoStr = dataDevolucaoPadrao.toISOString().split('T')[0];

  const [dataEmprestimo, setDataEmprestimo] = useState(hoje);
  const [dataDevolucao, setDataDevolucao] = useState(devolucaoStr);

  const [alunosOptions, setAlunosOptions] = useState<Option[]>([]);
  const [livrosOptions, setLivrosOptions] = useState<Option[]>([]);
  const [exemplaresOptions, setExemplaresOptions] = useState<Option[]>([]);

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const [alunosRes, livrosRes] = await Promise.all([
          buscarAlunosParaAdmin('', 0, 1000),
          buscarLivrosAgrupados('', 0, 1000),
        ]);

        // Mapeia Alunos
        setAlunosOptions(
          alunosRes.content.map((a) => ({
            label: `${a.nomeCompleto} (Mat: ${a.matricula})`,
            value: a.matricula,
          })),
        );

        // Mapeia Livros
        setLivrosOptions(
          livrosRes.content.map((l) => ({
            label: `${l.nome} (ISBN: ${l.isbn || 'S/N'})`,
            value: l.id,
          })),
        );
      } catch (error) {
        console.error('Erro ao carregar dados iniciais', error);
      }
    };
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    if (!livroId) {
      setExemplaresOptions([]);
      setExemplarTombo('');
      return;
    }

    const carregarExemplares = async () => {
      setIsLoadingExemplares(true);
      try {
        const lista = await buscarExemplaresPorLivroId(Number(livroId));

        const disponiveis = lista.filter((ex) => ex.status === 'DISPONIVEL');

        if (disponiveis.length === 0) {
          alert(
            'Este livro não possui exemplares disponíveis para empréstimo.',
          );
        }

        setExemplaresOptions(
          disponiveis.map((ex) => ({
            label: `${ex.tomboExemplar} - Local: ${ex.localizacao_fisica}`,
            value: ex.tomboExemplar,
          })),
        );
      } catch (error) {
        console.error('Erro ao buscar exemplares', error);
        setExemplaresOptions([]);
      } finally {
        setIsLoadingExemplares(false);
      }
    };

    carregarExemplares();
  }, [livroId]);

  const formatarDataParaBackend = (dataIso: string): string => {
    if (!dataIso) return '';
    const [ano, mes, dia] = dataIso.split('-');
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    return `${dia}/${mes}/${ano} ${horaAtual}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !alunoMatricula ||
      !exemplarTombo ||
      !dataEmprestimo ||
      !dataDevolucao
    ) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);

    try {
      const payload: EmprestimoPayload = {
        aluno_matricula: alunoMatricula,
        exemplar_tombo: exemplarTombo,
        data_emprestimo: formatarDataParaBackend(dataEmprestimo),
        data_devolucao: formatarDataParaBackend(dataDevolucao),
      };

      await cadastrarEmprestimo(payload);
      alert('Empréstimo realizado com sucesso!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao cadastrar empréstimo:', error);
      alert(error.response?.data?.mensagem || 'Erro ao realizar empréstimo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Estilos
  const buttonClass =
    'w-full bg-lumi-primary hover:bg-lumi-primary-hover active:bg-purple-900 text-white text-[17px] font-bold py-3.5 px-4 border-2 border-transparent rounded-lg shadow-md transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumi-primary disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none tracking-wide';

  return (
    <div className="flex flex-col h-full max-h-[600px] overflow-hidden">
      <form
        id="form-novo-emprestimo"
        onSubmit={handleSubmit}
        className="overflow-y-auto p-1 flex-grow custom-scrollbar pr-2 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomDatePicker
            label="Data do Empréstimo*"
            value={dataEmprestimo}
            onChange={(e) => setDataEmprestimo(e.target.value)}
          />

          <CustomDatePicker
            label="Data de Devolução*"
            value={dataDevolucao}
            onChange={(e) => setDataDevolucao(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <SearchableSelect
              label="Aluno*"
              value={alunoMatricula}
              onChange={setAlunoMatricula}
              options={alunosOptions}
            />
          </div>

          <div>
            <SearchableSelect
              label="Livro*"
              value={livroId}
              onChange={(val) => {
                setLivroId(val);
                setExemplarTombo('');
              }}
              options={livrosOptions}
            />
          </div>

          <div>
            <SearchableSelect
              label="Exemplar Disponível*"
              value={exemplarTombo}
              onChange={setExemplarTombo}
              options={exemplaresOptions}
              placeholder={
                !livroId ? 'Selecione um livro' : 'Selecione um exemplar'
              }
              disabled={!livroId || isLoadingExemplares}
              isLoading={isLoadingExemplares}
            />
          </div>
        </div>
      </form>

      <div className="pt-3 mt-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
        <button
          type="submit"
          form="form-novo-emprestimo"
          disabled={isLoading}
          className={buttonClass}
        >
          {isLoading ? 'PROCESSANDO...' : 'CONFIRMAR EMPRÉSTIMO'}
        </button>
      </div>
    </div>
  );
}
