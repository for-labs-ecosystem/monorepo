import { cn } from '@/lib/utils'

interface BentoGridProps {
    children: React.ReactNode
    className?: string
}

export function BentoGrid({ children, className }: BentoGridProps) {
    return (
        <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6', className)}>
            {children}
        </div>
    )
}
