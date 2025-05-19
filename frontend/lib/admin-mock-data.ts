import type {
  AdminFeedback,
  AdminUser,
  DashboardStats,
  FeedbackCategory,
  FeedbackComment,
  FeedbackCommentReply,
  FeedbackPriority,
  FeedbackResponse,
  FeedbackStatus,
  User,
  UserActivity,
} from "./admin-types"

// Mock admin users
export const adminUsers: AdminUser[] = [
  {
    id: "admin-1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "global",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "admin-2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "category",
    assignedCategories: ["infrastructure", "public-services"],
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "admin-3",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    role: "category",
    assignedCategories: ["safety", "environment"],
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Mock regular users
export const regularUsers: User[] = [
  {
    id: "user-1",
    name: "Alice Williams",
    email: "alice.williams@example.com",
    role: "user",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: new Date(2023, 1, 15),
    lastActive: new Date(2023, 5, 20),
    status: "active",
    feedbackCount: 8,
    responseCount: 0,
    location: {
      province: "Kigali",
      district: "Nyarugenge",
      sector: "Nyarugenge",
    },
  },
  {
    id: "user-2",
    name: "Bob Miller",
    email: "bob.miller@example.com",
    role: "user",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: new Date(2023, 2, 10),
    lastActive: new Date(2023, 5, 18),
    status: "active",
    feedbackCount: 5,
    responseCount: 0,
    location: {
      province: "Kigali",
      district: "Gasabo",
      sector: "Kimironko",
    },
  },
  {
    id: "user-3",
    name: "Carol Davis",
    email: "carol.davis@example.com",
    role: "user",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: new Date(2023, 3, 5),
    lastActive: new Date(2023, 5, 15),
    status: "inactive",
    feedbackCount: 2,
    responseCount: 0,
    location: {
      province: "Eastern",
      district: "Rwamagana",
      sector: "Munyaga",
    },
  },
  {
    id: "user-4",
    name: "David Wilson",
    email: "david.wilson@example.com",
    role: "user",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: new Date(2023, 4, 20),
    lastActive: new Date(2023, 5, 19),
    status: "active",
    feedbackCount: 3,
    responseCount: 0,
    location: {
      province: "Kigali",
      district: "Kicukiro",
      sector: "Niboye",
    },
  },
  {
    id: "user-5",
    name: "Eva Brown",
    email: "eva.brown@example.com",
    role: "user",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: new Date(2023, 0, 25),
    lastActive: new Date(2023, 5, 10),
    status: "suspended",
    feedbackCount: 12,
    responseCount: 0,
    location: {
      province: "Northern",
      district: "Musanze",
      sector: "Muhoza",
    },
  },
]

// Convert admin users to regular user format for combined list
const adminUsersConverted: User[] = adminUsers.map((admin) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  role: "admin",
  avatar: admin.avatar,
  createdAt: new Date(2023, 0, 1), // Admins created earlier
  lastActive: new Date(), // Admins are always active
  status: "active",
  feedbackCount: 0,
  responseCount: Math.floor(Math.random() * 20) + 5, // Random number of responses
  location: {
    province: "Kigali",
    district: "Nyarugenge",
    sector: "Nyarugenge",
  },
}))

// Combined list of all users
export const allUsers: User[] = [...adminUsersConverted, ...regularUsers]

