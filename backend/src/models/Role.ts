import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillRequirement {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  weight: number;
  required: boolean;
  category: string;
}

export interface IRole extends Document {
  name: string;
  description: string;
  category: string;
  companyType: 'faang' | 'startup' | 'enterprise' | 'any';
  skills: ISkillRequirement[];
  experienceLevel: 'entry' | 'mid' | 'senior';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SkillRequirementSchema: Schema = new Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  weight: { type: Number, default: 1.0 },
  required: { type: Boolean, default: true },
  category: { type: String, required: true },
});

const RoleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    companyType: {
      type: String,
      enum: ['faang', 'startup', 'enterprise', 'any'],
      default: 'any',
    },
    skills: [SkillRequirementSchema],
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior'],
      default: 'entry',
    },
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' },
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

RoleSchema.index({ name: 1 });
RoleSchema.index({ category: 1 });
RoleSchema.index({ isActive: 1 });

export default mongoose.model<IRole>('Role', RoleSchema);
