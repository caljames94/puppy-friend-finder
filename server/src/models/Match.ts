import { Schema, model, Document } from 'mongoose';

export enum MatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

// Interface for the Match document
export interface IMatch extends Document {
  dogA: Schema.Types.ObjectId;
  dogB: Schema.Types.ObjectId;
  dogAStatus: MatchStatus;
  dogBStatus: MatchStatus;
  createdAt: Date;
  updatedAt: Date;
  isMatched(): boolean;
  isPending(): boolean;
  isRejected(): boolean;
}

// Mongoose Schema
const matchSchema = new Schema<IMatch>({
  dogA: {
    type: Schema.Types.ObjectId,
    ref: 'Dog',
    required: true
  },
  dogB: {
    type: Schema.Types.ObjectId,
    ref: 'Dog',
    required: true
  },
  dogAStatus: {
    type: String,
    enum: Object.values(MatchStatus),
    default: MatchStatus.PENDING
  },
  dogBStatus: {
    type: String,
    enum: Object.values(MatchStatus),
    default: MatchStatus.PENDING
  }
}, {
  timestamps: true
});

// Instance methods
matchSchema.methods.isMatched = function(): boolean {
  return this.dogAStatus === MatchStatus.ACCEPTED && 
         this.dogBStatus === MatchStatus.ACCEPTED;
};

matchSchema.methods.isPending = function(): boolean {
  return this.dogAStatus === MatchStatus.PENDING || 
         this.dogBStatus === MatchStatus.PENDING;
};

matchSchema.methods.isRejected = function(): boolean {
  return this.dogAStatus === MatchStatus.REJECTED || 
         this.dogBStatus === MatchStatus.REJECTED;
};

// Ensure dogA and dogB are ordered consistently
matchSchema.pre('save', function(next) {
  if (this.dogA > this.dogB) {
    [this.dogA, this.dogB] = [this.dogB, this.dogA];
    [this.dogAStatus, this.dogBStatus] = [this.dogBStatus, this.dogAStatus];
  }
  next();
});

// Prevent duplicate matches
matchSchema.index({ dogA: 1, dogB: 1 }, { unique: true });

export const Match = model<IMatch>('Match', matchSchema);