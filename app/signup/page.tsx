'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { toast } from 'sonner'
import { Cake } from 'lucide-react'
import { getClientAuth, getGoogleProvider } from '@/lib/firebase/client'
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

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [senhaIguais, setSenhaIguais] = useState(false)

  async function handleEmailSignup() {
    if (!email || !password) return
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }
    handleConfirmarSenha()
    if (!senhaIguais) return
    setLoading(true)
    try {
      const credential = await createUserWithEmailAndPassword(getClientAuth(), email, password)
      const idToken = await credential.user.getIdToken()
      await createSession(idToken)
      track('signup', { method: 'email' })
      window.location.href = '/onboarding'
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === 'auth/email-already-in-use') {
        toast.error('Este email já está cadastrado')
      } else {
        toast.error('Erro ao criar conta. Tente novamente.')
      }
      setLoading(false)
    }
  }

  async function handleConfirmarSenha() {
    if (password !== confirmarSenha) {
      toast.error('As senhas não coincidem')
      setSenhaIguais(false)
      return
    }
    setSenhaIguais(true)
    toast.success('Senha confirmada com sucesso')
  }

  async function handleGoogleSignup() {
    setLoading(true)
    try {
      const credential = await signInWithPopup(getClientAuth(), getGoogleProvider())
      const idToken = await credential.user.getIdToken()
      await createSession(idToken)
      track('signup', { method: 'google' })
      window.location.href = '/onboarding'
    } catch {
      toast.error('Erro ao cadastrar com Google')
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
          <CardTitle className="text-2xl font-semibold text-slate-800">Criar conta</CardTitle>
          <CardDescription className="text-slate-600">
            Comece a gerenciar sua confeitaria hoje
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
                placeholder="Mínimo 6 caracteres"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailSignup()}
                className="py-6"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmar-senha" className="text-slate-700">Confirmar Senha</Label>
              <Input
                id="confirmar-senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmarSenha()}
                className="py-6"
              />
            </div>
            <Button
              onClick={handleEmailSignup}
              disabled={loading}
              className="w-full py-6 text-base font-semibold"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
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
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full py-6 text-base"
            >
              Cadastrar com Google
            </Button>
            <p className="text-center text-sm text-slate-600">
              Já tem conta?{' '}
              <Link href="/login" className="font-medium text-pink-600 hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
