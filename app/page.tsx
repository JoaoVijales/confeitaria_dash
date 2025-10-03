'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Cake } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Error logging in:', error.message)
      // TODO: Add user-facing error message
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mb-8 flex items-center gap-3 font-semibold text-2xl text-slate-800">
        <Cake className="h-8 w-8 text-pink-500" />
        <span>Confeitaria</span>
      </div>
      <Card className="mx-auto max-w-sm w-full rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-slate-800">Bem-vindo!</CardTitle>
          <CardDescription className="text-slate-600">
            Entre com seu email para acessar o painel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="py-6"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-700">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="py-6"
              />
            </div>
            <Button onClick={handleLogin} className="w-full py-6 text-base font-semibold">
              Entrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}