import gsap from 'gsap'
import { AnimationBase } from '../AnimationBase.js'
import { normalizeRadius, pointOnRect, rectPerimeter, roundedRectPath } from '../geometry.js'
import { hexA, roundRect } from '../paint.js'

const NS = 'http://www.w3.org/2000/svg'
const svgEl = (name, attrs = {}) => {
  const node = document.createElementNS(NS, name)
  for (const k in attrs) if (attrs[k] != null) node.setAttribute(k, attrs[k])
  return node
}

/* ------------------------------------------------------------------ snake */
/**
 * Tapered head walking the outline. The tail fades because the stroke is painted
 * with a userSpaceOnUse linearGradient whose two points are re-aimed every frame
 * at (tail, head) — four attribute writes per tick, no per-frame path rebuilding.
 *   count: 1 = single, 2 = double-snake, 3 = triple, n = n snakes.
 */
export class Snake extends AnimationBase {
  static host = 'svg'
  static kind = 'border'
  static bleed = true
  static defaults = {
    gap: 2,
    thickness: 2,
    radius: 0,
    count: 1,
    tail: 0.14, // fraction of the perimeter the head trails
    speed: 1, // loops per second
    direction: 1, // 1 clockwise, -1 counter-clockwise
    color: '#7dd3fc',
    headColor: '#ffffff',
    midStop: 0.7,
    glow: 4, // px drop-shadow
    fade: 0.3,
  }

  build() {
    const defs = svgEl('defs')
    this.mountEl.appendChild(defs)
    this.heads = []
    const total = Math.max(1, this.opts.count | 0)
    for (let i = 0; i < total; i++) {
      const id = `ev-snake-${i}-${Math.random().toString(36).slice(2, 8)}`
      const grad = svgEl('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 0, y2: 0 })
      grad.appendChild(svgEl('stop', { offset: '0%', 'stop-color': this.opts.color, 'stop-opacity': '0' }))
      grad.appendChild(
        svgEl('stop', { offset: `${this.opts.midStop * 100}%`, 'stop-color': this.opts.color, 'stop-opacity': '0.55' })
      )
      grad.appendChild(svgEl('stop', { offset: '100%', 'stop-color': this.opts.headColor, 'stop-opacity': '1' }))
      defs.appendChild(grad)
      const path = svgEl('path', {
        fill: 'none',
        stroke: `url(#${id})`,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      })
      this.mountEl.appendChild(path)
      this.heads.push({ path, grad, offset: i / total })
    }
  }

  layout() {
    const { w, h } = this.size
    const o = this.opts
    const per = rectPerimeter(w, h)
    const len = Math.max(6, per * o.tail)
    const r = normalizeRadius(o.radius + o.gap, w, h)
    const d = roundedRectPath(Math.max(0, w - o.gap * 2), Math.max(0, h - o.gap * 2), r.tl)
    this.per = per
    this.len = len
    this.heads.forEach((head) => {
      head.path.setAttribute('d', d)
      head.path.setAttribute('transform', `translate(${o.gap} ${o.gap})`)
      head.path.setAttribute('stroke-width', o.thickness)
      head.path.setAttribute('stroke-dasharray', `${len} ${per}`)
      head.path.style.filter = o.glow ? `drop-shadow(0 0 ${o.glow}px ${o.color})` : 'none'
      gsap.set(head.path, { strokeDashoffset: -head.offset * per })
    })
  }

  animate() {
    const { w, h } = this.size
    const o = this.opts
    const per = rectPerimeter(w, h)
    this.heads.forEach((head) => {
      const aim = (progress) => {
        const t = head.offset + progress * o.direction
        const headPt = pointOnRect(t, w, h, o.radius + o.gap)
        const tailPt = pointOnRect(t - this.len / per, w, h, o.radius + o.gap)
        head.grad.setAttribute('x1', tailPt.x)
        head.grad.setAttribute('y1', tailPt.y)
        head.grad.setAttribute('x2', headPt.x)
        head.grad.setAttribute('y2', headPt.y)
      }
      aim(0)
      const cursor = { p: 0 }
      gsap.to(cursor, {
        p: 1,
        duration: 1 / Math.max(0.05, o.speed),
        repeat: -1,
        ease: 'none',
        onUpdate: () => aim(cursor.p),
      })
      gsap.to(head.path, {
        strokeDashoffset: -head.offset * per - per * o.direction,
        duration: 1 / Math.max(0.05, o.speed),
        repeat: -1,
        ease: 'none',
      })
    })
  }
}

/* ------------------------------------------------------------------- glow */
/**
 * Sun-like halo with crepuscular rays. Rays are painted on canvas, then the
 * button silhouette is punched out with destination-out so the shafts read as
 * blocked by the button — exactly what the outline would occlude.
 */
export class Glow extends AnimationBase {
  static host = 'canvas'
  static kind = 'border'
  static bleed = true
  static defaults = {
    gap: 0,
    radius: 0,
    color: '#ffd66b',
    intensity: 0.55,
    rayCount: 24,
    rayLength: 26,
    rayWidth: 0.5, // fraction of each slot
    spread: 1, // halo multiplier
    rotate: 0.05, // turns/sec
    pulse: 0.15,
    lengthJitter: 0.25,
    fade: 0.35,
  }