// Mock user activities
export const userActivities: UserActivity[] = [
  {
    id: "activity-1",
    userId: "user-1",
    type: "feedback",
    timestamp: new Date(2023, 5, 20, 10, 15),
    details: "Submitted feedback about pothole on Main Street",
    relatedItemId: "feedback-1",
  },
  {
    id: "activity-2",
    userId: "user-2",
    type: "comment",
    timestamp: new Date(2023, 5, 18, 14, 30),
    details: "Commented on feedback about unsafe street crossing",
    relatedItemId: "comment-2",
  },
  {
    id: "activity-3",
    userId: "admin-1",
    type: "response",
    timestamp: new Date(2023, 5, 19, 9, 45),
    details: "Responded to feedback about pothole on Main Street",
    relatedItemId: "response-1",
  },
  {
    id: "activity-4",
    userId: "user-4",
    type: "login",
    timestamp: new Date(2023, 5, 19, 8, 0),
    details: "User logged in",
  },
  {
    id: "activity-5",
    userId: "admin-2",
    type: "response",
    timestamp: new Date(2023, 5, 18, 11, 20),
    details: "Responded to feedback about water supply issues",
    relatedItemId: "response-2",
  },
  {
    id: "activity-6",
    userId: "user-5",
    type: "profile_update",
    timestamp: new Date(2023, 5, 10, 16, 45),
    details: "Updated profile information",
  },
  {
    id: "activity-7",
    userId: "admin-3",
    type: "response",
    timestamp: new Date(2023, 5, 17, 13, 10),
    details: "Responded to feedback about illegal dumping",
    relatedItemId: "response-3",
  },
  {
    id: "activity-8",
    userId: "user-3",
    type: "feedback",
    timestamp: new Date(2023, 5, 15, 10, 30),
    details: "Submitted feedback about public bench request",
    relatedItemId: "feedback-5",
  },
]

// Mock feedback responses
export const feedbackResponses: FeedbackResponse[] = [
  {
    id: "response-1",
    feedbackId: "feedback-1",
    responderId: "admin-1",
    responderName: "John Doe",
    responderRole: "global",
    content:
      "Thank you for your feedback. We have forwarded this to the infrastructure department for immediate action.",
    createdAt: new Date(2023, 4, 15, 10, 30),
    isPublic: true,
  },
  {
    id: "response-2",
    feedbackId: "feedback-1",
    responderId: "admin-2",
    responderName: "Jane Smith",
    responderRole: "category",
    content: "The infrastructure team has scheduled repairs for next week. We appreciate your patience.",
    createdAt: new Date(2023, 4, 16, 14, 45),
    isPublic: true,
  },
  {
    id: "response-3",
    feedbackId: "feedback-2",
    responderId: "admin-3",
    responderName: "Robert Johnson",
    responderRole: "category",
    content: "We have dispatched a safety team to assess the situation. They should arrive within 24 hours.",
    createdAt: new Date(2023, 4, 17, 9, 15),
    isPublic: true,
  },
  {
    id: "response-4",
    feedbackId: "feedback-3",
    responderId: "admin-1",
    responderName: "John Doe",
    responderRole: "global",
    content:
      "Internal note: This issue requires coordination with the local environmental agency. Not for public view.",
    createdAt: new Date(2023, 4, 18, 11, 0),
    isPublic: false,
  },
]

// Mock feedback comment replies
export const feedbackCommentReplies: FeedbackCommentReply[] = [
  {
    id: "reply-1",
    commentId: "comment-1",
    userId: "admin-1",
    userName: "John Doe",
    userRole: "admin",
    content: "Thank you for providing additional details. This helps us address the issue more effectively.",
    createdAt: new Date(2023, 4, 15, 14, 30),
    likes: 2,
    likedBy: ["user-2", "user-5"],
  },
  {
    id: "reply-2",
    commentId: "comment-2",
    userId: "user-3",
    userName: "Citizen C",
    userRole: "citizen",
    content: "I've noticed the same issue in my neighborhood as well.",
    createdAt: new Date(2023, 4, 16, 9, 15),
    likes: 1,
    likedBy: ["user-4"],
  },
  {
    id: "reply-3",
    commentId: "comment-3",
    userId: "admin-2",
    userName: "Jane Smith",
    userRole: "admin",
    content: "We're working on improving this service. Your feedback is valuable to us.",
    createdAt: new Date(2023, 4, 17, 11, 45),
    likes: 3,
    likedBy: ["user-1", "user-2", "user-5"],
  },
]

