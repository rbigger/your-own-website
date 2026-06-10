# ADR-YOW-003: Comment System Isolation

## Status

ACCEPTED

## Date

2026-06-08

## Context

The YOW (Your Own Website) pilot site needs to be portable across hosting platforms. Most of the site is static and can run anywhere. However, the comment submission feature requires server-side processing to:

1. Validate input
2. Detect spam
3. Write to Sanity CMS

This creates a dependency on Cloudflare Pages Functions that prevents deployment to static-only hosts.

## Decision

We isolate the comment system behind a feature flag (`PUBLIC_ENABLE_COMMENTS`) and clearly mark the non-portable boundary.

### Architecture

```
web/
├── src/                    # Portable (static)
│   ├── pages/
│   │   └── testimonials.astro   # Gates comment components
│   └── components/
│       ├── CommentList.astro    # Defensive guard
│       └── CommentForm.astro    # Defensive guard
└── functions/              # NON-PORTABLE
    └── api/
        └── comment.ts      # Cloudflare Pages Functions only
```

### Boundaries

1. **Non-portable code is contained to `web/functions/`**
   - Only `comment.ts` has runtime coupling
   - All other code in `web/src/` is statically analyzable

2. **Feature flag controls rendering**
   - `PUBLIC_ENABLE_COMMENTS` (default: true)
   - When false: comment UI does not render, no `/api/comment` reference in output

3. **Dual-gating for defense in depth**
   - Page-level: `testimonials.astro` conditionally includes components
   - Component-level: Each component checks flag and returns null if disabled

4. **Write path has its own Sanity coupling**
   - The comment endpoint writes directly to Sanity
   - This is separate from the read path (content abstraction layer)
   - Acceptable because comments are an optional feature

## Consequences

### Positive

- Site is fully portable when comments disabled
- Clear boundary makes the non-portable code obvious
- Deployers warned in documentation
- No runtime errors on static hosts (form simply doesn't render)

### Negative

- Comment feature requires Cloudflare Pages or equivalent
- Two places to check for comment-enabled state (page + component)
- Write path bypasses content abstraction (acceptable for optional feature)

### Neutral

- Flag defaults to `true` for backwards compatibility
- Existing Cloudflare deployment unchanged

## Verification

```bash
# Verify containment (should return 0 hits)
grep -rn "onRequest\|context.env" web/src

# Verify flag-off build
PUBLIC_ENABLE_COMMENTS=false npm run build
grep -l "/api/comment" dist/**/*.html  # Should return no files
```

## Related Documents

- SPEC-YOW-003: Comment System Isolation
- DEPLOYMENT-GUIDE.md: §Comments
- web/functions/api/comment.ts: Boundary header comment

---

*Author: CODER_20260526_121327_049827*
*Spec: SPEC-YOW-003*
