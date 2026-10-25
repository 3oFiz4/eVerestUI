import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function Overlay({ variant = 'shine', className = '', count = 6 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      if (variant === 'shine') {
        const shineBar = el.querySelector('.overlay-shine')
        if (shineBar) {
          gsap.fromTo(
            shineBar,
            { xPercent: -150, opacity: 0 },
            {
              xPercent: 250,
              opacity: 1,
              duration: 2.2,
              repeat: -1,
              repeatDelay: 0.8,
              ease: 'power2.inOut',
              force3D: true,
            }
          )
        }
      } else if (variant === 'sparkle') {
        const sparkles = el.querySelectorAll('.overlay-sparkle')
        if (sparkles.length) {
          sparkles.forEach((sparkle, i) => {
            gsap.set(sparkle, {
              scale: 0,
              opacity: 0,
              rotation: gsap.utils.random(-30, 30),
              x: gsap.utils.random(-50, 50),
              y: gsap.utils.random(-40, 40),
            })
            gsap.to(sparkle, {
              scale: () => gsap.utils.random(0.8, 1.4),
              opacity: () => gsap.utils.random(0.7, 1),
              rotation: '+=90',
              duration: () => gsap.utils.random(0.8, 1.4),
              repeat: -1,
              yoyo: true,
              delay: i * 0.25,
              ease: 'sine.inOut',
              force3D: true,
            })
          })
        }
      }
    }, containerRef)

    return () => ctx.revert()
  }, [variant, count])

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {variant === 'shine' && (
        <div className="overlay-shine absolute -inset-y-1/2 -left-1/3 w-1/2 -rotate-12 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-xs" />
      )}
      {variant === 'sparkle' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: count }).map((_, i) => (
            <span
              key={i}
              className="overlay-sparkle absolute text-amber-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.8)] select-none text-lg"
            >
              ✦
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default Overlay
