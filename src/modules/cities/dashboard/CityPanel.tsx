"use client"

import { useEffect, useMemo, useState } from "react"
import { Building2, ChevronLeft, ChevronRight, Edit, Loader2, MapPin, Search, Trash2 } from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import { Input } from "components/ui/input"
import type { City } from "@/types/dto"
import type { Country } from "lib/api"
import { CityFormDialog } from "./CityFormDialog"

const PAGE_SIZE = 12

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
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    setSearch("")
    setPage(1)
  }, [selectedCountry?.id])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return cities
    return cities.filter((city) => city.name.toLowerCase().includes(q))
  }, [cities, search])

  const lastPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, lastPage)
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )
  const from = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const to = Math.min(currentPage * PAGE_SIZE, filtered.length)

  useEffect(() => {
    if (page > lastPage) setPage(lastPage)
  }, [page, lastPage])

  return (
    <div className="flex-1 flex flex-col rounded-[6px] bg-card border border-border shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">
              {selectedCountry
                ? `Cities in ${selectedCountry.name}`
                : "Select a country"}
            </h2>
            {selectedCountry && (
              <span className="text-xs text-muted-foreground">
                ({filtered.length}
                {search.trim() ? ` of ${cities.length}` : ""})
              </span>
            )}
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

        {selectedCountry && (
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search cities..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-8 h-9"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-h-[50vh] lg:max-h-[calc(100vh-16rem)]">
        {selectedCountry ? (
          loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground py-12">
              <MapPin className="size-10 mb-3 opacity-50" />
              <p className="text-sm">
                {search.trim() ? "No cities match your search" : "No cities in this country"}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {pageItems.map((city) => (
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

      {selectedCountry && !loading && filtered.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Showing {from}–{to} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {currentPage} / {lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={currentPage >= lastPage}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
