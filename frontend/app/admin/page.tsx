'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentAdmin } from "@/lib/admin-mock-data"
import { AlertCircle, CheckCircle, Clock, FileText } from "lucide-react"
import { useQuery } from "@apollo/client"
import { GET_FEEDBACK_STATS } from "@/lib/graphql/queries"

interface FeedbackCategoryStats {
  infrastructure: number
  publicServices: number
  safety: number
  environment: number
  other: number
}

interface FeedbackStatusStats {
  new: number
  inProgress: number
  answered: number
  closed: number
}

interface FeedbackPriorityStats {
  low: number
  medium: number
  high: number
  critical: number
}

interface FeedbackStats {
  totalFeedback: number
  newFeedback: number
  resolvedFeedback: number
  pendingFeedback: number
  feedbackByCategory: FeedbackCategoryStats
  feedbackByStatus: FeedbackStatusStats
  feedbackByPriority: FeedbackPriorityStats
  responseRate: number
  averageResponseTime: number
}

interface FeedbackStatsData {
  feedbackStats: FeedbackStats
}

function DashboardContent() {
  const { data, loading, error } = useQuery<FeedbackStatsData>(GET_FEEDBACK_STATS)
  const stats = data?.feedbackStats

  if (loading) {
    return <div>Loading dashboard stats...</div>
  }

  if (error) {
    return <div>Error loading dashboard stats: {error.message}</div>
  }

  if (!stats) {
    return <div>No stats available</div>
  }

  // Filter out __typename from objects
  const cleanObject = (obj: Record<string, any>) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([key]) => key !== '__typename')
    )
  }

  const cleanStats = {
    ...stats,
    feedbackByCategory: cleanObject(stats.feedbackByCategory),
    feedbackByStatus: cleanObject(stats.feedbackByStatus),
    feedbackByPriority: cleanObject(stats.feedbackByPriority)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cleanStats.totalFeedback}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Feedback</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cleanStats.newFeedback}</div>
            <p className="text-xs text-muted-foreground">Awaiting initial response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cleanStats.pendingFeedback}</div>
            <p className="text-xs text-muted-foreground">Being addressed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cleanStats.resolvedFeedback}</div>
            <p className="text-xs text-muted-foreground">Successfully addressed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="category">
        <TabsList>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="status">By Status</TabsTrigger>
          <TabsTrigger value="priority">By Priority</TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback by Category</CardTitle>
              <CardDescription>Distribution of feedback across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(cleanStats.feedbackByCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center">
                    <div className="w-40 font-medium capitalize">{category.replace("-", " ")}</div>
                    <div className="flex-1">
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${(count / cleanStats.totalFeedback) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-10 text-right">{count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback by Status</CardTitle>
              <CardDescription>Current status of all feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(cleanStats.feedbackByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center">
                    <div className="w-40 font-medium capitalize">{status.replace("-", " ")}</div>
                    <div className="flex-1">
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${(count / cleanStats.totalFeedback) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-10 text-right">{count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback by Priority</CardTitle>
              <CardDescription>Distribution by urgency level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(cleanStats.feedbackByPriority).map(([priority, count]) => (
                  <div key={priority} className="flex items-center">
                    <div className="w-40 font-medium capitalize">{priority}</div>
                    <div className="flex-1">
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${(count / cleanStats.totalFeedback) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-10 text-right">{count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response Rate</CardTitle>
            <CardDescription>Percentage of feedback that has received a response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-8 border-primary/20">
                <div className="text-2xl font-bold">{cleanStats.responseRate}%</div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Target: 85%</p>
                <p className="text-sm text-muted-foreground">
                  {cleanStats.responseRate >= 85 ? "On target" : "Below target"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Response Time</CardTitle>
            <CardDescription>Average time to first response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-8 border-primary/20">
                <div className="text-2xl font-bold">{cleanStats.averageResponseTime}h</div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Target: 24 hours</p>
                <p className="text-sm text-muted-foreground">
                  {cleanStats.averageResponseTime <= 24 ? "On target" : "Below target"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const currentAdmin = getCurrentAdmin()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {currentAdmin.name}. Here's an overview of citizen feedback.
        </p>
      </div>

      <DashboardContent />
    </div>
  )
}
