import { describe, it, expect } from 'vitest'
import { customerSchema } from '@/lib/validations/customer.schema'

const validCustomer = {
  name: 'Maria Silva',
  email: 'maria@email.com',
  phone: '11999998888',
  is_vip: false,
}

describe('customerSchema', () => {
  it('deve aceitar dados validos', () => {
    const result = customerSchema.safeParse(validCustomer)
    expect(result.success).toBe(true)
  })

  it('deve aceitar cliente VIP', () => {
    const result = customerSchema.safeParse({ ...validCustomer, is_vip: true })
    expect(result.success).toBe(true)
  })

  // name
  it('deve rejeitar quando nome esta faltando', () => {
    const { name: _name, ...rest } = validCustomer
    const result = customerSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar nome com menos de 3 caracteres', () => {
    const result = customerSchema.safeParse({ ...validCustomer, name: 'Ab' })
    expect(result.success).toBe(false)
  })

  it('deve aceitar nome com exatamente 3 caracteres', () => {
    const result = customerSchema.safeParse({ ...validCustomer, name: 'Ana' })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar nome com tipo errado', () => {
    const result = customerSchema.safeParse({ ...validCustomer, name: 123 })
    expect(result.success).toBe(false)
  })

  // email
  it('deve rejeitar quando email esta faltando', () => {
    const { email: _email, ...rest } = validCustomer
    const result = customerSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar email invalido', () => {
    const result = customerSchema.safeParse({ ...validCustomer, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar email sem dominio', () => {
    const result = customerSchema.safeParse({ ...validCustomer, email: 'user@' })
    expect(result.success).toBe(false)
  })

  // phone
  it('deve rejeitar quando telefone esta faltando', () => {
    const { phone: _phone, ...rest } = validCustomer
    const result = customerSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar telefone com menos de 10 caracteres', () => {
    const result = customerSchema.safeParse({ ...validCustomer, phone: '123456789' })
    expect(result.success).toBe(false)
  })

  it('deve aceitar telefone com exatamente 10 caracteres', () => {
    const result = customerSchema.safeParse({ ...validCustomer, phone: '1199999888' })
    expect(result.success).toBe(true)
  })

  it('deve aceitar telefone com codigo de pais (+55)', () => {
    const result = customerSchema.safeParse({ ...validCustomer, phone: '+5511999998888' })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar telefone com letras', () => {
    const result = customerSchema.safeParse({ ...validCustomer, phone: '119abc98888' })
    expect(result.success).toBe(false)
  })

  // is_vip
  it('deve rejeitar quando is_vip esta faltando', () => {
    const { is_vip: _is_vip, ...rest } = validCustomer
    const result = customerSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar is_vip com tipo errado', () => {
    const result = customerSchema.safeParse({ ...validCustomer, is_vip: 'true' })
    expect(result.success).toBe(false)
  })
})
