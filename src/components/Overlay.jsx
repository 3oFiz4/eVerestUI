import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useHost } from './context.js'
import { createEngine } from './overlay/engine.js'
import { resolveEffects } from './overlay/registry.js'

function getHostElement(box) {
  if (!box) return null
  const btn = box.closest('button')
  if (btn) return btn
  let el = box.parentElement
  while (el && el !== document.body && window.getComputedStyle(el).display === 'inline') {
    el = el.parentElement
  }
  return el || box.parentElement
}

/**
 * Animation host for any component. Drop it inside a `relative` parent and it
 * layers effects behind and around the content.
 *
 * Six props select an effect per state/layer; each matching `...Modify` object
 * passes that effect its parameters (see docs/overlay-effects.md).
 *
 *   staticBorderAnimVar  staticBorderAnimVarModify   idle,           on the edge
 *   staticOverlayAnimVar staticOverlayAnimVarModify   idle,           inside
 *   hoverBorderAnimVar   hoverBorderAnimVarModify     cursor over,    on the edge
 *   hoverOverlayAnimVar  hoverOverlayAnimVarModify    cursor over,    inside
 *   activeBorderAnimVar  activeBorderAnimVarModify    pointer down,   on the edge
 *   activeOverlayAnimVar activeOverlayAnimVarModify   pointer down,   inside
 *
 * Border effects draw outside the box (halos, rays) and are given
 * `borderOverflow` px of room; inner effects are clipped to the silhouette.
 */
