# Project Context

## Purpose
Mango Lollipop is an AI-powered lifecycle messaging generator for SaaS companies. It takes a SaaS business from "we need lifecycle messaging" to "here's a complete, ready-to-implement messaging system" in a single session. It runs entirely through Claude Code — no hosted services, no accounts, no SaaS dependencies.

Two user paths:
- **Starting fresh** — No lifecycle messaging in place. Builds everything from scratch.
- **Improving existing** — Has messages running but needs gap-filling, fixes, or leveling up. Audits and builds on top.

## Tech Stack
- **CLI framework:** Commander.js (`bin/mango-lollipop.js`)
- **Skills runtime:** Claude Code (skills under `skills/` with `SKILL.md` files)
- **Excel generation:** SheetJS (xlsx)
- **HTML outputs:** Vanilla HTML + Tailwind CSS (CDN) + Mermaid.js (CDN)
- **Journey maps:** Mermaid.js (text-based, version-friendly)
- **Data format:** JSON for machine data, YAML frontmatter in markdown for message files
- **Package manager:** npm
- No PDF generation, no Puppeteer, no build tools

## Project Conventions

### Code Style
- TypeScript for library code (`lib/`)
- JavaScript for CLI entry point (`bin/mango-lollipop.js`)
- Minimal dependencies — avoid frameworks without clear justification
- Default to <100 lines of new code per implementation unit
- Single-file implementations until proven insufficient

### Architecture Patterns
- **Skills-based:** Core intelligence lives in Claude Code skills (`skills/{name}/SKILL.md`), not in application code
- **Data pipeline:** `analyze` → `analysis.json` → `generate-matrix` → `matrix.json` → `generate-messages` → message files → `generate-visuals` → HTML/Mermaid outputs
- **Trigger/Wait/Guard/Suppression model:** Industry-standard messaging model (Customer.io/Braze/Iterable pattern) — not "delay"/"not sent if"
- **TX separation:** Transactional messages (TX-*) are always separate from lifecycle (AARRR: AQ, AC, RV, RT, RF) — different legal, deliverability, and opt-out requirements
- **Self-contained outputs:** HTML files use CDN for Tailwind and Mermaid.js, no build step needed

### Testing Strategy
- Schema validation via `lib/schema.ts` types
- OpenSpec validation: `openspec validate [id] --strict --no-interactive`
- Example projects (Butter, PandaDoc) serve as integration reference

### Git Workflow
- OpenSpec for spec-driven development (proposals before code)
- Use `/openspec:proposal` to scaffold changes, `/openspec:apply` to implement, `/openspec:archive` after deployment
- `output/` directory is gitignored (generated per-project)

## Domain Context
- **AARRR (Pirate Metrics):** Acquisition → Activation → Revenue → Retention → Referral — the lifecycle framework all messages map to
- **Transactional vs. Lifecycle:** Transactional messages (email verification, password reset, receipts) are legally required and cannot be unsubscribed from. Lifecycle messages drive engagement/conversion and require unsubscribe options (CAN-SPAM, GDPR).
- **Message IDs:** `{STAGE}-{NN}` format (e.g., `AC-03`, `TX-01`)
- **Wait durations:** ISO 8601 (`P0D` = instant, `PT5M` = 5 min, `P2D` = 2 days)
- **Guards (AND logic):** All conditions must be true to send
- **Suppressions (OR logic):** Any matching condition cancels the send
- **Tags:** Freeform strings with category prefixes (`type:`, `source:`, `plan:`, `segment:`, `feature:`, `priority:`)
- **Event taxonomy:** Inferred from product type rather than pulled from analytics tools

## Important Constraints
- No hosted services or accounts required — everything runs locally via Claude Code
- No direct ESP (email service provider) integration for MVP — Excel is the universal export format
- HTML outputs must be self-contained single files (CDN dependencies only, no build step)
- Message copy generation is batched (10 at a time) to keep the user in control
- Channel variants are only generated for channels the user selects during analysis
- Favor boring, proven patterns over novel approaches

## External Dependencies
- **SheetJS (xlsx):** Excel file generation for `matrix.xlsx`
- **Mermaid.js (CDN):** Journey map rendering in HTML dashboard
- **Tailwind CSS (CDN):** Dashboard and overview HTML styling
- **Commander.js:** CLI argument parsing
- **open (npm):** Opening dashboard in default browser (`mango-lollipop view`)
