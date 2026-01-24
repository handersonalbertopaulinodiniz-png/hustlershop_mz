# 🚀 Guia Completo: Configurar Backend com Appwrite

## ✅ **Status Atual**

Você já tem:
- ✅ **Projeto Appwrite**: `hustlershop` (ID: `696e35180026caf34a47`)
- ✅ **Endpoint**: `https://fra.cloud.appwrite.io/v1`
- ✅ **Database ID**: `697298a30022c92bfc1b`
- ✅ **API Key**: Configurada no arquivo `.env`
- ✅ **Código Frontend**: Integração completa (`appwrite.js`, `auth-appwrite.js`, `api-appwrite.js`)

---

## 🎯 **O Que Falta Fazer**

### **Opção 1: Configuração Via Console (Recomendado para Iniciantes)**

#### **Passo 1: Acesse o Appwrite Console**
1. Vá para: https://cloud.appwrite.io
2. Faça login na sua conta
3. Selecione o projeto **hustlershop**

#### **Passo 2: Verificar Database**
1. No menu lateral, clique em **Databases**
2. Você deve ver o database com ID: `697298a30022c92bfc1b`
3. Clique nele para abrir

#### **Passo 3: Criar Collections**

Você precisa criar **9 collections**. Para cada uma:

##### **Collection 1: profiles** (Perfis de Usuários)
1. Clique em **Create Collection**
2. **Collection ID**: `profiles`
3. **Collection Name**: `User Profiles`
4. Clique em **Create**
5. Configure as **Permissions**:
   - Read: `Any` + `Users`
   - Create: `Users`
   - Update: `Users`
   - Delete: `Users`

6. **Adicionar Atributos** (clique em "Attributes" → "Create Attribute"):

| Atributo | Tipo | Tamanho | Obrigatório | Default | Enum/Min/Max |
|----------|------|---------|-------------|---------|--------------|
| `user_id` | String | 36 | ✅ | - | - |
| `full_name` | String | 255 | ✅ | - | - |
| `email` | String | 255 | ✅ | - | - |
| `role` | String | 20 | ✅ | `customer` | `admin`, `customer`, `delivery` |
| `approval_status` | String | 20 | ✅ | `pending` | `pending`, `approved`, `rejected` |
| `phone` | String | 20 | ❌ | - | - |
| `address` | String | 500 | ❌ | - | - |
| `bi_number` | String | 20 | ❌ | - | - |
| `transport_type` | String | 20 | ❌ | - | `mota`, `carro`, `bicicleta`, `a_pe` |
| `bio` | String | 1000 | ❌ | - | - |
| `avatar_url` | String | 500 | ❌ | - | - |
| `created_at` | DateTime | - | ✅ | - | - |
| `updated_at` | DateTime | - | ✅ | - | - |

7. **Criar Índices** (Indexes):
   - Índice em `email` (type: `unique`)
   - Índice em `user_id` (type: `unique`)

---

##### **Collection 2: categories** (Categorias)
1. **Collection ID**: `categories`
2. **Collection Name**: `Product Categories`
3. **Permissions**: Read: `Any` + `Users`, Write: `Users`

**Atributos:**
| Atributo | Tipo | Tamanho | Obrigatório |
|----------|------|---------|-------------|
| `name` | String | 255 | ✅ |
| `slug` | String | 255 | ❌ |
| `description` | String | 500 | ❌ |
| `created_at` | DateTime | - | ✅ |

---

##### **Collection 3: products** (Produtos)
1. **Collection ID**: `products`
2. **Collection Name**: `Products`
3. **Permissions**: Read: `Any` + `Users`, Write: `Users`

**Atributos:**
| Atributo | Tipo | Tamanho | Obrigatório | Default | Min/Max |
|----------|------|---------|-------------|---------|---------|
| `name` | String | 255 | ✅ | - | - |
| `description` | String | 2000 | ❌ | - | - |
| `price` | Float | - | ✅ | 0 | Min: 0, Max: 99999999.99 |
| `stock_quantity` | Integer | - | ✅ | 0 | Min: 0, Max: 999999 |
| `category_id` | String | 36 | ❌ | - | - |
| `image_url` | String | 500 | ❌ | - | - |
| `is_active` | Boolean | - | ✅ | `true` | - |
| `created_at` | DateTime | - | ✅ | - | - |
| `updated_at` | DateTime | - | ✅ | - | - |

