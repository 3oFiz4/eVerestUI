'use client'

import { Children, cloneElement, forwardRef, isValidElement } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../lib/utils.js'
import { HostProvider } from './context.js'
import { Overlay } from './Overlay.jsx'

/**
 * Technical, non-button Badge system built on Gestalt grouping and typographic status cues:
 *   01. `bracket`      - `[ · STATUS ]` Bracketed status telemetry with spinning or static dot/icon
 *   02. `ledger-flag`  - Solid vertical marker flag beside bold status label
 *   03. `pulse`        - Modifiable glowing status dot with organic breathing pulse
 *   04. `key-value`    - Architectural `KEY :: VALUE` datum with bottom hairline shelf
 *   05. `slash`        - `// KEY: VALUE //` Syntax telemetry with dimmed structural delimiters
 *   06. `index-ribbon` - Left structural index bar with micro key label over value
 *   07. `parallelogram`- 45° skewed technical badge inspired by @references/badge_idea.svg #1
 *   08. `chevron-flag` - Parallelogram badge preceded by an angled stripe indicator (badge_idea.svg #2)
 *   09. `delta-point`  - Angle-matched triangle indicator paired with reverse-slanted badge (badge_idea.svg #3)
 */

export const BADGE_VARIANTS = [
  'bracket',
  'ledger-flag',
  'pulse',
  'key-value',
  'slash',
  'index-ribbon',
  'parallelogram',
  'chevron-flag',
  'delta-point',
]

export const BADGE_SIZES = ['xs', 'sm', 'default', 'md', 'lg']

export const badgeVariants = cva(
  'group/badge relative isolate inline-flex shrink-0 items-center select-none leading-none tracking-wider',
  {
    variants: {
      variant: {
        bracket: 'font-mono text-white gap-1.5',
        'ledger-flag': 'font-montserrat font-bold text-white gap-1.5',
        pulse: 'font-mono font-bold tracking-widest text-white gap-2',
        'key-value': 'font-mono font-bold text-white gap-1.5 pb-0.5 border-b border-white/25',
        slash: 'font-mono text-white gap-1.5',
        'index-ribbon': 'font-mono text-white gap-2 border-l-2 border-white pl-2',
        parallelogram:
          'relative font-montserrat font-semibold text-black bg-white [clip-path:polygon(10px_0,100%_0,calc(100%-10px)_100%,0_100%)]',
        'chevron-flag': 'font-montserrat font-semibold text-white gap-1.5',
        'delta-point': 'font-montserrat font-semibold text-white gap-1.5',
      },
      size: {
        xs: 'text-[10px]',
        sm: 'text-[11px]',
        default: 'text-xs',
        md: 'text-xs',
        lg: 'text-sm',
      },
    },
    compoundVariants: [
      {
        variant: 'parallelogram',
        size: 'xs',
        className: 'px-3 py-0.5 text-[10px]',
      },
      {
        variant: 'parallelogram',
        size: 'sm',
        className: 'px-3.5 py-1 text-[11px]',
      },
      {
        variant: 'parallelogram',
        size: 'default',
        className: 'px-4 py-1.5 text-xs',
      },
      {
        variant: 'parallelogram',
        size: 'md',
        className: 'px-4 py-1.5 text-xs',
      },
      {
        variant: 'parallelogram',
        size: 'lg',
        className: 'px-5 py-2 text-sm',
      },
    ],
    defaultVariants: {
      variant: 'bracket',
      size: 'default',
    },
  }
)

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

