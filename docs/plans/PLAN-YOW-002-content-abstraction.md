# Implementation Plan: SPEC-YOW-002 Content Abstraction Layer

## Document Control

| Field | Value |
|:------|:------|
| Document ID | PLAN-YOW-002-content-abstraction |
| Version | 1.1 |
| Status | DRAFT |
| Created | 2026-06-08 |
| Author | ARCHITECT_20260526_121237_065479 |
| Spec | SPEC-YOW-002-content-abstraction.md |

---

## 1. Objective

Implement the content abstraction layer as defined in SPEC-YOW-002. This decouples the site from Sanity's data shape, confining all CMS-specific code to a single provider directory.

**Success criteria:** The site builds with Sanity packages uninstalled when using the mock provider.

---

## 2. Implementation Parts

Per SPEC-YOW-002 §10, delivered in order with test oracles.

### Part 0: Baseline Snapshot

**Scope:** Capture current `dist/` build as golden reference.

**Deliverables:**
- Run `astro build` on current codebase
- Archive `dist/` as baseline for Part 5 comparisons

**Test Oracle:** Artifact exists.

**Blocked By:** None

---

### Part 1: Types + API Skeleton + Directory

**Scope:** Create the content abstraction structure.

**Deliverables:**
- `web/src/lib/content/types.ts` - All domain types from §4:
  - SiteSettings, Course, Boat, Testimonial, GalleryPhoto
  - Video, VideoCategory, VideoSection, Comment
  - ImageSource, RichText
- `web/src/lib/content/index.ts` - Page-facing API (stubs delegating to provider)
- `web/src/lib/content/RichText.astro` - Trivial component: `set:html`
- `web/src/lib/content/sanity/` - Directory structure

**Test Oracle:** `tsc` / `astro check` passes.

**Blocked By:** Part 0

---

### Part 1.5: Provider Selection Alias

**Scope:** Build-time provider switch per §6.1.

**Deliverables:**
- `CONTENT_PROVIDER` env var (default: `sanity`)
- Vite `resolve.alias` in `astro.config.mjs` mapping `virtual:yow-content-provider` to selected provider
- Update `index.ts` to import via the alias

**Test Oracle:** Build with `CONTENT_PROVIDER=sanity` and `CONTENT_PROVIDER=mock` (mock can be stub initially).

**Blocked By:** Part 1

**Critical for:** Part 6 (alias keeps unused provider out of build graph)

---

### Part 2.0: Baseline Image URL Capture

**Scope:** Capture current `urlFor()` outputs for unit test comparison.

**Deliverables:**
- Run existing pages and capture sample `urlFor()` calls with their outputs
- Document at least one sample per call site (gallery, fleet, courses, testimonials, about, index)
- Store as test fixture for Part 2 verification

**Test Oracle:** Fixture file exists with documented URL samples.

**Blocked By:** Part 1.5

---

### Part 2: Sanity Client + imageUrl()

**Scope:** Image handling in provider.

**Deliverables:**
- `web/src/lib/content/sanity/client.ts` - Reuses SPEC-YOW-001 env config
- `web/src/lib/content/sanity/image.ts` - `imageUrl(source, opts)` using `@sanity/image-url`

**Test Oracle:** Unit test - URLs identical to Part 2.0 baseline samples.

**Blocked By:** Part 2.0

---

### Part 3.0: Baseline Rich Text Capture

**Scope:** Capture current `<PortableText>` HTML output for unit test comparison.

**Deliverables:**
- Render `about.astro` and capture `ownerBio` HTML output
- Render a `courses/[slug].astro` and capture `description` HTML output
- Store as test fixture for Part 3 verification

**Test Oracle:** Fixture file exists with documented HTML samples.

**Blocked By:** Part 1.5

---

### Part 3: Rich Text Serialization

**Scope:** Portable Text → HTML per §5.2 Option A.

**Deliverables:**
- `web/src/lib/content/sanity/richtext.ts` - Uses `@portabletext/to-html`
- Add `@portabletext/to-html` to dependencies

**Test Oracle:** Unit test - HTML output matches Part 3.0 baseline samples.

