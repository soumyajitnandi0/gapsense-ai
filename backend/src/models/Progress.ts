import mongoose, { Schema, Document } from 'mongoose';

export interface ICompletedTask {
  taskId: string;
  milestoneWeek: number;
  completedAt: Date;
  notes?: string;
}

export interface IProgressUpdate {
  date: Date;
  type: 'task_completed' | 'skill_added' | 'project_added' | 'certificate_added' | 'reassessment';
  description: string;
  scoreChange?: number;
  metadata?: Record<string, any>;
}

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId;
  roadmapId: string;
  completedTasks: ICompletedTask[];
  completedProjects: string[];
  completedSkills: string[];
  progressPercentage: number;
  estimatedDaysRemaining: number;
  streakDays: number;
  lastActivityDate: Date;
  history: IProgressUpdate[];
  createdAt: Date;
  updatedAt: Date;
}

const CompletedTaskSchema: Schema = new Schema({
  taskId: { type: String, required: true },
  milestoneWeek: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
  notes: { type: String },
});

const ProgressUpdateSchema: Schema = new Schema({
  date: { type: Date, default: Date.now },
  type: { 
    type: String, 
    enum: ['task_completed', 'skill_added', 'project_added', 'certificate_added', 'reassessment'],
    required: true 
  },
  description: { type: String, required: true },
  scoreChange: { type: Number },
  metadata: { type: Schema.Types.Mixed },
});

const ProgressSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    roadmapId: { type: String, required: true },
    completedTasks: [CompletedTaskSchema],
    completedProjects: [{ type: String }],
    completedSkills: [{ type: String }],
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    estimatedDaysRemaining: {
      type: Number,
      default: 60,
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    lastActivityDate: {
      type: Date,
      default: Date.now,
    },
    history: [ProgressUpdateSchema],
  },
  {
    timestamps: true,
  }
);

ProgressSchema.index({ userId: 1 });
ProgressSchema.index({ assessmentId: 1 });

export default mongoose.model<IProgress>('Progress', ProgressSchema);
