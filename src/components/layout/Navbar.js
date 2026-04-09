'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Store } from 'lucide-react'

const NAV_LINKS = [
  { href: '/#problems',     label: 'Pourquoi nous' },
  { href: '/#solutions',    label: 'Solutions' },
  { href: '/#how',          label: 'Comment ça marche' },
  { href: '/#testimonials', label: 'Avis clients' },
  { href: '/#packs',        label: 'Nos packs' },
]

const sound = (name) => {
  if (typeof window !== 'undefined' && window.WalaupSound?.[name]) {
    window.WalaupSound[name]()
  }
}

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 24)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <style>{`
        @keyframes gold-pulse {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 4px #F59E0B); }
          50%       { opacity: 0.45; filter: drop-shadow(0 0 1px #F59E0B); }
        }
        .marketplace-icon {
          animation: gold-pulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        .marketplace-link {
          display: flex !important;
          align-items: center;
          gap: 5px;
          font-weight: 600 !important;
          color: #F59E0B !important;
        }
        .marketplace-link:hover {
          background: rgba(245,158,11,0.10) !important;
          color: #FCD34D !important;
        }
        /* v3: touch-action sur les boutons interactifs */
        .nav-hamburger, .btn { touch-action: manipulation; }
      `}</style>

      <nav
        className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}
        role="navigation"
        aria-label="Navigation principale"
      >
        <div className="navbar__inner">

          {/* Brand */}
          <Link href="/" className="brand-wordmark" aria-label="Walaup — Accueil"
            onClick={() => sound('tap')}>
            Walaup<span className="brand-dot">.</span>
          </Link>

          {/* Desktop nav links */}
          <ul className="nav-links" role="list">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <Link href={link.href} className="nav-link" onClick={() => sound('tap')}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/marketplace" className="nav-link marketplace-link" onClick={() => sound('tap')}>
                <Store size={14} className="marketplace-icon" color="#F59E0B" strokeWidth={2.2} />
                Marketplace
              </Link>
            </li>
          </ul>

          {/* Desktop actions */}
          <div className="nav-actions">
            <Link href="/client" className="btn btn-ghost btn-sm" onClick={() => sound('tap')}>
              Se connecter
            </Link>
            <Link href="/#contact" className="btn btn-primary btn-sm btn-magnetic"
              onClick={() => sound('click')}>
              Créer mon app
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`nav-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => { setMenuOpen(prev => !prev); sound('toggle') }}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            style= touchAction: 'manipulation' 
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`nav-mobile-menu${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-label="Menu mobile"
      >
        {NAV_LINKS.map(link => (
          <Link key={link.href} href={link.href} className="nav-link"
            onClick={() => { setMenuOpen(false); sound('tap') }}>
            {link.label}
          </Link>
        ))}
        <Link href="/marketplace" className="nav-link marketplace-link"
          onClick={() => { setMenuOpen(false); sound('tap') }}>
          <Store size={15} className="marketplace-icon" color="#F59E0B" strokeWidth={2.2} />
          Marketplace
        </Link>
        <div className="nav-actions">
          <Link href="/client" className="btn btn-ghost"
            onClick={() => { setMenuOpen(false); sound('tap') }}>
            Se connecter
          </Link>
          <Link href="/#contact" className="btn btn-primary"
            onClick={() => { setMenuOpen(false); sound('click') }}>
            Créer mon app
          </Link>
        </div>
      </div>
    </>
  )
}