**Blocked By:** Part 3.0

---

### Part H: Mock Provider (Harness)

**Scope:** In-memory provider with fixtures, no Sanity imports.

**Deliverables:**
- `web/src/lib/content/mock/index.ts` - Implements all content functions
- `web/src/lib/content/mock/fixtures.ts` - Sample data for each type
- `web/src/lib/content/mock/image.ts` - Returns placeholder URLs
- `web/src/lib/content/mock/RichText.astro` - Simple HTML pass-through

**Test Oracle:** `astro build` with `CONTENT_PROVIDER=mock` succeeds.

**Blocked By:** Part 1.5

**Value:** Live fixture during Part 5 migration, validates interface sufficiency.

---

### Part 4: Query Functions + Mappers

**Scope:** All content retrieval functions.

**Deliverables:**
- `web/src/lib/content/sanity/queries.ts` - All GROQ queries
- `web/src/lib/content/sanity/map.ts` - Sanity doc → domain type mappers
- `web/src/lib/content/sanity/index.ts` - Exports: getSiteSettings, getCourses, getCourse, getBoats, getTestimonials, getFeaturedTestimonials, getGalleryPhotos, getFeaturedVideo, getVideoSections, getApprovedComments, imageUrl

**Test Oracle:**
- Unit: Each function returns correct domain type
- Contract: slug is string, references resolved, images are ImageSource, rich text is RichText

**Blocked By:** Parts 2 and 3 (mappers need imageUrl and richtext helpers)

---

### Part 5: Migrate All Consumers

**Scope:** Pages, layouts, and components - one at a time.

**Migration Order (leaf-first: components before pages that import them):**
1. `gallery.astro` - Vertical slice, images only, no rich text
2. `fleet.astro` - Images, simple types
3. `CommentList.astro` - Approved comments (must precede testimonials)
4. `testimonials.astro` - Images, includes CommentList
5. `index.astro` - Mixed content
6. `about.astro` - Rich text (ownerBio) - after Part 3
7. `courses/index.astro` - Course listings
8. `courses/[slug].astro` - Rich text (description) - after Part 3
9. `videos.astro` - Video sections
10. `Layout.astro` - Site settings

**Per-consumer deliverables:**
- Change import from `lib/sanity` to `lib/content`
- Replace `urlFor(...)` with `imageUrl(...)`
- Replace `<PortableText>` with `<RichText>`
- Remove `.current` from slug access
- Run output-equivalence diff against Part 0 baseline

**Final step:** Delete `web/src/lib/sanity.ts` and remove `astro-portabletext` from dependencies.

**Test Oracle:** `dist/` diff per consumer shows no meaningful change vs baseline.

**Blocked By:** Parts 4, H (mock provider as validation harness)

---

### Part 6: Decoupling Proof

**Scope:** Final portability demonstration per §7.3.

**Steps:**
1. Set `CONTENT_PROVIDER=mock`
2. Uninstall `@sanity/client`, `@sanity/image-url`, `@portabletext/to-html`
3. Run `astro build`

**Test Oracle:** Build succeeds with Sanity packages absent.

**Blocked By:** Parts 1.5 (alias), 5 (all consumers migrated)

---

## 3. Dependency Graph

```
Part 0 (baseline)
    │
    ▼
Part 1 (types + skeleton)
    │
    ▼
Part 1.5 (provider alias) ─────────────────────────┐
    │                                              │
    ├──────────┬──────────┬──────────┐            │
    ▼          ▼          ▼          ▼            │
Part 2.0   Part 3.0   Part H      (parallel)      │
(img base) (rt base)  (mock)                      │
    │          │                                  │
    ▼          ▼                                  │
Part 2     Part 3                                 │
(client)   (richtext)                             │
    │          │                                  │
    └────┬─────┘                                  │
         ▼                                        │
      Part 4 (queries + mappers)                  │
         │                                        │
         ▼                                        │
      Part 5 (migrate consumers, delete sanity.ts)│
         │                                        │
         ▼                                        │
      Part 6 (decoupling proof) ◄─────────────────┘
```

---

## 4. Test Strategy

