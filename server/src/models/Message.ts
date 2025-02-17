import { Schema, model, Document } from 'mongoose';

interface IMessage extends Document {
  sender: Schema.Types.ObjectId;
  recipient: Schema.Types.ObjectId;
  content: string;
  replyTo?: Schema.Types.ObjectId;
}

const messageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
  },
}, {
  timestamps: true,
});

const Message = model<IMessage>('Message', messageSchema);

export default Message;