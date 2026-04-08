import mongoose, { Schema, Document } from 'mongoose';

export interface IRelatedSkill {
  skillId: mongoose.Types.ObjectId;
  relationship: 'prerequisite' | 'related' | 'specialization';
  strength: number;
}

export interface ISkillResource {
  title: string;
  url?: string;
  type: 'video' | 'article' | 'course' | 'book' | 'practice';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours?: number;
  rating?: number;
  tags: string[];
}

export interface ISkillOntology extends Document {
  name: string;
  category: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  parentSkill?: mongoose.Types.ObjectId;
  relatedSkills: IRelatedSkill[];
  resources: ISkillResource[];
  industryDemand: number;
  frequencyInJobs: number;
  learningPath: string[];
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RelatedSkillSchema: Schema = new Schema({
  skillId: { type: Schema.Types.ObjectId, ref: 'SkillOntology', required: true },
  relationship: { 
    type: String, 
    enum: ['prerequisite', 'related', 'specialization'], 
    required: true 
  },
  strength: { type: Number, default: 0.5, min: 0, max: 1 },
});

const SkillResourceSchema: Schema = new Schema({
  title: { type: String, required: true },
  url: { type: String },
  type: { 
    type: String, 
    enum: ['video', 'article', 'course', 'book', 'practice'], 
    required: true 
  },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  estimatedHours: { type: Number },
  rating: { type: Number, min: 0, max: 5 },
  tags: [{ type: String }],
});

const SkillOntologySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    parentSkill: {
      type: Schema.Types.ObjectId,
      ref: 'SkillOntology',
    },
    relatedSkills: [RelatedSkillSchema],
    resources: [SkillResourceSchema],
    industryDemand: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1,
    },
    frequencyInJobs: {
      type: Number,
      default: 0,
    },
    learningPath: [{ type: String }],
    tags: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

SkillOntologySchema.index({ name: 1 });
SkillOntologySchema.index({ category: 1 });
SkillOntologySchema.index({ parentSkill: 1 });
SkillOntologySchema.index({ tags: 1 });
SkillOntologySchema.index({ isActive: 1 });

export default mongoose.model<ISkillOntology>('SkillOntology', SkillOntologySchema);
