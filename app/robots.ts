import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://confeitando.vijales.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/login', '/signup', '/onboarding', '/api'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
