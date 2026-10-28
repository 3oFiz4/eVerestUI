/** Shared paint helpers for canvas-hosted effects. */

export function hexA(hex, alpha) {
  const v = String(hex).replace('#', '')
  const n = parseInt(v.length === 3 ? v.replace(/(.)/g, '$1$1') : v, 16)
  const r = Number.isNaN(n) ? 255 : (n >> 16) & 255
  const g = Number.isNaN(n) ? 255 : (n >> 8) & 255
  const b = Number.isNaN(n) ? 255 : n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Black or white, whichever stays legible on `hex`. */
export function readableOn(hex) {
  const v = String(hex).replace('#', '')
  const n = parseInt(v.length === 3 ? v.replace(/(.)/g, '$1$1') : v, 16)
  if (Number.isNaN(n)) return '#000000'
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return lum > 0.55 ? '#000000' : '#ffffff'
}

export function roundRect(ctx, x, y, w, h, tl = 0, tr = tl, br = tl, bl = tl) {
  // arcTo with radius 0 is a plain lineTo, so the sharp-corner case needs no branch
  ctx.beginPath()
  ctx.moveTo(x + tl, y)
  ctx.lineTo(x + w - tr, y)
  ctx.arcTo(x + w, y, x + w, y + tr, tr)
  ctx.lineTo(x + w, y + h - br)
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br)
  ctx.lineTo(x + bl, y + h)
  ctx.arcTo(x, y + h, x, y + h - bl, bl)
  ctx.lineTo(x, y + tl)
  ctx.arcTo(x, y, x + tl, y, tl)
  ctx.closePath()
}

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)

/**
 * Wandering focal point shared by the floating-glow modes, the node swarm and
 * the hyper-triangle mesh. Frame-rate independent: the decay constant is raised
 * to `dt`, so 30fps and 144fps converge at the same rate.
 */
export class Attractor {
  constructor(bounds = { w: 100, h: 100 }, { speed = 0.35, seed = 1, radius = 0.42 } = {}) {
    this.b = bounds
    this.speed = speed
    this.radius = radius
    this.t = seed * 97.13
    this.x = bounds.w / 2
    this.y = bounds.h / 2
    this.vx = 0
    this.vy = 0
    this.pulse = 1
  }

  resize(bounds) {
    this.b = bounds
  }

  /** `follow` pulls toward the cursor when inside; otherwise a slow lissajous drift. */
  step(dt, pointer, follow) {
    this.t += dt * this.speed
    const { w, h } = this.b
    let tx
    let ty
    if (follow && pointer?.inside) {
      tx = pointer.px
      ty = pointer.py
    } else {
      tx = w * (0.5 + this.radius * Math.sin(this.t * 1.7) * Math.cos(this.t * 0.61))
      ty = h * (0.5 + this.radius * Math.sin(this.t * 1.13 + 1.7) * Math.cos(this.t * 0.83))
    }
    const k = 1 - Math.pow(1e-3, dt)
    const px = this.x
    const py = this.y
    this.x += (tx - this.x) * k
    this.y += (ty - this.y) * k
    this.vx = (this.x - px) / Math.max(1e-6, dt)
    this.vy = (this.y - py) / Math.max(1e-6, dt)
    this.pulse = 0.72 + 0.28 * Math.sin(this.t * 2.3)
    return this
  }
}