// Mock feedback comments
export const feedbackComments: FeedbackComment[] = [
  {
    id: "comment-1",
    feedbackId: "feedback-1",
    userId: "user-2",
    userName: "Citizen B",
    userRole: "citizen",
    content: "I've noticed this pothole has been getting worse over the past month. It's now about 2 feet wide.",
    createdAt: new Date(2023, 4, 15, 12, 15),
    likes: 5,
    likedBy: ["user-3", "user-4", "user-5", "admin-1", "admin-2"],
    replies: [feedbackCommentReplies[0]],
  },
  {
    id: "comment-2",
    feedbackId: "feedback-2",
    userId: "user-4",
    userName: "Citizen D",
    userRole: "citizen",
    content: "This crossing is especially dangerous for children going to the nearby school.",
    createdAt: new Date(2023, 4, 16, 8, 30),
    likes: 7,
    likedBy: ["user-1", "user-2", "user-3", "user-5", "admin-1", "admin-2", "admin-3"],
    replies: [feedbackCommentReplies[1]],
  },
  {
    id: "comment-3",
    feedbackId: "feedback-4",
    userId: "user-5",
    userName: "Citizen E",
    userRole: "citizen",
    content: "The water supply has been unreliable for months now. We need a permanent solution.",
    createdAt: new Date(2023, 4, 18, 16, 20),
    likes: 4,
    likedBy: ["user-1", "user-2", "user-4", "admin-2"],
    replies: [feedbackCommentReplies[2]],
  },
  {
    id: "comment-4",
    feedbackId: "feedback-1",
    userId: "admin-2",
    userName: "Jane Smith",
    userRole: "admin",
    content: "We appreciate your detailed report. Our team will prioritize this repair.",
    createdAt: new Date(2023, 4, 15, 15, 45),
    likes: 3,
    likedBy: ["user-1", "user-2", "admin-1"],
    replies: [],
  },
]

// Mock admin feedback
export const adminFeedback: AdminFeedback[] = [
  {
    id: "feedback-1",
    title: "Pothole on Main Street",
    description:
      "There is a large pothole on Main Street near the central market that poses a danger to vehicles and pedestrians.",
    category: "infrastructure",
    status: "in-progress",
    priority: "high",
    createdAt: new Date(2023, 4, 15, 8, 0),
    updatedAt: new Date(2023, 4, 16, 14, 45),
    userId: "user-1",
    userName: "Citizen A",
    userContact: "citizena@example.com",
    isAnonymous: false,
    location: {
      province: "Kigali",
      district: "Nyarugenge",
      sector: "Nyarugenge",
      cell: "Biryogo",
    },
    responses: feedbackResponses.filter((r) => r.feedbackId === "feedback-1"),
    comments: feedbackComments.filter((c) => c.feedbackId === "feedback-1"),
    viewCount: 45,
    upvotes: 12,
  },
  {
    id: "feedback-2",
    title: "Unsafe Street Crossing",
    description:
      "The pedestrian crossing at the intersection of Park Avenue and River Road lacks proper signage and lighting, making it dangerous especially at night.",
    category: "safety",
    status: "new",
    priority: "critical",
    createdAt: new Date(2023, 4, 16, 15, 30),
    updatedAt: new Date(2023, 4, 16, 15, 30),
    userId: "user-2",
    userName: "Citizen B",
    userContact: "citizenb@example.com",
    isAnonymous: false,
    location: {
      province: "Kigali",
      district: "Gasabo",
      sector: "Kimironko",
      cell: "Kibagabaga",
    },
    responses: feedbackResponses.filter((r) => r.feedbackId === "feedback-2"),
    comments: feedbackComments.filter((c) => c.feedbackId === "feedback-2"),
    viewCount: 32,
    upvotes: 8,
  },
  {
    id: "feedback-3",
    title: "Illegal Dumping in Green Park",
    description:
      "There has been consistent illegal dumping of waste in Green Park over the past month, affecting the environment and public enjoyment of the space.",
    category: "environment",
    status: "new",
    priority: "medium",
    createdAt: new Date(2023, 4, 17, 9, 0),
    updatedAt: new Date(2023, 4, 17, 9, 0),
    userId: "user-3",
    userName: "Anonymous",
    isAnonymous: true,
    location: {
      province: "Eastern",
      district: "Rwamagana",
      sector: "Munyaga",
    },
    responses: feedbackResponses.filter((r) => r.feedbackId === "feedback-3"),
    comments: feedbackComments.filter((c) => c.feedbackId === "feedback-3"),
    viewCount: 18,
    upvotes: 5,
  },
  {
    id: "feedback-4",
    title: "Unreliable Water Supply",
    description:
      "Our neighborhood has been experiencing frequent water outages for the past two weeks without prior notice.",
    category: "public-services",
    status: "answered",
    priority: "high",
    createdAt: new Date(2023, 4, 18, 11, 45),
    updatedAt: new Date(2023, 4, 19, 14, 30),
    userId: "user-4",
    userName: "Citizen D",
    userContact: "citizend@example.com",
    isAnonymous: false,
    location: {
      province: "Kigali",
      district: "Kicukiro",
      sector: "Niboye",
      cell: "Gatare",
    },
    responses: [],
    comments: feedbackComments.filter((c) => c.feedbackId === "feedback-4"),
    viewCount: 27,
    upvotes: 15,
  },
  {
    id: "feedback-5",
    title: "Request for Public Bench",
    description:
      "The bus stop on Hill Road lacks seating. Many elderly people use this stop and have to stand for long periods while waiting.",
    category: "infrastructure",
    status: "closed",
    priority: "low",
    createdAt: new Date(2023, 4, 10, 16, 20),
    updatedAt: new Date(2023, 4, 20, 9, 15),
    userId: "user-5",
    userName: "Citizen E",
    userContact: "citizene@example.com",
    isAnonymous: false,
    location: {
      province: "Northern",
      district: "Musanze",
      sector: "Muhoza",
    },
    responses: [],
    comments: [],
    viewCount: 12,
    upvotes: 3,
  },
]

