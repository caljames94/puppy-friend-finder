import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User.js";
import { Dog, IDog } from "../models/Dog.js";
import { Match, IMatch, MatchStatus } from "../models/Match.js";

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

    getUser: async (_, { id }: { id: string }) => {
      return await User.findById(id);
    },

    // Dog queries
    getDog: async (_, { id }: { id: string }) => {
      return await Dog.findById(id).populate("owner");
    },

    getDogsBySuburb: async (_, { suburb }: { suburb: string }) => {
      return await Dog.find({ suburb }).populate("owner");
    },

    getDogsForMatching: async (_, { dogId }: { dogId: string }) => {
      const dog = await Dog.findById(dogId);
      if (!dog) throw new UserInputError("Dog not found");

      return await Dog.find({
        suburb: dog.suburb,
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
      }).populate("dogA dogB");
    },

    getPendingMatches: async (_, { dogId }: { dogId: string }) => {
      return await Match.find({
        $or: [
          { dogA: dogId, dogAStatus: MatchStatus.PENDING },
          { dogB: dogId, dogBStatus: MatchStatus.PENDING },
        ],
      }).populate("dogA dogB");
    },
  },

  Mutation: {
    // User mutations
    register: async (_, { input }: { input: CreateUserInput }) => {
      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) {
        throw new UserInputError("Email already registered");
      }

      const user = new User(input);
      return await user.save();
    },

    login: async (
      _,
      { email, password }: { email: string; password: string }
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
      _,
      { id, input }: { id: string; input: UpdateUserInput },
      { user }: Context
    ) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      if (user.id !== id) throw new AuthenticationError("Not authorized");

      return await User.findByIdAndUpdate(id, input, { new: true });
    },

    // Dog mutations
    createDog: async (
      _,
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
      _,
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

    deleteDog: async (_, { id }: { id: string }, { user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const dog = await Dog.findById(id);
      if (!dog) throw new UserInputError("Dog not found");
      if (dog.owner.toString() !== user.id)
        throw new AuthenticationError("Not authorized");

      await Dog.findByIdAndDelete(id);
      await User.findByIdAndUpdate(user.id, { $unset: { dog: 1 } });

      return true;
    },

    // Match mutations
    createMatch: async (_, { dogA, dogB }: { dogA: string; dogB: string }) => {
      const match = new Match({
        dogA,
        dogB,
        dogAStatus: MatchStatus.PENDING,
        dogBStatus: MatchStatus.PENDING,
      });

      return (await match.save()).populate("dogA dogB");
    },

    updateMatchStatus: async (
      _,
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
