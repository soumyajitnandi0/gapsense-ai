import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  picture?: string;
  authProvider: 'google' | 'email';
  googleId?: string;
  githubId?: string;
  githubUsername?: string;
  githubAccessToken?: string;
  githubConnectedAt?: Date;
  // Notion integration
  notionAccessToken?: string;
  notionWorkspaceId?: string;
  notionWorkspaceName?: string;
  notionBotId?: string;
  notionConnectedAt?: Date;
  // LinkedIn integration
  linkedinAccessToken?: string;
  linkedinRefreshToken?: string;
  linkedinId?: string;
  linkedinConnectedAt?: Date;
  onboardingComplete?: boolean;
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
    githubId: {
      type: String,
      default: null,
    },
    githubUsername: {
      type: String,
      default: null,
    },
    githubAccessToken: {
      type: String,
      default: null,
      select: false, // Don't include in queries by default for security
    },
    githubConnectedAt: {
      type: Date,
      default: null,
    },
    // Notion integration fields
    notionAccessToken: {
      type: String,
      default: null,
      select: false,
    },
    notionWorkspaceId: {
      type: String,
      default: null,
    },
    notionWorkspaceName: {
      type: String,
      default: null,
    },
    notionBotId: {
      type: String,
      default: null,
    },
    notionConnectedAt: {
      type: Date,
      default: null,
    },
    // LinkedIn integration fields
    linkedinAccessToken: {
      type: String,
      default: null,
      select: false,
    },
    linkedinRefreshToken: {
      type: String,
      default: null,
      select: false,
    },
    linkedinId: {
      type: String,
      default: null,
    },
    linkedinConnectedAt: {
      type: Date,
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
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ githubId: 1 });
UserSchema.index({ notionWorkspaceId: 1 });
UserSchema.index({ linkedinId: 1 });

export default mongoose.model<IUser>('User', UserSchema);
