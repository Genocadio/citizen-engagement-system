/**
 * @fileoverview Dashboard page component that displays user's feedback submissions and their status.
 * This page provides a personalized view of submitted issues, their current status,
 * and responses received.
 * 
 * @module DashboardPage
 * @requires react
 * @requires next/navigation
 * @requires @apollo/client
 * @requires @/lib/auth-context
 * @requires @/lib/graphql/queries
 * @requires @/lib/utils
 * @requires @/lib/data
 */

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { formatDistanceToNow } from "@/lib/utils"
import { AlertCircle, CheckCircle, Clock, Plus, ChevronDown, Search, Ticket } from "lucide-react"
import { useQuery } from "@apollo/client"
import { MY_FEEDBACKS, GET_FEEDBACK_BY_TICKET_ID } from "@/lib/graphql/queries"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IssueCard } from "@/components/issue-card"
import { Input } from "@/components/ui/input"
import { FeedbackType, StatusType, AuthorType } from "@/lib/data"
import { useToast } from "@/components/ui/use-toast"

// Constants
const ITEMS_PER_PAGE = 10

// Types
interface Feedback {
  id: string
  ticketId: string
  title: string
  description: string
  type: string
  status: string
  category: string
  subcategory?: string
  priority: string
  isAnonymous: boolean
  chatEnabled: boolean
  createdAt: string
  author?: {
    id: string
    firstName?: string
    lastName?: string
    username?: string
  }
  location?: {
    country: string
    province: string
    district: string
    sector: string
    otherDetails?: string
  }
  likes: number
  comments: { id: string }[]
  responses: { id: string }[]
  followers: { id: string }[]
  followerCount: number
  isFollowing: boolean
}

interface MyFeedbacksData {
  myFeedbacks: Feedback[]
}

/**
 * Custom hook for handling ticket ID search functionality
 * @returns {Object} Ticket search state and handlers
 */
const useTicketSearch = () => {
  const router = useRouter()
  const { toast } = useToast()
  const [ticketIdSearch, setTicketIdSearch] = useState("")
  const [shouldSearch, setShouldSearch] = useState(false)

  const { data: ticketData, loading: ticketLoading, error: ticketError } = useQuery(GET_FEEDBACK_BY_TICKET_ID, {
    variables: {
      ticketId: ticketIdSearch.toUpperCase(),
    },
    skip: !shouldSearch || !ticketIdSearch,
  })

  useEffect(() => {
    if (ticketData?.feedbackByTicketId) {
      router.push(`/user/issues/${ticketData.feedbackByTicketId.id}`)
      setShouldSearch(false)
    } else if (ticketData === null) {
      toast({
        title: "Error",
        description: "No feedback found with this ticket ID",
        variant: "destructive",
      })
      setShouldSearch(false)
    }
  }, [ticketData, router, toast])

  useEffect(() => {
    if (ticketError) {
      toast({
        title: "Error",
        description: "Feedback not found. Please check the ticket ID and try again.",
        variant: "destructive",
      })
      setShouldSearch(false)
    }
  }, [ticketError, toast])

  const handleTicketIdSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!ticketIdSearch.trim()) {
      toast({
        title: "Error",
        description: "Please enter a ticket ID",
        variant: "destructive",
      })
      return
    }
    setShouldSearch(true)
  }

  return {
    ticketIdSearch,
    setTicketIdSearch,
    ticketLoading,
    handleTicketIdSearch,
  }
}

/**
 * Custom hook for handling infinite scroll functionality
 * @param {Object} options - Configuration options
 * @param {boolean} options.loading - Loading state
 * @param {boolean} options.hasMore - Whether there are more items to load
 * @param {number} options.offset - Current offset
 * @param {Function} options.fetchMore - Function to fetch more items
 * @param {number} options.itemsLength - Current number of items
 * @returns {Object} Infinite scroll state and refs
 */
interface InfiniteScrollOptions {
  loading: boolean
  hasMore: boolean
  offset: number
  fetchMore: (options: {
    variables: { offset: number; limit: number }
    updateQuery: (prev: MyFeedbacksData, result: { fetchMoreResult: MyFeedbacksData }) => MyFeedbacksData
  }) => Promise<any>
  itemsLength: number
}

