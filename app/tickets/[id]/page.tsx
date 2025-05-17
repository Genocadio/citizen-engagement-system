/**
 * @fileoverview Ticket detail page component that displays comprehensive information about a user's ticket.
 * This page provides a detailed view of a ticket including its status, official response,
 * comments, and rating functionality.
 */

"use client"

import type React from "react"
import { use } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getFeedbackById } from "@/lib/data"
import { formatDistanceToNow } from "@/lib/utils"
import { ArrowLeft, MapPin, MessageSquare, Star } from "lucide-react"

/**
 * Ticket detail page component that displays comprehensive information about a user's ticket.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Promise<{ id: string }>} props.params - Route parameters containing the ticket ID
 * @returns {JSX.Element} A detailed view of the ticket with the following features:
 * - Ticket status and metadata
 * - Official response section
 * - Comments and communication history
 * - Response rating system
 * - Location information
 * - Contact details
 * 
 * @example
 * ```tsx
 * <TicketPage params={Promise.resolve({ id: "ticket-123" })} />
 * ```
 * 
 * @note
 * - Requires user authentication
 * - Supports file attachments
 * - Includes response rating for resolved tickets
 * - Handles anonymous submissions
 * - Provides contact information visibility control
 */
export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [comment, setComment] = useState("")
  const [rating, setRating] = useState<number | null>(null)

  const ticket = getFeedbackById(use(params).id)

  if (!ticket) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Ticket not found</CardTitle>
            <CardDescription>The ticket you are looking for does not exist or has been removed.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container flex flex-col items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Please sign in to view your ticket details.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/")}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    toast({
      title: "Comment submitted",
      description: "Your comment has been added to the ticket",
    })

    setComment("")
  }

  const handleRating = (value: number) => {
    setRating(value)

    toast({
      title: "Thank you for your feedback",
      description: `You rated this response ${value} out of 5 stars`,
    })
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <Button variant="ghost" className="w-fit" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      ticket.status === "Open"
                        ? "status_open"
                        : ticket.status === "In Progress"
                          ? "status_in_progress"
                          : "status_resolved"
                    }
                  >
                    {ticket.status}
                  </Badge>
                  <Badge variant="outline">{ticket.type}</Badge>
                  <Badge variant="outline">{ticket.category}</Badge>
                </div>
                <CardTitle className="text-2xl">{ticket.title}</CardTitle>
                <CardDescription>
                  Ticket #{ticket.ticketNumber} • Submitted {formatDistanceToNow(new Date(ticket.submittedAt))}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p>{ticket.description}</p>

                  {ticket.attachments.length > 0 && (
                    <div className="mt-4">
                      <h3 className="mb-2 text-sm font-medium">Attachments</h3>
                      <div className="flex flex-wrap gap-2">
                        {ticket.attachments.map((attachment, index) => (
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
              </CardContent>
            </Card>

            {ticket.response && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Official Response</CardTitle>
                  <CardDescription>
                    From {ticket.assignedAgency} • {formatDistanceToNow(new Date(ticket.response.timestamp))}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{ticket.response.message}</p>

                  {ticket.response.attachments.length > 0 && (
                    <div className="mt-4">
                      <h3 className="mb-2 text-sm font-medium">Attachments</h3>
                      <div className="flex flex-wrap gap-2">
                        {ticket.response.attachments.map((attachment, index) => (
                          <div key={index} className="relative h-24 w-24 overflow-hidden rounded-md border">
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

                  {(ticket.status === "Resolved" || ticket.status === "Closed") && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Rate this response</h3>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Button
                            key={value}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleRating(value)}
                          >
                            <Star
                              className={`h-5 w-5 ${
                                (rating || ticket.rating || 0) >= value
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                            <span className="sr-only">{value} stars</span>
                          </Button>
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {rating || ticket.rating || 0} out of 5
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comments ({ticket.comments.length})</CardTitle>
                <CardDescription>Communication history for this ticket</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.comments.length === 0 ? (
                  <p className="text-center text-muted-foreground">No comments yet</p>
                ) : (
                  ticket.comments.map((comment) => (
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
                        </div>
                      </div>
                      <Separator />
                    </div>
                  ))
                )}

                {ticket.status !== "Closed" && (
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <Textarea
                      placeholder="Add a comment or ask a question..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button type="submit" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Post Comment
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ticket Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Current Status</span>
                    <Badge
                      variant={
                        ticket.status === "Open"
                          ? "status_open"
                          : ticket.status === "In Progress"
                            ? "status_in_progress"
                            : "status_resolved"
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Assigned To</span>
                    <span className="text-sm font-medium">{ticket.assignedAgency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Visibility</span>
                    <Badge variant="outline">{ticket.isPublic ? "Public" : "Private"}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Anonymity</span>
                    <Badge variant="outline">{ticket.isAnonymous ? "Anonymous" : "Named"}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Status History</h3>
                  <div className="space-y-3">
                    {ticket.statusHistory.map((history, index) => (
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
                        <span className="font-medium">Country:</span> {ticket.location.country}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Province/State:</span> {ticket.location.province}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">District:</span> {ticket.location.district}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Sector:</span> {ticket.location.sector}
                      </p>
                      {ticket.location.otherDetails && (
                        <p className="text-sm">
                          <span className="font-medium">Details:</span> {ticket.location.otherDetails}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Name</span>
                    <span className="text-sm font-medium">{ticket.citizenName || "Anonymous"}</span>
                  </div>
                  {!ticket.isAnonymous && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm">Email</span>
                        <span className="text-sm font-medium">{ticket.email}</span>
                      </div>
                      {ticket.phone && (
                        <div className="flex justify-between">
                          <span className="text-sm">Phone</span>
                          <span className="text-sm font-medium">{ticket.phone}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
