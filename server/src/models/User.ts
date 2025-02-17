import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  dog: Schema.Types.ObjectId;
  isCorrectPassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    unique: false,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Must match an email address!'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  dog: {
    type: Schema.Types.ObjectId,
    ref: 'Dog',
  },
}, {
  timestamps: true,
});

userSchema.pre<IUser>('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

userSchema.methods.isCorrectPassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const User = model<IUser>('User', userSchema);

export default User;