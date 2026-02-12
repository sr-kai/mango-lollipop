# Generate Lifecycle Matrix

You are a lifecycle messaging architect. Your job is to build the complete messaging matrix from a business analysis, producing a structured JSON file that contains every message the business needs -- both transactional and lifecycle.

## Input

Read `analysis.json` from the project output directory. This file was produced by the `analyze` skill and contains the company profile, channels, voice, events, tags, and (for PATH B) existing messages.

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
- **channels:** `["email"]` (always email, even if user didn't select email -- verification requires it)
- **tags:** `["type:transactional"]`
- **guards:** none
- **suppressions:** none
- **classification:** `"transactional"`
- **from:** Team / system
- **format:** `"plain"`

### TX-02: Password Reset
- **trigger:** `{ "event": "user.password_reset_requested", "type": "event" }`
- **wait:** `"P0D"`
- **channels:** `["email"]`
- **tags:** `["type:transactional"]`
- **classification:** `"transactional"`

### TX-03: Payment Receipt
- **trigger:** `{ "event": "subscription.payment_processed", "type": "event" }`
- **wait:** `"P0D"`
- **channels:** `["email"]`
- **tags:** `["type:transactional"]`
- **classification:** `"transactional"`

### TX-04: Plan Change Confirmation
- **trigger:** `{ "event": "subscription.changed", "type": "event" }`
- **wait:** `"P0D"`
- **channels:** `["email"]`
- **tags:** `["type:transactional"]`
- **classification:** `"transactional"`

### TX-05: Account Deletion Confirmation
- **trigger:** `{ "event": "user.deletion_requested", "type": "event" }`
- **wait:** `"P0D"`
- **channels:** `["email"]`
- **tags:** `["type:transactional"]`
- **classification:** `"transactional"`

Only generate TX messages for channels the user selected, **except** TX-01 (email verification) which is always email.

Tag all with `type:transactional`.

---

## Step 2: Generate Lifecycle Messages -- AARRR Framework

Use the SaaS template as the foundation, customized with data from `analysis.json`. Only include channels listed in `analysis.channels`.

### Acquisition (AQ)

**AQ-01: Welcome Message**
- **trigger:** `{ "event": "user.email_verified", "type": "event" }`
- **wait:** `"PT5M"` (5 minutes after verification -- gives time for redirect)
- **channels:** From `analysis.channels` (email recommended as primary)
- **guards:** none
- **suppressions:** none
- **tags:** `["type:educational"]`
- **from:** CEO/founder persona from `analysis.voice.sender_personas`
- **goal:** "Onboarding start, set expectations"
- **content notes:** USP summary, quick-start CTA, support info, warm personal tone

**AQ-02: Getting Started Guide**
- **trigger:** `{ "event": "user.email_verified", "type": "event" }`
- **wait:** `"P1D"` (1 day after verification)
- **channels:** From `analysis.channels`
- **guards:** `[{ "condition": "User has not completed onboarding", "expression": "onboarding.completed == false" }]`
- **suppressions:** `[{ "condition": "User already active", "expression": "user.sessions_count >= 3" }]`
- **tags:** `["type:educational"]`
- **goal:** "Drive first meaningful action"

### Activation (AC) -- THE CORE SEQUENCE

This is the most important stage. Generate one message per key feature from `analysis.company.key_features`. Each message introduces ONE feature.

For each feature at index `i` (0-based) in `analysis.company.key_features`:

**AC-{01+i}: Feature introduction for `{feature_name}`**
- **trigger:** `{ "event": "user.email_verified", "type": "event" }` (all start from the same anchor)
- **wait:** Staggered cadence: `["P2D", "P3D", "P5D", "P7D", "P10D", "P14D"]` (use index to select)
- **channels:** From `analysis.channels`. Alternate email-only and email+in-app for variety.
- **guards:** `[{ "condition": "User has not cancelled", "expression": "user.plan != 'cancelled'" }]`
- **suppressions:** `[{ "condition": "User already used this feature", "expression": "feature.{feature_name}_used == true" }]` -- this is critical: do not nag about features they already discovered
- **tags:** `["type:educational", "feature:{feature_name}"]`
- **from:** Product persona from `analysis.voice.sender_personas`
- **goal:** "Drive first use of {feature_name}"
- **format:** `"plain"` for most, `"rich"` for features that benefit from screenshots

### Revenue (RV)

**RV-01: Trial Ending Soon**
- **trigger:** `{ "event": "trial.ending_soon", "type": "event" }`
- **wait:** `"P0D"` (instant on trigger, which fires ~3 days before expiry)
- **channels:** From `analysis.channels` (email + in-app if available)
- **guards:** `[{ "condition": "User is on trial", "expression": "user.plan == 'trial'" }]`
- **tags:** `["type:promotional", "segment:trial"]`
- **goal:** "Convert trial to paid"

**RV-02: Trial Expired**
- **trigger:** `{ "event": "trial.expired", "type": "event" }`
- **wait:** `"P0D"`
- **channels:** `["email"]`
- **guards:** `[{ "condition": "User has not upgraded", "expression": "user.plan != 'paid'" }]`
- **tags:** `["type:promotional", "segment:trial"]`
- **goal:** "Win back expired trial user"

**RV-03: Usage Limit Approaching**
- **trigger:** `{ "event": "usage.limit_approaching", "type": "event" }`
- **wait:** `"P0D"`
- **channels:** From `analysis.channels` (in-app preferred if available)
- **tags:** `["type:behavioral"]`
- **goal:** "Drive upgrade via natural usage growth"

### Retention (RT)

**RT-01: Usage Recap**
- **trigger:** `{ "event": "scheduled", "type": "scheduled", "schedule": "every friday 9am" }`
- **wait:** `"P0D"`
- **channels:** `["email"]`
- **guards:** `[{ "condition": "User was active this week", "expression": "user.sessions_this_week >= 1" }]`
- **tags:** `["type:behavioral"]`
- **goal:** "Reinforce value, drive continued usage"

**RT-02: Inactive 3 Days (Soft Nudge)**
- **trigger:** `{ "event": "user.inactive_3_days", "type": "behavioral" }`
- **wait:** `"P0D"`
- **channels:** From `analysis.channels` (push + email if available)
- **tags:** `["type:behavioral", "segment:dormant"]`
- **goal:** "Re-engage before habit breaks"

**RT-03: Inactive 7 Days (Medium Nudge)**
- **trigger:** `{ "event": "user.inactive_7_days", "type": "behavioral" }`
- **wait:** `"P0D"`
- **channels:** `["email"]`
- **tags:** `["type:behavioral", "segment:dormant"]`
- **goal:** "Show value they're missing"

**RT-04: Inactive 14 Days (Breakup)**
- **trigger:** `{ "event": "user.inactive_14_days", "type": "behavioral" }`
- **wait:** `"P0D"`
- **channels:** `["email"]`
- **tags:** `["type:behavioral", "segment:churning", "priority:high"]`
- **goal:** "Last attempt before marking churned"

### Referral (RF)

**RF-01: Invite Teammates**
- **trigger:** `{ "event": "milestone.first_success", "type": "event" }`
- **wait:** `"P1D"` (1 day after milestone -- let them enjoy the win first)
- **channels:** From `analysis.channels` (in-app + email if available)
- **tags:** `["type:promotional"]`
- **goal:** "Organic growth via team invites"

**RF-02: Referral Program Introduction**
- **trigger:** `{ "event": "user.active_30_days", "type": "behavioral" }`
- **wait:** `"P0D"`
- **channels:** `["email"]`
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
      "channels": ["email"],
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
      "name": "Welcome to {Product}!",
      "classification": "lifecycle",
      "trigger": {
        "event": "user.email_verified",
        "type": "event"
      },
      "wait": "PT5M",
      "guards": [],
      "suppressions": [],
      "channels": ["email", "in-app"],
      "cta": {
        "text": "Start your first {action}",
        "url": "/app/get-started"
      },
      "segment": "All verified users",
      "tags": ["type:educational"],
      "format": "rich",
      "from": "Jakob, CEO",
      "goal": "Onboarding start",
      "comments": "Warm, personal. USP summary + quick-start CTA.",
      "origin": "new"
    }
  ]
}
```

Each message object must include ALL fields from the Message schema: `id`, `stage`, `name`, `classification`, `trigger`, `wait`, `guards`, `suppressions`, `channels`, `cta`, `segment`, `tags`, `format`, `from`, `goal`, `comments`, and `origin`.

After writing the file, present a summary table to the user:

| Stage | Count | Channels | Origin (new/improved/existing) |
|-------|-------|----------|-------------------------------|
| TX    | 5     | email    | 5 new                         |
| AQ    | 2     | email, in-app | 2 new                    |
| AC    | 5     | email, in-app | 3 new, 2 improved         |
| RV    | 3     | email, in-app | 3 new                     |
| RT    | 4     | email, push   | 1 existing, 3 new         |
| RF    | 2     | email, in-app | 2 new                     |

Also update `mango-lollipop.json` to set `stage: "matrix-generated"`.
