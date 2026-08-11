"use client"

import { Building2, Edit, Loader2, MapPin, Trash2 } from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import type { City } from "@/types/dto"
import type { Country } from "lib/api"
import { CityFormDialog } from "./CityFormDialog"

interface CityPanelProps {
  cities: City[]
  countries: Country[]
  selectedCountry: Country | null
  loading: boolean
  dialogOpen: boolean
  editing: City | null
  onDialogOpenChange: (open: boolean) => void
  onEdit: (city: City) => void
  onDelete: (id: number) => void
  onSaved: (city: City, isEdit: boolean) => void
}

export function CityPanel({
  cities,
  countries,
  selectedCountry,
  loading,
  dialogOpen,
  editing,
  onDialogOpenChange,
  onEdit,
  onDelete,
  onSaved,
}: CityPanelProps) {
  return (
    <div className="flex-1 flex flex-col rounded-[6px] bg-card border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 border-b border-border p-3">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">
            {selectedCountry
              ? `Cities in ${selectedCountry.name}`
              : "Select a country"}
          </h2>
        </div>
        <CityFormDialog
          countries={countries}
          editing={editing}
          defaultCountryId={selectedCountry?.id ?? null}
          disabled={!selectedCountry}
          open={dialogOpen}
          onOpenChange={onDialogOpenChange}
          onSaved={onSaved}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-h-[50vh] lg:max-h-[calc(100vh-16rem)]">
        {selectedCountry ? (
          loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {cities.map((city) => (
                <Card
                  key={city.id}
                  className="border-border hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex size-7 items-center justify-center rounded-[4px] bg-muted shrink-0">
                        <Building2 className="size-3.5 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-sm truncate">{city.name}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => onEdit(city)}
                      >
                        <Edit className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => onDelete(city.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <MapPin className="size-12 mb-3 opacity-50" />
            <p>Select a country to view its cities</p>
          </div>
        )}
      </div>
    </div>
  )
}