import { cn } from "@/lib/utils";

export function DreamyDeskLogo(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 p-1 dark:bg-transparent",
        props.className
      )}
    >
      <img
        src="/logo.png"
        alt="DreamyDesk Logo"
        width={32}
        height={32}
        className="object-contain"
        loading="eager" 
      />
    </div>
  );
}
