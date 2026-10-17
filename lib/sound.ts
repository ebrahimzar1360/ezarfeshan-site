/**
 * Soft interface sounds, synthesised with Web Audio — no files to download.
 *
 * Off by default: a visitor turns them on with the speaker button in the
 * header (SoundToggle) and the choice is remembered. Browsers refuse audio
 * until a user gesture, so a remembered "on" waits for the first pointer or
 * key press before it unlocks.
 *
 * Every sound is short and quiet, and throttled, so a fast scroll or a burst
 * of clicks cannot pile them up. Adapted from the RCA site's sound.ts.
 */

const KEY = 'ez-sound'
/** fired on window whenever the setting changes */
export const SOUND_EVENT = 'ez-sound-change'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let enabled = false
let lastMorph = 0
let lastTick = 0

export function soundEnabled() {
  return enabled
}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)
  }
  return ctx
}

/** Must run inside a user gesture the first time, or the browser keeps the context suspended. */
export function setSound(on: boolean) {
  enabled = on
  try {
    localStorage.setItem(KEY, on ? '1' : '0')
  } catch {
    // private mode: the choice lasts this visit only
  }
  if (on) void audio()?.resume()
  window.dispatchEvent(new Event(SOUND_EVENT))
}

/** Reads the stored choice; a stored "on" unlocks on the next gesture. */
export function restoreSound() {
  let stored = false
  try {
    stored = localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
  if (!stored) return false
  const unlock = () => {
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
    setSound(true)
  }
  window.addEventListener('pointerdown', unlock, { once: true })
  window.addEventListener('keydown', unlock, { once: true })
  return true
}

function out() {
  return enabled && ctx && master && ctx.state === 'running' ? { ctx, master } : null
}

function chime(freq: number, at: number, level: number, decay = 1.3) {
  const a = out()
  if (!a) return
  const osc = a.ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, at)
  const g = a.ctx.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(level, at + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, at + decay)
  osc.connect(g).connect(a.master)
  osc.start(at)
  osc.stop(at + decay + 0.05)
}

function noise(at: number, len: number, from: number, to: number, level: number, q = 1.4) {
  const a = out()
  if (!a) return
  const buf = a.ctx.createBuffer(1, Math.max(1, Math.floor(a.ctx.sampleRate * len)), a.ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = a.ctx.createBufferSource()
  src.buffer = buf
  const band = a.ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = q
  band.frequency.setValueAtTime(from, at)
  band.frequency.exponentialRampToValueAtTime(to, at + len * 0.75)
  const g = a.ctx.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(level, at + Math.min(0.2, len * 0.3))
  g.gain.exponentialRampToValueAtTime(0.0001, at + len)
  src.connect(band).connect(g).connect(a.master)
  src.start(at)
  src.stop(at + len)
}

/** An airy whoosh with a faint chime: a 3D scene changing shape. `pitch` in Hz. */
export function playMorph(pitch = 440) {
  const a = out()
  if (!a) return
  const now = a.ctx.currentTime
  if (now - lastMorph < 0.35) return
  lastMorph = now
  noise(now, 1.1, 380, 2600, 0.045)
  chime(pitch, now + 0.35, 0.02)
  chime(pitch * 1.5, now + 0.42, 0.011)
}

/** A short bright ping, for a click on a 3D object. */
export function playPing(pitch = 660) {
  const a = out()
  if (!a) return
  const now = a.ctx.currentTime
  chime(pitch, now, 0.035)
  chime(pitch * 2, now + 0.05, 0.013)
  noise(now, 0.7, 900, 4200, 0.02, 0.9)
}

/** A small glassy click: one piece locking into place. `step` raises the pitch a little each time. */
export function playLock(step = 0) {
  const a = out()
  if (!a) return
  const now = a.ctx.currentTime
  if (now - lastTick < 0.05) return
  lastTick = now
  noise(now, 0.09, 2400, 5200, 0.05, 3)
  chime(880 * Math.pow(2, (step * 2) / 12), now + 0.005, 0.02, 0.45)
}

/** The resolved chord when a whole figure completes. */
export function playResolve(root = 523) {
  const a = out()
  if (!a) return
  const now = a.ctx.currentTime
  ;[1, 1.25, 1.5, 2].forEach((m, i) => chime(root * m, now + i * 0.07, 0.018, 1.8))
}
