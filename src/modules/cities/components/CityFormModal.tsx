"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { cityService } from "../services/cityService"
import type { City } from "@/types/dto"
import { getCountries, type Country } from "@/lib/api"

const citySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  country_id: z.number().min(1, "Country is required"),
  state_province: z.string().max(120).nullable(),
  postal_code: z.string().max(20).nullable(),
  is_active: z.boolean(),
})

type CityFormValues = z.infer<typeof citySchema>

interface CityFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  city?: City | null
  onSuccess: () => void
}

export function CityFormModal({
  open,
  onOpenChange,
  city,
  onSuccess,
}: CityFormModalProps) {
  const isEdit = !!city
  const [switchChecked, setSwitchChecked] = useState(true)
  const [countries, setCountries] = useState<Country[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CityFormValues>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name: "",
      country_id: 0,
      state_province: null,
      postal_code: null,
      is_active: true,
    },
  })

  const selectedCountryId = watch("country_id")

  useEffect(() => {
    let active = true
    void getCountries(1, 100)
      .then((res) => {
        if (active) setCountries(res.data ?? [])
      })
      .catch(() => {
        if (active) setCountries([])
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (city) {
      setValue("name", city.name)
      setValue("country_id", city.country_id ?? 0)
      setValue("state_province", null)
      setValue("postal_code", null)
      setValue("is_active", city.is_active)
      setSwitchChecked(city.is_active)
    } else {
      reset({ name: "", country_id: 0, state_province: null, postal_code: null, is_active: true })
      setSwitchChecked(true)
    }
  }, [city, setValue, reset])

  const onSubmit = async (data: CityFormValues) => {
    try {
      if (isEdit && city) {
        await cityService.updateCity(city.id, data)
        toast.success("City updated successfully")
      } else {
        await cityService.createCity(data)
        toast.success("City created successfully")
      }
      onSuccess()
    } catch {
      toast.error(`Failed to ${isEdit ? "update" : "create"} city`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit City" : "Add New City"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the city details below."
              : "Fill in the details to create a new city."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">City Name</label>
            <Input
              placeholder="Enter city name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Select
              value={selectedCountryId ? String(selectedCountryId) : ""}
              onValueChange={(value) => setValue("country_id", Number(value), { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={String(country.id)}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country_id && (
              <p className="text-sm font-medium text-destructive">
                {errors.country_id.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">State / Province</label>
              <Input
                placeholder="Optional"
                {...register("state_province")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Postal Code</label>
              <Input
                placeholder="Optional"
                {...register("postal_code")}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Active</label>
            <Switch
              checked={switchChecked}
              onCheckedChange={(checked) => {
                setSwitchChecked(checked)
                setValue("is_active", checked)
              }}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}