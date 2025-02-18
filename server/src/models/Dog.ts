import { Schema, model, Document, Types } from 'mongoose';

interface IDog extends Document {
  name: string;
  age: number;
  breed: string;
  personality: string;
  profilePicture: string;
  suburb: string;
  owner: Types.ObjectId;
  matches: Types.ObjectId[];
  friends: Types.ObjectId[];
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
  personality: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    required: true,
  },
  suburb: {
    type: String,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  matches: [{
    type: Schema.Types.ObjectId,
    ref: 'Match',
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