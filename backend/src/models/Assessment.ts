import mongoose, { Schema, Document } from 'mongoose';

export interface IGap {
  skill: string;
  currentLevel: string;
  requiredLevel: string;
  priority: 'high' | 'medium' | 'low';
  rationale: string;
}

export interface ISubScore {
  category: string;
  score: number;
  maxScore: number;
  weight: number;
  explanation: string;
}

export interface IRoadmapMilestone {
  week: number;
  title: string;
  tasks: {
    id: string;
    title: string;
    description: string;
    estimatedHours: number;
    resources: {
      title: string;
      url?: string;
      type: 'video' | 'article' | 'course' | 'practice';
    }[];
    completed: boolean;
  }[];
}

export interface IProjectSuggestion {
  title: string;
  description: string;
  technologies: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDays: number;
  relevance: string;
}

export interface IAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  overallScore: number;
  maxScore: number;
  confidence: number;
  subScores: ISubScore[];
  gaps: IGap[];
  matchedSkills: string[];
  missingSkills: string[];
  roadmap?: {
    duration: number;
    milestones: IRoadmapMilestone[];
    projectSuggestions: IProjectSuggestion[];
    targetCompletionDate: Date;
  };
  explanations: {
    factor: string;
    impact: string;
    suggestion: string;
  }[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const GapSchema: Schema = new Schema({
  skill: { type: String, required: true },
  currentLevel: { type: String, required: true },
  requiredLevel: { type: String, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], required: true },
  rationale: { type: String, required: true },
});

const SubScoreSchema: Schema = new Schema({
  category: { type: String, required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  weight: { type: Number, required: true },
  explanation: { type: String, required: true },
});

const RoadmapTaskSchema: Schema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  estimatedHours: { type: Number, required: true },
  resources: [{
    title: { type: String, required: true },
    url: { type: String },
    type: { type: String, enum: ['video', 'article', 'course', 'practice'], required: true },
  }],
  completed: { type: Boolean, default: false },
});

const RoadmapMilestoneSchema: Schema = new Schema({
  week: { type: Number, required: true },
  title: { type: String, required: true },
  tasks: [RoadmapTaskSchema],
});

const ProjectSuggestionSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  estimatedDays: { type: Number, required: true },
  relevance: { type: String, required: true },
});

const AssessmentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    confidence: {
      type: Number,
      default: 0.8,
      min: 0,
      max: 1,
    },
    subScores: [SubScoreSchema],
    gaps: [GapSchema],
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    roadmap: {
      duration: { type: Number, default: 60 },
      milestones: [RoadmapMilestoneSchema],
      projectSuggestions: [ProjectSuggestionSchema],
      targetCompletionDate: { type: Date },
    },
    explanations: [{
      factor: { type: String, required: true },
      impact: { type: String, required: true },
      suggestion: { type: String, required: true },
    }],
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

AssessmentSchema.index({ userId: 1, createdAt: -1 });
AssessmentSchema.index({ roleId: 1 });
AssessmentSchema.index({ userId: 1, roleId: 1 });

export default mongoose.model<IAssessment>('Assessment', AssessmentSchema);
