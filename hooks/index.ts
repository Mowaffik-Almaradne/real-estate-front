"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  triggerOnce?: boolean
  threshold?: number
  rootMargin?: string
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    triggerOnce = true,
    threshold = 0,
    rootMargin = "0px",
    ...observerOptions
  } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const elementRef = useRef<HTMLElement | null>(null)

  const setRef = useCallback((node: HTMLElement | null) => {
    elementRef.current = node
  }, [])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    if (hasIntersected && triggerOnce) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting) {
          setHasIntersected(true)
        }
      },
      {
        threshold,
        rootMargin,
        ...observerOptions,
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, rootMargin, hasIntersected, triggerOnce, observerOptions])

  return { ref: setRef, isIntersecting, hasIntersected }
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mediaQuery.addEventListener("change", handler)

    return () => mediaQuery.removeEventListener("change", handler)
  }, [query])

  return matches
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value)
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(value))
        }
      } catch (error) {
        console.error("Error saving to localStorage:", error)
      }
    },
    [key]
  )

  return [storedValue, setValue]
}

export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return size
}

export function useReducedMotion(): boolean {
  const mediaQuery = "(prefers-reduced-motion: reduce)"
  return useMediaQuery(mediaQuery)
}