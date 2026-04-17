import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "Dashboard Confeitaria",
  description: "Painel administrativo para confeitaria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  );
}
