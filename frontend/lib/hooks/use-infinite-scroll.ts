import { useRef, useCallback, useEffect } from 'react'

interface InfiniteScrollOptions {
  loading: boolean
  hasMore: boolean
  offset: number
  fetchMore: (options: {
    variables: { offset: number; limit: number }
    updateQuery: (prev: any, result: { fetchMoreResult: any }) => any
  }) => Promise<any>
  itemsLength: number
}

export function useInfiniteScroll({ loading, hasMore, offset, fetchMore, itemsLength }: InfiniteScrollOptions) {
  const observer = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && !loading && hasMore && itemsLength > 0) {
        const newOffset = offset + itemsLength
        fetchMore({
          variables: {
            offset: newOffset,
            limit: itemsLength,
          },
          updateQuery: (prev: any, { fetchMoreResult }: { fetchMoreResult: any }) => {
            if (!fetchMoreResult) return prev
            if (fetchMoreResult.feedbacks.length < itemsLength) {
              return {
                ...prev,
                feedbacks: [...prev.feedbacks, ...fetchMoreResult.feedbacks],
                hasMore: false,
              }
            }
            return {
              ...prev,
              feedbacks: [...prev.feedbacks, ...fetchMoreResult.feedbacks],
            }
          },
        })
      }
    },
    [loading, offset, fetchMore, itemsLength, hasMore]
  )

  useEffect(() => {
    const element = loadingRef.current
    if (!element) return

    observer.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    })

    observer.current.observe(element)

    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [handleObserver])

  return { loadingRef }
} 