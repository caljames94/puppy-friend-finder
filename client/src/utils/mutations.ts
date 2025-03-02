import { gql } from '@apollo/client';

export const UPDATE_MATCH_STATUS = gql`
  mutation UpdateMatchStatus($matchId: ID!, $dogId: ID!, $status: MatchStatus!) {
    updateMatchStatus(matchId: $matchId, dogId: $dogId, status: $status) {
      id
      dogAStatus
      dogBStatus
    }
  }
`;

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

export const REGISTER = gql`
  mutation addProfile($name: String!, $email: String!, $password: String!) {
    addProfile(name: $name, email: $email, password: $password) {
      token
      profile {
        _id
        name
        email
      }
    }
  }
`;

export const CREATE_DOG = gql`
  mutation CreateDog($name: String!, $age: Int!, $breed: String!, $personality: [String!]!, $profilePicture: String!, $suburb: String!) {
    createDog(input: {
      name: $name,
      age: $age,
      breed: $breed,
      personality: $personality,
      profilePicture: $profilePicture,
      suburb: $suburb
    }) {
      _id
      name
      age
      breed
      personality
      profilePicture
      suburb
      owner {
        _id
        name
      }
    }
  }
`;