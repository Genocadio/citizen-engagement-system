import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        firstName
        lastName
        username
        phoneNumber
        role
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        firstName
        lastName
        username
        phoneNumber
        role
      }
    }
  }
`;

// Type for the registration input
export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
};

export const CREATE_FEEDBACK = gql`
  mutation CreateFeedback($input: FeedbackInput!) {
    createFeedback(input: $input) {
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
    }
  }
`;

export const FOLLOW_FEEDBACK = gql`
  mutation FollowFeedback($id: ID!) {
    followFeedback(id: $id) {
      id
      followerCount
      isFollowing
      likes
      likedBy {
        id
      }
      comments {
        id
      }
      responses {
        id
      }
    }
  }
`;

export const UNFOLLOW_FEEDBACK = gql`
  mutation UnfollowFeedback($id: ID!) {
    unfollowFeedback(id: $id) {
      id
      followerCount
      isFollowing
      likes
      likedBy {
        id
      }
      comments {
        id
      }
      responses {
        id
      }
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CommentInput!) {
    createComment(input: $input) {
      id
      message
      feedback {
        id
      }
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
      createdAt
      updatedAt
    }
  }
`;

export const LIKE_COMMENT = gql`
  mutation LikeComment($id: ID!) {
    likeComment(id: $id) {
      id
      likes
      likesCount
      hasLiked
      likedBy {
        id
      }
    }
  }
`;

export const UNLIKE_COMMENT = gql`
  mutation UnlikeComment($id: ID!) {
    unlikeComment(id: $id) {
      id
      likes
      likesCount
      hasLiked
      likedBy {
        id
      }
    }
  }
`;

export const LIKE_FEEDBACK = gql`
  mutation LikeFeedback($id: ID!) {
    likeFeedback(id: $id) {
      id
      likes
      likesCount
      hasLiked
      likedBy {
        id
      }
    }
  }
`;

export const UNLIKE_FEEDBACK = gql`
  mutation UnlikeFeedback($id: ID!) {
    unlikeFeedback(id: $id) {
      id
      likes
      likesCount
      hasLiked
      likedBy {
        id
      }
    }
  }
`;

export const CREATE_RESPONSE = gql`
  mutation CreateResponse($input: ResponseInput!) {
    createResponse(input: $input) {
      id
      message
      feedback {
        id
      }
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
`;

export const UPDATE_FEEDBACK = gql`
  mutation UpdateFeedback($id: ID!, $input: FeedbackInput!) {
    updateFeedback(id: $id, input: $input) {
      id
      title
      description
      type
      status
      category
      subcategory
      priority
      isAnonymous
      chatEnabled
      updatedAt
    }
  }
`;

export const UPDATE_FEEDBACK_STATUS = gql`
  mutation UpdateFeedbackStatus($id: ID!, $status: String!) {
    updateFeedbackStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: ID!, $message: String!) {
    updateComment(id: $id, message: $message) {
      id
      message
      updatedAt
    }
  }
`;

export const UPDATE_RESPONSE = gql`
  mutation UpdateResponse($id: ID!, $message: String!) {
    updateResponse(id: $id, message: $message) {
      id
      message
      updatedAt
    }
  }
`;

export const DELETE_FEEDBACK = gql`
  mutation DeleteFeedback($id: ID!) {
    deleteFeedback(id: $id)
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`;

export const DELETE_RESPONSE = gql`
  mutation DeleteResponse($id: ID!) {
    deleteResponse(id: $id)
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
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