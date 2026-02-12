# Mango Lollipop

AI-powered lifecycle messaging generator for SaaS companies.

Mango Lollipop uses Claude Code to analyze your business, generate a complete lifecycle messaging matrix using the AARRR pirate metrics framework, write full message copy in your brand voice, and produce production-ready deliverables -- all from your terminal.

It builds on proven industry templates, copywriting frameworks, and lifecycle best practices so you don't have to start from a blank page or reinvent the wheel.

## Philosophy

- **Local only** -- runs entirely on your machine through Claude Code. No hosted services, no accounts, no data leaving your terminal.
- **Production-ready deliverables** -- everything it generates (Excel, HTML, markdown) is ready to hand off to engineering or share with stakeholders. No "demo quality" output.
- **Some effort required** -- this is a collaborative tool, not a magic button. You review each step, give feedback, and steer the output. The AI does the heavy lifting, but your judgment makes it good.
- **Step by step** -- each skill runs independently so you can review, iterate, and course-correct before moving on. Rushing through produces mediocre results.
- **Scalable** -- works for a 5-message onboarding sequence or a 50-message lifecycle system. The framework scales; the effort stays manageable.
- **Easy, not complex** -- no build tools, no databases, no config files to wrestle with. Install, init, and start talking to Claude Code.

## What You Get

- **Excel matrix** -- your lifecycle messaging source of truth (`matrix.xlsx`) with a Welcome sheet, color-coded stages, and 5 data sheets
- **Interactive dashboard** -- sortable, filterable message matrix with tag sidebar and journey map (`dashboard.html`)
- **Message previews** -- channel-specific visual previews for email, in-app, SMS, and push (`messages.html`)
- **Executive overview** -- clean, printable summary for stakeholders (`overview.html`)
- **Full message copy** -- emails, in-app, push, SMS written in your voice (`messages/`)
- **Developer hand-off** -- introduction email + technical event spec for your engineering team
- **Iterative refinement** -- tweak anything conversationally through Claude Code

## Two Paths

**Starting fresh?** Mango Lollipop builds your entire messaging system from scratch based on your product, audience, and voice.

**Have existing messages?** Paste them in, share your stats, and Mango Lollipop audits what you have, fills gaps, and improves what's not working.

## Quick Start

```bash
# Install from GitHub
npm install -g github:sr-kai/mango-lollipop

# Initialize a project
mango-lollipop init my-company

# Open Claude Code in your project and run the start skill
/start
```

> Once published to npm: `npm install -g mango-lollipop`

## Typical Workflow

Mango Lollipop is designed to be used step by step. Each skill produces output you should review before moving on -- this is how you get good results instead of a wall of AI-generated text you have to untangle later.

Stay in Claude Code for the entire workflow. Every step is a slash command.

**Step 1: Analyze your business**
```
> /start
```
Paste your website URL and Claude will pull most of the information it needs automatically. It'll ask follow-up questions about your channels, voice, and key features. Review `analysis.json` when it's done -- this is the foundation everything else builds on.

**Step 2: Generate the messaging matrix**
```
> /generate-matrix
```
Creates every message with triggers, guards, suppressions, and timing. Open `matrix.xlsx` and review the strategy. Too many messages? Wrong triggers? Use `/iterate` to tweak before moving on.

**Step 3: Write the message copy**
```
> /generate-messages
```
Spins up a team of AI copywriters that work in parallel, each writing a batch of 10 messages in your brand voice. Spot-check a few messages in the `messages/` folder when they're done. If the tone is off, tell Claude and it'll adjust.

**Step 4: Generate visual deliverables**
```
> /generate-dashboard
```
Creates the interactive dashboard, message previews, and executive overview. Open `dashboard.html` in your browser to explore the full matrix with filters, journey maps, and channel-specific message previews.

**Step 5: Hand off to engineering**
```
> /dev-handoff
```
Generates two files: `dev-handoff-email.md` (an introduction email you can customize and send to your engineering team) and `event-spec.html` (the full technical event spec with payloads and code examples). Review both before sharing.

At any point, use `/iterate` to go back and change things conversationally, or `/audit` if you have existing messages you want analyzed first.

## Skills Reference

All 7 skills run inside Claude Code as slash commands.

### `/start` -- Business Analysis & Onboarding

Gathers your product info, voice samples, channel preferences, and event taxonomy. Paste your website URL and Claude extracts most of the details automatically -- you just confirm and fill in the gaps.

**Prerequisites:** An initialized project (`mango-lollipop init`)
**Outputs:** `analysis.json`, updated `mango-lollipop.json`

```
> /start
# Paste your website URL, answer a few questions, done
```

### `/generate-matrix` -- Build the Lifecycle Matrix

Creates the complete AARRR messaging matrix with transactional messages, triggers, guards, and suppressions.

**Prerequisites:** `analysis.json` from `/start`
**Outputs:** `matrix.json`, `matrix.xlsx` (6-sheet workbook with Welcome sheet and color-coded stages)

```
> /generate-matrix
# Generates TX-01 through RF-XX with full trigger/guard/suppression logic
```

### `/generate-messages` -- Write Message Copy

Spins up a parallel team of AI copywriters that write full message copy in your brand voice, batched by 10.

**Prerequisites:** `matrix.json` from `/generate-matrix`
**Outputs:** `messages/{STAGE}/{ID}-{slug}.md` files with YAML frontmatter and channel-specific body sections

