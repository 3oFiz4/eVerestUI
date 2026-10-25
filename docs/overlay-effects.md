# Overlay effect reference

Every effect is a class extending `AnimationBase`. Pass its name to one of the six
`*-anim-var` props and its parameters through the matching `*-Modify` object:

```jsx
<Overlay
  staticBorderAnimVar="snake"
  staticBorderAnimVarModify={{ thickness: 3, count: 2 }}
  hoverOverlayAnimVar="grid-track"
  hoverOverlayAnimVarModify={{ shape: 'circle' }}
/>
```

Common to all effects: `fade` (seconds to cross-fade when the state becomes
active or inactive; default `0.25`).

An unknown name logs a warning and renders nothing, rather than throwing.

## Outline effects

These set `staticBorderAnimVar`, `hoverBorderAnimVar` or `activeBorderAnimVar`. They draw on the button edge and may extend outside it — each is given `borderOverflow` px of room (default 40).

### `snake`

**Where** outline layer · **States** `static*`, `hover*`, `active*` · **Renders on** SVG — transforms and dash offsets only

Parameters (all optional, shown with defaults):

- `gap`: number = 2
- `thickness`: number = 2
- `radius`: number = 0
- `count`: number = 1
- `tail`: number = 0.14
- `speed`: number = 1
- `direction`: number = 1
- `color`: string = "#7dd3fc"
- `headColor`: string = "#ffffff"
- `midStop`: number = 0.7
- `glow`: number = 4

### `snake-fill`

**Where** outline layer · **States** `static*`, `hover*`, `active*` · **Renders on** SVG — transforms and dash offsets only

Parameters (all optional, shown with defaults):

- `gap`: number = 2
- `thickness`: number = 2
- `radius`: number = 0
- `color`: string = "#a5b4fc"
- `start`: number = 0
- `hold`: number = 0.25
- `speed`: number = 0.6
- `glow`: number = 4

### `glow`

**Where** outline layer · **States** `static*`, `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Parameters (all optional, shown with defaults):

- `gap`: number = 0
- `radius`: number = 0
- `color`: string = "#ffd66b"
- `intensity`: number = 0.55
- `rayCount`: number = 24
- `rayLength`: number = 26
- `rayWidth`: number = 0.5
- `spread`: number = 1
- `rotate`: number = 0.05
- `pulse`: number = 0.15
- `lengthJitter`: number = 0.25

### `pulse`

**Where** outline layer · **States** `static*`, `hover*`, `active*` · **Renders on** SVG — transforms and dash offsets only

Parameters (all optional, shown with defaults):

- `mode`: string = "hollow"
- `gap`: number = 0
- `radius`: number = 0
- `thickness`: number = 2
- `color`: string = "#ffffff"
- `from`: number = 1
- `to`: number = 1.12
- `peak`: number = 0.35
- `speed`: number = 0.8
- `count`: number = 1

### `corner-grid`

**Where** outline layer · **States** `static*`, `hover*`, `active*` · **Renders on** SVG — transforms and dash offsets only

Parameters (all optional, shown with defaults):

- `variant`: string = "square"
- `size`: number = 10
- `thickness`: number = 2
- `gap`: number = 0
- `radius`: number = 0
- `color`: string = "#e5e7eb"
- `speed`: number = 0.6
- `reach`: number = 1.18
- `dash`: string = "2 4"

### `triangle-lock`

**Where** outline layer · **States** `static*`, `hover*`, `active*` · **Renders on** SVG — transforms and dash offsets only

Parameters (all optional, shown with defaults):

- `size`: number = 14
- `gap`: number = 0
- `radius`: number = 0
- `color`: string = "#fca5a5"
- `opacity`: number = 0.85
- `speed`: number = 0.8
- `pulse`: number = 0.2
- `offset`: number = 0


## Interior effects

These set `staticOverlayAnimVar`, `hoverOverlayAnimVar` or `activeOverlayAnimVar`. They draw inside the silhouette and are clipped to it; effects that look better bleeding set `clip: false` and need `staticBorderAnimVar`-style room only if you move them to the border layer.

### `shine`

**Where** inner layer · **States** `static*`, `hover*`, `active*` · **Renders on** DOM — transform/opacity tweens

Parameters (all optional, shown with defaults):

- `color`: string = "#ffffff"
- `opacity`: number = 0.4
- `width`: number = 0.35
- `angle`: number = -12
- `blur`: number = 2
- `duration`: number = 2.2
- `repeatDelay`: number = 0.8
- `ease`: string = "power2.inOut"
- `speed`: number = 1
- `collapse`: number = 0.25

### `sparkle`

**Where** inner layer · **States** `static*`, `hover*`, `active*` · **Renders on** DOM — transform/opacity tweens

Parameters (all optional, shown with defaults):

- `color`: string = "#fde047"
- `glyph`: string = "✦"
- `count`: number = 6
- `size`: number = 18
- `minScale`: number = 0.6
- `maxScale`: number = 1.4
- `stagger`: number = 0.25
- `duration`: number = 1.1
- `intensity`: number = 1
- `spread`: number = 0.6
- `glow`: number = 6
- `speed`: number = 1

### `floating-glow`

**Where** inner layer · **States** `static*`, `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Parameters (all optional, shown with defaults):

