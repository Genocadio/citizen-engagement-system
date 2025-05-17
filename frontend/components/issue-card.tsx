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
import { MessageSquare, Users, Heart } from "lucide-react"
import { formatDistanceToNow } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Feedback, Response } from "@/lib/data"

/**
 * Props interface for the IssueCard component
 * @interface IssueCardProps
 * @property {Feedback} issue - The issue/feedback data to be displayed
 * @property {string} [currentUserId] - The ID of the currently logged-in user
 */
interface IssueCardProps {
  issue: Feedback
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
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(issue.followers?.length || 0)
  const isResolved = issue.status === "Resolved" || issue.status === "Closed"
  const isAuthor = currentUserId && issue.submittedBy === currentUserId

  const toggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when clicking follow button
    const newFollowingState = !isFollowing
    setIsFollowing(newFollowingState)
    setFollowersCount(prev => newFollowingState ? prev + 1 : prev - 1)
  }

  return (
    <div
      className="rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => router.push(`/issues/${issue.id}`)}
    >
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div className="space-y-1">
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
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(issue.submittedAt))}
            </span>
          </div>
          <h3 className="font-semibold">{issue.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
        </div>
        {currentUserId && !isResolved && !isAuthor && (
          <Button
            variant={isFollowing ? "default" : "outline"}
            size="sm"
            className="shrink-0"
            onClick={toggleFollow}
          >
            <Heart className={`h-4 w-4 mr-2 ${isFollowing ? "fill-current" : ""}`} />
            {isFollowing ? "Following" : "Follow"}
          </Button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {issue.isAnonymous ? (
            <span className="text-xs text-muted-foreground">Anonymous</span>
          ) : (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder.svg?height=24&width=24" alt={issue.citizenName} />
                <AvatarFallback>{issue.citizenName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs">{issue.citizenName}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{issue.comments?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{followersCount}</span>
          </div>
        </div>
      </div>

      {issue.response && (
        <div className="mt-4 rounded-lg bg-muted p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">Latest Response</p>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(issue.response.timestamp))}
            </span>
          </div>
          <p className="mt-1 text-sm line-clamp-2">{issue.response.message}</p>
        </div>
      )}
    </div>
  )
} 