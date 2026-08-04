"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { authService } from "@/services/auth-service"

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetPasswordForm /></Suspense>
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get("email") || "")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (password !== confirmation) {
      setError("Passwords do not match")
      return
    }
    const token = searchParams.get("token") || ""
    if (!token) {
      setError("This reset link is missing or invalid")
      return
    }

    setError("")
    setIsLoading(true)
    try {
      await authService.resetPassword(email, token, password, confirmation)
      router.push("/login?reset=success")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not reset password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="size-4" /> Back to login</Link>
        <div className="glass-card rounded-2xl p-8 shadow-xl shadow-black/5">
          <h1 className="text-2xl font-bold tracking-tight">Choose a new password</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">Use a strong password you do not reuse elsewhere.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" minLength={8} required />
            <Input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Confirm new password" minLength={8} required />
            <Button type="submit" className="w-full h-11 rounded-lg" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}Reset password</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