- `mode`: string = "glow"
- `clip`: boolean = true
- `color`: string = "#60a5fa"
- `size`: number = 0.5
- `intensity`: number = 0.6
- `wanderSpeed`: number = 0.35
- `follow`: boolean = true
- `grid`: number = 16
- `dotScale`: number = 1.6
- `lineWidth`: number = 1
- `radius`: number = 0

### `ripple`

**Where** inner layer · **States** `static*`, `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Parameters (all optional, shown with defaults):

- `color`: string = "#93c5fd"
- `count`: number = 3
- `duration`: number = 2.2
- `thickness`: number = 1.5
- `maxScale`: number = 1.6
- `intensity`: number = 0.6
- `auto`: boolean = true
- `follow`: boolean = true
- `stagger`: number = 0.4

### `glitch`

**Where** inner layer · **States** `static*`, `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Parameters (all optional, shown with defaults):

- `color`: string = "#f87171"
- `rate`: number = 0.35
- `burstsPerSecond`: number = 3
- `slices`: number = 8
- `shift`: number = 12
- `blocks`: number = 6
- `blockMin`: number = 8
- `blockMax`: number = 40
- `intensity`: number = 0.5
- `scanlines`: boolean = true
- `scanGap`: number = 3
- `scanOpacity`: number = 0.25
- `life`: number = 0.18

### `floating-lines`

**Where** inner layer · **States** `static*`, `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Parameters (all optional, shown with defaults):

- `color`: string = "#a78bfa"
- `count`: number = 14
- `speed`: number = 40
- `speedVariance`: number = 0.8
- `thickness`: number = 1
- `opacity`: number = 0.6
- `opacityVariance`: number = 0.5
- `angle`: number = 0
- `widthScale`: number = 1

### `nodes`

**Where** inner layer · **States** `static*`, `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Parameters (all optional, shown with defaults):

- `color`: string = "#34d399"
- `count`: number = 18
- `linkDistance`: number = 70
- `speed`: number = 12
- `nodeRadius`: number = 1.5
- `linkWidth`: number = 1
- `opacity`: number = 0.7
- `follow`: boolean = true
- `pull`: number = 0.35

### `hyper-triangles`

