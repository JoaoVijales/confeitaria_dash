import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { IngredientFormDialog } from '@/components/IngredientFormDialog'

describe('IngredientFormDialog', () => {
  const mockOnSave = vi.fn()
  const mockOnOpenChange = vi.fn()

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    ingredient: null,
    onSave: mockOnSave,
  }

  it('deve renderizar campos de Select para unidade e categoria', async () => {
    render(<IngredientFormDialog {...defaultProps} />)

    // Verifica se os Selects estão presentes
    // Radix UI SelectTrigger tem role="combobox"
    const selects = screen.getAllByRole('combobox')
    expect(selects).toHaveLength(2)
  })
})
