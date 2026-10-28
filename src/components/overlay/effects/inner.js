import gsap from 'gsap'
import { AnimationBase } from '../AnimationBase.js'
import { mulberry32, normalizeRadius } from '../geometry.js'
import { Attractor, clamp, hexA, readableOn, roundRect } from '../paint.js'

/* ------------------------------------------------------------------ shine */
/**
 * DOM-hosted. A gradient or sharp bar swept across the real measured width.
 * Sweeps completely off-screen on both sides to prevent stopping prematurely.
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
    blur: 2, // px, set 0 for sharp rectangle
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
    const filter = o.blur ? `filter:blur(${o.blur}px);` : ''
    bar.style.cssText = `position:absolute;top:-60%;bottom:-60%;left:0;${filter}background:linear-gradient(90deg,transparent,${hexA(o.color, 0)},${hexA(o.color, o.opacity)},${hexA(o.color, 0)},transparent);will-change:transform;`
    this.mountEl.appendChild(bar)
    this.bar = bar
  }

  layout() {
    const w = Math.max(8, this.size.w * this.opts.width)
    gsap.set(this.bar, { width: w, rotation: this.opts.angle })
    if (this.sweep) this.sweep.kill()
    const o = this.opts
    this.sweep = gsap.fromTo(
      this.bar,
      { x: -w * 2 },
      {
        x: this.size.w + w * 2,
        duration: o.duration / Math.max(0.05, o.speed),
        repeat: -1,
        repeatDelay: o.repeatDelay,
        ease: o.ease,
        force3D: true,
      }
    )
  }

  onPointer({ inside }) {
    if (inside) {
      gsap.to(this.bar, { scaleX: 0, duration: this.opts.collapse, ease: 'power2.in', overwrite: 'auto' })
      this.sweep?.pause()
    } else {
      gsap.to(this.bar, {
        scaleX: 1,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => this.sweep?.restart(true),
      })
    }
  }

  destroy() {
    if (this.sweep) {
      this.sweep.kill()
      this.sweep = null
    }
    super.destroy()
  }
}

/* ---------------------------------------------------------------- sparkle */
/** DOM-hosted single sparkle spawned per delay interval. */
export class Sparkle extends AnimationBase {
  static host = 'dom'
  static kind = 'overlay'
  static clipped = true
  static defaults = {
    color: '#fde047',
    glyph: '✦',
    size: 16,
    duration: 0.65,
    delay: 0.35, // delay before next sparkle spawns
    intensity: 1,
    spread: 0.75, // fraction of the button covered
    glow: 6,
    speed: 1,
    fade: 0.3,
  }

  build() {
    const o = this.opts
    const s = document.createElement('span')
    s.textContent = o.glyph
    s.style.cssText = `position:absolute;left:50%;top:50%;user-select:none;line-height:1;color:${o.color};font-size:${o.size}px;filter:drop-shadow(0 0 ${o.glow}px ${hexA(o.color, 0.8)});opacity:0;pointer-events:none;will-change:transform,opacity;`
    this.mountEl.appendChild(s)
    this.sparkle = s
    this.timer = null
  }

  layout() {
    this.playNext()
  }

  playNext() {
    if (!this.mounted || !this.sparkle) return
    if (this._tween) this._tween.kill()
    window.clearTimeout(this.timer)

    const o = this.opts
    const { w, h } = this.size
    if (w <= 0 || h <= 0) return

    const x = (Math.random() - 0.5) * (w * o.spread)
    const y = (Math.random() - 0.5) * (h * o.spread)
    const rot = Math.random() * 90
    const dur = o.duration / Math.max(0.1, o.speed)
    const delay = o.delay / Math.max(0.1, o.speed)

    gsap.set(this.sparkle, { x, y, scale: 0, opacity: 0, rotation: rot })

    this._tween = gsap
      .timeline({
        onComplete: () => {
          this.timer = window.setTimeout(() => this.playNext(), delay * 1000)
        },
      })
      .to(this.sparkle, {
        scale: 1.25,
        opacity: o.intensity,
        rotation: rot + 45,
        duration: dur * 0.45,
        ease: 'power2.out',
      })
      .to(this.sparkle, {
        scale: 0.3,
        opacity: 0,
        rotation: rot + 90,
        duration: dur * 0.55,
        ease: 'power2.in',
      })
  }

