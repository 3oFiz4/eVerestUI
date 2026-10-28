import { Overlay } from './Overlay.jsx'

/**
 * Monochrome architectural Input component.
 *
 * Every input mounts a subtle 5% opacity small `outer-grid` Overlay inside its field
 * by default (`gridOverlay = true`) and supports 12 variants (0..11):
 *   0. `simple`          - Clean 1px monochrome input, no focus animation
 *   1. `floating-label`  - Floating Inset Matrix Label (reveals placeholder when focused & empty)
 *   2. `crosshair`       - Active Crosshair corner reticle brackets
 *   3. `underline-beam`  - Center-outward 2px sliding underline beam
 *   4. `shutter`         - Mechanical solid white scaleX wipe with text inversion
 *   5. `ghost-notch`     - Internal 3px frame recession on focus
 *   6. `perimeter-trace` - 4-edge sequential GPU scaleX/scaleY laser trace
 *   7. `scanline-sweep`  - Terminal scanline matrix with focus radar sweep
 *   8. `pillar-clamp`    - Dual 3px vertical side-pillars clamping on focus
 *   9. `chamfer-lock`    - Diagonal corner ticks and center datum markers locking in
 *  10. `sonar-pulse`     - Expanding perimeter shockwave frame + live telemetry tag
 *  11. `split-shutter`   - Bi-directional top/bottom dual shutter wipe with text inversion
 */

export const INPUT_VARIANTS = [
  'simple',
  'floating-label',
  'crosshair',
  'underline-beam',
  'shutter',
  'ghost-notch',
  'perimeter-trace',
  'scanline-sweep',
  'pillar-clamp',
  'chamfer-lock',
  'sonar-pulse',
  'split-shutter',
]

const BASE_INPUT =
  'relative z-10 h-10 w-full bg-transparent px-3.5 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40'

