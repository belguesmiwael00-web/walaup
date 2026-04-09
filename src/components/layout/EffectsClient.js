'use client'

import { useEffect } from 'react'
import {
  initScrollAnimations,
  initTiltCards,
  initMagneticButtons,
  initCursorGlow,
  initScrollProgress,
  initCounters,
} from '@/lib/animate'
import { initPWA } from '@/lib/pwa'

/**
 * EffectsClient v3.0 — Bootstrap all client-side effects after hydration.
 * Renders nothing — purely a side-effect component.
 */
export default function EffectsClient() {
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      initScrollAnimations()
      initTiltCards()
      initMagneticButtons()
      initCursorGlow()
      initScrollProgress()
      initCounters()          /* v3: ajouté */
      initPWA()
    })
    return () => cancelAnimationFrame(id)
  }, [])

  /* v3: Init AudioContext sur premier pointeur — respect autoplay policy */
  useEffect(() => {
    const initSound = () => {
      if (typeof window !== 'undefined' && window.WalaupSound) {
        /* Premier tap → réveille l'AudioContext */
        window.WalaupSound.tap()
        window.dispatchEvent(new CustomEvent('walaup:sound-ready'))
      }
      document.removeEventListener('pointerdown', initSound, { once: true })
    }
    document.addEventListener('pointerdown', initSound, { once: true })
    return () => document.removeEventListener('pointerdown', initSound)
  }, [])

  /* Re-init tilt + magnetic + scroll on route changes */
  useEffect(() => {
    const onRouteChange = () => {
      requestAnimationFrame(() => {
        initTiltCards()
        initMagneticButtons()
        initScrollAnimations()
        initCounters()
      })
    }
    window.addEventListener('walaup:route-change', onRouteChange)
    return () => window.removeEventListener('walaup:route-change', onRouteChange)
  }, [])

  return null
}