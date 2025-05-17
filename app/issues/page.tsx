/**
 * @fileoverview Issues page component that displays and filters public issues.
 * This page provides a searchable and filterable interface for browsing community
 * concerns and issues.
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getPublicIssues, categories } from "@/lib/data"
import { Search, ChevronDown } from "lucide-react"
import { IssueCard } from "@/components/issue-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Issues page component that displays a list of public issues with filtering capabilities.
 * 
 * @component
 * @returns {JSX.Element} A page with the following features:
 * - Search functionality for issues
 * - Status filter (All, Open, In Progress, Resolved)
 * - Category filter with dynamic options
 * - List of filtered issues using IssueCard components
 * - Empty state handling with call-to-action
 * 
 * @example
 * ```tsx
 * <IssuesPage />
 * ```
 * 
 * @note
 * - Implements client-side filtering
 * - Uses dropdown menus for filter selection
 * - Provides responsive design for different screen sizes
 * - Integrates with the IssueCard component for consistent issue display
 */
export default function IssuesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const issues = getPublicIssues()

  /**
   * Filters issues based on search query, category, and status.
   * 
   * @type {Array<Feedback>}
   * @property {string} searchQuery - Text to search in issue title and description
   * @property {string} categoryFilter - Selected category to filter by
   * @property {string} statusFilter - Selected status to filter by
   * @returns {Array<Feedback>} Filtered list of issues matching all criteria
   */
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      searchQuery === "" ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter
    const matchesStatus = statusFilter === "all" || issue.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Public Issues</h1>
          <p className="text-muted-foreground">Browse, follow, and engage with community concerns</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-between">
                    {statusFilter === "all" ? "All Status" : statusFilter}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("open")}>Open</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("in progress")}>In Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("resolved")}>Resolved</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-between">
                    {categoryFilter === "all" ? "All Categories" : categoryFilter}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setCategoryFilter("all")}>All Categories</DropdownMenuItem>
                  {categories.map((category) => (
                    <DropdownMenuItem key={category} onClick={() => setCategoryFilter(category)}>
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" asChild>
                <Link href="/submit">Submit New Issue</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Issues ({filteredIssues.length})</CardTitle>
                <CardDescription>Browse through public issues submitted by citizens</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredIssues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground">No issues found matching your criteria</p>
                    <Button asChild className="mt-4">
                      <Link href="/submit">Submit an Issue</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredIssues.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
