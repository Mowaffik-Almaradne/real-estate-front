"use client"

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale } from "next-intl"
import {
  AlertCircle,
  Coins,
  DollarSign,
  Loader2,
  Send,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"

import { AsyncSelect } from "@/components/ui/async-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import type { PropertyDto } from "@/types/property"

import {
  createDepositSchema,
  type CreateDepositValues,
} from "../schemas"
import { depositService } from "../services/depositService"
import { propertyService } from "src/modules/properties/services/propertyService"
import { getDepositLabel } from "../labels"
import { DEPOSIT_CURRENCIES, DepositCurrency } from "../types/enums"
import type { CreateDepositInput, DepositDto } from "../types/dto"

interface CreateDepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  propertyId?: number
  propertyName?: string
  sellerId?: number
  defaultCurrency?: string
  onCreated?: (deposit: DepositDto) => void
}

function toDepositCurrency(value?: string | null): DepositCurrency {
  if (value === DepositCurrency.USD) return DepositCurrency.USD
  if (value === DepositCurrency.SAR) return DepositCurrency.SAR
  return DepositCurrency.USD
}

export function CreateDepositDialog({
  open,
  onOpenChange,
  propertyId,
  propertyName,
  sellerId,
  defaultCurrency,
  onCreated,
}: CreateDepositDialogProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getDepositLabel(locale, key, vars)
  const [serverError, setServerError] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<PropertyDto | null>(null)
  const [lockedProperty, setLockedProperty] = useState<PropertyDto | null>(null)
  const currencyDefault = toDepositCurrency(defaultCurrency)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateDepositValues>({
    resolver: zodResolver(createDepositSchema),
    defaultValues: {
      property_id: propertyId ?? 0,
      seller_id: sellerId ?? 0,
      amount: 0,
      currency: currencyDefault,
      terms: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (!propertyId) {
      setLockedProperty(null)
      return
    }
    let cancelled = false
    propertyService
      .getPropertyById(propertyId)
      .then((property) => {
        if (!cancelled) setLockedProperty(property)
      })
      .catch(() => {
        if (!cancelled) setLockedProperty(null)
      })
    return () => {
      cancelled = true
    }
  }, [propertyId])

  const propertyValue = lockedProperty ?? selectedProperty

  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form v7's watch() is not yet React Compiler-compatible
  const selectedCurrency = watch("currency")

  useEffect(() => {
    if (!open) return
    void Promise.resolve().then(() => {
      reset({
        property_id: propertyId ?? 0,
        seller_id: sellerId ?? 0,
        amount: 0,
        currency: toDepositCurrency(defaultCurrency),
        terms: "",
        notes: "",
      })
      setServerError(null)
    })
  }, [open, propertyId, sellerId, defaultCurrency, reset])

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const payload: CreateDepositInput = {
        property_id: Number(values.property_id),
        seller_id: Number(values.seller_id),
        amount: Number(values.amount),
        currency: (values.currency as DepositCurrency) || currencyDefault,
        terms: values.terms ?? null,
        notes: values.notes ?? null,
      }
      const created = await depositService.create(payload)
      toast.success(label("deposits.toast.created"))
      onCreated?.(created)
      handleOpenChange(false)
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message || label("deposits.toast.createFailed")
          : label("deposits.toast.createFailed")
      setServerError(message)
      toast.error(message)
    }
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset({
        property_id: propertyId ?? 0,
        seller_id: sellerId ?? 0,
        amount: 0,
        currency: currencyDefault,
        terms: "",
        notes: "",
      })
      setSelectedProperty(null)
      setServerError(null)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{label("deposits.createDialog.title")}</DialogTitle>
          <DialogDescription>
            {propertyName
              ? `${label("deposits.createDialog.description")} (${propertyName})`
              : label("deposits.createDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {serverError && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <p className="font-medium">{serverError}</p>
            </div>
          )}

          {propertyName && (
            <div className="space-y-2">
              <Label>{label("deposits.fields.property")}</Label>
              <Input value={propertyName} disabled readOnly />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property_id">{label("deposits.fields.property")}</Label>
              <Controller
                control={control}
                name="property_id"
                render={({ field }) => (
                  <AsyncSelect<PropertyDto>
                    id="property_id"
                    value={propertyValue}
                    disabled={Boolean(propertyId)}
                    onChange={(option) => {
                      setSelectedProperty(option)
                      field.onChange(option ? option.id : 0)
                    }}
                    fetcher={async ({ search, page }) => {
                      const result = await propertyService.getMyProperties({
                        search: search || undefined,
                        page,
                        perPage: 20,
                      })
                      return {
                        items: result.data,
                        hasMore:
                          result.pagination.current_page < result.pagination.last_page,
                        total: result.pagination.total,
                      }
                    }}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.id}
                    placeholder={label("deposits.fields.property")}
                    searchPlaceholder={label("deposits.fields.propertySearchPlaceholder")}
                    emptyMessage={label("deposits.errors.noPropertiesFound")}
                    errorMessage={label("deposits.errors.propertyLoadFailed")}
                  />
                )}
              />
              {errors.property_id && (
                <p className="text-xs text-destructive">
                  {label("deposits.errors.propertyRequired")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller_id">{label("deposits.fields.seller")} ID</Label>
              <Input
                id="seller_id"
                type="number"
                min={1}
                disabled={Boolean(sellerId)}
                {...register("seller_id", { valueAsNumber: true })}
              />
              {errors.seller_id && (
                <p className="text-xs text-destructive">
                  {label("deposits.errors.sellerRequired")}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{label("deposits.fields.amount")}</Label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min={0.01}
                  className="pl-9"
                  {...register("amount")}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{label("deposits.fields.currency")}</Label>
              <Select
                value={selectedCurrency}
                onValueChange={(value) =>
                  setValue("currency", value as DepositCurrency, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPOSIT_CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      <span className="flex items-center gap-2">
                        {currency === DepositCurrency.SAR ? (
                          <Wallet className="size-3.5" />
                        ) : (
                          <DollarSign className="size-3.5" />
                        )}
                        {currency}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">{label("deposits.fields.terms")}</Label>
            <Textarea id="terms" rows={3} {...register("terms")} />
            {errors.terms && (
              <p className="text-xs text-destructive">{errors.terms.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{label("deposits.fields.notes")}</Label>
            <Textarea id="notes" rows={2} {...register("notes")} />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
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
              <Send className="size-4 mr-1" />
              {label("deposits.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface CreateDepositButtonProps {
  propertyId?: number
  propertyName?: string
  sellerId?: number
  defaultCurrency?: string
  onCreated?: (deposit: DepositDto) => void
}

export function CreateDepositButton({
  propertyId,
  propertyName,
  sellerId,
  defaultCurrency,
  onCreated,
}: CreateDepositButtonProps) {
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Send className="size-4 mr-1" />
        {getDepositLabel(locale, "deposits.create")}
      </Button>
      <CreateDepositDialog
        open={open}
        onOpenChange={setOpen}
        propertyId={propertyId}
        propertyName={propertyName}
        sellerId={sellerId}
        defaultCurrency={defaultCurrency}
        onCreated={onCreated}
      />
    </>
  )
}
