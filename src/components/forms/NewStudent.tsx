import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import addIconUrl from '../../assets/icons/add.svg';

import { cadastrarAluno } from '../../services/alunoService';
import { buscarEnderecoPorCep } from '../../services/cepService';
import {
  buscarCursos,
  cadastrarCurso,
  type CursoPayload,
} from '../../services/cursoService';
import { buscarModulos } from '../../services/moduloService';

interface Curso {
  id: number;
  nome: string;
}

interface FormData {
  matricula: string;
  nomeCompleto: string;
  cpf: string;
  celular: string;
  dataNascimento: string;
  email: string;
  cursoId: string;
  turno: string;
  modulo: string;
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  numero_casa: string;
  complemento: string;
}

const FormInput = ({
  label,
  id,
  required = false,
  ...props
}: {
  label: string;
  id: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1';
  const inputStyles =
    'w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none';

  return (
    <div>
      <label htmlFor={id} className={labelStyles}>
        {label}
        {required && '*'}
      </label>
      <input
        id={id}
        name={id}
        {...props}
        className={inputStyles}
        required={required}
      />
    </div>
  );
};

export function NovoAluno({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isNovoCursoModuloModalOpen, setIsNovoCursoModuloModalOpen] =
    useState(false);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [novoCursoNome, setNovoCursoNome] = useState('');
  const [modulos, setModulos] = useState<string[]>([]);
  const [novoModuloNome, setNovoModuloNome] = useState('');

  const [isCepLoading, setIsCepLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    matricula: '',
    nomeCompleto: '',
    cpf: '',
    celular: '',
    dataNascimento: '',
    email: '',
    cursoId: '',
    turno: '',
    modulo: '',
    cep: '',
    logradouro: '',
    bairro: '',
    localidade: '',
    uf: '',
    numero_casa: '',
    complemento: '',
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [cursosDaApi, modulosResponse] = await Promise.all([
          buscarCursos(),
          buscarModulos(),
        ]);
        setCursos(cursosDaApi.content);
        setModulos(modulosResponse);
      } catch (error) {
        console.warn('Cursos ou módulos indisponíveis na api', error);
      }
    };
    carregarDados();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // envia os dados de cadastro do aluno para a api
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const dataParaApi = {
      matricula: formData.matricula,
      nomeCompleto: formData.nomeCompleto,
      cpf: formData.cpf.replace(/\D/g, ''),
      celular: formData.celular.replace(/\D/g, ''),
      dataNascimento: formData.dataNascimento,
      email: formData.email,
      cursoId: Number(formData.cursoId),
      cep: formData.cep,
      numero_casa: Number(formData.numero_casa),
      complemento: formData.complemento,
    };

    try {
      await cadastrarAluno(dataParaApi);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao cadastrar aluno:', error);
      alert(
        `Falha no cadastro: ${error.response?.data?.mensagem || 'Erro desconhecido'}`,
      );
    }
  };

  // logica para o preenchimento dos campos de endereço pelo cep
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCep = e.target.value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, cep: newCep }));

    if (newCep.length === 8) {
      setIsCepLoading(true);
      try {
        const endereco = await buscarEnderecoPorCep(newCep);
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

  // envia os dados de cadastro do curso para a api
  const handleCriarCurso = async () => {
    if (!novoCursoNome || !formData.turno || !formData.modulo) {
      alert(
        'Para criar um novo curso, preencha o nome do curso, e selecione um turno e um módulo no formulário principal.',
      );
      return;
    }
    try {
      const payload: CursoPayload = {
        nome: novoCursoNome,
        turno: formData.turno,
        modulo: formData.modulo,
      };
      const novoCurso = await cadastrarCurso(payload);
      setCursos((prevCursos) => [...prevCursos, novoCurso]);
      setFormData((prevData) => ({
        ...prevData,
        cursoId: String(novoCurso.id),
      }));
      setNovoCursoNome('');
      setIsNovoCursoModuloModalOpen(false);
    } catch (error) {
      console.error('Erro ao criar curso:', error);
    }
  };

  const handleCriarModulo = async () => {
    if (!novoModuloNome.trim() || modulos.includes(novoModuloNome.trim())) {
      setNovoModuloNome('');
      return;
    }

    const novoModulo = novoModuloNome.trim();

    setModulos((prev) => [...prev, novoModulo].sort());

    setFormData((prev) => ({ ...prev, modulo: novoModulo }));

    setNovoModuloNome('');
    setIsNovoCursoModuloModalOpen(false);
  };

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 dark:text-white';
  const inputStyles =
    'w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none select-none';

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      <div className="overflow-y-auto p-2 pt-0 flex-grow">
        <form
          id="form-novo-aluno"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* campos dados pessoais */}
          <section>
            <div className="space-y-4">
              <FormInput
                label="Nome Completo"
                id="nomeCompleto"
                type="text"
                value={formData.nomeCompleto}
                onChange={handleChange}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Matrícula"
                  id="matricula"
                  type="text"
                  value={formData.matricula}
                  onChange={handleChange}
                  placeholder="24777"
                  required
                />
                <FormInput
                  label="CPF"
                  id="cpf"
                  type="text"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  required
                />
                <FormInput
                  label="Celular"
                  id="celular"
                  type="text"
                  value={formData.celular}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
                <FormInput
                  label="Data de Nascimento"
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                />
                <div className="md:col-span-2">
                  <label htmlFor="email" className={labelStyles}>
                    E-mail*
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemplo@etec.gov.sp.com.br"
                    className={inputStyles}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_0.5fr_auto] gap-2 items-end">
                    <div>
                      <label htmlFor="cursoId" className={labelStyles}>
                        Curso*
                      </label>
                      <select
                        id="cursoId"
                        name="cursoId"
                        value={formData.cursoId}
                        onChange={handleChange}
                        className={inputStyles}
                        required
                      >
                        <option value="">Selecione</option>
                        {cursos.map((curso) => (
                          <option key={curso.id} value={curso.id}>
                            {curso.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="turno" className={labelStyles}>
                        Turno*
                      </label>
                      <select
                        id="turno"
                        name="turno"
                        className={inputStyles}
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="MANHA">Manhã</option>
                        <option value="TARDE">Tarde</option>
                        <option value="NOITE">Noite</option>
                        <option value="INTEGRAL">Integral</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="modulo" className={labelStyles}>
                        Módulo*
                      </label>
                      <select
                        id="modulo"
                        name="modulo"
                        value={formData.modulo}
                        onChange={handleChange}
                        className={inputStyles}
                        required
                      >
                        <option value="">Selecione</option>
                        {modulos.map((mod) => (
                          <option key={mod} value={mod}>
                            {' '}
                            {mod}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsNovoCursoModuloModalOpen(true)}
                      className="p-2 mb-0.5 bg-gray-400 dark:bg-transparent rounded-md hover:opacity-75 transform hover:scale-110"
                    >
                      <img
                        src={addIconUrl}
                        alt="Adicionar Curso"
                        className="w-6 h-6"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* campos do endereço */}
          <section className="pt-4 border-t dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <FormInput
                  label="CEP"
                  id="cep"
                  type="text"
                  value={formData.cep}
                  onChange={handleCepChange}
                  maxLength={8}
                  placeholder="00000-000"
                />
              </div>
              <div className="md:col-span-4">
                <FormInput
                  label="Logradouro"
                  id="logradouro"
                  type="text"
                  value={formData.logradouro}
                  onChange={handleChange}
                  placeholder="Rua João Batista Soares"
                  disabled={isCepLoading}
                />
              </div>
              <div className="md:col-span-3">
                <label htmlFor="bairro" className={labelStyles}>
                  Bairro
                </label>
                <input
                  id="bairro"
                  name="bairro"
                  type="text"
                  value={formData.bairro}
                  onChange={handleChange}
                  placeholder="Centro"
                  disabled={isCepLoading}
                  className={`${inputStyles} disabled:bg-gray-100 dark:disabled:bg-gray-700`}
                />
              </div>
              <div className="md:col-span-3">
                <label htmlFor="localidade" className={labelStyles}>
                  Cidade
                </label>
                <input
                  id="localidade"
                  name="localidade"
                  type="text"
                  value={formData.localidade}
                  onChange={handleChange}
                  placeholder="Barueri"
                  disabled={isCepLoading}
                  className={`${inputStyles} disabled:bg-gray-100 dark:disabled:bg-gray-700`}
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="uf" className={labelStyles}>
                  UF
                </label>
                <input
                  id="uf"
                  name="uf"
                  type="text"
                  value={formData.uf}
                  onChange={handleChange}
                  placeholder="SP"
                  disabled={isCepLoading}
                  className={`${inputStyles} disabled:bg-gray-100 dark:disabled:bg-gray-700`}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="numero_casa" className={labelStyles}>
                  Número
                </label>
                <input
                  id="numero_casa"
                  name="numero_casa"
                  type="number"
                  value={formData.numero_casa}
                  onChange={handleChange}
                  placeholder="123"
                  className={inputStyles}
                />
              </div>
              <div className="md:col-span-3">
                <label htmlFor="complemento" className={labelStyles}>
                  Complemento
                </label>
                <input
                  id="complemento"
                  name="complemento"
                  type="text"
                  value={formData.complemento}
                  onChange={handleChange}
                  placeholder="Apto, Bloco, etc."
                  className={inputStyles}
                />
              </div>
            </div>
          </section>
        </form>
      </div>

      {/* modal para criação de curso, turno e módulo */}
      <Modal
        isOpen={isNovoCursoModuloModalOpen}
        onClose={() => setIsNovoCursoModuloModalOpen(false)}
        title="Gerenciamento de Cursos"
      >
        <div className="space-y-6">
          <p className="text-sm text-center text-gray-600 dark:text-gray-400 -mt-2">
            Não encontrou nas listas de seleção o que precisa? Cadastre por aqui
            seu Curso, Turno e ou Módulo, os mesmo ficarão disponíveis
            imediatamente.
          </p>

          <div className="space-y-2">
            <label
              htmlFor="novoCursoNome"
              className="block text-sm font-medium text-gray-700 dark:text-white"
            >
              Novo Curso
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="novoCursoNome"
                type="text"
                placeholder="Ex: Logística"
                value={novoCursoNome}
                onChange={(e) => setNovoCursoNome(e.target.value)}
                className="w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-lumi-primary outline-none"
              />
              <button
                type="button"
                onClick={handleCriarCurso}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-md shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumi-primary disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-x-2">
                  <img
                    src={addIconUrl}
                    alt="Icone de adicionar"
                    className="w-6 h-6"
                  />
                  <span>CRIAR</span>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="novoModuloNome"
              className="block text-sm font-medium text-gray-700 dark:text-white"
            >
              Novo Módulo
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="novoModuloNome"
                type="text"
                placeholder="Ex: 4º Módulo"
                value={novoModuloNome}
                onChange={(e) => setNovoModuloNome(e.target.value)}
                className="w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-lumi-primary outline-none"
              />
              <button
                type="button"
                onClick={handleCriarModulo}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-md shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumi-primary disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-x-2">
                  <img
                    src={addIconUrl}
                    alt="Icone de adicionar"
                    className="w-6 h-6"
                  />
                  <span>CRIAR</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <button
        type="submit"
        form="form-novo-aluno"
        disabled={isCepLoading}
        className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md shadow-md disabled:bg-gray-400"
      >
        {isCepLoading ? 'Buscando CEP...' : 'SALVAR'}
      </button>
    </div>
  );
}
