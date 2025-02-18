import { Dog, Match, Message, User } from '../models/index.js';
import process from 'process';

const cleanDB = async (): Promise<void> => {
  try {
    // Delete documents from User collection
    await User.deleteMany({});
    console.log('Thought collection cleaned.');

    // Delete documents from Dog collection
    await Dog.deleteMany({});
    console.log('User collection cleaned.');

    await Match.deleteMany({});
    console.log('Match collection cleaned.');

    await Message.deleteMany({});
    console.log('Message collection cleaned.');

  } catch (err) {
    console.error('Error cleaning collections:', err);
    process.exit(1);
  }
};

export default cleanDB;
