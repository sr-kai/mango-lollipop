# Mango Lollipop

AI-powered lifecycle messaging generator for SaaS companies.

Mango Lollipop uses Claude Code to analyze your business, generate a complete lifecycle messaging matrix using the AARRR pirate metrics framework, write full message copy in your brand voice, and produce production-ready deliverables -- all from your terminal.

## What You Get

- **Excel matrix** -- your lifecycle messaging source of truth (`matrix.xlsx`)
- **Visual journey map** -- Mermaid-powered customer flow diagram
- **Full message copy** -- emails, in-app, push, SMS written in your voice
- **HTML overview** -- shareable, printable executive summary
- **Iterative refinement** -- tweak anything conversationally through Claude Code

## Two Paths

**Starting fresh?** Mango Lollipop builds your entire messaging system from scratch based on your product, audience, and voice.

**Have existing messages?** Paste them in, share your stats, and Mango Lollipop audits what you have, fills gaps, and improves what's not working.

## Quick Start

```bash
# Install
npm install -g mango-lollipop

# Initialize a project
mango-lollipop init my-company

# Open Claude Code and run the analyze skill
claude "Read the analyze skill and help me set up lifecycle messaging"
```

Claude Code walks you through product understanding, channel selection, voice sampling, and event discovery. Then it generates your full messaging system:

```bash
# Generate everything (matrix + messages + visuals)
mango-lollipop generate

# Open the interactive dashboard
mango-lollipop view

# Check project status
mango-lollipop status
```

## How It Works

### AARRR Framework

Every message maps to a pirate metrics lifecycle stage:

| Stage | Code | Purpose |
|-------|------|---------|
| Acquisition | `AQ` | Get users signed up and verified |
| Activation | `AC` | Drive to the "aha moment" |
| Revenue | `RV` | Convert free to paid, expand |
| Retention | `RT` | Keep users engaged and coming back |
| Referral | `RF` | Turn users into advocates |

### Transactional Separation

All messages are classified as either **transactional** or **lifecycle**. Transactional messages (email verification, password reset, receipts) are non-negotiable, legally distinct, and always generated. Lifecycle messages are where the strategy lives -- they drive engagement and conversion across the AARRR stages. This separation matters for CAN-SPAM/GDPR compliance, deliverability, and implementation clarity.

## Skills Reference

| Skill | Command | Description |
|-------|---------|-------------|
| `analyze` | `claude "Read the analyze skill..."` | Gather product info, voice samples, channel preferences, and event taxonomy |
| `generate-matrix` | `mango-lollipop generate` | Build the complete lifecycle matrix with triggers, guards, and suppressions |
| `generate-messages` | `mango-lollipop generate` | Write full message copy in your brand voice for all channels |
| `generate-visuals` | `mango-lollipop generate` | Create the journey map, interactive dashboard, and executive overview |
| `audit` | `mango-lollipop audit` | Deep analysis of existing messaging with maturity scorecard and gap analysis |
| `iterate` | `claude "Read the iterate skill..."` | Modify the matrix conversationally (add, remove, tweak messages) |

## Output Files

| File | Description |
|------|-------------|
| `mango-lollipop.json` | Project configuration and state |
| `matrix.xlsx` | Full lifecycle matrix spreadsheet (transactional + lifecycle sheets, events, tags, channel strategy) |
| `dashboard.html` | Interactive dashboard with journey map, sortable matrix table, tag filtering, and message previews |
| `overview.html` | Clean, printable executive summary with strategy overview and implementation order |
| `messages/{STAGE}/*.md` | Individual message files with YAML frontmatter and full copy per channel |

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| CLI framework | Commander.js | Lightweight, standard |
| Skills runtime | Claude Code | The core intelligence |
| Excel generation | SheetJS (xlsx) | Mature, no dependencies |
| HTML outputs | Vanilla HTML + Tailwind CDN + Mermaid.js CDN | Zero build step, self-contained |
| Journey maps | Mermaid.js | Text-based, version-friendly |
| Data format | JSON + YAML frontmatter in Markdown | Human-readable, Claude-friendly |
| Package manager | npm | Standard |

## Project Structure

```
mango-lollipop/
├── bin/                        # CLI entry point
├── skills/                     # Claude Code skills
│   ├── analyze/                # Business analysis + onboarding
│   ├── generate-matrix/        # Matrix generation
│   ├── generate-messages/      # Message copy writing
│   ├── generate-visuals/       # Dashboard + journey maps
│   ├── audit/                  # Existing messaging audit
│   └── iterate/                # Conversational refinement
├── templates/                  # Output templates + event taxonomies
│   └── events/                 # Industry-specific event templates
├── lib/                        # Shared utilities (schema, excel, html, mermaid)
├── examples/                   # Reference examples (Butter, PandaDoc)
└── output/                     # Generated project output (gitignored)
    └── {project-name}/
        ├── mango-lollipop.json
        ├── matrix.xlsx
        ├── dashboard.html
        ├── overview.html
        └── messages/
            ├── TX/             # Transactional
            ├── AQ/             # Acquisition
            ├── AC/             # Activation
            ├── RV/             # Revenue
            ├── RT/             # Retention
            └── RF/             # Referral
```

## License

MIT
