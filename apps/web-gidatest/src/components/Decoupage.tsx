import type { SVGProps } from 'react'

/**
 * Decoupage illüstrasyonları — editorial composite'lar için dekupe havasında,
 * yüksek detay inline SVG sebze/meyve/tahıl/yaprak grafikleri.
 * Her bileşen arkaplansız, renkler dağıtılmış gradient'lerle. Boyut kontrolü
 * için className/width/height props'u kullanın.
 */

// ─── DOMATES ─────────────────────────────────────────
export function TomatoDecoupage(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
            <defs>
                <radialGradient id="tomato-body" cx="40%" cy="38%" r="65%">
                    <stop offset="0%" stopColor="#FF7D5E" />
                    <stop offset="55%" stopColor="#E8452F" />
                    <stop offset="100%" stopColor="#A32518" />
                </radialGradient>
                <radialGradient id="tomato-shine" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFE4D8" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#FFE4D8" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="tomato-leaf" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7BA37B" />
                    <stop offset="100%" stopColor="#375237" />
                </linearGradient>
            </defs>
            {/* Body */}
            <path
                d="M100 40 C 60 40, 32 70, 32 115 C 32 160, 62 182, 100 182 C 138 182, 168 160, 168 115 C 168 70, 140 40, 100 40 Z"
                fill="url(#tomato-body)"
            />
            {/* Shine */}
            <ellipse cx="78" cy="80" rx="26" ry="20" fill="url(#tomato-shine)" />
            {/* Calyx (yeşillik) */}
            <g fill="url(#tomato-leaf)">
                <path d="M100 58 C 96 40, 82 30, 66 32 C 75 42, 85 48, 94 54 C 90 50, 85 44, 82 36 C 92 44, 100 54, 100 58 Z" />
                <path d="M100 58 C 104 40, 118 30, 134 32 C 125 42, 115 48, 106 54 C 110 50, 115 44, 118 36 C 108 44, 100 54, 100 58 Z" />
                <path d="M100 58 C 98 42, 92 28, 100 20 C 108 28, 102 42, 100 58 Z" />
            </g>
            {/* Stem */}
            <rect x="97" y="18" width="6" height="14" rx="3" fill="#5A7A3A" />
        </svg>
    )
}

// ─── BUĞDAY BAŞAĞI ───────────────────────────────────
export function WheatDecoupage(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 120 260" xmlns="http://www.w3.org/2000/svg" {...props}>
            <defs>
                <linearGradient id="wheat-grain" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F5D58A" />
                    <stop offset="60%" stopColor="#D9A441" />
                    <stop offset="100%" stopColor="#8B5E2B" />
                </linearGradient>
                <linearGradient id="wheat-stem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C4A558" />
                    <stop offset="100%" stopColor="#8B7330" />
                </linearGradient>
            </defs>
            {/* Stem */}
            <path d="M60 260 C 58 200, 60 140, 58 60" stroke="url(#wheat-stem)" strokeWidth="3" fill="none" />
            {/* Grains - alternating pairs */}
            <g fill="url(#wheat-grain)">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                    const y = 80 + i * 18
                    const rotL = -18 + i * 0.5
                    const rotR = 18 - i * 0.5
                    return (
                        <g key={i}>
                            <ellipse cx="45" cy={y} rx="11" ry="18" transform={`rotate(${rotL} 45 ${y})`} />
                            <ellipse cx="75" cy={y} rx="11" ry="18" transform={`rotate(${rotR} 75 ${y})`} />
                        </g>
                    )
                })}
                {/* Tip grain */}
                <ellipse cx="60" cy="48" rx="10" ry="20" />
            </g>
            {/* Awns (kılçıklar) */}
            <g stroke="#D9A441" strokeWidth="1.2" fill="none" opacity="0.8">
                <path d="M45 75 L 30 40" />
                <path d="M75 75 L 90 40" />
                <path d="M60 40 L 60 10" />
                <path d="M45 90 L 28 70" />
                <path d="M75 90 L 92 70" />
            </g>
        </svg>
    )
}

// ─── YAPRAK (genel bitki) ────────────────────────────
export function LeafDecoupage(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
            <defs>
                <linearGradient id="leaf-body" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#9EBF9E" />
                    <stop offset="50%" stopColor="#5A855A" />
                    <stop offset="100%" stopColor="#243A2A" />
                </linearGradient>
            </defs>
            <path
                d="M100 20 C 50 40, 20 90, 30 160 C 90 170, 160 130, 175 50 C 155 25, 120 18, 100 20 Z"
                fill="url(#leaf-body)"
            />
            {/* Mid-vein */}
            <path d="M160 50 C 120 90, 80 130, 38 158" stroke="#1A3320" strokeWidth="1.5" fill="none" opacity="0.6" />
            {/* Side veins */}
            <g stroke="#1A3320" strokeWidth="0.9" fill="none" opacity="0.4">
                <path d="M150 55 C 135 70, 125 75, 118 82" />
                <path d="M138 68 C 120 80, 108 88, 98 98" />
                <path d="M124 82 C 108 98, 92 108, 80 118" />
                <path d="M108 100 C 90 115, 76 128, 62 140" />
                <path d="M90 122 C 72 135, 60 148, 48 155" />
            </g>
        </svg>
    )
}

