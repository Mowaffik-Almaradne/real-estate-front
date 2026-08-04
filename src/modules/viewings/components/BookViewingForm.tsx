"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, Clock, Loader2, Users, Video, MapPin, Home as HomeIcon, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

import { viewingService, isSlotConflict } from "../services/viewingService"
import {
  bookViewingSchema,
  type BookViewingValues,
} from "../schemas"
import { ViewingType } from "@/types/enums"
import { ApiClientError } from "@/lib/apiClient"

interface BookViewingFormProps {
  propertyId: number
  onSuccess?: (viewingId: number) => void
  onCancel?: () => void
}

const VIEWING_TYPE_OPTIONS = [
  { value: ViewingType.in_person, label: "In Person", icon: MapPin },
  { value: ViewingType.virtual, label: "Virtual", icon: Video },
  { value: ViewingType.open_house, label: "Open House", icon: HomeIcon },
] as const

const DURATION_OPTIONS = [30, 45, 60, 90, 120] as const
const BUFFER_OPTIONS = [0, 10, 15, 30] as const

function nowLocalDateTimeInput(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

export function BookViewingForm({ propertyId, onSuccess, onCancel }: BookViewingFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [conflictHint, setConflictHint] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookViewingValues>({
    resolver: zodResolver(bookViewingSchema),
    defaultValues: {
      scheduled_at: nowLocalDateTimeInput(),
      duration_minutes: 60,
      buffer_minutes: 15,
      viewing_type: ViewingType.in_person,
      max_attendees: 1,
      contact_name: "",
      contact_phone: "",
      notes: "",
    },
  })

  const selectedType = watch("viewing_type")
  const selectedDuration = watch("duration_minutes")
  const selectedBuffer = watch("buffer_minutes")
  const selectedAttendees = watch("max_attendees")

  useEffect(() => {
    setConflictHint(null)
  }, [selectedType, selectedDuration, selectedBuffer, selectedAttendees])

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    setConflictHint(null)
    try {
      const scheduledAt = new Date(values.scheduled_at).toISOString()
      const viewing = await viewingService.create({
        property_id: propertyId,
        scheduled_at: scheduledAt,
        duration_minutes: values.duration_minutes,
        buffer_minutes: values.buffer_minutes,
        viewing_type: values.viewing_type,
        contact_name: values.contact_name || undefined,
        contact_phone: values.contact_phone || undefined,
        notes: values.notes || undefined,
        max_attendees: values.max_attendees,
      })
      toast.success("Viewing booked. The publisher will confirm shortly.")
      onSuccess?.(viewing.id)
    } catch (error) {
      if (isSlotConflict(error)) {
        setConflictHint(
          error instanceof ApiClientError
            ? error.message
            : "This slot is no longer available. Please pick another time."
        )
        setServerError("Time slot unavailable")
      } else if (error instanceof ApiClientError) {
        setServerError(error.message)
      } else {
        setServerError("Failed to book viewing. Please try again.")
      }
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {serverError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">{serverError}</p>
            {conflictHint && <p className="text-xs mt-1">{conflictHint}</p>}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="scheduled_at">Date & Time</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="scheduled_at"
            type="datetime-local"
            className="pl-9"
            {...register("scheduled_at")}
          />
        </div>
        {errors.scheduled_at && (
          <p className="text-xs text-destructive">{errors.scheduled_at.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Viewing Type</Label>
          <Select
            value={selectedType}
            onValueChange={(value) =>
              setValue("viewing_type", value as ViewingType, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIEWING_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    <option.icon className="size-3.5" />
                    {option.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_attendees">Attendees</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="max_attendees"
              type="number"
              min={1}
              max={50}
              className="pl-9"
              {...register("max_attendees", { valueAsNumber: true })}
            />
          </div>
          {errors.max_attendees && (
            <p className="text-xs text-destructive">{errors.max_attendees.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Duration</Label>
          <Select
            value={String(selectedDuration)}
            onValueChange={(value) =>
              setValue("duration_minutes", Number(value), { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((minutes) => (
                <SelectItem key={minutes} value={String(minutes)}>
                  <span className="flex items-center gap-2">
                    <Clock className="size-3.5" />
                    {minutes} minutes
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Buffer</Label>
          <Select
            value={String(selectedBuffer)}
            onValueChange={(value) =>
              setValue("buffer_minutes", Number(value), { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUFFER_OPTIONS.map((minutes) => (
                <SelectItem key={minutes} value={String(minutes)}>
                  {minutes === 0 ? "No buffer" : `${minutes} minutes`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_name">Contact Name</Label>
          <Input
            id="contact_name"
            placeholder="Your name"
            {...register("contact_name")}
          />
          {errors.contact_name && (
            <p className="text-xs text-destructive">{errors.contact_name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input
            id="contact_phone"
            placeholder="+1 555..."
            {...register("contact_phone")}
          />
          {errors.contact_phone && (
            <p className="text-xs text-destructive">{errors.contact_phone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Anything the publisher should know"
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-xs text-destructive">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
          Book Viewing
        </Button>
      </div>
    </form>
  )
}
