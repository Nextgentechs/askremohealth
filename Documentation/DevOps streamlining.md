# 🚀 DevOps Streamlining Proposal for Ask Remo Health

**Last Updated:** December 16, 2025  
**Document Version:** 2.0

## Executive Summary

This document outlines the DevOps infrastructure, code quality tooling, and deployment pipeline for the Ask Remo Health platform. Following the initial remediation, the project now has a solid foundation with Husky, Commitlint, and ESLint in place. This update focuses on remaining gaps and advanced optimizations.

---

## Current State Analysis (December 2025)

### ✅ What's Working Well

| Category                   | Status        | Details                                     |
| -------------------------- | ------------- | ------------------------------------------- |
| **Git Hooks**              | ✅ Configured | Husky with pre-commit, commit-msg, pre-push |
| **Commit Standards**       | ✅ Enforced   | Commitlint with conventional commits        |
| **Linting**                | ✅ Active     | ESLint + Prettier with lint-staged          |
| **TypeScript**             | ✅ Strict     | Full strict mode enabled                    |
| **CI/CD**                  | ✅ Basic      | Lint + Build on push/PR                     |
| **Branch Strategy**        | ✅ Documented | Git Flow Lite with dev/main                 |
| **Environment Validation** | ✅ Type-safe  | @t3-oss/env-nextjs                          |

### ⚠️ Areas Needing Improvement

| Category                   | Status     | Priority |
| -------------------------- | ---------- | -------- |
| **Testing**                | 🔴 Missing | Critical |
| **Error Monitoring**       | 🔴 Missing | Critical |
| **Security Headers**       | 🔴 Missing | High     |
| **Security Scanning**      | 🔴 Missing | High     |
| **Performance Monitoring** | ⚠️ Partial | Medium   |
| **API Documentation**      | ⚠️ Missing | Medium   |

---

## 📊 Repository Structure Analysis

### Current Architecture

```
Ask Remo Health/
├── apps/
│   ├── web/                  # Main Next.js application
│   │   ├── src/
│   │   │   ├── app/          # App Router pages
│   │   │   ├── components/   # React components
│   │   │   ├── server/       # API, DB, Services
│   │   │   ├── lib/          # Utilities
│   │   │   ├── hooks/        # Custom hooks
│   │   │   ├── providers/    # Context providers
│   │   │   ├── trpc/         # tRPC client setup
│   │   │   └── types/        # TypeScript types
│   │   ├── drizzle/          # Database migrations
│   │   └── public/           # Static assets
│   └── cms/                  # ⚠️ Empty/unused
├── packages/
│   └── eslint-config/        # Shared ESLint configs
├── Documentation/            # Project documentation
├── .github/workflows/        # CI/CD pipelines
└── .husky/                   # Git hooks
```

### 📁 Code Organization Score: 8/10

**Strengths:**

- ✅ Clear monorepo structure with Turborepo
- ✅ Separation of web app from packages
- ✅ Logical src directory organization
- ✅ Database migrations properly versioned

**Issues:**

- ⚠️ `apps/cms` folder is empty (dead code)
- ⚠️ No `__tests__` directories
- ⚠️ Some components could be in packages for reuse

---

## 🎯 Proposed DevOps Structure

### Phase 1: Branch Strategy (Git Flow Lite)

```
main (production)
  │
  └── dev (integration/staging)
        │
        ├── feature/[feature-name]    ← New features
        ├── fix/[bug-description]     ← Bug fixes
        └── hotfix/[critical-fix]     ← Emergency production fixes
```

**Rules:**

1. **`main`** - Production only. Deployed to `askremohealth.com`
2. **`dev`** - Staging/integration. Deployed to `staging.askremohealth.com`
3. **Feature branches** - Created from `dev`, merged back to `dev` via PR
4. **Hotfix branches** - Created from `main`, merged to both `main` AND `dev`

### Phase 2: Branch Cleanup Plan

