# Guia de Conexão com GitHub

Este guia passo a passo ajudará você a conectar seu projeto **HustlerShop** ao GitHub e configurar atualizações automáticas.

## 🚀 Passo 1: Instalar o Git (Essencial)
O seu computador informou que o comando `git` ainda não está instalado.
1. Baixe o Git para Windows: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Instale (pode clicar em "Next" em todas as opções padrão).
3. **Importante:** Após instalar, reinicie o VS Code ou o terminal que estiver usando.

## 📦 Passo 2: Criar o Repositório no GitHub
1. Acesse [github.com](https://github.com) e faça login.
2. Clique no botão **New** (ou Novo Repositório).
3. Nome do Repositório: `hustlershop-mz` (ou o nome que preferir).
4. Deixe como **Public** (Público) ou **Private** (Privado) conforme sua preferência.
5. **NÃO** marque as opções de adicionar README, .gitignore ou License (seu projeto já tem esses arquivos).
6. Clique em **Create repository**.

## 🔗 Passo 3: Conectar seu Projeto Local
Abra o terminal na pasta do seu projeto (onde este arquivo está) e execute os seguintes comandos, um por um:

```bash
# 1. Inicializar o Git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Salvar a versão atual
git commit -m "Primeira versao completa do HustlerShop"

# 4. Definir a branch principal
git branch -M main

# 5. Conectar ao repositório remoto (SUBSTITUA A URL ABAIXO PELA DO SEU GITHUB)
git remote add origin https://github.com/handersonalbertopaulinodiniz-png/hustlershop_mz

# 6. Enviar os arquivos para o GitHub
git push -u origin main
```

## 🔄 Passo 4: Atualizações Automáticas (Deploy)
Para que o site "se atualize automaticamente" e fique online sempre que você enviar códigos:

### Opção A: GitHub Pages (Gratuito e Simples)
1. No seu repositório no GitHub, vá em **Settings** (Configurações).
2. No menu lateral, clique em **Pages**.
3. Em "Build and deployment", na opção **Branch**, selecione `main`.
4. Clique em **Save**.
5. Em alguns minutos, seu site estará online em `https://SEU_USUARIO.github.io/hustlershop-mz/`.
6. Sempre que você fizer `git push`, o site atualizará sozinho!

### Como enviar atualizações futuras?
Sempre que fizer alterações no código, use estes 3 comandos:
```bash
git add .
git commit -m "Descreva o que mudou"
git push
```
