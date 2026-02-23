
---

 <p align="center">
  <img src="public/banner.png" alt="Vizzy Banner" width="800" />
</p>

---

Aplicação web para criação de infográficos interativos, com edição em tempo real, foco em experiência visual, usabilidade e fluxo intuitivo.

> Aviso importante: este projeto é front-end only para portfólio/demo. Autenticação e dados são locais ao navegador (`localStorage`) e não devem ser usados para informações sensíveis reais.

## 🚀 Funcionalidades

- Criação e edição de gráficos em tempo real
- Tipos de gráfico: barras, linha, pizza e progresso
- Entrada de dados por formulário, JSON e CSV
- Salvamento local de infográficos
- Exportação de gráfico (com controle de acesso)
- Área de conta com edição de perfil, logout e exclusão de conta
- Fluxo de autenticação com login, cadastro e troca de senha em conta autenticada

## 🧩 Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Framer Motion
- Sonner (toasts)
- Vitest + Testing Library

## 🎨 Design e Experiência

- Interface dark com foco em legibilidade
- Modal de autenticação responsivo (mobile e desktop)
- Animações suaves de transição entre login e cadastro
- Feedback visual de validação de campos e estados de erro

## 📸 Screenshots

### Desktop
<img src="public/tela-principal.jpeg" alt="Tela principal desktop" width="680" />
<br />
<img src="public/infograficos-salvos.jpeg" alt="Infográficos salvos desktop" width="680" />
<br />
<img src="public/perfil-conta.jpeg" alt="Perfil da conta desktop" width="680" />

### Mobile
<table>
  <tr>
    <td><img src="public/tela-inicial-mobile.jpeg" alt="Tela inicial mobile" /></td>
    <td><img src="public/login-mobile.jpeg" alt="Login mobile" /></td>
    <td><img src="public/editar-dados-mobile.jpeg" alt="Editar dados mobile" /></td>
  </tr>
</table>

## 🔐 Autenticação e Controle de Acesso

- Autenticação local via `localStorage`
- Senhas armazenadas com hash derivado (`PBKDF2 + salt`) com migração de formatos legados no login
- Infográficos salvos particionados por usuário autenticado (isolamento por conta no mesmo navegador)
- Troca de senha disponível apenas para usuário autenticado e com validação da senha atual
- Regras atuais:
  - `Salvar`: livre (sem login)
  - `Meus Infográficos`: exige login
  - `Exportar PNG`: exige login

> Observação: este fluxo é local (front-end only). Para segurança robusta em produção, use backend com sessão/token HTTP-only e recuperação de senha por e-mail com token.

## ⚠️ Escopo de Segurança

- Projeto publicado para demonstração de UI/UX e fluxo de produto.
- Não há backend de autenticação/autorização.
- Não use este app para armazenar dados pessoais, financeiros ou corporativos sensíveis.
- Qualquer validação no front-end pode ser alterada localmente via DevTools.

## 🧠 Aprendizado

Este projeto consolidou prática em:

- Componentização com React + TypeScript
- Modelagem de estado e fluxos de UI
- Responsividade com Tailwind CSS
- Animações com Framer Motion
- Controle de acesso no front-end

## 📋 Pré-requisitos (para rodar o projeto)

- Node.js 18+ (recomendado)
- npm 9+ (ou compatível)

## 🔧 Instalação

```bash
npm install
npm run dev
```

Aplicação disponível em:

`http://localhost:8080`

## 📁 Estrutura do Projeto

- `src/pages/Index.tsx`: tela principal e fluxo central do app
- `src/components/infographic/*`: entrada de dados, seleção de gráfico e preview
- `src/components/auth/*`: login, cadastro e conta (edição de perfil e troca de senha)
- `src/components/ui/*`: componentes utilitários de interface
- `src/types/infographic.ts`: tipagens de domínio do infográfico

## 📝 Scripts Disponíveis

- `npm run dev`: inicia ambiente de desenvolvimento
- `npm run build`: gera build de produção
- `npm run build:dev`: gera build no modo development
- `npm run preview`: serve o build localmente
- `npm run lint`: executa lint
- `npm run test`: executa testes uma vez
- `npm run test:watch`: executa testes em modo watch

## 📄 Licença

Este projeto está sob a licença MIT.  
Veja o arquivo `LICENSE`.

## 👩‍💻 Autora

Desenvolvido por Flávia Souza – Desenvolvedora Front-end Web e Mobile

⭐ Se este projeto te ajudou ou te inspirou, considere dar uma estrela no GitHub!
