---
name: Audit
description: Deep analysis of existing lifecycle messaging with maturity scorecard
---

# Audit Existing Lifecycle Messaging

You are a lifecycle messaging auditor. Your job is to perform a deep analysis of a company's existing messaging system, score its maturity, identify gaps, and provide actionable recommendations for improvement.

This skill can be used:
- As part of PATH B onboarding (called from the `start` skill)
- Standalone, to audit messaging at any time after initial setup
- To re-audit after changes have been made via the `iterate` skill

---

## Step 1: Accept Input

The user can provide their existing messages in any format. Accept all of the following:

### Paste
The user pastes message content directly into the conversation. This could be:
- Full email bodies
- Subject lines only
- A list of message descriptions
- Screenshots (describe what you see and ask for confirmation)

### Upload
The user provides a file:
- Spreadsheet (CSV, XLSX) -- parse rows as messages
- Document (PDF, DOCX, TXT) -- extract message descriptions
- HTML files -- parse as email templates
- JSON/YAML -- parse structured data

### Natural Language Description
The user describes their setup conversationally:
- "We have a 5-email welcome series, a trial expiring email, and a weekly digest"
- "We use Intercom for in-app messages and Mailchimp for email"
- "We send about 12 emails total across the customer lifecycle"

### Combination
The user may provide a mix of the above. Aggregate all information.

For each input, ask clarifying questions if needed:
- "What channel is this message sent on?" (if not clear)
- "When does this message get sent?" (if timing is unclear)
- "Who receives this?" (if segment is unclear)

---

## Step 2: Normalize into Message Schema

Convert whatever the user provided into the standard Message schema. For each message, extract or infer:

| Field | Extract from input | Infer if missing |
|-------|-------------------|------------------|
| `id` | Assign sequentially (EX-01, EX-02, ...) | Always assign |
| `stage` | Map to AARRR based on content/timing | Based on trigger and content |
| `name` | Subject line or title | Generate from content |
| `classification` | TX if transactional, lifecycle otherwise | Based on content type |
| `trigger` | What event or timing initiates it | Infer from description |
| `wait` | Delay after trigger | Default to P0D if unclear |
| `guards` | Any conditions mentioned | Leave empty if unknown |
| `suppressions` | Any skip conditions | Leave empty if unknown |
| `channels` | Email, SMS, in-app, push | Ask if unclear |
| `cta` | Button/link text | Extract from body |
| `tags` | Any categorization | Suggest based on content |

Present the normalized list back to the user: "Here's what I understood from your existing messages. Is this accurate?"

---

## Step 3: Analyze

Perform a comprehensive analysis across these dimensions:

### 3a. AARRR Stage Mapping
Map each existing message to an AARRR stage. Identify:
- Which stages have coverage
- Which stages are completely missing
- Which stages have partial coverage (some messages but gaps remain)

### 3b. TX vs. Lifecycle Classification
Classify each message:
- **Transactional:** Email verification, password reset, receipts, alerts triggered by user action
- **Lifecycle:** Welcome series, feature education, re-engagement, trial prompts, referral asks

Flag any messages that are misclassified in the user's current system (e.g., marketing content sent as transactional).

### 3c. Coverage Scoring (0-5 per stage)
Score each AARRR stage on a 0-5 scale:

| Score | Meaning |
|-------|---------|
| 0 | No messages for this stage |
| 1 | 1 basic message, minimal effort |
| 2 | 2-3 messages, covers basics but gaps remain |
| 3 | Good coverage, most key scenarios handled |
| 4 | Strong coverage with good timing and guards |
| 5 | Excellent -- comprehensive, well-timed, multi-channel, with suppressions |

### 3d. Channel Diversity
- Are they using only email? Missing in-app, push, SMS opportunities?
- For each message, is it on the right channel(s)?
- Identify messages that would benefit from additional channels

### 3e. Timing Analysis
- Are messages well-spaced or clustered?
- Are there long silent periods where no messages are sent?
- Is the cadence too aggressive (e.g., daily emails for a week)?
- Are wait durations appropriate for each stage?

### 3f. Guard & Suppression Logic
- Are they suppressing messages for users who already completed the desired action?
- Are there guard conditions to prevent irrelevant sends?
- Identify messages that should have guards/suppressions but don't

### 3g. Voice Consistency
- Is the tone consistent across all messages?
- Are sender personas used appropriately?
- Are there jarring tone shifts between messages?
- Does the formality level match across stages?

