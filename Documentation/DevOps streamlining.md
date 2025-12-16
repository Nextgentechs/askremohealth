# 🚀 DevOps Streamlining Proposal for Ask Remo Health

## Current State Analysis

### 📊 Branch Chaos Summary

| Category                           | Current State                           | Problem                |
| ---------------------------------- | --------------------------------------- | ---------------------- |
| **Total Remote Branches**          | 17 branches                             | Way too many           |
| **Stale Branches (4+ months old)** | 10 branches                             | Dead weight, confusion |
| **Active Branches**                | 3 (dev, main, fix/admin-cache-sessions) | Unclear purpose        |
| **Main Branch**                    | Has "trial 890", "trial 408" commits    | Messy history          |
| **Dev Branch**                     | 4 commits ahead of main                 | Should be merged       |
| **Branch Naming**                  | Inconsistent (some use `/`, some don't) | No convention          |

### 🔍 Current CI/CD Analysis

**What Exists:**

- ci-cd.yml - Basic CI pipeline
- Runs on ALL branches (`branches: ['*']`)
- Only runs `check` (lint + typecheck)
- Skips build on non-main branches
- No tests, no staging, no branch protection

**What's Missing:**

- ❌ No branch protection rules
- ❌ No required PR reviews
- ❌ No automated testing
- ❌ No staging environment
- ❌ No commit message linting
- ❌ No pre-commit hooks
- ❌ No automatic branch cleanup

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
