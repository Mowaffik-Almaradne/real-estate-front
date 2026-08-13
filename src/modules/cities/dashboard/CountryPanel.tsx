"use client"

import { Edit, Globe, Trash2 } from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import type { Country } from "lib/api"
import { CountryFormDialog } from "./CountryFormDialog"

interface CountryPanelProps {
  countries: Country[]
  selected: Country | null
  onSelect: (country: Country) => void
  onEdit: (country: Country) => void
  onDelete: (id: number) => void
  dialogOpen: boolean
  editing: Country | null
  onDialogOpenChange: (open: boolean) => void
  onSaved: (country: Country, isEdit: boolean) => void
}

export function CountryPanel({
  countries,
  selected,
  onSelect,
  onEdit,
  onDelete,
  dialogOpen,
  editing,
  onDialogOpenChange,
  onSaved,
}: CountryPanelProps) {
  return (
    <div className="w-full lg:w-[30%] min-w-[280px] flex flex-col rounded-[6px] bg-card border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 border-b border-border p-3">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Countries</h2>
          <span className="text-xs text-muted-foreground">({countries.length})</span>
        </div>
        <CountryFormDialog
          editing={editing}
          isOpen={dialogOpen}
          onOpenChange={onDialogOpenChange}
          onSaved={onSaved}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[50vh] lg:max-h-[calc(100vh-16rem)]">
        {countries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No countries yet
          </p>
        ) : (
          countries.map((country) => (
            <Card
              key={country.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selected?.id === country.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => onSelect(country)}
            >
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-7 items-center justify-center rounded-[4px] ${
                      selected?.id === country.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <Globe
                      className={`size-3.5 ${
                        selected?.id === country.id
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{country.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {country.cities_count ?? 0} cities
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(country)
                    }}
                  >
                    <Edit className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(country.id)
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
