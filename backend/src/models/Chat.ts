import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'resume_feedback' | 'interview_question' | 'roadmap_suggestion' | 'skill_advice' | 'general';
    score?: number;
    resources?: string[];
  };
}

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  messages: IMessage[];
  context: {
    currentRoleId?: mongoose.Types.ObjectId;
    currentAssessmentId?: mongoose.Types.ObjectId;
    topic?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const MessageSchema: Schema = new Schema({
  role: { 
    type: String, 
    enum: ['user', 'assistant', 'system'], 
    required: true 
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: {
    type: { type: String, enum: ['resume_feedback', 'interview_question', 'roadmap_suggestion', 'skill_advice', 'general'] },
    score: { type: Number },
    resources: [{ type: String }],
  },
});

const ChatSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    messages: [MessageSchema],
    context: {
      currentRoleId: { type: Schema.Types.ObjectId, ref: 'Role' },
      currentAssessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment' },
      topic: { type: String },
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

ChatSchema.index({ userId: 1, createdAt: -1 });
ChatSchema.index({ sessionId: 1 });

export default mongoose.model<IChat>('Chat', ChatSchema);
