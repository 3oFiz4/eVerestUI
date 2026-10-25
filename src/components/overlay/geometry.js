/** Geometry helpers. All coordinates are CSS px in BUTTON-BOX space. */

/** Per-corner radius, clamped to half the shorter side. */
export function normalizeRadius(r, w, h) {
  const max = Math.min(w, h) / 2
  const o = typeof r === 'number' ? { tl: r, tr: r, br: r, bl: r } : r || {}
  const c = (k) => Math.max(0, Math.min(o[k] ?? 0, max))
  return { tl: c('tl'), tr: c('tr'), br: c('br'), bl: c('bl') }
}

/** Closed rounded-rect path, clockwise from the top-left corner. */
export function roundedRectPath(w, h, radius = 0) {
  const r = normalizeRadius(radius, w, h)
  return [
    `M ${r.tl} 0`,
    `H ${w - r.tr}`,
    r.tr ? `A ${r.tr} ${r.tr} 0 0 1 ${w} ${r.tr}` : '',
    `V ${h - r.br}`,
    r.br ? `A ${r.br} ${r.br} 0 0 1 ${w - r.br} ${h}` : '',
    `H ${r.bl}`,
    r.bl ? `A ${r.bl} ${r.bl} 0 0 1 0 ${h - r.bl}` : '',
    `V ${r.tl}`,
    r.tl ? `A ${r.tl} ${r.tl} 0 0 1 ${r.tl} 0` : '',
    'Z',
  ]
    .filter(Boolean)
    .join(' ')
}

export const rectPerimeter = (w, h) => 2 * (w + h)

/**
 * Point at fraction `t` (0..1) walking the rounded-rect perimeter clockwise from
 * the top-left corner. Used to aim snake gradients and dash offsets.
 */
export function pointOnRect(t, w, h, radius = 0) {
  const r = normalizeRadius(radius, w, h).tl
  const sw = Math.max(0, w - r * 2)
  const sh = Math.max(0, h - r * 2)
  const arc = (Math.PI * r) / 2
  const per = (sw + sh) * 2 + arc * 4
  let d = (((t % 1) + 1) % 1) * per
  const at = (cx, cy, a0) => {
    const a = a0 + (d / arc) * (Math.PI / 2)
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
  }

  if (d <= sw) return { x: r + d, y: 0 }
  d -= sw
  if (r && d <= arc) return at(w - r, r, -Math.PI / 2)
  if (r) d -= arc
  if (d <= sh) return { x: w, y: r + d }
  d -= sh
  if (r && d <= arc) return at(w - r, h - r, 0)
  if (r) d -= arc
  if (d <= sw) return { x: w - r - d, y: h }
  d -= sw
  if (r && d <= arc) return at(r, h - r, Math.PI / 2)
  if (r) d -= arc
  if (d <= sh) return { x: 0, y: h - r - d }
  d -= sh
  return r ? at(r, r, Math.PI) : { x: 0, y: 0 }
}

/** Deterministic PRNG so a given seed renders identically across remounts. */
export function mulberry32(seed) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
