/**
 * @fileoverview Issues page component that displays and filters public issues.
 * This page provides a searchable and filterable interface for browsing community
 * concerns and issues.
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { categories, FeedbackType, StatusType, AuthorType } from "@/lib/data"
import { Search, ChevronDown, ChevronUp, MapPin, MessageSquare, ThumbsUp, ThumbsDown, UserPlus, UserMinus, Plus } from "lucide-react"
import { IssueCard } from "@/components/issue-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { useFeedbackPagination } from "@/lib/hooks/use-feedback-pagination"

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

interface IssueCardProps {
  id: string
  title: string
  description: string
  type: FeedbackType
  category: string
  subcategory: string
  ticketNumber: string
  submittedAt: string
  status: StatusType
  isPublic: boolean
  isAnonymous: boolean
  citizenName: string
  email: string
  phone: string
  submittedBy: string | null
  location: Location
  referenceTo: string | null
  attachments: any[]
  assignedAgency: string
  assignedTo: string | null
  followers: string[]
  views: number
  statusHistory: {
    status: StatusType
    changedBy: string
    timestamp: string
    note: string
  }[]
  response: {
    responseId: string
    by: string
    message: string
    timestamp: string
    attachments: any[]
    statusUpdate: StatusType
    likes: number
    likedBy: string[]
  } | null
  comments: {
    commentId: string
    authorType: AuthorType
    authorId: string
    authorName: string
    message: string
    timestamp: string
    likes: number
    likedBy: string[]
  }[]
  rating: number | null
  language: string
  chatMode: boolean
  chatEnabledBy: string | null
  chatEnabledAt: string | null
  followerCount: number
  isFollowing: boolean
  responses: { responseId: string }[]
}

// Transform GraphQL feedback to match IssueCard expected format
function transformFeedback(feedback: GraphQLFeedback): IssueCardProps {
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
    followerCount: feedback.followers.length,
    isFollowing: false,
    responses: feedback.responses.map(r => ({ responseId: r.id }))
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
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const { feedbacks, loading, error, hasMore, loadMoreRef } = useFeedbackPagination({
    category: categoryFilter,
    status: statusFilter
  })

  const filteredIssues = feedbacks.filter((issue: GraphQLFeedback) => {
    const matchesSearch =
      searchQuery === "" ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.ticketId.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="container px-0 sm:px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="px-2 sm:px-0">
          <h1 className="text-3xl font-bold">Public Issues</h1>
          <p className="text-muted-foreground">Browse, follow, and engage with community concerns</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 px-2 sm:px-0 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, description, or ticket number..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[100px] sm:w-[140px] justify-between">
                    <span className="truncate">{statusFilter === "all" ? "All Status" : statusFilter}</span>
                    <ChevronDown className="h-4 w-4 shrink-0" />
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
                  <Button variant="outline" className="w-[100px] sm:w-[140px] justify-between">
                    <span className="truncate">{categoryFilter === "all" ? "All Categories" : categoryFilter}</span>
                    <ChevronDown className="h-4 w-4 shrink-0" />
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

              <Button variant="outline" asChild className="w-[32px] sm:w-auto">
                <Link href="/submit" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Submit New Issue</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-0 sm:border rounded-none sm:rounded-lg">
              <CardHeader className="px-2 sm:px-6">
                <CardDescription>Browse through public issues submitted by citizens</CardDescription>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
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
                    {filteredIssues.map((issue: GraphQLFeedback) => (
                      <IssueCard 
                        key={issue.id} 
                        issue={transformFeedback(issue)} 
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
