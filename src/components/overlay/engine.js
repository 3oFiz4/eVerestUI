/**
 * Instantiates the effect classes for one layer and drives them.
 *
 * One ResizeObserver and one pointer delivery per layer, regardless of how many
 * effects are mounted, so adding overlays never multiplies event work. State is
 * mirrored to every instance as a boolean; each effect spends work only when its
 * own state is the live one.
 */
export function createEngine(layer, entries, inset = 0) {
  const instances = []

  for (const entry of entries) {
    if (!entry?.Effect) continue
    const instance = new entry.Effect(layer, { ...(entry.modify || {}), inset, state: entry.state })
    instances.push({ state: entry.state, instance })
  }
  if (!instances.length) {
    return { destroy() {}, setState() {}, setPointer() {}, resize() {} }
  }

  // Mount in reverse so the first prop listed ends up on top.
  for (let i = instances.length - 1; i >= 0; i--) instances[i].instance.mount()

  const measure = () => {
    const rect = layer.getBoundingClientRect()
    return { w: Math.max(1, Math.round(rect.width)), h: Math.max(1, Math.round(rect.height)) }
  }
  const setSize = () => {
    const size = measure()
    for (const item of instances) item.instance.resize(size)
  }
  setSize()

  const ro = new ResizeObserver(setSize)
  ro.observe(layer)

  const state = { static: true, hover: false, active: false }
  const apply = () => {
    for (const item of instances) item.instance.setActive(state[item.state])
  }
  apply()

  return {
    resize() {
      setSize()
    },
    setState(next) {
      state.hover = !!next.hover
      state.active = !!next.active
      apply()
      for (const item of instances) {
        item.instance.onHostState?.(next)
      }
    },
    setPointer(pointer) {
      for (const item of instances) item.instance.setPointer(pointer)
    },
    destroy() {
      ro.disconnect()
      for (const item of instances) item.instance.destroy()
      instances.length = 0
    },
  }
}
