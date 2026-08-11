"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { cityService } from "../services/cityService"
import type { City } from "../types"

interface CityDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  city: City | null
  onSuccess: () => void
}

export function CityDeleteModal({
  open,
  onOpenChange,
  city,
  onSuccess,
}: CityDeleteModalProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!city) return
    
    setDeleting(true)
    try {
      await cityService.deleteCity(city.id)
      toast.success("City deleted successfully")
      onSuccess()
    } catch {
      toast.error("Failed to delete city")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete City</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{city?.name}</span>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}