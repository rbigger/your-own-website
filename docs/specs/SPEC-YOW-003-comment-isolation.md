# SPEC-YOW-003 — Comment System Isolation (Host Portability)

| Field      | Value                                                |
| ---------- | ---------------------------------------------------- |
| Status     | COMPLETE                                             |
| Type       | SPEC                                                 |
| Product    | YOW (Your Own Website)                               |
| Owner      | (assign)                                             |
| Date       | 2026-06-08                                           |
| Related    | SPEC-YOW-001 (env config), SPEC-YOW-002 (content abstraction), GUIDE-YOW-001 (naming) |
| Depends on | SPEC-YOW-001 (COMPLETE), SPEC-YOW-002 (COMPLETE — comment read normalized there) |
| Part of    | Portability work — 3 of 3 (host portability)         |

## 1. Context & problem

SPEC-YOW-001 gave host portability for the static build, with one
exception: the comment **write** path is a Cloudflare Pages Function
(`web/functions/api/comment.ts`). It is not Astro and not portable —
move the site to a static-only host (GitHub Pages, an S3 bucket) and the
form's `POST /api/comment` has nowhere to go.

Grounding (verified):

- `CommentForm` and `CommentList` are used on exactly one page,
  `testimonials.astro`.
- `CommentForm` is a plain HTML form posting to `/api/comment`; it has no
  client-side success/error handling and relies on the function's
  redirect. A failure or a missing endpoint surfaces as raw JSON to the
  visitor.
- The only function is `web/functions/api/comment.ts`.

This spec does not try to make the comment function portable. It makes
the comment system a **cleanly optional, clearly bounded** feature, so
that the rest of the site stays fully portable and disabling comments
costs *only* comments.

## 2. Goals / non-goals

**Goals.**

- The comment system can be turned off with a single flag; with it off,
  the entire site builds and serves on a static-only host with nothing
  else broken.
- The non-portable boundary is explicitly marked in code and documented,
  including the endpoint contract needed to re-implement it elsewhere.

**Non-goals.**

- Making the Cloudflare function itself portable.
- Building a write-provider abstraction parallel to SPEC-YOW-002's read
  provider (see §3.2 — the write coupling is documented and accepted, not
  abstracted).
- Redesigning comments onto a different system (e.g. a static comment
  service). Alternatives are listed as porting *guidance* only (§5).
- Comment **read** rendering — already normalized in SPEC-YOW-002.

## 3. The couplings

### 3.1 Host coupling (the target of this spec)

`web/functions/api/comment.ts` uses the Cloudflare Pages Functions
runtime: the `functions/` directory convention, `onRequestPost`, and
`context.env`. This is the one deliberately non-portable file in YOW.

### 3.2 CMS write coupling (documented, not abstracted)

The function writes directly to Sanity's REST mutate API
(`https://<projectId>.api.sanity.io/...`) using `SANITY_API_TOKEN`. This
is a **second** Sanity coupling that SPEC-YOW-002 does not cover, because
that provider is build-time and read-only and cannot run inside the
request-time function.

Decision: keep the write as a single self-contained function and document
both couplings, rather than build a write-provider. Rationale —
"as simple as possible, but no simpler": the write path is already
isolated to one file, and a write-provider abstraction would add a whole
parallel mechanism for one form. Recorded as a future option, not scope.

## 4. Design

### 4.1 Feature flag — `PUBLIC_ENABLE_COMMENTS`

A build variable (default `true`) gates the entire comment system.

Declare it in the **existing `astro:env` schema** in `astro.config.mjs`
(`envField.boolean({ context: 'client', access: 'public', default: true })`),
consistent with how SPEC-YOW-001/002 handle configuration — not via
ad-hoc `import.meta.env`. Env values are strings, so the typed
`astro:env` boolean is what provides correct defaulting and coercion; do
not hand-parse `"false"`.

- `testimonials.astro` renders `<CommentList />` and `<CommentForm />`
  only when enabled.
- The components themselves no-op (render nothing) when disabled, as a
  defensive second guard.
- When `false`: no comment UI is emitted, so there is no `POST
  /api/comment` dependency, and the site is fully static. Because the only
  comment **read** (`getApprovedComments` in `CommentList`, used only on
  `testimonials`) is gated by the same flag, flag-off also removes that
  read — the static build then needs no Sanity on the comment path at all.
  The unused `web/functions/` file is harmless and need not be deleted on
  a static host.

This is the mechanism that makes "disabling comments costs only comments"
literally true and testable (§6).

### 4.2 Mark and document the boundary

- Add a header comment to `web/functions/api/comment.ts` stating it is
  the single non-portable file, names the runtime it targets, and points
  to the deployer/architecture docs.
- Document the **endpoint contract** so the function can be re-created on
  another host: method (`POST`, form-encoded), request fields (`name`*,
  `email`, `comment`*, `page`, `website` honeypot), behavior (honeypot
  and spam silent-accept, validation 400s, create Sanity `comment` with
  `approved: false`), and response (303 redirect to
  `/testimonials?submitted=true`).