---

##### **Collection 4: orders** (Pedidos)
1. **Collection ID**: `orders`
2. **Collection Name**: `Orders`
3. **Permissions**: Read/Write/Create/Delete: `Users`

**Atributos:**
| Atributo | Tipo | Tamanho | Obrigatório | Default | Enum/Min/Max |
|----------|------|---------|-------------|---------|--------------|
| `user_id` | String | 36 | ✅ | - | - |
| `delivery_id` | String | 36 | ❌ | - | - |
| `total_amount` | Float | - | ✅ | - | Min: 0, Max: 99999999.99 |
| `status` | String | 20 | ✅ | `pending` | `pending`, `processing`, `shipped`, `delivered`, `cancelled` |
| `payment_status` | String | 20 | ✅ | `pending` | `pending`, `completed`, `failed`, `refunded` |
| `payment_method` | String | 50 | ❌ | - | - |
| `shipping_address` | String | 500 | ❌ | - | - |
| `created_at` | DateTime | - | ✅ | - | - |
| `updated_at` | DateTime | - | ✅ | - | - |

**Índices:**
- Índice em `user_id` (type: `key`)
- Índice em `delivery_id` (type: `key`)

---

##### **Collection 5: order_items** (Itens do Pedido)
1. **Collection ID**: `order_items`
2. **Collection Name**: `Order Items`
3. **Permissions**: Read/Write/Create/Delete: `Users`

**Atributos:**
| Atributo | Tipo | Tamanho | Obrigatório | Min/Max |
|----------|------|---------|-------------|---------|
| `order_id` | String | 36 | ✅ | - |
| `product_id` | String | 36 | ✅ | - |
| `quantity` | Integer | - | ✅ | Min: 1, Max: 999999 |
| `unit_price` | Float | - | ✅ | Min: 0, Max: 99999999.99 |

---

##### **Collection 6: cart** (Carrinho)
1. **Collection ID**: `cart`
2. **Collection Name**: `Shopping Cart`
3. **Permissions**: Read/Write/Create/Delete: `Users`

**Atributos:**
| Atributo | Tipo | Tamanho | Obrigatório | Default | Min/Max |
|----------|------|---------|-------------|---------|---------|
| `user_id` | String | 36 | ✅ | - | - |
| `product_id` | String | 36 | ✅ | - | - |
| `quantity` | Integer | - | ✅ | `1` | Min: 1, Max: 999999 |
| `created_at` | DateTime | - | ✅ | - | - |

**Índices:**
- Índice em `user_id` (type: `key`)

---

##### **Collection 7: wishlist** (Lista de Desejos)
1. **Collection ID**: `wishlist`
2. **Collection Name**: `Wishlist`
3. **Permissions**: Read/Write/Create/Delete: `Users`

**Atributos:**
| Atributo | Tipo | Tamanho | Obrigatório |
|----------|------|---------|-------------|
| `user_id` | String | 36 | ✅ |
| `product_id` | String | 36 | ✅ |
| `created_at` | DateTime | - | ✅ |

**Índices:**
- Índice em `user_id` (type: `key`)

---

##### **Collection 8: reviews** (Avaliações)
1. **Collection ID**: `reviews`
2. **Collection Name**: `Product Reviews`
3. **Permissions**: Read: `Any`, Write/Create/Delete: `Users`

**Atributos:**
| Atributo | Tipo | Tamanho | Obrigatório | Min/Max |
|----------|------|---------|-------------|---------|
| `user_id` | String | 36 | ✅ | - |
| `product_id` | String | 36 | ✅ | - |
| `rating` | Integer | - | ✅ | Min: 1, Max: 5 |
| `comment` | String | 1000 | ❌ | - |
| `created_at` | DateTime | - | ✅ | - |

---

##### **Collection 9: notifications** (Notificações)
1. **Collection ID**: `notifications`
2. **Collection Name**: `User Notifications`
3. **Permissions**: Read/Write: `Users`

