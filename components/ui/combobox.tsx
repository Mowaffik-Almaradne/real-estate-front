"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"
import { CheckIcon, ChevronDownIcon, SearchIcon, Loader2 } from "lucide-react"
import { Input } from "./input"

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  options?: ComboboxOption[]
  disabled?: boolean
  className?: string
  searchPlaceholder?: string
  onSearch?: (search: string) => void
  loading?: boolean
}

export function Combobox({
  value,
  onValueChange,
  placeholder = "Select...",
  options = [],
  disabled,
  className,
  searchPlaceholder = "Search...",
  onSearch,
  loading,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [localOptions, setLocalOptions] = React.useState<ComboboxOption[]>(options)

  React.useEffect(() => {
    setLocalOptions(options)
  }, [options])

  const selectedOption = localOptions.find((opt) => opt.value === value)

  const filteredOptions = localOptions.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value
    setSearch(newSearch)
    onSearch?.(newSearch)
  }

  const handleSelect = (option: ComboboxOption) => {
    onValueChange?.(option.value)
    setOpen(false)
    setSearch("")
  }

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) {
          setSearch("")
        }
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            className
          )}
        >
          <span className={selectedOption ? "" : "text-muted-foreground"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDownIcon className="size-4 opacity-50" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="z-50 w-[--radix-popover-trigger-width] min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
          align="start"
          sideOffset={4}
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <div className="p-2">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={handleSearchChange}
                className="h-8 pl-8"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
                    value === option.value && "bg-accent"
                  )}
                >
                  <span className="absolute right-2 flex size-3.5 items-center justify-center">
                    {value === option.value && <CheckIcon className="size-4" />}
                  </span>
                  {option.label}
                </button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}