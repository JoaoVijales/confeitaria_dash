'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { toast } from 'sonner'
import { Cake } from 'lucide-react'
import { auth, googleProvider } from '@/lib/firebase/client'
import { createSession } from '@/app/actions/auth'
import { track } from '@/lib/analytics'
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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleEmailLogin() {
    if (!email || !password) return
    setLoading(true)
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await credential.user.getIdToken()
      await createSession(idToken)
      track('login', { method: 'email' })
      window.location.href = '/dashboard'
    } catch {
      toast.error('Email ou senha inválidos')
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setLoading(true)
    try {
      const credential = await signInWithPopup(auth, googleProvider)
      const idToken = await credential.user.getIdToken()
      await createSession(idToken)
      track('login', { method: 'google' })
      window.location.href = '/dashboard'
    } catch {
      toast.error('Erro ao entrar com Google')
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
          <CardTitle className="text-2xl font-semibold text-slate-800">Bem-vindo!</CardTitle>
          <CardDescription className="text-slate-600">
            Entre com sua conta para acessar o painel
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
                onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                className="py-6"
              />
            </div>
            <Button
              onClick={handleEmailLogin}
              disabled={loading}
              className="w-full py-6 text-base font-semibold"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">ou</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-6 text-base"
            >
              Entrar com Google
            </Button>
            <p className="text-center text-sm text-slate-600">
              Não tem conta?{' '}
              <Link href="/signup" className="font-medium text-pink-600 hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