**Where** inner layer · **States** `static*`, `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Parameters (all optional, shown with defaults):

- `color`: string = "#f472b6"
- `count`: number = 16
- `linkDistance`: number = 90
- `speed`: number = 10
- `linkWidth`: number = 1
- `fill`: boolean = true
- `fillMin`: number = 0.04
- `fillMax`: number = 0.3
- `minArea`: number = 220
- `opacity`: number = 0.6
- `follow`: boolean = true
- `pull`: number = 0.3
- `linksOnly`: boolean = false


## Cursor-driven effects

These only answer to the hover and active props — at rest there is no cursor to respond to. They receive the pointer position in button-box pixels.

### `grid-track`

**Where** inner layer · **States** `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Parameters (all optional, shown with defaults):

- `color`: string = "#e5e7eb"
- `opacity`: number = 0.5
- `cell`: number = 24
- `shape`: string = "square"
- `tileScale`: number = 1
- `radius`: number = 2
- `grid`: boolean = true
- `gridOpacity`: number = 0.5
- `lineWidth`: number = 1
- `ease`: number = 0.18

### `hyper-triangle-crack`

**Where** inner layer · **States** `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Parameters (all optional, shown with defaults):

- `color`: string = "#f472b6"
- `branches`: number = 7
- `reach`: number = 0.6
- `speed`: number = 1
- `thickness`: number = 1.2
- `opacity`: number = 0.8
- `wobble`: number = 0.35
- `segments`: number = 6
- `follow`: boolean = true
- `ease`: number = 0.18

### `outer-grid`

**Where** inner layer · **States** `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Parameters (all optional, shown with defaults):

- `color`: string = "#94a3b8"
- `opacity`: number = 0.25
- `cell`: number = 28
- `boost`: number = 0.2
- `inner`: number = 0.15
- `spread`: number = 0.5
- `lineWidth`: number = 1


## Aliases

| Name | Resolves to |
| ---- | ----------- |
| `snake-ring` | snake |
| `double-snake` | snake (count: 2) |
| `triple-snake` | snake (count: 3) |
| `snake-fill` | snake-fill |
| `halftone` | floating-glow (mode: "halftone") |
| `dots` | floating-glow (mode: "halftone") |
| `line-matrix` | floating-glow (mode: "lines") |
| `lines` | floating-lines |
| `triangles` | hyper-triangles |
| `crack` | hyper-triangle-crack |
| `corners` | corner-grid |

Setting any effect prop to `null`, `undefined`, `""`, `false` or `"none"` removes
that layer.

## State interactions

Effects that read the cursor behave differently while hovered:

- **shine** collapses closed on hover and pauses, then restarts when the pointer
  leaves, rather than resuming mid-sweep.
- **floating-glow**, **nodes**, **hyper-triangles** switch their attractor from a
  wandering path to the cursor (set `follow: false` to keep the drift).
- **ripple** moves its origin to the cursor (set `follow: false` to keep it centred).
- **grid-track**, **hyper-triangle-crack** centre on the pointer by definition.
- **sparkle**, **glitch**, **floating-lines** ignore hover and run continuously.

## Choosing a host

Each effect declares how it is drawn, and the engine provisions only that:

- **DOM** (`shine`, `sparkle`) — GSAP tweens `xPercent`/`scale`/`opacity`.
  Cheapest per frame; no rasterisation.
- **SVG** (`snake`, `pulse`, `snake-fill`, `corner-grid`, `triangle-lock`) —
  geometry and dash offsets, so shapes stay crisp at any size.
- **canvas** (everything else) — one bitmap per layer, cleared and repainted each
  frame. Used where per-pixel composition is required: additive blending, gradient
  schedules, dot matrices, node meshes.

## Performance notes

- One `ResizeObserver` and one pointer listener per layer, regardless of how many
  effects are mounted.
- One `gsap.context()` per effect instance; unmounting reverts every tween and
  ticker it created.
- Time-based effects are frame-rate independent (`gsap.ticker.deltaRatio`), so
  motion matches at 30 and 144 Hz.
- A canvas effect only paints while its own state is the live one; idle effects
  cost nothing beyond their mount.
- Raising `count`, `grid` density or `linkDistance` scales work linearly or
  quadratically (the mesh effects are O(n²) in node count).
