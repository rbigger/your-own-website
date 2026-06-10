# SPEC-YOW-002 — Content Abstraction Layer (CMS Decoupling)

| Field     | Value                                              |
| --------- | -------------------------------------------------- |
| Status    | COMPLETE                                           |
| Type      | SPEC                                               |
| Product   | YOW (Your Own Website)                             |
| Owner     | (assign)                                           |
| Date      | 2026-06-08                                         |
| Related   | SPEC-YOW-001 (env config), GUIDE-YOW-001 (naming)  |
| Depends on| SPEC-YOW-001 (COMPLETE) — provider reuses its client |
| Part of   | Portability work — 2 of 3 (CMS decoupling)         |

## 1. Context & problem

`web/src/lib/sanity.ts` is centralized but it is a **query module, not an
abstraction**: its functions return raw Sanity documents, so Sanity's
data shape leaks into the presentation layer. Three idioms are spread
across the pages:

| Sanity idiom                     | Where it leaks                              |
| -------------------------------- | ------------------------------------------- |
| `urlFor(...).width().height()`   | index, about, courses/index, courses/[slug], fleet, gallery, testimonials |
| `PortableText` + `astro-portabletext` | about (`ownerBio`), courses/[slug] (`description`) |
| `slug.current`, raw field shapes, `boat->`, `_id` | index, courses, fleet, etc. |

Consequence: swapping the CMS today means rewriting the pages, not one
adapter — the exact failure mode YOW's portability claim is meant to
avoid. Astro gives host portability for free, but content portability
must be engineered, and this spec engineers it.

## 2. Goals / non-goals

**Goal.** All CMS-specific code is confined to a single provider
directory. Pages, components, and layouts consume a vendor-neutral
content API and vendor-neutral types only. Replacing Sanity becomes
"implement one provider," not "rewrite the site."

**Non-goals.**
- Building a second provider. We build the *interface* + the Sanity
  provider only. (A throwaway mock provider is used in tests — §6.)
- Any change to rendered output. This is a pure refactor; the built site
  must be visually identical (§6.2).
- Comment **write** path (the Cloudflare function) — that is SPEC-YOW-003.
  Comment **read** (`getApprovedComments`) is in scope here.

## 3. Design overview

Introduce `web/src/lib/content/` with three parts:

```
web/src/lib/content/
  types.ts          vendor-neutral domain types + ImageSource + RichText
  index.ts          page-facing content API; selects the active provider
  sanity/
    client.ts       Sanity client (reads SPEC-YOW-001 env config)
    queries.ts      GROQ queries (Sanity-only; never imported by pages)
    map.ts          Sanity document -> domain type mappers
    image.ts        ImageSource impl via @sanity/image-url
    richtext.ts     Portable Text -> RichText.html via @portabletext/to-html (§5.2)
```

**Rule:** only files under `lib/content/sanity/` may import
`@sanity/client`, `@sanity/image-url`, `@portabletext/to-html`, or use
GROQ. Everything else imports from `lib/content` (the neutral API/types).

The current `web/src/lib/sanity.ts` is deleted; its image helper and
queries move inside the provider.

## 4. Domain model (vendor-neutral types)

Defined in `types.ts`. No Sanity types appear in any signature. All
`slug` fields are plain `string`; all references are resolved to nested
domain objects; all images are `ImageSource`; the two rich-text fields
are `RichText`.

| Type            | Key fields (normalized)                                   |
| --------------- | --------------------------------------------------------- |
| `SiteSettings`  | siteName, tagline, scheme, ownerName, ownerIntro, ownerBio: RichText, ownerPhoto: ImageSource, yearsTeaching, certifications: string[], phone, email, location, socialLinks, youtubeConfig |
| `Course`        | id, code, title, slug, tagline, summary, description: RichText, learningOutcomes: string[], duration, schedule, boat?: Boat, maxStudents, womenOnlyAvailable, priceFrom, priceNote, bookingType, prerequisites, certification, image?: ImageSource |
| `Boat`          | id, name, model, slug, role, loa, beam, draft, displacement, sailArea, engine, steering, features: string[], whyThisBoat, photo?: ImageSource, gallery: ImageSource[] |
| `Testimonial`   | id, quote, authorName, authorPhoto?: ImageSource, courseName?, date?, featured |
| `GalleryPhoto`  | id, image: ImageSource, caption?, category, featured, sortOrder |
| `Video`         | id, youtubeId, title, description, duration, durationSeconds, publishedAt, thumbnailUrl, category?: VideoCategory, videoType, featured, tags: string[], viewCount, sortOrder |
| `VideoCategory` | id, name, slug, description?, icon?, sortOrder |
| `VideoSection`  | id, title, slug, description?, displayStyle, sourceType, maxVideos?, videos: Video[] |
| `Comment`       | id, name, comment, submittedAt                            |

## 5. The two hard couplings

### 5.1 Images

Today: `urlFor(course.image).width(400).height(250).url()` at the call
site, importing Sanity's builder.

