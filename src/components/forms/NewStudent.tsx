import { useState, useEffect } from 'react';

import { cadastrarAluno } from '../../services/alunoService';
import { buscarEnderecoPorCep } from '../../services/cepService';
import { buscarCursos, cadastrarCurso } from '../../services/cursoService';
import {
  buscarModulos,
  cadastrarModulo,
  type Modulo,
} from '../../services/moduloService';
import {
  buscarTurnos,
  cadastrarTurno,
  type Turno,
} from '../../services/turnoService';

import { CustomSelect } from '../CustomSelect';
import { CustomDatePicker } from '../CustomDatePicker';

interface Option {
  label: string;
  value: string | number;
}

interface FormData {
  matricula: string;
  nomeCompleto: string;
  cpf: string;
  celular: string;
  dataNascimento: string;
  email: string;
  cursoId: string | number;
  turnoId: string | number;
  moduloId: string | number;
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  numero_casa: string;
  complemento: string;
}

const estadoInicial: FormData = {
  matricula: '',
  nomeCompleto: '',
  cpf: '',
  celular: '',
  dataNascimento: '',
  email: '',
  cursoId: '',
  turnoId: '',
  moduloId: '',
  cep: '',
  logradouro: '',
  bairro: '',
  localidade: '',
  uf: '',
  numero_casa: '',
  complemento: '',
};

