/**
 * Sharp-cornered, monochrome Input component matching Button's exact size scale.
 *
 * Sizing & proportions (aligned 1:1 with Button):
 *   - xs:          h-4 (16px), px-2   text-[10px]
 *   - s / sm:      h-5 (20px), px-2.5 text-[11px]
 *   - default / md:h-6 (24px), px-2.5 text-[12px] text-xs
 *   - lg:          h-7 (28px), px-2.5 text-[12px] text-xs
 *   - xl:          h-8 (32px), px-2.5 text-[12px] text-xs
 *   - 2xl:         h-9 (36px), px-3   text-sm
 *
 * Supports 12 variants:
 *   - `simple`          - Clean 1px monochrome input, no focus animation
 *   - `floating-label`  - Floating inset label (docks on top border & reveals placeholder on focus)
 *   - `crosshair`       - Corner reticle brackets snapping outward on focus
 *   - `underline-beam`  - Center-outward 2px sliding underline beam
 *   - `shutter`         - Solid white horizontal wipe with text inversion
 *   - `ghost-notch`     - Internal 3px frame recession on focus
 *   - `perimeter-trace` - 4-edge sequential 1px border trace
 *   - `scanline-sweep`  - Subtle scanline grid + sweeping light bar on focus
 *   - `pillar-clamp`    - Left and right vertical bars clamping in on focus
 *   - `chamfer-lock`    - Corner ticks and center datum markers locking on focus
 *   - `sonar-pulse`     - Expanding outer perimeter ring on focus
 *   - `split-shutter`   - Top and bottom half-shutters meeting with text inversion
 */

const SIZES = {
  xs: 'h-4 px-2 text-[10px]',
  s: 'h-5 px-2.5 text-[11px]',
  sm: 'h-5 px-2.5 text-[11px]',
  default: 'h-6 px-2.5 text-[12px] text-xs',
  md: 'h-6 px-2.5 text-[12px] text-xs',
  lg: 'h-7 px-2.5 text-[12px] text-xs',
  xl: 'h-8 px-2.5 text-[12px] text-xs',
  '2xl': 'h-9 px-3 text-sm',
}

function resolveInputSize({ size, fontSize, className }) {
  if (fontSize) {
    if (fontSize === 'xs' || fontSize === '10px') return 'xs'
    if (fontSize === 's' || fontSize === 'sm' || fontSize === '11px') return 'sm'
    if (fontSize === 'md' || fontSize === 'default' || fontSize === '12px' || fontSize === 'text-xs') return 'default'
    if (fontSize === 'lg' || fontSize === '13px') return 'lg'
    if (fontSize === 'xl' || fontSize === '14px' || fontSize === 'text-sm') return 'xl'
  }

  if (size && size !== 'default' && size !== 'md') {
    return size
  }

  if (className) {
    if (/\btext-\[10px\]\b/.test(className)) return 'xs'
    if (/\btext-\[11px\]\b/.test(className)) return 'sm'
    if (/\btext-xs\b|\btext-\[12px\]\b/.test(className)) return 'default'
    if (/\btext-sm\b|\btext-\[14px\]\b/.test(className)) return 'xl'
  }

  return size ?? 'default'
}

export const INPUT_SIZES = ['xs', 's', 'sm', 'default', 'md', 'lg', 'xl']

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

