"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Switch } from "components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog"
import { saveCountry, type Country } from "lib/api"

interface CountryFormDialogProps {
  editing: Country | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (country: Country, isEdit: boolean) => void
}

function CountryFormBody({
  editing,
  onSubmit,
  onCancel,
}: {
  editing: Country | null
  onSubmit: (data: {
    name: string
    code: string | null
    phoneCode: string | null
    isActive: boolean
  }) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(editing?.name ?? "")
  const [code, setCode] = useState(editing?.code ?? "")
  const [phoneCode, setPhoneCode] = useState(editing?.phone_code ?? "")
  const [isActive, setIsActive] = useState(editing?.is_active ?? true)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    try {
      setSaving(true)
      await onSubmit({
        name,
        code: code || null,
        phoneCode: phoneCode || null,
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
            placeholder="Country name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Code</label>
          <Input
            placeholder="e.g. US"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={3}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Phone Code</label>
          <Input
            placeholder="e.g. +1"
            value={phoneCode}
            onChange={(e) => setPhoneCode(e.target.value)}
            maxLength={4}
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
        <Button onClick={handleSave} disabled={saving || !name.trim()}>
          {editing ? "Save Changes" : "Add Country"}
        </Button>
      </DialogFooter>
    </>
  )
}

export function CountryFormDialog({
  editing,
  isOpen,
  onOpenChange,
  onSaved,
}: CountryFormDialogProps) {
  const handleSubmit = async (data: {
    name: string
    code: string | null
    phoneCode: string | null
    isActive: boolean
  }) => {
    try {
      const response = await saveCountry(
        data.name,
        data.code,
        data.phoneCode,
        data.isActive,
        editing?.id
      )
      if (response.success) {
        onSaved(response.data, !!editing)
        onOpenChange(false)
      }
    } catch (err) {
      console.error("Failed to save country:", err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full sm:w-auto">
          <Plus className="mr-1 size-4" />
          {editing ? "Edit Country" : "Add Country"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Country" : "Add Country"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the country details below."
              : "Enter the country details below."}
          </DialogDescription>
        </DialogHeader>
        <CountryFormBody
          key={editing?.id ?? "new"}
          editing={editing}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}