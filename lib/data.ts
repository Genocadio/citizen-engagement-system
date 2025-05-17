export type FeedbackType = "Complaint" | "Positive" | "Suggestion"
export type StatusType = "Open" | "In Progress" | "Resolved" | "Closed"
export type AuthorType = "Citizen" | "Admin"

export interface Location {
  country: string
  province: string
  district: string
  sector: string
  otherDetails?: string
}

export interface StatusHistory {
  status: StatusType
  changedBy: string
  timestamp: string
  note: string
}

export interface Response {
  responseId: string
  by: string
  message: string
  timestamp: string
  attachments: string[]
  statusUpdate: StatusType
  likes: number
  likedBy: string[]
}

export interface Comment {
  commentId: string
  authorType: "Citizen" | "Admin"
  authorId: string
  authorName: string
  message: string
  timestamp: string
  likes: number
  likedBy: string[]
  parentId?: string
}

export interface Feedback {
  id: string
  title: string
  description: string
  type: FeedbackType
  category: string
  subcategory: string
  ticketNumber: string
  submittedAt: string
  status: StatusType
  isPublic: boolean
  isAnonymous: boolean
  citizenName: string
  email: string
  phone: string
  submittedBy: string | null
  location: Location
  referenceTo: string | null
  attachments: string[]
  assignedAgency: string
  assignedTo: string | null
  followers: string[]
  views: number
  statusHistory: StatusHistory[]
  response: Response | null
  comments: Comment[]
  rating: number | null
  language: string
  chatMode: boolean
  chatEnabledBy: string | null
  chatEnabledAt: string | null
}

