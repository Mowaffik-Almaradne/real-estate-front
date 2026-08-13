"use client"

import { useEffect, useState } from "react"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale } from "next-intl"
import {
  AlertCircle,
  Calendar as CalendarIcon,
  FileText,
  Image as ImageIcon,
  Loader2,
  User as UserIcon,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { ApiClientError } from "@/lib/apiClient"
import {
  createRentalCardSchema,
  type CreateRentalCardValues,
} from "../schemas"
import { rentalCardService } from "../services/rentalCardService"
import { getRentalCardLabel } from "../labels"
import { RENTAL_CARD_PHOTOS_MAX } from "../types/enums"
import type { CreateRentalCardInput, RentalCardDto } from "../types/dto"

interface CreateRentalCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  propertyId?: number
  onCreated?: (card: RentalCardDto) => void
}

function todayIso(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function defaultStartDate(): string {
  return todayIso()
}

function defaultEndDate(): string {
  const now = new Date()
  now.setDate(now.getDate() + 365)
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function isPhotoMime(file: File): boolean {
  if (file.type) {
    return ["image/jpeg", "image/png", "image/webp"].includes(file.type)
  }
  return /\.(jpe?g|png|webp)$/i.test(file.name)
}

export function CreateRentalCardDialog({
  open,
  onOpenChange,
  propertyId,
  onCreated,
}: CreateRentalCardDialogProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getRentalCardLabel(locale, key, vars)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateRentalCardValues>({
    resolver: zodResolver(createRentalCardSchema),
    defaultValues: {
      property_id: propertyId ?? 0,
      tenant_mode: "registered",
      tenant_user_id: undefined,
      external_tenant_name: "",
      external_tenant_phone: "",
      external_tenant_email: "",
      external_tenant_id_notes: "",
      start_date: defaultStartDate(),
      end_date: defaultEndDate(),
      terms: "",
      notes: "",
      is_renewable: false,
      pre_rental_photos: [],
    },
  })

  const tenantMode = useWatch({ control, name: "tenant_mode" }) ?? "registered"
  const startDate = useWatch({ control, name: "start_date" })
  const currentPhotos = useWatch({ control, name: "pre_rental_photos" }) ?? []

  useEffect(() => {
    if (open) {
      reset({
        property_id: propertyId ?? 0,
        tenant_mode: "registered",
        tenant_user_id: undefined,
        external_tenant_name: "",
        external_tenant_phone: "",
        external_tenant_email: "",
        external_tenant_id_notes: "",
        start_date: defaultStartDate(),
        end_date: defaultEndDate(),
        terms: "",
        notes: "",
        is_renewable: false,
        pre_rental_photos: [],
      })
    }
  }, [open, propertyId, reset])

  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photoPreviews])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setServerError(null)
      setFileError(null)
      setPhotoPreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url))
        return []
      })
    }
    onOpenChange(next)
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const payload: CreateRentalCardInput = {
        property_id: Number(values.property_id),
        start_date: values.start_date,
        end_date: values.end_date,
        tenant_user_id:
          values.tenant_mode === "registered" && values.tenant_user_id
            ? Number(values.tenant_user_id)
            : null,
        external_tenant_name:
          values.tenant_mode === "external" ? values.external_tenant_name ?? null : null,
        external_tenant_phone:
          values.tenant_mode === "external" ? values.external_tenant_phone ?? null : null,
        external_tenant_email:
          values.tenant_mode === "external" ? values.external_tenant_email ?? null : null,
        external_tenant_id_notes:
          values.tenant_mode === "external"
            ? values.external_tenant_id_notes ?? null
            : null,
        terms: values.terms ?? null,
        notes: values.notes ?? null,
        is_renewable: values.is_renewable,
        pre_rental_photos:
          values.pre_rental_photos && values.pre_rental_photos.length > 0
            ? values.pre_rental_photos
            : null,
      }
      const card = await rentalCardService.create(payload)
      toast.success(label("rentalCards.toast.created"))
      onCreated?.(card)
      handleOpenChange(false)
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.isServerError() && error.message.toLowerCase().includes("not available")) {
          setServerError(label("rentalCards.errors.propertyUnavailable"))
        } else {
          setServerError(error.message || label("rentalCards.toast.createFailed"))
        }
      } else {
        setServerError(label("rentalCards.toast.createFailed"))
      }
    }
  })

  const handlePhotos = (files: FileList | null) => {
    if (!files) return
    setFileError(null)
    const list = Array.from(files)
    if (list.some((file) => !isPhotoMime(file))) {
      setFileError(label("rentalCards.errors.photoType"))
      return
    }
    if (list.some((file) => file.size > 5 * 1024 * 1024)) {
      setFileError(label("rentalCards.errors.photoTooLarge"))
      return
    }
    const next = [...currentPhotos, ...list]
    if (next.length > RENTAL_CARD_PHOTOS_MAX) {
      setFileError(label("rentalCards.errors.tooManyPhotos"))
      return
    }
    setValue("pre_rental_photos", next, { shouldValidate: true })
    setPhotoPreviews((prev) => [
      ...prev,
      ...list.map((file) => URL.createObjectURL(file)),
    ])
  }

  const removePhoto = (index: number) => {
    const next = currentPhotos.filter((_, idx) => idx !== index)
    setValue("pre_rental_photos", next, { shouldValidate: true })
    setPhotoPreviews((prev) => {
      const removed = prev[index]
      if (removed) URL.revokeObjectURL(removed)
      return prev.filter((_, idx) => idx !== index)
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{label("rentalCards.createDialog.title")}</DialogTitle>
          <DialogDescription>{label("rentalCards.createDialog.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          {serverError && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{serverError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property_id">{label("rentalCards.fields.property")} ID</Label>
              <Input
                id="property_id"
                type="number"
                min={1}
                disabled={Boolean(propertyId)}
                {...register("property_id", { valueAsNumber: true })}
              />
              {errors.property_id && (
                <p className="text-xs text-destructive">{errors.property_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{label("rentalCards.fields.tenant")}</Label>
              <Select
                value={tenantMode}
                onValueChange={(value) =>
                  setValue("tenant_mode", value as "registered" | "external", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registered">
                    {label("rentalCards.fields.tenantKind.registered")}
                  </SelectItem>
                  <SelectItem value="external">
                    {label("rentalCards.fields.tenantKind.external")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {tenantMode === "registered" ? (
            <div className="space-y-2">
              <Label htmlFor="tenant_user_id">{label("rentalCards.fields.tenantUserId")}</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="tenant_user_id"
                  type="number"
                  min={1}
                  className="pl-9"
                  {...register("tenant_user_id", { valueAsNumber: true })}
                />
              </div>
              {errors.tenant_user_id && (
                <p className="text-xs text-destructive">
                  {label("rentalCards.errors.missingTenant")}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="external_tenant_name">
                  {label("rentalCards.fields.externalName")}
                </Label>
                <Input
                  id="external_tenant_name"
                  {...register("external_tenant_name")}
                />
                {errors.external_tenant_name && (
                  <p className="text-xs text-destructive">
                    {label("rentalCards.errors.missingTenant")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="external_tenant_phone">
                  {label("rentalCards.fields.externalPhone")}
                </Label>
                <Input
                  id="external_tenant_phone"
                  {...register("external_tenant_phone")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="external_tenant_email">
                  {label("rentalCards.fields.externalEmail")}
                </Label>
                <Input
                  id="external_tenant_email"
                  type="email"
                  {...register("external_tenant_email")}
                />
                {errors.external_tenant_email && (
                  <p className="text-xs text-destructive">
                    {String(errors.external_tenant_email.message ?? "")}
                  </p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="external_tenant_id_notes">
                  {label("rentalCards.fields.externalNotes")}
                </Label>
                <Textarea
                  id="external_tenant_id_notes"
                  rows={2}
                  {...register("external_tenant_id_notes")}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">{label("rentalCards.fields.startDate")}</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="start_date"
                  type="date"
                  className="pl-9"
                  {...register("start_date")}
                />
              </div>
              {errors.start_date && (
                <p className="text-xs text-destructive">{label("rentalCards.errors.pastStartDate")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">{label("rentalCards.fields.endDate")}</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="end_date"
                  type="date"
                  min={startDate}
                  className="pl-9"
                  {...register("end_date")}
                />
              </div>
              {errors.end_date && (
                <p className="text-xs text-destructive">
                  {label("rentalCards.errors.endBeforeStart")}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">{label("rentalCards.fields.terms")}</Label>
            <Textarea
              id="terms"
              rows={3}
              placeholder="Monthly rent 3000 SAR"
              {...register("terms")}
            />
            {errors.terms && (
              <p className="text-xs text-destructive">{errors.terms.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{label("rentalCards.fields.notes")}</Label>
            <Textarea
              id="notes"
              rows={2}
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="is_renewable" className="text-sm">
                {label("rentalCards.fields.isRenewable")}
              </Label>
            </div>
            <Controller
              control={control}
              name="is_renewable"
              render={({ field }) => (
                <Switch
                  id="is_renewable"
                  checked={Boolean(field.value)}
                  onCheckedChange={(value) => field.onChange(Boolean(value))}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pre_rental_photos">
              {label("rentalCards.fields.preRentalPhotos")}
            </Label>
            <p className="text-xs text-muted-foreground">
              {label("rentalCards.fields.preRentalPhotosHint")}
            </p>
            <Controller
              control={control}
              name="pre_rental_photos"
              render={() => (
                <Input
                  id="pre_rental_photos"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => handlePhotos(event.target.files)}
                />
              )}
            />
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {photoPreviews.map((src, index) => (
                  <div
                    key={src}
                    className="relative h-20 w-full overflow-hidden rounded-md border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground shadow"
                      onClick={() => removePhoto(index)}
                      aria-label="Remove photo"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {fileError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                {fileError}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
              <FileText className="size-4 mr-1" />
              {label("rentalCards.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface CreateRentalCardButtonProps {
  propertyId?: number
  onCreated?: (card: RentalCardDto) => void
}

export function CreateRentalCardButton({
  propertyId,
  onCreated,
}: CreateRentalCardButtonProps) {
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <ImageIcon className="size-4 mr-1" />
        {getRentalCardLabel(locale, "rentalCards.create")}
      </Button>
      <CreateRentalCardDialog
        open={open}
        onOpenChange={setOpen}
        propertyId={propertyId}
        onCreated={onCreated}
      />
    </>
  )
}
