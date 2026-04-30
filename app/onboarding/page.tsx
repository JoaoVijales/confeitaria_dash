'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Cake } from 'lucide-react'
import { createTenant } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error('Informe o nome da sua confeitaria')
      return
    }
    setLoading(true)
    try {
      await createTenant(name.trim())
      toast.success('Confeitaria configurada com sucesso!')
      router.push('/dashboard')
    } catch {
      toast.error('Erro ao configurar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mb-8 flex items-center gap-3 font-semibold text-2xl text-slate-800">
        <Cake className="h-8 w-8 text-pink-500" />
        <span>Confeitando</span>
      </div>
      <Card className="mx-auto max-w-sm w-full rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-slate-800">
            Quase lá!
          </CardTitle>
          <CardDescription className="text-slate-600">
            Como se chama a sua confeitaria?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-700">Nome da confeitaria</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: Doces da Maria"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="py-6"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading || !name.trim()}
              className="w-full py-6 text-base font-semibold"
            >
              {loading ? 'Configurando...' : 'Começar a usar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
