/**
 * @fileoverview Issues page component that displays and filters public issues.
 * This page provides a searchable and filterable interface for browsing community
 * concerns and issues.
 */

"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { categories, FeedbackType, StatusType, AuthorType } from "@/lib/data"
import { Search, ChevronDown } from "lucide-react"
import { IssueCard } from "@/components/issue-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { usePublicFeedbacks } from "@/lib/hooks/use-public-feedbacks"

const ITEMS_PER_PAGE = 10

interface Location {
  country: string
  province: string
  district: string
  sector: string
  otherDetails?: string
}

interface User {
  id: string
  firstName?: string
  lastName?: string
  username?: string
}

interface GraphQLFeedback {
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
  author?: User
  location?: Location
  likes: number
  comments: { id: string }[]
  responses: { id: string }[]
  followers: { id: string }[]
}

interface FeedbacksData {
  feedbacks: GraphQLFeedback[]
}

// Transform GraphQL feedback to match IssueCard expected format
function transformFeedback(feedback: GraphQLFeedback) {
  // Convert MongoDB timestamp to ISO string
  const createdAt = new Date(parseInt(feedback.createdAt)).toISOString()

  return {
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
    citizenName: feedback.isAnonymous ? "Anonymous" : `${feedback.author?.firstName || ""} ${feedback.author?.lastName || ""}`.trim() || feedback.author?.username || "Unknown",
    email: "",
    phone: "",
    submittedBy: feedback.author?.id || null,
    location: feedback.location || {
      country: "",
      province: "",
      district: "",
      sector: "",
    },
    referenceTo: null,
    attachments: [],
    assignedAgency: "",
    assignedTo: null,
    followers: feedback.followers.map(f => f.id),
    views: 0,
    statusHistory: [
      {
        status: feedback.status as StatusType,
        changedBy: "system",
        timestamp: createdAt,
        note: "Initial submission",
      },
    ],
    response: feedback.responses.length > 0 ? {
      responseId: feedback.responses[0].id,
      by: "admin",
      message: "Latest response",
      timestamp: createdAt,
      attachments: [],
      statusUpdate: feedback.status as StatusType,
      likes: 0,
      likedBy: [],
    } : null,
    comments: feedback.comments.map(c => ({
      commentId: c.id,
      authorType: "Citizen" as AuthorType,
      authorId: "user",
      authorName: "User",
      message: "Comment",
      timestamp: createdAt,
      likes: 0,
      likedBy: [],
    })),
    rating: null,
    language: "en",
    chatMode: false,
    chatEnabledBy: null,
    chatEnabledAt: null,
  }
}

/**
 * Issues page component that displays a list of public issues with filtering capabilities.
 * 
 * @component
 * @returns {JSX.Element} A page with the following features:
 * - Search functionality for issues
 * - Status filter (All, Open, In Progress, Resolved)
 * - Category filter with dynamic options
 * - List of filtered issues using IssueCard components
 * - Empty state handling with call-to-action
 * 
 * @example
 * ```tsx
 * <IssuesPage />
 * ```
 * 
 * @note
 * - Implements client-side filtering
 * - Uses dropdown menus for filter selection
 * - Provides responsive design for different screen sizes
 * - Integrates with the IssueCard component for consistent issue display
 */
export default function IssuesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [hasMore, setHasMore] = useState(true)
  const loadMoreRef = useRef(null)

  const { feedbacks, loading, error, fetchMore } = usePublicFeedbacks({
    limit: ITEMS_PER_PAGE,
    offset: 0,
    category: categoryFilter,
    status: statusFilter,
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore && feedbacks.length > 0) {
          fetchMore({
            variables: {
              offset: feedbacks.length,
              limit: ITEMS_PER_PAGE,
              category: categoryFilter !== "all" ? categoryFilter : undefined,
              status: statusFilter !== "all" ? statusFilter : undefined,
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
        rootMargin: '400px', // Start loading when user is 400px from the bottom
        threshold: 0.1 // Trigger when at least 10% of the element is visible
      }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [loading, feedbacks, fetchMore, categoryFilter, statusFilter, hasMore])

  // Reset pagination when filters change
  useEffect(() => {
    setHasMore(true)
  }, [categoryFilter, statusFilter, searchQuery])

  const filteredIssues = feedbacks.filter((issue) => {
    const matchesSearch =
      searchQuery === "" ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Public Issues</h1>
          <p className="text-muted-foreground">Browse, follow, and engage with community concerns</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-between">
                    {statusFilter === "all" ? "All Status" : statusFilter}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("open")}>Open</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("in progress")}>In Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("resolved")}>Resolved</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-between">
                    {categoryFilter === "all" ? "All Categories" : categoryFilter}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setCategoryFilter("all")}>All Categories</DropdownMenuItem>
                  {categories.map((category) => (
                    <DropdownMenuItem key={category} onClick={() => setCategoryFilter(category)}>
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" asChild>
                <Link href="/submit">Submit New Issue</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                {/* <CardTitle>Issues ({filteredIssues.length})</CardTitle> */}
                <CardDescription>Browse through public issues submitted by citizens</CardDescription>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-destructive">Error loading issues. Please try again later.</p>
                  </div>
                ) : filteredIssues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground">No issues found matching your criteria</p>
                    <Button asChild className="mt-4">
                      <Link href="/submit">Submit an Issue</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredIssues.map((issue) => (
                      <IssueCard 
                        key={issue.id} 
                        issue={issue} 
                        currentUserId={user?.id}
                      />
                    ))}
                    <div ref={loadMoreRef} className="h-10">
                      {loading && (
                        <div className="flex justify-center py-4">
                          <p className="text-muted-foreground">Loading more issues...</p>
                        </div>
                      )}
                      {!loading && !hasMore && filteredIssues.length > 0 && (
                        <div className="flex justify-center py-4">
                          <p className="text-muted-foreground">No more issues to load</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
