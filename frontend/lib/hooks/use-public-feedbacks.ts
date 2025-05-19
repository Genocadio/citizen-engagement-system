import { useQuery } from "@apollo/client"
import { GET_PUBLIC_FEEDBACKS } from "@/lib/graphql/queries"
import { FeedbackType, StatusType, AuthorType } from "@/lib/data"

interface Location {
  country: string
  province: string
  district: string
  sector: string
  otherDetails?: string
}

interface User {
  id: string
  firstName?: string
  lastName?: string
  username?: string
}

interface GraphQLFeedback {
  id: string
  ticketId: string
  title: string
  description: string
  type: string
  status: string
  category: string
  subcategory?: string
  priority: string
  isAnonymous: boolean
  chatEnabled: boolean
  createdAt: string
  author?: User
  location?: Location
  likes: number
  comments: { id: string }[]
  responses: { id: string }[]
  followerCount: number
  isFollowing: boolean
}

interface FeedbacksData {
  feedbacks: GraphQLFeedback[]
}

// Transform GraphQL feedback to match expected format
export function transformFeedback(feedback: GraphQLFeedback) {
  // Convert MongoDB timestamp to ISO string
  const createdAt = new Date(parseInt(feedback.createdAt)).toISOString()

  return {
    id: feedback.id,
    title: feedback.title,
    description: feedback.description,
    type: feedback.type as FeedbackType,
    category: feedback.category,
    subcategory: feedback.subcategory || "",
    ticketNumber: feedback.ticketId,
    submittedAt: createdAt,
    status: feedback.status as StatusType,
    isPublic: true,
    isAnonymous: feedback.isAnonymous,
    citizenName: feedback.isAnonymous ? "Anonymous" : `${feedback.author?.firstName || ""} ${feedback.author?.lastName || ""}`.trim() || feedback.author?.username || "Unknown",
    submittedBy: feedback.author?.id || null,
    email: "",
    phone: "",
    location: feedback.location || {
      country: "",
      province: "",
      district: "",
      sector: "",
    },
    referenceTo: null,
    attachments: [],
    assignedAgency: "",
    assignedTo: null,
    followers: [],
    followerCount: feedback.followerCount || 0,
    isFollowing: feedback.isFollowing || false,
    views: 0,
    statusHistory: [
      {
        status: feedback.status as StatusType,
        changedBy: "system",
        timestamp: createdAt,
        note: "Initial submission",
      },
    ],
    response: feedback.responses.length > 0 ? {
      responseId: feedback.responses[0].id,
      by: "admin",
      message: "Latest response",
      timestamp: createdAt,
      attachments: [],
      statusUpdate: feedback.status as StatusType,
      likes: 0,
      likedBy: [],
    } : null,
    comments: feedback.comments.map(c => ({
      commentId: c.id,
      authorType: "Citizen" as AuthorType,
      authorId: "user",
      authorName: "User",
      message: "Comment",
      timestamp: createdAt,
      likes: 0,
      likedBy: [],
    })),
    responses: feedback.responses.map(r => ({
      responseId: r.id
    })),
    rating: null,
    language: "en",
    chatMode: false,
    chatEnabledBy: null,
    chatEnabledAt: null,
  }
}

interface UsePublicFeedbacksOptions {
  limit?: number
  offset?: number
  category?: string
  status?: string
}

export function usePublicFeedbacks({
  limit = 10,
  offset = 0,
  category,
  status,
}: UsePublicFeedbacksOptions = {}) {
  const { data, loading, error, fetchMore } = useQuery<FeedbacksData>(GET_PUBLIC_FEEDBACKS, {
    variables: {
      limit,
      offset,
      category: category !== "all" ? category : undefined,
      status: status !== "all" ? status : undefined,
    },
  })

  const feedbacks = data?.feedbacks.map(transformFeedback) || []

  return {
    feedbacks,
    loading,
    error,
    fetchMore,
    hasMore: data?.feedbacks.length === limit,
  }
} 