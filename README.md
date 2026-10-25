# eVerestUI

> A UI library for people who hate modern UI components and prefer simplicity.

React 19 + GSAP 3 + TailwindCSS v4. Every component ships a stateful animation
overlay (`static` / `hover` / `active`) instead of hardcoded CSS transitions.

## Getting started

```bash
npm install
npm run dev      # dev server
npm run build    # production build
npm run lint     # oxlint
```

## Components

| Component | Notes |
| --------- | ----- |
| `Button`  | Sharp-cornered (`0px` radius) button. Variants: `primary`, `neutral`, `success`, `caution`, `warning`, `danger`, `info`, `ghost`. Sizes `sm`/`md`/`lg`. |
| `Card`    | Container that hosts an `Overlay`. |
| `Overlay` | Stateful GSAP animation layer. See below. |

Live documentation page: run `npm run dev` and open the dev server.

## Overlay

Six props drive the state machine. Each effect prop takes an effect name; each
`-Modify` prop takes that effect's parameters.

```jsx
import { Button, Overlay } from './components'

<Button variant="danger">
  <Overlay
    staticBorderAnimVar="snake"
    staticBorderAnimVarModify={{ gap: 3, thickness: 3, count: 2, speed: 2 }}
    staticOverlayAnimVar="sparkle"
    staticOverlayAnimVarModify={{ color: '#fde047', count: 12 }}
    hoverBorderAnimVar="snake-fill"
    hoverOverlayAnimVar="grid-track"
    activeBorderAnimVar="pulse"
    activeOverlayAnimVar="ripple"
  />
  <span>Delete</span>
</Button>
```

| Prop | Fires when | Layer |
| ---- | ---------- | ----- |
| `staticBorderAnimVar` / `-Modify` | Idle | button edge |
| `staticOverlayAnimVar` / `-Modify` | Idle | inside the button |
| `hoverBorderAnimVar` / `-Modify` | cursor over component | button edge |
| `hoverOverlayAnimVar` / `-Modify` | cursor over component | inside the button |
| `activeBorderAnimVar` / `-Modify` | pointer down | button edge |
| `activeOverlayAnimVar` / `-Modify` | pointer down | inside the button |

All effect names and their parameters: [`docs/overlay-effects.md`](docs/overlay-effects.md).

## Animation architecture

Every effect is a class extending `AnimationBase` (`mount`, `resize`, `setActive`,
`setPointer`, `destroy`). Each class declares how it is drawn — `dom`, `svg` or
`canvas` — and the engine provisions only that, so a text-only effect never
allocates a bitmap. The base owns one `gsap.context()` per instance, so a single
`revert()` on unmount kills every tween and ticker it created, and each effect
only paints while its own state is the live one.

```jsx
// Geometry and accent come from the host, so this needs no radius or colour.
<Button variant="danger" radius={0}>
  <Overlay staticBorderAnimVar="glow" hoverOverlayAnimVar="hyper-triangle-crack" />
  Delete
</Button>
```

## License

MIT © 3ofiz4
