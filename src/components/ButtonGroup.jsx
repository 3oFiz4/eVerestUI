/**
 * ButtonGroup & ButtonGroupSeparator
 *
 * Monochrome architectural grouping for Button, Input, and arbitrary controls.
 *
 * Two structural paradigms:
 * - `monolithic` (default): Adjacent 1px borders overlap seamlessly (`-ml-px` / `-mt-px`).
 *   Hovered and focus-visible children auto-elevate (`z-20`) so crisp 1px borders and
 *   overlay effects are never truncated by a neighbor.
 * - `recessed`: A recessed 1px perimeter chassis (`border-white/25 bg-black p-0.5 gap-0.5`)
 *   encapsulates flush-mounted micro buttons with high-contrast active engagement.
 *
 * Nesting:
 * - When a `ButtonGroup` contains child `ButtonGroup` elements
 *   (`has-[>[data-slot=button-group]]`), it automatically acts as a layout cluster
 *   with a clean gap instead of collapsing borders across sub-groups.
 */

export const BUTTON_GROUP_ORIENTATIONS = ['horizontal', 'vertical']
export const BUTTON_GROUP_VARIANTS = ['monolithic', 'recessed']

const ORIENTATION_CLASSES = {
  horizontal: {
    monolithic:
      'flex-row items-center [&>*:not([data-slot=button-group]):not(:first-child)]:-ml-px [&>*:not([data-slot=button-group]):not(:first-child)]:rounded-l-none [&>*:not([data-slot=button-group]):not(:last-child)]:rounded-r-none',
    recessed:
      'flex-row items-center border border-white/25 bg-black p-0.5 gap-0.5 [&>[data-slot=button]]:border-transparent',
    nested: 'flex-row items-center gap-2',
  },
  vertical: {
    monolithic:
      'flex-col items-stretch [&>*:not([data-slot=button-group]):not(:first-child)]:-mt-px [&>*:not([data-slot=button-group]):not(:first-child)]:rounded-t-none [&>*:not([data-slot=button-group]):not(:last-child)]:rounded-b-none',
    recessed:
      'flex-col items-stretch border border-white/25 bg-black p-0.5 gap-0.5 [&>[data-slot=button]]:border-transparent',
    nested: 'flex-col items-start gap-2',
  },
}

export function ButtonGroup({
  children,
  className = '',
  orientation = 'horizontal',
  variant = 'monolithic',
  ...props
}) {
  const dir = orientation === 'vertical' ? 'vertical' : 'horizontal'
  const mode = variant === 'recessed' ? 'recessed' : 'monolithic'
  const o = ORIENTATION_CLASSES[dir]

  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={dir}
      data-variant={mode}
      className={`group/button-group relative isolate inline-flex w-fit shrink-0 select-none
        ${o[mode]}
        [&>*:hover]:z-20 [&>*:focus-visible]:z-20 [&>*:active]:z-20
        has-[>[data-slot=button-group]]:border-0 has-[>[data-slot=button-group]]:bg-transparent has-[>[data-slot=button-group]]:p-0
        ${dir === 'vertical' ? 'has-[>[data-slot=button-group]]:gap-2' : 'has-[>[data-slot=button-group]]:gap-2'}
        ${className}`}
      {...props}
    >
      {children}
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