const useInfiniteScroll = ({ loading, hasMore, offset, fetchMore, itemsLength }: InfiniteScrollOptions) => {
  const observer = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && !loading && hasMore && itemsLength > 0) {
        const newOffset = offset + ITEMS_PER_PAGE
        fetchMore({
          variables: {
            offset: newOffset,
            limit: ITEMS_PER_PAGE,
          },
          updateQuery: (prev: MyFeedbacksData, { fetchMoreResult }: { fetchMoreResult: MyFeedbacksData }) => {
            if (!fetchMoreResult) return prev
            if (fetchMoreResult.myFeedbacks.length < ITEMS_PER_PAGE) {
              return {
                ...prev,
                myFeedbacks: [...prev.myFeedbacks, ...fetchMoreResult.myFeedbacks],
                hasMore: false,
              }
            }
            return {
              ...prev,
              myFeedbacks: [...prev.myFeedbacks, ...fetchMoreResult.myFeedbacks],
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

/**
 * Utility function to convert MongoDB timestamp to ISO string
 * @param {string | number} timestamp - The timestamp to convert
 * @returns {string} ISO formatted date string
 */
function convertTimestamp(timestamp: string | number): string {
  try {
    if (typeof timestamp === 'string' && /^\d+$/.test(timestamp)) {
      return new Date(parseInt(timestamp)).toISOString()
    }
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toISOString()
    }
    if (typeof timestamp === 'string' && timestamp.includes('T')) {
      return timestamp
    }
    return new Date().toISOString()
  } catch (error) {
    console.error('Error converting timestamp:', error)
    return new Date().toISOString()
  }
}

/**
 * Dashboard page component that displays user's feedback submissions and statistics.
 * 
 * @component
 * @returns {JSX.Element} A dashboard with the following features:
 * - Authentication check with sign-in prompt
 * - Statistics cards showing counts by status
 * - Filterable list of user's feedback submissions
 * - Status badges and response previews
 * - Quick access to submit new feedback
 * 
 * @example
 * ```tsx
 * <DashboardPage />
 * ```
 * 
 * @note
 * - Requires user authentication
 * - Implements client-side filtering
 * - Shows real-time status counts
 * - Provides navigation to individual ticket details
 */
export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const { ticketIdSearch, setTicketIdSearch, ticketLoading, handleTicketIdSearch } = useTicketSearch()

  const { data, loading, error, fetchMore } = useQuery<MyFeedbacksData>(MY_FEEDBACKS, {
    variables: {
      limit: ITEMS_PER_PAGE,
      offset: 0,
    },
    skip: !user,
  })

  const { loadingRef } = useInfiniteScroll({
    loading,
    hasMore,
    offset,
    fetchMore,
    itemsLength: data?.myFeedbacks?.length || 0,
  })

  const feedbacks = data?.myFeedbacks || []

  // Filter feedback based on status and search query
  const filteredFeedback = feedbacks.filter((feedback) => {
    const matchesStatus =
      filter === "all" || feedback.status.toLowerCase() === filter.toLowerCase()
    const matchesSearch =
      searchQuery === "" ||
      feedback.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.ticketId.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Count by status
  const openCount = feedbacks.filter((feedback) => feedback.status === "Open").length
  const inProgressCount = feedbacks.filter((feedback) => feedback.status === "In Progress").length
  const resolvedCount = feedbacks.filter((feedback) =>
    feedback.status === "Resolved" || feedback.status === "Closed",
  ).length

  // Reset pagination when filters change
  useEffect(() => {
    setOffset(0)
    setHasMore(true)
  }, [filter, searchQuery])

  if (!user) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Please sign in to view your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/user")}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => router.push("/user/submit")}>
          <Plus className="mr-2 h-4 w-4" />
          New Feedback
        </Button>
      </div>

      <form onSubmit={handleTicketIdSearch} className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Search by Ticket ID</CardTitle>
            <CardDescription>Enter a ticket ID to view its details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Ticket className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter ticket ID (e.g. CT-123456)"
                  className="pl-8 uppercase"
                  value={ticketIdSearch}
                  onChange={(e) => setTicketIdSearch(e.target.value.toUpperCase())}
                />
              </div>
              <Button type="submit" disabled={ticketLoading}>
                {ticketLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Your Feedback</CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title or ticket ID..."
                    className="pl-8 min-w-[220px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilter("all")}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("open")}>Open</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("in progress")}>In Progress</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("resolved")}>Resolved</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("closed")}>Closed</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error ? (
                <div className="text-center text-destructive">Error loading feedback. Please try again later.</div>
              ) : filteredFeedback.length === 0 ? (
                <div className="text-center text-muted-foreground">No feedback found</div>
              ) : (
                <>
                  {filteredFeedback.map((feedback) => {
                    const createdAt = convertTimestamp(feedback.createdAt)
                    return (
                      <IssueCard
                        key={feedback.id}
                        issue={{
                          id: feedback.id,
                          title: feedback.title,
                          description: feedback.description,
                          type: feedback.type as FeedbackType,
                          category: feedback.category,
                          subcategory: feedback.subcategory || "",
                          ticketNumber: feedback.ticketId,
                          submittedAt: createdAt,
                          status: feedback.status as StatusType,
                          isPublic: true,
                          isAnonymous: feedback.isAnonymous,
                          citizenName: feedback.isAnonymous
                            ? "Anonymous"
                            : `${feedback.author?.firstName || ""} ${feedback.author?.lastName || ""}`.trim() || feedback.author?.username || "Unknown",
                          submittedBy: feedback.author?.id || null,
                          location: feedback.location || {
                            country: "",
                            province: "",
                            district: "",
                            sector: "",
                          },
                          followers: feedback.followers?.map(f => f.id) || [],
                          followerCount: feedback.followerCount || 0,
                          isFollowing: feedback.isFollowing || false,
                          comments: feedback.comments.map(c => ({ commentId: c.id })),
                          responses: feedback.responses.map(r => ({ responseId: r.id }))
                        }}
                        currentUserId={user?.id}
                      />
                    )
                  })}
                  <div ref={loadingRef} className="h-10">
                    {loading && (
                      <div className="flex justify-center py-4">
                        <p className="text-muted-foreground">Loading more feedback...</p>
                      </div>
                    )}
                    {!loading && !hasMore && filteredFeedback.length > 0 && (
                      <div className="flex justify-center py-4">
                        <p className="text-muted-foreground">No more feedback to load</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
