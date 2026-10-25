import { HostProvider } from './context.js'

/**
 * Sharp-cornered button. Radius is 0 by design — this library is for people who
 * are done with pill-shaped everything — and only rises when asked.
 *
 * Each variant carries an `accent` colour that overlay effects inherit, so
 * `<Button variant="danger"><Overlay .../></Button>` needs no colour plumbing.
 */
const VARIANTS = {
  primary: { accent: '#60a5fa', base: 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500' },
  neutral: { accent: '#a3a3a3', base: 'bg-neutral-800 text-neutral-100 border-neutral-700 hover:bg-neutral-700' },
  success: { accent: '#34d399', base: 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500' },
  caution: { accent: '#fbbf24', base: 'bg-amber-500 text-neutral-950 border-amber-400 hover:bg-amber-400' },
  warning: { accent: '#fb923c', base: 'bg-orange-600 text-white border-orange-500 hover:bg-orange-500' },
  danger: { accent: '#f87171', base: 'bg-red-600 text-white border-red-500 hover:bg-red-500' },
  info: { accent: '#22d3ee', base: 'bg-cyan-600 text-white border-cyan-500 hover:bg-cyan-500' },
  ghost: { accent: '#e5e7eb', base: 'bg-transparent text-neutral-200 border-neutral-700 hover:bg-neutral-800' },
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
}

export const BUTTON_VARIANTS = Object.keys(VARIANTS)
export const BUTTON_SIZES = Object.keys(SIZES)

/** Accent colour a variant contributes to overlay effects. */
export const variantAccent = (variant) => (VARIANTS[variant] ?? VARIANTS.neutral).accent

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  radius = 0,
  disabled = false,
  loading = false,
  fullWidth = false,
  ...props
}) {
  const v = VARIANTS[variant] ?? VARIANTS.neutral
  const s = SIZES[size] ?? SIZES.md
  const host = { radius, accent: v.accent, disabled: disabled || loading }
  return (
    <HostProvider value={host}>
      <button
        type="button"
        disabled={disabled || loading}
        style={{ borderRadius: radius }}
        className={`relative isolate inline-flex cursor-pointer items-center justify-center border font-semibold tracking-tight select-none
          transition-colors duration-200
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400
          disabled:cursor-not-allowed disabled:opacity-50
          active:translate-y-px
          ${v.base} ${s} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {loading && (
          <span
            className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        <span className="inline-flex items-center gap-[inherit]">{children}</span>
      </button>
    </HostProvider>
  )
}

export default Button
