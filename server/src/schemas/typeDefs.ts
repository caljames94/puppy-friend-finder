import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime

  enum MatchStatus {
    PENDING
    ACCEPTED
    REJECTED
  }

  type User {
    id: ID!
    name: String!
    email: String!
    dog: Dog
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Dog {
    id: ID!
    name: String!
    age: Int!
    breed: String!
    personality: [String!]!
    profilePicture: String!
    suburb: String!
    owner: User!
    pendingMatches: [Match!]!
    confirmedMatches: [Match!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Match {
    id: ID!
    dogA: Dog!
    dogB: Dog!
    dogAStatus: MatchStatus!
    dogBStatus: MatchStatus!
    isMatched: Boolean!
    isPending: Boolean!
    isRejected: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    email: String
    password: String
  }

  input CreateDogInput {
    name: String!
    age: Int!
    breed: String!
    personality: [String!]!
    profilePicture: String!
    suburb: String!
  }

  input UpdateDogInput {
    name: String
    age: Int
    breed: String
    personality: [String!]
    profilePicture: String
    suburb: String
  }

  type Query {
    # User queries
    me: User
    getUser(id: ID!): User
    
    # Dog queries
    getDog(id: ID!): Dog
    getDogsForMatching(dogId: ID!): [Dog!]!
    getAllDogs: [Dog!]!
    
    # Match queries
    getMatch(id: ID!): Match
    getMatchesByDog(dogId: ID!): [Match!]!
    getPendingMatches(dogId: ID!): [Match!]!
  }

  type Mutation {
    # User mutations
    register(input: CreateUserInput!): User!
    login(email: String!, password: String!): AuthPayload!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    
    # Dog mutations
    createDog(input: CreateDogInput!): Dog!
    updateDog(id: ID!, input: UpdateDogInput!): Dog!
    
    # Match mutations
    createMatch(dogA: ID!, dogB: ID!): Match!
    updateMatchStatus(matchId: ID!, dogId: ID!, status: MatchStatus!): Match!
    deleteMatch(matchId: ID!): Boolean!
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;