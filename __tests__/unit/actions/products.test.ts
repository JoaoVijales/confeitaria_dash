import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn().mockResolvedValue({}) }))

const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/supabase/tenant', () => ({ getTenantId: vi.fn().mockResolvedValue('test-tenant-id') }))

import { createProduct, updateProduct, deleteProduct, getProducts, checkLowStock } from '@/app/actions/products'
import { revalidatePath } from 'next/cache'

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(data)) fd.append(k, v)
  return fd
}

const validProductData = {
  name: 'Bolo de Chocolate',
  category: 'Bolos',
  price: '25.00',
  cost: '12.00',
  stock: '10',
  min_stock: '5',
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
    it('insere produto com dados validos', async () => {
      const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
      mockFrom.mockReturnValue({ insert: insertMock })

      await createProduct(makeFormData(validProductData))

      expect(mockFrom).toHaveBeenCalledWith('products')
      expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Bolo de Chocolate',
        category: 'Bolos',
        price: 25,
        cost: 12,
        stock: 10,
        min_stock: 5,
      }))
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/produtos')
    })

    it('lanca erro com dados invalidos (nome curto)', async () => {
      const insertMock = vi.fn()
      mockFrom.mockReturnValue({ insert: insertMock })

      const fd = makeFormData({ ...validProductData, name: 'ab' })
      await expect(createProduct(fd)).rejects.toThrow()
      expect(insertMock).not.toHaveBeenCalled()
    })

    it('lanca erro com preco negativo', async () => {
      const insertMock = vi.fn()
      mockFrom.mockReturnValue({ insert: insertMock })

      const fd = makeFormData({ ...validProductData, price: '-1' })
      await expect(createProduct(fd)).rejects.toThrow()
      expect(insertMock).not.toHaveBeenCalled()
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const insertMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      mockFrom.mockReturnValue({ insert: insertMock })

      await expect(createProduct(makeFormData(validProductData))).rejects.toEqual(dbError)
    })
  })

  describe('updateProduct', () => {
    it('atualiza produto com dados validos', async () => {
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ update: updateMock })

      await updateProduct('123', makeFormData(validProductData))

      expect(mockFrom).toHaveBeenCalledWith('products')
      expect(updateMock).toHaveBeenCalledWith({
        name: 'Bolo de Chocolate',
        category: 'Bolos',
        price: 25,
        cost: 12,
        stock: 10,
        min_stock: 5,
      })
      expect(eqIdMock).toHaveBeenCalledWith('id', '123')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/produtos')
    })

    it('lanca erro com dados invalidos', async () => {
      const updateMock = vi.fn()
      mockFrom.mockReturnValue({ update: updateMock })

      const fd = makeFormData({ ...validProductData, category: 'ab' })
      await expect(updateProduct('123', fd)).rejects.toThrow()
      expect(updateMock).not.toHaveBeenCalled()
    })

    it('lanca erro quando Supabase falha', async () => {
      const dbError = { message: 'DB error' }
      const eqTenantMock = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTenantMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      mockFrom.mockReturnValue({ update: updateMock })

      await expect(updateProduct('123', makeFormData(validProductData))).rejects.toEqual(dbError)
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
