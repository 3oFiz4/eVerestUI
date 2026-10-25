import { createContext, useContext } from 'react'

/**
 * Lets an Overlay inherit geometry and accent from its host component, so
 * `<Button variant="danger"><Overlay .../></Button>` needs no radius prop and
 * no colour plumbing.
 */
export const HostContext = createContext({ radius: 0, accent: undefined, disabled: false })

export const useHost = () => useContext(HostContext)

export const HostProvider = HostContext.Provider
