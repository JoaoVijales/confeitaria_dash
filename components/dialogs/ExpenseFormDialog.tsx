'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ExpenseForm } from '@/components/forms/ExpenseForm'
import { useCreateExpense, useUpdateExpense } from '@/hooks/useMutations'
import { ExpenseFormValues } from '@/lib/validations/expense.schema'
import { toast } from 'sonner' // Assumindo que sonner está instalado

type ExpenseFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: ExpenseFormValues & { id: string } | null
}

export function ExpenseFormDialog({ open, onOpenChange, expense }: ExpenseFormDialogProps) {
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()

  const onSubmit = async (data: ExpenseFormValues) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    try {
      if (expense?.id) {
        await updateMutation.mutateAsync({ id: expense.id, data: formData })
        toast.success('Saída atualizada com sucesso!')
      } else {
        await createMutation.mutateAsync(formData)
        toast.success('Saída criada com sucesso!')
      }
      onOpenChange(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error('Erro ao salvar saída.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? 'Editar Saída' : 'Adicionar Nova Saída'}</DialogTitle>
        </DialogHeader>
        <ExpenseForm
          defaultValues={expense || undefined}
          onSubmit={onSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
