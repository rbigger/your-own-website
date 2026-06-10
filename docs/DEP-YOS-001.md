# Dependency Analysis: Your Own Site Platform

## Document Control

| Field | Value |
|:------|:------|
| Document ID | DEP-YOS-001 |
| Type | AN |
| Version | 1.1 |
| Status | DRAFT |
| Classification | INTERNAL |

| Field | Value |
|:------|:------|
| Created | 2026-06-07 |
| Author | ARCHITECT_20260526_121237_065479 |
| Owner | ARCHITECT |

| Lineage | Document |
|:--------|:---------|
| Source ADR | ADR-001-TECH-STACK |
| Parent Vision | VISION-YOS-2026 |
| Related | BRAINSTORM-YOS-2026, SPEC-YOW-001/002/003, PLAN-YOW-001 |

---

## 1. Purpose

This analysis maps the technical dependencies for the Your Own Site platform, establishing build order for features and identifying the complexity cliff at authentication.

**Scope:** All platform features from static pages through client portal
**Goal:** Determine which features can be built independently and which require foundational capabilities

---

## 2. Components

Components organized by "Feature Root" - groups of features sharing a common technical dependency.

| Root | Component | Description | Difficulty | Risk Factors |
|:-----|:----------|:------------|:-----------|:-------------|
| 0 | Infrastructure | Domain/DNS, deployment pipeline | L | External provider dependency |
| 1 | Editable Foundation | Astro + Cloudflare + Sanity base | M | Three-service integration |
| 1.5 | Static Pages | CMS-editable HTML pages | L | Content model design |
| 2 | JS Islands | Client-side interactivity (no backend) | L | Bundle size management |
| 3a | Contact Form | Third-party form handling | L | Provider selection |
| 3b | Newsletter | Email capture integration | L | Provider selection |
| 3c | Booking | Appointment scheduling embed | L | Provider API limits |
| 3d | Map | Location display embed | L | API key management |
| 3e | Video | Video hosting embed | L | None |
| 3f | Analytics | Traffic tracking | L | Privacy compliance |
| 3g | Events | Event listing embed | L | Provider selection |
| 3h | Comments | Moderated feedback system | M | Requires Sanity + Worker |
| 4 | Payment Rails | Stripe checkout/invoicing | M | PCI considerations |
| 5 | Identity/Auth | User authentication | H | Security, session management |
| 6 | Per-User Data | Client portal, personalized feed | H | Requires auth + database |
| 7 | Secure Storage | Access-controlled documents | H | Requires auth + storage |
| 8 | Real-Time Messaging | Live chat | H | Always-on infrastructure |

**Difficulty Scale:**
- **H (High):** Requires backend state, security considerations, or always-on infrastructure
- **M (Medium):** Known patterns with some integration complexity
- **L (Low):** Straightforward embed or client-side implementation

---

## 3. Dependency Table

| Root | Component | Depends On | Rationale |
|:-----|:----------|:-----------|:----------|
| 0 | Infrastructure | (none) | Foundation - DNS and deployment exist before code |
| 1 | Editable Foundation | 0 | Stack requires deployment target |
| 1.5 | Static Pages | 1 | Pages require CMS and SSG |
| 2 | JS Islands | 1 | Islands hydrate on static pages |
| 3a | Contact Form | 1 | Form submits from page |
| 3b | Newsletter | 1 | Signup form on page |
| 3c | Booking | 1 | Embed on page |
| 3d | Map | 1 | Embed on page |
| 3e | Video | 1 | Embed on page |
| 3f | Analytics | 1 | Script on pages |
| 3g | Events | 1 | Embed on page |
| 3h | Comments | 1 | Requires Sanity schema + Cloudflare Worker |
| 4 | Payment Rails | 1 | Checkout page, webhook handling |
| 5 | Identity/Auth | 1, 4 (optional) | Auth may integrate with payments |
| 6 | Per-User Data | 5 | Must know who user is |
| 7 | Secure Storage | 5 | Must authenticate before access |
| 8 | Real-Time Messaging | 5, 6 | Must know user, must persist messages |

