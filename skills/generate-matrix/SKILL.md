# Generate Lifecycle Matrix

You are a lifecycle messaging architect. Your job is to build the complete messaging matrix from a business analysis, producing a structured JSON file that contains every message the business needs -- both transactional and lifecycle.

## CRITICAL RULE: One Channel Per Message

**Every message entry must target exactly ONE channel.** Email and in-app are different mediums with different copy, length, and format. Never combine them.

If a logical message should go out on both email and in-app, create **two separate entries** with:
- Different IDs (e.g., `AQ-01` for email, `AQ-02` for in-app)
- The same trigger and wait
- `"channel": "email"` or `"channel": "in-app"` (singular, not an array)
- Different names that reflect the channel (e.g., "Welcome Email" vs "Welcome In-App")

This applies to all stages. Sequential IDs are assigned per stage across all channels -- do not use suffixes like `AQ-01a`.

## Input

Read `analysis.json` from the project output directory. This file was produced by the `start` skill and contains the company profile, channels, voice, events, tags, and (for PATH B) existing messages.

Also read `templates/copywriting-guide.md` for proven sequence patterns. Use the "Applying Patterns to AARRR Stages" section to choose the best pattern for each stage based on the product type. For example, use the Guided Training pattern for activation if the product has a clear step-by-step workflow, or the Progress Milestones pattern if the product has a checklist-style onboarding.

Locate the project output directory by:
1. Checking the current working directory for `analysis.json`
2. Checking `output/*/analysis.json`
3. If not found, ask the user where their project directory is

---

## Step 1: Generate Transactional Messages (TX) -- Always

Transactional messages are non-negotiable. Every SaaS product needs them. Generate these regardless of path (fresh or existing):

