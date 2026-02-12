---
name: Generate Dashboard
description: Create journey map, interactive dashboard, and executive overview
---

# Generate Visual Deliverables

You are a lifecycle messaging visualization specialist. Your job is to create three visual outputs from the messaging matrix: an interactive HTML dashboard, a message preview viewer, and a printable executive overview.

## Input

Read from the current directory:
1. **`analysis.json`** -- Company info, channels, voice profile
2. **`matrix.json`** -- All messages with triggers, guards, suppressions, channels, tags
3. **`messages/`** directory -- Individual message files (for preview content in dashboard)

---

## Output A: Interactive Dashboard (`dashboard.html`)

Create a single, self-contained HTML file. No build step, no external files needed beyond CDN resources.

### CDN Dependencies

```html
<!-- Tailwind CSS for styling -->
<script src="https://cdn.tailwindcss.com"></script>
```

### Dashboard Sections

#### 1. Header
- Project name from `analysis.json`
- Company name
- Generation date
- Message count summary (e.g., "5 TX + 16 Lifecycle = 21 total")

#### 2. TX / Lifecycle Toggle
- Two-tab interface: "Transactional" and "Lifecycle"
- Default to Lifecycle view
- Transactional tab shows TX messages in a simple table
- Lifecycle tab shows the full AARRR matrix

#### 3. Filter Sidebar
A left sidebar with three collapsible filter sections. Each section has a header that toggles collapse, and items that act as toggle filters:

- **Stage** (open by default) -- One row per stage (TX, AQ, AC, RV, RT, RF) with color badge and count. Click to toggle. OR logic within stages.
- **Channel** (open by default) -- One row per channel (email, in-app, etc.) with count. Click to toggle. OR logic within channels.
- **Tags** (open by default) -- Tag pills with counts. Click to toggle. OR logic within tags.
- **Clear all filters** button at the bottom to reset everything.

Filters across sections use AND logic (stage AND channel AND tag must match).

#### 4. Matrix Table
- Sortable by clicking column headers (ID, Stage, Name, Channel, Wait, Tags)
- Columns: ID | Stage | Name | Trigger | Wait | Channel | CTA | Tags
- Color-code rows by stage
- Click any row to expand a detail panel showing guards, suppressions, comments, and message body (if available)

#### 5. Message Previews
- Click any row in the matrix table to expand and show the message detail
- Show subject + body if available (from generate-messages), otherwise show comments
- Read message content from embedded JSON data
- Each expanded detail includes an "Open full preview" link to `messages.html#MSG-ID`

### Implementation Notes

- All data is embedded as JSON in a `<script>` tag -- no external data files
- Use vanilla JavaScript for interactivity (no framework needed)
- Make sure it works when opened directly from the filesystem (`file://` protocol)
- Responsive layout: works on both desktop and tablet screens
- Dark/light mode: follow system preference with `prefers-color-scheme`
- All HTML outputs must include the standard footer with repo link:
  ```html
  <footer>
    <a href="https://github.com/sr-kai/mango-lollipop">Mango Lollipop</a> — AI-powered lifecycle messaging for SaaS<br>
    Made by Sasha Kai with probably too much coffee.
  </footer>
  ```

Write the output to `dashboard.html`.

---

## Output B: Message Viewer (`messages.html`)

A single-page message preview viewer with hash-based routing. Each message gets a channel-specific visual preview.

### Design

- **Hash routing:** `messages.html#AQ-01` navigates directly to that message. Works with `file://` protocol.
- **Left sidebar:** Messages grouped by AARRR stage with color badges. Click to navigate.
- **Main preview area:** Channel-specific rendered preview of the selected message.
- **Details card:** Below the preview, shows trigger, wait, guards, suppressions, tags, goal, comments.
- **Keyboard navigation:** Arrow up/down (or j/k) to move between messages.
- **Back to dashboard:** Link in the header returns to `dashboard.html`.

### Channel-Specific Templates

Each message renders in a visual template matching its channel:

- **Email:** Email client frame with toolbar dots, From/To/Subject header, body content, and CTA button.
- **In-App:** Modal overlay with close button, title, body, and CTA button.
- **SMS:** Phone frame with chat bubble, sender name, and timestamp.
- **Push:** Phone frame with notification card showing app icon, title, and body.

### Content Handling

- If message copy exists (from `generate-messages`), the viewer parses it and renders the channel-specific content.
- If copy hasn't been generated yet, the viewer shows a placeholder with the message's comments and a note to run `generate-messages`.
- Content is parsed from markdown files: `## Email`, `## In-App`, `## SMS`, `## Push Notification` sections.

Write the output to `messages.html`.

---

## Output C: Executive Overview (`overview.html`)

Create a clean, printable HTML page designed for sharing with stakeholders.

### Design Principles
- Clean, minimal design suitable for printing
- No interactive elements (no JavaScript required for content)
- Professional typography (system fonts)
- Fits well on A4/Letter paper when printed from browser
- Uses inline CSS only (no CDN dependencies for printing reliability)

### Sections

#### 1. Title Block
- "Lifecycle Messaging Strategy" as main title
- Company name from `analysis.json`
- Generation date
- Path indicator: "Built from scratch" or "Built on existing messaging"

#### 2. Company Overview
- Product type, target audience, key value proposition
- Aha moment
- Selected channels
- Voice profile summary (tone, formality, emoji usage)

#### 3. Strategy Summary
- One paragraph per AARRR stage explaining the strategy
- For PATH B: note what was kept, improved, and added

#### 4. Condensed Matrix Table
- All messages in a single table
- Columns: ID | Stage | Name | Channel(s) | Trigger | Wait | CTA
- Color-coded rows by stage
- Print-friendly (no scroll, wraps across pages if needed)

#### 5. Message Inventory
- Count by stage:
  - TX: N transactional messages
  - AQ: N acquisition messages
  - AC: N activation messages
  - RV: N revenue messages
  - RT: N retention messages
  - RF: N referral messages
- Count by channel: N email, N in-app, N push, N SMS

#### 6. Tag Summary
- Table of all tags with message counts
- Grouped by category

#### 7. Recommended Implementation Order
- Prioritized list of which messages to implement first
- Priority logic:
  1. TX messages (mandatory, implement immediately)
  2. AQ messages (first user experience)
  3. AC messages for the top 2-3 features (drive to aha moment)
  4. RV messages (capture revenue)
  5. RT messages (reduce churn)
  6. RF messages (growth)
  7. Remaining AC messages

Write the output to `overview.html`.

---

## Completion

Generate all outputs by running the following commands:

```bash
npm run build && node bin/mango-lollipop.js export visuals
```

This creates three files in the project directory:
- `dashboard.html` -- Interactive dashboard with filters and sorting
- `messages.html` -- Channel-specific message previews with hash routing
- `overview.html` -- Printable executive overview

After the command succeeds:

1. Update `mango-lollipop.json` to set `stage: "visuals-generated"`
2. Tell the user: "Your visual deliverables are ready. Open `dashboard.html` in a browser for the interactive view, click any message to see the full preview in `messages.html`, or share `overview.html` as a printable summary."
3. Suggest: "You can run `mango-lollipop view` to open the dashboard in your default browser."

$ARGUMENTS
