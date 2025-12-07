import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
export { Textarea };
