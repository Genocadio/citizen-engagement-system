"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { use } from "react"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Heart,
  MapPin,
  MessageSquare,
  Reply,
  Send,
  ThumbsUp,
  User,
  UserPlus,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  categoryOptions,
  formatDate,
  getCategoryColor,
  getPriorityColor,
  getStatusColor,
  priorityOptions,
  statusOptions,
} from "@/lib/admin-utils"
import type { FeedbackCategory, FeedbackPriority, FeedbackStatus } from "@/lib/admin-types"
import { useQuery, useMutation, useApolloClient } from "@apollo/client"
import { GET_FEEDBACK_BY_ID } from "@/lib/graphql/queries"
import {
  CREATE_COMMENT,
  LIKE_COMMENT,
  UNLIKE_COMMENT,
  CREATE_RESPONSE,
  UPDATE_FEEDBACK,
  UPDATE_FEEDBACK_STATUS,
  LIKE_FEEDBACK,
  UNLIKE_FEEDBACK,
} from "@/lib/graphql/mutations"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { formatDistanceToNow } from "@/lib/utils"

// Add TypeScript interfaces for our data
interface User {
  id: string
  firstName?: string
  lastName?: string
  username?: string
  profileUrl?: string
  role: string
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
  replies?: Comment[]
}

interface Response {
  id: string
  message: string
  by: User
  statusUpdate: string
  attachments: string[]
  likes: number
  likesCount: number
  hasLiked: boolean
  likedBy: string[]
  createdAt: string
  updatedAt: string
}

interface Location {
  country: string
  province: string
  district: string
  sector: string
  otherDetails?: string
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
  priority: string
  author?: User
  assignedTo?: User
  attachments: string[]
  chatEnabled: boolean
  comments: Comment[]
  responses: Response[]
  likes: number
  likesCount: number
  hasLiked: boolean
  likedBy: string[]
  followers: string[]
  followerCount: number
  isFollowing: boolean
  isAnonymous: boolean
  location?: Location
  createdAt: string
  updatedAt: string
}

