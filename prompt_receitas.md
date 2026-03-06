etapa 1: Gestão de Ingredientes e Receitas

Implemente sistema completo de custeio por receita:

SCHEMA SQL (adicionar tabelas)

-- Ingredientes
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL, -- kg, g, L, ml, unidade
  unit_cost DECIMAL(10,2) NOT NULL,
  current_stock DECIMAL(10,2) DEFAULT 0,
  min_stock DECIMAL(10,2) DEFAULT 0,
  supplier TEXT,
  last_purchase_date DATE,
  last_purchase_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receitas
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  yield INTEGER NOT NULL, -- quantas unidades a receita rende
  prep_time INTEGER, -- minutos
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingredientes da Receita
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de Compras de Ingredientes
CREATE TABLE ingredient_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ingredient_id UUID REFERENCES ingredients(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  supplier TEXT,
  purchase_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: Atualizar custo do produto ao salvar receita
CREATE OR REPLACE FUNCTION calculate_product_cost()
RETURNS TRIGGER AS $$
DECLARE
  recipe_cost DECIMAL(10,2);
  recipe_yield INTEGER;
  unit_cost DECIMAL(10,2);
BEGIN
  SELECT 
    SUM(i.unit_cost * ri.quantity),
    r.yield
  INTO recipe_cost, recipe_yield
  FROM recipe_ingredients ri
  JOIN ingredients i ON ri.ingredient_id = i.id
  JOIN recipes r ON ri.recipe_id = r.id
  WHERE ri.recipe_id = NEW.recipe_id
  GROUP BY r.yield;
  
  unit_cost = recipe_cost / recipe_yield;
  
  UPDATE products
  SET cost = unit_cost
  WHERE id = (SELECT product_id FROM recipes WHERE id = NEW.recipe_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_cost_trigger
AFTER INSERT OR UPDATE ON recipe_ingredients
FOR EACH ROW EXECUTE FUNCTION calculate_product_cost();
$$

PÁGINAS

/ingredientes:
- Tabela: Nome, Unidade, Custo Unit, Estoque Atual, Estoque Mín
- Badge vermelho: estoque < min_stock
- Filtros: categoria, baixo estoque
- Ações: editar, registrar compra, histórico

/receitas:
- Lista receitas vinculadas a produtos
- Card: Produto | Rendimento | Custo Total | Custo Unitário
- Detalhes: lista ingredientes com qtd e custo
- Cálculo margem automático

FORMULÁRIOS

IngredientForm.tsx:
- Nome, unidade, custo, estoque, min_stock, fornecedor
- Validação unidade consistente

RecipeForm.tsx:
- Selecionar produto
- Adicionar ingredientes (autocomplete)
- Quantidade por ingrediente
- Rendimento (quantas unidades)
- Preview custo calculado
- Instruções (opcional)

PurchaseForm.tsx:
- Selecionar ingrediente
- Quantidade comprada
- Custo da compra
- Atualizar estoque automático
- Atualizar custo médio

CÁLCULOS

lib/utils/recipes.ts:

export function calculateRecipeCost(ingredients) {
  return ingredients.reduce((total, item) => {
    return total + (item.unit_cost * item.quantity)
  }, 0)
}

export function calculateUnitCost(recipeCost, yield) {
  return recipeCost / yield
}

export function calculateMarginWithCost(price, cost) {
  return ((price - cost) / price) * 100
}

FEATURES
- Alerta ingrediente acabando
- Sugestão preço venda (custo * 3)
- Comparar custo entre fornecedores
- Histórico variação preço ingrediente
- Simulador: alterar ingrediente e ver impacto no custo


etapa 2: Funcionalidades Avançadas

Adicione recursos premium ao dashboard:

METAS E OBJETIVOS

/metas:
- Definir meta mensal: receita, lucro, pedidos
- Progress bar visual
- Comparação realizado vs meta
- Alertas quando próximo da meta
- Histórico metas anteriores

Schema:
CREATE TABLE goals (
  id UUID PRIMARY KEY,
  type TEXT, -- revenue, profit, orders
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2),
  month INTEGER,
  year INTEGER,
  status TEXT -- em_andamento, atingida, nao_atingida
);

ANÁLISE DE TENDÊNCIAS

Dashboard Analytics:
- Gráfico tendência vendas (regressão linear)
- Produtos em alta/baixa
- Sazonalidade (comparar mesmo período ano anterior)
- Previsão próximo mês baseada em histórico

ALERTAS INTELIGENTES

Sistema de notificações:
- Estoque baixo crítico
- Margem abaixo do esperado
- Cliente sem comprar há X dias
- Meta próxima de ser atingida
- Despesa anormal (muito acima da média)
- Produto sem venda há X dias

CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  type TEXT,
  message TEXT,
  severity TEXT, -- info, warning, critical
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
);

COMPARAÇÕES INTELIGENTES

Components:
- ComparisonCard: mês atual vs anterior
- Indicador: "↑ 15% vs mês passado"
- Cores: verde (crescimento), vermelho (queda)
- Detalhar variação por categoria

DASHBOARD EXECUTIVO

/executivo (resumo alto nível):
- Cards grandes com números principais
- Apenas gráficos essenciais
- Resumo semanal em texto
- Principais insights automáticos
- Print-friendly para reuniões

NOTAS E OBSERVAÇÕES

Adicionar em várias entidades:
- Pedidos: observações do cliente
- Produtos: notas sobre preparo
- Despesas: justificativa
- Clientes: preferências, observações

TAGS E CATEGORIZAÇÃO

Sistema de tags:
- Produtos: sazonal, personalizado, premium
- Clientes: corporativo, varejo, vip
- Despesas: recorrente, eventual, investimento
- Filtrar e agrupar por tags

CALENDÁRIO

/calendario:
- View mensal de pedidos
- Entregas programadas
- Eventos importantes
- Integração Google Calendar (opcional)
- Arrastar para reagendar