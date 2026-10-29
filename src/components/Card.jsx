'use client'

import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../lib/utils.js'
import { HostProvider } from './context.js'

export const cardVariants = cva(
  'jetbrains-mono font-mono relative isolate flex min-h-[200px] w-80 flex-col items-center justify-center border border-white/20 bg-black p-8 text-center text-white',
  {
    variants: {
      variant: {
        default: 'border-white/20 bg-black text-white',
        outline: 'border-white/40 bg-black text-white',
        ghost: 'border-transparent bg-transparent text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

/** Square-cornered surface that hosts an Overlay. */
export const Card = forwardRef(function Card(
  { asChild = false, children, className = '', variant = 'default', radius = 0, style, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'div'
  return (
    <HostProvider value={{ radius, accent: undefined }}>
      <Comp
        ref={ref}
        data-slot="card"
        style={{ borderRadius: radius, ...style }}
        className={cn(cardVariants({ variant }), className)}
        {...props}
      >
        {children}
      </Comp>
    </HostProvider>
  )
})

Card.displayName = 'Card'

export default Card
