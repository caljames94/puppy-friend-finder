import db from '../config/connection.js';
import { Dog, Match, Message, User } from '../models/index.js';
import cleanDB from './cleanDB.js';

const seedDatabase = async (): Promise<void> => {
  try {
    await db();
    await cleanDB();

    // Create 10 users with dogs
    const users = [];
    const dogs = [];
    for (let i = 0; i < 10; i++) {
      const user = await User.create({
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: 'password123'
      });
      users.push(user);

      const dog = await Dog.create({
        name: `Dog ${i + 1}`,
        age: Math.floor(Math.random() * 10) + 1,
        breed: `Breed ${i + 1}`,
        personality: `Friendly and playful ${i + 1}`,
        profilePicture: `https://example.com/dog${i + 1}.jpg`,
        suburb: `Suburb ${i + 1}`,
        owner: user._id
      });
      dogs.push(dog);

      // Update user with dog reference
      await User.findByIdAndUpdate(user._id, { dog: dog._id });
    }

    // Create 4 matches with different statuses
    const matchStatuses = ['pending', 'accepted', 'rejected', 'accepted'];
    const matches = [];
    for (let i = 0; i < 4; i++) {
      const sender = dogs[i];
      const recipient = dogs[i + 5]; // Pair dogs from different halves of the array
      const match = await Match.create({
        sender: sender._id,
        recipient: recipient._id,
        status: matchStatuses[i],
        createdAt: new Date()
      });
      matches.push(match);

      // Update dogs with the new match
      await Dog.findByIdAndUpdate(sender._id, { $push: { matches: match._id } });
      await Dog.findByIdAndUpdate(recipient._id, { $push: { matches: match._id } });

      // If the match is accepted, add them as friends
      if (matchStatuses[i] === 'accepted') {
        await Dog.findByIdAndUpdate(sender._id, { $push: { friends: recipient._id } });
        await Dog.findByIdAndUpdate(recipient._id, { $push: { friends: sender._id } });
      }
    }

    // Create 2 messages for each accepted match
    for (const match of matches) {
      if (match.status === 'accepted') {
        const sender = await User.findOne({ dog: match.sender });
        const recipient = await User.findOne({ dog: match.recipient });

        if (sender && recipient) {
          for (let i = 0; i < 2; i++) {
            await Message.create({
              sender: sender._id,
              recipient: recipient._id,
              content: `Message ${i + 1} from ${sender.name} to ${recipient.name}`,
              createdAt: new Date()
            });
          }
        }
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();