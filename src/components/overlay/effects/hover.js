import { AnimationBase } from '../AnimationBase.js'
import { normalizeRadius } from '../geometry.js'
import { clamp, hexA, roundRect } from '../paint.js'

/* -------------------------------------------------------------- grid-track */
/**
 * Canvas-hosted cell grid with cursor crosshair and tracking marker.
 * Smoothly follows cursor or snaps to lattice; includes cursor indicator.
 */
export class GridTrack extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static defaults = {
    color: '#e5e7eb',
    opacity: 0.5,
    cell: 20,
    shape: 'circle', // 'circle' | 'square'
    tileScale: 1, // tile size as a multiple of `cell`
    radius: 2, // corner rounding of square tile
    snap: false, // smooth movement by default, true for rigid lattice snap
    grid: true, // draw full lattice + crosshair
    gridOpacity: 0.35,
    cursorMarker: true, // option to add the cursor marker
    cursorShape: 'circle', // 'circle' | 'square'
    cursorSize: 4,
    lineWidth: 1,
    ease: 0.22, // smooth cursor follower
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

    const posX = o.snap ? Math.floor(cx / step) * step + step / 2 : cx
    const posY = o.snap ? Math.floor(cy / step) * step + step / 2 : cy
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

      // Crosshair lines through the follower
      ctx.globalAlpha = o.opacity * 0.8
      ctx.beginPath()
      ctx.moveTo(cx, 0)
      ctx.lineTo(cx, h)
      ctx.moveTo(0, cy)
      ctx.lineTo(w, cy)
      ctx.stroke()
    }

    // Follower tile (smooth movement)
    ctx.globalAlpha = clamp(o.opacity * 1.5, 0, 1)
    if (o.shape === 'circle') {
      ctx.beginPath()
      ctx.arc(posX, posY, size / 2, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      ctx.beginPath()
      roundRect(ctx, posX - size / 2, posY - size / 2, size, size, o.radius)
      ctx.stroke()
    }

    // Cursor indicator right on the cursor
    if (o.cursorMarker && this.pointer.inside) {
      ctx.globalAlpha = clamp(o.opacity * 1.8, 0, 1)
      ctx.fillStyle = o.color
      const px = this.pointer.px
      const py = this.pointer.py
      const csize = o.cursorSize || 4
      if (o.cursorShape === 'square') {
        ctx.fillRect(px - csize / 2, py - csize / 2, csize, csize)
      } else {
        ctx.beginPath()
        ctx.arc(px, py, csize / 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.restore()
  }
}

/* ------------------------------------------------------ hyper-triangle crack */
/**
 * Canvas-hosted crystalline fracture crack for activeOverlayAnimVar.
 * Spawns crystalline hyper-triangles branching outward along the length of crack fissures,
 * focused at the cursor click location.
 */
export class HyperTriangleCrack extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static ballistic = true
  static defaults = {
    color: '#f472b6',
    branches: 6,
    reach: 110, // length of the crack fissures in px
    duration: 1.15, // lifetime of crack burst in seconds
    thickness: 1,
    opacity: 0.85,
    fade: 0.2,
  }

  isBusy() {
    return this.crack != null
  }

  build() {
    this.crack = null
  }

  spawnCrack(cx, cy) {
    const o = this.opts
    const { w, h } = this.size
    const branches = Math.max(4, o.branches | 0)
    const reach = Math.max(60, Math.min(Math.hypot(w, h) * 0.75, o.reach))
    const shards = []
    const fissures = []

    for (let b = 0; b < branches; b++) {
      const baseAngle = (b / branches) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
      const segs = 3
      const pts = [{ x: 0, y: 0 }]
      let curAngle = baseAngle

      for (let s = 1; s <= segs; s++) {
        curAngle += (Math.random() - 0.5) * 0.5
        const len = (s / segs) * reach * (0.85 + Math.random() * 0.3)
        pts.push({
          x: Math.cos(curAngle) * len,
          y: Math.sin(curAngle) * len,
        })
      }
      fissures.push(pts)

      // Generate hyper-triangle shards along the crack length
      for (let s = 0; s < segs; s++) {
        const pA = pts[s]
        const pB = pts[s + 1]
        // Wing vertex flanking the crack
        const midX = (pA.x + pB.x) / 2
        const midY = (pA.y + pB.y) / 2
        const perpAngle = curAngle + Math.PI / 2
        const wingDist = (12 + Math.random() * 16) * (1 - s / (segs + 1))
        const pWing1 = {
          x: midX + Math.cos(perpAngle) * wingDist,
          y: midY + Math.sin(perpAngle) * wingDist,
        }
        const pWing2 = {
          x: midX - Math.cos(perpAngle) * wingDist,
          y: midY - Math.sin(perpAngle) * wingDist,
        }

        shards.push({
          pts: [pA, pWing1, pB],
          alpha: 0.1 + Math.random() * 0.18, // 10% to 30%
        })
        shards.push({
          pts: [pA, pWing2, pB],
          alpha: 0.1 + Math.random() * 0.18,
        })
      }
    }

    this.crack = {
      cx,
      cy,
      birth: -1,
      shards,
      fissures,
      duration: o.duration,
    }
  }

  onActive(active) {
    super.onActive(active)
    if (active) {
      const cx = this.pointer.inside ? this.pointer.px : this.size.w / 2
      const cy = this.pointer.inside ? this.pointer.py : this.size.h / 2
      this.spawnCrack(cx, cy)
    }
  }

  render(time) {
    if (!this.crack) return
    if (this.crack.birth < 0) this.crack.birth = time

    const age = time - this.crack.birth
    const total = this.crack.duration
    if (age > total) {
      this.crack = null
      return
    }

    // Rapid initial fracture burst (0 to 0.15s), hold, then fade out
    const progress = age / total
    const openProgress = Math.min(1, age / 0.14)
    const scale = Math.sin((openProgress * Math.PI) / 2)
    const fade = progress < 0.45 ? 1 : 1 - (progress - 0.45) / 0.55

    const ctx = this.ctx2d
    const o = this.opts
    const { cx, cy, shards, fissures } = this.crack

    ctx.save()
    ctx.translate(cx, cy)
    ctx.lineWidth = o.thickness
    ctx.strokeStyle = hexA(o.color, o.opacity * fade)

    // Draw crystalline hyper-triangle shards
    for (const s of shards) {
      const p0 = { x: s.pts[0].x * scale, y: s.pts[0].y * scale }
      const p1 = { x: s.pts[1].x * scale, y: s.pts[1].y * scale }
      const p2 = { x: s.pts[2].x * scale, y: s.pts[2].y * scale }

      ctx.globalAlpha = s.alpha * o.opacity * fade
      ctx.fillStyle = o.color
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      ctx.lineTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.closePath()
      ctx.fill()

      ctx.globalAlpha = o.opacity * fade * 0.75
      ctx.stroke()
    }

    // Draw main fissure crack spines
    ctx.globalAlpha = o.opacity * fade
    for (const f of fissures) {
      ctx.beginPath()
      ctx.moveTo(f[0].x * scale, f[0].y * scale)
      for (let i = 1; i < f.length; i++) {
        ctx.lineTo(f[i].x * scale, f[i].y * scale)
      }
      ctx.stroke()
    }

    ctx.restore()
  }
}

/* ------------------------------------------------------------- grid-ripple */
/**
 * Canvas-hosted rasterized shockwave across a perfect square grid.
 * Squares stick flush together (0 gap). The expanding circumference acts as an attractor:
 * squares directly on it light up (factor 1.0), nearest neighbors appear at 1/3 transparency,
 * and next neighbors at 1/4 transparency. Fades to 100% transparent and deletes itself.
 * Continues on short 0.1s touch and hold. Color and squareSize fully customizable.
 */
export class GridRipple extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static ballistic = true
  static defaults = {
    color: '#ffffff',
    squareSize: 6, // perfect square size in px
    speed: 1, // propagation speed
    duration: 1.15, // seconds for wave to expand and disappear
    maxScale: 1.3,
    opacity: 0.85,
    gap: 0, // flush squares sticking together
    clip: true,
    radius: 0,
    fade: 0.2,
  }

  isBusy() {
    return this.ripples && this.ripples.length > 0
  }

  build() {
    this.ripples = []
  }

  spawn(cx, cy) {
    const o = this.opts
    const { w, h } = this.size
    const maxR =
      Math.max(
        Math.hypot(cx, cy),
        Math.hypot(w - cx, cy),
        Math.hypot(cx, h - cy),
        Math.hypot(w - cx, h - cy)
      ) * (o.maxScale || 1.3)

    this.ripples.push({
      cx,
      cy,
      birth: -1,
      maxR,
      duration: o.duration / Math.max(0.1, o.speed),
    })
  }

  onActive(active) {
    super.onActive(active)
    if (active) {
      const cx = this.pointer.inside ? this.pointer.px : this.size.w / 2
      const cy = this.pointer.inside ? this.pointer.py : this.size.h / 2
      this.spawn(cx, cy)
    }
  }

  render(time) {
    if (!this.ripples.length) return
    const o = this.opts
    const ctx = this.ctx2d
    const { w, h } = this.size
    if (w <= 0 || h <= 0) return

    // Perfect square formula: squareSize is identical for width and height
    const S = Math.max(2, Math.round(o.squareSize || 6))
    const gap = Math.max(0, o.gap || 0)
    const drawSize = S - gap

    // Active ripples update: keep expanding to completion
    this.ripples = this.ripples.filter((r) => {
      if (r.birth < 0) r.birth = time
      const age = time - r.birth
      return age < r.duration // survives until 100% transparent
    })

    if (!this.ripples.length) return

    ctx.save()
    if (o.clip) {
      const r = normalizeRadius(o.radius, w, h)
      roundRect(ctx, 0, 0, w, h, r.tl, r.tr, r.br, r.bl)
      ctx.clip()
    }

    // Grid bounds in perfect square units covering the overlay
    const maxCols = Math.ceil(w / S) + 1
    const maxRows = Math.ceil(h / S) + 1

    for (const rip of this.ripples) {
      const age = time - rip.birth
      const progress = age / rip.duration
      if (progress >= 1) continue

      // Shockwave radius with smooth deceleration
      const curR = rip.maxR * (1 - (1 - progress) ** 2)
      // Circumference base opacity: fades smoothly to 0 (100% transparent)
      const baseAlpha = (1 - progress) ** 1.3 * o.opacity
      if (baseAlpha <= 0.005) continue

      // Affected cell bounding box around the ripple ring
      const reach = 2.8 * S
      const cMin = Math.max(0, Math.floor((rip.cx - curR - reach) / S))
      const cMax = Math.min(maxCols, Math.ceil((rip.cx + curR + reach) / S))
      const rMin = Math.max(0, Math.floor((rip.cy - curR - reach) / S))
      const rMax = Math.min(maxRows, Math.ceil((rip.cy + curR + reach) / S))

      for (let c = cMin; c <= cMax; c++) {
        for (let r = rMin; r <= rMax; r++) {
          const cellCenterX = c * S + S / 2
          const cellCenterY = r * S + S / 2
          const dist = Math.hypot(cellCenterX - rip.cx, cellCenterY - rip.cy)
          const delta = Math.abs(dist - curR)

          let factor = 0
          if (delta < 0.7 * S) {
            // Directly on circumference
            factor = 1.0
          } else if (delta < 1.7 * S) {
            // Neighbor square near circumference: transparent 1/3 of circumference
            factor = 1 / 3
          } else if (delta < 2.7 * S) {
            // Second neighbor square near circumference: transparent 1/4 of circumference
            factor = 1 / 4
          }

          if (factor > 0) {
            const alpha = Math.min(1, baseAlpha * factor)
            ctx.fillStyle = hexA(o.color, alpha)
            ctx.fillRect(c * S, r * S, drawSize, drawSize)
          }
        }
      }
    }

    ctx.restore()
  }
}

