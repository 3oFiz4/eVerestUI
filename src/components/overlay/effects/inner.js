import gsap from 'gsap'
import { AnimationBase } from '../AnimationBase.js'
import { mulberry32, normalizeRadius } from '../geometry.js'
import { Attractor, clamp, hexA, roundRect } from '../paint.js'

/* ------------------------------------------------------------------ shine */
/**
 * DOM-hosted. A gradient bar swept across the real measured width (not a guessed
 * percentage). Hovering collapses it to zero and PAUSES the timeline, so it does
 * not resume mid-sweep when the pointer leaves.
 */
export class Shine extends AnimationBase {
  static host = 'dom'
  static kind = 'overlay'
  static clipped = true
  static defaults = {
    color: '#ffffff',
    opacity: 0.4,
    width: 0.35, // fraction of button width
    angle: -12, // deg
    blur: 2, // px
    duration: 2.2,
    repeatDelay: 0.8,
    ease: 'power2.inOut',
    speed: 1,
    collapse: 0.25, // s to close on hover
    fade: 0.3,
  }

  build() {
    const o = this.opts
    const bar = document.createElement('div')
    bar.style.cssText = `position:absolute;top:-60%;bottom:-60%;left:0;filter:blur(${o.blur}px);background:linear-gradient(90deg,transparent,${hexA(o.color, 0)},${hexA(o.color, o.opacity)},${hexA(o.color, 0)},transparent);will-change:transform;`
    this.mountEl.appendChild(bar)
    this.bar = bar
    this.sweep = gsap.fromTo(
      bar,
      { xPercent: -150 },
      {
        xPercent: 250,
        duration: o.duration / Math.max(0.05, o.speed),
        repeat: -1,
        repeatDelay: o.repeatDelay,
        ease: o.ease,
        force3D: true,
      }
    )
  }

  layout() {
    const w = Math.max(8, this.size.w * this.opts.width)
    gsap.set(this.bar, { width: w, rotation: this.opts.angle })
  }

  onPointer({ inside }) {
    if (inside) {
      gsap.to(this.bar, { scaleX: 0, duration: this.opts.collapse, ease: 'power2.in', overwrite: 'auto' })
      this.sweep.pause()
    } else {
      gsap.to(this.bar, {
        scaleX: 1,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => this.sweep.restart(true),
      })
    }
  }
}

/* ---------------------------------------------------------------- sparkle */
/** DOM-hosted. Clock ticks tweened on transform/opacity only. */
export class Sparkle extends AnimationBase {
  static host = 'dom'
  static kind = 'overlay'
  static clipped = true
  static defaults = {
    color: '#fde047',
    glyph: '✦',
    count: 6,
    size: 18,
    minScale: 0.6,
    maxScale: 1.4,
    stagger: 0.25,
    duration: 1.1,
    intensity: 1,
    spread: 0.6, // fraction of the button covered
    glow: 6,
    speed: 1,
    fade: 0.3,
  }

  build() {
    const o = this.opts
    const total = clamp(o.count | 0, 1, 60)
    this.ticks = []
    for (let i = 0; i < total; i++) {
      const s = document.createElement('span')
      s.textContent = o.glyph
      s.style.cssText = `position:absolute;left:50%;top:50%;user-select:none;line-height:1;color:${o.color};font-size:${o.size}px;filter:drop-shadow(0 0 ${o.glow}px ${hexA(o.color, 0.8)});will-change:transform,opacity;`
      this.mountEl.appendChild(s)
      this.ticks.push(s)
    }
  }

  layout() {
    const o = this.opts
    const rnd = mulberry32(7)
    const rx = this.size.w * o.spread
    const ry = this.size.h * o.spread
    this.ticks.forEach((s, i) => {
      const x = (rnd() - 0.5) * rx
      const y = (rnd() - 0.5) * ry
      const rot0 = rnd() * 90
      gsap.set(s, { x, y, scale: 0, opacity: 0, rotation: rot0 })
      gsap.to(s, {
        scale: o.minScale + rnd() * (o.maxScale - o.minScale),
        opacity: (0.55 + rnd() * 0.45) * o.intensity,
        rotation: rot0 + 60 + rnd() * 90,
        duration: () => (o.duration / Math.max(0.05, o.speed)) * (0.75 + Math.random() * 0.6),
        repeat: -1,
        yoyo: true,
        delay: i * o.stagger,
        ease: 'sine.inOut',
        force3D: true,
      })
    })
  }
}

