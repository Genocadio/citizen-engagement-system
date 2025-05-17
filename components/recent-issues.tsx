"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecentIssues } from "@/lib/data"
import { IssueCard } from "@/components/issue-card"

export function RecentIssues() {
  const issues = getRecentIssues()

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  )
}
