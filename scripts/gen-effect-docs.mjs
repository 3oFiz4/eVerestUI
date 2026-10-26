/**
 * Emits docs/overlay-effects.md from the effect classes themselves, so the
 * reference cannot drift from the defaults the code actually ships.
 *
 *   node scripts/gen-effect-docs.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// On Windows, Node's ESM loader rejects bare drive paths (D:\...) — dynamic
// import needs file:// URLs.
const load = (rel) => import(pathToFileURL(resolve(root, rel)).href)

const { EFFECTS, ALIASES } = await load('src/components/overlay/registry.js')

const STATE_LABEL = {
  static: '`static*`',
  hover: '`hover*`',
  active: '`active*`',
}

const HOST_NOTE = {
  canvas: 'canvas — rasterised per frame',
  svg: 'SVG — transforms and dash offsets only',
  dom: 'DOM — transform/opacity tweens',
}

/** Human-readable description of an alias entry, read from the registry. */
const describeAlias = ({ to, modify }) => {
  const mods = Object.entries(modify || {})
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(', ')
  return mods ? `${to} (${mods})` : to
}

const rows = Object.entries(EFFECTS).map(([name, { Effect, states }]) => {
  const defaults = Object.entries(Effect.defaults || {})
  const props = defaults
    .filter(([k]) => k !== 'fade')
    .map(([k, v]) => {
      const t = Array.isArray(v) ? 'number[]' : typeof v
      const d = Array.isArray(v) ? `[${v.join(', ')}]` : JSON.stringify(v)
      return `\`${k}\`: ${t} = ${d}`
    })
  return { name, states, host: Effect.host, kind: Effect.kind, props }
})

const byLayer = { border: [], overlay: [], hover: [] }
for (const r of rows) {
  const bucket = r.kind === 'border' ? 'border' : r.states.includes('static') ? 'overlay' : 'hover'
  byLayer[bucket].push(r)
}

const EFFECT_DESCRIPTIONS = {
  pulse:
    'Two distinct pulse modes:\n' +
    '- `mode: "hollow"` (default): pulses only the button outline ring, expanding outward and fading to transparent.\n' +
    '- `mode: "full"` (fill pulse): pulses a replica of the full button surface (fill + border) placed behind the button, enlarging to `to` scale until becoming transparent on click or loop.\n\n' +
    'Aliases: `pulse-hollow` and `pulse-fill`.',
  snake:
    'Rotating conic gradient beam travelling continuously along the border without seam interruption, wrap delay, or stopping.',
  glow:
    'Linear monochrome glow outside the button ring with rotating gradient lightness (bright white to blacker stops).',
  'corner-grid':
    'Four corner L-brackets that animate stroke-dashoffset into position with a staggered sequence on hover.',
  'triangle-lock':
    'Four right triangles positioned at the corners that emerge straight out of each corner on hover.',
  'floating-glow':
    'Attractor light that highlights the nearest section of the button ring in a gradient. Modes: glow, halftone (tiny micro-dots with configurable unattractedOpacity), lines (tiny grid).',
  ripple:
    'Shockwave ripple with central glowing core and expanding ring, spawning on click or idle (from ExperienceCard).',
  'floating-lines':
    'Infinite-height vertical rods (1px) representing a rotating 3D cylinder cage moving over the x-axis with front/back depth shading.',
  nodes:
    'Drifting points with proximity links. Nodes can move outside the button boundary and spring back naturally.',
  'hyper-triangles':
    'Full-coverage moving triangular tessellation covering 100% of the overlay silhouette without null area. Non-overlapping triangles with random opacity strictly between 10% and 30%.',
  'grid-track':
    'Lattice grid and crosshair lines with smooth follower and dedicated cursor marker.',
  'hyper-triangle-crack':
    'Active/click effect: crystalline hyper-triangles branching along the length of crack fissures, focused at the click cursor.',
  'grid-ripple':
    'Active/click raster shockwave: expanding gridded circle of tiny squares along the circumference, fading to 100% transparent and deleting itself. Configurable color.',
}

