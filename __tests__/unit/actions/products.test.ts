import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/supabase/tenant', () => ({
  getTenantId: vi.fn().mockResolvedValue('test-tenant-id'),
  getTenantPlan: vi.fn().mockResolvedValue('pro'),
}))

import { createProduct, updateProduct, deleteProduct, getProducts, checkLowStock } from '@/app/actions/products'
import { revalidatePath } from 'next/cache'
import { ProductFormValues } from '@/lib/validations/product.schema'
import * as tenantModule from '@/lib/supabase/tenant'

const validProductData: ProductFormValues = {
  name: 'Bolo de Chocolate',
  category: 'Bolos',
  price: 25,
  cost: 12,
  stock: 10,
  min_stock: 5,
  is_compound: false,
  extra_cost: 0,
  components: [],
}

function mockInsertSingle(returnData: unknown) {
  const singleMock = vi.fn().mockResolvedValue({ data: returnData, error: null })
  const selectMock = vi.fn().mockReturnValue({ single: singleMock })
  const insertMock = vi.fn().mockReturnValue({ select: selectMock })
  return { insertMock, selectMock, singleMock }
}

describe('products actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProducts', () => {
    it('retorna lista de produtos', async () => {
      const products = [{ id: '1', name: 'Bolo' }]
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: products, error: null }),
          }),
        }),
      })

      const result = await getProducts()
      expect(mockFrom).toHaveBeenCalledWith('products')
      expect(result).toEqual(products)
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: dbError }),
          }),
        }),
      })

      await expect(getProducts()).rejects.toEqual(dbError)
    })
  })

  describe('createProduct', () => {
    function mockCountQuery(count = 0) {
      const eqMock = vi.fn().mockResolvedValue({ count, error: null })
      const selectCountMock = vi.fn().mockReturnValue({ eq: eqMock })
      return selectCountMock
    }

    it('insere produto simples com dados validos', async () => {
      const { insertMock } = mockInsertSingle({ id: 'prod-1' })
      mockFrom
        .mockReturnValueOnce({ select: mockCountQuery(0) })
        .mockReturnValue({ insert: insertMock })

      await createProduct(validProductData)

      expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Bolo de Chocolate',
        category: 'Bolos',
        price: 25,
        cost: 12,
        stock: 10,
        min_stock: 5,
        tenant_id: 'test-tenant-id',
      }))
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/produtos')
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const singleMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const selectMock = vi.fn().mockReturnValue({ single: singleMock })
      const insertMock = vi.fn().mockReturnValue({ select: selectMock })
      mockFrom
        .mockReturnValueOnce({ select: mockCountQuery(0) })
        .mockReturnValue({ insert: insertMock })

      await expect(createProduct(validProductData)).rejects.toEqual(dbError)
    })

    it('lanca erro quando limite de produtos do plano é atingido', async () => {
      vi.mocked(tenantModule.getTenantPlan).mockResolvedValueOnce('free')

      const eqMock = vi.fn().mockResolvedValue({ count: 30, error: null })
      const selectCountMock = vi.fn().mockReturnValue({ eq: eqMock })
      mockFrom.mockReturnValueOnce({ select: selectCountMock })

      await expect(createProduct(validProductData)).rejects.toThrow('Limite de produtos')
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('updateProduct', () => {
    it('atualiza produto simples com dados validos', async () => {
      // products.update
      const eqTenantMock1 = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock1 = vi.fn().mockReturnValue({ eq: eqTenantMock1 })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock1 })

      // product_components.delete
      const eqTenantMock2 = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock2 = vi.fn().mockReturnValue({ eq: eqTenantMock2 })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock2 })

      mockFrom
        .mockReturnValueOnce({ update: updateMock })
        .mockReturnValueOnce({ delete: deleteMock })

      await updateProduct('123', validProductData)

      expect(mockFrom).toHaveBeenCalledWith('products')
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Bolo de Chocolate',
        category: 'Bolos',
        price: 25,
        cost: 12,
      }))
      expect(eqIdMock1).toHaveBeenCalledWith('id', '123')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/produtos')
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ update: updateMock })

      await expect(updateProduct('123', validProductData)).rejects.toEqual(dbError)
    })
  })

  describe('deleteProduct', () => {
    it('deleta produto por id', async () => {
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ delete: deleteMock })

      await deleteProduct('123')

      expect(mockFrom).toHaveBeenCalledWith('products')
      expect(eqIdMock).toHaveBeenCalledWith('id', '123')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/produtos')
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ delete: deleteMock })

      await expect(deleteProduct('123')).rejects.toEqual(dbError)
    })
  })

  describe('checkLowStock', () => {
    it('retorna produtos com estoque baixo', async () => {
      const products = [
        { name: 'Bolo', stock: 2, min_stock: 5 },
        { name: 'Torta', stock: 10, min_stock: 3 },
      ]
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: products, error: null }),
        }),
      })

      const result = await checkLowStock()
      expect(result).toEqual([{ name: 'Bolo', stock: 2, min_stock: 5 }])
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: dbError }),
        }),
      })

      await expect(checkLowStock()).rejects.toEqual(dbError)
    })
  })
})
