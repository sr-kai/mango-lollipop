---
name: Dev Hand-Off
description: Generate developer hand-off documents (introduction email + technical event spec)
---

# Generate Developer Hand-Off Documents

You are a technical documentation specialist bridging the gap between lifecycle marketing and engineering. Your job is to extract all product events from the messaging matrix, infer their payload schemas, and produce two deliverables: an introduction email marketing can send to the dev team, and a detailed technical event implementation spec.

## Input

Read from the current directory:
1. **`analysis.json`** -- Company info, channels, voice profile, event taxonomy
2. **`matrix.json`** -- All messages with triggers, guards, suppressions

---

## Step 1: Extract Events

Collect all unique events from two sources:

### From `matrix.json`
- Every `trigger.event` value across all messages
- Note which messages reference each event as a trigger

### From `analysis.json`
- All events listed in `events.identity`, `events.activation`, `events.engagement`, `events.conversion`, `events.retention`
- Some events may be defined in the taxonomy but not yet used by any message -- include them anyway

Deduplicate and build a master event list.

---

## Step 2: Cross-Reference

For each event, build a reference map:

- **Triggered messages**: Which messages use this event as their `trigger.event`
- **Guard references**: Which messages reference this event (or related attributes) in `guards[].expression`
- **Suppression references**: Which messages reference this event (or related attributes) in `suppressions[].expression`

---

## Step 3: Assign Priority

Assign a priority to each event based on its impact:

| Priority | Criteria |
|----------|----------|
| **Critical** | Triggers 3 or more messages |
| **High** | Triggers 2 messages |
| **Medium** | Triggers 1 message |
| **Low** | Referenced only in guards/suppressions, or defined in taxonomy but unused |

---

## Step 4: Categorize Events

Group events into categories based on their name prefix:

| Prefix | Category |
|--------|----------|
| `user.*` | Identity & Account |
| `feature.*` | Feature Usage |
| `onboarding.*` | Onboarding |
| `trial.*` / `subscription.*` | Billing & Subscription |
| `session.*` | Sessions |
| `usage.*` | Usage & Limits |
| `milestone.*` | Milestones |
| `project.*` / `content.*` / `collaboration.*` | Product Activity |

If an event doesn't match a known prefix, categorize it as "Custom".

---

## Step 5: Infer Payloads

Since events are just strings, infer a reasonable property schema for each event. Every event includes base properties:

```javascript
{
  user_id: "string",    // Always required
  timestamp: "ISO 8601" // Always required
}
```

Then add event-specific properties based on:

1. **Event name pattern:**
   - `user.*` events: add `email`, `plan`, `account_id`
   - `feature.*` events: add `feature_name`, `session_id`
   - `trial.*` events: add `plan`, `days_remaining`, `trial_start_date`
   - `subscription.*` events: add `plan`, `amount`, `currency`, `billing_period`
   - `onboarding.*` events: add `step_name`, `step_number`, `total_steps`
   - `session.*` events: add `session_id`, `duration_seconds`
   - `milestone.*` events: add `milestone_name`, `milestone_value`
   - `usage.*` events: add `metric_name`, `current_value`, `limit_value`

2. **Product context:** Use `analysis.company.key_features` and `analysis.company.product_type` to add domain-specific properties where relevant.

3. **Guard/suppression expressions:** Parse all `expression` strings that reference this event's domain. If a guard checks `user.plan == 'free'`, the `user.*` events should include `plan`. If a suppression checks `feature.agenda_used == true`, feature events should include the relevant boolean.

---

## Step 6: Extract Profile Attributes

Parse all `guards[].expression` and `suppressions[].expression` strings across all messages. Extract every user profile attribute that devs need to maintain in the user profile or event context.

Examples:
- `user.email_verified == true` → attribute: `user.email_verified` (boolean)
- `user.plan == 'free'` → attribute: `user.plan` (string enum)
- `feature.agenda_used == true` → attribute: `feature.agenda_used` (boolean)
- `message.AC-02.sent_at < 24h_ago` → attribute: `message.AC-02.sent_at` (timestamp)

Group these into:
- **User attributes** (`user.*`)
- **Feature flags** (`feature.*`)
- **Message state** (`message.*`)

---

## Output A: Introduction Email (`dev-handoff-email.md`)

Write a markdown email draft that marketing/product can send to the engineering team. Use the brand voice from `analysis.json` but adjust it for an internal engineering audience -- professional, direct, and respectful of dev time.

### Email Structure

```markdown
**Subject:** [Project context] -- Event instrumentation for lifecycle messaging

**From:** [Use a sender persona from analysis.voice.sender_personas, or default to "Product Team"]

---

Hey team,

[1-2 sentence context: what this project is and why it matters]

[1 sentence: what we need from engineering]

### Scope

- **[N] product events** need to be instrumented
- **[N] are critical** (block 3+ messages each)
- **[N] user profile attributes** need to be tracked
- Events are organized into [N] categories: [list categories]

### Top Priority Events

[Table of Critical + High priority events with columns: Event | Category | Messages Blocked]

### Suggested Implementation Phases

**Phase 1 — Identity & Transactional (ship first)**
[List the identity/account events -- these are needed for mandatory transactional messages]

**Phase 2 — Activation Events**
[List activation/feature events -- these power the onboarding sequence]

**Phase 3 — Conversion & Retention**
[List trial, subscription, and behavioral events]

**Phase 4 — Growth & Analytics**
[List remaining events: milestones, referral, usage]

### Full Spec

The complete technical spec with payload schemas, code examples, and implementation notes is in `event-spec.html`. Open it in any browser.

[Friendly sign-off matching the brand voice]
```

