-- ============================================================
-- Migration 008: Adicionar cancel_reason à tabela tenants
-- Armazena o motivo de cancelamento informado pelo usuário.
-- ============================================================

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS cancel_reason text;
