# Implementation Plan: SPEC-YOW-003 Comment System Isolation

## Document Control

| Field | Value |
|:------|:------|
| Document ID | PLAN-YOW-003-comment-isolation |
| Version | 1.0 |
| Status | DRAFT |
| Created | 2026-06-08 |
| Author | ARCHITECT_20260526_121237_065479 |
| Spec | SPEC-YOW-003-comment-isolation.md |

---

## 1. Objective

Implement comment system isolation as defined in SPEC-YOW-003. This makes comments a cleanly optional, clearly bounded feature so the rest of the site stays fully portable.

**Success criteria:** Site builds and serves from a static-only host with `PUBLIC_ENABLE_COMMENTS=false`, losing only commenting functionality.

---

## 2. Implementation Parts

Per SPEC-YOW-003 §8. Three parts; A and B are parallel and required. Part C is optional.

### Part 0: Baseline Snapshot

**Scope:** Capture current build state as reference.

**Deliverables:**
- Run `astro build` on current codebase
- Archive `dist/` as baseline
- Note current testimonials.astro output (with comments enabled)

**Test Oracle:** Artifact exists.

**Blocked By:** None

---

### Part A: Feature Flag + Gating

**Scope:** Implement the feature flag and component gating per §4.1.

**Deliverables:**
- Declare `PUBLIC_ENABLE_COMMENTS` in `astro:env` schema in `astro.config.mjs`
  - Type: boolean
  - Context: client
  - Access: public
  - Default: true
- Update `testimonials.astro` to conditionally render `<CommentList>` and `<CommentForm>` only when flag is true
- Update `CommentList.astro` to no-op (render nothing) when flag is false
- Update `CommentForm.astro` to no-op (render nothing) when flag is false
- Add `PUBLIC_ENABLE_COMMENTS` to `web/.env.example` as commented optional line

**Test Oracle:**
- §6.1: Flag-off build omits comment UI, no `/api/comment` reference in output
- §6.2: Flag-off build serves from static server (entire site works)
- §6.3: Flag-on round-trip works (submit comment, appears after approval)

**Blocked By:** Part 0

---

### Part B: Boundary Marking + Documentation

**Scope:** Mark and document the non-portable boundary per §4.2 and §5.

**Deliverables:**
- Add header comment to `web/functions/api/comment.ts`:
  - State it is the single non-portable file
  - Name the runtime (Cloudflare Pages Functions)
  - Reference deployer/architecture docs
- Document endpoint contract in deployer guide or architecture doc:
  - Method: POST, form-encoded
  - Request fields: `name`*, `email`, `comment`*, `page`, `website` (honeypot)
  - Behavior: honeypot/spam silent-accept, validation 400s, create Sanity comment with `approved: false`
  - Response: 303 redirect to `/testimonials?submitted=true`
- Update deployer guide:
  - Comments require Cloudflare Pages Functions
  - On static-only host: set `PUBLIC_ENABLE_COMMENTS=false`
  - Warn against leaving comments enabled on static host
- Add architecture/ADR note:
  - Comments are YOW's single non-portable feature
  - Boundary is `web/functions/`
  - Write path has its own Sanity coupling (§3.2)
- Add porting guidance (brief, non-prescriptive)

**Test Oracle:**
- §6.4: Containment grep returns 0 hits in `web/src`
- Doc review: contract documented, deployer warned, architecture noted

**Blocked By:** None (parallel with Part A)

---

### Part C: Submit Failure Visibility (DEFERRED)

**Status:** Deferred to separate ticket. Not in scope for this implementation.

---

## 3. Dependency Graph

```
Part 0 (baseline)
    │
    ├─────────────────┐
    ▼                 ▼
Part A             Part B
(flag + gating)    (boundary + docs)
    │                 │
    └────────┬────────┘
             ▼
        Sign-off (A+B required)
             │
             ▼
        Part C (optional)
             │
             ▼
        Final sign-off
```

---

## 4. Test Strategy

| Part | Test Type | Oracle |
|:-----|:----------|:-------|
| 0 | Artifact | dist/ snapshot exists |
| A | Build + Serve | §6.1 flag-off build, §6.2 static serve, §6.3 flag-on round-trip |
| B | Grep + Review | §6.4 containment, doc review |
| C | Manual | §6.5 friendly error message |

### Diff Criteria (Part A)

**Flag-off build comparison:**
- testimonials.astro output should NOT contain:
  - `<form` with `/api/comment` action
  - CommentList markup
  - Any comment-related UI

**Flag-on build comparison:**
- Should match baseline (no regression)

### Static-Host Serve Test (§6.2)

Use `npx serve dist` or similar to serve the flag-off build without any functions runtime. Verify:
- All pages load
- Navigation works
- Only commenting is unavailable

---

## 5. RACI Matrix

| Part | CODER | TESTER | ARCHITECT |
|:-----|:------|:-------|:----------|
| 0 | R | I | A |
| A | R | R | A |
| B | R | R | A |
| C | R | R | A |

R = Responsible, A = Accountable, C = Consulted, I = Informed

---

## 6. Workflow

1. CODER implements part
2. CODER sends to TESTER
3. TESTER runs test oracle, reports results to ARCHITECT
4. If PASS: ARCHITECT signals next part (or sign-off)
5. If FAIL: CODER fixes, returns to step 2
6. Parts A and B can execute in parallel
7. After A+B pass: decide on Part C inclusion
8. Complete

---

## 7. Acceptance Criteria (from SPEC-YOW-003 §7)

- [ ] `PUBLIC_ENABLE_COMMENTS` flag gates comment system; default `true`; components no-op when disabled
- [ ] Flag-off build omits all comment UI and any `/api/comment` reference (§6.1)
- [ ] Flag-off build serves fully from static-only server (§6.2)
- [ ] Flag-on comment round-trip works in deployed environment (§6.3)
- [ ] Containment grep (§6.4) returns 0 hits in `web/src`
- [ ] `web/functions/api/comment.ts` carries non-portable-boundary header
- [ ] Endpoint contract documented (§4.2)
- [ ] `PUBLIC_ENABLE_COMMENTS` added to `web/.env.example`
- [ ] Deployer and architecture docs updated (§5)
- [x] Part C deferred to separate ticket

---

## 8. Decisions

1. **Part C deferred:** Failure visibility (§4.3) deferred to separate ticket. This pass covers Parts 0, A, B only.

---

## Review & Approval

| Role | Name | Status | Date |
|:-----|:-----|:-------|:-----|
| ARCHITECT | ARCHITECT_20260526_121237_065479 | DRAFT | 2026-06-08 |
| TESTER | | PENDING | |
| CODER | | PENDING | |
| USER | | PENDING | |

---

*ARCHITECT_20260526_121237_065479 | GUID: ff7b0519-d48f-4ca1-be6d-4250872bf579*
