import type { FanAvatarIndex } from './fanAvatarUtils'

interface MascotArtProps {
  index: FanAvatarIndex
}

const INK = '#2A2A2A'

/** 큰 눈 + 하이라이트 */
function CuteEyes({ lx = 38, ly = 47, rx = 62, ry = 47, r = 5 }: {
  lx?: number; ly?: number; rx?: number; ry?: number; r?: number
}) {
  const pr = r * 0.55
  return (
    <>
      <circle cx={lx} cy={ly} r={r} fill="#fff" />
      <circle cx={rx} cy={ry} r={r} fill="#fff" />
      <circle cx={lx} cy={ly} r={pr} fill={INK} />
      <circle cx={rx} cy={ry} r={pr} fill={INK} />
      <circle cx={lx + 1.5} cy={ly - 1.5} r={1.3} fill="#fff" />
      <circle cx={rx + 1.5} cy={ry - 1.5} r={1.3} fill="#fff" />
    </>
  )
}

function CuteSmile({ y = 58, wide = false }: { y?: number; wide?: boolean }) {
  const w = wide ? 10 : 8
  return (
    <path
      d={`M ${50 - w} ${y} Q 50 ${y + 6} ${50 + w} ${y}`}
      stroke={INK}
      strokeWidth="1.7"
      fill="none"
      strokeLinecap="round"
    />
  )
}

function Blush({ y = 54 }: { y?: number }) {
  return (
    <>
      <ellipse cx="28" cy={y} rx="5.5" ry="3.2" fill="#FF9EB8" opacity="0.5" />
      <ellipse cx="72" cy={y} rx="5.5" ry="3.2" fill="#FF9EB8" opacity="0.5" />
    </>
  )
}

/** 0 — 노란 별: 통통 + 반짝 눈 */
function MascotStar() {
  return (
    <g>
      <path
        d="M 50 16 C 52 16 56 34 58 36 L 76 38 C 78 38 64 48 64 50 L 70 68 C 70 70 52 60 50 60 C 48 60 30 70 30 68 L 36 50 C 36 48 22 38 24 38 L 42 36 C 44 34 48 16 50 16 Z"
        fill="#F5C842"
      />
      <CuteEyes ly={46} ry={46} r={4.5} />
      <CuteSmile y={57} wide />
      <Blush y={52} />
    </g>
  )
}

/** 1 — 보라 블롭 */
function MascotBlob() {
  return (
    <g>
      <path
        d="M 20 54 C 18 40 34 28 52 30 C 72 32 82 44 80 56 C 78 68 64 74 50 72 C 34 70 22 64 20 54 Z"
        fill="#9B7FD4"
      />
      <CuteEyes r={4.5} />
      <CuteSmile />
      <Blush />
    </g>
  )
}

/** 2 — 파란 둥근네모 */
function MascotSquircle() {
  return (
    <g>
      <rect x="24" y="26" width="52" height="48" rx="20" fill="#4EC0F0" />
      <CuteEyes r={5} />
      <CuteSmile y={59} wide />
      <ellipse cx="28" cy="56" rx="5" ry="3.5" fill="#FFB060" opacity="0.65" />
      <ellipse cx="72" cy="56" rx="5" ry="3.5" fill="#FFB060" opacity="0.65" />
    </g>
  )
}

/** 3 — 초록 통통 알갱이 (외눈 콤마 대체) */
function MascotPea() {
  return (
    <g>
      <ellipse cx="50" cy="52" rx="26" ry="28" fill="#6ECF7A" />
      <CuteEyes ly={48} ry={48} r={5} />
      <CuteSmile y={60} wide />
      <Blush y={56} />
    </g>
  )
}

/** 4 — 하늘 구름 */
function MascotCloud() {
  return (
    <g>
      <path
        d="M 24 58 C 18 58 16 52 22 48 C 20 38 30 32 40 34 C 44 24 58 22 66 30 C 78 28 86 38 82 48 C 90 52 88 62 76 62 L 26 62 C 24 62 24 58 24 58 Z"
        fill="#8ED4F0"
      />
      <CuteEyes ly={48} ry={48} r={4} />
      <path
        d="M 42 56 L 46 60 L 50 56 L 54 60 L 58 56"
        stroke={INK}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Blush y={54} />
    </g>
  )
}

