"use client"

import { Globe, Mail, Phone } from "lucide-react"
import { useTranslations } from "next-intl"

import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import type { PublisherProfileDto } from "@/types/publisher"

export interface PublisherAboutProps {
  publisher: PublisherProfileDto
  className?: string
}

export function PublisherAbout({ publisher, className }: PublisherAboutProps) {
  const t = useTranslations("publisher")
  const hasAny =
    publisher.description ||
    publisher.website_url ||
    publisher.phone ||
    publisher.email ||
    (publisher.social_links && Object.keys(publisher.social_links).length > 0)

  if (!hasAny) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">{t("about.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("about.empty")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">{t("about.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {publisher.description && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {publisher.description}
          </p>
        )}

        <dl className="space-y-2 text-sm">
          {publisher.website_url && (
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-muted-foreground" aria-hidden />
              <dt className="sr-only">{t("about.website")}</dt>
              <dd>
                <a
                  href={publisher.website_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-primary hover:underline"
                >
                  {publisher.website_url}
                </a>
              </dd>
            </div>
          )}
          {publisher.email && (
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" aria-hidden />
              <dt className="sr-only">{t("about.email")}</dt>
              <dd>
                <a href={`mailto:${publisher.email}`} className="hover:underline">
                  {publisher.email}
                </a>
              </dd>
            </div>
          )}
          {publisher.phone && (
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" aria-hidden />
              <dt className="sr-only">{t("about.phone")}</dt>
              <dd>
                <a href={`tel:${publisher.phone}`} className="hover:underline">
                  {publisher.phone}
                </a>
              </dd>
            </div>
          )}
        </dl>

        {publisher.social_links && Object.keys(publisher.social_links).length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("about.social")}
            </p>
            <ul className="flex flex-wrap gap-2">
              {Object.entries(publisher.social_links)
                .filter(([, url]) => url && url.length > 0)
                .map(([platform, url]) => (
                  <li key={platform}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1 text-xs hover:bg-accent"
                    >
                      <span className="font-medium capitalize">{platform}</span>
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}