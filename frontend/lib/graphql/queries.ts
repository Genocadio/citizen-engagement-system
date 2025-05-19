import { gql } from '@apollo/client';

export const GET_FEEDBACKS = gql`
  query GetFeedbacks($limit: Int, $offset: Int, $category: String, $subcategory: String, $status: String, $type: String) {
    feedbacks(
      limit: $limit
      offset: $offset
      category: $category
      subcategory: $subcategory
      status: $status
      type: $type
    ) {
      id
      ticketId
      title
      description
      type
      status
      category
      subcategory
      priority
      isAnonymous
      chatEnabled
      createdAt
      author {
        id
        firstName
        lastName
        username
        profileUrl
      }
      location {
        country
        province
        district
        sector
        otherDetails
      }
      attachments
      likes
      likedBy {
        id
      }
      followerCount
      isFollowing
      comments {
        id
      }
      responses {
        id
      }
    }
  }
`;

export const GET_USER_FEEDBACKS = gql`
  query GetUserFeedbacks($limit: Int, $offset: Int) {
    me {
      id
      feedbacks(limit: $limit, offset: $offset) {
        id
        ticketId
        title
        description
        type
        status
        category
        subcategory
        priority
        isAnonymous
        chatEnabled
        createdAt
        location {
          country
          province
          district
          sector
        }
        likes
        followerCount
        isFollowing
        comments {
          id
        }
        responses {
          id
        }
      }
    }
  }
`;

export const GET_PUBLIC_FEEDBACKS = gql`
  query GetPublicFeedbacks(
    $limit: Int
    $offset: Int
    $category: String
    $subcategory: String
    $status: String
    $type: String
    $isAnonymous: Boolean
    $country: String
    $province: String
  ) {
    feedbacks(
      limit: $limit
      offset: $offset
      category: $category
      subcategory: $subcategory
      status: $status
      type: $type
      isAnonymous: $isAnonymous
      country: $country
      province: $province
    ) {
      id
      ticketId
      title
      description
      type
      status
      category
      subcategory
      priority
      isAnonymous
      chatEnabled
      createdAt
      author {
        id
        firstName
        lastName
        username
        profileUrl
      }
      location {
        country
        province
        district
        sector
        otherDetails
      }
      attachments
      likes
      likedBy {
        id
      }
      followerCount
      isFollowing
      comments {
        id
      }
      responses {
        id
      }
    }
  }
`;

export const MY_FEEDBACKS = gql`
  query MyFeedbacks($limit: Int, $offset: Int) {
    myFeedbacks(limit: $limit, offset: $offset) {
      id
      ticketId
      title
      description
      type
      status
      category
      subcategory
      priority
      isAnonymous
      chatEnabled
      createdAt
      author {
        id
        firstName
        lastName
        username
        profileUrl
      }
      location {
        country
        province
        district
        sector
        otherDetails
      }
      attachments
      likes
      likedBy {
        id
      }
      followerCount
      isFollowing
      comments {
        id
      }
      responses {
        id
      }
    }
  }
`;

export const GET_FEEDBACK_BY_ID = gql`
  query GetFeedbackById($id: ID!) {
    feedback(id: $id) {
      id
      ticketId
      title
      description
      type
      status
      category
      subcategory
      priority
      isAnonymous
      chatEnabled
      createdAt
      updatedAt
      author {
        id
        firstName
        lastName
        username
        profileUrl
        role
        email
        phoneNumber
        category
        createdAt
        updatedAt
      }
      assignedTo {
        id
        firstName
        lastName
        username
        profileUrl
        role
      }
      location {
        country
        province
        district
        sector
        otherDetails
      }
      attachments
      likes
      likesCount
      hasLiked
      likedBy {
        id
      }
      followerCount
      isFollowing
      comments {
        id
        message
        author {
          id
          firstName
          lastName
          username
          profileUrl
        }
        authorName
        attachments
        likes
        likesCount
        hasLiked
        likedBy {
          id
        }
        createdAt
        updatedAt
      }
      responses {
        id
        message
        by {
          id
          firstName
          lastName
          username
          profileUrl
        }
        statusUpdate
        attachments
        likes
        likedBy {
          id
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_FEEDBACK_BY_TICKET_ID = gql`
  query GetFeedbackByTicketId($ticketId: String!) {
    feedbackByTicketId(ticketId: $ticketId) {
      id
      ticketId
      title
      description
      type
      status
      category
      subcategory
      priority
      isAnonymous
      chatEnabled
      createdAt
      author {
        id
        firstName
        lastName
        username
        profileUrl
      }
      location {
        country
        province
        district
        sector
        otherDetails
      }
      attachments
      likes
      likedBy {
        id
      }
      followers {
        id
      }
      followerCount
      isFollowing
      comments {
        id
      }
      responses {
        id
      }
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      firstName
      lastName
      username
      phoneNumber
      profileUrl
      role
      category
      isActive
      lastLoginAt
      lastActivityAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($limit: Int, $offset: Int, $role: String, $category: String, $isActive: Boolean) {
    users(limit: $limit, offset: $offset, role: $role, category: $category, isActive: $isActive) {
      id
      email
      firstName
      lastName
      username
      phoneNumber
      profileUrl
      role
      category
      isActive
      lastLoginAt
      lastActivityAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_FEEDBACK_STATS = gql`
  query GetFeedbackStats {
    feedbackStats {
      totalFeedback
      newFeedback
      resolvedFeedback
      pendingFeedback
      feedbackByCategory {
        infrastructure
        publicServices
        safety
        environment
        other
      }
      feedbackByStatus {
        new
        inProgress
        answered
        closed
      }
      feedbackByPriority {
        low
        medium
        high
        critical
      }
      responseRate
      averageResponseTime
    }
  }
`; 