/* ---------------------------------------------------------- floating glow */
/**
 * Canvas-hosted attractor light, three interchangeable raster modes sharing one
 * integrator. All modes are blur-free except 'glow' (one radial gradient/frame).
 *   'glow'     drifting radial gradient
 *   'halftone' dot matrix, radius+alpha answer to attractor proximity
 *   'lines'    rectilinear grid lit near the attractor
 * `clip:true` confines it to the button silhouette; false lets it bleed.
 */
export class FloatingGlow extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static defaults = {
    mode: 'glow',
    clip: true,
    color: '#60a5fa',
    // Falloff radius as a fraction of the button. For 'glow' it is a fraction of
    // the short side (a ball of light); for 'halftone'/'lines' it is a fraction of
    // the half-diagonal, so 1 reaches the corners.
    size: 1,
    intensity: 0.6,
    wanderSpeed: 0.35,
    follow: true, // attractor snaps to the cursor on hover
    grid: 16,
    dotScale: 1.6,
    lineWidth: 1,
    radius: 0, // silhouette radius when clip
    fade: 0.4,
  }

  build() {
    this.attractor = new Attractor({ w: 100, h: 100 }, { speed: this.opts.wanderSpeed })
  }

  layout() {
    const { w, h } = this.size
    this.attractor.resize({ w, h })
  }

  render(time, dtRatio) {
    const o = this.opts
    const ctx = this.ctx2d
    const { w, h } = this.size
    const a = this.attractor.step(dtRatio / 60, this.pointer, o.follow)
    // 'glow' is a ball of light, so it scales off the short side; the matrix modes
    // need their falloff to reach across the whole button or only the few cells
    // nearest the attractor respond and it reads as a blob rather than a grid.
    const R =
      o.mode === 'glow'
        ? Math.max(1, Math.min(w, h) * o.size)
        : Math.max(1, Math.hypot(w, h) * 0.5 * o.size)

    ctx.save()
    if (o.clip) {
      const r = normalizeRadius(o.radius, w, h)
      roundRect(ctx, 0, 0, w, h, r.tl, r.tr, r.br, r.bl)
      ctx.clip()
    }
    ctx.globalCompositeOperation = 'lighter'

    if (o.mode === 'glow') {
      const g = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, R)
      g.addColorStop(0, hexA(o.color, o.intensity * a.pulse))
      g.addColorStop(0.55, hexA(o.color, o.intensity * a.pulse * 0.35))
      g.addColorStop(1, hexA(o.color, 0))
      ctx.fillStyle = g
      ctx.fillRect(-this.inset, -this.inset, w + this.inset * 2, h + this.inset * 2)
    } else if (o.mode === 'halftone') {
      const step = Math.max(4, o.grid)
      // Never let a dot exceed half the step, or neighbours merge into a solid
      // mass and the pattern stops reading as discrete dots.
      const maxR = step * 0.5 * Math.min(o.dotScale, 1)
      ctx.fillStyle = o.color
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          const d = Math.hypot(x - a.x, y - a.y)
          if (d > R) continue
          const f = 1 - d / R
          ctx.globalAlpha = Math.min(1, f * f * a.pulse * o.intensity * 2.4)
          const rad = maxR * (0.18 + 0.82 * f)
          if (rad < 0.35) continue
          ctx.beginPath()
          ctx.arc(x, y, rad, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    } else {
      const step = Math.max(6, o.grid)
      ctx.strokeStyle = o.color
      ctx.lineWidth = o.lineWidth
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          const d = Math.hypot(x - a.x, y - a.y)
          if (d > R) continue
          ctx.globalAlpha = Math.min(1, (1 - d / R) * a.pulse * o.intensity * 2.2)
          ctx.beginPath()
          ctx.moveTo(x - step / 2, y - step / 2)
          ctx.lineTo(x + step / 2, y - step / 2)
          ctx.moveTo(x - step / 2, y - step / 2)
          ctx.lineTo(x - step / 2, y + step / 2)
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
    }
    ctx.restore()
  }
}

