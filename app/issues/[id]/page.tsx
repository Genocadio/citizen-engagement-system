/**
 * @fileoverview Issue detail page component that displays comprehensive information about a specific issue.
 * This page provides detailed view of an issue including its status, comments, responses,
 * and various interactive features like following, liking, and commenting.
 */

"use client"

import type React from "react"
import { use } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getFeedbackById } from "@/lib/data"
import { formatDistanceToNow } from "@/lib/utils"
import { ArrowLeft, Bell, BellOff, ChevronDown, ChevronUp, MapPin, MessageSquare, ThumbsUp, ThumbsDown, Star } from "lucide-react"
import { IssueChat } from "@/components/issue-chat"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

/**
 * Issue detail page component that displays comprehensive information about a specific issue.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Promise<{ id: string }>} props.params - Route parameters containing the issue ID
 * @returns {JSX.Element} A detailed view of the issue with the following features:
 * - Issue status and metadata
 * - Official response section
 * - Comments and replies
 * - Like/dislike functionality
 * - Follow/unfollow capability
 * - Chat mode for direct communication
 * - Location information
 * - Similar issues
 * 
 * @example
 * ```tsx
 * <IssuePage params={Promise.resolve({ id: "issue-123" })} />
 * ```
 * 
 * @note
 * - Implements real-time interaction features
 * - Supports nested comments and replies
 * - Provides agency-specific chat mode
 * - Includes file attachment support
 * - Handles anonymous submissions
 */
