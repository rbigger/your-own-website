# GUIDE-YOW-001 — Documentation Naming Convention

| Field    | Value                                  |
| -------- | -------------------------------------- |
| Status   | Active                                 |
| Type     | GUIDE                                  |
| Product  | YOW (Your Own Website)                 |
| Date     | 2026-06-08                             |
| Applies  | All files under `docs/`                |

## Purpose

A single, predictable scheme for naming documentation files and
organizing them into folders, so that contributors and agents can find,
create, and cross-reference docs without guessing. This replaces the
inconsistent mix of `YOS`/`YOW` tokens, optional numbering, and mixed
casing currently in the repo.

## File naming pattern

```
TYPE-YOW-NNN-short-slug.md
```

| Segment | Rule                                                        |
| ------- | ----------------------------------------------------------- |
| `TYPE`  | Controlled vocabulary, uppercase (see table below).         |
| `YOW`   | Fixed product token. Always `YOW`. Never `YOS`.             |
| `NNN`   | 3-digit zero-padded sequence, **per type** (001, 002, ...). |
| `slug`  | Short, lower-kebab-case description. 2–5 words.             |
| ext     | `.md` / `.mmd` are source. `.pdf` / `.svg` are generated.   |

Examples:

```
SPEC-YOW-001-sanity-env-config.md
ADR-YOW-001-tech-stack.md
HOWTO-YOW-003-manage-videos.md
```

## Type vocabulary

| TYPE        | Meaning                                   | Folder           |
| ----------- | ----------------------------------------- | ---------------- |
| `VISION`    | Vision / strategy                         | `docs/vision/`   |
| `ADR`       | Architecture Decision Record              | `docs/adr/`      |
| `ARCH`      | Architecture description                  | `docs/arch/`     |
| `NFR`       | Non-functional requirements               | `docs/requirements/` |
| `UC`        | Use cases                                 | `docs/requirements/` |
| `SPEC`      | Feature / component specification         | `docs/specs/`    |
| `PLAN`      | Implementation / work plan                | `docs/plans/`    |
| `TEST-PLAN` | Test plan                                 | `docs/plans/`    |
| `TRACKING`  | Status / progress tracking                | `docs/plans/`    |
| `GUIDE`     | Operator / contributor / deployer guide   | `docs/guides/`   |
| `HOWTO`     | End-user (site owner) task guide          | `docs/guides/`   |
| `REPORT`    | Meeting notes, lessons learned, retros    | `docs/reports/`  |

If a new document does not fit an existing type, propose a new type code
in an ADR rather than inventing one ad hoc.

## Folder structure

```
docs/
  vision/         VISION
  adr/            ADR
  requirements/   NFR, UC
  arch/           ARCH
  specs/          SPEC
  plans/          PLAN, TEST-PLAN, TRACKING
  guides/         GUIDE, HOWTO
  diagrams/       .mmd source + generated .svg
  reports/        generated PDFs + meeting notes
```

The `TYPE-` prefix is retained in filenames even though the folder
implies the type. This keeps filenames self-describing if a file is
moved, linked, or exported out of the repo.

## Source vs generated

- `.md` and `.mmd` files are **authoritative** and hand-edited.
- `.pdf` and `.svg` files are **generated exports** — never hand-edited.
  Regenerate them from source; treat them as disposable.
- Generated PDFs live in `docs/reports/`; generated diagram `.svg`
  files live alongside their `.mmd` source in `docs/diagrams/`.

## Numbering rules

- Sequence is per type: `SPEC-YOW-001`, `SPEC-YOW-002`, `ADR-YOW-001`.
- Numbers are never reused, even if a doc is deleted.
- To replace a doc, create a new number and mark the old one
  `Status: Superseded by <new-id>` in its header. Do not overwrite
  history.

## Migration of existing docs

Existing files (`ARCH-YOS-MODULAR-001.md`, `VISION-YOS-2026.md`,
`your-own-site-complete-style-guide.md`, etc.) predate this convention.
Renaming/moving them to match is a **separate, tracked task** — this
guide governs all *new* docs immediately, and existing docs are migrated
in a deliberate pass to avoid breaking inbound links.
