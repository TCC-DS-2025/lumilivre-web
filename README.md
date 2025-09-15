# LumiLivre - Aplicação Frontend

Repositório do frontend da aplicação LumiLivre, desenvolvido para a interface de administração do sistema bibliotecário.

## Visão Geral da Tecnologia

- **Framework**: React 19
- **Linguagem**: TypeScript
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS
- **Roteamento**: React Router
- **Cliente HTTP**: Axios
- **Gerenciamento de Estado**: React Context API

---

## 🚀 Como Rodar o Projeto Localmente

Siga estes passos para configurar e executar o frontend na sua máquina.

### 1. Pré-requisitos

Garanta que você tenha as seguintes ferramentas instaladas:

| Ferramenta | Versão Mínima | Instalação (Windows - via [Chocolatey](https://chocolatey.org/)) | Instalação (Linux - via apt/dnf)                                |
| ---------- | ------------- | --------------------------------------------------------------- | -------------------------------------------------------------- |
| **Node.js**| `^18.x`        | `choco install nodejs-lts`                                      | Gerenciado via `nvm` (Node Version Manager) é o recomendado. |
| **Git**    | `^2.x`         | `choco install git`                                             | `sudo apt-get install git` ou `sudo dnf install git`           |

**Verificação:**
Após a instalação, abra um novo terminal e verifique as versões com:
```bash
node -v
npm -v
git --version
```

### 2. Configuração do Ambiente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/TCC-DS-2025/lumilivre-web
    cd lumilivre-web
    ```

2.  **Instale as dependências:**
    Bibliotecas listadas no `package.json` para a pasta `node_modules`.
    ```bash
    npm install
    ```

3.  **Configure a Conexão com a API:**
    A aplicação precisa saber onde o backend está rodando.
    *   Crie um arquivo na raiz do projeto chamado `.env.local`.
    *   Adicione a seguinte linha a este arquivo, apontando para a URL do seu backend (exemplo local):
        ```
        VITE_API_BASE_URL=http://localhost:8080
        ```
    *O arquivo `.env.local` é ignorado pelo Git para não expor URLs ou chaves sensíveis.*

### 3. Executando a Aplicação

Com tudo configurado, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O servidor iniciará e a aplicação estará disponível, geralmente no endereço **[http://localhost:5173](http://localhost:5173)**. O terminal indicará a URL exata. A página abrirá automaticamente no seu navegador e será recarregada a cada alteração.

---

## 🏗️ Estrutura do Projeto

O código-fonte está organizado na pasta `src/` da seguinte maneira:

- **/assets**: Contém todos os arquivos estáticos, como imagens e ícones SVG.
- **/components**: Componentes React reutilizáveis em toda a aplicação (ex: `Sidebar`, `Header`, `Icon`).
- **/contexts**: Gerenciadores de estado global, como `AuthContext` (autenticação) e `ThemeContext` (modo claro/escuro).
- **/layouts**: Componentes que definem a estrutura de layout das páginas (ex: `MainLayout` com header e sidebar).
- **/pages**: Componentes que representam as páginas completas da aplicação (ex: `LoginPage`, `DashboardPage`).
- **/services**: Camada de comunicação com a API. Contém a lógica do Axios para fazer as requisições ao backend.