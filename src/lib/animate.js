/**
 * animate.js — Walaup Animation System v3.0
 * Apple-grade motion — Spring physics, blur entry, reduced motion.
 * SSR-safe: all functions guard typeof window.
 */

/* ── 1. SCROLL REVEAL ─────────────────────────────────────── */
let _scrollObserver = null

export function initScrollAnimations() {
  if (typeof window === 'undefined') return
  if (_scrollObserver) _scrollObserver.disconnect()
  _scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
          _scrollObserver.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  )
  document
    .querySelectorAll('[data-animate]:not(.animate-in), [data-stagger]:not(.animate-in)')
    .forEach((el) => _scrollObserver.observe(el))
}

/* ── 2. CARD SPOTLIGHT + TILT (Apple-grade ±6°) ─────────────── */
const _cardListeners = new WeakMap()
let   _lastScrollY   = 0
let   _mobileObserver = null

export function initTiltCards() {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  if (isFine) {
    document.querySelectorAll('.card').forEach((card) => {
      if (_cardListeners.has(card)) return
      const onMove = (e) => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        card.style.setProperty('--mx', x + 'px')
        card.style.setProperty('--my', y + 'px')
        card.classList.add('_spotlight-active')
        if (card.classList.contains('card--tilt')) {
          const dx = (x - rect.width / 2)  / (rect.width  / 2)
          const dy = (y - rect.height / 2) / (rect.height / 2)
          /* Apple-grade: max ±6° au lieu de ±15° */
          card.style.transform =
            `perspective(900px) rotateX(${dy * -6}deg) rotateY(${dx * 6}deg) translateZ(4px)`
        }
      }
      const onLeave = () => {
        card.classList.remove('_spotlight-active')
        if (card.classList.contains('card--tilt')) card.style.transform = ''
      }
      card.addEventListener('mousemove', onMove, { passive: true })
      card.addEventListener('mouseleave', onLeave)
      _cardListeners.set(card, { onMove, onLeave })
    })
    return
  }

  /* Mobile */
  if (_mobileObserver) _mobileObserver.disconnect()
  document.querySelectorAll('.card').forEach((card) => {
    card.style.setProperty('--mx', '50%')
    card.style.setProperty('--my', '50%')
  })
  _mobileObserver = new IntersectionObserver(
    (entries) => {
      const scrollingDown = window.scrollY >= _lastScrollY
      entries.forEach((entry) => {
        const card = entry.target
        if (entry.isIntersecting && scrollingDown) card.classList.add('_spotlight-active')
        else if (!entry.isIntersecting) card.classList.remove('_spotlight-active')
      })
      _lastScrollY = window.scrollY
    },
    { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
  )
  document.querySelectorAll('.card').forEach((card) => _mobileObserver.observe(card))
  window.addEventListener('scroll', () => { _lastScrollY = window.scrollY }, { passive: true })
}

/* ── 3. MAGNETIC BUTTONS (Apple ±6px max) ──────────────────── */
const _magneticListeners = new WeakMap()

export function initMagneticButtons() {
  if (typeof window === 'undefined') return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  document.querySelectorAll('.btn-magnetic').forEach((btn) => {
    if (_magneticListeners.has(btn)) return
    const onMove = (e) => {
      const rect = btn.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top  + rect.height / 2)
      /* Apple-grade: ±6px max (lerp factor 0.15) */
      const maxMove = 6
      const mx = Math.max(-maxMove, Math.min(maxMove, dx * 0.15))
      const my = Math.max(-maxMove, Math.min(maxMove, dy * 0.15))
      btn.style.transform = `translate(${mx}px, ${my}px)`
    }
    const onLeave = () => { btn.style.transform = '' }
    btn.addEventListener('mousemove', onMove)
    btn.addEventListener('mouseleave', onLeave)
    _magneticListeners.set(btn, { onMove, onLeave })
  })
}

/* ── 4. CURSOR GLOW (Spotlight Apple — lerp 0.06) ────────────── */
let _cursorGlowInit = false

