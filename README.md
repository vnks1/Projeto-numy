# 🚀 Numa - Landing Page

Landing Page oficial do projeto **Numa**.

## 🧠 Sobre o Projeto

Numa é uma assistente pessoal inteligente com foco em organização de conversas e produtividade.

Esta landing page foi criada para:

- Apresentar o produto
- Explicar sua proposta de valor
- Captar leads (waitlist)
- Validar interesse inicial do mercado

---

## 🛠️ Stack Utilizada

- **Next.js** (App Router)
- **React**
- **TailwindCSS**
- **Shadcn/UI** (quando necessário)
- **MongoDB** (armazenamento de emails da waitlist)
- **TypeScript**
- AI-assisted development (Agents integrados ao IDE)

---

## 🔐 Admin da Landing

Foi adicionada uma área autenticada global para administração da landing, com módulo de acompanhamento da waitlist.

- Login: `/admin/login`
- Dashboard: `/admin`

Variáveis obrigatórias:

- `LANDING_ADMIN_PASSWORD`: senha usada no login admin
- `LANDING_ADMIN_SECRET`: segredo usado para assinar cookie de sessão

Variável opcional para aba de uso OpenAI no admin:

- `OPENAI_ADMIN_KEY`: chave admin da organização OpenAI para consultar `/v1/organization/usage/completions` e `/v1/organization/costs`

---

## 🎨 Design

- Layout e UI desenvolvidos no **Figma**
- Design system próprio
- Responsivo (Mobile First)
- Hero com animação de entrada do mockup mobile
- Foco em performance e boas práticas de UX

---
