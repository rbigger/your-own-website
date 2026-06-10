# PLAN-YOW-001 — Program Model (Track Structure & Decision Filter)

## Document Control

| Field | Value |
|:------|:------|
| Document ID | PLAN-YOW-001 |
| Type | PLAN |
| Version | 1.0 |
| Status | DRAFT |
| Classification | INTERNAL |

| Field | Value |
|:------|:------|
| Created | 2026-06-08 |
| Author | ARCHITECT_20260526_121237_065479 |
| Owner | ARCHITECT |
| Product | YOW (Your Own Website) |

| Lineage | Document |
|:--------|:---------|
| Builds on | DEP-YOS-001 (dependency analysis) |
| Implements | SPEC-YOW-001, SPEC-YOW-002, SPEC-YOW-003 |
| Related | GUIDE-YOW-001, VISION-YOS-2026, ADR-001-TECH-STACK |

---

## 1. Purpose

Integrate the capability/dependency analysis in **DEP-YOS-001** with a
three-track program structure and the architectural invariants surfaced
in design review, to govern decisions as the pilot approaches delivery.

The model exists for one reason: at the push to the perceived finish
line, expedient near-term decisions get made cheaply and foreclose later
options expensively. This gives those decisions a filter.

## 2. Two axes (kept distinct, not conflated)

The program has two independent classifications. Keeping them separate
matters; they answer different questions.

**Capability depth** (from DEP-YOS-001) — how much foundational machinery
a feature *intrinsically* needs. Build levels L0–L6, split by the
**Tier 3 Cliff**:

- Below cliff (L0–L3): static or client-side; third-party owns the
  complexity; zero marginal cost; owner self-serves.
- Above cliff (L4–L6): requires server state; we own the complexity;
  infrastructure cost; may need a developer.

**Architectural relationship** (three-track) — a decision's relationship
to the *current* architecture:

- **T1** — sustain the fielded product.
- **T2** — supported by the current seams (no invariant moves).
- **T3** — requires moving an invariant.

**How they relate.** The Tier 3 Cliff is, mostly, the DEP-language name
for the T2/T3 boundary: crossing it breaks the *no-backend* invariant,
which is an invariant change, hence T3. Two refinements so we don't
over-map them:

- Below-cliff deferred features (the L3 family) fit current invariants →
  **T2**.
- One T3 item is *not* a cliff crossing: changing the **authoring
  substrate** (shedding Sanity for git-based authoring) adds no server
  state — it stays below the cliff — but changes a *different* invariant
  (the authoring/content contract). It is T3 for a **supply-chain**
  reason, not a capability-depth reason.

## 3. The constitution (shared invariants)

The set every track preserves. It defines where the T2/T3 line falls and
is what near-term decisions are checked against (§5).

1. **Astro is a thin SSG waist** — the stable render target; no SSR or
   host-adapter creep into the center.
2. **Content is consumed only through the provider seam** (SPEC-YOW-002).
3. **Comments are the single host-coupled feature** — isolated and
   optional (SPEC-YOW-003).
4. **Configuration is externalized** — no deployer source edits
   (SPEC-YOW-001).
5. **NFR floor** (DEP-YOS-001 §7): zero ongoing cost; a non-technical
   owner can self-serve; no backend below the cliff; **ownership
   principle** — keep state and control in the owner's hands.

## 4. Tracks (DEP-YOS-001 components mapped)

| Track | Definition | Contents | Status |
| ----- | ---------- | -------- | ------ |
| **T1 — Sustain** | Keep the fielded product alive | Deployed pilot; the done L0–L3 set (Infra, Foundation, Static Pages, JS Islands, Contact, Video, Booking, Analytics, Comments); dependency maintenance, rebuild triggers, troubleshooting (the maintain-over-time value link) | Not urgent yet — nothing fielded beyond the pilot |
| **T2 — Within current architecture** (below cliff) | Features the current seams absorb without moving an invariant | Deferred L3 family: Newsletter, Map, Events, Payment (checkout-only, no auth); kit generalization + value layer (opinionated templates/schemes, deploy-ease, maintain wrapper); git-based **read** provider prototype behind the existing seam | Design now; build as prioritized |
| **T3 — Requires invariant change** | Features unsupportable in T1/T2 | Cliff crossings: Auth (L4), Per-User Data (L5), Secure Storage (L6); the contract-changing portion of an authoring-substrate swap (Sanity → git editing). Real-Time (L6) deliberately declined. | Do-not-foreclose registry + targeted exploration; active build only on explicit business justification (DEP-YOS-001 §8) |

## 5. Decision filter (the point of doing this now)

Every **T1/T2** decision gets one check: *does it foreclose a T3 option by
violating or hardening an invariant?* Concretely:

- **Does it thicken the waist?** (e.g., adopting Astro SSR or a
  host-specific adapter for one feature.) If so, prefer a
  below-cliff/client-side alternative.
- **Does it harden a non-substitutable dependency?** (e.g., deepening
  Sanity-specific authoring forecloses the git-based T3 option.) Keep
  authoring decisions reversible.
- **If a cliff crossing ever becomes justified, prefer the owner-account
  path** — Cloudflare Access / D1 / R2 (DEP-YOS-001 insight #4) — so
  crossing does not introduce a new critical *external* dependency.

A "no" on all three means the decision is track-safe. A "yes" is not
forbidden — it just has to be a conscious trade, not a schedule accident.

## 6. Consonance with design review

DEP-YOS-001's own findings — the cliff is deliberate and protects
simplicity (#5); Cloudflare may "own the cliff," preserving ownership
(#4); L3 is an independent family (#1) — are the same instincts as the
**value-chain** lens (own curation/deploy/maintain; commoditize
render/host/store/CMS) and the **supply-chain** lens (minimize
non-substitutable critical dependencies). This model unifies them; no
conflict was found between the prior analysis and the design review.

## 7. Decisions for the owner (your valuation)

These are judgment calls I'm flagging rather than making:

1. **T3 status at this stage** — active build vs. a do-not-foreclose
   registry + targeted exploration. *My lean: registry + exploration,*
   given resourcing and DEP-YOS-001's "explicit justification to cross."
2. **Authoring-substrate placement** — *My lean: start it in T2* as a
   contained prototype behind the existing seam; treat only its
   contract-changing portion as T3.
3. **Filing** — (a) this doc's type: PLAN (program/roadmap framing) vs.
   ARCH (it codifies governing invariants). (b) The **constitution (§3)**
   may deserve extraction into its own ARCH or ADR, since every track and
   spec references it. (c) DEP-YOS-001 predates GUIDE-YOW-001 and uses a
   `DEP`/`AN` type the convention doesn't define — migrating it needs a
   type decision first.

---

## Review & Approval

| Role | Name | Date | Status |
|:-----|:-----|:-----|:-------|
| ARCHITECT | ARCHITECT_20260526_121237_065479 | 2026-06-08 | DRAFT |
| USER | | | PENDING |

---

## AI Disclosure

This document was prepared with AI assistance.

| Aspect | Details |
|:-------|:--------|
| AI Tool | Claude (Anthropic) via Claude Code |
| Human Review | USER |
| Accountability | ARCHITECT_20260526_121237_065479 |

---

*ARCHITECT_20260526_121237_065479 | GUID: ff7b0519-d48f-4ca1-be6d-4250872bf579*