/** 5 — 초록 둥근 언덕 (아치 → 더 통통) */
function MascotArch() {
  return (
    <g>
      <path
        d="M 20 70 C 20 42 34 24 50 24 C 66 24 80 42 80 70 Z"
        fill="#4A9E62"
      />
      <CuteEyes ly={48} ry={48} r={4.5} />
      <CuteSmile y={58} wide />
      <Blush y={54} />
    </g>
  )
}

/** 6 — 노란 통통 알 */
function MascotEgg() {
  return (
    <g>
      <ellipse cx="50" cy="52" rx="24" ry="28" fill="#F5D840" />
      <CuteEyes ly={47} ry={47} r={5} />
      <CuteSmile y={60} wide />
      <Blush y={56} />
    </g>
  )
}

/** 7 — 주황 하트 */
function MascotHeart() {
  return (
    <g transform="rotate(-6 50 52)">
      <path
        d="M 50 30 C 58 22 72 24 74 38 C 76 52 50 72 50 72 C 50 72 24 52 26 38 C 28 24 42 22 50 30 Z"
        fill="#F88850"
      />
      <CuteEyes ly={46} ry={46} r={4.5} />
      <CuteSmile y={57} />
      <Blush y={53} />
    </g>
  )
}

/** 8 — 핑크 하트 */
function MascotRoseHeart() {
  return (
    <g>
      <circle cx="50" cy="50" r="36" fill="#FAD8E8" opacity="0.6" />
      <path
        d="M 50 34 C 58 26 70 28 72 40 C 74 52 50 68 50 68 C 50 68 26 52 28 40 C 30 28 42 26 50 34 Z"
        fill="#F888A8"
      />
      <CuteEyes ly={46} ry={46} r={4.5} />
      <path
        d="M 42 56 L 46 60 L 50 56 L 54 60 L 58 56"
        stroke={INK}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Blush y={54} />
    </g>
  )
}

/** 9 — 주황 통통 (졸린 표정 → 밝은 미소) */
function MascotSlab() {
  return (
    <g>
      <path
        d="M 16 50 C 16 40 28 36 50 36 C 72 36 84 40 84 50 C 84 62 72 66 50 66 C 28 66 16 62 16 50 Z"
        fill="#F8B040"
      />
      <CuteEyes ly={48} ry={48} r={5} />
      <CuteSmile y={58} wide />
      <Blush y={54} />
    </g>
  )
}

/** 10 — 핑크 콩 */
function MascotBean() {
  return (
    <g>
      <path
        d="M 50 20 C 62 20 68 34 66 50 C 64 68 56 78 50 78 C 44 78 36 68 34 50 C 32 34 38 20 50 20 Z"
        fill="#F888B0"
      />
      <CuteEyes ly={46} ry={46} r={4.5} />
      <path
        d="M 42 58 L 46 62 L 50 58 L 54 62 L 58 58"
        stroke={INK}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="30" cy="54" rx="5" ry="3.5" fill="#FFB060" opacity="0.65" />
      <ellipse cx="70" cy="54" rx="5" ry="3.5" fill="#FFB060" opacity="0.65" />
    </g>
  )
}

/** 11 — 보라 꽃 */
function MascotPetal() {
  return (
    <g>
      <ellipse cx="50" cy="36" rx="17" ry="15" fill="#A080D8" />
      <ellipse cx="36" cy="52" rx="15" ry="17" fill="#A080D8" />
      <ellipse cx="64" cy="52" rx="15" ry="17" fill="#A080D8" />
      <ellipse cx="50" cy="66" rx="17" ry="13" fill="#A080D8" />
      <CuteEyes ly={50} ry={50} r={4.5} />
      <CuteSmile y={60} />
      <Blush y={56} />
    </g>
  )
}

const MASCOTS = [
  MascotStar, MascotBlob, MascotSquircle, MascotPea,
  MascotCloud, MascotArch, MascotEgg, MascotHeart,
  MascotRoseHeart, MascotSlab, MascotBean, MascotPetal,
] as const

export function FanMascotArt({ index }: MascotArtProps) {
  const Mascot = MASCOTS[index] ?? MASCOTS[0]
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <Mascot />
    </svg>
  )
}
