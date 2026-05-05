import { cn } from '@/lib/utils'

interface GlassWidgetProps {
    icon: React.ReactNode
    label: string
    value: string
    className?: string
}

export function GlassWidget({ icon, label, value, className }: GlassWidgetProps) {
    return (
        <div className={cn('glass-widget px-5 py-4 flex items-center gap-4', className)}>
            <div className="w-11 h-11 rounded-xl bg-azure-50/80 flex items-center justify-center text-azure-500 shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-[22px] font-extrabold text-slate-800 leading-none">{value}</p>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">{label}</p>
            </div>
        </div>
    )
}
