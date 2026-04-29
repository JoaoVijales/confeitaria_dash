-- ============================================================
-- Migration 006: Receitas independentes de produtos
--
-- Antes: receita era subordinada a um produto (product_id NOT NULL)
-- Depois: receita tem nome próprio; produto referencia receitas via product_components
--
-- recipe_ingredients.unit: unidade em que a quantidade é expressa na receita
--   (g, ml, un) — necessária para conversão de custo (g→kg, ml→L)
-- ============================================================

ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.recipes ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE public.recipe_ingredients ADD COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT 'g';
