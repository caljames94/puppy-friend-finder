import {Schema} from 'mongoose';
import db from '../config/connection.js'
import { User, Dog, Match } from '../models/index.js';
import { IUser } from '../models/User.js';
import { MatchStatus } from '../models/Match.js';
import bcrypt from 'bcrypt';


const seedDatabase = async () => {
  try {
    //Connect to the database
    await db();

    // Clear existing data
    await User.deleteMany({});
    await Dog.deleteMany({});
    await Match.deleteMany({});

    // Create Users
    const users: IUser[] = [];
    for (let i = 1; i <= 15; i++) {
      const user = new User({
        name: `user${i}`,
        email: `user${i}@example.com`,
        password: await bcrypt.hash('password123', 10),
      });
      await user.save();
      users.push(user);
    }

    // Create Dogs
    const dogs = [];
    const breeds = ['Labrador', 'Golden Retriever', 'German Shepherd', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Boxer', 'Dachshund', 'Siberian Husky'];
    const suburbs = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Wollongong', 'Hobart'];
    for (let i = 0; i < users.length; i++) {
      const dog = new Dog({
        name: `Dog${i + 1}`,
        age: Math.floor(Math.random() * 10) + 1,
        breed: breeds[Math.floor(Math.random() * breeds.length)],
        personality: ['Friendly', 'Playful', 'Energetic', 'Calm', 'Shy', 'Independent', 'Social'][Math.floor(Math.random() * 7)],
        profilePicture: `https://example.com/dog${i + 1}.jpg`,
        suburb: suburbs[Math.floor(Math.random() * suburbs.length)],
        owner: users[i]._id,
      });
      await dog.save();
      dogs.push(dog);

      // Assign the dog to the user
      users[i].dog = dog._id as unknown as Schema.Types.ObjectId;
      await users[i].save();
    }

    // Create Matches
    const matches = [
      { dogA: dogs[0]._id, dogB: dogs[1]._id, dogAStatus: MatchStatus.ACCEPTED, dogBStatus: MatchStatus.ACCEPTED },
      { dogA: dogs[2]._id, dogB: dogs[3]._id, dogAStatus: MatchStatus.ACCEPTED, dogBStatus: MatchStatus.PENDING },
      { dogA: dogs[4]._id, dogB: dogs[5]._id, dogAStatus: MatchStatus.PENDING, dogBStatus: MatchStatus.PENDING },
      { dogA: dogs[6]._id, dogB: dogs[7]._id, dogAStatus: MatchStatus.REJECTED, dogBStatus: MatchStatus.ACCEPTED },
      { dogA: dogs[8]._id, dogB: dogs[9]._id, dogAStatus: MatchStatus.ACCEPTED, dogBStatus: MatchStatus.ACCEPTED },
    ];

    for (const matchData of matches) {
      const match = new Match(matchData);
      await match.save();
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Handle any unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
  process.exit(1);
});

seedDatabase();