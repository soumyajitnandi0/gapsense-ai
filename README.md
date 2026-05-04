# GapSense AI - Career Readiness Platform

An AI-powered career readiness and gap-analysis platform that helps students and engineers identify skill gaps, generate personalized learning roadmaps, and accelerate their career growth.

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + Radix UI (Shadcn)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + Passport.js (Local + Google OAuth)
- **AI Providers**: Google Gemini, Groq (LLaMA), OpenAI

## Project Structure

```
gapsense-ai/
├── frontend/          # Next.js application
│   ├── app/           # App Router pages
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React contexts (Auth)
│   ├── lib/           # Utilities, API client, Zustand store
│   └── public/        # Static assets
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── config/    # Database, Passport config
│   │   ├── middleware/ # Auth, error handling
│   │   ├── models/    # Mongoose schemas
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic & AI integrations
│   │   └── utils/     # Logger, helpers
│   └── uploads/       # Resume file storage
└── README.md
```

## Features

- **Resume Parsing** — AI-powered extraction of skills, experience, and projects
- **Gap Analysis** — Compare your profile against target role requirements
- **Readiness Score** — Quantified 0-100 score with sub-category breakdown
- **60-Day Roadmap** — Week-by-week personalized learning plan
- **AI Career Coach** — 24/7 chat support for interview prep and career guidance
- **Mock Interviews** — AI-generated interview sessions with real-time feedback
- **GitHub Integration** — Analyze repositories for technical depth
- **LinkedIn Integration** — Import professional profile data
- **Notion Export** — Push roadmaps and prep sheets to Notion
- **Progress Tracking** — Monitor learning streak, tasks, and skill mastery

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- API keys for AI providers (see `.env.example`)

### 1. Backend

```bash
cd backend
cp .env.example .env   # Fill in your API keys
npm install
npm run dev            # Starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev            # Starts on http://localhost:3000
```

### Environment Variables

See `backend/.env.example` for all required environment variables including:
- MongoDB connection string
- JWT secret
- Google OAuth credentials
- AI provider API keys (Gemini, Groq)
- GitHub, LinkedIn, Notion OAuth credentials

## API Documentation

The backend exposes RESTful endpoints under `/api`:

| Endpoint | Description |
|---|---|
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | Login with email/password |
| `GET /api/auth/google` | Google OAuth flow |
| `GET /api/auth/me` | Get current user |
| `POST /api/profile/resume` | Upload and parse resume |
| `POST /api/assessments` | Create readiness assessment |
| `GET /api/assessments/latest` | Get latest assessment |
| `POST /api/onboarding/complete` | Complete onboarding flow |
| `GET /api/progress` | Get progress data |
| `POST /api/chat/message` | Send AI coach message |
| `GET /api/github/repos` | Fetch GitHub repositories |
| `GET /api/roles` | List available roles |

## Design System

The frontend uses a **"Quiet Luxury"** design aesthetic featuring:
- Warm light palette (`#FAF9F6` background, `#111` text)
- Amber/gold accent colors
- Glass-morphism panels with subtle shadows
- Rounded corners (2rem+) throughout
- Premium typography with tight tracking

## License

MIT
