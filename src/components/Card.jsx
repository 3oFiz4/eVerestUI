import { HostProvider } from './context.js'

/** Square-cornered surface that hosts an Overlay. */
export function Card({ children, className = '', radius = 0, ...props }) {
  return (
    <HostProvider value={{ radius, accent: undefined }}>
      <div
        style={{ borderRadius: radius }}
        className={`relative isolate flex min-h-[200px] w-80 flex-col items-center justify-center border border-neutral-800 bg-neutral-900/80 p-8 text-center text-white ${className}`}
        {...props}
      >
        {children}
      </div>
    </HostProvider>
  )
}

export default Card
