"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiClientError } from "@/lib/apiClient"
import { leadNoteService } from "../services/crmService"
import type { LeadNote } from "../types"

export interface UseLeadNotesResult {
  notes: LeadNote[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (body: string) => Promise<LeadNote | null>
  update: (noteId: number, body: string) => Promise<LeadNote | null>
  remove: (noteId: number) => Promise<boolean>
}

export function useLeadNotes(leadId: number | null): UseLeadNotesResult {
  const [notes, setNotes] = useState<LeadNote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (leadId == null) {
      setNotes([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const list = await leadNoteService.list(leadId)
      setNotes(list)
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Failed to load notes"
      setError(message)
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [leadId])

  useEffect(() => {
    Promise.resolve().then(() => void refresh())
  }, [refresh])

  const create = useCallback(
    async (body: string): Promise<LeadNote | null> => {
      if (leadId == null) return null
      try {
        const note = await leadNoteService.create(leadId, { body })
        setNotes((current) => [note, ...current])
        return note
      } catch (err) {
        const message = err instanceof ApiClientError ? err.message : "Failed to add note"
        setError(message)
        return null
      }
    },
    [leadId]
  )

  const update = useCallback(
    async (noteId: number, body: string): Promise<LeadNote | null> => {
      try {
        const note = await leadNoteService.update(noteId, { body })
        setNotes((current) => current.map((n) => (n.id === noteId ? note : n)))
        return note
      } catch (err) {
        const message = err instanceof ApiClientError ? err.message : "Failed to update note"
        setError(message)
        return null
      }
    },
    []
  )

  const remove = useCallback(async (noteId: number): Promise<boolean> => {
    try {
      await leadNoteService.remove(noteId)
      setNotes((current) => current.filter((n) => n.id !== noteId))
      return true
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Failed to delete note"
      setError(message)
      return false
    }
  }, [])

  return { notes, loading, error, refresh, create, update, remove }
}