export function initCursorGlow() {
  if (typeof window === 'undefined') return
  if (_cursorGlowInit) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const glow = document.getElementById('cursor-glow')
  if (!glow) return
  _cursorGlowInit = true
  let rafId = null
  let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0
  const lerp = (a, b, t) => a + (b - a) * t
  const animate = () => {
    glowX = lerp(glowX, mouseX, 0.06) /* 0.06 = plus fluide que 0.08 */
    glowY = lerp(glowY, mouseY, 0.06)
    glow.style.left = glowX + 'px'
    glow.style.top  = glowY + 'px'
    rafId = requestAnimationFrame(animate)
  }
  window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY }, { passive: true })
  rafId = requestAnimationFrame(animate)
  window.addEventListener('beforeunload', () => cancelAnimationFrame(rafId), { once: true })
}

/* ── 5. SCROLL PROGRESS BAR ────────────────────────────────── */
let _scrollProgressInit = false

export function initScrollProgress() {
  if (typeof window === 'undefined') return
  if (_scrollProgressInit) return
  const bar = document.getElementById('scroll-progress')
  if (!bar) return
  _scrollProgressInit = true
  const update = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement
    const p = scrollTop / (scrollHeight - clientHeight)
    bar.style.transform = `scaleX(${isNaN(p) ? 0 : p})`
    bar.style.opacity = p < 0.02 ? '0' : '1'
  }
  window.addEventListener('scroll', update, { passive: true })
  update()
}

/* ── 6. ANIMATED COUNTER ───────────────────────────────────── */
export function animateCounter(el, target, duration = 2000, prefix = '', suffix = '', decimals = -1) {
  if (!el || typeof window === 'undefined') return
  const start = performance.now()
  const initial = parseFloat(el.dataset.counterFrom ?? el.textContent) || 0
  const isInt = decimals === -1 ? Number.isInteger(target) : decimals === 0
  const dec = decimals === -1 ? (isInt ? 0 : 1) : decimals
  const format = (v) => prefix + (isInt ? Math.round(v).toLocaleString('fr-TN') : v.toFixed(dec)) + suffix
  const update = (now) => {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 4)
    el.textContent = format(initial + (target - initial) * eased)
    if (progress < 1) requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

export function initCounters() {
  if (typeof window === 'undefined') return
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target
        const target = parseFloat(el.dataset.counter)
        if (!isNaN(target)) {
          animateCounter(
            el, target,
            parseInt(el.dataset.duration ?? '2000', 10),
            el.dataset.prefix ?? '',
            el.dataset.suffix ?? '',
            parseInt(el.dataset.decimals ?? '-1', 10)
          )
        }
        observer.unobserve(el)
      })
    },
    { threshold: 0.4 }
  )
  document.querySelectorAll('[data-counter]').forEach((el) => observer.observe(el))
}

/* ── 7. TYPEWRITER ───────────────────────────────────────────── */
export function typewriter(el, text, speed = 45, delay = 0) {
  if (!el) return () => {}
  el.textContent = ''
  let i = 0, timeoutId = null, intervalId = null
  timeoutId = setTimeout(() => {
    intervalId = setInterval(() => {
      el.textContent += text[i++]
      if (i >= text.length) clearInterval(intervalId)
    }, speed)
  }, delay)
  return () => { clearTimeout(timeoutId); clearInterval(intervalId) }
}

export function typewriterCycle(el, texts, opts = {}) {
  if (!el || !texts.length) return () => {}
  const { typeSpeed = 60, eraseSpeed = 35, pauseTyped = 2200, pauseErased = 400 } = opts
  let current = 0, charIndex = 0, isErasing = false, rafId = null, lastTime = 0
  const step = (timestamp) => {
    const elapsed = timestamp - lastTime
    if (elapsed < (isErasing ? eraseSpeed : typeSpeed)) { rafId = requestAnimationFrame(step); return }
    lastTime = timestamp
    const text = texts[current]
    if (!isErasing) {
      el.textContent = text.slice(0, ++charIndex)
      if (charIndex >= text.length) { isErasing = true; lastTime = timestamp + pauseTyped }
    } else {
      el.textContent = text.slice(0, --charIndex)
      if (charIndex === 0) { isErasing = false; current = (current + 1) % texts.length; lastTime = timestamp + pauseErased }
    }
    rafId = requestAnimationFrame(step)
  }
  rafId = requestAnimationFrame(step)
  return () => cancelAnimationFrame(rafId)
}