// ─── AVOKADO (yarım, dekupe) ─────────────────────────
export function AvocadoDecoupage(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" {...props}>
            <defs>
                <linearGradient id="avo-skin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4A6B2F" />
                    <stop offset="100%" stopColor="#2B4018" />
                </linearGradient>
                <linearGradient id="avo-flesh" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F5EBA3" />
                    <stop offset="50%" stopColor="#D4C866" />
                    <stop offset="100%" stopColor="#A8A040" />
                </linearGradient>
                <radialGradient id="avo-pit" cx="50%" cy="40%" r="55%">
                    <stop offset="0%" stopColor="#A0522D" />
                    <stop offset="100%" stopColor="#5C2E12" />
                </radialGradient>
            </defs>
            {/* Skin */}
            <path
                d="M100 20 C 55 20, 25 75, 30 150 C 35 215, 72 245, 100 245 C 128 245, 165 215, 170 150 C 175 75, 145 20, 100 20 Z"
                fill="url(#avo-skin)"
            />
            {/* Flesh (içerisi) */}
            <path
                d="M100 35 C 65 35, 42 80, 46 150 C 50 205, 78 232, 100 232 C 122 232, 150 205, 154 150 C 158 80, 135 35, 100 35 Z"
                fill="url(#avo-flesh)"
            />
            {/* Pit */}
            <ellipse cx="100" cy="135" rx="34" ry="42" fill="url(#avo-pit)" />
            <ellipse cx="92" cy="125" rx="8" ry="10" fill="#C07B3F" opacity="0.55" />
        </svg>
    )
}

// ─── BROKOLİ CİCEĞİ (küçük dekupe) ─────────────────
export function BroccoliDecoupage(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" {...props}>
            <defs>
                <radialGradient id="broc-head" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#6B9E4A" />
                    <stop offset="100%" stopColor="#2B4A1A" />
                </radialGradient>
                <linearGradient id="broc-stem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D1E4A5" />
                    <stop offset="100%" stopColor="#7FA554" />
                </linearGradient>
            </defs>
            {/* Head florets (bubble cluster) */}
            <g fill="url(#broc-head)">
                <circle cx="60" cy="60" r="30" />
                <circle cx="100" cy="40" r="34" />
                <circle cx="140" cy="65" r="30" />
                <circle cx="75" cy="95" r="26" />
                <circle cx="130" cy="100" r="28" />
                <circle cx="105" cy="75" r="26" />
            </g>
            {/* Mini texture bumps */}
            <g fill="#4A7A2F" opacity="0.5">
                {Array.from({ length: 18 }).map((_, i) => (
                    <circle key={i} cx={50 + (i % 6) * 18} cy={45 + Math.floor(i / 6) * 18} r="5" />
                ))}
            </g>
            {/* Stem */}
            <path d="M85 115 L 75 210 L 125 210 L 115 115 Z" fill="url(#broc-stem)" />
            <path d="M85 115 L 75 210 L 125 210 L 115 115 Z" fill="none" stroke="#5A7A3A" strokeOpacity="0.3" strokeWidth="1.5" />
        </svg>
    )
}

// ─── ZEYTİN DALI ─────────────────────────────────────
export function OliveBranchDecoupage(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" {...props}>
            <defs>
                <linearGradient id="olive-leaf" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#B4C798" />
                    <stop offset="100%" stopColor="#5C7A3A" />
                </linearGradient>
                <radialGradient id="olive-fruit" cx="50%" cy="40%" r="55%">
                    <stop offset="0%" stopColor="#5A6F2E" />
                    <stop offset="100%" stopColor="#2B3818" />
                </radialGradient>
            </defs>
            {/* Main branch */}
            <path d="M10 80 C 90 55, 180 50, 285 60" stroke="#6B5E30" strokeWidth="2.5" fill="none" />
            {/* Leaves */}
            <g fill="url(#olive-leaf)">
                <ellipse cx="50" cy="65" rx="18" ry="7" transform="rotate(-25 50 65)" />
                <ellipse cx="95" cy="55" rx="20" ry="7" transform="rotate(-10 95 55)" />
                <ellipse cx="150" cy="48" rx="22" ry="8" transform="rotate(-5 150 48)" />
                <ellipse cx="200" cy="50" rx="20" ry="7" transform="rotate(8 200 50)" />
                <ellipse cx="250" cy="55" rx="18" ry="7" transform="rotate(20 250 55)" />
                <ellipse cx="70" cy="90" rx="16" ry="6" transform="rotate(15 70 90)" />
                <ellipse cx="130" cy="85" rx="18" ry="6" transform="rotate(10 130 85)" />
                <ellipse cx="190" cy="85" rx="18" ry="7" transform="rotate(-12 190 85)" />
            </g>
            {/* Olives */}
            <g fill="url(#olive-fruit)">
                <ellipse cx="110" cy="72" rx="6" ry="8" />
                <ellipse cx="170" cy="70" rx="6.5" ry="8.5" />
                <ellipse cx="225" cy="74" rx="6" ry="8" />
            </g>
        </svg>
    )
}

// ─── DUT / BERRY (küçük renk vurguları için) ─────────
export function BerryDecoupage(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
            <defs>
                <radialGradient id="berry-body" cx="40%" cy="35%" r="70%">
                    <stop offset="0%" stopColor="#C64A6F" />
                    <stop offset="100%" stopColor="#5C1526" />
                </radialGradient>
            </defs>
            <g fill="url(#berry-body)">
                <circle cx="70" cy="70" r="26" />
                <circle cx="120" cy="60" r="28" />
                <circle cx="95" cy="105" r="30" />
                <circle cx="140" cy="110" r="26" />
                <circle cx="65" cy="130" r="24" />
                <circle cx="115" cy="150" r="22" />
            </g>
            <g fill="#7BA37B">
                <path d="M85 30 C 75 20, 60 18, 55 28 C 70 35, 85 38, 95 38 C 88 35, 82 32, 85 30 Z" />
            </g>
        </svg>
    )
}
