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