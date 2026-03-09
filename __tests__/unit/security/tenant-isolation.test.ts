/**
 * Testes de segurança: isolamento multi-tenant
 *
 * Garantias verificadas:
 * 1. Toda query SELECT filtra por tenant_id
 * 2. Todo INSERT inclui tenant_id no payload
 * 3. Todo UPDATE/DELETE filtra por tenant_id
 * 4. Se getTenantId lança erro, a action aborta sem tocar no banco
 * 5. Dados de tenant A nunca são acessíveis por tenant B
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const TENANT_A = 'tenant-aaa-111'
const TENANT_B = 'tenant-bbb-222'

// vi.hoisted garante que os mocks são criados antes do hoisting do vi.mock
const { mockGetTenantId, mockFrom } = vi.hoisted(() => ({
  mockGetTenantId: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/tenant', () => ({
  getTenantId: mockGetTenantId,
}))

// mockSupabase como objeto estático — createClient como função pura (não vi.fn())
// para não ser afetado por vi.clearAllMocks / vi.resetAllMocks
const mockSupabase = { from: mockFrom }
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabase,
}))

// ─── Imports das actions (após os mocks) ─────────────────────────────────────
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/app/actions/customers'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/app/actions/products'
import { getOrders, createOrder, updateOrderStatus, deleteOrder } from '@/app/actions/orders'
import { createIngredient, updateIngredient, deleteIngredient } from '@/app/actions/ingredients'
import { createExpense, updateExpense, deleteExpense, getExpenses } from '@/app/actions/expenses'
import { createRevenue, updateRevenue, deleteRevenue, getRevenues } from '@/app/actions/revenues'
import { createIngredientPurchase, getIngredientPurchases, deleteIngredientPurchase } from '@/app/actions/ingredient-purchases'
import { getTransactions } from '@/app/actions/transactions'

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(data)) fd.append(k, v)
  return fd
}

// ─── Helpers de mock ─────────────────────────────────────────────────────────
function buildSelectChain(data: unknown[] = []) {
  const single = vi.fn().mockResolvedValue({ data: data[0] ?? null, error: null })
  const order = vi.fn().mockResolvedValue({ data, error: null })
  const lte = vi.fn().mockReturnValue({ data, error: null })
  const gte = vi.fn().mockReturnValue({ lte })
  const eqTenant = vi.fn().mockReturnValue({ order, single, gte })
  const eqId = vi.fn().mockReturnValue({ eqTenant })
  const select = vi.fn().mockReturnValue({ eq: eqId, order, eqTenant })
  return { select, eqId, eqTenant, order, single }
}

function buildMutationChain() {
  const eqTenant = vi.fn().mockResolvedValue({ data: null, error: null })
  const eqId = vi.fn().mockReturnValue({ eq: eqTenant })
  const insert = vi.fn().mockResolvedValue({ data: null, error: null })
  const update = vi.fn().mockReturnValue({ eq: eqId })
  const del = vi.fn().mockReturnValue({ eq: eqId })
  return { insert, update, del, eqId, eqTenant }
}

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────
describe('[Segurança] customers — isolamento multi-tenant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTenantId.mockResolvedValue(TENANT_A)
  })

  it('getCustomers: filtra SELECT por tenant_id', async () => {
    const eqMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
    mockFrom.mockReturnValue({ select: selectMock })

    await getCustomers()

    expect(eqMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('getCustomers: aborta sem query se não há tenant (sem autenticação)', async () => {
    mockGetTenantId.mockRejectedValue(new Error('Usuário não autenticado'))

    await expect(getCustomers()).rejects.toThrow('Usuário não autenticado')
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('createCustomer: inclui tenant_id no INSERT', async () => {
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    mockFrom.mockReturnValue({ insert: insertMock })

    await createCustomer(makeFormData({
      name: 'Maria Silva',
      email: 'maria@test.com',
      phone: '11999999999',
      is_vip: 'false',
    }))

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ tenant_id: TENANT_A })
    )
  })

  it('updateCustomer: filtra UPDATE por tenant_id', async () => {
    const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
    const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
    mockFrom.mockReturnValue({ update: updateMock })

    await updateCustomer('cust-1', makeFormData({
      name: 'Maria Silva',
      email: 'maria@test.com',
      phone: '11999999999',
      is_vip: 'false',
    }))

    expect(eqTenantMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('deleteCustomer: filtra DELETE por tenant_id', async () => {
    const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
    const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
    mockFrom.mockReturnValue({ delete: deleteMock })

    await deleteCustomer('cust-1')

    expect(eqTenantMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('ação aborta sem tocar no banco quando getTenantId falha', async () => {
    mockGetTenantId.mockRejectedValue(new Error('Tenant não encontrado'))

    await expect(deleteCustomer('cust-1')).rejects.toThrow('Tenant não encontrado')
    expect(mockFrom).not.toHaveBeenCalled()
  })
})

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
describe('[Segurança] products — isolamento multi-tenant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTenantId.mockResolvedValue(TENANT_A)
  })

  it('getProducts: filtra SELECT por tenant_id', async () => {
    const eqMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })
    mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: eqMock }) })

    await getProducts()

    expect(eqMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('getProducts: aborta sem query se getTenantId falha', async () => {
    mockGetTenantId.mockRejectedValue(new Error('Usuário não autenticado'))

    await expect(getProducts()).rejects.toThrow()
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('createProduct: inclui tenant_id no INSERT', async () => {
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    mockFrom.mockReturnValue({ insert: insertMock })

    await createProduct(makeFormData({
      name: 'Bolo de Chocolate',
      category: 'bolo',
      price: '50',
      cost: '20',
      stock: '10',
      min_stock: '2',
    }))

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ tenant_id: TENANT_A })
    )
  })

  it('updateProduct: filtra UPDATE por tenant_id', async () => {
    const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
    const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
    mockFrom.mockReturnValue({ update: updateMock })

    await updateProduct('prod-1', makeFormData({
      name: 'Bolo de Chocolate',
      category: 'bolo',
      price: '50',
      cost: '20',
      stock: '10',
      min_stock: '2',
    }))

    expect(eqTenantMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('deleteProduct: filtra DELETE por tenant_id', async () => {
    const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
    const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
    mockFrom.mockReturnValue({ delete: deleteMock })

    await deleteProduct('prod-1')

    expect(eqTenantMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })
})

// ─── ORDERS ──────────────────────────────────────────────────────────────────
describe('[Segurança] orders — isolamento multi-tenant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTenantId.mockResolvedValue(TENANT_A)
  })

  it('getOrders: filtra SELECT por tenant_id', async () => {
    const eqMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })
    mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: eqMock }) })

    await getOrders()

    expect(eqMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('getOrders: aborta sem query se getTenantId falha', async () => {
    mockGetTenantId.mockRejectedValue(new Error('Usuário não autenticado'))

    await expect(getOrders()).rejects.toThrow()
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('createOrder: insere orders e order_items com tenant_id', async () => {
    const orderId = 'order-new-1'
    const insertOrderMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: orderId }, error: null }),
      }),
    })
    const insertItemsMock = vi.fn().mockResolvedValue({ data: null, error: null })

    // updateCustomerStats (chamado internamente após criar o pedido):
    // 1. from('orders').select('total').eq('customer_id', ...).eq('tenant_id', ...)
    const eqStatsTenant = vi.fn().mockResolvedValue({ data: [], error: null })
    const eqStatsCustomer = vi.fn().mockReturnValue({ eq: eqStatsTenant })
    const selectStatsMock = vi.fn().mockReturnValue({ eq: eqStatsCustomer })
    // 2. from('customers').update({...}).eq('id', ...).eq('tenant_id', ...)
    const eqUpdateTenant = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqUpdateId = vi.fn().mockReturnValue({ eq: eqUpdateTenant })
    const updateStatsMock = vi.fn().mockReturnValue({ eq: eqUpdateId })

    mockFrom
      .mockReturnValueOnce({ insert: insertOrderMock })   // orders insert
      .mockReturnValueOnce({ insert: insertItemsMock })   // order_items insert
      .mockReturnValueOnce({ select: selectStatsMock })   // orders select (updateCustomerStats)
      .mockReturnValueOnce({ update: updateStatsMock })   // customers update (updateCustomerStats)

    await createOrder({
      customer_id: 'cust-1',
      items: [{ product_id: 'prod-1', quantity: 2, unit_price: 25 }],
      total: 50,
      status: 'pendente',
    })

    // order insert deve conter tenant_id
    expect(insertOrderMock).toHaveBeenCalledWith(
      expect.objectContaining({ tenant_id: TENANT_A })
    )
    // order_items insert deve conter tenant_id em cada item
    expect(insertItemsMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ tenant_id: TENANT_A }),
      ])
    )
  })

  it('updateOrderStatus: filtra UPDATE por tenant_id', async () => {
    const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
    const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
    mockFrom.mockReturnValue({ update: updateMock })

    await updateOrderStatus('order-1', 'concluido')

    expect(eqTenantMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('deleteOrder: filtra DELETE de orders e order_items por tenant_id', async () => {
    const eqTenantItems = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqOrderId = vi.fn().mockReturnValue({ eq: eqTenantItems })
    const deleteItemsMock = vi.fn().mockReturnValue({ eq: eqOrderId })

    const eqTenantOrder = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqIdOrder = vi.fn().mockReturnValue({ eq: eqTenantOrder })
    const deleteOrderMock = vi.fn().mockReturnValue({ eq: eqIdOrder })

    mockFrom
      .mockReturnValueOnce({ delete: deleteItemsMock }) // order_items
      .mockReturnValueOnce({ delete: deleteOrderMock }) // orders

    await deleteOrder('order-1')

    expect(eqTenantItems).toHaveBeenCalledWith('tenant_id', TENANT_A)
    expect(eqTenantOrder).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })
})

// ─── INGREDIENTS ─────────────────────────────────────────────────────────────
describe('[Segurança] ingredients — isolamento multi-tenant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTenantId.mockResolvedValue(TENANT_A)
  })

  it('createIngredient: inclui tenant_id no INSERT', async () => {
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    mockFrom.mockReturnValue({ insert: insertMock })

    await createIngredient({
      name: 'Farinha',
      unit: 'kg',
      unit_cost: 5,
      current_stock: 10,
      min_stock: 2,
      category: 'seco',
    })

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ tenant_id: TENANT_A })
    )
  })

  it('updateIngredient: filtra UPDATE por tenant_id', async () => {
    const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
    const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
    mockFrom.mockReturnValue({ update: updateMock })

    await updateIngredient(1, {
      name: 'Farinha',
      unit: 'kg',
      unit_cost: 5,
      current_stock: 10,
      min_stock: 2,
      category: 'seco',
    })

    expect(eqTenantMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('deleteIngredient: filtra DELETE por tenant_id', async () => {
    const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
    const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
    mockFrom.mockReturnValue({ delete: deleteMock })

    await deleteIngredient(1)

    expect(eqTenantMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('aborta sem tocar no banco quando não há autenticação', async () => {
    mockGetTenantId.mockRejectedValue(new Error('Usuário não autenticado'))

    await expect(createIngredient({
      name: 'Farinha',
      unit: 'kg',
      unit_cost: 5,
      current_stock: 10,
      min_stock: 2,
      category: 'seco',
    })).rejects.toThrow()
    expect(mockFrom).not.toHaveBeenCalled()
  })
})

// ─── EXPENSES ────────────────────────────────────────────────────────────────
describe('[Segurança] expenses — isolamento multi-tenant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTenantId.mockResolvedValue(TENANT_A)
  })

  it('getExpenses: filtra SELECT por tenant_id', async () => {
    const eqMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })
    mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: eqMock }) })

    await getExpenses()

    expect(eqMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('createExpense: inclui tenant_id no INSERT', async () => {
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    mockFrom.mockReturnValue({ insert: insertMock })

    await createExpense(makeFormData({
      description: 'Farinha',
      category: 'insumo',
      date: '2026-01-01',
      quantity: '1',
      unit_price: '50',
      total: '50',
    }))

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ tenant_id: TENANT_A })
    )
  })

  it('updateExpense: filtra UPDATE por tenant_id', async () => {
    const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
    const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
    mockFrom.mockReturnValue({ update: updateMock })

    await updateExpense('exp-1', makeFormData({
      description: 'Farinha',
      category: 'insumo',
      date: '2026-01-01',
      quantity: '1',
      unit_price: '50',
      total: '50',
    }))

    expect(eqTenantMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('deleteExpense: filtra DELETE por tenant_id', async () => {
    const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
    const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
    mockFrom.mockReturnValue({ delete: deleteMock })

    await deleteExpense('exp-1')

    expect(eqTenantMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })
})

// ─── REVENUES ────────────────────────────────────────────────────────────────
describe('[Segurança] revenues — isolamento multi-tenant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTenantId.mockResolvedValue(TENANT_A)
  })

  it('getRevenues: filtra SELECT por tenant_id', async () => {
    const eqMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })
    mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: eqMock }) })

    await getRevenues()

    expect(eqMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('createRevenue: inclui tenant_id no INSERT', async () => {
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    mockFrom.mockReturnValue({ insert: insertMock })

    await createRevenue(makeFormData({
      description: 'Venda bolo',
      date: '2026-01-01',
      quantity: '1',
      unit_price: '80',
      total: '80',
    }))

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ tenant_id: TENANT_A })
    )
  })

  it('updateRevenue: filtra UPDATE por tenant_id', async () => {
    const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
    const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
    mockFrom.mockReturnValue({ update: updateMock })

    await updateRevenue('rev-1', makeFormData({
      description: 'Venda bolo',
      date: '2026-01-01',
      quantity: '1',
      unit_price: '80',
      total: '80',
    }))

    expect(eqTenantMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('deleteRevenue: filtra DELETE por tenant_id', async () => {
    const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
    const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
    mockFrom.mockReturnValue({ delete: deleteMock })

    await deleteRevenue('rev-1')

    expect(eqTenantMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })
})

// ─── INGREDIENT PURCHASES ────────────────────────────────────────────────────
describe('[Segurança] ingredient-purchases — isolamento multi-tenant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTenantId.mockResolvedValue(TENANT_A)
  })

  it('getIngredientPurchases: filtra SELECT por tenant_id', async () => {
    const eqMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })
    mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: eqMock }) })

    await getIngredientPurchases()

    expect(eqMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('createIngredientPurchase: inclui tenant_id no INSERT', async () => {
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    mockFrom.mockReturnValue({ insert: insertMock })

    await createIngredientPurchase({
      ingredient_id: 1,
      quantity: 5,
      unit_cost: 10,
      total_cost: 50,
      purchased_at: '2026-01-01',
    })

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ tenant_id: TENANT_A })
    )
  })

  it('deleteIngredientPurchase: filtra DELETE por tenant_id', async () => {
    const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
    const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
    mockFrom.mockReturnValue({ delete: deleteMock })

    await deleteIngredientPurchase(1)

    expect(eqTenantMock).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })
})

// ─── TRANSACTIONS ────────────────────────────────────────────────────────────
describe('[Segurança] transactions — isolamento multi-tenant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTenantId.mockResolvedValue(TENANT_A)
  })

  it('getTransactions: filtra revenue_entries e expense_entries por tenant_id', async () => {
    // Chain real: .select().eq('tenant_id', ...).gte('date', ...).lte('date', ...)
    const lteRevenue = vi.fn().mockResolvedValue({ data: [], error: null })
    const gteRevenue = vi.fn().mockReturnValue({ lte: lteRevenue })
    const eqRevenue = vi.fn().mockReturnValue({ gte: gteRevenue })
    const selectRevenue = vi.fn().mockReturnValue({ eq: eqRevenue })

    const lteExpense = vi.fn().mockResolvedValue({ data: [], error: null })
    const gteExpense = vi.fn().mockReturnValue({ lte: lteExpense })
    const eqExpense = vi.fn().mockReturnValue({ gte: gteExpense })
    const selectExpense = vi.fn().mockReturnValue({ eq: eqExpense })

    mockFrom
      .mockReturnValueOnce({ select: selectRevenue })  // revenue_entries
      .mockReturnValueOnce({ select: selectExpense })  // expense_entries

    await getTransactions('2026-01-01', '2026-01-31')

    // Ambas as tabelas devem filtrar por tenant_id
    expect(eqRevenue).toHaveBeenCalledWith('tenant_id', TENANT_A)
    expect(eqExpense).toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('getTransactions: aborta sem query se getTenantId falha', async () => {
    mockGetTenantId.mockRejectedValue(new Error('Usuário não autenticado'))

    await expect(getTransactions('2026-01-01', '2026-01-31')).rejects.toThrow()
    expect(mockFrom).not.toHaveBeenCalled()
  })
})

// ─── ISOLAMENTO CRUZADO (Tenant A vs Tenant B) ────────────────────────────────
describe('[Segurança] isolamento cruzado entre tenants', () => {
  beforeEach(() => {
    // resetAllMocks garante estado limpo (impl + histórico)
    // createClient usa função pura, não é afetado
    vi.resetAllMocks()
  })

  it('tenant B não consegue acessar dados do tenant A em getCustomers', async () => {
    // Simula tenant B autenticado
    mockGetTenantId.mockResolvedValue(TENANT_B)

    const eqMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })
    mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: eqMock }) })

    await getCustomers()

    // Deve filtrar por TENANT_B, nunca por TENANT_A
    expect(eqMock).toHaveBeenCalledWith('tenant_id', TENANT_B)
    expect(eqMock).not.toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('tenant B não consegue deletar produto do tenant A', async () => {
    mockGetTenantId.mockResolvedValue(TENANT_B)

    const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
    const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
    mockFrom.mockReturnValue({ delete: deleteMock })

    await deleteProduct('prod-from-tenant-A')

    // Filtra por TENANT_B — o banco descarta se o produto pertencer ao TENANT_A
    expect(eqTenantMock).toHaveBeenCalledWith('tenant_id', TENANT_B)
    expect(eqTenantMock).not.toHaveBeenCalledWith('tenant_id', TENANT_A)
  })

  it('tenant B não consegue atualizar despesa do tenant A', async () => {
    mockGetTenantId.mockResolvedValue(TENANT_B)

    const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
    const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
    mockFrom.mockReturnValue({ update: updateMock })

    await updateExpense('exp-from-tenant-A', makeFormData({
      description: 'Hack attempt',
      category: 'insumo',
      date: '2026-01-01',
      quantity: '1',
      unit_price: '1',
      total: '1',
    }))

    expect(eqTenantMock).toHaveBeenCalledWith('tenant_id', TENANT_B)
    expect(eqTenantMock).not.toHaveBeenCalledWith('tenant_id', TENANT_A)
  })
})
