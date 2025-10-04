import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

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
      <body className="font-sans antialiased bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
