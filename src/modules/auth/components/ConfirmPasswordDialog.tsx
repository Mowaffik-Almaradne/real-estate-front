"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { authService } from "@/services/auth-service"
import { ApiClientError } from "@/lib/apiClient"

interface ConfirmPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  onConfirmed: () => void | Promise<void>
}

export function ConfirmPasswordDialog({
  open,
  onOpenChange,
  title = "Confirm your password",
  description = "For your security, please re-enter your password to continue.",
  onConfirmed,
}: ConfirmPasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (!open) {
      setPassword("")
      setError(null)
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 50)
      return () => window.clearTimeout(id)
    }
  }, [open])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!password) {
      setError("Password is required")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await authService.confirmPassword(password)
      await onConfirmed()
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Password confirmation failed"
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Password</Label>
            <Input
              ref={inputRef}
              id="confirm-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !password}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
