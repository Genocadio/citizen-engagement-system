/**
 * @fileoverview Issue detail page component that displays comprehensive information about a specific issue.
 * This page provides detailed view of an issue including its status, comments, responses,
 * and various interactive features like following, liking, and commenting.
 */

"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { formatDistanceToNow } from "@/lib/utils"
import { ArrowLeft, ChevronDown, ChevronUp, MapPin, MessageSquare, ThumbsUp, ThumbsDown, UserPlus, UserMinus, X } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useQuery, useMutation, useApolloClient } from "@apollo/client"
import { GET_FEEDBACK_BY_ID } from "@/lib/graphql/queries"
import { FeedbackType, StatusType, AuthorType } from "@/lib/data"
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog"
import { useFollowFeedback } from "@/lib/hooks/use-follow-feedback"
import { CREATE_COMMENT, LIKE_COMMENT, UNLIKE_COMMENT, LIKE_FEEDBACK, UNLIKE_FEEDBACK, FOLLOW_FEEDBACK, UNFOLLOW_FEEDBACK } from "@/lib/graphql/mutations"
import { ApolloCache } from "@apollo/client"

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
  username: string
  profileUrl?: string
  role?: string
  email?: string
  phoneNumber?: string
  category?: string
  createdAt?: string
  updatedAt?: string
}

interface Comment {
  id: string
  message: string
  author: User
  authorName: string
  attachments: string[]
  likes: number
  likesCount: number
  hasLiked: boolean
  likedBy: string[]
  createdAt: string
  updatedAt: string
}

interface Response {
  id: string
  message: string
  by: User
  statusUpdate: string
  attachments: string[]
  likes: number
  likedBy: string[]
  createdAt: string
  updatedAt: string
}

interface Feedback {
  id: string
  ticketId: string
  title: string
  description: string
  type: string
  status: string
  category: string
  subcategory?: string
  priority?: string
  isAnonymous: boolean
  chatEnabled: boolean
  createdAt: string
  updatedAt: string
  author?: User
  assignedTo?: User
  location?: Location
  attachments: string[]
  likes: number
  likedBy: string[]
  followers: string[]
  followerCount: number
  isFollowing: boolean
  comments: Comment[]
  responses: Response[]
  hasLiked: boolean
  likesCount: number
}

interface FeedbackData {
  feedback: Feedback
}

