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