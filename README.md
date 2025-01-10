# AskVirtualHealthcare Platform

## Tech Stack and Philosophy

This project implements a modern healthcare platform using TypeScript and follows the Backend for Frontend (BFF) pattern. Our technical choices prioritize type safety, performance, and developer experience.

### Core Technologies

- [Next.js](https://nextjs.org): React framework for production-grade applications
- [Neon](https://neon.tech): Serverless PostgreSQL with instant database branching
- [tRPC](https://trpc.io): End-to-end typesafe APIs without schemas or code generation
- [Drizzle ORM](https://orm.drizzle.team): TypeScript ORM for SQL databases
- [Tailwind CSS](https://tailwindcss.com): Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com): Accessible and customizable component library
- [Lucia Auth](https://lucia-auth.com): Authentication library

### Development Philosophy

We embrace the Backend for Frontend pattern with tight frontend-backend integration:

1. **Type-Safe Data Layer**

- Using tRPC with React Query for automatic type inference
- Server state management without boilerplate
- End-to-end type safety from database to UI

2. **Modern React Patterns**

- Server Components for automatic server-side rendering and caching
- Server Actions for direct server code invocation
- Reduced client-side complexity and improved performance

3. **Database & Schema**

- PostgreSQL with Neon for serverless scaling
- Drizzle ORM for type-safe database operations
- Instant development database branching

## Applications

### Web Platform (`apps/web`)

- Next.js application for patients
- Book appointments and search doctors
- Access healthcare services
- View medical articles

### Doctor Portal (`apps/web/doctor`)

- Vite-based dashboard for healthcare professionals
- Manage appointments and patient interactions
- Update availability and professional details
- Handle virtual consultations

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [npm](https://www.npmjs.com/) (v10 or later)
- PostgreSQL database (we recommend Neon)

## Getting Started

1. Clone the repository:

```bash
git clone git@github.com:Nextgentechs/askvirtualhealthcare.git
cd askvirtualhealthcare
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Copy example env files for both apps
cp apps/web/.env.example apps/web/.env
cp apps/doctor/.env.example apps/doctor/.env
```

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL`: Application URL
- Additional variables as specified in `.env.example` files

4. Initialize the database:

```bash
cd apps/web
npm run db:push
```

5. Start development servers:

```bash
# From root directory
npm run dev
```

The web app will be available at `http://localhost:3000` and the doctor portal at `http://localhost:3001`

## Available Scripts

```bash
# Development (root)
npm run dev           # Start all development servers
npm run lint         # Lint all packages
npm run format       # Format all code
npm run clean        # Clean all builds

# Production (root)
npm run build        # Build all applications
npm run start        # Start all production servers
```

## Project Structure

```
askvirtualhealthcare/
├── apps/
│   ├── web/          # Patient platform (Next.js)
│   │   ├── src/
│   │   └── public/
│   └── doctor/       # Doctor dashboard (Vite)
│       ├── src/
│       └── public/
├── packages/
│   └── eslint-config/ # Shared ESLint configurations
└── package.json      # Root package.json
```

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle Documentation](https://orm.drizzle.team/docs/overview)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deployment

The applications are optimized for deployment on [Vercel](https://vercel.com).

## Questions?

If you're new to tRPC or have questions about our implementation, please reach out to the team for a walkthrough.
