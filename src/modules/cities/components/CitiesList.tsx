"use client"

import { useState, useEffect, useCallback } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Pencil, Trash2, Plus, Search } from "lucide-react"
import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { cityService } from "../services/cityService"
import type { City, CitiesResponse } from "@/types/dto"
import type { PaginationInfo } from "@/types/common"
import { CityFormModal } from "./CityFormModal"
import { CityDeleteModal } from "./CityDeleteModal"

const columnHelper = createColumnHelper<City>()

interface CitiesListProps {
  initialData?: CitiesResponse
}

export function CitiesList({ initialData }: CitiesListProps) {
  const [data, setData] = useState<City[]>(initialData?.data || [])
  const [pagination, setPagination] = useState<PaginationInfo>(
    initialData?.pagination || {
      total: 0,
      per_page: 10,
      current_page: 1,
      last_page: 1,
      from: null,
      to: null,
    }
  )
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingCity, setDeletingCity] = useState<City | null>(null)

  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => (
        <span className="font-medium">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("is_active", {
      header: "Status",
      cell: (info) =>
        info.getValue() ? (
          <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setEditingCity(row.original)
              setIsFormOpen(true)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-red-500 hover:text-red-600"
            onClick={() => {
              setDeletingCity(row.original)
              setIsDeleteOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ]

  const fetchCities = useCallback(async () => {
    setLoading(true)
    try {
      const response = await cityService.getCities({
        search: debouncedSearch,
        page,
        per_page: pagination.per_page,
      })
      setData(response.data)
      setPagination(response.pagination)
    } catch {
      toast.error("Failed to fetch cities")
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page, pagination.per_page])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    fetchCities()
  }, [fetchCities])

  // eslint-disable-next-line react-hooks/incompatible-library -- @tanstack/react-table v8 does not yet expose a React Compiler-compatible API; tracked for when v9 lands.
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getRowId: (row) => String(row.id),
  })

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingCity(null)
    fetchCities()
  }

  const handleDeleteSuccess = () => {
    setIsDeleteOpen(false)
    setDeletingCity(null)
    fetchCities()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cities</CardTitle>
        <CardDescription>Manage your city list here.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add City
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-3 py-4">
          <p className="text-sm text-muted-foreground">
            {pagination.total > 0
              ? `Showing ${pagination.from ?? 0}–${pagination.to ?? 0} of ${pagination.total}`
              : "No results"}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              Page {pagination.current_page} of {Math.max(1, pagination.last_page)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
              disabled={page >= pagination.last_page || loading || pagination.last_page <= 1}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>

      <CityFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        city={editingCity}
        onSuccess={handleFormSuccess}
      />

      <CityDeleteModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        city={deletingCity}
        onSuccess={handleDeleteSuccess}
      />
    </Card>
  )
}