import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Confeitando — Gestão para Confeitarias Artesanais'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '80px',
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#ec4899',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
            }}
          >
            🍰
          </div>
          <span style={{ fontSize: '48px', fontWeight: 800, color: '#1e293b' }}>
            Confeitando
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: '52px',
            fontWeight: 700,
            color: '#1e293b',
            textAlign: 'center',
            lineHeight: 1.2,
            margin: '0 0 24px',
            maxWidth: '900px',
          }}
        >
          Sua confeitaria organizada,{' '}
          <span style={{ color: '#ec4899' }}>do ingrediente ao caixa</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '28px',
            color: '#64748b',
            textAlign: 'center',
            margin: '0 0 48px',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Pedidos, receitas, estoque e financeiro em um só lugar
        </p>

        {/* Pills */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {['Plano Básico R$ 9,90/mês', 'Plano Pro R$ 49,90/mês', 'Plano Max R$ 99,90/mês'].map(
            (label) => (
              <div
                key={label}
                style={{
                  background: 'white',
                  border: '2px solid #fce7f3',
                  borderRadius: '9999px',
                  padding: '10px 24px',
                  fontSize: '20px',
                  color: '#be185d',
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
