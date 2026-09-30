import { useEffect, useRef, useState } from 'react'
import { useShopStore, type CatSkinId } from '../../store'

type CatPremiumAvatarProps = {
  size?: number
  mood?: 'idle' | 'happy' | 'purr'
  isPetting?: boolean
  showCrown?: boolean
  skin?: CatSkinId
}

export const CatPremiumAvatar = ({ size = 64, mood = 'idle', isPetting = false, showCrown = true, skin }: CatPremiumAvatarProps) => {
  const storeSkin = useShopStore((state) => state.activeCatSkin)
  const effectiveSkin = skin ?? storeSkin ?? 'classic'
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY
      const distance = Math.hypot(deltaX, deltaY) || 1
      const maxOffset = 2.4
      const factor = Math.min(distance / 200, 1)

      setPupilOffset({
        x: (deltaX / distance) * maxOffset * factor,
        y: (deltaY / distance) * maxOffset * factor,
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const isPurringOrHappy = mood === 'happy' || mood === 'purr' || isPetting

  return (
    <div className={`cat-premium-avatar-wrap ${isPurringOrHappy ? 'is-purring' : ''}`}>
      <div className="cat-premium-aura" />
      <div className="cat-premium-tail-wag" />

      {isPetting && (
        <div className="cat-pet-hearts">
          <span className="cat-heart cat-heart-1">💖</span>
          <span className="cat-heart cat-heart-2">✨</span>
          <span className="cat-heart cat-heart-3">⭐</span>
        </div>
      )}

      <svg
        ref={svgRef}
        className={`cat-premium-svg cat-face--${mood}`}
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id="catAuraGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f4b849" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#c084fc" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="catFurGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbd38d" />
            <stop offset="100%" stopColor="#d69e2e" />
          </linearGradient>
          <linearGradient id="catCrownGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="50%" stopColor="#fff" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
        </defs>

        <circle cx="32" cy="33" r="28" fill="url(#catAuraGlow)" />

        <g className="cat-face__ears">
          <path d="M10 23 L13.5 6 L27 16 Z" fill="url(#catFurGrad)" stroke="#2d1f14" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M54 23 L50.5 6 L37 16 Z" fill="url(#catFurGrad)" stroke="#2d1f14" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M15 20 L16.8 11.5 L23 17.5 Z" fill="#f687b3" opacity="0.9" />
          <path d="M49 20 L47.2 11.5 L41 17.5 Z" fill="#f687b3" opacity="0.9" />
        </g>

        <ellipse
          className="cat-face__head"
          cx="32"
          cy="34"
          rx="22.5"
          ry="19.5"
          fill="url(#catFurGrad)"
          stroke="#2d1f14"
          strokeWidth="2.2"
        />

        {effectiveSkin === 'wizard' ? (
          <g className="cat-wizard-hat" transform="translate(0, -3)">
            <ellipse cx="32" cy="18" rx="16" ry="4" fill="#312e81" stroke="#4338ca" strokeWidth="1.2" />
            <path d="M20 18 Q32 19 44 18 L34 2 Q32 0 30 2 Z" fill="#4338ca" stroke="#312e81" strokeWidth="1.2" />
            <path d="M22 17 Q32 18 42 17" stroke="#ffd700" strokeWidth="2" fill="none" />
            <polygon points="32,7 33.2,10.2 36.5,10.2 33.8,12 34.8,15.2 32,13.2 29.2,15.2 30.2,12 27.5,10.2 30.8,10.2" fill="#ffd700" />
            <circle cx="36" cy="14" r="1.1" fill="#67e8f9" />
            <circle cx="27" cy="14" r="0.9" fill="#f472b6" />
          </g>
        ) : effectiveSkin === 'cyber' ? (
          <g className="cat-cyber-gear">
            <path d="M16 28 Q32 25 48 28 L47 33 Q32 30 17 33 Z" fill="rgba(6, 182, 212, 0.85)" stroke="#06b6d4" strokeWidth="1.5" />
            <path d="M19 29 Q32 26 45 29" stroke="#fff" strokeWidth="1" strokeDasharray="3 2" fill="none" />
            <circle cx="12" cy="27" r="2.5" fill="#f43f5e" stroke="#2d1f14" strokeWidth="1" />
            <circle cx="52" cy="27" r="2.5" fill="#f43f5e" stroke="#2d1f14" strokeWidth="1" />
            <path d="M12 25 L8 19" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="19" r="1.5" fill="#22d3ee" />
          </g>
        ) : (
          showCrown && (
            <g className="cat-crown" transform="translate(0, -1)">
              <path
                d="M23 17 L25 8 L32 13 L39 8 L41 17 Z"
                fill="url(#catCrownGrad)"
                stroke="#8c6d1f"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <circle cx="25" cy="8" r="1.5" fill="#f56565" />
              <circle cx="32" cy="13" r="1.5" fill="#38b2ac" />
              <circle cx="39" cy="8" r="1.5" fill="#f56565" />
              <circle cx="32" cy="15.8" r="1.2" fill="#fff" />
            </g>
          )
        )}

        <g className="cat-face__eyes">
          {isPurringOrHappy ? (
            <g className="cat-eyes--happy-lux">
              <path d="M19.5 33.5 q4 -6 8 0" fill="none" stroke="#2d1f14" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M36.5 33.5 q4 -6 8 0" fill="none" stroke="#2d1f14" strokeWidth="2.6" strokeLinecap="round" />
            </g>
          ) : (
            <g className="cat-eyes--tracking">
              <ellipse cx="23.5" cy="32" rx="4.8" ry="5.8" fill="#fff" stroke="#2d1f14" strokeWidth="1.5" />
              <ellipse cx="40.5" cy="32" rx="4.8" ry="5.8" fill="#fff" stroke="#2d1f14" strokeWidth="1.5" />

              <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
                <ellipse cx="23.5" cy="32" rx="2.5" ry="3.8" fill="#1a202c" />
                <circle cx="22.3" cy="30.5" r="1" fill="#fff" />
              </g>
              <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
                <ellipse cx="40.5" cy="32" rx="2.5" ry="3.8" fill="#1a202c" />
                <circle cx="39.3" cy="30.5" r="1" fill="#fff" />
              </g>
            </g>
          )}
        </g>

        <path className="cat-face__nose" d="M30 39 h4 l-2 2.6 Z" fill="#e53e3e" />

        <path
          className="cat-face__mouth"
          d="M32 41.6 q-3 3.2 -5.5 0.5 M32 41.6 q3 3.2 5.5 0.5"
          fill="none"
          stroke="#2d1f14"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <g className="cat-face__whiskers" stroke="#2d1f14" strokeWidth="1.6" strokeLinecap="round" opacity="0.6">
          <path d="M22 39.5 L10 36.5" />
          <path d="M22 42.5 L10.5 43.5" />
          <path d="M42 39.5 L54 36.5" />
          <path d="M42 42.5 L53.5 43.5" />
        </g>

        <g className="cat-face__blush">
          <ellipse cx="17.5" cy="39" rx="3.8" ry="2.4" fill="rgba(245, 101, 101, 0.4)" />
          <ellipse cx="46.5" cy="39" rx="3.8" ry="2.4" fill="rgba(245, 101, 101, 0.4)" />
        </g>
      </svg>
    </div>
  )
}
