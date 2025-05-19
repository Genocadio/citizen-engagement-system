"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle, Clock, Eye, Filter, MessageSquare, Search, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { canManageFeedback, getCurrentAdmin } from "@/lib/admin-mock-data"
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
import { Feedback, FeedbackType } from "@/lib/data"
import { useFeedbackPagination } from "@/lib/hooks/use-feedback-pagination"
import { useAuth } from "@/lib/auth-context"

const ITEMS_PER_PAGE = 10

interface FeedbackItem {
  id: string
  title: string
  description: string
  category: FeedbackCategory
  status: FeedbackStatus
  type: FeedbackType
  createdAt: string
  ticketId: string
  likes: number
  responses: { id: string }[]
  viewCount?: number
}

export default function FeedbackPage() {
  const { user } = useAuth()
  const currentAdmin = getCurrentAdmin()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>(user?.category || "all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const { feedbacks, loading, error, hasMore, loadMoreRef } = useFeedbackPagination({
    category: categoryFilter,
    status: statusFilter,
    type: typeFilter,
    isAdmin: true
  })

  const resetFilters = () => {
    setSearchQuery("")
    setCategoryFilter(user?.category || "all")
    setStatusFilter("all")
    setTypeFilter("all")
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "status_open"
      case "in progress":
        return "status_in_progress"
      case "resolved":
        return "status_resolved"
      case "closed":
        return "status_closed"
      default:
        return "outline"
    }
  }

  // Filter feedback based on search query
  const filteredFeedback = feedbacks.filter((item: FeedbackItem) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ticketId.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback Management</h1>
        <p className="text-muted-foreground">View and manage citizen feedback</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Narrow down feedback by specific criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or description..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {user?.category === 'all' && (
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback List</CardTitle>
          <CardDescription>
            {filteredFeedback.length} {filteredFeedback.length === 1 ? "item" : "items"} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Stats</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-destructive">
                      Error loading feedback. Please try again later.
                    </TableCell>
                  </TableRow>
                ) : filteredFeedback.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No feedback found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedback.map((item: FeedbackItem) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px] md:max-w-[300px]">
                          {item.description.substring(0, 60)}...
                        </div>
                        <div className="md:hidden flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className={getCategoryColor(item.category)}>
                          {item.category.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={getStatusBadgeVariant(item.status)}>
                          {item.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {formatDate(new Date(parseInt(item.createdAt)))}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                        
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{item.likes}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            <span>{item.responses.length}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/feedback/${item.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow>
                  <TableCell colSpan={7} ref={loadMoreRef}>
                    {loading && (
                      <div className="flex justify-center py-4">
                        <p className="text-muted-foreground">Loading more feedback...</p>
                      </div>
                    )}
                    {!loading && !hasMore && filteredFeedback.length > 0 && (
                      <div className="flex justify-center py-4">
                        <p className="text-muted-foreground">No more feedback to load</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
