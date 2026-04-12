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

import { cityService } from "../services/cityService"
import type { City } from "../types"

const citySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CityFormValues>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name: "",
      is_active: true,
    },
  })

  useEffect(() => {
    if (city) {
      setValue("name", city.name)
      setValue("is_active", city.is_active)
      setSwitchChecked(city.is_active)
    } else {
      reset({ name: "", is_active: true })
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
    } catch (error) {
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