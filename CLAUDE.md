# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mango Lollipop is an AI-powered lifecycle messaging generator for SaaS companies. It runs entirely through Claude Code skills — no hosted services. It analyzes a business, generates a complete AARRR lifecycle messaging matrix, writes full message copy in the user's brand voice, and outputs production-ready deliverables (Excel, HTML dashboard, markdown message files).

The authoritative spec is `mango-lollipop-spec.md` at the project root. Always consult it for detailed requirements before implementing.

## Architecture

### Skills-based design
The core logic lives in Claude Code skills under `skills/`, each with a `SKILL.md`:
- **start** — Gather business info via dual-path onboarding (fresh vs. existing messaging)
- **generate-matrix** — Build the AARRR lifecycle matrix from analysis output
- **generate-messages** — Write full message copy in the brand's voice (batched by 10)
- **generate-dashboard** — Create HTML dashboard + executive overview
- **dev-handoff** — Generate developer hand-off documents (intro email + technical event spec)
- **audit** — Deep analysis for users with existing messaging (maturity scorecard, gap analysis)
- **iterate** — Conversational refinement of the matrix

### Data flow
`start` produces `analysis.json` → `generate-matrix` produces `matrix.json` + `matrix.xlsx` → `generate-messages` writes `messages/{STAGE}/{ID}-{slug}.md` → `generate-dashboard` produces `dashboard.html`, `overview.html`

### Key data model (defined in `lib/schema.ts`)
Messages use the industry-standard trigger/wait/guard/suppression model (not "delay"/"not sent if"). See spec section 2.4 for the `Message`, `Trigger`, `Guard`, `Suppression` interfaces. Transactional messages (TX-*) are always separated from lifecycle messages (AARRR stages: AQ, AC, RV, RT, RF).

### Output structure
All generated files go to `output/{project-name}/` (gitignored). Messages are organized into stage folders: `TX/`, `AQ/`, `AC/`, `RV/`, `RT/`, `RF/`.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| CLI framework | Commander.js |
| Skills runtime | Claude Code |
| Excel generation | SheetJS (xlsx) |
| HTML outputs | Vanilla HTML + Tailwind CDN |
| Data format | JSON + YAML frontmatter in .md |
| Package manager | npm |

No PDF generation, no Puppeteer, no build tools.

## Commands

```bash
# CLI
mango-lollipop init [project-name]   # Scaffold project directory
mango-lollipop generate              # Run full pipeline (matrix → messages → visuals)
mango-lollipop audit                 # Audit existing messaging
mango-lollipop view                  # Open dashboard.html in browser
mango-lollipop export excel|html|messages
mango-lollipop status                # Message counts per stage, channel distribution, tags

```

## Conventions

- **One channel per message entry.** Each message targets exactly one channel (`"channel": "email"` or `"channel": "in-app"`). If a logical message needs both, create two entries with sequential IDs.
- Message IDs follow the pattern `{STAGE}-{NN}` (e.g., `AC-03`, `TX-01`)
- Wait durations use ISO 8601: `P0D` (instant), `PT5M` (5 min), `P2D` (2 days)
- Guards use AND logic (all must pass); suppressions use OR logic (any cancels)
- Tags are freeform strings with category prefixes: `type:`, `source:`, `plan:`, `segment:`, `feature:`, `priority:`
- Message files use YAML frontmatter + markdown body with channel-specific sections (`## Email`, `## In-App`, etc.)
- Personalization tokens: `{{first_name}}`, `{{company_name}}`, `{{feature_name}}`
- Transactional messages are non-negotiable (always generated) and legally distinct from lifecycle messages
- HTML outputs are self-contained single files (CDN dependencies only)
- Favor minimal implementations; add complexity only when clearly required
