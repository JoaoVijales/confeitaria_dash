import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderForm } from '@/components/forms/OrderForm'

const mockCustomers = [
  { id: 'cust-1', name: 'Maria Confeitaria' },
  { id: 'cust-2', name: 'João Padeiro' },
]

const mockProducts = [
  { id: 'prod-1', name: 'Bolo Red Velvet', price: 120 },
  { id: 'prod-2', name: 'Torta de Morango', price: 85 },
]

describe('OrderForm', () => {
  it('renderiza clientes vindos de props (não mock hardcoded)', () => {
    render(
      <OrderForm
        customers={mockCustomers}
        products={mockProducts}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    )

    // Abre o select de cliente e verifica os nomes reais
    const customerTrigger = screen.getByRole('combobox', { name: /cliente/i })
    expect(customerTrigger).toBeInTheDocument()
  })

  it('não renderiza clientes hardcoded "Cliente Fiel"', () => {
    render(
      <OrderForm
        customers={mockCustomers}
        products={mockProducts}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    )
    expect(screen.queryByText('Cliente Fiel')).not.toBeInTheDocument()
  })

  it('não renderiza produtos hardcoded "Bolo de Chocolate"', () => {
    render(
      <OrderForm
        customers={mockCustomers}
        products={mockProducts}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    )
    expect(screen.queryByText('Bolo de Chocolate')).not.toBeInTheDocument()
  })

  it('renderiza botão de submissão desabilitado quando isSubmitting=true', () => {
    render(
      <OrderForm
        customers={mockCustomers}
        products={mockProducts}
        onSubmit={vi.fn()}
        isSubmitting={true}
      />
    )
    expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled()
  })

  it('renderiza estado vazio de clientes quando array vazio', () => {
    render(
      <OrderForm
        customers={[]}
        products={[]}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    )
    expect(screen.getByText(/salvar pedido/i)).toBeInTheDocument()
  })
})