/* ── 8. PARTICLE SYSTEM (v3: 18 max, zéro connexions filaires) ──── */
export class ParticleSystem {
  constructor(canvas, options = {}) {
    if (!canvas || typeof window === 'undefined') return
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.particles = []
    this.mouse = { x: -9999, y: -9999 }
    this.animId = null
    this.options = {
      count:              options.count              ?? 18,    /* v3: 18 max */
      color:              options.color              ?? 'rgba(99, 102, 241, 0.5)',
      maxSpeed:           options.maxSpeed           ?? 0.3,
      mouseRepelDistance: options.mouseRepelDistance ?? 80,
      sizeMin:            options.sizeMin            ?? 0.8,
      sizeMax:            options.sizeMax            ?? 2.0,
      opacityMin:         options.opacityMin         ?? 0.15, /* v3: 0.15–0.35 */
      opacityMax:         options.opacityMax         ?? 0.35,
    }
    this._onResize = this._resize.bind(this)
    this._onMouse  = (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY }
    this._onLeave  = () => { this.mouse.x = -9999; this.mouse.y = -9999 }
    window.addEventListener('resize',    this._onResize, { passive: true })
    window.addEventListener('mousemove', this._onMouse,  { passive: true })
    document.addEventListener('mouseleave', this._onLeave)
    this._resize()
    this._init()
    this._animate()
  }
  _resize() {
    if (!this.canvas) return
    this.canvas.width  = window.innerWidth
    this.canvas.height = window.innerHeight
  }
  _init() {
    const { count, maxSpeed, sizeMin, sizeMax, opacityMin, opacityMax } = this.options
    this.particles = Array.from({ length: count }, () => ({
      x:  Math.random() * this.canvas.width,
      y:  Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * maxSpeed,
      vy: (Math.random() - 0.5) * maxSpeed,
      size: Math.random() * (sizeMax - sizeMin) + sizeMin,
      opacity: Math.random() * (opacityMax - opacityMin) + opacityMin,
    }))
  }
  _animate() {
    if (!this.ctx) return
    const { width, height } = this.canvas
    const { color, mouseRepelDistance } = this.options
    this.ctx.clearRect(0, 0, width, height)
    this.particles.forEach((p) => {
      const dx = p.x - this.mouse.x
      const dy = p.y - this.mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < mouseRepelDistance && dist > 0) {
        const force = (mouseRepelDistance - dist) / mouseRepelDistance
        p.vx += (dx / dist) * force * 0.5
        p.vy += (dy / dist) * force * 0.5
      }
      p.vx *= 0.990; p.vy *= 0.990
      p.x += p.vx;   p.y += p.vy
      if (p.x < 0) p.x = width;  if (p.x > width)  p.x = 0
      if (p.y < 0) p.y = height; if (p.y > height) p.y = 0
      this.ctx.beginPath()
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      this.ctx.fillStyle = color
      this.ctx.globalAlpha = p.opacity
      this.ctx.fill()
      /* v3: Connexions filaires désactivées — Apple spec */
    })
    this.ctx.globalAlpha = 1
    this.animId = requestAnimationFrame(() => this._animate())
  }
  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId)
    window.removeEventListener('resize',    this._onResize)
    window.removeEventListener('mousemove', this._onMouse)
    document.removeEventListener('mouseleave', this._onLeave)
  }
}

/* ── 9. TOAST SYSTEM (inchangé) ───────────────────────────────── */
const TOAST_ICONS = {
  success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  error:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
}

function showToast(message, type = 'info', duration = 4500) {
  if (typeof window === 'undefined') return
  const container = document.getElementById('toast-container')
  if (!container) return
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.setAttribute('role', 'alert')
  toast.style.setProperty('--toast-duration', duration + 'ms')
  toast.innerHTML = `
    <span class="toast-icon">${TOAST_ICONS[type]}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Fermer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `
  const remove = () => {
    toast.classList.add('removing')
    toast.addEventListener('animationend', () => toast.remove(), { once: true })
  }
  toast.querySelector('.toast-close').addEventListener('click', remove)
  const timer = setTimeout(remove, duration)
  toast.addEventListener('mouseenter', () => clearTimeout(timer))
  container.appendChild(toast)
  return { remove }
}

export const Toast = {
  success: (msg, d) => showToast(msg, 'success', d),
  error:   (msg, d) => showToast(msg, 'error', d),
  warning: (msg, d) => showToast(msg, 'warning', d),
  info:    (msg, d) => showToast(msg, 'info', d),
}

if (typeof window !== 'undefined') window.WalaupToast = Toast