export const Badge = forwardRef(function Badge(
  {
    asChild = false,
    children,
    className = '',
    variant = 'bracket',
    size = 'default',
    color,
    labelKey,
    separator,
    icon,
    spinning = false,
    pulse = true,
    pulseSpeed,
    modify = {},
    render,
    radius = 0,
    style,
    ...props
  },
  ref
) {
  const Comp = asChild ? Slot : 'span'

  const overlays = []
  const content = []
  Children.forEach(children, (child) => {
    if (isOverlayElement(child)) {
      overlays.push(child)
    } else {
      content.push(child)
    }
  })

  // Custom render prop override
  if (typeof render === 'function') {
    return (
      <Comp
        ref={ref}
        data-slot="badge"
        data-variant={variant}
        data-size={size}
        style={{ ...style }}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {overlays}
        {render({ variant, size, color, content })}
      </Comp>
    )
  }

  const customColorStyle = color ? { color, borderColor: color } : {}
  const bgCustomColorStyle = color ? { backgroundColor: color } : {}

  const hostContextValue = {
    radius,
    accent: color,
    rippleColor: color,
    customColor: color,
    disabled: false,
  }

  // --- Sub-renderer by variant ---
  const renderBadgeContent = () => {
    if (variant === 'bracket') {
      const openBracket = modify.openBracket ?? '['
      const closeBracket = modify.closeBracket ?? ']'
      const bracketColor = modify.bracketColor ?? 'text-white/40'
      const iconNode = icon ? (
        isValidElement(icon) ? (
          cloneElement(icon, {
            className: cn('size-3 shrink-0', spinning && 'animate-spin', icon.props?.className),
          })
        ) : (
          icon
        )
      ) : spinning ? (
        <span
          aria-hidden="true"
          className="size-2.5 animate-spin rounded-full border border-current border-t-transparent opacity-80"
        />
      ) : null

      return (
        <>
          <span className={cn('font-normal select-none', bracketColor)}>{openBracket}</span>
          {iconNode}
          <span>{content}</span>
          <span className={cn('font-normal select-none', bracketColor)}>{closeBracket}</span>
        </>
      )
    }

    if (variant === 'ledger-flag') {
      const flagWidth = modify.flagWidth ?? 3
      const flagHeight = modify.flagHeight ?? 12
      return (
        <>
          <span
            aria-hidden="true"
            style={{
              width: `${flagWidth}px`,
              height: `${flagHeight}px`,
              ...bgCustomColorStyle,
            }}
            className="inline-block bg-white shrink-0"
          />
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{content}</span>
        </>
      )
    }

    if (variant === 'pulse') {
      const dotSize = modify.dotSize ?? (size === 'xs' ? 5 : size === 'lg' ? 8 : 6)
      const dotColor = modify.dotColor || color
      const isAnimated = modify.pulse ?? pulse
      const duration = pulseSpeed || modify.pulseSpeed || '1.8s'
      return (
        <>
          <span
            aria-hidden="true"
            style={{
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              animationDuration: duration,
              ...(dotColor ? { backgroundColor: dotColor } : {}),
            }}
            className={cn(
              'inline-block shrink-0 rounded-full bg-white',
              isAnimated && 'animate-pulse'
            )}
          />
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{content}</span>
        </>
      )
    }

    if (variant === 'key-value') {
      const sep = separator || modify.separator || '::'
      const keyText = labelKey || modify.key || 'KEY'
      return (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="text-white/45">{keyText}</span>
          <span className="text-white/30">{sep}</span>
          <span className="text-white">{content}</span>
        </>
      )
    }

    if (variant === 'slash') {
      const delim = modify.delimiter ?? '//'
      const keyText = labelKey || modify.key
      return (
        <>
          <span className="text-white/35 font-normal select-none">{delim}</span>
          {keyText && <span className="text-white/50">{keyText}:</span>}
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{content}</span>
          <span className="text-white/35 font-normal select-none">{delim}</span>
        </>
      )
    }

    if (variant === 'index-ribbon') {
      const keyText = labelKey || modify.key
      return (
        <>
          {keyText && (
            <span className="text-white/45 font-normal text-[10px] uppercase tracking-wider">
              {keyText}
            </span>
          )}
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{content}</span>
        </>
      )
    }

    if (variant === 'parallelogram') {
      return (
        <>
          {icon && <span className="shrink-0 mr-1.5">{icon}</span>}
          <span>{content}</span>
        </>
      )
    }

    if (variant === 'chevron-flag') {
      const stripeWidth = modify.stripeWidth ?? 6
      return (
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            style={{
              width: `${stripeWidth}px`,
              ...bgCustomColorStyle,
            }}
            className="self-stretch bg-white [clip-path:polygon(4px_0,100%_0,calc(100%-4px)_100%,0_100%)]"
          />
          <span
            style={{ ...bgCustomColorStyle, ...(color ? { color: '#000000' } : {}) }}
            className="inline-flex items-center px-3 py-1 bg-white text-black font-semibold [clip-path:polygon(6px_0,100%_0,calc(100%-6px)_100%,0_100%)]"
          >
            {icon && <span className="shrink-0 mr-1.5">{icon}</span>}
            {content}
          </span>
        </span>
      )
    }

    if (variant === 'delta-point') {
      return (
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            style={{ ...bgCustomColorStyle }}
            className="size-3 bg-white shrink-0 [clip-path:polygon(50%_0,100%_100%,0_100%)]"
          />
          <span
            style={{ ...bgCustomColorStyle, ...(color ? { color: '#000000' } : {}) }}
            className="inline-flex items-center px-3 py-1 bg-white text-black font-semibold [clip-path:polygon(0_0,calc(100%-6px)_0,100%_100%,6px_100%)]"
          >
            {icon && <span className="shrink-0 mr-1.5">{icon}</span>}
            {content}
          </span>
        </span>
      )
    }

    return content
  }

  return (
    <HostProvider value={hostContextValue}>
      <Comp
        ref={ref}
        data-slot="badge"
        data-variant={variant}
        data-size={size}
        style={{
          borderRadius: radius,
          ...customColorStyle,
          ...style,
        }}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {overlays}
        {renderBadgeContent()}
      </Comp>
    </HostProvider>
  )
})

Badge.displayName = 'Badge'

export default Badge
