import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import React, { createRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const lib = await import(pathToFileURL(resolve(root, 'dist/index.js')).href)

// 1. "use client" directive preserved in ESM & CJS bundles
for (const file of ['dist/index.js', 'dist/index.cjs']) {
  const head = readFileSync(resolve(root, file), 'utf8').slice(0, 64)
  assert.ok(head.includes('use client'), `${file} missing "use client" directive`)
}

// 2. cn() Tailwind conflict resolution
assert.equal(lib.cn('px-2.5 bg-black text-white', 'px-6 bg-white'), 'text-white px-6 bg-white')

// 3. forwardRef across components
const forwardRefSym = Symbol.for('react.forward_ref')
for (const name of [
  'Button',
  'Input',
  'ButtonGroup',
  'ButtonGroupSeparator',
  'Card',
  'CardHeader',
  'CardTitle',
  'CardDescription',
  'CardAction',
  'CardContent',
  'CardFooter',
  'Overlay',
  'Sidebar',
]) {
  assert.equal(lib[name]?.$$typeof, forwardRefSym, `${name} must wrap with forwardRef`)
}

// 4. Polymorphic asChild via @radix-ui/react-slot
const linkBtn = renderToStaticMarkup(
  React.createElement(
    lib.Button,
    { asChild: true, variant: 'outline', className: 'px-8', ref: createRef() },
    React.createElement('a', { href: '/docs' }, 'Docs')
  )
)
assert.ok(linkBtn.startsWith('<a '), 'Button asChild must render child tag as root')
assert.ok(linkBtn.includes('href="/docs"'), 'Button asChild must preserve child props')
assert.ok(linkBtn.includes('px-8') && !linkBtn.includes('px-2.5'), 'Button must twMerge className')
assert.ok(linkBtn.includes('leading-none'), 'Button must preserve leading-none')
assert.ok(linkBtn.includes('data-slot="overlay"'), 'Button asChild must keep default ripple Overlay')

const cardSection = renderToStaticMarkup(
  React.createElement(
    lib.Card,
    { asChild: true, className: 'w-96' },
    React.createElement('section', { id: 'hero-card' }, 'Surface')
  )
)
assert.ok(cardSection.startsWith('<section ') && cardSection.includes('w-96'))

// 4b. All 10 Card variants & size cascade to subcomponents
assert.equal(lib.CARD_VARIANTS.length, 10, 'Expected 10 Card variants')
for (const variant of lib.CARD_VARIANTS) {
  const cardHtml = renderToStaticMarkup(
    React.createElement(
      lib.Card,
      { variant, size: 'lg' },
      React.createElement(
        lib.CardHeader,
        null,
        React.createElement(lib.CardTitle, null, 'Title'),
        React.createElement(lib.CardDescription, null, 'Desc'),
        React.createElement(lib.CardAction, null, 'Act')
      ),
      React.createElement(lib.CardContent, null, 'Body'),
      React.createElement(lib.CardFooter, null, 'Foot')
    )
  )
  assert.ok(cardHtml.includes(`data-variant="${variant}"`), `Missing data-variant=${variant}`)
  assert.ok(cardHtml.includes('data-slot="card-title"') && cardHtml.includes('data-size="lg"'))
  if (variant === 'vertical-gutter') {
    assert.ok(cardHtml.includes('writing-mode:vertical-rl'), 'vertical-gutter must rotate title wrap')
  }
  if (variant === 'shutter-split') {
    assert.ok(cardHtml.includes('bg-white text-black'), 'shutter-split header must invert')
  }
}

// 4c. Card modify prop test
const customCard = renderToStaticMarkup(
  React.createElement(
    lib.Card,
    { variant: 'ledger-bracket', modify: { bracketSize: 12, bracketThickness: 2, bracketColor: '#22c55e' } }
  )
)
assert.ok(customCard.includes('width:12px') && customCard.includes('border-color:#22c55e'))

// 5. Input variants + forwardRef + className merge
for (const variant of lib.INPUT_VARIANTS) {
  const html = renderToStaticMarkup(
    React.createElement(lib.Input, { variant, className: 'px-5', ref: createRef() })
  )
  assert.ok(html.includes('<input') && html.includes('px-5'), `Input variant ${variant} failed`)
}

// 6. Headless Radix primitives exported
for (const prim of [
  'Slot',
  'Slottable',
  'DialogPrimitive',
  'PopoverPrimitive',
  'DropdownMenuPrimitive',
  'SeparatorPrimitive',
  'LabelPrimitive',
  'TooltipPrimitive',
]) {
  assert.ok(lib[prim], `Missing primitive export: ${prim}`)
}

console.log('verify-foundation: ok')
