"use client"

import { Loader2 } from "lucide-react"

import { Button } from "components/ui/button"
import {
  PropertyDashboardCard,
  type DashboardProperty,
} from "./PropertyDashboardCard"

export interface PaginationInfo {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

interface PropertyGridViewProps {
  properties: DashboardProperty[]
  loading: boolean
  pagination: PaginationInfo
  filteredStatus: string
  page: number
  onPageChange: (page: number) => void
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: string) => Promise<void>
}

export function PropertyGridView({
  properties,
  loading,
  pagination,
  filteredStatus,
  page,
  onPageChange,
  onDelete,
  onStatusChange,
}: PropertyGridViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No properties found. Try adjusting your filters.
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {properties.map((property) => (
          <PropertyDashboardCard
            key={property.id}
            property={property}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Showing {pagination.from || 0} to {pagination.to || 0} of{" "}
          {pagination.total} properties
          {filteredStatus && ` (filtered by ${filteredStatus})`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onPageChange(Math.min(pagination.last_page, page + 1))
            }
            disabled={page >= pagination.last_page || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  )
}