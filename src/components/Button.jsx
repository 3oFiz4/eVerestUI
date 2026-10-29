'use client'

import { Children, cloneElement, forwardRef, isValidElement } from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../lib/utils.js'
import { HostProvider } from './context.js'
import { Overlay } from './Overlay.jsx'

/**
 * Sharp-cornered, monochrome button. Radius is 0 by default and only rises when asked.
 *
 * Professional Black & White Design (Design Psychology & shadcn Scale):
 * - Color psychology: Pure black (#000000) base with 1px crisp white (#ffffff) border
 *   and white text commands technical authority, precision, and focus.
 * - Semantic variants: Maintain the dark ground with translucent color tints
 *   (e.g. green-500/30) and matching 1px borders, preserving high contrast without
 *   distracting solid fills.
 * - Sizing & proportions (derived from typographic baseline & shadcn scale):
 *   - xs: h-7 (28px), px-2.5 text-xs gap-1.5 (dense inspectors, micro-utilities)
 *   - sm: h-8 (32px), px-3 text-xs gap-1.5 (shadcn sm, compact toolbars)
 *   - default / md: h-9 (36px), px-4 text-sm gap-2 (shadcn default, standard interactive)
 *   - lg: h-10 (40px), px-6 text-sm gap-2 (shadcn lg, confident CTA, text-sm prevents bulk)
 *   - xl: h-11 (44px), px-6 text-sm gap-2.5 (hero action, scaled down for tight visual density)
 *   - icon: size-9 (36px) p-0 (square icon button matching default height)
 *   - icon-sm: size-8 (32px) p-0 (square icon button matching sm height)
 *   - icon-xs: size-7 (28px) p-0 (square icon button matching xs height)
 * - Typography-driven auto-detection:
 *   - Automatically decides button height, padding, gap, and spinner dimensions from
 *     `fontSize` prop or font classes in `className` (e.g. `text-xs` -> h-8, `text-sm` -> h-9).
 * - Micro-interactions:
 *   - Hover: subtle white/10 fill lift (under 150ms)
 *   - Active (press): white/20 fill lift + 1px physical depression (translate-y-px)
 *   - Focus: crisp white focus ring with offset
 *   - Disabled: opacity-40, no hover/active
 */
const VARIANTS = {
  default: {
    accent: '#ffffff',
    ripple: '#000000',
    base: 'bg-white text-black border border-white hover:bg-white/90 active:bg-white/80',
  },
  primary: {
    accent: '#ffffff',
    ripple: '#000000',
    base: 'bg-white text-black border border-white hover:bg-white/90 active:bg-white/80',
  },
  outline: {
    accent: '#ffffff',
    base: 'bg-black text-white border border-white/20 hover:border-white/40 hover:bg-white/10 active:bg-white/20',
  },
  secondary: {
    accent: '#ffffff',
    base: 'bg-black text-white border border-transparent hover:bg-white/10 active:bg-white/20',
  },
  ghost: {
    accent: '#ffffff',
    base: 'bg-transparent text-white border border-transparent hover:bg-white/10 active:bg-white/20',
  },
  link: {
    accent: '#ffffff',
    base: 'bg-transparent text-white border border-transparent hover:bg-transparent active:bg-transparent',
  },
  destructive: {
    accent: '#ef4444',
    base: 'bg-black text-red-500 border border-transparent hover:bg-red-500/10 hover:text-red-400 active:bg-red-500/20',
  },
  subtle: {
    accent: '#a3a3a3',
    base: 'bg-black text-white/60 border border-white/20 hover:border-white/60 hover:text-white hover:bg-white/10 active:bg-white/20',
  },
  neutral: {
    accent: '#ffffff',
    base: 'bg-black text-white border border-white hover:bg-white/10 active:bg-white/20',
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
    base: 'bg-black text-red-500 border border-transparent hover:bg-red-500/10 hover:text-red-400 active:bg-red-500/20',
  },
  info: {
    accent: '#0ea5e9',
    base: 'bg-sky-500/30 text-white border border-sky-500 hover:bg-sky-500/60 active:bg-sky-500/75',
  },
}

