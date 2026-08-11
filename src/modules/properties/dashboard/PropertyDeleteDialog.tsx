"use client"

import { Loader2 } from "lucide-react"

import { Button } from "components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog"

interface PropertyDeleteDialogProps {
  open: boolean
  deleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function PropertyDeleteDialog({
  open,
  deleting,
  onOpenChange,
  onConfirm,
}: PropertyDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Property</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this property? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}