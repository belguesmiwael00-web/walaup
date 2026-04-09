import WalaupLoader from '@/components/layout/WalaupLoader'
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import EffectsClient from '@/components/layout/EffectsClient'

/* ── Fonts ────────────────────────────────────────────────── */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display-raw',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body-raw',
  weight: ['400', '500', '600'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-raw',
  weight: ['400', '500', '600'],
  display: 'swap',
})

/* ── Viewport (v3: viewport-fit=cover pour PWA iOS) ───────── */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#080B14',
}

/* ── Metadata ───────────────────────────────────────── */
export const metadata = {
  title: {
    default: 'Walaup — Ton business mérite une app',
    template: '%s | Walaup',
  },
  description:
    "La première plateforme tunisienne d'apps sur mesure. Décrivez votre business, on construit votre application en 48h. Démo 100% gratuite.",
  keywords: ['app sur mesure', 'application tunisie', 'agence développement', 'app mobile tunisie'],
  authors: [{ name: 'Walaup' }],
  creator: 'Walaup',
  metadataBase: new URL('https://walaup.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'fr_TN',
    url: 'https://walaup.vercel.app',
    title: 'Walaup — Ton business mérite une app',
    description: 'Apps sur mesure pour entreprises tunisiennes. Démo gratuite en 48h.',
    siteName: 'Walaup',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Walaup — Ton business mérite une app',
    description: 'Apps sur mesure pour entreprises tunisiennes. Démo gratuite en 48h.',
  },
  manifest: '/manifest.json',
  icons: { icon: '/favicon.svg' },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Walaup',
  },
}

/* ── Root Layout ─────────────────────────────────────── */
export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      dir="ltr"
      data-theme="dark"
      className={`${
        spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable
      }`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#080B14" />
        {/* v3: viewport-fit=cover pour iOS safe areas */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        {/*
          Bridge next/font CSS variables → design token system.
          v3 : ajout font-feature-settings (kern, liga, calt)
          et tabular-nums pour les montants en mono.
        */}
        <style>{`
          :root {
            --font-display: var(--font-display-raw), 'Space Grotesk', system-ui, sans-serif;
            --font-body:    var(--font-body-raw), 'Inter', system-ui, sans-serif;
            --font-mono:    var(--font-mono-raw), 'JetBrains Mono', monospace;
          }

          /* v3: Apple typography features */
          html {
            font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* Nombres tabulaires dans les tableaux et montants */
          .font-mono, .text-mono, [data-tabular] {
            font-variant-numeric: tabular-nums;
            font-feature-settings: "tnum" 1;
          }

          /* iOS safe area support */
          .page-wrapper {
            padding-bottom: env(safe-area-inset-bottom, 0px);
          }
        `}</style>
      </head>
      <body>
        {/* ── Atmospheric layer ── */}
        <div className="aurora-bg" aria-hidden="true">
          <div className="aurora-orb aurora-orb--1" />
          <div className="aurora-orb aurora-orb--2" />
          <div className="aurora-orb aurora-orb--3" />
          <div className="aurora-orb aurora-orb--4" />
        </div>
        <div className="noise-overlay" aria-hidden="true" />

        {/* ── UI chrome ── */}
        <div id="scroll-progress" className="scroll-progress" aria-hidden="true" />
        <div id="cursor-glow"    className="cursor-glow"    aria-hidden="true" />
        <WalaupLoader />

        {/* ── Navigation ── */}
        <Navbar />

        {/* ── Page content ── */}
        <main className="page-wrapper" id="main-content">
          {children}
        </main>

        {/* ── Footer ── */}
        <Footer />

        {/* ── Toast container ── */}
        <div id="toast-container" aria-live="polite" aria-atomic="false" />

        {/* ── PWA Install Banner ── */}
        <div id="install-banner" className="install-banner" aria-live="polite" hidden>
          <div className="install-banner__icon" aria-hidden="true">
            <span style=
              fontSize: '1.4rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
            >W</span>
          </div>
          <div className="install-banner__content">
            <p className="install-banner__title">Installer Walaup</p>
            <p className="install-banner__subtitle">Accès rapide · Mode hors-ligne</p>
          </div>
          <div className="install-banner__actions">
            <button className="btn btn-ghost btn-sm" id="install-banner-dismiss">Plus tard</button>
            <button className="btn btn-primary btn-sm" id="install-banner-confirm">Installer</button>
          </div>
        </div>

        {/* ── v3: Sound system init sur window ── */}
        {/* WalaupSound est exporté comme window.WalaupSound depuis sound.js */}
        {/* L'init AudioContext se fait au premier pointerdown via EffectsClient */}

        {/* ── Client-side effects bootstrap ── */}
        <EffectsClient />
      </body>
    </html>
  )
}