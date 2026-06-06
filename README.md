# Partyverse

Instant multiplayer party games in your browser. Mobile-first, PWA-ready, and built for fun.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update .env with your database URL and origins
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate --schema packages/db/prisma/schema.prisma
   ```

4. Run development servers:
   ```bash
   npm run dev
   ```

## Architecture

This is a monorepo managed with npm workspaces:

- `apps/web`: Next.js frontend with Tailwind CSS and Framer Motion.
- `apps/socket-server`: Node.js Express server with Socket.io for real-time game state.
- `packages/shared-types`: Shared TypeScript interfaces and game definitions.
- `packages/db`: Prisma schema and client for PostgreSQL.

## Mini Games

- **Draw & Guess**: Traditional sketch and guess.
- **Bluff Master**: Submit fake answers to fool your friends.
- **Meme Battle**: Pick templates and write the funniest captions.
- **Trivia Showdown**: Speed quizzes on multiple categories.
- **Secret Spy**: Find the spy among you or guess the secret location.
- **Mafia**: Classic social deduction with roles and night phases.
- **Telephone Drawing**: Chain of drawing and guessing (Coming Soon).
- **Most Likely To**: Vote on who is most likely to do something.
- **Would You Rather**: Choose between two impossible options.
- **Fastest Finger**: Rapid reaction response challenge.

## Deployment

### Web App (Vercel)

1. Set `DATABASE_URL` in Vercel project settings.
2. Set `NEXT_PUBLIC_SOCKET_URL` to your deployed socket server URL.
3. Build command: `npm run build` (Next.js handles workspaces).

### Socket Server (Railway/Render/etc.)

1. Set `PORT` and `WEB_ORIGIN`.
2. Build command: `npm run build --workspace @partyverse/shared && tsc`
3. Start command: `node dist/index.js`

## Features

- **Nickname-only Auth**: No passwords, just pick a name and play.
- **Realtime Multiplayer**: Powered by Socket.io.
- **PWA**: Installable on iOS and Android for a native feel.
- **Progression**: Earn XP and coins, unlock titles and achievements.