export default function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [hasLikedResponse, setHasLikedResponse] = useState(false)
  const [hasDislikedResponse, setHasDislikedResponse] = useState(false)
  const [hasLikedComments, setHasLikedComments] = useState<Record<string, boolean>>({})
  const [hasDislikedComments, setHasDislikedComments] = useState<Record<string, boolean>>({})
  const [responseLikes, setResponseLikes] = useState(0)
  const [responseDislikes, setResponseDislikes] = useState(0)
  const [commentLikes, setCommentLikes] = useState<Record<string, number>>({})
  const [commentDislikes, setCommentDislikes] = useState<Record<string, number>>({})
  const [comment, setComment] = useState("")
  const [isChatMode, setIsChatMode] = useState(false)
  const [showComments, setShowComments] = useState(true)
  const [commentingOn, setCommentingOn] = useState<{ type: "feedback" | "response" | "comment", id: string } | null>(null)

  const issue = getFeedbackById(use(params).id)
  const isResolved = issue?.status === "Resolved" || issue?.status === "Closed"

  useEffect(() => {
    if (issue) {
      if (issue.response) {
        setResponseLikes(issue.response.likes)
      }
      const initialCommentLikes: Record<string, number> = {}
      issue.comments.forEach(comment => {
        initialCommentLikes[comment.commentId] = comment.likes
      })
      setCommentLikes(initialCommentLikes)
      setIsChatMode(issue.chatMode)
    }
  }, [issue])

  if (!issue) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Issue not found</CardTitle>
            <CardDescription>The issue you are looking for does not exist or has been removed.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/issues")}>Back to Issues</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    toast({
      title: isFollowing ? "Unfollowed issue" : "Following issue",
      description: isFollowing
        ? "You will no longer receive updates about this issue"
        : "You will receive updates about this issue",
    })
  }

  const handleLikeResponse = () => {
    setHasLikedResponse(!hasLikedResponse)
    setResponseLikes(prev => hasLikedResponse ? prev - 1 : prev + 1)
    if (hasDislikedResponse) {
      setHasDislikedResponse(false)
      setResponseDislikes(prev => prev - 1)
    }
    toast({
      title: hasLikedResponse ? "Removed like" : "Liked response",
      description: hasLikedResponse ? "You have removed your like from this response" : "You have liked this response",
    })
  }

  const handleDislikeResponse = () => {
    setHasDislikedResponse(!hasDislikedResponse)
    setResponseDislikes(prev => hasDislikedResponse ? prev - 1 : prev + 1)
    if (hasLikedResponse) {
      setHasLikedResponse(false)
      setResponseLikes(prev => prev - 1)
    }
    toast({
      title: hasDislikedResponse ? "Removed dislike" : "Disliked response",
      description: hasDislikedResponse ? "You have removed your dislike from this response" : "You have disliked this response",
    })
  }

  const handleLikeComment = (commentId: string) => {
    const currentLikes = commentLikes[commentId] || 0
    const isCurrentlyLiked = hasLikedComments[commentId]
    
    // Update like count
    setCommentLikes(prev => ({
      ...prev,
      [commentId]: isCurrentlyLiked ? currentLikes - 1 : currentLikes + 1
    }))

    // Update like state
    setHasLikedComments(prev => ({
      ...prev,
      [commentId]: !isCurrentlyLiked
    }))

    // If adding a like, remove dislike if it exists
    if (!isCurrentlyLiked && hasDislikedComments[commentId]) {
      setCommentDislikes(prev => ({
        ...prev,
        [commentId]: (prev[commentId] || 0) - 1
      }))
      setHasDislikedComments(prev => ({
        ...prev,
        [commentId]: false
      }))
    }
  }

  const handleDislikeComment = (commentId: string) => {
    const currentDislikes = commentDislikes[commentId] || 0
    const isCurrentlyDisliked = hasDislikedComments[commentId]
    
    // Update dislike count
    setCommentDislikes(prev => ({
      ...prev,
      [commentId]: isCurrentlyDisliked ? currentDislikes - 1 : currentDislikes + 1
    }))

    // Update dislike state
    setHasDislikedComments(prev => ({
      ...prev,
      [commentId]: !isCurrentlyDisliked
    }))

    // If adding a dislike, remove like if it exists
    if (!isCurrentlyDisliked && hasLikedComments[commentId]) {
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: (prev[commentId] || 0) - 1
      }))
      setHasLikedComments(prev => ({
        ...prev,
        [commentId]: false
      }))
    }
  }

  const handleNewMessage = (message: any) => {
    // Here you would typically update the backend with the new message
    // For now, we'll just show a toast
    toast({
      title: "Message sent",
      description: "Your message has been added to the conversation",
    })
  }

  const handleChatModeToggle = () => {
    if (!user || user.role !== "admin") return

    setIsChatMode(!isChatMode)
    // Here you would typically update the backend
    toast({
      title: isChatMode ? "Chat mode disabled" : "Chat mode enabled",
      description: isChatMode 
        ? "This issue is now in comment mode" 
        : "This issue is now in chat mode",
    })
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !commentingOn) return

    // Create new comment
    const newComment = {
      commentId: `comment-${Date.now()}`,
      message: comment,
      authorName: user?.name || "Anonymous",
      authorType: (user?.role === "admin" ? "Admin" : "Citizen") as "Citizen" | "Admin",
      authorId: user?.id || "anonymous",
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      likedBy: [],
      severity: "low",
      parentId: commentingOn?.type === "comment" ? commentingOn.id : 
                commentingOn?.type === "response" ? issue.response?.responseId : 
                undefined
    }

    // Add to the beginning of comments array
    issue.comments.unshift(newComment)

    // Reset form
    setComment("")
    setCommentingOn(null)

    toast({
      title: "Comment submitted",
      description: "Your comment has been added to the conversation",
    })
  }

  // Convert existing comments and responses to chat messages
  const chatMessages = [
    ...(issue?.response ? [{
      id: issue.response.responseId,
      content: issue.response.message,
      timestamp: issue.response.timestamp,
      author: {
        name: issue.assignedAgency,
        type: "agency" as "agency" | "admin" | "citizen",
      },
      isResponse: true,
      attachments: issue.response.attachments,
    }] : []),
    ...(issue?.comments || []).map(comment => ({
      id: comment.commentId,
      content: comment.message,
      timestamp: comment.timestamp,
      author: {
        name: comment.authorName,
        type: (comment.authorType.toLowerCase() === "agency" ? "agency" : 
               comment.authorType.toLowerCase() === "admin" ? "admin" : 
               "citizen") as "agency" | "admin" | "citizen",
        avatar: "/placeholder.svg",
      },
      isResponse: comment.authorType.toLowerCase() === "agency",
    })),
  ]

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <Button variant="ghost" className="w-fit" onClick={() => router.push("/issues")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Issues
        </Button>

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <Card>
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
                  <Badge variant="outline">{issue.subcategory}</Badge>
                </div>
                <CardTitle className="text-2xl">{issue.title}</CardTitle>
                <CardDescription>
                  Ticket #{issue.ticketNumber} • Submitted {formatDistanceToNow(new Date(issue.submittedAt))}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p>{issue.description}</p>

                  {issue.attachments.length > 0 && (
                    <div className="mt-4">
                      <h3 className="mb-2 text-sm font-medium">Attachments</h3>
                      <div className="flex flex-wrap gap-2">
                        {issue.attachments.map((attachment, index) => (
                          <div key={index} className="relative h-24 w-24 overflow-hidden rounded-md border">
                            <img
                              src={attachment || "/placeholder.svg"}
                              alt={`Attachment ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {issue.isAnonymous ? (
                      <span className="text-sm text-muted-foreground">Anonymous</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" alt={issue.citizenName} />
                          <AvatarFallback>{issue.citizenName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{issue.citizenName}</p>
                          <p className="text-xs text-muted-foreground">
                            {issue.location.sector}, {issue.location.district}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!commentingOn && !isResolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => setCommentingOn({ type: "feedback", id: issue.id })}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Comment
                      </Button>
                    )}
                    {!isResolved && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleFollow}>
                        {isFollowing ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>

                {commentingOn?.type === "feedback" && commentingOn.id === issue.id && !isResolved && (
                  <form onSubmit={handleCommentSubmit} className="mt-4 space-y-4">
                    <Textarea
                      placeholder="Add a comment to this issue..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setCommentingOn(null)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!comment.trim()}>
                        Post Comment
                      </Button>
                    </div>
                  </form>
                )}

                {/* Issue Comments */}
                {issue.comments.filter(comment => !comment.parentId).length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-sm font-medium">Comments on Issue</h3>
                    {issue.comments
                      .filter(comment => !comment.parentId)
                      .slice(0, showComments ? undefined : 1)
                      .map(comment => (
                        <div key={comment.commentId} className="ml-4 space-y-2">
                          <div className="flex items-start gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/placeholder.svg?height=32&width=32" alt={comment.authorName} />
                              <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{comment.authorName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {comment.authorType}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(comment.timestamp))}
                                </span>
                              </div>
                              <p className="text-sm">{comment.message}</p>
                              <div className="flex items-center gap-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`flex items-center gap-1 ${hasLikedComments[comment.commentId] ? 'text-blue-500' : ''}`}
                                  onClick={() => handleLikeComment(comment.commentId)}
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                  <span>{commentLikes[comment.commentId] || 0}</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`flex items-center gap-1 ${hasDislikedComments[comment.commentId] ? 'text-red-500' : ''}`}
                                  onClick={() => handleDislikeComment(comment.commentId)}
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                  <span>{commentDislikes[comment.commentId] || 0}</span>
                                </Button>
                                {!commentingOn && !isResolved && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1"
                                    onClick={() => setCommentingOn({ type: "comment", id: comment.commentId })}
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                    Reply
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* Nested Comments */}
                          {issue.comments
                            .filter(reply => reply.parentId === comment.commentId)
                            .map(reply => (
                              <div key={reply.commentId} className="ml-8 mt-2 space-y-2">
                                <div className="flex items-start gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src="/placeholder.svg?height=24&width=24" alt={reply.authorName} />
                                    <AvatarFallback>{reply.authorName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{reply.authorName}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {reply.authorType}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(reply.timestamp))}
                                      </span>
                                    </div>
                                    <p className="text-sm">{reply.message}</p>
                                    <div className="flex items-center gap-4">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`flex items-center gap-1 ${hasLikedComments[reply.commentId] ? 'text-blue-500' : ''}`}
                                        onClick={() => handleLikeComment(reply.commentId)}
                                      >
                                        <ThumbsUp className="h-4 w-4" />
                                        <span>{commentLikes[reply.commentId] || 0}</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`flex items-center gap-1 ${hasDislikedComments[reply.commentId] ? 'text-red-500' : ''}`}
                                        onClick={() => handleDislikeComment(reply.commentId)}
                                      >
                                        <ThumbsDown className="h-4 w-4" />
                                        <span>{commentDislikes[reply.commentId] || 0}</span>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    {issue.comments.filter(comment => !comment.parentId).length > 1 && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setShowComments(!showComments)}
                      >
                        {showComments ? (
                          <>
                            <ChevronUp className="mr-2 h-4 w-4" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="mr-2 h-4 w-4" />
                            View {issue.comments.filter(comment => !comment.parentId).length - 1} more comments
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {/* Response Section */}
                {issue.response && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-sm font-medium">Official Response</h3>
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg?height=32&width=32" alt={issue.assignedAgency} />
                            <AvatarFallback>{issue.assignedAgency.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{issue.assignedAgency}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(issue.response.timestamp))}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">Official Response</Badge>
                      </div>
                      <p className="text-sm">{issue.response.message}</p>
                      {issue.response.attachments && issue.response.attachments.length > 0 && (
                        <div className="mt-4">
                          <h4 className="mb-2 text-xs font-medium">Response Attachments</h4>
                          <div className="flex flex-wrap gap-2">
                            {issue.response.attachments.map((attachment, index) => (
                              <div key={index} className="relative h-20 w-20 overflow-hidden rounded-md border">
                                <img
                                  src={attachment || "/placeholder.svg"}
                                  alt={`Response Attachment ${index + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-4 flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex items-center gap-1 ${hasLikedResponse ? 'text-blue-500' : ''}`}
                          onClick={handleLikeResponse}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{responseLikes}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex items-center gap-1 ${hasDislikedResponse ? 'text-red-500' : ''}`}
                          onClick={handleDislikeResponse}
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span>{responseDislikes}</span>
                        </Button>
                        {!commentingOn && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => setCommentingOn({ type: "response", id: issue.response?.responseId || "" })}
                          >
                            <MessageSquare className="h-4 w-4" />
                            Reply
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Response Comments */}
                    {issue.comments.filter(comment => comment.parentId === issue.response?.responseId).length > 0 && (
                      <div className="ml-4 space-y-4">
                        <h4 className="text-sm font-medium">Comments on Response</h4>
                        {issue.comments
                          .filter(comment => comment.parentId === issue.response?.responseId)
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .slice(0, showComments ? undefined : 1)
                          .map(comment => (
                            <div key={comment.commentId} className="space-y-2">
                              <div className="flex items-start gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt={comment.authorName} />
                                  <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{comment.authorName}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {comment.authorType}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(comment.timestamp))}
                                    </span>
                                  </div>
                                  <p className="text-sm">{comment.message}</p>
                                  <div className="flex items-center gap-4">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`flex items-center gap-1 ${hasLikedComments[comment.commentId] ? 'text-blue-500' : ''}`}
                                      onClick={() => handleLikeComment(comment.commentId)}
                                    >
                                      <ThumbsUp className="h-4 w-4" />
                                      <span>{commentLikes[comment.commentId] || 0}</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`flex items-center gap-1 ${hasDislikedComments[comment.commentId] ? 'text-red-500' : ''}`}
                                      onClick={() => handleDislikeComment(comment.commentId)}
                                    >
                                      <ThumbsDown className="h-4 w-4" />
                                      <span>{commentDislikes[comment.commentId] || 0}</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        {issue.comments.filter(comment => comment.parentId === issue.response?.responseId).length > 1 && (
                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setShowComments(!showComments)}
                          >
                            {showComments ? (
                              <>
                                <ChevronUp className="mr-2 h-4 w-4" />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="mr-2 h-4 w-4" />
                                View {issue.comments.filter(comment => comment.parentId === issue.response?.responseId).length - 1} more comments
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {commentingOn && (
                  <form onSubmit={handleCommentSubmit} className="mt-4 space-y-4">
                    <Textarea
                      placeholder={`Add a comment to this ${commentingOn.type}...`}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setCommentingOn(null)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!comment.trim()}>
                        Post Comment
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {user?.role === "admin" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chat Settings</CardTitle>
                  <CardDescription>Control the communication mode for this issue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="chat-mode"
                      checked={isChatMode}
                      onCheckedChange={handleChatModeToggle}
                    />
                    <Label htmlFor="chat-mode">Enable Chat Mode</Label>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    When enabled, users can chat directly with agency representatives. When disabled, users can only comment on the issue.
                  </p>
                </CardContent>
              </Card>
            )}

            {isChatMode && (
              <IssueChat
                issueId={issue.id}
                initialMessages={chatMessages}
                onNewMessage={handleNewMessage}
                isAgency={user?.role === "agency"}
              />
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Issue Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Current Status</span>
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
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Assigned To</span>
                    <span className="text-sm font-medium">{issue.assignedAgency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Followers</span>
                    <span className="text-sm font-medium">{issue.followers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Views</span>
                    <span className="text-sm font-medium">{issue.views}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Status History</h3>
                  <div className="space-y-3">
                    {issue.statusHistory.map((history, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{history.status}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(history.timestamp))}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{history.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Country:</span> {issue.location.country}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Province/State:</span> {issue.location.province}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">District:</span> {issue.location.district}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Sector:</span> {issue.location.sector}
                      </p>
                      {issue.location.otherDetails && (
                        <p className="text-sm">
                          <span className="font-medium">Details:</span> {issue.location.otherDetails}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Similar Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">In Progress</Badge>
                      <span className="text-xs text-muted-foreground">2 days ago</span>
                    </div>
                    <p className="mt-1 text-sm font-medium">Water supply issues in Kimironko</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Resolved</Badge>
                      <span className="text-xs text-muted-foreground">5 days ago</span>
                    </div>
                    <p className="mt-1 text-sm font-medium">Power outage in Remera</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Open</Badge>
                      <span className="text-xs text-muted-foreground">1 week ago</span>
                    </div>
                    <p className="mt-1 text-sm font-medium">Street light not working in Gikondo</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push("/issues")}>
                  View All Issues
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