// Mock data
const mockFeedback: Feedback[] = [
  {
    id: "fb-001",
    title: "No electricity in my sector",
    description:
      "We've had a blackout for 2 days in Kinyinya. This is affecting businesses and homes in the area. We need urgent assistance to restore power.",
    type: "Complaint",
    category: "Electricity",
    subcategory: "Power Outage",
    ticketNumber: "CT-000124",
    submittedAt: "2025-05-16T10:30:00Z",
    status: "In Progress",
    isPublic: true,
    isAnonymous: false,
    citizenName: "Jean Bosco",
    email: "jean@example.com",
    phone: "0788123456",
    submittedBy: "user-123",
    location: {
      country: "Rwanda",
      province: "Kigali City",
      district: "Gasabo",
      sector: "Kinyinya",
      otherDetails: "Near Kinyinya Health Center",
    },
    referenceTo: null,
    attachments: ["https://cdn.example.com/images/photo1.jpg"],
    assignedAgency: "REG",
    assignedTo: "admin-456",
    followers: ["user-200", "user-301"],
    views: 15,
    statusHistory: [
      {
        status: "Open",
        changedBy: "system",
        timestamp: "2025-05-16T10:30:00Z",
        note: "Initial submission",
      },
      {
        status: "In Progress",
        changedBy: "admin-456",
        timestamp: "2025-05-16T11:30:00Z",
        note: "Sent to field team",
      },
    ],
    response: {
      responseId: "res-001",
      by: "admin-456",
      message: "Power will be restored by 5PM today due to regional maintenance.",
      timestamp: "2025-05-16T13:00:00Z",
      attachments: [],
      statusUpdate: "In Progress",
      likes: 0,
      likedBy: [],
    },
    comments: [
      {
        commentId: "cmt-001",
        authorType: "Citizen",
        authorId: "user-200",
        authorName: "Aline",
        message: "Same issue in Gisozi!",
        timestamp: "2025-05-16T12:00:00Z",
        likes: 0,
        likedBy: [],
      },
      {
        commentId: "cmt-002",
        authorType: "Admin",
        authorId: "admin-456",
        authorName: "REG Agent",
        message: "We're working on it — updates soon.",
        timestamp: "2025-05-16T12:10:00Z",
        likes: 0,
        likedBy: [],
      },
    ],
    rating: 4,
    language: "en",
    chatMode: false,
    chatEnabledBy: null,
    chatEnabledAt: null,
  },
  {
    id: "fb-002",
    title: "Road maintenance needed on Main Street",
    description:
      "There are several potholes on Main Street that are causing damage to vehicles and creating traffic hazards.",
    type: "Complaint",
    category: "Roads",
    subcategory: "Maintenance",
    ticketNumber: "CT-000125",
    submittedAt: "2025-05-15T14:20:00Z",
    status: "Open",
    isPublic: true,
    isAnonymous: false,
    citizenName: "Marie Uwase",
    email: "marie@example.com",
    phone: "0788234567",
    submittedBy: "user-124",
    location: {
      country: "Rwanda",
      province: "Kigali City",
      district: "Nyarugenge",
      sector: "Nyamirambo",
      otherDetails: "Near the stadium",
    },
    referenceTo: null,
    attachments: ["https://cdn.example.com/images/pothole1.jpg", "https://cdn.example.com/images/pothole2.jpg"],
    assignedAgency: "RTDA",
    assignedTo: null,
    followers: ["user-201", "user-202", "user-203", "user-204"],
    views: 28,
    statusHistory: [
      {
        status: "Open",
        changedBy: "system",
        timestamp: "2025-05-15T14:20:00Z",
        note: "Initial submission",
      },
    ],
    response: null,
    comments: [
      {
        commentId: "cmt-003",
        authorType: "Citizen",
        authorId: "user-201",
        authorName: "Claude",
        message: "I've damaged my car tire because of these potholes!",
        timestamp: "2025-05-15T16:45:00Z",
        likes: 0,
        likedBy: [],
      },
      {
        commentId: "cmt-004",
        authorType: "Citizen",
        authorId: "user-202",
        authorName: "Diane",
        message: "This has been an issue for months now.",
        timestamp: "2025-05-15T17:30:00Z",
        likes: 0,
        likedBy: [],
      },
    ],
    rating: null,
    language: "en",
    chatMode: false,
    chatEnabledBy: null,
    chatEnabledAt: null,
  },
  {
    id: "fb-003",
    title: "Excellent service at Gasabo district office",
    description:
      "I visited the Gasabo district office yesterday and received exceptional service. The staff was professional, friendly, and efficient.",
    type: "Positive",
    category: "Government Services",
    subcategory: "Customer Service",
    ticketNumber: "CT-000126",
    submittedAt: "2025-05-14T09:15:00Z",
    status: "Closed",
    isPublic: true,
    isAnonymous: false,
    citizenName: "Eric Mugisha",
    email: "eric@example.com",
    phone: "0788345678",
    submittedBy: "user-125",
    location: {
      country: "Rwanda",
      province: "Kigali City",
      district: "Gasabo",
      sector: "Remera",
      otherDetails: "District office building",
    },
    referenceTo: null,
    attachments: [],
    assignedAgency: "Gasabo District",
    assignedTo: "admin-457",
    followers: ["user-204", "user-205"],
    views: 10,
    statusHistory: [
      {
        status: "Open",
        changedBy: "system",
        timestamp: "2025-05-14T09:15:00Z",
        note: "Initial submission",
      },
      {
        status: "Closed",
        changedBy: "admin-457",
        timestamp: "2025-05-14T11:30:00Z",
        note: "Acknowledged and closed",
      },
    ],
    response: {
      responseId: "res-002",
      by: "admin-457",
      message:
        "Thank you for your positive feedback! We're glad you had a good experience at our office. We strive to provide excellent service to all citizens.",
      timestamp: "2025-05-14T11:30:00Z",
      attachments: [],
      statusUpdate: "Closed",
      likes: 0,
      likedBy: [],
    },
    comments: [],
    rating: 5,
    language: "en",
    chatMode: false,
    chatEnabledBy: null,
    chatEnabledAt: null,
  },
  {
    id: "fb-004",
    title: "Water supply interruption in Kimironko",
    description: "There has been no water supply in Kimironko for the past 24 hours. Many households are affected.",
    type: "Complaint",
    category: "Water",
    subcategory: "Supply Interruption",
    ticketNumber: "CT-000127",
    submittedAt: "2025-05-13T16:40:00Z",
    status: "Resolved",
    isPublic: true,
    isAnonymous: true,
    citizenName: "",
    email: "anonymous@example.com",
    phone: "",
    submittedBy: null,
    location: {
      country: "Rwanda",
      province: "Kigali City",
      district: "Gasabo",
      sector: "Kimironko",
      otherDetails: "Entire sector affected",
    },
    referenceTo: null,
    attachments: [],
    assignedAgency: "WASAC",
    assignedTo: "admin-458",
    followers: ["user-206", "user-207", "user-208", "user-209"],
    views: 22,
    statusHistory: [
      {
        status: "Open",
        changedBy: "system",
        timestamp: "2025-05-13T16:40:00Z",
        note: "Initial submission",
      },
      {
        status: "In Progress",
        changedBy: "admin-458",
        timestamp: "2025-05-13T17:30:00Z",
        note: "Investigating the issue",
      },
      {
        status: "Resolved",
        changedBy: "admin-458",
        timestamp: "2025-05-14T10:15:00Z",
        note: "Water supply restored",
      },
    ],
    response: {
      responseId: "res-003",
      by: "admin-458",
      message:
        "The water supply has been restored. The interruption was due to emergency maintenance on the main pipeline. We apologize for any inconvenience caused.",
      timestamp: "2025-05-14T10:15:00Z",
      attachments: [],
      statusUpdate: "Resolved",
      likes: 0,
      likedBy: [],
    },
    comments: [
      {
        commentId: "cmt-005",
        authorType: "Citizen",
        authorId: "user-206",
        authorName: "Anonymous",
        message: "Thank you for the quick resolution!",
        timestamp: "2025-05-14T11:00:00Z",
        likes: 0,
        likedBy: [],
      },
    ],
    rating: 4,
    language: "en",
    chatMode: false,
    chatEnabledBy: null,
    chatEnabledAt: null,
  },
  {
    id: "fb-005",
    title: "Suggestion for public park improvements",
    description:
      "I would like to suggest adding more benches and shade structures in the Nyarutarama public park. This would make it more comfortable for families and elderly visitors.",
    type: "Suggestion",
    category: "Parks & Recreation",
    subcategory: "Facilities",
    ticketNumber: "CT-000128",
    submittedAt: "2025-05-12T13:25:00Z",
    status: "In Progress",
    isPublic: true,
    isAnonymous: false,
    citizenName: "Alice Mutesi",
    email: "alice@example.com",
    phone: "0788456789",
    submittedBy: "user-126",
    location: {
      country: "Rwanda",
      province: "Kigali City",
      district: "Gasabo",
      sector: "Nyarutarama",
      otherDetails: "Public park near the golf course",
    },
    referenceTo: null,
    attachments: ["https://cdn.example.com/images/park1.jpg"],
    assignedAgency: "City of Kigali",
    assignedTo: "admin-459",
    followers: ["user-210", "user-211", "user-212", "user-213"],
    views: 30,
    statusHistory: [
      {
        status: "Open",
        changedBy: "system",
        timestamp: "2025-05-12T13:25:00Z",
        note: "Initial submission",
      },
      {
        status: "In Progress",
        changedBy: "admin-459",
        timestamp: "2025-05-12T15:45:00Z",
        note: "Under review by Parks Department",
      },
    ],
    response: {
      responseId: "res-004",
      by: "admin-459",
      message:
        "Thank you for your suggestion. We are currently reviewing the feasibility of adding more benches and shade structures to the park. Your input is valuable in helping us improve public spaces.",
      timestamp: "2025-05-12T15:45:00Z",
      attachments: [],
      statusUpdate: "In Progress",
      likes: 0,
      likedBy: [],
    },
    comments: [
      {
        commentId: "cmt-006",
        authorType: "Citizen",
        authorId: "user-210",
        authorName: "Robert",
        message: "I fully support this suggestion. The park needs more seating areas.",
        timestamp: "2025-05-12T16:30:00Z",
        likes: 0,
        likedBy: [],
      },
      {
        commentId: "cmt-007",
        authorType: "Citizen",
        authorId: "user-211",
        authorName: "Sarah",
        message: "Could we also consider adding a small playground for children?",
        timestamp: "2025-05-12T17:15:00Z",
        likes: 0,
        likedBy: [],
      },
    ],
    rating: null,
    language: "en",
    chatMode: false,
    chatEnabledBy: null,
    chatEnabledAt: null,
  },
  {
    id: "fb-006",
    title: "Garbage collection delayed in Gikondo",
    description:
      "The garbage collection in Gikondo has been delayed for over a week now. Waste is piling up and causing health concerns.",
    type: "Complaint",
    category: "Waste Management",
    subcategory: "Collection",
    ticketNumber: "CT-000129",
    submittedAt: "2025-05-11T08:50:00Z",
    status: "Resolved",
    isPublic: true,
    isAnonymous: false,
    citizenName: "Patrick Nkusi",
    email: "patrick@example.com",
    phone: "0788567890",
    submittedBy: "user-127",
    location: {
      country: "Rwanda",
      province: "Kigali City",
      district: "Kicukiro",
      sector: "Gikondo",
      otherDetails: "Residential area near the industrial zone",
    },
    referenceTo: null,
    attachments: ["https://cdn.example.com/images/garbage1.jpg", "https://cdn.example.com/images/garbage2.jpg"],
    assignedAgency: "City of Kigali",
    assignedTo: "admin-460",
    followers: ["user-214", "user-215", "user-216"],
    views: 25,
    statusHistory: [
      {
        status: "Open",
        changedBy: "system",
        timestamp: "2025-05-11T08:50:00Z",
        note: "Initial submission",
      },
      {
        status: "In Progress",
        changedBy: "admin-460",
        timestamp: "2025-05-11T10:30:00Z",
        note: "Coordinating with waste management company",
      },
      {
        status: "Resolved",
        changedBy: "admin-460",
        timestamp: "2025-05-12T09:15:00Z",
        note: "Garbage collection completed",
      },
    ],
    response: {
      responseId: "res-005",
      by: "admin-460",
      message:
        "The garbage collection has been completed in Gikondo. The delay was due to vehicle maintenance issues. We apologize for the inconvenience and have implemented measures to prevent similar delays in the future.",
      timestamp: "2025-05-12T09:15:00Z",
      attachments: [],
      statusUpdate: "Resolved",
      likes: 0,
      likedBy: [],
    },
    comments: [
      {
        commentId: "cmt-008",
        authorType: "Citizen",
        authorId: "user-214",
        authorName: "Emmanuel",
        message: "Thank you for addressing this issue promptly.",
        timestamp: "2025-05-12T10:45:00Z",
        likes: 0,
        likedBy: [],
      },
    ],
    rating: 3,
    language: "en",
    chatMode: false,
    chatEnabledBy: null,
    chatEnabledAt: null,
  },
  {
    id: "fb-007",
    title: "Traffic light malfunction at downtown intersection",
    description:
      "The traffic light at the intersection of Main St and Broadway has been malfunctioning for three days, causing traffic congestion and safety hazards.",
    type: "Complaint",
    category: "Roads",
    subcategory: "Traffic",
    ticketNumber: "CT-000130",
    submittedAt: "2025-05-10T09:30:00Z",
    status: "In Progress",
    isPublic: true,
    isAnonymous: false,
    citizenName: "John Smith",
    email: "john.smith@example.com",
    phone: "555-123-4567",
    submittedBy: "user-128",
    location: {
      country: "United States",
      province: "California",
      district: "Los Angeles County",
      sector: "Hollywood",
      otherDetails: "Intersection of Main St and Broadway",
    },
    referenceTo: null,
    attachments: ["https://cdn.example.com/images/traffic1.jpg"],
    assignedAgency: "LA Department of Transportation",
    assignedTo: "admin-461",
    followers: ["user-217", "user-218", "user-219", "user-220"],
    views: 42,
    statusHistory: [
      {
        status: "Open",
        changedBy: "system",
        timestamp: "2025-05-10T09:30:00Z",
        note: "Initial submission",
      },
      {
        status: "In Progress",
        changedBy: "admin-461",
        timestamp: "2025-05-10T11:15:00Z",
        note: "Assigned to maintenance team",
      },
    ],
    response: {
      responseId: "res-006",
      by: "admin-461",
      message:
        "We have dispatched a maintenance team to address the traffic light malfunction. We expect the issue to be resolved by end of day. Thank you for reporting this issue.",
      timestamp: "2025-05-10T11:15:00Z",
      attachments: [],
      statusUpdate: "In Progress",
      likes: 0,
      likedBy: [],
    },
    comments: [
      {
        commentId: "cmt-009",
        authorType: "Citizen",
        authorId: "user-217",
        authorName: "Jane Doe",
        message: "This is causing major delays during rush hour. Please fix it ASAP!",
        timestamp: "2025-05-10T12:30:00Z",
        likes: 0,
        likedBy: [],
      },
    ],
    rating: null,
    language: "en",
    chatMode: false,
    chatEnabledBy: null,
    chatEnabledAt: null,
  },
]

