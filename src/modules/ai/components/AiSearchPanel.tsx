"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale } from "next-intl"
import { AlertCircle, Loader2, Search as SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

import { ApiClientError } from "@/lib/apiClient"

import { aiSearchSchema, type AiSearchValues } from "../schemas"
import { aiService, isAiRateLimited } from "../services/aiService"
import { getAiLabel } from "../labels"
import type { AiSearchResponse } from "../types/dto"
import { AiSearchResults } from "./AiSearchResults"

interface AiSearchPanelProps {
  onSearch?: (response: AiSearchResponse) => void
}

export function AiSearchPanel({ onSearch }: AiSearchPanelProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getAiLabel(locale, key, vars)
  const [serverError, setServerError] = useState<string | null>(null)
  const [response, setResponse] = useState<AiSearchResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AiSearchValues>({
    resolver: zodResolver(aiSearchSchema),
    defaultValues: { query: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    setLoading(true)
    try {
      const result = await aiService.search({ query: values.query })
      setResponse(result)
      onSearch?.(result)
    } catch (error) {
      if (isAiRateLimited(error)) {
        setServerError(label("ai.assistant.rateLimited"))
      } else if (error instanceof ApiClientError) {
        setServerError(error.message || label("ai.toast.searchFailed"))
      } else {
        setServerError(label("ai.toast.searchFailed"))
      }
      setResponse(null)
    } finally {
      setLoading(false)
    }
  })

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">{label("ai.search.heading")}</h2>
          <p className="text-sm text-muted-foreground">
            {label("ai.search.description")}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {serverError && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <p className="font-medium">{serverError}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="ai-search-query">{label("ai.search.field.query")}</Label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="ai-search-query"
                className="pl-9"
                placeholder={label("ai.search.field.queryPlaceholder")}
                {...register("query")}
              />
            </div>
            {errors.query && (
              <p className="text-xs text-destructive">{errors.query.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset({ query: "" })
                setServerError(null)
                setResponse(null)
              }}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting || loading}>
              {(isSubmitting || loading) && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              <SearchIcon className="size-4 mr-1" />
              {label("ai.search.submit")}
            </Button>
          </div>
        </form>

        <AiSearchResults response={response} loading={loading} />
      </CardContent>
    </Card>
  )
}
