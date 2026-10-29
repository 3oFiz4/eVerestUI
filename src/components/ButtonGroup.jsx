'use client'

import { forwardRef, useState } from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../lib/utils.js'

/**
 * ButtonGroup & ButtonGroupSeparator
 *
 * Monochrome architectural grouping for Button, Input, and arbitrary controls.
 *
 * Structural paradigms (`variant`):
 * - `monolithic` (default): Adjacent 1px borders overlap seamlessly (`-ml-px` / `-mt-px`).
 *   Hovered and focus-visible children auto-elevate (`z-20`) so crisp 1px borders and
 *   overlay effects are never truncated by a neighbor.
 * - `recessed`: A recessed 1px perimeter chassis (`border-white/25 bg-black p-0.5 gap-0.5`)
 *   encapsulates flush-mounted micro buttons with high-contrast active engagement.
 * - `underline`: Hover-only sliding 2px anchor rail that glides across the track to
 *   follow whichever button is currently hovered.
 * - `lens`: Hover-only Expanding Context Lens — buttons rest at compact icon width and
 *   expand (`hover:w-28`) with inverted high-contrast fill when hovered.
 *
 * Nesting:
 * - When a `ButtonGroup` contains child `ButtonGroup` elements
 *   (`has-[>[data-slot=button-group]]`), it automatically acts as a layout cluster
 *   with a clean gap instead of collapsing borders across sub-groups.
 */

export const BUTTON_GROUP_ORIENTATIONS = ['horizontal', 'vertical']
export const BUTTON_GROUP_VARIANTS = ['monolithic', 'recessed', 'underline', 'lens']

export const buttonGroupVariants = cva(
  [
    'group/button-group relative isolate inline-flex w-fit shrink-0 select-none',
    '[&>*:hover]:z-20 [&>*:focus-visible]:z-20 [&>*:active]:z-20',
    'has-[>[data-slot=button-group]]:border-0 has-[>[data-slot=button-group]]:bg-transparent has-[>[data-slot=button-group]]:p-0 has-[>[data-slot=button-group]]:gap-2',
  ],
  {
    variants: {
      orientation: {
        horizontal: 'flex-row items-center',
        vertical: 'flex-col items-stretch',
      },
      variant: {
        monolithic: '',
        recessed: 'border border-white/25 bg-black p-0.5 gap-0.5 [&>[data-slot=button]]:border-transparent',
        underline: '[&>[data-slot=button]]:border-transparent [&>[data-slot=button]]:bg-transparent [&>[data-slot=button]]:text-white [&>[data-slot=button]:hover]:bg-white/5',
        lens: 'border border-white/20 bg-black [&>[data-slot=button]]:w-9 [&>[data-slot=button]]:px-2.5 [&>[data-slot=button]]:justify-start [&>[data-slot=button]]:overflow-hidden [&>[data-slot=button]]:border-white/20 [&>[data-slot=button]]:bg-black [&>[data-slot=button]]:text-white [&>[data-slot=button]]:transition-all [&>[data-slot=button]]:duration-200 [&>[data-slot=button]:hover]:w-28 [&>[data-slot=button]:hover]:bg-white [&>[data-slot=button]:hover]:text-black [&>[data-slot=button]:hover]:border-white',
      },
    },
    compoundVariants: [
      {
        orientation: 'horizontal',
        variant: 'monolithic',
        className:
          '[&>*:not([data-slot=button-group]):not(:first-child)]:-ml-px [&>*:not([data-slot=button-group]):not(:first-child)]:rounded-l-none [&>*:not([data-slot=button-group]):not(:last-child)]:rounded-r-none',
      },
      {
        orientation: 'vertical',
        variant: 'monolithic',
        className:
          '[&>*:not([data-slot=button-group]):not(:first-child)]:-mt-px [&>*:not([data-slot=button-group]):not(:first-child)]:rounded-t-none [&>*:not([data-slot=button-group]):not(:last-child)]:rounded-b-none',
      },
      {
        orientation: 'horizontal',
        variant: 'underline',
        className: '-space-x-px pb-[2px]',
      },
      {
        orientation: 'vertical',
        variant: 'underline',
        className: '-space-y-px pr-[2px]',
      },
      {
        orientation: 'horizontal',
        variant: 'lens',
        className: '-space-x-px',
      },
      {
        orientation: 'vertical',
        variant: 'lens',
        className: '-space-y-px',
      },
    ],
    defaultVariants: {
      orientation: 'horizontal',
      variant: 'monolithic',
    },
  }
)

