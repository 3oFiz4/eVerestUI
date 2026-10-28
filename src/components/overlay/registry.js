import { CornerGrid, Glow, Pulse, Snake, SnakeFill, TriangleLock } from './effects/border.js'
import { GridRipple, GridTrack, HyperTriangleCrack, OuterGrid } from './effects/hover.js'
import {
  FloatingGlow,
  FloatingLines,
  Glitch,
  HyperTriangles,
  Nodes,
  Ripple,
  Shine,
  Slide,
  Sparkle,
} from './effects/inner.js'

/**
 * Effect registry: the string a `*-anim-var` prop receives -> its class.
 * `states` documents which of the six props an effect is honoured under, so one
 * definition can be reused wherever it reads well (pulse suits idle and hovered).
 */
export const EFFECTS = {
  /* edge layer */
  snake: { Effect: Snake, states: ['static', 'hover', 'active'] },
  'snake-fill': { Effect: SnakeFill, states: ['static', 'hover', 'active'] },
  glow: { Effect: Glow, states: ['static', 'hover', 'active'] },
  pulse: { Effect: Pulse, states: ['static', 'hover', 'active'] },
  'corner-grid': { Effect: CornerGrid, states: ['static', 'hover', 'active'] },
  'triangle-lock': { Effect: TriangleLock, states: ['static', 'hover', 'active'] },

  /* inner layer */
  shine: { Effect: Shine, states: ['static', 'hover', 'active'] },
  slide: { Effect: Slide, states: ['hover'] },
  sparkle: { Effect: Sparkle, states: ['static', 'hover', 'active'] },
  'floating-glow': { Effect: FloatingGlow, states: ['static', 'hover', 'active'] },
  ripple: { Effect: Ripple, states: ['static', 'hover', 'active'] },
  glitch: { Effect: Glitch, states: ['static', 'hover', 'active'] },
  'floating-lines': { Effect: FloatingLines, states: ['static', 'hover', 'active'] },
  nodes: { Effect: Nodes, states: ['static', 'hover', 'active'] },
  'hyper-triangles': { Effect: HyperTriangles, states: ['static', 'hover', 'active'] },

  /* pointer-only */
  'grid-track': { Effect: GridTrack, states: ['hover', 'active'] },
  'hyper-triangle-crack': { Effect: HyperTriangleCrack, states: ['hover', 'active'] },
  'grid-ripple': { Effect: GridRipple, states: ['active', 'hover'] },
  'outer-grid': { Effect: OuterGrid, states: ['hover', 'active'] },
}

/** Shorthands, including the floating-glow modes exposed as their own names. */
export const ALIASES = {
  'snake-ring': { to: 'snake' },
  'double-snake': { to: 'snake', modify: { count: 2 } },
  'triple-snake': { to: 'snake', modify: { count: 3 } },
  'snake-fill': { to: 'snake-fill' },
  'pulse-fill': { to: 'pulse', modify: { mode: 'full' } },
  'pulse-hollow': { to: 'pulse', modify: { mode: 'hollow' } },
  halftone: { to: 'floating-glow', modify: { mode: 'halftone' } },
  dots: { to: 'floating-glow', modify: { mode: 'halftone' } },
  'line-matrix': { to: 'floating-glow', modify: { mode: 'lines' } },
  lines: { to: 'floating-lines' },
  triangles: { to: 'hyper-triangles' },
  crack: { to: 'hyper-triangle-crack' },
  'raster-ripple': { to: 'grid-ripple' },
  'pixel-ripple': { to: 'grid-ripple' },
  corners: { to: 'corner-grid' },
}

export const STATE_KEYS = ['static', 'hover', 'active']
export const EFFECT_NAMES = Object.keys(EFFECTS)

const off = (v) => v === null || v === undefined || v === '' || v === false || v === 'none'

/** Expand props into `[{ state, layer, Effect, modify }]`; warns on bad names. */
export function resolveEffects(props) {
  const out = []
  for (const state of STATE_KEYS) {
    for (const layer of ['border', 'overlay']) {
      const key = `${state}${layer === 'border' ? 'Border' : 'Overlay'}AnimVar`
      const raw = props[key]
      if (off(raw)) continue

      const alias = ALIASES[raw]
      const name = alias ? alias.to : raw
      const entry = EFFECTS[name]
      if (!entry) {
        console.warn(`[eVerestUI] unknown ${layer} effect "${raw}" (state "${state}")`)
        continue
      }
      if (!entry.states.includes(state)) {
        console.warn(`[eVerestUI] effect "${name}" is not available for state "${state}"`)
        continue
      }
      out.push({
        state,
        layer,
        Effect: entry.Effect,
        modify: { ...(alias?.modify || {}), ...(props[`${key}Modify`] || {}) },
      })
    }
  }
  return out
}
