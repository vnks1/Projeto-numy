# 🚀 Numa - Landing Page

Landing Page oficial do projeto **Numa**.

Desenvolvida em **Next.js**, com design criado no **Figma** e implementação realizada com auxílio de **AI agents** integrados ao fluxo de desenvolvimento.

---

## Waitlist production setup (Vercel)

Required env vars for `POST /api/waitlist` in Production:

- `MONGODB_URI` (required)
- `MONGODB_DB` (optional, default: `landing`)
- `MONGODB_WAITLIST_COLLECTION` (optional, default: `waitlist`)
- `IP_HASH_SALT` (required, use 32+ chars)
- `UPSTASH_REDIS_REST_URL` (required)
- `UPSTASH_REDIS_REST_TOKEN` (required)

Recommended rollout:

1. Set env vars in `Project > Settings > Environment Variables` for the `Production` environment.
2. Confirm both `UPSTASH_*` variables belong to the same Upstash Redis database.
3. Redeploy production to apply new environment variables.
4. Validate with a real submit on `/waitlist`.

Local preflight before deploy:

```bash
npm run preflight:prod
```

This checks:

- required env vars
- `IP_HASH_SALT` minimum length
- MongoDB connectivity
- Upstash connectivity

Troubleshooting by API response `code`:

- `IP_HASH_SALT_MISSING`: missing `IP_HASH_SALT` in production env.
- `RATE_LIMIT_NOT_CONFIGURED`: missing `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN`.
- `DB_NOT_CONFIGURED`: missing `MONGODB_URI`.
- `RATE_LIMITED`: request limit exceeded.
- `INVALID_ORIGIN`: request `Origin` does not match the request host.

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

## 🎨 Design

- Layout e UI desenvolvidos no **Figma**
- Design system próprio
- Responsivo (Mobile First)
- Hero com animação de entrada do mockup mobile
- Foco em performance e boas práticas de UX

---
