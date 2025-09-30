import axios from 'axios';

interface Endereco {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export const buscarEnderecoPorCep = async (cep: string): Promise<Endereco> => {
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    if (response.data.erro) {
      throw new Error('CEP não encontrado.');
    }
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    throw error;
  }
};