### TX-01: Email Verification
- **trigger:** `{ "event": "user.signed_up", "type": "event" }`
- **wait:** `"P0D"` (instant)
- **channel:** `"email"` (always email, even if user didn't select email -- verification requires it)
- **tags:** `["type:transactional"]`
- **guards:** none
- **suppressions:** none
- **classification:** `"transactional"`
- **from:** Team / system
- **format:** `"plain"`

### TX-02: Password Reset
- **trigger:** `{ "event": "user.password_reset_requested", "type": "event" }`
- **wait:** `"P0D"`
- **channel:** `"email"`
- **tags:** `["type:transactional"]`
- **classification:** `"transactional"`

### TX-03: Payment Receipt
- **trigger:** `{ "event": "subscription.payment_processed", "type": "event" }`
- **wait:** `"P0D"`
- **channel:** `"email"`
- **tags:** `["type:transactional"]`
- **classification:** `"transactional"`

### TX-04: Plan Change Confirmation
- **trigger:** `{ "event": "subscription.changed", "type": "event" }`
- **wait:** `"P0D"`
- **channel:** `"email"`
- **tags:** `["type:transactional"]`
- **classification:** `"transactional"`

### TX-05: Account Deletion Confirmation
- **trigger:** `{ "event": "user.deletion_requested", "type": "event" }`
- **wait:** `"P0D"`
- **channel:** `"email"`
- **tags:** `["type:transactional"]`
- **classification:** `"transactional"`

Only generate TX messages for channels the user selected, **except** TX-01 (email verification) which is always email.

Tag all with `type:transactional`.

---

## Step 2: Generate Lifecycle Messages -- AARRR Framework

Use the SaaS template as the foundation, customized with data from `analysis.json`. Only include channels listed in `analysis.channels`.

### Acquisition (AQ)

For each logical message in this stage, create a **separate entry for each channel** in `analysis.channels`. For example, if the user selected email + in-app, a welcome message becomes two entries: one email, one in-app.

**Welcome Message (email: AQ-01, in-app: AQ-02)**
- **trigger:** `{ "event": "user.email_verified", "type": "event" }`
- **wait:** `"PT5M"` (5 minutes after verification -- gives time for redirect)
- **channel:** One of the channels from `analysis.channels`
- **guards:** none
- **suppressions:** none
- **tags:** `["type:educational"]`
- **from:** CEO/founder persona from `analysis.voice.sender_personas`
- **goal:** "Onboarding start, set expectations"
- **content notes:** USP summary, quick-start CTA, support info, warm personal tone. In-app version should be much shorter and punchier than email.

**Getting Started Guide (email only)**
- **trigger:** `{ "event": "user.email_verified", "type": "event" }`
- **wait:** `"P1D"` (1 day after verification)
- **channel:** `"email"`
- **guards:** `[{ "condition": "User has not completed onboarding", "expression": "onboarding.completed == false" }]`
- **suppressions:** `[{ "condition": "User already active", "expression": "user.sessions_count >= 3" }]`
- **tags:** `["type:educational"]`
- **goal:** "Drive first meaningful action"

### Activation (AC) -- THE CORE SEQUENCE

This is the most important stage. Generate one **logical** message per key feature from `analysis.company.key_features`. Each introduces ONE feature.

**IMPORTANT:** For each feature, create a separate entry per channel in `analysis.channels`. If the user has email + in-app, each feature produces TWO entries. Assign sequential IDs across all entries (e.g., AC-01 email, AC-02 in-app, AC-03 email, AC-04 in-app...).

For each feature at index `i` (0-based) in `analysis.company.key_features`, for each channel:

**Feature introduction for `{feature_name}`**
- **trigger:** `{ "event": "user.email_verified", "type": "event" }` (all start from the same anchor)
- **wait:** Staggered cadence: `["P2D", "P3D", "P5D", "P7D", "P10D", "P14D"]` (use feature index to select -- both channel variants of the same feature share the same wait)
- **channel:** `"email"` or `"in-app"` (one per entry)
- **guards:** `[{ "condition": "User has not cancelled", "expression": "user.plan != 'cancelled'" }]`
- **suppressions:** `[{ "condition": "User already used this feature", "expression": "feature.{feature_name}_used == true" }]` -- this is critical: do not nag about features they already discovered
- **tags:** `["type:educational", "feature:{feature_name}"]`
- **from:** Product persona from `analysis.voice.sender_personas`
- **goal:** "Drive first use of {feature_name}"
- **format:** `"plain"` for email, `"plain"` for in-app
- **content notes:** Email version is longer, educational, storytelling. In-app version is a short nudge (1-2 sentences max with a CTA button).

### Revenue (RV)

For messages that need both email and in-app, create separate entries per channel with sequential IDs.

**Trial Ending Soon (email + in-app if available)**
- **trigger:** `{ "event": "trial.ending_soon", "type": "event" }`
- **wait:** `"P0D"` (instant on trigger, which fires ~3 days before expiry)
- **channel:** One entry per channel
- **guards:** `[{ "condition": "User is on trial", "expression": "user.plan == 'trial'" }]`
- **tags:** `["type:promotional", "segment:trial"]`
- **goal:** "Convert trial to paid"

**Trial Expired (email only)**
- **trigger:** `{ "event": "trial.expired", "type": "event" }`
- **wait:** `"P0D"`
- **channel:** `"email"`
- **guards:** `[{ "condition": "User has not upgraded", "expression": "user.plan != 'paid'" }]`
- **tags:** `["type:promotional", "segment:trial"]`
- **goal:** "Win back expired trial user"

**Usage Limit Approaching (in-app preferred, email fallback)**
- **trigger:** `{ "event": "usage.limit_approaching", "type": "event" }`
- **wait:** `"P0D"`
- **channel:** One entry per channel
- **tags:** `["type:behavioral"]`
- **goal:** "Drive upgrade via natural usage growth"

### Retention (RT)

For re-engagement messages, create separate entries per channel where applicable.

**Usage Recap (email only)**
- **trigger:** `{ "event": "scheduled", "type": "scheduled", "schedule": "every friday 9am" }`
- **wait:** `"P0D"`
- **channel:** `"email"`
- **guards:** `[{ "condition": "User was active this week", "expression": "user.sessions_this_week >= 1" }]`
- **tags:** `["type:behavioral"]`
- **goal:** "Reinforce value, drive continued usage"

**Inactive 3 Days (email + in-app if available)**
- **trigger:** `{ "event": "user.inactive_3_days", "type": "behavioral" }`
- **wait:** `"P0D"`
- **channel:** One entry per channel
- **tags:** `["type:behavioral", "segment:dormant"]`
- **goal:** "Re-engage before habit breaks"

**Inactive 7 Days (email only)**
- **trigger:** `{ "event": "user.inactive_7_days", "type": "behavioral" }`
- **wait:** `"P0D"`
- **channel:** `"email"`
- **tags:** `["type:behavioral", "segment:dormant"]`
- **goal:** "Show value they're missing"

**Inactive 14 Days (email only)**
- **trigger:** `{ "event": "user.inactive_14_days", "type": "behavioral" }`
- **wait:** `"P0D"`
- **channel:** `"email"`
- **tags:** `["type:behavioral", "segment:churning", "priority:high"]`
- **goal:** "Last attempt before marking churned"

### Referral (RF)

**Invite Teammates (email + in-app if available)**
- **trigger:** `{ "event": "milestone.first_success", "type": "event" }`
- **wait:** `"P1D"` (1 day after milestone -- let them enjoy the win first)
- **channel:** One entry per channel
- **tags:** `["type:promotional"]`
- **goal:** "Organic growth via team invites"

**Referral Program Introduction (email only)**
- **trigger:** `{ "event": "user.active_30_days", "type": "behavioral" }`
- **wait:** `"P0D"`
- **channel:** `"email"`
- **tags:** `["type:promotional"]`
- **goal:** "Turn power users into advocates"

---

## Step 3: PATH B Handling -- Existing Messages

If `analysis.path == "existing"` and `analysis.existing` is populated:

1. **Map existing messages** into the AARRR framework. For each existing message in `analysis.existing.messages`, determine which AARRR stage and message slot it corresponds to.

2. **Keep messages that are performing well.** If an existing message has good performance (open rate > 25%, click rate > 3%, or marked as "good" in assessment), preserve it. Set `origin: "existing"`.

3. **Improve messages with poor performance.** If an existing message has poor metrics or is marked for improvement, keep the original structure but flag it for rewriting. Set `origin: "improved"`.

4. **Fill gaps with new messages.** For any AARRR stage or message slot not covered by existing messages, generate new ones using the templates above. Set `origin: "new"`.

5. **Mark every message** with an `origin` field:
   - `"existing"` -- Kept as-is from their current system
   - `"improved"` -- Based on an existing message but rewritten/enhanced
   - `"new"` -- Entirely new message to fill a gap

Prioritize improvements based on `analysis.existing.primary_goal`.

---

## Step 4: Apply Tags

Apply tags from `analysis.tags` to each message:

- All TX messages get `type:transactional`
- Feature-related AC messages get `feature:{feature_name}`
- Trial-related RV messages get `segment:trial`
- Re-engagement RT messages get `segment:dormant` or `segment:churning`
- Any message targeting specific plans gets `plan:{plan_name}`

Add any custom tags suggested in `analysis.tags` that are relevant.

---

## Output: matrix.json

Write `matrix.json` to the project output directory (same directory as `analysis.json`).

Structure:

```json
{
  "version": "1.0",
  "generated_at": "2025-01-15T10:30:00Z",
  "project": "company-name",
  "path": "fresh | existing",
  "channels": ["email", "in-app"],
  "messages": [
    {
      "id": "TX-01",
      "stage": "TX",
      "name": "Verify Your Email",
      "classification": "transactional",
      "trigger": {
        "event": "user.signed_up",
        "type": "event"
      },
      "wait": "P0D",
      "guards": [],
      "suppressions": [],
      "channel": "email",
      "cta": {
        "text": "Verify email",
        "url": "/verify?token={{token}}"
      },
      "segment": "All new signups",
      "tags": ["type:transactional"],
      "format": "plain",
      "from": "Team",
      "goal": "Email verification",
      "comments": "Must be instant. Include verification link with 24h expiry.",
      "origin": "new"
    },
    {
      "id": "AQ-01",
      "stage": "AQ",
      "name": "Welcome Email",
      "classification": "lifecycle",
      "trigger": {
        "event": "user.email_verified",
        "type": "event"
      },
      "wait": "PT5M",
      "guards": [],
      "suppressions": [],
      "channel": "email",
      "cta": {
        "text": "Start your first {action}",
        "url": "/app/get-started"
      },
      "segment": "All verified users",
      "tags": ["type:educational"],
      "format": "plain",
      "from": "Jakob, CEO",
      "goal": "Onboarding start",
      "comments": "Warm, personal. USP summary + quick-start CTA.",
      "origin": "new"
    },
    {
      "id": "AQ-02",
      "stage": "AQ",
      "name": "Welcome In-App",
      "classification": "lifecycle",
      "trigger": {
        "event": "user.email_verified",
        "type": "event"
      },
      "wait": "PT5M",
      "guards": [],
      "suppressions": [],
      "channel": "in-app",
      "cta": {
        "text": "Get started",
        "url": "/app/get-started"
      },
      "segment": "All verified users",
      "tags": ["type:educational"],
      "format": "plain",
      "from": "Jakob, CEO",
      "goal": "Onboarding start",
      "comments": "Short nudge. 1-2 sentences + CTA button.",
      "origin": "new"
    }
  ]
}
```

Each message object must include ALL fields from the Message schema: `id`, `stage`, `name`, `classification`, `trigger`, `wait`, `guards`, `suppressions`, `channel`, `cta`, `segment`, `tags`, `format`, `from`, `goal`, `comments`, and `origin`.

**Remember: `channel` is singular (a string), not `channels` (an array).** Every entry targets exactly one channel.

After writing the file, do three things:

### 1. Generate the Excel export

Run the following commands to compile the TypeScript library and generate `matrix.xlsx`:

```bash
npm run build && node bin/mango-lollipop.js export excel
```

This creates a 6-sheet Excel workbook in the project output directory alongside `matrix.json`:
1. **Welcome** — Cover sheet with project info (company, channels, message count) and a guide to each tab
2. **Transactional Messages** — TX messages with gray row fills
3. **Lifecycle Matrix** — AARRR messages with stage-colored row fills (green=AQ, blue=AC, yellow=RV, orange=RT, purple=RF)
4. **Event Taxonomy** — All events and which messages use them
5. **Tags** — Tag inventory with message counts
6. **Channel Strategy** — Message distribution by channel and stage

All sheets have dark header rows with white text. Data rows on Transactional and Lifecycle sheets are color-coded by stage.

### 2. Update project config

Update `mango-lollipop.json` to set `stage: "matrix-generated"` and point `matrix` to `"matrix.json"`.

### 3. Present the summary

Show a summary table to the user:

| Stage | Count | Channels | Origin (new/improved/existing) |
|-------|-------|----------|-------------------------------|
| TX    | 5     | email    | 5 new                         |
| AQ    | 2     | email, in-app | 2 new                    |
| AC    | 5     | email, in-app | 3 new, 2 improved         |
| RV    | 3     | email, in-app | 3 new                     |
| RT    | 4     | email, push   | 1 existing, 3 new         |
| RF    | 2     | email, in-app | 2 new                     |

Mention that `matrix.xlsx` was generated and is ready to open.