export const buttonGroupSeparatorVariants = cva(
  'pointer-events-none relative z-10 shrink-0 bg-white/25',
  {
    variants: {
      orientation: {
        horizontal: 'h-px w-full my-0.5',
        vertical: 'w-px self-stretch my-1',
        auto: 'w-px self-stretch my-1 group-data-[orientation=vertical]/button-group:h-px group-data-[orientation=vertical]/button-group:w-full group-data-[orientation=vertical]/button-group:my-0.5 group-data-[orientation=vertical]/button-group:self-auto',
      },
    },
    defaultVariants: {
      orientation: 'auto',
    },
  }
)

export const ButtonGroup = forwardRef(function ButtonGroup(
  {
    asChild = false,
    children,
    className = '',
    orientation = 'horizontal',
    variant = 'monolithic',
    onPointerOver,
    onPointerLeave,
    ...props
  },
  ref
) {
  const dir = orientation === 'vertical' ? 'vertical' : 'horizontal'
  const mode = BUTTON_GROUP_VARIANTS.includes(variant) ? variant : 'monolithic'
  const [anchor, setAnchor] = useState({ left: 0, width: 0, top: 0, height: 0, visible: false })

  const handlePointerOver = (e) => {
    onPointerOver?.(e)
    if (mode !== 'underline') return
    const item = e.target.closest('[data-slot=button], button, a')
    if (item && e.currentTarget.contains(item)) {
      setAnchor({
        left: item.offsetLeft,
        width: item.offsetWidth,
        top: item.offsetTop,
        height: item.offsetHeight,
        visible: true,
      })
    }
  }

  const handlePointerLeave = (e) => {
    onPointerLeave?.(e)
    if (mode !== 'underline') return
    setAnchor((prev) => ({ ...prev, visible: false }))
  }

  const Comp = asChild ? Slot : 'div'

  const underlineRail =
    mode === 'underline' ? (
      dir === 'vertical' ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 h-full w-[2px] bg-white/15"
        >
          <div
            style={{
              transform: `translateY(${anchor.top}px)`,
              height: `${anchor.height}px`,
              opacity: anchor.visible ? 1 : 0,
            }}
            className="absolute top-0 left-0 w-full bg-white transition-all duration-300 ease-out"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 left-0 h-[2px] w-full bg-white/15"
        >
          <div
            style={{
              transform: `translateX(${anchor.left}px)`,
              width: `${anchor.width}px`,
              opacity: anchor.visible ? 1 : 0,
            }}
            className="absolute top-0 left-0 h-full bg-white transition-all duration-300 ease-out"
          />
        </div>
      )
    ) : null

  return (
    <Comp
      ref={ref}
      role="group"
      data-slot="button-group"
      data-orientation={dir}
      data-variant={mode}
      onPointerOver={handlePointerOver}
      onPointerLeave={handlePointerLeave}
      className={cn(buttonGroupVariants({ orientation: dir, variant: mode }), className)}
      {...props}
    >
      {asChild ? <Slottable>{children}</Slottable> : children}
      {underlineRail}
    </Comp>
  )
})

ButtonGroup.displayName = 'ButtonGroup'

/**
 * 1px structural divider between borderless (`secondary`, `ghost`, `recessed`) buttons.
 * Automatically adapts to parent `ButtonGroup` orientation via `data-orientation`,
 * or accepts an explicit `orientation` prop (`'vertical' | 'horizontal'`).
 */
export const ButtonGroupSeparator = forwardRef(function ButtonGroupSeparator(
  { asChild = false, className = '', orientation, ...props },
  ref
) {
  const resolvedOrientation =
    orientation === 'horizontal' || orientation === 'vertical' ? orientation : 'auto'
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      data-slot="button-group-separator"
      className={cn(buttonGroupSeparatorVariants({ orientation: resolvedOrientation }), className)}
      {...props}
    />
  )
})

ButtonGroupSeparator.displayName = 'ButtonGroupSeparator'

export default ButtonGroup
