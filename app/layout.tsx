import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://confeitando.vijales.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Confeitando — Software de Gestão para Confeitarias Artesanais',
    template: '%s | Confeitando',
  },
  description:
    'Gerencie pedidos, receitas, estoque e financeiro da sua confeitaria em um só lugar. Calcule custos automaticamente, nunca fique sem ingrediente e saiba exatamente quanto está lucrando.',
  keywords: [
    'software para confeitaria',
    'gestão de confeitaria',
    'sistema para confeitaria artesanal',
    'controle de pedidos confeitaria',
    'custo de receita confeitaria',
    'estoque ingredientes confeitaria',
    'financeiro confeitaria',
    'app para confeiteiro',
  ],
  authors: [{ name: 'Confeitando' }],
  creator: 'Confeitando',
  publisher: 'Confeitando',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: BASE_URL,
    siteName: 'Confeitando',
    title: 'Confeitando — Software de Gestão para Confeitarias Artesanais',
    description:
      'Pedidos, receitas, estoque e financeiro em um só lugar. Calcule custos automaticamente e saiba exatamente quanto sua confeitaria está lucrando.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Confeitando — Gestão para Confeitarias Artesanais',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Confeitando — Software de Gestão para Confeitarias Artesanais',
    description:
      'Pedidos, receitas, estoque e financeiro em um só lugar. Feito para confeiteiros artesanais.',
    images: ['/opengraph-image'],
  },
}

const schemaOrg = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Confeitando',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android, iOS',
  url: BASE_URL,
  description:
    'Software de gestão completa para confeitarias artesanais. Controle pedidos, receitas, estoque e financeiro.',
  inLanguage: 'pt-BR',
  offers: [
    {
      '@type': 'Offer',
      name: 'Plano Básico',
      price: '9.90',
      priceCurrency: 'BRL',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '9.90',
        priceCurrency: 'BRL',
        billingDuration: 'P1M',
      },
    },
    {
      '@type': 'Offer',
      name: 'Plano Pro',
      price: '49.90',
      priceCurrency: 'BRL',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '49.90',
        priceCurrency: 'BRL',
        billingDuration: 'P1M',
      },
    },
    {
      '@type': 'Offer',
      name: 'Plano Max',
      price: '99.90',
      priceCurrency: 'BRL',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '99.90',
        priceCurrency: 'BRL',
        billingDuration: 'P1M',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
          <Toaster richColors />
        </Providers>
        {process.env.NEXT_PUBLIC_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
