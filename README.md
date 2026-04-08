# GapSense AI - Career Readiness Platform

This project is a monorepo containing both the frontend and backend applications for GapSense AI.

## Project Structure

-   `frontend/`: The Next.js application (User Interface)
-   `backend/`: The FastAPI application (API & Logic)

## Getting Started

### 1. Frontend (Next.js)

To run the frontend development server:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 2. Backend (FastAPI)

To run the backend server:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000).
Docs are available at [http://localhost:8000/docs](http://localhost:8000/docs).

## Features

-   **Frontend**: Built with Next.js 16, Tailwind CSS, and Shadcn UI.
-   **Backend**: Built with Python FastAPI.
-   **Theming**: Custom Orbitaix theme (Deep Space / Glassmorphism).
