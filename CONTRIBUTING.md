# Contributing to Ask Remo Health

Thank you for your interest in contributing to Ask Remo Health! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branch Strategy](#branch-strategy)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and considerate in all interactions.

---

## Getting Started

1. **Fork the repository** (if external contributor)
2. **Clone your fork** or the main repository
3. **Install dependencies**: `npm install`
4. **Copy environment variables**: `cp apps/web/.env.example apps/web/.env.local`
5. **Fill in the environment variables** in `.env.local`
6. **Run the development server**: `npm run dev`

---

## Branch Strategy

We use **Git Flow Lite** with the following branch structure:

```
main (production)
  │
  └── dev (staging/integration)
        │
        ├── feature/[feature-name]    ← New features
        ├── fix/[bug-description]     ← Bug fixes
        └── hotfix/[critical-fix]     ← Emergency production fixes
```

### Branch Rules

| Branch      | Purpose                    | Deploys To                | Protection                    |
| ----------- | -------------------------- | ------------------------- | ----------------------------- |
| `main`      | Production-ready code      | askremohealth.com         | PR required, reviews required |
| `dev`       | Integration/staging        | staging.askremohealth.com | PR required                   |
| `feature/*` | New feature development    | Preview                   | None                          |
| `fix/*`     | Bug fixes                  | Preview                   | None                          |
| `hotfix/*`  | Emergency production fixes | Preview → main            | Fast-track review             |

### Workflow

1. **Create a feature branch** from `dev`:

   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes** with proper commits (see below)

3. **Push your branch**:

   ```bash
   git push origin feature/my-new-feature
   ```

4. **Create a Pull Request** to `dev`

5. **After review and merge**, the feature goes to staging

6. **When ready for production**, `dev` is merged to `main` via PR

### Hotfix Process

For critical production bugs:

```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix
# Make fix
git push origin hotfix/critical-bug-fix
# Create PR to main AND dev
```

---

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type       | Description                                         |
| ---------- | --------------------------------------------------- |
| `feat`     | A new feature                                       |
| `fix`      | A bug fix                                           |
| `docs`     | Documentation changes                               |
| `style`    | Code style changes (formatting, semicolons, etc.)   |
| `refactor` | Code changes that neither fix bugs nor add features |
| `test`     | Adding or updating tests                            |
| `chore`    | Maintenance tasks, dependencies, build changes      |
| `hotfix`   | Emergency production fix                            |

### Examples

```bash
# Feature
feat(appointments): add appointment rescheduling functionality

# Bug fix
fix(auth): resolve session cookie not setting httpOnly flag

# Documentation
docs(readme): update installation instructions

# Refactor
refactor(api): extract appointment validation to separate service

# Chore
chore(deps): upgrade Next.js to 15.0.1
```

### Rules

- **Subject line**: Max 72 characters, imperative mood ("add" not "added")
- **Body**: Explain _what_ and _why_, not _how_
- **Footer**: Reference issue numbers (`Fixes #123`, `Closes #456`)

---

## Pull Request Process

### Before Creating a PR

- [ ] All commits follow the commit message guidelines
- [ ] Code passes linting: `npm run lint`
- [ ] Code passes type checking: `npm run check`
- [ ] Build succeeds: `npm run build`
- [ ] New features have documentation
- [ ] No console.log statements in production code

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?

Describe testing performed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings introduced
```

### Review Process

1. Create PR with descriptive title (following commit convention)
2. Fill out the PR template
3. Request review from team members
4. Address review feedback
5. Squash and merge when approved

---

## Development Setup

### Prerequisites

- Node.js 20.x
- npm 10.x
- PostgreSQL 15+ (or Neon/Supabase)
- Redis (or Upstash)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/ask-remo-health.git
cd ask-remo-health

# Install dependencies
npm install

# Setup environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your values

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Project Structure

```
├── apps/
│   ├── web/              # Next.js web application
│   │   ├── src/
│   │   │   ├── app/      # App Router pages
│   │   │   ├── components/  # React components
│   │   │   ├── server/   # Backend code (API, DB, services)
│   │   │   ├── trpc/     # tRPC client setup
│   │   │   └── lib/      # Utility functions
│   │   └── drizzle/      # Database migrations
│   └── cms/              # Content Management (future)
├── packages/
│   └── eslint-config/    # Shared ESLint configuration
└── Documentation/        # Project documentation
```

---

## Code Style

### General Guidelines

- Use TypeScript for all new code
- Prefer functional components with hooks
- Use `'use client'` directive only when necessary
- Follow existing patterns in the codebase

### File Naming

- Components: `PascalCase.tsx` or `kebab-case.tsx`
- Utilities: `camelCase.ts` or `kebab-case.ts`
- Types: Define in component file or `types/` folder

### Component Structure

```tsx
'use client' // Only if needed

/**
 * Component description
 *
 * @module components/my-component
 */

import {} from /* dependencies */ '...'

interface MyComponentProps {
  // Props with JSDoc comments
}

/**
 * Component function with JSDoc
 */
export function MyComponent({ prop }: MyComponentProps) {
  // Implementation
}
```

### API Route Structure

```ts
/**
 * API Route description
 *
 * SECURITY: Note any security considerations
 */
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Implementation with proper error handling
  } catch (error) {
    console.error('Error description:', error)
    return NextResponse.json(
      { error: 'User-friendly error message' },
      { status: 500 },
    )
  }
}
```

---

## Testing

### Current State

We are in the process of adding tests. Priority areas:

1. Authentication flows
2. Appointment booking
3. API endpoints

### Running Tests (Future)

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.ts
```

---

## Questions?

If you have questions, please:

1. Check existing documentation
2. Search closed issues
3. Open a new issue with the `question` label

Thank you for contributing! 🎉