  destroy() {
    window.clearTimeout(this.timer)
    if (this._tween) {
      this._tween.kill()
      this._tween = null
    }
    super.destroy()
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
    grid: 6, // very small micro-grid
    unattractedOpacity: 0.08, // opacity for unlit dots in halftone
    dotScale: 1,
    lineWidth: 0.75,
    radius: 0, // silhouette radius when clip
    fade: 0.4,
  }

  build() {
    this.attractor = new Attractor({ w: 100, h: 100 }, { speed: this.opts.wanderSpeed })
    this.ripples = []
  }

  layout() {
    const { w, h } = this.size
    this.attractor.resize({ w, h })
  }

  isBusy() {
    return this.ripples && this.ripples.length > 0
  }

  spawnTouchRipple(cx, cy) {
    const { w, h } = this.size
    const maxR =
      Math.max(
        Math.hypot(cx, cy),
        Math.hypot(w - cx, cy),
        Math.hypot(cx, h - cy),
        Math.hypot(w - cx, h - cy)
      ) * 1.25
    this.ripples.push({
      cx,
      cy,
      birth: -1,
      maxR,
      duration: 1.0, // persists ~1s through full expansion even if click is 0.1ms
    })
  }

  onHostState(next) {
    if (next.active) {
      const cx = this.pointer.inside ? this.pointer.px : this.size.w / 2
      const cy = this.pointer.inside ? this.pointer.py : this.size.h / 2
      this.spawnTouchRipple(cx, cy)
    }
  }

  onActive(active) {
    super.onActive(active)
    if (active) {
      const cx = this.pointer.inside ? this.pointer.px : this.size.w / 2
      const cy = this.pointer.inside ? this.pointer.py : this.size.h / 2
      this.spawnTouchRipple(cx, cy)
    }
  }

