'use client'

import { Children, createContext, forwardRef, isValidElement, useContext } from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../lib/utils.js'
import { HostProvider } from './context.js'
import { Overlay } from './Overlay.jsx'

/**
 * Monochrome architectural Card system with 10 structural variants:
 *   01. `ledger-bracket`    - Crisp 1px perimeter with L-bracket corner reticles & ledger rules
 *   02. `milled-chassis`    - Double-walled CNC outer frame + recessed inner chamber + corner pins
 *   03. `vertical-gutter`   - Asymmetric 2-col layout with rotated vertical title spine on left
 *   04. `segmented`         - Cockpit rack with discrete 1px-bordered compartmentalized cells
 *   05. `shutter-split`     - Inverted solid-white header shutter over pitch-black payload body
 *   06. `crosshair-grid`    - Exposed hairline grid with `+` intersection crosshairs at 4 vertices
 *   07. `chamfer-notch`     - 45° polygon beveled top-right & bottom-left corners with 1px shell
 *   08. `hazard-telemetry`  - Top `-45deg` diagonal hazard scanline strip + datum square title
 *   09. `pillar-monolith`   - Thick 4px left solid-white structural I-beam spine with open interior
 *   10. `index-tab`         - Top-docked solid white dossier register tab with dashed dividers
 */

export const CARD_VARIANTS = [
  'ledger-bracket',
  'milled-chassis',
  'vertical-gutter',
  'segmented',
  'shutter-split',
  'crosshair-grid',
  'chamfer-notch',
  'hazard-telemetry',
  'pillar-monolith',
  'index-tab',
]

export const CARD_SIZES = ['sm', 'default', 'md', 'lg']

const VARIANT_ALIASES = {
  default: 'ledger-bracket',
  ledger: 'ledger-bracket',
  milled: 'milled-chassis',
  gutter: 'vertical-gutter',
  vertical: 'vertical-gutter',
  cockpit: 'segmented',
  shutter: 'shutter-split',
  crosshair: 'crosshair-grid',
  chamfer: 'chamfer-notch',
  hazard: 'hazard-telemetry',
  pillar: 'pillar-monolith',
  tab: 'index-tab',
}

function resolveCardVariant(variant) {
  if (!variant) return 'ledger-bracket'
  if (VARIANT_ALIASES[variant]) return VARIANT_ALIASES[variant]
  return CARD_VARIANTS.includes(variant) ? variant : 'ledger-bracket'
}

function resolveCardSize(size) {
  if (size === 'sm' || size === 'lg') return size
  return 'default'
}

const CardContext = createContext({
  variant: 'ledger-bracket',
  size: 'default',
})

const useCardContext = () => useContext(CardContext)

