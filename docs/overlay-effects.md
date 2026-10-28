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

**Where** outline layer · **States** `static*`, `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Rotating conic gradient beam travelling continuously along the border without seam interruption, wrap delay, or stopping.

Parameters (all optional, shown with defaults):

- `gap`: number = 0
- `thickness`: number = 2
- `radius`: number = 0
- `count`: number = 1
- `tail`: number = 0.22
- `speed`: number = 0.8
- `direction`: number = 1
- `color`: string = "#7dd3fc"
- `headColor`: string = "#ffffff"
- `glow`: number = 4

### `snake-fill`

**Where** outline layer · **States** `static*`, `hover*`, `active*` · **Renders on** SVG — transforms and dash offsets only

Parameters (all optional, shown with defaults):

- `gap`: number = 2
- `thickness`: number = 2
- `radius`: number = 0
- `color`: string = "#ffffff"
- `start`: number = 0
- `speed`: number = 1
- `glow`: number = 4

### `glow`

**Where** outline layer · **States** `static*`, `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Luminous backlight glow with internal drifting clouds casting natural, smooth shades outward across the surrounding light. Hardware-accelerated Gaussian blur.

Parameters (all optional, shown with defaults):

- `gap`: number = 0
- `radius`: number = 0
- `color`: string = "#ffffff"
- `glowSize`: number = 15
- `opacity`: number = 0.88
- `intensity`: number = 0.88
- `cloudCount`: number = 3
- `cloudSize`: number = 18
- `shadeStrength`: number = 0.85
- `pulse`: number = 0.15
- `speed`: number = 0.5

### `pulse`

**Where** outline layer · **States** `static*`, `hover*`, `active*` · **Renders on** SVG — transforms and dash offsets only

Two distinct pulse modes:
- `mode: "hollow"` (default): pulses only the button outline ring, expanding outward and fading to transparent.
- `mode: "full"` (fill pulse): pulses a replica of the full button surface (fill + border) placed behind the button, enlarging to `to` scale until becoming transparent on click or loop.

Aliases: `pulse-hollow` and `pulse-fill`.

Parameters (all optional, shown with defaults):

- `mode`: string = "hollow"
- `gap`: number = 0
- `radius`: number = 0
- `thickness`: number = 1.5
- `color`: string = "#ffffff"
- `fillColor`: undefined = undefined
- `from`: number = 1
- `to`: number = 1.25
- `peak`: number = 0.8
- `speed`: number = 0.8
- `count`: number = 1

### `corner-grid`

**Where** outline layer · **States** `static*`, `hover*`, `active*` · **Renders on** SVG — transforms and dash offsets only

Four corner L-brackets that animate stroke-dashoffset into position with a staggered sequence on hover.

Parameters (all optional, shown with defaults):

- `arm`: number = 14
- `thickness`: number = 2
- `gap`: number = 0
- `radius`: number = 0
- `color`: string = "#ffffff"
- `bgFill`: string = "rgba(255, 255, 255, 0.1)"
- `speed`: number = 1

### `triangle-lock`

**Where** outline layer · **States** `static*`, `hover*`, `active*` · **Renders on** SVG — transforms and dash offsets only

Four right triangles positioned at the corners that emerge straight out of each corner on hover.

Parameters (all optional, shown with defaults):

- `size`: number = 10
- `gap`: number = 0
- `radius`: number = 0
- `color`: string = "#ffffff"
- `opacity`: number = 0.9
- `speed`: number = 0.8


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
- `size`: number = 16
- `duration`: number = 0.65
- `delay`: number = 0.35
- `intensity`: number = 1
- `spread`: number = 0.75
- `glow`: number = 6
- `speed`: number = 1

### `floating-glow`

**Where** inner layer · **States** `static*`, `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Attractor light that highlights the nearest section of the button ring in a gradient. Modes: glow, halftone (tiny micro-dots with configurable unattractedOpacity), lines (tiny grid).

Parameters (all optional, shown with defaults):

- `mode`: string = "glow"
- `clip`: boolean = true
- `color`: string = "#60a5fa"
- `size`: number = 1
- `intensity`: number = 0.6
- `wanderSpeed`: number = 0.35
- `follow`: boolean = true
- `grid`: number = 6
- `unattractedOpacity`: number = 0.08
- `dotScale`: number = 1
- `lineWidth`: number = 0.75
- `radius`: number = 0

### `ripple`

**Where** inner layer · **States** `static*`, `hover*`, `active*` · **Renders on** DOM — transform/opacity tweens

Shockwave ripple with central glowing core and expanding ring, spawning on click or idle (from ExperienceCard).

Parameters (all optional, shown with defaults):

- `color`: string = "#ffffff"
- `maxActive`: number = 5
- `auto`: boolean = true
- `idleDelay`: number = 4.5

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
- `scanlines`: boolean = false
- `scanGap`: number = 3
- `scanOpacity`: number = 0
- `life`: number = 0.18

### `floating-lines`

**Where** inner layer · **States** `static*`, `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Infinite-height vertical rods (1px) representing a rotating 3D cylinder cage moving over the x-axis with front/back depth shading.

Parameters (all optional, shown with defaults):

