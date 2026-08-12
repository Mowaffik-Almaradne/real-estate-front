import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: {
    name: "i18n",
    include: ["i18n/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
