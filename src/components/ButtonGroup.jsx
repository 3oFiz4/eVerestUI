import { useState } from 'react'

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

const ORIENTATION_CLASSES = {
  horizontal: {
    monolithic:
      'flex-row items-center [&>*:not([data-slot=button-group]):not(:first-child)]:-ml-px [&>*:not([data-slot=button-group]):not(:first-child)]:rounded-l-none [&>*:not([data-slot=button-group]):not(:last-child)]:rounded-r-none',
    recessed:
      'flex-row items-center border border-white/25 bg-black p-0.5 gap-0.5 [&>[data-slot=button]]:border-transparent',
    underline:
      'flex-row items-center -space-x-px [&>[data-slot=button]]:border-transparent [&>[data-slot=button]]:bg-transparent [&>[data-slot=button]]:text-white [&>[data-slot=button]:hover]:bg-white/5',
    lens:
      'flex-row items-center -space-x-px border border-white/20 bg-black [&>[data-slot=button]]:w-9 [&>[data-slot=button]]:px-2.5 [&>[data-slot=button]]:justify-start [&>[data-slot=button]]:overflow-hidden [&>[data-slot=button]]:border-white/20 [&>[data-slot=button]]:bg-black [&>[data-slot=button]]:text-white [&>[data-slot=button]]:transition-all [&>[data-slot=button]]:duration-200 [&>[data-slot=button]:hover]:w-28 [&>[data-slot=button]:hover]:bg-white [&>[data-slot=button]:hover]:text-black [&>[data-slot=button]:hover]:border-white',
    nested: 'flex-row items-center gap-2',
  },
  vertical: {
    monolithic:
      'flex-col items-stretch [&>*:not([data-slot=button-group]):not(:first-child)]:-mt-px [&>*:not([data-slot=button-group]):not(:first-child)]:rounded-t-none [&>*:not([data-slot=button-group]):not(:last-child)]:rounded-b-none',
    recessed:
      'flex-col items-stretch border border-white/25 bg-black p-0.5 gap-0.5 [&>[data-slot=button]]:border-transparent',
    underline:
      'flex-col items-stretch -space-y-px [&>[data-slot=button]]:border-transparent [&>[data-slot=button]]:bg-transparent [&>[data-slot=button]]:text-white [&>[data-slot=button]:hover]:bg-white/5',
    lens:
      'flex-col items-stretch -space-y-px border border-white/20 bg-black [&>[data-slot=button]]:w-9 [&>[data-slot=button]]:px-2.5 [&>[data-slot=button]]:justify-start [&>[data-slot=button]]:overflow-hidden [&>[data-slot=button]]:border-white/20 [&>[data-slot=button]]:bg-black [&>[data-slot=button]]:text-white [&>[data-slot=button]]:transition-all [&>[data-slot=button]]:duration-200 [&>[data-slot=button]:hover]:w-28 [&>[data-slot=button]:hover]:bg-white [&>[data-slot=button]:hover]:text-black [&>[data-slot=button]:hover]:border-white',
    nested: 'flex-col items-start gap-2',
  },
}

export function ButtonGroup({
  children,
  className = '',
  orientation = 'horizontal',
  variant = 'monolithic',
  onPointerOver,
  onPointerLeave,
  ...props
}) {
  const dir = orientation === 'vertical' ? 'vertical' : 'horizontal'
  const mode = BUTTON_GROUP_VARIANTS.includes(variant) ? variant : 'monolithic'
  const o = ORIENTATION_CLASSES[dir]
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

  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={dir}
      data-variant={mode}
      onPointerOver={handlePointerOver}
      onPointerLeave={handlePointerLeave}
      className={`group/button-group relative isolate inline-flex w-fit shrink-0 select-none
        ${o[mode]}
        ${mode === 'underline' ? (dir === 'vertical' ? 'pr-[2px]' : 'pb-[2px]') : ''}
        [&>*:hover]:z-20 [&>*:focus-visible]:z-20 [&>*:active]:z-20
        has-[>[data-slot=button-group]]:border-0 has-[>[data-slot=button-group]]:bg-transparent has-[>[data-slot=button-group]]:p-0 has-[>[data-slot=button-group]]:gap-2
        ${className}`}
      {...props}
    >
      {children}
      {mode === 'underline' &&
        (dir === 'vertical' ? (
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
        ))}
    </div>
  )
}

/**
 * 1px structural divider between borderless (`secondary`, `ghost`, `recessed`) buttons.
 * Automatically adapts to parent `ButtonGroup` orientation via `data-orientation`,
 * or accepts an explicit `orientation` prop (`'vertical' | 'horizontal'`).
 */
export function ButtonGroupSeparator({ className = '', orientation, ...props }) {
  const explicit =
    orientation === 'horizontal'
      ? 'h-px w-full my-0.5'
      : orientation === 'vertical'
        ? 'w-px self-stretch my-1'
        : 'w-px self-stretch my-1 group-data-[orientation=vertical]/button-group:h-px group-data-[orientation=vertical]/button-group:w-full group-data-[orientation=vertical]/button-group:my-0.5 group-data-[orientation=vertical]/button-group:self-auto'

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      data-slot="button-group-separator"
      className={`pointer-events-none relative z-10 shrink-0 bg-white/25 ${explicit} ${className}`}
      {...props}
    />
  )
}

export default ButtonGroup
