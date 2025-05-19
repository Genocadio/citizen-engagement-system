export type AdminRole = "global" | "category"
export type UserRole = "admin" | "user"

export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminRole
  assignedCategories?: string[]
  avatar?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  createdAt: Date
  lastActive: Date
  status: "active" | "inactive" | "suspended"
  feedbackCount: number
  responseCount: number
  location?: {
    province: string
    district: string
    sector: string
  }
}

export type FeedbackStatus = 'open' | 'in-progress' | 'resolved' | 'closed'
export type FeedbackCategory = "infrastructure" | "public-services" | "safety" | "environment" | "other"
export type FeedbackPriority = "low" | "medium" | "high" | "critical"

export interface FeedbackResponse {
  id: string
  feedbackId: string
  responderId: string
  responderName: string
  responderRole: AdminRole
  content: string
  createdAt: Date
  isPublic: boolean
}

export interface FeedbackComment {
  id: string
  feedbackId: string
  userId: string
  userName: string
  userRole: "citizen" | "admin"
  content: string
  createdAt: Date
  likes: number
  likedBy: string[]
  replies: FeedbackCommentReply[]
}

export interface FeedbackCommentReply {
  id: string
  commentId: string
  userId: string
  userName: string
  userRole: "citizen" | "admin"
  content: string
  createdAt: Date
  likes: number
  likedBy: string[]
}

export interface AdminFeedback {
  id: string
  title: string
  description: string
  category: FeedbackCategory
  status: FeedbackStatus
  priority: FeedbackPriority
  createdAt: Date
  updatedAt: Date
  userId: string
  userName: string
  userContact?: string
  isAnonymous: boolean
  location?: {
    province: string
    district: string
    sector: string
    cell?: string
  }
  responses: FeedbackResponse[]
  comments: FeedbackComment[]
  viewCount: number
  upvotes: number
}

export interface DashboardStats {
  totalFeedback: number
  newFeedback: number
  resolvedFeedback: number
  pendingFeedback: number
  feedbackByCategory: Record<FeedbackCategory, number>
  feedbackByStatus: Record<FeedbackStatus, number>
  feedbackByPriority: Record<FeedbackPriority, number>
  responseRate: number
  averageResponseTime: number // in hours
}

export interface UserActivity {
  id: string
  userId: string
  type: "feedback" | "comment" | "response" | "login" | "profile_update"
  timestamp: Date
  details: string
  relatedItemId?: string
}
