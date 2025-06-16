import api from './api';

interface LoginCredentials {
  usuario: string;
  senha: string;
}

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post('/login', credentials);
    
    return response.data;

  } catch (error) {
    console.error("Erro no login:", error);
    throw error;
  }
};