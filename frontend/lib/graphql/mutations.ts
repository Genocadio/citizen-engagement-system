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