import { signToken, AuthenticationError } from '../utils/auth.js';
import { User } from '../models/index.js';

interface LoginArgs {
    email: string;
    password: string;
}

interface AddUseerArgs {
    name: string;
    email: string;
    password: string;
}

const resolvers = {
  Mutation: {
    login: async (_parent: any, { email, password }: LoginArgs) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user.name, user.email, user._id);

      return { token, user };
    },

    addUser: async (_parent: any, { name, email, password }: AddUseerArgs) => {
      const user = await User.create({ name, email, password });
      const token = signToken(user.name, user.email, user._id);

      return { token, user };
    },
  },
};

export default resolvers;