import type { MetadataRoute } from "next"
import { buildAbsoluteUrl } from "src/lib/seo"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = buildAbsoluteUrl("")
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/settings"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
