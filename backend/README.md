# HustlerShop MZ - Backend API

API REST premium desenvolvida com Node.js, Express e integração total com Appwrite.

## 🚀 Como Executar

1. **Pré-requisitos**: Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em sua máquina.
2. **Instalação**: No terminal, dentro da pasta `backend`, execute:
   ```bash
   npm install
   ```
3. **Configuração**: Verifique o arquivo `.env` para garantir que as variáveis `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY` e `APPWRITE_DATABASE_ID` estão corretas.
4. **Banco de Dados**: Crie as Collections no Appwrite Database conforme o guia do projeto (ex.: `profiles`, `products`, `orders`, `order_items`).
5. **Execução**:
   ```bash
   npm run dev
   ```

## 🛠️ Estrutura do Projeto

- `src/app.js`: Ponto de entrada da aplicação.
- `src/middleware/`: Filtros de autenticação, permissões admin e tratamento de erros.
- `src/routes/`: Definição de endpoints para Auth, Produtos, Pedidos e Pagamentos.
- `src/config/`: Configurações de conexão com Appwrite.

## 🔐 Segurança

- **JWT**: Utilizado para proteger rotas e carregar a role do usuário.
- **RBAC**: Middleware que diferencia Admin, Cliente e Entregadores.
- **Bcrypt**: Criptografia de senhas antes de enviar ao backend.

## 📑 Endpoints Principais

### Autenticação
- `POST /auth/register`: Registro de novos usuários.
- `POST /auth/login`: Login e recebimento de Token JWT.

### Produtos
- `GET /products`: Lista produtos ativos (Público).
- `POST /products`: Cria novo produto (Admin).

### Pedidos
- `POST /orders`: Cliente realiza um pedido.
- `GET /orders`: Lista pedidos conforme a role logada.
- `PATCH /orders/:id/status`: Entregador ou Admin atualiza o status.

### Usuários
- `GET /users`: Admin visualiza todos os perfis.