**Dependency Question:** "What must exist before I can build this?"

---

## 4. Build Levels

Components grouped by dependency depth:

```
Level 0 (Soil):     Infrastructure (DNS, deployment)
                          |
Level 1 (Foundation):  Editable Foundation (Astro + Cloudflare + Sanity)
                          |
Level 2 (Base):     Static Pages + JS Islands
                          |
Level 3 (Embeds):   Contact, Newsletter, Booking, Map, Video,
                    Analytics, Events, Comments, Payment
                          |
         ─────────── TIER 3 CLIFF ───────────
                          |
Level 4 (Auth):     Identity/Authentication
                          |
Level 5 (Data):     Per-User Data, Secure Storage
                          |
Level 6 (Real-Time): Live Chat / Messaging
```

### Level Details

| Level | Components | Can Parallelize? |
|:------|:-----------|:-----------------|
| 0 | Infrastructure | N/A (foundation) |
| 1 | Editable Foundation | No - single integration |
| 2 | Static Pages, JS Islands | Yes - pages and islands are independent |
| 3 | All third-party embeds | Yes - each embed is independent |
| 4 | Identity/Auth | No - single capability |
| 5 | Per-User Data, Secure Storage | Yes - both need auth, independent of each other |
| 6 | Real-Time Messaging | No - requires both auth and data |

---

## 5. Build Order

Recommended sequence:

```
Phase 1: Infrastructure
    └── Domain, DNS, Cloudflare account, deployment pipeline
         |
Phase 2: Foundation
    └── Astro project, Sanity studio, Cloudflare Pages integration
         |
Phase 3: Base Package (PILOT SCOPE)
    ├── Static pages (all 12 types)
    ├── Style schemes
    └── JS Islands (nav, carousel, accordion, etc.)
         |
Phase 4: Embeds (PILOT SCOPE - selective)
    ├── Contact form (Formspree)
    ├── Video (YouTube)
    ├── Booking (FareHarbor)
    ├── Analytics (GA4)
    └── Comments (custom)
         |
         ─────────── TIER 3 CLIFF ───────────
         |
Phase 5: Authentication (FUTURE - if validated)
    └── Cloudflare Access or custom auth
         |
Phase 6: Persistent Data (FUTURE - if validated)
    ├── Client portal
    └── Secure document sharing
         |
Phase 7: Real-Time (DELIBERATELY DECLINED)
    └── Live chat - not planned
```

### Critical Path

The longest dependency chain for the pilot:

```
Infrastructure --> Foundation --> Static Pages --> Comments
     L0              L1              L2             L3
```

**Critical Path Duration:** Pilot complete (validated)

For Tier 3 features:

```
Foundation --> Auth --> Per-User Data --> Real-Time
    L1          L4          L5              L6
```

**Critical Path Duration:** TBD (not yet scoped)

---

## 6. Parallelism Opportunities

| Level | Parallel Work Possible | Resource Requirements |
|:------|:-----------------------|:----------------------|
| 2 | Static pages and JS islands can develop concurrently | Same developer, alternating focus |
| 3 | All embeds are independent - any subset in any order | Single developer can add incrementally |
| 5 | Per-user data and secure storage share auth but independent | Would need 2 developers for parallel |

---

## 7. NFR Constraints

Non-functional requirements that affect build order:

| NFR | Impact on Dependencies |
|:----|:-----------------------|
| Zero ongoing cost | Must use free tiers; limits auth options to Cloudflare Access |
| Non-technical owner | All Level 3 embeds must be owner-configurable via CMS or docs |
| No backend dependency | Levels 4-6 violate this; explicit decision required to cross cliff |

---

## 8. Risk Assessment

### High-Risk Components