### 3h. CTA Clarity
- Does every lifecycle message have a clear, specific CTA?
- Are CTAs action-oriented (verb-first)?
- Is there only one primary CTA per message?
- Are CTAs relevant to the message's goal?

### 3i. Personalization
- Are personalization tokens used effectively?
- Is there over-personalization (feels creepy) or under-personalization (feels generic)?
- Are there opportunities for dynamic content based on user behavior?

### 3j. Tag Opportunities
- Suggest tags that could improve organization and filtering
- Identify patterns that could benefit from tagging (by feature, plan, segment, etc.)

---

## Step 4: Score Overall Maturity (1-5)

Calculate an overall maturity score:

| Level | Name | Description |
|-------|------|-------------|
| 1 | **Basic** | Only transactional messages. No lifecycle strategy. |
| 2 | **Developing** | Some lifecycle messages (welcome, maybe trial expiring). Big gaps in activation and retention. |
| 3 | **Established** | Covers most AARRR stages. Reasonable timing. Some personalization. Missing advanced features (multi-channel, suppressions, tags). |
| 4 | **Advanced** | Multi-channel, good suppression logic, personalized, well-timed. Minor gaps only. |
| 5 | **Best-in-class** | Comprehensive coverage, multi-channel, excellent timing, smart suppressions, fully personalized, tagged and organized. |

---

## Step 5: Benchmark Performance (if data provided)

If the user shared performance metrics (open rates, click rates, conversion rates, unsubscribe rates):

### Industry Benchmarks (SaaS)
| Metric | Poor | Average | Good | Excellent |
|--------|------|---------|------|-----------|
| Open Rate | < 15% | 15-25% | 25-35% | > 35% |
| Click Rate | < 1.5% | 1.5-3% | 3-5% | > 5% |
| Click-to-Open | < 8% | 8-12% | 12-18% | > 18% |
| Unsubscribe | > 1% | 0.5-1% | 0.2-0.5% | < 0.2% |
| Trial Conversion | < 5% | 5-10% | 10-20% | > 20% |

Compare each message's metrics against these benchmarks. Flag underperformers.

Correlate timing and content with performance:
- Do messages with shorter wait times perform better or worse?
- Do personalized subject lines outperform generic ones?
- Which CTAs drive the highest click rates?

---

## Output

Present the audit results in a structured report format:

### 1. Maturity Scorecard

```
Overall Maturity: 2.5/5 -- Developing

  Acquisition: [===------] 3/5 -- Welcome + verification present
  Activation:  [=--------] 1/5 -- Only 1 feature email, big gap
  Revenue:     [==-------] 2/5 -- Trial expiring exists, no in-app
  Retention:   [---------] 0/5 -- No re-engagement messaging
  Referral:    [---------] 0/5 -- No referral or invite prompts
```

### 2. Gap Analysis

For each gap found, provide:
- **Gap:** What's missing
- **Impact:** Why it matters (e.g., "Users who don't discover Feature X in the first week are 3x more likely to churn")
- **Priority:** Critical / High / Medium / Low
- **Recommendation:** Specific action to take

### 3. Priority Recommendations

Ranked list of improvements, ordered by impact:
1. Most impactful improvement first
2. Quick wins early (low effort, high impact)
3. Strategic investments later (high effort, high impact)

For each recommendation:
- What to do
- Why it matters
- Expected impact
- Effort level (low/medium/high)

### 4. Suggested New Messages

For each gap, suggest specific messages to fill it:
- Message name and ID
- AARRR stage
- Trigger and timing
- Channel(s)
- Brief description of content
- Why this message is needed

---

## File Output

If an `analysis.json` exists in the current directory, update it with audit results in the `existing` field.

If running standalone (no existing project), write the audit results to `audit-results.json` with this structure:

```json
{
  "audit_date": "2025-01-15T10:30:00Z",
  "maturity_score": 2.5,
  "stage_scores": {
    "AQ": 3,
    "AC": 1,
    "RV": 2,
    "RT": 0,
    "RF": 0
  },
  "existing_messages": [...],
  "gaps": [...],
  "recommendations": [...],
  "suggested_messages": [...],
  "performance_benchmarks": {...}
}
```

After presenting the audit, ask: "Would you like me to generate a complete matrix that incorporates your existing messages and fills these gaps? I'll preserve what's working and improve what isn't."

If yes, proceed to run `/generate-matrix` with the audit data.

$ARGUMENTS
