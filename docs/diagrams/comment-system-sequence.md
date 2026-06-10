# Comment System Sequence Diagram

## UML Sequence Diagram: Visitor Comment Submission to Display

![Comment System Sequence](comment-system-sequence.svg)

---

## Phases

### Phase 1: Comment Submission
- Visitor fills form and submits
- Cloudflare Worker validates input
- Spam detection (patterns, honeypot)
- Silent rejection for detected spam

### Phase 2: Save to Sanity
- Worker creates comment document in Sanity
- Document saved with `approved: false`
- Optional email notification to Owner
- Visitor sees success message

### Phase 3: Moderation
- Owner logs into Sanity Studio
- Reviews pending comments (○ = unapproved)
- Approves (✓) or deletes spam
- Approved comments marked `approved: true`

### Phase 4: Deploy
- Owner triggers Cloudflare deployment
- Build fetches approved comments from Sanity
- Static HTML generated with comments
- Deployed to CDN edge locations

### Phase 5: Display
- Visitor returns to testimonials page
- Sees their approved comment displayed

---

## Participants

| Participant | Type | Description |
|-------------|------|-------------|
| Visitor | Actor | Person submitting a comment |
| Comment Form | Astro Page | Frontend form component |
| Cloudflare Worker | Serverless Function | Validates and processes submissions |
| Sanity API | External Service | Content database |
| Sanity Studio | Web Application | CMS dashboard for Owner |
| Owner | Actor | Site owner / moderator |
| Cloudflare Pages | Build Service | Static site generator and CDN |
| Live Website | Static Site | Public-facing website |

---

*Generated: 2026-06-05*