/* --------------------------------------------------------------- outer-grid */
/**
 * Canvas-hosted coordinate lattice locking the button in space.
 * Appears on hover with short segmented crosshairs and radial transparency falloff.
 */
export class OuterGrid extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static bleed = true
  static defaults = {
    color: '#ffffff',
    opacity: 0.45,
    cell: 20, // grid spacing
    arm: 6, // short length of grid marks (px)
    radius: 0,
    reach: 0.85, // radial reach fraction of button diagonal
    fade: 0.25,
  }

  render() {
    const o = this.opts
    const ctx = this.ctx2d
    const { w, h } = this.size
    if (w <= 0 || h <= 0) return

    const step = Math.max(8, o.cell | 0)
    const arm = Math.max(2, o.arm || 6)
    // Center point for radial falloff
    const cx = this.pointer.inside ? this.pointer.px : w / 2
    const cy = this.pointer.inside ? this.pointer.py : h / 2
    const maxR = Math.hypot(w, h) * (o.reach || 0.85)

    ctx.save()
    ctx.lineWidth = 1

    // Lattice points covering button and surrounding space
    const x0 = Math.floor(-this.inset / step) * step
    const x1 = Math.ceil((w + this.inset) / step) * step
    const y0 = Math.floor(-this.inset / step) * step
    const y1 = Math.ceil((h + this.inset) / step) * step

    for (let x = x0; x <= x1; x += step) {
      for (let y = y0; y <= y1; y += step) {
        const d = Math.hypot(x - cx, y - cy)
        if (d > maxR) continue
        // Radial transparency like halftone: falloff from center
        const f = 1 - d / maxR
        const alpha = f * f * o.opacity
        if (alpha <= 0.01) continue

        ctx.strokeStyle = hexA(o.color, alpha)
        // Short grid ticks / crosshairs locking the button in space
        ctx.beginPath()
        ctx.moveTo(x - arm, y)
        ctx.lineTo(x + arm, y)
        ctx.moveTo(x, y - arm)
        ctx.lineTo(x, y + arm)
        ctx.stroke()
      }
    }

    ctx.restore()
  }
}
