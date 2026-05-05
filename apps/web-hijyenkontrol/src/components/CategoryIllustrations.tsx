/**
 * Characterful inline SVG illustrations for category tiles.
 * Each illustration is tuned to viewBox 64 64 and uses 2-tone palette:
 *  - uv-500 (#06b6d4) as primary accent
 *  - slate-700 (#334155) as structural line
 */
import type { SVGProps } from 'react'

type IllustrationProps = SVGProps<SVGSVGElement>

/* ─── 1. Luminometer — handheld ATP reader ─── */
export function LuminometerIllustration(props: IllustrationProps) {
    return (
        <svg viewBox="0 0 64 64" fill="none" {...props}>
            {/* Device body */}
            <rect x="14" y="12" width="36" height="44" rx="5" fill="#ecfeff" stroke="#334155" strokeWidth="2" />
            {/* Top grip accent */}
            <rect x="24" y="9" width="16" height="4" rx="1.5" fill="#334155" />
            {/* Screen */}
            <rect x="18" y="18" width="28" height="16" rx="2" fill="#0891b2" />
            {/* Waveform */}
            <path d="M20 28 L23 24 L26 30 L29 22 L32 29 L35 23 L38 27 L41 25 L44 27" stroke="#67e8f9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* LED status */}
            <circle cx="44" cy="15" r="1.5" fill="#10b981" />
            {/* Buttons */}
            <circle cx="22" cy="42" r="2.2" fill="#334155" />
            <circle cx="32" cy="42" r="2.2" fill="#06b6d4" />
            <circle cx="42" cy="42" r="2.2" fill="#334155" />
            {/* Model label line */}
            <rect x="20" y="48" width="24" height="1.5" rx="0.75" fill="#cbd5e1" />
            <rect x="24" y="51.5" width="16" height="1.5" rx="0.75" fill="#cbd5e1" />
        </svg>
    )
}

/* ─── 2. Swab test tube ─── */
export function SwabIllustration(props: IllustrationProps) {
    return (
        <svg viewBox="0 0 64 64" fill="none" {...props}>
            {/* Swab handle */}
            <rect x="30" y="4" width="4" height="18" rx="1" fill="#334155" />
            {/* Swab tip */}
            <ellipse cx="32" cy="4" rx="4" ry="3" fill="#fafaf9" stroke="#334155" strokeWidth="1.5" />
            {/* Tube outline */}
            <path d="M20 22 L20 52 Q20 58 26 58 L38 58 Q44 58 44 52 L44 22 Z" fill="#ecfeff" stroke="#334155" strokeWidth="2" />
            {/* Tube rim */}
            <line x1="20" y1="22" x2="44" y2="22" stroke="#334155" strokeWidth="2" />
            <rect x="19" y="20" width="26" height="4" rx="1" fill="#cbd5e1" />
            {/* Liquid fill */}
            <path d="M20 38 L44 38 L44 52 Q44 58 38 58 L26 58 Q20 58 20 52 Z" fill="#06b6d4" fillOpacity="0.55" />
            {/* Bubbles */}
            <circle cx="26" cy="45" r="1.5" fill="#ecfeff" />
            <circle cx="36" cy="49" r="1" fill="#ecfeff" />
            <circle cx="30" cy="52" r="0.8" fill="#ecfeff" />
            {/* Label band */}
            <rect x="22" y="30" width="20" height="6" rx="1" fill="white" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="25" y1="33" x2="39" y2="33" stroke="#94a3b8" strokeWidth="1" />
        </svg>
    )
}

/* ─── 3. Microscope ─── */
export function MicroscopeIllustration(props: IllustrationProps) {
    return (
        <svg viewBox="0 0 64 64" fill="none" {...props}>
            {/* Base */}
            <path d="M16 54 L48 54 Q50 54 50 52 L50 50 L14 50 L14 52 Q14 54 16 54 Z" fill="#334155" />
            {/* Stage */}
            <rect x="20" y="42" width="24" height="4" rx="1" fill="#cbd5e1" />
            {/* Arm (curved) */}
            <path d="M28 42 L28 22 Q28 18 32 18 L42 18" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Tube / eyepiece */}
            <rect x="38" y="10" width="8" height="14" rx="1.5" fill="#0891b2" />
            <rect x="37" y="8" width="10" height="3" rx="1" fill="#334155" />
            {/* Objective lens */}
            <circle cx="42" cy="28" r="3.5" fill="#06b6d4" stroke="#334155" strokeWidth="1.5" />
            {/* Focus knob */}
            <circle cx="22" cy="32" r="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
            <circle cx="22" cy="32" r="1" fill="#334155" />
            {/* Slide on stage */}
            <rect x="36" y="43.5" width="6" height="1.5" rx="0.5" fill="#06b6d4" />
        </svg>
    )
}

