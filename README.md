# Confeitaria Dashboard

[![CI](https://github.com/JoaoVijales/confeitaria_dash/actions/workflows/ci.yml/badge.svg)](https://github.com/JoaoVijales/confeitaria_dash/actions/workflows/ci.yml)

Dashboard de gestão para confeitarias — controle de produtos, ingredientes, pedidos, receitas e faturamento.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Supabase** (PostgreSQL + RLS) + **Firebase** (Auth)
- **Tailwind CSS** + **Radix UI**
- **Vitest** + **Testing Library**

## Setup

```bash
cp .env.example .env
# preencha as variáveis no .env

yarn install
yarn dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
yarn dev          # servidor de desenvolvimento
yarn build        # build de produção
yarn test         # testes unitários (watch)
yarn test --run   # testes unitários (CI)
yarn lint         # ESLint
```

## Variáveis de Ambiente

Veja `.env.example` para a lista completa de variáveis necessárias (Supabase, Firebase, AbacatePay).