| Component | Risk | Mitigation |
|:----------|:-----|:-----------|
| Identity/Auth (L4) | Security complexity, session management | Use Cloudflare Access if crossing cliff |
| Per-User Data (L5) | Database requirement, GDPR compliance | Defer until validated demand |
| Real-Time (L6) | Always-on infrastructure cost | Deliberately declined |

### Circular Dependencies

| Cycle | Resolution |
|:------|:-----------|
| None identified | N/A |

### The Tier 3 Cliff

The most significant finding: Levels 4-6 represent a **discontinuity**, not a gradual increase in complexity.

| Below Cliff (L0-L3) | Above Cliff (L4-L6) |
|:--------------------|:--------------------|
| Static or client-side | Requires server state |
| Third-party handles complexity | We own the complexity |
| Zero marginal cost | Infrastructure cost |
| Owner can self-serve | May need developer |

**Decision:** The pilot validates L0-L3. Crossing the cliff requires explicit business justification.

---

## 9. Key Insights

Non-obvious findings from this analysis:

1. **Level 3 is a family, not a tier:** Each third-party embed (contact, booking, video, etc.) is independent. There's no required order within Level 3. Add what you need.

2. **Comments is the most complex L3 element:** Unlike other embeds, comments requires both Sanity schema and Cloudflare Worker. It's the closest to the cliff without crossing it.

3. **Payment (L3) doesn't require auth:** Stripe checkout can work without user accounts. Simple invoicing is possible at L3. Full e-commerce would cross the cliff.

4. **Cloudflare may own the cliff:** Cloudflare Access (auth), R2 (storage), and D1 (database) could keep Tier 3 features inside the owner's Cloudflare account - preserving the ownership principle.

5. **The cliff is deliberate:** It's not a limitation to overcome but a boundary that protects simplicity. Most small businesses don't need L4+.

---

## 10. Ticket Mapping

Tickets to be created from this analysis:

| Component | Ticket ID | Blocked By | Status |
|:----------|:----------|:-----------|:-------|
| Infrastructure | (done) | - | Complete |
| Editable Foundation | (done) | - | Complete |
| Static Pages | (done) | - | Complete |
| JS Islands | (partial) | - | In pilot |
| Contact Form | (done) | - | Complete |
| Video | (done) | - | Complete |
| Booking | (done) | - | Complete |
| Analytics | (done) | - | Complete |
| Comments | (done) | - | Complete |
| Newsletter | TBD | Foundation | Not started |
| Map | TBD | Foundation | Not started |
| Events | TBD | Foundation | Not started |
| Payment | TBD | Foundation | Not scoped |
| Auth | TBD | Foundation | Deferred (cliff) |
| Per-User Data | TBD | Auth | Deferred (cliff) |
| Secure Storage | TBD | Auth | Deferred (cliff) |
| Real-Time | - | - | Declined |

### Portability Specifications (Cross-Cutting)

These specifications ensure L0-L3 components remain portable:

| Spec | Scope | Status |
|:-----|:------|:-------|
| SPEC-YOW-001 | Env config externalization | COMPLETE |
| SPEC-YOW-002 | Content abstraction layer (CMS decoupling) | COMPLETE |
| SPEC-YOW-003 | Comment system isolation (host portability) | COMPLETE |

**Impact:** The portability work validates that L0-L3 components can be deployed to any static host (with comments disabled) or Cloudflare Pages (with comments enabled). This confirms the Tier 3 Cliff boundary - crossing it requires explicit architectural decisions.

---

## 11. Validation

### Intuition Check

Does this order match expectations?

- [x] Yes - order aligns with pilot experience and brainstorm structure

### Reviewed By

| Role | Name | Date | Approved |
|:-----|:-----|:-----|:---------|
| ARCHITECT | ARCHITECT_20260526_121237_065479 | 2026-06-07 | [x] |
| USER | | | [ ] |

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