export function Input({
  className = '',
  containerClassName = '',
  variant = 'simple',
  size = 'default',
  fontSize,
  radius = 0,
  fullWidth = false,
  label,
  placeholder,
  disabled = false,
  type = 'text',
  style,
  ...props
}) {
  const mode = INPUT_VARIANTS.includes(variant) ? variant : 'simple'
  const resolvedSize = resolveInputSize({ size, fontSize, className })
  const s = SIZES[resolvedSize] ?? SIZES.default
  const widthClass = fullWidth ? 'w-full' : 'w-48'

  const baseInput = `peer relative z-10 w-full bg-transparent font-mono text-white placeholder:text-white/35 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 ${s} ${className}`

  if (mode === 'floating-label') {
    const floatLabel = label ?? 'Endpoint'
    const activePlaceholder = placeholder ?? 'https://...'
    return (
      <div
        data-slot="input"
        data-variant={mode}
        style={{ borderRadius: radius, ...style }}
        className={`relative inline-flex items-center bg-black ${widthClass} ${
          disabled ? 'opacity-40 cursor-not-allowed' : ''
        } ${containerClassName}`}
      >
        <input
          type={type}
          disabled={disabled}
          placeholder={activePlaceholder}
          style={{ borderRadius: radius }}
          className={`${baseInput} border border-white/30 placeholder:text-transparent focus:border-white focus:placeholder:text-white/35 transition-colors duration-150`}
          {...props}
        />
        <label className="pointer-events-none absolute left-2 top-1/2 z-20 -translate-y-1/2 origin-left font-mono text-[10px] leading-none text-white/50 transition-all duration-200 ease-out peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-90 peer-focus:bg-black peer-focus:px-1 peer-focus:text-white peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:-translate-y-1/2 peer-not-placeholder-shown:scale-90 peer-not-placeholder-shown:bg-black peer-not-placeholder-shown:px-1 peer-not-placeholder-shown:text-white/80">
          {floatLabel}
        </label>
      </div>
    )
  }

  if (mode === 'crosshair') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        style={{ borderRadius: radius, ...style }}
        className={`relative inline-flex items-center bg-black ${widthClass} ${containerClassName}`}
      >
        <input
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          style={{ borderRadius: radius }}
          className={`${baseInput} border border-white/20 transition-colors duration-150 focus:border-white/60`}
          {...props}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-1 -left-1 z-20 size-2 border-t-2 border-l-2 border-white/35 transition-all duration-200 ease-out peer-focus:-translate-x-0.5 peer-focus:-translate-y-0.5 peer-focus:border-white"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-1 -right-1 z-20 size-2 border-t-2 border-r-2 border-white/35 transition-all duration-200 ease-out peer-focus:translate-x-0.5 peer-focus:-translate-y-0.5 peer-focus:border-white"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-1 -left-1 z-20 size-2 border-b-2 border-l-2 border-white/35 transition-all duration-200 ease-out peer-focus:-translate-x-0.5 peer-focus:translate-y-0.5 peer-focus:border-white"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-1 -bottom-1 z-20 size-2 border-r-2 border-b-2 border-white/35 transition-all duration-200 ease-out peer-focus:translate-x-0.5 peer-focus:translate-y-0.5 peer-focus:border-white"
        />
      </div>
    )
  }

  if (mode === 'underline-beam') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        style={{ borderRadius: radius, ...style }}
        className={`relative inline-flex flex-col bg-black ${widthClass} ${containerClassName}`}
      >
        <input
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={`${baseInput} border-b border-white/20`}
          {...props}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 z-20 h-[2px] w-0 -translate-x-1/2 bg-white transition-all duration-300 ease-out peer-focus:w-full"
        />
      </div>
    )
  }

  if (mode === 'shutter') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        style={{ borderRadius: radius, ...style }}
        className={`relative inline-flex items-center overflow-hidden border border-white/30 bg-black ${widthClass} ${containerClassName}`}
      >
        <input
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={`${baseInput} transition-colors duration-200 selection:bg-black selection:text-white focus:text-black focus:placeholder:text-black/50`}
          {...props}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 origin-left scale-x-0 bg-white transition-transform duration-300 ease-out will-change-transform peer-focus:scale-x-100"
        />
      </div>
    )
  }

  if (mode === 'ghost-notch') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        style={{ borderRadius: radius, ...style }}
        className={`relative inline-flex items-center border border-white/25 bg-black ${widthClass} ${containerClassName}`}
      >
        <input
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={baseInput}
          {...props}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 border border-transparent transition-all duration-200 ease-out peer-focus:inset-[3px] peer-focus:border-white"
        />
      </div>
    )
  }

  if (mode === 'perimeter-trace') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        style={{ borderRadius: radius, ...style }}
        className={`relative inline-flex items-center border border-white/15 bg-black ${widthClass} ${containerClassName}`}
      >
        <input
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={baseInput}
          {...props}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-20 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-150 ease-out will-change-transform peer-focus:scale-x-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 z-20 h-full w-px origin-top scale-y-0 bg-white transition-transform delay-75 duration-150 ease-out will-change-transform peer-focus:scale-y-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 z-20 h-px w-full origin-right scale-x-0 bg-white transition-transform delay-150 duration-150 ease-out will-change-transform peer-focus:scale-x-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 z-20 h-full w-px origin-bottom scale-y-0 bg-white transition-transform delay-200 duration-150 ease-out will-change-transform peer-focus:scale-y-100"
        />
      </div>
    )
  }

  if (mode === 'scanline-sweep') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        style={{ borderRadius: radius, ...style }}
        className={`relative inline-flex items-center overflow-hidden border border-white/25 bg-black ${widthClass} ${containerClassName}`}
      >
        <input
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={`${baseInput} transition-colors duration-150 focus:border-white`}
          {...props}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-200 peer-focus:opacity-100"
          style={{
            backgroundImage: 'linear-gradient(transparent 50%, rgba(255, 255, 255, 0.06) 50%)',
            backgroundSize: '100% 4px',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-0 w-10 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 ease-out will-change-transform peer-focus:translate-x-[500%]"
        />
      </div>
    )
  }

  if (mode === 'pillar-clamp') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        style={{ borderRadius: radius, ...style }}
        className={`relative inline-flex items-center border border-white/20 bg-black ${widthClass} ${containerClassName}`}
      >
        <input
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={`${baseInput} transition-colors duration-150 focus:border-white/50`}
          {...props}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1 origin-center scale-y-0 bg-white transition-transform duration-200 ease-out will-change-transform peer-focus:scale-y-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-1 origin-center scale-y-0 bg-white transition-transform duration-200 ease-out will-change-transform peer-focus:scale-y-100"
        />
      </div>
    )
  }

  if (mode === 'chamfer-lock') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        style={{ borderRadius: radius, ...style }}
        className={`relative inline-flex items-center border border-white/20 bg-black ${widthClass} ${containerClassName}`}
      >
        <input
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={`${baseInput} transition-colors duration-150 focus:border-white`}
          {...props}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 z-20 h-1 w-px -translate-x-1/2 scale-y-0 bg-white transition-transform duration-200 ease-out peer-focus:scale-y-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 z-20 h-1 w-px -translate-x-1/2 scale-y-0 bg-white transition-transform duration-200 ease-out peer-focus:scale-y-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-20 size-0 border-t-[5px] border-r-[5px] border-t-white border-r-transparent opacity-0 transition-opacity duration-150 peer-focus:opacity-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 z-20 size-0 border-b-[5px] border-l-[5px] border-b-white border-l-transparent opacity-0 transition-opacity duration-150 peer-focus:opacity-100"
        />
      </div>
    )
  }

  if (mode === 'sonar-pulse') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        style={{ borderRadius: radius, ...style }}
        className={`relative inline-flex items-center bg-black ${widthClass} ${containerClassName}`}
      >
        <input
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          style={{ borderRadius: radius }}
          className={`${baseInput} border border-white/25 transition-colors duration-150 focus:border-white`}
          {...props}
        />
        <span
          aria-hidden="true"
          style={{ borderRadius: radius }}
          className="pointer-events-none absolute inset-0 z-20 border border-white opacity-0 transition-all duration-300 ease-out peer-focus:-inset-1 peer-focus:opacity-50"
        />
      </div>
    )
  }

  if (mode === 'split-shutter') {
    return (
      <div
        data-slot="input"
        data-variant={mode}
        style={{ borderRadius: radius, ...style }}
        className={`relative inline-flex items-center overflow-hidden border border-white/30 bg-black ${widthClass} ${containerClassName}`}
      >
        <input
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={`${baseInput} transition-colors duration-150 selection:bg-black selection:text-white focus:text-black focus:placeholder:text-black/50`}
          {...props}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-1/2 origin-top scale-y-0 bg-white transition-transform duration-200 ease-out will-change-transform peer-focus:scale-y-100"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2 origin-bottom scale-y-0 bg-white transition-transform duration-200 ease-out will-change-transform peer-focus:scale-y-100"
        />
      </div>
    )
  }

  // `simple` (default — no focus animation, clean monochrome border)
  return (
    <div
      data-slot="input"
      data-variant="simple"
      style={{ borderRadius: radius, ...style }}
      className={`relative inline-flex items-center bg-black ${widthClass} ${containerClassName}`}
    >
      <input
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        style={{ borderRadius: radius }}
        className={`${baseInput} border border-white/25 transition-colors duration-150 focus:border-white`}
        {...props}
      />
    </div>
  )
}

export default Input
