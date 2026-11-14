import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: { default: "Observatorio Nacional de Investigación de EsSalud", template: "%s | Observatorio EsSalud" },
  description: "Inteligencia cientifica, gestion de investigacion y transparencia institucional.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-brand-bg font-sans antialiased">
        <a href="#contenido-principal" className="skip-link">Saltar al contenido principal</a>
        <Header />
        <main id="contenido-principal" tabIndex={-1}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
