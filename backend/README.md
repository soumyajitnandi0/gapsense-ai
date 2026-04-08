# GapSense AI Backend

A comprehensive Node.js/Express backend for GapSense AI - a Gen-AI powered readiness & gap-analysis platform.

## Features

- **Authentication**: JWT-based auth with Google OAuth and email/password support
- **Profile Management**: Resume upload & parsing (PDF/DOCX), skill extraction
- **Role Management**: Predefined role templates with skill requirements
- **Assessment Engine**: Readiness scoring with sub-scores and gap analysis
- **Roadmap Generation**: Personalized 30/60/90-day learning plans
- **AI Career Coach**: Chat interface with resume feedback and mock interviews
- **Progress Tracking**: Task completion and score improvement tracking

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **AI/ML**: OpenAI GPT-4o-mini for parsing and generation
- **Auth**: Passport.js (JWT + Google OAuth)
- **File Upload**: Multer
- **Validation**: express-validator + Zod

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB database (local or Atlas)
- OpenAI API key
- Google OAuth credentials (optional, for social login)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run database seeds (optional):
```bash
npm run seed
```

4. Start the development server:
```bash
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Email/password registration
- `POST /api/auth/login` - Email/password login
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Profile
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create/update profile
- `POST /api/profile/resume` - Upload resume
- `PUT /api/profile/target-roles` - Update target roles
- `POST /api/profile/skills` - Add skill manually

### Roles
- `GET /api/roles` - List all roles
- `GET /api/roles/:id` - Get specific role
- `POST /api/roles/from-jd` - Create role from job description

### Assessments
- `GET /api/assessments` - List user assessments
- `GET /api/assessments/latest` - Get latest assessment
- `POST /api/assessments` - Create new assessment
- `POST /api/assessments/:id/reassess` - Re-assess with updated profile

### Roadmaps
- `GET /api/roadmaps/:assessmentId` - Get roadmap
- `GET /api/roadmaps/progress/all` - Get all progress
- `POST /api/roadmaps/progress/:assessmentId/tasks` - Update task completion
- `POST /api/roadmaps/:assessmentId/regenerate` - Regenerate roadmap

### Chat / AI Coach
- `GET /api/chat/sessions` - List chat sessions
- `GET /api/chat/session` - Get active session
- `POST /api/chat/message` - Send message
- `POST /api/chat/mock-interview/questions` - Generate interview questions
- `POST /api/chat/mock-interview/evaluate` - Evaluate interview answer
- `POST /api/chat/resume-feedback` - Get resume feedback

## Project Structure

```
src/
├── config/           # Database, Passport, OpenAI config
├── models/           # Mongoose models (User, Profile, Role, etc.)
├── middleware/       # Auth, error handling, rate limiting
├── services/         # Business logic (resume parser, scoring, roadmap)
├── routes/           # API route handlers
├── utils/            # Utility functions
├── seeds/            # Database seed data
└── index.ts          # Entry point
```

## Key Features Explained

### Resume Parsing
Uses OpenAI to extract structured data from PDF/DOCX resumes including:
- Skills with inferred proficiency levels
- Projects with technologies used
- Education and work experience
- Contact information

### Readiness Scoring
Weighted scoring algorithm (0-100) based on:
- Core Skills Match (35%)
- Skill Depth (20%)
- Project Relevance (20%)
- Experience (15%)
- Resume Quality (10%)

### Gap Analysis
Identifies top 5 priority gaps with:
- Current vs required skill levels
- Priority ranking (high/medium/low)
- Rationale for each gap

### Roadmap Generation
Creates personalized learning plans with:
- Weekly milestones with tasks
- Estimated time commitments
- Curated resources (RAG-based)
- Project suggestions
- Progress tracking

### AI Career Coach
Context-aware chat assistant that can:
- Answer career questions
- Provide resume feedback
- Generate mock interview questions
- Evaluate interview answers
- Suggest next steps

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## License

MIT License
