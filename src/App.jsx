import { useState } from 'react'
import { Button, Card, Overlay, BUTTON_SIZES, BUTTON_VARIANTS } from './components'

/* ------------------------------------------------------------------ layout */

function Section({ id, title, note, children }) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-neutral-800 pt-8">
      <h2 className="text-base font-bold tracking-tight text-neutral-100">{title}</h2>
      {note && <p className="mt-1 max-w-2xl text-sm text-neutral-400">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Row({ label, title, children }) {
  return (
    // Generous vertical padding: border effects deliberately bleed ~40px past the
    // button, so tight rows would make one animation collide with the next.
    <div className="flex flex-wrap items-center gap-4 border-b border-neutral-900/60 py-8 last:border-0">
      <span className="w-44 shrink-0 font-mono text-xs text-neutral-500" title={title}>
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

function Code({ children }) {
  return (
    <pre className="overflow-x-auto border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs text-neutral-300">
      {children}
    </pre>
  )
}

/* ------------------------------------------------------------------- demos */

const VARIANTS = ['primary', 'neutral', 'success', 'caution', 'warning', 'danger', 'info', 'ghost']
const SIZES = ['sm', 'md', 'lg']

/** Every border-layer effect, one per Button variant. */
const BORDER_EFFECTS = [
  ['snake', { thickness: 3, tail: 0.16 }],
  ['double-snake', { thickness: 3, gap: 3 }],
  ['triple-snake', { thickness: 2, gap: 5 }],
  ['glow', { rayCount: 32, rayLength: 34, intensity: 0.7 }],
  ['pulse', { mode: 'hollow', to: 1.2 }],
  ['pulse', { mode: 'full', to: 1.05, peak: 0.2 }],
  ['corner-grid', { variant: 'square', size: 14 }],
  ['corner-grid', { variant: 'ring', speed: 1.2 }],
  ['triangle-lock', { size: 16 }],
  ['snake-fill', { thickness: 3, speed: 0.8 }],
]

/** Every inner-layer effect. */
const INNER_EFFECTS = [
  ['shine', { speed: 1.1 }],
  ['sparkle', { count: 12, size: 13, stagger: 0.18 }],
  ['floating-glow', { mode: 'glow', clip: true }],
  ['halftone', { grid: 13, clip: true }],
  ['line-matrix', { grid: 20, clip: true }],
  ['floating-glow', { mode: 'glow', clip: false, size: 0.7 }],
  ['ripple', { count: 3, stagger: 0.6 }],
  ['glitch', { burstsPerSecond: 5 }],
  ['floating-lines', { count: 22, angle: -8 }],
  ['nodes', { count: 26, linkDistance: 58 }],
  ['hyper-triangles', { count: 20, fill: true }],
]

/** Cursor-driven effects. */
const HOVER_EFFECTS = [
  ['grid-track', { shape: 'square', cell: 22 }, 'square tile + crosshair'],
  ['grid-track', { shape: 'circle', cell: 34, grid: false }, 'circle tile, no lattice'],
  ['hyper-triangle-crack', { branches: 9 }, 'cracks open at the cursor'],
  ['outer-grid', { boost: 0.2 }, 'surrounding grid 20% lighter'],
]

const EFFECT_NAMES = [
  ...BORDER_EFFECTS.map(([n]) => n),
  ...INNER_EFFECTS.map(([n]) => n),
  ...HOVER_EFFECTS.map(([n]) => n),
]

/* --------------------------------------------------------------------- app */

export default function App() {
  const [combo, setCombo] = useState({
    border: 'snake',
    inner: 'halftone',
    hover: 'grid-track',
    active: 'ripple',
  })

  // Read the live effect list straight off the registry so the docs cannot drift.
  const names = [...new Set(EFFECT_NAMES)]

  return (
    <main className="min-h-screen w-full bg-neutral-950 px-6 py-10 text-neutral-100">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Button</h1>
          <p className="max-w-2xl text-sm text-neutral-400">
            {`Sharp-cornered (\u0030px radius) button. Variants ${BUTTON_VARIANTS.length}, sizes ${BUTTON_SIZES.length}. Stateful GSAP overlay effects are layered behind the label via `}
            <code className="font-mono text-neutral-300">{'<Overlay />'}</code>.
          </p>
        </header>

        <Section
          id="variants"
          title="Variants"
          note="Semantic variants. Each supplies an accent colour that its child Overlay inherits, so effects match the intent without colour plumbing."
        >
          <Row label="variant">
            {VARIANTS.map((v) => (
              <Button key={v} variant={v}>
                {v}
              </Button>
            ))}
          </Row>
          <Row label="size">
            {SIZES.map((s) => (
              <Button key={s} size={s}>
                size {s}
              </Button>
            ))}
          </Row>
          <Row label="state">
            <Button>default</Button>
            <Button loading>loading</Button>
            <Button disabled>disabled</Button>
            <Button fullWidth className="max-w-48">
              fullWidth
            </Button>
          </Row>
          <Row label="radius">
            <Button radius={0}>0 (default)</Button>
            <Button radius={4}>4</Button>
            <Button radius={999}>999 (pill)</Button>
          </Row>
        </Section>

        <Section
          id="effect-list"
          title={`Registered effects (${names.length})`}
          note="Names accepted by every *-anim-var prop. Effects marked cursor-driven only answer to the hover/active props."
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs text-neutral-400 sm:grid-cols-4">
            {names.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </Section>

        <Section
          id="border"
          title="staticBorderAnimVar"
          note="Drawn on the outline. Bleeds outside the button, so halos and rays are never clipped."
        >
          {BORDER_EFFECTS.map(([name, modify], i) => (
            <Row key={name + i} label={name} title={JSON.stringify(modify)}>
              <Button variant={VARIANTS[i % VARIANTS.length]}>
                {name}
                <Overlay staticBorderAnimVar={name} staticBorderAnimVarModify={modify} />
              </Button>
            </Row>
          ))}
        </Section>

        <Section
          id="inner"
          title="staticOverlayAnimVar"
          note="Drawn inside the silhouette and clipped to it. Effects terminating in '-glow' can opt out with clip:false."
        >
          {INNER_EFFECTS.map(([name, modify], i) => (
            <Row key={name + i} label={name} title={JSON.stringify(modify)}>
              <Button variant={VARIANTS[i % VARIANTS.length]}>
                {name}
                <Overlay staticOverlayAnimVar={name} staticOverlayAnimVarModify={modify} />
              </Button>
            </Row>
          ))}
        </Section>

        <Section
          id="hover"
          title="hoverOverlayAnimVar"
          note="Follows the cursor. Move the pointer across each button."
        >
          {HOVER_EFFECTS.map(([name, modify, hint], i) => (
            <Row key={name + i} label={hint}>
              <Button variant={VARIANTS[i % VARIANTS.length]}>
                {name}
                <Overlay
                  staticBorderAnimVar="snake"
                  staticBorderAnimVarModify={{ thickness: 2 }}
                  hoverOverlayAnimVar={name}
                  hoverOverlayAnimVarModify={modify}
                />
              </Button>
            </Row>
          ))}
        </Section>

        <Section
          id="active"
          title="activeBorderAnimVar / activeOverlayAnimVar"
          note="Pointer down. Press and hold each button."
        >
          <Row label="press and hold">
            <Button variant="danger">
              press me
              <Overlay
                staticBorderAnimVar="pulse"
                staticBorderAnimVarModify={{ speed: 0.5 }}
                hoverBorderAnimVar="corner-grid"
                activeBorderAnimVar="triangle-lock"
                activeOverlayAnimVar="ripple"
                activeOverlayAnimVarModify={{ auto: false, count: 4 }}
              />
            </Button>
            <Button variant="info">
              hover + press
              <Overlay
                staticBorderAnimVar="snake"
                hoverBorderAnimVar="snake"
                hoverBorderAnimVarModify={{ count: 4, thickness: 3, speed: 2 }}
                hoverOverlayAnimVar="grid-track"
                activeOverlayAnimVar="glitch"
                activeOverlayAnimVarModify={{ rate: 1 }}
              />
            </Button>
          </Row>
        </Section>

        <Section
          id="layered"
          title="Layering"
          note="All six props compose. Two border effects or two inner effects on the same element share a stacking context and are warned about."
        >
          <Row label="six props at once">
            <Button variant="warning" size="lg">
              everything
              <Overlay
                staticBorderAnimVar="glow"
                staticBorderAnimVarModify={{ rayLength: 22, color: '#fbbf24' }}
                staticOverlayAnimVar="halftone"
                staticOverlayAnimVarModify={{ grid: 12, color: '#fbbf24' }}
                hoverBorderAnimVar="corner-grid"
                hoverBorderAnimVarModify={{ variant: 'ring' }}
                hoverOverlayAnimVar="nodes"
                hoverOverlayAnimVarModify={{ follow: true, pull: 0.5 }}
                activeBorderAnimVar="pulse"
                activeBorderAnimVarModify={{ mode: 'full' }}
                activeOverlayAnimVar="ripple"
                activeOverlayAnimVarModify={{ auto: false }}
              />
            </Button>
          </Row>
        </Section>

        <Section id="recipe" title="Recipes" note="Copy-paste starting points.">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-neutral-500">Danger button that glows and cracks on hover</p>
              <Code>{`<Button variant="danger">
  <Overlay
    staticBorderAnimVar="glow"
    staticBorderAnimVarModify={{ color: '#f87171', intensity: 0.7 }}
    hoverOverlayAnimVar="hyper-triangle-crack"
    activeOverlayAnimVar="ripple"
  />
  Delete
</Button>`}</Code>
            </div>
            <div>
              <p className="mb-2 text-xs text-neutral-500">Success button with a data-mesh interior</p>
              <Code>{`<Button variant="success">
  <Overlay
    staticBorderAnimVar="snake"
    staticBorderAnimVarModify={{ count: 2, thickness: 3 }}
    staticOverlayAnimVar="hyper-triangles"
    staticOverlayAnimVarModify={{ count: 22, fill: true, opacity: 0.5 }}
  />
  Save
</Button>`}</Code>
            </div>
            <div>
              <p className="mb-2 text-xs text-neutral-500">Interactive playground — click to cycle each layer</p>
              <div className="flex items-center gap-3">
                {['border', 'inner', 'hover', 'active'].map((k) => (
                  <select
                    key={k}
                    value={combo[k]}
                    onChange={(e) => setCombo((c) => ({ ...c, [k]: e.target.value }))}
                    className="border border-neutral-700 bg-neutral-900 px-2 py-1 font-mono text-xs text-neutral-200"
                  >
                    {names.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
              <div className="mt-3">
                <Button variant="primary" size="lg">
                  {combo.border} / {combo.inner}
                  <Overlay
                    staticBorderAnimVar={combo.border}
                    staticOverlayAnimVar={combo.inner}
                    hoverOverlayAnimVar={combo.hover}
                    activeOverlayAnimVar={combo.active}
                  />
                </Button>
              </div>
            </div>
          </div>
        </Section>

        <Section id="api" title="Props" note="Button accepts native button attributes; Overlay takes the six effect props.">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="text-neutral-500">
                <tr className="border-b border-neutral-800">
                  <th className="py-2 pr-4 font-normal">prop</th>
                  <th className="py-2 pr-4 font-normal">type</th>
                  <th className="py-2 font-normal">notes</th>
                </tr>
              </thead>
              <tbody className="font-mono text-neutral-300">
                {[
                  ['variant', `'${BUTTON_VARIANTS.join("' | '")}'`, "'primary'"],
                  ['size', `'${BUTTON_SIZES.join("' | '")}'`, "'md'"],
                  ['radius', 'number', '0 — sharp corners by design'],
                  ['loading', 'boolean', 'spinner + disables'],
                  ['disabled', 'boolean', ''],
                  ['fullWidth', 'boolean', ''],
                  ['staticBorderAnimVar', 'string', 'idle, outline layer'],
                  ['staticOverlayAnimVar', 'string', 'idle, inner layer'],
                  ['hoverBorderAnimVar', 'string', 'cursor over, outline layer'],
                  ['hoverOverlayAnimVar', 'string', 'cursor over, inner layer'],
                  ['activeBorderAnimVar', 'string', 'pointer down, outline layer'],
                  ['activeOverlayAnimVar', 'string', 'pointer down, inner layer'],
                  ['*Modify', 'object', 'parameters for the matching effect'],
                  ['borderOverflow', 'number', '40 — px of bleed room for border effects'],
                  ['followPointer', 'boolean', 'true — effects receive the cursor position'],
                ].map(([p, t, n]) => (
                  <tr key={p} className="border-b border-neutral-900">
                    <td className="py-2 pr-4">{p}</td>
                    <td className="py-2 pr-4 text-neutral-500">{t}</td>
                    <td className="py-2 font-sans text-neutral-500">{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="cards" title="Hosts other than Button" note="Card provides the same context, so effects inherit its radius.">
          <Row label="Card">
            <Card>
              <Overlay
                staticBorderAnimVar="glow"
                staticOverlayAnimVar="sparkle"
                staticOverlayAnimVarModify={{ count: 10 }}
              />
              <div className="relative z-10 space-y-2">
                <h3 className="text-lg font-bold">Card</h3>
                <p className="text-sm text-neutral-400">Glow outline, sparkle interior</p>
              </div>
            </Card>
          </Row>
        </Section>
      </div>
    </main>
  )
}