// Mock dashboard stats
export const dashboardStats: DashboardStats = {
  totalFeedback: adminFeedback.length,
  newFeedback: adminFeedback.filter((f) => f.status === "new").length,
  resolvedFeedback: adminFeedback.filter((f) => f.status === "closed").length,
  pendingFeedback: adminFeedback.filter((f) => ["in-progress", "answered"].includes(f.status)).length,
  feedbackByCategory: {
    infrastructure: adminFeedback.filter((f) => f.category === "infrastructure").length,
    "public-services": adminFeedback.filter((f) => f.category === "public-services").length,
    safety: adminFeedback.filter((f) => f.category === "safety").length,
    environment: adminFeedback.filter((f) => f.category === "environment").length,
    other: adminFeedback.filter((f) => f.category === "other").length,
  },
  feedbackByStatus: {
    new: adminFeedback.filter((f) => f.status === "new").length,
    "in-progress": adminFeedback.filter((f) => f.status === "in-progress").length,
    answered: adminFeedback.filter((f) => f.status === "answered").length,
    closed: adminFeedback.filter((f) => f.status === "closed").length,
  },
  feedbackByPriority: {
    low: adminFeedback.filter((f) => f.priority === "low").length,
    medium: adminFeedback.filter((f) => f.priority === "medium").length,
    high: adminFeedback.filter((f) => f.priority === "high").length,
    critical: adminFeedback.filter((f) => f.priority === "critical").length,
  },
  responseRate: 60, // percentage
  averageResponseTime: 24, // hours
}

// Current logged-in admin (for demo purposes)
export const currentAdmin: AdminUser = adminUsers[0] // Global admin by default

// Helper functions
export function getCurrentAdmin(): AdminUser {
  return currentAdmin
}

export function canManageFeedback(admin: AdminUser, feedback: AdminFeedback): boolean {
  if (admin.role === "global") return true
  return admin.assignedCategories?.includes(feedback.category) || false
}

export function getFeedbackById(id: string): AdminFeedback | undefined {
  return adminFeedback.find((f) => f.id === id)
}

export function getFilteredFeedback(
  admin: AdminUser,
  filters?: {
    category?: FeedbackCategory
    status?: FeedbackStatus
    priority?: FeedbackPriority
    search?: string
  },
): AdminFeedback[] {
  let filtered = [...adminFeedback]

  // Apply role-based filtering
  if (admin.role === "category" && admin.assignedCategories) {
    filtered = filtered.filter((f) => admin.assignedCategories?.includes(f.category))
  }

  // Apply additional filters
  if (filters) {
    if (filters.category) {
      filtered = filtered.filter((f) => f.category === filters.category)
    }

    if (filters.status) {
      filtered = filtered.filter((f) => f.status === filters.status)
    }

    if (filters.priority) {
      filtered = filtered.filter((f) => f.priority === filters.priority)
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (f) => f.title.toLowerCase().includes(search) || f.description.toLowerCase().includes(search),
      )
    }
  }

  return filtered
}

