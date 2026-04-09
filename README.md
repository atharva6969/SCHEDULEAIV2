# ScheduleAI

Hackathon MVP for conflict-aware academic timetable generation.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Solver: Backtracking with preference scoring, room capacity checks, and practical-slot handling
- AI layer: Claude-compatible parser when `ANTHROPIC_API_KEY` is available, with heuristic fallback
- Export: PDF from the frontend and iCal from the backend

## What It Does

- Teachers enter course load requirements as theory and practical hours needed per week
- The scheduler fits those classes into free slots while respecting section overlap, room type, and room capacity
- If a teacher is absent, a substitute can be assigned only when that teacher has a free period in the same slot

## Run locally

### Backend

```powershell
cd C:\Users\pc\Documents\`PROJECTS\ScheduleAI\backend
Copy-Item .env.example .env
npm run dev
```

### Frontend

```powershell
cd C:\Users\pc\Documents\`PROJECTS\ScheduleAI\frontend
npm run dev
```

Backend runs on `http://localhost:4000` and frontend runs on Vite's default port with `/api` proxied to the backend.

## GitHub Ready

- Root `.gitignore` excludes `node_modules`, `dist`, logs, and local env files
- `backend/.env.example` is safe to commit as the API key template
- `LICENSE` is included with an MIT license
