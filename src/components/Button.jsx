export function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden shadow-lg transition-transform active:scale-95 cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
