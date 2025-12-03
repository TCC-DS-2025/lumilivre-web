import { useState, useEffect, useMemo } from 'react';

import { Modal } from '../Modal';
import { CustomSelect } from '../CustomSelect';
import { CustomDatePicker } from '../CustomDatePicker';
import { useToast } from '../../contexts/ToastContext';

import { LoadingIcon } from '../LoadingIcon';
import LockIcon from '../../assets/icons/lock.svg?react';

import {
  atualizarAluno,
  excluirAluno,
  buscarAlunoPorMatricula,
  resetarSenhaAluno,
  type AlunoPayload,
  type ListaAluno,
} from '../../services/alunoService';
import { buscarEnderecoPorCep } from '../../services/cepService';

import {
  useCursos,
  useModulos,
  useTurnos,
  useEnum,
} from '../../hooks/useCommonQueries';

interface ModalStudentDetailsProps {
  aluno: ListaAluno | null;
  isOpen: boolean;
  onClose: (foiAtualizado?: boolean) => void;
}

interface AlunoDetalhado extends AlunoPayload {
  penalidade?: string;
  cursoNome?: string;
  turnoNome?: string;
  moduloNome?: string;
}

export function ModalStudentDetails({
  aluno,
  isOpen,
  onClose,
}: ModalStudentDetailsProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<AlunoDetalhado>>({});

  const { addToast } = useToast();

  const { data: cursosData } = useCursos();
  const { data: modulosData } = useModulos();
  const { data: turnosData } = useTurnos();
  const { data: penalidadesData } = useEnum('PENALIDADE');

  const cursosOptions = useMemo(
    () => cursosData?.map((c) => ({ label: c.nome, value: c.id })) || [],
    [cursosData],
  );

  const modulosOptions = useMemo(
    () => modulosData?.map((m) => ({ label: m.nome, value: m.id })) || [],
    [modulosData],
  );

  const turnoOptions = useMemo(
    () => turnosData?.map((t) => ({ label: t.nome, value: t.id })) || [],
    [turnosData],
  );

  const penalidadeOptions = useMemo(
    () => [
      { label: 'Sem Penalidade', value: '' },
      ...(penalidadesData?.map((p) => ({ label: p.status, value: p.nome })) ||
        []),
    ],
    [penalidadesData],
  );

  useEffect(() => {
    const carregarDetalhes = async () => {
      if (!isOpen || !aluno) return;

      setIsLoading(true);
      try {
        const alunoRes = await buscarAlunoPorMatricula(aluno.matricula);

        if (alunoRes.success && alunoRes.data) {
          const dados = alunoRes.data;

          let cursoIdFinal = dados.cursoId;
          if (!cursoIdFinal && dados.cursoNome) {
            const found = cursosOptions.find(
              (c) => c.label === dados.cursoNome,
            );
            if (found) cursoIdFinal = Number(found.value);
          }

          let turnoIdFinal = dados.turnoId;
          if (!turnoIdFinal && dados.turnoNome) {
            const found = turnoOptions.find(
              (t) => t.label.toUpperCase() === dados.turnoNome?.toUpperCase(),
            );
            if (found) turnoIdFinal = Number(found.value);
          }

          let moduloIdFinal = dados.moduloId;
          if (!moduloIdFinal && dados.moduloNome) {
            const found = modulosOptions.find(
              (m) => m.label === dados.moduloNome,
            );
            if (found) moduloIdFinal = Number(found.value);
          }

          setFormData({
            ...dados,
            cursoId: cursoIdFinal,
            turno: turnoIdFinal ? String(turnoIdFinal) : '',
            modulo: moduloIdFinal ? String(moduloIdFinal) : '',
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do modal:', error);
        addToast({
          type: 'error',
          title: 'Erro ao carregar',
          description: 'Erro ao carregar dados. Tente novamente.',
        });
        onClose();
      } finally {
        setIsLoading(false);
        setIsEditMode(false);
      }
    };

    carregarDetalhes();
  }, [isOpen, aluno, cursosOptions, turnoOptions, modulosOptions]);

  if (!isOpen || !aluno) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setFormData((prev) => ({ ...prev, cep: rawValue }));

    const cleanCep = rawValue.replace(/\D/g, '');

    if (cleanCep.length === 8) {
      setIsCepLoading(true);
      try {
        const endereco = await buscarEnderecoPorCep(cleanCep);
        setFormData((prev) => ({
          ...prev,
          logradouro: endereco.logradouro,
          bairro: endereco.bairro,
          localidade: endereco.localidade,
          uf: endereco.uf,
        }));
      } catch (error) {
        console.error('Erro ao buscar CEP', error);
      } finally {
        setIsCepLoading(false);
      }
    }
  };

  const handleSalvar = async () => {
    setIsLoading(true);
    try {
      const cursoIdNumber = Number(formData.cursoId);
      const turnoIdNumber = Number(formData.turno);
      const moduloIdNumber = Number(formData.modulo);

      if (!cursoIdNumber || !turnoIdNumber || !moduloIdNumber) {
        addToast({
          type: 'warning',
          title: 'Campos obrigatórios',
          description:
            'Por favor, verifique se Curso, Turno e Módulo estão selecionados.',
        });
        setIsLoading(false);
        return;
      }

      const rawCep = (formData.cep || '').replace(/\D/g, '');
      const cepFinal = rawCep.length === 0 ? null : rawCep;

      const payload: any = {
        matricula: formData.matricula!,
        nomeCompleto: formData.nomeCompleto!,
        cpf: formData.cpf ? formData.cpf.replace(/\D/g, '') : null,
        celular:
          formData.celular && formData.celular.trim() !== ''
            ? formData.celular.replace(/\D/g, '')
            : null,
        email:
          formData.email && formData.email.trim() !== ''
            ? formData.email
            : null,
        data_nascimento: formData.dataNascimento,
        curso_id: cursoIdNumber,
        turno_id: turnoIdNumber,
        modulo_id: moduloIdNumber,
        cep: cepFinal,
        logradouro: formData.logradouro,
        bairro: formData.bairro,
        localidade: formData.localidade,
        uf: formData.uf,
        numero_casa: Number(formData.numero_casa) || 0,
        complemento: formData.complemento,
        penalidade: formData.penalidade,
      };

      await atualizarAluno(aluno.matricula, payload);
      addToast({
        type: 'success',
        title: 'Sucesso',
        description: 'Aluno atualizado com sucesso!',
      });
      onClose(true);
    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.mensagem ||
        'Erro desconhecido';
      addToast({
        type: 'error',
        title: 'Erro ao atualizar',
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSenha = async () => {
    if (!aluno) return;

    const confirmacao = window.confirm(
      `Tem certeza que deseja resetar a senha do aluno ${aluno.nomeCompleto}?\n\nA senha voltará a ser a matrícula: ${aluno.matricula}`,
    );

    if (confirmacao) {
      setIsLoading(true);
      try {
        await resetarSenhaAluno(aluno.matricula);
        addToast({
          type: 'success',
          title: 'Senha Resetada',
          description: `A senha do aluno foi redefinida para: ${aluno.matricula}`,
        });
      } catch (error: any) {
        console.error('Erro ao resetar senha:', error);
        addToast({
          type: 'error',
          title: 'Erro',
          description:
            error.response?.data?.mensagem || 'Erro ao resetar senha.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExcluir = async () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o aluno ${aluno.nomeCompleto}?`,
      )
    ) {
      setIsLoading(true);
      try {
        await excluirAluno(aluno.matricula);
        addToast({
          type: 'success',
          title: 'Sucesso',
          description: 'Aluno excluído com sucesso!',
        });
        onClose(true);
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

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1 flex justify-between items-center';
  const inputStyles =
    'w-full h-[38px] px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none text-sm';
  const disabledInputStyles =
    'w-full h-[38px] px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none text-sm flex items-center';

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title={isEditMode ? 'Editar Aluno' : 'Detalhes do Aluno'}
    >
      <div className="flex flex-col h-full max-h-[70vh]">
        {isLoading && !formData.matricula ? (
          <LoadingIcon />
        ) : (
          <div className="overflow-y-auto p-1 flex-grow custom-scrollbar pr-2 space-y-4">
            {formData.penalidade && formData.penalidade !== 'REGISTRO' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md mb-2">
                <p className="text-red-700 dark:text-red-400 text-sm font-bold">
                  Status: {formData.penalidade}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8 md:col-span-9">
                  <div>
                    <label htmlFor="nomeCompleto" className={labelStyles}>
                      Nome Completo
                    </label>
                    <input
                      id="nomeCompleto"
                      name="nomeCompleto"
                      type="text"
                      value={formData.nomeCompleto || ''}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      className={isEditMode ? inputStyles : disabledInputStyles}
                    />
                  </div>
                </div>

                <div className="col-span-4 md:col-span-3">
                  <div>
                    <label className={labelStyles}>Status de Penalidade</label>
                    {isEditMode ? (
                      <CustomSelect
                        value={formData.penalidade || ''}
                        onChange={(val) =>
                          handleSelectChange('penalidade', val)
                        }
                        options={penalidadeOptions}
                        placeholder="Selecione a situação"
                      />
                    ) : (
                      <div
                        className={`${disabledInputStyles} ${
                          formData.penalidade
                            ? 'text-red-600 font-bold bg-red-50 border-red-200'
                            : 'text-green-600 font-bold bg-green-50 border-green-200'
                        }`}
                      >
                        {penalidadeOptions.find(
                          (p) => p.value === formData.penalidade,
                        )?.label || 'Sem Penalidade'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="matricula" className={labelStyles}>
                    Matrícula
                  </label>
                  <input
                    id="matricula"
                    name="matricula"
                    type="text"
                    value={formData.matricula || ''}
                    disabled
                    className={disabledInputStyles}
                  />
                </div>
                <div>
                  <label htmlFor="cpf" className={labelStyles}>
                    CPF
                  </label>
                  <input
                    id="cpf"
                    name="cpf"
                    type="text"
                    value={formData.cpf || ''}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    className={isEditMode ? inputStyles : disabledInputStyles}
                  />
                </div>
                <div>
                  <label htmlFor="celular" className={labelStyles}>
                    Celular
                  </label>
                  <input
                    id="celular"
                    name="celular"
                    type="text"
                    value={formData.celular || ''}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    className={isEditMode ? inputStyles : disabledInputStyles}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEditMode ? (
                  <CustomDatePicker
                    label="Data de Nascimento"
                    value={formData.dataNascimento || ''}
                    onChange={(e) =>
                      handleSelectChange('dataNascimento', e.target.value)
                    }
                  />
                ) : (
                  <div>
                    <label className={labelStyles}>Data de Nascimento</label>
                    <div className={disabledInputStyles}>
                      {formData.dataNascimento
                        ? new Date(formData.dataNascimento).toLocaleDateString(
                            'pt-BR',
                          )
                        : '-'}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className={labelStyles}>
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    className={isEditMode ? inputStyles : disabledInputStyles}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelStyles}>Curso</label>
                {isEditMode ? (
                  <CustomSelect
                    value={formData.cursoId || ''}
                    onChange={(val) => handleSelectChange('cursoId', val)}
                    placeholder="Selecione o Curso"
                    options={cursosOptions}
                  />
                ) : (
                  <input
                    type="text"
                    value={
                      cursosOptions.find(
                        (c) => String(c.value) === String(formData.cursoId),
                      )?.label ||
                      formData.cursoId ||
                      ''
                    }
                    disabled
                    className={disabledInputStyles}
                  />
                )}
              </div>

              <div>
                <label className={labelStyles}>Turno</label>
                {isEditMode ? (
                  <CustomSelect
                    value={formData.turno || ''}
                    onChange={(val) => handleSelectChange('turno', val)}
                    placeholder="Selecione o Turno"
                    options={turnoOptions}
                  />
                ) : (
                  <input
                    type="text"
                    value={
                      turnoOptions.find(
                        (t) => String(t.value) === String(formData.turno),
                      )?.label ||
                      formData.turno ||
                      ''
                    }
                    disabled
                    className={disabledInputStyles}
                  />
                )}
              </div>

              <div>
                <label className={labelStyles}>Módulo</label>
                {isEditMode ? (
                  <CustomSelect
                    value={formData.modulo || ''}
                    onChange={(val) => handleSelectChange('modulo', val)}
                    placeholder="Selecione o Módulo"
                    options={modulosOptions}
                  />
                ) : (
                  <input
                    type="text"
                    value={
                      modulosOptions.find(
                        (m) => String(m.value) === String(formData.modulo),
                      )?.label ||
                      formData.modulo ||
                      ''
                    }
                    disabled
                    className={disabledInputStyles}
                  />
                )}
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700 my-2" />

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4 md:col-span-3">
                <label htmlFor="cep" className={labelStyles}>
                  CEP
                </label>
                <input
                  id="cep"
                  name="cep"
                  type="text"
                  value={formData.cep || ''}
                  onChange={handleCepChange}
                  maxLength={9}
                  disabled={!isEditMode}
                  className={isEditMode ? inputStyles : disabledInputStyles}
                />
              </div>
              <div className="col-span-8 md:col-span-9">
                <label htmlFor="logradouro" className={labelStyles}>
                  Logradouro
                </label>
                <input
                  id="logradouro"
                  name="logradouro"
                  type="text"
                  value={formData.logradouro || ''}
                  onChange={handleChange}
                  disabled={!isEditMode || isCepLoading}
                  className={
                    !isEditMode || isCepLoading
                      ? disabledInputStyles
                      : inputStyles
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-5">
                <label htmlFor="bairro" className={labelStyles}>
                  Bairro
                </label>
                <input
                  id="bairro"
                  name="bairro"
                  type="text"
                  value={formData.bairro || ''}
                  onChange={handleChange}
                  disabled={!isEditMode || isCepLoading}
                  className={
                    !isEditMode || isCepLoading
                      ? disabledInputStyles
                      : inputStyles
                  }
                />
              </div>
              <div className="col-span-5">
                <label htmlFor="localidade" className={labelStyles}>
                  Cidade
                </label>
                <input
                  id="localidade"
                  name="localidade"
                  type="text"
                  value={formData.localidade || ''}
                  onChange={handleChange}
                  disabled={!isEditMode || isCepLoading}
                  className={
                    !isEditMode || isCepLoading
                      ? disabledInputStyles
                      : inputStyles
                  }
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="uf" className={labelStyles}>
                  UF
                </label>
                <input
                  id="uf"
                  name="uf"
                  type="text"
                  value={formData.uf || ''}
                  onChange={handleChange}
                  disabled={!isEditMode || isCepLoading}
                  className={
                    !isEditMode || isCepLoading
                      ? disabledInputStyles
                      : inputStyles
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label htmlFor="numero_casa" className={labelStyles}>
                  Número
                </label>
                <input
                  id="numero_casa"
                  name="numero_casa"
                  type="number"
                  value={formData.numero_casa || ''}
                  onChange={handleChange}
                  disabled={!isEditMode}
                  className={isEditMode ? inputStyles : disabledInputStyles}
                />
              </div>
              <div className="col-span-8">
                <label htmlFor="complemento" className={labelStyles}>
                  Complemento
                </label>
                <input
                  id="complemento"
                  name="complemento"
                  type="text"
                  value={formData.complemento || ''}
                  onChange={handleChange}
                  disabled={!isEditMode}
                  className={isEditMode ? inputStyles : disabledInputStyles}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <button
            onClick={handleExcluir}
            disabled={isLoading || isEditMode}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
          >
            Excluir Aluno
          </button>

          {isEditMode ? (
            <button
              onClick={handleSalvar}
              disabled={isLoading}
              className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 disabled:bg-gray-400 shadow-md"
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleResetSenha}
                className="flex items-center gap-2 bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 shadow-md"
                title="Resetar senha para a matrícula"
              >
                <LockIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Resetar Senha</span>
              </button>

              <button
                onClick={() => setIsEditMode(true)}
                className="bg-lumi-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-lumi-primary-hover shadow-md"
              >
                Editar Cadastro
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