/* ----------------------------------------------------------------- ripple */
/** Canvas-hosted expanding rings; origin tracks the cursor when hovered. */
export class Ripple extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static defaults = {
    color: '#93c5fd',
    count: 3,
    duration: 2.2,
    thickness: 1.5,
    maxScale: 1.6,
    intensity: 0.6,
    auto: true, // continuous; false = burst on press
    follow: true,
    stagger: 0.4,
    fade: 0.35,
  }

  build() {
    this.origin = { x: this.size.w / 2, y: this.size.h / 2 }
    this.t = 0
  }

  layout() {
    this.origin = { x: this.size.w / 2, y: this.size.h / 2 }
  }

  onPointer({ px, py, inside }) {
    if (this.opts.follow && inside) this.origin = { x: px, y: py }
  }

  onActive(active) {
    if (active && !this.opts.auto) this.burstAt = this.t
  }

  render(time, dtRatio) {
    this.t += dtRatio / 60
    const o = this.opts
    const ctx = this.ctx2d
    const { w, h } = this.size
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.strokeStyle = o.color
    ctx.lineWidth = o.thickness
    const maxR = Math.max(1, (Math.hypot(w, h) * o.maxScale) / 2)
    const ring = (t0) => {
      let p = (t0 % o.duration) / o.duration
      if (p < 0) p += 1
      ctx.globalAlpha = (1 - p) * o.intensity
      ctx.beginPath()
      ctx.arc(this.origin.x, this.origin.y, maxR * p, 0, Math.PI * 2)
      ctx.stroke()
    }
    if (o.auto) {
      for (let i = 0; i < Math.max(1, o.count | 0); i++) ring(this.t - i * o.stagger)
    } else if (this.burstAt != null) {
      const age = this.t - this.burstAt
      if (age < o.duration * Math.max(1, o.count | 0)) {
        for (let i = 0; i < Math.max(1, o.count | 0); i++) ring(age - i * o.stagger)
      }
    }
    ctx.globalAlpha = 1
    ctx.restore()
  }
}

/* ----------------------------------------------------------------- glitch */
/**
 * Canvas-hosted slice displacement + block noise + scanlines. Bursts are budgeted
 * by `burstsPerSecond` and gated by `rate`, so idle cost stays near zero.
 */
export class Glitch extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static defaults = {
    color: '#f87171',
    rate: 0.35, // chance of a burst when the gate opens
    burstsPerSecond: 3,
    slices: 8,
    shift: 12, // max px displacement
    blocks: 6,
    blockMin: 8,
    blockMax: 40,
    intensity: 0.5,
    scanlines: true,
    scanGap: 3,
    scanOpacity: 0.25,
    life: 0.18,
    fade: 0.3,
  }

  build() {
    this.rnd = mulberry32(11)
    this.nextAt = 0
    this.burstAt = -1
  }

  render(time) {
    const o = this.opts
    const ctx = this.ctx2d
    const { w, h } = this.size

    if (o.scanlines) {
      ctx.fillStyle = hexA(o.color, o.intensity * o.scanOpacity)
      for (let y = 0; y < h; y += Math.max(2, o.scanGap)) ctx.fillRect(-this.inset, y, w + this.inset * 2, 1)
    }

    if (time > this.nextAt) {
      this.nextAt = time + 1 / Math.max(0.2, o.burstsPerSecond)
      if (this.rnd() < o.rate) {
        this.burstAt = time
        this.cfg = {
          slices: Array.from({ length: Math.max(1, o.slices | 0) }, () => ({
            y: this.rnd() * h,
            h: Math.max(2, (h / Math.max(1, o.slices | 0)) * (0.2 + this.rnd())),
            dx: (this.rnd() - 0.5) * 2 * o.shift,
          })),
          blocks: Array.from({ length: Math.max(0, o.blocks | 0) }, () => ({
            x: this.rnd() * w,
            y: this.rnd() * h,
            w: o.blockMin + this.rnd() * Math.max(0, o.blockMax - o.blockMin),
            h: 2 + this.rnd() * 6,
          })),
        }
        this.snapshot()
      }
    }
    if (this.burstAt < 0 || !this.shot) return
    const age = time - this.burstAt
    if (age > o.life) return
    const decay = 1 - age / o.life

    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = decay * o.intensity
    // each band replays the snapshot shifted sideways, clipped to its row, so the
    // button appears to tear rather than the canvas recursively sampling itself
    const full = { x: -this.inset, y: -this.inset, w: w + this.inset * 2, h: h + this.inset * 2 }
    for (const s of this.cfg.slices) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(full.x, s.y, full.w, s.h)
      ctx.clip()
      ctx.drawImage(this.shot, 0, 0, this.shot.width, this.shot.height, full.x + s.dx * decay, full.y, full.w, full.h)
      ctx.restore()
    }
    ctx.fillStyle = o.color
    for (const b of this.cfg.blocks) {
      ctx.globalAlpha = decay * o.intensity * 0.8
      ctx.fillRect(b.x, b.y, b.w, b.h)
    }
    ctx.restore()
  }

  /** Copy the current bitmap so a burst can displace real pixels. */
  snapshot() {
    const src = this.root
    if (!this.shot) this.shot = document.createElement('canvas')
    if (this.shot.width !== src.width || this.shot.height !== src.height) {
      this.shot.width = src.width
      this.shot.height = src.height
    }
    const c = this.shot.getContext('2d')
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.clearRect(0, 0, this.shot.width, this.shot.height)
    c.drawImage(src, 0, 0)
  }
}

