"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Switch } from "components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog"
import { saveCity } from "lib/api"
import type { City } from "@/types/dto"
import type { Country } from "lib/api"

interface CityFormDialogProps {
  countries: Country[]
  editing: City | null
  defaultCountryId: number | null
  disabled?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (city: City, isEdit: boolean) => void
}

function CityFormBody({
  countries,
  editing,
  defaultCountryId,
  onSubmit,
  onCancel,
}: {
  countries: Country[]
  editing: City | null
  defaultCountryId: number | null
  onSubmit: (data: {
    name: string
    countryId: number
    stateProvince: string | null
    postalCode: string | null
    isActive: boolean
  }) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(editing?.name ?? "")
  const [countryId, setCountryId] = useState(
    editing?.country_id?.toString() ?? defaultCountryId?.toString() ?? ""
  )
  const [stateProvince, setStateProvince] = useState(
    editing?.state_province ?? ""
  )
  const [postalCode, setPostalCode] = useState(editing?.postal_code ?? "")
  const [isActive, setIsActive] = useState(editing?.is_active ?? true)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !countryId) return
    try {
      setSaving(true)
      await onSubmit({
        name,
        countryId: parseInt(countryId),
        stateProvince: stateProvince || null,
        postalCode: postalCode || null,
        isActive,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="space-y-4 py-4">
        <div>
          <label className="text-sm font-medium">Name *</label>
          <Input
            placeholder="City name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Country *</label>
          <Select value={countryId} onValueChange={setCountryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem
                  key={country.id}
                  value={country.id.toString()}
                >
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">State/Province</label>
          <Input
            placeholder="State or province"
            value={stateProvince}
            onChange={(e) => setStateProvince(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Postal Code</label>
          <Input
            placeholder="Postal code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <label className="text-sm font-medium">Active</label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !name.trim() || !countryId}
        >
          {editing ? "Save Changes" : "Add City"}
        </Button>
      </DialogFooter>
    </>
  )
}

export function CityFormDialog({
  countries,
  editing,
  defaultCountryId,
  disabled,
  open,
  onOpenChange,
  onSaved,
}: CityFormDialogProps) {
  const handleSubmit = async (data: {
    name: string
    countryId: number
    stateProvince: string | null
    postalCode: string | null
    isActive: boolean
  }) => {
    try {
      const response = await saveCity(
        data.name,
        data.countryId,
        data.stateProvince,
        data.postalCode,
        data.isActive,
        editing?.id
      )
      if (response.success) {
        onSaved(response.data, !!editing)
        onOpenChange(false)
      }
    } catch (err) {
      console.error("Failed to save city:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled} className="w-full sm:w-auto">
          <Plus className="mr-1 size-4" />
          {editing ? "Edit City" : "Add City"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit City" : "Add City"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the city details below."
              : "Enter the city details below."}
          </DialogDescription>
        </DialogHeader>
        <CityFormBody
          key={editing?.id ?? defaultCountryId ?? "new"}
          countries={countries}
          editing={editing}
          defaultCountryId={defaultCountryId}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}