Design: the domain model carries an opaque `ImageSource` (our type), and
the content API exposes `imageUrl(source, opts)`:

```ts
imageUrl(source: ImageSource, opts: { width?: number; height?: number;
  quality?: number; format?: string }): string
```

Pages call `imageUrl(course.image, { width: 400, height: 250 })` —
no Sanity import. The Sanity provider implements `imageUrl` with
`@sanity/image-url`; a future provider reimplements it. Every existing
call site uses width+height only, so this signature covers all of them;
keep the produced URLs/transform parameters identical to today so output
does not change (§6.2).

### 5.2 Rich text (DECISION: Option A — locked)

Two fields are Portable Text: `siteSettings.ownerBio`,
`course.description`.

**Locked design — serialize to HTML in the provider.** The neutral type
is `RichText = { html: string }`. The Sanity provider converts Portable
Text to an HTML string server-side (at build) and a neutral
`<RichText html={...} />` component in `lib/content` renders it via
Astro's `set:html`. Pages and the domain types never reference Portable
Text; a future provider simply supplies HTML.

Serializer: the provider uses `@portabletext/to-html` (a string
serializer) inside `lib/content/sanity/richtext.ts`. `astro-portabletext`
is removed from the project entirely — it is a component renderer and
cannot produce an HTML string inside a `.ts` mapper, so it is the wrong
tool under Option A. `<RichText>` is a trivial component that emits its
`html` via `set:html` and has no Portable Text dependency of any kind.

Consequence accepted: per-mark Astro component overrides are not
available; if custom rendering of a specific mark/block is later needed,
it is handled inside the provider's serializer, not in pages.

Rejected alternative (for the record): a neutral AST behind a wrapper
that internally uses `astro-portabletext`. It preserves richer rendering
control but only *hides* the Sanity shape rather than removing it, since
the neutral shape would essentially be Portable Text and every provider
would have to emit it.

## 6. Page-facing API & migration

`lib/content/index.ts` exports the same async function names the pages
already use (`getSiteSettings`, `getCourses`, `getCourse`, `getBoats`,
`getTestimonials`, `getFeaturedTestimonials`, `getGalleryPhotos`,
`getFeaturedVideo`, `getVideoSections`, `getApprovedComments`, …) plus
`imageUrl` and the `RichText` component. These delegate to the **active
provider**, selected at build time by a single switch (see §6.1; default:
Sanity). This keeps page diffs small: change the import path, swap
`urlFor(...)` for `imageUrl(...)`, and swap `<PortableText>` for
`<RichText>`.

Migrate incrementally, one page at a time (pages are independent). Build
the types + provider first, migrate one simple vertical slice
(`gallery.astro`) to validate the pattern, then the rest.

### 6.1 Provider selection (build-time switch)

The active provider is chosen by a `CONTENT_PROVIDER` build variable
(default `sanity`). `index.ts` imports the provider through a **build
alias** — a Vite `resolve.alias` entry (or a small virtual-module plugin)
in `astro.config.mjs` that maps one specifier
(e.g. `virtual:yow-content-provider`) to the selected provider's entry
file.

Why an alias and not a plain `import()` switch: a dynamic `import()` with
literal branches still leaves *every* branch in the build graph, so
Rollup/Vite would resolve `@sanity/client` even when another provider is
active — the project then cannot build with the Sanity packages absent,
which defeats the §7.3 proof. The alias keeps **only the selected
provider** (and its dependencies) in the graph. This makes the §7.3 test
literally achievable and reduces a future CMS swap to a one-line config
change — the portability payoff this spec exists for.

`imageUrl` and `<RichText>` resolve through the same selected provider,
since `ImageSource` and the HTML serialization are provider-specific.

## 7. Testing

### 7.1 Containment guard (CI grep)

After migration, these must return **zero** hits outside
`web/src/lib/content/sanity/`:

```
grep -rn "urlFor\|astro-portabletext\|PortableText\|\.current\|client\.fetch\|_type\|from '.*lib/sanity'" web/src/pages web/src/components web/src/layouts
```

Proves all Sanity idioms are confined to the provider.

### 7.2 Output-equivalence (the key oracle)

`astro build` before and after, then diff `dist/`. Output must be
identical (or differences explained and limited to insignificant
whitespace). Because the data is unchanged and only its shape changed,
any meaningful diff is a regression. Keep image transform parameters
identical so image URLs match.

### 7.3 Decoupling proof — mock provider

Implement a minimal in-memory provider returning fixtures, with **no
Sanity package imported**. Render a representative set of pages against
it and build successfully. This is the real proof the abstraction holds:
if the site builds with Sanity entirely absent, content portability is
genuine, not asserted.

Run it by setting `CONTENT_PROVIDER=mock` so the build alias (§6.1) points
at the mock fixture. The strongest form of this test additionally
uninstalls `@sanity/*` and `@portabletext/to-html` to prove no transitive
leak — achievable only because the alias keeps the Sanity provider out of
the build graph.

### 7.4 Type check

