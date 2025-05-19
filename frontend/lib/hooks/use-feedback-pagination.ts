import { useState, useEffect, useRef } from "react"
import { useQuery } from "@apollo/client"
import { GET_FEEDBACKS } from "@/lib/graphql/queries"

const ITEMS_PER_PAGE = 10

interface UseFeedbackPaginationProps {
  category?: string
  status?: string
  type?: string
  isAdmin?: boolean
}

export function useFeedbackPagination({ 
  category = "all", 
  status = "all", 
  type = "all",
  isAdmin = false 
}: UseFeedbackPaginationProps = {}) {
  const [hasMore, setHasMore] = useState(true)
  const loadMoreRef = useRef(null)

  const { data, loading, error, fetchMore } = useQuery(GET_FEEDBACKS, {
    variables: {
      limit: ITEMS_PER_PAGE,
      offset: 0,
      category: category !== "all" ? category : undefined,
      status: status !== "all" ? status : undefined,
      type: type !== "all" ? type : undefined,
    },
    notifyOnNetworkStatusChange: true,
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore && (data?.feedbacks?.length || 0) > 0) {
          fetchMore({
            variables: {
              offset: data?.feedbacks?.length || 0,
              limit: ITEMS_PER_PAGE,
              category: category !== "all" ? category : undefined,
              status: status !== "all" ? status : undefined,
              type: type !== "all" ? type : undefined,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) return prev
              
              // If we get fewer items than requested, we've reached the end
              if (fetchMoreResult.feedbacks.length < ITEMS_PER_PAGE) {
                setHasMore(false)
              }

              return {
                ...prev,
                feedbacks: [...prev.feedbacks, ...fetchMoreResult.feedbacks]
              }
            }
          })
        }
      },
      { 
        rootMargin: '400px',
        threshold: 0.1
      }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [loading, data?.feedbacks, fetchMore, category, status, type, hasMore])

  // Reset pagination when filters change
  useEffect(() => {
    setHasMore(true)
  }, [category, status, type])

  return {
    feedbacks: data?.feedbacks || [],
    loading,
    error,
    hasMore,
    loadMoreRef
  }
} 