'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center">
          <p className="text-lg font-semibold text-slate-800">Algo deu errado.</p>
          <p className="text-sm text-slate-500">Recarregue a página ou tente novamente.</p>
          <Button variant="outline" onClick={this.handleReset}>
            Tentar novamente
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
