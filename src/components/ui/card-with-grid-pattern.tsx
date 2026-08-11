import { cn } from '@/lib/utils'
import { motion } from "framer-motion"

interface GridPatternCardProps {
  children: React.ReactNode
  className?: string
  patternClassName?: string
  gradientClassName?: string
}

export function GridPatternCard({ 
  children, 
  className,
  patternClassName,
  gradientClassName
}: GridPatternCardProps) {
  return (
    <motion.div
      className={cn(
        "border w-full rounded-[32px] overflow-hidden relative",
        "bg-white",
        "border-line",
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className={cn(
        "absolute inset-0 bg-repeat bg-[length:30px_30px] opacity-[0.03]",
        "bg-[radial-gradient(circle_at_center,_#05070F_1px,_transparent_1px)]",
        patternClassName
      )} />
      <div className={cn(
        "relative z-10 size-full bg-gradient-to-tr",
        "from-white/90 via-transparent to-transparent",
        gradientClassName
      )}>
        {children}
      </div>
    </motion.div>
  )
}

export function GridPatternCardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("text-left p-8 md:p-10", className)} 
      {...props} 
    />
  )
}
