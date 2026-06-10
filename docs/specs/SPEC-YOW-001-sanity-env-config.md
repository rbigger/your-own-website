# SPEC-YOW-001 — Sanity Configuration via Environment Variables

| Field     | Value                                            |
| --------- | ------------------------------------------------ |
| Status    | COMPLETE                                         |
| Type      | SPEC                                             |
| Product   | YOW (Your Own Website)                           |
| Owner     | (assign)                                         |
| Date      | 2026-06-08                                       |
| Related   | ADR-YOW-001 (tech stack), GUIDE-YOW-001 (naming) |
| Part of   | Portability work — 1 of 3 (config externalization) |

## 1. Context & problem

The Sanity `projectId` (`your-project-id`) and `dataset` (`production`) are
duplicated across **four** files, three of them hardcoded:

| File                            | Role         | Current state    |
| ------------------------------- | ------------ | ---------------- |
| `web/src/lib/sanity.ts`         | Read client  | Hardcoded        |
| `studio/sanity.config.ts`       | Studio       | Hardcoded        |
| `studio/sanity.cli.ts`          | Studio CLI   | Hardcoded        |
| `web/functions/api/comment.ts`  | Write (CF fn)| Env-driven (OK)  |

There is no committed `.env.example`. A freshly cloned repo therefore
cannot be pointed at a different Sanity project without editing
TypeScript source.

This breaks the YOW "minimum skills to deploy" promise three ways:
it forces a code edit on day one; it places deployer-specific values
into *tracked source*, causing merge conflicts on every kit update; and
it hands a non-coder a coding task.

## 2. Goals / non-goals

**Goal.** A freshly cloned YOW repo is configured entirely through
environment values — no deployer edits any `.ts` source file. Missing
configuration fails fast with a clear, named error.

**Non-goals.**
- CMS abstraction / data-shape normalization (separate spec).
- Comment-function host portability (separate spec).
- Private-dataset read tokens (note only; see §3.6).
- A guided setup script (future setup-tooling task; see §3.5).

## 3. Design

### 3.1 Config contract — three runtimes, three mandated prefixes

The same logical value legitimately wears three names because three
toolchains each enforce their own prefix and cannot be unified:

- **Astro/Vite** exposes only `PUBLIC_`-prefixed vars to build code.
- **Sanity CLI/Studio** exposes only `SANITY_STUDIO_`-prefixed vars.
- **Cloudflare Pages Functions** read their own `context.env` namespace.

| Variable                    | Consumer            | Secret? |
| --------------------------- | ------------------- | ------- |
| `PUBLIC_SANITY_PROJECT_ID`  | Web build (Astro)   | No      |
| `PUBLIC_SANITY_DATASET`     | Web build (Astro)   | No      |
| `PUBLIC_SANITY_API_VERSION` | Web build (Astro)   | No      |
| `SANITY_PROJECT_ID`         | CF function runtime | No      |
| `SANITY_DATASET`            | CF function runtime | No      |
| `SANITY_API_TOKEN`          | CF function runtime | **Yes** |
| `SANITY_STUDIO_PROJECT_ID`  | Studio              | No      |
| `SANITY_STUDIO_DATASET`     | Studio              | No      |

### 3.2 Security classification

`projectId`, `dataset`, and `apiVersion` are **not secrets** — they
already travel in browser-visible API requests, so they are safe to
expose with `PUBLIC_` and safe to ship as realistic placeholders in
`.env.example`.

`SANITY_API_TOKEN` is the **only secret**: write-scoped, never committed,
and set on Cloudflare as an encrypted secret (not a plain variable). The
`.env.example` must include the token key with an empty/placeholder
value and a comment — never a real token.

### 3.3 Fail-fast validation

Target audience has minimal skills, so a missing variable must produce a
named, actionable error rather than a cryptic Sanity 404.

- **Web (Astro 6):** declare the env schema via `astro:env` in
  `astro.config.mjs` so a missing var fails the build with e.g.
  "PUBLIC_SANITY_PROJECT_ID is required".
- **CF function & Studio config:** add a small guard that throws a
  named error when a required var is absent.

### 3.4 Deliverables

1. Refactor the four files in §1 to read configuration from env.
2. Commit `web/.env.example` and `studio/.env.example` with placeholders
   and a one-line comment per variable.
3. Add the `astro:env` schema (web) and throw-with-name guards
   (function, Studio).
4. Add a "Configuration" section to the deployment guide mapping each
   variable to where the deployer finds it in the Sanity and Cloudflare
   dashboards.

### 3.5 Must-verify during implementation (do not assume)

- **Cloudflare Pages build-vs-runtime env sharing.** Astro reads
  `PUBLIC_*` at *build* time; the function reads `context.env` at
  *request* time. Confirm whether Pages environment variables are shared
  across both. If they are, have the function read the `PUBLIC_`-prefixed
  names so the deployer enters ~3 values total (project id, dataset,
  token) instead of duplicating. If not, document that project id and
  dataset must be set in both surfaces.
- **Astro 6 `astro:env` API surface.** Confirm current field/validation
  syntax before relying on it.

### 3.6 Open design question (defer)

"One value, three names" can be handled by documentation alone, or by a
small `setup` script that prompts once and writes all env files. The
script better serves a no-skills audience but adds build scope. Recommend
deferring to a dedicated setup-tooling task, not this spec.

Note: the read path uses `useCdn: true` against a public dataset, so **no
read token is needed today**. If a future deployer makes the dataset
private, a read token becomes a *second* secret — out of scope here, but
the contract should leave room for it.

## 4. Testing

### 4.1 Negative / per-surface (the key test)

For each consumer, set the variable to a **known-bad** value or remove
it, and confirm a clean, named failure. This proves the value is truly
read from env and not silently falling back to a hardcoded default — the
most common way an "env refactor" looks done but isn't.

- `astro build` with `PUBLIC_SANITY_PROJECT_ID` missing → schema error.
- CF function with `SANITY_API_TOKEN` missing → named error, not a stack
  trace.
- `sanity dev` / `deploy` with `SANITY_STUDIO_PROJECT_ID` missing →
  refuses to start with a clear message.

### 4.2 Positive build + source guard

With correct values, `astro build` produces the same populated pages as
today and Studio launches against the right dataset. Add a CI guard:

```
grep -rn "your-project-id" web/src studio/*.ts web/functions
```

must return **zero** hits. Cheapest possible regression test that the
hardcoding is gone and does not creep back.

### 4.3 Integration — comment round-trip

Submit a comment via the deployed function; confirm it lands in Sanity as
`approved: false`. Proves the runtime env (including the secret token)
resolves in the live Cloudflare context, not just at build time.

### 4.4 Acceptance — clean-clone drill

On a machine/CI job with no prior YOW state: clone the repo, copy
`.env.example` to `.env`, fill in a **different** test Sanity project's
values, and stand the site up — with **zero edits to any tracked source
file**. If a `.ts` file must be touched, the spec is not done, regardless
of unit results. This is the demonstration required before sign-off.

## 5. Acceptance criteria (checklist)

- [ ] `grep -rn "your-project-id"` over source returns 0 hits.
- [ ] All 8 variables in §3.1 are sourced from env.
- [ ] `web/.env.example` and `studio/.env.example` committed; token key
      present but value excluded.
- [ ] Missing required var → named error at build/start for each runtime.
- [ ] Clean-clone drill (§4.4) passes against a different Sanity project
      with no source edits.
- [ ] Comment round-trip (§4.3) works in the deployed environment.
