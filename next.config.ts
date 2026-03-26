import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@tailwindcss/postcss', 'tailwindcss'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Impede clickjacking (iframe em outros domínios)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Impede MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Controla informação de referrer em links externos
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Bloqueia acesso a câmera/mic/geolocalização
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Força HTTPS por 2 anos (incluindo subdomínios)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Impede XSS em browsers legados
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
};

export default nextConfig;
