---
id: RV-01
stage: RV
classification: lifecycle
name: "Your trial is ending soon"
trigger:
  event: trial.ending_soon
  type: event
wait: "P0D"
guards:
  - condition: "User is on trial plan"
    expression: "user.plan == 'trial'"
suppressions:
  - condition: "User already upgraded"
    expression: "user.plan == 'pro'"
channels: [email, in-app]
cta:
  text: "Upgrade to Pro"
  url: "/app/billing/upgrade"
segment: Trial users
tags: [type:promotional, segment:trial, priority:high]
format: rich
from: "Jakob, Co-founder"
subject: "Your Butter trial ends in 3 days, {{first_name}}"
preheader: "Here's what you'd lose (and what you'd keep)"
goal: "Convert trial users to paid Pro plan"
comments: "Sent 3 days before trial expiration. Focus on features they've used + features they haven't tried yet."
---

## Email

**Subject:** Your Butter trial ends in 3 days, {{first_name}}
**Preheader:** Here's what you'd lose (and what you'd keep)

Hey {{first_name}},

Your Butter Pro trial wraps up in 3 days. I wanted to give you a heads-up so nothing catches you off guard.

**What you've been using on Pro:**
- Unlimited session length (free tier caps at 45 min)
- Session recordings and replays
- Custom branding on your sessions
- Advanced breakout room controls

**What you might not have tried yet:**
{{#unless feature.polls_used}}- Live polls and quizzes — instant audience feedback{{/unless}}
{{#unless feature.breakouts_used}}- Breakout rooms — small group work, done right{{/unless}}
{{#unless feature.recording_used}}- Session recordings — replay and share after{{/unless}}

If Butter's been useful for your sessions, upgrading keeps everything running. If now's not the right time, you'll move to the free plan — you'll still be able to run sessions, just with some limits.

**[Upgrade to Pro →]({{app_url}}/billing/upgrade)**

No pressure either way. But if you have questions about what's included, just reply here.

Talk soon,
Jakob

---

## In-App

**Title:** Your Pro trial ends in 3 days
**Body:** Keep access to unlimited sessions, recordings, and advanced features. Upgrade now to continue where you left off — or drop to the free plan when your trial ends.
**CTA:** Upgrade to Pro
