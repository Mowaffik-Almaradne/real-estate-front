import type { AdMediaItem } from "../types"
import type { AdMediaValue } from "../components/AdMediaUpload"

export function buildAdMediaPayload(
  media: AdMediaValue | null
): number[] | string[] | undefined {
  if (!media) return undefined
  const rawId = media.id
  if (typeof rawId === "string" && /^\d+$/.test(rawId)) {
    return [Number(rawId)]
  }
  if (typeof rawId === "number") {
    return [rawId]
  }
  return [rawId]
}

export function mediaValueFromAd(
  ad?: { media?: AdMediaItem[] } | null
): AdMediaValue | null {
  const first = ad?.media?.[0]
  if (!first) return null
  return {
    id: first.id,
    url: first.url,
    thumb_url: first.thumb_url ?? null,
    name: first.name,
    mime_type: first.mime_type ?? null,
    size: first.size,
  }
}