### 4.3 Secondary (optional) — submit failure visibility

This addresses the cross-boundary failure-visibility gap (submit errors
currently render as raw JSON), but it is **not** required for portability
and may be split to its own ticket if it expands scope.

- `CommentForm` shows a user-visible success message (on
  `?submitted=true`) and a friendly error message on failure, instead of
  exposing the raw function response. Note: `testimonials.astro` does not
  currently read `?submitted=true`, so the success message is net-new UI,
  not a tweak — scope §4.3 accordingly.
- Deployer docs note where function logs live (Cloudflare dashboard) so a
  failed submission can be diagnosed from the maintenance side.

## 5. Deployment & documentation impact

**Deployment.**

- New **optional** build variable `PUBLIC_ENABLE_COMMENTS` (default
  `true`). Add to `web/.env.example` as a commented line.
- No new secrets, and **#3 does not modify env at all**. Verified in
  code: the function already reads the SPEC-YOW-001 contract
  (`PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`,
  `PUBLIC_SANITY_API_VERSION`, and the `SANITY_API_TOKEN` secret) and
  already fails fast on missing values. The coder should not re-edit env
  config.

**Documentation.**

- Deployer guide: state plainly that comments require a host that runs
  serverless functions (Cloudflare Pages Functions). On a static-only
  host, set `PUBLIC_ENABLE_COMMENTS=false`; the only feature lost is
  commenting. Warn against the misconfiguration of leaving comments
  enabled on a static-only host (the form would render but submissions
  would 404).
- Architecture/ADR note: comments are YOW's single non-portable feature;
  the boundary is `web/functions/`; the write path has its own Sanity
  coupling (§3.2).
- Porting guidance (non-scope): to keep comments on a different host,
  either re-implement the endpoint contract (§4.2) as that host's
  serverless function, or swap to a static comment system. List the
  trade-offs briefly; do not prescribe one.

## 6. Testing

### 6.1 Flag-off build

Build with `PUBLIC_ENABLE_COMMENTS=false`. `CommentForm`/`CommentList`
are absent from `testimonials`, every other page builds and renders
unchanged, and the built output contains no reference to `/api/comment`.

### 6.2 Static-host serve (the key portability proof)

Serve the flag-off build from a plain static file server (no functions
runtime). The entire site works; only commenting is unavailable. This is
the host-portability analogue of SPEC-YOW-002 §7.3 and the acceptance
demonstration for this spec.

### 6.3 Flag-on round-trip

With comments enabled (default), submit via the deployed function and
confirm the comment lands in Sanity as `approved: false` and appears
after approval. (Reuses the SPEC-YOW-001 integration test.)

### 6.4 Containment guard (CI grep)

Cloudflare-runtime idioms appear only under `web/functions/`:

```
grep -rn "onRequest\|context.env\|onRequestPost" web/src
```

must return **zero** hits (the static app never depends on the function).

### 6.5 Failure visibility (only if §4.3 included)

Submit against an erroring/absent endpoint and confirm the visitor sees a
friendly message, not raw JSON.

## 7. Acceptance criteria

- [ ] `PUBLIC_ENABLE_COMMENTS` flag gates the comment system; default
      `true`; components no-op when disabled.
- [ ] Flag-off build omits all comment UI and any `/api/comment`
      reference (§6.1).
- [ ] Flag-off build serves fully from a static-only server; only
      commenting is lost (§6.2).
- [ ] Flag-on comment round-trip works in the deployed environment
      (§6.3).
- [ ] Containment grep (§6.4) returns 0 hits in `web/src`.
- [ ] `web/functions/api/comment.ts` carries a non-portable-boundary
      header; endpoint contract documented (§4.2).
- [ ] `PUBLIC_ENABLE_COMMENTS` added to `web/.env.example`; deployer and
      architecture docs updated (§5).
- [ ] (If included) submit failure shows a user-visible message (§4.3,
      §6.5).

## 8. Implementation parts & sequencing

Smaller than SPEC-YOW-002; three parts, the third optional.

| Part | Scope | Test oracle |
| ---- | ----- | ----------- |
| A | **Flag + gating.** Declare `PUBLIC_ENABLE_COMMENTS` in the `astro:env` schema (§4.1); gate `<CommentList>`/`<CommentForm>` on `testimonials.astro`; components no-op when disabled; add the var to `web/.env.example`. | Flag-off build (§6.1) + static-host serve (§6.2); flag-on round-trip (§6.3) |
| B | **Boundary marking + docs.** Header comment on `web/functions/api/comment.ts`; document the endpoint contract (§4.2); deployer + architecture/ADR notes and porting guidance (§5). | Containment grep (§6.4) + doc review |
| C | **(Optional) Submit failure visibility** (§4.3). Net-new success/error UI on `CommentForm`/`testimonials`; logs-location note. Splittable to its own ticket. | §6.5 |

Parts A and B are independent and can run in parallel; both must precede
sign-off. Part C is optional and gated on whether failure-visibility is
in scope for this pass.
