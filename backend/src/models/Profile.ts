import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  source: 'resume' | 'self_assessed' | 'inferred';
}

export interface IProject {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  impact?: string;
}

export interface IEducation {
  institution: string;
  degree: string;
  field: string;
  startDate?: Date;
  endDate?: Date;
  current: boolean;
}

export interface IExperience {
  company: string;
  role: string;
  startDate?: Date;
  endDate?: Date;
  current: boolean;
  description: string;
}

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  resumeUrl?: string;
  resumeText?: string;
  parsedData: {
    skills: ISkill[];
    projects: IProject[];
    education: IEducation[];
    experience: IExperience[];
  };
  targetRoles: string[];
  preferences: {
    companySize: 'startup' | 'mid' | 'enterprise' | 'any';
    location: string[];
    remote: boolean;
    notifications?: {
      emailNotifications: boolean;
      assessmentReminders: boolean;
      weeklyDigest: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema: Schema = new Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  category: { type: String, default: 'general' },
  source: { type: String, enum: ['resume', 'self_assessed', 'inferred'], default: 'resume' },
});

const ProjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  link: { type: String },
  impact: { type: String },
});

const EducationSchema: Schema = new Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
});

const ExperienceSchema: Schema = new Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String },
});

const ProfileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    resumeUrl: { type: String, default: null },
    resumeText: { type: String, default: null },
    parsedData: {
      skills: [SkillSchema],
      projects: [ProjectSchema],
      education: [EducationSchema],
      experience: [ExperienceSchema],
    },
    targetRoles: [{ type: String }],
    preferences: {
      companySize: { type: String, enum: ['startup', 'mid', 'enterprise', 'any'], default: 'any' },
      location: [{ type: String }],
      remote: { type: Boolean, default: true },
      notifications: {
        emailNotifications: { type: Boolean, default: true },
        assessmentReminders: { type: Boolean, default: true },
        weeklyDigest: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true,
  }
);

ProfileSchema.index({ userId: 1 });

export default mongoose.model<IProfile>('Profile', ProfileSchema);
