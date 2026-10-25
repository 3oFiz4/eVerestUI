import { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { useHost } from './context.js'
import { createEngine } from './overlay/engine.js'
import { resolveEffects } from './overlay/registry.js'

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
  const host = useHost()
  const boxRef = useRef(null)
  const borderRef = useRef(null)
  const innerRef = useRef(null)
  const enginesRef = useRef(null)
  const stateRef = useRef({ hover: false, active: false })

  // Geometry and accent fall back to the host component (e.g. Button variant).
  const resolvedRadius = radius ?? host.radius ?? 0
  const resolvedAccent = accent ?? host.accent

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
    const host = box?.parentElement
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
    const onDown = () => {
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
    <div ref={boxRef} className={`pointer-events-none absolute inset-0 -z-10 ${className}`} aria-hidden="true">
      <div
        ref={borderRef}
        className="absolute"
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
