/**
 * @fileoverview IssueCard component for displaying individual issue/feedback items.
 * This component provides a detailed view of an issue with status, category,
 * engagement metrics, and latest response.
 */

"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Users, UserMinus, UserPlus, MapPin } from "lucide-react"
import { formatDistanceToNow } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Feedback, FeedbackType, StatusType } from "@/lib/data"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useFollowFeedback } from "@/lib/hooks/use-follow-feedback"

/**
 * Props interface for the IssueCard component
 * @interface IssueCardProps
 * @property {Feedback} issue - The issue/feedback data to be displayed
 * @property {string} [currentUserId] - The ID of the currently logged-in user
 */
interface IssueCardProps {
  issue: {
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
    submittedBy: string | null
    location: {
      country: string
      province: string
      district: string
      sector: string
    }
    followers: string[]
    followerCount: number
    isFollowing: boolean
    comments: { commentId: string }[]
    responses: { responseId: string }[]
  }
  currentUserId?: string
}

/**
 * IssueCard component that displays a single issue or feedback item.
 * 
 * @component
 * @param {IssueCardProps} props - The component props
 * @returns {JSX.Element} A card displaying issue details including:
 * - Status badge and category
 * - Title and description
 * - Submission time
 * - Author information (anonymous or named)
 * - Engagement metrics (comments and followers)
 * - Latest response (if available)
 * 
 * @example
 * ```tsx
 * <IssueCard issue={feedbackData} currentUserId="user123" />
 * ```
 */
export function IssueCard({ issue, currentUserId }: IssueCardProps) {
  const router = useRouter()

  const { isFollowing, followersCount, toggleFollow } = useFollowFeedback({
    feedbackId: issue.id,
    currentUserId,
    initialIsFollowing: issue.isFollowing,
    initialFollowerCount: issue.followerCount
  })

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking the follow button
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/user/issues/${issue.id}`)
  }

  return (
    <Card 
      className="cursor-pointer transition-colors hover:bg-muted/50" 
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={
              issue.status === "Open"
                ? "status_open"
                : issue.status === "In Progress"
                  ? "status_in_progress"
                  : issue.status === "Resolved"
                    ? "status_resolved"
                    : "status_closed"
            }
          >
            {issue.status}
          </Badge>
          <Badge variant="outline">{issue.category}</Badge>
          {issue.subcategory && <Badge variant="outline">{issue.subcategory}</Badge>}
        </div>
        <CardTitle className="text-xl">{issue.title}</CardTitle>
        <CardDescription>
          Ticket #{issue.ticketNumber} • Submitted {formatDistanceToNow(new Date(issue.submittedAt))}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-muted-foreground">{issue.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src="/placeholder.svg" alt={issue.isAnonymous ? "Anonymous" : issue.citizenName} />
            <AvatarFallback>
              {issue.isAnonymous ? "A" : issue.citizenName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            {issue.isAnonymous ? "Anonymous" : (issue.submittedBy === currentUserId ? "You" : issue.citizenName)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {(issue.location.sector || issue.location.district || issue.location.province || issue.location.country) && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {issue.location.sector && issue.location.district 
                  ? `${issue.location.sector}, ${issue.location.district}`
                  : issue.location.district 
                  ? issue.location.district
                  : issue.location.province
                  ? issue.location.province
                  : issue.location.country}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{(issue.comments?.length || 0) + (issue.responses?.length || 0)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={isFollowing ? "default" : "outline"} 
            size="sm" 
            className="flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation()
              toggleFollow()
            }}
            style={{ display: issue.submittedBy === currentUserId ? 'none' : 'flex' }}
          >
            {isFollowing ? (
              <>
                <UserMinus className="h-4 w-4" />
                <span className="hidden sm:inline">Unfollow</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Follow</span>
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 