# NFR-YOW-001 — Non-Functional Requirements: The Distributable YOW Kit

## Document Control

| Field | Value |
|:------|:------|
| Document ID | NFR-YOW-001 |
| Type | NFR |
| Version | 0.1 |
| Status | DRAFT |
| Classification | INTERNAL |
| Created | 2026-06-09 |
| Owner | (assign) |
| Product | YOW (Your Own Website) |

| Lineage | Document |
|:--------|:---------|
| Parent | VISION-YOW-001 |
| Related | UC-YOW-001, PLAN-YOW-001 (constitution), DEP-YOS-001 §7 |

---

Each NFR has a measurable acceptance check where possible. These are the
constraints the kit-ification spec and build must satisfy.

| ID | Requirement | Acceptance / measure |
|:---|:------------|:---------------------|
| NFR-K-01 | **Zero ongoing cost** — runs entirely on free tiers (Sanity, Cloudflare). | No feature requires a paid plan for a typical small site. |
| NFR-K-02 | **Minimal-skill deploy** — no coding, no git required; account creation + a setup script only. | A non-developer test user deploys end-to-end following the guide; target ≤ ~30 min / ≤ ~10 discrete steps. |
| NFR-K-03 | **Zero-skill maintenance** — every routine content task done in the CMS. | No owner task in UC-YOW-001 requires editing source. |
| NFR-K-04 | **No source edits for configuration or identity** — all per-instance values via env/setup + `siteSettings`. | `grep` for kit/sample identity and prior project IDs over a deployed instance's source returns 0 owner-required edits. |
| NFR-K-05 | **Host-portable output** — static build runs on any static host. | The flag-off build serves from a plain static server (SPEC-YOW-003 §6.2). |
| NFR-K-06 | **CMS-swappable** — content consumed only through the provider seam. | Containment guard passes (SPEC-YOW-002 §7.1); builds against the mock provider. |
| NFR-K-07 | **Substrate-neutral schema** — the generic model is expressible in both Sanity and a future git-based editor. | Schema review confirms no Sanity-only construct is load-bearing in the domain types; keeps N+2 open. |
| NFR-K-08 | **Below-cliff only** — no backend/server-state, no auth/accounts in the core kit. | No core feature requires server state; cliff features absent (PLAN-YOW-001). |
| NFR-K-09 | **Fail-fast configuration** — missing/invalid config produces named, actionable errors. | Negative-config build/start tests fail with named messages (carries SPEC-YOW-001 §4.1). |
| NFR-K-10 | **Generalization** — the kit produces a distinct, non-sailing site with zero source edits. | The consultant site (UC-K-05) builds and renders with no `.ts` edits. |
| NFR-K-11 | **Update path (managed risk)** — a downloaded snapshot has a documented, feasible update/migrate process; security-relevant dependencies pinned. | An update procedure exists and is walkable by a semi-technical deployer; deps pinned; structure does not foreclose a future package path. |
| NFR-K-12 | **Ownership** — all content and state live in the owner's own accounts. | No kit-operated shared backend; owner can revoke/transfer without YOW involvement. |
| NFR-K-13 | **Accessibility** — WCAG 2.1 AA for shipped themes. | Automated a11y check passes; carries the pilot's contrast fixes. |
| NFR-K-14 | **Performance** — static, fast first load. | Lighthouse performance ≥ 90 on the demo build (target). |
| NFR-K-15 | **Secret hygiene** — the kit ships no real credentials; the only secret (Sanity write token) is an encrypted env value set by the deployer. | No secret/token/key files in the kit; scan clean (as verified on the pilot). |
| NFR-K-16 | **Open-source license** — the kit carries an explicit OSS license suitable for a free, forkable kit. | A license file is present; license chosen (decision below). |

---

## Open decisions referenced above

- **NFR-K-16 license:** needs a choice (e.g., MIT for maximum
  permissiveness/adoption). Flagging, not deciding.
- **NFR-K-11 update path:** the download model makes this the weakest
  NFR; the spec should specify the concrete update/migrate procedure and
  the pinning policy, and note the package model as the eventual upgrade.

---

## Review & Approval

| Role | Name | Date | Status |
|:-----|:-----|:-----|:-------|
| AUTHOR | Cowork design session (Claude) | 2026-06-09 | DRAFT |
| USER | | | PENDING |

## AI Disclosure

Prepared with AI assistance (Claude, Anthropic); pending human review.
