import { useState, useEffect, type ReactNode } from 'react';
import addIconUrl from '../../assets/icons/add.svg';
// import { buscarEnderecoPorCep } from '../../services/cepService';
// import { buscarCursos } from '../../services/cursoService';

interface FormData {
  matricula: string;
  nomeCompleto: string;
  cpf: string;
  celular: string;
  dataNascimento: string;
  email: string;
  cursoId: string;
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  numero: string;
  complemento: string;
}

interface Curso {
  id: number;
  nome: string;
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
    'w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition-all duration-200';

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

export function NovoAluno({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState<FormData>({
    matricula: '',
    nomeCompleto: '',
    cpf: '',
    celular: '',
    dataNascimento: '',
    email: '',
    cursoId: '',
    cep: '',
    logradouro: '',
    bairro: '',
    localidade: '',
    uf: '',
    numero: '',
    complemento: '',
  });

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isCepLoading, setIsCepLoading] = useState(false);

  useEffect(() => {
    // Mock para cursos
    setCursos([
      { id: 1, nome: 'Desenvolvimento de Sistemas' },
      { id: 2, nome: 'Enfermagem' },
      { id: 3, nome: 'Administração' },
    ]);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // lógica de CEP
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const [nome, ...sobrenomeArray] = formData.nomeCompleto.split(' ');
    const sobrenome = sobrenomeArray.join(' ');
    const dataParaApi = { ...formData, nome, sobrenome };
    delete (dataParaApi as any).nomeCompleto;
    console.log('Dados prontos para enviar para a API:', dataParaApi);
  };

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 dark:text-white';
  const inputStyles =
    'w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-lumi-primary focus:border-lumi-primary outline-none transition-all duration-200 select-none';

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      <div className="overflow-y-auto p-2 pt-0 flex-grow">
        <form
          id="form-novo-aluno"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
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
                <div>
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
                <div>
                  <label htmlFor="cursoId" className={labelStyles}>
                    Curso*
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
                      id="cursoId"
                      name="cursoId"
                      value={formData.cursoId}
                      onChange={handleChange}
                      className={inputStyles}
                      required
                    >
                      <option value="">Selecione um curso</option>
                      {cursos.map((curso) => (
                        <option key={curso.id} value={curso.id}>
                          {curso.nome}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="bg-gray-400 dark:bg-transparent p-1 dark:p-0 rounded-md hover:opacity-75 transition-all transform hover:scale-110 duration-200"
                    >
                      <img
                        src={addIconUrl}
                        alt="Adicionar Curso"
                        className="w-8 h-8"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

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
                <label htmlFor="numero" className={labelStyles}>
                  Número
                </label>
                <input
                  id="numero"
                  name="numero"
                  type="text"
                  value={formData.numero}
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

      <button
        type="submit"
        form="form-novo-aluno"
        className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md shadow-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumi-primary disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
      >
        SALVAR
      </button>
    </div>
  );
}
