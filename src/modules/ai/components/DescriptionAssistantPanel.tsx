"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale } from "next-intl"
import {
  AlertCircle,
  Clipboard,
  ClipboardCheck,
  Loader2,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { ApiClientError } from "@/lib/apiClient"

import {
  aiGenerateSchema,
  aiImproveSchema,
  aiSuggestFeaturesSchema,
  aiSuggestTitleSchema,
  type AiGenerateValues,
  type AiImproveValues,
  type AiSuggestFeaturesValues,
  type AiSuggestTitleValues,
} from "../schemas"
import { aiService, isAiRateLimited } from "../services/aiService"
import { getAiLabel } from "../labels"
import {
  AI_DESCRIPTION_LANGUAGES,
  isAiDescriptionLanguage,
  type AiDescriptionLanguage,
} from "../types/enums"
import type {
  AiDescriptionGenerateResponse,
  AiDescriptionImproveResponse,
  AiDescriptionSuggestFeaturesResponse,
  AiDescriptionSuggestTitleResponse,
} from "../types/dto"

type AssistantTab = "generate" | "improve" | "suggestTitle" | "suggestFeatures"

interface AssistantState {
  tab: AssistantTab
}

const TAB_OPTIONS: Array<{ value: AssistantTab; key: string }> = [
  { value: "generate", key: "ai.assistant.tab.generate" },
  { value: "improve", key: "ai.assistant.tab.improve" },
  { value: "suggestTitle", key: "ai.assistant.tab.suggestTitle" },
  { value: "suggestFeatures", key: "ai.assistant.tab.suggestFeatures" },
]

export function DescriptionAssistantPanel() {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getAiLabel(locale, key, vars)
  const [state, setState] = useState<AssistantState>({ tab: "generate" })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label("ai.assistant.heading")}</CardTitle>
        <CardDescription>{label("ai.assistant.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-1 rounded-md border p-0.5 w-fit">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={
                "px-3 py-1.5 text-sm rounded-sm transition-colors " +
                (state.tab === tab.value
                  ? "bg-secondary text-secondary-foreground"
                  : "hover:bg-accent")
              }
              onClick={() => setState({ tab: tab.value })}
            >
              {label(tab.key)}
            </button>
          ))}
        </div>

        {state.tab === "generate" && <GenerateForm />}
        {state.tab === "improve" && <ImproveForm />}
        {state.tab === "suggestTitle" && <SuggestTitleForm />}
        {state.tab === "suggestFeatures" && <SuggestFeaturesForm />}
      </CardContent>
    </Card>
  )
}

