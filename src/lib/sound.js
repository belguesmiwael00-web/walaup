/**
 * sound.js — Walaup Sound System v3.0
 * Web Audio API pure — zéro fichiers .mp3
 * Gamme pentatonique mineure de Ré : D, F, G, A, C
 * Architecture Apple HIG Audio
 */

/* ── Context singleton ───────────────────────────────────────── */
let _ctx = null
let _masterGain = null
let _reverbBuffer = null
let _enabled = true
let _masterVolume = 0.8
const _cooldowns = new Map()

function getCtx() {
  if (typeof window === 'undefined') return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)()
      _masterGain = _ctx.createGain()
      _masterGain.gain.value = _masterVolume
      _masterGain.connect(_ctx.destination)
      _buildReverb()
    } catch { return null }
  }
  if (_ctx.state === 'suspended') _ctx.resume().catch(() => {})
  return _ctx
}

async function _buildReverb() {
  if (!_ctx) return
  const sr = _ctx.sampleRate
  const len = sr * 1.5
  const buf = _ctx.createBuffer(2, len, sr)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5)
    }
  }
  _reverbBuffer = buf
}

/* ── Core engine ───────────────────────────────────────────── */
function _playNote({ freq, dur = 0.12, vol = 0.10, type = 'sine', attack = 0.005,
  decay = 0.04, sustain = 0.15, release = 0.06, detune = 0, pan = 0,
  delay = 0, reverb = false }) {
  const ctx = getCtx()
  if (!ctx || !_enabled || !_masterGain) return
  const t = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  const panner = ctx.createStereoPanner()
  osc.type = type
  osc.frequency.value = freq
  osc.detune.value = detune
  panner.pan.value = Math.max(-1, Math.min(1, pan))
  const totalDur = attack + decay + release
  gainNode.gain.setValueAtTime(0, t)
  gainNode.gain.linearRampToValueAtTime(vol, t + attack)
  gainNode.gain.linearRampToValueAtTime(vol * sustain, t + attack + decay)
  gainNode.gain.setValueAtTime(vol * sustain, t + Math.max(totalDur, dur) - release)
  gainNode.gain.linearRampToValueAtTime(0.0001, t + Math.max(totalDur, dur))
  osc.connect(gainNode)
  if (reverb && _reverbBuffer) {
    const conv = ctx.createConvolver()
    const rvGain = ctx.createGain()
    conv.buffer = _reverbBuffer
    rvGain.gain.value = 0.10
    gainNode.connect(conv)
    conv.connect(rvGain)
    rvGain.connect(panner)
    gainNode.connect(panner)
  } else {
    gainNode.connect(panner)
  }
  panner.connect(_masterGain)
  osc.start(t)
  osc.stop(t + Math.max(totalDur, dur) + 0.05)
  osc.onended = () => {
    try { osc.disconnect(); gainNode.disconnect(); panner.disconnect() } catch {}
  }
}

function _antiSpam(key, ms = 80) {
  const now = Date.now()
  if (_cooldowns.get(key) > now - ms) return false
  _cooldowns.set(key, now)
  return true
}

function _play(key, notes) {
  if (!_antiSpam(key)) return
  notes.forEach(n => _playNote(n))
}

/* ── Sound catalog — gamme pentatonique Ré mineur ───────────── */
// D4=293.7, F4=349.2, G4=392, A4=440, C5=523.3
// D5=587.3, F5=698.5, G5=784, A5=880, C6=1046.5, D6=1174.7