| Part | Test Type | Oracle |
|:-----|:----------|:-------|
| 0 | Artifact | dist/ snapshot exists |
| 1 | Type check | `astro check` passes |
| 1.5 | Build | Both provider values resolve |
| 2.0 | Artifact | imageUrl baseline fixture exists |
| 2 | Unit | Image URLs identical to 2.0 baseline |
| 3.0 | Artifact | Rich text baseline fixture exists |
| 3 | Unit | HTML output matches 3.0 baseline |
| H | Build | Mock provider builds |
| 4 | Unit + Contract | Types match, references resolved |
| 5 | Output equivalence | dist/ diff per consumer |
| 6 | Build | Sanity uninstalled, build succeeds |

### Diff Criteria (Part 5)

**PASS conditions:**
- Whitespace-only differences (formatting, line breaks)
- Attribute reordering within HTML tags

**FAIL conditions:**
- Content text changes
- Missing or added elements
- Changed URLs (except asset hashes - see below)
- Structural changes

**Asset hash handling (Option 1 - Trust Determinism):**
Asset filenames with content hashes (e.g., `style.abc123.css`) should remain identical since source content is unchanged. If hashes differ:
1. Investigate root cause (non-deterministic build, timestamp injection, etc.)
2. Report to ARCHITECT before marking as PASS
3. Do not assume hash differences are acceptable without investigation

**Final acceptance (§7.1):**
```bash
grep -rn "urlFor\|astro-portabletext\|PortableText\|\.current\|client\.fetch\|_type\|from '.*lib/sanity'" web/src/pages web/src/components web/src/layouts
```
Must return 0 hits.

---

## 5. RACI Matrix

| Part | CODER | TESTER | ARCHITECT |
|:-----|:------|:-------|:----------|
| 0 | R | I | A |
| 1 | R | I | A |
| 1.5 | R | C | A |
| 2.0 | R | R | A |
| 2 | R | R | A |
| 3.0 | R | R | A |
| 3 | R | R | A |
| H | R | R | A |
| 4 | R | R | A |
| 5 | R | R | A |
| 6 | I | R | A |

R = Responsible, A = Accountable, C = Consulted, I = Informed

---

## 6. Workflow

1. CODER implements part
2. CODER sends to TESTER
3. TESTER runs test oracle, reports results to ARCHITECT
4. If PASS: ARCHITECT signals CODER to proceed to next part
5. If FAIL: CODER fixes, returns to step 2
6. Repeat until Part 6 complete

---

## 7. Acceptance Criteria (from SPEC-YOW-002 §8)

- [ ] Containment grep (§7.1) returns 0 hits outside provider dir
- [ ] `dist/` diff (§7.2) shows no meaningful change
- [ ] Site builds with `CONTENT_PROVIDER=mock` and `@sanity/*` uninstalled
- [ ] No Sanity types in neutral API/type signatures
- [ ] `web/src/lib/sanity.ts` removed
- [ ] Rich text per Option A: `RichText = { html: string }`
- [ ] `astro-portabletext` removed, `@portabletext/to-html` added
- [ ] `CONTENT_PROVIDER` in `web/.env.example`
- [ ] Architecture/ADR note added

---

## Review & Approval

| Role | Name | Status | Date |
|:-----|:-----|:-------|:-----|
| ARCHITECT | ARCHITECT_20260526_121237_065479 | REVISED | 2026-06-08 |
| TESTER | TESTER_20260605_102937_732241 | REVIEWED | 2026-06-08 |
| CODER | | PENDING | |
| USER | | PENDING | |

---

## Change Log

| Version | Date | Author | Changes |
|:--------|:-----|:-------|:--------|
| 1.0 | 2026-06-08 | ARCHITECT | Initial draft |
| 1.1 | 2026-06-08 | ARCHITECT | Incorporated TESTER feedback: added Parts 2.0/3.0 for baseline captures; reordered Part 5 migration (CommentList before testimonials); defined diff criteria with asset hash policy (Option 1) |

---

*ARCHITECT_20260526_121237_065479 | GUID: ff7b0519-d48f-4ca1-be6d-4250872bf579*