/* ─── 4. Petri dish — top-down culture ─── */
export function PetriDishIllustration(props: IllustrationProps) {
    return (
        <svg viewBox="0 0 64 64" fill="none" {...props}>
            {/* Outer rim */}
            <circle cx="32" cy="32" r="24" fill="#ecfeff" stroke="#334155" strokeWidth="2" />
            {/* Inner agar */}
            <circle cx="32" cy="32" r="20" fill="#cffafe" />
            {/* Colonies */}
            <circle cx="24" cy="26" r="2.5" fill="#06b6d4" opacity="0.7" />
            <circle cx="28" cy="28" r="1.2" fill="#06b6d4" opacity="0.6" />
            <circle cx="38" cy="24" r="3" fill="#10b981" opacity="0.65" />
            <circle cx="42" cy="30" r="1.5" fill="#10b981" opacity="0.55" />
            <circle cx="22" cy="38" r="2" fill="#0891b2" opacity="0.6" />
            <circle cx="36" cy="42" r="2.8" fill="#06b6d4" opacity="0.5" />
            <circle cx="44" cy="40" r="1" fill="#10b981" opacity="0.7" />
            <circle cx="30" cy="44" r="1.6" fill="#0891b2" opacity="0.5" />
            <circle cx="26" cy="44" r="0.8" fill="#10b981" opacity="0.8" />
            {/* Highlight */}
            <ellipse cx="24" cy="22" rx="5" ry="2.5" fill="white" opacity="0.5" />
            {/* Rim tick */}
            <circle cx="32" cy="32" r="24" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="1 3" fill="none" />
        </svg>
    )
}

/* ─── 5. Water drop with pH indicator ─── */
export function WaterDropIllustration(props: IllustrationProps) {
    return (
        <svg viewBox="0 0 64 64" fill="none" {...props}>
            {/* Drop */}
            <path d="M32 8 C32 8 18 26 18 40 Q18 52 32 52 Q46 52 46 40 C46 26 32 8 32 8 Z" fill="#0891b2" fillOpacity="0.15" stroke="#334155" strokeWidth="2" />
            {/* Inner gradient drop */}
            <path d="M32 14 C32 14 23 28 23 40 Q23 47 32 47 Q41 47 41 40 C41 28 32 14 32 14 Z" fill="url(#dropFill)" />
            <defs>
                <linearGradient id="dropFill" x1="32" y1="14" x2="32" y2="47" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#67e8f9" />
                    <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
            </defs>
            {/* pH scale bars inside drop */}
            <rect x="28" y="34" width="2" height="8" rx="0.5" fill="white" opacity="0.85" />
            <rect x="31" y="30" width="2" height="12" rx="0.5" fill="white" opacity="0.85" />
            <rect x="34" y="36" width="2" height="6" rx="0.5" fill="white" opacity="0.85" />
            {/* Highlight */}
            <ellipse cx="27" cy="26" rx="2.5" ry="5" fill="white" opacity="0.55" transform="rotate(-20 27 26)" />
            {/* pH label */}
            <circle cx="48" cy="18" r="6" fill="white" stroke="#334155" strokeWidth="1.5" />
            <text x="48" y="21.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#0891b2">pH</text>
        </svg>
    )
}

/* ─── 6. Shield / validation ─── */
export function ValidationShieldIllustration(props: IllustrationProps) {
    return (
        <svg viewBox="0 0 64 64" fill="none" {...props}>
            {/* Shield outline */}
            <path d="M32 6 L50 12 L50 32 Q50 46 32 56 Q14 46 14 32 L14 12 Z" fill="#ecfeff" stroke="#334155" strokeWidth="2" />
            {/* Inner fill */}
            <path d="M32 11 L46 15.5 L46 32 Q46 43 32 50.5 Q18 43 18 32 L18 15.5 Z" fill="url(#shieldFill)" />
            <defs>
                <linearGradient id="shieldFill" x1="18" y1="11" x2="46" y2="50.5" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#cffafe" />
                    <stop offset="1" stopColor="#a7f3d0" />
                </linearGradient>
            </defs>
            {/* Check mark */}
            <path d="M24 32 L30 38 L42 26" stroke="#0891b2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Dot grid badge */}
            <circle cx="22" cy="18" r="1" fill="#10b981" />
            <circle cx="32" cy="16" r="1" fill="#10b981" />
            <circle cx="42" cy="18" r="1" fill="#10b981" />
        </svg>
    )
}

/* ─── Fallback generic flask illustration ─── */
export function FlaskIllustration(props: IllustrationProps) {
    return (
        <svg viewBox="0 0 64 64" fill="none" {...props}>
            <path d="M26 8 L38 8 L38 22 L48 46 Q50 52 44 52 L20 52 Q14 52 16 46 L26 22 Z" fill="#ecfeff" stroke="#334155" strokeWidth="2" />
            <path d="M22 38 L42 38 L47 48 Q49 52 44 52 L20 52 Q15 52 17 48 Z" fill="#06b6d4" fillOpacity="0.5" />
            <rect x="25" y="5" width="14" height="4" rx="1" fill="#334155" />
            <circle cx="28" cy="44" r="1.2" fill="white" />
            <circle cx="36" cy="47" r="0.8" fill="white" />
            <circle cx="32" cy="42" r="0.6" fill="white" />
        </svg>
    )
}

/* ─── Name-to-illustration resolver ─── */
export function resolveCategoryIllustration(name: string): React.ComponentType<IllustrationProps> {
    const lower = name.toLowerCase()
    if (lower.includes('atp') || lower.includes('luminometre')) return LuminometerIllustration
    if (lower.includes('swab') || lower.includes('allerjen')) return SwabIllustration
    if (lower.includes('mikroskop') || lower.includes('microscope') || lower.includes('patojen')) return PetriDishIllustration
    if (lower.includes('su') || lower.includes('ph') || lower.includes('hijyen kit')) return WaterDropIllustration
    if (lower.includes('validasyon') || lower.includes('sertifika')) return ValidationShieldIllustration
    if (lower.includes('yüzey') || lower.includes('test kit') || lower.includes('yüzey test')) return MicroscopeIllustration
    return FlaskIllustration
}
