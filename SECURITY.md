# Política de Segurança - Lumi Livre Web

Este documento descreve as principais medidas e políticas de segurança implementadas no frontend da aplicação Lumi Livre.

## Visão Geral da Arquitetura de Segurança

Nossa segurança da aplicação é baseada em um fluxo de autenticação via **JSON Web Tokens (JWT)**, garantindo que o acesso aos dados e funcionalidades seja estritamente controlado.

## Mecanismos de Segurança Implementados

### 1. Autenticação via JWT

- **Fluxo de Login:** A autenticação é realizada através de um endpoint seguro no backend (`/auth/login`). O frontend envia as credenciais do usuário (usuário e senha) via HTTPS.
- **Armazenamento do Token:** Após um login bem-sucedido, o token JWT retornado pela API é armazenado de forma segura no `localStorage` do navegador. Este token é essencial para autenticar requisições subsequentes.
- **Envio do Token:** Para cada requisição a um endpoint protegido, o token JWT é enviado no cabeçalho `Authorization` com o prefixo `Bearer`, seguindo o padrão de mercado.

### 2. Gerenciamento de Sessão e Rotas Protegidas

- **Estado de Autenticação:** O estado de login do usuário é gerenciado globalmente através do `AuthContext` do React.
- **Persistência de Sessão:** A sessão do usuário é mantida entre recarregamentos da página, lendo o token do `localStorage` na inicialização da aplicação.
- **Rotas Protegidas:** O acesso a páginas sensíveis (como o Dashboard e todas as telas de gerenciamento) é controlado pelo componente `ProtectedRoute`. Este componente verifica se o usuário está autenticado. Caso contrário, o usuário é automaticamente redirecionado para a página de login.
- **Logout Seguro:** A função de logout remove o token JWT do `localStorage` e limpa o estado de autenticação, encerrando a sessão do usuário de forma segura.

### 3. Comunicação Segura com a API

- **Variáveis de Ambiente:** A URL base da API é armazenada em variáveis de ambiente (`.env.local` para desenvolvimento e configurada na Vercel para produção), evitando que URLs sensíveis sejam expostas diretamente no código-fonte.
- **HTTPS:** Em produção, a comunicação entre o frontend (hospedado na Vercel) e o backend deve ser feita exclusivamente via HTTPS para criptografar todo o tráfego de dados.
- **CORS (Cross-Origin Resource Sharing):** A política de CORS é gerenciada no backend, garantindo que apenas origens autorizadas (como a URL do nosso frontend na Vercel) possam fazer requisições à API.

### 4. Fluxo de Redefinição de Senha

- **Solicitação Segura:** O fluxo de "esqueci a senha" não confirma se um e-mail existe no sistema, prevenindo a enumeração de usuários.
- **Token de Uso Único:** O backend gera um token de redefinição seguro, de curta duração e de uso único, que é enviado para o e-mail do usuário.
- **Validação:** O frontend valida este token com a API antes de permitir que o usuário defina uma nova senha.

## Reportando uma Vulnerabilidade

Levamos a segurança a sério. Se você acredita ter encontrado uma vulnerabilidade de segurança, por favor, entre em contato diretamente com os membros da equipe do projeto. Não divulgue a vulnerabilidade publicamente até que ela tenha sido corrigida.