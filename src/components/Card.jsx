export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`relative w-80 min-h-[220px] rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col justify-center items-center text-center text-white ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