const SIZES = {
  xs: 'h-4 px-2.5 text-[10px] leading-none gap-1',
  sm: 'h-5 px-2.5 text-[11px] leading-none gap-1',
  default: 'h-6 px-2.5 text-xs leading-none gap-1.5',
  md: 'h-6 px-2.5 text-xs leading-none gap-1.5',
  lg: 'h-7 px-2.5 text-xs leading-none gap-1.5',
  xl: 'h-8 px-2.5 text-xs leading-none gap-1.5',
  '2xl': 'h-9 px-2.5 text-sm leading-none gap-2',
  icon: 'size-6 p-0 text-xs leading-none gap-0',
  'icon-xs': 'size-4 p-0 text-[10px] leading-none gap-0',
  'icon-sm': 'size-5 p-0 text-[11px] leading-none gap-0',
  'icon-lg': 'size-7 p-0 text-xs leading-none gap-0',
  'icon-xl': 'size-8 p-0 text-xs leading-none gap-0',
}

/**
 * Derives button dimensions from typographic scale and explicit props.
 * Default size is 24px (h-6) with 12px font and weight 700.
 */
function resolveButtonSize({ size, fontSize, className }) {
  if (fontSize) {
    if (fontSize === 'xs' || fontSize === '10px') return 'xs'
    if (fontSize === 'sm' || fontSize === '11px') return 'sm'
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

export const buttonVariants = cva(
  [
    'group/button font-montserrat font-bold font-[700] relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center tracking-tight whitespace-nowrap select-none leading-none outline-none',
    'transition-all duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black',
    'enabled:active:translate-y-px active:not-aria-[haspopup]:translate-y-px',
    'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-black disabled:pointer-events-none',
    '[&_svg]:pointer-events-none',
    'has-[[data-icon=inline-end]]:pr-2 has-[[data-icon=inline-start]]:pl-2',
  ],
  {
    variants: {
      variant: {
        default: VARIANTS.default.base,
        primary: VARIANTS.primary.base,
        outline: VARIANTS.outline.base,
        secondary: VARIANTS.secondary.base,
        ghost: VARIANTS.ghost.base,
        link: VARIANTS.link.base,
        destructive: VARIANTS.destructive.base,
        subtle: VARIANTS.subtle.base,
        neutral: VARIANTS.neutral.base,
        dashed: VARIANTS.dashed.base,
        double: VARIANTS.double.base,
        success: VARIANTS.success.base,
        caution: VARIANTS.caution.base,
        warning: VARIANTS.warning.base,
        danger: VARIANTS.danger.base,
        info: VARIANTS.info.base,
      },
      size: SIZES,
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
)

export const BUTTON_VARIANTS = Object.keys(VARIANTS)
export const BUTTON_SIZES = ['xs', 'sm', 'default', 'md', 'lg', 'xl', 'icon']

/** Accent colour a variant contributes to overlay effects. */
export const variantAccent = (variant) => (VARIANTS[variant] ?? VARIANTS.default).accent

function isOverlayElement(child) {
  return (
    isValidElement(child) &&
    (child.props?.staticBorderAnimVar !== undefined ||
      child.props?.hoverBorderAnimVar !== undefined ||
      child.props?.activeBorderAnimVar !== undefined ||
      child.props?.staticOverlayAnimVar !== undefined ||
      child.props?.hoverOverlayAnimVar !== undefined ||
      child.props?.activeOverlayAnimVar !== undefined ||
      child.props?.borderOverflow !== undefined ||
      child.type === Overlay ||
      child.type?.name === 'Overlay' ||
      child.type?.displayName === 'Overlay')
  )
}

export const Button = forwardRef(function Button(
  {
    asChild = false,
    children,
    className = '',
    variant = 'default',
    size = 'default',
    fontSize,
    radius = 0,
    color,
    ripple = true,
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = 'inline-start',
    style,
    ...props
  },
  ref
) {
  const v = VARIANTS[variant] ?? VARIANTS.default
  const resolvedSize = resolveButtonSize({ size, fontSize, className })
  const isTiny = resolvedSize === 'xs' || resolvedSize === 'icon-xs'
  const isSmall = resolvedSize === 'sm' || resolvedSize === 'icon-sm'
  const customColor = color || style?.color || style?.borderColor || style?.backgroundColor
  const accent = customColor || v.accent
  const rippleColor = customColor || v.ripple || v.accent
  const isDisabled = disabled || loading
  const host = { radius, accent, rippleColor, customColor, disabled: isDisabled }

  let startIcon = null
  let endIcon = null
  if (icon) {
    const iconEl = isValidElement(icon)
      ? cloneElement(icon, {
          'data-icon': iconPosition,
          'aria-hidden': true,
          ...icon.props,
        })
      : icon
    if (iconPosition === 'inline-end') {
      endIcon = iconEl
    } else {
      startIcon = iconEl
    }
  }

  // Separate Overlay elements from text/content so Overlay renders as a direct child of <button> (or slotted host)
  const overlays = []
  const content = []
  let slottedElement = null

  if (asChild) {
    Children.forEach(children, (child) => {
      if (isOverlayElement(child)) {
        overlays.push(child)
      } else if (!slottedElement && isValidElement(child)) {
        slottedElement = child
      } else {
        content.push(child)
      }
    })
    if (slottedElement) {
      const innerNodes = []
      Children.forEach(slottedElement.props?.children, (nested) => {
        if (isOverlayElement(nested)) {
          overlays.push(nested)
        } else {
          innerNodes.push(nested)
        }
      })
      slottedElement = cloneElement(slottedElement, undefined, ...innerNodes, ...content)
    }
  } else {
    Children.forEach(children, (child) => {
      if (isOverlayElement(child)) {
        overlays.push(child)
      } else {
        content.push(child)
      }
    })
  }

  if (ripple) {
    if (overlays.length === 0) {
      overlays.push(
        <Overlay
          key="__default-ripple"
          activeOverlayAnimVar="ripple"
          activeOverlayAnimVarModify={{ auto: false }}
        />
      )
    } else if (overlays.every((c) => c.props?.activeOverlayAnimVar === undefined)) {
      overlays[0] = cloneElement(overlays[0], {
        activeOverlayAnimVar: 'ripple',
        activeOverlayAnimVarModify: {
          auto: false,
          ...overlays[0].props?.activeOverlayAnimVarModify,
        },
      })
    }
  }

  const labelClassName = cn(
    "relative z-10 inline-flex items-center gap-[inherit] [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    variant === 'link' &&
      'after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 after:ease-out group-hover/button:after:scale-x-100 group-focus-visible/button:after:scale-x-100'
  )

  const spinnerNode = loading ? (
    <span
      className={cn(
        isTiny ? 'size-2' : isSmall ? 'size-2.5' : 'size-3',
        'animate-spin rounded-full border border-current border-t-transparent'
      )}
      aria-hidden="true"
    />
  ) : null

  const Comp = asChild ? Slot : 'button'

  return (
    <HostProvider value={host}>
      <Comp
        ref={ref}
        type={asChild ? undefined : 'button'}
        data-slot="button"
        disabled={asChild ? undefined : isDisabled}
        aria-disabled={asChild && isDisabled ? true : undefined}
        aria-busy={loading || undefined}
        style={{
          borderRadius: radius,
          ...(color ? { color, borderColor: color } : {}),
          ...style,
        }}
        className={cn(
          buttonVariants({ variant, size: resolvedSize, fullWidth }),
          isDisabled && asChild && 'pointer-events-none cursor-not-allowed opacity-40',
          className
        )}
        {...props}
      >
        {overlays}
        {spinnerNode}
        {asChild && slottedElement ? (
          <Slottable child={slottedElement}>
            {(slottedChildren) => (
              <span className={labelClassName}>
                {startIcon}
                {slottedChildren}
                {endIcon}
              </span>
            )}
          </Slottable>
        ) : (
          <span className={labelClassName}>
            {startIcon}
            {content}
            {endIcon}
          </span>
        )}
      </Comp>
    </HostProvider>
  )
})

Button.displayName = 'Button'

export default Button