| Branch                            | Status                 | Recommended Action          |
| --------------------------------- | ---------------------- | --------------------------- |
| `origin/sharry`                   | 8 months stale         | 🗑️ Delete                   |
| `origin/db-locations`             | 8 months stale         | 🗑️ Delete                   |
| `origin/feat-cms`                 | 7 months stale         | 🗑️ Delete                   |
| `origin/cms`                      | 6 months stale         | 🗑️ Delete                   |
| `origin/locations`                | 6 months stale         | 🗑️ Delete                   |
| `origin/patients/dashboard`       | 6 months stale, merged | 🗑️ Delete                   |
| `origin/admin/dashboard`          | 4 months stale         | 🗑️ Delete                   |
| `origin/auth`                     | 4 months stale         | 🗑️ Delete                   |
| `origin/labs`                     | 4 months stale         | 🗑️ Delete                   |
| `origin/community`                | 10 weeks stale         | 🗑️ Delete                   |
| `origin/remo-test`                | 7 weeks stale          | 🗑️ Delete                   |
| `origin/article-askremo`          | 3 weeks stale          | ⚠️ Review → Delete or merge |
| `origin/fix/admin-cache-sessions` | 8 days old             | ⚠️ Review → Merge or close  |
| `origin/staging-config`           | 10 days old            | ⚠️ Review → Merge or close  |
| `origin/dev`                      | Active                 | ✅ Keep                     |
| `origin/main`                     | Active                 | ✅ Keep                     |

**After cleanup: 2 permanent branches + feature branches as needed**

### Phase 3: GitHub Branch Protection Rules

#### For `main` branch:

```yaml
Protection Rules:
  - Require pull request before merging: YES
  - Required approving reviews: 1
  - Dismiss stale reviews: YES
  - Require status checks to pass:
      - ci-cd (lint, typecheck, build)
      - test (when added)
  - Require branches to be up to date: YES
  - Restrict who can push: Only via PR
  - Allow force pushes: NO
  - Allow deletions: NO
```

#### For `dev` branch:

```yaml
Protection Rules:
  - Require pull request before merging: YES
  - Required approving reviews: 0 (self-merge OK for speed)
  - Require status checks to pass:
      - ci-cd (lint, typecheck)
  - Allow force pushes: NO
```

### Phase 4: Enhanced CI/CD Pipeline

**Proposed Workflow Structure:**

```
.github/
  workflows/
    ci.yml           ← Runs on all PRs and pushes
    deploy-staging.yml    ← Auto-deploys dev to staging
    deploy-production.yml ← Manual trigger for main → production
```

#### New `ci.yml` (replaces current ci-cd.yml):

```yaml
name: CI

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev, main]

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run check --workspace=@askvirtualhealthcare/web

  build:
    name: Build
    needs: lint-and-typecheck
    runs-on: ubuntu-latest
    env:
      SKIP_ENV_VALIDATION: '1'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build --workspace=@askvirtualhealthcare/web

  # Future: Add when tests exist
  # test:
  #   name: Test
  #   needs: lint-and-typecheck
  #   runs-on: ubuntu-latest
  #   steps:
  #     - run: npm test
```

### Phase 5: Local Development Guards

#### 1. Husky + lint-staged (Pre-commit hooks)

```json
// package.json additions
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

#### 2. Commitlint (Commit message standards)

```js
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Formatting
        'refactor', // Code restructuring
        'test', // Adding tests
        'chore', // Maintenance
        'hotfix', // Emergency fix
      ],
    ],
    'subject-max-length': [2, 'always', 72],
  },
}
```

**Example commit messages:**

```
feat: add patient appointment cancellation
fix: session cookie httpOnly flag
docs: update README with setup instructions
hotfix: critical auth bypass vulnerability
```

#### 3. Pre-push hook

```bash
# .husky/pre-push
npm run check --workspace=@askvirtualhealthcare/web
```

### Phase 6: Deployment Flow

```
Developer Machine          GitHub                    Vercel
       │                      │                        │
       │ git push feature/x   │                        │
       ├─────────────────────►│                        │
       │                      │ CI runs (lint/build)   │
       │                      ├───────────────────────►│
       │                      │                        │ Preview deploy
       │                      │◄───────────────────────┤
       │                      │                        │
       │ Create PR to dev     │                        │
       ├─────────────────────►│                        │
       │                      │ CI runs again          │
       │                      │                        │
       │ Merge to dev         │                        │
       ├─────────────────────►│ Auto-deploy staging   │
       │                      ├───────────────────────►│
       │                      │                        │ staging.askremohealth.com
       │                      │                        │
       │ PR: dev → main       │                        │
       ├─────────────────────►│                        │
       │                      │ Required: 1 approval   │
       │                      │ Required: All CI pass  │
       │                      │                        │
       │ Merge to main        │ Auto-deploy production│
       ├─────────────────────►├───────────────────────►│
       │                      │                        │ askremohealth.com
