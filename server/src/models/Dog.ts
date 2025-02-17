import { Schema, model, Document } from 'mongoose';

interface IDog extends Document {
  name: string;
  age: number;
  breed: string;
  personality: string;
  profilePicture: string;
  suburb: string;
  owner: Schema.Types.ObjectId;
  matches: Schema.Types.ObjectId[];
  friends: Schema.Types.ObjectId[];
}

const dogSchema = new Schema<IDog>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
  },
  breed: {
    type: String,
    required: true,
  },
  personality: String,
  profilePicture: String,
  suburb: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  matches: [{
    type: Schema.Types.ObjectId,
    ref: 'Dog',
  }],
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'Dog',
  }],
}, {
  timestamps: true,
});

const Dog = model<IDog>('Dog', dogSchema);

export default Dog;