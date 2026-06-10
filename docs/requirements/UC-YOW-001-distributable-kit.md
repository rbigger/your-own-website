# UC-YOW-001 — Use Cases: The Distributable YOW Kit

## Document Control

| Field | Value |
|:------|:------|
| Document ID | UC-YOW-001 |
| Type | UC |
| Version | 0.1 |
| Status | DRAFT |
| Classification | INTERNAL |
| Created | 2026-06-09 |
| Owner | (assign) |
| Product | YOW (Your Own Website) |

| Lineage | Document |
|:--------|:---------|
| Parent | VISION-YOW-001 |
| Related | NFR-YOW-001, PLAN-YOW-001, GUIDE-YOW-001 |

---

## Actors

- **Deployer** — minimal skills; downloads and stands up a site.
- **Owner** — no technical skills; maintains content via the CMS.
- **Maintainer** — the YOW team; produces and updates the kit.
- **Visitor** — the public end-user of a deployed site (mostly out of
  scope here; included where it bounds a feature).

---

## UC-K-01 — Deploy a new site from the kit

- **Actor:** Deployer
- **Precondition:** has the downloaded kit; can create free accounts.
- **Main flow:** download/unzip the kit → create Sanity + Cloudflare
  accounts → run the setup script, which prompts for the handful of
  config values and writes the env files → push/upload to Cloudflare
  Pages → site builds and goes live.
- **Success:** a working site is live with **zero edits to any source
  file**; missing/incorrect config produces a clear, named error, not a
  cryptic failure.

## UC-K-02 — Personalize identity & branding

- **Actor:** Owner (or Deployer)
- **Main flow:** in Studio, set site name, tagline, owner info, contact
  details, social links, and choose a theme/scheme — all in
  `siteSettings`.
- **Success:** the site reflects the owner's identity with **no source
  edit**; no pilot-specific identity remains anywhere by default.

## UC-K-03 — Edit content

- **Actor:** Owner
- **Main flow:** in Studio, add/edit the generic content types
  (offerings, testimonials, gallery items, media, pages) and publish.
- **Success:** content changes appear on the site after the normal
  publish/rebuild; the owner needs no technical help for any routine
  content task.

## UC-K-04 — Enable or disable optional features

- **Actor:** Deployer
- **Main flow:** via config/flags, turn optional features on/off
  (comments, newsletter, map, hosted-link payment, etc.).
- **Success:** disabled features emit no UI and create no dependency;
  disabling comments leaves the site fully static-host-deployable
  (SPEC-YOW-003).

## UC-K-05 — Generalization test: generate the consultant site

- **Actor:** Maintainer / QA
- **Main flow:** from the kit, configure a **consultant** site (different
  from sailing) with its own content via the generic content model.
- **Success:** the consultant site builds and renders correctly with
  **zero source edits**. Any place a `.ts` edit is required marks the
  real boundary of Strategy A (and a candidate for Strategy B later).
- **Note:** this is the iteration's primary falsification test.

## UC-K-06 — Dogfood: build the YOW marketing site

- **Actor:** Maintainer
- **Main flow:** build the YOW marketing site *on the kit*; capture its
  content as the kit's **default seed/demo** dataset.
- **Success:** the marketing site ships on the kit (credible dogfood),
  and a fresh download shows a working demo out of the box. If the
  marketing site needs flexibility the consultant did not, that
  divergence is the signal to reconsider Strategy A vs B.

## UC-K-07 — Obtain a kit update / fix

- **Actor:** Deployer (on behalf of Owner)
- **Main flow:** a newer kit version is published; the deployer obtains
  it and re-applies it over their instance (config/content preserved
  because they live outside the kit core).
- **Success:** the update process is **documented and feasible for a
  semi-technical deployer**; security-relevant dependencies are pinned so
  "do nothing" is not silently unsafe.
- **Note:** this is the weakest path under the download model — see
  NFR-YOW-001; the package model is the longer-term remedy.

## UC-K-08 — Recover from a broken build / troubleshoot

- **Actor:** Owner / Deployer
- **Main flow:** a publish or deploy fails (e.g., bad config, a content
  edit that breaks a build); the user consults the **recovery guide**
  written for the panic moment and either self-fixes or safely reverts.
- **Success:** a non-developer can diagnose the common failure modes and
  knows where the logs live; no failure leaves the live site broken with
  no path back.

---

## Use-case → requirement notes

- UC-K-01/-02/-03 carry the SPEC-YOW-001 "no source edits" invariant into
  the kit (config and identity, not just the Sanity project).
- UC-K-05 is both a use case and an **acceptance demonstration**
  (mirrored in NFR-YOW-001).
- UC-K-07/-08 are the maintain-over-time value link and the iteration's
  acknowledged risk area.

---

## Review & Approval

| Role | Name | Date | Status |
|:-----|:-----|:-----|:-------|
| AUTHOR | Cowork design session (Claude) | 2026-06-09 | DRAFT |
| USER | | | PENDING |

## AI Disclosure

Prepared with AI assistance (Claude, Anthropic); pending human review.
