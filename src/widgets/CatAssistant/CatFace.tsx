type CatFaceProps = {
  size?: number
  mood?: 'idle' | 'happy'
}

export const CatFace = ({ size = 44, mood = 'idle' }: CatFaceProps) => (
  <svg
    className={`cat-face cat-face--${mood}`}
    width={size}
    height={size}
    viewBox="0 0 64 64"
    role="img"
    aria-hidden="true"
    focusable="false"
  >
    <g className="cat-face__ears">
      <path d="M11 22 L13.5 7 L27 16 Z" fill="var(--cat-fur)" stroke="var(--cat-line)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M53 22 L50.5 7 L37 16 Z" fill="var(--cat-fur)" stroke="var(--cat-line)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M15.5 19.5 L16.8 12.5 L23 17.5 Z" fill="var(--cat-inner)" />
      <path d="M48.5 19.5 L47.2 12.5 L41 17.5 Z" fill="var(--cat-inner)" />
    </g>

    <ellipse className="cat-face__head" cx="32" cy="33" rx="22" ry="19" fill="var(--cat-fur)" stroke="var(--cat-line)" strokeWidth="2" />

    <g className="cat-face__eyes">
      <g className="cat-eyes--idle">
        <path className="cat-eye" d="M21 31 q3.5 4 7 0" fill="none" stroke="var(--cat-line)" strokeWidth="2.4" strokeLinecap="round" />
        <path className="cat-eye" d="M36 31 q3.5 4 7 0" fill="none" stroke="var(--cat-line)" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <g className="cat-eyes--happy">
        <path className="cat-eye" d="M20.5 33 q3.5 -5 7 0" fill="none" stroke="var(--cat-line)" strokeWidth="2.4" strokeLinecap="round" />
        <path className="cat-eye" d="M36.5 33 q3.5 -5 7 0" fill="none" stroke="var(--cat-line)" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </g>

    <path className="cat-face__nose" d="M30 38.5 h4 l-2 2.6 Z" fill="var(--cat-nose)" />

    <path
      className="cat-face__mouth"
      d="M32 41.2 q-3 3 -5.5 0.4 M32 41.2 q3 3 5.5 0.4"
      fill="none"
      stroke="var(--cat-line)"
      strokeWidth="1.8"
      strokeLinecap="round"
    />

    <g className="cat-face__whiskers" stroke="var(--cat-line)" strokeWidth="1.5" strokeLinecap="round" opacity="0.55">
      <path d="M22 39 L11 36.5" />
      <path d="M22 42 L11.5 43" />
      <path d="M42 39 L53 36.5" />
      <path d="M42 42 L52.5 43" />
    </g>

    <g className="cat-face__blush">
      <ellipse cx="18" cy="38" rx="3.4" ry="2.2" fill="var(--cat-blush)" />
      <ellipse cx="46" cy="38" rx="3.4" ry="2.2" fill="var(--cat-blush)" />
    </g>
  </svg>
)