// Helper functions to access the mock data
export function getAllFeedback(): Feedback[] {
  return mockFeedback
}

export function getFeedbackById(id: string): Feedback | undefined {
  return mockFeedback.find((feedback) => feedback.id === id)
}

export function getRecentIssues(limit = 6): Feedback[] {
  return mockFeedback
    .filter((feedback) => feedback.isPublic)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, limit)
}

export function getUserFeedback(userId: string): Feedback[] {
  return mockFeedback.filter((feedback) => feedback.submittedBy === userId)
}

export function getPublicIssues(): Feedback[] {
  return mockFeedback.filter((feedback) => feedback.isPublic)
}

export const categories = [
  "Electricity",
  "Water",
  "Roads",
  "Waste Management",
  "Public Transport",
  "Healthcare",
  "Education",
  "Security",
  "Parks & Recreation",
  "Government Services",
  "Other",
]

export const subcategories: Record<string, string[]> = {
  Electricity: ["Power Outage", "Billing Issues", "Infrastructure", "Other"],
  Water: ["Supply Interruption", "Quality Issues", "Billing", "Leakage", "Other"],
  Roads: ["Maintenance", "Traffic", "Signage", "Construction", "Other"],
  "Waste Management": ["Collection", "Recycling", "Illegal Dumping", "Other"],
  "Public Transport": ["Bus Services", "Taxi Services", "Infrastructure", "Other"],
  Healthcare: ["Facilities", "Services", "Staff", "Other"],
  Education: ["Schools", "Teachers", "Curriculum", "Facilities", "Other"],
  Security: ["Police", "Crime", "Street Lighting", "Other"],
  "Parks & Recreation": ["Facilities", "Maintenance", "Events", "Other"],
  "Government Services": ["Customer Service", "Documentation", "Procedures", "Other"],
  Other: ["General"],
}

export function generateTicketNumber(): string {
  const prefix = "CT-"
  const randomNum = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}${randomNum}`
}
