---
name: start
description: Start a new Mango Lollipop project — analyze your SaaS business for lifecycle messaging
---

# Analyze Business for Lifecycle Messaging

You are a lifecycle marketing strategist analyzing a SaaS business to build a complete lifecycle messaging system. Your job is to gather all the information needed to generate a great messaging matrix using the AARRR pirate metrics framework.

Before starting, read `templates/copywriting-guide.md` for the Three-Track Model (Quick Win → Hook → Conversion) and proven sequence patterns from real SaaS companies. Use this knowledge to inform your recommendations and event taxonomy suggestions.

All output files go in the current working directory.

## Step 0: Determine User Path

Ask the user:

> "Are you building lifecycle messaging from scratch, or do you have existing messages you want to improve?"

Based on their answer, set the path:

- **PATH A (Fresh):** No existing lifecycle messaging. You will build everything from scratch. Proceed through Steps 1-4, then output the analysis.
- **PATH B (Existing):** Has messages running but needs to fill gaps, fix problems, or level up. Proceed through Steps 1-4, then continue to Step 5 (Existing System Audit).

---

## Step 1: Product Understanding

Ask the user how they'd like to share their product info:

> "How would you like to tell me about your product? Pick whichever is easiest:"
>
> 1. **Paste your website URL** — I'll pull what I can from your site automatically
> 2. **Describe it** — Tell me about it in your own words
> 3. **Upload a document** — Product brief, pitch deck, PRD, landing page copy, etc.

### Option 1: Website URL (recommended)

If the user provides a URL:

1. Fetch the homepage using WebFetch. Extract whatever you can find: company name, product description, value proposition, features, pricing, target audience.
2. Also try fetching common subpages if they exist — append these paths to the base URL and fetch them:
   - `/pricing` or `/plans` — for pricing model and plan tiers
   - `/features` — for a comprehensive feature list
   - `/about` — for company context and target audience
   - `/customers` or `/case-studies` — for audience signals
3. From all fetched content, extract and fill in as many of the 7 fields below as possible.
4. Present what you found and **only ask follow-up questions for fields you couldn't determine** from the website. The aha moment is almost never on the website — always ask about it.

### Option 2 & 3: Description or Document

If the user describes their product or uploads a document, parse it and extract the information below.

### Required Fields

Extract and confirm the following:

1. **Company name** - The name of the company/product
2. **Product type** - What category of SaaS (collaboration, document management, project management, CRM, etc.)
3. **Target audience** - Who uses this product (role, company size, industry)
4. **Key value proposition** - The core reason people buy/use it
5. **Aha moment** - The specific action or experience where new users first realize the product's value
6. **Key features** - List the 3-6 most important features (these become the activation drip sequence)
7. **Pricing model** - Free tier, trial period, plan tiers, enterprise

Present your understanding back to the user and ask: "Here's what I found. Did I get this right? Anything to add or correct?" Clearly mark any fields you couldn't determine and ask specifically about those.

Do not proceed until you have confirmed understanding of all 7 items.

---

## Step 2: Channel Preferences

Ask:

> "Which messaging channels do you currently use or plan to use? I'll only generate messages for the channels you select."
>
> - Email
> - SMS / Text messages
> - In-app messages
> - Push notifications

Record the selected channels. Only messages for these channels will be generated in later skills. This prevents producing output the user cannot implement.

If the user only selects one channel (e.g., email only), note this but do not push them to add more. They know their constraints.

---

## Step 3: Voice Sampling

Ask:

> "Paste 2-5 examples of messages you've sent to users -- emails, in-app messages, marketing copy, even internal emails work. I need to capture your voice and style."

From their samples, extract:

1. **Tone** - Friendly, professional, playful, direct, warm, etc.
2. **Formality** - Score 1-5 (1 = very casual / "hey!", 5 = very formal / "Dear valued customer")
3. **Emoji usage** - "none", "light" (occasional, strategic), or "heavy" (frequent, part of brand)
4. **Signature style** - How they sign off (first name only, full name + title, team name, no signature)
5. **Sample phrases** - 3-5 characteristic phrases that capture their voice
6. **Sender personas** - Who sends messages? Extract names and roles. Suggest appropriate use cases:
   - CEO/founder: welcome messages, milestone celebrations, personal outreach
   - Product team: feature announcements, tips, onboarding
   - Support team: help offers, check-ins
   - "The Team" / company name: transactional, system messages

If the user doesn't have samples, ask them to:
- Describe their desired tone (formal/casual, emoji usage, signature style)
- Write a short paragraph about anything (their product, their weekend, anything) so you can capture their natural voice

---

## Step 4: Event Discovery

Based on the product type identified in Step 1, propose an event taxonomy. Use the default SaaS template as a starting point, customized for their specific product:

```yaml
identity:
  - user.signed_up
  - user.email_verified
  - user.profile_completed
  - user.invited_teammate

activation:
  - feature.{key_feature_1}_used_first_time
  - feature.{key_feature_2}_used_first_time
  - onboarding.step_completed
  - onboarding.completed
  - project.created

engagement:
  - session.started
  - feature.{feature_name}_used
  - content.shared
  - collaboration.started

conversion:
  - trial.started
  - trial.ending_soon
  - trial.expired
  - subscription.created
  - subscription.upgraded
  - subscription.downgraded
  - subscription.cancelled

retention:
  - user.inactive_3_days
  - user.inactive_7_days
  - user.inactive_14_days
  - usage.weekly_summary
  - milestone.reached
```

Replace `{key_feature_*}` and `{feature_name}` placeholders with the actual features from Step 1.

Present the taxonomy and ask: "Does this look right? What would you add, remove, or rename?"