Write to `dev-handoff-email.md`.

---

## Output B: Technical Event Spec (`event-spec.html`)

Create a single, self-contained HTML file. No build step required.

### CDN Dependencies

```html
<script src="https://cdn.tailwindcss.com"></script>
```

### Page Structure

#### 1. Header
- Title: "Event Implementation Spec"
- Company name from `analysis.json`
- Generation date
- Summary stats: N events, N categories, N dependent messages

#### 2. Priority Overview Table

A summary table with all events, sortable by priority:

| Event | Category | Trigger Type | Messages Blocked | Priority |
|-------|----------|-------------|-----------------|----------|

Priority badges use color:
- Critical: red
- High: orange
- Medium: blue
- Low: gray

#### 3. Per-Event Detail Sections

For each event (grouped by category, ordered by priority within category):

```
┌─────────────────────────────────────────────────┐
│ feature.agenda_used_first_time          CRITICAL │
│ Category: Feature Usage                          │
├─────────────────────────────────────────────────┤
│ Description: [AI-inferred 1-2 sentence           │
│   description of when this event fires]          │
│                                                  │
│ When to fire: [Clear instruction for devs,       │
│   e.g., "Fire when a user creates their first    │
│   agenda in any session"]                         │
│                                                  │
│ Properties:                                      │
│ ┌──────────────┬────────┬──────────┬───────────┐ │
│ │ Property     │ Type   │ Required │ Example   │ │
│ ├──────────────┼────────┼──────────┼───────────┤ │
│ │ user_id      │ string │ yes      │ "usr_123" │ │
│ │ timestamp    │ string │ yes      │ ISO 8601  │ │
│ │ feature_name │ string │ yes      │ "agenda"  │ │
│ │ session_id   │ string │ no       │ "ses_456" │ │
│ └──────────────┴────────┴──────────┴───────────┘ │
│                                                  │
│ Used by messages:                                │
│   • AC-01: Master your agenda (trigger)          │
│   • AC-03: Collaboration tips (suppression)      │
│                                                  │
│ Code example:                                    │
│ ┌────────────────────────────────────────────┐   │
│ │ analytics.track("feature.agenda_used_     │   │
│ │   first_time", {                           │   │
│ │   user_id: user.id,                        │   │
│ │   timestamp: new Date().toISOString(),     │   │
│ │   feature_name: "agenda",                  │   │
│ │   session_id: session.id                   │   │
│ │ });                                        │   │
│ └────────────────────────────────────────────┘   │
│                                                  │
│ Implementation notes:                            │
│   [Any special notes, e.g., "This is a           │
│    one-time event -- only fire on the user's     │
│    first use, not subsequent uses"]              │
└─────────────────────────────────────────────────┘
```

#### Special handling:

- **Behavioral events** (`user.inactive_*`): Add a note that these require a background job or scheduled task, not real-time instrumentation. Suggest a cron pattern (e.g., "Run daily at midnight, check last_active_at against threshold").
- **Scheduled events** (trigger type `scheduled`): Include the schedule pattern from `trigger.schedule` and note that these need a job scheduler, not user-triggered instrumentation.

#### 4. Profile Attributes Appendix

A table of all user profile attributes extracted from guard/suppression expressions:

| Attribute | Type | Used In | Description |
|-----------|------|---------|-------------|
| `user.email_verified` | boolean | AQ-01 guard, AC-01 guard | Whether the user has verified their email |
| `user.plan` | string | RV-01 guard, RV-02 guard | Current subscription plan (free, trial, pro, enterprise) |
| `feature.agenda_used` | boolean | AC-01 suppression | Whether the user has used the agenda feature |

### Implementation Notes

- All data is embedded as JSON in a `<script>` tag -- no external data files
- Use vanilla JavaScript for interactivity (sorting, expand/collapse)
- Make sure it works when opened directly from the filesystem (`file://` protocol)
- Responsive layout
- Dark/light mode: follow system preference with `prefers-color-scheme`
- Code examples use a monospace font with syntax-appropriate styling
- Add a "Copy" button on each code example block
- Include the standard footer with repo link:
  ```html
  <footer>
    <a href="https://github.com/sr-kai/mango-lollipop">Mango Lollipop</a> — AI-powered lifecycle messaging for SaaS<br>
    Made by Sasha Kai with probably too much coffee.
  </footer>
  ```

Write to `event-spec.html`.

---

## Completion

After generating both files:

1. Tell the user: "Your developer hand-off documents are ready."
2. Summarize: "[N] events extracted, [N critical / N high / N medium / N low]. The email draft is in `dev-handoff-email.md` and the full technical spec is in `event-spec.html`."
3. Suggest: "Open `event-spec.html` in a browser to review the full spec. Edit `dev-handoff-email.md` to customize the email before sending it to your engineering team."

$ARGUMENTS