  render(time, dtRatio) {
    const o = this.opts
    const ctx = this.ctx2d
    const { w, h } = this.size
    const a = this.attractor.step(dtRatio / 60, this.pointer, o.follow)
    const R =
      o.mode === 'glow'
        ? Math.max(1, Math.min(w, h) * o.size)
        : Math.max(1, Math.hypot(w, h) * 0.5 * o.size)

    ctx.save()
    const r = normalizeRadius(o.radius, w, h)
    if (o.clip) {
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

      // Highlight the border ring nearest to the glow (inset to stay cleanly inside the border box)
      const borderR = Math.max(1, Math.hypot(w, h) * 0.45)
      const borderGrad = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, borderR)
      borderGrad.addColorStop(0, hexA(o.color, Math.min(1, 0.95 * a.pulse * o.intensity)))
      borderGrad.addColorStop(0.4, hexA(o.color, Math.min(1, 0.45 * a.pulse * o.intensity)))
      borderGrad.addColorStop(1, hexA(o.color, 0))
      ctx.strokeStyle = borderGrad
      ctx.lineWidth = 1
      roundRect(ctx, 1, 1, Math.max(0, w - 2), Math.max(0, h - 2), r.tl, r.tr, r.br, r.bl)
      ctx.stroke()
    } else if (o.mode === 'halftone') {
      const step = Math.max(3, o.grid)
      const unlit = Math.max(0, Math.min(1, o.unattractedOpacity ?? 0.08))
      ctx.fillStyle = o.color

      // Active touch / click ripples update (ballistic, persists through release)
      this.ripples = this.ripples.filter((rip) => {
        if (rip.birth < 0) rip.birth = time
        return time - rip.birth < rip.duration
      })

      // Attractor ONLY exists when cursor is inside!
      // When not hovered, there is NO bump and NO bright spot in the center.
      const cursorInside = o.follow && this.pointer.inside
      const ax = cursorInside ? this.pointer.px : -9999
      const ay = cursorInside ? this.pointer.py : -9999

      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          let drawX = x
          let drawY = y
          let bump = 0

          // Smooth hover halftone lighting near cursor (NO bump on hover)
          const dCursor = Math.hypot(x - ax, y - ay)
          const f = cursorInside && dCursor < R ? 1 - dCursor / R : 0

          // Touch repel and height bump wave when clicked/touched
          if (this.ripples.length) {
            for (const rip of this.ripples) {
              const age = time - rip.birth
              const progress = age / rip.duration
              if (progress >= 1) continue

              const waveR = rip.maxR * (1 - (1 - progress) ** 2.2)
              const waveFade = (1 - progress) ** 1.3
              const dTouch = Math.hypot(x - rip.cx, y - rip.cy)

              // Strong repulsion pushing circles away from cursor and wave front
              const repelRadius = 55
              const craterPush = Math.max(0, 1 - dTouch / repelRadius) * 20 * waveFade
              const waveDist = Math.abs(dTouch - waveR)
              const wavePush = Math.max(0, 1 - waveDist / 22) * 16 * waveFade
              const totalPush = craterPush + wavePush

              if (dTouch > 0.001) {
                drawX += ((x - rip.cx) / dTouch) * totalPush
                drawY += ((y - rip.cy) / dTouch) * totalPush
              }

              // Bump: circles enlarged at crater rim and wave crest (apparent height change)
              const waveBump = Math.max(0, 1 - waveDist / 18) * 2.2 * waveFade
              const rimBump = Math.sin(Math.PI * Math.min(1, dTouch / repelRadius)) * 1.5 * waveFade
              bump += Math.max(waveBump, rimBump)
            }
          }

          const alpha = unlit + f * f * o.intensity * (1 - unlit) + bump * 0.4
          if (alpha <= 0.01 && bump <= 0) continue

          ctx.globalAlpha = Math.min(1, alpha)
          // Base size 0.5px to ~1.2px; enlarged into a distinct bump on touch
          const rad = 0.5 + 0.7 * f * Math.min(1.2, o.dotScale) + bump * 1.3
          ctx.beginPath()
          ctx.arc(drawX, drawY, Math.max(0.4, rad), 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    } else {
      const step = Math.max(3, o.grid)
      const unlit = Math.max(0, Math.min(1, o.unattractedOpacity ?? 0.08))
      ctx.strokeStyle = o.color
      ctx.lineWidth = o.lineWidth
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          const d = Math.hypot(x - a.x, y - a.y)
          const f = d < R ? 1 - d / R : 0
          const alpha = unlit + f * f * a.pulse * o.intensity * 0.45
          if (alpha <= 0.01) continue
          ctx.globalAlpha = Math.min(1, alpha)
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
/**
 * Ripple animation from ExperienceCard.jsx.
 * Spawns a glowing center core and an expanding shockwave ring on click or idle.
 */
export class Ripple extends AnimationBase {
  static host = 'dom'
  static kind = 'overlay'
  static clipped = true
  static ballistic = true
  static defaults = {
    color: '#ffffff',
    maxActive: 5,
    auto: true, // auto idle ripples
    idleDelay: 4.5,
    fade: 0.35,
  }

  isBusy() {
    return this.activeRipples > 0
  }

  build() {
    this.activeRipples = 0
    this.idleTimer = null
  }

  layout() {
    if (this.opts.auto) this.scheduleIdle()
  }

  scheduleIdle() {
    window.clearTimeout(this.idleTimer)
    this.idleTimer = window.setTimeout(() => {
      if (this.mounted && this.active) {
        const { w, h } = this.size
        const x = Math.random() * w
        const y = Math.random() * h
        this.createRipple(x, y)
      }
      this.scheduleIdle()
    }, (this.opts.idleDelay || 4.5) * 1000)
  }

  createRipple(x, y) {
    if (this.activeRipples >= (this.opts.maxActive || 5)) return
    const { w, h } = this.size
    if (w <= 0 || h <= 0) return

    this.activeRipples += 1

    const radius = Math.max(
      Math.hypot(x, y),
      Math.hypot(w - x, y),
      Math.hypot(x, h - y),
      Math.hypot(w - x, h - y)
    )
    const size = radius * 2

    const core = document.createElement('span')
    const ring = document.createElement('span')

    Object.assign(core.style, {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: '10px',
      height: '10px',
      borderRadius: '9999px',
      background: this.opts.color || 'rgba(255,255,255,0.95)',
      opacity: '0',
      pointerEvents: 'none',
      transform: 'translate(-50%, -50%) scale(0)',
      willChange: 'transform, opacity',
    })

    Object.assign(ring.style, {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '9999px',
      border: `1px solid ${this.opts.color || 'rgba(255,255,255,0.9)'}`,
      background: 'transparent',
      opacity: '0.9',
      pointerEvents: 'none',
      transform: 'translate(-50%, -50%) scale(0.08)',
      willChange: 'transform, opacity',
    })

    this.mountEl.appendChild(ring)
    this.mountEl.appendChild(core)

    gsap
      .timeline({
        defaults: { force3D: true },
        onComplete: () => {
          core.remove()
          ring.remove()
          this.activeRipples = Math.max(0, this.activeRipples - 1)
        },
      })
      .to(core, { scale: 1, opacity: 0.95, duration: 0.14, ease: 'power2.out' }, 0)
      .to(core, { scale: 0.35, opacity: 0, duration: 2.45, ease: 'power1.out' }, 0.12)
      .to(ring, { scale: 1, opacity: 0, duration: 1.35, ease: 'power3.out' }, 0)
  }

  onActive(active) {
    super.onActive(active)
    if (active) {
      const x = this.pointer.inside ? this.pointer.px : this.size.w / 2
      const y = this.pointer.inside ? this.pointer.py : this.size.h / 2
      this.createRipple(x, y)
    }
  }

  destroy() {
    window.clearTimeout(this.idleTimer)
    super.destroy()
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
    scanlines: false,
    scanGap: 3,
    scanOpacity: 0,
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

    if (o.scanlines && o.scanOpacity > 0) {
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
/**
 * Canvas-hosted disparate vertical rods of infinite height (1px thickness).
 * Each rod moves independently over the x-axis: varying speeds, some advancing faster,
 * some reverting in reverse, with randomized individual transparency and slow orbital rotation.
 */
export class FloatingLines extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static defaults = {
    color: '#ffffff',
    count: 10,
    speed: 28, // base x-drift speed (px/sec)
    rotSpeed: 0.8, // base rotation speed (rad/sec)
    cylinderRadius: 36, // base orbital radius in px
    thickness: 1, // 1px thickness
    opacity: 0.7,
    clip: true,
    radius: 0,
    fade: 0.4,
  }

  build() {
    const o = this.opts
    const rnd = mulberry32(19)
    const n = Math.max(3, o.count | 0)

    // Pre-generate independent characteristics for each rod
    this.rods = Array.from({ length: n }, (_, i) => {
      // Speed multiplier: some fast (+1.3 to +1.8), some slow (+0.3 to +0.7), some reverting (-0.4 to -0.9)
      const isReverting = i % 3 === 0
      const speedMult = isReverting
        ? -(0.45 + rnd() * 0.55)
        : 0.35 + rnd() * 1.35
      const rotMult = (rnd() > 0.35 ? 1 : -1) * (0.5 + rnd() * 1.1)
      const radMult = 0.7 + rnd() * 0.6
      const baseOpacity = 0.18 + rnd() * 0.7 // randomized individual transparency
      const initPhase = (i / n) * Math.PI * 2 + rnd() * 0.6
      const initX = rnd()

      return {
        speedMult,
        rotMult,
        radMult,
        baseOpacity,
        initPhase,
        initX,
      }
    })
  }

  render(time) {
    const o = this.opts
    const ctx = this.ctx2d
    const { w, h } = this.size
    if (w <= 0 || h <= 0) return

    ctx.save()
    if (o.clip) {
      const r = normalizeRadius(o.radius, w, h)
      roundRect(ctx, 0, 0, w, h, r.tl, r.tr, r.br, r.bl)
      ctx.clip()
    }
    ctx.lineWidth = o.thickness || 1

    const baseR = Math.max(12, Math.min(w * 0.4, o.cylinderRadius || 36))
    const span = w + baseR * 2.5

    for (let i = 0; i < this.rods.length; i++) {
      const rod = this.rods[i]
      const R = baseR * rod.radMult

      // Disparate x translation: some move faster, some slower, some revert backward
      const xTravel = time * o.speed * rod.speedMult
      const rawX = rod.initX * span + xTravel
      const cx = (((rawX % span) + span) % span) - baseR * 1.25

      // Disparate angular motion
      const angle = rod.initPhase + time * o.rotSpeed * rod.rotMult
      const x = cx + R * Math.cos(angle)
      const z = Math.sin(angle) // -1 to +1

      // Clip check
      if (x < -this.inset - 2 || x > w + this.inset + 2) continue

      // Combine randomized rod transparency with front/back depth modulation
      const depthAlpha = 0.4 + 0.6 * ((z + 1) / 2)
      const finalAlpha = Math.max(0.08, Math.min(1, rod.baseOpacity * o.opacity * depthAlpha))
      ctx.strokeStyle = hexA(o.color, finalAlpha)

      // Infinite vertical height spanning the entire frame
      ctx.beginPath()
      ctx.moveTo(x, -this.inset)
      ctx.lineTo(x, h + this.inset)
      ctx.stroke()
    }
    ctx.restore()
  }
}

/* ------------------------------------------------------------------ nodes */
/**
 * Canvas-hosted drifting points joined by proximity links.
 * Nodes can drift outside the button bounds and naturally return.
 */
export class Nodes extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static bleed = true
  static defaults = {
    color: '#34d399',
    count: 7, // reduced population
    linkDistance: 80,
    speed: 14,
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
    const n = clamp(o.count | 0, 2, 40)
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
      n.x += (n.vx * o.speed * dt) / Math.max(1, w)
      n.y += (n.vy * o.speed * dt) / Math.max(1, h)

      // Allow nodes to move outside the button, then apply spring return force
      if (n.x < -0.1) n.vx += (0 - n.x) * 3 * dt
      if (n.x > 1.1) n.vx += (1 - n.x) * 3 * dt
      if (n.y < -0.15) n.vy += (0 - n.y) * 3 * dt
      if (n.y > 1.15) n.vy += (1 - n.y) * 3 * dt

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
 * Canvas-hosted moving triangular tessellation covering 100% of the overlay silhouette.
 * Zero null area, non-overlapping triangles with randomized transparency strictly 10% to 30%.
 */
export class HyperTriangles extends AnimationBase {
  static host = 'canvas'
  static kind = 'overlay'
  static defaults = {
    color: '#f472b6',
    count: 16, // total triangle count
    columns: 4, // number of quad columns
    speed: 0.8,
    linkWidth: 1,
    fillMin: 0.1, // random transparency strictly 10% to 30%
    fillMax: 0.3,
    opacity: 0.8,
    follow: true,
    pull: 0.25,
    clip: true,
    radius: 0,
    fade: 0.4,
  }

  build() {
    const o = this.opts
    const rnd = mulberry32(41)
    const count = Math.max(4, o.count || 16)
    const cols = Math.max(2, Math.round(count / 4))
    this.cols = cols
    // Pre-generate stable random phase offsets and base opacities for each triangle
    this.triOpacities = Array.from({ length: cols * 4 }, () => ({
      base: o.fillMin + rnd() * (o.fillMax - o.fillMin),
      phase: rnd() * Math.PI * 2,
    }))
  }

  render(time) {
    const o = this.opts
    const ctx = this.ctx2d
    const { w, h } = this.size
    if (w <= 0 || h <= 0) return

    const cols = this.cols || Math.max(2, Math.round((o.count || 16) / 4))
    const spd = o.speed
    const pull = o.follow && this.pointer.inside ? o.pull : 0

    ctx.save()
    if (o.clip) {
      const r = normalizeRadius(o.radius, w, h)
      roundRect(ctx, 0, 0, w, h, r.tl, r.tr, r.br, r.bl)
      ctx.clip()
    }
    ctx.lineWidth = o.linkWidth || 1

    // Build row vertices spanning exact bounds [0..w] and [0..h]
    const top = []
    const mid = []
    const bot = []

    for (let j = 0; j <= cols; j++) {
      const u = j / cols
      const baseX = u * w

      // Top row vertices (y = 0)
      const tx = j === 0 ? 0 : j === cols ? w : baseX + Math.sin(time * spd * 0.8 + j * 1.7) * (w / cols * 0.2)
      top.push({ x: tx, y: 0 })

      // Bottom row vertices (y = h)
      const bx = j === 0 ? 0 : j === cols ? w : baseX + Math.cos(time * spd * 0.7 + j * 2.1) * (w / cols * 0.2)
      bot.push({ x: bx, y: h })

      // Middle row vertices (y ~ 0.5h) with wandering motion
      let mx = j === 0 ? 0 : j === cols ? w : baseX + Math.sin(time * spd * 0.9 + j * 1.3) * (w / cols * 0.26)
      let my = h * 0.5 + Math.cos(time * spd * 1.1 + j * 1.9) * (h * 0.22)

      if (pull) {
        const dx = this.pointer.px - mx
        const dy = this.pointer.py - my
        const dist = Math.hypot(dx, dy)
        const factor = Math.max(0, 1 - dist / 100) * pull
        mx += dx * factor
        my += dy * factor
      }
      mid.push({ x: mx, y: my })
    }

    // Tessellate quads into non-overlapping triangles covering 100% of the silhouette
    let triIdx = 0
    for (let j = 0; j < cols; j++) {
      const t0 = top[j], t1 = top[j + 1]
      const m0 = mid[j], m1 = mid[j + 1]
      const b0 = bot[j], b1 = bot[j + 1]

      // 4 triangles per column cell: 2 in top quad, 2 in bottom quad
      const cellTriangles = [
        [t0, t1, m1],
        [t0, m1, m0],
        [m0, m1, b1],
        [m0, b1, b0],
      ]

      for (const pts of cellTriangles) {
        const cfg = this.triOpacities[triIdx % this.triOpacities.length]
        triIdx++

        // Opacity strictly between 10% and 30%
        const wave = 0.5 + 0.5 * Math.sin(time * 0.6 + cfg.phase)
        const alpha = clamp(cfg.base + (wave - 0.5) * 0.06, o.fillMin, o.fillMax)

        ctx.globalAlpha = alpha * o.opacity
        ctx.fillStyle = o.color
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)
        ctx.lineTo(pts[1].x, pts[1].y)
        ctx.lineTo(pts[2].x, pts[2].y)
        ctx.closePath()
        ctx.fill()

        ctx.globalAlpha = 0.45 * o.opacity
        ctx.strokeStyle = o.color
        ctx.stroke()
      }
    }

    ctx.restore()
  }
}
/* ------------------------------------------------------------------ slide */
/**
 * Entry mask clip-paths (inset: top right bottom left).
 * Edges wipe in from their side; corners expand from their corner point.
 */
const SLIDE_CLIPS = {
  bottom: 'inset(100% 0% 0% 0%)',
  top: 'inset(0% 0% 100% 0%)',
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
  'corner-top-right': 'inset(0% 0% 100% 100%)',
  'corner-top-left': 'inset(0% 100% 100% 0%)',
  'corner-bottom-right': 'inset(100% 0% 0% 100%)',
  'corner-bottom-left': 'inset(100% 100% 0% 0%)',
}
const SLIDE_OPEN = 'inset(0% 0% 0% 0%)'

/**
 * DOM-hosted, hover-only mask animation. An opaque colour mask wipes across the
 * button over the stationary original text while revealing stationary contrasting
 * text inside the mask — zero opacity fade on either label.
 *
 * `label` defaults to the host's text, read once at mount.
 */
export class Slide extends AnimationBase {
  static host = 'dom'
  static kind = 'overlay'
  static clipped = true
  static ballistic = true
  static mask = true
  static defaults = {
    from: 'bottom',
    color: '#ffffff',
    label: null, // null -> the host's own text
    textColor: null, // null -> black or white, whichever reads on `color`
    duration: 0.35,
    ease: 'power2.inOut',
  }

  /** The decorated element: the button, or the box's parent. */
  get host() {
    return this.layer?.closest?.('button') ?? this.layer?.parentElement?.parentElement ?? null
  }

  build() {
    this.text = this.opts.label ?? this.host?.innerText?.trim() ?? ''
    this.idleClip = SLIDE_CLIPS[this.opts.from] ?? SLIDE_CLIPS.bottom

    this.panel = document.createElement('div')
    this.panel.style.cssText = `position:absolute;inset:0;overflow:hidden;will-change:clip-path;background:${this.opts.color};clip-path:${this.idleClip};`

    this.labelEl = document.createElement('div')
    this.labelEl.textContent = this.text
    this.labelEl.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;white-space:nowrap;box-sizing:border-box;pointer-events:none;color:${this.opts.textColor ?? readableOn(this.opts.color)};`

    this.panel.appendChild(this.labelEl)
    this.mountEl.appendChild(this.panel)
  }

  layout() {
    this.idleClip = SLIDE_CLIPS[this.opts.from] ?? SLIDE_CLIPS.bottom
    const cs = this.host ? window.getComputedStyle(this.host) : null
    if (cs) {
      this.labelEl.style.font = `${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily}`
      this.labelEl.style.letterSpacing = cs.letterSpacing
      this.labelEl.style.padding = cs.padding
    }
    if (!this.active) {
      gsap.set(this.panel, { clipPath: this.idleClip })
    }
  }

  onActive(active) {
    const { duration, ease } = this.opts
    gsap.to(this.panel, {
      clipPath: active ? SLIDE_OPEN : this.idleClip,
      duration: active ? duration : duration * 0.85,
      ease: active ? ease : 'power2.inOut',
      overwrite: 'auto',
    })
  }
}
