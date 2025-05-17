"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { IssueCard } from "@/components/issue-card"
import { usePublicFeedbacks } from "@/lib/hooks/use-public-feedbacks"
import { useAuth } from "@/lib/auth-context"

export function RecentIssues() {
  const { user } = useAuth()
  const { feedbacks, loading, error } = usePublicFeedbacks({ limit: 5 })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-destructive">Error loading recent issues. Please try again later.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <p className="text-muted-foreground">Loading recent issues...</p>
      </div>
    )
  }

  if (feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">No recent issues found</p>
        <Button asChild className="mt-4">
          <Link href="/submit">Submit an Issue</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((issue) => (
        <IssueCard 
          key={issue.id} 
          issue={issue} 
          currentUserId={user?.id}
        />
      ))}
    </div>
  )
}