  render(time) {
    const ctx = this.ctx2d
    const { w, h } = this.size
    const o = this.opts
    const cx = w / 2
    const cy = h / 2
    const breathe = 1 + Math.sin(time * Math.PI * 2 * 0.5) * o.pulse
    const reach = Math.hypot(w, h) / 2 + o.rayLength

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(time * o.rotate * Math.PI * 2)
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < Math.max(1, o.rayCount | 0); i++) {
      const a = (i / o.rayCount) * Math.PI * 2
      const half = (Math.PI / o.rayCount) * o.rayWidth
      const len = reach * (1 - o.lengthJitter * (0.5 + 0.5 * Math.sin(i * 1.7 + time)))
      const g = ctx.createRadialGradient(0, 0, Math.min(w, h) * 0.2, 0, 0, len)
      g.addColorStop(0, hexA(o.color, 0.5 * o.intensity * breathe))
      g.addColorStop(0.6, hexA(o.color, 0.12 * o.intensity * breathe))
      g.addColorStop(1, hexA(o.color, 0))
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, len, a - half, a + half)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()

    // rays are occluded where the button body sits
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    const r = normalizeRadius(o.radius, w, h)
    roundRect(ctx, o.gap, o.gap, Math.max(0, w - o.gap * 2), Math.max(0, h - o.gap * 2), r.tl, r.tr, r.br, r.bl)
    ctx.fillStyle = '#000'
    ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const halo = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.35, cx, cy, reach)
    halo.addColorStop(0, hexA(o.color, 0.22 * o.intensity * o.spread * breathe))
    halo.addColorStop(1, hexA(o.color, 0))
    ctx.fillStyle = halo
    ctx.fillRect(
      -this.inset,
      -this.inset,
      w + this.inset * 2,
      h + this.inset * 2
    )
    ctx.restore()
  }
}

/* ------------------------------------------------------------------ pulse */
/** `mode:'full'` pulses the surface, `'hollow'` pulses only the ring. */
export class Pulse extends AnimationBase {
  static host = 'svg'
  static kind = 'border'
  static bleed = true
  static defaults = {
    mode: 'hollow',
    gap: 0,
    radius: 0,
    thickness: 2,
    color: '#ffffff',
    from: 1,
    to: 1.12,
    peak: 0.35,
    speed: 0.8,
    count: 1,
    fade: 0.25,
  }

  build() {
    this.rings = []
    const total = Math.max(1, this.opts.count | 0)
    for (let i = 0; i < total; i++) {
      const node =
        this.opts.mode === 'full'
          ? svgEl('rect', { fill: this.opts.color })
          : svgEl('rect', { fill: 'none', stroke: this.opts.color, 'stroke-width': this.opts.thickness })
      this.mountEl.appendChild(node)
      this.rings.push(node)
    }
  }

