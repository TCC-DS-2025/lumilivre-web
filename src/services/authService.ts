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

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};