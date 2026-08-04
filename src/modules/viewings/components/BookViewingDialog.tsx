"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookViewingForm } from "./BookViewingForm"

interface BookViewingDialogProps {
  propertyId: number
  propertyName?: string
  trigger?: React.ReactNode
  onBooked?: (viewingId: number) => void
}

export function BookViewingDialog({
  propertyId,
  propertyName,
  trigger,
  onBooked,
}: BookViewingDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Calendar className="size-4 mr-2" />
            Book Viewing
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Book a viewing</DialogTitle>
          {propertyName && (
            <DialogDescription>{propertyName}</DialogDescription>
          )}
        </DialogHeader>
        <BookViewingForm
          propertyId={propertyId}
          onCancel={() => setOpen(false)}
          onSuccess={(id) => {
            setOpen(false)
            onBooked?.(id)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
