import { redirect } from "next/navigation"

export default function SettingsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  return params.then(({ locale }) => {
    redirect(`/${locale}/settings/profile`)
  })
}
