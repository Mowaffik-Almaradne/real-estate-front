"use client"

import { useCallback, useMemo, useState } from "react"

interface UseVirtualizedOptions {
  itemCount: number
  itemHeight: number
  overscan?: number
  containerHeight?: number
}

export function useVirtualized({
  itemCount,
  itemHeight,
  overscan = 3,
  containerHeight = 400,
}: UseVirtualizedOptions) {
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = itemCount * itemHeight

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const end = Math.min(
      itemCount,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    return { start, end }
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan])

  const virtualItems = useMemo(() => {
    const items = []
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      items.push({
        index: i,
        offsetTop: i * itemHeight,
      })
    }
    return items
  }, [visibleRange, itemHeight])

  const scrollToIndex = useCallback(
    (index: number) => {
      const offset = index * itemHeight
      setScrollTop(offset)
    },
    [itemHeight]
  )

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    },
    []
  )

  return {
    virtualItems,
    totalHeight,
    scrollToIndex,
    handleScroll,
    startIndex: visibleRange.start,
    endIndex: visibleRange.end,
  }
}