/* ---------------------------------------------------------- floating lines */
/** Canvas-hosted eastward streaks, each with its own velocity and opacity. */
export class FloatingLines extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static defaults = {
    color: '#a78bfa',
    count: 14,
    speed: 40, // px/sec at scale 1
    speedVariance: 0.8,
    thickness: 1,
    opacity: 0.6,
    opacityVariance: 0.5,
    angle: 0,
    widthScale: 1, // a line's length as a fraction of button width
    fade: 0.4,
  }

  build() {
    const o = this.opts
    const rnd = mulberry32(23)
    const n = clamp(o.count | 0, 1, 120)
    this.lines = Array.from({ length: n }, () => ({
      y: rnd(),
      v: 1 + (rnd() - 0.5) * 2 * o.speedVariance,
      a: 1 - rnd() * o.opacityVariance,
      w: 0.4 + rnd() * o.widthScale,
      x: rnd(),
    }))
  }

  render(time, dtRatio) {
    const o = this.opts
    const ctx = this.ctx2d
    const { w, h } = this.size
    const dt = dtRatio / 60
    ctx.save()
    ctx.lineWidth = o.thickness
    for (const l of this.lines) {
      l.x += (o.speed * l.v * dt) / Math.max(1, w)
      if (l.x > 1.7) l.x -= 2.4
      const len = l.w * w
      const x0 = l.x * w
      const y = l.y * h
      const x1 = x0 - len
      const dy = Math.tan((o.angle * Math.PI) / 180) * len
      const g = ctx.createLinearGradient(x1, y - dy, x0, y)
      g.addColorStop(0, hexA(o.color, 0))
      g.addColorStop(0.8, hexA(o.color, o.opacity * l.a))
      g.addColorStop(1, hexA(o.color, o.opacity * l.a * 0.2))
      ctx.strokeStyle = g
      ctx.beginPath()
      ctx.moveTo(x1, y - dy)
      ctx.lineTo(x0, y)
      ctx.stroke()
    }
    ctx.restore()
  }
}

/* ------------------------------------------------------------------ nodes */
/** Canvas-hosted drifting points joined by proximity links; cursor attracts. */
export class Nodes extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static defaults = {
    color: '#34d399',
    count: 18,
    linkDistance: 70,
    speed: 12,
    nodeRadius: 1.5,
    linkWidth: 1,
    opacity: 0.7,
    follow: true,
    pull: 0.35, // cursor attraction strength on hover
    fade: 0.4,
  }

  build() {
    const o = this.opts
    const rnd = mulberry32(31)
    const n = clamp(o.count | 0, 2, 160)
    this.nodes = Array.from({ length: n }, () => ({
      x: rnd(),
      y: rnd(),
      vx: (rnd() - 0.5) * 2,
      vy: (rnd() - 0.5) * 2,
    }))
  }

  render(time, dtRatio) {
    const o = this.opts
    const ctx = this.ctx2d
    const { w, h } = this.size
    const dt = dtRatio / 60
    const pull = o.follow && this.pointer.inside ? o.pull : 0

    for (const n of this.nodes) {
      n.x = clamp(n.x + (n.vx * o.speed * dt) / Math.max(1, w), 0, 1)
      n.y = clamp(n.y + (n.vy * o.speed * dt) / Math.max(1, h), 0, 1)
      if (n.x <= 0 || n.x >= 1) n.vx *= -1
      if (n.y <= 0 || n.y >= 1) n.vy *= -1
      if (pull) {
        n.x += (this.pointer.px / Math.max(1, w) - n.x) * pull * dt
        n.y += (this.pointer.py / Math.max(1, h) - n.y) * pull * dt
      }
    }

    const max = o.linkDistance
    const px = this.nodes.map((n) => ({ x: n.x * w, y: n.y * h }))
    ctx.save()
    for (let i = 0; i < px.length; i++) {
      for (let j = i + 1; j < px.length; j++) {
        const d = Math.hypot(px[i].x - px[j].x, px[i].y - px[j].y)
        if (d > max) continue
        ctx.globalAlpha = (1 - d / max) * o.opacity
        ctx.strokeStyle = o.color
        ctx.lineWidth = o.linkWidth
        ctx.beginPath()
        ctx.moveTo(px[i].x, px[i].y)
        ctx.lineTo(px[j].x, px[j].y)
        ctx.stroke()
      }
    }
    ctx.globalAlpha = o.opacity
    ctx.fillStyle = o.color
    for (const p of px) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, o.nodeRadius, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }
}

