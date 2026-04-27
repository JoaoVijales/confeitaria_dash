# Confeitaria Dashboard

Dashboard de gestão para confeitarias: produtos, ingredientes, receitas, pedidos, clientes e financeiro — com planos SaaS (Gratuito / Basic / Pro).

## Stack

- **Framework:** Next.js 15 (App Router, Server Actions)
- **Auth:** Firebase Authentication
- **Banco de dados:** Supabase (PostgreSQL) com isolamento multi-tenant por `tenant_id`
- **Pagamentos:** AbacatePay (webhooks + assinaturas)
- **UI:** Tailwind CSS + shadcn/ui + Recharts
- **Testes:** Vitest + Testing Library

## Setup rápido

```bash
# 1. Instalar dependências
yarn install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves (Supabase, Firebase, AbacatePay)

# 3. Rodar em desenvolvimento
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

Todas as chaves necessárias estão documentadas em [`.env.example`](.env.example).

| Grupo | Onde obter |
|---|---|
| `NEXT_PUBLIC_SUPABASE_*` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Console → Project settings → Your apps |
| `FIREBASE_ADMIN_*` | Firebase Console → Project settings → Service accounts |
| `ABACATEPAY_*` | AbacatePay → Configurações → API / Webhooks |

## Arquitetura

```
Firebase Auth ──► middleware.ts ──► verifica token
                                      │
                                      ▼
                              getTenantId() ──► busca tenant no Supabase
                                      │         (via firebase_uid)
                                      ▼
                         Server Actions / Route Handlers
                                      │
                                      ▼
                            Supabase (RLS por tenant_id)
```

- Cada usuário pertence a um **tenant** — todas as queries filtram por `tenant_id`.
- Planos (`free` / `basic` / `pro`) controlam limites de produtos e pedidos.
- Upgrades/cancelamentos são processados pelo webhook AbacatePay em `/api/webhooks/abacatepay`.

Referências: [`docs/app-actions.md`](docs/app-actions.md), [`docs/hooks.md`](docs/hooks.md), [`docs/app-directory.md`](docs/app-directory.md).

## Testes

```bash
# Rodar todos os testes
yarn test

# Rodar com cobertura (mínimo: 70% linhas/funções, 60% branches)
yarn test:coverage

# Interface visual
yarn test:ui
```

Documentação de testes em [`docs/tests.md`](docs/tests.md).

## Deploy checklist

- [ ] `yarn lint` — sem erros
- [ ] `yarn test` — todos os testes passando
- [ ] `yarn test:coverage` — thresholds atingidos
- [ ] `yarn build` — build sem erros de tipo
- [ ] Migrations aplicadas no Supabase (`docs/migrations/`)
- [ ] Variáveis de ambiente configuradas no ambiente de produção
- [ ] Webhook AbacatePay apontando para a URL de produção