// Helper function to get user by ID
export function getUserById(id: string): User | undefined {
  return allUsers.find((u) => u.id === id)
}

// Helper function to get user activities
export function getUserActivities(userId: string): UserActivity[] {
  return userActivities.filter((a) => a.userId === userId)
}

// Helper function to get filtered users
export function getFilteredUsers(filters?: {
  role?: "admin" | "user" | "all"
  status?: "active" | "inactive" | "suspended" | "all"
  search?: string
}): User[] {
  let filtered = [...allUsers]

  // Apply filters
  if (filters) {
    if (filters.role && filters.role !== "all") {
      filtered = filtered.filter((u) => u.role === filters.role)
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((u) => u.status === filters.status)
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          (u.location?.province && u.location.province.toLowerCase().includes(search)) ||
          (u.location?.district && u.location.district.toLowerCase().includes(search)),
      )
    }
  }

  return filtered
}

// Helper function to update user role
export function updateUserRole(userId: string, newRole: "admin" | "user"): User | undefined {
  const user = allUsers.find((u) => u.id === userId)
  if (user) {
    user.role = newRole
    return user
  }
  return undefined
}

// Helper function to update user status
export function updateUserStatus(userId: string, newStatus: "active" | "inactive" | "suspended"): User | undefined {
  const user = allUsers.find((u) => u.id === userId)
  if (user) {
    user.status = newStatus
    return user
  }
  return undefined
}

// Helper function to like a comment
export function likeComment(commentId: string, userId: string): FeedbackComment | undefined {
  const comment = feedbackComments.find((c) => c.id === commentId)

  if (comment) {
    if (comment.likedBy.includes(userId)) {
      // Unlike
      comment.likedBy = comment.likedBy.filter((id) => id !== userId)
      comment.likes = comment.likedBy.length
    } else {
      // Like
      comment.likedBy.push(userId)
      comment.likes = comment.likedBy.length
    }
    return comment
  }

  return undefined
}

// Helper function to like a comment reply
export function likeCommentReply(replyId: string, userId: string): FeedbackCommentReply | undefined {
  const reply = feedbackCommentReplies.find((r) => r.id === replyId)

  if (reply) {
    if (reply.likedBy.includes(userId)) {
      // Unlike
      reply.likedBy = reply.likedBy.filter((id) => id !== userId)
      reply.likes = reply.likedBy.length
    } else {
      // Like
      reply.likedBy.push(userId)
      reply.likes = reply.likedBy.length
    }
    return reply
  }

  return undefined
}

// Helper function to add a comment
export function addComment(
  feedbackId: string,
  userId: string,
  userName: string,
  userRole: "citizen" | "admin",
  content: string,
): FeedbackComment {
  const newComment: FeedbackComment = {
    id: `comment-${feedbackComments.length + 1}`,
    feedbackId,
    userId,
    userName,
    userRole,
    content,
    createdAt: new Date(),
    likes: 0,
    likedBy: [],
    replies: [],
  }

  feedbackComments.push(newComment)

  // Add to the feedback's comments
  const feedback = adminFeedback.find((f) => f.id === feedbackId)
  if (feedback) {
    feedback.comments.push(newComment)
  }

  return newComment
}

// Helper function to add a reply to a comment
export function addCommentReply(
  commentId: string,
  userId: string,
  userName: string,
  userRole: "citizen" | "admin",
  content: string,
): FeedbackCommentReply {
  const newReply: FeedbackCommentReply = {
    id: `reply-${feedbackCommentReplies.length + 1}`,
    commentId,
    userId,
    userName,
    userRole,
    content,
    createdAt: new Date(),
    likes: 0,
    likedBy: [],
  }

  feedbackCommentReplies.push(newReply)

  // Add to the comment's replies
  const comment = feedbackComments.find((c) => c.id === commentId)
  if (comment) {
    comment.replies.push(newReply)
  }

  return newReply
}