```

---

## 📋 Implementation Checklist

### Week 1: Foundation

- [ ] **Day 1-2: Branch Cleanup**

  - Archive/delete 12 stale branches
  - Review and resolve `fix/admin-cache-sessions` and `article-askremo`
  - Merge `dev` to `main` (4 commits behind)

- [ ] **Day 3: Branch Protection**

  - Enable branch protection on `main`
  - Enable branch protection on `dev`
  - Document branch strategy in CONTRIBUTING.md

- [ ] **Day 4-5: CI Enhancement**
  - Update `.github/workflows/ci.yml`
  - Ensure all secrets are configured
  - Test workflow on a feature branch

### Week 2: Local Tooling

- [ ] **Day 1: Install Husky/Commitlint**

  ```bash
  npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
  npx husky init
  ```

- [ ] **Day 2: Configure hooks**

  - Pre-commit: lint-staged
  - Commit-msg: commitlint
  - Pre-push: npm run check

- [ ] **Day 3-5: Team Onboarding**
  - Document new workflow
  - Train team on commit conventions
  - First week in "warning mode" (hooks warn but don't block)

---

## 🎯 Benefits After Implementation

| Before                  | After                                    |
| ----------------------- | ---------------------------------------- |
| 17 confusing branches   | 2 permanent + temporary feature branches |
| Anyone can push to main | PRs required with CI checks              |
| No commit standards     | Conventional commits enforced            |
| Find bugs in production | Bugs caught at commit/PR time            |
| "Trial 890" commits     | Clean, meaningful history                |
| No staging environment  | Staging on every `dev` merge             |
| Manual QA only          | Automated lint/build/test gates          |

---

## 🚨 Risks & Mitigations

| Risk                           | Mitigation                                      |
| ------------------------------ | ----------------------------------------------- |
| Developers frustrated by hooks | Start with warnings, then enforce after 1 week  |
| CI takes too long              | Cache node_modules, parallelize jobs            |
| Urgent hotfix blocked by CI    | Hotfix branch bypasses dev, goes direct to main |
| Merge conflicts                | Keep feature branches short-lived (<3 days)     |

---

## ✅ Implementation Status (Updated December 2024)

### Completed Automatically:

- ✅ **Branch Cleanup** - Deleted 11 stale branches (sharry, db-locations, feat-cms, cms, locations, patients/dashboard, admin/dashboard, auth, labs, community, remo-test)
- ✅ **Husky + lint-staged** - Pre-commit, commit-msg, and pre-push hooks configured
- ✅ **Commitlint** - Conventional commit enforcement active
- ✅ **ESLint/TypeScript** - All errors fixed, checks passing
- ✅ **NPM Vulnerabilities** - Reduced from 24 to 5 (remaining are low/moderate in dev deps)
- ✅ **CI/CD Updates** - GitHub Actions workflow updated

### 🔧 MANUAL ACTIONS REQUIRED:

#### 1. GitHub Branch Protection (Admin access required)

Navigate to: **Repository → Settings → Branches → Add Rule**

**For `main` branch:**

```
Branch name pattern: main

✅ Require a pull request before merging
   ✅ Require approvals: 1
   ✅ Dismiss stale pull request approvals when new commits are pushed

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   Status checks: ci-cd

✅ Do not allow bypassing the above settings

❌ Allow force pushes (keep disabled)
❌ Allow deletions (keep disabled)
```

**For `dev` branch:**

```
Branch name pattern: dev

✅ Require status checks to pass before merging
   Status checks: ci-cd

