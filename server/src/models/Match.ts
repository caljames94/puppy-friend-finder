import { Schema, model, Document } from 'mongoose';

interface IMatch extends Document {
  sender: Schema.Types.ObjectId;
  recipient: Schema.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
}

const matchSchema = new Schema<IMatch>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'Dog',
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'Dog',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

const Match = model<IMatch>('Match', matchSchema);

export default Match;