export function NovoAluno({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<FormData>(estadoInicial);
  const [isLoading, setIsLoading] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);

  const [cursosOptions, setCursosOptions] = useState<Option[]>([]);
  const [modulosOptions, setModulosOptions] = useState<Option[]>([]);
  const [turnoOptions, setTurnoOptions] = useState<Option[]>([]);

  const [isNovoCurso, setIsNovoCurso] = useState(false);
  const [novoCursoInput, setNovoCursoInput] = useState('');
  const [isNovoTurno, setIsNovoTurno] = useState(false);
  const [novoTurnoInput, setNovoTurnoInput] = useState('');
  const [isNovoModulo, setIsNovoModulo] = useState(false);
  const [novoModuloInput, setNovoModuloInput] = useState('');

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [cursosRes, modulosRes, turnosRes] = await Promise.all([
          buscarCursos(),
          buscarModulos(),
          buscarTurnos(),
        ]);

        setCursosOptions(
          cursosRes.content.map((c) => ({ label: c.nome, value: c.id })),
        );

        setModulosOptions(
          modulosRes.map((m: Modulo) => ({ label: m.nome, value: m.id })),
        );

        setTurnoOptions(
          turnosRes.map((t: Turno) => ({ label: t.nome, value: t.id })),
        );
      } catch (error) {
        console.warn('Erro ao carregar dados dos selects', error);
      }
    };
    carregarDados();
  }, []);

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
        if ((endereco as any).erro) {
          alert('CEP não encontrado.');
        } else {
          setFormData((prev) => ({
            ...prev,
            logradouro: endereco.logradouro || '',
            bairro: endereco.bairro || '',
            localidade: endereco.localidade || '',
            uf: endereco.uf || '',
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP', error);
      } finally {
        setIsCepLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalCursoId = formData.cursoId ? Number(formData.cursoId) : null;
      let finalTurnoId = formData.turnoId ? Number(formData.turnoId) : null;
      let finalModuloId = formData.moduloId ? Number(formData.moduloId) : null;

      if (isNovoTurno) {
        if (!novoTurnoInput.trim()) {
          alert('Digite o nome do novo turno.');
          setIsLoading(false);
          return;
        }
        const novoTurno = await cadastrarTurno({ nome: novoTurnoInput });
        finalTurnoId = novoTurno.id;
      }

      if (isNovoModulo) {
        if (!novoModuloInput.trim()) {
          alert('Digite o nome do novo módulo.');
          setIsLoading(false);
          return;
        }
        const novoModulo = await cadastrarModulo({ nome: novoModuloInput });
        finalModuloId = novoModulo.id;
      }

      if (isNovoCurso) {
        if (!novoCursoInput.trim()) {
          alert('Digite o nome do novo curso.');
          setIsLoading(false);
          return;
        }
        if (!finalTurnoId || !finalModuloId) {
          alert('Para criar um curso, Turno e Módulo são obrigatórios.');
          setIsLoading(false);
          return;
        }

        const novoCurso = await cadastrarCurso({
          nome: novoCursoInput,
          turno: String(finalTurnoId),
          modulo: String(finalModuloId),
        });
        finalCursoId = novoCurso.id;
      }

      if (!finalCursoId || !finalTurnoId || !finalModuloId) {
        alert('Por favor, preencha Curso, Turno e Módulo.');
        setIsLoading(false);
        return;
      }

      const dataParaApi = {
        matricula: formData.matricula,
        nomeCompleto: formData.nomeCompleto,
        cpf: formData.cpf ? formData.cpf.replace(/\D/g, '') : null,
        celular:
          formData.celular && formData.celular.trim() !== ''
            ? formData.celular.replace(/\D/g, '')
            : null,
        email:
          formData.email && formData.email.trim() !== ''
            ? formData.email
            : null,
        dataNascimento: formData.dataNascimento,
        curso_id: finalCursoId,
        turno_id: finalTurnoId,
        modulo_id: finalModuloId,
        cep: formData.cep ? formData.cep.replace(/\D/g, '') : null,
        logradouro: formData.logradouro,
        bairro: formData.bairro,
        localidade: formData.localidade,
        uf: formData.uf,
        numero_casa: Number(formData.numero_casa) || 0,
        complemento: formData.complemento,
      };

      await cadastrarAluno(dataParaApi as any);

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      const msg =
        error.response?.data?.mensagem || 'Erro desconhecido ao salvar aluno.';
      alert(`Falha no cadastro: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Estilos
  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1 flex justify-between items-center';
  const linkActionStyles =
    'text-xs text-lumi-primary dark:text-lumi-label cursor-pointer hover:underline font-bold ml-2';
  const inputStyles =
    'w-full h-[38px] px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none text-sm';
  const disabledInputStyles =
    'w-full h-[38px] px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none text-sm flex items-center';
  const buttonClass =
    'w-full bg-lumi-primary hover:bg-lumi-primary-hover active:bg-purple-900 text-white text-[17px] font-bold py-3.5 px-4 border-2 border-transparent rounded-lg shadow-md transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumi-primary disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none tracking-wide';

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      <div className="overflow-y-auto p-1 flex-grow custom-scrollbar pr-2">
        <form
          id="form-novo-aluno"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="nomeCompleto" className={labelStyles}>
                Nome Completo*
              </label>
              <input
                id="nomeCompleto"
                name="nomeCompleto"
                type="text"
                value={formData.nomeCompleto}
                onChange={handleChange}
                className={inputStyles}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="matricula" className={labelStyles}>
                  Matrícula*
                </label>
                <input
                  id="matricula"
                  name="matricula"
                  type="text"
                  value={formData.matricula}
                  onChange={handleChange}
                  placeholder="Ex: 24777"
                  className={inputStyles}
                  required
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
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  className={inputStyles}
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
                  value={formData.celular}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className={inputStyles}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomDatePicker
                label="Data de Nascimento"
                value={formData.dataNascimento}
                onChange={(e) =>
                  handleSelectChange('dataNascimento', e.target.value)
                }
              />
              <div>
                <label htmlFor="email" className={labelStyles}>
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemplo@etec.sp.gov.br"
                  className={inputStyles}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className={labelStyles}>
                <span>Curso*</span>
                <span
                  onClick={() => setIsNovoCurso(!isNovoCurso)}
                  className={linkActionStyles}
                >
                  {isNovoCurso ? 'Selecionar existente' : 'Novo?'}
                </span>
              </div>
              {isNovoCurso ? (
                <input
                  type="text"
                  value={novoCursoInput}
                  onChange={(e) => setNovoCursoInput(e.target.value)}
                  className={inputStyles}
                  placeholder="Nome do novo curso"
                />
              ) : (
                <CustomSelect
                  value={formData.cursoId}
                  onChange={(val) => handleSelectChange('cursoId', val)}
                  options={cursosOptions}
                  placeholder="Selecione o Curso"
                />
              )}
            </div>

            <div>
              <div className={labelStyles}>
                <span>Turno*</span>
                <span
                  onClick={() => setIsNovoTurno(!isNovoTurno)}
                  className={linkActionStyles}
                >
                  {isNovoTurno ? 'Selecionar existente' : 'Novo?'}
                </span>
              </div>
              {isNovoTurno ? (
                <input
                  type="text"
                  value={novoTurnoInput}
                  onChange={(e) => setNovoTurnoInput(e.target.value)}
                  className={inputStyles}
                  placeholder="Nome do novo turno"
                />
              ) : (
                <CustomSelect
                  value={formData.turnoId}
                  onChange={(val) => handleSelectChange('turnoId', val)}
                  options={turnoOptions}
                  placeholder="Selecione o turno"
                />
              )}
            </div>

            <div>
              <div className={labelStyles}>
                <span>Módulo*</span>
                <span
                  onClick={() => setIsNovoModulo(!isNovoModulo)}
                  className={linkActionStyles}
                >
                  {isNovoModulo ? 'Selecionar existente' : 'Novo?'}
                </span>
              </div>
              {isNovoModulo ? (
                <input
                  type="text"
                  value={novoModuloInput}
                  onChange={(e) => setNovoModuloInput(e.target.value)}
                  className={inputStyles}
                  placeholder="Nome do novo módulo"
                />
              ) : (
                <CustomSelect
                  value={formData.moduloId}
                  onChange={(val) => handleSelectChange('moduloId', val)}
                  options={modulosOptions}
                  placeholder="Selecione o módulo"
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
                value={formData.cep}
                onChange={handleCepChange}
                maxLength={9}
                placeholder="00000-000"
                className={inputStyles}
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
                value={formData.logradouro}
                onChange={handleChange}
                disabled={isCepLoading}
                className={isCepLoading ? disabledInputStyles : inputStyles}
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
                value={formData.bairro}
                onChange={handleChange}
                disabled={isCepLoading}
                className={isCepLoading ? disabledInputStyles : inputStyles}
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
                value={formData.localidade}
                onChange={handleChange}
                disabled={isCepLoading}
                className={isCepLoading ? disabledInputStyles : inputStyles}
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
                value={formData.uf}
                onChange={handleChange}
                disabled={isCepLoading}
                className={isCepLoading ? disabledInputStyles : inputStyles}
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
                value={formData.numero_casa}
                onChange={handleChange}
                className={inputStyles}
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
                value={formData.complemento}
                onChange={handleChange}
                className={inputStyles}
              />
            </div>
          </div>
        </form>
      </div>

      <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-700 shrink-0">
        <button
          type="submit"
          form="form-novo-aluno"
          disabled={isLoading || isCepLoading}
          className={buttonClass}
        >
          {isLoading
            ? 'SALVANDO...'
            : isCepLoading
              ? 'BUSCANDO CEP...'
              : 'CADASTRAR ALUNO'}
        </button>
      </div>
    </div>
  );
}
