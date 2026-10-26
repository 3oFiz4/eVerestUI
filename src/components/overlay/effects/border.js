import gsap from 'gsap'
import { AnimationBase } from '../AnimationBase.js'
import { mulberry32, normalizeRadius, rectPerimeter, roundedRectPath } from '../geometry.js'
import { hexA, roundRect } from '../paint.js'

const NS = 'http://www.w3.org/2000/svg'
const svgEl = (name, attrs = {}) => {
  const node = document.createElementNS(NS, name)
  for (const k in attrs) if (attrs[k] != null) node.setAttribute(k, attrs[k])
  return node
}

/* ------------------------------------------------------------------ snake */
/**
 * Rotating conic beam walking the border continuously without seam interruption.
 * Follows the ShimmerButton conic rotation principle for zero wrap delay or stopping.
 */
export class Snake extends AnimationBase {
  static host = 'canvas'
  static kind = 'border'
  static bleed = true
  static defaults = {
    gap: 0,
    thickness: 2,
    radius: 0,
    count: 1,
    tail: 0.22, // fraction of 360deg the head trails
    speed: 0.8, // loops per second
    direction: 1, // 1 clockwise, -1 counter-clockwise
    color: '#7dd3fc',
    headColor: '#ffffff',
    glow: 4, // px drop-shadow
    fade: 0.3,
  }

  render(time) {
    const ctx = this.ctx2d
    const { w, h } = this.size
    if (w <= 0 || h <= 0) return
    const o = this.opts
    const cx = w / 2
    const cy = h / 2
    const r = normalizeRadius(o.radius + o.gap, w, h)
    const count = Math.max(1, o.count | 0)
    const baseAngle = time * o.speed * Math.PI * 2 * o.direction

    ctx.save()
    if (o.glow) {
      ctx.shadowColor = o.color
      ctx.shadowBlur = o.glow
    }
    ctx.lineWidth = o.thickness

    const tailFrac = Math.max(0.04, Math.min(0.45, o.tail))

    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (i / count) * Math.PI * 2
      const grad = ctx.createConicGradient(angle, cx, cy)
      if (o.direction >= 0) {
        grad.addColorStop(0, hexA(o.headColor, 1))
        grad.addColorStop(0.001, hexA(o.color, 0))
        grad.addColorStop(Math.max(0.002, 1 - tailFrac), hexA(o.color, 0))
        grad.addColorStop(1 - tailFrac * 0.45, hexA(o.color, 0.65))
        grad.addColorStop(1, hexA(o.headColor, 1))
      } else {
        grad.addColorStop(0, hexA(o.headColor, 1))
        grad.addColorStop(tailFrac * 0.45, hexA(o.color, 0.65))
        grad.addColorStop(tailFrac, hexA(o.color, 0))
        grad.addColorStop(0.999, hexA(o.color, 0))
        grad.addColorStop(1, hexA(o.headColor, 1))
      }
      ctx.strokeStyle = grad
      roundRect(
        ctx,
        o.gap,
        o.gap,
        Math.max(0, w - o.gap * 2),
        Math.max(0, h - o.gap * 2),
        r.tl,
        r.tr,
        r.br,
        r.bl
      )
      ctx.stroke()
    }
    ctx.restore()
  }
}

/* ------------------------------------------------------------------- glow */
/**
 * Luminous backlight glow with internal drifting clouds that cast
 * natural, smooth shades outward across the surrounding light.
 * Rendered with hardware-accelerated Gaussian blur filter (zero banding/rigidity).
 */
export class Glow extends AnimationBase {
  static host = 'canvas'
  static kind = 'border'
  static bleed = true
  static defaults = {
    gap: 0,
    radius: 0,
    color: '#ffffff',
    glowSize: 15, // px Gaussian blur radius for outer light (slightly minified)
    opacity: 0.88,
    intensity: 0.88, // alias for opacity
    cloudCount: 3, // drifting cloud blockers
    cloudSize: 18, // px span of each cloud shade along perimeter
    shadeStrength: 0.85, // optical density of cloud shadows
    pulse: 0.15, // breathing light pulse
    speed: 0.5,
    fade: 0.35,
  }

  build() {
    const o = this.opts
    const n = Math.max(2, o.cloudCount | 0)
    const rnd = mulberry32(17)
    // Pre-calculate broad cloud parameters
    this.clouds = Array.from({ length: n }, (_, i) => ({
      phase: (i / n) * Math.PI * 2 + rnd() * 0.4,
      speedX: 0.6 + rnd() * 0.4,
      speedY: 0.7 + rnd() * 0.4,
      span: Math.max(12, (o.cloudSize || 18) * (0.85 + rnd() * 0.3)),
    }))
  }

