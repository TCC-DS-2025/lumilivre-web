import api from './api';

interface LoginCredentials {
  user: string;
  senha: string;
}

interface LoginResponse {
  id: number;
  email: string;
  role: string;
  matriculaAluno?: string;
  token: string;
}

export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const requestPasswordReset = async (
  email: string,
): Promise<{ mensagem: string }> => {
  try {
    const response = await api.post('/auth/esqueci-senha', { email });
    return response.data;
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    return {
      mensagem:
        'Se um e-mail correspondente for encontrado, um link para redefinição será enviado.',
    };
  }
};

export const validarTokenReset = async (token: string): Promise<boolean> => {
  try {
    const response = await api.get(`/auth/validar-token/${token}`);
    return response.data.valido === true;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return false;
  }
};

export const mudarSenhaComToken = async (
  token: string,
  novaSenha: string,
): Promise<any> => {
  try {
    const response = await api.post('/auth/mudar-senha', { token, novaSenha });
    return response.data;
  } catch (error) {
    console.error('Erro ao mudar a senha:', error);
    throw error;
  }
};
