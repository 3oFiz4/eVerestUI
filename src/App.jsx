import { useState } from "react";
import {
  LuArrowRight,
  LuDownload,
  LuGitFork,
  LuPlus,
  LuSettings,
  LuTrash2,
} from "react-icons/lu";
import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  Card,
  Input,
  Overlay,
  Sidebar,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  BUTTON_GROUP_ORIENTATIONS,
  BUTTON_GROUP_VARIANTS,
  INPUT_SIZES,
  INPUT_VARIANTS,
} from "./components";

/* ------------------------------------------------------------------ layout */

function Section({ id, title, note, children }) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-white/20 pt-8">
      <h2 className="text-base font-bold tracking-tight text-white">{title}</h2>
      {note && <p className="mt-1 max-w-2xl text-sm text-white/60">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Row({ label, title, children }) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-white/10 py-8 last:border-0">
      <span
        className="w-48 shrink-0 font-mono text-xs text-white/60"
        title={title}
      >
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function Code({ children }) {
  return (
    <pre className="overflow-x-auto border border-white/20 bg-black p-3 font-mono text-xs text-white/90">
      {children}
    </pre>
  );
}

/* ------------------------------------------------------------------- demos */

const VARIANTS = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "subtle",
  "dashed",
  "double",
  "success",
  "caution",
  "warning",
  "danger",
  "info",
];
const SIZES = ["xs", "sm", "default", "lg", "xl"];

/** Every border-layer effect, one per Button variant. */
const BORDER_EFFECTS = [
  ["snake", { thickness: 2, tail: 0.22, speed: 0.8 }],
  ["double-snake", { thickness: 2 }],
  ["triple-snake", { thickness: 2 }],
  ["glow", { glowSize: 28, intensity: 0.8 }],
  ["pulse-hollow", { to: 1.25 }],
  ["pulse-fill", { to: 1.25 }],
  ["corner-grid", { arm: 14 }],
  ["triangle-lock", { size: 10 }],
  ["snake-fill", { speed: 1 }],
];

/** Every inner-layer effect. */
const INNER_EFFECTS = [
  ["shine", { speed: 1.1, blur: 2 }],
  ["sparkle", { size: 16 }],
  ["floating-glow", { mode: "glow", clip: true }],
  ["halftone", { grid: 6, unattractedOpacity: 0.08, clip: true }],
  ["line-matrix", { grid: 6, clip: true }],
  ["ripple", { auto: true }],
  ["glitch", { burstsPerSecond: 5 }],
  ["floating-lines", { count: 10, speed: 28 }],
  ["nodes", { count: 7, linkDistance: 80 }],
  ["hyper-triangles", { count: 2 }],
];

/** Cursor-driven effects. */
const HOVER_EFFECTS = [
  [
    "grid-track",
    { shape: "square", cell: 20, cursorMarker: true },
    "square tile + crosshair",
  ],
  [
    "grid-track",
    { shape: "circle", cell: 20, grid: true, cursorMarker: true },
    "smooth circle tile + cursor dot",
  ],
  ["outer-grid", { boost: 0.2 }, "surrounding grid 20% lighter"],
];

const EFFECT_NAMES = [
  ...BORDER_EFFECTS.map(([n]) => n),
  ...INNER_EFFECTS.map(([n]) => n),
  ...HOVER_EFFECTS.map(([n]) => n),
];

/* --------------------------------------------------------------------- app */

