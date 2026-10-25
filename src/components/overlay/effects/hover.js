import { AnimationBase } from '../AnimationBase.js'
import { clamp, hexA, roundRect } from '../paint.js'

/* -------------------------------------------------------------- grid-track */
/**
 * Canvas-hosted cell grid that shadows the cursor: a tile snapped to the nearest
 * lattice point plus the two crosshair lines through it. The snap makes the tile
 * look welded to the grid rather than floating with the pointer.
 *   shape: 'square' | 'circle'
 */
export class GridTrack extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static defaults = {
    color: '#e5e7eb',
    opacity: 0.5,
    cell: 24,
    shape: 'square',
    tileScale: 1, // tile size as a multiple of `cell`
    radius: 2, // corner rounding of the square tile
    grid: true, // draw the full lattice + crosshair
    gridOpacity: 0.5, // relative to `opacity`
    lineWidth: 1,
    ease: 0.18, // per-frame follow smoothing
    fade: 0.2,
  }

  build() {
    this.cur = { x: this.size.w / 2, y: this.size.h / 2 }
  }

  layout() {
    this.cur = { x: this.size.w / 2, y: this.size.h / 2 }
  }

  render() {
    const o = this.opts
    const ctx = this.ctx2d
    const { w, h } = this.size
    const target = this.pointer.inside ? { x: this.pointer.px, y: this.pointer.py } : this.cur
    this.cur.x += (target.x - this.cur.x) * o.ease
    this.cur.y += (target.y - this.cur.y) * o.ease
    const cx = this.cur.x
    const cy = this.cur.y
    const step = Math.max(4, o.cell)
    const snapX = Math.floor(cx / step) * step
    const snapY = Math.floor(cy / step) * step
    const size = step * Math.max(0.2, o.tileScale)

    ctx.save()
    ctx.strokeStyle = o.color
    ctx.lineWidth = o.lineWidth

    if (o.grid) {
      ctx.globalAlpha = o.opacity * o.gridOpacity
      ctx.beginPath()
      for (let x = 0; x <= w; x += step) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
      }
      for (let y = 0; y <= h; y += step) {
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
      }
      ctx.stroke()
      ctx.globalAlpha = o.opacity
      ctx.beginPath()
      ctx.moveTo(cx, 0)
      ctx.lineTo(cx, h)
      ctx.moveTo(0, cy)
      ctx.lineTo(w, cy)
      ctx.stroke()
    }

    ctx.globalAlpha = clamp(o.opacity * 1.6, 0, 1)
    if (o.shape === 'circle') {
      ctx.beginPath()
      ctx.arc(snapX + step / 2, snapY + step / 2, size / 2, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      ctx.beginPath()
      roundRect(ctx, snapX, snapY, size, size, o.radius)
      ctx.stroke()
    }
    ctx.restore()
  }
}

/* ------------------------------------------------------ hyper-triangle crack */
/**
 * Canvas-hosted radial seam of branching cracks centred on the cursor, growing
 * outward then fading — the mesh appears to fracture from the pointer.
 */
export class HyperTriangleCrack extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static defaults = {
    color: '#f472b6',
    branches: 7,
    reach: 0.6, // fraction of the half-diagonal travelled
    speed: 1, // cracks per 1.4s cycle
    thickness: 1.2,
    opacity: 0.8,
    wobble: 0.35, // radians of angular jitter per segment
    segments: 6,
    follow: true,
    ease: 0.18,
    fade: 0.25,
  }

  build() {
    this.cur = { x: this.size.w / 2, y: this.size.h / 2 }
    this.t = 0
    this.jitter = Array.from({ length: 64 }, (_, i) => Math.sin(i * 12.9898) * 0.5)
  }

  layout() {
    this.cur = { x: this.size.w / 2, y: this.size.h / 2 }
  }

  render(time, dtRatio) {
    this.t += (dtRatio / 60) * this.opts.speed
    const o = this.opts
    const ctx = this.ctx2d
    const { w, h } = this.size
    if (o.follow && this.pointer.inside) {
      this.cur.x += (this.pointer.px - this.cur.x) * o.ease
      this.cur.y += (this.pointer.py - this.cur.y) * o.ease
    }
    const grow = (this.t % 1.4) / 1.4
    const fade = 1 - grow ** 1.6
    const maxR = Math.hypot(w, h) * 0.5 * o.reach
    const segs = Math.max(2, o.segments | 0)

    ctx.save()
    ctx.strokeStyle = hexA(o.color, o.opacity * fade)
    ctx.lineWidth = o.thickness
    ctx.lineCap = 'round'
    for (let b = 0; b < Math.max(1, o.branches | 0); b++) {
      const base = (b / o.branches) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(this.cur.x, this.cur.y)
      for (let s = 1; s <= segs; s++) {
        const f = s / segs
        const angle = base + this.jitter[(b * segs + s) % 64] * o.wobble
        ctx.lineTo(
          this.cur.x + Math.cos(angle) * maxR * grow * f,
          this.cur.y + Math.sin(angle) * maxR * grow * f
        )
      }
      ctx.stroke()
    }
    ctx.restore()
  }
}

/* --------------------------------------------------------------- outer-grid */
/**
 * Canvas-hosted lattice around the button, brightened near it so the component
 * reads as sitting on a lit grid. `boost` is the extra lightness close in.
 */
export class OuterGrid extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static defaults = {
    color: '#94a3b8',
    opacity: 0.25,
    cell: 28,
    boost: 0.2, // +20% lightness near the button
    inner: 0.15, // falloff start, fraction of the half-diagonal
    spread: 0.5, // how far the boost reaches
    lineWidth: 1,
    fade: 0.3,
  }

  render() {
    const o = this.opts
    const ctx = this.ctx2d
    const { w, h } = this.size
    const step = Math.max(6, o.cell)
    const cx = w / 2
    const cy = h / 2
    const maxD = Math.hypot(w, h) * 0.5
    const inner = maxD * o.inner

    ctx.save()
    ctx.lineWidth = o.lineWidth
    ctx.beginPath()
    for (let x = 0; x <= w; x += step) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
    }
    for (let y = 0; y <= h; y += step) {
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
    }
    ctx.strokeStyle = hexA(o.color, o.opacity)
    ctx.stroke()

    // near field redrawn brighter: cheaper and softer than a per-cell gradient
    ctx.beginPath()
    const lim = inner + maxD * o.spread
    for (let x = 0; x <= w; x += step) {
      const t = clamp(1 - Math.abs(x - cx) / lim, 0, 1)
      if (t <= 0) continue
      ctx.moveTo(x, Math.max(0, cy - lim))
      ctx.lineTo(x, Math.min(h, cy + lim))
    }
    for (let y = 0; y <= h; y += step) {
      const t = clamp(1 - Math.abs(y - cy) / lim, 0, 1)
      if (t <= 0) continue
      ctx.moveTo(Math.max(0, cx - lim), y)
      ctx.lineTo(Math.min(w, cx + lim), y)
    }
    ctx.strokeStyle = hexA(o.color, Math.min(1, o.opacity + o.boost))
    ctx.stroke()
    ctx.restore()
  }
}
