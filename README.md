# Vizzy

Criador de infográficos interativo para web, focado em experiência visual, responsividade e refinamento de UI.

Projeto desenvolvido como vitrine de front-end moderno, explorando visualização de dados, microinterações e organização de código.

---

## ✨ Visão Geral

O Vizzy transforma dados simples em gráficos visuais de forma rápida e intuitiva.

O usuário pode:

- Criar gráficos em tempo real
- Editar dados dinamicamente
- Alternar entre múltiplos tipos de visualização
- Salvar projetos localmente
- Exportar o resultado como imagem

O foco principal do projeto é **UX refinada + estrutura front-end bem organizada**.

---

## 🚀 Funcionalidades

### 📊 Visualização de Dados
- Gráfico de Barras
- Gráfico de Linha
- Gráfico de Pizza
- Barras de Progresso

### 📝 Entrada de Dados
- Formulário manual
- JSON
- CSV

### 💾 Persistência
- Salvamento via `localStorage`
- Sessão persistida em `vizzy_current_user`

### 🔐 Sistema de Conta (Front-end only)
- Modal de login/cadastro
- Edição de nome e email
- Logout
- Exclusão de conta

### 🚪 Regras de Acesso
- Editor livre (sem login)
- Salvar livre
- "Meus Infográficos" exige login
- Exportar PNG exige login

---

## 🎨 Foco em UX

O projeto prioriza:

- Responsividade real (mobile-first refinado)
- Microinterações com Framer Motion
- Tooltip customizado com melhor contraste
- Destaque visual em elementos ativos
- Ajustes de labels e layout para telas menores
- Experiência consistente entre estados

---

## 🛠 Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Framer Motion
- Sonner (toasts)
- Radix UI (Tooltip)

---

## 🧱 Arquitetura

Estrutura organizada por domínio:

src/ 
components/ 
infographic/ 
auth/ 
ui/ 
pages/ 
hooks/ 
lib/ 
types/

Separação clara entre:
- Visualização de gráficos
- Autenticação
- Componentes de UI reutilizáveis
- Tipagens e utilitários


## 💻 Como rodar localmente

```bash
npm install
npm run dev


## 📜 Scripts
npm run dev → ambiente de desenvolvimento
npm run build → build de produção
npm run preview → preview do build
npm run lint → análise de código
npm run test → testes


## 🎯 Objetivo do Projeto
O Vizzy foi desenvolvido como projeto de portfólio para demonstrar:
Organização de código em aplicações React
Manipulação e visualização de dados
Controle de estado e persistência
Feature gating no front-end
Atenção a detalhes de UX e design


## 🔮 Próximos Passos (Possíveis Evoluções)
Integração com backend
Compartilhamento por link
Templates de infográficos
Exportação com múltiplos formatos e qualidade ajustável


## 📄 Licença

MIT