export default function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const client = useApolloClient()
  const resolvedParams = use(params)
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
  const [showComments, setShowComments] = useState(false)
  const [commentingOn, setCommentingOn] = useState<{ type: "feedback" | "response" | "comment", id: string } | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const { data, loading, error } = useQuery<FeedbackData>(GET_FEEDBACK_BY_ID, {
    variables: {
      id: resolvedParams.id
    },
    fetchPolicy: 'cache-and-network'
  })

  const issue = data?.feedback

  const { isFollowing, followersCount, toggleFollow } = useFollowFeedback({
    feedbackId: resolvedParams.id,
    currentUserId: user?.id,
    initialIsFollowing: issue?.isFollowing ?? false,
    initialFollowerCount: issue?.followerCount ?? 0,
    onFollowChange: async (isFollowing) => {
      if (!issue) return
      
      try {
        // The cache is already updated by the mutations in useFollowFeedback
        // No need to update it here
      } catch (error: any) {
        console.error("Error in follow change:", error)
        toast({
          title: "Error",
          description: "Failed to update follow status. Please try again.",
          variant: "destructive"
        })
      }
    }
  })

  useEffect(() => {
    if (issue) {
      // Force a refetch of the issue data to ensure we have the latest state
      client.refetchQueries({
        include: [GET_FEEDBACK_BY_ID],
        updateCache(cache) {
          cache.modify({
            id: cache.identify({ __typename: 'Feedback', id: issue.id }),
            fields: {
              isFollowing: () => issue.isFollowing,
              followerCount: () => issue.followerCount
            }
          })
        }
      })
    }
  }, [issue?.id, client])

  const [createComment] = useMutation(CREATE_COMMENT)
  const [likeComment] = useMutation(LIKE_COMMENT)
  const [unlikeComment] = useMutation(UNLIKE_COMMENT)
  const [likeFeedback] = useMutation(LIKE_FEEDBACK)
  const [unlikeFeedback] = useMutation(UNLIKE_FEEDBACK)

  useEffect(() => {
    if (issue) {
      if (issue.responses[0]) {
        setResponseLikes(issue.responses[0].likes)
      }
      const initialCommentLikes: Record<string, number> = {}
      issue.comments.forEach(comment => {
        initialCommentLikes[comment.id] = comment.likes
      })
      setCommentLikes(initialCommentLikes)
      setIsChatMode(issue.chatEnabled)
    }
  }, [issue])

  if (loading) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we fetch the issue details.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error || !issue) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error ? error.message : "The issue you are looking for does not exist or has been removed."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/issues")}>Back to Issues</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isResolved = issue.status === "Resolved" || issue.status === "Closed"

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

  const handleLikeComment = async (commentId: string) => {
    try {
      const comment = issue.comments.find(c => c.id === commentId)
      if (!comment) return

      const mutation = comment.hasLiked ? unlikeComment : likeComment
      
      const { data } = await mutation({
        variables: { id: commentId },
        update: (cache, { data }) => {
          const updatedComment = data?.likeComment || data?.unlikeComment
          if (updatedComment) {
            // Update the comment in the cache
            cache.modify({
              id: cache.identify({ __typename: 'Comment', id: commentId }),
              fields: {
                likes: () => updatedComment.likes,
                likesCount: () => updatedComment.likesCount,
                hasLiked: () => updatedComment.hasLiked,
                likedBy: () => updatedComment.likedBy
              }
            })
          }
        }
      })
    } catch (error) {
      console.error("Error liking/unliking comment:", error)
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive"
      })
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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !commentingOn) return

    try {
      const { data } = await createComment({
        variables: {
          input: {
            message: comment,
            feedbackId: commentingOn.id,
            attachments: []
          }
        }
      })

      // Add to the beginning of comments array
      if (data?.createComment) {
        issue.comments.unshift(data.createComment)
      }

      // Reset form
      setComment("")
      setCommentingOn(null)

      toast({
        title: "Comment submitted",
        description: "Your comment has been added to the conversation",
      })
    } catch (error) {
      console.error("Error creating comment:", error)
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleLikeFeedback = async () => {
    try {
      if (issue.hasLiked) {
        const { data } = await unlikeFeedback({
          variables: { id: issue.id },
          update: (cache, { data }) => {
            const updatedFeedback = data?.unlikeFeedback
            if (updatedFeedback) {
              cache.modify({
                id: cache.identify({ __typename: 'Feedback', id: issue.id }),
                fields: {
                  likes: () => updatedFeedback.likes,
                  likesCount: () => updatedFeedback.likesCount,
                  hasLiked: () => updatedFeedback.hasLiked,
                  likedBy: () => updatedFeedback.likedBy
                }
              })
            }
          }
        })
      } else {
        const { data } = await likeFeedback({
          variables: { id: issue.id },
          update: (cache, { data }) => {
            const updatedFeedback = data?.likeFeedback
            if (updatedFeedback) {
              cache.modify({
                id: cache.identify({ __typename: 'Feedback', id: issue.id }),
                fields: {
                  likes: () => updatedFeedback.likes,
                  likesCount: () => updatedFeedback.likesCount,
                  hasLiked: () => updatedFeedback.hasLiked,
                  likedBy: () => updatedFeedback.likedBy
                }
              })
            }
          }
        })
      }
    } catch (error: any) {
      console.error("Error liking/unliking feedback:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update like status. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Convert existing comments and responses to chat messages
  const chatMessages = [
    ...(issue?.responses[0] ? [{
      id: issue.responses[0].id,
      content: issue.responses[0].message,
      timestamp: issue.responses[0].createdAt,
      author: {
        name: issue.responses[0].by.username || "Unknown",
        type: "agency" as "agency" | "admin" | "citizen",
      },
      isResponse: true,
      attachments: issue.responses[0].attachments,
    }] : []),
    ...(issue?.comments || []).map(comment => ({
      id: comment.id,
      content: comment.message,
      timestamp: comment.createdAt,
      author: {
        name: comment.authorName,
        type: (comment.author.id === user?.id ? "admin" : "citizen") as "agency" | "admin" | "citizen",
        avatar: comment.author.profileUrl || "/placeholder.svg",
      },
      isResponse: comment.author.id === user?.id,
    })),
  ]

  const formatTime = (dateString: string) => {
    try {
      // Handle MongoDB timestamp (milliseconds since epoch)
      const timestamp = parseInt(dateString)
      if (!isNaN(timestamp)) {
        const date = new Date(timestamp)
        return formatDistanceToNow(date)
      }
      
      // Fallback to regular date parsing
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Unknown time"
      }
      return formatDistanceToNow(date)
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Unknown time"
    }
  }

  const isComplaint = issue?.type?.toLowerCase() === "complaint"
  const hasResponse = issue?.responses.length > 0
  const isAuthor = issue?.author?.id === user?.id

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <Button variant="ghost" className="w-fit" onClick={() => router.push("/user/issues")}>
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
                  {issue.subcategory && <Badge variant="outline">{issue.subcategory}</Badge>}
                </div>
                <CardTitle className="text-2xl">{issue.title}</CardTitle>
                <CardDescription>
                  Ticket #{issue.ticketId} • Submitted {formatTime(issue.createdAt)}
                  {isComplaint && !hasResponse && (
                    <span className="ml-2 text-destructive">• Not responded yet</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p>{issue.description}</p>

                  {issue.attachments.length > 0 && (
                    <div className="mt-4">
                      <h3 className="mb-2 text-sm font-medium">Attachments</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {issue.attachments.map((attachment, index) => (
                          <div 
                            key={index} 
                            className="relative aspect-square overflow-hidden rounded-md border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedImage(attachment)}
                          >
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
                          <AvatarImage src={issue.author?.profileUrl || "/placeholder.svg"} alt={issue.author?.username || "User"} />
                          <AvatarFallback>
                            {issue.author?.firstName?.charAt(0) || issue.author?.username?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {issue.author?.id === user?.id ? "You" : 
                              issue.author?.firstName && issue.author?.lastName
                                ? `${issue.author.firstName} ${issue.author.lastName}`
                                : issue.author?.username || "Unknown"}
                          </p>
                          {issue.location && (
                            <p className="text-xs text-muted-foreground">
                              {issue.location.sector}, {issue.location.district}
                            </p>
                          )}
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
                        <span className="hidden sm:inline">Comment</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-1 ${issue.hasLiked ? 'text-blue-500' : ''}`}
                      onClick={handleLikeFeedback}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{issue.likesCount || 0}</span>
                    </Button>
                    {!isResolved && !isAuthor && (
                      <Button 
                        variant={isFollowing ? "default" : "outline"} 
                        size="sm" 
                        className="flex items-center gap-1" 
                        onClick={toggleFollow}
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
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                {issue.comments.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-sm font-medium">Comments</h3>
                    {issue.comments
                      .slice(0, showComments ? undefined : 1)
                      .map(comment => (
                        <div key={comment.id} className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.author.profileUrl || "/placeholder.svg"} alt={comment.author.username || "User"} />
                              <AvatarFallback>
                                {comment.author.firstName?.charAt(0) || comment.author.username?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {comment.author.id === user?.id ? "You" : comment.authorName}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {comment.author.id === user?.id ? "You" : "Citizen"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm">{comment.message}</p>
                              <div className="flex items-center gap-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`flex items-center gap-1 ${comment.hasLiked ? 'text-blue-500' : ''}`}
                                  onClick={() => handleLikeComment(comment.id)}
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                  <span>{comment.likesCount || 0}</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    {issue.comments.length > 1 && (
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
                            View {issue.comments.length - 1} more comments
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {/* Response Section */}
                {issue.responses.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-sm font-medium">Official Response</h3>
                    {issue.responses.map(response => (
                      <div key={response.id} className="rounded-lg border bg-muted/50 p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={response.by.profileUrl || "/placeholder.svg"} alt={response.by.username || "User"} />
                              <AvatarFallback>
                                {response.by.firstName?.charAt(0) || response.by.username?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {response.by.id === user?.id ? "You" :
                                  response.by.firstName && response.by.lastName
                                    ? `${response.by.firstName} ${response.by.lastName}`
                                    : response.by.username || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(response.createdAt)}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">Official Response</Badge>
                        </div>
                        <p className="text-sm">{response.message}</p>
                        {response.attachments.length > 0 && (
                          <div className="mt-4">
                            <h4 className="mb-2 text-xs font-medium">Response Attachments</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              {response.attachments.map((attachment, index) => (
                                <div 
                                  key={index} 
                                  className="relative aspect-square overflow-hidden rounded-md border cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setSelectedImage(attachment)}
                                >
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
                        </div>
                      </div>
                    ))}
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
                  {issue.assignedTo && (
                    <div className="flex justify-between">
                      <span className="text-sm">Assigned To</span>
                      <span className="text-sm font-medium">
                        {issue.assignedTo.id === user?.id ? "You" :
                          issue.assignedTo.firstName && issue.assignedTo.lastName
                            ? `${issue.assignedTo.firstName} ${issue.assignedTo.lastName}`
                            : issue.assignedTo.username || "Unknown"}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm">Followers</span>
                    <span className="text-sm font-medium">{issue?.followerCount || 0}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Status History</h3>
                  <div className="space-y-3">
                    {issue.responses.map((response, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{response.statusUpdate}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(response.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {issue.location && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        {Object.entries(issue.location)
                          .filter(([key, value]) => 
                            key !== '__typename' && 
                            value && 
                            value.trim() !== ''
                          )
                          .map(([key, value], index, array) => {
                            // If only one field is available, show it without label
                            if (array.length === 1) {
                              return (
                                <p key={key} className="text-sm">
                                  {value}
                                </p>
                              )
                            }
                            // Otherwise show with label
                            return (
                              <p key={key} className="text-sm">
                                <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> {value}
                              </p>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          <DialogTitle className="sr-only">Enlarged Image View</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          {selectedImage && (
            <div className="relative aspect-auto max-h-[80vh] w-full">
              <img
                src={selectedImage}
                alt="Enlarged attachment"
                className="h-full w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
