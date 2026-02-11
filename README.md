# Life Quest

A life-gamification system that feels like **Solo Leveling meets Notion meets GitHub Contributions meets RPG Character Sheet**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Framer Motion |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM |
| **Database** | PostgreSQL 16 (Docker) |
| **Monorepo** | Turborepo + pnpm workspaces |

## Project Structure

```
life-quest/
├── apps/
│   ├── web/              # Next.js Frontend
│   └── server/           # Express Backend
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── utils/            # XP/Level/Rank formulas
│   └── ui/               # Shared UI components
├── docker-compose.yml    # PostgreSQL
└── turbo.json            # Turborepo config
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL)

### 1. Start the Database

```bash
docker-compose up -d
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Prisma

```bash
cd apps/server
pnpm run db:generate
pnpm run db:push
pnpm run db:seed
```

### 4. Start Development

```bash
# From the root
pnpm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

### Demo Account

After seeding:
- Email: `hunter@lifequest.dev`
- Password: `password123`

## Features (Phase 1 MVP)

- **Auth System** - JWT-based registration and login
- **Profile** - Avatar, Level, XP Bar, Rank (E through SSS)
- **Life Categories** - Customizable categories with subcategories, drag-and-drop reorder
- **Habit Tracker** - Yes/No or Hours tracking, streaks, XP rewards
- **Calendar Heatmap** - GitHub-style activity visualization
- **XP System** - Manual/Auto/Bonus/Streak XP types
- **Game Animations** - XP burst, level-up overlay, artifact glow
- **Command Palette** - Ctrl+K quick actions
- **User Control** - Manual level/XP overrides, edit history

## Game Mechanics

| Mechanic | Formula |
|----------|---------|
| Level | `floor(sqrt(totalXP / 100))` |
| Next Level XP | `(level + 1)^2 * 100` |
| Streak Bonus | `min(streak * 5, 50)` |
| Ranks | E -> D -> C -> B -> A -> S -> SS -> SSS |

## Design

Colorful Brutalism aesthetic:
- Hard edges, thick borders, no rounded corners
- Neon colors on dark backgrounds
- Press Start 2P arcade font for headings
- Game-like micro-animations

## API Endpoints

| Group | Endpoints |
|-------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Profile | `GET /api/profile`, `PATCH /api/profile` |
| Categories | CRUD at `/api/categories` + `PATCH /api/categories/reorder` |
| XP | `POST /api/xp/log`, `GET /api/xp/logs`, `PATCH /api/xp/logs/:id` |
| Habits | CRUD at `/api/habits` + `POST /api/habits/:id/complete` |
| Calendar | `GET /api/calendar?year=2026` |
