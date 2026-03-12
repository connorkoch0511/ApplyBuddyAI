# ApplyBuddyAI ⚡

AI-powered job application platform. Generate cover letters, optimize resumes, track applications, and ace interviews — all in one place.

## Features

- **AI Cover Letters** — Streaming, personalized cover letters powered by Claude AI
- **Resume Optimizer** — ATS analysis with match scores and keyword suggestions
- **Interview Prep** — 10 tailored questions with suggested answers
- **Job Search** — Browse 25+ mock job listings with smart filtering
- **Application Tracker** — Kanban board to track every application
- **Profile Management** — Store your resume, skills, and preferences

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth.js with GitHub OAuth
- **Database**: SQLite via Prisma ORM
- **AI**: Anthropic Claude API (streaming)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

---

## Prerequisites

- Node.js 18+
- npm or yarn
- A GitHub account (for OAuth)
- An Anthropic API key

---

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd applyai
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in all values (see sections below).

### 3. Set Up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: ApplyBuddyAI (or anything)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**
5. Copy the **Client ID** → paste as `GITHUB_CLIENT_ID` in `.env`
6. Click **Generate a new client secret** → paste as `GITHUB_CLIENT_SECRET` in `.env`

### 4. Set Up Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Go to **API Keys** and create a new key
4. Copy the key → paste as `ANTHROPIC_API_KEY` in `.env`

### 5. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Paste the output as `NEXTAUTH_SECRET` in `.env`.

### 6. Your `.env` file should look like:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<your-generated-secret>"
GITHUB_CLIENT_ID="<your-github-client-id>"
GITHUB_CLIENT_SECRET="<your-github-client-secret>"
ANTHROPIC_API_KEY="<your-anthropic-api-key>"
```

### 7. Set Up the Database

```bash
npx prisma generate
npx prisma db push
```

This creates a SQLite database at `prisma/dev.db`.

### 8. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running in Production

### Build

```bash
npm run build
npm start
```

### Database Commands

```bash
# Push schema changes to database
npm run db:push

# Regenerate Prisma client after schema changes
npm run db:generate
```

---

## Project Structure

```
applyai/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── cover-letter/     # Streaming cover letter generation
│   │   │   ├── resume-optimize/  # Resume vs JD analysis
│   │   │   └── interview-prep/   # Interview question generation
│   │   ├── applications/         # CRUD for job applications
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── jobs/search/          # Job listings API
│   │   └── profile/              # User profile CRUD
│   ├── applications/             # Kanban board page
│   ├── auth/signin/              # Sign in page
│   ├── cover-letter/             # Cover letter generator page
│   ├── dashboard/                # Dashboard page
│   ├── interview/                # Interview prep page
│   ├── jobs/                     # Job search page
│   ├── profile/                  # Profile editor page
│   ├── resume/                   # Resume optimizer page
│   ├── Nav.tsx                   # Navigation component
│   ├── NavWrapper.tsx            # SessionProvider wrapper
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── lib/
│   ├── anthropic.ts              # Anthropic client
│   ├── auth.ts                   # NextAuth config
│   └── prisma.ts                 # Prisma client singleton
├── prisma/
│   └── schema.prisma             # Database schema
├── middleware.ts                  # Route protection
└── .env.example                  # Environment template
```

---

## Troubleshooting

**"Module not found: @prisma/client"**
Run `npx prisma generate` to generate the Prisma client.

**"Prisma Client is not generated"**
Run `npx prisma db push` to create the database and generate the client.

**GitHub OAuth not working**
Make sure your callback URL in GitHub is exactly: `http://localhost:3000/api/auth/callback/github`

**AI features not working**
Check that your `ANTHROPIC_API_KEY` is set correctly in `.env` and has available credits.

**Database errors**
Delete `prisma/dev.db` and run `npx prisma db push` again to reset.
