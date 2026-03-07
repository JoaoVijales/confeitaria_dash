'use client'

import { AlertTriangle, Package, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useStockAlerts } from '@/hooks/useStockAlerts'
import type { IngredientAlert, ProductAlert } from '@/lib/utils/stock-alert'

function formatUnit(unit: string) {
  return unit
}

function IngredientRow({ item }: { item: IngredientAlert }) {
  const percent = item.threshold > 0 ? (item.current_stock / item.threshold) * 100 : 0
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="flex items-center gap-1.5 text-slate-700">
        <FlaskConical className="h-3.5 w-3.5 text-amber-500" />
        {item.name}
      </span>
      <span className="text-slate-500">
        <span className="font-medium text-red-600">
          {item.current_stock.toFixed(2)} {formatUnit(item.unit)}
        </span>
        {' / '}
        <span>
          {item.threshold.toFixed(2)} {formatUnit(item.unit)}
        </span>
        <span className="ml-2 text-xs text-slate-400">
          ({Math.round(percent)}%){' '}
          <span className="text-slate-400">
            via {item.source === 'recipe' ? 'receita' : 'mínimo'}
          </span>
        </span>
      </span>
    </div>
  )
}

function ProductRow({ item }: { item: ProductAlert }) {
  const percent = item.min_stock > 0 ? (item.stock / item.min_stock) * 100 : 0
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="flex items-center gap-1.5 text-slate-700">
        <Package className="h-3.5 w-3.5 text-orange-500" />
        {item.name}
      </span>
      <span className="text-slate-500">
        <span className="font-medium text-red-600">{item.stock}</span>
        {' / '}
        <span>{item.min_stock} un</span>
        <span className="ml-2 text-xs text-slate-400">({Math.round(percent)}%)</span>
      </span>
    </div>
  )
}

export function StockAlertBanner() {
  const { data, isLoading } = useStockAlerts()
  const [expanded, setExpanded] = useState(false)

  if (isLoading || !data || data.total === 0) return null

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="flex items-center gap-2 font-medium text-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          {data.total} {data.total === 1 ? 'alerta' : 'alertas'} de estoque baixo
          {data.lowIngredients.length > 0 && (
            <span className="text-xs font-normal text-amber-700">
              · {data.lowIngredients.length} ingrediente
              {data.lowIngredients.length > 1 ? 's' : ''}
            </span>
          )}
          {data.lowProducts.length > 0 && (
            <span className="text-xs font-normal text-amber-700">
              · {data.lowProducts.length} produto
              {data.lowProducts.length > 1 ? 's' : ''}
            </span>
          )}
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-amber-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-amber-600" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-amber-200 px-4 pb-3 pt-2">
          {data.lowIngredients.length > 0 && (
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Ingredientes
                </p>
                <Link
                  href="/dashboard/ingredientes"
                  className="text-xs text-amber-600 hover:underline"
                >
                  Gerenciar →
                </Link>
              </div>
              <div className="divide-y divide-amber-100">
                {data.lowIngredients.map((item) => (
                  <IngredientRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {data.lowProducts.length > 0 && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Produtos
                </p>
                <Link
                  href="/dashboard/produtos"
                  className="text-xs text-amber-600 hover:underline"
                >
                  Gerenciar →
                </Link>
              </div>
              <div className="divide-y divide-amber-100">
                {data.lowProducts.map((item) => (
                  <ProductRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
