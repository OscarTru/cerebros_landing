# CI/CD & Branch Strategy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `dev` branch with Vercel preview, a GitHub Actions CI workflow that runs lint + build on every push to `dev` and on every PR to `main`, and branch protection rules on `main` so merging is only possible when CI passes.

**Architecture:** One new GitHub Actions workflow file (`.github/workflows/ci.yml`) handles all CI. The `dev` branch is created from `main`. Branch protection is configured manually in GitHub settings (not via code). Vercel preview deploys require no configuration changes — Vercel auto-deploys all non-main branches.

**Tech Stack:** GitHub Actions, Vercel (automatic preview), Node 22, npm, ESLint, Vite + TypeScript

---

## File Structure

- **Create:** `.github/workflows/ci.yml` — CI workflow: lint + build on push to `dev` and PRs to `main`
- **No changes** to `vercel.json`, existing workflows, or any source files

---

### Task 1: Create the CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [dev]
  pull_request:
    branches: [main]

env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint and build workflow for dev branch and PRs to main"
```

---

### Task 2: Create the `dev` branch and push

- [ ] **Step 1: Create `dev` from `main`**

```bash
git checkout -b dev
```

- [ ] **Step 2: Push `dev` to remote**

```bash
git push -u origin dev
```

Expected: GitHub now has a `dev` branch. Vercel automatically starts a preview deployment for it. The CI workflow triggers and runs lint + build on this push.

- [ ] **Step 3: Verify CI passes**

Go to: GitHub → your repo → Actions tab → "CI" workflow → latest run on `dev`.

Expected: both `Lint` and `Build` steps show green checkmarks.

- [ ] **Step 4: Verify Vercel preview**

Go to: Vercel dashboard → your project → Deployments.

Expected: a deployment appears for the `dev` branch with a preview URL like `cerebros-landing-git-dev-oscars-projects.vercel.app`.

---

### Task 3: Configure branch protection on `main`

This task is done in the GitHub web UI — no code changes.

- [ ] **Step 1: Open branch protection settings**

Go to: `https://github.com/OscarTru/cerebros_landing/settings/branches`

Click **"Add branch ruleset"** (or **"Add classic branch protection rule"** if rulesets aren't available).

- [ ] **Step 2: Configure the rule**

Set **Branch name pattern** to: `main`

Enable these options:
- ✅ **Require a pull request before merging**
  - Uncheck "Require approvals" (solo project, no reviewers needed)
- ✅ **Require status checks to pass before merging**
  - Click "Add status checks" and search for: `build`
  - Select the `build` check (from the CI workflow job name)
- ✅ **Require branches to be up to date before merging**
- ✅ **Do not allow bypassing the above settings**

- [ ] **Step 3: Save the rule**

Click **"Create"** (or **"Save changes"**).

Expected: GitHub shows `main` as a protected branch. Direct pushes to `main` are now blocked.

- [ ] **Step 4: Verify protection works**

Try pushing directly to `main`:

```bash
git checkout main
git commit --allow-empty -m "test: verify branch protection"
git push origin main
```

Expected: push is rejected with:
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
```

Clean up:

```bash
git reset HEAD~1
git checkout dev
```

---

### Task 4: Switch default working branch to `dev`

From now on, all work (in Cursor, Claude Code, or terminal) starts from `dev`.

- [ ] **Step 1: Make sure you're on `dev`**

```bash
git checkout dev
git status
```

Expected: `On branch dev`, clean working tree.

- [ ] **Step 2: Set `dev` as the default branch in GitHub (optional but recommended)**

Go to: `https://github.com/OscarTru/cerebros_landing/settings` → **Default branch** → change to `dev`.

This makes `dev` the branch that opens by default when visiting the repo, and new clones check it out automatically.

---

## Day-to-Day Workflow Reference

```
# Work on dev (or a short-lived branch off dev)
git checkout dev
# ... make changes ...
git add <files>
git commit -m "feat: ..."
git push

# CI runs automatically on push to dev
# Vercel builds preview at cerebros-landing-git-dev-oscars-projects.vercel.app

# When ready to ship to production:
# 1. Open PR: dev → main  (on GitHub)
# 2. CI must pass (lint + build)
# 3. Merge manually
# 4. Vercel deploys to cerebrosesponjosos.com
```