- `color`: string = "#ffffff"
- `count`: number = 10
- `speed`: number = 28
- `rotSpeed`: number = 0.8
- `cylinderRadius`: number = 36
- `thickness`: number = 1
- `opacity`: number = 0.7
- `clip`: boolean = true
- `radius`: number = 0

### `nodes`

**Where** inner layer · **States** `static*`, `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Drifting points with proximity links. Nodes can move outside the button boundary and spring back naturally.

Parameters (all optional, shown with defaults):

- `color`: string = "#34d399"
- `count`: number = 7
- `linkDistance`: number = 80
- `speed`: number = 14
- `nodeRadius`: number = 1.5
- `linkWidth`: number = 1
- `opacity`: number = 0.7
- `follow`: boolean = true
- `pull`: number = 0.35

### `hyper-triangles`

**Where** inner layer · **States** `static*`, `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Full-coverage moving triangular tessellation covering 100% of the overlay silhouette without null area. Non-overlapping triangles with random opacity strictly between 10% and 30%.

Parameters (all optional, shown with defaults):

- `color`: string = "#f472b6"
- `count`: number = 16
- `columns`: number = 4
- `speed`: number = 0.8
- `linkWidth`: number = 1
- `fillMin`: number = 0.1
- `fillMax`: number = 0.3
- `opacity`: number = 0.8
- `follow`: boolean = true
- `pull`: number = 0.25
- `clip`: boolean = true
- `radius`: number = 0

### `outer-grid`

**Where** inner layer · **States** `static*`, `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Parameters (all optional, shown with defaults):

- `color`: string = "#ffffff"
- `opacity`: number = 0.45
- `cell`: number = 20
- `arm`: number = 6
- `radius`: number = 0
- `reach`: number = 0.85


## Cursor-driven effects

These only answer to the hover and active props — at rest there is no cursor to respond to. They receive the pointer position in button-box pixels.

### `slide`

**Where** inner layer · **States** `hover*` · **Renders on** DOM — transform/opacity tweens

Hover-only mask panel: edges wipe in from their side and corners expand from their corner point via `clip-path`, revealing stationary contrasting `label` text (default: the host's own text) inside the mask without fading text transparency.

Parameters (all optional, shown with defaults):

- `from`: string = "bottom"
- `color`: string = "#ffffff"
- `label`: any = null
- `textColor`: any = null
- `duration`: number = 0.35
- `ease`: string = "power2.inOut"

### `grid-track`

**Where** inner layer · **States** `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Lattice grid and crosshair lines with smooth follower and dedicated cursor marker.

Parameters (all optional, shown with defaults):

- `color`: string = "#e5e7eb"
- `opacity`: number = 0.5
- `cell`: number = 20
- `shape`: string = "circle"
- `tileScale`: number = 1
- `radius`: number = 2
- `snap`: boolean = false
- `grid`: boolean = true
- `gridOpacity`: number = 0.35
- `cursorMarker`: boolean = true
- `cursorShape`: string = "circle"
- `cursorSize`: number = 4
- `lineWidth`: number = 1
- `ease`: number = 0.22

### `hyper-triangle-crack`

**Where** inner layer · **States** `hover*`, `active*` · **Renders on** canvas — rasterised per frame

Active/click effect: crystalline hyper-triangles branching along the length of crack fissures, focused at the click cursor.

Parameters (all optional, shown with defaults):

- `color`: string = "#f472b6"
- `branches`: number = 6
- `reach`: number = 110
- `duration`: number = 1.15
- `thickness`: number = 1
- `opacity`: number = 0.85

### `grid-ripple`

**Where** inner layer · **States** `active*`, `hover*` · **Renders on** canvas — rasterised per frame

Active/click raster shockwave: expanding gridded circle of tiny squares along the circumference, fading to 100% transparent and deleting itself. Configurable color.

Parameters (all optional, shown with defaults):

- `color`: string = "#ffffff"
- `squareSize`: number = 6
- `speed`: number = 1
- `duration`: number = 1.15
- `maxScale`: number = 1.3
- `opacity`: number = 0.85
- `gap`: number = 0
- `clip`: boolean = true
- `radius`: number = 0


## Aliases

| Name | Resolves to |
| ---- | ----------- |
| `snake-ring` | snake |
| `double-snake` | snake (count: 2) |
| `triple-snake` | snake (count: 3) |
| `snake-fill` | snake-fill |
| `pulse-fill` | pulse (mode: "full") |
| `pulse-hollow` | pulse (mode: "hollow") |
| `halftone` | floating-glow (mode: "halftone") |
| `dots` | floating-glow (mode: "halftone") |
| `line-matrix` | floating-glow (mode: "lines") |
| `lines` | floating-lines |
| `triangles` | hyper-triangles |
| `crack` | hyper-triangle-crack |
| `raster-ripple` | grid-ripple |
| `pixel-ripple` | grid-ripple |
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
- **slide** is hover-only: it is ignored under `static*` and `active*`.
- **sparkle**, **glitch**, **floating-lines** ignore hover and run continuously.

## Choosing a host

Each effect declares how it is drawn, and the engine provisions only that:

- **DOM** (`shine`, `slide`, `sparkle`) — GSAP tweens `xPercent`/`scale`/`opacity`.
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
