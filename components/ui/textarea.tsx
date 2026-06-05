import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  ref,
  ...props
}: React.ComponentProps<"textarea"> & {
  ref?: React.Ref<HTMLTextAreaElement>
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
}

export { Textarea }