export const cardVariants = cva(
  'group/card font-montserrat relative isolate text-left text-white transition-colors duration-150',
  {
    variants: {
      variant: {
        'ledger-bracket': 'flex flex-col border border-white/25 bg-black',
        'milled-chassis': 'flex flex-col border border-white/30 bg-black p-1.5',
        'vertical-gutter': 'grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] border border-white/25 bg-black',
        segmented: 'flex flex-col gap-1 border border-white/25 bg-white/[0.06] p-1',
        'shutter-split': 'flex flex-col border border-white bg-black',
        'crosshair-grid': 'flex flex-col border border-white/25 bg-black',
        'chamfer-notch':
          'flex flex-col bg-white/35 p-px [clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,14px_100%,0_calc(100%-14px))]',
        'hazard-telemetry': 'flex flex-col overflow-hidden border border-white/25 bg-black',
        'pillar-monolith': 'flex flex-col border border-white/15 border-l-4 border-l-white bg-black',
        'index-tab': 'flex flex-col border border-white/25 bg-black',
      },
      size: {
        sm: 'w-full max-w-xs text-xs',
        default: 'w-full max-w-sm text-xs',
        md: 'w-full max-w-sm text-xs',
        lg: 'w-full max-w-md text-sm',
      },
      fullWidth: {
        true: 'max-w-none w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'ledger-bracket',
      size: 'default',
      fullWidth: false,
    },
  }
)

export const cardHeaderVariants = cva('relative z-10', {
  variants: {
    variant: {
      'ledger-bracket':
        'grid auto-rows-min items-start gap-x-4 gap-y-1 border-b border-white/15 has-[[data-slot=card-action]]:grid-cols-[1fr_auto]',
      'milled-chassis':
        'grid auto-rows-min items-start gap-x-4 gap-y-1 border-b border-white/15 has-[[data-slot=card-action]]:grid-cols-[1fr_auto]',
      'vertical-gutter':
        'row-span-2 col-start-1 flex flex-col items-center justify-between gap-4 border-r border-white/25 bg-white/[0.02]',
      segmented:
        'grid auto-rows-min items-start gap-x-4 gap-y-1 border border-white/20 bg-black has-[[data-slot=card-action]]:grid-cols-[1fr_auto]',
      'shutter-split':
        'grid auto-rows-min items-start gap-x-4 gap-y-1 border-b border-white bg-white text-black has-[[data-slot=card-action]]:grid-cols-[1fr_auto]',
      'crosshair-grid':
        'grid auto-rows-min items-start gap-x-4 gap-y-1 border-b border-white/25 has-[[data-slot=card-action]]:grid-cols-[1fr_auto]',
      'chamfer-notch':
        'grid auto-rows-min items-start gap-x-4 gap-y-1 border-b border-white/15 has-[[data-slot=card-action]]:grid-cols-[1fr_auto]',
      'hazard-telemetry':
        'grid auto-rows-min items-start gap-x-4 gap-y-1 border-b border-white/15 has-[[data-slot=card-action]]:grid-cols-[1fr_auto]',
      'pillar-monolith':
        'grid auto-rows-min items-start gap-x-4 gap-y-1 pb-1 has-[[data-slot=card-action]]:grid-cols-[1fr_auto]',
      'index-tab':
        'grid auto-rows-min items-start gap-x-4 gap-y-1 border-b border-dashed border-white/20 has-[[data-slot=card-action]]:grid-cols-[1fr_auto]',
    },
    size: {
      sm: 'px-3.5 py-2.5',
      default: 'px-4 py-3.5',
      md: 'px-4 py-3.5',
      lg: 'px-5 py-4',
    },
  },
  compoundVariants: [
    {
      variant: 'vertical-gutter',
      size: 'sm',
      className: 'px-2.5 py-3',
    },
    {
      variant: 'vertical-gutter',
      size: 'default',
      className: 'px-3 py-4',
    },
    {
      variant: 'vertical-gutter',
      size: 'lg',
      className: 'px-3.5 py-5',
    },
    {
      variant: 'index-tab',
      size: 'sm',
      className: 'pt-3.5',
    },
    {
      variant: 'index-tab',
      size: 'default',
      className: 'pt-4',
    },
    {
      variant: 'index-tab',
      size: 'lg',
      className: 'pt-5',
    },
  ],
  defaultVariants: {
    variant: 'ledger-bracket',
    size: 'default',
  },
})

export const cardTitleVariants = cva('font-montserrat font-bold tracking-tight leading-snug', {
  variants: {
    variant: {
      'ledger-bracket': 'text-white',
      'milled-chassis': 'text-white',
      'vertical-gutter': 'text-white uppercase tracking-wider whitespace-nowrap',
      segmented: 'text-white uppercase tracking-wide',
      'shutter-split': 'text-black',
      'crosshair-grid':
        "text-white uppercase tracking-wider before:mr-1.5 before:font-mono before:text-white/45 before:content-['//']",
      'chamfer-notch': 'text-white uppercase tracking-wide',
      'hazard-telemetry':
        "flex items-center gap-2 text-white uppercase tracking-wide before:inline-block before:size-1.5 before:shrink-0 before:bg-white before:content-['']",
      'pillar-monolith': 'text-white',
      'index-tab': 'font-mono text-white uppercase tracking-tight',
    },
    size: {
      sm: 'text-xs',
      default: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'ledger-bracket',
    size: 'default',
  },
})

export const cardDescriptionVariants = cva('font-mono leading-relaxed', {
  variants: {
    variant: {
      'ledger-bracket': 'text-white/55',
      'milled-chassis': 'text-white/55',
      'vertical-gutter': 'text-white/50 whitespace-nowrap',
      segmented: 'text-white/55',
      'shutter-split': 'text-black/65',
      'crosshair-grid': 'text-white/55',
      'chamfer-notch': 'text-white/55',
      'hazard-telemetry': 'text-white/55',
      'pillar-monolith': 'text-white/55',
      'index-tab': 'text-white/55',
    },
    size: {
      sm: 'text-[10px]',
      default: 'text-[11px]',
      md: 'text-[11px]',
      lg: 'text-xs',
    },
  },
  defaultVariants: {
    variant: 'ledger-bracket',
    size: 'default',
  },
})

export const cardActionVariants = cva('shrink-0', {
  variants: {
    variant: {
      'ledger-bracket': 'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
      'milled-chassis': 'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
      'vertical-gutter': 'order-first self-center',
      segmented: 'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
      'shutter-split':
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end [&_[data-slot=button]]:border-black [&_[data-slot=button]]:bg-black [&_[data-slot=button]]:text-white [&_[data-slot=button]:hover]:bg-black/80',
      'crosshair-grid': 'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
      'chamfer-notch': 'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
      'hazard-telemetry': 'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
      'pillar-monolith': 'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
      'index-tab': 'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
    },
    size: {
      sm: '',
      default: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    variant: 'ledger-bracket',
    size: 'default',
  },
})

export const cardContentVariants = cva('relative z-10 flex-1 leading-relaxed text-white/80', {
  variants: {
    variant: {
      'ledger-bracket': '',
      'milled-chassis': '',
      'vertical-gutter': 'col-start-2 row-start-1',
      segmented: 'border border-white/15 bg-black',
      'shutter-split': 'bg-black',
      'crosshair-grid': '',
      'chamfer-notch': '',
      'hazard-telemetry': '',
      'pillar-monolith': '',
      'index-tab': '',
    },
    size: {
      sm: 'px-3.5 py-3 text-[11px]',
      default: 'px-4 py-4 text-xs',
      md: 'px-4 py-4 text-xs',
      lg: 'px-5 py-5 text-sm',
    },
  },
  defaultVariants: {
    variant: 'ledger-bracket',
    size: 'default',
  },
})

export const cardFooterVariants = cva(
  'relative z-10 flex items-center justify-between gap-2 font-mono text-white/55',
  {
    variants: {
      variant: {
        'ledger-bracket': 'border-t border-white/15',
        'milled-chassis': 'border-t border-white/15 bg-black/60',
        'vertical-gutter': 'col-start-2 row-start-2 border-t border-white/15',
        segmented: 'border border-white/20 bg-black',
        'shutter-split': 'border-t border-white/20 bg-white/[0.03]',
        'crosshair-grid': 'border-t border-white/25 bg-white/[0.02] uppercase tracking-wider',
        'chamfer-notch': 'border-t border-white/15',
        'hazard-telemetry': 'border-t border-white/15 bg-white/[0.02] uppercase tracking-widest',
        'pillar-monolith': 'border-t border-white/10 text-white/45',
        'index-tab': 'border-t border-dashed border-white/20',
      },
      size: {
        sm: 'px-3.5 py-2 text-[10px]',
        default: 'px-4 py-2.5 text-[11px]',
        md: 'px-4 py-2.5 text-[11px]',
        lg: 'px-5 py-3 text-xs',
      },
    },
    defaultVariants: {
      variant: 'ledger-bracket',
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

function isActionElement(child) {
  return (
    isValidElement(child) &&
    (child.type === CardAction ||
      child.type?.displayName === 'CardAction' ||
      child.props?.['data-slot'] === 'card-action' ||
      child.props?.comp === 'CardAction')
  )
}

export const Card = forwardRef(function Card(
  {
    asChild = false,
    children,
    className = '',
    variant = 'ledger-bracket',
    size = 'default',
    fullWidth = false,
    radius = 0,
    accent,
    style,
    ...props
  },
  ref
) {
  const resolvedVariant = resolveCardVariant(variant)
  const resolvedSize = resolveCardSize(size)
  const Comp = asChild ? Slot : 'div'

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
  } else {
    Children.forEach(children, (child) => {
      if (isOverlayElement(child)) {
        overlays.push(child)
      } else {
        content.push(child)
      }
    })
  }

  const renderBody = (nodes) =>
    resolvedVariant === 'milled-chassis' ? (
      <div
        data-slot="card-inner"
        className="milled-card-inner relative z-10 flex flex-1 flex-col border border-white/15 bg-white/[0.02]"
      >
        {nodes}
      </div>
    ) : resolvedVariant === 'chamfer-notch' ? (
      <div
        data-slot="card-inner"
        className="relative z-10 flex flex-1 flex-col bg-black [clip-path:polygon(0_0,calc(100%-13.5px)_0,100%_13.5px,100%_100%,13.5px_100%,0_calc(100%-13.5px))]"
      >
        {nodes}
      </div>
    ) : (
      nodes
    )

  return (
    <HostProvider value={{ radius, accent }}>
      <CardContext.Provider value={{ variant: resolvedVariant, size: resolvedSize }}>
        <Comp
          ref={ref}
          data-slot="card"
          data-variant={resolvedVariant}
          data-size={resolvedSize}
          style={{ borderRadius: radius, ...style }}
          className={cn(
            cardVariants({ variant: resolvedVariant, size: resolvedSize, fullWidth }),
            className
          )}
          {...props}
        >
          {overlays}

          {resolvedVariant === 'ledger-bracket' && (
            <>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-px -left-px z-20 size-2.5 border-t-2 border-l-2 border-white"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-px -right-px z-20 size-2.5 border-t-2 border-r-2 border-white"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-px -left-px z-20 size-2.5 border-b-2 border-l-2 border-white"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-px -bottom-px z-20 size-2.5 border-r-2 border-b-2 border-white"
              />
            </>
          )}

          {resolvedVariant === 'milled-chassis' && (
            <>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0.5 left-0.5 z-20 size-1 bg-white/45"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0.5 right-0.5 z-20 size-1 bg-white/45"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0.5 left-0.5 z-20 size-1 bg-white/45"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-0.5 bottom-0.5 z-20 size-1 bg-white/45"
              />
            </>
          )}

          {resolvedVariant === 'crosshair-grid' && (
            <>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-1.5 -left-1 z-20 font-mono text-[11px] leading-none text-white select-none"
              >
                +
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-1.5 -right-1 z-20 font-mono text-[11px] leading-none text-white select-none"
              >
                +
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-1.5 -left-1 z-20 font-mono text-[11px] leading-none text-white select-none"
              >
                +
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-1 -bottom-1.5 z-20 font-mono text-[11px] leading-none text-white select-none"
              >
                +
              </span>
            </>
          )}

          {resolvedVariant === 'hazard-telemetry' && (
            <div
              aria-hidden="true"
              className="pointer-events-none relative z-10 h-1.5 w-full shrink-0 border-b border-white/20"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(-45deg, rgba(255,255,255,0.75) 0px, rgba(255,255,255,0.75) 4px, transparent 4px, transparent 8px)',
              }}
            />
          )}

          {resolvedVariant === 'index-tab' && (
            <>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 z-20 h-1 w-14 bg-white"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-3 z-20 h-1 w-2 bg-white/40"
              />
            </>
          )}

          {asChild && slottedElement ? (
            <Slottable child={slottedElement}>
              {(slottedChildren) => renderBody([slottedChildren, ...content])}
            </Slottable>
          ) : (
            renderBody(content)
          )}
        </Comp>
      </CardContext.Provider>
    </HostProvider>
  )
})

Card.displayName = 'Card'

export const CardHeader = forwardRef(function CardHeader(
  { asChild = false, children, className = '', variant, size, ...props },
  ref
) {
  const ctx = useCardContext()
  const resolvedVariant = variant ? resolveCardVariant(variant) : ctx.variant
  const resolvedSize = size ? resolveCardSize(size) : ctx.size
  const Comp = asChild ? Slot : 'div'

  if (resolvedVariant === 'vertical-gutter' && !asChild) {
    const actions = []
    const titles = []
    Children.forEach(children, (child) => {
      if (isActionElement(child)) {
        actions.push(child)
      } else {
        titles.push(child)
      }
    })
    return (
      <Comp
        ref={ref}
        data-slot="card-header"
        data-variant={resolvedVariant}
        data-size={resolvedSize}
        className={cn(cardHeaderVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
        {...props}
      >
        {actions}
        <div
          data-slot="card-gutter-wrap"
          className="gutter-title-wrap flex flex-col gap-0.5 [writing-mode:vertical-rl] rotate-180"
        >
          {titles}
        </div>
      </Comp>
    )
  }

  return (
    <Comp
      ref={ref}
      data-slot="card-header"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      className={cn(cardHeaderVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
      {...props}
    >
      {children}
    </Comp>
  )
})

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef(function CardTitle(
  { asChild = false, children, className = '', variant, size, ...props },
  ref
) {
  const ctx = useCardContext()
  const resolvedVariant = variant ? resolveCardVariant(variant) : ctx.variant
  const resolvedSize = size ? resolveCardSize(size) : ctx.size
  const Comp = asChild ? Slot : 'h3'

  return (
    <Comp
      ref={ref}
      data-slot="card-title"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      className={cn(cardTitleVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
      {...props}
    >
      {children}
    </Comp>
  )
})

CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef(function CardDescription(
  { asChild = false, children, className = '', variant, size, ...props },
  ref
) {
  const ctx = useCardContext()
  const resolvedVariant = variant ? resolveCardVariant(variant) : ctx.variant
  const resolvedSize = size ? resolveCardSize(size) : ctx.size
  const Comp = asChild ? Slot : 'p'

  return (
    <Comp
      ref={ref}
      data-slot="card-description"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      className={cn(
        cardDescriptionVariants({ variant: resolvedVariant, size: resolvedSize }),
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
})

CardDescription.displayName = 'CardDescription'

export const CardAction = forwardRef(function CardAction(
  { asChild = false, children, className = '', variant, size, ...props },
  ref
) {
  const ctx = useCardContext()
  const resolvedVariant = variant ? resolveCardVariant(variant) : ctx.variant
  const resolvedSize = size ? resolveCardSize(size) : ctx.size
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      ref={ref}
      data-slot="card-action"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      className={cn(cardActionVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
      {...props}
    >
      {children}
    </Comp>
  )
})

CardAction.displayName = 'CardAction'

export const CardContent = forwardRef(function CardContent(
  { asChild = false, children, className = '', variant, size, ...props },
  ref
) {
  const ctx = useCardContext()
  const resolvedVariant = variant ? resolveCardVariant(variant) : ctx.variant
  const resolvedSize = size ? resolveCardSize(size) : ctx.size
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      ref={ref}
      data-slot="card-content"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      className={cn(cardContentVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
      {...props}
    >
      {children}
    </Comp>
  )
})

CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef(function CardFooter(
  { asChild = false, children, className = '', variant, size, ...props },
  ref
) {
  const ctx = useCardContext()
  const resolvedVariant = variant ? resolveCardVariant(variant) : ctx.variant
  const resolvedSize = size ? resolveCardSize(size) : ctx.size
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      ref={ref}
      data-slot="card-footer"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      className={cn(cardFooterVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
      {...props}
    >
      {children}
    </Comp>
  )
})

CardFooter.displayName = 'CardFooter'

export default Card