export function Input({
  className = '',
  containerClassName = '',
  variant = 'simple',
  label,
  placeholder,
  gridOverlay = true,
  type = 'text',
  ...props
}) {
  const mode = INPUT_VARIANTS.includes(variant) ? variant : 'simple'
  const gridNode = gridOverlay ? (
    <Overlay
      staticOverlayAnimVar="outer-grid"
      staticOverlayAnimVarModify={{ opacity: 0.05, cell: 8, arm: 2.5 }}
    />
  ) : null

  if (mode === 'floating-label') {
    const matrixLabel = label ?? placeholder ?? '[01] ENDPOINT_URI'
    const activePlaceholder = placeholder ?? 'https://api.everest.ui/v1/nodes'
    return (
      <div
        data-slot="input"
        data-variant={mode}
        className={`group/input relative w-full bg-black ${containerClassName}`}
      >
        {gridNode}
        <input
          type={type}
          placeholder={activePlaceholder}
          className={`peer relative z-10 h-10 w-full border border-white/30 bg-transparent px-3.5 pt-1 font-mono text-xs text-white placeholder:text-transparent focus:border-white focus:placeholder:text-zinc-600 focus:outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
          {...props}
        />
        <label className="pointer-events-none absolute left-3 top-2.5 z-20 origin-left font-mono text-xs text-zinc-500 transition-all duration-200 ease-out peer-focus:-translate-y-5 peer-focus:scale-90 peer-focus:bg-black peer-focus:px-1 peer-focus:text-white peer-not-placeholder-shown:-translate-y-5 peer-not-placeholder-shown:scale-90 peer-not-placeholder-shown:bg-black peer-not-placeholder-shown:px-1 peer-not-placeholder-shown:text-white/80">
          {matrixLabel}
        </label>
      </div>
    )
  }

  if (mode === 'crosshair') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        className={`group/reticle relative w-full bg-black ${containerClassName}`}
      >
        {gridNode}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-1 -left-1 z-20 size-2 border-t-2 border-l-2 border-white/30 transition-all duration-200 ease-out group-focus-within:-translate-x-0.5 group-focus-within:-translate-y-0.5 group-focus-within:border-white"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-1 -right-1 z-20 size-2 border-t-2 border-r-2 border-white/30 transition-all duration-200 ease-out group-focus-within:translate-x-0.5 group-focus-within:-translate-y-0.5 group-focus-within:border-white"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-1 -left-1 z-20 size-2 border-b-2 border-l-2 border-white/30 transition-all duration-200 ease-out group-focus-within:-translate-x-0.5 group-focus-within:translate-y-0.5 group-focus-within:border-white"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-1 -bottom-1 z-20 size-2 border-r-2 border-b-2 border-white/30 transition-all duration-200 ease-out group-focus-within:translate-x-0.5 group-focus-within:translate-y-0.5 group-focus-within:border-white"
        />
        <input
          type={type}
          placeholder={placeholder}
          className={`${BASE_INPUT} border border-white/20 transition-colors group-focus-within:border-white/50 ${className}`}
          {...props}
        />
      </div>
    )
  }

  if (mode === 'underline-beam') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        className={`group/beam relative w-full bg-black ${containerClassName}`}
      >
        {gridNode}
        <input
          type={type}
          placeholder={placeholder}
          className={`${BASE_INPUT} px-2 ${className}`}
          {...props}
        />
        <div aria-hidden="true" className="relative h-px w-full bg-white/20">
          <div className="absolute inset-y-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-white transition-all duration-300 ease-out group-focus-within:w-full" />
        </div>
      </div>
    )
  }

  if (mode === 'shutter') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        className={`group/shutter relative w-full overflow-hidden border border-white/30 bg-black ${containerClassName}`}
      >
        {gridNode}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 origin-left scale-x-0 bg-white transition-transform duration-300 ease-out will-change-transform group-focus-within:scale-x-100"
        />
        <input
          type={type}
          placeholder={placeholder}
          className={`${BASE_INPUT} font-bold tracking-wider uppercase transition-colors duration-200 selection:bg-black selection:text-white group-focus-within:text-black group-focus-within:placeholder:text-zinc-500 ${className}`}
          {...props}
        />
      </div>
    )
  }

  if (mode === 'ghost-notch') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        className={`group/notch relative w-full border border-white/20 bg-black ${containerClassName}`}
      >
        {gridNode}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 border border-transparent transition-all duration-200 ease-out group-focus-within:inset-[3px] group-focus-within:border-white"
        />
        <input
          type={type}
          placeholder={placeholder}
          className={`${BASE_INPUT} px-4 font-bold tracking-wider uppercase ${className}`}
          {...props}
        />
      </div>
    )
  }

  if (mode === 'perimeter-trace') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        className={`group/trace relative w-full border border-white/15 bg-black ${containerClassName}`}
      >
        {gridNode}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-20 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-200 ease-out will-change-transform group-focus-within:scale-x-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 z-20 h-full w-px origin-top scale-y-0 bg-white transition-transform delay-75 duration-200 ease-out will-change-transform group-focus-within:scale-y-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 z-20 h-px w-full origin-right scale-x-0 bg-white transition-transform delay-150 duration-200 ease-out will-change-transform group-focus-within:scale-x-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 z-20 h-full w-px origin-bottom scale-y-0 bg-white transition-transform delay-200 duration-200 ease-out will-change-transform group-focus-within:scale-y-100"
        />
        <input
          type={type}
          placeholder={placeholder}
          className={`${BASE_INPUT} ${className}`}
          {...props}
        />
      </div>
    )
  }

  if (mode === 'scanline-sweep') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        className={`group/scan relative w-full overflow-hidden border border-white/25 bg-black transition-colors focus-within:border-white ${containerClassName}`}
      >
        {gridNode}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100"
          style={{
            backgroundImage:
              'linear-gradient(transparent 50%, rgba(255, 255, 255, 0.05) 50%)',
            backgroundSize: '100% 4px',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-0 w-12 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out will-change-transform group-focus-within:translate-x-[800%]"
        />
        <input
          type={type}
          placeholder={placeholder}
          className={`${BASE_INPUT} pr-16 ${className}`}
          {...props}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 z-20 -translate-y-1/2 font-mono text-[10px] tracking-widest text-white/30 transition-colors group-focus-within:text-white"
        >
          SCAN
        </span>
      </div>
    )
  }

  if (mode === 'pillar-clamp') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        className={`group/pillar relative w-full border border-white/20 bg-black transition-colors focus-within:border-white/50 ${containerClassName}`}
      >
        {gridNode}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1 origin-center scale-y-0 bg-white transition-transform duration-200 ease-out will-change-transform group-focus-within:scale-y-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-1 origin-center scale-y-0 bg-white transition-transform duration-200 ease-out will-change-transform group-focus-within:scale-y-100"
        />
        <input
          type={type}
          placeholder={placeholder}
          className={`${BASE_INPUT} px-4 ${className}`}
          {...props}
        />
      </div>
    )
  }

  if (mode === 'chamfer-lock') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        className={`group/chamfer relative w-full border border-white/20 bg-black transition-colors focus-within:border-white ${containerClassName}`}
      >
        {gridNode}
        {/* Top & bottom center datum ticks */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 z-20 h-1.5 w-px -translate-x-1/2 scale-y-0 bg-white transition-transform duration-200 ease-out group-focus-within:scale-y-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 z-20 h-1.5 w-px -translate-x-1/2 scale-y-0 bg-white transition-transform duration-200 ease-out group-focus-within:scale-y-100"
        />
        {/* Corner right-angle triangles that clamp in */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-20 size-0 border-t-[6px] border-r-[6px] border-t-white border-r-transparent opacity-0 transition-opacity duration-150 group-focus-within:opacity-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 z-20 size-0 border-b-[6px] border-l-[6px] border-b-white border-l-transparent opacity-0 transition-opacity duration-150 group-focus-within:opacity-100"
        />
        <input
          type={type}
          placeholder={placeholder}
          className={`${BASE_INPUT} ${className}`}
          {...props}
        />
      </div>
    )
  }

  if (mode === 'sonar-pulse') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        className={`group/sonar relative w-full border border-white/25 bg-black transition-colors focus-within:border-white ${containerClassName}`}
      >
        {gridNode}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 border border-white opacity-0 transition-all duration-300 ease-out group-focus-within:-inset-1 group-focus-within:opacity-40"
        />
        <input
          type={type}
          placeholder={placeholder}
          className={`${BASE_INPUT} pr-14 ${className}`}
          {...props}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-2.5 z-20 -translate-y-1/2 border border-white/20 px-1 py-0.5 font-mono text-[9px] leading-none text-white/40 transition-colors group-focus-within:border-white group-focus-within:bg-white group-focus-within:text-black"
        >
          ACT
        </span>
      </div>
    )
  }

  if (mode === 'split-shutter') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        className={`group/split relative w-full overflow-hidden border border-white/30 bg-black ${containerClassName}`}
      >
        {gridNode}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-1/2 origin-top scale-y-0 bg-white transition-transform duration-200 ease-out will-change-transform group-focus-within:scale-y-100"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2 origin-bottom scale-y-0 bg-white transition-transform duration-200 ease-out will-change-transform group-focus-within:scale-y-100"
        />
        <input
          type={type}
          placeholder={placeholder}
          className={`${BASE_INPUT} font-bold tracking-wider uppercase transition-colors duration-150 selection:bg-black selection:text-white group-focus-within:text-black group-focus-within:placeholder:text-zinc-500 ${className}`}
          {...props}
        />
      </div>
    )
  }

  // 0. `simple` (default — no focus animation, clean monochrome border + 5% outer-grid overlay)
  return (
    <div
      data-slot="input"
      data-variant="simple"
      className={`relative w-full border border-white/25 bg-black transition-colors focus-within:border-white ${containerClassName}`}
    >
      {gridNode}
      <input
        type={type}
        placeholder={placeholder}
        className={`${BASE_INPUT} ${className}`}
        {...props}
      />
    </div>
  )
}

export default Input
