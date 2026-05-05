import { cn } from '@/lib/utils'

interface BentoCardProps {
    children: React.ReactNode
    className?: string
    filled?: boolean
    hover?: boolean
}

export function BentoCard({ children, className, filled = false, hover = true }: BentoCardProps) {
    return (
        <div
            className={cn(
                filled ? 'bento-card-filled' : 'bento-card',
                !hover && '!transform-none hover:!transform-none hover:!shadow-none',
                className
            )}
        >
            {children}
        </div>
    )
}
