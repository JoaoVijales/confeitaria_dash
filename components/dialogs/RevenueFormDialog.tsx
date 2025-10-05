'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RevenueForm } from '@/components/forms/RevenueForm'
import { useCreateRevenue, useUpdateRevenue } from '@/hooks/useMutations'
import { RevenueFormValues } from '@/lib/validations/revenue.schema'
import { toast } from 'sonner' // Assumindo que sonner está instalado

type RevenueFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  revenue?: RevenueFormValues & { id: string } | null
}

export function RevenueFormDialog({ open, onOpenChange, revenue }: RevenueFormDialogProps) {
  const createMutation = useCreateRevenue()
  const updateMutation = useUpdateRevenue()

  const onSubmit = async (data: RevenueFormValues) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    try {
      if (revenue?.id) {
        await updateMutation.mutateAsync({ id: revenue.id, data: formData })
        toast.success('Entrada atualizada com sucesso!')
      } else {
        await createMutation.mutateAsync(formData)
        toast.success('Entrada criada com sucesso!')
      }
      onOpenChange(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error('Erro ao salvar entrada.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{revenue ? 'Editar Entrada' : 'Adicionar Nova Entrada'}</DialogTitle>
        </DialogHeader>
        <RevenueForm
          defaultValues={revenue || undefined}
          onSubmit={onSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