`tsc`/`astro check` passes, and a review confirms no Sanity type appears
in any exported signature of `types.ts` or `index.ts`.

### 7.5 Provider contract

For each content function, assert the returned object matches its domain
type (slug is string, references are nested objects, images are
ImageSource, rich text is RichText).

## 8. Acceptance criteria

- [ ] Containment grep (§7.1) returns 0 hits outside the provider dir.
- [ ] `dist/` diff (§7.2) shows no meaningful change.
- [ ] Provider selected via `CONTENT_PROVIDER` + build alias (§6.1);
      site builds with `CONTENT_PROVIDER=mock` and `@sanity/*` uninstalled
      (§7.3).
- [ ] No Sanity types in neutral API/type signatures (§7.4).
- [ ] `web/src/lib/sanity.ts` removed; all imports updated.
- [ ] Rich text implemented per Option A: `RichText = { html: string }`,
      provider serializes Portable Text to HTML via `@portabletext/to-html`,
      `<RichText>` renders via `set:html`.
- [ ] `web/package.json`: `astro-portabletext` removed,
      `@portabletext/to-html` added.
- [ ] `CONTENT_PROVIDER` added to `web/.env.example` (optional, default
      `sanity`) and noted in the deployer guide (per §9).
- [ ] Architecture/ADR note for the content-provider boundary added
      (per §9).

## 9. Deployment & documentation impact

**Deployment — no required changes.**

- The env contract from SPEC-YOW-001 is unchanged: same four variables,
  no new secrets, no new runtime variables.
- The dependency swap (`astro-portabletext` removed,
  `@portabletext/to-html` added) is applied automatically by
  `npm install` during the Cloudflare build — no deployer action.
- `CONTENT_PROVIDER` is an **optional** build variable that defaults to
  `sanity`. Add it to `web/.env.example` as a commented, optional line so
  the swap point is discoverable; a deployer who ignores it gets Sanity.

**Documentation.**

- End-user HOWTOs: no change. Owners continue editing in Sanity Studio;
  the abstraction is invisible to them.
- Deployer guide: add one line documenting the optional
  `CONTENT_PROVIDER` variable (default `sanity`).
- Contributor/architecture docs: add a short ADR or ARCH note describing
  the content-provider boundary (only `lib/content/sanity/` may touch CMS
  code) and how to add a new provider via the build alias (§6.1). This
  captures the mechanism the portability claim now depends on.

## 10. Implementation parts & sequencing

This spec is delivered in ordered parts. Each part has a test oracle and,
where noted, a hard dependency on an earlier part. Numbering follows the
build order.

| Part | Scope | Test oracle |
| ---- | ----- | ----------- |
| 0 | **Baseline snapshot.** Capture the current `dist/` build as the golden reference before any change. | Artifact exists |
| 1 | **Types + API skeleton + directory.** `types.ts` (domain model, `ImageSource`, `RichText`), `index.ts` (delegating page-facing API), the `<RichText>` `set:html` component, provider directory layout. | Type-check |
| 1.5 | **Provider selection alias.** `CONTENT_PROVIDER` build var + Vite `resolve.alias`/virtual module in `astro.config.mjs` so only the active provider enters the build graph (§6.1). | Build with each provider value resolves correctly |
| 2 | **Sanity client + `imageUrl()` helper.** Client reuses SPEC-YOW-001 env config. | Unit: URLs identical to today |
| 3 | **Rich-text serialization** via `@portabletext/to-html`. | Unit |
| H | **Mock provider (harness).** Minimal in-memory provider, no Sanity import. Built early so it is a live fixture during Part 5, not only the final gate. | Builds against mock |
| 4 | **Query functions + mappers** for all content types. Depends on Parts 2 and 3 (`Course`/`SiteSettings` mappers emit `ImageSource` and `RichText`). | Unit + contract per type |
| 5 | **Migrate all consumers** — pages, `Layout.astro`, **and** `CommentList.astro` — one at a time (vertical slice `gallery.astro` first; rich-text pages `about`, `courses/[slug]` after Part 3). Ends by deleting `web/src/lib/sanity.ts` once every consumer is migrated. | Output-equivalence vs Part 0 baseline, per consumer |
| 6 | **Decoupling proof.** Build with `CONTENT_PROVIDER=mock` and `@sanity/*` + `@portabletext/to-html` uninstalled (§7.3). | Build succeeds with Sanity absent |

**Why this order.**

- Part 0 must precede Part 5; without a pre-refactor baseline the
  output-equivalence test (§7.2) has no reference.
- Part 1.5 must precede Part 6; the alias is what keeps the unused
  provider out of the build graph, which is the only way the
  "build with Sanity uninstalled" proof is achievable.
- Parts 2 and 3 must precede Part 4 (mapper dependency above).
- Migrate one consumer at a time (Part 5): the per-consumer `dist` diff
  isolates exactly one regression; grouping obscures which change broke
  equivalence. Note the scope is consumers, not just `pages/` —
  `Layout.astro` and `CommentList.astro` also import the old module.