export default function App() {
  const [activeComponent, setActiveComponent] = useState(() => {
    if (typeof window === "undefined") return "Button";
    const h = window.location.hash.toLowerCase();
    if (h === "#overlay") return "Overlay";
    if (h === "#button-group") return "Button Group";
    if (h === "#input") return "Input";
    return "Button";
  });
  const [combo, setCombo] = useState({
    border: "snake",
    inner: "halftone",
    hover: "grid-track",
    active: "ripple",
  });

  // Read the live effect list straight off the registry so the docs cannot drift.
  const names = [...new Set(EFFECT_NAMES)];

  const handleSelectComponent = (item) => {
    setActiveComponent(item);
    window.history.replaceState(
      null,
      "",
      `#${item.toLowerCase().replace(/\s+/g, "-")}`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen w-full bg-black px-6 py-10 text-white font-montserrat">
      <div className="mx-auto flex max-w-6xl gap-10">
        <Sidebar active={activeComponent} onSelect={handleSelectComponent} />
        <div className="min-w-0 flex-1 space-y-10">
          {activeComponent === "Button" ? (
            <>
              <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Button
                </h1>
                <p className="max-w-3xl text-sm text-white/70 leading-relaxed">
                  Monochrome professional button component built on a strict
                  black ground, crisp 1px border, and high-contrast typography.
                  Every button ships with a variant- and custom-color-aware
                  ripple animation by default.
                </p>
              </header>

              <Section
                id="psychology"
                title="Design & Psychological Foundations"
                note="Meaning behind the professional white-black monochrome aesthetic, ergonomics, and micro-interactions."
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs leading-relaxed text-white/80">
                  <div className="border border-white/20 bg-black p-4 space-y-2">
                    <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
                      1. Color Authority & Contrast
                    </h3>
                    <p>
                      The pure black base (
                      <code className="text-white">#000000</code>) with thin 1px
                      white border (<code className="text-white">#ffffff</code>)
                      simply eliminates the chromatic cognitive load. In many
                      technical developer tools, color is only reserved for
                      deliberate status warnings (success, caution, danger,
                      info), they only act as semantic signals.
                    </p>
                  </div>
                  <div className="border border-white/20 bg-black p-4 space-y-2">
                    <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
                      2. Wideness, Height & Fitts's Law
                    </h3>
                    <p>
                      Proportions are anchored to fixed vertical standards (28px
                      toolbar, 36px standard, 40px prominent, 48px hero).
                      Horizontal padding is tuned to ~0.4–0.5x height with 6–8px
                      gaps, making click targets unmistakable
                    </p>
                  </div>
                  <div className="border border-white/20 bg-black p-4 space-y-2">
                    <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
                      3. Micro-Interaction Kinetics
                    </h3>
                    <p>
                      Interactive states provide instant mechanical tactile
                      response: hover applies a subtle 10% white luminance lift
                      (<code className="text-white">hover:bg-white/10</code>),
                      press applies 20% lift plus a 1px physical micro-switch
                      depression (
                      <code className="text-white">active:translate-y-px</code>
                      ), and focus features an accessible high-contrast ring.
                    </p>
                  </div>
                  <div className="border border-white/20 bg-black p-4 space-y-2">
                    <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
                      4. Typography & Halation Control
                    </h3>
                    <p>
                      Montserrat at weight 700 prevents a optical "halation"
                      smear common with pure white text on true black
                      OLED/retina displays, while preserving that crisp glyph
                      legibility even at dense 11px toolbar scales.
                    </p>
                  </div>
                </div>
              </Section>

              <Section
                id="variants"
                title="Button Styles & Variants"
                note="Every standard button adheres to the black background, white border, and white text pattern. Click any button to trigger its variant-colored ripple."
              >
                <Row label="todo2.md reference">
                  <button className="jetbrains-mono font-mono px-4 bg-black text-white border border-white h-10 hover:bg-white/10 active:bg-white/20 active:translate-y-px transition-all duration-150 inline-flex items-center justify-center font-medium">
                    Hello World! (h-10)
                  </button>
                  <button className="jetbrains-mono font-mono px-4 bg-black text-white border border-white h-7 text-xs hover:bg-white/10 active:bg-white/20 active:translate-y-px transition-all duration-150 inline-flex items-center justify-center font-medium">
                    Hello World! (h-7)
                  </button>
                  <button className="jetbrains-mono font-mono px-4 bg-green-500/30 text-white border-green-500 border h-7 text-xs hover:bg-green-500/60 active:bg-green-500/75 active:translate-y-px transition-all duration-150 inline-flex items-center justify-center font-medium">
                    Success! (h-7)
                  </button>
                </Row>
                <Row label="monochrome variants">
                  {[
                    "default",
                    "outline",
                    "secondary",
                    "ghost",
                    "link",
                    "subtle",
                    "dashed",
                    "double",
                  ].map((v) => (
                    <Button key={v} variant={v}>
                      {v}
                    </Button>
                  ))}
                </Row>
                <Row label="status variants">
                  {[
                    "destructive",
                    "success",
                    "caution",
                    "warning",
                    "info",
                  ].map((v) => (
                    <Button key={v} variant={v}>
                      {v}
                    </Button>
                  ))}
                </Row>
                <Row label="custom color + ripple">
                  <Button variant="outline" color="#a855f7">
                    purple (#a855f7)
                  </Button>
                  <Button
                    variant="outline"
                    style={{ color: "#ec4899", borderColor: "#ec4899" }}
                  >
                    pink (style)
                  </Button>
                  <Button
                    variant="outline"
                    className="text-cyan-400 border-cyan-400"
                  >
                    cyan (Tailwind class)
                  </Button>
                </Row>
                <Row label="link underline animation">
                  <Button variant="link">hover for animated underline</Button>
                  <Button variant="link">
                    view source
                    <LuArrowRight data-icon="inline-end" />
                  </Button>
                </Row>
                <Row label="icon size (size='icon')">
                  <Button size="icon" variant="outline" aria-label="Add item">
                    <LuPlus />
                  </Button>
                  <Button size="icon" variant="default" aria-label="Settings">
                    <LuSettings />
                  </Button>
                  <Button size="icon" variant="destructive" aria-label="Delete">
                    <LuTrash2 />
                  </Button>
                </Row>
                <Row label="button + text + icon">
                  <Button variant="outline">
                    <LuDownload data-icon="inline-start" />
                    Download
                  </Button>
                  <Button variant="default">
                    Fork
                    <LuGitFork data-icon="inline-end" />
                  </Button>
                  <Button
                    icon={<LuSettings />}
                    iconPosition="inline-start"
                    variant="secondary"
                  >
                    Preferences
                  </Button>
                  <Button variant="link">
                    Explore Documentation
                    <LuArrowRight data-icon="inline-end" />
                  </Button>
                </Row>
                <Row label="size hierarchy">
                  {SIZES.map((s) => (
                    <Button key={s} size={s}>
                      size {s}
                    </Button>
                  ))}
                </Row>
                <Row label="font-driven sizing">
                  <Button className="text-[10px]">10px (h-4)</Button>
                  <Button className="text-[11px]">11px (h-5)</Button>
                  <Button className="text-xs">12px (h-6 default)</Button>
                  <Button className="text-sm">14px (h-8)</Button>
                </Row>
                <Row label="state feedback">
                  <Button>default</Button>
                  <Button loading>loading</Button>
                  <Button disabled>disabled</Button>
                  <Button fullWidth className="max-w-48">
                    fullWidth
                  </Button>
                </Row>
                <Row label="corner radius">
                  <Button radius={0}>0 (default)</Button>
                  <Button radius={4}>4</Button>
                  <Button radius={999}>999 (pill)</Button>
                </Row>
              </Section>

              <Section
                id="examples"
                title="Button Examples & Mixing with Overlay"
                note="Button and Overlay compose directly: drop <Overlay /> inside any <Button> to layer border, interior, hover, or click animations while inheriting the button's variant color and corner radius."
              >
                <Row label="button + overlay mix">
                  <Button variant="outline">
                    Snake + Halftone
                    <Overlay
                      staticBorderAnimVar="snake"
                      staticBorderAnimVarModify={{ thickness: 2 }}
                      staticOverlayAnimVar="halftone"
                      staticOverlayAnimVarModify={{ grid: 6 }}
                    />
                  </Button>
                  <Button variant="outline">
                    Hover Slide Mask
                    <Overlay
                      hoverOverlayAnimVar="slide"
                      hoverOverlayAnimVarModify={{ from: "bottom" }}
                    />
                  </Button>
                  <Button variant="destructive">
                    Danger Glow + Crack
                    <Overlay
                      staticBorderAnimVar="glow"
                      hoverBorderAnimVar="corner-grid"
                      activeOverlayAnimVar="hyper-triangle-crack"
                    />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleSelectComponent("Overlay")}
                  >
                    Explore All Overlay Effects
                    <LuArrowRight data-icon="inline-end" />
                  </Button>
                </Row>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="mb-2 text-xs text-white/60">
                      Mixing Button with Overlay animations
                    </p>
                    <Code>{`<Button variant="outline">
  Snake + Halftone
  <Overlay
    staticBorderAnimVar="snake"
    staticOverlayAnimVar="halftone"
    hoverOverlayAnimVar="slide"
    hoverOverlayAnimVarModify={{ from: 'bottom' }}
  />
</Button>`}</Code>
                  </div>
                  <div>
                    <p className="mb-2 text-xs text-white/60">
                      Destructive button (red ripple by default) and custom
                      colored button
                    </p>
                    <Code>{`<Button variant="destructive">Delete</Button>
<Button variant="outline" color="#a855f7">Custom Purple</Button>`}</Code>
                  </div>
                </div>
              </Section>

              <Section
                id="api"
                title="Button Props"
                note="Button accepts all native button attributes plus the parameters below."
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="text-white/60">
                      <tr className="border-b border-white/20">
                        <th className="py-2 pr-4 font-normal">prop</th>
                        <th className="py-2 pr-4 font-normal">type</th>
                        <th className="py-2 font-normal">notes</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-white/90">
                      {[
                        [
                          "variant",
                          `'${BUTTON_VARIANTS.join("' | '")}'`,
                          "'default'",
                        ],
                        [
                          "size",
                          `'${BUTTON_SIZES.join("' | '")}'`,
                          "'default'",
                        ],
                        [
                          "fontSize",
                          "'xs' | 'sm' | 'base' | 'lg'",
                          "auto-scales button dimensions",
                        ],
                        ["radius", "number", "0 — sharp corners by default"],
                        [
                          "color",
                          "string",
                          "custom text/border color (also inherited by default ripple)",
                        ],
                        [
                          "ripple",
                          "boolean",
                          "true — enables default click ripple overlay",
                        ],
                        [
                          "icon",
                          "ReactNode",
                          "element injected with data-icon",
                        ],
                        [
                          "iconPosition",
                          "'inline-start' | 'inline-end'",
                          "'inline-start'",
                        ],
                        ["loading", "boolean", "spinner + disables"],
                        ["disabled", "boolean", ""],
                        ["fullWidth", "boolean", ""],
                      ].map(([p, t, n]) => (
                        <tr key={p} className="border-b border-white/10">
                          <td className="py-2 pr-4">{p}</td>
                          <td className="py-2 pr-4 text-white/60">{t}</td>
                          <td className="py-2 font-sans text-white/60">{n}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            </>
          ) : activeComponent === "Button Group" ? (
            <>
              <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Button Group
                </h1>
                <p className="max-w-3xl text-sm text-white/70 leading-relaxed">
                  {`Structural container that binds related `}
                  <code className="border border-white/30 bg-black px-1.5 py-0.5 text-xs text-white">
                    {"<Button />"}
                  </code>
                  {` controls, inputs, and sub-groups into a single unit. Supports both `}
                  <strong className="text-white">Monolithic Segment</strong>
                  {` (overlapping 1px borders via `}
                  <code className="text-white">-ml-px</code>
                  {` / `}
                  <code className="text-white">-mt-px</code>
                  {` with hover/focus z-index auto-elevation) and `}
                  <strong className="text-white">Recessed Chassis</strong>
                  {` (1px perimeter trench encapsulating flush micro-buttons).`}
                </p>
              </header>

              <Section
                id="chassis-architecture"
                title="Monolithic Segment vs. Recessed Chassis"
                note="Two architectural grouping modes tailored for bordered and borderless monochrome controls."
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs leading-relaxed text-white/80 mb-4">
                  <div className="border border-white/20 bg-black p-4 space-y-2">
                    <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
                      1. Monolithic Segment (variant=&quot;monolithic&quot;)
                    </h3>
                    <p>
                      Adjacent borders overlap seamlessly via{" "}
                      <code className="text-white">-ml-px</code> (horizontal) or{" "}
                      <code className="text-white">-mt-px</code> (vertical) so
                      shared dividers never double into 2px seams. Hovered and
                      focused children auto-elevate (
                      <code className="text-white">z-20</code>) so crisp 1px
                      borders and overlays are never truncated.
                    </p>
                  </div>
                  <div className="border border-white/20 bg-black p-4 space-y-2">
                    <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
                      2. Recessed Chassis (variant=&quot;recessed&quot;)
                    </h3>
                    <p>
                      A recessed 1px perimeter trench (
                      <code className="text-white">border-white/25 p-0.5</code>)
                      encapsulates flush-mounted micro buttons with
                      high-contrast active engagement — ideal for mode switchers
                      and segmented toolbars.
                    </p>
                  </div>
                  <div className="border border-white/20 bg-black p-4 space-y-2">
                    <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
                      3. Underline Anchor Track (variant=&quot;underline&quot;)
                    </h3>
                    <p>
                      A hover-driven 2px sliding rail along the baseline that
                      glides to the currently hovered button and fades out when
                      the pointer leaves — zero sticky active state.
                    </p>
                  </div>
                  <div className="border border-white/20 bg-black p-4 space-y-2">
                    <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
                      4. Expanding Context Lens (variant=&quot;lens&quot;)
                    </h3>
                    <p>
                      Hover-only focal accordion: buttons rest at compact icon
                      width (<code className="text-white">w-9</code>) and expand
                      to reveal their label (<code className="text-white">hover:w-28</code>)
                      with inverted white fill on hover.
                    </p>
                  </div>
                </div>

                <Row label="monolithic (default)">
                  <ButtonGroup variant="monolithic">
                    <Button variant="neutral"> Years </Button>
                    <Button variant="neutral"> Months </Button>
                    <Button variant="neutral"> Days </Button>
                    <Button variant="neutral"> Hours </Button>
                  </ButtonGroup>
                  <ButtonGroup variant="monolithic">
                    <Button variant="outline">Inspect</Button>
                    <Button variant="outline">Console</Button>
                    <Button variant="outline">Network</Button>
                  </ButtonGroup>
                </Row>

                <Row label="recessed chassis">
                  <ButtonGroup variant="recessed">
                    <Button variant="default">Live</Button>
                    <Button variant="ghost">Staging</Button>
                    <Button variant="ghost">Local</Button>
                  </ButtonGroup>
                  <ButtonGroup variant="recessed">
                    <Button variant="secondary">RAW</Button>
                    <ButtonGroupSeparator />
                    <Button variant="secondary">HEX</Button>
                    <ButtonGroupSeparator />
                    <Button variant="secondary">UTF-8</Button>
                  </ButtonGroup>
                </Row>

                <Row label="underline anchor (hover)">
                  <ButtonGroup variant="underline">
                    <Button size="lg">OVERVIEW</Button>
                    <Button size="lg">TELEMETRY</Button>
                    <Button size="lg">DEPLOYMENTS</Button>
                    <Button size="lg">LOGS</Button>
                  </ButtonGroup>
                </Row>

                <Row label="expanding lens (hover)">
                  <ButtonGroup variant="lens">
                    <Button size="lg">
                      <LuDownload data-icon="inline-start" />
                      <span>Pull</span>
                    </Button>
                    <Button size="lg">
                      <LuGitFork data-icon="inline-start" />
                      <span>Fork</span>
                    </Button>
                    <Button size="lg">
                      <LuSettings data-icon="inline-start" />
                      <span>Config</span>
                    </Button>
                    <Button size="lg">
                      <LuTrash2 data-icon="inline-start" />
                      <span>Purge</span>
                    </Button>
                  </ButtonGroup>
                </Row>
              </Section>

              <Section
                id="orientation"
                title="Orientation (horizontal & vertical)"
                note="Set orientation='horizontal' (default) or orientation='vertical'."
              >
                <Row label="horizontal">
                  <ButtonGroup orientation="horizontal">
                    <Button variant="outline">
                      <LuDownload data-icon="inline-start" />
                      Pull
                    </Button>
                    <Button variant="outline">
                      <LuGitFork data-icon="inline-start" />
                      Branch
                    </Button>
                    <Button variant="outline">
                      <LuSettings data-icon="inline-start" />
                      Config
                    </Button>
                  </ButtonGroup>
                </Row>

                <Row label="vertical (monolithic)">
                  <ButtonGroup orientation="vertical">
                    <Button variant="outline">Top Layer</Button>
                    <Button variant="outline">Middle Layer</Button>
                    <Button variant="outline">Bottom Layer</Button>
                  </ButtonGroup>
                  <ButtonGroup orientation="vertical" variant="recessed">
                    <Button variant="secondary">Node 01</Button>
                    <ButtonGroupSeparator />
                    <Button variant="secondary">Node 02</Button>
                    <ButtonGroupSeparator />
                    <Button variant="secondary">Node 03</Button>
                  </ButtonGroup>
                </Row>
              </Section>

              <Section
                id="separator"
                title="ButtonGroupSeparator"
                note="Separates borderless buttons (secondary, ghost, or inside a recessed chassis). Buttons with visible 1px borders already overlap via -ml-px so a separator is unnecessary there."
              >
                <Row label="ghost + separator">
                  <ButtonGroup className="border border-white/20">
                    <Button variant="ghost">Cut</Button>
                    <ButtonGroupSeparator />
                    <Button variant="ghost">Copy</Button>
                    <ButtonGroupSeparator />
                    <Button variant="ghost">Paste</Button>
                  </ButtonGroup>
                </Row>
                <Row label="split action button">
                  <ButtonGroup>
                    <Button variant="secondary" className="border border-white/20">
                      Deploy Production
                    </Button>
                    <ButtonGroupSeparator />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="border border-white/20"
                      aria-label="More deploy options"
                    >
                      <LuArrowRight />
                    </Button>
                  </ButtonGroup>
                </Row>
              </Section>

              <Section
                id="nested"
                title="Nested ButtonGroup"
                note="When a ButtonGroup contains child ButtonGroups, the parent automatically acts purely as a layout cluster with gap spacing between the sub-groups."
              >
                <Row label="horizontal nested">
                  <ButtonGroup>
                    <ButtonGroup>
                      <Button size="icon" variant="outline" aria-label="Add">
                        <LuPlus />
                      </Button>
                    </ButtonGroup>
                    <ButtonGroup>
                      <Button variant="outline">Archive</Button>
                      <Button variant="outline">Report</Button>
                      <Button variant="outline">Snooze</Button>
                    </ButtonGroup>
                    <ButtonGroup>
                      <Button
                        size="icon"
                        variant="destructive"
                        aria-label="Delete"
                      >
                        <LuTrash2 />
                      </Button>
                    </ButtonGroup>
                  </ButtonGroup>
                </Row>

                <Row label="vertical nested">
                  <ButtonGroup orientation="vertical">
                    <ButtonGroup>
                      <Button variant="outline">1</Button>
                      <Button variant="outline">2</Button>
                      <Button variant="outline">3</Button>
                    </ButtonGroup>
                    <ButtonGroup>
                      <Button variant="outline">4</Button>
                      <Button variant="outline">5</Button>
                      <Button variant="outline">6</Button>
                    </ButtonGroup>
                  </ButtonGroup>
                </Row>
              </Section>

              <Section
                id="composition"
                title="Inputs & Overlay Composition"
                note="ButtonGroup works seamlessly with native inputs, status variants, and Overlay effects (hover/focus auto-elevation keeps border effects crisp)."
              >
                <Row label="input + button">
                  <ButtonGroup>
                    <Input placeholder="git clone https://..." />
                    <Button variant="default">Clone</Button>
                  </ButtonGroup>
                </Row>

                <Row label="button group + overlay">
                  <ButtonGroup>
                    <Button variant="outline">
                      Snake
                      <Overlay staticBorderAnimVar="snake" />
                    </Button>
                    <Button variant="outline">
                      Slide Mask
                      <Overlay
                        hoverOverlayAnimVar="slide"
                        hoverOverlayAnimVarModify={{ from: "bottom" }}
                      />
                    </Button>
                    <Button variant="destructive">
                      Purge
                      <Overlay hoverBorderAnimVar="corner-grid" />
                    </Button>
                  </ButtonGroup>
                </Row>

                <div className="mt-4 space-y-4">
                  <Code>{`<ButtonGroup>
  <ButtonGroup>
    <Button variant="outline">Archive</Button>
    <Button variant="outline">Report</Button>
  </ButtonGroup>
  <ButtonGroup variant="recessed">
    <Button variant="ghost">RAW</Button>
    <ButtonGroupSeparator />
    <Button variant="ghost">HEX</Button>
  </ButtonGroup>
</ButtonGroup>`}</Code>
                </div>
              </Section>

              <Section
                id="api"
                title="ButtonGroup & ButtonGroupSeparator Props"
                note="Both components forward all standard div attributes."
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="text-white/60">
                      <tr className="border-b border-white/20">
                        <th className="py-2 pr-4 font-normal">prop</th>
                        <th className="py-2 pr-4 font-normal">type</th>
                        <th className="py-2 font-normal">notes</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-white/90">
                      {[
                        [
                          "orientation",
                          `'${BUTTON_GROUP_ORIENTATIONS.join("' | '")}'`,
                          "'horizontal' — stacks horizontally or vertically",
                        ],
                        [
                          "variant",
                          `'${BUTTON_GROUP_VARIANTS.join("' | '")}'`,
                          "'monolithic' (-ml-px overlap) or 'recessed' (1px perimeter chassis)",
                        ],
                        [
                          "ButtonGroupSeparator.orientation",
                          "'vertical' | 'horizontal'",
                          "auto-adapts to parent ButtonGroup orientation by default",
                        ],
                      ].map(([p, t, n]) => (
                        <tr key={p} className="border-b border-white/10">
                          <td className="py-2 pr-4">{p}</td>
                          <td className="py-2 pr-4 text-white/60">{t}</td>
                          <td className="py-2 font-sans text-white/60">{n}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            </>
          ) : activeComponent === "Input" ? (
            <>
              <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Input
                </h1>
                <p className="max-w-3xl text-sm text-white/70 leading-relaxed">
                  {`Monochrome text input sharing the exact vertical scale and typographic hierarchy as `}
                  <code className="border border-white/30 bg-black px-1.5 py-0.5 text-xs text-white">
                    {"<Button />"}
                  </code>
                  {`. Supports 12 focus variants.`}
                </p>
              </header>

              <Section
                id="variants"
                title="Input Styles & Variants"
                note="Click or focus into any input field to preview its focus state."
              >
                <Row label="simple (00)">
                  <Input variant="simple" placeholder="simple" />
                </Row>
                <Row label="floating-label (01)">
                  <Input
                    variant="floating-label"
                    label="Endpoint"
                    placeholder="https://everest.ui"
                  />
                </Row>
                <Row label="crosshair (02)">
                  <Input variant="crosshair" placeholder="crosshair" />
                </Row>
                <Row label="underline-beam (03)">
                  <Input
                    variant="underline-beam"
                    placeholder="underline-beam"
                  />
                </Row>
                <Row label="shutter (04)">
                  <Input variant="shutter" placeholder="shutter" />
                </Row>
                <Row label="ghost-notch (05)">
                  <Input variant="ghost-notch" placeholder="ghost-notch" />
                </Row>
                <Row label="perimeter-trace (06)">
                  <Input
                    variant="perimeter-trace"
                    placeholder="perimeter-trace"
                  />
                </Row>
                <Row label="scanline-sweep (07)">
                  <Input
                    variant="scanline-sweep"
                    placeholder="scanline-sweep"
                  />
                </Row>
                <Row label="pillar-clamp (08)">
                  <Input variant="pillar-clamp" placeholder="pillar-clamp" />
                </Row>
                <Row label="chamfer-lock (09)">
                  <Input variant="chamfer-lock" placeholder="chamfer-lock" />
                </Row>
                <Row label="sonar-pulse (10)">
                  <Input variant="sonar-pulse" placeholder="sonar-pulse" />
                </Row>
                <Row label="split-shutter (11)">
                  <Input variant="split-shutter" placeholder="split-shutter" />
                </Row>
              </Section>

              <Section
                id="sizing"
                title="Sizing & Hierarchy"
                note="Input shares the exact same height and font scale as Button (xs, s, sm, default/md, lg, xl)."
              >
                <Row label="size hierarchy">
                  {["xs", "s", "default", "lg", "xl"].map((s) => (
                    <Input key={s} size={s} placeholder={`size ${s}`} />
                  ))}
                </Row>
                <Row label="matched with Button">
                  {["xs", "s", "default", "lg", "xl"].map((s) => (
                    <ButtonGroup key={s}>
                      <Input
                        size={s}
                        placeholder={`size ${s}`}
                        containerClassName="w-28"
                      />
                      <Button size={s} variant="outline">
                        {s}
                      </Button>
                    </ButtonGroup>
                  ))}
                </Row>
                <Row label="font-driven sizing">
                  <Input className="text-[10px]" placeholder="10px (h-4)" />
                  <Input className="text-[11px]" placeholder="11px (h-5)" />
                  <Input className="text-xs" placeholder="12px (h-6 default)" />
                  <Input className="text-sm" placeholder="14px (h-8)" />
                </Row>
                <Row label="state & width">
                  <Input placeholder="default" />
                  <Input disabled placeholder="disabled" />
                  <Input
                    fullWidth
                    containerClassName="max-w-64"
                    placeholder="fullWidth"
                  />
                </Row>
                <Row label="corner radius">
                  <Input radius={0} placeholder="0 (default)" />
                  <Input radius={4} placeholder="4" />
                  <Input radius={999} placeholder="999 (pill)" />
                </Row>
              </Section>

              <Section
                id="examples"
                title="Input Examples"
                note="Standard Input usage across variants, sizes, and ButtonGroup composition."
              >
                <div className="space-y-4">
                  <Code>{`<Input variant="simple" placeholder="simple" />
<Input variant="floating-label" label="Endpoint" placeholder="https://..." />
<Input variant="crosshair" size="lg" placeholder="crosshair" />
<ButtonGroup>
  <Input size="default" placeholder="Search..." />
  <Button size="default">Submit</Button>
</ButtonGroup>`}</Code>
                </div>
              </Section>

              <Section
                id="api"
                title="Input Props"
                note="Input forwards all native HTML <input> attributes to the underlying input element."
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="text-white/60">
                      <tr className="border-b border-white/20">
                        <th className="py-2 pr-4 font-normal">prop</th>
                        <th className="py-2 pr-4 font-normal">type</th>
                        <th className="py-2 font-normal">notes</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-white/90">
                      {[
                        [
                          "variant",
                          `'${INPUT_VARIANTS.join("' | '")}'`,
                          "'simple'",
                        ],
                        [
                          "size",
                          `'${INPUT_SIZES.join("' | '")}'`,
                          "'default' — matches Button size scale",
                        ],
                        [
                          "fontSize",
                          "'xs' | 's' | 'sm' | 'md' | 'lg' | 'xl'",
                          "auto-scales input dimensions",
                        ],
                        ["radius", "number", "0 — sharp corners by default"],
                        [
                          "label",
                          "string",
                          "floating inset label text for variant='floating-label'",
                        ],
                        [
                          "placeholder",
                          "string",
                          "shown on focus for 'floating-label', or at rest for other variants",
                        ],
                        ["disabled", "boolean", ""],
                        ["fullWidth", "boolean", ""],
                      ].map(([p, t, n]) => (
                        <tr key={p} className="border-b border-white/10">
                          <td className="py-2 pr-4">{p}</td>
                          <td className="py-2 pr-4 text-white/60">{t}</td>
                          <td className="py-2 font-sans text-white/60">{n}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            </>
          ) : (
            <>
              <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Overlay
                </h1>
                <p className="max-w-3xl text-sm text-white/70 leading-relaxed">
                  {`Declarative animation host that layers canvas, SVG, and DOM effects behind and around any parent element — including `}
                  <code className="border border-white/30 bg-black px-1.5 py-0.5 text-xs text-white">
                    {"<Button />"}
                  </code>
                  {`, `}
                  <code className="border border-white/30 bg-black px-1.5 py-0.5 text-xs text-white">
                    {"<Card />"}
                  </code>
                  {`, or arbitrary `}
                  <code className="border border-white/30 bg-black px-1.5 py-0.5 text-xs text-white">
                    {"<div />"}
                  </code>
                  {` containers — matching exact border-box geometry and corner radius.`}
                </p>
              </header>

              <Section
                id="effect-list"
                title={`Registered effects (${names.length})`}
                note="Names accepted by every *-anim-var prop. Effects marked cursor-driven only answer to the hover/active props."
              >
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs text-white/60 sm:grid-cols-4">
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
                {BORDER_EFFECTS.map(([name, modify], i) => {
                  const isSnakeOrGlow =
                    name.includes("snake") || name.includes("glow");
                  const variant = isSnakeOrGlow
                    ? "outline"
                    : VARIANTS[i % VARIANTS.length];
                  return (
                    <Row
                      key={name + i}
                      label={name}
                      title={JSON.stringify(modify)}
                    >
                      <Button variant={variant}>
                        {name}
                        <Overlay
                          staticBorderAnimVar={name}
                          staticBorderAnimVarModify={modify}
                        />
                      </Button>
                    </Row>
                  );
                })}
              </Section>

              <Section
                id="inner"
                title="staticOverlayAnimVar"
                note="Drawn inside the silhouette and clipped to it. Effects terminating in '-glow' can opt out with clip:false."
              >
                {INNER_EFFECTS.map(([name, modify], i) => {
                  const isShine = name === "shine";
                  const variant = isShine
                    ? "outline"
                    : VARIANTS[i % VARIANTS.length];
                  return (
                    <Row
                      key={name + i}
                      label={name}
                      title={JSON.stringify(modify)}
                    >
                      <Button size="lg" variant={variant}>
                        {name}
                        <Overlay
                          staticOverlayAnimVar={name}
                          staticOverlayAnimVarModify={modify}
                        />
                      </Button>
                    </Row>
                  );
                })}
              </Section>

              <Section
                id="slide"
                title="hoverOverlayAnimVar: slide"
                note="Hover only. Colour mask wipes in from an edge or expands from a corner, revealing contrasting text inside the mask without fading transparency."
              >
                {[
                  "bottom",
                  "top",
                  "left",
                  "right",
                  "corner-top-right",
                  "corner-top-left",
                  "corner-bottom-right",
                  "corner-bottom-left",
                ].map((from) => (
                  <Row key={from} label={from}>
                    <Button size="lg" variant="outline">
                      {from}
                      <Overlay
                        hoverOverlayAnimVar="slide"
                        hoverOverlayAnimVarModify={{ from }}
                      />
                    </Button>
                  </Row>
                ))}
                <Row
                  label="color"
                  title='{ color: "#22c55e", label: "Success" }'
                >
                  <Button size="lg" variant="outline">
                    custom fill
                    <Overlay
                      hoverOverlayAnimVar="slide"
                      hoverOverlayAnimVarModify={{
                        from: "corner-bottom-left",
                        color: "#22c55e",
                        label: "Success",
                      }}
                    />
                  </Button>
                </Row>
              </Section>

              <Section
                id="hover-border"
                title="hoverBorderAnimVar (Cursor Over Outline)"
                note="Border animations triggered on hover: corner grid expanding to target the button, triangle lock clamping in, and snake fill completing a full rotation."
              >
                <Row label="corner-grid (targets button)">
                  <Button variant="outline">
                    hover me (corner-grid)
                    <Overlay
                      hoverBorderAnimVar="corner-grid"
                      hoverBorderAnimVarModify={{ arm: 10 }}
                    />
                  </Button>
                </Row>
                <Row label="triangle-lock (clamps corners)">
                  <Button variant="outline">
                    hover me (triangle-lock)
                    <Overlay
                      hoverBorderAnimVar="triangle-lock"
                      hoverBorderAnimVarModify={{ size: 10 }}
                    />
                  </Button>
                </Row>
                <Row label="snake-fill (1 full rotation)">
                  <Button variant="outline">
                    hover me (snake-fill)
                    <Overlay
                      hoverBorderAnimVar="snake-fill"
                      hoverBorderAnimVarModify={{ speed: 1.2 }}
                    />
                  </Button>
                </Row>
                <Row label="pulse-hollow (ring outline)">
                  <Button variant="outline">
                    hover me (pulse-hollow)
                    <Overlay
                      hoverBorderAnimVar="pulse-hollow"
                      hoverBorderAnimVarModify={{ to: 1.25 }}
                    />
                  </Button>
                </Row>
                <Row label="pulse-fill (button replica)">
                  <Button variant="outline">
                    hover me (pulse-fill)
                    <Overlay
                      hoverBorderAnimVar="pulse-fill"
                      hoverBorderAnimVarModify={{ to: 1.25 }}
                    />
                  </Button>
                </Row>
              </Section>

              <Section
                id="hover"
                title="hoverOverlayAnimVar"
                note="Follows the cursor. Move the pointer across each button."
              >
                {HOVER_EFFECTS.map(([name, modify, hint], i) => {
                  const isSquareTile = hint.includes("square tile");
                  const variant = isSquareTile
                    ? "ghost"
                    : VARIANTS[i % VARIANTS.length];
                  return (
                    <Row key={name + i} label={hint}>
                      <Button variant={variant}>
                        {name}
                        <Overlay
                          staticBorderAnimVar="snake"
                          staticBorderAnimVarModify={{ thickness: 2 }}
                          hoverOverlayAnimVar={name}
                          hoverOverlayAnimVarModify={modify}
                        />
                      </Button>
                    </Row>
                  );
                })}
              </Section>

              <Section
                id="active"
                title="activeBorderAnimVar / activeOverlayAnimVar"
                note="Click or press actions: crystalline fracture crack at cursor, fill pulse behind button, shockwave ripple, halftone repel, and grid ripple."
              >
                <Row label="hyper-triangle-crack">
                  <Button variant="outline">
                    click to crack
                    <Overlay
                      staticBorderAnimVar="snake"
                      activeOverlayAnimVar="hyper-triangle-crack"
                    />
                  </Button>
                </Row>
                <Row label="pulse-hollow (ring outline)">
                  <Button variant="outline">
                    click to pulse-hollow
                    <Overlay
                      activeBorderAnimVar="pulse-hollow"
                      activeBorderAnimVarModify={{ to: 1.25 }}
                    />
                  </Button>
                </Row>
                <Row label="pulse-fill (button replica)">
                  <Button variant="outline">
                    click to pulse-fill
                    <Overlay
                      activeBorderAnimVar="pulse-fill"
                      activeBorderAnimVarModify={{ to: 1.25 }}
                    />
                  </Button>
                </Row>
                <Row label="halftone (repel & ripple)">
                  <Button variant="outline">
                    touch to repel dots
                    <Overlay
                      staticOverlayAnimVar="halftone"
                      staticOverlayAnimVarModify={{ grid: 6 }}
                      activeOverlayAnimVar="halftone"
                      activeOverlayAnimVarModify={{ grid: 6 }}
                    />
                  </Button>
                </Row>
                <Row label="ripple (ExperienceCard)">
                  <Button variant="outline">
                    click to ripple
                    <Overlay activeOverlayAnimVar="ripple" />
                  </Button>
                </Row>
                <Row label="grid-ripple (flush square wave)">
                  <Button variant="outline">
                    click to grid-ripple
                    <Overlay
                      activeOverlayAnimVar="grid-ripple"
                      activeOverlayAnimVarModify={{
                        squareSize: 6,
                        color: "#ffffff",
                      }}
                    />
                  </Button>
                </Row>
              </Section>

              <Section
                id="layered"
                title="Layering"
                note="All six props compose. Two border effects or two inner effects on the same element share a stacking context."
              >
                <Row label="six props at once">
                  <Button variant="warning" size="lg">
                    everything
                    <Overlay
                      staticBorderAnimVar="glow"
                      staticBorderAnimVarModify={{
                        glowSize: 22,
                        color: "#fbbf24",
                      }}
                      staticOverlayAnimVar="halftone"
                      staticOverlayAnimVarModify={{
                        grid: 12,
                        color: "#fbbf24",
                      }}
                      hoverBorderAnimVar="corner-grid"
                      hoverBorderAnimVarModify={{ arm: 14 }}
                      hoverOverlayAnimVar="nodes"
                      hoverOverlayAnimVarModify={{ follow: true, pull: 0.5 }}
                      activeBorderAnimVar="pulse"
                      activeBorderAnimVarModify={{ mode: "full" }}
                      activeOverlayAnimVar="ripple"
                      activeOverlayAnimVarModify={{ auto: false }}
                    />
                  </Button>
                </Row>
              </Section>

              <Section
                id="hosts"
                title="Arbitrary Parent Div Hosting"
                note="The Overlay dynamically detects parent bounds, forces positioning context if static, and always matches the parent's exact border-box size and corner radius."
              >
                <Row label="Plain Div (Unpositioned)">
                  <div className="w-80 h-28 border border-white p-4 flex flex-col justify-center items-center text-center bg-black">
                    <Overlay
                      staticBorderAnimVar="snake"
                      staticBorderAnimVarModify={{ thickness: 2, speed: 1.2 }}
                      staticOverlayAnimVar="halftone"
                      staticOverlayAnimVarModify={{ grid: 14 }}
                    />
                    <span className="text-xs font-bold text-white tracking-wider uppercase">
                      Unpositioned Div Host
                    </span>
                    <span className="text-[11px] text-white/60 mt-1">
                      320x112px • Perfect border-box match
                    </span>
                  </div>
                </Row>
                <Row label="Rounded Div Host">
                  <div className="w-80 h-24 border-2 border-white/60 rounded-xl p-4 flex flex-col justify-center items-center text-center bg-black">
                    <Overlay
                      staticBorderAnimVar="snake"
                      staticBorderAnimVarModify={{ thickness: 2 }}
                      hoverOverlayAnimVar="grid-track"
                    />
                    <span className="text-xs font-bold text-white tracking-wider uppercase">
                      Rounded Div (rounded-xl)
                    </span>
                    <span className="text-[11px] text-white/60 mt-1">
                      Auto-inherits border-radius & border width
                    </span>
                  </div>
                </Row>
                <Row label="Card Component">
                  <Card>
                    <Overlay
                      staticBorderAnimVar="glow"
                      staticOverlayAnimVar="sparkle"
                      staticOverlayAnimVarModify={{ size: 14 }}
                    />
                    <div className="relative z-10 space-y-2">
                      <h3 className="text-lg font-bold text-white">Card</h3>
                      <p className="text-sm text-white/60">
                        Glow outline, sparkle interior
                      </p>
                    </div>
                  </Card>
                </Row>
              </Section>

              <Section
                id="recipe"
                title="Recipes"
                note="Copy-paste starting points."
              >
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs text-white/60">
                      Danger button that glows and cracks on hover
                    </p>
                    <Code>{`<Button variant="danger">
  <Overlay
    staticBorderAnimVar="glow"
    staticBorderAnimVarModify={{ color: '#ef4444', intensity: 0.7 }}
    hoverOverlayAnimVar="hyper-triangle-crack"
    activeOverlayAnimVar="ripple"
  />
  Delete
</Button>`}</Code>
                  </div>
                  <div>
                    <p className="mb-2 text-xs text-white/60">
                      Success button with a data-mesh interior
                    </p>
                    <Code>{`<Button variant="success">
  <Overlay
    staticBorderAnimVar="snake"
    staticBorderAnimVarModify={{ count: 2, thickness: 3 }}
    staticOverlayAnimVar="hyper-triangles"
    staticOverlayAnimVarModify={{ count: 16, opacity: 0.8 }}
  />
  Save
</Button>`}</Code>
                  </div>
                  <div>
                    <p className="mb-2 text-xs text-white/60">
                      Interactive playground — click to cycle each layer
                    </p>
                    <div className="flex items-center gap-3">
                      {["border", "inner", "hover", "active"].map((k) => (
                        <select
                          key={k}
                          value={combo[k]}
                          onChange={(e) =>
                            setCombo((c) => ({ ...c, [k]: e.target.value }))
                          }
                          className="border border-white/40 bg-black px-2 py-1 font-mono text-xs text-white"
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
                      <Button variant="default" size="lg">
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

              <Section
                id="api"
                title="Overlay Props"
                note="Overlay takes the six state/layer effect props and their parameter objects."
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="text-white/60">
                      <tr className="border-b border-white/20">
                        <th className="py-2 pr-4 font-normal">prop</th>
                        <th className="py-2 pr-4 font-normal">type</th>
                        <th className="py-2 font-normal">notes</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-white/90">
                      {[
                        ["staticBorderAnimVar", "string", "idle, outline layer"],
                        ["staticOverlayAnimVar", "string", "idle, inner layer"],
                        [
                          "hoverBorderAnimVar",
                          "string",
                          "cursor over, outline layer",
                        ],
                        [
                          "hoverOverlayAnimVar",
                          "string",
                          "cursor over, inner layer",
                        ],
                        [
                          "activeBorderAnimVar",
                          "string",
                          "pointer down, outline layer",
                        ],
                        [
                          "activeOverlayAnimVar",
                          "string",
                          "pointer down, inner layer",
                        ],
                        [
                          "*Modify",
                          "object",
                          "parameters for the matching effect",
                        ],
                        [
                          "radius",
                          "number",
                          "auto-inherits from Button or parent border-radius",
                        ],
                        [
                          "accent",
                          "string",
                          "auto-inherits from Button variant or custom color",
                        ],
                        [
                          "borderOverflow",
                          "number",
                          "40 — px of bleed room for border effects",
                        ],
                        [
                          "followPointer",
                          "boolean",
                          "true — effects receive the cursor position",
                        ],
                      ].map(([p, t, n]) => (
                        <tr key={p} className="border-b border-white/10">
                          <td className="py-2 pr-4">{p}</td>
                          <td className="py-2 pr-4 text-white/60">{t}</td>
                          <td className="py-2 font-sans text-white/60">{n}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