function LanguageSelect({
  name,
  defaultValue,
}: {
  name: string
  defaultValue?: string
}) {
  const locale = useLocale()
  const label = (key: string) => getAiLabel(locale, key)
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label("ai.assistant.language")}</Label>
      <Select defaultValue={defaultValue ?? "en"} name={name}>
        <SelectTrigger id={name}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AI_DESCRIPTION_LANGUAGES.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {label(`ai.assistant.language.${lang}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function pickLanguage(values: {
  language?: string | null
}): AiDescriptionLanguage | undefined {
  if (values.language && isAiDescriptionLanguage(values.language)) return values.language
  return undefined
}

interface GenerateFormState {
  response: AiDescriptionGenerateResponse | null
  loading: boolean
}

function GenerateForm() {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getAiLabel(locale, key, vars)
  const [serverError, setServerError] = useState<string | null>(null)
  const [state, setState] = useState<GenerateFormState>({
    response: null,
    loading: false,
  })
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AiGenerateValues>({
    resolver: zodResolver(aiGenerateSchema),
    defaultValues: { language: "en" },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    setState((prev) => ({ ...prev, loading: true }))
    try {
      const response = await aiService.generateDescription({
        language: pickLanguage(values),
      })
      setState({ response, loading: false })
    } catch (error) {
      if (isAiRateLimited(error)) {
        setServerError(label("ai.assistant.rateLimited"))
      } else if (error instanceof ApiClientError) {
        setServerError(error.message || label("ai.toast.generateFailed"))
      } else {
        setServerError(label("ai.toast.generateFailed"))
      }
      setState({ response: null, loading: false })
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {serverError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <p className="font-medium">{serverError}</p>
        </div>
      )}

      <LanguageSelect name="generate-language" />

      {errors.language && (
        <p className="text-xs text-destructive">{errors.language.message}</p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || state.loading}>
          {(isSubmitting || state.loading) && (
            <Loader2 className="size-4 mr-2 animate-spin" />
          )}
          <Sparkles className="size-4 mr-1" />
          {label("ai.assistant.submit.generate")}
        </Button>
      </div>

      <AssistantOutput
        empty={label("ai.assistant.response.empty")}
        loading={state.loading}
        languageLabel={state.response?.language}
      >
        {state.response && (
          <div className="space-y-3">
            <CopyBlock text={state.response.description} />
            {state.response.alternatives && state.response.alternatives.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Alternatives</p>
                {state.response.alternatives.map((alt, idx) => (
                  <CopyBlock key={`alt-${idx}`} text={alt} compact />
                ))}
              </div>
            )}
          </div>
        )}
      </AssistantOutput>
    </form>
  )
}

interface ImproveFormState {
  response: AiDescriptionImproveResponse | null
  loading: boolean
}

function ImproveForm() {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getAiLabel(locale, key, vars)
  const [serverError, setServerError] = useState<string | null>(null)
  const [state, setState] = useState<ImproveFormState>({ response: null, loading: false })
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AiImproveValues>({
    resolver: zodResolver(aiImproveSchema),
    defaultValues: { description: "", language: "en" },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    setState((prev) => ({ ...prev, loading: true }))
    try {
      const response = await aiService.improveDescription({
        description: values.description,
        language: pickLanguage(values),
      })
      setState({ response, loading: false })
    } catch (error) {
      if (isAiRateLimited(error)) {
        setServerError(label("ai.assistant.rateLimited"))
      } else if (error instanceof ApiClientError) {
        setServerError(error.message || label("ai.toast.improveFailed"))
      } else {
        setServerError(label("ai.toast.improveFailed"))
      }
      setState({ response: null, loading: false })
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {serverError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <p className="font-medium">{serverError}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="improve-description">
          {label("ai.assistant.currentDescription")}
        </Label>
        <Textarea
          id="improve-description"
          rows={6}
          placeholder={label("ai.assistant.currentDescriptionPlaceholder")}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <LanguageSelect name="improve-language" />

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || state.loading}>
          {(isSubmitting || state.loading) && (
            <Loader2 className="size-4 mr-2 animate-spin" />
          )}
          <Sparkles className="size-4 mr-1" />
          {label("ai.assistant.submit.improve")}
        </Button>
      </div>

      <AssistantOutput
        empty={label("ai.assistant.response.empty")}
        loading={state.loading}
        languageLabel={state.response?.language}
      >
        {state.response && (
          <div className="space-y-3">
            <CopyBlock text={state.response.improved_description} />
            {state.response.notes && state.response.notes.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Notes</p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {state.response.notes.map((note, idx) => (
                    <li key={`note-${idx}`}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </AssistantOutput>
    </form>
  )
}

interface SuggestTitleFormState {
  response: AiDescriptionSuggestTitleResponse | null
  loading: boolean
}

function SuggestTitleForm() {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getAiLabel(locale, key, vars)
  const [serverError, setServerError] = useState<string | null>(null)
  const [state, setState] = useState<SuggestTitleFormState>({ response: null, loading: false })
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AiSuggestTitleValues>({
    resolver: zodResolver(aiSuggestTitleSchema),
    defaultValues: { language: "en" },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    setState((prev) => ({ ...prev, loading: true }))
    try {
      const response = await aiService.suggestTitles({
        language: pickLanguage(values),
      })
      setState({ response, loading: false })
    } catch (error) {
      if (isAiRateLimited(error)) {
        setServerError(label("ai.assistant.rateLimited"))
      } else if (error instanceof ApiClientError) {
        setServerError(error.message || label("ai.toast.suggestTitleFailed"))
      } else {
        setServerError(label("ai.toast.suggestTitleFailed"))
      }
      setState({ response: null, loading: false })
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {serverError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <p className="font-medium">{serverError}</p>
        </div>
      )}

      <LanguageSelect name="suggest-title-language" />

      {errors.language && (
        <p className="text-xs text-destructive">{errors.language.message}</p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || state.loading}>
          {(isSubmitting || state.loading) && (
            <Loader2 className="size-4 mr-2 animate-spin" />
          )}
          <Sparkles className="size-4 mr-1" />
          {label("ai.assistant.submit.suggestTitle")}
        </Button>
      </div>

      <AssistantOutput
        empty={label("ai.assistant.response.empty")}
        loading={state.loading}
        languageLabel={state.response?.language}
        title={label("ai.assistant.titles.title")}
      >
        {state.response && state.response.titles.length > 0 ? (
          <ul className="space-y-2">
            {state.response.titles.map((title, idx) => (
              <li key={`title-${idx}`}>
                <CopyBlock text={title} compact />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {label("ai.search.noResults")}
          </p>
        )}
      </AssistantOutput>
    </form>
  )
}

interface SuggestFeaturesFormState {
  response: AiDescriptionSuggestFeaturesResponse | null
  loading: boolean
}

function SuggestFeaturesForm() {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getAiLabel(locale, key, vars)
  const [serverError, setServerError] = useState<string | null>(null)
  const [state, setState] = useState<SuggestFeaturesFormState>({ response: null, loading: false })
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AiSuggestFeaturesValues>({
    resolver: zodResolver(aiSuggestFeaturesSchema),
    defaultValues: { property_type: "", language: "en" },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    setState((prev) => ({ ...prev, loading: true }))
    try {
      const response = await aiService.suggestFeatures({
        property_type: values.property_type,
        language: pickLanguage(values),
      })
      setState({ response, loading: false })
    } catch (error) {
      if (isAiRateLimited(error)) {
        setServerError(label("ai.assistant.rateLimited"))
      } else if (error instanceof ApiClientError) {
        setServerError(error.message || label("ai.toast.suggestFeaturesFailed"))
      } else {
        setServerError(label("ai.toast.suggestFeaturesFailed"))
      }
      setState({ response: null, loading: false })
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {serverError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <p className="font-medium">{serverError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="suggest-features-property-type">
            {label("ai.assistant.propertyType")}
          </Label>
          <Input
            id="suggest-features-property-type"
            placeholder={label("ai.assistant.propertyTypePlaceholder")}
            {...register("property_type")}
          />
          {errors.property_type && (
            <p className="text-xs text-destructive">{errors.property_type.message}</p>
          )}
        </div>
        <LanguageSelect name="suggest-features-language" />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || state.loading}>
          {(isSubmitting || state.loading) && (
            <Loader2 className="size-4 mr-2 animate-spin" />
          )}
          <Sparkles className="size-4 mr-1" />
          {label("ai.assistant.submit.suggestFeatures")}
        </Button>
      </div>

      <AssistantOutput
        empty={label("ai.assistant.response.empty")}
        loading={state.loading}
        languageLabel={state.response?.language}
        title={label("ai.assistant.features.title")}
      >
        {state.response && state.response.features.length > 0 ? (
          <ul className="list-disc pl-5 text-sm space-y-1">
            {state.response.features.map((feature, idx) => (
              <li key={`feature-${idx}`}>{feature}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {label("ai.search.noResults")}
          </p>
        )}
      </AssistantOutput>
    </form>
  )
}

interface AssistantOutputProps {
  loading: boolean
  empty: string
  title?: string
  languageLabel?: string | null
  children: React.ReactNode
}

function AssistantOutput({
  loading,
  empty,
  title,
  languageLabel,
  children,
}: AssistantOutputProps) {
  const locale = useLocale()
  const label = (key: string) => getAiLabel(locale, key)

  return (
    <div className="rounded-md border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{title ?? label("ai.assistant.response.title")}</p>
        {languageLabel && (
          <span className="text-xs uppercase text-muted-foreground">{languageLabel}</span>
        )}
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {label("ai.search.loading")}
        </div>
      ) : (
        children ?? <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  )
}

interface CopyBlockProps {
  text: string
  compact?: boolean
}

function CopyBlock({ text, compact = false }: CopyBlockProps) {
  const locale = useLocale()
  const label = (key: string) => getAiLabel(locale, key)
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(label("ai.assistant.copied"))
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={
        "flex items-start justify-between gap-3 rounded-md border bg-background p-3 " +
        (compact ? "" : "whitespace-pre-wrap")
      }
    >
      <p className={"text-sm flex-1 " + (compact ? "" : "whitespace-pre-wrap")}>{text}</p>
      <Button type="button" size="sm" variant="outline" onClick={onCopy}>
        {copied ? (
          <ClipboardCheck className="size-3.5" />
        ) : (
          <Clipboard className="size-3.5" />
        )}
        <span className="ml-1">{label("ai.assistant.copy")}</span>
      </Button>
    </div>
  )
}