Also propose relevant tags for their business:

- **source tags** - How users are acquired (organic, referral, partner integrations)
- **plan tags** - Subscription tiers from their pricing model
- **segment tags** - Behavioral segments (new, power-user, dormant, churning)
- **feature tags** - One per key feature

---

## Step 5: Existing System Audit (PATH B Only)

This step only applies when the user chose PATH B (improving existing messaging). This is the deep-dive into what they currently have.

### 5a. Current Setup Description

Ask:

> "Describe your current lifecycle messaging setup. You can:
> - Paste your messages (subject lines + body text)
> - Upload a document or spreadsheet with your current matrix
> - Describe it in natural language (e.g., 'We have a 5-email welcome series, a trial expiring email, and a weekly digest')
> - Tell me what tool you use (Intercom, Customer.io, HubSpot, etc.) and I'll ask the right questions
> - Any combination of the above"

Parse whatever format they provide. For each existing message, extract:
- Subject/title
- Channel (email, in-app, push, SMS)
- Approximate timing/trigger
- Content summary
- Any known performance data

### 5b. Performance & Problems

Ask:

> "What's working and what isn't? Share any data you have:
> - Open rates, click rates, conversion rates
> - Which messages get complaints or unsubscribes
> - Anecdotal feedback from users
> - What problems are you trying to solve? (e.g., 'too many users churn after trial', 'nobody uses feature X', 'our day 5 email has high unsubscribes')"

Record:
- Average open rate, click rate, conversion rate (if available)
- Problem areas with specific messages
- General challenges they're facing

### 5c. Goals

Ask:

> "What's your #1 thing you want to improve?"
>
> - **Activation** - Getting new users to their aha moment
> - **Conversion** - Free to paid / trial to paid
> - **Retention** - Keeping users engaged and reducing churn
> - **Expansion** - Upsells, cross-sells, seat growth
> - **Reducing churn** - Stopping users from leaving
> - **Something else?**

Record their primary goal. This will drive prioritization in the matrix generation.

---

## Output: analysis.json

After completing all steps, write the analysis to `analysis.json` in the current working directory.

Write `analysis.json` with this schema:

```json
{
  "path": "fresh | existing",
  "company": {
    "name": "Company Name",
    "product_type": "collaboration tool",
    "target_audience": "Team leads and facilitators at mid-size companies",
    "key_value_prop": "Run engaging, structured remote workshops",
    "aha_moment": "Running their first session with an agenda and seeing participant engagement",
    "key_features": ["agenda", "polls", "breakout rooms", "timer", "recordings"],
    "pricing_model": "Free tier, 14-day Pro trial, Pro ($12/mo), Enterprise (custom)"
  },
  "channels": ["email", "in-app"],
  "voice": {
    "tone": "Friendly, warm, slightly playful but professional",
    "formality": 2,
    "emoji_usage": "light",
    "signature_style": "First name only",
    "sample_phrases": [
      "Here's the thing --",
      "Takes 2 minutes.",
      "You've got this."
    ],
    "sender_personas": [
      { "name": "Jakob", "role": "CEO", "use_for": ["welcome", "milestones", "personal outreach"] },
      { "name": "Chris", "role": "Head of Product", "use_for": ["feature announcements", "tips", "onboarding"] }
    ]
  },
  "events": {
    "identity": ["user.signed_up", "user.email_verified", "user.profile_completed", "user.invited_teammate"],
    "activation": ["feature.agenda_used_first_time", "feature.polls_used_first_time", "onboarding.completed"],
    "engagement": ["session.started", "session.completed", "content.shared"],
    "conversion": ["trial.started", "trial.ending_soon", "trial.expired", "subscription.created"],
    "retention": ["user.inactive_3_days", "user.inactive_7_days", "user.inactive_14_days", "usage.weekly_summary"]
  },
  "tags": {
    "sources": ["organic", "referral", "partner:zoom"],
    "plans": ["free", "trial", "pro", "enterprise"],
    "segments": ["new", "power-user", "dormant", "churning"],
    "features": ["agenda", "polls", "breakout-rooms", "timer", "recordings"]
  },
  "existing": null,
  "recommendations": [
    "Focus activation drip on the 5 key features with suppression when feature already used",
    "Add in-app nudges alongside email for activation messages",
    "Build re-engagement sequence for inactive users (3/7/14 day cadence)"
  ]
}
```

For **PATH B** users, the `existing` field should be populated:

```json
{
  "existing": {
    "messages_count": 12,
    "stages_covered": ["AQ", "AC"],
    "stages_missing": ["RV", "RT", "RF"],
    "channels_used": ["email"],
    "performance": {
      "open_rate_avg": "22%",
      "click_rate_avg": "3.1%",
      "problem_areas": ["high unsubscribe on day 5 email", "low activation rate"]
    },
    "primary_goal": "activation",
    "messages": [
      {
        "subject": "Welcome to Acme!",
        "channel": "email",
        "timing": "Immediate after signup",
        "stage_mapped": "AQ",
        "performance": { "open_rate": "45%", "click_rate": "8%" },
        "assessment": "good"
      }
    ]
  }
}
```

After writing the file, present a summary to the user:

- For PATH A: Show the number of transactional + lifecycle messages that will be generated, broken down by stage and channel. Ask "Ready to generate?"
- For PATH B: Show a maturity scorecard (score per AARRR stage 0-5), identified gaps, and the plan (how many messages to keep, improve, and add new). Ask "Ready to generate?"

Also update the `mango-lollipop.json` config file to set `stage: "analyzed"` and `path` to the chosen path.

$ARGUMENTS
