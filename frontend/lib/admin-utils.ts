import type { FeedbackCategory, FeedbackPriority, FeedbackStatus } from "./admin-types"

export const formatDate = (date: Date | string | number): string => {
  try {
    let dateObj: Date
    if (typeof date === 'number') {
      // Handle MongoDB timestamp (milliseconds)
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      dateObj = new Date(date)
    }
    
    if (isNaN(dateObj.getTime())) {
      return "Invalid date"
    }
    
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj)
  } catch (error) {
    return "Invalid date"
  }
}

export const getCategoryLabel = (category: FeedbackCategory): string => {
  const labels: Record<FeedbackCategory, string> = {
    infrastructure: "Infrastructure",
    "public-services": "Public Services",
    safety: "Safety & Security",
    environment: "Environment",
    other: "Other",
  }
  return labels[category]
}

export const getStatusLabel = (status: FeedbackStatus): string => {
  const labels: Record<FeedbackStatus, string> = {
    'open': "Open",
    'in-progress': "In Progress",
    'resolved': "Resolved",
    'closed': "Closed",
  }
  return labels[status]
}

export const getPriorityLabel = (priority: FeedbackPriority): string => {
  const labels: Record<FeedbackPriority, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  }
  return labels[priority]
}

export const getCategoryColor = (category: FeedbackCategory): string => {
  const colors: Record<FeedbackCategory, string> = {
    infrastructure: "bg-blue-100 text-blue-800",
    "public-services": "bg-purple-100 text-purple-800",
    safety: "bg-red-100 text-red-800",
    environment: "bg-green-100 text-green-800",
    other: "bg-gray-100 text-gray-800",
  }
  return colors[category]
}

export const getStatusColor = (status: FeedbackStatus): string => {
  const colors: Record<FeedbackStatus, string> = {
    'open': "bg-blue-100 text-blue-800",
    'in-progress': "bg-yellow-100 text-yellow-800",
    'resolved': "bg-green-100 text-green-800",
    'closed': "bg-gray-100 text-gray-800",
  }
  return colors[status]
}

export const getPriorityColor = (priority: FeedbackPriority): string => {
  const colors: Record<FeedbackPriority, string> = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  }
  return colors[priority]
}

export const categoryOptions = [
  { value: "infrastructure", label: "Infrastructure" },
  { value: "public-services", label: "Public Services" },
  { value: "safety", label: "Safety & Security" },
  { value: "environment", label: "Environment" },
  { value: "other", label: "Other" },
]

export const statusOptions = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
]

export const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
]