  layout() {
    const { w, h } = this.size
    const o = this.opts
    const r = normalizeRadius(o.radius + o.gap, w, h)
    this.rings.forEach((node) => {
      node.setAttribute('x', o.gap)
      node.setAttribute('y', o.gap)
      node.setAttribute('width', Math.max(0, w - o.gap * 2))
      node.setAttribute('height', Math.max(0, h - o.gap * 2))
      node.setAttribute('rx', r.tl)
      gsap.set(node, { transformOrigin: '50% 50%', attr: { 'stroke-width': o.thickness } })
    })
  }

  animate() {
    const o = this.opts
    const dur = 1 / Math.max(0.05, o.speed)
    this.rings.forEach((node, i) => {
      gsap
        .timeline({ repeat: -1, delay: (i / this.rings.length) * dur })
        .fromTo(
          node,
          { scale: o.from, opacity: 0.9 },
          { scale: o.to, opacity: o.peak, duration: dur, ease: 'power1.out', force3D: true }
        )
        .to(node, { scale: o.from, opacity: 0, duration: 0.001 })
    })
  }
}

/* --------------------------------------------------------------- corner-grid */
/** `variant:'square'` short L brackets, `'ring'` the dotted full outline. */
export class CornerGrid extends AnimationBase {
  static host = 'svg'
  static kind = 'border'
  static bleed = true
  static defaults = {
    variant: 'square',
    size: 10,
    thickness: 2,
    gap: 0,
    radius: 0,
    color: '#e5e7eb',
    speed: 0.6,
    reach: 1.18, // bracket growth on the pulse
    dash: '2 4', // ring variant only
    fade: 0.25,
  }

  build() {
    const o = this.opts
    if (o.variant === 'ring') {
      this.path = svgEl('path', { fill: 'none', stroke: o.color, 'stroke-width': o.thickness, 'stroke-dasharray': o.dash })
      this.mountEl.appendChild(this.path)
      return
    }
    this.brackets = []
    for (let i = 0; i < 4; i++) {
      const b = svgEl('path', {
        fill: 'none',
        stroke: o.color,
        'stroke-width': o.thickness,
        'stroke-linecap': 'square',
      })
      this.mountEl.appendChild(b)
      this.brackets.push(b)
    }
  }

  layout() {
    const { w, h } = this.size
    const o = this.opts
    const g = o.gap
    const s = o.size
    if (o.variant === 'ring') {
      const r = normalizeRadius(o.radius + g, w, h)
      this.path.setAttribute('d', roundedRectPath(Math.max(0, w - g * 2), Math.max(0, h - g * 2), r.tl))
      this.path.setAttribute('transform', `translate(${g} ${g})`)
      return
    }
    const r = normalizeRadius(o.radius, w, h)
    const d = [
      `M ${g + r.tl + s} ${g} H ${g + r.tl} V ${g + r.tl + s}`,
      `M ${w - g - r.tr - s} ${g} H ${w - g - r.tr} V ${g + r.tr + s}`,
      `M ${w - g - r.br} ${h - g - r.br - s} V ${h - g - r.br} H ${w - g - r.br - s}`,
      `M ${g + r.bl + s} ${h - g} H ${g + r.bl} V ${h - g - r.bl - s}`,
    ]
    this.brackets.forEach((b, i) => b.setAttribute('d', d[i]))
  }

  animate() {
    const o = this.opts
    if (o.variant === 'ring') {
      gsap.to(this.path, {
        strokeDashoffset: -60,
        duration: 1 / Math.max(0.05, o.speed),
        repeat: -1,
        ease: 'none',
      })
      return
    }
    gsap.to(this.brackets, {
      scale: o.reach,
      transformOrigin: '50% 50%',
      duration: 1 / Math.max(0.05, o.speed),
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
      stagger: 0.08,
      force3D: true,
    })
  }
}