export function Overlay({
  className = '',
  variant, // legacy: sets staticOverlayAnimVar
  count, // legacy: merged into staticOverlayAnimVarModify
  staticBorderAnimVar,
  staticBorderAnimVarModify,
  staticOverlayAnimVar,
  staticOverlayAnimVarModify,
  hoverBorderAnimVar,
  hoverBorderAnimVarModify,
  hoverOverlayAnimVar,
  hoverOverlayAnimVarModify,
  activeBorderAnimVar,
  activeBorderAnimVarModify,
  activeOverlayAnimVar,
  activeOverlayAnimVarModify,
  radius,
  accent,
  borderOverflow = 40,
  followPointer = true,
  ref,
}) {
  const hostContext = useHost()
  const boxRef = useRef(null)
  const borderRef = useRef(null)
  const innerRef = useRef(null)
  const enginesRef = useRef(null)
  const stateRef = useRef({ hover: false, active: false })
  const [parentRadius, setParentRadius] = useState(0)

  // Geometry and accent fall back to the host component (e.g. Button variant) or parent element.
  const resolvedRadius = radius ?? hostContext.radius ?? parentRadius
  const resolvedAccent = accent ?? hostContext.accent

  /**
   * Always match the exact size and shape of the parent element (Button, Card, or any div).
   * 1. If the parent lacks positioning, ensure it has `position: relative`.
   * 2. Overcome CSS padding-box constraint on absolute positioning by offsetting
   *    by negative border-width and sizing to host's outer border-box.
   * 3. Observe host size dynamically with ResizeObserver.
   */
  useLayoutEffect(() => {
    const box = boxRef.current
    const host = getHostElement(box)
    if (!box || !host) return

    // If box was nested inside an inline wrapper within the host, ensure the wrapper doesn't trap positioning
    if (box.parentElement && box.parentElement !== host) {
      box.parentElement.style.position = 'static'
    }

    const computed = window.getComputedStyle(host)
    if (computed.position === 'static') {
      host.style.position = 'relative'
    }

    const syncSize = () => {
      if (!box || !host) return
      const cs = window.getComputedStyle(host)
      const bt = parseFloat(cs.borderTopWidth) || 0
      const bl = parseFloat(cs.borderLeftWidth) || 0

      // Match the full outer border-box of the parent element
      const w = host.offsetWidth || Math.round(host.getBoundingClientRect().width)
      const h = host.offsetHeight || Math.round(host.getBoundingClientRect().height)

      box.style.top = `${-bt}px`
      box.style.left = `${-bl}px`
      box.style.width = `${w}px`
      box.style.height = `${h}px`

      if (radius == null && hostContext.radius == null) {
        const br = parseFloat(cs.borderRadius) || 0
        setParentRadius(br)
      }

      enginesRef.current?.borderEngine?.resize?.()
      enginesRef.current?.innerEngine?.resize?.()
    }

    syncSize()

    const ro = new ResizeObserver(syncSize)
    ro.observe(host)
    window.addEventListener('resize', syncSize)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', syncSize)
    }
  }, [radius, hostContext.radius])

  const effects = useMemo(
    () =>
      resolveEffects({
        staticBorderAnimVar,
        staticBorderAnimVarModify,
        staticOverlayAnimVar: staticOverlayAnimVar ?? variant,
        staticOverlayAnimVarModify:
          count != null ? { count, ...staticOverlayAnimVarModify } : staticOverlayAnimVarModify,
        hoverBorderAnimVar,
        hoverBorderAnimVarModify,
        hoverOverlayAnimVar,
        hoverOverlayAnimVarModify,
        activeBorderAnimVar,
        activeBorderAnimVarModify,
        activeOverlayAnimVar,
        activeOverlayAnimVarModify,
      }),
    [
      staticBorderAnimVar,
      staticBorderAnimVarModify,
      staticOverlayAnimVar,
      staticOverlayAnimVarModify,
      hoverBorderAnimVar,
      hoverBorderAnimVarModify,
      hoverOverlayAnimVar,
      hoverOverlayAnimVarModify,
      activeBorderAnimVar,
      activeBorderAnimVarModify,
      activeOverlayAnimVar,
      activeOverlayAnimVarModify,
      variant,
      count,
    ]
  )

  useEffect(() => {
    const border = borderRef.current
    const inner = innerRef.current
    if (!border || !inner) return

    const withHost = effects.map((e) => ({
      ...e,
      modify: {
        radius: resolvedRadius,
        ...(resolvedAccent ? { color: resolvedAccent } : {}),
        ...e.modify,
      },
    }))
    const borderEngine = createEngine(
      border,
      withHost.filter((e) => e.layer === 'border'),
      borderOverflow
    )
    const innerEngine = createEngine(
      inner,
      withHost.filter((e) => e.layer === 'overlay'),
      0
    )
    enginesRef.current = { borderEngine, innerEngine }
    borderEngine.setState(stateRef.current)
    innerEngine.setState(stateRef.current)

    return () => {
      borderEngine.destroy()
      innerEngine.destroy()
      enginesRef.current = null
    }
  }, [effects, resolvedRadius, resolvedAccent, borderOverflow])

  const sendState = useCallback((next) => {
    enginesRef.current?.borderEngine.setState(next)
    enginesRef.current?.innerEngine.setState(next)
  }, [])

  const sendPointer = useCallback((pointer) => {
    enginesRef.current?.borderEngine.setPointer(pointer)
    enginesRef.current?.innerEngine.setPointer(pointer)
  }, [])

  /**
   * Events are bound to the HOST element (the nearest positioned ancestor, i.e.
   * the Button/Card), never to this overlay node: the overlay is
   * `pointer-events-none` so it cannot intercept clicks, which also means it
   * would never receive the events itself.
   */
  useEffect(() => {
    const box = boxRef.current
    const host = getHostElement(box)
    if (!box || !host) return

    const onMove = (event) => {
      if (!followPointer) return
      const rect = box.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      sendPointer({
        x: rect.width ? x / rect.width : 0.5,
        y: rect.height ? y / rect.height : 0.5,
        px: x,
        py: y,
        inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height,
      })
    }
    const onEnter = () => {
      stateRef.current = { ...stateRef.current, hover: true }
      sendState(stateRef.current)
    }
    const onLeave = () => {
      stateRef.current = { hover: false, active: false }
      sendState(stateRef.current)
      sendPointer({ x: 0.5, y: 0.5, px: 0, py: 0, inside: false })
    }
    const onDown = (event) => {
      onMove(event)
      stateRef.current = { ...stateRef.current, active: true }
      sendState(stateRef.current)
    }
    // pointerup may land anywhere (drag off the button), so it goes on window
    const onUp = () => {
      if (!stateRef.current.active) return
      stateRef.current = { ...stateRef.current, active: false }
      sendState(stateRef.current)
    }

    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerenter', onEnter)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [followPointer, sendPointer, sendState])

  useImperativeHandle(ref, () => ({ setState: sendState, setPointer: sendPointer }), [sendPointer, sendState])

  return (
    <div ref={boxRef} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <div
        ref={borderRef}
        className="absolute z-0"
        style={{ inset: -borderOverflow, borderRadius: resolvedRadius ? resolvedRadius + borderOverflow : undefined }}
      />
      <div
        ref={innerRef}
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius: resolvedRadius ? `${resolvedRadius}px` : undefined }}
      />
    </div>
  )
}

export default Overlay
