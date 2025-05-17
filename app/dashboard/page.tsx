/**
 * @fileoverview Dashboard page component that displays user's feedback submissions and their status.
 * This page provides a personalized view of submitted issues, their current status,
 * and responses received.
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { getUserFeedback } from "@/lib/data"
import { formatDistanceToNow } from "@/lib/utils"
import { AlertCircle, CheckCircle, Clock, Plus, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

  // Get user feedback if user is logged in
  const userFeedback = user ? getUserFeedback(user.id) : []

  // Filter feedback based on status
  const filteredFeedback =
    filter === "all"
      ? userFeedback
      : userFeedback.filter((feedback) => feedback.status.toLowerCase() === filter.toLowerCase())

  // Count by status
  const openCount = userFeedback.filter((feedback) => feedback.status === "Open").length
  const inProgressCount = userFeedback.filter((feedback) => feedback.status === "In Progress").length
  const resolvedCount = userFeedback.filter(
    (feedback) => feedback.status === "Resolved" || feedback.status === "Closed",
  ).length

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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">Track and manage your feedback submissions</p>
          </div>
          <Button asChild>
            <Link href="/submit" className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Submit New Feedback
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressCount}</div>
              <p className="text-xs text-muted-foreground">Being addressed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolvedCount}</div>
              <p className="text-xs text-muted-foreground">Successfully addressed</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <CardTitle>My Tickets</CardTitle>
                <CardDescription>View and manage your submitted feedback</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-[140px] justify-between">
                      {filter === "all" ? "All Status" : filter}
                      <ChevronDown className="h-4 w-4" />
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
              {filteredFeedback.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">No tickets found</p>
                  <Button asChild className="mt-4">
                    <Link href="/submit">Submit Feedback</Link>
                  </Button>
                </div>
              ) : (
                filteredFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/tickets/${feedback.id}`)}
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
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
                            {formatDistanceToNow(new Date(feedback.submittedAt))}
                          </span>
                        </div>
                        <h3 className="font-semibold">{feedback.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Ticket #{feedback.ticketNumber} • {feedback.category} • {feedback.subcategory}
                        </p>
                      </div>
                    </div>

                    {feedback.response && (
                      <div className="mt-4 rounded-lg bg-muted p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium">Latest Response</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(feedback.response.timestamp))}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{feedback.response.message}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
