import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  picture?: string;
  authProvider: 'google' | 'email';
  googleId?: string;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.authProvider === 'email';
      },
    },
    picture: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ['google', 'email'],
      default: 'email',
    },
    googleId: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });

export default mongoose.model<IUser>('User', UserSchema);