❌ Allow force pushes (keep disabled)
```

#### 2. Vercel Staging Environment

Navigate to: **Vercel Dashboard → Project → Settings → Git**

1. **Configure Production Branch:**
   - Production Branch: `main`
2. **Configure Preview Deployments:**

   - Enable preview deployments for `dev` branch
   - Set up staging domain: `staging.askremohealth.com`

3. **Environment Variables:**
   - Duplicate production env vars to Preview environment
   - Update any staging-specific values (database URL, API keys, etc.)

#### 3. Remaining Dependabot Vulnerabilities

The following vulnerabilities remain and require manual review:

- **cookie** (low) - Breaking change, affects auth libraries
- **esbuild** (moderate, dev only) - Breaking change in drizzle-kit

To force-fix (⚠️ may break things):

```bash
npm audit fix --force
```

---

## 💰 Cost: $0

All tools are free:

- GitHub Actions: Free for public repos, generous limits for private
- Husky/Commitlint: Open source
- Vercel: Current plan handles staging + production

---

## 🔐 Security Configuration

### Security Headers Implementation

Add to `apps/web/next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ]
}
```

### CORS Origin Whitelist

Replace wildcard CORS fallback in middleware:

```typescript
const ALLOWED_ORIGINS = [
  'https://askremohealth.com',
  'https://www.askremohealth.com',
  'https://doctors.askremohealth.com',
  'https://staging.askremohealth.com',
]

const origin = headers.get('Origin')
if (origin && ALLOWED_ORIGINS.includes(origin)) {
  res.headers.set('Access-Control-Allow-Origin', origin)
} else if (process.env.NODE_ENV === 'development') {
  res.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000')
}
```

---

## 🧪 Testing Infrastructure (CRITICAL GAP)

### Recommended Testing Stack

| Layer           | Tool                  | Purpose                   |
| --------------- | --------------------- | ------------------------- |
| Unit Tests      | Vitest                | Fast unit testing         |
| Component Tests | React Testing Library | Component behavior        |
| API Tests       | Vitest + tRPC utils   | API endpoint testing      |
| E2E Tests       | Playwright            | Full user journey testing |

### Installation Commands

```bash
# Unit & Component Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react

# E2E Testing
npm install -D @playwright/test
npx playwright install
```

### Vitest Configuration

Create `apps/web/vitest.config.ts`:

```typescript
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/test/**'],
    },
  },
  resolve: {
    alias: {
      '@web': resolve(__dirname, './src'),
    },
  },
})
```

### Test Script Updates

Add to `apps/web/package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  }
}
```

### CI Pipeline Update

Add test step to `.github/workflows/ci-cd.yml`:

```yaml
test:
  name: Test
  needs: lint-and-typecheck
  runs-on: ubuntu-latest
  env:
    SKIP_ENV_VALIDATION: '1'
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npm run test --workspace=@askvirtualhealthcare/web -- --run
```

---

## 📊 Monitoring & Observability

### Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add to `apps/web/sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

### Performance Monitoring

Add to `apps/web/package.json`:

```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```

---

## 📋 Updated Implementation Checklist (December 2025)

### ✅ Completed

- [x] Branch cleanup (11 stale branches deleted)
- [x] Husky + lint-staged configured
- [x] Commitlint with conventional commits
- [x] ESLint/TypeScript checks passing
- [x] CI/CD basic pipeline (lint + build)
- [x] Environment validation with t3-env

### 🔄 In Progress

- [ ] GitHub branch protection rules (requires admin access)
- [ ] Vercel staging environment setup

### 📌 Pending (High Priority)

- [ ] Testing infrastructure setup
- [ ] Security headers implementation
- [ ] Error monitoring (Sentry) integration
- [ ] CORS origin whitelist fix

### 📌 Pending (Medium Priority)

- [ ] Performance monitoring setup
- [ ] Bundle analyzer integration
- [ ] API documentation (OpenAPI/tRPC docs)
- [ ] Database seed script

### 📌 Pending (Low Priority)

- [ ] Docker containerization
- [ ] Load testing setup
- [ ] Backup automation

---

## 📈 DevOps Maturity Scorecard

| Area                | Current | Target | Gap                     |
| ------------------- | ------- | ------ | ----------------------- |
| **Version Control** | 9/10    | 10/10  | Branch protection       |
| **CI/CD**           | 6/10    | 9/10   | Testing, security scans |
| **Testing**         | 2/10    | 8/10   | Full test suite         |
| **Security**        | 7/10    | 9/10   | Headers, CSP            |
| **Monitoring**      | 3/10    | 8/10   | Sentry, analytics       |
| **Documentation**   | 6/10    | 8/10   | API docs, architecture  |
| **Overall**         | 5.5/10  | 8.7/10 | 3.2 points              |

---

_Document last updated: December 16, 2025_
_Next review: After Phase 1 completion_
