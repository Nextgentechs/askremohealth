# Ask Remo Health

> Virtual healthcare platform connecting patients with medical specialists.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **API**: [tRPC](https://trpc.io) for end-to-end type safety
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: NextAuth + custom session with Redis
- **Email**: [Resend](https://resend.com)
- **Video Calls**: Twilio
- **Deployment**: [Vercel](https://vercel.com)

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- [npm](https://www.npmjs.com/) v10+
- PostgreSQL database (we use [Neon](https://neon.tech))
- Redis instance (we use [Upstash](https://upstash.com))

## Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:Nextgentechs/askremohealth.git
cd askremohealth
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL` & `REDIS_TOKEN`: Upstash Redis credentials
- `AUTH_SECRET`: Secret for session encryption
- `RESEND_API_KEY`: For email delivery
- `NEXT_PUBLIC_APP_URL`: Your application URL

### 4. Database Setup

Run database migrations:

```bash
cd apps/web
npm run db:generate  # Generate migration files
npm run db:push      # Apply migrations
```

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Project Structure

```
apps/web/
├── src/
│   ├── app/           # Next.js App Router pages
│   │   ├── (app)/     # Main application routes
│   │   ├── (patients)/ # Patient-specific routes
│   │   ├── (specialists)/ # Doctor/specialist routes
│   │   ├── admin/     # Admin dashboard
│   │   ├── api/       # API routes
│   │   └── auth/      # Authentication pages
│   ├── components/    # React components
│   ├── server/        # Server-side code
│   │   ├── api/       # tRPC routers
│   │   ├── db/        # Database schema & relations
│   │   ├── lib/       # Utilities (session, rate-limiter)
│   │   └── services/  # Business logic services
│   └── trpc/          # tRPC client setup
├── drizzle/           # Database migrations
└── public/            # Static assets
```

## Key Features

- **Patient Portal**: Book appointments, video consultations, view history
- **Specialist Dashboard**: Manage appointments, patient records, availability
- **Admin Panel**: User management, platform oversight
- **Authentication**: OTP-based login with email verification
- **Password Reset**: Secure token-based password recovery
- **Notifications**: In-app and email notifications for appointments
- **Rate Limiting**: Protection against abuse on all auth endpoints

## Development Guidelines

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for:

- Git workflow and branch strategy
- Commit message conventions
- Code review process

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run check        # Lint + type check
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## Architecture Notes

This project follows the [Backends for Frontends pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends):

- **tRPC**: Full type inference with React Query integration
- **Server Components**: Automatic rendering and caching on the server
- **Server Actions**: Direct server invocation from client components

## Support

For questions or issues, please contact the development team.