  render(time) {
    const ctx = this.ctx2d
    const { w, h } = this.size
    if (w <= 0 || h <= 0) return
    const o = this.opts
    const r = normalizeRadius(o.radius, w, h)
    const blurPx = Math.max(5, o.glowSize || 15)
    const reach = blurPx + 5
    const breathe = 1 + Math.sin(time * Math.PI * 2 * o.speed * 0.5) * o.pulse
    const alpha = Math.min(1, (o.opacity ?? o.intensity ?? 0.88) * breathe)

    // 1. Soft, continuous luminous backlight radiating from behind the button
    ctx.save()
    ctx.filter = `blur(${blurPx}px)`
    ctx.fillStyle = hexA(o.color, alpha)
    roundRect(ctx, 0, 0, w, h, r.tl, r.tr, r.br, r.bl)
    ctx.fill()
    ctx.restore()

    // 2. Natural wide cloud shades extending outward across the glow
    // Extends past the outer edge so light never loops behind it into a ball
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.filter = `blur(${Math.round(blurPx * 0.65)}px)`
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, o.shadeStrength || 0.85)})`

    for (const c of this.clouds) {
      // Orbital path along the button perimeter
      const cx = (w / 2) + Math.sin(time * o.speed * c.speedX + c.phase) * (w * 0.5)
      const cy = (h / 2) + Math.cos(time * o.speed * c.speedY + c.phase) * (h * 0.5)

      // Radial reach extends from inside the button outward past the glow radius
      const rx = c.span
      const ry = reach + 6
      // Align the shadow orientation to fan outward from the center
      const angle = Math.atan2(cy - h / 2, cx - w / 2)

      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, angle, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()

    // 3. Occlude button interior so the button's black body remains crisp and clean
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    roundRect(ctx, 0, 0, w, h, r.tl, r.tr, r.br, r.bl)
    ctx.fillStyle = '#000000'
    ctx.fill()
    ctx.restore()
  }
}

/* ------------------------------------------------------------------ pulse */
/**
 * Button pulse animation.
 *   mode: 'hollow' - expanding outline ring
 *   mode: 'full'   - filled button replica behind the button enlarging and fading to transparent
 */
export class Pulse extends AnimationBase {
  static host = 'svg'
  static kind = 'border'
  static bleed = true
  static defaults = {
    mode: 'hollow', // 'hollow' | 'full'
    gap: 0,
    radius: 0,
    thickness: 1.5,
    color: '#ffffff',
    fillColor: undefined, // custom fill for mode: 'full' (defaults to semi-translucent fill)
    from: 1,
    to: 1.25,
    peak: 0.8,
    speed: 0.8,
    count: 1,
    fade: 0.25,
  }

  build() {
    this.rings = []
    const total = Math.max(1, this.opts.count | 0)
    for (let i = 0; i < total; i++) {
      const isFull = this.opts.mode === 'full'
      const node = svgEl('rect', {
        fill: isFull ? (this.opts.fillColor || hexA(this.opts.color, 0.25)) : 'none',
        stroke: this.opts.color,
        'stroke-width': this.opts.thickness,
      })
      this.mountEl.appendChild(node)
      this.rings.push(node)
    }
  }

  layout() {
    const { w, h } = this.size
    if (w <= 0 || h <= 0) return
    const o = this.opts
    const r = normalizeRadius(o.radius + o.gap, w, h)
    this.rings.forEach((node) => {
      node.setAttribute('x', o.gap)
      node.setAttribute('y', o.gap)
      node.setAttribute('width', Math.max(0, w - o.gap * 2))
      node.setAttribute('height', Math.max(0, h - o.gap * 2))
      node.setAttribute('rx', r.tl)
      gsap.set(node, { transformOrigin: '50% 50%', scale: o.from, opacity: 0, attr: { 'stroke-width': o.thickness } })
    })
  }

  onActive(active) {
    super.onActive(active)
    if (!active) return
    const o = this.opts
    const dur = 0.6 / Math.max(0.1, o.speed)
    this.rings.forEach((node, i) => {
      gsap.fromTo(
        node,
        { scale: o.from, opacity: o.peak },
        {
          scale: o.to,
          opacity: 0,
          duration: dur,
          delay: (i / this.rings.length) * 0.1,
          ease: 'power2.out',
          force3D: true,
        }
      )
    })
  }

  animate() {
    // Continuous loop when in static state
    const o = this.opts
    const dur = 1 / Math.max(0.05, o.speed)
    this.rings.forEach((node, i) => {
      gsap
        .timeline({ repeat: -1, delay: (i / this.rings.length) * dur })
        .fromTo(
          node,
          { scale: o.from, opacity: o.peak },
          { scale: o.to, opacity: 0, duration: dur, ease: 'power2.out', force3D: true }
        )
    })
  }
}

/* --------------------------------------------------------------- corner-grid */
/**
 * Corner bracket framing from reference.
 * Four corner L-brackets animate stroke-dashoffset to 0 with stagger on hover.
 */
export class CornerGrid extends AnimationBase {
  static host = 'svg'
  static kind = 'border'
  static bleed = true
  static defaults = {
    arm: 14, // length of each bracket arm in px
    thickness: 2,
    gap: 0,
    radius: 0,
    color: '#ffffff',
    bgFill: 'rgba(255, 255, 255, 0.1)',
    speed: 1,
    fade: 0.2,
  }

  build() {
    this.bg = svgEl('rect', {
      fill: this.opts.bgFill,
      opacity: '0',
    })
    this.mountEl.appendChild(this.bg)

    this.brackets = []
    for (let i = 0; i < 4; i++) {
      const b = svgEl('path', {
        fill: 'none',
        stroke: this.opts.color,
        'stroke-width': this.opts.thickness,
        'stroke-linecap': 'square',
      })
      this.mountEl.appendChild(b)
      this.brackets.push(b)
    }
  }

  layout() {
    const { w, h } = this.size
    if (w <= 0 || h <= 0) return
    const o = this.opts
    const g = o.gap
    const arm = Math.max(4, Math.min(o.arm, Math.min(w, h) * 0.45))
    this.pathLength = arm * 2

    this.bg.setAttribute('x', g)
    this.bg.setAttribute('y', g)
    this.bg.setAttribute('width', Math.max(0, w - g * 2))
    this.bg.setAttribute('height', Math.max(0, h - g * 2))
    this.bg.setAttribute('rx', o.radius)

    const d = [
      `M ${g} ${g + arm} L ${g} ${g} L ${g + arm} ${g}`,
      `M ${w - g - arm} ${g} L ${w - g} ${g} L ${w - g} ${g + arm}`,
      `M ${g} ${h - g - arm} L ${g} ${h - g} L ${g + arm} ${h - g}`,
      `M ${w - g - arm} ${h - g} L ${w - g} ${h - g} L ${w - g} ${h - g - arm}`,
    ]

    this.brackets.forEach((b, i) => {
      b.setAttribute('d', d[i])
      b.setAttribute('stroke-width', o.thickness)
      b.setAttribute('stroke-dasharray', `${this.pathLength}`)
      b.setAttribute('stroke-dashoffset', `${this.active ? 0 : this.pathLength}`)
    })
  }

  onActive(active) {
    super.onActive(active)
    if (!this.pathLength) return
    const dur = 0.12 / Math.max(0.1, this.opts.speed)
    if (active) {
      gsap.to(this.bg, { opacity: 1, duration: 0.2, ease: 'power2.out', overwrite: 'auto' })
      gsap.to(this.brackets, {
        strokeDashoffset: 0,
        duration: dur,
        stagger: 0.04,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    } else {
      gsap.to(this.bg, { opacity: 0, duration: 0.15, ease: 'power2.out', overwrite: 'auto' })
      gsap.to(this.brackets, {
        strokeDashoffset: this.pathLength,
        duration: 0.12,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  }

  animate() {
    if (this.active) {
      this.brackets.forEach((b) => b.setAttribute('stroke-dashoffset', '0'))
      this.bg.setAttribute('opacity', '1')
    }
  }
}

/* -------------------------------------------------------------- snake-fill */
/** One snake head that begins at `start` and completes a full rotation of the button ring on hover. */
export class SnakeFill extends AnimationBase {
  static host = 'svg'
  static kind = 'border'
  static bleed = true
  static defaults = {
    gap: 2,
    thickness: 2,
    radius: 0,
    color: '#ffffff',
    start: 0, // 0..1 fraction along perimeter where the snake begins
    speed: 1, // rotation speed
    glow: 4,
    fade: 0.25,
  }

  build() {
    this.path = svgEl('path', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
    this.mountEl.appendChild(this.path)
  }

  layout() {
    const { w, h } = this.size
    if (w <= 0 || h <= 0) return
    const o = this.opts
    const r = normalizeRadius(o.radius + o.gap, w, h)
    const d = roundedRectPath(Math.max(0, w - o.gap * 2), Math.max(0, h - o.gap * 2), r.tl)
    this.path.setAttribute('d', d)
    this.path.setAttribute('transform', `translate(${o.gap} ${o.gap})`)
    this.path.setAttribute('stroke', o.color)
    this.path.setAttribute('stroke-width', o.thickness)
    this.path.style.filter = o.glow ? `drop-shadow(0 0 ${o.glow}px ${o.color})` : 'none'

    let per = 0
    try {
      per = this.path.getTotalLength() || rectPerimeter(w, h)
    } catch {
      per = rectPerimeter(w, h)
    }
    this.per = per
    this.path.setAttribute('stroke-dasharray', `${per}`)
    const startOffset = (o.start || 0) * per
    this.path.setAttribute('stroke-dashoffset', `${per + startOffset}`)
  }

  onActive(active) {
    super.onActive(active)
    if (!this.per) return
    if (this._tween) this._tween.kill()

    const o = this.opts
    const per = this.per
    const startOffset = (o.start || 0) * per
    const dur = 1 / Math.max(0.1, o.speed)

    if (active) {
      // Begin at start position and complete exactly one full rotation around the button ring
      gsap.set(this.path, { strokeDashoffset: per + startOffset })
      this._tween = gsap.to(this.path, {
        strokeDashoffset: startOffset,
        duration: dur,
        ease: 'power2.inOut',
      })
    } else {
      // Retract when unhovered
      this._tween = gsap.to(this.path, {
        strokeDashoffset: per + startOffset,
        duration: 0.2,
        ease: 'power1.out',
      })
    }
  }

  animate() {
    // Driven on hover via onActive
  }

  destroy() {
    if (this._tween) {
      this._tween.kill()
      this._tween = null
    }
    super.destroy()
  }
}

/* ------------------------------------------------------------ triangle-lock */
/**
 * Four right triangles locked precisely to the button corners,
 * emerging straight out of each corner on hover.
 */
export class TriangleLock extends AnimationBase {
  static host = 'svg'
  static kind = 'border'
  static bleed = true
  static defaults = {
    size: 10,
    gap: 0,
    radius: 0,
    color: '#ffffff',
    opacity: 0.9,
    speed: 0.8,
    fade: 0.2,
  }

  build() {
    this.tris = []
    for (let i = 0; i < 4; i++) {
      const t = svgEl('polygon', { fill: this.opts.color })
      this.mountEl.appendChild(t)
      this.tris.push(t)
    }
    this.p = 0
  }

  update(p) {
    const { w, h } = this.size
    if (w <= 0 || h <= 0) return
    const o = this.opts
    const g = o.gap || 0
    const s = o.size * p

    const pts = [
      // Top-Left: right angle at corner (g, g), legs along top and left
      [
        [g, g],
        [g + s, g],
        [g, g + s],
      ],
      // Top-Right: right angle at corner (w - g, g), legs along top and right
      [
        [w - g, g],
        [w - g - s, g],
        [w - g, g + s],
      ],
      // Bottom-Right: right angle at corner (w - g, h - g), legs along bottom and right
      [
        [w - g, h - g],
        [w - g - s, h - g],
        [w - g, h - g - s],
      ],
      // Bottom-Left: right angle at corner (g, h - g), legs along bottom and left
      [
        [g, h - g],
        [g + s, h - g],
        [g, h - g - s],
      ],
    ]

    this.tris.forEach((t, i) => {
      t.setAttribute('points', pts[i].map((pt) => `${pt[0]},${pt[1]}`).join(' '))
      t.setAttribute('opacity', `${p * o.opacity}`)
    })
  }

  layout() {
    this.p = this.active ? 1 : 0
    this.update(this.p)
  }

  onActive(active) {
    super.onActive(active)
    if (this._tween) this._tween.kill()
    const dur = 0.22 / Math.max(0.1, this.opts.speed)
    const target = { p: this.p || 0 }
    this._tween = gsap.to(target, {
      p: active ? 1 : 0,
      duration: dur,
      ease: active ? 'back.out(2)' : 'power2.in',
      onUpdate: () => {
        this.p = target.p
        this.update(target.p)
      },
    })
  }

  animate() {
    this.p = this.active ? 1 : 0
    this.update(this.p)
  }

  destroy() {
    if (this._tween) {
      this._tween.kill()
      this._tween = null
    }
    super.destroy()
  }
}