/* -------------------------------------------------------------- snake-fill */
/** One head that fills the entire ring, holds, then restarts from `start`. */
export class SnakeFill extends AnimationBase {
  static host = 'svg'
  static kind = 'border'
  static bleed = true
  static defaults = {
    gap: 2,
    thickness: 2,
    radius: 0,
    color: '#a5b4fc',
    start: 0,
    hold: 0.25,
    speed: 0.6,
    glow: 4,
    fade: 0.3,
  }

  build() {
    this.path = svgEl('path', { fill: 'none', 'stroke-linecap': 'round' })
    this.mountEl.appendChild(this.path)
  }

  layout() {
    const { w, h } = this.size
    const o = this.opts
    const per = rectPerimeter(w, h)
    this.per = per
    const r = normalizeRadius(o.radius + o.gap, w, h)
    this.path.setAttribute('d', roundedRectPath(Math.max(0, w - o.gap * 2), Math.max(0, h - o.gap * 2), r.tl))
    this.path.setAttribute('transform', `translate(${o.gap} ${o.gap})`)
    this.path.setAttribute('stroke', o.color)
    this.path.setAttribute('stroke-width', o.thickness)
    this.path.setAttribute('stroke-dasharray', `${per}`)
    this.path.style.filter = o.glow ? `drop-shadow(0 0 ${o.glow}px ${o.color})` : 'none'
  }

  animate() {
    const o = this.opts
    const per = this.per
    const dur = 1 / Math.max(0.05, o.speed)
    gsap.set(this.path, { strokeDashoffset: per * (1 + (o.start || 0)) })
    gsap
      .timeline({ repeat: -1 })
      .fromTo(this.path, { strokeDashoffset: per }, { strokeDashoffset: 0, duration: dur, ease: 'power1.inOut' })
      .to(this.path, { strokeDashoffset: -per, duration: 0.3, ease: 'power2.in' })
      .to({}, { duration: o.hold })
  }
}

/* ------------------------------------------------------------ triangle-lock */
/** Four right triangles with hypotenuses facing the centre: `|<==>|`. */
export class TriangleLock extends AnimationBase {
  static host = 'svg'
  static kind = 'border'
  static bleed = true
  static defaults = {
    size: 14,
    gap: 0,
    radius: 0,
    color: '#fca5a5',
    opacity: 0.85,
    speed: 0.8,
    pulse: 0.2,
    offset: 0, // px pushed in from the corner
    fade: 0.25,
  }

  build() {
    this.tris = []
    for (let i = 0; i < 4; i++) {
      const t = svgEl('polygon', { fill: this.opts.color })
      this.mountEl.appendChild(t)
      this.tris.push(t)
    }
  }

  layout() {
    const { w, h } = this.size
    const o = this.opts
    const g = o.gap
    const s = o.size
    const d = o.offset
    const r = normalizeRadius(o.radius, w, h)
    const pts = [
      [
        [g + r.tl + d, g + d],
        [g + r.tl + d + s, g + d],
        [g + r.tl + d, g + d + s],
      ],
      [
        [w - g - r.tr - d, g + d],
        [w - g - r.tr - d - s, g + d],
        [w - g - r.tr - d, g + d + s],
      ],
      [
        [w - g - r.br - d, h - g - d],
        [w - g - r.br - d - s, h - g - d],
        [w - g - r.br - d, h - g - d - s],
      ],
      [
        [g + r.bl + d, h - g - d],
        [g + r.bl + d + s, h - g - d],
        [g + r.bl + d, h - g - d - s],
      ],
    ]
    this.tris.forEach((t, i) => t.setAttribute('points', pts[i].map((p) => p.join(',')).join(' ')))
  }

  animate() {
    const o = this.opts
    gsap.set(this.tris, { opacity: o.opacity })
    gsap.to(this.tris, {
      opacity: o.opacity * (1 - o.pulse),
      duration: 1 / Math.max(0.05, o.speed),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: { each: 0.05, from: 'edges' },
    })
  }
}

