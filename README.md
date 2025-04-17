# AskVirtualHealthcare Platform

## Tech Stack and Philosophy 

This project implements a modern virtual healthcare platform using TypeScript in a monorepo structure. Our technical choices prioritize type safety, performance, scalability, and developer experience.

### Core Technologies

- [Next.js](https://nextjs.org): React framework for server-rendered applications
- [TypeScript](https://www.typescriptlang.org/): Strongly typed programming language
- [Drizzle ORM](https://orm.drizzle.team): TypeScript ORM for SQL databases
- [PostgreSQL](https://www.postgresql.org/): Robust, open-source relational database
- [tRPC](https://trpc.io): End-to-end typesafe APIs
- [Clerk](https://clerk.com/): Authentication and user management
- [Tailwind CSS](https://tailwindcss.com): Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com): Accessible and customizable component library
- [Sanity.io](https://www.sanity.io/): Headless CMS for content management
- [Turborepo](https://turbo.build/repo): High-performance build system for JavaScript/TypeScript monorepos

### Development Philosophy

We embrace a modern, component-based architecture with a focus on:

1. **Type-Safe Data Layer**

   - End-to-end type safety from database to UI with Drizzle ORM and TypeScript
   - tRPC for secure, type-safe API communication
   - Structured data validation

2. **Modern Frontend Architecture**

   - Component-based UI development with React and Next.js
   - Server-side rendering for improved performance and SEO
   - Responsive design for all device sizes

3. **Scalable Backend**

   - Modular service-based architecture
   - Clean separation of concerns
   - PostgreSQL database with efficient query patterns

4. **Content Management**
   - Headless CMS architecture with Sanity.io
   - Structured content models
   - Flexible content delivery

## Applications

### Web Platform (`apps/web`)

- Next.js application for patients and doctors
- Patient features:
  - Doctor discovery and appointment booking
  - Manage healthcare appointments
  - View medical information
  - Both physical and virtual consultation options
- Doctor features:
  - Appointment management dashboard
  - Patient interaction
  - Schedule management
  - Online and in-person appointment handling

### CMS (`apps/cms`)

- Sanity.io-based content management system
- Manage platform content including:
  - Medical articles
  - Doctor information
  - Healthcare facility details
  - Platform documentation

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (v9 or later)
- PostgreSQL database

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
# Copy example env files
cp apps/web/.env.example apps/web/.env
```

Required environment variables for the web app:

- `DATABASE_URL`: PostgreSQL connection string
- `CLERK_SECRET_KEY`: Clerk authentication secret key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- Additional variables as specified in `.env.example` files

4. Start development servers:

```bash
# From root directory
npm run dev
```

The web app will be available at `http://localhost:3000` and the CMS at `http://localhost:3333`

## Available Scripts

```bash
# Development (root)
npm run dev           # Start all development servers
npm run lint          # Lint all packages
npm run format        # Format all code
npm run clean         # Clean all builds

# Production (root)
npm run build         # Build all applications
npm run start         # Start all production servers
```

## Project Structure

```
askvirtualhealthcare/
├── apps/
│   ├── web/            # Web application (Next.js)
│   │   ├── src/
│   │   │   ├── app/    # Next.js app router
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── server/ # Server-side code
│   │   │   │   ├── api/      # API endpoints
│   │   │   │   ├── db/       # Database schema and config
│   │   │   │   └── services/ # Business logic services
│   │   │   ├── trpc/   # tRPC configuration
│   │   │   └── styles/ # Global styles
│   │   └── public/     # Static assets
│   └── cms/            # Content Management System (Sanity)
│       ├── schemaTypes/ # Content models
│       └── static/      # Static assets
├── packages/
│   └── eslint-config/  # Shared ESLint configurations
└── package.json        # Root package.json
```

## Key Features

1. **Healthcare Appointment Management**

   - Book and manage appointments
   - Support for both physical and virtual consultations
   - Comprehensive appointment status tracking
   - Appointment filtering and searching

2. **Doctor Discovery**

   - Browse and search for healthcare specialists
   - Doctor profiles with detailed information
   - Specialization and availability filtering
   - Patient reviews and ratings

3. **User Authentication**

   - Secure authentication with Clerk
   - Role-based access control
   - Profile management

4. **Content Management**
   - Medical articles and information
   - Doctor and facility data management
   - Platform documentation

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle Documentation](https://orm.drizzle.team/docs/overview)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Sanity.io Documentation](https://www.sanity.io/docs)

## Deployment

The applications are optimized for deployment on [Vercel](https://vercel.com).

## Questions?

If you have questions about implementation details or need assistance with setup, please reach out to the development team.
