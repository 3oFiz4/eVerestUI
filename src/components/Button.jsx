import { Children, isValidElement } from 'react'
import { HostProvider } from './context.js'

/**
 * Sharp-cornered, monochrome button. Radius is 0 by default and only rises when asked.
 *
 * Professional Black & White Design:
 * - Color psychology: Pure black (#000000) base with 1px crisp white (#ffffff) border
 *   and white text commands technical authority, precision, and focus.
 * - Semantic variants: Maintain the dark ground with translucent color tints
 *   (e.g. green-500/30) and matching 1px borders, preserving high contrast without
 *   distracting solid fills.
 * - Sizing & proportions:
 *   - sm: h-7 (28px), px-3 text-xs gap-1.5 (dense inspectors, utilities)
 *   - md: h-9 (36px), px-4 text-sm gap-2 (default interactive)
 *   - lg: h-10 (40px), px-4 text-sm gap-2.5 (standard CTA)
 *   - xl: h-12 (48px), px-6 text-base gap-3 (hero action)
 * - Micro-interactions:
 *   - Hover: subtle white/10 fill lift (under 150ms)
 *   - Active (press): white/20 fill lift + 1px physical depression (translate-y-px)
 *   - Focus: crisp white focus ring with offset
 *   - Disabled: opacity-40, no hover/active
 */
const VARIANTS = {
  default: {
    accent: '#ffffff',
    base: 'bg-black text-white border border-white hover:bg-white/10 active:bg-white/20',
  },
  primary: {
    accent: '#ffffff',
    base: 'bg-black text-white border border-white hover:bg-white/10 active:bg-white/20',
  },
  neutral: {
    accent: '#ffffff',
    base: 'bg-black text-white border border-white hover:bg-white/10 active:bg-white/20',
  },
  secondary: {
    accent: '#e5e7eb',
    base: 'bg-black text-white/80 border border-white/40 hover:border-white hover:text-white hover:bg-white/10 active:bg-white/20',
  },
  subtle: {
    accent: '#a3a3a3',
    base: 'bg-black text-white/60 border border-white/20 hover:border-white/60 hover:text-white hover:bg-white/10 active:bg-white/20',
  },
  ghost: {
    accent: '#ffffff',
    base: 'bg-black text-white border border-transparent hover:border-white hover:bg-white/10 active:bg-white/20',
  },
  dashed: {
    accent: '#ffffff',
    base: 'bg-black text-white border border-dashed border-white hover:bg-white/10 active:bg-white/20',
  },
  double: {
    accent: '#ffffff',
    base: 'bg-black text-white border-2 border-white hover:bg-white/10 active:bg-white/20',
  },
  success: {
    accent: '#22c55e',
    base: 'bg-green-500/30 text-white border border-green-500 hover:bg-green-500/60 active:bg-green-500/75',
  },
  caution: {
    accent: '#f59e0b',
    base: 'bg-amber-500/30 text-white border border-amber-500 hover:bg-amber-500/60 active:bg-amber-500/75',
  },
  warning: {
    accent: '#f59e0b',
    base: 'bg-amber-500/30 text-white border border-amber-500 hover:bg-amber-500/60 active:bg-amber-500/75',
  },
  danger: {
    accent: '#ef4444',
    base: 'bg-red-500/30 text-white border border-red-500 hover:bg-red-500/60 active:bg-red-500/75',
  },
  info: {
    accent: '#0ea5e9',
    base: 'bg-sky-500/30 text-white border border-sky-500 hover:bg-sky-500/60 active:bg-sky-500/75',
  },
}

const SIZES = {
  sm: 'h-7 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-4 text-sm gap-2.5',
  xl: 'h-12 px-6 text-base gap-3',
}

export const BUTTON_VARIANTS = Object.keys(VARIANTS)
export const BUTTON_SIZES = Object.keys(SIZES)

/** Accent colour a variant contributes to overlay effects. */
export const variantAccent = (variant) => (VARIANTS[variant] ?? VARIANTS.default).accent

export function Button({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  radius = 0,
  disabled = false,
  loading = false,
  fullWidth = false,
  ...props
}) {
  const v = VARIANTS[variant] ?? VARIANTS.default
  const s = SIZES[size] ?? SIZES.md
  const host = { radius, accent: v.accent, disabled: disabled || loading }

  // Separate Overlay elements from text/content so Overlay renders as a direct child of <button>
  const overlays = []
  const content = []

  Children.forEach(children, (child) => {
    if (
      isValidElement(child) &&
      (child.props?.staticBorderAnimVar !== undefined ||
        child.props?.hoverBorderAnimVar !== undefined ||
        child.props?.activeBorderAnimVar !== undefined ||
        child.props?.staticOverlayAnimVar !== undefined ||
        child.props?.hoverOverlayAnimVar !== undefined ||
        child.props?.activeOverlayAnimVar !== undefined ||
        child.props?.borderOverflow !== undefined ||
        child.type?.name === 'Overlay' ||
        child.type?.displayName === 'Overlay')
    ) {
      overlays.push(child)
    } else {
      content.push(child)
    }
  })

  return (
    <HostProvider value={host}>
      <button
        type="button"
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        style={{ borderRadius: radius }}
        className={`jetbrains-mono font-mono relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center font-medium whitespace-nowrap select-none
          transition-all duration-150 ease-out
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black
          enabled:active:translate-y-px
          disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-black
          ${v.base} ${s} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {overlays}
        {loading && (
          <span
            className="size-3.5 animate-spin rounded-full border border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        <span className="relative z-10 inline-flex items-center gap-[inherit]">{content}</span>
      </button>
    </HostProvider>
  )
}

export default Button
