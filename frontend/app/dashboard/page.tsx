/**
 * @fileoverview Dashboard page component that displays user's feedback submissions and their status.
 * This page provides a personalized view of submitted issues, their current status,
 * and responses received.
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
import { AlertCircle, CheckCircle, Clock, Plus, ChevronDown } from "lucide-react"
import { useQuery } from "@apollo/client"
import { GET_USER_FEEDBACKS } from "@/lib/graphql/queries"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ITEMS_PER_PAGE = 10

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
  const [filter, setFilter] = useState<string>("all")
  const [offset, setOffset] = useState(0)
  const observer = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  const { data, loading, fetchMore } = useQuery(GET_USER_FEEDBACKS, {
    variables: {
      limit: ITEMS_PER_PAGE,
      offset: 0,
    },
    skip: !user,
  })

  const feedbacks = data?.me?.feedbacks || []

  // Filter feedback based on status
  const filteredFeedback =
    filter === "all"
      ? feedbacks
      : feedbacks.filter((feedback) => feedback.status.toLowerCase() === filter.toLowerCase())

  // Count by status
  const openCount = feedbacks.filter((feedback) => feedback.status === "Open").length
  const inProgressCount = feedbacks.filter((feedback) => feedback.status === "In Progress").length
  const resolvedCount = feedbacks.filter(
    (feedback) => feedback.status === "Resolved" || feedback.status === "Closed",
  ).length

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && !loading && feedbacks.length >= ITEMS_PER_PAGE) {
        const newOffset = offset + ITEMS_PER_PAGE
        setOffset(newOffset)
        fetchMore({
          variables: {
            offset: newOffset,
            limit: ITEMS_PER_PAGE,
          },
        })
      }
    },
    [loading, offset, fetchMore, feedbacks.length]
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

  if (!user) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Please sign in to view your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/")}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => router.push("/submit")}>
          <Plus className="mr-2 h-4 w-4" />
          New Feedback
        </Button>
      </div>

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
            <div className="flex items-center justify-between">
              <CardTitle>Your Feedback</CardTitle>
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
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFeedback.length === 0 ? (
                <div className="text-center text-muted-foreground">No feedback found</div>
              ) : (
                filteredFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="rounded-lg border p-4 hover:bg-muted/50"
                    onClick={() => router.push(`/feedback/${feedback.ticketId}`)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            feedback.status === "Open"
                              ? "status_open"
                              : feedback.status === "In Progress"
                                ? "status_in_progress"
                                : feedback.status === "Resolved"
                                  ? "status_resolved"
                                  : "status_closed"
                          }
                        >
                          {feedback.status}
                        </Badge>
                        <Badge variant="outline">{feedback.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(feedback.createdAt))}
                        </span>
                      </div>
                      <h3 className="font-semibold">{feedback.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Ticket #{feedback.ticketId} • {feedback.category} • {feedback.subcategory}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={loadingRef} className="h-4 w-full">
                {loading && <div className="text-center text-muted-foreground">Loading...</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