const sounds = {

  /* Navigation — ultra-discrets */
  tap() {
    _play('tap', [{ freq: 587.3, dur: 0.08, vol: 0.06, type: 'sine',
      attack: 0.002, decay: 0.03, sustain: 0.05, release: 0.045 }])
  },

  click() {
    _play('click', [
      { freq: 587.3, dur: 0.10, vol: 0.09, type: 'sine', attack: 0.003, decay: 0.04, sustain: 0.1, release: 0.055 },
      { freq: 880,   dur: 0.10, vol: 0.05, type: 'sine', attack: 0.003, decay: 0.04, sustain: 0.05, release: 0.055 },
    ])
  },

  tab() {
    _play('tab', [
      { freq: 587.3, dur: 0.11, vol: 0.08, type: 'sine', attack: 0.003, decay: 0.05, sustain: 0.1, release: 0.055, pan: 0 },
      { freq: 698.5, dur: 0.11, vol: 0.05, type: 'sine', attack: 0.003, decay: 0.05, sustain: 0.05, release: 0.055 },
    ])
  },

  back() {
    _play('back', [
      { freq: 587.3, dur: 0.09, vol: 0.07, type: 'sine', attack: 0.003, decay: 0.04, sustain: 0.05, release: 0.045 },
      { freq: 440,   dur: 0.09, vol: 0.04, type: 'sine', attack: 0.003, decay: 0.04, sustain: 0.03, release: 0.045, delay: 0.04 },
    ])
  },

  toggle() {
    _play('toggle', [{ freq: 784, dur: 0.07, vol: 0.06, type: 'triangle',
      attack: 0.001, decay: 0.02, sustain: 0.04, release: 0.045 }])
  },

  /* Actions */
  send() {
    _play('send', [
      { freq: 392,   dur: 0.18, vol: 0.10, type: 'sine', attack: 0.005, decay: 0.08, sustain: 0.2, release: 0.08, pan: 0 },
      { freq: 880,   dur: 0.16, vol: 0.07, type: 'sine', attack: 0.005, decay: 0.06, sustain: 0.1, release: 0.08, pan: 0.2, delay: 0.06 },
    ])
  },

  receive() {
    _play('receive', [
      { freq: 698.5, dur: 0.20, vol: 0.10, type: 'sine', attack: 0.006, decay: 0.08, sustain: 0.2, release: 0.10, pan: -0.15 },
      { freq: 880,   dur: 0.18, vol: 0.07, type: 'sine', attack: 0.006, decay: 0.07, sustain: 0.1, release: 0.10, pan: -0.15, delay: 0.08 },
    ])
  },

  /* Feedback positif */
  success() {
    _play('success', [
      { freq: 587.3, dur: 0.28, vol: 0.12, type: 'sine', attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.16, reverb: true },
      { freq: 739.99,dur: 0.26, vol: 0.09, type: 'sine', attack: 0.01, decay: 0.07, sustain: 0.3, release: 0.14, delay: 0.06, reverb: true },
      { freq: 880,   dur: 0.30, vol: 0.10, type: 'sine', attack: 0.01, decay: 0.09, sustain: 0.4, release: 0.18, delay: 0.12, reverb: true },
    ])
  },

  /* Paiement — son le plus rich du système */
  pay() {
    _play('pay', [
      { freq: 587.3,  dur: 0.22, vol: 0.14, type: 'sine', attack: 0.01, decay: 0.09, sustain: 0.5, release: 0.12, reverb: true },
      { freq: 880,    dur: 0.22, vol: 0.10, type: 'sine', attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.12, delay: 0.08, reverb: true },
      { freq: 1174.7, dur: 0.30, vol: 0.11, type: 'sine', attack: 0.01, decay: 0.10, sustain: 0.5, release: 0.18, delay: 0.16, reverb: true },
    ])
  },

  /* Feedback négatif */
  error() {
    _play('error', [
      { freq: 293.7, dur: 0.20, vol: 0.10, type: 'sine', attack: 0.005, decay: 0.08, sustain: 0.1, release: 0.10 },
      { freq: 220,   dur: 0.20, vol: 0.07, type: 'triangle', attack: 0.005, decay: 0.07, sustain: 0.05, release: 0.10, delay: 0.06, detune: -30 },
    ])
  },

  warning() {
    _play('warning', [{ freq: 392, dur: 0.16, vol: 0.08, type: 'triangle',
      attack: 0.004, decay: 0.06, sustain: 0.1, release: 0.08, detune: -20 }])
  },

  /* Notifications */
  notif() {
    _play('notif', [
      { freq: 784,    dur: 0.22, vol: 0.10, type: 'sine', attack: 0.006, decay: 0.08, sustain: 0.25, release: 0.12, reverb: true },
      { freq: 1174.7, dur: 0.22, vol: 0.07, type: 'sine', attack: 0.006, decay: 0.07, sustain: 0.15, release: 0.12, delay: 0.08, reverb: true },
    ])
  },

  /* Système */
  modalOpen() {
    _play('modalOpen', [
      { freq: 440, dur: 0.18, vol: 0.07, type: 'sine', attack: 0.008, decay: 0.07, sustain: 0.2, release: 0.09 },
      { freq: 587.3, dur: 0.18, vol: 0.05, type: 'sine', attack: 0.008, decay: 0.06, sustain: 0.1, release: 0.09, delay: 0.06 },
    ])
  },

  modalClose() {
    _play('modalClose', [
      { freq: 587.3, dur: 0.14, vol: 0.06, type: 'sine', attack: 0.004, decay: 0.05, sustain: 0.1, release: 0.07 },
      { freq: 440,   dur: 0.14, vol: 0.04, type: 'sine', attack: 0.004, decay: 0.05, sustain: 0.05, release: 0.07, delay: 0.04 },
    ])
  },

  copy() {
    _play('copy', [{ freq: 1046.5, dur: 0.06, vol: 0.06, type: 'sine',
      attack: 0.001, decay: 0.02, sustain: 0.01, release: 0.035 }])
  },

  delete() {
    _play('delete', [{ freq: 220, dur: 0.18, vol: 0.08, type: 'triangle',
      attack: 0.005, decay: 0.07, sustain: 0.05, release: 0.09, detune: -15 }])
  },

  /* Level up — moment exceptionnel */
  levelUp() {
    _play('levelUp', [
      { freq: 523.3,  dur: 0.22, vol: 0.14, type: 'sine', attack: 0.01, decay: 0.09, sustain: 0.5, release: 0.12, reverb: true },
      { freq: 659.3,  dur: 0.22, vol: 0.10, type: 'sine', attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.12, delay: 0.10, reverb: true },
      { freq: 784,    dur: 0.22, vol: 0.10, type: 'sine', attack: 0.01, decay: 0.09, sustain: 0.4, release: 0.12, delay: 0.20, reverb: true },
      { freq: 1046.5, dur: 0.30, vol: 0.12, type: 'sine', attack: 0.01, decay: 0.10, sustain: 0.5, release: 0.18, delay: 0.30, reverb: true },
    ])
  },

  install() {
    _play('install', [
      { freq: 523.3, dur: 0.18, vol: 0.12, type: 'sine', attack: 0.01, decay: 0.07, sustain: 0.4, release: 0.10, reverb: true },
      { freq: 784,   dur: 0.18, vol: 0.09, type: 'sine', attack: 0.01, decay: 0.07, sustain: 0.3, release: 0.10, delay: 0.12, reverb: true },
      { freq: 1046.5,dur: 0.22, vol: 0.10, type: 'sine', attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.14, delay: 0.22, reverb: true },
    ])
  },

  /* API Publique — setters */
  setEnabled(v) {
    _enabled = v
    if (typeof localStorage !== 'undefined') localStorage.setItem('walaup_sound', String(v))
  },
  setVolume(v) {
    _masterVolume = Math.max(0, Math.min(1, v))
    if (_masterGain) _masterGain.gain.value = _masterVolume
    if (typeof localStorage !== 'undefined') localStorage.setItem('walaup_sound_vol', String(v))
  },
  get isEnabled() { return _enabled },
  get volume() { return _masterVolume },
}

/* Charger les préférences persistées */
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('walaup_sound')
  if (saved !== null) _enabled = saved === 'true'
  const vol = localStorage.getItem('walaup_sound_vol')
  if (vol !== null) _masterVolume = parseFloat(vol)
}

export const WalaupSound = sounds
if (typeof window !== 'undefined') {
  window.WalaupSound = sounds
  window.HiveSound   = sounds
  window.BizSound    = sounds
}
export default sounds