"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "components/ui/button"
import { authService } from "@/services/auth-service"

export default function VerifyEmailPage() {
  return <Suspense fallback={null}><VerifyEmailContent /></Suspense>
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const [state, setState] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const id = searchParams.get("id")
    const hash = searchParams.get("hash")
    const queryParams = new URLSearchParams(searchParams.toString())
    queryParams.delete("id")
    queryParams.delete("hash")
    const query = queryParams.toString()
    if (!id || !hash) {
      setState("error")
      setMessage("This verification link is invalid.")
      return
    }

    authService.verifyEmail(id, hash, query).then(() => {
      setState("success")
    }).catch((error: unknown) => {
      setState("error")
      setMessage(error instanceof Error ? error.message : "Email verification failed")
    })
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 text-center shadow-xl shadow-black/5">
        {state === "loading" && <Loader2 className="size-10 animate-spin text-primary mx-auto" />}
        {state === "success" && <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />}
        <h1 className="text-2xl font-bold tracking-tight mt-4">{state === "success" ? "Email verified" : state === "error" ? "Verification failed" : "Verifying email"}</h1>
        <p className="text-sm text-muted-foreground mt-2">{state === "success" ? "Your account is now verified." : state === "error" ? message : "Please wait while we verify your link."}</p>
        {state !== "loading" && <Link href="/login"><Button className="mt-6">Continue to login</Button></Link>}
      </div>
    </div>
  )
}
