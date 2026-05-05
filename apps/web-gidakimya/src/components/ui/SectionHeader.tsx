import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
    tag?: string
    title: string
    description?: string
    linkTo?: string
    linkLabel?: string
}

export function SectionHeader({ tag, title, description, linkTo, linkLabel = 'Tümünü Gör' }: SectionHeaderProps) {
    return (
        <div className="flex items-end justify-between mb-14">
            <div>
                {tag && (
                    <span className="text-[10px] font-bold text-azure-500 uppercase tracking-[0.2em]">{tag}</span>
                )}
                <h2 className="mt-3 text-3xl sm:text-[2.5rem] font-extrabold text-slate-900 tracking-[-0.03em]">{title}</h2>
                {description && (
                    <p className="mt-3 text-slate-400 max-w-lg leading-relaxed">{description}</p>
                )}
            </div>
            {linkTo && (
                <Link
                    to={linkTo}
                    className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-bold text-azure-500 hover:text-azure-600 hover:gap-2.5 transition-all duration-300"
                >
                    {linkLabel} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            )}
        </div>
    )
}