```
> /generate-messages
# Writes all message copy, 10 messages at a time
```

### `/generate-dashboard` -- Create Visual Deliverables

Generates the interactive dashboard, message preview viewer, and printable executive overview.

**Prerequisites:** `matrix.json`, `analysis.json`, optionally `messages/` directory
**Outputs:** `dashboard.html`, `messages.html`, `overview.html`

```
> /generate-dashboard
# Creates 3 HTML files with journey maps, previews, and stats
```

### `/dev-handoff` -- Developer Hand-Off Documents

Generates an introduction email from marketing to engineering and a detailed technical event implementation spec.

**Prerequisites:** `matrix.json`, `analysis.json`
**Outputs:** `dev-handoff-email.md`, `event-spec.html`

```
> /dev-handoff
# Creates the email draft + interactive technical spec with code examples
```

### `/audit` -- Audit Existing Messaging

Deep analysis of your current lifecycle messaging with a maturity scorecard, gap analysis, and improvement recommendations.

**Prerequisites:** Your existing messages (pasted or described during the session)
**Outputs:** Audit report with maturity scores and prioritized recommendations

```
> /audit
# Paste your existing messages and stats for a full gap analysis
```

### `/iterate` -- Conversational Refinement

Modify the matrix conversationally -- add, remove, or tweak messages based on feedback.

**Prerequisites:** `matrix.json`
**Outputs:** Updated `matrix.json` and `matrix.xlsx`

```
> /iterate
# "Add a win-back email for users who cancelled" or "Change AC-03 to fire after 5 days"
```

## Output Files

| File | Description |
|------|-------------|
| `mango-lollipop.json` | Project configuration and state |
| `analysis.json` | Business analysis from the start skill |
| `matrix.json` | Structured messaging matrix (machine-readable) |
| `matrix.xlsx` | Full lifecycle matrix spreadsheet (Welcome + 5 data sheets, color-coded) |
| `dashboard.html` | Interactive dashboard with journey map, sortable matrix, tag filtering |
| `messages.html` | Channel-specific message previews with hash routing and keyboard nav |
| `overview.html` | Clean, printable executive summary with strategy overview |
| `messages/{STAGE}/*.md` | Individual message files with YAML frontmatter and full copy per channel |
| `dev-handoff-email.md` | Introduction email from marketing to engineering |
| `event-spec.html` | Technical event implementation spec with payloads and code examples |

## AARRR Framework

Every message maps to a pirate metrics lifecycle stage:

| Stage | Code | Purpose |
|-------|------|---------|
| Acquisition | `AQ` | Get users signed up and verified |
| Activation | `AC` | Drive to the "aha moment" |
| Revenue | `RV` | Convert free to paid, expand |
| Retention | `RT` | Keep users engaged and coming back |
| Referral | `RF` | Turn users into advocates |

Transactional messages (`TX`) are separated from lifecycle messages. They're non-negotiable (email verification, password reset, receipts), legally distinct, and always generated.

## Message Model

Every message targets exactly **one channel**: `email`, `in-app`, `sms`, or `push`. If a logical message needs to go out on both email and in-app, it becomes two separate entries with sequential IDs.

Each message includes:

- **Trigger** -- the event that fires the message (e.g., `user.email_verified`, `trial.ending_soon`). Can be an event, a scheduled job, or a behavioral signal.
- **Wait** -- how long to pause after the trigger before sending. Uses ISO 8601 durations: `P0D` (instant), `PT5M` (5 minutes), `P2D` (2 days).
- **Guards** -- conditions that must ALL be true for the message to send. Example: "User has not completed onboarding" prevents sending a getting-started guide to someone who already finished it. Guards use AND logic.
- **Suppressions** -- conditions where ANY one being true cancels the message. Example: "User already used this feature" prevents nagging about a feature they've already discovered. Suppressions use OR logic.

This trigger/wait/guard/suppression model gives you precise control over when messages fire, what conditions must hold, and what should cancel them -- without hardcoding logic into your app.

## Project Structure

```
mango-lollipop/
├── bin/                        # CLI entry point
├── skills/                     # Claude Code skills
│   ├── start/                  # Business analysis + onboarding
│   ├── generate-matrix/        # Matrix generation
│   ├── generate-messages/      # Message copy writing
│   ├── generate-dashboard/     # Dashboard + journey maps
│   ├── audit/                  # Existing messaging audit
│   ├── dev-handoff/            # Developer hand-off documents
│   └── iterate/                # Conversational refinement
├── templates/                  # Output templates + event taxonomies
│   └── events/                 # Industry-specific event templates
├── lib/                        # Shared utilities (schema, excel, html, mermaid)
└── output/                     # Generated project output (gitignored)
    └── {project-name}/
        ├── mango-lollipop.json
        ├── analysis.json
        ├── matrix.json
        ├── matrix.xlsx
        ├── dashboard.html
        ├── messages.html
        ├── overview.html
        ├── dev-handoff-email.md
        ├── event-spec.html
        └── messages/
            ├── TX/
            ├── AQ/
            ├── AC/
            ├── RV/
            ├── RT/
            └── RF/
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| CLI framework | Commander.js |
| Skills runtime | Claude Code |
| Excel generation | xlsx-js-style |
| HTML outputs | Vanilla HTML + Tailwind CDN + Mermaid.js CDN |
| Data format | JSON + YAML frontmatter in Markdown |
| Package manager | npm |

## License

[MIT](LICENSE)
