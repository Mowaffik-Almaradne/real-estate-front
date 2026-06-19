"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Building2, Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, X } from "lucide-react"
import { useAuth } from "src/context/AuthContext"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      router.push(callbackUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 size-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 stagger-children-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl gradient-primary shadow-lg shadow-primary/25 text-primary-foreground mb-4">
            <Building2 className="size-9" strokeWidth={2.25} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Sign in to your RealEstate account
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm font-medium flex-1 leading-snug">{error}</p>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="shrink-0 opacity-70 hover:opacity-100 transition-opacity -mt-0.5 -mr-0.5 p-0.5 rounded-lg"
                  aria-label="Dismiss error"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn-like btn-like-ghost absolute right-1 top-1/2 -translate-y-1/2 size-9 p-0"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded-md border-input accent-primary" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="btn-like text-primary hover:text-primary/80"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full h-11 rounded-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Don&apos;t have an account?{" "}
            </span>
            <Link
              href="/register"
              className="btn-like text-primary hover:text-primary/80"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}