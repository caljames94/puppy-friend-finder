import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User.js";
import { Dog, IDog } from "../models/Dog.js";
import { Match, IMatch, MatchStatus } from "../models/Match.js";
// import dotenv from "dotenv";

export interface Context {
  user?: {
    id: string;
    email: string;
  };
}

interface AuthPayload {
  token: string;
  user: IUser;
}

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
}

interface CreateDogInput {
  name: string;
  age: number;
  breed: string;
  personality: string[];
  profilePicture: string;
  suburb: string;
}

interface UpdateDogInput {
  name?: string;
  age?: number;
  breed?: string;
  personality?: string[];
  profilePicture?: string;
  suburb?: string;
}

export const resolvers: IResolvers = {
  Query: {
    // User queries
    me: async (_, __, { user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      return await User.findById(user.id);
    },

    getUser: async (_: any, { id }: { id: string }) => {
      try {
        const user = await User.findById(id);
        console.log('Found user:', user);
        return user;
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },

    // Dog queries
    getDog: async (_, { id }: { id: string }) => {
      return await Dog.findById(id).populate("owner");
    },

    getDogsForMatching: async (_, { dogId }: { dogId: string }) => {
      const dog = await Dog.findById(dogId);
      if (!dog) throw new UserInputError("Dog not found");

      return await Dog.find({
        _id: { $ne: dogId },
      }).populate("owner");
    },

    // Match queries
    getMatch: async (_, { id }: { id: string }) => {
      return await Match.findById(id).populate("dogA dogB");
    },

    getMatchesByDog: async (_, { dogId }: { dogId: string }) => {
      return await Match.find({
        $or: [{ dogA: dogId }, { dogB: dogId }],
      }).populate({
        path: "dogA dogB",
        populate: {
          path: "owner",
          model: "User",
        }
        });
    },

    getPendingMatches: async (_, { dogId }: { dogId: string }) => {
      return await Match.find({
        $or: [
          { dogA: dogId, dogAStatus: MatchStatus.PENDING },
          { dogB: dogId, dogBStatus: MatchStatus.PENDING },
        ],
      }).populate({
        path: "dogA dogB",
        populate: {
          path: "owner",
          model: "User",
        }
        });
    }
  },

  Mutation: {
    // User mutations
    register: async (_:any, { input }: { input: CreateUserInput }) => {
      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) {
        throw new UserInputError("Email already registered");
      }

      const user = new User(input);
      return await user.save();
    },

    login: async ( _:any, { email, password }: { email: string; password: string }
    ): Promise<AuthPayload> => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new UserInputError("Invalid credentials");
      }

      const isValid = await user.isCorrectPassword(password);
      if (!isValid) {
        throw new UserInputError("Invalid credentials");
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1d" }
      );

      return { token, user };
    },

    updateUser: async (
      _:any,
      { id, input }: { id: string; input: UpdateUserInput },
      { user }: Context
    ) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      if (user.id !== id) throw new AuthenticationError("Not authorized");

      return await User.findByIdAndUpdate(id, input, { new: true });
    },

    // Dog mutations
    createDog: async (
      _:any,
      { input }: { input: CreateDogInput },
      { user }: Context
    ) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const dog = new Dog({
        ...input,
        owner: user.id,
      });

      const savedDog = await dog.save();
      await User.findByIdAndUpdate(user.id, { dog: savedDog.id });

      return savedDog.populate("owner");
    },

    updateDog: async (
      _:any,
      { id, input }: { id: string; input: UpdateDogInput },
      { user }: Context
    ) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const dog = await Dog.findById(id);
      if (!dog) throw new UserInputError("Dog not found");
      if (dog.owner.toString() !== user.id)
        throw new AuthenticationError("Not authorized");

      return await Dog.findByIdAndUpdate(id, input, { new: true }).populate(
        "owner"
      );
    },

    // Match mutations
    createMatch: async (_:any, { dogA, dogB }: { dogA: string; dogB: string }) => {

      const dogAExists = await Dog.findById(dogA);
      const dogBExists = await Dog.findById(dogB);
    
      if (!dogAExists || !dogBExists) {
        throw new UserInputError("One or both dogs not found");
      }

      const match = new Match({
        dogA,
        dogB,
        dogAStatus: MatchStatus.PENDING,
        dogBStatus: MatchStatus.PENDING,
      });

      return (await match.save()).populate("dogA dogB");
    },

    updateMatchStatus: async (
      _:any,
      {
        matchId,
        dogId,
        status,
      }: { matchId: string; dogId: string; status: MatchStatus }
    ) => {
      const match = await Match.findById(matchId);
      if (!match) throw new UserInputError("Match not found");

      if (match.dogA.toString() === dogId) {
        match.dogAStatus = status;
      } else if (match.dogB.toString() === dogId) {
        match.dogBStatus = status;
      } else {
        throw new UserInputError("Dog not part of this match");
      }

      return (await match.save()).populate("dogA dogB");
    },

    deleteMatch: async (_: any, { matchId }: { matchId: string }, { user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");
    
      const match = await Match.findById(matchId);
      if (!match) throw new UserInputError("Match not found");
    
      const userDog = await Dog.findOne({ owner: user.id });
      if (!userDog) throw new AuthenticationError("User does not own a dog");
    
      if (match.dogA.toString() !== userDog.id && match.dogB.toString() !== userDog.id) {
        throw new AuthenticationError("Not authorized to delete this match");
      }
    
      await Match.findByIdAndDelete(matchId);
    
      return { success: true, message: "Match successfully deleted"  };
    },
  },

  Dog: {
    pendingMatches: async (dog: IDog) => {
      return await dog.getPendingMatches();
    },
    confirmedMatches: async (dog: IDog) => {
      return await dog.getConfirmedMatches();
    },
  },

  User: {
    dog: async (user: IUser) => {
      return await Dog.findById(user.dog);
    },
  },

  Match: {
    isMatched: (match: IMatch) => match.isMatched(),
    isPending: (match: IMatch) => match.isPending(),
    isRejected: (match: IMatch) => match.isRejected(),
  },
};