const section = (title, note, list) =>
  `## ${title}\n\n${note}\n\n${list
    .map(
      (r) =>
        `### \`${r.name}\`\n\n` +
        `**Where** ${r.kind === 'border' ? 'outline layer' : 'inner layer'} · ` +
        `**States** ${r.states.map((s) => STATE_LABEL[s]).join(', ')} · ` +
        `**Renders on** ${HOST_NOTE[r.host]}\n\n` +
        (EFFECT_DESCRIPTIONS[r.name] ? `${EFFECT_DESCRIPTIONS[r.name]}\n\n` : '') +
        `Parameters (all optional, shown with defaults):\n\n` +
        r.props.map((p) => `- ${p}`).join('\n') +
        '\n'
    )
    .join('\n')}`

const md = `# Overlay effect reference

Every effect is a class extending \`AnimationBase\`. Pass its name to one of the six
\`*-anim-var\` props and its parameters through the matching \`*-Modify\` object:

\`\`\`jsx
<Overlay
  staticBorderAnimVar="snake"
  staticBorderAnimVarModify={{ thickness: 3, count: 2 }}
  hoverOverlayAnimVar="grid-track"
  hoverOverlayAnimVarModify={{ shape: 'circle' }}
/>
\`\`\`

Common to all effects: \`fade\` (seconds to cross-fade when the state becomes
active or inactive; default \`0.25\`).

An unknown name logs a warning and renders nothing, rather than throwing.

${section('Outline effects', 'These set `staticBorderAnimVar`, `hoverBorderAnimVar` or `activeBorderAnimVar`. They draw on the button edge and may extend outside it — each is given `borderOverflow` px of room (default 40).', byLayer.border)}

${section('Interior effects', 'These set `staticOverlayAnimVar`, `hoverOverlayAnimVar` or `activeOverlayAnimVar`. They draw inside the silhouette and are clipped to it; effects that look better bleeding set `clip: false` and need `staticBorderAnimVar`-style room only if you move them to the border layer.', byLayer.overlay)}

${section('Cursor-driven effects', 'These only answer to the hover and active props — at rest there is no cursor to respond to. They receive the pointer position in button-box pixels.', byLayer.hover)}

## Aliases

| Name | Resolves to |
| ---- | ----------- |
${Object.entries(ALIASES)
  .map(([a, entry]) => `| \`${a}\` | ${describeAlias(entry)} |`)
  .join('\n')}

Setting any effect prop to \`null\`, \`undefined\`, \`""\`, \`false\` or \`"none"\` removes
that layer.

## State interactions

Effects that read the cursor behave differently while hovered:

- **shine** collapses closed on hover and pauses, then restarts when the pointer
  leaves, rather than resuming mid-sweep.
- **floating-glow**, **nodes**, **hyper-triangles** switch their attractor from a
  wandering path to the cursor (set \`follow: false\` to keep the drift).
- **ripple** moves its origin to the cursor (set \`follow: false\` to keep it centred).
- **grid-track**, **hyper-triangle-crack** centre on the pointer by definition.
- **sparkle**, **glitch**, **floating-lines** ignore hover and run continuously.

## Choosing a host

Each effect declares how it is drawn, and the engine provisions only that:

- **DOM** (\`shine\`, \`sparkle\`) — GSAP tweens \`xPercent\`/\`scale\`/\`opacity\`.
  Cheapest per frame; no rasterisation.
- **SVG** (\`snake\`, \`pulse\`, \`snake-fill\`, \`corner-grid\`, \`triangle-lock\`) —
  geometry and dash offsets, so shapes stay crisp at any size.
- **canvas** (everything else) — one bitmap per layer, cleared and repainted each
  frame. Used where per-pixel composition is required: additive blending, gradient
  schedules, dot matrices, node meshes.

## Performance notes

- One \`ResizeObserver\` and one pointer listener per layer, regardless of how many
  effects are mounted.
- One \`gsap.context()\` per effect instance; unmounting reverts every tween and
  ticker it created.
- Time-based effects are frame-rate independent (\`gsap.ticker.deltaRatio\`), so
  motion matches at 30 and 144 Hz.
- A canvas effect only paints while its own state is the live one; idle effects
  cost nothing beyond their mount.
- Raising \`count\`, \`grid\` density or \`linkDistance\` scales work linearly or
  quadratically (the mesh effects are O(n²) in node count).
`

mkdirSync(resolve(root, 'docs'), { recursive: true })
writeFileSync(resolve(root, 'docs/overlay-effects.md'), md)
console.log(`wrote docs/overlay-effects.md (${rows.length} effects, ${md.length} bytes)`)