/* --------------------------------------------------------- hyper-triangles */
/**
 * Canvas-hosted link network with enclosed cells filled — the nodes themselves
 * stay invisible. Each triangle gets a stable random fill opacity from its seed.
 */
export class HyperTriangles extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static defaults = {
    color: '#f472b6',
    count: 16,
    linkDistance: 90,
    speed: 10,
    linkWidth: 1,
    fill: true,
    fillMin: 0.04,
    fillMax: 0.3,
    minArea: 220, // px^2, filters degenerate slivers
    opacity: 0.6,
    follow: true,
    pull: 0.3,
    linksOnly: false,
    fade: 0.4,
  }

  build() {
    const o = this.opts
    const rnd = mulberry32(41)
    const n = clamp(o.count | 0, 3, 140)
    this.nodes = Array.from({ length: n }, () => ({
      x: rnd(),
      y: rnd(),
      vx: (rnd() - 0.5) * 2,
      vy: (rnd() - 0.5) * 2,
      a: o.fillMin + rnd() * (o.fillMax - o.fillMin),
    }))
  }

  render(time, dtRatio) {
    const o = this.opts
    const ctx = this.ctx2d
    const { w, h } = this.size
    const dt = dtRatio / 60
    const follow = o.follow && this.pointer.inside

    for (const n of this.nodes) {
      n.x = clamp(n.x + (n.vx * o.speed * dt) / Math.max(1, w), 0, 1)
      n.y = clamp(n.y + (n.vy * o.speed * dt) / Math.max(1, h), 0, 1)
      if (n.x <= 0 || n.x >= 1) n.vx *= -1
      if (n.y <= 0 || n.y >= 1) n.vy *= -1
      if (follow) {
        n.x += (this.pointer.px / Math.max(1, w) - n.x) * o.pull * dt
        n.y += (this.pointer.py / Math.max(1, h) - n.y) * o.pull * dt
      }
    }

    const pts = this.nodes.map((n) => ({ x: n.x * w, y: n.y * h, a: n.a }))
    const max = o.linkDistance
    const max2 = max * max
    ctx.save()
    ctx.lineWidth = o.linkWidth
    ctx.strokeStyle = o.color
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dij2 = (pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2
        if (dij2 > max2) continue
        ctx.globalAlpha = 0.5 * o.opacity
        ctx.beginPath()
        ctx.moveTo(pts[i].x, pts[i].y)
        ctx.lineTo(pts[j].x, pts[j].y)
        ctx.stroke()
        if (!o.fill) continue
        for (let k = j + 1; k < pts.length; k++) {
          if ((pts[i].x - pts[k].x) ** 2 + (pts[i].y - pts[k].y) ** 2 > max2) continue
          if ((pts[j].x - pts[k].x) ** 2 + (pts[j].y - pts[k].y) ** 2 > max2) continue
          const area =
            (pts[j].x - pts[i].x) * (pts[k].y - pts[i].y) - (pts[k].x - pts[i].x) * (pts[j].y - pts[i].y)
          if (Math.abs(area) < o.minArea) continue
          ctx.globalAlpha = ((pts[i].a + pts[j].a + pts[k].a) / 3) * o.opacity
          ctx.fillStyle = o.color
          ctx.beginPath()
          ctx.moveTo(pts[i].x, pts[i].y)
          ctx.lineTo(pts[j].x, pts[j].y)
          ctx.lineTo(pts[k].x, pts[k].y)
          ctx.closePath()
          ctx.fill()
        }
      }
    }
    ctx.restore()
  }
}
