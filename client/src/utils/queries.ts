import { gql } from '@apollo/client';

export const PENDING_MATCHES_QUERY = gql`
  query PendingMatches($dogId: ID!) {
    getDog(id: $dogId) {
      id
      name
      pendingMatches {
        id
        dogA {
          id
          name
          profilePicture
        }
        dogB {
          id
          name
          profilePicture
        }
        dogAStatus
        dogBStatus
      }
    }
  }
`;

export const GET_DOGS = gql`
  query GetAllDogs {
    getAllDogs {
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
        email
      }
    }
  }
`;