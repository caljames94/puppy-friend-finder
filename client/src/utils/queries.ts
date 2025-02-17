import { gql } from '@apollo/client';

export const GET_DOGS = gql`
  query GetDogs {
    dogs {
      _id
      name
      age
      breed
      image
      owner {
        username
      }
    }
  }
`;