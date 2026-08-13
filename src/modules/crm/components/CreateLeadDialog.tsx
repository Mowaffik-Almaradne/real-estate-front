"use client"

import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTranslations } from "next-intl"

import { LeadForm } from "./LeadForm"
import type { Lead } from "../types"

interface CreateLeadDialogProps {
  onCreated?: (lead: Lead) => void
  triggerLabel?: string
}

export function CreateLeadDialog({ onCreated, triggerLabel }: CreateLeadDialogProps) {
  const t = useTranslations()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button data-testid="crm-open-create">
          <Plus className="size-4" />
          {triggerLabel ?? (t("crm.actions.newLead") || "New lead")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("crm.create.title") || "Create new lead"}</DialogTitle>
          <DialogDescription>
            {t("crm.create.description") ||
              "Leads are contact records you can follow up on. Status moves through new → contacted → qualified → won or lost."}
          </DialogDescription>
        </DialogHeader>
        <LeadForm
          onSuccess={(lead) => {
            onCreated?.(lead)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
