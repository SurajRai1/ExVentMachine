import { cn } from '@/lib/utils'

interface LoadingProps {
  className?: string
  text?: string
}

export function Loading({ className, text = 'Loading...' }: LoadingProps) {
  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      <div className="relative">
        {/* Outer ring */}
        <div className="w-20 h-20 rounded-full border-4 border-primary/20 animate-pulse" />
        
        {/* Spinning inner ring */}
        <div className="absolute inset-0 w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
        
        {/* Inner sparkles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {text && (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25" />
          <p className="relative text-lg text-gray-300 animate-pulse">
            {text}
          </p>
        </div>
      )}
    </div>
  )
} 