export interface Location {
  country: string
  province: string
  district: string
  sector: string
  otherDetails?: string
}

export interface User {
  id: string
  firstName?: string
  lastName?: string
  username?: string
}

export interface Feedback {
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
  author: User
  location?: Location
  likes: number
  comments: { id: string }[]
  responses: { id: string }[]
} 