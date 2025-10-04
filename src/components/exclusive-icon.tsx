
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

export function ExclusiveIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <div className={cn("absolute top-2 right-2 z-10 p-1.5 rounded-full bg-yellow-500/80 backdrop-blur-sm text-white", className)}>
        <Lock className="w-4 h-4" />
    </div>
  )
}
