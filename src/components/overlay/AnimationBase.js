import gsap from 'gsap'

/**
 * Base class for every overlay effect.
 *
 * Subclasses declare:
 *   static host = 'dom' | 'svg' | 'canvas'   element the engine provisions
 *   static kind = 'border' | 'overlay'       edge layer or inner layer
 *   static defaults = {}                     effect parameters
 *   static bleed  = true                     needs room outside the button box
 *
 * Coordinates: every effect draws in BUTTON-BOX space — (0,0) is the button's
 * top-left and (size.w, size.h) its bottom-right — regardless of host. Border
 * effects get a bitmap padded by `inset` px so halos and rays can extend past
 * the outline; the padding is applied by the context/viewBox, not by the effect.
 *
 * Lifecycle: mount() -> resize() -> setActive() / setPointer() -> destroy()
 * build() and animate() run inside this instance's gsap.context(), so one
 * revert() on unmount kills every tween and ticker it created.
 */
export class AnimationBase {
  static host = 'dom'
  static kind = 'overlay'
  static defaults = {}
  static bleed = false
  static clipped = false

  constructor(layer, options = {}) {
    this.layer = layer
    this.opts = { ...this.constructor.defaults, ...options }
    // Unknown option keys are silently dropped by the spread above, which makes a
    // typo (or a renamed parameter) look like the effect simply ignoring you. Warn
    // in dev so it surfaces immediately instead.
    if (import.meta.env?.DEV) {
      const known = new Set([...Object.keys(this.constructor.defaults), 'radius', 'inset'])
      for (const key of Object.keys(options)) {
        if (!known.has(key)) {
          console.warn(
            `[eVerestUI] ${this.constructor.name}: unknown parameter "${key}" (ignored). ` +
              `Known: ${[...known].sort().join(', ')}`
          )
        }
      }
    }
    this.inset = this.constructor.bleed ? options.inset || 0 : 0
    this.size = { w: 0, h: 0 } // button box
    this.pointer = { x: 0.5, y: 0.5, px: 0, py: 0, inside: false }
    this.active = false
    this.mounted = false
    this.ctx = null
    this.root = null
    this.mountEl = null // where children go (DOM effects) / the svg / the canvas
    this.playing = true
  }

  mount() {
    if (this.mounted) return
    this.mounted = true
    this.createHost()
    this.ctx = gsap.context(() => {
      this.build()
      this.animate()
    }, this.layer)
    if (this.constructor.host === 'canvas') {
      this._tick = (time) => {
        if (!this.mounted || !this.active || !this.playing) return
        this.clearFrame()
        this.render(time, gsap.ticker.deltaRatio(60))
      }
      gsap.ticker.add(this._tick)
    }
    this.resize(this.size)
  }

  createHost() {
    const host = this.constructor.host
    const pad = this.inset
    if (host === 'svg') {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('class', 'absolute inset-0 h-full w-full overflow-visible')
      svg.setAttribute('aria-hidden', 'true')
      this.root = svg
      this.mountEl = svg
    } else if (host === 'canvas') {
      const canvas = document.createElement('canvas')
      canvas.setAttribute('class', 'absolute inset-0 h-full w-full')
      canvas.setAttribute('aria-hidden', 'true')
      this.ctx2d = canvas.getContext('2d')
      this.root = canvas
      this.mountEl = canvas
    } else {
      const div = document.createElement('div')
      div.setAttribute('class', 'absolute inset-0 h-full w-full')
      div.setAttribute('aria-hidden', 'true')
      this.root = div
      // Children live in a button-box-sized frame, so their coordinates match
      // the canvas/svg hosts. `clipped` effects get the silhouette as clip-path.
      const box = document.createElement('div')
      const r = this.opts.radius
      box.style.cssText = `position:absolute;left:${pad}px;top:${pad}px;overflow:visible;${r ? `border-radius:${r}px;` : ''}`
      if (this.constructor.clipped) box.style.clipPath = `inset(0 round ${r || 0}px)`
      div.appendChild(box)
      this.mountEl = box
    }
    gsap.set(this.root, { opacity: 0, force3D: true, pointerEvents: 'none' })
    this.layer.appendChild(this.root)
  }

  /**
   * Called by the engine when the measured layer size changes. `layerSize` is the
   * padded element size; the button box is that minus the inset on each side.
   */
  resize(layerSize) {
    const size = { w: Math.max(1, layerSize.w - this.inset * 2), h: Math.max(1, layerSize.h - this.inset * 2) }
    const changed = size.w !== this.size.w || size.h !== this.size.h
    this.size = size
    if (!this.mounted || !changed) return
    const host = this.constructor.host
    if (host === 'svg') {
      // viewBox starts at -inset so effects draw in button coords
      this.root.setAttribute(
        'viewBox',
        `${-this.inset} ${-this.inset} ${size.w + this.inset * 2} ${size.h + this.inset * 2}`
      )
      this.root.setAttribute('width', size.w + this.inset * 2)
      this.root.setAttribute('height', size.h + this.inset * 2)
    } else if (host === 'canvas') {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      this.dpr = dpr
      this.root.width = Math.max(1, Math.round((size.w + this.inset * 2) * dpr))
      this.root.height = Math.max(1, Math.round((size.h + this.inset * 2) * dpr))
      // scale then offset so button-box coords map onto the padded bitmap
      this.ctx2d.setTransform(dpr, 0, 0, dpr, this.inset * dpr, this.inset * dpr)
    } else {
      this.mountEl.style.width = `${size.w}px`
      this.mountEl.style.height = `${size.h}px`
    }
    this.layout(size)
    this.onResize()
  }

  /** Clear the whole padded frame, in button-box coordinates. */
  clearFrame() {
    if (!this.ctx2d) return
    this.ctx2d.clearRect(
      -this.inset,
      -this.inset,
      this.size.w + this.inset * 2,
      this.size.h + this.inset * 2
    )
  }

  setActive(active) {
    if (this.active === active) return
    this.active = active
    if (!this.mounted) return
    gsap.to(this.root, {
      opacity: active ? 1 : 0,
      duration: this.opts.fade ?? 0.25,
      ease: 'power2.out',
      overwrite: 'auto',
    })
    this.onActive(active)
  }

  /** Pointer in button-box px, plus normalized 0..1 coords and inside flag. */
  setPointer(pointer) {
    this.pointer = pointer
    if (this.mounted) this.onPointer(pointer)
  }

  destroy() {
    this.mounted = false
    if (this._tick) gsap.ticker.remove(this._tick)
    this._tick = null
    this.ctx?.revert()
    this.ctx = null
    this.root?.remove()
    this.root = null
    this.mountEl = null
  }

  /* ---- hooks, all optional ---- */
  build() {}
  animate() {}
  layout() {}
  render() {}
  onResize() {}
  onActive() {}
  onPointer() {}
}

export default AnimationBase
