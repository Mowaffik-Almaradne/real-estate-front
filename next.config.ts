import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import { withSentryConfig } from "@sentry/nextjs"
import withBundleAnalyzer from "@next/bundle-analyzer"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  productionBrowserSourceMaps: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
}

const sentryOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  hideSourceMaps: true,
  disableLogger: true,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  automaticVercelMonitors: true,
}

const withPlugins = process.env.SENTRY_DSN
  ? withSentryConfig(withNextIntl(nextConfig), sentryOptions)
  : withNextIntl(nextConfig)

export default bundleAnalyzer(withPlugins)
