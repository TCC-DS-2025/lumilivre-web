interface LoginCredentials {
  usuario: string;
  senha: string;
}

// funçao de login simulada
export const login = (credentials: LoginCredentials) => {
  console.log("MOCK LOGIN: Recebido", credentials);

  // Promise para simular uma chamada de rede
  return new Promise((resolve, reject) => {
    
    // atraso de 1.5 segundos para dar a sensaçao de carregamento
    setTimeout(() => {
      // se o usuário for 'admin' e a senha '1234'
      if (credentials.usuario === 'admin' && credentials.senha === '1234') {
        console.log("MOCK LOGIN: Sucesso!");
        // login real: backend retornaria um token e dados do usuário
        // simulacao:
        resolve({
          token: 'jwt-token-simulado-123456',
          user: {
            nome: 'Admin da Biblioteca',
            email: 'admin@lumilivre.com',
            role: 'ADMIN'
          }
        });
      } else {
        console.error("MOCK LOGIN: Falha!");
        reject({
          message: 'Usuário ou senha inválidos.'
        });
      }
    }, 1500); // 1500ms = 1.5 segundos
  });
};