**Atributos:**
| Atributo | Tipo | Tamanho | Obrigatório | Default |
|----------|------|---------|-------------|---------|
| `user_id` | String | 36 | ✅ | - |
| `title` | String | 255 | ✅ | - |
| `message` | String | 1000 | ✅ | - |
| `type` | String | 50 | ❌ | `info` |
| `is_read` | Boolean | - | ✅ | `false` |
| `created_at` | DateTime | - | ✅ | - |

---

### **Opção 2: Configuração Via CLI (Avançado)**

Se você quiser automatizar todo o processo usando Appwrite CLI:

#### **Passo 1: Instalar Appwrite CLI**
```bash
npm install -g appwrite-cli
```

#### **Passo 2: Fazer Login**
```bash
appwrite login
```

#### **Passo 3: Configurar Projeto**
```bash
appwrite init project --projectId 696e35180026caf34a47
```

#### **Passo 4: Executar Script**
O arquivo `backend/appwrite_collections.sql` contém todos os comandos CLI necessários.

⚠️ **IMPORTANTE**: Antes de executar o script, você precisa substituir `hustlershop-db` pelo ID real do seu database: `697298a30022c92bfc1b`

Vou criar um script corrigido para você:

---

## 🔧 **Testar a Configuração**

### **1. Abrir o Projeto no Navegador**
Abra o arquivo `verify-appwrite-connection.html` no navegador para testar a conexão.

### **2. Verificar no Console do Navegador**
Pressione `F12` e veja se aparece:
```
✅ Appwrite connection successful
```

### **3. Testar Autenticação**
Abra `auth/login.html` e tente criar uma conta de teste.

---

## 📁 **Atualizar Arquivos do Frontend**

Agora que o Appwrite está configurado, você precisa atualizar os arquivos HTML para usar a nova integração Appwrite.

### **Arquivos que precisam ser atualizados:**

#### **Substituir imports de Supabase por Appwrite:**

**Antes:**
```javascript
import { initAuth, signIn } from '../assets/js/core/auth.js';
import { productsAPI } from '../assets/js/core/api.js';
```

**Depois:**
```javascript
import { initAuth, signIn } from '../assets/js/core/auth-appwrite.js';
import { productsAPI } from '../assets/js/core/api-appwrite.js';
```

### **Lista de arquivos a atualizar:**

1. ✅ `auth/login.html` - Já atualizado
2. `auth/register.html`
3. `customer/dashboard.html`
4. `customer/orders.html`
5. `customer/profile.html`
6. `admin/dashboard.html`
7. `admin/inventory.html`
8. `admin/users.html`
9. `admin/orders.html`
10. Todos os outros arquivos que usam autenticação ou API

---

## 🎉 **Próximos Passos**

1. ✅ **Configurar Collections** no Appwrite Console (usando a tabela acima)
2. ✅ **Testar conexão** com `verify-appwrite-connection.html`
3. ✅ **Atualizar imports** nos arquivos HTML
4. ✅ **Criar conta de teste** usando `auth/register.html`
5. ✅ **Testar CRUD** de produtos, pedidos, etc.

---

## 🆘 **Problemas Comuns e Soluções**

### **Erro: CORS Policy**
**Problema**: A aplicação não consegue conectar ao Appwrite.
**Solução**: No Appwrite Console, vá em Settings → Platforms → Web e adicione:
- Hostname: `localhost`
- Hostname: `127.0.0.1`
- Hostname: seu domínio (se estiver em produção)

### **Erro: Collection not found**
**Problema**: Collection não existe.
**Solução**: Certifique-se de criar todas as 9 collections listadas acima.

### **Erro: Unauthorized**
**Problema**: Permissões incorretas.
**Solução**: Verifique se as permissões da collection estão corretas (Read/Write para Users).

---

## 📞 **Precisa de Ajuda?**

Se tiver dificuldades:
1. Verifique o console do navegador (F12) para ver erros
2. Verifique se o Database ID está correto (`697298a30022c92bfc1b`)
3. Certifique-se de que todas as collections foram criadas
4. Teste a conexão com `verify-appwrite-connection.html`

---

**🚀 Seu backend Appwrite estará 100% funcional após seguir estes passos!**