export default function FeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const client = useApolloClient()
  const resolvedParams = use(params)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [responseText, setResponseText] = useState("")
  const [isPublicResponse, setIsPublicResponse] = useState(true)
  const [status, setStatus] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [priority, setPriority] = useState<string>("")
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const canManage = user?.role === "admin" || user?.role === "SUPER_ADMIN"

  const { data, loading, error, refetch } = useQuery(GET_FEEDBACK_BY_ID, {
    variables: { id: resolvedParams.id },
    fetchPolicy: "cache-and-network",
  })
  const feedback = data?.feedback

  const [createComment] = useMutation(CREATE_COMMENT)
  const [likeComment] = useMutation(LIKE_COMMENT)
  const [unlikeComment] = useMutation(UNLIKE_COMMENT)
  const [createResponse] = useMutation(CREATE_RESPONSE)
  const [updateFeedback] = useMutation(UPDATE_FEEDBACK)
  const [updateFeedbackStatus] = useMutation(UPDATE_FEEDBACK_STATUS)
  const [likeFeedback] = useMutation(LIKE_FEEDBACK)
  const [unlikeFeedback] = useMutation(UNLIKE_FEEDBACK)

  if (!feedback) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold">Feedback not found</h2>
        <p className="text-muted-foreground mb-4">The feedback you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/admin/feedback")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Feedback List
        </Button>
      </div>
    )
  }

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !user) return

    try {
      await createResponse({
        variables: {
          input: {
            feedbackId: feedback.id,
            message: responseText,
            statusUpdate: status || feedback.status,
            attachments: []
          }
        }
      })
      setResponseText("")
      setStatus("") // Reset status after successful response
      refetch()
      toast({
        title: "Success",
        description: "Response added successfully",
      })
    } catch (error) {
      console.error("Error creating response:", error)
      toast({
        title: "Error",
        description: "Failed to add response",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async () => {
    if (!status || !user) return

    try {
      const { data: updateData } = await updateFeedbackStatus({
        variables: {
          id: feedback.id,
          status: status
        }
      })

      if (updateData?.updateFeedbackStatus) {
        refetch()
        toast({
          title: "Success",
          description: "Status updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating feedback status:", error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push("/admin/feedback")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Feedback Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{feedback.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3" />
                    Submitted {formatDistanceToNow(new Date(parseInt(feedback.createdAt)))}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge variant="outline" className={getCategoryColor(feedback.category)}>
                    {feedback.category.replace("-", " ")}
                  </Badge>
                  <Badge
                    variant={
                      feedback.status === "open"
                        ? "status_open"
                        : feedback.status === "in-progress"
                          ? "status_in_progress"
                          : feedback.status === "resolved"
                            ? "status_resolved"
                            : "status_closed"
                    }
                  >
                    {feedback.status.replace("-", " ")}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(feedback.priority)}>
                    {feedback.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{feedback.description}</p>

              {feedback.location && (
                <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <div>
                    {feedback.location.province && <p>Province: {feedback.location.province}</p>}
                    {feedback.location.district && <p>District: {feedback.location.district}</p>}
                    {feedback.location.sector && <p>Sector: {feedback.location.sector}</p>}
                    {feedback.location.otherDetails && <p>Details: {feedback.location.otherDetails}</p>}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{feedback.likesCount || 0} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserPlus className="h-4 w-4" />
                  <span>{feedback.followerCount || 0} followers</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="responses">
            <TabsList>
              <TabsTrigger value="responses">Official Responses</TabsTrigger>
              <TabsTrigger value="comments">Public Comments ({feedback.comments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="responses" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Official Responses</CardTitle>
                  <CardDescription>
                    {feedback.responses.length} {feedback.responses.length === 1 ? "response" : "responses"} to this
                    feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {feedback.responses.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No official responses yet</p>
                  ) : (
                    feedback.responses.map((response: Response) => (
                      <div key={response.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{response.by.firstName?.charAt(0) || response.by.username?.charAt(0) || "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{response.by.firstName || response.by.username || "Unknown User"}</div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {response.by.role} Admin
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">
                              {response.statusUpdate}
                            </Badge>
                            <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(parseInt(response.createdAt)))}</div>
                          </div>
                        </div>
                        <p className="whitespace-pre-line">{response.message}</p>
                      </div>
                    ))
                  )}

                  {canManage && (
                    <div className="rounded-lg border p-4">
                      <div className="mb-4">
                        <div className="mb-2 font-medium">Add Official Response</div>
                        <div className="grid gap-4">
                          <Textarea
                            placeholder="Type your official response here..."
                            className="mb-2"
                            rows={4}
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Switch
                                id="public-response"
                                checked={isPublicResponse}
                                onCheckedChange={setIsPublicResponse}
                              />
                              <Label htmlFor="public-response">Make response public</Label>
                            </div>
                            <div className="flex gap-2">
                              {status && (
                                <Button 
                                  variant="outline" 
                                  onClick={handleUpdateStatus}
                                >
                                  Update Status Only
                                </Button>
                              )}
                              <Button 
                                onClick={handleSubmitResponse} 
                                disabled={!responseText.trim()}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Send Response
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Public Comments</CardTitle>
                  <CardDescription>
                    {feedback.comments.length} {feedback.comments.length === 1 ? "comment" : "comments"} on this
                    feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {feedback.comments.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No comments yet</p>
                  ) : (
                    feedback.comments.map((comment: Comment) => (
                      <div key={comment.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{comment.author.firstName?.charAt(0) || comment.author.username?.charAt(0) || "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{comment.author.firstName || comment.author.username || "Unknown User"}</div>
                              <div className="text-xs text-muted-foreground capitalize">{comment.author.role}</div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(parseInt(comment.createdAt)))}</div>
                        </div>

                        <p className="whitespace-pre-line mb-3">{comment.message}</p>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{comment.likesCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submitter Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {feedback.isAnonymous ? "A" : feedback.author?.firstName?.charAt(0) || feedback.author?.username?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium flex items-center gap-1">
                    {feedback.isAnonymous ? "Anonymous User" : 
                      `${feedback.author?.firstName || ""} ${feedback.author?.lastName || ""}`.trim() || 
                      feedback.author?.username || "Unknown User"}
                    {feedback.isAnonymous && (
                      <Badge variant="outline" className="ml-1">
                        Anonymous
                      </Badge>
                    )}
                  </div>
                  {!feedback.isAnonymous && feedback.author?.phoneNumber && (
                    <div className="text-sm text-muted-foreground">{feedback.author.phoneNumber}</div>
                  )}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {!feedback.isAnonymous && (
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4" />
                    <span>User ID: {feedback.author?.id}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Submitted: {formatDistanceToNow(new Date(parseInt(feedback.createdAt)))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle>Manage Feedback</CardTitle>
                <CardDescription>Update status and categorization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as FeedbackStatus)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value as FeedbackCategory)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(value) => setPriority(value as FeedbackPriority)}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpdateStatus} className="w-full">
                  Update Feedback
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Created */}
                <div className="flex gap-3">
                  <div className="relative flex h-full w-6 items-center justify-center">
                    <div className="h-full w-px bg-border" />
                    <div className="absolute h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">Feedback Created</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(parseInt(feedback.createdAt)))}</p>
                  </div>
                </div>

                {/* Responses */}
                {feedback.responses.map((response: Response, index: number) => (
                  <div key={response.id} className="flex gap-3">
                    <div className="relative flex h-full w-6 items-center justify-center">
                      <div className="h-full w-px bg-border" />
                      <div className="absolute h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium">
                        Response Added
                      </p>
                      <p className="text-xs text-muted-foreground">
                        By {response.by.firstName || response.by.username || "Unknown User"} • {formatDistanceToNow(new Date(parseInt(response.createdAt)))}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Status changes would go here in a real app */}

                {/* Last updated */}
                <div className="flex gap-3">
                  <div className="relative flex h-full w-6 items-center justify-center">
                    <div className="absolute h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(parseInt(feedback.updatedAt)))}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
