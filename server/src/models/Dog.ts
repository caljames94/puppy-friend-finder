import { Schema, model, Document } from 'mongoose';
import { MatchStatus } from './Match';

export interface IDog extends Document {
  name: string;
  age: number;
  breed: string;
  personality: string[];
  profilePicture: string;
  suburb: string;
  owner: Schema.Types.ObjectId;
  getPendingMatches(): Promise<any[]>;
  getConfirmedMatches(): Promise<any[]>;
}

const dogSchema = new Schema<IDog>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 30
  },
  breed: {
    type: String,
    required: true,
    trim: true
  },
  personality: [{
    type: String,
    enum: ['Friendly', 'Playful', 'Energetic', 'Calm', 'Shy', 'Independent', 'Social']
  }],
  profilePicture: {
    type: String,
    required: true
  },
  suburb: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual field for pending matches
dogSchema.virtual('pendingMatches', {
  ref: 'Match',
  localField: '_id',
  foreignField: 'dogB',
  match: { dogBStatus: MatchStatus.PENDING }
});

// Methods to get matches
dogSchema.methods.getPendingMatches = async function(): Promise<any[]> {
  const matches = await this.model('Match').find({
    $or: [
      { dogA: this._id, dogAStatus: MatchStatus.PENDING },
      { dogB: this._id, dogBStatus: MatchStatus.PENDING }
    ]
  }).populate('dogA dogB');
  return matches;
};

dogSchema.methods.getConfirmedMatches = async function(): Promise<any[]> {
  const matches = await this.model('Match').find({
    $or: [
      { dogA: this._id },
      { dogB: this._id }
    ],
    dogAStatus: MatchStatus.ACCEPTED,
    dogBStatus: MatchStatus.ACCEPTED
  }).populate('dogA dogB');
  return matches;
};

export const Dog = model<IDog>('Dog', dogSchema);