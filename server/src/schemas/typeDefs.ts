const typeDefs = `
    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        dog: Dog!
    }
    
    type Dog {
        _id: ID
        name: String
        age: Int
        breed: String
        personality: String
        profilePicture: String
        suburb: String
        owner: User
        friends: [Dog]
        matches: [Match]
    }
    
    type Match {
        _id: ID!
        sender: Dog!
        recipient: Dog!
        status: MatchStatus!
        isFriend: Boolean!
        createdAt: String!
    }
    
    enum MatchStatus {
        PENDING
        ACCEPTED
        REJECTED
    }
    
    type Message {
        _id: ID!
        sender: User!
        recipient: User!
        content: String!
        createdAt: String!
    }
    
    type Auth {
        token: ID!
        user: User
    }
    
    type Query {
        me: User
        dog(_id: ID!): Dog
        dogs: [Dog!]!
        matches: [Match!]!
        friends: [Dog!]!
        messages(friendId: ID!): [Message!]!
    }
    
    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(name: String!, email: String!, password: String!): Auth
        addDog(name: String!, age: Int!, breed: String!, personality: String, profilePicture: String, suburb: String): Dog
        updateDog(_id: ID!, name: String, age: Int, breed: String, personality: String, profilePicture: String, suburb: String): Dog
        createMatch(recipientId: ID!): Match
        updateMatchStatus(_id: ID!, status: MatchStatus!): Match
        removeFriend(friendId: ID!): Dog
        sendMessage(recipientId: ID!, content: String!): Message
    }
`;

export default typeDefs;