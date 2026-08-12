"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({
  className,
  ref,
  ...props
}: React.ComponentProps<"table"> & {
  ref?: React.Ref<HTMLTableElement>
}) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        ref={ref}
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({
  className,
  ref,
  ...props
}: React.ComponentProps<"thead"> & {
  ref?: React.Ref<HTMLTableSectionElement>
}) {
  return (
    <thead
      ref={ref}
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({
  className,
  ref,
  ...props
}: React.ComponentProps<"tbody"> & {
  ref?: React.Ref<HTMLTableSectionElement>
}) {
  return (
    <tbody
      ref={ref}
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({
  className,
  ref,
  ...props
}: React.ComponentProps<"tfoot"> & {
  ref?: React.Ref<HTMLTableSectionElement>
}) {
  return (
    <tfoot
      ref={ref}
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({
  className,
  ref,
  ...props
}: React.ComponentProps<"tr"> & {
  ref?: React.Ref<HTMLTableRowElement>
}) {
  return (
    <tr
      ref={ref}
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  ref,
  ...props
}: React.ComponentProps<"th"> & {
  ref?: React.Ref<HTMLTableCellElement>
}) {
  return (
    <th
      ref={ref}
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({
  className,
  ref,
  ...props
}: React.ComponentProps<"td"> & {
  ref?: React.Ref<HTMLTableCellElement>
}) {
  return (
    <td
      ref={ref}
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ref,
  ...props
}: React.ComponentProps<"caption"> & {
  ref?: React.Ref<HTMLTableCaptionElement>
}) {
  return (
    <caption
      ref={ref}
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
