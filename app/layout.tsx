import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import "./globals.css"

export const metadata: Metadata = {
  title: "GeoMarketing Pro - Optimisation IA des Points de Vente",
  description:
    "Solution complète de géomarketing pour optimiser l'emplacement de vos points de vente avec l'Intelligence Artificielle. Analyse prédictive, simulation de scénarios et recommandations explicables.",
  generator: "The FrontlineUnit",
  keywords:
    "géomarketing, intelligence artificielle, optimisation, points de vente, analyse géospatiale, ROI, simulation",
  authors: [{ name: "GeoMarketing Pro" }],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Chargement de l'application...</p>
        <p className="text-xs text-muted-foreground mt-2">Initialisation des modules IA</p>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
