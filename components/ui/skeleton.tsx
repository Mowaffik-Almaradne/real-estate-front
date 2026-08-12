import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ref,
  ...props
}: React.ComponentProps<"div"> & {
  ref?: React.Ref<HTMLDivElement>
}) {
  return (
    <div
      ref={ref}
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
