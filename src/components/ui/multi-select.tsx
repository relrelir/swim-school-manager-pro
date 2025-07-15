import * as React from "react"
import { Check, X, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface Option {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "בחר אפשרויות...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item))
  }

  const handleSelect = (item: string) => {
    if (item === "all") {
      if (selected.includes("all")) {
        onChange([])
      } else {
        onChange(["all"])
      }
    } else {
      if (selected.includes(item)) {
        onChange(selected.filter((i) => i !== item))
      } else {
        const newSelected = selected.filter((i) => i !== "all")
        onChange([...newSelected, item])
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between text-right", className)}
          onClick={() => setOpen(!open)}
        >
          <div className="flex gap-1 flex-wrap max-w-full">
            {selected.length > 0 ? (
              selected.includes("all") ? (
                <span className="text-muted-foreground">הכל</span>
              ) : (
                selected.slice(0, 2).map((item) => {
                  const option = options.find((opt) => opt.value === item)
                  return (
                    <Badge
                      variant="secondary"
                      key={item}
                      className="mr-1 mb-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUnselect(item)
                      }}
                    >
                      {option?.label}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  )
                })
              )
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {selected.length > 2 && !selected.includes("all") && (
              <Badge variant="secondary" className="mr-1 mb-1">
                +{selected.length - 2} עוד
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-50">
        <Command>
          <CommandInput placeholder="חיפוש..." />
          <CommandList>
            <CommandEmpty>לא נמצא</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}