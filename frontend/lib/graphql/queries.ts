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
      }
      location {
        country
        province
        district
        sector
      }
      likes
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
      }
      location {
        country
        province
        district
        sector
      }
      likes
      comments {
        id
      }
      responses {
        id
      }
      followers {
        id
      }
    }
  }
`; 