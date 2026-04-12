# CI/CD & Branch Strategy Design

## Goal

Protect production from broken builds and provide a stable preview environment for testing changes before they go live.

## Architecture

Two permanent branches: `dev` for active development (with Vercel preview), `main` for production. Changes move from `dev` to `main` via manual PR, gated by a GitHub Actions CI check that must pass before merging is allowed.

## Branch Strategy

- **`main`** — production only. Receives changes exclusively via PR from `dev`. Auto-deploys to `cerebrosesponjosos.com` via Vercel.
- **`dev`** — permanent development branch. All day-to-day work happens here (from Cursor, Claude Code, or any editor). Auto-deploys to a Vercel preview URL (e.g. `cerebros-landing-git-dev-oscars-projects.vercel.app`).

Daily workflow:
```
work on dev → push → CI runs → Vercel builds preview → review → open PR dev→main → CI passes → manual merge → prod deploy
```

## CI Workflow

**File:** `.github/workflows/ci.yml`

**Triggers:**
- Push to `dev`
- Pull request targeting `main`

**Steps:**
1. Checkout code
2. Setup Node 22 with npm cache
3. `npm ci`
4. `npm run lint`
5. `npm run build`

**Job name:** `build` (used by branch protection rule)

If any step fails, the PR to `main` is blocked.

## Vercel Preview

Vercel automatically deploys every branch that isn't `main` as a preview deployment. No `vercel.json` changes needed. Once `dev` branch exists and is pushed, Vercel picks it up automatically.

## Branch Protection on `main`

Configure in GitHub → Settings → Branches → Add rule for `main`:

- **Require a pull request before merging** — no direct pushes to `main`
- **Require status checks to pass** — add `build` (the CI job name) as required
- **Require branches to be up to date before merging** — prevents stale PRs
- **Do not allow bypassing the above settings** — applies to admins too

## Existing Workflows

`refresh-content.yml` and `refresh-on-push.yml` are unaffected — they only run on `main` and continue to work as-is.

## What Does NOT Change

- `vercel.json` — no changes needed
- Deployment configuration — Vercel already handles preview deploys per branch
- The two existing GitHub Actions workflows

## Out of Scope

- Feature branches (overkill for a two-person project)
- Automatic merge when CI passes (manual merge is intentional)
- Staging environment with custom domain
